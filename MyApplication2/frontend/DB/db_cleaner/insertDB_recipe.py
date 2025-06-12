import sqlite3
import json
import os

class DBInserter:
    def __init__(self, db_path):
        if not os.path.exists(db_path):
            raise FileNotFoundError(f"❌ DB 파일을 찾을 수 없습니다: {db_path}")
        self.conn = sqlite3.connect(db_path)
        self.cur = self.conn.cursor()
        self.category_id_map = {}

    def insert_categories_and_ingredients(self, json_path):
        '''카테고리, 재료를 받아와서 category, ingredient 테이블에 각각 저장하는 함수'''
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        #테이블 내 데이터 초기화
        self.cur.execute("DELETE FROM category")
        self.cur.execute("DELETE FROM ingredient")

        # 카테고리 삽입
        for idx, category_name in enumerate(data.keys(), start=1):
            self.cur.execute(
                "INSERT OR IGNORE INTO category (id, name) VALUES (?, ?)",
                (idx, category_name)
            )
            self.category_id_map[category_name] = idx

        # 재료 삽입
        ingredient_id = 1
        for category_name, ingredients in data.items():
            cat_id = self.category_id_map[category_name]
            for ingredient_name, unit in ingredients.items():
                self.cur.execute(
                    "INSERT INTO ingredient (id, name, category_id, unit) VALUES (?, ?, ?, ?)",
                    (ingredient_id, ingredient_name, cat_id, unit)
                )
                ingredient_id += 1

        self.conn.commit()
        print("✅ 카테고리 및 재료 삽입 완료")

    def insert_recipes(self, food_name_txt):
        '''food_name.txt를 받아 recipes테이블에 이름만 추가하는 함수'''
        if not os.path.exists(food_name_txt):
            raise FileNotFoundError(f"❌ 음식명 텍스트 파일을 찾을 수 없습니다: {food_name_txt}")

        with open(food_name_txt, 'r', encoding='utf-8') as f:
            recipe_names = [line.strip() for line in f if line.strip()]

        self.cur.execute("DELETE FROM recipes")

        for name in recipe_names:
            self.cur.execute(
                "INSERT INTO recipes (name) VALUES (?)",
                (name,)
            )

        self.conn.commit()
        print("✅ recipes 테이블에 음식 이름 삽입 완료")
    
    def insert_recipe_ingredients(self, json_path):
        '''레시피별 재료 정보(recipe_ingredients) 삽입 함수'''
        if not os.path.exists(json_path):
            raise FileNotFoundError(f"❌ 레시피 재료 JSON 파일을 찾을 수 없습니다: {json_path}")

        with open(json_path, 'r', encoding='utf-8') as f:
            recipes = json.load(f)

        self.cur.execute("DELETE FROM recipe_ingredients")

        for recipe in recipes:
            recipe_name = recipe['recipe_name']

            # 레시피 ID 조회
            self.cur.execute("SELECT id FROM recipes WHERE name = ?", (recipe_name,))
            recipe_row = self.cur.fetchone()
            if not recipe_row:
                print(f"⚠️ 레시피 '{recipe_name}' 없음, 건너뜀")
                continue
            recipe_id = recipe_row[0]

            for ing in recipe['ingredients']:
                # 카테고리 ID
                self.cur.execute("SELECT id FROM category WHERE name = ?", (ing['category'],))
                cat_row = self.cur.fetchone()
                if not cat_row:
                    print(f"⚠️ 카테고리 '{ing['category']}' 없음")
                    continue
                category_id = cat_row[0]

                # 재료 ID
                self.cur.execute("SELECT id FROM ingredient WHERE name = ?", (ing['name'],))
                ing_row = self.cur.fetchone()
                if not ing_row:
                    print(f"⚠️ 재료 '{ing['name']}' 없음")
                    continue
                ingredient_id = ing_row[0]

                self.cur.execute(
                    "UPDATE recipes SET recipe = ? WHERE name = ?",
                    (recipe['recipe_text'], recipe_name)
                )

                self.cur.execute("""
                    INSERT INTO recipe_ingredients
                    (recipe_id, category_id, ingredient_id, amount, unit, is_required, priority)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    recipe_id,
                    category_id,
                    ingredient_id,
                    ing.get('amount'),
                    ing.get('unit'),
                    int(ing.get('is_required', True)),
                    ing.get('priority')
                ))

        self.conn.commit()
        print("✅ recipe_ingredients 테이블에 삽입 완료")

    def close(self):
        '''DB연결 중단 함수'''
        self.conn.close()
        print("🔒 DB 연결 종료")

# 사용 예시
if __name__ == '__main__':
    db_path = '../swRecipe.db'
    ingredient_json_path = 'categorized_ingredients.json'
    recipe_txt_path = 'food_name.txt'

    inserter = DBInserter(db_path)
    inserter.insert_categories_and_ingredients(ingredient_json_path)
    inserter.insert_recipes(recipe_txt_path)
    inserter.insert_recipe_ingredients("recipe_cleaner.json")
    inserter.close()
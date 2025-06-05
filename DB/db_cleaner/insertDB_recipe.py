import sqlite3
import json
import os

class DBInserter:
    def __init__(self, db_path):
        if not os.path.exists(db_path):
            raise FileNotFoundError(f"❌ DB 파일을 찾을 수 없습니다: {db_path}")
        self.conn = sqlite3.connect(db_path)
        self.cur = self.conn.cursor()

    def insert_categories_and_ingredients_from_recipes(self, json_path):
        '''recipe_cleaner.json 기반으로 category 및 ingredient 삽입'''
        with open(json_path, 'r', encoding='utf-8') as f:
            recipes = json.load(f)

        self.cur.execute("DELETE FROM category")
        self.cur.execute("DELETE FROM ingredient")

        category_id = 1
        ingredient_id = 1
        seen_categories = {}
        seen_ingredients = set()

        for recipe in recipes:
            for ing in recipe['ingredients']:
                category = ing['category']
                if category not in seen_categories:
                    self.cur.execute(
                        "INSERT INTO category (id, name) VALUES (?, ?)",
                        (category_id, category)
                    )
                    seen_categories[category] = category_id
                    category_id += 1

                cat_id = seen_categories[category]

                names = ing['name'] if isinstance(ing['name'], list) else [ing['name']]
                units = ing['unit'] if isinstance(ing['unit'], list) else [ing['unit']]

                for name, unit in zip(names, units):
                    if name not in seen_ingredients:
                        self.cur.execute(
                            "INSERT INTO ingredient (id, name, category_id, unit) VALUES (?, ?, ?, ?)",
                            (ingredient_id, name, cat_id, unit)
                        )
                        seen_ingredients.add(name)
                        ingredient_id += 1

        self.conn.commit()
        print("✅ 카테고리 및 재료 삽입 완료")

    def insert_recipes_from_json(self, json_path):
        '''recipe_cleaner.json 기반으로 recipes 테이블에 이름과 본문 삽입'''
        if not os.path.exists(json_path):
            raise FileNotFoundError(f"❌ 레시피 JSON 파일을 찾을 수 없습니다: {json_path}")

        with open(json_path, 'r', encoding='utf-8') as f:
            recipes = json.load(f)

        self.cur.execute("DELETE FROM recipes")

        for recipe in recipes:
            self.cur.execute(
                "INSERT INTO recipes (name, recipe) VALUES (?, ?)",
                (recipe['recipe_name'], recipe['recipe_text'])
            )

        self.conn.commit()
        print("✅ 레시피 이름 및 설명 삽입 완료")

    def insert_recipe_ingredients(self, json_path):
        '''recipe_cleaner.json 기반으로 recipe_ingredients 테이블 삽입'''
        if not os.path.exists(json_path):
            raise FileNotFoundError(f"❌ 레시피 JSON 파일을 찾을 수 없습니다: {json_path}")

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
                # 카테고리 ID 조회
                self.cur.execute("SELECT id FROM category WHERE name = ?", (ing['category'],))
                cat_row = self.cur.fetchone()
                if not cat_row:
                    print(f"⚠️ 카테고리 '{ing['category']}' 없음")
                    continue
                category_id = cat_row[0]

                names = ing['name'] if isinstance(ing['name'], list) else [ing['name']]
                amounts = ing['amount'] if isinstance(ing['amount'], list) else [ing['amount']]
                units = ing['unit'] if isinstance(ing['unit'], list) else [ing['unit']]
                required_flags = ing['is_required'] if isinstance(ing['is_required'], list) else [ing['is_required']]
                priorities = ing['priority'] if isinstance(ing['priority'], list) else [ing['priority']]

                for name, amount, unit, is_required, priority in zip(names, amounts, units, required_flags, priorities):
                    # 재료 ID 조회
                    self.cur.execute("SELECT id FROM ingredient WHERE name = ?", (name,))
                    ing_row = self.cur.fetchone()
                    if not ing_row:
                        print(f"⚠️ 재료 '{name}' 없음")
                        continue
                    ingredient_id = ing_row[0]

                    self.cur.execute("""
                        INSERT INTO recipe_ingredients
                        (recipe_id, category_id, ingredient_id, amount, unit, is_required, priority)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        recipe_id,
                        category_id,
                        ingredient_id,
                        amount,
                        unit,
                        int(is_required),
                        priority
                    ))

        self.conn.commit()
        print("✅ recipe_ingredients 테이블 삽입 완료")

    def close(self):
        '''DB 연결 종료'''
        self.conn.close()
        print("🔒 DB 연결 종료")

if __name__ == '__main__':
    db_path = '../swRecipe.db'
    recipe_json_path = 'recipe_cleaner.json'

    inserter = DBInserter(db_path)
    inserter.insert_categories_and_ingredients_from_recipes(recipe_json_path)
    inserter.insert_recipes_from_json(recipe_json_path)
    inserter.insert_recipe_ingredients(recipe_json_path)
    inserter.close()
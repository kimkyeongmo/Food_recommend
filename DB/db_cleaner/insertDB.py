import sqlite3
import json
import os

def insert_all_from_cleaned_json(db_path, json_path, categorized_path):
    with open(categorized_path, 'r', encoding='utf-8') as f:
        categorized = json.load(f)

    # 역방향 매핑: name -> (category, unit)
    name_to_category_unit = {}
    category_id_map = {}
    ingredient_id_map = {}

    category_id = 1
    ingredient_id = 1

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    ### 초기화 ###
    cur.execute("DELETE FROM recipe_ingredients")
    cur.execute("DELETE FROM recipes")
    cur.execute("DELETE FROM ingredient")
    cur.execute("DELETE FROM category")

    ### 1. categorized_ingredients.json 기반으로 category / ingredient 채우기 ###
    for category, items in categorized.items():
        # category 삽입
        cur.execute("INSERT INTO category (id, name) VALUES (?, ?)", (category_id, category))
        category_id_map[category] = category_id
        category_id += 1

        for name, unit in items.items():
            cur.execute("""
                INSERT INTO ingredient (id, name, category_id, unit)
                VALUES (?, ?, ?, ?)
            """, (ingredient_id, name, category_id_map[category], unit))
            ingredient_id_map[(name, category)] = ingredient_id
            name_to_category_unit[name] = (category, unit)
            ingredient_id += 1

    ### 2. recipe_cleaner.json 처리 ###
    with open(json_path, 'r', encoding='utf-8') as f:
        recipes = json.load(f)

    for recipe in recipes:
        recipe_name = recipe['recipe_name']
        recipe_text = recipe['recipe_text']
        cur.execute("INSERT INTO recipes (name, recipe) VALUES (?, ?)", (recipe_name, recipe_text))

    conn.commit()

    ### 3. recipe_ingredients 테이블 채우기 ###
    for recipe in recipes:
        recipe_name = recipe['recipe_name']

        cur.execute("SELECT id FROM recipes WHERE name = ?", (recipe_name,))
        result = cur.fetchone()
        if not result:
            print(f"⚠️ 레시피 '{recipe_name}' 삽입 실패")
            continue
        recipe_id = result[0]

        for ing in recipe['ingredients']:
            names = ing['name'] if isinstance(ing['name'], list) else [ing['name']]
            amounts = ing['amount'] if isinstance(ing['amount'], list) else [ing['amount']]
            units = ing['unit'] if isinstance(ing['unit'], list) else [ing['unit']]
            requireds = ing['is_required'] if isinstance(ing['is_required'], list) else [ing['is_required']]
            priorities = ing['priority'] if isinstance(ing['priority'], list) else [ing['priority']]

            for idx, (name, amount, unit, is_required, priority) in enumerate(zip(names, amounts, units, requireds, priorities)):
                if name not in name_to_category_unit:
                    print(f"❗[{recipe_name}] '{name}'은 categorized_ingredients.json에 없습니다. 건너뜀")
                    continue

                expected_category, expected_unit = name_to_category_unit[name]
                recipe_category = ing.get('category')

                if recipe_category and recipe_category != expected_category:
                    print(f"❗[{recipe_name}] '{name}'의 카테고리가 불일치합니다: (레시피='{recipe_category}', 기준='{expected_category}')")
                    continue

                if unit != expected_unit:
                    print(f"❗[{recipe_name}] '{name}'의 단위가 불일치합니다: (레시피='{unit}', 기준='{expected_unit}')")
                    continue

                ingredient_key = (name, expected_category)
                if ingredient_key not in ingredient_id_map:
                    print(f"⚠️ 재료 {name} (카테고리: {expected_category}) DB에 없음. 건너뜀")
                    continue

                cur.execute("""
                    INSERT INTO recipe_ingredients
                    (recipe_id, category_id, ingredient_id, amount, unit, is_required, priority)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    recipe_id,
                    category_id_map[expected_category],
                    ingredient_id_map[ingredient_key],
                    float(amount),
                    unit,
                    int(is_required),
                    int(priority)
                ))

    conn.commit()
    conn.close()
    print("✅ 모든 테이블 삽입 완료")

# 실행 예시
if __name__ == '__main__':
    print(os.path.abspath("../swRecipe.db"))
    insert_all_from_cleaned_json(
        db_path="../swRecipe.db",
        json_path="recipe_cleaner.json",
        categorized_path="categorized_ingredients.json"
    )
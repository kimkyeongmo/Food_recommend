### 만개의 레시피에서 레시피 크롤링하는 함수 ###

import requests, json
import os
from bs4 import BeautifulSoup
import re

def food_info(name, top_n=1, url=None):
    '''
    이 함수는 입력한 음식에 대한 정보를 제공합니다.

    PARAMETERS
        - name (str): 한글로 된 한국 음식 이름 ex)food_info("김치찌개")
        - url (str, optional): 해당 레시피의 직접 URL (예: https://www.10000recipe.com/recipe/123456)
        - top (int): url이 없을 경우 검색 결과 중 가져올 최대 개수 (기본 1개)
    RETURN
        - res(list): 입력한 음식 이름과 관련된 한국 음식 정보를 담은 딕셔너리들의 리스트. 각 딕셔너리에는 다음과 같은 정보가 포함됩니다:
            - res['name'](str): 음식 이름
            - res['ingredients'](str): 해당 음식을 만들기 위한 재료
            - res['recipe'](list[str]): 조리 과정을 순서대로 담은 문자열 리스트
    '''
    def extract_from_url(recipe_url):
        response = requests.get(recipe_url)
        if response.status_code != 200:
            print("레시피 페이지 요청 오류:", response.status_code)
            return None

        soup = BeautifulSoup(response.text, 'html.parser')
        food_json = soup.find(attrs={'type': 'application/ld+json'})
        if not food_json:
            print("레시피 INFO 없음:", recipe_url)
            return None

        try:
            result = json.loads(food_json.text)
            ingredients = ','.join(result['recipeIngredient'])
            recipe = [f'{i+1}. {step["text"]}' for i, step in enumerate(result['recipeInstructions'])]

            return {
                'name': name,
                'ingredients': ingredients,
                'recipe': recipe
            }
        except Exception as e:
            print("파싱 오류:", e)
            return None

    res_list = []

    # 개별 URL이 주어졌을 경우
    if url:
        result = extract_from_url(url)
        if result:
            res_list.append(result)
        return res_list

    # 검색 기반 수집
    search_url = f"https://www.10000recipe.com/recipe/list.html?q={name}"
    response = requests.get(search_url)
    if response.status_code != 200:
        print("검색 페이지 요청 오류:", response.status_code)
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    food_links = soup.find_all(attrs={'class': 'common_sp_link'})[:top_n]
    if not food_links:
        print(f"[{name}] 검색 결과 없음")
        return []

    for link in food_links:
        recipe_id = link['href'].split('/')[-1]
        recipe_url = f"https://www.10000recipe.com/recipe/{recipe_id}"
        result = extract_from_url(recipe_url)
        if result:
            res_list.append(result)

    return res_list

def make_json(name, top_n=1, filename='recipes.json'):
    '''
    food_info()로 얻은 정보를 JSON 파일에 누적 저장

    PARAMETERS
        - name (str): 음식 이름
        - filename (str): 저장할 JSON 파일명
    '''
    food_data = food_info(name, top_n)
    if food_data is None:
        return

    # 기존 파일 로드 또는 초기화
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            try:
                data_list = json.load(f)
            except json.JSONDecodeError:
                data_list = []
    else:
        data_list = []

    # 중복 확인 후 저장
    for data in food_data:
        if not any(item['recipe'] == data['recipe'] for item in data_list):
            data_list.append(data)
            print(f"[{data['name']}] 저장 완료")
        else:
            print(f"[{data['name']}] 이미 저장되어 있음")
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data_list, f, ensure_ascii=False, indent=2)

def extract_ingredient_list(ingredient_str):
    raw_items = ingredient_str.split(',')
    cleaned = []

    for item in raw_items:
        # 괄호 제거, 단위 제거
        # 예: "김치 1/2포기" → "김치", "물(멸치육수)" → "물", "멸치육수"
        item = item.strip()

        # 괄호 속 내용도 재료로 추출
        if '(' in item and ')' in item:
            match = re.match(r'(.+?)\((.+?)\)', item)
            if match:
                main, inner = match.groups()
                cleaned.append(main.strip())
                cleaned.append(inner.strip())
                continue

        # 숫자 및 단위 제거 (예: "1수저", "700ml", "1/2개" 등)
        item = re.sub(r'\d+[\/]?\d*\s*[가-힣a-zA-Z]*', '', item).strip()

        # 예외 필터링 (빈 문자열)
        if item:
            cleaned.append(item)

    return cleaned

import json

def extract_ingredient_list(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        recipes = json.load(f)

    unique_ingredients = set()

    for recipe in recipes:
        ingredients = recipe.get('ingredient', [])
        for item in ingredients:
            clean_item = item.strip()
            if clean_item:
                unique_ingredients.add(clean_item)

    with open(output_file, 'w', encoding='utf-8') as f:
        for name in sorted(unique_ingredients):
            f.write(name + '\n')

    print(f"✅ 총 {len(unique_ingredients)}개의 재료가 '{output_file}'에 저장되었습니다.")

def deduplicate_and_sort_txt(input_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip()]

    unique_sorted = sorted(set(lines))

    with open(input_file, 'w', encoding='utf-8') as f:
        for item in unique_sorted:
            f.write(item + '\n')

    print(f"✅ '{input_file}' 내 중복 제거 및 정렬 완료 ({len(unique_sorted)}개 항목).")

def categorize_ingredients(input_file, output_json):
    import json
    from collections import defaultdict

    category_list = [
        "해산물", "돼지고기", "닭고기", "유제품", "견과류",
        "가루", "기름", "버섯", "양념", "채소", "캔", "기타"
    ]
    categorized = defaultdict(list)

    # 재료 목록 불러오기
    with open(input_file, 'r', encoding='utf-8') as f:
        ingredients = [line.strip() for line in f if line.strip()]

    print("📝 재료 분류를 시작합니다. 카테고리 번호를 입력하세요. 종료하려면 Ctrl+C.\n")

    try:
        for ing in ingredients:
            print(f"\n📌 재료: {ing}")
            for i, cat in enumerate(category_list):
                print(f"{i:2d}. {cat}")
            
            while True:
                selection = input("👉 카테고리 번호 입력: ").strip()
                if selection.isdigit() and 0 <= int(selection) < len(category_list):
                    category = category_list[int(selection)]
                    categorized[category].append(ing)
                    break
                else:
                    print("❌ 잘못된 입력입니다. 0~11 사이 숫자를 입력하세요.")

    except KeyboardInterrupt:
        print("\n⏹️ 분류 작업이 사용자에 의해 중단되었습니다.")

    # 저장
    categorized_sorted = {k: sorted(v) for k, v in sorted(categorized.items())}

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(categorized_sorted, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 총 {len(ingredients)}개 재료가 '{output_json}'에 저장되었습니다.")

if __name__ == "__main__":
    # input_file = "food_name_22.txt"
    # top_n = 4  # 원하는 개수만큼 조정

    # # 텍스트 파일에서 음식 이름 리스트로 불러오기
    # if os.path.exists(input_file):
    #     with open(input_file, 'r', encoding='utf-8') as f:
    #         food_names = [line.strip() for line in f if line.strip()]
    # else:
    #     print(f"'{input_file}' 파일이 존재하지 않습니다.")
    #     food_names = []

    # # 음식 이름마다 make_json 실행
    # for food in food_names:
    #     print(f"\n🔍 수집 중: {food}")
    #     make_json(name=food, top_n=top_n)
    
    
    # JSON 파일 읽기
    # with open('recipes.json', 'r', encoding='utf-8') as f:
    #     data = json.load(f)

    # # ingredients 파싱해서 ingredient 리스트 추가
    # for item in data:
    #     if 'ingredient' not in item:
    #         item['ingredient'] = extract_ingredient_list(item['ingredients'])

    # # 결과 저장
    # with open('recipes_updated.json', 'w', encoding='utf-8') as f:
    #     json.dump(data, f, ensure_ascii=False, indent=2)

    # print("✅ ingredient 리스트 자동 생성 완료!")

    # extract_ingredient_list('recipes_updated.json', 'ingredients.txt')
    # deduplicate_and_sort_txt('ingredients.txt')
    categorize_ingredients('ingredients.txt', 'categorized_ingredients.json')

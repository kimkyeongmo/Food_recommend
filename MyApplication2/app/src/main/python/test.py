import numpy as np
import json

def cosine_similarity(vec1, vec2):
    dot = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

def test(user_ingredients_java, db_data_java, threshold=0.1):
    import sys

    user_ingredients = []
    for i in range(user_ingredients_java.size()):
        java_map = user_ingredients_java.get(i)
        py_dict = {}
        iterator = java_map.keySet().iterator()
        while iterator.hasNext():
            key = iterator.next()
            py_dict[key] = java_map.get(key)
        user_ingredients.append(py_dict)

    db_data = []
    for i in range(db_data_java.size()):
        java_map = db_data_java.get(i)
        py_dict = {}
        iterator = java_map.keySet().iterator()
        while iterator.hasNext():
            key = iterator.next()
            py_dict[key] = java_map.get(key)
        db_data.append(py_dict)

#    sys.stderr.write(f"[Python] 사용자 재료 수: {len(user_ingredients)}\n")
#    sys.stderr.write(f"[Python] 레시피-재료 항목 수: {len(db_data)}\n")

    all_ingredient_ids = sorted(set(int(entry["ingredient_id"]) for entry in db_data))
    ing_index = {ing_id: i for i, ing_id in enumerate(all_ingredient_ids)}

    def to_vector(weight_map):
        vec = np.zeros(len(all_ingredient_ids))
        for ing_id, weight in weight_map.items():
            idx = ing_index.get(ing_id)
            if idx is not None:
                vec[idx] = weight
        return vec

    recipe_dict = {}
    for entry in db_data:
        rid = int(entry["recipe_id"])
        ing_id = int(entry["ingredient_id"])
        prio = entry["priority"]
        if rid not in recipe_dict:
            recipe_dict[rid] = []
        recipe_dict[rid].append((ing_id, prio))

    recipe_vectors = []
    recipe_ids = []

    for rid, ing_list in recipe_dict.items():
        max_prio = max(p for _, p in ing_list)
        weight_map = {}
        for ing_id, prio in ing_list:
            weight = 1 - (prio - 1) / (max_prio - 1) if max_prio > 1 else 1.0
            weight_map[ing_id] = weight
        vec = to_vector(weight_map)
        recipe_vectors.append(vec)
        recipe_ids.append(rid)

    user_map = {}
    for item in user_ingredients:
        ing_id = item.get("ingredient_id")
        if ing_id is not None:
            user_map[int(ing_id)] = 1.0
    user_vec = to_vector(user_map)

    results = []
    for rid, vec in zip(recipe_ids, recipe_vectors):
        sim = cosine_similarity(user_vec, vec)
        if sim >= threshold:
            results.append((rid, round(sim, 3)))

    results.sort(key=lambda x: x[1], reverse=True)

    if not results:
        return "추천 가능한 레시피가 없습니다."

    return json.dumps(
        [{"recipe_id": rid, "similarity": score} for rid, score in results[:3]],
        ensure_ascii=False
    )

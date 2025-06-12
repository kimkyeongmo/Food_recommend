import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useItems } from "../context/ItemsContext";

// ===== 레시피 예시 =====
type RecipeIngredient = { name: string; amount: number; unit: string };
type Recipe = {
  name: string;
  ingredients: RecipeIngredient[];
  description?: string;
};

// (실제 앱에서는 아래 라인을 import recipeData from "~경로/recipe.json"으로 대체)
const recipeData: Recipe[] = [
  {
    name: "편한볶음밥",
    ingredients: [
      { name: "고추장", amount: 1, unit: "g" },
      { name: "김", amount: 1, unit: "g" },
      { name: "계란", amount: 2, unit: "개" },
      { name: "밥", amount: 1, unit: "공기" }
    ],
    description: "간단하게 볶아서 먹는 밥입니다."
  },
  {
    name: "오븐없이 만든 고구마 빵",
    ingredients: [
      { name: "계란", amount: 2, unit: "개" },
      { name: "고구마", amount: 1, unit: "개" },
      { name: "기름", amount: 10, unit: "ml" }
    ],
    description: "고구마와 계란만으로 오븐 없이 만드는 빵!"
  },
  {
    name: "해찬들 약고추장 주먹밥",
    ingredients: [
      { name: "고추장", amount: 1, unit: "g" },
      { name: "김", amount: 1, unit: "g" },
      { name: "밥", amount: 1, unit: "공기" }
    ]
  },
  {
    name: "기본재료로 맛나게~ 고구마에그슬럿",
    ingredients: [
      { name: "고구마", amount: 1, unit: "개" },
      { name: "계란", amount: 2, unit: "개" },
      { name: "치즈", amount: 1, unit: "장" }
    ]
  }
];

// ===== 추천 로직 =====
function getRecipeMatches(items: { name: string; count: number; unit: string; category: string }[], recipes: Recipe[]) {
  return recipes.map(recipe => {
    const matched: string[] = [];
    const missing: string[] = [];
    recipe.ingredients.forEach(need => {
      const found = items.find(
        item =>
          item.name === need.name &&
          item.unit === need.unit &&
          item.count >= need.amount
      );
      if (found) matched.push(need.name);
      else missing.push(need.name);
    });
    return { recipe, matched, missing };
  });
}

// ===== explore.tsx 메인 컴포넌트 =====
export default function ExploreScreen() {
  const { items } = useItems();
  const matches = getRecipeMatches(items, recipeData);
  matches.sort((a, b) => b.matched.length - a.matched.length);

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <FlatList
        data={matches}
        keyExtractor={item => item.recipe.name}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.recipe.name}</Text>
            <Text style={styles.matchInfo}>
              <Text style={styles.matchCount}>
                {item.matched.length}개 재료 보유
              </Text>
              {" | "}
              재료 총 {item.recipe.ingredients.length}개
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 2 }}>
              <Text style={styles.label}>없는 재료 </Text>
              <Text style={styles.missing}>{item.missing.join(", ") || "없음"}</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <Text style={styles.label}>보유 재료 </Text>
              <Text style={styles.have}>{item.matched.join(", ") || "없음"}</Text>
            </View>
            {item.recipe.description && (
              <Text style={styles.desc}>{item.recipe.description}</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  title: { fontWeight: "bold", fontSize: 17, marginBottom: 4 },
  matchInfo: { fontSize: 13, marginBottom: 6, color: "#888" },
  matchCount: { color: "#ff9900", fontWeight: "bold" },
  label: { color: "#bbb", fontSize: 13, marginRight: 2 },
  missing: { color: "#aaa", fontSize: 13, fontWeight: "500" },
  have: { color: "#222", fontSize: 13, fontWeight: "bold" },
  desc: { color: "#666", fontSize: 13, marginTop: 6 },
});
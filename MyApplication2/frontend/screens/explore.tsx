import React, { useEffect, useState } from "react";
import { FlatList, NativeModules, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useItems } from "../context/ItemsContext";

// ===== 타입 정의 =====
type RecipeIngredient = { name: string; amount: number; unit: string };
type Recipe = {
  name: string;
  ingredients: RecipeIngredient[];
  description?: string;
};

type Props = {
  onSelectRecipe: (recipe: Recipe) => void;
};

export default function ExploreScreen({ onSelectRecipe }: Props) {
  const { items } = useItems();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  // ===== Kotlin Native Module 호출 =====
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const result = await NativeModules.MyModule.sendItems(items);
        setRecipes(result); // Kotlin에서 반환된 Recipe[] 구조
      } catch (e) {
        console.error("추천 요청 실패:", e);
      }
    };

    fetchRecommendations();
  }, [items]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => {
          const matched = item.ingredients.map(i => i.name);
          return (
            <TouchableOpacity onPress={() => onSelectRecipe(item.name)}>
              <View style={styles.card}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.matchInfo}>
                  <Text style={styles.matchCount}>
                    {matched.length}개 재료 추천
                  </Text>
                  {" | "}
                  재료 총 {item.ingredients.length}개
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 2 }}>
                  <Text style={styles.label}>재료 </Text>
                  <Text style={styles.have}>{matched.join(", ") || "없음"}</Text>
                </View>
                {item.description && (
                  <Text style={styles.desc}>{item.description}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
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
  have: { color: "#222", fontSize: 13, fontWeight: "bold" },
  desc: { color: "#666", fontSize: 13, marginTop: 6 },
});

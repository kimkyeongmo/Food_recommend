import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// 타입 정의
type IngredientItem =
  | {
      category: string;
      name: string[];
      amount?: string[];
      unit?: string[];
      is_required?: boolean[];
    }
  | {
      category: string;
      name: string;
      amount?: string;
      unit?: string;
      is_required?: boolean;
    };

type Recipe = {
  recipe_name: string;
  recipe_text: string;
  ingredients: IngredientItem[];
};

type RecipeDetailProps = {
  recipe: Recipe | null;
};

export default function RecipeDetailScreen({ recipe }: RecipeDetailProps) {
  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#c44" }}>
          레시피 정보가 없습니다.
        </Text>
      </View>
    );
  }

  const renderIngredients = (ingredientsArr: IngredientItem[]) => (
    <>
      {ingredientsArr.map((item, idx) => {
        if (Array.isArray((item as any).name)) {
          const arrItem = item as {
            category: string;
            name: string[];
            amount?: string[];
            unit?: string[];
            is_required?: boolean[];
          };
          return (
            <View key={idx} style={{ marginBottom: 8 }}>
              <Text style={styles.catTitle}>{arrItem.category}</Text>
              {arrItem.name.map((name, i) => (
                <Text key={name} style={styles.ingredient}>
                  - {name.trim()} {arrItem.amount?.[i] ?? ""}{arrItem.unit?.[i] ?? ""}
                  {arrItem.is_required?.[i] ? " (필수)" : ""}
                </Text>
              ))}
            </View>
          );
        } else {
          const objItem = item as {
            category: string;
            name: string;
            amount?: string;
            unit?: string;
            is_required?: boolean;
          };
          return (
            <View key={idx} style={{ marginBottom: 8 }}>
              <Text style={styles.catTitle}>{objItem.category}</Text>
              <Text style={styles.ingredient}>
                - {objItem.name} {objItem.amount ?? ""}{objItem.unit ?? ""}
                {objItem.is_required ? " (필수)" : ""}
              </Text>
            </View>
          );
        }
      })}
    </>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 18 }}>
      <Text style={styles.title}>{recipe.recipe_name}</Text>
      <Text style={styles.section}>설명</Text>
      <Text style={styles.desc}>{recipe.recipe_text}</Text>
      <Text style={styles.section}>카테고리별 재료</Text>
      {renderIngredients(recipe.ingredients)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff"
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 14 },
  section: { fontSize: 17, fontWeight: "bold", marginTop: 18, marginBottom: 6 },
  desc: { fontSize: 15, color: "#555", marginBottom: 10 },
  catTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 2, color: "#6c4a2c" },
  ingredient: { fontSize: 14, color: "#444", marginLeft: 6 },
});

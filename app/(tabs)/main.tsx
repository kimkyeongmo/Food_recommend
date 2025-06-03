import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 1. JSON 파일을 타입 단언과 함께 import!
import categorizedRaw from "../../DB/db_cleaner/categorized_ingredients.json";

// 2. 타입 명확화
type Ingredient = { name: string; unit: string };
type Item = { name: string; count: number; unit: string; category: string };

// 3. JSON 구조를 타입스크립트가 알 수 있게 단언!
const categorized = categorizedRaw as {
  [category: string]: { [name: string]: string };
};

// 4. 카테고리별로 { name, unit } 배열 만들기
const categories = Object.keys(categorized);
const ingredientsMap: { [category: string]: Ingredient[] } = {};
categories.forEach((cat) => {
  ingredientsMap[cat] = Object.entries(categorized[cat]).map(([name, unit]) => ({
    name,
    unit,
  }));
});

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [count, setCount] = useState("");

  // 5. 재료 추가 함수
  const addItem = () => {
    if (!selectedIngredient || !count.trim()) return;
    setItems([
      ...items,
      {
        name: selectedIngredient.name,
        count: Number(count),
        unit: selectedIngredient.unit,
        category: selectedCategory || "기타",
      },
    ]);
    // 초기화
    setModalVisible(false);
    setSelectedCategory(null);
    setSelectedIngredient(null);
    setCount("");
  };

  return (
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>나의 냉장고</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Feather name="plus-circle" size={28} color="#222" />
        </TouchableOpacity>
      </View>

      {/* 냉장고 비어있을 때 */}
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🥶 냉장고가 비어있어요</Text>
          <Text style={{ color: "#888" }}>+ 버튼으로 재료를 추가해보세요!</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(_, i) => i.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardCount}>
                수량: {item.count}
                {item.unit}
              </Text>
              <Text style={styles.cardCat}>{item.category}</Text>
            </View>
          )}
        />
      )}

      {/* 카테고리/재료/수량 모델 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedCategory(null);
          setSelectedIngredient(null);
          setCount("");
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalWrap}
        >
          <View style={styles.modalBox}>
            {!selectedCategory ? (
              <>
                <Text style={styles.modalTitle}>카테고리를 선택하세요</Text>
                <ScrollView
                  contentContainerStyle={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.catBtn}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={styles.catBtnText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : !selectedIngredient ? (
              <>
                <Text style={styles.modalTitle}>{selectedCategory} 재료 선택</Text>
                <ScrollView
                  contentContainerStyle={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {ingredientsMap[selectedCategory].map(({ name, unit }) => (
                    <TouchableOpacity
                      key={name}
                      style={styles.ingBtn}
                      onPress={() => setSelectedIngredient({ name, unit })}
                    >
                      <Text style={styles.ingBtnText}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={{ color: "#888" }}>← 카테고리 선택으로</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  {selectedIngredient.name}의 수량을 입력하세요
                </Text>
                <Text style={{ fontSize: 14, color: "#999", marginBottom: 12 }}>
                  단위: {selectedIngredient.unit}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`수량 (${selectedIngredient.unit})`}
                  value={count}
                  onChangeText={(text) => {
                    if (/^\d*$/.test(text)) setCount(text);
                  }}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={() => setSelectedIngredient(null)}
                  >
                    <Text style={{ color: "#666" }}>이전</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: "#222" }]}
                    onPress={addItem}
                    disabled={!count.trim()}
                  >
                    <Text style={{ color: "#fff" }}>추가</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: 54 },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 20,
    marginBottom: 14, justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#222" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 20, fontWeight: "600", marginBottom: 12, color: "#888" },
  card: {
    flex: 1, backgroundColor: "#fff", margin: 8, borderRadius: 18,
    paddingVertical: 26, paddingHorizontal: 12, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#222", marginBottom: 8 },
  cardCount: { fontSize: 15, color: "#777" },
  cardCat: { fontSize: 12, color: "#bbb", marginTop: 4 },
  modalWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.2)" },
  modalBox: { width: 310, backgroundColor: "#fff", borderRadius: 18, padding: 22, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 6 },
  modalTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 14, color: "#222", textAlign: "center" },
  catBtn: { backgroundColor: "#f4f4f8", paddingHorizontal: 17, paddingVertical: 10, borderRadius: 13, margin: 7 },
  catBtnText: { fontSize: 15, fontWeight: "600", color: "#555" },
  ingBtn: { backgroundColor: "#f0f6fc", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 11, margin: 6, borderWidth: 1, borderColor: "#d1e1fa" },
  ingBtnText: { fontSize: 15, color: "#337" },
  input: { borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginBottom: 12, fontSize: 16, textAlign: "center" },
  modalBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, backgroundColor: "#eee", alignItems: "center", marginTop: 10 },
  backBtn: { marginTop: 8, alignSelf: "center" },
});

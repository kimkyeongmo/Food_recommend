import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useItems } from "./ItemsContext";

const CATEGORY_ICON: { [key: string]: { icon: React.ReactNode } } = {
  "가루": {icon: <MaterialCommunityIcons name="food-variant" size={30} color="#bca16a" />},
  "견과류": {icon: <MaterialCommunityIcons name="peanut" size={30} color="#c17d4c" />},
  "기름": {icon: <MaterialCommunityIcons name="oil" size={30} color="#ffdb6a" />},
  "닭고기":{icon: <MaterialCommunityIcons name="food-drumstick" size={30} color="#f7a35c" />},
  "돼지고기":{icon: <MaterialCommunityIcons name="pig-variant" size={30} color="#f3b2b1" />},
  "소고기": {icon: <MaterialCommunityIcons name="cow" size={30} color="#a47551" />},
  "해산물": { icon: <MaterialCommunityIcons name="fish" size={30} color="#46a0b7" /> },
  "캔": { icon: <MaterialCommunityIcons name="bottle-soda-classic-outline" size={30} color="#b8c1cd" /> },
  "버섯": {icon: <MaterialCommunityIcons name="mushroom-outline" size={30} color="#bb7862" />},
  "채소": {icon: <Ionicons name="leaf" size={30} color="#69c56d" /> },
  "육류": {icon: <MaterialCommunityIcons name="food-drumstick" size={30} color="#e17a46" /> },
  "양념": {icon: <MaterialCommunityIcons name="shaker-outline" size={30} color="#d6b75b" /> },
  "소스": {icon: <MaterialCommunityIcons name="bottle-tonic-outline" size={30} color="#ee8b6c" /> },
  "육수": { icon: <MaterialCommunityIcons name="pot-steam" size={30} color="#e6a469" /> },
  "유제품": {icon: <MaterialCommunityIcons name="glass-mug-variant" size={30} color="#f5e1a4" />},
  "기타": { icon: <Ionicons name="apps-outline" size={30} color="#4eb0d4" /> },
  "면": { icon: <MaterialCommunityIcons name="noodles" size={30} color="#dfc264" /> },

  // 필요시 기타 카테고리 추가...
};

import categorizedRaw from "../../DB/db_cleaner/categorized_ingredients.json";
const categorized = categorizedRaw as {
  [category: string]: { [name: string]: string };
};

// json에서 카테고리/재료/단위 뽑기
const categories = Object.keys(categorized);
const ingredientsMap: { [category: string]: { name: string; unit: string }[] } = {};
categories.forEach(cat => {
  const raw = categorized[cat];
  if (Array.isArray(raw)) {
    // ["고구마:개", ...] 배열이면
    ingredientsMap[cat] = (raw as string[]).map(str => {
      const [name, unit] = str.split(":");
      return { name, unit };
    });
  } else {
    // { 고구마: "개", ... } 객체면
    ingredientsMap[cat] = Object.entries(raw).map(([name, unit]) => ({ name, unit }));
  }
});


export default function MainScreen() {
  const { items, setItems } = useItems();
  const [modal, setModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<{ name: string; unit: string } | null>(null);
  const [count, setCount] = useState("");

  // 재료 추가 함수
  const addItem = () => {
    if (!selectedIngredient || !count.trim()) return;
    setItems(prev => [
      ...prev,
      {
        name: selectedIngredient.name,
        count: Number(count),
        unit: selectedIngredient.unit,
        category: selectedCategory || "기타"
      }
    ]);
    setModal(false);
    setSelectedCategory(null);
    setSelectedIngredient(null);
    setCount("");
  };

  // 재료 삭제 함수
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <View style={styles.header}>
        <Text style={styles.title}>나의 냉장고</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>+ 추가</Text>
        </TouchableOpacity>
      </View>
      {items.length === 0 ? (
        <View style={styles.empty}><Text style={{ color: "#888" }}>냉장고가 비어있어요!</Text></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(_, idx) => idx.toString()}
          contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
          renderItem={({ item, index }) => (
            <View style={styles.itemCard}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetail}>
                {item.count}{item.unit} | {item.category}
              </Text>
              <TouchableOpacity onPress={() => removeItem(index)} style={styles.delBtn}>
                <Text style={{ color: "#fff" }}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {/* ---- 카테고리/재료/수량 입력 모달 ---- */}
      <Modal
        visible={modal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setModal(false);
          setSelectedCategory(null);
          setSelectedIngredient(null);
          setCount("");
        }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalWrap}>
          <View style={styles.modalBox}>
            {!selectedCategory ? (
              <>
                <Text style={styles.modalTitle}>카테고리를 선택하세요</Text>
                <ScrollView contentContainerStyle={styles.catGridWrap}>
                  <View style={styles.catGridContainer}>
                    {categories.map((cat, idx) => (
                      <TouchableOpacity
                        key={cat}
                        style={styles.catBlock}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        <View style={{ marginBottom: 4 }}>
                          {CATEGORY_ICON[cat]?.icon ?? <Ionicons name="help-outline" size={30} color="#bbb" />}
                        </View>
                        <Text style={styles.catBtnText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            ) : !selectedIngredient ? (
              <>
                <Text style={styles.modalTitle}>{selectedCategory} 재료 선택</Text>
                <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
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
                <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedCategory(null)}>
                  <Text style={{ color: "#888" }}>← 카테고리 선택으로</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{selectedIngredient.name}의 수량을 입력하세요</Text>
                <Text style={{ fontSize: 14, color: "#999", marginBottom: 12 }}>
                  단위: {selectedIngredient.unit}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`수량 (${selectedIngredient.unit})`}
                  value={count}
                  onChangeText={text => { if (/^\d*$/.test(text)) setCount(text); }}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <TouchableOpacity style={styles.modalBtn} onPress={() => setSelectedIngredient(null)}>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#222" },
  addBtn: {
    backgroundColor: "#39f",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: { fontWeight: "bold", fontSize: 17, flex: 1 },
  itemDetail: { color: "#666", fontSize: 15, marginRight: 12 },
  delBtn: {
    backgroundColor: "#f33",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  modalWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    width: 310,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
    textAlign: "center",
  },

  // 👇 카테고리 블럭 그리드 + 아이콘 스타일
  catGridWrap: {
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  catGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
  catBlock: {
    width: "47%",
    margin: "1.5%",
    height: 80,
    backgroundColor: "#f4f4f8",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    // 아이콘+텍스트 위아래 중앙정렬
    flexDirection: "column",
  },
  catBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 4,
  },

  // 👆 여기까지 카테고리 그리드+아이콘 스타일

  ingBtn: {
    backgroundColor: "#f0f6fc",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 11,
    margin: 6,
    borderWidth: 1,
    borderColor: "#d1e1fa",
  },
  ingBtnText: { fontSize: 15, color: "#337" },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    textAlign: "center",
  },
  modalBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
    marginTop: 10,
  },
  backBtn: { marginTop: 8, alignSelf: "center" },
});

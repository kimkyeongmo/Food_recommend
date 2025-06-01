import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Item = { name: string; count: number };

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [count, setCount] = useState("");

  // 재료 추가 함수
  const addItem = () => {
    if (!name.trim() || !count.trim()) return;
    setItems([...items, { name: name.trim(), count: Number(count) }]);
    setModalVisible(false);
    setName("");
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
              <Text style={styles.cardCount}>수량: {item.count}</Text>
            </View>
          )}
        />
      )}

      {/* 추가 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalWrap}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>재료 추가</Text>
            <TextInput
              style={styles.input}
              placeholder="재료 이름 (예: 계란)"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="수량 (숫자만)"
              value={count}
              onChangeText={text => {
                // 숫자만 허용
                if (/^\d*$/.test(text)) setCount(text);
              }}
              keyboardType="numeric"
              maxLength={4}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ color: "#666" }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#222" }]}
                onPress={addItem}
                disabled={!name.trim() || !count.trim()}
              >
                <Text style={{ color: "#fff" }}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: 54 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
    justifyContent: "space-between",
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
  modalWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.2)" },
  modalBox: { width: 280, backgroundColor: "#fff", borderRadius: 18, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 6 },
  modalTitle: { fontSize: 19, fontWeight: "bold", marginBottom: 14, color: "#222", textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginBottom: 12, fontSize: 16 },
  modalBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, backgroundColor: "#eee", alignItems: "center", marginTop: 10 },
});

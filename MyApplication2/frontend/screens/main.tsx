// import React, { useState } from "react";
// import {
//   FlatList,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Image,
//   NativeModules
// } from "react-native";
// import categorizedRaw from "../DB/db_cleaner/categorized_ingredients.json";
// import { useItems } from "../context/ItemsContext";

// const categorized = categorizedRaw as {
//   [category: string]: { [name: string]: string };
// };

// const CATEGORY_ICON: { [key: string]: { src: any; size: number } } = {
//   "뿌리채소": { src: require("../icon/1.png"), size: 30 },
//   "잎줄기채소": { src: require("../icon/2.png"), size: 30 },
//   "열매채소/과채류": { src: require("../icon/3.png"), size: 30 },
//   "버섯류": { src: require("../icon/4.png"), size: 30 },
//   "건어물": { src: require("../icon/5.png"), size: 30 },
//   "곡류/잡곡": { src: require("../icon/6.png"), size: 30 },
//   "면류": { src: require("../icon/7.png"), size: 30 },
//   "두부/콩/콩가공품": { src: require("../icon/8.png"), size: 30 },
//   "달걀류": { src: require("../icon/9.png"), size: 30 },
//   "유제품": { src: require("../icon/10.png"), size: 30 },
//   "견과/씨앗류": { src: require("../icon/11.png"), size: 30 },
//   "과일류": { src: require("../icon/12.png"), size: 30 },
//   "육류-소": { src: require("../icon/13.png"), size: 30 },
//   "육류-돼지": { src: require("../icon/14.png"), size: 30 },
//   "육류-닭": { src: require("../icon/15.png"), size: 30 },
//   "육류-오리": { src: require("../icon/16.png"), size: 30 },
//   "햄/가공육": { src: require("../icon/17.png"), size: 30 },
//   "해산물": { src: require("../icon/18.png"), size: 30 },
//   "조미김/김치류": { src: require("../icon/19.png"), size: 30 },
//   "떡/빵/기타가공식품": { src: require("../icon/20.png"), size: 30 },
//   "분말/가루류": { src: require("../icon/21.png"), size: 30 },
//   "기본양념": { src: require("../icon/22.png"), size: 30 },
//   "장류": { src: require("../icon/23.png"), size: 30 },
//   "분말/가루양념": { src: require("../icon/24.png"), size: 30 },
//   "액체양념": { src: require("../icon/25.png"), size: 30 },
//   "복합/즉석양념": { src: require("../icon/26.png"), size: 30 },
//   "기타/조미료": { src: require("../icon/27.png"), size: 30 },
//   "소스류": { src: require("../icon/28.png"), size: 30 },
//   "음료/주류/조미료": { src: require("../icon/29.png"), size: 30 },
//   "오일/기름": { src: require("../icon/30.png"), size: 30 },
//   "캔": { src: require("../icon/31.png"), size: 30 },
//   "육수": { src: require("../icon/32.png"), size: 30 }
// };

// const categories = Object.keys(categorized);
// const ingredientsMap: { [category: string]: { name: string; unit: string }[] } = {};
// categories.forEach(cat => {
//   const raw = categorized[cat];
//   ingredientsMap[cat] = Object.entries(raw).map(([name, unit]) => ({ name, unit }));
// });

// export default function MainScreen() {
//   const { items, setItems } = useItems();
//   const [modal, setModal] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [selectedIngredient, setSelectedIngredient] = useState<{ name: string; unit: string } | null>(null);
//   const [count, setCount] = useState("");

//   const addItem = () => {
//     if (!selectedIngredient || !count.trim()) return;
//     const newItem = {
//       name: selectedIngredient.name,
//       count: Number(count),
//       unit: selectedIngredient.unit,
//       category: selectedCategory || "기타"
//     };
//     setItems(prev => [...prev, newItem]);
//     NativeModules.MyModule.sendItems([newItem]);
//     setModal(false);
//     setSelectedCategory(null);
//     setSelectedIngredient(null);
//     setCount("");
//   };

//   const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

//   return (
//     <View style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
//       <View style={styles.header}>
//         <Text style={styles.title}>나의 냉장고</Text>
//         <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
//           <Text style={{ color: "#fff", fontWeight: "bold" }}>+ 추가</Text>
//         </TouchableOpacity>
//       </View>
//       {items.length === 0 ? (
//         <View style={styles.empty}><Text style={{ color: "#888" }}>냉장고가 비어있어요!</Text></View>
//       ) : (
//         <FlatList
//           data={items}
//           keyExtractor={(_, idx) => idx.toString()}
//           contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
//           renderItem={({ item, index }) => (
//             <View style={styles.itemCard}>
//               {CATEGORY_ICON[item.category] && (
//                 <Image source={CATEGORY_ICON[item.category].src} style={{ width: 24, height: 24, marginRight: 10 }} />
//               )}
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.itemName}>{item.name}</Text>
//                 <Text style={styles.itemDetail}>{item.count}{item.unit} | {item.category}</Text>
//               </View>
//               <TouchableOpacity onPress={() => removeItem(index)} style={styles.delBtn}>
//                 <Text style={{ color: "#fff" }}>삭제</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//       )}
//       <Modal
//         visible={modal}
//         animationType="slide"
//         transparent
//         onRequestClose={() => {
//           setModal(false);
//           setSelectedCategory(null);
//           setSelectedIngredient(null);
//           setCount("");
//         }}
//       >
//         <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalWrap}>
//           <View style={styles.modalBox}>
//             {!selectedCategory ? (
//               <>
//                 <Text style={styles.modalTitle}>카테고리를 선택하세요</Text>
//                 <ScrollView contentContainerStyle={styles.catGridWrap}>
//                   <View style={styles.catGridContainer}>
//                     {categories.map((cat) => (
//                       <TouchableOpacity
//                         key={cat}
//                         style={styles.catBlock}
//                         onPress={() => setSelectedCategory(cat)}
//                       >
//                         {CATEGORY_ICON[cat] && (
//                           <Image
//                             source={CATEGORY_ICON[cat].src}
//                             style={{ width: CATEGORY_ICON[cat].size, height: CATEGORY_ICON[cat].size, marginBottom: 6 }}
//                           />
//                         )}
//                         <Text style={styles.catBtnText}>{cat}</Text>
//                       </TouchableOpacity>
//                     ))}
//                   </View>
//                 </ScrollView>
//               </>
//             ) : !selectedIngredient ? (
//               <>
//                 <Text style={styles.modalTitle}>{selectedCategory} 재료 선택</Text>
//                 <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
//                   {ingredientsMap[selectedCategory].map(({ name, unit }) => (
//                     <TouchableOpacity
//                       key={name}
//                       style={styles.ingBtn}
//                       onPress={() => setSelectedIngredient({ name, unit })}
//                     >
//                       <Image
//                             source={"../icon/default.png"}
//                             style={{ width: 30, height: 30, marginBottom: 6 }}
//                           />
//                       <Text style={styles.ingBtnText}>{name}</Text>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//                 <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedCategory(null)}>
//                   <Text style={{ color: "#888" }}>← 카테고리 선택으로</Text>
//                 </TouchableOpacity>
//               </>
//             ) : (
//               <>
//                 <Text style={styles.modalTitle}>{selectedIngredient.name}의 수량을 입력하세요</Text>
//                 <Text style={{ fontSize: 14, color: "#999", marginBottom: 12 }}>단위: {selectedIngredient.unit}</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder={`수량 (${selectedIngredient.unit})`}
//                   value={count}
//                   onChangeText={text => { if (/^\d*$/.test(text)) setCount(text); }}
//                   keyboardType="numeric"
//                   maxLength={4}
//                 />
//                 <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
//                   <TouchableOpacity style={styles.modalBtn} onPress={() => setSelectedIngredient(null)}>
//                     <Text style={{ color: "#666" }}>이전</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[styles.modalBtn, { backgroundColor: "#222" }]}
//                     onPress={addItem}
//                     disabled={!count.trim()}
//                   >
//                     <Text style={{ color: "#fff" }}>추가</Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             )}
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee"
//   },
//   title: { fontSize: 22, fontWeight: "bold", color: "#222" },
//   addBtn: { backgroundColor: "#39f", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 7 },
//   empty: { flex: 1, alignItems: "center", justifyContent: "center" },
//   itemCard: {
//     backgroundColor: "#fff", borderRadius: 14, marginBottom: 10,
//     padding: 16, flexDirection: "row", alignItems: "center"
//   },
//   itemName: { fontWeight: "bold", fontSize: 17, flex: 1 },
//   itemDetail: { color: "#666", fontSize: 15, marginRight: 12 },
//   delBtn: { backgroundColor: "#f33", borderRadius: 8, paddingVertical: 5, paddingHorizontal: 12 },
//   modalWrap: {
//     ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.15)",
//     alignItems: "center", justifyContent: "center", zIndex: 9999
//   },
//   modalBox: { backgroundColor: "#fff", borderRadius: 18, padding: 20, width: 310, elevation: 6 },
//   modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14, textAlign: "center" },
//   catGridWrap: {
//     paddingBottom: 12,
//     paddingHorizontal: 4,
//   },
//   catGridContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "flex-start",
//     width: "100%",
//   },
//   catBlock: {
//     width: "47%",
//     margin: "1.5%",
//     height: 110,
//     backgroundColor: "#f4f4f8",
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 4,
//     flexDirection: "column",
//     paddingVertical: 12,
//   },
//   catBtnText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#555",
//     textAlign: "center",
//     marginTop: 4,
//     width: "100%",
//   },
//   ingBtn: { backgroundColor: "#f0f6fc", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 11, margin: 6, borderWidth: 1, borderColor: "#d1e1fa" },
//   ingBtnText: { fontSize: 15, color: "#337" },
//   input: { borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginBottom: 12, fontSize: 16, textAlign: "center" },
//   modalBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, backgroundColor: "#eee", alignItems: "center", marginTop: 10 },
//   backBtn: { marginTop: 8, alignSelf: "center" },
  
// });

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
  Image,
  NativeModules
} from "react-native";
import categorizedRaw from "../DB/db_cleaner/categorized_ingredients.json";
import { useItems } from "../context/ItemsContext";

const categorized = categorizedRaw as {
  [category: string]: { [name: string]: string };
};

const CATEGORY_ICON: { [key: string]: { src: any; size: number } } = {
  "뿌리채소": { src: require("../icon/1.png"), size: 30 },
  "잎줄기채소": { src: require("../icon/2.png"), size: 30 },
  "열매채소/과채류": { src: require("../icon/3.png"), size: 30 },
  "버섯류": { src: require("../icon/4.png"), size: 30 },
  "건어물": { src: require("../icon/5.png"), size: 30 },
  "곡류/잡곡": { src: require("../icon/6.png"), size: 30 },
  "면류": { src: require("../icon/7.png"), size: 30 },
  "두부/콩/콩가공품": { src: require("../icon/8.png"), size: 30 },
  "달걀류": { src: require("../icon/9.png"), size: 30 },
  "유제품": { src: require("../icon/10.png"), size: 30 },
  "견과/씨앗류": { src: require("../icon/11.png"), size: 30 },
  "과일류": { src: require("../icon/12.png"), size: 30 },
  "육류-소": { src: require("../icon/13.png"), size: 30 },
  "육류-돼지": { src: require("../icon/14.png"), size: 30 },
  "육류-닭": { src: require("../icon/15.png"), size: 30 },
  "육류-오리": { src: require("../icon/16.png"), size: 30 },
  "햄/가공육": { src: require("../icon/17.png"), size: 30 },
  "해산물": { src: require("../icon/18.png"), size: 30 },
  "조미김/김치류": { src: require("../icon/19.png"), size: 30 },
  "떡/빵/기타가공식품": { src: require("../icon/20.png"), size: 30 },
  "분말/가루류": { src: require("../icon/21.png"), size: 30 },
  "기본양념": { src: require("../icon/22.png"), size: 30 },
  "장류": { src: require("../icon/23.png"), size: 30 },
  "분말/가루양념": { src: require("../icon/24.png"), size: 30 },
  "액체양념": { src: require("../icon/25.png"), size: 30 },
  "복합/즉석양념": { src: require("../icon/26.png"), size: 30 },
  "기타/조미료": { src: require("../icon/27.png"), size: 30 },
  "소스류": { src: require("../icon/28.png"), size: 30 },
  "음료/주류/조미료": { src: require("../icon/29.png"), size: 30 },
  "오일/기름": { src: require("../icon/30.png"), size: 30 },
  "캔": { src: require("../icon/31.png"), size: 30 },
  "육수": { src: require("../icon/32.png"), size: 30 }
};

const categories = Object.keys(categorized);
const ingredientsMap: { [category: string]: { name: string; unit: string }[] } = {};
categories.forEach(cat => {
  const raw = categorized[cat];
  ingredientsMap[cat] = Object.entries(raw).map(([name, unit]) => ({ name, unit }));
});

export default function MainScreen() {
  const { items, setItems } = useItems();
  const [modal, setModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<{ name: string; unit: string } | null>(null);
  const [count, setCount] = useState("");

  const addItem = () => {
    if (!selectedIngredient || !count.trim()) return;
    const newItem = {
      name: selectedIngredient.name,
      count: Number(count),
      unit: selectedIngredient.unit,
      category: selectedCategory || "기타"
    };
    setItems(prev => [...prev, newItem]);
    NativeModules.MyModule.sendItems([newItem]);
    setModal(false);
    setSelectedCategory(null);
    setSelectedIngredient(null);
    setCount("");
  };

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
              {CATEGORY_ICON[item.category] && (
                <Image source={CATEGORY_ICON[item.category].src} style={{ width: 24, height: 24, marginRight: 10 }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>{item.count}{item.unit} | {item.category}</Text>
              </View>
              <TouchableOpacity onPress={() => removeItem(index)} style={styles.delBtn}>
                <Text style={{ color: "#fff" }}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={styles.catBlock}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        {CATEGORY_ICON[cat] && (
                          <Image
                            source={CATEGORY_ICON[cat].src}
                            style={{ width: CATEGORY_ICON[cat].size, height: CATEGORY_ICON[cat].size, marginBottom: 6 }}
                          />
                        )}
                        <Text style={styles.catBtnText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            ) : !selectedIngredient ? (
              <>
                <Text style={styles.modalTitle}>{selectedCategory} 재료 선택</Text>
                <ScrollView contentContainerStyle={styles.ingGridWrap}>
                  <View style={styles.ingGridContainer}>
                    {ingredientsMap[selectedCategory].map(({ name, unit }) => (
                      <TouchableOpacity
                        key={name}
                        style={styles.ingBlock}
                        onPress={() => setSelectedIngredient({ name, unit })}
                      >
                        <Image
                          source={require("../icon/default.png")}
                          style={{ width: 30, height: 30, marginBottom: 6 }}
                        />
                        <Text style={styles.ingBtnText}>{name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedCategory(null)}>
                  <Text style={{ color: "#888" }}>← 카테고리 선택으로</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{selectedIngredient.name}의 수량을 입력하세요</Text>
                <Text style={{ fontSize: 14, color: "#999", marginBottom: 12 }}>단위: {selectedIngredient.unit}</Text>
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
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee"
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#222" },
  addBtn: { backgroundColor: "#39f", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 7 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  itemCard: {
    backgroundColor: "#fff", borderRadius: 14, marginBottom: 10,
    padding: 16, flexDirection: "row", alignItems: "center"
  },
  itemName: { fontWeight: "bold", fontSize: 17, flex: 1 },
  itemDetail: { color: "#666", fontSize: 15, marginRight: 12 },
  delBtn: { backgroundColor: "#f33", borderRadius: 8, paddingVertical: 5, paddingHorizontal: 12 },
  modalWrap: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center", justifyContent: "center", zIndex: 9999
  },
  modalBox: { backgroundColor: "#fff", borderRadius: 18, padding: 20, width: 310, elevation: 6 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14, textAlign: "center" },
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
    height: 110,
    backgroundColor: "#f4f4f8",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    flexDirection: "column",
    paddingVertical: 12,
  },
  catBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
    marginTop: 4,
    width: "100%",
  },
  ingGridWrap: {
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  ingGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },
  ingBlock: {
    width: "47%",
    margin: "1.5%",
    height: 90,
    backgroundColor: "#f0f6fc",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1e1fa",
  },
  ingBtnText: { fontSize: 15, color: "#337" },
  input: { borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginBottom: 12, fontSize: 16, textAlign: "center" },
  modalBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, backgroundColor: "#eee", alignItems: "center", marginTop: 10 },
  backBtn: { marginTop: 8, alignSelf: "center" },
});

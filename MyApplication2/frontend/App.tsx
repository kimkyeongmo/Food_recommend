import React, { useState } from 'react';
import { NativeModules, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ItemsProvider } from './context/ItemsContext';
import MainScreen from './screens/main';
import ExploreScreen from './screens/explore';
import RecipeDetailScreen from './screens/recipe_detail';

export default function App() {
  const [activeTab, setActiveTab] = useState<'Main' | 'Explore' | 'Detail'>('Main');
  const [selectedRecipeData, setSelectedRecipeData] = useState<any | null>(null); // ✅ recipe 전체 저장

  const handleRecipeSelect = async (recipeName: string) => {
    try {
      // Kotlin 함수 호출
      const detail = await NativeModules.MyModule.getRecipeDetail(recipeName);
      setSelectedRecipeData(detail);
      setActiveTab('Detail');
    } catch (e) {
      console.error('레시피 상세 정보 가져오기 실패:', e);
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Main':
        return <MainScreen />;
      case 'Explore':
        return (
          <ExploreScreen
            onSelectRecipe={(name: string) => {
              handleRecipeSelect(name); // ✅ 레시피 선택 시 전체 데이터 가져오기
            }}
          />
        );
      case 'Detail':
        return <RecipeDetailScreen recipe={selectedRecipeData} />; // ✅ 전체 데이터 전달
      default:
        return <MainScreen />;
    }
  };

  return (
    <ItemsProvider>
      <View style={styles.container}>
        <View style={styles.content}>{renderScreen()}</View>
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setActiveTab('Main')} style={styles.tabButton}>
            <Text style={activeTab === 'Main' ? styles.activeText : styles.inactiveText}>냉장고</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Explore')} style={styles.tabButton}>
            <Text style={activeTab === 'Explore' ? styles.activeText : styles.inactiveText}>레시피 추천</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Detail')} style={styles.tabButton}>
            <Text style={activeTab === 'Detail' ? styles.activeText : styles.inactiveText}>레시피 디테일</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ItemsProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: 'gray',
  },
});

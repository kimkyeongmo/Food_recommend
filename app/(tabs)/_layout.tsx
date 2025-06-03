import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ItemsProvider } from "./ItemsContext";

export default function Layout() {
  return (
    <ItemsProvider>
      <Tabs>
        <Tabs.Screen
          name="main"
          options={{
            title: "냉장고",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "레시피 추천",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ItemsProvider>
  );
}

// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { ItemsProvider } from './context/ItemsContext';

// import MainScreen from './screens/main';
// import ExploreScreen from './screens/explore';

// const Tab = createBottomTabNavigator();

// export default function App() {
//   return (
//     <ItemsProvider>
//       <NavigationContainer>
//         <Tab.Navigator>
//           <Tab.Screen name="Main" component={MainScreen} options={{ title: "냉장고" }} />
//           <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: "레시피 추천" }} />
//         </Tab.Navigator>
//       </NavigationContainer>
//     </ItemsProvider>
//   );
// }
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ItemsProvider } from './context/ItemsContext';
import MainScreen from './screens/main';

export default function App() {
  return (
    <ItemsProvider>
      <NavigationContainer>
        <MainScreen />
      </NavigationContainer>
    </ItemsProvider>
  );
}

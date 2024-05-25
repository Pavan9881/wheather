import React, { useState, useEffect, useRef } from "react";
import { View } from 'react-native';
import Splash from "./src/Components/Splash";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from "./src/Components/Home/Home";

import OfflineStore from "./src/Components/Offline/OfflineStore";
import OfflineData from "./src/Components/OfflineData/OfflineData";

const App = () => {
  const Stack = createNativeStackNavigator();
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Home" component={Home} options={{ header: true }} />
        <Stack.Screen name="OfflineStore" component={OfflineStore} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

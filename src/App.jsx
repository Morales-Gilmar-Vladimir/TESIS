import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Registro from './components/Registro';
import Login from './components/Login';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Registro">
        <Stack.Screen
          name="Registro"
          component={Registro}
          options={{ title: 'Registro' }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ title: 'Inicio de sesión' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

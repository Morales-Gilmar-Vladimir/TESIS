// Importa los módulos necesarios
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Registro from './components/Registro';
import Login from './components/Login';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Inicio' }}
        />
        <Stack.Screen
          name="Perfil"
          component={ProfileScreen}
          options={{ title: 'Perfil Usuario' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;


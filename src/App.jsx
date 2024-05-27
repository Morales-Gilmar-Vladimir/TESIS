import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Registro from './components/Registro';
import Login from './components/Login';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PublishScreen from './screens/PublishScreen';
import EditarPublicacion from './screens/EditarPublicacion'

const Stack = createStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(token !== null);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al verificar el estado de inicio de sesión:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; 
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Login'}>
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
        <Stack.Screen
          name="Publicar"
          component={PublishScreen}
          options={{ title: 'Perfil Usuario' }}
        />
        <Stack.Screen
          name="Editar Publicacion"
          component={EditarPublicacion}
          options={{ title: 'Editar Publicacion' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

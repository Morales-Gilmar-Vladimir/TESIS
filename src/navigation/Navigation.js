
import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from '../components/Login';
import Registro from '../components/Registro';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import styles from '../styles/styles';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('token'); // Obtener el token de AsyncStorage
      setIsLoggedIn(!!userToken); // Verificar si el token es válido
    } catch (error) {
      console.error('Error al verificar el estado de la sesión:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token'); // Eliminar el token de AsyncStorage
      setIsLoggedIn(false); // Actualizar el estado de isLoggedIn
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Tab.Navigator initialRouteName="Login">
      <Tab.Screen name="Login" 
      component={Login}
      options={({ navigation, route }) => ({
        tabBarButton: () => (
          <Text
            style={styles.tabBarButton}
            onPress={() => {
              if (route.name !== 'Login') {
                navigation.navigate('Login');
              }
            }}
            >
            </Text>
          ),
        })}
      />
      <Tab.Screen name="Registro" 
        component={Registro} 
        options={({ navigation, route }) => ({
          tabBarButton: () => (
            <Text
              style={styles.tabBarButton}
              onPress={() => {
                if (route.name !== 'Registro') {
                  navigation.navigate('Registro');
                }
              }}
              >
              </Text>
            ),
          })}
        />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation, route }) => ({
          tabBarButton: () => (
            <Text
              style={styles.tabBarButton}
              onPress={() => {
                if (route.name !== 'Home') {
                  navigation.navigate('Home');
                }
              }}
            >
            </Text>
          ),
        })}
      />
      {isLoggedIn && (
        <Tab.Screen
          name="Perfil"
          component={ProfileScreen}
          options={({ navigation }) => ({
            tabBarButton: () => (
              <Text
                style={styles.tabBarButton}
                onPress={() => navigation.navigate('Perfil')}
              >
              </Text>
            ),
          })}
        />
      )}
    </Tab.Navigator>
  );
};

export default Navigation;

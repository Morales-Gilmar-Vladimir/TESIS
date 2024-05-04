import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from '../components/Login';
import Registro from '../components/Registro';
import HomeScreen from '../screens/HomeScreen';
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
      const userToken = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(userToken !== null);
    } catch (error) {
      console.error('Error al verificar el estado de la sesión:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Tab.Navigator initialRouteName="Login">
      <Tab.Screen name="Login" component={Login} />
      <Tab.Screen name="Registro" component={Registro} />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          tabBarButton: () => (
            <Pressable
              style={styles.tabBarButton}
              onPress={() => {
                if (isLoggedIn) {
                  navigation.navigate('Home');
                } else {
                  navigation.navigate('Login');
                }
              }}
            >
              <Text style={styles.tabBarButtonText}> </Text>
            </Pressable>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

export default Navigation;

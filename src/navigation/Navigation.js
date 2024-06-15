import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from '../components/Login';
import Registro from '../components/Registro';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PublishScreen from '../screens/PublishScreen';
import EditarPublicacion from '../screens/EditarPublicacion'
import styles from '../styles/styles';
import Inicio from '../components/Inicio'
import Buscar from '../components/Buscar'
import ChangePassword  from '../screens/ChangePassword'
import Perfil_Usuario from '../screens/Perfil_Usuario'

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    checkLoginStatus();
    checkFirstLaunchStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('token'); 
      setIsLoggedIn(!!userToken); 
    } catch (error) {
      console.error('Error al verificar el estado de la sesión:', error);
    }
  };

  const checkFirstLaunchStatus = async () => {
    try {
      const isFirstLaunchValue = await AsyncStorage.getItem('isFirstLaunch');
      setIsFirstLaunch(isFirstLaunchValue === null);
    } catch (error) {
      console.error('Error al verificar el estado de la primera ejecución:', error);
    }
  };

  if (isFirstLaunch === null) {
    return null;
  }

  return (
    <Tab.Navigator initialRouteName={isFirstLaunch ? 'Inicio' : 'Login'}>
      <Tab.Screen name="Inicio" 
        component={Inicio}
        options={({ navigation, route }) => ({
          tabBarButton: () => null,
        })}
      />
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
      <Tab.Screen name="ChangePassword" 
        component={ChangePassword}
        options={({ navigation, route }) => ({
          tabBarButton: () => (
            <Text
              style={styles.tabBarButton}
              onPress={() => {
                if (route.name !== 'ChangePassword') {
                  navigation.navigate('ChangePassword');
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
      {isLoggedIn && (
        <Tab.Screen
          name="Publicar"
          component={PublishScreen}
          options={({ navigation }) => ({
            tabBarButton: () => (
              <Text
                style={styles.tabBarButton}
                onPress={() => navigation.navigate('Publicar')}
              >
              </Text>
            ),
          })}
        />
      )}
      {isLoggedIn && (
        <Tab.Screen
          name="EditarPublicacion"
          component={EditarPublicacion}
          options={({ navigation }) => ({
            tabBarButton: () => (
              <Text
                style={styles.tabBarButton}
                onPress={() => navigation.navigate('EditarPublicacion')}
                  >
              </Text>
            ),
          })}
        />
      )}{isLoggedIn && (
        <Tab.Screen
          name="Buscar"
          component={Buscar}
          options={({ navigation }) => ({
            tabBarButton: () => (
              <Text
                style={styles.tabBarButton}
                onPress={() => navigation.navigate('Buscar')}
                  >
              </Text>
            ),
          })}
        />
      )}
      {isLoggedIn && (
        <Tab.Screen
          name="Perfil_Usuario"
          component={Perfil_Usuario}
          options={({ navigation }) => ({
            tabBarButton: () => (
              <Text
                style={styles.tabBarButton}
                onPress={() => navigation.navigate('Perfil_Usuario')}
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

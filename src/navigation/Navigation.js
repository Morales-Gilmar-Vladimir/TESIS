// Navigation.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text } from 'react-native';
import Login from '../components/Login';
import Registro from '../components/Registro';
import HomeScreen from '../screens/HomeScreen';
import styles from '../styles/styles'; // Ajustamos la importación para tomar los estilos del archivo correcto

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Inicio"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerTitle: 'Inicio',
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton} 
              onPress={() => {
                navigation.navigate('Login');
              }}
            >
              <Text style={styles.headerButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

const Navigation = () => {
  return (
    <Tab.Navigator initialRouteName="Login">
      <Tab.Screen name="Login" component={Login} />
      <Tab.Screen name="Registro" component={Registro} />
      <Tab.Screen name="Home" component={HomeStack} />
    </Tab.Navigator>
  );
};

export default Navigation;

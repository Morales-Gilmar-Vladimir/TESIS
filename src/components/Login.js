import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../styles/styles';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const url = 'https://ropdat.onrender.com/api/login'; 
      const response = await axios.post(url, { email, password });
      
      // Obtener el token de autenticación del servidor
      const { token, _id } = response.data;
  
      // Guardar el token y el ID del usuario en AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('_id', _id);
      
      // Limpiar los campos de correo electrónico y contraseña
      setEmail('');
      setPassword('');
    
      // Limpiar el estado de error
      setError('');
    
      // Redirigir a la pantalla de inicio una vez que el inicio de sesión sea exitoso
      navigation.navigate('Home');
    
      Alert.alert(
        'LOGIN',
        'Inicio de sesión Exitoso',
        [
            { text: 'OK' }
        ]
      );
    
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Correo electrónico o contraseña incorrectos');
    }
  };
  

  const handleRegistroPress = () => {
    navigation.navigate('Registro');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inicio de sesión</Text>
      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={[styles.errorText, { marginTop: 1 }]}>{error}</Text>}
      
      <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <View style={styles.registroContainer}>
        <Text style={styles.registroText}>¿No tienes una cuenta?</Text>
        <TouchableOpacity onPress={handleRegistroPress}>
          <Text style={styles.registroLink}>¡Regístrate aquí!</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Login;

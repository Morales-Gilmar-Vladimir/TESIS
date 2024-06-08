import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView , ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../styles/styles';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    checkAuthToken();
    const unsubscribe = navigation.addListener('focus', () => {
      // Limpiar los campos de correo electrónico y contraseña cuando la pantalla obtenga el foco
      setEmail('');
      setPassword('');
      setError('');
      setLoading(false);
    });


    return unsubscribe;
  }, [navigation]);

  const checkAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Si hay un token almacenado, redirige a la pantalla de inicio automáticamente
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error al verificar el token de autenticación:', error);
    }
  };
  const handleLogin = async () => {
    try {
      const url = 'https://ropdat.onrender.com/api/login'; 
      const response = await axios.post(url, { email, password });
      
      // Obtener el token de autenticación del servidor
      const { token, _id } = response.data;
  
      // Verificar si la cuenta está bloqueada antes de guardar el token
      const isBlocked = await verificarBloqueo();
      if (isBlocked) {
        // Cerrar sesión eliminando el token de autenticación almacenado
        await AsyncStorage.removeItem('token');
        return; // Finaliza la función si la cuenta está bloqueada
      }
  
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
  
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Correo electrónico o contraseña incorrectos');
    }
  };
  

  const verificarBloqueo = async () => {
    setLoading(true);
    try {
      const url = 'https://ropdat.onrender.com/api/login'; 
      const response = await axios.post(url, { email, password });
      
      const { msg } = response.data;
  
      // Limpiar los campos de correo electrónico y contraseña
      setEmail('');
      setPassword('');
      
      // Limpiar el estado de error
      setError('');
      
      if (msg && msg === "Su cuenta esta bloqueada") {
        // Si la cuenta está bloqueada, mostrar un mensaje al usuario
        Alert.alert(
          'Cuenta bloqueada',
          'Tu cuenta ha sido bloqueada. Por favor, contacta al soporte para obtener ayuda.',
          [{ text: 'OK' }]
        );
      } else {
        // Redirigir a la pantalla de inicio una vez que el inicio de sesión sea exitoso
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Correo electrónico o contraseña incorrectos');
    } finally {
      setLoading(false); // Detener el indicador de carga independientemente del resultado
    }
  };
  

  const handleLoginAndVerify = async () => {
    try {
      // Ejecuta la función para verificar si la cuenta está bloqueada
      const bloqueada = await verificarBloqueo(); 
      
      // Verifica si la cuenta está bloqueada
      if (!bloqueada) {
        // Si la cuenta no está bloqueada, ejecuta la función de inicio de sesión
        await handleLogin();
        //console.log('Inicio de sesión exitoso.');
        // Aquí puedes redirigir al usuario a la pantalla de inicio, por ejemplo.
      } else {
        // Si la cuenta está bloqueada, muestra un mensaje o realiza una acción adecuada
        console.log('La cuenta está bloqueada. No se puede iniciar sesión.');
        // Aquí puedes mostrar una alerta al usuario, redirigirlo a otra pantalla, etc.
      }
    } catch (error) {
      console.error('Error al iniciar sesión y verificar bloqueo:', error);
    }
  };
  
  

  const handleRegistroPress = () => {
    navigation.navigate('Registro');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
       {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
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
      
      <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={handleLoginAndVerify}>
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

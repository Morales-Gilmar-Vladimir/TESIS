import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import styles from '../styles/styles';

const ChangePassword = ({ route, navigation }) => {
  const { token } = route.params;
  const [verificationCode, setVerificationCode] = useState(''); // Nuevo estado para almacenar el código de verificación
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setVerificationCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  }, []);

  const handleChangePassword = async () => {
  if (!verificationCode) {
    Alert.alert('Error', 'Por favor, ingresa el código de verificación');
    return;
  }

  if (newPassword.length < 10 || !/[A-Z]/.test(newPassword)) {
    Alert.alert('Error', 'La contraseña debe tener al menos 10 caracteres y una letra mayúscula.');
    return;
  }

  if (newPassword !== confirmNewPassword) {
    Alert.alert('Error', 'Las contraseñas no coinciden');
    return;
  }

  setLoading(true);

  try {
    // Realizar la validación del código junto con el cambio de contraseña
    const response = await axios.post('https://ropdat.onrender.com/api/nuevopassword', {
      codigo: verificationCode, // Enviar el código de verificación al backend
      password: newPassword,
      confirmpassword: confirmNewPassword
    });

    // Si la respuesta es exitosa, mostrar mensaje de éxito y redirigir
    Alert.alert('Éxito','Contraseña actualizada correctamente.');
    navigation.navigate('Login');
  } catch (error) {
    // Si hay un error, verificar si es debido a un código de verificación incorrecto
    if (error.response && error.response.status === 404 && error.response.data && error.response.data.msg === "Lo sentimos el codigo, es incorrecto") {
      Alert.alert('Error', 'El código de verificación no es válido. Por favor, verifícalo e inténtalo de nuevo.');
    } else {
      // Si es otro tipo de error, mostrar mensaje genérico de error
      console.error('Error al actualizar la contraseña:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar la contraseña.');
    }
  }

  setLoading(false);
};

  

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
      <Text style={styles.title}>Nueva Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Código de Verificación" // Cambiar el placeholder para el código de verificación
        value={verificationCode} // Actualizar el valor con el estado correspondiente
        onChangeText={setVerificationCode} // Actualizar el estado del código de verificación
      />
      <TextInput
        style={styles.input}
        placeholder="Nueva Contraseña"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Nueva Contraseña"
        secureTextEntry
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Actualizar Contraseña</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePassword;

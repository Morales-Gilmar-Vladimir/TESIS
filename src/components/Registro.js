import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native'; // Agrega Alert
import axios from 'axios';
import styles from '../styles/styles';

const Registro = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [password, setPassword] = useState('');
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  const handleRegister = async () => {
    // Validar campos obligatorios y aceptación de términos
    if (!nombre || !apellido || !email || !fechaNacimiento || !password) {
      Alert.alert(
        'Campos incompletos',
        'Por favor, completa todos los campos para registrarte.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!terminosAceptados) { // Si los términos no están aceptados
      Alert.alert(
        'Términos y condiciones',
        'Debes aceptar los términos y condiciones para registrarte.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validar formato de correo electrónico y dominio conocido
    if (!validateEmail(email)) {
      Alert.alert(
        'Formato de correo incorrecto',
        'Por favor, introduce un correo electrónico válido con un dominio conocido (ej. gmail.com o hotmail.com).',
        [{ text: 'OK' }]
      );
      return;
    }

      // Validar que la contraseña tenga al menos una mayúscula, un número y 10 caracteres
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{10,}$/;
      if (!passwordRegex.test(password)) {
        Alert.alert(
          'Contraseña inválida',
          'La contraseña debe tener al menos una letra mayúscula, un número y 10 caracteres.',
          [{ text: 'OK' }]
        );
        return;
      }
      
    try {
      const url = 'https://ropdat.onrender.com/api/register';
      const respuesta = await axios.post(url, {
        nombre,
        apellido,
        email,
        fechaNacimiento,
        password,
      });
      console.log('Respuesta del servidor:', respuesta.data);
      
      setNombre('');
      setApellido('');
      setEmail('');
      setFechaNacimiento('');
      setPassword('');
      setTerminosAceptados(false);

      Alert.alert(
        'Registro exitoso',
        'Se ha enviado un correo de confirmación a tu dirección de correo electrónico.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error al registrar:', error);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const formatFechaNacimiento = (text) => {
    let formattedText = text.replace(/\D/g, '');
    if (formattedText.length > 4) {
      formattedText = formattedText.substring(0, 4) + '-' + formattedText.substring(4);
    }
    if (formattedText.length > 7) {
      formattedText = formattedText.substring(0, 7) + '-' + formattedText.substring(7);
    }
    return formattedText;
  };

  const validateEmail = (email) => {
    // Expresión regular para validar correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Array de dominios conocidos
    const knownDomains = ['gmail.com', 'hotmail.com'];
    const domain = email.split('@')[1];
    return emailRegex.test(email) && knownDomains.includes(domain);
  };

  const handleTermsPress = () => {
    // Aquí defines la URL de tus términos y condiciones
    const termsUrl = 'https://drive.google.com/file/d/1_T_H0VBNnASnxYdumS-wCm0H1_IzfaFm/view?usp=sharing';
    Linking.openURL(termsUrl);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Registro</Text>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />
        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          placeholder="Apellido"
          value={apellido}
          onChangeText={setApellido}
        />
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.label}>Fecha de nacimiento (AAAA/MM/DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="Fecha de nacimiento (AAAA/MM/DD)"
          value={formatFechaNacimiento(fechaNacimiento)}
          onChangeText={(text) => setFechaNacimiento(formatFechaNacimiento(text))}
          keyboardType="numeric"
          maxLength={10}
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={() => setTerminosAceptados(!terminosAceptados)}>
            <View style={styles.checkbox}>
              {terminosAceptados && <View style={styles.checkedIcon} />}
            </View>
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            Acepto los términos y condiciones{'\n'}
            <Text style={styles.termsLink} onPress={handleTermsPress}>Leer términos y condiciones{'\n'}</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={handleLoginPress}>
            <Text style={styles.loginButton}>Ingresar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Registro;

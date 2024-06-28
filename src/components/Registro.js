import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Linking, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import styles from '../styles/styles';


const Registro = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [password, setPassword] = useState('');
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    
    const unsubscribe = navigation.addListener('focus', () => {
      // Limpiar los campos de correo electrónico y contraseña cuando la pantalla obtenga el foco
      setNombre('');
      setApellido('');
      setEmail('');
      setFechaNacimiento('');
      setPassword('');
      setTerminosAceptados(false);
      setLoading(false);
    });


    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Login');
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const handleRegister = async () => {
    setLoading(true);
    // Validar campos obligatorios y aceptación de términos
    if (!nombre || !apellido || !email || !fechaNacimiento || !password) {
      Alert.alert(
        'Campos incompletos',
        'Por favor, completa todos los campos para registrarte.',
        [{ text: 'OK' }]

      );
      setLoading(false); // Detener el indicador de carga
      return;
    }
  
    if (!terminosAceptados) { // Si los términos no están aceptados
      Alert.alert(
        'Términos y condiciones',
        'Debes aceptar los términos y condiciones para registrarte.',
        [{ text: 'OK' }]
      );
      setLoading(false); // Detener el indicador de carga
      return;
    }
  
    // Validar formato de correo electrónico y dominio conocido
    if (!validateEmail(email)) {
      Alert.alert(
        'Formato de correo incorrecto',
        'Por favor, introduce un correo electrónico válido con un dominio conocido (ej. gmail.com o hotmail.com).',
        [{ text: 'OK' }]
      );

      setLoading(false); // Detener el indicador de carga
      return;
    }

      // Validar que la fecha de nacimiento sea válida en términos de calendario
      if (!isValidCalendarDate(fechaNacimiento)) {
        Alert.alert(
          'Formato de fecha incorrecto',
          'Por favor, introduce una fecha de nacimiento válida en el formato AAAA/MM/DD.',
          [{ text: 'OK' }]
        );

        setLoading(false); // Detener el indicador de carga
        return;
      }
      // Validar que la fecha de nacimiento cumpla con el límite de edad
      const fechaLimite = new Date('2008-01-01');
      const fechaNac = new Date(fechaNacimiento);
      if (fechaNac >= fechaLimite) {
        Alert.alert(
          'Edad mínima requerida',
          'Lo sentimos, la edad mínima para registrarse en nuestra aplicación es de 16 años.',
          [{ text: 'OK' }]
        );

        setLoading(false); // Detener el indicador de carga
        return;
      }
  
    try {
      // Realizar la solicitud POST para el registro
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
  
      // Manejar errores específicos, como el correo ya registrado
      if (error.response && error.response.status === 404) {
        Alert.alert(
          'Correo ya registrado',
          'El correo electrónico ingresado ya está registrado en el sistema. Por favor, utiliza otro correo electrónico.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error al registrar',
          'Ocurrió un error al procesar tu registro. Por favor, inténtalo nuevamente más tarde.',
          [{ text: 'OK' }]
        );
      }
    }
    setLoading(false);
  };
  
  const isValidCalendarDate = (fecha) => {
    const dateParts = fecha.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    const proposedDate = new Date(year, month - 1, day); // Meses en JavaScript son 0-indexed
    return (
      proposedDate.getFullYear() === year &&
      proposedDate.getMonth() === month - 1 &&
      proposedDate.getDate() === day
    );
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
    const termsUrl = 'https://drive.google.com/file/d/14i7BnOWBgvIRwrlF-W7eeIlP3a4-wnAq/view?usp=sharing';
    Linking.openURL(termsUrl);
  };

  return (
    // <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
      <View style={{ height: 50 }} />
      <Text style={styles.title}>Registro</Text>
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={(text) => setNombre(text.slice(0, 15))}
        maxLength={15} // Máximo de 15 caracteres
        multiline={false} // No permite saltos de línea
      />
      <Text style={styles.label}>Apellido</Text>
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={apellido}
        onChangeText={(text) => setApellido(text.slice(0, 15))}
                maxLength={15} // Máximo de 15 caracteres
                multiline={false} // No permite saltos de línea
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
      <View style={{ height: 10 }} />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
  
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
        <TouchableOpacity onPress={handleLoginPress}>
          <Text style={styles.loginButton}>Ingresar</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 60 }} />
    </ScrollView>
    
    
  );
}  

export default Registro;

import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Inicio = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    require('../assets/Imagen1.png'), // Asegúrate de que las rutas de las imágenes sean correctas
    require('../assets/Imagen2.png'),
  ];

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
      if (isFirstLaunch === null) {
        await AsyncStorage.setItem('isFirstLaunch', 'false');
      } else {
        navigation.navigate('Login');
      }
    };
    checkFirstLaunch();
  }, []);

  const handleNextPress = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={images[currentIndex]} style={styles.image} />
      <TouchableOpacity style={styles.button} onPress={handleNextPress}>
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default Inicio;

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Button, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen = ({ navigation }) => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState('');

  const fetchPublicaciones = async () => {
    try {
      // Realiza la llamada a la API para obtener las publicaciones
      const response = await axios.get('https://ropdat.onrender.com/api/publicaciones');
      setPublicaciones(response.data);
    } catch (error) {
      console.error('Error al obtener las publicaciones:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Elimina el estado de autenticación guardado en AsyncStorage
      await AsyncStorage.removeItem('userToken');
      // Redirige al inicio de sesión
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleImagePress = (url) => {
    setImagenAmpliada(url);
    setModalVisible(true);
  };

  const handleLike = () => {
    // Implementa la lógica para guardar el me gusta
    Alert.alert('¡Me gusta!', 'Has dado me gusta a esta imagen.');
  };

  const handleDislike = () => {
    // Implementa la lógica para guardar el no me gusta
    Alert.alert('¡No me gusta!', 'Has dado no me gusta a esta imagen.');
  };

  const handleReport = () => {
    // Implementa la lógica para reportar la imagen
    Alert.alert('¡Imagen reportada!', 'Has reportado esta imagen.');
  };

  const handleSave = () => {
    // Implementa la lógica para guardar la imagen en el dispositivo
    Alert.alert('¡Imagen guardada!', 'Has guardado esta imagen en tu dispositivo.');
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.logoutButton}>Cerrar sesión</Text>
      </TouchableOpacity>
      <View style={styles.gridContainer}>
        {publicaciones.map((publicacion, index) => (
          <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handleImagePress(publicacion.secure_url)}>
            <Image
              source={{ uri: publicacion.secure_url }}
              style={styles.image}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButton}>Cerrar</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: imagenAmpliada }}
            style={styles.ampliada}
          />
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={handleLike}>
              <Icon name="thumbs-up" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleDislike}>
              <Icon name="thumbs-down" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleReport}>
              <Icon name="exclamation-circle" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Icon name="save" size={30} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: 0,
    auto: 'margin',
  },
  gridItem: {
    width: 230,
    marginBottom: 40,
    borderRadius: 15,
    overflow: 'hidden',
    cursor: 'zoom-in',
    backgroundColor: 'lightgray',
    margin: 10,
    alignSelf: 'flex-start',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 15,
  },
  logoutButton: {
    alignSelf: 'flex-end',
    marginVertical: 10,
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  closeButton: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  ampliada: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'lightblue',
  },
});

export default HomeScreen;

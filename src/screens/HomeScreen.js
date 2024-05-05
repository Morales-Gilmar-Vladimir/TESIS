import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Button, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen = ({ navigation }) => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const fetchPublicaciones = async () => {
    try {
      const response = await axios.get('https://ropdat.onrender.com/api/publicaciones');
      setPublicaciones(response.data);
    } catch (error) {
      console.error('Error al obtener las publicaciones:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
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
    Alert.alert('¡Me gusta!', 'Has dado me gusta a esta imagen.');
  };

  const handleDislike = () => {
    Alert.alert('¡No me gusta!', 'Has dado no me gusta a esta imagen.');
  };

  const handleReport = () => {
    Alert.alert('¡Imagen reportada!', 'Has reportado esta imagen.');
  };

  const handleSave = () => {
    Alert.alert('¡Imagen guardada!', 'Has guardado esta imagen en tu dispositivo.');
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  // Función para navegar a la pantalla de perfil
  const goToProfile = () => {
    navigation.navigate('Perfil');
  };

  // Función para mostrar u ocultar el menú lateral
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <View style={styles.container}>
      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.gridContainer}>
          {publicaciones.map((publicacion, index) => (
            <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handleImagePress(publicacion.imagen.secure_url)}>
              <Image
                source={{ uri: publicacion.imagen.secure_url }}
                style={styles.image}
              />
              <Text style={styles.imageName}>{publicacion._id}</Text>
              <Text style={styles.imageDescription}>{publicacion.descripcion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* Botones en posición fija */}
      <View style={styles.fixedButtonsContainer}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Icon name="home" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Publish')}>
            <Icon name="plus-square" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Perfil')}>
            <Icon name="user" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Modal para mostrar imagen ampliada */}
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
              <Icon name="star" size={30} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 60, // Ajusta el padding para dejar espacio para la barra lateral
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  gridItem: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'lightgray',
  },
  image: {
    width: '100%',
    aspectRatio: 0.5,
    borderRadius: 15,
  },
  imageName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 10,
  },
  imageDescription: {
    fontSize: 14,
    marginTop: 5,
    marginLeft: 10,
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
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: 'lightblue',
  },
  fixedButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    zIndex: 100,
  },
});

export default HomeScreen;

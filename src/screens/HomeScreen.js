import React, { useEffect, useState } from 'react';
import { BackHandler, View, Text, ScrollView, Image, Button, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen = ({ navigation }) => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);

  const fetchPublicaciones = async () => {
    try {
      const response = await axios.get('https://ropdat.onrender.com/api/publicaciones');
      setPublicaciones(response.data);
    } catch (error) {
      console.error('Error al obtener las publicaciones:', error);
    }
  };

  const handleImagePress = (publicacion) => {
    setSelectedPost(publicacion);
    setImagenAmpliada(publicacion.imagen.secure_url);
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


  useEffect(() => {
    const handleBackPress = () => {
      if (navigation.isFocused()) {
        if (backPressCount < 1) {
          setBackPressCount(1);
          Alert.alert('Salir', '¿Estás seguro de que quieres salir de la aplicación?', [
            { text: 'Cancelar', onPress: () => setBackPressCount(0), style: 'cancel' },
            { text: 'Salir', onPress: () => BackHandler.exitApp() },
          ]);
          return true;
        }
      }
      return false;
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    

    
    return () => backHandler.remove();
  }, [backPressCount, navigation]);
  

    // Función para navegar a la pantalla de perfil y forzar la actualización de la pantalla de inicio
    const navigateToProfile = () => {
      navigation.navigate('Perfil');
      fetchPublicaciones(); // Actualizar publicaciones cuando regresas de la pantalla de perfil
    };


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.gridContainer}>
          {publicaciones.map((publicacion, index) => (
            <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handleImagePress(publicacion)}>
              <Image
                source={{ uri: publicacion.imagen.secure_url }}
                style={styles.image}
              />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 70 }} />
      </ScrollView>
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
          {selectedPost && (
            <View style={styles.detailsContainer}>
              <Text style={styles.userName}>{selectedPost.nombre}</Text>
              <Text style={styles.imageDescription}>{selectedPost.descripcion}</Text>
            </View>
          )}
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
      {/* Botones de navegación */}
      <View style={styles.fixedButtonsContainer}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Icon name="home" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Publicar')}>
            <Icon name="plus-square" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToProfile}>
            <Icon name="user" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
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
    paddingTop: 60, 
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
    color: 'white'
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
  detailsContainer: {
    alignItems: 'center',
    marginBottom: 20,
    color: 'white'
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white'
  },
  ampliada: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  fixedButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 10,
    elevation: 4,
  },
  button: {
    padding: 10,
  },
});

export default HomeScreen;

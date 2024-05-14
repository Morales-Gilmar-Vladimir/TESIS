import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, BackHandler, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchUserData();

    const handleBackPress = () => {
      if (navigation.isFocused()) {
        navigation.navigate('Home');
        return true;
      }
      return false;
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  
    return () => backHandler.remove();
  }, [navigation]);


  const fetchUserData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      if (!userToken) {
        console.error('Token de usuario no encontrado en AsyncStorage');
        return;
      }
  
      const userId = await AsyncStorage.getItem('_id');
      if (!userId) {
        console.error('ID de usuario no encontrado en AsyncStorage');
        return;
      }
  
      const responseUserData = await axios.get(`https://ropdat.onrender.com/api/usuario/${userId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
  
      if (!responseUserData || !responseUserData.data || !responseUserData.data.UsuarioBDD) {
        console.error('No se recibieron datos de usuario válidos desde la API');
        return;
      }
  
      const userData = responseUserData.data.UsuarioBDD;
      setUserData(userData);
      const userPosts = responseUserData.data.publicacionBDD;
      setPublicaciones(userPosts);
  
      console.log('Datos del usuario y publicaciones cargados correctamente');
    } catch (error) {
      console.error('Error al obtener la información del perfil:', error);
    }
  };

  const selectProfileImage = async () => {
    try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert('Se requiere permiso para acceder a la galería de fotos');
            return;
        }

        setLoadingImage(true);

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        setLoadingImage(false);
        console.log('Resultado del selector de imágenes:', pickerResult);
        
        if (!pickerResult.cancelled && pickerResult.assets.length > 0) {
            const selectedImageUri = pickerResult.assets[0].uri;
            console.log('URI de la imagen seleccionada:', selectedImageUri);
            setSelectedImageUri(selectedImageUri);
        } else {
            console.log('No se seleccionó ninguna imagen nueva');
        }
    } catch (error) {
        setLoadingImage(false);
        console.error('Error al seleccionar la imagen:', error.message);
    }
};

const confirmProfileImage = async () => {
  console.log('Imagen de perfil confirmada');
  
  if (selectedImageUri) {
    console.log('Actualizando la foto de perfil...');
    await updateProfileImage(selectedImageUri);
  } else {
    console.log('No hay ninguna imagen seleccionada para confirmar');
  }
};

  // Función para forzar la actualización del componente
  const forceUpdate = () => {
    setSelectedImageUri(null); // Reiniciamos la URI de la imagen seleccionada
    fetchUserData(); // Volvemos a cargar los datos de usuario para reflejar los cambios
  };

const updateProfileImage = async (imageUri) => {
  try {
    const userToken = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('_id');

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: `profile_${userId}.jpg`,
      type: 'image/jpeg',
    });

    // Actualizar la foto de perfil en la ruta del usuario/id
    const responseUserById = await axios.put(`https://ropdat.onrender.com/api/usuario/foto/${userId}`, formData, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Respuesta de la actualización de la foto de perfil en la ruta del usuario/id:', responseUserById.data);

    // Obtener los datos actualizados del usuario después de la actualización
    console.log('Obteniendo los datos actualizados del usuario...');
    const responseUserData = await axios.get(`https://ropdat.onrender.com/api/usuario/${userId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });

    if (!responseUserData || !responseUserData.data || !responseUserData.data.UsuarioBDD) {
      console.error('No se recibieron datos de usuario válidos desde la API');
      return;
    }

    const userData = responseUserData.data.UsuarioBDD;
    console.log('Datos actualizados del usuario:', userData);
    setUserData(userData);
    forceUpdate();
  } catch (error) {
    console.error('Error al actualizar la foto de perfil:', error);
  }
};

  const handleImagePress = (url, post) => {
    setSelectedPost(post);
    setImagenAmpliada(url);
    setModalVisible(true);
  };


  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('_id');
      setUserData(null);
      setPublicaciones([]);
      setSelectedImageUri(null);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.profileContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.optionsButton} onPress={handleLogout}>
            <Icon name="sign-out" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {userData && (
          <>
            <View style={styles.profilePictureContainer}>
            <TouchableOpacity onPress={selectProfileImage}>
              {loadingImage ? (
                <Text>Cargando imagen...</Text>
              ) : (
                <>
                  {selectedImageUri ? (
                    <>
                      <Image source={{ uri: selectedImageUri }} style={styles.profilePicture} />
                      
                    </>
                  ) : (
                    <>
                      {userData && userData.fotoperfil ? (
                        <Image source={{ uri: userData.fotoperfil.secure_url }} style={styles.profilePicture} />
                      ) : (
                        <Icon name="user-circle" size={150} color="#ccc" />
                      )}
                    </>
                  )}
                  {selectedImageUri && (
                    <TouchableOpacity style={styles.confirmButton} onPress={confirmProfileImage}>
                      <Text style={styles.confirmButtonText}>Confirmar como foto de perfil</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </TouchableOpacity>
            </View>
            <View style={styles.userDataContainer}>
              <Text style={styles.username}>{userData.nombre}</Text>
              <Text style={styles.description}>{userData.descripcion}</Text>
              <View style={styles.statsContainer}>
                <Text style={styles.stat}>{publicaciones.length} publicaciones</Text>
              </View>
            </View>
          </>
        )}
        <View style={styles.postsContainer}>
          {publicaciones.length > 0 ? (
            publicaciones.map((publicacion, index) => (
              <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handleImagePress(publicacion.imagen.secure_url, publicacion)}>
                <Image
                  source={{ uri: publicacion.imagen.secure_url }}
                  style={styles.image}
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text>No hay publicaciones</Text>
          )}
        </View>
      </ScrollView>
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
          {selectedPost && (
            <View style={styles.postInfoContainer}>
              <Text style={styles.imageName}>{selectedPost._id}</Text>
              <Text style={styles.imageDescription}>{selectedPost.descripcion}</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  optionsButton: {
    padding: 5,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  userDataContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  stat: {
    fontSize: 16,
  },
  postsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  gridItem: {
    width: '48%',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
  },
  imageName: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageDescription: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
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
  imageUriText: {
    marginTop: 10,
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
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
  postInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    paddingBottom: 20,
  },
});

export default ProfileScreen;

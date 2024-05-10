import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [base64Image, setBase64Image] = useState(null);

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

  const handleLogout = async () => {
    try {
      // Eliminar todos los datos relacionados con el usuario del AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('_id');
      // Limpiar el estado de los datos de usuario en el componente
      setUserData(null);
      setUserPosts([]);
      setSelectedImage(null);
      setBase64Image(null);
      // Navegar a la pantalla de inicio de sesión
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
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

      if (!pickerResult.cancelled && pickerResult.uri) {
        console.log('URI de la imagen seleccionada:', pickerResult.uri);
        console.log('Imagen seleccionada:', pickerResult); // Agregamos esta línea para mostrar más detalles sobre la imagen seleccionada
        convertToBase64(pickerResult.uri);
        setSelectedImage(pickerResult.uri); // Esta línea se mantiene para mostrar la imagen seleccionada en la interfaz
      }
    } catch (error) {
      setLoadingImage(false);
      console.error('Error al seleccionar la imagen:', error);
    }
  };

  const confirmProfileImage = async () => {
    try {
      if (selectedImage) {
        // Lógica para confirmar la imagen como foto de perfil...
        console.log('Imagen confirmada como foto de perfil:', selectedImage);
      } else {
        console.log('No se ha seleccionado ninguna imagen como foto de perfil');
      }
    } catch (error) {
      console.error('Error al confirmar la imagen como foto de perfil:', error);
    }
  };

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
      setUserPosts(userPosts);

      console.log('Datos del usuario cargados correctamente');
    } catch (error) {
      console.error('Error al obtener la información del perfil:', error);
    }
  };

  const convertToBase64 = async (imageUri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
      setBase64Image(base64);
    } catch (error) {
      console.error('Error al convertir la imagen a base64:', error);
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
                    {base64Image ? (
                      <>
                        <Image source={{ uri: `data:image/jpeg;base64,${base64Image}` }} style={styles.profilePicture} />
                        <Text style={styles.imageUriText}>URI: {selectedImage}</Text>
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
                  </>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.userDataContainer}>
              <Text style={styles.username}>{userData.nombre}</Text>
              <Text style={styles.description}>{userData.descripcion}</Text>
              <View style={styles.statsContainer}>
                <Text style={styles.stat}>0 publicaciones</Text>
              </View>
            </View>
            {selectedImage && (
              <TouchableOpacity style={styles.confirmButton} onPress={confirmProfileImage}>
                <Text style={styles.confirmButtonText}>Confirmar como foto de perfil</Text>
              </TouchableOpacity>
            )}
          </>
        )}
        <View style={styles.postsContainer}>
          {userPosts.map((post, index) => (
            <View key={index} style={styles.postItem}>
              {userData && (
                <Image source={{ uri: userData.fotoperfil }} style={styles.profilePicture} />
              )}
              <Text style={styles.postDescription}>{post.descripcion}</Text>
            </View>
          ))}
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
  postItem: {
    width: '48%',
    marginBottom: 20,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
  },
  postDescription: {
    marginTop: 5,
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
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'lightgray',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 5,
  },
  button: {
    padding: 10,
  },
  imageUriText: {
    marginTop: 10,
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  }
});

export default ProfileScreen;

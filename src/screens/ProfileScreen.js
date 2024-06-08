import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image,Button  ,TextInput, StyleSheet, TouchableOpacity, BackHandler, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [descripcionEditable, setDescripcionEditable] = useState('');
  const [descripcionTemporal, setDescripcionTemporal] = useState('');
  const [editandoDescripcion, setEditandoDescripcion] = useState(false);
  const [favoritos, setFavoritos] = useState([]);
  const [section, setSection] = useState('publicaciones');
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false); 
  
  useFocusEffect(
    React.useCallback(() => {
     
      fetchUserData();
       // Resetear los estados al cargar la pantalla
       setUserData(null);
       setPublicaciones([]);
       setSelectedImageUri(null);
       setLoadingImage(false);
       setModalVisible(false);
       setImagenAmpliada('');
       setSelectedPost(null);
       setDescripcionEditable('');
       setDescripcionTemporal('');
       setFavoritos([]);
       setEditandoDescripcion(false);
       setFavoritePosts([]);
       setDescripcion('');
 
       // Cargar la información del usuario al enfocar la pantalla
       fetchUserData();
    }, [])
  );

  useEffect(() => {
    const handleBackPress = () => {
      if (navigation.isFocused()) {
        navigation.navigate('Home');
        return true;
      }
      return false;
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  
    const handleFocus = () => {
      fetchUserData();
    };
  
    const unsubscribe = navigation.addListener('focus', handleFocus);
  
    return () => {
      backHandler.remove();
      unsubscribe();
    };


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
      setDescripcionEditable(userData.descripcion); // Establecer la descripción editable inicialmente
      setNombre(userData.nombre);
      setApellido(userData.apellido);
      setDescripcion(userData.descripcion);
      const userPosts = responseUserData.data.publicacionBDD;
      setPublicaciones(userPosts);
      fetchFavoritos(userId, userToken);
      
      console.log('Datos del usuario y publicaciones cargados correctamente');
    } catch (error) {
      console.error('Error al obtener la información del perfil:', error);
    }
  };
////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleDescripcionChange = (text) => {
    const newText = text.slice(0, 70); 
    const lines = newText.split('\n');
    if (lines.length > 2) {
      setDescripcion(lines.slice(0, 2).join('\n'));
    } else {
      setDescripcion(newText);
    }
  };

  const handleGuardarDescripcion = async () => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('_id');
  
      // Realizar la solicitud de actualización al servidor con la nueva descripción
      const response = await axios.put(`https://ropdat.onrender.com/api/usuario/${userId}`, {
        descripcion: descripcionTemporal,
      }, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
  
      if (response.status === 200) {
        // Actualizar la descripción en el estado local y restablecer el estado temporal
        setUserData({ ...userData, descripcion: descripcionTemporal });
        setDescripcionEditable(descripcionTemporal);
        setDescripcionTemporal('');
    
        // Cambiar el estado para dejar de editar la descripción
        setEditandoDescripcion(false);
        // Actualizar los datos del usuario y las publicaciones
        fetchUserData();
      } else {
        throw new Error('Error al actualizar la descripción');
      }
    } catch (error) {
      console.error('Error al actualizar la descripción:', error);
      Alert.alert('Error', 'Se produjo un error al intentar actualizar la descripción. Por favor, inténtalo de nuevo más tarde.');
    }

  };
  
  const handleEditProfile = () => {
    setEditProfileModalVisible(true);

  };

  const handleSaveProfile = async () => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('_id');
      const response = await axios.put(`https://ropdat.onrender.com/api/usuario/${userId}`, {
        nombre,
        apellido,
        descripcion,
      }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.status === 200) {
        fetchUserData();
        setEditProfileModalVisible(false);
        Alert.alert('Perfil actualizado', 'Tu perfil se ha actualizado correctamente.');
      } else {
        throw new Error('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar tu perfil. Inténtalo de nuevo más tarde.');
    }
  };

  
  
  /////////////////////////////////////////////////////////
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

const forceUpdate = () => {
  setSelectedImageUri(null); 
  fetchUserData(); 
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

    const responseUserById = await axios.put(`https://ropdat.onrender.com/api/usuario/foto/${userId}`, formData, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Respuesta de la actualización de la foto de perfil en la ruta del usuario/id:', responseUserById.data);

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
  if (section === 'favoritos') {
    setSelectedFavorito(post);
    setImagenAmpliada(url);
    setFavoritosModalVisible(true);
  } else {
    setSelectedPost(post);
    setImagenAmpliada(url);
    setModalVisible(true);
  }
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

const navigateToHome = () => {
  navigation.navigate('Home');
  forceUpdate(); // Llamamos a la función para actualizar la pantalla de inicio
};

const handleEdit = () => {
  const postId = selectedPost._id;
  navigation.navigate('EditarPublicacion', { postId });
  setModalVisible(false);
  fetchUserData();
};

const handleDelete = async (postId) => {
  try {
    const userToken = await AsyncStorage.getItem('token');

    // Realizar la solicitud de eliminación al servidor con el ID de la publicación
    const response = await axios.delete(`https://ropdat.onrender.com/api/publicar/eliminar/${postId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    });

    if (response.status === 200) {
      // Actualizar las publicaciones después de la eliminación
      fetchUserData();
      setModalVisible(false); // Ocultar el modal después de eliminar la publicación
      Alert.alert('Publicación eliminada', 'La publicación ha sido eliminada correctamente.');
    } else {
      throw new Error('Error al eliminar la publicación');
    }
  } catch (error) {
    console.error('Error al eliminar la publicación:', error);
    Alert.alert('Error', 'Se produjo un error al intentar eliminar la publicación. Por favor, inténtalo de nuevo más tarde.');
  }
};


const fetchFavoritos = async (userId, userToken) => {
  try {
    const response = await axios.get(`https://ropdat.onrender.com/api/publicaciones/misFavoritos/${userId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });
    if (response.status === 200) {
      const favoritosData = response.data;
      const favoritosIds = favoritosData.map(favorito => favorito._id); // Obtener solo los IDs de los favoritos
      setFavoritos(response.data); // Establecer la lista de IDs de favoritos
      console.log('Favoritos IDs:', favoritosIds); 

      // Almacenar los IDs de los favoritos en AsyncStorage
      await AsyncStorage.setItem('favoritos', JSON.stringify(favoritosIds));
    } else {
      console.error('Error al obtener los favoritos');
    }
  } catch (error) {
    console.error('Error al obtener los favoritos:', error);
  }
};


const handleRemoveFromFavorites = async (_id) => {
  try {
    const userToken = await AsyncStorage.getItem('token');
    if (!userToken) {
      console.error('Token de usuario no encontrado en AsyncStorage');
      return;
    }

    // Realizar la solicitud para eliminar el favorito utilizando el _id del favorito
    const response = await axios.delete(`https://ropdat.onrender.com/api/publicacion/eliminarFavoritos/${_id}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (response.status === 200) {
      fetchUserData();
      setFavoritosModalVisible(false); // Ocultar el modal después de eliminar la publicación
      await AsyncStorage.removeItem(`favorito_${_id}`);
      setFavoritePosts(favoritePosts.filter(favId => favId !== _id)); // Remover el _id de la lista de favoritos localmente
      Alert.alert('Listo', 'Publicacion eliminada de favoritos.');
    }
  } catch (error) {
    console.error('Error al eliminar de favoritos:', error);
    Alert.alert('Error', 'Hubo un problema al eliminar esta imagen de favoritos.');
  }
};

const handleSectionChange = (section) => {
  setSection(section);
};


const [favoritosModalVisible, setFavoritosModalVisible] = useState(false);

const [selectedFavorito, setSelectedFavorito] = useState(null);


return (
  <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.profileContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.optionsButton} onPress={handleLogout}>
          <Icon name="sign-out" size={24} color="#5450b5" />
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
              <Text style={styles.description}>{descripcionEditable}</Text>
              <TouchableOpacity onPress={handleEditProfile}>
                <Text style={styles.editButton}>Editar perfil</Text>
              </TouchableOpacity>
            </View>

        </>
      )}
      <View style={styles.sectionSelector}>
        <TouchableOpacity onPress={() => handleSectionChange('publicaciones')}>
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, section === 'publicaciones' && styles.activeSectionTitle]}>
              <Icon name="image" size={20} color={section === 'publicaciones' ? '#5450b5' : 'white'} />  Publicaciones
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSectionChange('favoritos')}>
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, section === 'favoritos' && styles.activeSectionTitle]}>
              <Icon name="bookmark" size={20} color={section === 'favoritos' ? '#5450b5' : 'white'} />      Favoritos
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ height: 10 }} />
      <View style={styles.postsContainer}>
        {section === 'publicaciones' && publicaciones.length > 0 && (
          publicaciones.map((publicacion, index) => (
            <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handleImagePress(publicacion.imagen.secure_url, publicacion)}>
              <Image
                source={{ uri: publicacion.imagen.secure_url }}
                style={styles.image}
              />
            </TouchableOpacity>
          ))
        )}

        {section === 'favoritos' && favoritos && favoritos.length > 0 && (
          favoritos.map((favorito, index) => (
            favorito && favorito.imagen && (
              <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handleImagePress(favorito.imagen.secure_url, favorito)}>
                <Image
                  source={{ uri: favorito.imagen.secure_url }}
                  style={styles.image}
                />
              </TouchableOpacity>
            )
          ))
        )}

        {((section === 'publicaciones' && publicaciones.length === 0) || (section === 'favoritos' && (!favoritos || favoritos.length === 0))) && (
         <View style={styles.textContainer}>
         <Text style={styles.text}>
           No hay {section === 'publicaciones' ? 'publicaciones' : 'favoritos'}
         </Text>
       </View>
        )}
      </View>
      <View style={{ height: 50 }} />
    </ScrollView>
    <View style={styles.fixedButtonsContainer}>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={navigateToHome}>
          <Icon name="home" size={24} color="#5450b5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Publicar')}>
          <Icon name="plus-square" size={24} color="#5450b5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Perfil')}>
          <Icon name="user" size={24} color="#5450b5" />
        </TouchableOpacity>
      </View>
    </View>

    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible || editProfileModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditProfileModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => {
            setModalVisible(false);
            setEditProfileModalVisible(false);
          }}>
            <Text style={styles.closeButton}>Cerrar</Text>
          </TouchableOpacity>
          {editProfileModalVisible && (
            <View style={styles.editProfileContainer}>
              <Text style={styles.editProfileTitle}>Editar Perfil</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={(text) => setNombre(text.slice(0, 15))}
                maxLength={15} // Máximo de 15 caracteres
                multiline={false} // No permite saltos de línea
              />
              <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={apellido}
                onChangeText={(text) => setApellido(text.slice(0, 15))}
                maxLength={15} // Máximo de 15 caracteres
                multiline={false} // No permite saltos de línea
              />
              <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={descripcion}
                onChangeText={handleDescripcionChange}
                //onChangeText={setDescripcion}
                multiline
                maxLength={70}
                numberOfLines={4}     
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>






    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible || favoritosModalVisible}
      onRequestClose={() => {
        setModalVisible(false);
        setFavoritosModalVisible(false);
      }}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity onPress={() => {
          setModalVisible(false);
          setFavoritosModalVisible(false);
        }}>
          <Text style={styles.closeButton}>Cerrar</Text>
        </TouchableOpacity>
        {selectedPost && !favoritosModalVisible && (
          <View>
            <Image
              source={{ uri: imagenAmpliada }}
              style={styles.ampliada}
            />
            <View style={styles.postInfoContainer}>
              {/* <Text style={styles.imageName}>{selectedPost._id}</Text> */}
              <Text style={styles.Description}>Descripcion:</Text>
              <Text style={styles.imageDescription}>{selectedPost.descripcion}</Text>
              <TouchableOpacity style={styles.button} onPress={handleEdit}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => handleDelete(selectedPost._id)}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {favoritosModalVisible && (
          <View>
            <Image
              source={{ uri: imagenAmpliada }}
              style={styles.ampliada}
            />
            <View style={styles.postInfoContainer}>
              {/* <Text style={styles.imageName}>{selectedFavorito._id}</Text> */}
              <Text style={styles.Description}>Descripcion:</Text>
              <Text style={styles.imageDescription}>{selectedFavorito.descripcion}</Text>
              <TouchableOpacity style={styles.button} onPress={() => handleRemoveFromFavorites(selectedFavorito._id)}>
                <Text style={styles.buttonText}>Eliminar de Favoritos</Text>
              </TouchableOpacity>
            </View>
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
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#5450b5', // Color de texto deseado
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    borderColor: '#f0f1f1',
    backgroundColor: '#f0f1f1',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
    textAlignVertical: 'center', // Alinea verticalmente en el centro
  },
  saveButton: {
    backgroundColor: '#d8e1fe',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#5450b5',
    fontSize: 18,
    fontWeight: 'bold'
  },
  profileContainer: {
    paddingBottom: 20,
    flexGrow: 1,
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  buttonText: {
    backgroundColor: '#d8e1fe',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    color: '#5450b5',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center', // Alinea el texto horizontalmente en el centro
    textAlignVertical: 'center', // Alinea el texto verticalmente en el centro
  },
  optionsButton: {
    padding: 5,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    flexDirection: 'row',
   // backgroundColor: '#d8e1fe'
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    flexDirection: 'row', // Asegura que el contenido esté en una fila
    justifyContent: 'center', // Alinea el contenido en el centro horizontalmente
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
    alignItems: 'center', // Alinea el contenido en el centro horizontalmente
    textAlign: 'center', // Alinea el texto horizontalmente en el centro
    textAlignVertical: 'center', // Alinea el texto verticalmente en el centro
   
  },  
  Description: {
    fontWeight: 'bold',
    fontSize: 16,
    alignItems: 'center', // Alinea el contenido en el centro horizontalmente
    textAlign: 'center', // Alinea el texto horizontalmente en el centro
    textAlignVertical: 'center', // Alinea el texto verticalmente en el centro
   
  },
  confirmButton: {
    backgroundColor: '#d8e1fe',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    color: '#5450b5',
    alignItems: 'center', // Alinea el contenido en el centro horizontalmente
    justifyContent: 'center', 
  },
  confirmButtonText: {
    color: '#5450b5',
    fontSize: 16,
    fontWeight: 'bold',
    alignItems: 'center', // Alinea el contenido en el centro horizontalmente
    justifyContent: 'center', 
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
    fontWeight: 'bold'
  },
  ampliada: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  editProfileContainer: {
    width: '80%',
    backgroundColor: '#d8e1fe',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  editProfileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  postInfoContainer: {
    backgroundColor: '#f0f1f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#d8e1fe',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    color: '#5450b5',
    fontSize: 16,
    fontWeight: 'bold'
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
  },
  sectionSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 1,
    borderBottomColor: '#d8e1fe',

  },
  sectionContainer: {
    width: '78%', // Porcentaje del ancho del padre
    height: 45, // Altura fija
    padding: "2%",
    marginBottom: 20,
    backgroundColor: '#d8e1fe',
    borderRadius: 10,
    shadowColor: '#5450b5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 3.84,
    color:'#5450b5',
    marginHorizontal: 25,
    flexDirection: 'row', 
    alignItems: 'center',
    
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5450b5',
    textAlign: 'center',
    marginLeft: 20,
    marginHorizontal: 25,
  },
  
});

export default ProfileScreen;
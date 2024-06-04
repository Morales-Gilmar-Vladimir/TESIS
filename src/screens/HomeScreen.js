import React, { useEffect, useState } from 'react';
import { BackHandler, View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import Buscar from '../components/Buscar'; 
import { Picker } from '@react-native-picker/picker';

const HomeScreen = ({ navigation }) => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);
  const [likedPosts, setLikedPosts] = useState([]);
  const [dislikedPosts, setDislikedPosts] = useState([]);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [reporteModalVisible, setReporteModalVisible] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [detalle, setDetalle] = useState('');
  const [imageRatios, setImageRatios] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

// Función para cargar publicaciones, "Me gusta" y favoritos almacenados localmente
  const fetchData = async () => {
    try {
      setLoading(true); // Iniciar estado de carga

      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('https://ropdat.onrender.com/api/publicaciones', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPublicaciones(response.data);

      // Obtener las publicaciones marcadas como favoritas del almacenamiento local
      const favoritosString = await AsyncStorage.getItem('favoritos');
      if (favoritosString) {
        const favoritosArray = JSON.parse(favoritosString);
        setFavoritePosts(favoritosArray);
      }

      const likedPostsString = await AsyncStorage.getItem('likedPosts');
      if (likedPostsString) {
        const likedPostsArray = JSON.parse(likedPostsString);
        setLikedPosts(likedPostsArray);
      }

      const dislikedPostsString = await AsyncStorage.getItem('dislikedPosts');
      if (dislikedPostsString) {
        const dislikedPostsArray = JSON.parse(dislikedPostsString);
        setDislikedPosts(dislikedPostsArray);
      }
    } catch (error) {
      console.error('Error al obtener las publicaciones:', error);
    } finally {
      setLoading(false); // Terminar estado de carga
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const fetchPublicaciones = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('https://ropdat.onrender.com/api/publicaciones', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPublicaciones(response.data);
    } catch (error) {
      console.error('Error al obtener las publicaciones:', error);
    }
  };

  const handleImagePress = (publicacion) => {
    setSelectedPost(publicacion);
    setImagenAmpliada(publicacion.imagen.secure_url);
    setModalVisible(true);
    setIsLiked(likedPosts.includes(publicacion._id));
  };

  const handleLike = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      const response = await axios.put(`https://ropdat.onrender.com/api/publicacion/like/${postId}`, null, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        const updatedLikedPosts = [...likedPosts, postId];
        await AsyncStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));
        setLikedPosts(updatedLikedPosts);

        const updatedPublicaciones = publicaciones.map((publicacion) =>
          publicacion._id === postId ? { ...publicacion, likes: response.data.likes } : publicacion
        );
        setPublicaciones(updatedPublicaciones);

        if (dislikedPosts.includes(postId)) {
          await handleRemoveDislike(postId);
        }
      }
    } catch (error) {
      console.error('Error al dar me gusta:', error);
      Alert.alert('Error', 'Hubo un problema al dar me gusta a esta imagen.');
    }
  };

  const handleRemoveLike = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      const response = await axios.put(`https://ropdat.onrender.com/api/publicacion/likeEliminar/${postId}`, null, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        const updatedLikedPosts = likedPosts.filter((likedPostId) => likedPostId !== postId);
        await AsyncStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));
        setLikedPosts(updatedLikedPosts);

        const updatedPublicaciones = publicaciones.map((publicacion) =>
          publicacion._id === postId ? { ...publicacion, likes: response.data.likes } : publicacion
        );
        setPublicaciones(updatedPublicaciones);
      }
    } catch (error) {
      console.error('Error al quitar me gusta:', error);
      Alert.alert('Error', 'Hubo un problema al quitar me gusta a esta imagen.');
    }
  };

  const handleDislike = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      const response = await axios.put(`https://ropdat.onrender.com/api/publicacion/dilike/${postId}`, null, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        const updatedDislikedPosts = [...dislikedPosts, postId];
        await AsyncStorage.setItem('dislikedPosts', JSON.stringify(updatedDislikedPosts));
        setDislikedPosts(updatedDislikedPosts);

        const updatedPublicaciones = publicaciones.map((publicacion) =>
          publicacion._id === postId ? { ...publicacion, dislikes: response.data.dislikes } : publicacion
        );
        setPublicaciones(updatedPublicaciones);

        if (likedPosts.includes(postId)) {
          await handleRemoveLike(postId);
        }
      }
    } catch (error) {
      console.error('Error al dar dislike:', error);
      Alert.alert('Error', 'Hubo un problema al dar dislike a esta imagen.');
    }
  };

  const handleRemoveDislike = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      const response = await axios.put(`https://ropdat.onrender.com/api/publicacion/dislikeEliminar/${postId}`, null, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {
        const updatedDislikedPosts = dislikedPosts.filter((dislikedPostId) => dislikedPostId !== postId);
        await AsyncStorage.setItem('dislikedPosts', JSON.stringify(updatedDislikedPosts));
        setDislikedPosts(updatedDislikedPosts);

        const updatedPublicaciones = publicaciones.map((publicacion) =>
          publicacion._id === postId ? { ...publicacion, dislikes: response.data.dislikes } : publicacion
        );
        setPublicaciones(updatedPublicaciones);
      }
    } catch (error) {
      console.error('Error al quitar dislike:', error);
      Alert.alert('Error', 'Hubo un problema al quitar dislike a esta imagen.');
    }
  };

  const handleAddToFavorites = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      if (!userToken) {
        console.error('Token de usuario no encontrado en AsyncStorage');
        return;
      }
  
      const response = await axios.post(
        `https://ropdat.onrender.com/api/publicacion/favoritos/${postId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
  
      if (response.status === 200) {
        // Verificar si la publicación ya está en favoritos
        const alreadyInFavorites = favoritePosts.includes(postId);
  
        if (!alreadyInFavorites) {
          // Si no está en favoritos, agregarlo
          const updatedFavoritePosts = [...favoritePosts, postId];
          await AsyncStorage.setItem('favoritos', JSON.stringify(updatedFavoritePosts));
          setFavoritePosts(updatedFavoritePosts);
        } else {
          // Si ya está en favoritos, quitarlo
          const updatedFavoritePosts = favoritePosts.filter((favPostId) => favPostId !== postId);
          await AsyncStorage.setItem('favoritos', JSON.stringify(updatedFavoritePosts));
          setFavoritePosts(updatedFavoritePosts);
        }
  
        // Actualizar selectedPost si es necesario
        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost({ ...selectedPost });
        }
      }
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
      Alert.alert('Aviso', 'Revisa tu lista de favoritos, esta imagen ya puede estar guardada.');
    }
  };
  
  

  const handleReport = () => {
    setReporteModalVisible(true);
  };

  const handleReportSubmit = async () => {
    if (!motivo || !detalle) {
      Alert.alert('Error', 'Debes completar todos los campos.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `https://ropdat.onrender.com/api/publicaciones/reporte/${selectedPost._id}`,
        { motivo, detalle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Alert.alert('Reporte enviado', 'Tu reporte ha sido enviado correctamente.');
        setReporteModalVisible(false);
        setMotivo('');
        setDetalle('');
      }
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      Alert.alert('Error', 'Hubo un problema al enviar tu reporte.');
    }
  };

  const handleReporteClose = () => {
    setReporteModalVisible(false);
    setMotivo('');
    setDetalle('');
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
  

  const navigateToProfile = () => {
    navigation.navigate('Perfil');
    fetchPublicaciones();
  };

  useFocusEffect(
    React.useCallback(() => {
      setSearching();
      const handleBackPress = () => {
        if (backPressCount === 0) {
          setBackPressCount(1);
          setTimeout(() => setBackPressCount(0), 2000);
          return true;
        } else if (backPressCount === 1) {
          BackHandler.exitApp();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    }, [backPressCount])
  );

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favoritesString = await AsyncStorage.getItem('favoritos');
        if (favoritesString) {
          const favoritesArray = JSON.parse(favoritesString);
          setFavoritePosts(favoritesArray);
        }
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
      }
    };
  
    loadFavorites();
  }, []);


  const handleSearch = (searchText) => {
    setSearching(true); // Iniciar búsqueda
    const filteredPosts = publicaciones.filter((publicacion) =>
      publicacion.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
      publicacion.descripcion.toLowerCase().includes(searchText.toLowerCase())
    );
    setPublicacionesFiltradas(filteredPosts);
    setSearching(false); // Terminar búsqueda
  };



  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        
        <View style={styles.gridContainer}>
          {publicaciones.map((publicacion, index) => (
            <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handleImagePress(publicacion)}>
              <Image
                source={{ uri: publicacion.imagen.secure_url }}
                style={[styles.image, { aspectRatio: imageRatios[publicacion._id] || 1 }]}
              />
              <Text style={styles.likesText}>{publicacion.likes} ❤️</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 70 }} />
      </ScrollView>  
      <TouchableOpacity style={styles.searchButton} onPress={() => setSearching(true)}>
        <Icon name="search" size={20} color="black" />
      </TouchableOpacity>
      {searching && (
        <View style={styles.filterContainer}>
          <Buscar buscarPublicaciones={setPublicaciones} />
          <TouchableOpacity style={styles.XButton} onPress={() => setSearching(false)}>
            <Icon name="times" size={20} color="black" />
          </TouchableOpacity>
        </View>
      )} 

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => {
            setModalVisible(false);
           // fetchData();
          }}>
            <Text style={styles.closeButton}>Cerrar</Text>
          </TouchableOpacity>

          {selectedPost && (
            <View style={styles.detailsContainer}>
              <Text style={styles.userName}>Usuario: {selectedPost.nombre}</Text>
              <Text style={styles.imageDescription}>{selectedPost.descripcion}</Text>
            </View>
          )}
          <Image source={{ uri: imagenAmpliada }} style={styles.ampliada} />
          <View style={{ height: 30 }} />
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                if (selectedPost) {
                  if (likedPosts.includes(selectedPost._id)) {
                    await handleRemoveLike(selectedPost._id);
                  } else {
                    await handleLike(selectedPost._id);
                  }
                  setSelectedPost({ ...selectedPost });
                  fetchData();
                }
              }}
            >
              <Icon name="thumbs-up" size={30} color={selectedPost && likedPosts.includes(selectedPost._id) ? 'blue' : 'black'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                if (selectedPost) {
                  if (dislikedPosts.includes(selectedPost._id)) {
                    await handleRemoveDislike(selectedPost._id);
                  } else {
                    await handleDislike(selectedPost._id);
                  }
                  setSelectedPost({ ...selectedPost });
                  fetchData();
                }
              }}
            >
              <Icon name="thumbs-down" size={30} color={selectedPost && dislikedPosts.includes(selectedPost._id) ? 'red' : 'black'} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleReport}>
              <Icon name="exclamation-circle" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                if (selectedPost && selectedPost._id) {
                  await handleAddToFavorites(selectedPost._id);

                  // No es necesario llamar a fetchData aquí
                } else {
                  console.error('No se ha seleccionado ninguna publicación');
                }
              }}
            >
              <Icon
                name="star"
                size={30}
                color={selectedPost && favoritePosts.includes(selectedPost._id) ? 'yellow' : 'black'}
              />
            </TouchableOpacity>


          </View>
        </View>
      </Modal>
      <View style={styles.fixedButtonsContainer}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Icon name="home" size={24} color="black" />
          </TouchableOpacity>
          {/*<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Buscar')}>
            <Icon name="search" size={24} color="black" />
            </TouchableOpacity>*/}
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Publicar')}>
            <Icon name="plus-square" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToProfile}>
            <Icon name="user" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={reporteModalVisible}
        onRequestClose={handleReporteClose}
      >
        <View style={styles.modalContainer}>
        <TextInput
          style={styles.input}
          placeholder="Motivo"
          placeholderTextColor="white"
          value={motivo}
          onChangeText={text => setMotivo(text.replace(/\n/g, '').slice(0, 70))}
          maxLength={70}
          multiline={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Detalle"
          placeholderTextColor="white"
          value={detalle}
          onChangeText={text => setDetalle(text.replace(/\n/g, '').slice(0, 70))}
          maxLength={70}
          multiline={false}
        />
          <TouchableOpacity onPress={handleReportSubmit}>
            <Text style={styles.submitButton}>Enviar Reporte</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReporteClose}>
            <Text style={styles.closeButton}>Cerrar</Text>
          </TouchableOpacity>
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
    marginTop: -0, 
  },
  searchButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  filterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200, // Altura fija para el contenedor del filtro
    backgroundColor: 'white',
    zIndex: 2,
    elevation: 5, // Añade sombra
    paddingHorizontal: 10, // Ajuste de espaciado horizontal
    paddingVertical: 20, // Ajuste de espaciado vertical
    borderBottomWidth: 1, // Añade borde inferior
    borderBottomColor: 'lightgray', // Color del borde inferior
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1, 
    borderRadius: 15,
  },
  likesText: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  likeContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  likeText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5, 
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
    marginBottom: 20,
    marginTop: 20,
  },
  XButton: {
    position: 'absolute',
    top: 10, // Ajustar la posición superior según sea necesario
    right: 10, // Ajustar la posición derecha según sea necesario
    padding: 5,
    backgroundColor: 'transparent', // Fondo transparente para el botón
    borderRadius: 20, // Ajustar el radio de borde según sea necesario
  },
  ampliada: {
    width: '100%',
    height: '30%',
    resizeMode: 'contain',
    borderRadius: 15,
    
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
    elevation: 10,
  },
  button: {
    padding: 10,
  },
  detailsContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  menuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  menuItemText: {
    fontSize: 16,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'gray',
    color: 'white',
  },
  submitButton: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
});

export default HomeScreen;

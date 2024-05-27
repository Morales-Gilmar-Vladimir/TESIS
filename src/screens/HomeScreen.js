import React, { useEffect, useState } from 'react';
import { BackHandler, View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native'; 

const HomeScreen = ({ navigation }) => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);
  const [likedPosts, setLikedPosts] = useState([]); 
  const [isLiked, setIsLiked] = useState(false);
  const [favoritePosts, setFavoritePosts] = useState([]);
// Función para cargar publicaciones, "Me gusta" y favoritos almacenados localmente
const fetchData = async () => {
  try {
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

    // Obtener las publicaciones marcadas como "Me gusta" del almacenamiento local
    const likedPostsString = await AsyncStorage.getItem('likedPosts');
    if (likedPostsString) {
      const likedPostsArray = JSON.parse(likedPostsString);
      setLikedPosts(likedPostsArray);
    }
  } catch (error) {
    console.error('Error al obtener las publicaciones:', error);
  }
};


// Llama a fetchData cuando se monta el componente
useEffect(() => {
  fetchData();
}, []);


  const fetchPublicaciones = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Obtener el token del almacenamiento
      const response = await axios.get('https://ropdat.onrender.com/api/publicaciones', {
        headers: {
          Authorization: `Bearer ${token}`, // Incluir el token en el encabezado de la solicitud
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


  // Función para manejar el evento de dar "Me gusta" a una publicación
  const handleLike = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('_id');
  
      const response = await axios.put(`https://ropdat.onrender.com/api/publicacion/like/${postId}`, null, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
  
      if (response.status === 200) {
        // Almacenar la publicación marcada como "Me gusta" en el almacenamiento local
        const updatedLikedPosts = [...likedPosts, postId];
        await AsyncStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));

        const updatedPublicaciones = publicaciones.map((publicacion) =>
          publicacion._id === postId ? { ...publicacion, likes: response.data.likes } : publicacion
        );
        setPublicaciones(updatedPublicaciones);

         // Recargar las publicaciones actualizadas desde la API
         fetchPublicaciones();

      }
    } catch (error) {
      console.error('Error al dar me gusta:', error);
      Alert.alert('Error', 'Hubo un problema al dar me gusta a esta imagen.');
    }
  };
  const QuitarLike = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      const response = await axios.put(`https://ropdat.onrender.com/api/publicacion/likeEliminar/${postId}`, null, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
  
      if (response.status === 200) {
        // Eliminar la publicación marcada como "Me gusta" del almacenamiento local
        const updatedLikedPosts = likedPosts.filter((likedPostId) => likedPostId !== postId);
        await AsyncStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));
  
        // Actualizar solo la publicación afectada
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
  
  
  const handleDislike = () => {
    Alert.alert('¡No me gusta!', 'No me gusta.');
  };

  

  const handleReport = () => {
    Alert.alert('¡Imagen reportada!', 'Has reportado esta imagen.');
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
        // Obtener los favoritos actuales del AsyncStorage
        const favoritosString = await AsyncStorage.getItem('favoritos');
        let favoritosArray = [];
        if (favoritosString) {
          favoritosArray = JSON.parse(favoritosString);
        }
        // Agregar el nuevo favorito a la lista de favoritos
        favoritosArray.push(postId);
        // Guardar la lista actualizada de favoritos en AsyncStorage
        await AsyncStorage.setItem('favoritos', JSON.stringify(favoritosArray));
  
        setFavoritePosts(favoritosArray); // Actualizar el estado de favoritePosts
        setIsLiked(true); // Actualizar el estado de isLiked
      }
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
      Alert.alert('Error', 'Hubo un problema al agregar esta imagen a favoritos.');
    }
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
             <Text style={styles.likesText}>{publicacion.likes} ❤️</Text>
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
        <TouchableOpacity onPress={() => {
            setModalVisible(false);
            fetchData();
          }}>
            <Text style={styles.closeButton}>Cerrar</Text>
          </TouchableOpacity>

          {selectedPost && (
            <View style={styles.detailsContainer}>
              <Text style={styles.userName}>Usuario: {selectedPost.nombre}</Text>
              <Text style={styles.imageDescription}>{selectedPost.descripcion}</Text>
            </View>
          )}
          <Image
            source={{ uri: imagenAmpliada }}
            style={styles.ampliada}
          />
          <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              if (selectedPost) {
                if (likedPosts.includes(selectedPost._id)) {
                  await QuitarLike(selectedPost._id);
                  setSelectedPost({ ...selectedPost });
                  fetchData();
                } else {
                  await handleLike(selectedPost._id);
                  setSelectedPost({ ...selectedPost }); 
                  fetchData();
                }
              }
            }}
          >
            <Icon name="thumbs-up" size={30} color={selectedPost && likedPosts.includes(selectedPost._id) ? 'blue' : 'black'} />
          </TouchableOpacity>

          
            <TouchableOpacity style={styles.button} onPress={handleDislike}>
              <Icon name="thumbs-down" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleReport}>
              <Icon name="exclamation-circle" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                if (selectedPost) {
                  if (favoritePosts.includes(selectedPost._id)) {
                    setSelectedPost({ ...selectedPost }); 
                    fetchData();
                  } else {
                    await handleAddToFavorites(selectedPost._id);
                    setSelectedPost({ ...selectedPost }); 
                    fetchData();
                  }
                }
              }}
            >
              <Icon name="star" size={30} color={selectedPost && favoritePosts.includes(selectedPost._id) ? 'yellow' : 'black'} />
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 0.5,
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


import React, { useEffect, useState } from 'react';
import { BackHandler, View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Modal, Alert, TextInput, ActivityIndicator} from 'react-native';
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
  const [cuentaRestringida, setCuentaRestringida] = useState(false); // Estado para verificar si la cuenta está restringida
  const [cuentaBloqueada, setCuentaBloqueada] = useState(false); // Estado para verificar cuenta bloqueada



// Función para cargar publicaciones, "Me gusta" y favoritos almacenados localmente
  const fetchData = async () => {
    setLoading(true);
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
    setCuentaBloqueada(false);
    fetchData();
    setModalVisible(false);
    setLoading(false);
  }, []);

  const fetchPublicaciones = async () => {
    setLoading(true);
    try {
      
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('https://ropdat.onrender.com/api/publicaciones', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      
      if (response.status === 200) {
        // Verificar si la cuenta está bloqueada en base a la respuesta de las publicaciones
        if (response.data.msg === "Usuario Bloqueado") {
          // Muestra la alerta correspondiente si la cuenta está restringida
          Alert.alert('Cuenta Bloqueada', 'Tu cuenta está bloqueada y no podras acceder a ella.', [
            { text: 'OK', onPress: handleLogout }
          ]);
          setCuentaBloqueada(true); // Establecer el estado de cuenta bloqueada a true
          return; // Detener la ejecución de la función si la cuenta está restringida
        }
        // Si el usuario no está bloqueado, establecer las publicaciones en el estado
        setPublicaciones(response.data);
      }

    } catch (error) {
      console.error('Error al obtener las publicaciones:', error);
    }
    setLoading(false);
  };

  const [userData, setUserData] = useState(null);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('_id');
      setUserData(null);
      setPublicaciones([]);
      //setSelectedImageUri(null);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };


  const handleImagePress = (publicacion) => {
    setSelectedPost(publicacion);
    setImagenAmpliada(publicacion.imagen.secure_url);
    setModalVisible(true);
    setIsLiked(likedPosts.includes(publicacion._id));
  };

  const handleLike = async (postId) => {
    setLoading(true);
  try {
    const userToken = await AsyncStorage.getItem('token');
    
    const response = await axios.put(`https://ropdat.onrender.com/api/publicacion/like/${postId}`, null, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (response.status === 200) {
      // Verificar si la cuenta está restringida
      if (response.data.msg === "Su cuenta esta restringida") {
        // Muestra la alerta correspondiente si la cuenta está restringida       
        Alert.alert('Cuenta restringida', 'Tu cuenta está restringida y no puedes interactuar.');
        return; // Detener la ejecución de la función si la cuenta está restringida
      }

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
  setLoading(false);
};

  
  

const handleRemoveLike = async (postId) => {
  setLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('token');
      const response = await axios.put(`https://ropdat.onrender.com/api/publicacion/likeEliminar/${postId}`, null, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {

        // Verificar si la cuenta está restringida
        if (response.data.msg === "Su cuenta esta restringida") {
          // Muestra la alerta correspondiente si la cuenta está restringida       
          Alert.alert('Cuenta restringida', 'Tu cuenta está restringida y no puedes interactuar.');
          return; // Detener la ejecución de la función si la cuenta está restringida
        }

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
    setLoading(false);
};

  const handleDislike = async (postId) => {
    setLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('token');
      const response = await axios.put(`https://ropdat.onrender.com/api/publicacion/dilike/${postId}`, null, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) {

        if (response.data.msg === "Su cuenta esta restringida") {
          // Muestra la alerta correspondiente si la cuenta está restringida       
          Alert.alert('Cuenta restringida', 'Tu cuenta está restringida y no puedes interactuar.');
          return; // Detener la ejecución de la función si la cuenta está restringida
        }

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
        if (response.data.msg === "Su cuenta esta restringida") {
          // Muestra la alerta correspondiente si la cuenta está restringida       
          Alert.alert('Cuenta restringida', 'Tu cuenta está restringida y no puedes interactuar.');
          return; // Detener la ejecución de la función si la cuenta está restringida
        }

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
    setLoading(false);
  };

  const handleAddToFavorites = async (postId) => {
    setLoading(true);
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

        if (response.data.msg === "Su cuenta esta restringida") {
          // Muestra la alerta correspondiente si la cuenta está restringida       
          Alert.alert('Cuenta restringida', 'Tu cuenta está restringida y no puedes interactuar.');
          return; // Detener la ejecución de la función si la cuenta está restringida
        }

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
    setLoading(false);
  };
  
  

  const handleReport = () => {
    setReporteModalVisible(true);
  };

  const handleReportSubmit = async () => {
    if (!motivo || !detalle) {
      Alert.alert('Error', 'Debes completar todos los campos.');
      return;
    }
    setLoading(true);
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
        if (response.data.msg === "Su cuenta esta restringida") {
          // Muestra la alerta correspondiente si la cuenta está restringida       
          Alert.alert('Cuenta restringida', 'Tu cuenta está restringida y no puedes interactuar.');
          return; // Detener la ejecución de la función si la cuenta está restringida
        }

        Alert.alert('Reporte enviado', 'Tu reporte ha sido enviado correctamente.');
        setReporteModalVisible(false);
        setMotivo('');
        setDetalle('');
      }
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      Alert.alert('Error', 'Hubo un problema al enviar tu reporte.');
    }
    setLoading(false);
  };

  const handleReporteClose = () => {
    setReporteModalVisible(false);
    setMotivo('');
    setDetalle('');
  };

useEffect(() => {
  fetchData();
    fetchPublicaciones();
  }, []);

  useEffect(() => {
    fetchData();
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
      setLoading(false);
      fetchData();
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

  const cerrarBusqueda = () => {
    setSearching(false);
  };

  const handlePostPress = (postId, userId) => {
    navigation.navigate('Perfil_Usuario', { postId, userId });
  };



  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
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
        </View>{loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
        <View style={{ height: 70 }} />
      </ScrollView>  
      
      <TouchableOpacity style={styles.clearButton} onPress={fetchData}>
          <Text style={styles.buttonText}>Limpiar Filtro</Text>
        </TouchableOpacity>
      <TouchableOpacity style={styles.searchButton} onPress={() => setSearching(true)}>
        <Icon name="search" size={20} color="#5450b5" />
      </TouchableOpacity>
      {searching && (
        <View style={styles.filterContainer}>
          <Buscar buscarPublicaciones={setPublicaciones} onSearchComplete={cerrarBusqueda}  />
          <TouchableOpacity style={styles.XButton} onPress={cerrarBusqueda}>
            <Icon name="times" size={20} color="#5450b5" />
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
             <Icon name="times" size={40} color="#5450b5" />
             <View style={{ height: 30 }} />
          </TouchableOpacity>

          {selectedPost && (
            <View style={styles.detailsContainer}>
            <TouchableOpacity onPress={() => {handlePostPress(selectedPost._id, selectedPost.usuarioID)
              setModalVisible(false);}
            }>
                  <Text style={styles.submitButton}>{selectedPost.nombre}</Text>
            </TouchableOpacity>
      
              {/* <Text style={styles.userName}>{selectedPost.nombre}</Text> */}
              
              {/* <Text style={styles.imageDescription}>{selectedPost.descripcion}</Text> */}
            </View>

          )}{loading && ( // Mostrar indicador de carga si loading es true
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#5450b5" />
            </View>
          )}

          <Image source={{ uri: imagenAmpliada }} style={styles.ampliada} />
          
          <View style={{ height: 30 }} />
          <Text style={styles.submitButton}>Detalles Publicacion</Text>
        
          {selectedPost && (
            
          <View style={styles.postInfoContainer}>
              {/* <Text style={styles.imageName}>{selectedFavorito._id}</Text> */}
              <Text style={styles.Description}>Descripcion:</Text>
              <Text style={styles.imageDescription}>{selectedPost.descripcion}</Text>
              <Text style={styles.Description}>Temporada:</Text>
              <Text style={styles.imageDescription}>{selectedPost.estilo.temporada}</Text>
              <Text style={styles.Description}>Epoca:</Text>
              <Text style={styles.imageDescription}>{selectedPost.estilo.epoca}</Text>
              <Text style={styles.Description}>Estilo:</Text>
              <Text style={styles.imageDescription}>{selectedPost.estilo.estiloG}</Text>
            </View>
           )}
           <View style={{ height: 10 }} />

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
              <Icon name="thumbs-up" size={30} color={selectedPost && likedPosts.includes(selectedPost._id) ? 'blue' : '#5450b5'} />
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
              <Icon name="thumbs-down" size={30} color={selectedPost && dislikedPosts.includes(selectedPost._id) ? 'red' : '#5450b5'} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleReport}>
              <Icon name="warning" size={30} color="#5450b5" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                if (selectedPost && selectedPost._id) {
                  await handleAddToFavorites(selectedPost._id);
                } else {
                  console.error('No se ha seleccionado ninguna publicación');
                }
              }}
            >
              <Icon
                name="star"
                size={30}
                color={selectedPost && favoritePosts.includes(selectedPost._id) ? 'yellow' : '#5450b5'}
              />
            </TouchableOpacity>


          </View>
        </View>
      </Modal>
      <View style={styles.fixedButtonsContainer}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Icon name="home" size={24} color="#5450b5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Publicar')}>
            <Icon name="plus-square" size={24} color="#5450b5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Notificaciones')}>
            <Icon name="bell" size={24} color="#5450b5" />
            </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={navigateToProfile}>
            <Icon name="user" size={24} color="#5450b5" />
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
                <Text style={styles.reportModalTitle}>Reportar Publicación</Text>
               
                <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={motivo}
                  onValueChange={(itemValue) => setMotivo(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccionar motivo" value="" />
                  <Picker.Item label="Contenido inapropiado" value="Contenido inapropiado" />
                  <Picker.Item label="Spam" value="Spam" />
                  <Picker.Item label="Acoso" value="Acoso" />
                  <Picker.Item label="Otro" value="Otro" />
                </Picker>
                </View>
                <View style={{ height: 15}} />

            
                <TextInput
                  style={styles.input}
                  placeholder="Detalle"
                  value={detalle}
                  onChangeText={text => setDetalle(text.replace(/\n/g, '').slice(0, 70))}
                  maxLength={70}
                  multiline={false}
                />

                   <TouchableOpacity onPress={handleReportSubmit}>
                    <Text style={styles.submitButton}>Enviar Reporte</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleReporteClose}>
                    <Text style={styles.closeButton}>Cancelar</Text>
                  </TouchableOpacity>
              </View>
              {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
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
    backgroundColor: '#fff',
  },
  postInfoContainer: {
    backgroundColor: '#f0f1f1',
    paddingHorizontal: 70,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  imageDescription: {
    fontSize: 16,
    alignItems: 'center', // Alinea el contenido en el centro horizontalmente
    textAlign: 'center', // Alinea el texto horizontalmente en el centro
    textAlignVertical: 'center', // Alinea el texto verticalmente en el centro
   color: "black"
  },  
  Description: {
    fontWeight: 'bold',
    fontSize: 19,
    alignItems: 'center', // Alinea el contenido en el centro horizontalmente
    textAlign: 'center', // Alinea el texto horizontalmente en el centro
    textAlignVertical: 'center', // Alinea el texto verticalmente en el centro
    color: '#5450b5'
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    left: 10, // Alinear a la izquierda
    zIndex: 1,
    //padding: 1,
    //backgroundColor: '#d8e1fe',
    alignItems: 'center',
    color: '#5450b5',
   // borderRadius: 10, // Añadir bordes
    //borderWidth: 1, // Añadir bordes
    //borderColor: '#d8e1fe', // Añadir bordes
  },
  picker: {
    height: 50, // Aumentar la altura
    width: '100%',
    backgroundColor: '#f0f1f1',
    alignItems: 'center',
    justifyContent: 'center', 
    color: '#7c7c7c',
    fontWeight: 'bold',
    fontSize: 18, // Aumentar el tamaño de fuente
  },
  reportModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "white"
  },
  buttonText: {
    fontSize: 15,
    color: '#5450b5',
    fontWeight: 'bold',
    
  },

  pickerContainer: {
  width: '80%',
      backgroundColor: '#f0f1f1',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ccc',
      overflow: 'hidden',
      alignItems: 'center', // Centra horizontalmente
      justifyContent: 'center', // Centra verticalmente
      marginBottom: 5,
      color: '#7c7c7c',
      fontWeight: 'bold'
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Color de fondo semi-transparente
    zIndex: 9999, 
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
    width: 360, // Tamaño fijo para el ancho del input
    height: 50, // Tamaño fijo para la altura del input
    borderColor: '#f0f1f1',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#f0f1f1',
    color: '#7c7c7c',
    //fontWeight: 'bold',
    fontSize: 17
  },
  submitButton: {
    color: '#5450b5', // Color del texto
    fontSize: 16,   // Tamaño de la fuente
    fontWeight: 'bold', // Grosor de la fuente
    backgroundColor: '#d8e1fe', // Color de fondo del texto
    paddingVertical: 10, // Espaciado vertical dentro del texto
    paddingHorizontal: 20, // Espaciado horizontal dentro del texto
    borderRadius: 10, // Radio de borde para redondear las esquinas
  },
});

export default HomeScreen;

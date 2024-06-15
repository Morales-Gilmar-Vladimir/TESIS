import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image,Button  ,TextInput, StyleSheet, TouchableOpacity, BackHandler, Modal, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';


const Perfil_Usuario = ({ navigation, route }) => {
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
    const [favoritosModalVisible, setFavoritosModalVisible] = useState(false);
    const [selectedFavorito, setSelectedFavorito] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    useFocusEffect(
        React.useCallback(() => {
         
          //fetchUserData();
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
           setCurrentPassword('');
           setNewPassword('');
           setConfirmNewPassword('');
           setLoading(false);
     
           // Cargar la información del usuario al enfocar la pantalla
          // fetchUserData();
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
          //fetchUserData();
        };
      
        const unsubscribe = navigation.addListener('focus', handleFocus);
      
        return () => {
          backHandler.remove();
          unsubscribe();
        };
    
    
      }, [navigation, route.params]);
      
      useEffect(() => {
        setLoading(true);
        const fetchUserData = async () => {
          setLoading(true);
          try {
            const userToken = await AsyncStorage.getItem('token');
            const { userId } = route.params; // Obtener el usuarioID de los parámetros de navegación
    
            if (!userToken || !userId) {
              console.error('Token de usuario o ID de usuario no encontrado');
              return;
            }
    
            const response = await axios.get(`https://ropdat.onrender.com/api/usuario/${userId}`, {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            });
    
            if (!response.data || !response.data.UsuarioBDD) {
              console.error('No se recibieron datos de usuario válidos desde la API');
              return;
            }
    
            setUserData(response.data.UsuarioBDD);
            setPublicaciones(response.data.publicacionBDD);
      
            console.log('Datos del usuario cargados correctamente');
          } catch (error) {
            //console.error('Error al obtener la información del perfil:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserData();
      }, [route.params]);


  const handleImagePress = (url, post) => {
    setSelectedPost(post);
    setImagenAmpliada(url);
    setModalVisible(true);
  };


  const handleSectionChange = (section) => {
    setSection(section);
  };




  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.profileContainer}>
      {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
      <View style={styles.header}>
      </View>
      {userData && (
        <>
         <View style={styles.profilePictureContainer}>
            {loadingImage ? (
                <Text>Cargando imagen...</Text>
            ) : (
                <>
                {userData && userData.fotoperfil ? (
                    <Image source={{ uri: userData.fotoperfil.secure_url }} style={styles.profilePicture} />
                ) : (
                    <Icon name="user-circle" size={150} color="#ccc" />
                )}
                </>
            )}
            </View>

          <View style={styles.userDataContainer}>
              <Text style={styles.username}>{userData.nombre}</Text>
              <Text style={styles.description}>{userData.descripcion}</Text>
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
        <TouchableOpacity
          onPress={() => {
            setModalVisible(false);
            setEditProfileModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
          }}
        >
        </TouchableOpacity>
        {editProfileModalVisible && (
          <View style={styles.editProfileContainer}>
            <Text style={styles.editProfileTitle}>Editar Perfil</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nombre}
              onChangeText={(text) => setNombre(text.slice(0, 15))}
              maxLength={15}
              multiline={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              value={apellido}
              onChangeText={(text) => setApellido(text.slice(0, 15))}
              maxLength={15}
              multiline={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={descripcion}
              onChangeText={handleDescripcionChange}
              multiline
              maxLength={70}
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>

          </View>
        )}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5450b5" />
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
           <Icon name="times" size={40} color="#5450b5" />
        </TouchableOpacity>
        {selectedPost && !favoritosModalVisible && (
          <View>
            <Image
              source={{ uri: imagenAmpliada }}
              style={styles.ampliada}
            />
            
             <Text style={styles.submitButton}>Detalles Publicacion</Text>
            <View style={styles.postInfoContainer}>
              {/* <Text style={styles.imageName}>{selectedPost._id}</Text> */}
              <Text style={styles.Description}>Descripcion:</Text>
              <Text style={styles.imageDescription}>{selectedPost.descripcion}</Text>
              <Text style={styles.Description}>Temporada:</Text>
              <Text style={styles.imageDescription}>{selectedPost.estilo.temporada}</Text>
              <Text style={styles.Description}>Epoca:</Text>
              <Text style={styles.imageDescription}>{selectedPost.estilo.epoca}</Text>
              <Text style={styles.Description}>Estilo:</Text>
              <Text style={styles.imageDescription}>{selectedPost.estilo.estiloG}</Text>
            </View>
          </View>
        )}
        {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
        {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
      </View>
    </Modal>
  </View>
);
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      
    },
    submitButton: {
        color: '#5450b5', // Color del texto
        fontSize: 16,   // Tamaño de la fuente
        fontWeight: 'bold', // Grosor de la fuente
        backgroundColor: '#d8e1fe', // Color de fondo del texto
        paddingVertical: 10, // Espaciado vertical dentro del texto
        paddingHorizontal: 20, // Espaciado horizontal dentro del texto
        borderRadius: 10, // Radio de borde para redondear las esquinas
        alignContent:'center',
        alignItems:"center",
        textAlign:"center"
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
        fontSize: 18,
        alignItems: 'center', // Alinea el contenido en el centro horizontalmente
        textAlign: 'center', // Alinea el texto horizontalmente en el centro
        textAlignVertical: 'center', // Alinea el texto verticalmente en el centro
        color: '#5450b5'
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
  

export default Perfil_Usuario;

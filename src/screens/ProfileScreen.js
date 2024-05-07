import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImagePicker from 'react-native-image-picker';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Permiso de acceso a la galería',
            message: 'La aplicación necesita acceso a tu galería de imágenes.',
            buttonPositive: 'Aceptar',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso de acceso a la galería concedido');
          return true;
        } else {
          console.log('Permiso de acceso a la galería denegado');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; // Para iOS, no es necesario solicitar permisos explícitamente
    }
  };

  const selectProfileImage = async () => {
    const permissionGranted = await requestCameraPermission();
    if (permissionGranted) {
      ImagePicker.launchImageLibrary({ mediaType: 'photo' }, response => {
        if (response.didCancel) {
          console.log('La selección de la imagen fue cancelada');
        } else if (response.error) {
          console.log('Error al seleccionar la imagen:', response.error);
        } else {
          setProfileImage(response.uri);
        }
      });
    } else {
      console.log('Permiso de acceso a la galería no concedido');
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
  
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.profileContainer}>
        {userData && (
          <>
            <TouchableOpacity style={styles.profilePictureContainer} onPress={selectProfileImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profilePicture} />
              ) : (
                <Icon name="user-circle" size={150} color="#ccc" />
              )}
            </TouchableOpacity>
            <View style={styles.userDataContainer}>
              <Text style={styles.userDataLabel}>Nombre:</Text>
              <Text style={styles.userData}>{userData.nombre}</Text>
              <Text style={styles.userDataLabel}>Apellido:</Text>
              <Text style={styles.userData}>{userData.apellido}</Text>
              <Text style={styles.userDataLabel}>Correo electrónico:</Text>
              <Text style={styles.userData}>{userData.email}</Text>
              <Text style={styles.userDataLabel}>Fecha de nacimiento:</Text>
              <Text style={styles.userData}>{userData.fechaNacimiento}</Text>
            </View>
            <Text style={styles.username}>{userData.nombre}</Text>
            <Text style={styles.description}>{userData.description}</Text>
          </>
        )}
        <View style={styles.postsContainer}>
          {userPosts.map((post, index) => (
            <View key={index} style={styles.postItem}>
              <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
              <Text style={styles.postDescription}>{post.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Publish')}>
          <Icon name="plus-square" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
          <Icon name="user" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
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
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  userDataContainer: {
    marginBottom: 20,
  },
  userDataLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userData: {
    fontSize: 16,
    marginBottom: 10,
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
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    height: 50,
    paddingHorizontal: 20,
  },
  logoutButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});

export default ProfileScreen;

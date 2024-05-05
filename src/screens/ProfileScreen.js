import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

// Función para obtener la información del perfil y las publicaciones del usuario
const fetchUserData = async () => {
    try {
      // Obtener el token de autenticación del usuario almacenado en AsyncStorage
      const userToken = await AsyncStorage.getItem('token');
      
      // Obtener el _id del usuario almacenado en AsyncStorage
      const userId = await AsyncStorage.getItem('_id');
      
      // Realizar una llamada a tu API para obtener los datos del usuario utilizando el _id del usuario
      const responseUserData = await axios.get(`https://ropdat.onrender.com/api/usuario/${userId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
  
      // Obtener los datos del usuario de la respuesta de la API
      const userData = responseUserData.data;
  
      // Actualizar el estado con los datos obtenidos del usuario
      setUserData(userData);
    } catch (error) {
      console.error('Error al obtener la información del perfil:', error);
    }
  };
  
  
  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      // Eliminar el token de autenticación del usuario de AsyncStorage
      await AsyncStorage.removeItem('token');
      // Redirigir al usuario a la pantalla de inicio de sesión
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Llamar a la función para obtener la información del perfil cuando se monta el componente
  useEffect(() => {
    fetchUserData();
  }, []);

  // Renderizar la pantalla del perfil
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.profileContainer}>
        {userData && (
          <>
            <Image source={{ uri: userData.profilePicture }} style={styles.profilePicture} />
            <Text style={styles.username}>{userData.nombre}</Text>
            <Text style={styles.description}>{userData.description}</Text>
            <Text style={styles.email}>{userData.email}</Text>
            {/* Aquí puedes agregar más campos de datos del usuario según tus necesidades */}
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
      {/* Barra de navegación inferior */}
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
      {/* Barra de cierre de sesión superior */}
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
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    marginTop: 10,
    color: 'gray',
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

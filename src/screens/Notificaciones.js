import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, BackHandler, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Notificaciones = ({ navigation }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cuentaBloqueada, setCuentaBloqueada] = useState(false); // Estado para verificar cuenta bloqueada

  useFocusEffect(
    React.useCallback(() => {
      const fetchNotificaciones = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('token');
          const userId = await AsyncStorage.getItem('_id');
          const response = await axios.get(`https://ropdat.onrender.com/api/usuario/notificaciones/${userId}`, {
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
           
            // Ordenar las notificaciones para mostrar las más recientes primero
            const sortedNotificaciones = response.data.reverse();
            setNotificaciones(sortedNotificaciones);
          }
        } catch (error) {
          console.error('Error al obtener notificaciones:', error);
        }
        setLoading(false);
      };

      fetchNotificaciones();

      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        navigation.navigate('Home');
        return true;
      });

      return () => backHandler.remove();
    }, [navigation])
  );

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
  
  const renderItem = ({ item }) => {
    if (item.tipo === 'Noti') {
      return (
        <View style={styles.notificationItem}>
          <Image source={{ uri: item.perfil }} style={styles.userImage} />
          <Text style={styles.notificationText}>
            {item.nombreE} le dio me gusta a tu publicación
          </Text>
          <Image source={{ uri: item.urlPu }} style={styles.postImage} />
        </View>
      );
    } else if (item.tipo === 'restriccion') {
      return (
        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>
            {item.nombreE} reportó un día restringido: {item.fechaRestriccion}
          </Text>
        </View>
      );
    } else if (item.tipo === 'Alerta') {
      return (
        <View style={styles.notificationItem}>
          <Icon name="exclamation-triangle" size={24} color="#5450b5" style={styles.icon} />
          <Text style={styles.notificationText}>
            Aviso!! {item.mensaje}, se informará en su correo electrónico cuando la cuenta
             deje de estar restringida.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.notificationList}>
          {notificaciones.length === 0 ? (
            <Text style={styles.noNotificationsText}>No hay notificaciones</Text>
          ) : (
            notificaciones.map((item, index) => (
              <View key={index}>
                {renderItem({ item })}
              </View>
            ))
          )}
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
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
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Perfil')}>
            <Icon name="user" size={24} color="#5450b5" />
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
    marginTop: -0, 
    backgroundColor: '#F3F2FF',
  },
  icon: {
    marginRight: 10, // Espacio entre el icono y el texto
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 9999,
  },
  notificationList: {
    marginBottom: 20,
    width: '100%', // Ancho fijo al 100% del contenedor padre
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 20, 
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    elevation: 2,
    maxWidth: '90%',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
    marginLeft: 5,
    marginRight: 5,
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#5450b5',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold'
  },
  username: {
    fontWeight: 'bold',
    color: '#000',
  },
  postImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginLeft: 'auto',
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
});

export default Notificaciones;

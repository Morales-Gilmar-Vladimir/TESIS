import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {[...Array(30).keys()].map((index) => (
        <View key={index} style={styles.gridItem}>
          <Image
            source={{ uri: `https://picsum.photos/230/${Math.floor(Math.random() * 500) + 100}` }}
            style={styles.image}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  gridItem: {
    width: '48%', // Adjust the width as needed
    marginBottom: 20,
  },
  image: {
    width: '100%',
    aspectRatio: 1, // For square images
    borderRadius: 15,
  },
});

export default HomeScreen;


{/*import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Button } from 'react-native';

const HomeScreen = ({ navigation, isLoggedIn }) => {
  const handleLogout = () => {
    navigation.navigate('Login');
  };

  // Verificar si el usuario está autenticado antes de mostrar las imágenes
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text>Debe iniciar sesión para ver las imágenes.</Text>
        <Button title="Iniciar sesión" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {[...Array(30).keys()].map((index) => (
        <View key={index} style={styles.gridItem}>
          <Image
            source={{ uri: `https://picsum.photos/230/${Math.floor(Math.random() * 500) + 100}` }}
            style={styles.image}
          />
        </View>
      ))}
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gridItem: {
    width: '48%',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 15,
  },
});

export default HomeScreen;*/}

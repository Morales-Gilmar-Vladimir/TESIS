import React, { useState, useEffect } from 'react';
import { View, Text, TextInput,TouchableOpacity,Image, Button, StyleSheet, Alert, BackHandler, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const EditarPublicacion = ({ route, navigation }) => {
  const { postId } = route.params;
  const [descripcion, setDescripcion] = useState('');
  const [temporada, setTemporada] = useState('');
  const [epoca, setEpoca] = useState('');
  const [genero, setGenero] = useState('');
  const [estilo, setEstilo] = useState('');
  const [anio, setAnio] = useState('');
  const [estiloG, setEstiloG] = useState('');
  const [loading, setLoading] = useState(true);
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const userToken = await AsyncStorage.getItem('token');
        const response = await axios.get(`https://ropdat.onrender.com/api/publicar/${postId}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        console.log('Datos de la publicación:', response.data);

        if (response.status === 200 && response.data) {
          const { descripcion, estilo, imagen } = response.data;
          setDescripcion(descripcion);
          setTemporada(estilo.temporada);
          setEpoca(estilo.epoca);
          setGenero(estilo.genero);
          setEstilo(estilo);
          setAnio(estilo.epoca);
          setEstiloG(estilo.estiloG);
          setFoto(imagen.secure_url);
        } else {
          Alert.alert('Error', 'No se pudo cargar la publicación');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar la publicación:', error);
        Alert.alert('Error', 'Se produjo un error al cargar la publicación');
        setLoading(false);
      }
    };

    const handleBackPress = () => {
      if (navigation.isFocused()) {
        navigation.navigate('Perfil');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    fetchPostData(); 

    return () => backHandler.remove();
  }, [navigation, postId]);
  const handleUpdate = async () => {
    try {
      const userToken = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `https://ropdat.onrender.com/api/publicar/actualizar/${postId}`,
        { descripcion, temporada, epoca, genero, estilo, anio, estiloG },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
  
      if (response.status === 200) {
        Alert.alert('Publicación actualizada', 'La publicación ha sido actualizada correctamente', [
          {
            text: 'Aceptar',
            onPress: () => navigation.navigate('Perfil'), 
          },
        ]);
      } else {
        throw new Error('Error al actualizar la publicación');
      }
    } catch (error) {
      console.error('Error al actualizar la publicación:', error);
      Alert.alert(
        'Error',
        'Se produjo un error al actualizar la publicación. Por favor, inténtalo de nuevo más tarde.'
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const handleDescriptionChange = (text) => {
    const newText = text.slice(0, 70); 
    const lines = newText.split('\n');
    if (lines.length > 2) {
      setDescripcion(lines.slice(0, 2).join('\n'));
    } else {
      setDescripcion(newText);
    }
  };
  
  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
    <View style={styles.imageContainer}>
    {foto && <Image source={{ uri: foto }} style={styles.image} />}
    </View>
    <View style={{ height: 50 }} />
    <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={handleDescriptionChange}
        maxLength={70}
        multiline
        numberOfLines={4}
      />
      <Picker
          style={styles.input}
          selectedValue={temporada}
          onValueChange={value => setTemporada(value)}
        >
          <Picker.Item label="Temporada 1" value="Temporada 1" />
          <Picker.Item label="Temporada 2" value="Temporada 2" />
          <Picker.Item label="Temporada 3" value="Temporada 3" />
        </Picker>
        <Picker
          style={styles.input}
          selectedValue={epoca}
          onValueChange={value => setEpoca(value)}
        >
          <Picker.Item label="Época 1" value="Época 1" />
          <Picker.Item label="Época 2" value="Época 2" />
          <Picker.Item label="Época 3" value="Época 3" />
        </Picker>
        <Picker
          style={styles.input}
          selectedValue={genero}
          onValueChange={value => setGenero(value)}
        >
          <Picker.Item label="Masculino" value="Masculino" />
          <Picker.Item label="Femenino" value="Femenino" />
        </Picker>
        <Picker
          style={styles.input}
          selectedValue={estiloG}
          onValueChange={value => setEstiloG(value)}
        >
          <Picker.Item label="Casual" value="Casual" />
          <Picker.Item label="Formal" value="Formal" />
          <Picker.Item label="Otros" value="Otros" />
        </Picker>
      <Button title="Actualizar Publicación" onPress={handleUpdate} />
    </ScrollView>
  </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    input: {
      width: '100%',
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    imageContainer: {
      alignItems: 'center',
    },
    image: {
        width: 280,
        height: 300,
        borderRadius: 10,
    },
  });
  


export default EditarPublicacion;

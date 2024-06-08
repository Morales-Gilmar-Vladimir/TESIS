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
  const [showTemporadaSelectOption, setShowTemporadaSelectOption] = useState(true);
  const [showEpocaSelectOption, setShowEpocaSelectOption] = useState(true);
  const [showGeneroSelectOption, setShowGeneroSelectOption] = useState(true);
  const [showEstiloGSelectOption, setShowEstiloGSelectOption] = useState(true);

  

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
  
  const handleTemporadaChange = (value) => {
    setTemporada(value);
    setShowTemporadaSelectOption(value === null); // Mostrar el mensaje "Seleccione una temporada" solo si la temporada es null
    setShowEpocaSelectOption(true); // Mostrar siempre el mensaje "Seleccione una época" después de seleccionar una temporada
  };
  
  const handleEpocaChange = (value) => {
    setEpoca(value);
    setShowEpocaSelectOption(value === null); // Mostrar el mensaje "Seleccione una época" solo si la época es null
    setShowTemporadaSelectOption(true); // Mostrar siempre el mensaje "Seleccione una temporada" después de seleccionar una época
  };
  
  const handleGeneroChange = (value) => {
    setGenero(value);
    setShowGeneroSelectOption(value === null);
     
  };
  
  const handleEstiloGChange = (value) => {
    setEstiloG(value);
    setShowEstiloGSelectOption(value === null); 
  
  };
  
  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
    <View style={{ height: 30 }} />
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
      
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={temporada}
          onValueChange={handleTemporadaChange}
          style={styles.picker}
        >
          <Picker.Item label="Primavera" value="Primavera" />
          <Picker.Item label="Verano" value="Verano" />
          <Picker.Item label="Otoño" value="Otoño" />
          <Picker.Item label="Invierno" value="Invierno" />
          <Picker.Item label="Cualquier" value="Cualquier" />
        </Picker>
      </View>
      <View style={{ height: 10 }} />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={epoca}
          onValueChange={handleEpocaChange}
          style={styles.picker}
        >
          <Picker.Item label="70's: 1970 - 1979" value="70's" />
          <Picker.Item label="80's: 1980 - 1989" value="80's" />
          <Picker.Item label="90's: 1990 - 1999" value="90's" />
          <Picker.Item label="2000's: 2000 - 2009" value="2000's" />
          <Picker.Item label="2010's: 2010 - 2019" value="2010's" />
          <Picker.Item label="2020's: 2020 - presente" value="2020's" />
          <Picker.Item label="Cualquier" value="Cualquier" />
        </Picker>
      </View>
      <View style={{ height: 10 }} />
      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          selectedValue={genero}
          onValueChange={handleGeneroChange}
        >
          <Picker.Item label="Masculino" value="Masculino" />
          <Picker.Item label="Femenino" value="Femenino" />
          <Picker.Item label="Cualquier" value="Cualquier " />
        </Picker>
      </View>
      <View style={{ height: 10 }} />
      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          selectedValue={estiloG}
          onValueChange={handleEstiloGChange}
        >
          <Picker.Item label="Casual" value="Casual" />
          <Picker.Item label="Formal" value="Formal" />
          <Picker.Item label="Deportivo" value="Deportivo" />
          <Picker.Item label="Vintage" value="Vintage" />
          <Picker.Item label="Bohemio" value="Bohemio" />
          <Picker.Item label="Gotico" value="Gotico" />
          <Picker.Item label="Punk" value="Punk" />
          <Picker.Item label="Hipster" value="Hipster" />
          <Picker.Item label="Urbano" value="Urbano" />
          <Picker.Item label="Otros" value="Otros" />
        </Picker>
      </View>
      <View style={{ height: 10 }} />
      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.editButton}>Actualizar Publicación</Text>
      </TouchableOpacity>
   
    </ScrollView>
  </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      
      alignItems: 'center', 
      flex: 1,
      flexDirection: 'row',
      position: 'relative',
  
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
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 100,
      alignItems: 'center'
    },
    input: {
      width: '80%',
      height: "5.5%",
      borderColor: '#f0f1f1',
      borderWidth: 1,
      marginBottom: 20,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: '#f0f1f1',
      color: '#7c7c7c',
      fontWeight: 'bold'
    },
    imageContainer: {
      alignItems: 'center',
    },
    image: {
        width: 280,
        height: 300,
        borderRadius: 10,
    },
    picker: {
      height: "5.5%",
      width: '100%',
      backgroundColor: '#f0f1f1',
      alignItems: 'center',
      justifyContent: 'center', 
      color: '#7c7c7c',
      fontWeight: 'bold',
      fontSize: 16,
    },
    pickerContainer: {
      width: '80%',
      backgroundColor: '#f0f1f1',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#f0f1f1',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center', 
      marginBottom: 5,
      color: '#7c7c7c',
      fontWeight: 'bold'
    },
  });
  


export default EditarPublicacion;

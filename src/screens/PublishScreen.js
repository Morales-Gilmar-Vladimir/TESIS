import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, ScrollView, Platform, BackHandler} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PublishScreen = ({ navigation }) => {
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [temporada, setTemporada] = useState('');
  const [epoca, setEpoca] = useState('');
  const [genero, setGenero] = useState('');
  const [estilo, setEstilo] = useState('');
  const [anio, setAnio] = useState('');
  const [estiloG, setEstiloG] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
      
const handleBackPress = () => {
      if (navigation.isFocused()) {
        navigation.navigate('Home');
        return true;
      }
      return false;
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  
    return () => backHandler.remove();
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Se requiere permiso para acceder a la galería de fotos');
        }
      }
    })();
  }, [navigation]);

  const pickImageFromGallery = async () => {
    try {
      setLoadingImage(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      setLoadingImage(false);

      if (!result.cancelled && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        setSelectedImageUri(selectedImageUri);
        console.log('Imagen seleccionada:', selectedImageUri);
      } else {
        console.log('No se seleccionó ninguna imagen');
      }
    } catch (error) {
      setLoadingImage(false);
      console.error('Error al seleccionar la imagen:', error);
    }
  };

  const publishPost = async () => {
    try {
      const userId = await AsyncStorage.getItem('_id');
      const userToken = await AsyncStorage.getItem('token');
  
      if (!selectedImageUri) {
        console.log('Error: Imagen no seleccionada');
        Alert.alert('Error', 'Debes seleccionar una imagen');
        return;
      }
  
      const formData = new FormData();
      formData.append('descripcion', descripcion);
      formData.append('temporada', temporada);
      formData.append('epoca', epoca);
      formData.append('genero', genero);
      formData.append('estilo', estilo);
      formData.append('anio', anio);
      formData.append('estiloG', estiloG);
      formData.append('userId', userId);
      formData.append('image', {
        uri: selectedImageUri,
        type: 'image/jpeg',
        name: `profile_${userId}.jpg`,
      });
  
      const config = {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'multipart/form-data',
        },
      };
  
      console.log('Datos a enviar:', {
        descripcion,
        temporada,
        epoca,
        genero,
        estilo,
        anio,
        estiloG,
        image: {
          uri: selectedImageUri,
          type: 'image/jpeg',
          name: `publicacion_${userId}.jpg`,
        },
      });
  
      const response = await axios.post('https://ropdat.onrender.com/api/publicar', formData, config);
  
      if (response.status === 200) {
        Alert.alert('Éxito', 'Publicación realizada correctamente');
        setSelectedImageUri(null);
        setDescripcion('');
        setTemporada('');
        setEpoca('');
        setGenero('');
        setEstilo('');
        setAnio('');
        setEstiloG('');
      } else {
        Alert.alert('Error', 'Hubo un problema al publicar');
      }
    } catch (error) {
      console.error('Error al publicar:', error);
      Alert.alert('Error', 'Hubo un problema al publicar');
    }
  };
  
  
  const navigateToHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {selectedImageUri && (
          <TouchableOpacity style={styles.imageContainer} onPress={pickImageFromGallery}>
            <Image source={{ uri: selectedImageUri }} style={styles.image} />
          </TouchableOpacity>
        )}
        {!selectedImageUri && (
          <TouchableOpacity style={styles.imageContainer} onPress={pickImageFromGallery}>
            <View style={styles.imagePlaceholder}>
              <Icon name="image" size={50} color="gray" />
              <Text style={styles.placeholderText}>Selecciona una imagen</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
          <Text style={styles.buttonText}>Seleccionar imagen</Text>
        </TouchableOpacity>
       
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={text => setDescripcion(text)}
          maxLength={200}
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
          selectedValue={estilo}
          onValueChange={value => setEstilo(value)}
        >
          <Picker.Item label="Casual" value="Casual" />
          <Picker.Item label="Formal" value="Formal" />
          <Picker.Item label="Otros" value="Otros" />
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Año"
          value={anio}
          onChangeText={text => setAnio(text)}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Estilo General"
          value={estiloG}
          onChangeText={text => setEstiloG(text)}
        />
         <TouchableOpacity style={styles.publishButton} onPress={publishPost}>
          <Text style={styles.buttonText}>Publicar</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
        
      </ScrollView>

      <View style={styles.fixedButtonsContainer}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={navigateToHome}>
            <Icon name="home" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Publicar')}>
            <Icon name="plus-square" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Perfil')}>
            <Icon name="user" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 280,
    height: 300,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 280,
    height: 350,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: 'gray',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    justifyContent: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    alignSelf: 'center',
  },
  publishButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignSelf: 'center',
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

export default PublishScreen;

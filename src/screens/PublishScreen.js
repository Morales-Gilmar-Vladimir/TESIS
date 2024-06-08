import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, ScrollView, Platform, BackHandler} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; 

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
  const [showTemporadaSelectOption, setShowTemporadaSelectOption] = useState(true);
  const [showEpocaSelectOption, setShowEpocaSelectOption] = useState(true);
  const [showGeneroSelectOption, setShowGeneroSelectOption] = useState(true);
  const [showEstiloGSelectOption, setShowEstiloGSelectOption] = useState(true);

  
  useFocusEffect(
    React.useCallback(() => {
      const cleanUpStates = () => {
        setSelectedImageUri(null);
        setDescripcion('');
        setTemporada('');
        setEpoca('');
        setGenero('');
        setEstilo('');
        setAnio('');
        setEstiloG('');
        setShowTemporadaSelectOption(true);
        setShowEpocaSelectOption(true);
        setShowGeneroSelectOption(true);
        setShowEstiloGSelectOption(true);
      };

      cleanUpStates();

      const unsubscribe = navigation.addListener('focus', cleanUpStates);

      return unsubscribe;
    }, [navigation])
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
        if (response.data.msg === "Su cuenta esta restringida") {
          // Muestra la alerta correspondiente si la cuenta está restringida       
          Alert.alert('Cuenta restringida', 'Tu cuenta está restringida y no puedes interactuar.');
          return; // Detener la ejecución de la función si la cuenta está restringida
        }

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
          {showTemporadaSelectOption && <Picker.Item label="Seleccione una temporada" value={null} />}
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
          {showEpocaSelectOption && <Picker.Item label="Seleccione una época" value={null} />}
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
          {showGeneroSelectOption && <Picker.Item label="Seleccione a que género va dirigido" value={null} />}
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
          {showEstiloGSelectOption && <Picker.Item label="Seleccione un estilo" value={null} />}
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
      <View style={{ height: 30 }} />
         <TouchableOpacity style={styles.publishButton} onPress={publishPost}>
          <Text style={styles.buttonText}>Publicar</Text>
        </TouchableOpacity>
        <View style={{ height: 10 }} />
      </ScrollView>

      <View style={styles.fixedButtonsContainer}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={navigateToHome}>
            <Icon name="home" size={24} color="#5450b5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Publicar')}>
            <Icon name="plus-square" size={24} color="#5450b5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Perfil')}>
            <Icon name="user" size={24} color="#5450b5" />
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
    
    alignItems: 'center', 
    flex: 1,
    flexDirection: 'row',
    position: 'relative',

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
  
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 25,
    alignItems: 'center'
  },
  imageContainer: {
    marginBottom: 20,
     backgroundColor: '#f0f1f1',
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
    backgroundColor: '#f0f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: 'gray',
  },
  buttonText: {
    color: '#5450b5',
    fontSize: 16,
    justifyContent: 'center',
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    fontSize: 16,
  },
  publishButton: {
    backgroundColor: '#d8e1fe',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
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

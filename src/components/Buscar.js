import React, { useState } from 'react';
import { View, ScrollView, TextInput, Button, Alert, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'
import Icon from 'react-native-vector-icons/FontAwesome';

const Buscar = ({ buscarPublicaciones, onSearchComplete  }) => {
  const [temporada, setTemporada] = useState("");
  const [epoca, setEpoca] = useState("");
  const [genero, setGenero] = useState("");
  const [estiloG, setEstiloG] = useState("");
  const [showTemporadaSelectOption, setShowTemporadaSelectOption] = useState(true);
  const [showEpocaSelectOption, setShowEpocaSelectOption] = useState(true);
  const [showGeneroSelectOption, setShowGeneroSelectOption] = useState(true);
  const [showEstiloGSelectOption, setShowEstiloGSelectOption] = useState(true);
  const [publicacionesFiltradas, setPublicacionesFiltradas] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTemporadaChange = (value) => {
    console.log('Temporada seleccionada:', value);
    setTemporada(value);
    setShowTemporadaSelectOption(value === null);
   
  };
  
  const handleEpocaChange = (value) => {
    console.log('Época seleccionada:', value);
    setEpoca(value);
    setShowEpocaSelectOption(value === null);

  };
  
  const handleGeneroChange = (value) => {
    console.log('Género seleccionado:', value);
    setGenero(value);
    setShowGeneroSelectOption(value === null);
  };
  
  const handleEstiloGChange = (value) => {
    console.log('Estilo seleccionado:', value);
    setEstiloG(value);
    setShowEstiloGSelectOption(value === null);
  };

  const cerrarBusqueda = () => {
    setSearching(false);
  };

  const handleBuscar = async () => {
    setLoading(true);
    try {
        const userToken = await AsyncStorage.getItem('token');
        
    // Si todos los parámetros son null, realiza una búsqueda sin filtros.
    const todosNulos = [temporada, epoca, genero, estiloG].every(param => param === null);

       /* console.log('Parámetros de búsqueda:', {
            temporada: temporada || null,
            epoca: epoca || null,
            genero: genero || null,
            estiloG: estiloG || null,
        });*/

        const parametrosBusqueda = todosNulos ? {} : {
          temporada: temporada || null,
          epoca: epoca || null,
          genero: genero || null,
          estiloG: estiloG || null,
      };

      console.log('Parámetros de búsqueda:', parametrosBusqueda);

        const response = await axios.post(
          'https://ropdat.onrender.com/api/busqueda',
          /*{
              temporada: temporada || null,
              epoca: epoca || null,
              genero: genero || null,
              estiloG: estiloG || null,
          }*/ parametrosBusqueda,
          {
              headers: {
                  Authorization: `Bearer ${userToken}`,
              },
          }
      );
      
        

      if (response.status === 200) {
        const { busqueda } = response.data;
        console.log(busqueda);
    
        if (busqueda && busqueda.length > 0) {
          
            busqueda.forEach((resultado) => {
                return (
                    <View key={resultado._id}>
                        <Text>{resultado.titulo}</Text>
                        <Image
                            source={{ uri: resultado.imagen.secure_url }}
                            style={{ width: 100, height: 100 }}
                        />
                    </View>
                );
            });

            setPublicacionesFiltradas(busqueda);
            buscarPublicaciones(busqueda);
            

            
        } else {
          setPublicacionesFiltradas([]);
          

            Alert.alert(
                'Información',
                'No se encontraron publicaciones con los criterios de búsqueda.'
            );
        }
        onSearchComplete(); // Llamada para cerrar la búsqueda
    }
    
    } catch (error) {
        console.error('Error al realizar la búsqueda:', error);
        Alert.alert(
            'Error',
            'Se produjo un error al realizar la búsqueda. Por favor, inténtalo de nuevo más tarde.'
        );
    }
    setLoading(false);
};



    
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
      <View style={{ height: 2 }} />
        <Text style={styles.filterTitle}>Temporada</Text>
        <View style={{ height: 5 }} />
        <View style={styles.filterContainer}>
          <Picker
            style={styles.picker}
            selectedValue={temporada}
            onValueChange={handleTemporadaChange}
          >
            
          {showTemporadaSelectOption && <Picker.Item label="Seleccione una temporada" value={null} />}
            <Picker.Item label="Primavera" value="Primavera" />
            <Picker.Item label="Verano" value="Verano" />
            <Picker.Item label="Otoño" value="Otoño" />
            <Picker.Item label="Invierno" value="Invierno" />
            <Picker.Item label="Cualquier" value="Cualquier" />
          </Picker>
          {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
        </View>
        
        <Text style={styles.filterTitle}>Época</Text>
        <View style={{ height: 5 }} />
        <View style={styles.filterContainer}>
          <Picker
            style={styles.picker}
            selectedValue={epoca}
            onValueChange={handleEpocaChange}
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
          {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
        </View>


        <Text style={styles.filterTitle}>Género</Text>
        <View style={{ height: 5 }} />
        <View style={styles.filterContainer}>
          
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
          {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
        </View>
        

        <Text style={styles.filterTitle}>Estilo</Text>
        <View style={{ height: 5 }} />
        <View style={styles.filterContainer}>

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
            <Picker.Item label="Gótico" value="Gótico" />
            <Picker.Item label="Punk" value="Punk" />
            <Picker.Item label="Hipster" value="Hipster" />
            <Picker.Item label="Urbano" value="Urbano" />
            <Picker.Item label="Otros" value="Otros" />
          </Picker>
          {loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
          
        </View>{loading && ( // Mostrar indicador de carga si loading es true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5450b5" />
        </View>
      )}
        <View style={{ height: 30}} />
        <TouchableOpacity style={styles.XButton} onPress={handleBuscar}>
          <Text style={styles.submitButton}>Buscar Publicaciones</Text>
        </TouchableOpacity>
      </ScrollView>
      
    </View>
    
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F2FF',
    flexDirection: 'row',
   // position: 'relative',
   // paddingVertical: 5, // Reducir el espaciado vertical
    //paddingHorizontal: 10, // Reducir el espaciado horizontal
    borderRadius: 10, // Radio de borde para redondear las esquinas
    alignItems: 'center',
    textAlign: 'center', // Alinea el texto en el centro
    

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
    submitButton: {
      color: '#5450b5', // Color del texto
      fontSize: 16,   // Tamaño de la fuente
      fontWeight: 'bold', // Grosor de la fuente
      backgroundColor: '#d8e1fe', // Color de fondo del texto
      paddingVertical: 10, // Espaciado vertical dentro del texto
      paddingHorizontal: 20, // Espaciado horizontal dentro del texto
      borderRadius: 10, // Radio de borde para redondear las esquinas
      alignItems: 'center',
      textAlign: 'center', // Alinea el texto en el centro
    },
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 25,
      alignItems: 'center',
      textAlign: 'center', // Alinea el texto en el centro
       paddingVertical: 20, // Reducir el espaciado vertical
       paddingHorizontal: 2, // Reducir el espaciado horizontal
       
    },
   
    filterContainer: {
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
    filterTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#5450b5',
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      padding: 10,
    },
    pickerContainer: {
      width: '80%',
      backgroundColor: '#f0f1f1',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ccc',
      alignItems: 'center',
      justifyContent: 'center', 
      marginBottom: 5,
      color: '#7c7c7c',
      fontWeight: 'bold'
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
    searchButton: {
      marginBottom: 10,
      padding: 10,
      backgroundColor: 'lightgray',
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 5,
      right: 5,
      zIndex: 1,
    },
  });


export default Buscar;





     
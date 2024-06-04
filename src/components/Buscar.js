import React, { useState } from 'react';
import { View, ScrollView, TextInput, Button, Alert, StyleSheet, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'


const Buscar = ({ buscarPublicaciones }) => {
  const [temporada, setTemporada] = useState("");
  const [epoca, setEpoca] = useState("");
  const [genero, setGenero] = useState("");
  const [estiloG, setEstiloG] = useState("");
  const [showTemporadaSelectOption, setShowTemporadaSelectOption] = useState(true);
  const [showEpocaSelectOption, setShowEpocaSelectOption] = useState(true);
  const [showGeneroSelectOption, setShowGeneroSelectOption] = useState(true);
  const [showEstiloGSelectOption, setShowEstiloGSelectOption] = useState(true);
  const [publicaciones, setPublicaciones] = useState([]);
  const [publicacionesFiltradas, setPublicacionesFiltradas] = useState([]);
  const [loading, setLoading] = useState(false);


  const handleTemporadaChange = (value) => {
    console.log('Temporada seleccionada:', value);
    setTemporada(value);
    setShowTemporadaSelectOption(value === "");
   
  };
  
  const handleEpocaChange = (value) => {
    console.log('Época seleccionada:', value);
    setEpoca(value);
    setShowEpocaSelectOption(value === "");

  };
  
  const handleGeneroChange = (value) => {
    console.log('Género seleccionado:', value);
    setGenero(value);
    setShowGeneroSelectOption(value === "");
  };
  
  const handleEstiloGChange = (value) => {
    console.log('Estilo seleccionado:', value);
    setEstiloG(value);
    setShowEstiloGSelectOption(value === "");
  };

  const handleBuscar = async () => {
    try {
        const userToken = await AsyncStorage.getItem('token');
        
        console.log('Parámetros de búsqueda:', {
            temporada: temporada || "",
            epoca: epoca || "",
            genero: genero || "",
            estiloG: estiloG || "",
        });

        const response = await axios.post(
          'https://ropdat.onrender.com/api/busqueda',
          {
              temporada: temporada || "",
              epoca: epoca || "",
              genero: genero || "",
              estiloG: estiloG || "",
          },
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
            Alert.alert(
                'Éxito',
                'Se encontraron publicaciones con los criterios de búsqueda.'
            );
        } else {
          setPublicacionesFiltradas([]);
            Alert.alert(
                'Información',
                'No se encontraron publicaciones con los criterios de búsqueda.'
            );
        }
    }
    
    } catch (error) {
        console.error('Error al realizar la búsqueda:', error);
        Alert.alert(
            'Error',
            'Se produjo un error al realizar la búsqueda. Por favor, inténtalo de nuevo más tarde.'
        );
    }
};



    
  return (
    <View style={styles.container}>
      <ScrollView>

        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Temporada</Text>
          <Picker
            style={styles.picker}
            selectedValue={temporada}
            onValueChange={handleTemporadaChange}
          >
            
          {showTemporadaSelectOption && <Picker.Item label="Seleccione una temporada" value={""} />}
            <Picker.Item label="Primavera" value="Primavera" />
            <Picker.Item label="Verano" value="Verano" />
            <Picker.Item label="Otoño" value="Otoño" />
            <Picker.Item label="Invierno" value="Invierno" />
            <Picker.Item label="Cualquier" value="Cualquier" />
          </Picker>
        </View>
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Época</Text>
          <Picker
            style={styles.picker}
            selectedValue={epoca}
            onValueChange={handleEpocaChange}
          >
            {showEpocaSelectOption && <Picker.Item label="Seleccione una época" value={""} />}
            <Picker.Item label="70's: 1970 - 1979" value="70's" />
            <Picker.Item label="80's: 1980 - 1989" value="80's" />
            <Picker.Item label="90's: 1990 - 1999" value="90's" />
            <Picker.Item label="2000's: 2000 - 2009" value="2000's" />
            <Picker.Item label="2010's: 2010 - 2019" value="2010's" />
            <Picker.Item label="2020's: 2020 - presente" value="2020's" />
            <Picker.Item label="Cualquier" value="Cualquier" />
          </Picker>
        </View>
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Género</Text>
          <Picker
            style={styles.picker}
            selectedValue={genero}
            onValueChange={handleGeneroChange}
          >
            {showGeneroSelectOption && <Picker.Item label="Seleccione a que género va dirigido" value={""} />}
            <Picker.Item label="Masculino" value="Masculino" />
            <Picker.Item label="Femenino" value="Femenino" />
            <Picker.Item label="Cualquier" value="Cualquier " />
          </Picker>
        </View>
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Estilo</Text>
          <Picker
            style={styles.picker}
            selectedValue={estiloG}
            onValueChange={handleEstiloGChange}
          >
            {showEstiloGSelectOption && <Picker.Item label="Seleccione un estilo" value={""} />}
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
        </View>
        <Button title="Buscar Publicaciones" onPress={handleBuscar} />
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#ffffff',
    },
    filterContainer: {
      marginBottom: 20,
    },
    filterTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      padding: 10,
    },
    picker: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
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

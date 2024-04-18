import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {Alert, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/navigation/Navigation';
import Main from './src/Main';

//Pressable ayuda a que se visualice en el celular una ventana emergente o a su ves el TouchableWithoutFeedback
{/*      <Pressable onPress={() => Alert.alert("Hemos tocado el texto")}>
       <Text>Hola</Text>
  </Pressable>*/}

export default function App() {
  {/*return <Main/>*/}
  return (
    <NavigationContainer>
      <Navigation />
    </NavigationContainer>
  );
}

/*const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});*/

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Login from './components/Login';
import Registro from './components/Registro';

const Main = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent} horizontal={true} pagingEnabled={true}>
      <View style={styles.page}>
        <Registro />
      </View>
      <View style={styles.page}>
        <Login />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  page: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Main;

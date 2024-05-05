import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Asegúrate de importar el icono necesario

const SideBarMenu = ({ onMenu, onClose, onProfile, onPublish }) => {
  return (
    <View style={styles.container}>
      {/* Botón para abrir el menú, ahora con el icono */}
      <TouchableOpacity onPress={onMenu} style={styles.menuItem}>
        <Icon name="bars" size={30} />
      </TouchableOpacity>
      {/* Contenido del menú */}
      <TouchableOpacity onPress={onProfile} style={styles.menuItem}>
        <Text style={styles.buttonText}>Ver perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPublish} style={styles.menuItem}>
        <Text style={styles.buttonText}>Publicar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={styles.menuItem}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
      {/* Agrega más botones según tus necesidades */}
      {/* <TouchableOpacity onPress={otraFuncion} style={styles.menuItem}>
        <Text style={styles.buttonText}>Otra acción</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 20,
    zIndex: 2, // Asegura que el menú esté por encima del contenido principal
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'blue',
  },
});

export default SideBarMenu;

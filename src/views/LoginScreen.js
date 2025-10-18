import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';

// La prop 'navigation' es pasada automáticamente por el Stack Navigator
const LoginScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Puedes agregar un logo o imagen aquí 

[Image of a security icon]
 */}
      <Text style={styles.title}>Bienvenido al Sistema</Text>
      <Text style={styles.subtitle}>Inicie sesión para continuar</Text>
      
      <Button
        title="Siguiente"
        color="#457b9d"
        // Navega al nombre de la ruta principal de las pestañas (Tabs)
        onPress={() => navigation.navigate('MainTabs')} 
      />
      
      <Text style={styles.footer}>Ingreso Rápido</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: '#666',
  },
  footer: {
    marginTop: 50,
    color: '#aaa',
  },
});

export default LoginScreen;
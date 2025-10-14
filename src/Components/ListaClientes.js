import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const ListaClientes = ({ clientes }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Clientes</Text>
      <FlatList
        data={clientes}
        keyExtractor={(item, index) => index.toString()} // Usamos índice porque Firestore usa ids alfanuméricos
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.item}>ID Cliente: {item.id_cliente}</Text>
            <Text style={styles.item}>Nombre: {item.nombre} {item.apellido}</Text>
            <Text style={styles.item}>Cédula: {item.cedula}</Text>
            <Text style={styles.item}>Teléfono: {item.telefono}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f9f9f9" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3, // sombra en Android
    shadowColor: "#000", // sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  item: { fontSize: 16, marginBottom: 3 },
});

export default ListaClientes;

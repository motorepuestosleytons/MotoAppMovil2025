import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const ListaProveedores = ({ proveedores }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Proveedores</Text>
      <FlatList
        data={proveedores}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.item}>ID: {item.id_prov}</Text>
            <Text style={styles.item}>Empresa: {item.empresa}</Text>
            <Text style={styles.item}>Nombre: {item.nombre_proveedor}</Text>
            <Text style={styles.item}>Teléfono: {item.telefono}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  item: { fontSize: 16, marginBottom: 3 },
});

export default ListaProveedores;
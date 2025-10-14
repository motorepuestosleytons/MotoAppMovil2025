import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs } from "firebase/firestore";
import FormularioVentas from "../Components/FormularioVentas.js";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);

  // Función para cargar los datos desde Firestore
  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Ventas"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVentas(data);
    } catch (error) {
      console.error("Error al obtener las ventas:", error);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <View style={styles.container}>
      {/* Formulario para agregar nuevas ventas */}
      <FormularioVentas cargarDatos={cargarDatos} />
      {/* Lista de ventas registradas */}
      <FlatList
        data={ventas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.tituloItem}>Venta #{item.id_venta}</Text>
            <Text>Fecha: {item.fecha_venta}</Text>
            <Text>ID Cliente: {item.id_cliente}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noData}>No hay ventas registradas.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 4, padding: 20, backgroundColor: "#f2f2f2" },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  tituloItem: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  noData: { textAlign: "center", color: "#999", marginTop: 20 },
});

export default Ventas;
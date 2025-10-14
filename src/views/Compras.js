import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs } from "firebase/firestore";
import FormularioCompras from "../Components/FormularioCompras.js";

const Compras = () => {
  const [compras, setCompras] = useState([]);

  // Función para cargar los datos desde Firestore
  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Compras"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCompras(data);
    } catch (error) {
      console.error("Error al obtener las compras:", error);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <View style={styles.container}>
      {/* Formulario para agregar nuevas compras */}
      <FormularioCompras cargarDatos={cargarDatos} />

      {/* Lista de compras registradas */}
      <FlatList
        data={compras}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.tituloItem}>Compra #{item.id_compra}</Text>
            <Text>Fecha: {item.fecha_compra}</Text>
            <Text>ID Proveedor: {item.id_proveedor}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noData}>No hay compras registradas.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 4,
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
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
  tituloItem: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  noData: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
});

export default Compras;

import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs } from "firebase/firestore";

import FormularioProductos from "../Components/FormularioProductos.js";

const Productos = () => {
  const [productos, setProductos] = useState([]);

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Productos")); // <- Nombre de colección
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id, // ID generado por Firestore
        ...doc.data(), // Datos del producto
      }));
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <View style={styles.container}>
      <FormularioProductos cargarDatos={cargarDatos} />
      {/* Aquí puedes incluir la lista si la tienes */}
      {/* <ListaProductos productos={productos} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 4, padding: 20, backgroundColor: "#f2f2f2" },
});

export default Productos;

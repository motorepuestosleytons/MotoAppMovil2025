import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs } from "firebase/firestore";
import ListaProveedores from "../Components/ListaProveedores.js";
import FormularioProveedores from "../Components/FormularioProveedores.js";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Proveedores"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id, // id de firestore
        ...doc.data(), // campos del proveedor
      }));
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <FormularioProveedores cargarDatos={cargarDatos} />
        <ListaProveedores proveedores={proveedores} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: "#f2f2f2",
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
  },
});

export default Proveedores;
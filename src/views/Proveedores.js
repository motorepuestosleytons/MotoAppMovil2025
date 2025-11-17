// src/views/Proveedores.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import FormularioProveedores from "../Components/FormularioProveedores.js";
import TablaProveedores from "../Components/TablaProveedores.js";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Proveedores"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProveedores(data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    }
  };

  const eliminarProveedor = async (id) => {
    try {
      await deleteDoc(doc(db, "Proveedores", id));
      cargarDatos();
      Alert.alert("Éxito", "Proveedor eliminado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar.");
    }
  };

  const editarProveedor = async (proveedor) => {
    const { id, empresa, nombre_proveedor, telefono } = proveedor;
    if (!id || !empresa || !nombre_proveedor || !telefono) return;
    try {
      await updateDoc(doc(db, "Proveedores", id), { empresa, nombre_proveedor, telefono });
      cargarDatos();
      Alert.alert("Éxito", "Proveedor actualizado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar.");
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  return (
    <View style={styles.container}>
      <FormularioProveedores cargarDatos={cargarDatos} />
      <TablaProveedores
        proveedores={proveedores}
        eliminarProveedor={eliminarProveedor}
        editarProveedor={editarProveedor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
});

export default Proveedores;
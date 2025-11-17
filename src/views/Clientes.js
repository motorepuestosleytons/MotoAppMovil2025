// src/views/Clientes.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import FormularioClientes from "../Components/FormularioClientes.js";
import TablaClientes from "../Components/TablaClientes.js";

const Clientes = ({ cerrarSesion, navigation }) => {
  const [clientes, setClientes] = useState([]);

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Clientes"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  const eliminarCliente = async (id) => {
    try {
      await deleteDoc(doc(db, "Clientes", id));
      cargarDatos();
      Alert.alert("Éxito", "Cliente eliminado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar.");
    }
  };

  const editarCliente = async (cliente) => {
    const { id, nombre, direccion, telefono } = cliente;
    if (!id || !nombre || !direccion || !telefono) return;
    try {
      await updateDoc(doc(db, "Clientes", id), { nombre, direccion, telefono });
      cargarDatos();
      Alert.alert("Éxito", "Cliente actualizado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar.");
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  return (
    <View style={styles.container}>
      <FormularioClientes cargarDatos={cargarDatos} />
      <TablaClientes
        clientes={clientes}
        eliminarCliente={eliminarCliente}
        editarCliente={editarCliente}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
});

export default Clientes;
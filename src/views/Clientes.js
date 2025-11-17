// src/views/Clientes.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Text } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import FormularioClientes from "../Components/FormularioClientes.js";
import TablaClientes from "../Components/TablaClientes.js";
import { Ionicons } from "@expo/vector-icons";

const COLOR_DESTRUCTIVO = "#DC3545"; // Rojo para cerrar sesión

const Clientes = ({ cerrarSesion, navigation }) => {
  const [clientes, setClientes] = useState([]);

  const cargarDatos = async () => {
    try {
      const queriedSnapshot = await getDocs(collection(db, "Clientes"));
      const data = queriedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  const handleCerrarSesion = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, cerrar", style: "destructive", onPress: () => cerrarSesion(navigation) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FormularioClientes cargarDatos={cargarDatos} />
      
      <View style={styles.tablaContainer}>
        <TablaClientes
          clientes={clientes}
          eliminarCliente={eliminarCliente}
          editarCliente={editarCliente}
        />
      </View>

      {/* BOTÓN GRANDE DE CERRAR SESIÓN */}
      <TouchableOpacity style={styles.botonCerrarSesion} onPress={handleCerrarSesion}>
        <Ionicons name="log-out-outline" size={24} color="#FFF" />
        <Text style={styles.textoBoton}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  tablaContainer: {
    flex: 1,
    marginBottom: 20, // Espacio para el botón
  },
  botonCerrarSesion: {
    backgroundColor: COLOR_DESTRUCTIVO,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  textoBoton: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default Clientes;
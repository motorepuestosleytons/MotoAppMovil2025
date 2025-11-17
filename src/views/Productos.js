// src/views/Productos.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import FormularioProductos from "../Components/FormularioProductos.js";
import TablaProductos from "../Components/TablaProductos.js";

const Productos = ({ navigation }) => {
  const [productos, setProductos] = useState([]);

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Productos"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "Productos", id));
      cargarDatos();
      Alert.alert("Éxito", "Producto eliminado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar.");
    }
  };

  const editarProducto = async (producto) => {
    const { id, ...datos } = producto;
    try {
      await updateDoc(doc(db, "Productos", id), {
        ...datos,
        precio_compra: parseFloat(datos.precio_compra) || 0,
        precio_venta: parseFloat(datos.precio_venta) || 0,
        stock: parseInt(datos.stock) || 0,
      });
      cargarDatos();
      Alert.alert("Éxito", "Producto actualizado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar.");
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  return (
    <View style={styles.container}>
      <FormularioProductos cargarDatos={cargarDatos} />
      <TablaProductos
        productos={productos}
        eliminarProducto={eliminarProducto}
        editarProducto={editarProducto}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
});

export default Productos;
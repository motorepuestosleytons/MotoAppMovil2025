import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import FormularioProductos from "../Components/FormularioProductos.js";
import TablaProductos from "../Components/TablaProductos.js";

const Productos = ({ navigation, cerrarSesion }) => {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    marca: "",
    modelo: "",
    precio_compra: "",
    precio_venta: "",
    stock: "",
    foto: "",
  });

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Productos"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "Productos", id));
      cargarDatos();
      Alert.alert("Éxito", "Producto eliminado correctamente.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo eliminar el producto.");
    }
  };

  const editarProducto = async (productoActualizado) => {
    const { id, nombre, marca, modelo, precio_compra, precio_venta, stock, foto } = productoActualizado;
    if (!id) return;
    try {
      await updateDoc(doc(db, "Productos", id), {
        nombre, marca, modelo,
        precio_compra: parseFloat(precio_compra) || 0,
        precio_venta: parseFloat(precio_venta) || 0,
        stock: parseInt(stock) || 0,
        foto: foto || ""
      });
      cargarDatos();
      Alert.alert("Éxito", "Producto actualizado correctamente.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo actualizar el producto.");
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const navegarACatalogo = () => {
    navigation.navigate("Catalogo");
  };

  return (
    <View style={styles.container}>
      <FormularioProductos 
        cargarDatos={cargarDatos} 
        onVerCatalogo={navegarACatalogo} 
      />
      <TablaProductos
        productos={productos}
        eliminarProducto={eliminarProducto}
        editarProducto={editarProducto}
      />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 10 } });
export default Productos;
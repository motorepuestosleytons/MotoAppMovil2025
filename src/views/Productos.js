// src/views/Productos.js (Ajustado)

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { db } from "../database/firebaseconfig.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import FormularioProductos from "../Components/FormularioProductos.js";
import TablaProductos from "../Components/TablaProductos.js";

// Recibe la prop 'navigation' que viene del Stack Navigator
const Productos = ({ navigation }) => {
  const [productos, setProductos] = useState([]);

  // Estado para nuevo producto (formulario)
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    marca: "",
    modelo: "",
    precio_compra: "",
    precio_venta: "",
    stock: "",
    foto: "",
  });

  const [idProducto, setIdProducto] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // 🔄 Cargar productos desde Firebase
  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Productos"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  // 🗑️ Eliminar producto
  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "Productos", id));
      cargarDatos();
      Alert.alert("Éxito", "Producto eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      Alert.alert("Error", "No se pudo eliminar el producto.");
    }
  };

  // 📝 Manejar cambios en el formulario
  const manejoCambio = (campo, valor) => {
    setNuevoProducto((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // 💾 Guardar nuevo producto
  const guardarProducto = async () => {
    const { nombre, marca, modelo, precio_compra, precio_venta, stock, foto } = nuevoProducto;

    if (nombre && marca && modelo && precio_compra && precio_venta && stock) {
      try {
        await addDoc(collection(db, "Productos"), {
          nombre,
          marca,
          modelo,
          precio_compra: parseFloat(precio_compra) || 0,
          precio_venta: parseFloat(precio_venta) || 0,
          stock: parseInt(stock) || 0,
          foto: foto || "",
        });
        setNuevoProducto({
          nombre: "",
          marca: "",
          modelo: "",
          precio_compra: "",
          precio_venta: "",
          stock: "",
          foto: "",
        });
        cargarDatos();
        Alert.alert("Éxito", "Producto registrado correctamente.");
      } catch (error) {
        console.error("Error al registrar producto:", error);
        Alert.alert("Error", "No se pudo registrar el producto.");
      }
    } else {
      Alert.alert("Error", "Por favor, complete todos los campos.");
    }
  };

  // ✏️ Editar producto existente
  const editarProducto = async (productoActualizado) => {
    const { id, nombre, marca, modelo, precio_compra, precio_venta, stock, foto } = productoActualizado;

    if (!id) {
      Alert.alert("Error", "No se puede actualizar: falta el ID del producto.");
      return;
    }

    try {
      const ref = doc(db, "Productos", id);

      const datosAActualizar = {
        nombre: String(nombre || ""),
        marca: String(marca || ""),
        modelo: String(modelo || ""),
        precio_compra: parseFloat(precio_compra) || 0,
        precio_venta: parseFloat(precio_venta) || 0,
        stock: parseInt(stock) || 0,
        foto: String(foto || ""),
      };

      await updateDoc(ref, datosAActualizar);
      cargarDatos();
      Alert.alert("Éxito", "Producto actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      Alert.alert("Error", "No se pudo actualizar el producto.");
    }
  };

  // ⚙️ Cargar productos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  // 🚀 FUNCIÓN PARA NAVEGAR AL CATÁLOGO
  const navegarACatalogo = () => {
    navigation.navigate('Catalogo'); // El nombre 'Catalogo' debe coincidir con el Stack
  };

  return (
    <View style={styles.container}>
      {/* 🔽 Formulario de registro (Se le pasa la función de navegación) */}
      <FormularioProductos 
        cargarDatos={cargarDatos} 
        onVerCatalogo={navegarACatalogo} // ⬅️ NUEVA PROP
      />

      {/* 🔽 Tabla de productos */}
      <TablaProductos
        productos={productos}
        eliminarProducto={eliminarProducto}
        editarProducto={editarProducto}
      />
    </View>
  );
};

// 🎨 Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
});

export default Productos;
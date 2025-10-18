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

const Productos = () => {
  const [productos, setProductos] = useState([]);

  // Estado para el formulario de registro (mantener como String)
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    modelo: "", // Se agrega el campo modelo para la vista principal
    precio_compra: "", // Ajuste de campos
    precio_venta: "", // Ajuste de campos
    stock: "",
  });

  // Variables de control
  const [idProducto, setIdProducto] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // 🔄 Cargar productos desde Firebase (se mantiene igual)
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

  // 🗑️ Eliminar producto (se mantiene igual)
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

  // 📝 Manejar cambios en el formulario (se mantiene igual)
  const manejoCambio = (campo, valor) => {
    setNuevoProducto((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // 💾 Guardar nuevo producto (Ajuste de campos y manejo de tipos)
  const guardarProducto = async () => {
    const { nombre, modelo, precio_compra, precio_venta, stock } = nuevoProducto;
    
    // ⚠️ Se ajusta la validación a los campos del nuevo producto
    if (nombre && modelo && precio_compra && precio_venta && stock) {
      try {
        await addDoc(collection(db, "Productos"), {
          nombre,
          modelo,
          // Conversión a Number SÓLO si el string no está vacío
          precio_compra: parseFloat(precio_compra) || 0,
          precio_venta: parseFloat(precio_venta) || 0,
          stock: parseInt(stock) || 0,
        });
        setNuevoProducto({
          nombre: "",
          modelo: "",
          precio_compra: "",
          precio_venta: "",
          stock: "",
        });
        cargarDatos();
        Alert.alert("Éxito", "Producto registrado correctamente.");
      } catch (error) {
        console.error("Error al registrar producto:", error);
      }
    } else {
      Alert.alert("Error", "Por favor, complete todos los campos.");
    }
  };

  // ✏️ Actualizar producto desde la tabla (FUNCIÓN CLAVE CORREGIDA)
  const editarProducto = async (productoActualizado) => {
    const { id, nombre, modelo, precio_compra, precio_venta, stock } = productoActualizado;

    // 💡 SOLUCIÓN: Relajamos la validación. Solo exigimos el ID.
    // La validación de los campos se hace con el operador ternario.
    if (id) {
        try {
            // Se prepara el objeto de actualización con conversión de tipos segura
            const datosAActualizar = {
                nombre,
                modelo,
                // Convierte a Number si no está vacío, de lo contrario guarda la cadena vacía ("")
                precio_compra: precio_compra === "" ? "" : parseFloat(precio_compra), 
                precio_venta: precio_venta === "" ? "" : parseFloat(precio_venta),
                stock: stock === "" ? "" : parseInt(stock),
                // Aquí podrías agregar más campos, si existen en tu Firestore, pero no se editan
                // Por ejemplo: marca, fecha_creacion, etc.
                // Asegúrate de que los campos en tu Firestore coincidan con los que envías.
            };

            await updateDoc(doc(db, "Productos", id), datosAActualizar); 
            
            cargarDatos();
            Alert.alert("Éxito", "Producto actualizado correctamente.");
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            Alert.alert("Error", "No se pudo actualizar el producto. Verifique los tipos de datos.");
        }
    } else {
      Alert.alert("Advertencia", "Falta el ID del producto para la actualización.");
    }
  };

  // 🚀 Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <View style={styles.container}>
      {/* Asumiendo que FormularioProductos maneja los campos correctos */}
      <FormularioProductos
        nuevoProducto={nuevoProducto}
        manejoCambio={manejoCambio}
        guardarProducto={guardarProducto}
        modoEdicion={modoEdicion}
        cargarDatos={cargarDatos}
      />
      <TablaProductos
        productos={productos}
        eliminarProducto={eliminarProducto}
        editarProducto={editarProducto}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 4, padding: 20, backgroundColor: "#f2f2f2" },
});

export default Productos;
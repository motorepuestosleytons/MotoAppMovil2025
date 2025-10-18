import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
// Se asume que estos componentes se han renombrado y adaptado:
import FormularioProveedores from "../Components/FormularioProveedores.js"; 
import TablaProveedores from "../Components/TablaProveedores.js";

// El componente se renombra a Proveedores
const Proveedores = () => {
  // Estado adaptado para la lista de proveedores
  const [proveedores, setProveedores] = useState([]); 
  
  // Estado adaptado para el nuevo proveedor (sustituyendo nombre y cedula)
  const [nuevoProveedor, setNuevoProveedor] = useState({
    empresa: "",          // Antes 'nombre'
    nombre_proveedor: "", // Antes 'cedula'
    telefono: "",
  });
  
  // Variables de estado originales mantenidas por estructura
  const [idProveedor, setIdProveedor] = useState(null); 
  const [modoEdicion, setModoEdicion] = useState(false); 

  // Cargar proveedores desde Firebase
  const cargarDatos = async () => {
    try {
      // Colección cambiada de "Clientes" a "Proveedores"
      const querySnapshot = await getDocs(collection(db, "Proveedores"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Se usa el nuevo estado
      setProveedores(data); 
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  };

  // Eliminar proveedor
  const eliminarProveedor = async (id) => {
    try {
      // Colección cambiada
      await deleteDoc(doc(db, "Proveedores", id));
      cargarDatos();
      // Mensaje adaptado
      Alert.alert("Éxito", "Proveedor eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      // Mensaje adaptado
      Alert.alert("Error", "No se pudo eliminar el proveedor.");
    }
  };

  // Manejar cambios en el formulario (adaptado para usar 'empresa' y 'nombre_proveedor')
  const manejoCambio = (campo, valor) => {
    setNuevoProveedor((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // Guardar nuevo proveedor
  const guardarProveedor = async () => {
    // Campos de desestructuración adaptados
    const { empresa, nombre_proveedor, telefono } = nuevoProveedor; 
    
    if (empresa && nombre_proveedor && telefono) {
      try {
        // Colección cambiada
        await addDoc(collection(db, "Proveedores"), {
          empresa,          // Campo adaptado
          nombre_proveedor, // Campo adaptado
          telefono,
        });
        // Limpieza de estado adaptada
        setNuevoProveedor({
          empresa: "",
          nombre_proveedor: "",
          telefono: "",
        });
        cargarDatos();
      } catch (error) {
        console.error("Error al registrar proveedor:", error);
      }
    } else {
      Alert.alert("Error", "Por favor, complete todos los campos.");
    }
  };

  // Actualizar proveedor existente (función original mantenida por estructura)
  const actualizarProveedor = async () => {
    // Mensaje adaptado
    Alert.alert("Info", "La función de actualización no está enlazada al modal de la tabla.");
  };

  // FUNCIÓN DE EDICIÓN DESDE LA TABLA (Adaptada)
  const editarProveedor = async (proveedorActualizado) => {
    // Campos de desestructuración adaptados
    const { id, empresa, nombre_proveedor, telefono } = proveedorActualizado; 

    if (id && empresa && nombre_proveedor && telefono) {
      try {
        // Colección cambiada y campos actualizados
        await updateDoc(doc(db, "Proveedores", id), {
          empresa,
          nombre_proveedor,
          telefono,
        });
        cargarDatos();
        // Mensaje adaptado
        Alert.alert("Éxito", "Proveedor actualizado correctamente."); 
      } catch (error) {
        console.error("Error al actualizar proveedor desde tabla:", error);
        Alert.alert("Error", "No se pudo actualizar el proveedor.");
      }
    } else {
      Alert.alert("Advertencia", "Faltan datos para la actualización.");
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <View style={styles.container}>
      {/* Componente Formulario adaptado */}
      <FormularioProveedores
        nuevoProveedor={nuevoProveedor}
        manejoCambio={manejoCambio}
        guardarProveedor={guardarProveedor}
        actualizarProveedor={actualizarProveedor}
        modoEdicion={modoEdicion}
        cargarDatos={cargarDatos} 
      />
      {/* Componente Tabla adaptado */}
      <TablaProveedores
        proveedores={proveedores} // Prop adaptada
        eliminarProveedor={eliminarProveedor} // Prop adaptada
        editarProveedor={editarProveedor} // Prop adaptada
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 4, padding: 20, backgroundColor: "#f2f2f2" },
});

// Exportación adaptada
export default Proveedores;
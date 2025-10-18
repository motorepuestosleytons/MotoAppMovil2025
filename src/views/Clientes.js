import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import FormularioClientes from "../Components/FormularioClientes.js";
import TablaClientes from "../Components/TablaClientes.js";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  // Los estados 'id_cliente' y 'apellido' siguen eliminados en este componente para la simplificación general.
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    cedula: "",
    telefono: "",
  });
  // Estas variables ya no son cruciales para el flujo de edición del modal, pero se mantienen por estructura.
  const [idCliente, setIdCliente] = useState(null); 
  const [modoEdicion, setModoEdicion] = useState(false); 

  // Cargar clientes desde Firebase
  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Clientes"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  // Eliminar cliente
  const eliminarCliente = async (id) => {
    try {
      await deleteDoc(doc(db, "Clientes", id));
      cargarDatos();
      Alert.alert("Éxito", "Cliente eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      Alert.alert("Error", "No se pudo eliminar el cliente.");
    }
  };

  // Manejar cambios en el formulario (sigue igual)
  const manejoCambio = (campo, valor) => {
    setNuevoCliente((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // Guardar nuevo cliente (sigue igual)
  const guardarCliente = async () => {
    const { nombre, cedula, telefono } = nuevoCliente;
    if (nombre && cedula && telefono) {
      try {
        await addDoc(collection(db, "Clientes"), {
          nombre,
          cedula,
          telefono,
        });
        setNuevoCliente({
          nombre: "",
          cedula: "",
          telefono: "",
        });
        cargarDatos();
      } catch (error) {
        console.error("Error al registrar cliente:", error);
      }
    } else {
      Alert.alert("Error", "Por favor, complete todos los campos.");
    }
  };

  // Actualizar cliente existente (función original, pero no se usa con el modal de la tabla)
  // Se deja por si alguna otra parte del código la requiere, aunque su funcionalidad es redundante con `editarCliente` ahora.
  const actualizarCliente = async () => {
    // Esto se mantendrá sin uso ya que el modal de la tabla no llama a esta función.
    Alert.alert("Info", "La función de actualización no está enlazada al modal de la tabla.");
  };

  // **FUNCIÓN CORREGIDA:** Ahora esta función actúa como el "guardador de edición"
  // Recibe el objeto del cliente con los nuevos valores desde la tabla y actualiza Firebase.
  const editarCliente = async (clienteActualizado) => {
    const { id, nombre, cedula, telefono } = clienteActualizado;

    if (id && nombre && cedula && telefono) {
      try {
        await updateDoc(doc(db, "Clientes", id), {
          nombre,
          cedula,
          telefono,
        });
        cargarDatos();
        Alert.alert("Éxito", "Cliente actualizado correctamente.");
      } catch (error) {
        console.error("Error al actualizar cliente desde tabla:", error);
        Alert.alert("Error", "No se pudo actualizar el cliente.");
      }
    } else {
      Alert.alert("Advertencia", "Faltan datos para la actualización.");
    }
    
    // NOTA: Se evita la carga de datos en setNuevoCliente y setModoEdicion/setIdCliente
    // para no interferir con el formulario principal, ya que la edición se manejó
    // completamente dentro del modal de TablaClientes.
  };

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <View style={styles.container}>
      <FormularioClientes
        nuevoCliente={nuevoCliente}
        manejoCambio={manejoCambio}
        guardarCliente={guardarCliente}
        actualizarCliente={actualizarCliente}
        modoEdicion={modoEdicion}
        cargarDatos={cargarDatos} 
      />
      <TablaClientes
        clientes={clientes}
        eliminarCliente={eliminarCliente}
        // Pasamos la función que ahora actualiza Firebase
        editarCliente={editarCliente} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 4, padding: 20, backgroundColor: "#f2f2f2" },
});

export default Clientes;
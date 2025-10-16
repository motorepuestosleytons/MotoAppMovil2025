import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import FormularioClientes from "../Components/FormularioClientes.js";
import TablaClientes from "../Components/TablaClientes.js";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [nuevoCliente, setNuevoCliente] = useState({
    id_cliente: "",
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
  });
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
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    }
  };

  // Manejar cambios en el formulario
  const manejoCambio = (campo, valor) => {
    setNuevoCliente((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // Guardar nuevo cliente
  const guardarCliente = async () => {
    const { id_cliente, nombre, apellido, cedula, telefono } = nuevoCliente;
    if (id_cliente && nombre && apellido && cedula && telefono) {
      try {
        await addDoc(collection(db, "Clientes"), {
          id_cliente,
          nombre,
          apellido,
          cedula,
          telefono,
        });
        setNuevoCliente({
          id_cliente: "",
          nombre: "",
          apellido: "",
          cedula: "",
          telefono: "",
        });
        cargarDatos();
      } catch (error) {
        console.error("Error al registrar cliente:", error);
      }
    } else {
      alert("Por favor, complete todos los campos.");
    }
  };

  // Actualizar cliente existente
  const actualizarCliente = async () => {
    const { id_cliente, nombre, apellido, cedula, telefono } = nuevoCliente;
    if (idCliente && id_cliente && nombre && apellido && cedula && telefono) {
      try {
        await updateDoc(doc(db, "Clientes", idCliente), {
          id_cliente,
          nombre,
          apellido,
          cedula,
          telefono,
        });
        setNuevoCliente({
          id_cliente: "",
          nombre: "",
          apellido: "",
          cedula: "",
          telefono: "",
        });
        setIdCliente(null);
        setModoEdicion(false);
        cargarDatos();
      } catch (error) {
        console.error("Error al actualizar cliente:", error);
      }
    } else {
      alert("Por favor, complete todos los campos.");
    }
  };

  // Editar cliente (cargar en formulario)
  const editarCliente = (cliente) => {
    setNuevoCliente({
      id_cliente: cliente.id_cliente,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      cedula: cliente.cedula,
      telefono: cliente.telefono,
    });
    setIdCliente(cliente.id);
    setModoEdicion(true);
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
      />
      <TablaClientes
        clientes={clientes}
        eliminarCliente={eliminarCliente}
        editarCliente={editarCliente}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 4, padding: 20, backgroundColor: "#f2f2f2" },
});

export default Clientes;

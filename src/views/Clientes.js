// src/views/Clientes.js (COMPONENTE COMPLETO - CORREGIDO: Cédula -> Dirección y Estilo de Logout)

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Text } from "react-native"; 
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import FormularioClientes from "../Components/FormularioClientes.js";
import TablaClientes from "../Components/TablaClientes.js";
import { Ionicons } from "@expo/vector-icons"; // Para el ícono de logout

// RECIBE 'navigation' desde MyTabsAdmon
const Clientes = ({ cerrarSesion, navigation }) => { 
    const [clientes, setClientes] = useState([]);
    const [nuevoCliente, setNuevoCliente] = useState({
        nombre: "",
        direccion: "", // 🚨 CAMBIO: cedula -> direccion
        telefono: "",
    });
    const [idCliente, setIdCliente] = useState(null); 
    const [modoEdicion, setModoEdicion] = useState(false);

    // Cargar clientes desde Firebase (sin cambios)
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

    // Eliminar cliente (sin cambios)
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

    // Manejar cambios en el formulario (sin cambios)
    const manejoCambio = (campo, valor) => {
        setNuevoCliente((prev) => ({
            ...prev,
            [campo]: valor,
        }));
    };

    // Guardar nuevo cliente 
    const guardarCliente = async () => {
        // 🚨 CAMBIO: cedula -> direccion
        const { nombre, direccion, telefono } = nuevoCliente; 
        if (nombre && direccion && telefono) {
            try {
                await addDoc(collection(db, "Clientes"), {
                    nombre,
                    direccion, // 🚨 CAMBIO
                    telefono,
                });
                // 🚨 CAMBIO: resetear direccion
                setNuevoCliente({
                    nombre: "",
                    direccion: "",
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

    // Actualizar cliente existente (sin cambios)
    const actualizarCliente = async () => {
        Alert.alert("Info", "La función de actualización no está enlazada al modal de la tabla.");
    };

    // FUNCIÓN: "guardador de edición"
    const editarCliente = async (clienteActualizado) => {
        // 🚨 CAMBIO: cedula -> direccion
        const { id, nombre, direccion, telefono } = clienteActualizado; 
        if (id && nombre && direccion && telefono) {
            try {
                await updateDoc(doc(db, "Clientes", id), {
                    nombre,
                    direccion, // 🚨 CAMBIO
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
    };

    // Cargar datos al iniciar (sin cambios)
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
                editarCliente={editarCliente} 
            />
            
            {/* 🚨 BOTÓN DE LOGOUT CON ESTILO MODERNO */}
            <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={() => cerrarSesion(navigation)} 
            >
                <Ionicons name="log-out-outline" size={20} color="#dc3545" />
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity> 
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 4, padding: 20, backgroundColor: "#f2f2f2" },
    // ESTILOS DE LOGOUT
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20, // Espacio para separarlo de la tabla
        backgroundColor: '#ffe8e8',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f5c6cb',
    },
    logoutButtonText: {
        color: '#dc3545',
        marginLeft: 8,
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default Clientes;
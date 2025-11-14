// FormularioClientes.js (Estilos Modernos, Búsqueda Interna y Modal Funcional)

import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    Modal,
    TouchableOpacity,
    Alert,
} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons"; 

// Colores de la paleta moderna
const COLOR_PRIMARIO = "#1E90FF"; 
const COLOR_EXITO = "#00A878";    
const COLOR_CANCELAR = "#6c757d"; 

const FormularioClientes = ({ cargarDatos }) => { 
    // Campos del formulario
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState(""); // 🚨 CAMBIO: Cédula -> Dirección
    const [telefono, setTelefono] = useState("");

    // Modal de registro
    const [modalRegistroVisible, setModalRegistroVisible] = useState(false);

    // Lógica de búsqueda interna
    const [busqueda, setBusqueda] = useState("");
    const [resultado, setResultado] = useState(null);

    // Guardar cliente
    const guardarCliente = async () => {
        // 🚨 CAMBIO: cedula -> direccion
        if (nombre && direccion && telefono) {
            try {
                await addDoc(collection(db, "Clientes"), {
                    nombre,
                    direccion, // 🚨 CAMBIO: Campo 'direccion' en Firebase
                    telefono,
                });
                setNombre("");
                setDireccion(""); // 🚨 CAMBIO: Reiniciar dirección
                setTelefono("");
                cargarDatos();
                setModalRegistroVisible(false);
                Alert.alert("Éxito", "Cliente registrado correctamente.");
            } catch (error) {
                console.error("Error al registrar cliente:", error);
                Alert.alert("Error", "Hubo un problema al registrar el cliente.");
            }
        } else {
            Alert.alert("Atención", "Por favor, complete todos los campos.");
        }
    };

    // Búsqueda
    useEffect(() => {
        const buscarCliente = async () => {
            if (!busqueda.trim()) {
                setResultado(null);
                return;
            }
            try {
                const snapshot = await getDocs(collection(db, "Clientes"));
                const busquedaLower = busqueda.toLowerCase();
                const clienteEncontrado = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .find(
                        (c) =>
                            c.nombre.toLowerCase().includes(busquedaLower) ||
                            (c.direccion && c.direccion.toLowerCase().includes(busquedaLower)) // 🚨 CAMBIO: Buscar en direccion
                    );
                setResultado(clienteEncontrado || false);
            } catch (error) {
                console.error("Error en la búsqueda:", error);
                setResultado(false);
            }
        };

        const handler = setTimeout(() => {
            buscarCliente();
        }, 300);

        return () => clearTimeout(handler);
    }, [busqueda]);

    return (
        <View style={styles.container}> 
            <Text style={styles.titulo}>Gestión de Clientes</Text>

            {/* Botón para abrir modal */}
            <View style={styles.botonRegistroContainer}>
                <TouchableOpacity
                    style={styles.botonRegistro}
                    onPress={() => setModalRegistroVisible(true)}
                >
                    <Ionicons name="person-add" size={20} color="#fff" style={{marginRight: 8}} />
                    <Text style={styles.textoBoton}>Registrar Cliente</Text>
                </TouchableOpacity>
            </View>

            {/* Buscador */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.inputSearch}
                    placeholder="Buscar Cliente por Nombre" // 🚨 CAMBIO
                    placeholderTextColor="#999"
                    value={busqueda} 
                    onChangeText={setBusqueda} 
                    onKeyPress={() => { if (resultado) setResultado(null); }} 
                />
            </View>

            {/* Resultado búsqueda */}
            {busqueda.trim().length > 0 && (
                <View style={styles.resultadoBusquedaContainer}>
                    {resultado && resultado !== false ? (
                        <View style={styles.resultado}>
                            <Text style={styles.resultadoTexto}>
                                <Text style={styles.label}>Nombre:</Text> {resultado.nombre}
                            </Text>
                            <Text style={styles.resultadoTexto}>
                                <Text style={styles.label}>Dirección:</Text> {resultado.direccion} {/* 🚨 CAMBIO */}
                            </Text>
                            <Text style={styles.resultadoTexto}>
                                <Text style={styles.label}>Teléfono:</Text> {resultado.telefono}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.noEncontrado}>
                            Cliente no encontrado. Intente buscar por nombre o dirección. {/* 🚨 CAMBIO */}
                        </Text>
                    )}
                </View>
            )}

            {/* Modal de registro funcional */}
            <Modal visible={modalRegistroVisible} animationType="slide" transparent={true}>
                <View style={styles.modalFondo}>
                    <View style={styles.modalContenido}>
                        <Text style={styles.tituloModal}>Registrar Cliente</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre"
                            value={nombre}
                            onChangeText={setNombre}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Dirección" // 🚨 CAMBIO
                            value={direccion}
                            onChangeText={setDireccion} // 🚨 CAMBIO
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Teléfono"
                            value={telefono}
                            onChangeText={setTelefono}
                            keyboardType="phone-pad"
                        />

                        <View style={styles.botonesContainer}>
                            <TouchableOpacity
                                style={[styles.boton, styles.botonCancelar]}
                                onPress={() => setModalRegistroVisible(false)}
                            >
                                <Text style={{color: "#fff", fontWeight: "bold"}}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.boton, styles.botonGuardar]}
                                onPress={guardarCliente}
                            >
                                <Text style={{color: "#fff", fontWeight: "bold"}}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#F7F8FA',
        marginTop: 10
    },
    titulo: {
        fontSize: 26,
        fontWeight: "800",
        marginBottom: 25,
        color: "#333",
        textAlign: "center",
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 20,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: { marginRight: 10 },
    inputSearch: { flex: 1, paddingVertical: 10, fontSize: 16, color: '#333' },
    resultadoBusquedaContainer: { marginBottom: 10 },
    resultado: { 
        padding: 15, 
        backgroundColor: '#e6f7ff', 
        borderRadius: 8, 
        borderLeftWidth: 4, 
        borderLeftColor: COLOR_PRIMARIO 
    },
    resultadoTexto: { fontSize: 15, lineHeight: 22, color: '#333' },
    label: { fontWeight: 'bold' },
    noEncontrado: { 
        textAlign: "center", 
        padding: 10,
        backgroundColor: '#f8d7da',
        color: "#721c24",
        fontWeight: '600',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f5c6cb'
    },
    botonRegistroContainer: { marginBottom: 30, alignItems: "center" },
    botonRegistro: {
        backgroundColor: COLOR_EXITO, 
        padding: 12.4,
        borderRadius: 8,
        width: "70%",
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: COLOR_EXITO,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    modalFondo: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)" },
    modalContenido: { backgroundColor: "#fff", margin: 20, borderRadius: 15, padding: 25, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
    tituloModal: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center", color: '#333' },
    input: { borderWidth: 1, borderColor: "#ddd", marginBottom: 15, padding: 12, borderRadius: 8, fontSize: 16, backgroundColor: '#fefefe' },
    botonesContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    boton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
    botonCancelar: { backgroundColor: COLOR_CANCELAR, marginRight: 5 },
    botonGuardar: { backgroundColor: COLOR_PRIMARIO, marginLeft: 5 },
});

export default FormularioClientes;
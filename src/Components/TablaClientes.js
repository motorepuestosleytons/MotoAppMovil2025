// TablaClientes.js (Estilos Completos y Modernos - CORREGIDO: Cédula -> Dirección)

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import BotonEliminarCliente from "./BotonEliminarCliente.js"; // Asumo que este componente existe
import { Ionicons } from "@expo/vector-icons"; // Para iconos de edición

// Colores de la paleta moderna
const COLOR_PRIMARIO = "#1E90FF"; // Azul Brillante (para Encabezado de Tabla y Botón Guardar)
const COLOR_ACCION = "#00A878";   // Verde Menta Oscuro (para Botón Editar en fila)
const COLOR_CANCELAR = "#6c757d"; // Gris Oscuro

const TablaClientes = ({ clientes, eliminarCliente, editarCliente }) => {
    // Estados para el Modal de Edición
    const [visible, setVisible] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [datosEditados, setDatosEditados] = useState({
        nombre: "",
        direccion: "", // 🚨 CAMBIO: cedula -> direccion
        telefono: "",
    });

    const abrirModal = (cliente) => {
        setClienteSeleccionado(cliente);
        setDatosEditados({
            nombre: cliente.nombre || "",
            direccion: cliente.direccion || "", // 🚨 CAMBIO: cedula -> direccion
            telefono: cliente.telefono || "",
        });
        setVisible(true);
    };

    const guardarCambios = () => {
        // La función editarCliente en Clientes.js manejará el updateDoc con 'direccion'
        if (clienteSeleccionado) {
            editarCliente({ ...clienteSeleccionado, ...datosEditados });
        }
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Lista de Clientes</Text>

            {/* Contenedor principal de la tabla con ScrollView horizontal */}
            <ScrollView horizontal style={styles.tablaWrapper}>
                {/* 🚨 CAMBIO: minWidth ajustado para acomodar la Dirección */}
                <View style={{ minWidth: 600 }}> 
                    {/* Encabezado de la tabla */}
                    <View style={[styles.fila, styles.encabezado]}>
                        <Text style={[styles.textoEncabezado, styles.columnaNombre]}>
                            Nombre
                        </Text>
                        <Text style={[styles.textoEncabezado, styles.columnaDireccion]}>
                            Dirección {/* 🚨 CAMBIO: Cédula -> Dirección */}
                        </Text>
                        <Text style={[styles.textoEncabezado, styles.columnaTelefono]}>
                            Teléfono
                        </Text>
                        <Text style={[styles.textoEncabezado, styles.columnaAcciones]}>
                            Acciones
                        </Text>
                    </View>

                    {/* Contenido de la tabla con ScrollView vertical */}
                    <ScrollView style={styles.contenidoScroll}>
                        {clientes.map((item, index) => (
                            <View
                                key={item.id}
                                style={[
                                    styles.fila,
                                    index % 2 === 0 ? styles.filaPar : styles.filaImpar,
                                ]}
                            >
                                <Text style={[styles.celda, styles.columnaNombre]}>
                                    {item.nombre}
                                </Text>
                                <Text style={[styles.celda, styles.columnaDireccion]}>
                                    {item.direccion} {/* 🚨 CAMBIO: item.cedula -> item.direccion */}
                                </Text>
                                <Text style={[styles.celda, styles.columnaTelefono]}>
                                    {item.telefono}
                                </Text>
                                <View style={[styles.celda, styles.columnaAcciones]}>
                                    <View style={styles.contenedorBotones}>
                                        <TouchableOpacity
                                            style={styles.botonEditar}
                                            onPress={() => abrirModal(item)}
                                        >
                                            <Ionicons name="create-outline" size={16} color="#FFF" />
                                        </TouchableOpacity>
                                        <BotonEliminarCliente
                                            id={item.id}
                                            eliminarCliente={eliminarCliente}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Modal de Edición - Estilos mejorados */}
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.textoModal}>
                            Editar Cliente: {datosEditados.nombre}
                        </Text>

                        <ScrollView style={{ width: "100%" }}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre"
                                placeholderTextColor="#999"
                                value={datosEditados.nombre}
                                onChangeText={(valor) =>
                                    setDatosEditados({ ...datosEditados, nombre: valor })
                                }
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Dirección" // 🚨 CAMBIO
                                placeholderTextColor="#999"
                                value={datosEditados.direccion} // 🚨 CAMBIO
                                onChangeText={(valor) =>
                                    setDatosEditados({ ...datosEditados, direccion: valor }) // 🚨 CAMBIO
                                }
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Teléfono"
                                placeholderTextColor="#999"
                                value={datosEditados.telefono}
                                onChangeText={(valor) =>
                                    setDatosEditados({ ...datosEditados, telefono: valor })
                                }
                                keyboardType="phone-pad"
                            />
                        </ScrollView>

                        <View style={styles.filaBotones}>
                            <TouchableOpacity
                                style={[styles.botonAccion, styles.cancelar]}
                                onPress={() => setVisible(false)}
                            >
                                <Text style={styles.textoAccion}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.botonAccion, styles.confirmar]}
                                onPress={guardarCambios}
                            >
                                <Text style={styles.textoAccion}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    // Estilos Generales
    container: {
        flex: 1,
        padding: 10,
        alignSelf: "stretch",
        backgroundColor: "#F7F8FA", // Fondo muy claro,
        marginTop: -25 
    },
    titulo: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 15,
        color: "#333",
        textAlign: "center",
    },
    
    // Estilos de Tabla
    tablaWrapper: {
        backgroundColor: "#fff",
        borderRadius: 10,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contenidoScroll: {
        maxHeight: 400, // Altura máxima para ScrollView vertical
    },
    fila: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 45,
        borderBottomWidth: 1, // Separador de fila
        borderBottomColor: '#eee'
    },
    filaPar: {
        backgroundColor: "#f8f8f8",
    },
    filaImpar: {
        backgroundColor: "#ffffff",
    },
    encabezado: {
        backgroundColor: COLOR_PRIMARIO, // Azul Brillante para el encabezado
        borderBottomWidth: 0,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        paddingVertical: 12,
    },
    celda: {
        fontSize: 14,
        color: "#333",
        paddingHorizontal: 8,
        paddingVertical: 4,
        textAlign: "center",
    },
    textoEncabezado: {
        fontWeight: "bold",
        fontSize: 14,
        color: "#fff", 
        textAlign: "center",
    },
    
    // Estilos de Ancho de Columna
    columnaNombre: { width: 170 },
    columnaDireccion: { width: 200 }, // 🚨 CAMBIO: Estilo para Dirección
    columnaTelefono: { width: 110 },
    columnaAcciones: { width: 120 },
    
    // Estilos de Botones de Acción
    contenedorBotones: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
    },
    botonEditar: {
        backgroundColor: COLOR_ACCION, // Verde Menta Oscuro para editar
        padding: 7,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Estilos del Modal 
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        backgroundColor: "white",
        padding: 25,
        borderRadius: 15,
        width: "90%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    textoModal: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#fefefe'
    },
    filaBotones: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
    },
    botonAccion: {
        flex: 1,
        marginHorizontal: 5,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelar: { 
        backgroundColor: COLOR_CANCELAR, 
    },
    confirmar: { 
        backgroundColor: COLOR_PRIMARIO, // Azul Brillante para confirmar
    },
    textoAccion: { 
        color: "white", 
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default TablaClientes;
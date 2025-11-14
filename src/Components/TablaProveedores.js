// TablaProveedores.js (Estilos Completos y Modernos)

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
import BotonEliminarProveedor from "./BotonEliminarProveedor.js"; // Asumimos que existe y se adapta
import { Ionicons } from "@expo/vector-icons"; 

// Colores de la paleta moderna
const COLOR_PRIMARIO = "#1E90FF"; 
const COLOR_ACCION = "#00A878";   
const COLOR_CANCELAR = "#6c757d"; 

const TablaProveedores = ({ proveedores, eliminarProveedor, editarProveedor }) => {
    // Estados para el Modal de Edición
    const [visible, setVisible] = useState(false);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    // Campos Adaptados
    const [datosEditados, setDatosEditados] = useState({
        empresa: "",
        nombre_proveedor: "",
        telefono: "",
    });

    const abrirModal = (proveedor) => {
        setProveedorSeleccionado(proveedor);
        // Inicialización de campos adaptada
        setDatosEditados({
            empresa: proveedor.empresa || "",
            nombre_proveedor: proveedor.nombre_proveedor || "",
            telefono: proveedor.telefono || "",
        });
        setVisible(true);
    };

    const guardarCambios = () => {
        // Se llama a la función de prop para guardar en Firestore
        if (proveedorSeleccionado) {
            editarProveedor({ ...proveedorSeleccionado, ...datosEditados });
        }
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Lista de Proveedores</Text> 

            {/* Contenedor principal de la tabla con ScrollView horizontal */}
            <ScrollView horizontal style={styles.tablaWrapper}>
                <View style={{ minWidth: 550 }}>
                    {/* Encabezado de la tabla - Títulos adaptados */}
                    <View style={[styles.fila, styles.encabezado]}>
                        <Text style={[styles.textoEncabezado, styles.columnaEmpresa]}>
                            Empresa
                        </Text>
                        <Text style={[styles.textoEncabezado, styles.columnaNombreProveedor]}>
                            Nombre Proveedor
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
                        {proveedores.map((item, index) => (
                            <View
                                key={item.id}
                                style={[
                                    styles.fila,
                                    index % 2 === 0 ? styles.filaPar : styles.filaImpar,
                                ]}
                            >
                                {/* Celdas de datos adaptadas */}
                                <Text style={[styles.celda, styles.columnaEmpresa]}>
                                    {item.empresa}
                                </Text>
                                <Text style={[styles.celda, styles.columnaNombreProveedor]}>
                                    {item.nombre_proveedor}
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
                                        <BotonEliminarProveedor 
                                            id={item.id}
                                            eliminarProveedor={eliminarProveedor}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Modal de Edición */}
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.textoModal}>
                            Editar Proveedor: {datosEditados.empresa}
                        </Text>

                        <ScrollView style={{ width: "100%" }}>
                            {/* Input Adaptado: Empresa */}
                            <TextInput
                                style={styles.input}
                                placeholder="Empresa"
                                placeholderTextColor="#999"
                                value={datosEditados.empresa}
                                onChangeText={(valor) =>
                                    setDatosEditados({ ...datosEditados, empresa: valor })
                                }
                            />
                            {/* Input Adaptado: Nombre Proveedor */}
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre Proveedor"
                                placeholderTextColor="#999"
                                value={datosEditados.nombre_proveedor}
                                onChangeText={(valor) =>
                                    setDatosEditados({ ...datosEditados, nombre_proveedor: valor })
                                }
                            />
                            {/* Input Sin Cambios: Teléfono */}
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

// Se mantienen los estilos proporcionados
const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, alignSelf: "stretch", backgroundColor: "#F7F8FA", marginTop: -25 },
    titulo: { fontSize: 24, fontWeight: "700", marginBottom: 15, color: "#333", textAlign: "center" },
    tablaWrapper: { backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    contenidoScroll: { maxHeight: 400 },
    fila: { flexDirection: "row", alignItems: "center", minHeight: 45, borderBottomWidth: 1, borderBottomColor: '#eee' },
    filaPar: { backgroundColor: "#f8f8f8" },
    filaImpar: { backgroundColor: "#ffffff" },
    encabezado: { backgroundColor: COLOR_PRIMARIO, borderBottomWidth: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10, paddingVertical: 12 },
    celda: { fontSize: 14, color: "#333", paddingHorizontal: 8, paddingVertical: 4, textAlign: "center" },
    textoEncabezado: { fontWeight: "bold", fontSize: 14, color: "#fff", textAlign: "center" },
    columnaEmpresa: { width: 170 },
    columnaNombreProveedor: { width: 150 },
    columnaTelefono: { width: 110 },
    columnaAcciones: { width: 120 },
    contenedorBotones: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", width: "100%" },
    botonEditar: { backgroundColor: COLOR_ACCION, padding: 7, borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
    modal: { backgroundColor: "white", padding: 25, borderRadius: 15, width: "90%", shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
    textoModal: { fontSize: 22, fontWeight: "600", marginBottom: 20, textAlign: "center", color: "#333" },
    input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16, backgroundColor: '#fefefe' },
    filaBotones: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
    botonAccion: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, alignItems: "center" },
    cancelar: { backgroundColor: COLOR_CANCELAR },
    confirmar: { backgroundColor: COLOR_PRIMARIO },
    textoAccion: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default TablaProveedores;
// TablaProveedores.js (EDITAR = MISMAS VALIDACIONES QUE REGISTRAR)
import React, { useState, useEffect, Alert } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import BotonEliminarProveedor from "./BotonEliminarProveedor.js";
import { Ionicons } from "@expo/vector-icons"; 

const COLOR_PRIMARIO = "#1E90FF"; 
const COLOR_ACCION = "#00A878";   
const COLOR_CANCELAR = "#6c757d"; 

const TablaProveedores = ({ proveedores, eliminarProveedor, editarProveedor }) => {
    const [visible, setVisible] = useState(false);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [datosEditados, setDatosEditados] = useState({
        empresa: "",
        nombre_proveedor: "",
        telefono: "",
    });

    const [busqueda, setBusqueda] = useState("");
    const [proveedoresFiltrados, setProveedoresFiltrados] = useState(proveedores);

    useEffect(() => {
        if (!busqueda.trim()) {
            setProveedoresFiltrados(proveedores);
            return;
        }
        const filtrados = proveedores.filter(p =>
            p.empresa?.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.nombre_proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.telefono?.includes(busqueda)
        );
        setProveedoresFiltrados(filtrados);
    }, [busqueda, proveedores]);

    const abrirModal = (proveedor) => {
        setProveedorSeleccionado(proveedor);
        setDatosEditados({
            empresa: proveedor.empresa || "",
            nombre_proveedor: proveedor.nombre_proveedor || "",
            telefono: proveedor.telefono || "",
        });
        setVisible(true);
    };

    const guardarCambios = () => {
        // VALIDACIÓN EXACTAMENTE IGUAL QUE EN REGISTRAR
        if (!datosEditados.empresa.trim() || !datosEditados.nombre_proveedor.trim() || !datosEditados.telefono.trim()) {
            Alert.alert("Atención", "Complete todos los campos.");
            return;
        }

        if (proveedorSeleccionado) {
            editarProveedor({
                id: proveedorSeleccionado.id,
                empresa: datosEditados.empresa.trim(),
                nombre_proveedor: datosEditados.nombre_proveedor.trim(),
                telefono: datosEditados.telefono.trim(),
            });
        }
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Lista de Proveedores</Text> 

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.inputSearch}
                    placeholder="Buscar por empresa"
                    value={busqueda}
                    onChangeText={setBusqueda}
                />
            </View>

            <ScrollView horizontal style={styles.tablaWrapper}>
                <View style={{ minWidth: 550 }}>
                    <View style={[styles.fila, styles.encabezado]}>
                        <Text style={[styles.textoEncabezado, styles.columnaEmpresa]}>Empresa</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaNombreProveedor]}>Nombre Proveedor</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaTelefono]}>Teléfono</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaAcciones]}>Acciones</Text>
                    </View>

                    <ScrollView style={styles.contenidoScroll}>
                        {proveedoresFiltrados.length === 0 ? (
                            <Text style={styles.mensajeVacio}>
                                {busqueda.trim() ? "No se encontraron proveedores" : "No hay proveedores registrados."}
                            </Text>
                        ) : (
                            proveedoresFiltrados.map((item, index) => (
                                <View
                                    key={item.id}
                                    style={[
                                        styles.fila,
                                        index % 2 === 0 ? styles.filaPar : styles.filaImpar,
                                    ]}
                                >
                                    <Text style={[styles.celda, styles.columnaEmpresa]}>{item.empresa}</Text>
                                    <Text style={[styles.celda, styles.columnaNombreProveedor]}>{item.nombre_proveedor}</Text>
                                    <Text style={[styles.celda, styles.columnaTelefono]}>{item.telefono}</Text>
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
                            ))
                        )}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* MODAL DE EDICIÓN CON LAS MISMAS VALIDACIONES QUE REGISTRAR */}
            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.textoModal}>
                            Editar Proveedor: {datosEditados.empresa || "Sin empresa"}
                        </Text>

                        <ScrollView style={{ width: "100%" }}>
                            {/* EMPRESA: LETRAS, NÚMEROS, ESPACIOS Y CARACTERES COMUNES */}
                            <TextInput
                                style={styles.input}
                                placeholder="Empresa"
                                value={datosEditados.empresa}
                                onChangeText={(text) => setDatosEditados(prev => ({ 
                                    ...prev, 
                                    empresa: text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-]/g, '') 
                                }))}
                            />

                            {/* NOMBRE PROVEEDOR: SOLO LETRAS Y ESPACIOS */}
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre"
                                value={datosEditados.nombre_proveedor}
                                onChangeText={(text) => setDatosEditados(prev => ({ 
                                    ...prev, 
                                    nombre_proveedor: text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') 
                                }))}
                            />

                            {/* TELÉFONO: 8888-8888 AUTOMÁTICO */}
                            <TextInput
                                style={styles.input}
                                placeholder="Teléfono"
                                value={datosEditados.telefono}
                                onChangeText={(text) => {
                                    let limpio = text.replace(/[^0-9]/g, '');
                                    if (limpio.length > 4) {
                                        limpio = limpio.slice(0, 4) + '-' + limpio.slice(4, 8);
                                    }
                                    setDatosEditados(prev => ({ ...prev, telefono: limpio.slice(0, 9) }));
                                }}
                                keyboardType="phone-pad"
                                maxLength={9}
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

// ESTILOS 100% IGUALES
const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, alignSelf: "stretch", backgroundColor: "#F7F8FA", marginTop: -15 },
    titulo: { fontSize: 24, fontWeight: "700", marginBottom: 15, color: "#333", textAlign: "center" },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 15,
        backgroundColor: "#fff",
        elevation: 2,
    },
    searchIcon: { marginRight: 8 },
    inputSearch: { flex: 1, paddingVertical: 10, fontSize: 16 },
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
    mensajeVacio: { padding: 20, textAlign: 'center', color: '#6c757d', fontStyle: 'italic' },
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
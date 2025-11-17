// TablaClientes.js (BÚSQUEDA EN VIVO DENTRO DE LA TABLA)
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import BotonEliminarCliente from "./BotonEliminarCliente.js";
import { Ionicons } from "@expo/vector-icons";

const COLOR_PRIMARIO = "#1E90FF";
const COLOR_ACCION = "#00A878";
const COLOR_CANCELAR = "#6c757d";

const TablaClientes = ({ clientes, eliminarCliente, editarCliente }) => {
    const [visible, setVisible] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [datosEditados, setDatosEditados] = useState({
        nombre: "", direccion: "", telefono: "",
    });
    const [busqueda, setBusqueda] = useState("");
    const [clientesFiltrados, setClientesFiltrados] = useState(clientes);

    // === FILTRADO EN VIVO ===
    useEffect(() => {
        if (!busqueda.trim()) {
            setClientesFiltrados(clientes);
            return;
        }

        const filtrados = clientes.filter(c =>
            c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.direccion?.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.telefono?.includes(busqueda)
        );
        setClientesFiltrados(filtrados);
    }, [busqueda, clientes]);

    // === RECARGAR CUANDO SE ELIMINA O EDITA ===
    useEffect(() => {
        setClientesFiltrados(clientes);
    }, [clientes]);

    const abrirModal = (cliente) => {
        setClienteSeleccionado(cliente);
        setDatosEditados({
            nombre: cliente.nombre || "",
            direccion: cliente.direccion || "",
            telefono: cliente.telefono || "",
        });
        setVisible(true);
    };

    const guardarCambios = () => {
        if (clienteSeleccionado) {
            editarCliente({ ...clienteSeleccionado, ...datosEditados });
        }
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Lista de Clientes</Text>

            {/* BARRA DE BÚSQUEDA */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.inputSearch}
                    placeholder="Buscar Clientes"
                    value={busqueda}
                    onChangeText={setBusqueda}
                />
            </View>

            {/* TABLA CON SCROLL */}
            <ScrollView horizontal style={styles.tablaWrapper}>
                <View style={{ minWidth: 600 }}>
                    <View style={[styles.fila, styles.encabezado]}>
                        <Text style={[styles.textoEncabezado, styles.columnaNombre]}>Nombre</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaDireccion]}>Dirección</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaTelefono]}>Teléfono</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaAcciones]}>Acciones</Text>
                    </View>

                    <ScrollView style={styles.contenidoScroll}>
                        {clientesFiltrados.length === 0 ? (
                            <Text style={styles.mensajeVacio}>
                                {busqueda.trim() ? "No se encontraron resultados" : "No hay clientes registrados"}
                            </Text>
                        ) : (
                            clientesFiltrados.map((item, index) => (
                                <View
                                    key={item.id}
                                    style={[
                                        styles.fila,
                                        index % 2 === 0 ? styles.filaPar : styles.filaImpar,
                                    ]}
                                >
                                    <Text style={[styles.celda, styles.columnaNombre]}>{item.nombre}</Text>
                                    <Text style={[styles.celda, styles.columnaDireccion]}>{item.direccion}</Text>
                                    <Text style={[styles.celda, styles.columnaTelefono]}>{item.telefono}</Text>
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
                            ))
                        )}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* MODAL DE EDICIÓN */}
            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.textoModal}>Editar Cliente: {datosEditados.nombre}</Text>

                        <ScrollView style={{ width: "100%" }}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre"
                                placeholderTextColor="#999"
                                value={datosEditados.nombre}
                                onChangeText={(v) => setDatosEditados({ ...datosEditados, nombre: v })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Dirección"
                                placeholderTextColor="#999"
                                value={datosEditados.direccion}
                                onChangeText={(v) => setDatosEditados({ ...datosEditados, direccion: v })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Teléfono"
                                placeholderTextColor="#999"
                                value={datosEditados.telefono}
                                onChangeText={(v) => setDatosEditados({ ...datosEditados, telefono: v })}
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
    container: {
        flex: 1,
        padding: 10,
        alignSelf: "stretch",
        backgroundColor: "#F7F8FA",
        marginTop: -15
    },
    titulo: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 15,
        color: "#333",
        textAlign: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 15,
        backgroundColor: "#fff",
    },
    searchIcon: {
        marginRight: 8,
    },
    inputSearch: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
    },
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
        maxHeight: 400,
    },
    fila: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 45,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    filaPar: { backgroundColor: "#f8f8f8" },
    filaImpar: { backgroundColor: "#ffffff" },
    encabezado: {
        backgroundColor: COLOR_PRIMARIO,
        borderBottomWidth: 0,
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
    columnaNombre: { width: 170 },
    columnaDireccion: { width: 200 },
    columnaTelefono: { width: 110 },
    columnaAcciones: { width: 120 },
    contenedorBotones: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
    },
    botonEditar: {
        backgroundColor: COLOR_ACCION,
        padding: 7,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mensajeVacio: {
        padding: 20,
        textAlign: 'center',
        color: '#6c757d',
        fontStyle: 'italic',
        fontSize: 15,
    },
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
        backgroundColor: '#fefefe',
        justifyContent: 'center',
        alignItems: 'center',
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
    cancelar: { backgroundColor: COLOR_CANCELAR },
    confirmar: { backgroundColor: COLOR_PRIMARIO },
    textoAccion: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default TablaClientes;
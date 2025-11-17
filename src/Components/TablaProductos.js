// TablaProductos.js (FINAL COMPLETO Y CORREGIDO + BÚSQUEDA QUE FILTRA FILAS)
import React, { useState, useEffect } from "react";  // ← AÑADÍ useEffect
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BotonEliminarProducto from "./BotonEliminarProducto"; 

// Colores de la paleta
const COLOR_PRINCIPAL = "#1E90FF"; 
const COLOR_ADVERTENCIA = "#FFC300"; 
const COLOR_CANCELAR = "#6c757d"; 

const TablaProductos = ({ productos, eliminarProducto, editarProducto }) => {
    // --- Estados y Lógica de Edición ---
    const [visible, setVisible] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [datosEditados, setDatosEditados] = useState({
        id: null, nombre: "", marca: "", modelo: "", precio_compra: "", precio_venta: "", stock: "", foto: "",
    });

    // === NUEVA BÚSQUEDA EN VIVO ===
    const [busqueda, setBusqueda] = useState("");
    const [productosFiltrados, setProductosFiltrados] = useState(productos);

    // Filtra las filas en tiempo real
    useEffect(() => {
        if (!busqueda.trim()) {
            setProductosFiltrados(productos);
            return;
        }
        const filtrados = productos.filter(p =>
            p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.modelo?.toLowerCase().includes(busqueda.toLowerCase())
        );
        setProductosFiltrados(filtrados);
    }, [busqueda, productos]);

    const abrirModal = (producto) => {
        setProductoSeleccionado(producto);
        setDatosEditados({
            id: producto.id,
            nombre: producto.nombre || "",
            marca: producto.marca || "",
            modelo: producto.modelo || "",
            precio_compra: String(producto.precio_compra ?? 0), 
            precio_venta: String(producto.precio_venta ?? 0),  
            stock: String(producto.stock ?? 0), 
            foto: producto.foto || "",
        });
        setVisible(true);
    };

    const cerrarModal = () => {
        setVisible(false);
        setProductoSeleccionado(null);
    };

    const manejoCambio = (campo, valor) => {
        setDatosEditados((prev) => ({
            ...prev,
            [campo]: valor,
        }));
    };

    const guardarCambios = () => {
        if (!datosEditados.nombre || !datosEditados.marca || !datosEditados.precio_venta) {
             Alert.alert("Atención", "Nombre, marca y precio de venta son obligatorios.");
             return;
        }

        if (productoSeleccionado) {
            const dataToSave = {
                ...datosEditados,
                precio_compra: parseFloat(datosEditados.precio_compra) || 0,
                precio_venta: parseFloat(datosEditados.precio_venta) || 0,
                stock: parseInt(datosEditados.stock, 10) || 0,
            };
            editarProducto(dataToSave);
            cerrarModal();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Catálogo de Productos</Text>

            {/* === BARRA DE BÚSQUEDA (NUEVA) === */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.inputSearch}
                    placeholder="Buscar Productos"
                    value={busqueda}
                    onChangeText={setBusqueda}
                />
            </View>

            {/* ScrollView horizontal para las columnas */}
            <ScrollView horizontal style={styles.tablaWrapper}>
                <View style={{ minWidth: 800 }}>
                    {/* Encabezado (Fijo) */}
                    <View style={[styles.fila, styles.encabezado]}>
                        <Text style={[styles.textoEncabezado, styles.columnaImagen]}>Foto</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaNombre]}>Nombre</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaMarca]}>Marca</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaModelo]}>Modelo</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaPC]}>P. Compra</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaPV]}>P. Venta</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaStock]}>Stock</Text>
                        <Text style={[styles.textoEncabezado, styles.columnaAcciones]}>Acciones</Text>
                    </View>

                    {/* ScrollView vertical para las filas de datos */}
                    <ScrollView style={styles.datosScrollVertical}>
                        {productosFiltrados.length === 0 ? (
                            <Text style={styles.mensajeVacio}>
                                {busqueda.trim() ? "No se encontraron productos" : "No hay productos registrados."}
                            </Text>
                        ) : (
                            productosFiltrados.map((item, index) => (
                                <View
                                    key={item.id}
                                    style={[styles.fila, index % 2 === 0 ? styles.filaPar : styles.filaImpar]}
                                >
                                    <View style={[styles.celda, styles.columnaImagen]}>
                                        {item.foto ? (
                                            <Image source={{ uri: item.foto }} style={styles.imagenProducto} resizeMode="cover" />
                                        ) : (
                                            <Ionicons name="image-outline" size={30} color="#999" />
                                        )}
                                    </View>
                                    <Text style={[styles.celda, styles.columnaNombre]}>{item.nombre || "N/A"}</Text>
                                    <Text style={[styles.celda, styles.columnaMarca]}>{item.marca || "N/A"}</Text>
                                    <Text style={[styles.celda, styles.columnaModelo]}>{item.modelo || "N/A"}</Text>
                                    <Text style={[styles.celda, styles.columnaPC]}>C${Number(item.precio_compra ?? 0).toFixed(2)}</Text>
                                    <Text style={[styles.celda, styles.columnaPV]}>C${Number(item.precio_venta ?? 0).toFixed(2)}</Text>
                                    <Text style={[styles.celda, styles.columnaStock]}>{Number(item.stock ?? 0)}</Text>
                                    <View style={[styles.celda, styles.columnaAcciones]}>
                                        <View style={styles.contenedorBotones}>
                                            <TouchableOpacity style={styles.botonEditar} onPress={() => abrirModal(item)}>
                                                <Ionicons name="create-outline" size={16} color="#FFF" />
                                            </TouchableOpacity>
                                            <BotonEliminarProducto
                                                id={item.id}
                                                eliminarProducto={eliminarProducto}
                                            />
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Modal de edición */}
            <Modal visible={visible} animationType="fade" transparent onRequestClose={cerrarModal}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.textoModal}>Editar Producto: {datosEditados.nombre}</Text>
                        <ScrollView style={styles.modalScrollView}> 
                            <Text style={styles.label}>URL de Foto:</Text>
                            <TextInput style={styles.input} placeholder="URL de Imagen" placeholderTextColor="#999" value={datosEditados.foto} onChangeText={(v) => manejoCambio("foto", v)} />
                            {datosEditados.foto ? (
                                <Image source={{ uri: datosEditados.foto }} style={styles.preview} resizeMode="cover" />
                            ) : (
                                <Text style={styles.mensajePreview}>Sin imagen.</Text>
                            )}
                            <Text style={styles.label}>Nombre:</Text><TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#999" value={datosEditados.nombre} onChangeText={(v) => manejoCambio("nombre", v)} />
                            <Text style={styles.label}>Marca:</Text><TextInput style={styles.input} placeholder="Marca" placeholderTextColor="#999" value={datosEditados.marca} onChangeText={(v) => manejoCambio("marca", v)} />
                            <Text style={styles.label}>Modelo:</Text><TextInput style={styles.input} placeholder="Modelo" placeholderTextColor="#999" value={datosEditados.modelo} onChangeText={(v) => manejoCambio("modelo", v)} />
                            <Text style={styles.label}>Precio de Compra:</Text><TextInput style={styles.input} placeholder="Precio compra" placeholderTextColor="#999" keyboardType="numeric" value={datosEditados.precio_compra} onChangeText={(v) => manejoCambio("precio_compra", v)} />
                            <Text style={styles.label}>Precio de Venta:</Text><TextInput style={styles.input} placeholder="Precio venta" placeholderTextColor="#999" keyboardType="numeric" value={datosEditados.precio_venta} onChangeText={(v) => manejoCambio("precio_venta", v)} />
                            <Text style={styles.label}>Stock:</Text><TextInput style={styles.input} placeholder="Stock" placeholderTextColor="#999" keyboardType="numeric" value={datosEditados.stock} onChangeText={(v) => manejoCambio("stock", v)} />
                        </ScrollView>
                        <View style={styles.filaBotones}>
                            <TouchableOpacity style={[styles.botonAccionModal, styles.cancelar]} onPress={cerrarModal}>
                                <Text style={styles.textoAccion}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.botonAccionModal, styles.confirmar]} onPress={guardarCambios}>
                                <Text style={styles.textoAccion}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// --- Estilos ---
const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, alignSelf: "stretch", backgroundColor: "#F7F8FA",marginTop: -17 },
    titulo: { fontSize: 24, fontWeight: "700", marginBottom: 15, color: "#333", textAlign: "center" },
    label: { fontWeight: "bold", color: '#555' },

    // === NUEVA BÚSQUEDA ===
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

    // Estilos de Tabla
    tablaWrapper: { backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    datosScrollVertical: {
        maxHeight: 450,
    },
    fila: { flexDirection: "row", alignItems: "center", minHeight: 50, borderBottomWidth: 1, borderBottomColor: '#eee' },
    filaPar: { backgroundColor: "#f8f8f8" },
    filaImpar: { backgroundColor: "#ffffff" },
    encabezado: { backgroundColor: COLOR_PRINCIPAL, borderBottomWidth: 0, paddingVertical: 10 },
    celda: { fontSize: 14, color: "#333", paddingHorizontal: 4, textAlign: "center", justifyContent: "center", alignItems: "center" },
    textoEncabezado: { fontWeight: "bold", fontSize: 14, color: "#fff", textAlign: "center" },
    
    // Anchos de Columna
    columnaImagen: { width: 70 }, columnaNombre: { width: 140 }, columnaMarca: { width: 90 },
    columnaModelo: { width: 90 }, columnaPC: { width: 80 }, columnaPV: { width: 80 }, 
    columnaStock: { width: 70 }, columnaAcciones: { width: 70 },

    imagenProducto: { width: 40, height: 40, borderRadius: 5 },
    contenedorBotones: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", width: "100%" },
    botonEditar: { backgroundColor: COLOR_ADVERTENCIA, padding: 7, borderRadius: 5, marginRight: 5, justifyContent: 'center', alignItems: 'center' },
    mensajeVacio: { padding: 20, textAlign: 'center', color: '#6c757d', fontStyle: 'italic' },

    // Estilos del Modal
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
    modal: {
        backgroundColor: "white",
        padding: 20, 
        borderRadius: 15,
        width: "70%",
        maxHeight: '90%',
        flexDirection: 'column',
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 5 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 10, 
        elevation: 10,
    },
    modalScrollView: {
        flexGrow: 1, 
        marginBottom: 10, 
    },
    textoModal: { fontSize: 20, fontWeight: "600", marginBottom: 15, textAlign: "center", color: "#333" },
    input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 16, backgroundColor: '#fefefe' },
    filaBotones: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    botonAccionModal: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, alignItems: "center" },
    cancelar: { backgroundColor: COLOR_CANCELAR },
    confirmar: { backgroundColor: COLOR_PRINCIPAL },
    textoAccion: { color: "white", fontWeight: "bold", fontSize: 16 },
    preview: { width: '100%', height: 80, borderRadius: 8, marginBottom: 10, backgroundColor: '#eee', borderWidth: 1, borderColor: '#ccc' },
    mensajePreview: { textAlign: 'center', color: '#999', marginBottom: 10, fontStyle: 'italic', padding: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
});

export default TablaProductos;
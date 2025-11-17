// src/components/TablaProductos.js (EDITAR = MISMAS VALIDACIONES QUE REGISTRAR + PRECIOS SIN DECIMALES)
import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BotonEliminarProducto from "./BotonEliminarProducto";
import { db } from "../database/firebaseconfig";
import { collection, onSnapshot, query } from "firebase/firestore";

const COLOR_PRINCIPAL = "#1E90FF";
const COLOR_ADVERTENCIA = "#FFC300";
const COLOR_CANCELAR = "#6c757d";

const TablaProductos = ({ eliminarProducto, editarProducto }) => {
    const [productos, setProductos] = useState([]);
    const [visible, setVisible] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [datosEditados, setDatosEditados] = useState({
        id: null, nombre: "", marca: "", modelo: "", precio_compra: "", precio_venta: "", stock: "", foto: "",
    });

    const [busqueda, setBusqueda] = useState("");
    const [productosFiltrados, setProductosFiltrados] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "Productos"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                precio_compra: parseFloat(doc.data().precio_compra) || 0,
                precio_venta: parseFloat(doc.data().precio_venta) || 0,
                stock: doc.data().stock || 0,
            }));
            setProductos(lista);
        });
        return () => unsubscribe();
    }, []);

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
            precio_compra: String(Math.round(producto.precio_compra ?? 0)),
            precio_venta: String(Math.round(producto.precio_venta ?? 0)),
            stock: String(producto.stock ?? 0),
            foto: producto.foto || "",
        });
        setVisible(true);
    };

    const cerrarModal = () => {
        setVisible(false);
        setProductoSeleccionado(null);
    };

    const guardarCambios = () => {
        // VALIDACIONES EXACTAMENTE IGUALES QUE EN REGISTRAR
        if (!datosEditados.nombre.trim() || !datosEditados.marca.trim() || !datosEditados.modelo.trim() ||
            !datosEditados.precio_compra.trim() || !datosEditados.precio_venta.trim() || !datosEditados.stock.trim()) {
            Alert.alert("Atención", "Complete todos los campos.");
            return;
        }

        const pc = parseFloat(datosEditados.precio_compra.replace(",", "."));
        const pv = parseFloat(datosEditados.precio_venta.replace(",", "."));
        const st = parseInt(datosEditados.stock, 10);

        if (isNaN(pc) || isNaN(pv) || isNaN(st)) {
            Alert.alert("Error", "Datos numéricos inválidos.");
            return;
        }

        editarProducto({
            id: datosEditados.id,
            nombre: datosEditados.nombre.trim(),
            marca: datosEditados.marca.trim(),
            modelo: datosEditados.modelo.trim(),
            precio_compra: Math.round(pc),
            precio_venta: Math.round(pv),
            stock: st,
            foto: datosEditados.foto.trim(),
        });

        cerrarModal();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Catálogo de Productos</Text>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.inputSearch}
                    placeholder="Buscar Productos"
                    value={busqueda}
                    onChangeText={setBusqueda}
                />
            </View>

            <ScrollView horizontal style={styles.tablaWrapper}>
                <View style={{ minWidth: 800 }}>
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
                                    <Text style={[styles.celda, styles.columnaPC]}>C${Math.round(item.precio_compra)}</Text>
                                    <Text style={[styles.celda, styles.columnaPV]}>C${Math.round(item.precio_venta)}</Text>
                                    <Text style={[styles.celda, styles.columnaStock]}>{item.stock}</Text>
                                    <View style={[styles.celda, styles.columnaAcciones]}>
                                        <View style={styles.contenedorBotones}>
                                            <TouchableOpacity style={styles.botonEditar} onPress={() => abrirModal(item)}>
                                                <Ionicons name="create-outline" size={16} color="#FFF" />
                                            </TouchableOpacity>
                                            <BotonEliminarProducto id={item.id} eliminarProducto={eliminarProducto} />
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* MODAL DE EDICIÓN CON LAS MISMAS VALIDACIONES QUE REGISTRAR */}
            <Modal visible={visible} animationType="fade" transparent onRequestClose={cerrarModal}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.textoModal}>Editar Producto: {datosEditados.nombre}</Text>
                        <ScrollView style={styles.modalScrollView}>
                            {/* FOTO URL */}
                            <Text style={styles.label}>URL de Foto:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://ejemplo.com/foto.jpg"
                                value={datosEditados.foto}
                                onChangeText={(v) => setDatosEditados(prev => ({ ...prev, foto: v.trim() }))}
                                autoCapitalize="none"
                            />
                            {datosEditados.foto ? (
                                <Image source={{ uri: datosEditados.foto }} style={styles.preview} resizeMode="cover" />
                            ) : (
                                <Text style={styles.mensajePreview}>Sin imagen.</Text>
                            )}

                            {/* NOMBRE: SOLO LETRAS Y ESPACIOS */}
                            <Text style={styles.label}>Nombre:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre"
                                value={datosEditados.nombre}
                                onChangeText={(v) => setDatosEditados(prev => ({ ...prev, nombre: v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') }))}
                            />

                            {/* MARCA: LETRAS, NÚMEROS Y ESPACIOS */}
                            <Text style={styles.label}>Marca:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Marca"
                                value={datosEditados.marca}
                                onChangeText={(v) => setDatosEditados(prev => ({ ...prev, marca: v.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '') }))}
                            />

                            {/* MODELO: LETRAS, NÚMEROS, GUIONES Y ESPACIOS */}
                            <Text style={styles.label}>Modelo:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Modelo"
                                value={datosEditados.modelo}
                                onChangeText={(v) => setDatosEditados(prev => ({ ...prev, modelo: v.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-]/g, '') }))}
                            />

                            {/* PRECIO COMPRA: SOLO NÚMEROS, PUNTO Y COMA */}
                            <Text style={styles.label}>Precio de Compra:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={datosEditados.precio_compra}
                                onChangeText={(v) => setDatosEditados(prev => ({ ...prev, precio_compra: v.replace(/[^0-9.,]/g, '') }))}
                            />

                            {/* PRECIO VENTA: SOLO NÚMEROS, PUNTO Y COMA */}
                            <Text style={styles.label}>Precio de Venta:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={datosEditados.precio_venta}
                                onChangeText={(v) => setDatosEditados(prev => ({ ...prev, precio_venta: v.replace(/[^0-9.,]/g, '') }))}
                            />

                            {/* STOCK: SOLO NÚMEROS ENTEROS */}
                            <Text style={styles.label}>Stock:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={datosEditados.stock}
                                onChangeText={(v) => setDatosEditados(prev => ({ ...prev, stock: v.replace(/[^0-9]/g, '') }))}
                            />
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

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, alignSelf: "stretch", backgroundColor: "#F7F8FA", marginTop: -17 },
    titulo: { fontSize: 24, fontWeight: "700", marginBottom: 15, color: "#333", textAlign: "center" },
    label: { fontWeight: "bold", color: '#555' },

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
    datosScrollVertical: { maxHeight: 450 },
    fila: { flexDirection: "row", alignItems: "center", minHeight: 50, borderBottomWidth: 1, borderBottomColor: '#eee' },
    filaPar: { backgroundColor: "#f8f8f8" },
    filaImpar: { backgroundColor: "#ffffff" },
    encabezado: { backgroundColor: COLOR_PRINCIPAL, borderBottomWidth: 0, paddingVertical: 10 },
    celda: { fontSize: 14, color: "#333", paddingHorizontal: 4, textAlign: "center", justifyContent: "center", alignItems: "center" },
    textoEncabezado: { fontWeight: "bold", fontSize: 14, color: "#fff", textAlign: "center" },

    columnaImagen: { width: 70 }, columnaNombre: { width: 140 }, columnaMarca: { width: 90 },
    columnaModelo: { width: 90 }, columnaPC: { width: 80 }, columnaPV: { width: 80 },
    columnaStock: { width: 70 }, columnaAcciones: { width: 70 },

    imagenProducto: { width: 40, height: 40, borderRadius: 5 },
    contenedorBotones: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", width: "100%" },
    botonEditar: { backgroundColor: COLOR_ADVERTENCIA, padding: 7, borderRadius: 5, marginRight: 5, justifyContent: 'center', alignItems: 'center' },
    mensajeVacio: { padding: 20, textAlign: 'center', color: '#6c757d', fontStyle: 'italic' },

    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
    modal: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 15,
        width: "70%",
        maxHeight: '90%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    modalScrollView: { flexGrow: 1, marginBottom: 10 },
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
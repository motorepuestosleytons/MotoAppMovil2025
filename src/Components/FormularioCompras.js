// src/components/FormularioCompras.js (CORREGIDO: getDocs AHORA SÍ FUNCIONA)
import React, { useState, useEffect } from "react";
import {
  View, TextInput, StyleSheet, Text, Modal, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from "react-native";
import { db } from "../database/firebaseconfig";
import { 
  collection, addDoc, doc, updateDoc, increment, 
  onSnapshot, query, getDocs  // ← YA ESTABA, PERO AHORA FUNCIONA PORQUE db ESTÁ BIEN INICIALIZADO
} from "firebase/firestore";   // ← ESTE ES EL IMPORT CORRECTO (v9+ modular)

const FormularioCompras = ({ cargarDatos }) => {
  const [proveedorData, setProveedorData] = useState(null);
  const [busquedaProveedorNombre, setBusquedaProveedorNombre] = useState("");
  const [itemsCompra, setItemsCompra] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productoData, setProductoData] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [listaProveedores, setListaProveedores] = useState([]);
  const [listaProductos, setListaProductos] = useState([]);
  const [cargandoCompra, setCargandoCompra] = useState(false);

  const resetFormulario = () => {
    setProveedorData(null);
    setBusquedaProveedorNombre("");
    setItemsCompra([]);
    setBusquedaProducto("");
    setCantidad("");
    setProductoData(null);
  };

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Proveedores"));
        const snap = await getDocs(collection(db, "Proveedores"));
        setListaProveedores(snap.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre_proveedor || doc.data().nombre || "Sin nombre",
          documento: doc.data().documento || "N/A"
        })));
      } catch (error) {}
    };
    cargarProveedores();

    const q = query(collection(db, "Productos"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListaProductos(snapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre || "Sin nombre",
        precio_compra: parseFloat(doc.data().precio_compra) || 0,
        stock: doc.data().stock || 0
      })));
    });

    return () => unsubscribe();
  }, []);

  const resultadosProveedor = busquedaProveedorNombre.trim()
    ? listaProveedores.filter(p => p.nombre.toLowerCase().includes(busquedaProveedorNombre.toLowerCase().trim()))
    : [];

  const resultadosProducto = busquedaProducto.trim()
    ? listaProductos.filter(p => p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase().trim()))
    : [];

  const seleccionarProveedor = (prov) => {
    setProveedorData(prov);
    setBusquedaProveedorNombre(prov.nombre);
  };

  const seleccionarProducto = (prod) => {
    setProductoData(prod);
    setBusquedaProducto(prod.nombre);
  };

  const calcularTotal = () => itemsCompra.reduce((sum, item) => sum + item.total_item, 0);

  const agregarItem = () => {
    if (!productoData || !cantidad || isNaN(cantidad) || cantidad <= 0) {
      Alert.alert("Error", "Selecciona un producto y cantidad válida.");
      return;
    }

    const qty = parseInt(cantidad);
    const precio = parseFloat(productoData.precio_compra);
    const total = qty * precio;

    setItemsCompra(prev => [...prev, {
      id_producto: productoData.id,
      nombre_producto: productoData.nombre,
      precio_unitario: precio,
      cantidad: qty,
      total_item: total,
    }]);

    setBusquedaProducto("");
    setCantidad("");
    setProductoData(null);
    setModalDetalleVisible(false);
  };

  const eliminarItem = (index) => {
    setItemsCompra(prev => prev.filter((_, i) => i !== index));
  };

  const guardarCompra = async () => {
    if (!proveedorData || itemsCompra.length === 0) {
      Alert.alert("Error", "Selecciona proveedor y al menos un producto.");
      return;
    }

    setCargandoCompra(true);

    try {
      const total = calcularTotal();

      const compraRef = await addDoc(collection(db, "Compras"), {
        fecha_compra: new Date().toISOString(),
        id_documento_proveedor: proveedorData.id,
        nombre_proveedor: proveedorData.nombre,
        total_compra: total,
      });

      const detalleRef = collection(db, `Compras/${compraRef.id}/detalle_compra`);
      await Promise.all(itemsCompra.map(item => addDoc(detalleRef, item)));

      await Promise.all(itemsCompra.map(async (item) => {
        const prodRef = doc(db, "Productos", item.id_producto);
        await updateDoc(prodRef, { stock: increment(item.cantidad) });
      }));

      if (cargarDatos) cargarDatos();
      resetFormulario();
      setModalVisible(false);
      Alert.alert("Éxito", "Compra registrada correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la compra");
    } finally {
      setCargandoCompra(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          style={styles.botonRegistro} 
          onPress={() => setModalVisible(true)}
          disabled={cargandoCompra}
        >
          <Text style={styles.textoBoton}>+ Nueva Compra</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingContainer}>
            <View style={styles.modalContenido}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.tituloModal}>Registrar Compra</Text>

                <Text style={styles.subtitulo}>Buscar Proveedor</Text>
                <TextInput style={styles.input} placeholder="Nombre del proveedor..." value={busquedaProveedorNombre} onChangeText={setBusquedaProveedorNombre} />

                {busquedaProveedorNombre.trim() && (!proveedorData || proveedorData.nombre !== busquedaProveedorNombre) && (
                  resultadosProveedor.length > 0 ? (
                    <View style={styles.resultadoBusqueda}>
                      {resultadosProveedor.map(p => (
                        <TouchableOpacity key={p.id} style={styles.opcionBusqueda} onPress={() => seleccionarProveedor(p)}>
                          <Text style={styles.textoOpcion}>{p.nombre} (Doc: {p.documento})</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.errorSmall}>Proveedor no encontrado</Text>
                  )
                )}

                {proveedorData && (
                  <View style={styles.cardProveedor}>
                    <Text style={styles.cardTitle}>Proveedor seleccionado</Text>
                    <Text style={styles.cardText}>{proveedorData.nombre}</Text>
                    <Text style={styles.cardSubText}>Doc: {proveedorData.documento}</Text>
                  </View>
                )}

                <View style={styles.detalleHeader}>
                  <Text style={styles.subtitulo}>Productos ({itemsCompra.length})</Text>
                  <TouchableOpacity style={styles.botonAgregar} onPress={() => setModalDetalleVisible(true)}>
                    <Text style={styles.textoBoton}>+ Item</Text>
                  </TouchableOpacity>
                </View>

                {itemsCompra.map((item, i) => {
                  const stockActual = listaProductos.find(p => p.id === item.id_producto)?.stock || 0;
                  return (
                    <View key={i} style={styles.carritoItem}>
                      <View style={styles.itemLeft}>
                        <Text style={styles.itemNombre}>{item.nombre_producto}</Text>
                        <Text style={styles.itemCantidad}>{item.cantidad} x C${item.precio_unitario.toFixed(2)}</Text>
                        <Text style={styles.stockInfo}>Stock: {stockActual}</Text>
                      </View>
                      <Text style={styles.itemTotalCarrito}>C${item.total_item.toFixed(2)}</Text>
                      <TouchableOpacity style={styles.itemEliminarBoton} onPress={() => eliminarItem(i)}>
                        <Text style={styles.eliminarItemTexto}>×</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <Text style={styles.totalFactura}>
                  TOTAL: C${calcularTotal().toFixed(2)}
                </Text>
              </ScrollView>

              <View style={styles.botonesContainer}>
                <TouchableOpacity 
                  style={[styles.boton, styles.botonIzquierda]} 
                  onPress={() => { resetFormulario(); setModalVisible(false); }}
                  disabled={cargandoCompra}
                >
                  <Text style={styles.textoBoton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.boton, styles.botonDerecha, cargandoCompra && styles.botonDisabled]} 
                  onPress={guardarCompra}
                  disabled={cargandoCompra}
                >
                  {cargandoCompra ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.textoBoton}>Guardar Compra</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL AGREGAR PRODUCTO - AHORA SÍ FUNCIONA EL DETALLE */}
      <Modal visible={modalDetalleVisible} animationType="fade" transparent>
        <View style={styles.modalFondo}>
          <View style={styles.modalCompraCompacto}>
            <Text style={styles.tituloModalSmall}>+ Agregar Producto</Text>

            <TextInput 
              style={styles.inputSmall} 
              placeholder="Buscar producto..." 
              value={busquedaProducto} 
              onChangeText={setBusquedaProducto} 
            />

            {/* RESULTADOS DE BÚSQUEDA */}
            {busquedaProducto.trim() && (!productoData || !busquedaProducto.includes(productoData.nombre)) && resultadosProducto.length > 0 && (
              <View style={styles.resultadoBusquedaSmall}>
                {resultadosProducto.slice(0, 5).map(p => (
                  <TouchableOpacity key={p.id} style={styles.opcionSmall} onPress={() => seleccionarProducto(p)}>
                    <View>
                      <Text style={styles.textoOpcionSmall}>{p.nombre}</Text>
                      <Text style={styles.stockSmall}>Stock: {p.stock}</Text>
                    </View>
                    <Text style={styles.precioSmall}>C${p.precio_compra.toFixed(2)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* DETALLE DEL PRODUCTO SELECCIONADO - AHORA SÍ SE VE */}
            {productoData && (
              <View style={styles.cardProductoSmall}>
                <Text style={styles.nombreProductoSmall}>{productoData.nombre}</Text>
                <Text style={styles.precioProductoSmall}>Precio: C${productoData.precio_compra.toFixed(2)} c/u</Text>
                <Text style={styles.stockDisponible}>Stock actual: {productoData.stock}</Text>
              </View>
            )}

            <TextInput 
              style={styles.inputSmall} 
              placeholder="Cantidad" 
              value={cantidad} 
              onChangeText={setCantidad} 
              keyboardType="numeric" 
            />

            <View style={styles.botonesSmall}>
              <TouchableOpacity 
                style={[styles.botonSmall, styles.botonCancelarSmall]} 
                onPress={() => {
                  setBusquedaProducto(""); 
                  setCantidad(""); 
                  setProductoData(null); 
                  setModalDetalleVisible(false);
                }}
              >
                <Text style={styles.textoBotonSmall}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.botonSmall, styles.botonAgregarSmall]} 
                onPress={agregarItem}
                disabled={!productoData || !cantidad || parseInt(cantidad) <= 0}
              >
                <Text style={styles.textoBotonSmall}>Añadir al Carrito</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 0, marginTop: -5 },
  headerButtons: { flexDirection: "row", justifyContent: "center", marginBottom: 15, paddingHorizontal: 10 },
  botonRegistro: { backgroundColor: "#800080", padding: 16, borderRadius: 12, alignItems: "center", justifyContent: "center", flex: 0.8, elevation: 5 },
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 17, textAlign: "center" },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginVertical: 12, textAlign: "center", color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 15, padding: 14, borderRadius: 10, marginHorizontal: 10, backgroundColor: "#fff", fontSize: 16 },
  botonesContainer: { flexDirection: "row", justifyContent: "center", gap: 15, marginTop: 25, paddingHorizontal: 20, paddingBottom: 20 },
  boton: { minWidth: 120, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  botonIzquierda: { backgroundColor: "#6c757d" },
  botonDerecha: { backgroundColor: "#28A745" },
  botonDisabled: { backgroundColor: "#aaa", opacity: 0.7 },
  modalFondo: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.85)" },
  keyboardAvoidingContainer: { flex: 1, justifyContent: "center" },
  modalContenido: { backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 18, maxHeight: "92%", elevation: 15 },
  scrollContent: { paddingHorizontal: 22, paddingTop: 25 },
  tituloModal: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#800080" },
  resultadoBusqueda: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, maxHeight: 170, marginBottom: 15, overflow: "hidden" },
  opcionBusqueda: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  textoOpcion: { fontSize: 15, textAlign: "center" },
  errorSmall: { color: "#999", padding: 12, textAlign: "center", fontStyle: "italic" },
  cardProveedor: { backgroundColor: "#f3e8ff", padding: 16, borderRadius: 12, marginVertical: 12, borderLeftWidth: 6, borderLeftColor: "#800080" },
  cardTitle: { fontSize: 14, color: "#666", marginBottom: 5, textAlign: "center" },
  cardText: { fontSize: 18, color: "#333", fontWeight: "bold", textAlign: "center" },
  cardSubText: { fontSize: 14, color: "#777", textAlign: "center" },
  detalleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 12 },
  botonAgregar: { backgroundColor: "#FFC107", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  carritoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8f9fa", padding: 14, borderRadius: 12, marginBottom: 10 },
  itemLeft: { flex: 4 },
  itemNombre: { fontSize: 16, fontWeight: "bold", color: "#333" },
  itemCantidad: { fontSize: 13, color: "#666", marginTop: 3 },
  stockInfo: { fontSize: 12, color: "#28A745", fontWeight: "bold", marginTop: 4 },
  itemTotalCarrito: { fontWeight: "bold", fontSize: 17, color: "#800080" },
  itemEliminarBoton: { width: 36, height: 36, backgroundColor: "#ffebee", borderRadius: 18, justifyContent: "center", alignItems: "center" },
  eliminarItemTexto: { color: "#d32f2f", fontSize: 20, fontWeight: "bold" },
  totalFactura: { fontSize: 26, fontWeight: "bold", textAlign: "right", marginTop: 25, color: "#000", backgroundColor: "#e1bee7", padding: 16, borderRadius: 12, borderWidth: 4, borderColor: "#800080" },

  modalCompraCompacto: { backgroundColor: "#fff", marginHorizontal: 30, borderRadius: 18, padding: 22, elevation: 20 },
  tituloModalSmall: { fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#800080", marginBottom: 18 },
  inputSmall: { borderWidth: 1, borderColor: "#ddd", padding: 14, borderRadius: 12, marginBottom: 14, fontSize: 16, backgroundColor: "#fff" },
  resultadoBusquedaSmall: { maxHeight: 130, marginBottom: 14, borderWidth: 1, borderColor: "#eee", borderRadius: 10, overflow: "hidden" },
  opcionSmall: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  textoOpcionSmall: { fontSize: 15, color: "#333" },
  stockSmall: { fontSize: 12, color: "#28A745", fontWeight: "bold" },
  precioSmall: { fontSize: 15, color: "#800080", fontWeight: "bold" },
  cardProductoSmall: { backgroundColor: "#fff8e1", padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 6, borderLeftColor: "#FFC107" },
  nombreProductoSmall: { fontSize: 18, fontWeight: "bold", color: "#333", textAlign: "center" },
  precioProductoSmall: { fontSize: 15, color: "#666", marginTop: 5, textAlign: "center" },
  stockDisponible: { fontSize: 15, color: "#28A745", fontWeight: "bold", marginTop: 8, textAlign: "center" },
  botonesSmall: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, gap: 12 },
  botonSmall: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  botonCancelarSmall: { backgroundColor: "#6c757d" },
  botonAgregarSmall: { backgroundColor: "#28A745" },
  textoBotonSmall: { color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: "center" },
});

export default FormularioCompras;
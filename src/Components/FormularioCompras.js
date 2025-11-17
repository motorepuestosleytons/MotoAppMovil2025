// src/components/FormularioCompras.js (SUMA STOCK EN TIEMPO REAL)
import React, { useState, useEffect } from "react";
import {
  View, TextInput, StyleSheet, Text, Modal, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

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
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 2500);
  };

  const resetFormulario = () => {
    setProveedorData(null);
    setBusquedaProveedorNombre("");
    setItemsCompra([]);
    setBusquedaProducto("");
    setCantidad("");
    setProductoData(null);
  };

  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        const provSnap = await getDocs(collection(db, "Proveedores"));
        setListaProveedores(provSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre_proveedor || data.nombre || '',
            documento: data.documento || 'N/A'
          };
        }));

        const prodSnap = await getDocs(collection(db, "Productos"));
        setListaProductos(prodSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre || '',
            precio_compra: parseFloat(data.precio_compra) || 0
          };
        }));
      } catch (error) {
        console.error("Error al cargar maestros:", error);
      }
    };
    cargarMaestros();
  }, []);

  const resultadosProveedor = busquedaProveedorNombre
    ? listaProveedores.filter(p => p.nombre.toLowerCase().includes(busquedaProveedorNombre.toLowerCase().trim()))
    : [];

  const seleccionarProveedor = (prov) => {
    setProveedorData(prov);
    setBusquedaProveedorNombre(prov.nombre);
  };

  const resultadosProducto = busquedaProducto
    ? listaProductos.filter(p => p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase().trim()))
    : [];

  const seleccionarProducto = (prod) => {
    setProductoData(prod);
    setBusquedaProducto(prod.nombre);
  };

  const calcularTotal = () => itemsCompra.reduce((sum, item) => sum + item.total_item, 0);

  const agregarItem = () => {
    if (!productoData || !cantidad || isNaN(cantidad) || cantidad <= 0) {
      Alert.alert("Error", "Selecciona un producto y cantidad válida (mayor a 0).");
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

  // === GUARDAR COMPRA Y SUMAR STOCK ===
  const guardarCompra = async () => {
    if (!proveedorData || itemsCompra.length === 0) {
      Alert.alert("Error", "Selecciona proveedor y al menos un producto.");
      return;
    }

    const total = calcularTotal();

    try {
      // 1. Guardar compra principal
      const compraRef = await addDoc(collection(db, "Compras"), {
        fecha_compra: new Date().toISOString(),
        id_documento_proveedor: proveedorData.id,
        nombre_proveedor: proveedorData.nombre,
        total_compra: total,
      });

      // 2. Guardar detalle
      const detalleRef = collection(db, `Compras/${compraRef.id}/detalle_compra`);
      const promesasDetalle = itemsCompra.map(item => addDoc(detalleRef, item));
      await Promise.all(promesasDetalle);

      // 3. SUMAR STOCK ATÓMICO
      const promesasStock = itemsCompra.map(async (item) => {
        const prodRef = doc(db, "Productos", item.id_producto);
        await updateDoc(prodRef, {
          stock: increment(item.cantidad) // ← SUMA
        });
      });
      await Promise.all(promesasStock);

      // 4. Finalizar
      if (cargarDatos) cargarDatos();
      resetFormulario();
      setModalVisible(false);
      showToast("Compra registrada y stock actualizado", "success");
    } catch (error) {
      console.error("Error al guardar compra:", error);
      showToast("Error al guardar o actualizar stock", "error");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.botonRegistro} onPress={() => setModalVisible(true)}>
          <Text style={styles.textoBoton}>+ Nueva Compra</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL REGISTRO COMPRA */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingContainer}>
            <View style={styles.modalContenido}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.tituloModal}>Registrar Compra</Text>

                <Text style={styles.subtitulo}>Buscar Proveedor</Text>
                <TextInput style={styles.input} placeholder="Nombre..." value={busquedaProveedorNombre} onChangeText={setBusquedaProveedorNombre} />

                {busquedaProveedorNombre.trim() && proveedorData?.nombre !== busquedaProveedorNombre && (
                  resultadosProveedor.length > 0 ? (
                    <View style={styles.resultadoBusqueda}>
                      {resultadosProveedor.map(p => (
                        <TouchableOpacity key={p.id} style={styles.opcionBusqueda} onPress={() => seleccionarProveedor(p)}>
                          <Text>{p.nombre} (Doc: {p.documento})</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.errorSmall}>Proveedor no encontrado</Text>
                  )
                )}

                {proveedorData && (
                  <View style={styles.cardProveedor}>
                    <Text style={styles.cardTitle}>Proveedor</Text>
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

                {itemsCompra.map((item, i) => (
                  <View key={i} style={styles.carritoItem}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemNombre}>{item.nombre_producto}</Text>
                      <Text style={styles.itemCantidad}>{item.cantidad} x ${item.precio_unitario.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.itemTotalCarrito}>${item.total_item.toFixed(2)}</Text>
                    <TouchableOpacity style={styles.itemEliminarBoton} onPress={() => eliminarItem(i)}>
                      <Text style={styles.eliminarItemTexto}>X</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <Text style={styles.totalFactura}>TOTAL: C${calcularTotal().toFixed(2)}</Text>
              </ScrollView>

              <View style={styles.botonesContainer}>
                <TouchableOpacity style={[styles.boton, styles.botonIzquierda]} onPress={() => { resetFormulario(); setModalVisible(false); }}>
                  <Text style={styles.textoBoton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.boton, styles.botonDerecha]} onPress={guardarCompra}>
                  <Text style={styles.textoBoton}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL AGREGAR PRODUCTO */}
      <Modal visible={modalDetalleVisible} animationType="fade" transparent>
        <View style={styles.modalFondo}>
          <View style={styles.modalCompraCompacto}>
            <Text style={styles.tituloModalSmall}>+ Producto</Text>

            <TextInput style={styles.inputSmall} placeholder="Buscar..." value={busquedaProducto} onChangeText={setBusquedaProducto} />

            {busquedaProducto.trim() && productoData?.nombre !== busquedaProducto && (
              resultadosProducto.length > 0 ? (
                <View style={styles.resultadoBusquedaSmall}>
                  {resultadosProducto.slice(0, 4).map(p => (
                    <TouchableOpacity key={p.id} style={styles.opcionSmall} onPress={() => seleccionarProducto(p)}>
                      <Text style={styles.textoOpcionSmall}>{p.nombre}</Text>
                      <Text style={styles.precioSmall}>C${p.precio_compra}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.noResultado}>No encontrado</Text>
              )
            )}

            {productoData && (
              <View style={styles.cardProductoSmall}>
                <Text style={styles.nombreProductoSmall}>{productoData.nombre}</Text>
                <Text style={styles.precioProductoSmall}>C${productoData.precio_compra} c/u</Text>
              </View>
            )}

            <TextInput style={styles.inputSmall} placeholder="Cantidad" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" />

            <View style={styles.botonesSmall}>
              <TouchableOpacity style={[styles.botonSmall, styles.botonCancelarSmall]} onPress={() => {
                setBusquedaProducto(""); setCantidad(""); setProductoData(null); setModalDetalleVisible(false);
              }}>
                <Text style={styles.textoBotonSmall}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botonSmall, styles.botonAgregarSmall]} onPress={agregarItem} disabled={!productoData || !cantidad}>
                <Text style={styles.textoBotonSmall}>Añadir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TOAST */}
      {toast.visible && (
        <View style={[styles.toast, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
          <Ionicons name={toast.type === 'success' ? "checkmark-circle" : "close-circle"} size={20} color="#fff" />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 0,marginTop: -5 },
  headerButtons: { flexDirection: "row", justifyContent: "center", marginBottom: 15, paddingHorizontal: 10 },
  botonRegistro: { backgroundColor: "#800080", padding: 12, borderRadius: 8, alignItems: "center", flex: 0.6 },
  textoBoton: { color: "#fff", fontWeight: "bold" },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginVertical: 12, textAlign: "center", color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 15, padding: 10, borderRadius: 5, marginHorizontal: 10 },
  botonesContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, paddingHorizontal: 20, paddingBottom: 15 },
  boton: { flex: 1, padding: 10, borderRadius: 5, alignItems: "center" },
  botonIzquierda: { backgroundColor: "#888", marginRight: 5 },
  botonDerecha: { backgroundColor: "#28A745", marginLeft: 5 },
  modalFondo: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.7)" },
  keyboardAvoidingContainer: { flex: 1, justifyContent: "center" },
  modalContenido: { backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 10, flex: 1, paddingVertical: 10, marginVertical: 75  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 10 },
  tituloModal: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#800080" },
  resultadoBusqueda: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 15, maxHeight: 150, marginTop: 5 },
  opcionBusqueda: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  errorSmall: { color: "gray", padding: 8, textAlign: "center", fontSize: 13 },
  cardProveedor: { backgroundColor: "#F3E5F5", padding: 12, borderRadius: 8, marginVertical: 10, borderLeftWidth: 4, borderLeftColor: "#800080" },
  cardTitle: { fontSize: 13, color: "#666", marginBottom: 3 },
  cardText: { fontSize: 16, color: "#333", fontWeight: "bold" },
  cardSubText: { fontSize: 13, color: "#777" },
  detalleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15, marginBottom: 8 },
  botonAgregar: { backgroundColor: "#FFC107", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 5 },
  carritoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f9f9f9", padding: 10, borderRadius: 6, marginBottom: 6 },
  itemLeft: { flex: 4 },
  itemNombre: { fontSize: 14, fontWeight: "bold", color: "#333" },
  itemCantidad: { fontSize: 12, color: "#666" },
  itemTotalCarrito: { fontWeight: "bold", fontSize: 15, color: "#800080" },
  itemEliminarBoton: { width: 28, alignItems: "center" },
  eliminarItemTexto: { color: "#DC3545", fontSize: 18, fontWeight: "bold" },
  totalFactura: { fontSize: 21, fontWeight: "bold", textAlign: "right", marginTop: 15, color: "#000", backgroundColor: "#E1BEE7", padding: 10, borderRadius: 5, borderWidth: 2, borderColor: "#800080" },

  modalCompraCompacto: { backgroundColor: "#fff", marginHorizontal: 30, borderRadius: 12, padding: 16, maxHeight: "90%", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
  tituloModalSmall: { fontSize: 18, fontWeight: "bold", textAlign: "center", color: "#800080", marginBottom: 12 },
  inputSmall: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 15 },
  resultadoBusquedaSmall: { maxHeight: 100, marginBottom: 10 },
  opcionSmall: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 5, borderBottomWidth: 1, borderBottomColor: "#eee" },
  textoOpcionSmall: { fontSize: 14, color: "#333" },
  precioSmall: { fontSize: 13, color: "#800080", fontWeight: "bold" },
  noResultado: { textAlign: "center", color: "#999", fontSize: 13, marginBottom: 8 },
  cardProductoSmall: { backgroundColor: "#FFF8E1", padding: 10, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: "#FFC107" },
  nombreProductoSmall: { fontSize: 15, fontWeight: "bold", color: "#333" },
  precioProductoSmall: { fontSize: 13, color: "#666", marginTop: 2 },
  botonesSmall: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  botonSmall: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  botonCancelarSmall: { backgroundColor: "#ccc", marginRight: 6 },
  botonAgregarSmall: { backgroundColor: "#28A745", marginLeft: 6 },
  textoBotonSmall: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  toast: { position: 'absolute', bottom: 100, left: 20, right: 20, padding: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center', elevation: 10 },
  toastSuccess: { backgroundColor: '#28A745' },
  toastError: { backgroundColor: '#DC3545' },
  toastText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 }
});

export default FormularioCompras;
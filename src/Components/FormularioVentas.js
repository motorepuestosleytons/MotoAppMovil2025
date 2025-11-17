// src/components/FormularioVentas.js (STOCK EN TIEMPO REAL + SIN NEGATIVOS)
import React, { useState, useEffect } from "react";
import {
  View, TextInput, StyleSheet, Text, Modal, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { db } from "../database/firebaseconfig";
import { 
  collection, addDoc, getDocs, doc, updateDoc, increment, 
  onSnapshot, query, where 
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import EstadisticasModal from "../views/EstadisticasModal";

const FormularioVentas = ({ cargarDatos }) => {
  const [clienteData, setClienteData] = useState(null);
  const [busquedaClienteNombre, setBusquedaClienteNombre] = useState("");
  const [itemsVenta, setItemsVenta] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productoData, setProductoData] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [listaClientes, setListaClientes] = useState([]);
  const [listaProductos, setListaProductos] = useState([]);
  const [modalStatsVisible, setModalStatsVisible] = useState(false);

  const resetFormularioVenta = () => {
    setClienteData(null);
    setBusquedaClienteNombre("");
    setItemsVenta([]);
    setBusquedaProducto("");
    setCantidad("");
    setProductoData(null);
  };

  // === CARGA INICIAL + ESCUCHA EN TIEMPO REAL DE PRODUCTOS ===
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const clientesSnap = await getDocs(collection(db, "Clientes"));
        setListaClientes(clientesSnap.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre,
          cedula: doc.data().cedula,
        })));
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    };

    cargarClientes();

    // ESCUCHA EN TIEMPO REAL DE TODOS LOS PRODUCTOS
    const q = query(collection(db, "Productos"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productosActualizados = snapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
        precio_venta: doc.data().precio_venta,
        stock: doc.data().stock || 0,
      }));
      setListaProductos(productosActualizados);
    });

    return () => unsubscribe();
  }, []);

  const resultadosCliente = busquedaClienteNombre
    ? listaClientes.filter(c => c.nombre.toLowerCase().includes(busquedaClienteNombre.toLowerCase().trim()))
    : [];

  const seleccionarCliente = (cliente) => {
    setClienteData(cliente);
    setBusquedaClienteNombre(cliente.nombre);
  };

  const resultadosProducto = busquedaProducto
    ? listaProductos.filter(p => p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase().trim()))
    : [];

  const seleccionarProducto = (producto) => {
    setProductoData(producto);
    setBusquedaProducto(producto.nombre);
  };

  const calcularTotalFactura = () => itemsVenta.reduce((sum, item) => sum + item.total_item, 0);

  const agregarItemVenta = () => {
    if (!productoData || !cantidad || isNaN(cantidad) || cantidad <= 0) {
      Alert.alert("Error", "Selecciona un producto y cantidad válida.");
      return;
    }

    const qty = parseInt(cantidad);
    const precio = parseFloat(productoData.precio_venta);
    const total = qty * precio;

    // === STOCK EN TIEMPO REAL (de listaProductos actualizada) ===
    const itemExistente = itemsVenta.find(i => i.id_producto === productoData.id);
    const totalEnCarrito = itemExistente ? itemExistente.cantidad : 0;
    const totalSolicitado = totalEnCarrito + qty;

    // Usa stock actualizado desde Firestore
    if (totalSolicitado > productoData.stock) {
      const disponible = productoData.stock - totalEnCarrito;
      Alert.alert(
        "Stock Insuficiente",
        `Solo hay ${productoData.stock} unidad${productoData.stock === 1 ? '' : 'es'} en stock.\n` +
        `Ya tienes ${totalEnCarrito} en el carrito.\n` +
        `Máximo disponible: ${disponible}`,
        [{ text: "OK" }]
      );
      return;
    }

    // === AGREGA O ACTUALIZA ITEM ===
    if (itemExistente) {
      setItemsVenta(prev => prev.map(item =>
        item.id_producto === productoData.id
          ? { ...item, cantidad: item.cantidad + qty, total_item: (item.cantidad + qty) * precio }
          : item
      ));
    } else {
      setItemsVenta(prev => [...prev, {
        id_producto: productoData.id,
        nombre_producto: productoData.nombre,
        precio_unitario: precio,
        cantidad: qty,
        total_item: total,
      }]);
    }

    setBusquedaProducto("");
    setCantidad("");
    setProductoData(null);
    setModalDetalleVisible(false);
  };

  const eliminarItemVenta = (index) => {
    setItemsVenta(prev => prev.filter((_, i) => i !== index));
  };

  // === GUARDAR VENTA + RESTAR STOCK (ATÓMICO) ===
  const guardarVenta = async () => {
    if (!clienteData || itemsVenta.length === 0) {
      Alert.alert("Error", "Selecciona cliente y al menos un producto.");
      return;
    }

    const total = calcularTotalFactura();

    try {
      // 1. CREAR VENTA
      const ventaRef = await addDoc(collection(db, "Ventas"), {
        fecha_venta: new Date().toISOString(),
        id_documento_cliente: clienteData.id,
        nombre_cliente: clienteData.nombre,
        total_factura: total,
        estado: "Recibido",
      });

      // 2. GUARDAR DETALLE
      const detalleRef = collection(db, `Ventas/${ventaRef.id}/detalle_venta`);
      const promesasDetalle = itemsVenta.map(item => addDoc(detalleRef, item));
      await Promise.all(promesasDetalle);

      // 3. RESTAR STOCK (ATÓMICO)
      const promesasStock = itemsVenta.map(async (item) => {
        const prodRef = doc(db, "Productos", item.id_producto);
        await updateDoc(prodRef, {
          stock: increment(-item.cantidad)
        });
      });
      await Promise.all(promesasStock);

      // 4. RECARGAR DATOS (opcional)
      if (cargarDatos) cargarDatos();

      resetFormularioVenta();
      setModalVisible(false);
      Alert.alert("Éxito", `Venta registrada. Stock actualizado automáticamente.`);
    } catch (error) {
      console.error("Error al guardar venta:", error);
      Alert.alert("Error", "No se pudo completar la venta.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.botonEstadisticas} onPress={() => setModalStatsVisible(true)}>
          <Ionicons name="stats-chart" size={20} color="#fff" />
          <Text style={styles.textoBoton}>Estadísticas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonRegistro} onPress={() => setModalVisible(true)}>
          <Text style={styles.textoBoton}>+ Nueva Venta</Text>
        </TouchableOpacity>
      </View>

      <EstadisticasModal visible={modalStatsVisible} onClose={() => setModalStatsVisible(false)} />

      {/* === MODAL REGISTRO VENTA === */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingContainer}>
            <View style={styles.modalContenido}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.tituloModal}>Registrar Venta</Text>

                <Text style={styles.subtitulo}>Buscar Cliente</Text>
                <TextInput style={styles.input} placeholder="Nombre..." value={busquedaClienteNombre} onChangeText={setBusquedaClienteNombre} />

                {busquedaClienteNombre.trim() && clienteData?.nombre !== busquedaClienteNombre && (
                  resultadosCliente.length > 0 ? (
                    <View style={styles.resultadoBusqueda}>
                      {resultadosCliente.map(c => (
                        <TouchableOpacity key={c.id} style={styles.opcionBusqueda} onPress={() => seleccionarCliente(c)}>
                          <Text>{c.nombre} (Cédula: {c.cedula})</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.errorSmall}>Cliente no encontrado</Text>
                  )
                )}

                {clienteData && (
                  <View style={styles.cardCliente}>
                    <Text style={styles.cardTitle}>Cliente</Text>
                    <Text style={styles.cardText}>{clienteData.nombre}</Text>
                    <Text style={styles.cardSubText}>Cédula: {clienteData.cedula}</Text>
                  </View>
                )}

                <View style={styles.detalleHeader}>
                  <Text style={styles.subtitulo}>Productos ({itemsVenta.length})</Text>
                  <TouchableOpacity style={styles.botonAgregar} onPress={() => setModalDetalleVisible(true)}>
                    <Text style={styles.textoBoton}>+ Item</Text>
                  </TouchableOpacity>
                </View>

                {itemsVenta.map((item, i) => {
                  const prod = listaProductos.find(p => p.id === item.id_producto);
                  const stockActual = prod ? prod.stock : 0;
                  const enCarrito = itemsVenta.filter(it => it.id_producto === item.id_producto).reduce((s, it) => s + it.cantidad, 0);
                  const restante = stockActual - enCarrito + item.cantidad; // Corrige visual
                  return (
                    <View key={i} style={styles.carritoItem}>
                      <View style={styles.itemLeft}>
                        <Text style={styles.itemNombre}>{item.nombre_producto}</Text>
                        <Text style={styles.itemCantidad}>{item.cantidad} x ${item.precio_unitario.toFixed(2)}</Text>
                        <Text style={[styles.stockInfo, restante <= 0 && { color: '#DC3545' }]}>
                          Stock restante: {restante}
                        </Text>
                      </View>
                      <Text style={styles.itemTotalCarrito}>${item.total_item.toFixed(2)}</Text>
                      <TouchableOpacity style={styles.itemEliminarBoton} onPress={() => eliminarItemVenta(i)}>
                        <Text style={styles.eliminarItemTexto}>X</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <Text style={styles.totalFactura}>TOTAL: C${calcularTotalFactura().toFixed(2)}</Text>
              </ScrollView>

              <View style={styles.botonesContainer}>
                <TouchableOpacity style={[styles.boton, styles.botonIzquierda]} onPress={() => { resetFormularioVenta(); setModalVisible(false); }}>
                  <Text style={styles.textoBoton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.boton, styles.botonDerecha]} onPress={guardarVenta}>
                  <Text style={styles.textoBoton}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* === MODAL AGREGAR PRODUCTO === */}
      <Modal visible={modalDetalleVisible} animationType="fade" transparent>
        <View style={styles.modalFondo}>
          <View style={styles.modalCompraCompacto}>
            <Text style={styles.tituloModalSmall}>+ Producto</Text>

            <TextInput style={styles.inputSmall} placeholder="Buscar..." value={busquedaProducto} onChangeText={setBusquedaProducto} />

            {busquedaProducto.trim() && productoData?.nombre !== busquedaProducto && (
              resultadosProducto.length > 0 ? (
                <View style={styles.resultadoBusquedaSmall}>
                  {resultadosProducto.slice(0, 4).map(p => {
                    const enCarrito = itemsVenta.find(i => i.id_producto === p.id)?.cantidad || 0;
                    const disponible = p.stock - enCarrito;
                    return (
                      <TouchableOpacity 
                        key={p.id} 
                        style={[styles.opcionSmall, disponible <= 0 && { opacity: 0.5 }]} 
                        onPress={() => seleccionarProducto(p)} 
                        disabled={disponible <= 0}
                      >
                        <View>
                          <Text style={[styles.textoOpcionSmall, disponible <= 0 && { color: '#ccc' }]}>{p.nombre}</Text>
                          <Text style={styles.stockSmall}>
                            Stock: {p.stock} | Disp: {disponible > 0 ? disponible : 0}
                          </Text>
                        </View>
                        <Text style={styles.precioSmall}>C${p.precio_venta}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.noResultado}>No encontrado</Text>
              )
            )}

            {productoData && (
              <View style={styles.cardProductoSmall}>
                <Text style={styles.nombreProductoSmall}>{productoData.nombre}</Text>
                <Text style={styles.precioProductoSmall}>C${productoData.precio_venta} c/u</Text>
                <Text style={[styles.stockDisponible, (productoData.stock - (itemsVenta.find(i => i.id_producto === productoData.id)?.cantidad || 0)) <= 0 && { color: '#DC3545' }]}>
                  Disponible: {productoData.stock - (itemsVenta.find(i => i.id_producto === productoData.id)?.cantidad || 0)}
                </Text>
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
              <TouchableOpacity style={[styles.botonSmall, styles.botonCancelarSmall]} onPress={() => {
                setBusquedaProducto(""); setCantidad(""); setProductoData(null); setModalDetalleVisible(false);
              }}>
                <Text style={styles.textoBotonSmall}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.botonSmall, styles.botonAgregarSmall]} 
                onPress={agregarItemVenta} 
                disabled={!productoData || !cantidad || parseInt(cantidad) <= 0}
              >
                <Text style={styles.textoBotonSmall}>Añadir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 0,marginTop: -5 },
  headerButtons: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15, paddingHorizontal: 10 },
  botonEstadisticas: { flexDirection: "row", backgroundColor: "#6f42c1", padding: 12, borderRadius: 8, alignItems: "center", justifyContent: "center", flex: 0.48 },
  botonRegistro: { backgroundColor: "#007BFF", padding: 12, borderRadius: 8, alignItems: "center", flex: 0.48 },
  textoBoton: { color: "#fff", fontWeight: "bold", marginLeft: 5 },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginVertical: 12, textAlign: "center", color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 15, padding: 10, borderRadius: 5, marginHorizontal: 10 },
  botonesContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, paddingHorizontal: 20, paddingBottom: 15 },
  boton: { flex: 1, padding: 10, borderRadius: 5, alignItems: "center" },
  botonIzquierda: { backgroundColor: "#888", marginRight: 5 },
  botonDerecha: { backgroundColor: "#28A745", marginLeft: 5 },
  modalFondo: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.7)" },
  keyboardAvoidingContainer: { flex: 1, justifyContent: "center" },
  modalContenido: { backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 10, flex: 1, paddingVertical: 10, marginVertical: 75 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 10 },
  tituloModal: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#007BFF" },
  resultadoBusqueda: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 15, maxHeight: 150, marginTop: 5 },
  opcionBusqueda: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  errorSmall: { color: "gray", padding: 8, textAlign: "center", fontSize: 13 },
  cardCliente: { backgroundColor: "#E6F7FF", padding: 12, borderRadius: 8, marginVertical: 10, borderLeftWidth: 4, borderLeftColor: "#007BFF" },
  cardTitle: { fontSize: 13, color: "#666", marginBottom: 3 },
  cardText: { fontSize: 16, color: "#333", fontWeight: "bold" },
  cardSubText: { fontSize: 13, color: "#777" },
  detalleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15, marginBottom: 8 },
  botonAgregar: { backgroundColor: "#FFC107", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 5 },
  carritoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f9f9f9", padding: 10, borderRadius: 6, marginBottom: 6 },
  itemLeft: { flex: 4 },
  itemNombre: { fontSize: 14, fontWeight: "bold", color: "#333" },
  itemCantidad: { fontSize: 12, color: "#666" },
  stockInfo: { fontSize: 11, color: "#28A745", fontStyle: "italic" },
  itemTotalCarrito: { fontWeight: "bold", fontSize: 15, color: "#28A745" },
  itemEliminarBoton: { width: 28, alignItems: "center" },
  eliminarItemTexto: { color: "#DC3545", fontSize: 18, fontWeight: "bold" },
  totalFactura: { fontSize: 21, fontWeight: "bold", textAlign: "right", marginTop: 15, color: "#000", backgroundColor: "#D4EDDA", padding: 10, borderRadius: 5, borderWidth: 2, borderColor: "#28A745" },

  // === MODAL COMPRA COMPACTO ===
  modalCompraCompacto: { backgroundColor: "#fff", marginHorizontal: 30, borderRadius: 12, padding: 16, maxHeight: "90%", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8},
  tituloModalSmall: { fontSize: 18, fontWeight: "bold", textAlign: "center", color: "#007BFF", marginBottom: 12, marginVertical: 10 },
  inputSmall: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 15 },
  resultadoBusquedaSmall: { maxHeight: 100, marginBottom: 10 },
  opcionSmall: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 5, borderBottomWidth: 1, borderBottomColor: "#eee" },
  textoOpcionSmall: { fontSize: 14, color: "#333" },
  stockSmall: { fontSize: 11, color: "#999", fontStyle: "italic" },
  precioSmall: { fontSize: 13, color: "#28A745", fontWeight: "bold" },
  noResultado: { textAlign: "center", color: "#999", fontSize: 13, marginBottom: 8 },
  cardProductoSmall: { backgroundColor: "#FFF7E6", padding: 10, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: "#FFC107" },
  nombreProductoSmall: { fontSize: 15, fontWeight: "bold", color: "#333" },
  precioProductoSmall: { fontSize: 13, color: "#666", marginTop: 2 },
  stockDisponible: { fontSize: 13, color: "#28A745", fontWeight: "bold", marginTop: 4 },
  botonesSmall: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  botonSmall: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  botonCancelarSmall: { backgroundColor: "#ccc", marginRight: 6 },
  botonAgregarSmall: { backgroundColor: "#28A745", marginLeft: 6 },
  textoBotonSmall: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});

export default FormularioVentas;
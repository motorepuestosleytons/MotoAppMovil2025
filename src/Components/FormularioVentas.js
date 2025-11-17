// src/components/FormularioVentas.js
// VENTAS 100% ESTÁTICAS + STOCK EN TIEMPO REAL + SIN NEGATIVOS + DISEÑO PRO
import React, { useState, useEffect } from "react";
import {
  View, TextInput, StyleSheet, Text, Modal, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from "react-native";
import { db } from "../database/firebaseconfig";
import { 
  collection, addDoc, doc, updateDoc, increment, 
  onSnapshot, query, getDocs
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
  const [cargandoVenta, setCargandoVenta] = useState(false);

  const resetFormularioVenta = () => {
    setClienteData(null);
    setBusquedaClienteNombre("");
    setItemsVenta([]);
    setBusquedaProducto("");
    setCantidad("");
    setProductoData(null);
  };

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const snap = await getDocs(collection(db, "Clientes"));
        setListaClientes(snap.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre || "Sin nombre",
          cedula: doc.data().cedula || "N/A"
        })));
      } catch (error) { console.log(error); }
    };
    cargarClientes();

    const q = query(collection(db, "Productos"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setListaProductos(snapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre || "Sin nombre",
        precio_venta: parseFloat(doc.data().precio_venta) || 0,
        stock: doc.data().stock || 0
      })));
    });

    return () => unsubscribe();
  }, []);

  const resultadosCliente = busquedaClienteNombre.trim()
    ? listaClientes.filter(c => c.nombre.toLowerCase().includes(busquedaClienteNombre.toLowerCase().trim()))
    : [];

  const resultadosProducto = busquedaProducto.trim()
    ? listaProductos.filter(p => p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase().trim()))
    : [];

  const seleccionarCliente = (cliente) => {
    setClienteData(cliente);
    setBusquedaClienteNombre(cliente.nombre);
  };

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

    const enCarrito = itemsVenta.reduce((sum, i) => i.id_producto === productoData.id ? sum + i.cantidad : sum, 0);
    const disponible = productoData.stock - enCarrito;

    if (qty > disponible) {
      Alert.alert("Stock Insuficiente", `Solo hay ${disponible} disponible(s) en stock.`);
      return;
    }

    const itemExistente = itemsVenta.find(i => i.id_producto === productoData.id);
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

  const guardarVenta = async () => {
    if (!clienteData || itemsVenta.length === 0) {
      Alert.alert("Error", "Selecciona cliente y al menos un producto.");
      return;
    }

    setCargandoVenta(true);

    try {
      const total = calcularTotalFactura();

      const ventaRef = await addDoc(collection(db, "Ventas"), {
        fecha_venta: new Date().toISOString(),
        id_documento_cliente: clienteData.id,
        nombre_cliente: clienteData.nombre,
        total_factura: total,
        estado: "Completada"
      });

      const detalleRef = collection(db, `Ventas/${ventaRef.id}/detalle_venta`);
      await Promise.all(itemsVenta.map(item => addDoc(detalleRef, item)));

      await Promise.all(itemsVenta.map(async (item) => {
        const prodRef = doc(db, "Productos", item.id_producto);
        await updateDoc(prodRef, { stock: increment(-item.cantidad) });
      }));

      if (cargarDatos) cargarDatos();
      resetFormularioVenta();
      setModalVisible(false);
      Alert.alert("Éxito", "Venta registrada y stock actualizado correctamente");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar la venta");
    } finally {
      setCargandoVenta(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.botonEstadisticas} onPress={() => setModalStatsVisible(true)}>
          <Ionicons name="stats-chart" size={22} color="#fff" />
          <Text style={styles.textoBotonHeader}>Estadísticas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonRegistro} onPress={() => setModalVisible(true)}>
          <Text style={styles.textoBotonHeader}>+ Nueva Venta</Text>
        </TouchableOpacity>
      </View>

      <EstadisticasModal visible={modalStatsVisible} onClose={() => setModalStatsVisible(false)} />

      {/* MODAL PRINCIPAL - 100% ESTÁTICO */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalFondoEstatico}>
          <View style={styles.modalContenidoEstatico}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.tituloModal}>Registrar Venta</Text>

              <Text style={styles.subtitulo}>Buscar Cliente</Text>
              <TextInput style={styles.input} placeholder="Nombre del cliente..." value={busquedaClienteNombre} onChangeText={setBusquedaClienteNombre} />

              {busquedaClienteNombre.trim() && (!clienteData || clienteData.nombre !== busquedaClienteNombre) && (
                resultadosCliente.length > 0 ? (
                  <View style={styles.resultadoBusqueda}>
                    {resultadosCliente.map(c => (
                      <TouchableOpacity key={c.id} style={styles.opcionBusqueda} onPress={() => seleccionarCliente(c)}>
                        <Text style={styles.textoOpcion}>{c.nombre} (Cédula: {c.cedula})</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.errorSmall}>Cliente no encontrado</Text>
                )
              )}

              {clienteData && (
                <View style={styles.cardCliente}>
                  <Text style={styles.cardTitle}>Cliente seleccionado</Text>
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

              {itemsVenta.length === 0 ? (
                <Text style={styles.sinProductos}>No hay productos en la venta</Text>
              ) : (
                itemsVenta.map((item, i) => {
                  const prod = listaProductos.find(p => p.id === item.id_producto);
                  const stockActual = prod ? prod.stock : 0;
                  const enCarrito = itemsVenta.reduce((s, it) => it.id_producto === item.id_producto ? s + it.cantidad : s, 0);
                  const restante = stockActual - enCarrito + item.cantidad;
                  return (
                    <View key={i} style={styles.carritoItem}>
                      <View style={styles.itemLeft}>
                        <Text style={styles.itemNombre}>{item.nombre_producto}</Text>
                        <Text style={styles.itemCantidad}>{item.cantidad} x C${item.precio_unitario.toFixed(2)}</Text>
                        <Text style={[styles.stockInfo, restante <= 5 && { color: '#DC3545', fontWeight: 'bold' }]}>
                          Stock restante: {restante}
                        </Text>
                      </View>
                      <Text style={styles.itemTotalCarrito}>C${item.total_item.toFixed(2)}</Text>
                      <TouchableOpacity style={styles.itemEliminarBoton} onPress={() => eliminarItemVenta(i)}>
                        <Text style={styles.eliminarItemTexto}>×</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}

              <Text style={styles.totalFactura}>
                TOTAL: C${calcularTotalFactura().toFixed(2)}
              </Text>
            </ScrollView>

            <View style={styles.botonesContainer}>
              <TouchableOpacity 
                style={[styles.boton, styles.botonIzquierda]} 
                onPress={() => { resetFormularioVenta(); setModalVisible(false); }}
                disabled={cargandoVenta}
              >
                <Text style={styles.textoBoton}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.boton, styles.botonDerecha, cargandoVenta && styles.botonDisabled]} 
                onPress={guardarVenta}
                disabled={cargandoVenta}
              >
                {cargandoVenta ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.textoBoton}>Guardar Venta</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL AGREGAR PRODUCTO - 100% ESTÁTICO */}
      <Modal visible={modalDetalleVisible} animationType="fade" transparent>
        <View style={styles.modalFondoEstatico}>
          <View style={styles.modalCompraCompactoEstatico}>
            <Text style={styles.tituloModalSmall}>+ Agregar Producto</Text>

            <TextInput 
              style={styles.inputSmall} 
              placeholder="Buscar producto..." 
              value={busquedaProducto} 
              onChangeText={setBusquedaProducto} 
            />

            {busquedaProducto.trim() && resultadosProducto.length > 0 && (
              <View style={styles.resultadoBusquedaSmall}>
                {resultadosProducto.slice(0, 6).map(p => {
                  const enCarrito = itemsVenta.reduce((s, i) => i.id_producto === p.id ? s + i.cantidad : s, 0);
                  const disponible = p.stock - enCarrito;
                  return (
                    <TouchableOpacity 
                      key={p.id} 
                      style={[styles.opcionSmall, disponible <= 0 && styles.opcionDeshabilitada]} 
                      onPress={() => disponible > 0 && seleccionarProducto(p)}
                      disabled={disponible <= 0}
                    >
                      <View>
                        <Text style={[styles.textoOpcionSmall, disponible <= 0 && { color: '#999' }]}>{p.nombre}</Text>
                        <Text style={styles.stockSmall}>
                          Stock: {p.stock} → Disponible: {disponible > 0 ? disponible : 0}
                        </Text>
                      </View>
                      <Text style={styles.precioSmall}>C${p.precio_venta.toFixed(2)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {productoData && (
              <View style={styles.cardProductoSmall}>
                <Text style={styles.nombreProductoSmall}>{productoData.nombre}</Text>
                <Text style={styles.precioProductoSmall}>Precio: C${productoData.precio_venta.toFixed(2)} c/u</Text>
                <Text style={[styles.stockDisponible, (productoData.stock - itemsVenta.reduce((s, i) => i.id_producto === productoData.id ? s + i.cantidad : s, 0)) <= 0 && { color: '#DC3545' }]}>
                  Disponible: {productoData.stock - itemsVenta.reduce((s, i) => i.id_producto === productoData.id ? s + i.cantidad : s, 0)}
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
                onPress={agregarItemVenta}
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
  headerButtons: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18, paddingHorizontal: 12 },
  botonEstadisticas: { flexDirection: "row", backgroundColor: "#6f42c1", paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, alignItems: "center", justifyContent: "center", flex: 0.48, elevation: 6 },
  botonRegistro: { backgroundColor: "#007BFF", paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, alignItems: "center", justifyContent: "center", flex: 0.48, elevation: 6 },
  textoBotonHeader: { color: "#fff", fontWeight: "bold", fontSize: 17, marginLeft: 8 },

  // FONDO Y MODALES 100% ESTÁTICOS
  modalFondoEstatico: { flex: 1, backgroundColor: "rgba(0,0,0,0.94)", justifyContent: "center", alignItems: "center" },
  modalContenidoEstatico: { backgroundColor: "#fff", width: "94%", height: "86%", borderRadius: 22, overflow: "hidden", elevation: 30 },
  modalCompraCompactoEstatico: { backgroundColor: "#fff", width: "90%", padding: 28, borderRadius: 22, elevation: 30 },

  scrollContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 30 },
  tituloModal: { fontSize: 28, fontWeight: "bold", marginBottom: 22, textAlign: "center", color: "#007BFF" },
  subtitulo: { fontSize: 19, fontWeight: "bold", marginVertical: 14, textAlign: "center", color: "#333" },

  input: { borderWidth: 1.5, borderColor: "#007BFF", marginBottom: 16, padding: 16, borderRadius: 14, marginHorizontal: 10, backgroundColor: "#fff", fontSize: 17, elevation: 3 },
  inputSmall: { borderWidth: 1.5, borderColor: "#007BFF", padding: 16, borderRadius: 14, marginBottom: 16, fontSize: 17, backgroundColor: "#fff" },

  resultadoBusqueda: { borderWidth: 1, borderColor: "#ddd", borderRadius: 14, maxHeight: 190, marginBottom: 16, overflow: "hidden", elevation: 2 },
  opcionBusqueda: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  textoOpcion: { fontSize: 16, textAlign: "center", color: "#333" },
  errorSmall: { color: "#999", padding: 14, textAlign: "center", fontStyle: "italic" },

  cardCliente: { backgroundColor: "#e3f2fd", padding: 20, borderRadius: 16, marginVertical: 16, borderLeftWidth: 7, borderLeftColor: "#007BFF" },
  cardTitle: { fontSize: 15, color: "#666", marginBottom: 6, textAlign: "center" },
  cardText: { fontSize: 20, color: "#333", fontWeight: "bold", textAlign: "center" },
  cardSubText: { fontSize: 15, color: "#777", textAlign: "center" },

  detalleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 14 },
  botonAgregar: { backgroundColor: "#FFC107", paddingHorizontal: 22, paddingVertical: 14, borderRadius: 14, elevation: 4 },
  sinProductos: { textAlign: "center", color: "#999", fontStyle: "italic", padding: 30, fontSize: 16 },

  carritoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f5f5f5", padding: 18, borderRadius: 16, marginBottom: 14, elevation: 2 },
  itemLeft: { flex: 4 },
  itemNombre: { fontSize: 17, fontWeight: "bold", color: "#333" },
  itemCantidad: { fontSize: 14, color: "#666", marginTop: 4 },
  stockInfo: { fontSize: 14, marginTop: 6 },
  itemTotalCarrito: { fontWeight: "bold", fontSize: 19, color: "#007BFF" },
  itemEliminarBoton: { width: 40, height: 40, backgroundColor: "#ffebee", borderRadius: 20, justifyContent: "center", alignItems: "center" },
  eliminarItemTexto: { color: "#d32f2f", fontSize: 24, fontWeight: "bold" },

  totalFactura: { fontSize: 30, fontWeight: "bold", textAlign: "right", marginTop: 30, color: "#000", backgroundColor: "#c3e6cb", padding: 20, borderRadius: 16, borderWidth: 6, borderColor: "#28A745" },

  botonesContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    gap: 22, 
    paddingHorizontal: 24, 
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#f9f9f9"
  },
  boton: { minWidth: 150, paddingVertical: 20, paddingHorizontal: 28, borderRadius: 16, alignItems: "center", elevation: 6 },
  botonIzquierda: { backgroundColor: "#6c757d" },
  botonDerecha: { backgroundColor: "#28A745" },
  botonDisabled: { backgroundColor: "#aaa", opacity: 0.7 },

  // MODAL PRODUCTO
  tituloModalSmall: { fontSize: 24, fontWeight: "bold", textAlign: "center", color: "#007BFF", marginBottom: 22 },
  resultadoBusquedaSmall: { maxHeight: 160, marginBottom: 18, borderWidth: 1, borderColor: "#eee", borderRadius: 14, overflow: "hidden" },
  opcionSmall: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  opcionDeshabilitada: { opacity: 0.4 },
  textoOpcionSmall: { fontSize: 16, color: "#333" },
  stockSmall: { fontSize: 13, color: "#999" },
  precioSmall: { fontSize: 16, color: "#007BFF", fontWeight: "bold" },

  cardProductoSmall: { backgroundColor: "#fff3e0", padding: 20, borderRadius: 16, marginBottom: 20, borderLeftWidth: 7, borderLeftColor: "#FFC107" },
  nombreProductoSmall: { fontSize: 20, fontWeight: "bold", color: "#333", textAlign: "center" },
  precioProductoSmall: { fontSize: 17, color: "#666", marginTop: 8, textAlign: "center" },
  stockDisponible: { fontSize: 17, fontWeight: "bold", marginTop: 10, textAlign: "center" },

  botonesSmall: { flexDirection: "row", justifyContent: "space-between", marginTop: 28, gap: 16 },
  botonSmall: { flex: 1, paddingVertical: 20, borderRadius: 16, alignItems: "center", elevation: 6 },
  botonCancelarSmall: { backgroundColor: "#6c757d" },
  botonAgregarSmall: { backgroundColor: "#28A745" },
  textoBotonSmall: { color: "#fff", fontWeight: "bold", fontSize: 17 },
});

export default FormularioVentas;
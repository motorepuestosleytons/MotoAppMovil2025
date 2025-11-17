// src/components/FormularioCompras.js
// MODALES 100% ESTÁTICOS - NUNCA SE MUEVEN CON EL TECLADO - VERSIÓN COMPLETA FINAL
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
        const snap = await getDocs(collection(db, "Proveedores"));
        setListaProveedores(snap.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre_proveedor || doc.data().nombre || "Sin nombre",
          documento: doc.data().documento || "N/A"
        })));
      } catch (error) { console.log(error); }
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
      console.error(error);
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

      {/* MODAL PRINCIPAL - 100% ESTÁTICO */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalFondoEstatico}>
          <View style={styles.modalContenidoEstatico}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
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

              {itemsCompra.length === 0 ? (
                <Text style={styles.sinProductos}>No hay productos agregados</Text>
              ) : (
                itemsCompra.map((item, i) => {
                  const stockActual = listaProductos.find(p => p.id === item.id_producto)?.stock || 0;
                  return (
                    <View key={i} style={styles.carritoItem}>
                      <View style={styles.itemLeft}>
                        <Text style={styles.itemNombre}>{item.nombre_producto}</Text>
                        <Text style={styles.itemCantidad}>{item.cantidad} x C${item.precio_unitario.toFixed(2)}</Text>
                        <Text style={styles.stockInfo}>Stock pasa a: {stockActual + item.cantidad}</Text>
                      </View>
                      <Text style={styles.itemTotalCarrito}>C${item.total_item.toFixed(2)}</Text>
                      <TouchableOpacity style={styles.itemEliminarBoton} onPress={() => eliminarItem(i)}>
                        <Text style={styles.eliminarItemTexto}>×</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}

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

            {busquedaProducto.trim() && (!productoData || !busquedaProducto.includes(productoData?.nombre)) && resultadosProducto.length > 0 && (
              <View style={styles.resultadoBusquedaSmall}>
                {resultadosProducto.slice(0, 6).map(p => (
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
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 17 },

  // FONDO OSCURO FIJO
  modalFondoEstatico: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },

  // MODAL GRANDE ESTÁTICO
  modalContenidoEstatico: {
    backgroundColor: "#fff",
    width: "94%",
    height: "88%",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 25,
  },

  // MODAL PEQUEÑO ESTÁTICO
  modalCompraCompactoEstatico: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 26,
    borderRadius: 20,
    elevation: 25,
  },

  scrollContent: { paddingHorizontal: 22, paddingTop: 25, paddingBottom: 30 },
  tituloModal: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#800080" },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginVertical: 12, textAlign: "center", color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 15, padding: 14, borderRadius: 12, marginHorizontal: 10, backgroundColor: "#fff", fontSize: 16 },
  inputSmall: { borderWidth: 1, borderColor: "#ddd", padding: 14, borderRadius: 12, marginBottom: 14, fontSize: 16, backgroundColor: "#fff" },

  resultadoBusqueda: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, maxHeight: 180, marginBottom: 15, overflow: "hidden" },
  opcionBusqueda: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  textoOpcion: { fontSize: 15, textAlign: "center" },
  errorSmall: { color: "#999", padding: 12, textAlign: "center", fontStyle: "italic" },

  cardProveedor: { backgroundColor: "#f3e8ff", padding: 18, borderRadius: 14, marginVertical: 14, borderLeftWidth: 6, borderLeftColor: "#800080" },
  cardTitle: { fontSize: 14, color: "#666", marginBottom: 6, textAlign: "center" },
  cardText: { fontSize: 19, color: "#333", fontWeight: "bold", textAlign: "center" },
  cardSubText: { fontSize: 14, color: "#777", textAlign: "center" },

  detalleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 12 },
  botonAgregar: { backgroundColor: "#FFC107", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  sinProductos: { textAlign: "center", color: "#999", fontStyle: "italic", padding: 20 },

  carritoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8f9fa", padding: 16, borderRadius: 14, marginBottom: 12 },
  itemLeft: { flex: 4 },
  itemNombre: { fontSize: 16, fontWeight: "bold", color: "#333" },
  itemCantidad: { fontSize: 13, color: "#666", marginTop: 4 },
  stockInfo: { fontSize: 13, color: "#28A745", fontWeight: "bold", marginTop: 5 },
  itemTotalCarrito: { fontWeight: "bold", fontSize: 18, color: "#800080" },
  itemEliminarBoton: { width: 38, height: 38, backgroundColor: "#ffebee", borderRadius: 19, justifyContent: "center", alignItems: "center" },
  eliminarItemTexto: { color: "#d32f2f", fontSize: 22, fontWeight: "bold" },

  totalFactura: { fontSize: 28, fontWeight: "bold", textAlign: "right", marginTop: 30, color: "#000", backgroundColor: "#e1bee7", padding: 18, borderRadius: 14, borderWidth: 5, borderColor: "#800080" },

  botonesContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    gap: 20, 
    paddingHorizontal: 20, 
    paddingVertical: 22,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#f9f9f9"
  },
  boton: { minWidth: 140, paddingVertical: 18, paddingHorizontal: 24, borderRadius: 14, alignItems: "center" },
  botonIzquierda: { backgroundColor: "#6c757d" },
  botonDerecha: { backgroundColor: "#28A745" },
  botonDisabled: { backgroundColor: "#aaa", opacity: 0.7 },

  // MODAL PEQUEÑO
  tituloModalSmall: { fontSize: 23, fontWeight: "bold", textAlign: "center", color: "#800080", marginBottom: 20 },
  resultadoBusquedaSmall: { maxHeight: 140, marginBottom: 16, borderWidth: 1, borderColor: "#eee", borderRadius: 12, overflow: "hidden" },
  opcionSmall: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  textoOpcionSmall: { fontSize: 15, color: "#333" },
  stockSmall: { fontSize: 12, color: "#28A745", fontWeight: "bold" },
  precioSmall: { fontSize: 15, color: "#800080", fontWeight: "bold" },

  cardProductoSmall: { backgroundColor: "#fff8e1", padding: 18, borderRadius: 14, marginBottom: 18, borderLeftWidth: 6, borderLeftColor: "#FFC107" },
  nombreProductoSmall: { fontSize: 19, fontWeight: "bold", color: "#333", textAlign: "center" },
  precioProductoSmall: { fontSize: 16, color: "#666", marginTop: 6, textAlign: "center" },
  stockDisponible: { fontSize: 16, color: "#28A745", fontWeight: "bold", marginTop: 10, textAlign: "center" },

  botonesSmall: { flexDirection: "row", justifyContent: "space-between", marginTop: 25, gap: 15 },
  botonSmall: { flex: 1, paddingVertical: 18, borderRadius: 14, alignItems: "center" },
  botonCancelarSmall: { backgroundColor: "#6c757d" },
  botonAgregarSmall: { backgroundColor: "#28A745" },
  textoBotonSmall: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default FormularioCompras;
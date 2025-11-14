import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const FormularioVentas = ({ cargarDatos }) => {
  // --- Estados de Registro de Venta ---
  const [clienteData, setClienteData] = useState(null);
  const [busquedaClienteNombre, setBusquedaClienteNombre] = useState("");
  const [itemsVenta, setItemsVenta] = useState([]);

  // Estados para Modal de Ítem
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productoData, setProductoData] = useState(null);
  const [cantidad, setCantidad] = useState("");

  // Estados de Control y Maestros
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [listaClientes, setListaClientes] = useState([]);
  const [listaProductos, setListaProductos] = useState([]);

  // Estados para la Búsqueda de Ventas (fuera del modal)
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState(null);

  // --- Carga de Maestros ---
  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        // Cargar Clientes
        const clientesSnapshot = await getDocs(collection(db, "Clientes"));
        const clientesData = clientesSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
          cedula: doc.data().cedula,
        }));
        setListaClientes(clientesData);

        // Cargar Productos
        const productosSnapshot = await getDocs(collection(db, "Productos"));
        const productosData = productosSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
          precio_venta: doc.data().precio_venta,
        }));
        setListaProductos(productosData);
      } catch (error) {
        console.error("Error al cargar maestros:", error);
      }
    };
    cargarMaestros();
  }, []);

  // --- Lógica de Búsqueda de Cliente y Producto (por Nombre) ---
  const buscarClientePorNombre = (nombreBuscado) => {
    if (!nombreBuscado) return [];
    const nombreLower = nombreBuscado.trim().toLowerCase();
    return listaClientes.filter((c) =>
      c.nombre.toLowerCase().includes(nombreLower)
    );
  };
  const resultadosCliente = buscarClientePorNombre(busquedaClienteNombre || "");

  const seleccionarCliente = (cliente) => {
    setClienteData({
      id: cliente.id,
      nombre: cliente.nombre,
      cedula: cliente.cedula,
    });
    setBusquedaClienteNombre(cliente.nombre);
  };

  const buscarProductoPorNombre = (nombreBuscado) => {
    if (!nombreBuscado) return [];
    const nombreLower = nombreBuscado.trim().toLowerCase();
    return listaProductos.filter((p) =>
      p.nombre.toLowerCase().includes(nombreLower)
    );
  };
  const resultadosProducto = buscarProductoPorNombre(busquedaProducto || "");

  const seleccionarProducto = (producto) => {
    setProductoData(producto);
    setBusquedaProducto(producto.nombre);
  };

  // --- Lógica de Carrito y Totales ---
  const generarFechaActual = () => new Date().toISOString();
  const calcularTotalFactura = () =>
    itemsVenta.reduce((sum, item) => sum + item.total_item, 0);

  const agregarItemVenta = () => {
    if (
      !productoData ||
      !cantidad ||
      isNaN(parseInt(cantidad)) ||
      parseInt(cantidad) <= 0
    ) {
      Alert.alert(
        "Error",
        "Debe seleccionar un producto válido e ingresar una cantidad mayor a cero."
      );
      return;
    }

    const qty = parseInt(cantidad);
    const precioU = parseFloat(productoData.precio_venta);

    if (isNaN(precioU)) {
      Alert.alert("Error", "El precio del producto no es un número válido.");
      return;
    }

    const totalItem = qty * precioU;

    const newItem = {
      id_producto: productoData.id,
      nombre_producto: productoData.nombre,
      precio_unitario: precioU,
      cantidad: qty,
      total_item: totalItem,
    };

    setItemsVenta([...itemsVenta, newItem]);
    setBusquedaProducto("");
    setCantidad("");
    setProductoData(null);
    setModalDetalleVisible(false);
  };

  const eliminarItemVenta = (index) => {
    setItemsVenta(itemsVenta.filter((_, i) => i !== index));
  };

  // --- Función Principal de Guardado ---
  const guardarVenta = async () => {
    if (!clienteData || itemsVenta.length === 0) {
      Alert.alert(
        "Error",
        "Debe seleccionar un cliente y agregar al menos un producto."
      );
      return;
    }

    const totalFactura = calcularTotalFactura();

    try {
      const fechaActual = generarFechaActual();

      // 1. Registrar la Venta Principal
      const ventaRef = await addDoc(collection(db, "Ventas"), {
        fecha_venta: fechaActual,
        id_documento_cliente: clienteData.id,
        nombre_cliente: clienteData.nombre,
        total_factura: totalFactura,
        estado: "Recibido",
      });

      // 2. Registrar cada Detalle de Venta en la Subcolección
      const detalleCollectionRef = collection(
        db,
        `Ventas/${ventaRef.id}/detalle_venta`
      );
      for (const item of itemsVenta) {
        const {
          id_producto,
          nombre_producto,
          precio_unitario,
          cantidad,
          total_item,
        } = item;
        await addDoc(detalleCollectionRef, {
          id_producto,
          nombre_producto,
          precio_unitario,
          cantidad,
          total_item,
        });
      }

      // Limpiar y cerrar
      setClienteData(null);
      setBusquedaClienteNombre("");
      setItemsVenta([]);
      setModalVisible(false);
      cargarDatos();
      Alert.alert("Éxito", `Venta ${ventaRef.id} registrada correctamente`);
    } catch (error) {
      console.error("Error al registrar venta:", error);
      Alert.alert("Error", "Hubo un problema al guardar la venta.");
    }
  };

  // --- Lógica de Búsqueda de Ventas ---
  useEffect(() => {
    const buscarVenta = async () => {
      if (!busqueda.trim()) {
        setResultado(null);
        return;
      }
      try {
        const snapshot = await getDocs(collection(db, "Ventas"));
        const busquedaLower = busqueda.trim().toLowerCase();

        const ventaEncontrada = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .find(
            (v) =>
              v.id === busquedaLower ||
              (v.nombre_cliente &&
                v.nombre_cliente.toLowerCase().includes(busquedaLower))
          );
        setResultado(ventaEncontrada || null);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
    };
    buscarVenta();
  }, [busqueda]);

  // -------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Botón abrir modal de registro */}
      <View style={styles.botonRegistroContainer}>
        <TouchableOpacity
          style={styles.botonRegistro}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Text style={styles.textoBoton}>Registrar Nueva Venta</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador de Ventas */}
      <TextInput
        style={styles.input}
        placeholder="Buscar venta por ID o Nombre de Cliente"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Resultado de búsqueda de Venta */}
      {resultado ? (
        <View style={styles.resultado}>
          <Text style={{ fontWeight: "bold" }}>
            ID Venta: <Text style={{ fontWeight: "normal" }}>{resultado.id}</Text>
          </Text>
          <Text style={{ fontWeight: "bold" }}>
            Cliente: <Text style={{ fontWeight: "bold" }}>{resultado.nombre_cliente}</Text>
          </Text>
          <Text style={{ fontWeight: "bold" }}>
            Fecha: <Text>{new Date(resultado.fecha_venta).toLocaleDateString()}</Text>
          </Text>
        </View>
      ) : busqueda.trim().length > 0 ? (
        <Text style={styles.noEncontrado}>No se encontró la venta</Text>
      ) : null}

      {/* MODAL DE REGISTRO DE VENTA COMPLETA... */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
          >
            <View style={styles.modalContenido}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.tituloModal}>Registrar Venta</Text>

                {/* Búsqueda de Cliente por NOMBRE */}
                <Text style={styles.subtitulo}>Buscar Cliente (por Nombre)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Escriba el nombre del Cliente para buscar"
                  value={busquedaClienteNombre}
                  onChangeText={setBusquedaClienteNombre}
                />

                {/* Resultados de Búsqueda de Cliente */}
                {busquedaClienteNombre.trim().length > 0 &&
                  clienteData?.nombre !== busquedaClienteNombre && (
                    resultadosCliente.length > 0 ? (
                      <View style={styles.resultadoBusqueda}>
                        {resultadosCliente.map((cliente) => (
                          <TouchableOpacity
                            key={cliente.id}
                            style={styles.opcionBusqueda}
                            onPress={() => seleccionarCliente(cliente)}
                          >
                            <Text>
                              {cliente.nombre} (Cédula: {cliente.cedula})
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.errorSmall}>
                        Cliente no encontrado...
                      </Text>
                    )
                  )}

                {/* Tarjeta de Cliente SELECCIONADO */}
                {clienteData ? (
                  <View style={styles.cardCliente}>
                    <Text style={styles.cardTitle}>Cliente Seleccionado</Text>
                    <Text style={styles.cardText}>
                      <Text style={{ fontWeight: "bold" }}>
                        {clienteData.nombre}
                      </Text>
                    </Text>
                    <Text style={styles.cardSubText}>
                      Cédula: {clienteData.cedula}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.error}>
                    Seleccione un cliente de la lista de resultados.
                  </Text>
                )}

                {/* DETALLE DE VENTA (CARRITO) */}
                <View style={styles.detalleHeader}>
                  <Text style={styles.subtitulo}>
                    Productos a Vender ({itemsVenta.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.botonAgregar}
                    onPress={() => setModalDetalleVisible(true)}
                  >
                    <Text style={styles.textoBoton}>+ Item</Text>
                  </TouchableOpacity>
                </View>

                {/* LISTA DE ÍTEMS EN EL CARRITO */}
                {itemsVenta.map((item, index) => (
                  <View key={index} style={styles.carritoItem}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemNombre}>
                        {item.nombre_producto}
                      </Text>
                      <Text style={styles.itemCantidad}>
                        Cant: {item.cantidad} x ${item.precio_unitario.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.itemTotalCarrito}>
                      ${item.total_item.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.itemEliminarBoton}
                      onPress={() => eliminarItemVenta(index)}
                    >
                      <Text style={styles.eliminarItemTexto}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {/* TOTAL FACTURA */}
                <Text style={styles.totalFactura}>
                  TOTAL A PAGAR: ${calcularTotalFactura().toFixed(2)}
                </Text>
              </ScrollView>

              {/* BOTONES DE GUARDAR/CANCELAR */}
              <View style={styles.botonesContainer}>
                <TouchableOpacity
                  style={[styles.boton, styles.botonIzquierda]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.textoBoton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.boton, styles.botonDerecha]}
                  onPress={guardarVenta}
                >
                  <Text style={styles.textoBoton}>Guardar Venta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL PARA AGREGAR PRODUCTO... */}
      <Modal
        visible={modalDetalleVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenidoSmall}>
            <Text style={styles.tituloModal}>Agregar Producto</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre del Producto para buscar"
              value={busquedaProducto}
              onChangeText={setBusquedaProducto}
            />

            {/* Resultados de Producto */}
            {busquedaProducto.trim().length > 0 &&
              productoData?.nombre !== busquedaProducto && (
                resultadosProducto.length > 0 ? (
                  <View style={styles.resultadoBusqueda}>
                    {resultadosProducto.map((producto) => (
                      <TouchableOpacity
                        key={producto.id}
                        style={styles.opcionBusqueda}
                        onPress={() => seleccionarProducto(producto)}
                      >
                        <Text>
                          {producto.nombre} (${producto.precio_venta})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.errorSmall}>
                    Producto no encontrado...
                  </Text>
                )
              )}

            {/* Tarjeta de Producto SELECCIONADO */}
            {productoData ? (
              <View style={styles.cardProducto}>
                <Text style={styles.cardTitle}>Producto Elegido</Text>
                <Text style={styles.cardText}>
                  <Text style={{ fontWeight: "bold" }}>
                    {productoData.nombre}
                  </Text>
                </Text>
                <Text style={styles.cardSubText}>
                  Precio Venta: ${productoData.precio_venta}
                </Text>
              </View>
            ) : (
              <Text style={styles.error}>
                Seleccione un producto de la lista de resultados.
              </Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Cantidad"
              value={cantidad}
              onChangeText={setCantidad}
              keyboardType="numeric"
            />

            <View style={styles.botonesContainer}>
              <TouchableOpacity
                style={[styles.boton, styles.botonIzquierda]}
                onPress={() => setModalDetalleVisible(false)}
              >
                <Text style={styles.textoBoton}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.boton, styles.botonDerecha]}
                onPress={agregarItemVenta}
                disabled={!productoData}
              >
                <Text style={styles.textoBoton}>Añadir al Carrito</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 0 },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },

  botonRegistroContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  botonRegistro: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    width: "70%",
    alignItems: "center",
  },
  textoBoton: { color: "#fff", fontWeight: "bold" },

  botonesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  boton: { flex: 1, padding: 10, borderRadius: 5, alignItems: "center" },
  botonIzquierda: { backgroundColor: "#888", marginRight: 5 },
  botonDerecha: { backgroundColor: "#28A745", marginLeft: 5 },
  modalFondo: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  keyboardAvoidingContainer: { flex: 1, justifyContent: "center" },
  modalContenido: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    paddingVertical: 10,
  },
  modalContenidoSmall: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 10 },
  tituloModal: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#007BFF",
  },

  resultado: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#ffe0b2",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ff9800",
  },
  noEncontrado: { textAlign: "center", marginTop: 10, color: "gray" },
  resultadoBusqueda: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    maxHeight: 150,
    marginTop: 5,
  },
  opcionBusqueda: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  errorSmall: {
    color: "gray",
    padding: 10,
    textAlign: "center",
    marginBottom: 15,
  },
  error: { color: "red", marginVertical: 10, padding: 5, textAlign: "center" },

  // --- TARJETAS ---
  cardCliente: {
    backgroundColor: "#E6F7FF",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#007BFF",
  },
  cardProducto: {
    backgroundColor: "#FFF7E6",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#FFC107",
  },
  cardTitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
    fontWeight: "600",
  },
  cardText: {
    fontSize: 17,
    color: "#333",
  },
  cardSubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },

  detalleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  botonAgregar: { backgroundColor: "#FFC107", padding: 5, borderRadius: 5 },

  // --- CARRITO ---
  carritoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemLeft: {
    flex: 4,
  },
  itemNombre: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  itemCantidad: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  itemTotalCarrito: {
    flex: 2,
    fontWeight: "bold",
    textAlign: "right",
    fontSize: 16,
    color: "#28A745",
  },
  itemEliminarBoton: {
    flex: 0.5,
    alignItems: "center",
    paddingLeft: 10,
  },
  eliminarItemTexto: {
    color: "red",
    fontSize: 18,
  },

  // --- TOTAL FACTURA ---
  totalFactura: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 20,
    color: "#000",
    backgroundColor: "#D4EDDA",
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#28A745",
  },
});

export default FormularioVentas;
import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text, Modal, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const FormularioCompras = ({ cargarDatos }) => {
  // --- Estados de Registro de Compra ---
  const [proveedorData, setProveedorData] = useState(null); 
  const [busquedaProveedorNombre, setBusquedaProveedorNombre] = useState(""); 
  const [itemsCompra, setItemsCompra] = useState([]);
  
  // Estados para Modal de Ítem
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productoData, setProductoData] = useState(null);
  const [cantidad, setCantidad] = useState("");
  
  // Estados de Control y Maestros
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [listaProveedores, setListaProveedores] = useState([]);
  const [listaProductos, setListaProductos] = useState([]);

  // Estados para la Búsqueda de Compras (fuera del modal)
  const [busqueda, setBusqueda] = useState(""); 
  const [resultado, setResultado] = useState(null);

  // --- Carga de Maestros (Proveedores y Productos) ---
  useEffect(() => {
      const cargarMaestros = async () => {
          try {
              // Cargar Proveedores
              const proveedoresSnapshot = await getDocs(collection(db, "Proveedores"));
              const proveedoresData = proveedoresSnapshot.docs.map(doc => {
                  const data = doc.data();
                  // IMPORTANTE: Si el campo real es 'nombre_proveedor', usar ese.
                  // Si no existe 'nombre_proveedor', usamos 'nombre' como fallback.
                  const nombreProveedor = data.nombre_proveedor || data.nombre || ''; 
                  return { 
                      id: doc.id, 
                      nombre: nombreProveedor, // Usamos el nombre encontrado
                      documento: data.documento || 'N/A'
                  }
              });
              setListaProveedores(proveedoresData);

              // Cargar Productos
              const productosSnapshot = await getDocs(collection(db, "Productos"));
              const productosData = productosSnapshot.docs.map(doc => {
                  const data = doc.data();
                  // Aseguramos que el precio sea un número
                  return { 
                      id: doc.id, 
                      nombre: data.nombre || '', 
                      precio_compra: parseFloat(data.precio_compra) || 0 
                  }
              });
              setListaProductos(productosData);
          } catch (error) {
              console.error("Error al cargar maestros:", error);
          }
      };
      cargarMaestros();
  }, []);

  // --- Lógica de Búsqueda de Proveedor y Producto (por Nombre) ---

  const buscarProveedorPorNombre = (nombreBuscado) => {
      if (!nombreBuscado) return [];
      const nombreLower = nombreBuscado.trim().toLowerCase();
      // FILTRADO DE PROVEEDORES: Buscamos si el nombre incluye el texto
      return listaProveedores.filter(p => p.nombre && p.nombre.toLowerCase().includes(nombreLower));
  };
  const resultadosProveedor = buscarProveedorPorNombre(busquedaProveedorNombre || '');

  const seleccionarProveedor = (proveedor) => { 
      setProveedorData({ id: proveedor.id, nombre: proveedor.nombre, documento: proveedor.documento });
      setBusquedaProveedorNombre(proveedor.nombre);
  };

  const buscarProductoPorNombre = (nombreBuscado) => {
      if (!nombreBuscado) return [];
      const nombreLower = nombreBuscado.trim().toLowerCase();
      return listaProductos.filter(p => p.nombre.toLowerCase().includes(nombreLower));
  };
  const resultadosProducto = buscarProductoPorNombre(busquedaProducto || '');
  
  const seleccionarProducto = (producto) => {
      setProductoData(producto);
      setBusquedaProducto(producto.nombre);
  };

  // --- Lógica de Carrito y Totales ---

  const generarFechaActual = () => new Date().toISOString(); 
  const calcularTotalFactura = () => itemsCompra.reduce((sum, item) => sum + (parseFloat(item.total_item) || 0), 0);

  const agregarItemCompra = () => { 
      if (!productoData || !cantidad || isNaN(parseInt(cantidad)) || parseInt(cantidad) <= 0) {
        Alert.alert("Error", "Debe seleccionar un producto válido e ingresar una cantidad mayor a cero.");
        return;
      }
  
      const qty = parseInt(cantidad);
      const precioU = parseFloat(productoData.precio_compra); 
      
      const totalItem = qty * precioU;
  
      const newItem = {
        id_producto: productoData.id,
        nombre_producto: productoData.nombre, 
        precio_unitario: precioU,
        cantidad: qty,
        total_item: totalItem, 
      };
  
      setItemsCompra([...itemsCompra, newItem]);
      setBusquedaProducto("");
      setCantidad("");
      setProductoData(null);
      setModalDetalleVisible(false);
  };

  const eliminarItemCompra = (index) => { setItemsCompra(itemsCompra.filter((_, i) => i !== index)); };

  // --- Función Principal de Guardado ---

  const guardarCompra = async () => { 
    if (!proveedorData || itemsCompra.length === 0) {
      Alert.alert("Error", "Debe seleccionar un proveedor y agregar al menos un producto.");
      return;
    }

    try {
      const fechaActual = generarFechaActual();
      const totalFactura = calcularTotalFactura(); 

      // 1. Registrar la Compra Principal con el total
      const compraRef = await addDoc(collection(db, "Compras"), {
        fecha_compra: fechaActual,
        id_documento_proveedor: proveedorData.id, 
        nombre_proveedor: proveedorData.nombre, 
        total_compra: totalFactura, // GUARDA EL TOTAL
      });

      // 2. Registrar cada Detalle de Compra en la Subcolección
      const detalleCollectionRef = collection(db, `Compras/${compraRef.id}/detalle_compra`);
      for (const item of itemsCompra) {
        const { id_producto, nombre_producto, precio_unitario, cantidad, total_item } = item;
        await addDoc(detalleCollectionRef, { id_producto, nombre_producto, precio_unitario, cantidad, total_item });
      }

      // Limpiar y cerrar
      setProveedorData(null);
      setBusquedaProveedorNombre("");
      setItemsCompra([]);
      setModalVisible(false);
      cargarDatos(); 
      Alert.alert("Éxito", `Compra ${compraRef.id} registrada correctamente`);
    } catch (error) {
      console.error("Error al registrar compra:", error);
      Alert.alert("Error", "Hubo un problema al guardar la compra.");
    }
  };

  // --- Lógica de Búsqueda de Compras (Externa) ---

  useEffect(() => {
    const buscarCompra = async () => { 
        if (!busqueda.trim()) {
            setResultado(null);
            return;
        }
        try {
            const snapshot = await getDocs(collection(db, "Compras"));
            const busquedaLower = busqueda.trim().toLowerCase();
            
            const compraEncontrada = snapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .find((c) => 
                    c.id.toLowerCase().includes(busquedaLower) ||
                    (c.nombre_proveedor && c.nombre_proveedor.toLowerCase().includes(busquedaLower))
                ); 
            setResultado(compraEncontrada || null);
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        }
    };
    buscarCompra();
  }, [busqueda]);

  // -------------------------------------------------------------------
  
  return (
    <View style={styles.container}>
      {/* Botón abrir modal de registro */}
      <View style={styles.botonRegistroContainer}>
        <TouchableOpacity style={styles.botonRegistro} onPress={() => { 
            setModalVisible(true);
            // Al abrir modal, resetear proveedor seleccionado
            setProveedorData(null); 
            setBusquedaProveedorNombre('');
            setItemsCompra([]);
        }}>
          <Text style={styles.textoBoton}>Registrar Nueva Compra 🧾</Text>
        </TouchableOpacity>
      </View>
      
      {/* Buscador de Compras */}
      <TextInput style={styles.input} placeholder="Buscar compra por ID o Nombre de Proveedor" value={busqueda} onChangeText={setBusqueda} />
      
      {/* Resultado de búsqueda */}
      {resultado ? (
        <View style={styles.resultado}>
          <Text>ID Compra: <Text style={{fontWeight: 'normal'}}>{resultado.id}</Text></Text>
          <Text>Proveedor: <Text style={{fontWeight: 'bold'}}>{resultado.nombre_proveedor}</Text></Text>
          <Text>Fecha: {resultado.fecha_compra ? new Date(resultado.fecha_compra).toLocaleDateString() : 'N/A'}</Text>
          <Text style={styles.totalResultado}>Total: ${resultado.total_compra !== undefined ? parseFloat(resultado.total_compra).toFixed(2) : 'N/A'}</Text>
        </View>
      ) : (
        busqueda.trim().length > 0 && (
          <Text style={styles.noEncontrado}>No se encontró la compra</Text>
        )
      )}

      {/* MODAL DE REGISTRO DE COMPRA COMPLETA */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.keyboardAvoidingContainer}
          >
            <View style={styles.modalContenido}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.tituloModal}>Registrar Compra</Text>
                
                {/* Búsqueda de Proveedor por NOMBRE */}
                <Text style={styles.subtitulo}>Buscar Proveedor (por Nombre)</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Escriba el nombre del Proveedor para buscar" 
                  value={busquedaProveedorNombre} 
                  onChangeText={setBusquedaProveedorNombre}
                />
                
                {/* Resultados de Búsqueda de Proveedor (Lógica Ajustada) */}
                {/* Mostramos resultados si hay texto y hay coincidencias, o si hay texto y no se ha seleccionado un proveedor coincidente */}
                {busquedaProveedorNombre.trim().length > 0 && resultadosProveedor.length > 0 ? (
                    <View style={styles.resultadoBusqueda}>
                        {resultadosProveedor.map((proveedor) => (
                            <TouchableOpacity 
                                key={proveedor.id} 
                                style={styles.opcionBusqueda}
                                onPress={() => seleccionarProveedor(proveedor)}
                            >
                                <Text>{proveedor.nombre} (Doc: {proveedor.documento})</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (busquedaProveedorNombre.trim().length > 0 && 
                    // Mostramos el mensaje de no encontrado SÓLO si no hay coincidencias
                    <Text style={styles.errorSmall}>Proveedor no encontrado...</Text>
                )}

                {/* Tarjeta de Proveedor SELECCIONADO */}
                {proveedorData ? (
                  <Text style={styles.infoProveedor}>
                    Proveedor: <Text style={{fontWeight: 'bold'}}>{proveedorData.nombre}</Text> (Doc: {proveedorData.documento})
                  </Text>
                ) : (
                  <Text style={styles.error}>Seleccione un proveedor de la lista de resultados.</Text>
                )}

                {/* DETALLE DE COMPRA (CARRITO) */}
                <View style={styles.detalleHeader}>
                  <Text style={styles.subtitulo}>Productos a Comprar ({itemsCompra.length})</Text>
                  <TouchableOpacity style={styles.botonAgregar} onPress={() => setModalDetalleVisible(true)}>
                    <Text style={styles.textoBoton}>+ Item</Text>
                  </TouchableOpacity>
                </View>

                {/* LISTA DE ÍTEMS EN EL CARRITO */}
                {itemsCompra.map((item, index) => (
                  <View key={index} style={styles.itemDetalle}>
                    <Text style={[styles.itemTexto, {fontWeight: 'bold'}]}>{item.nombre_producto}</Text>
                    <Text style={styles.itemTexto}>Cant: {item.cantidad} x ${parseFloat(item.precio_unitario).toFixed(2)}</Text>
                    <Text style={styles.itemTotal}>Total: ${parseFloat(item.total_item).toFixed(2)}</Text>
                    <TouchableOpacity onPress={() => eliminarItemCompra(index)}>
                      <Text style={styles.eliminarItem}>❌</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <Text style={styles.totalFactura}>TOTAL A PAGAR: ${calcularTotalFactura().toFixed(2)}</Text>
              
              </ScrollView>

              {/* BOTONES DE GUARDAR/CANCELAR (Fijos en el Modal) */}
              <View style={styles.botonesContainer}>
                <TouchableOpacity style={[styles.boton, styles.botonIzquierda]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.textoBoton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.boton, styles.botonDerecha]} onPress={guardarCompra}>
                  <Text style={styles.textoBoton}>Guardar Compra</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL PARA AGREGAR PRODUCTO */}
      <Modal visible={modalDetalleVisible} animationType="slide" transparent={true}>
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
            {(busquedaProducto.trim().length > 0 && resultadosProducto.length > 0 && productoData?.nombre !== busquedaProducto) ? (
                <View style={styles.resultadoBusqueda}>
                    {resultadosProducto.map((producto) => (
                        <TouchableOpacity 
                            key={producto.id} 
                            style={styles.opcionBusqueda}
                            onPress={() => seleccionarProducto(producto)}
                        >
                            <Text>{producto.nombre} (${producto.precio_compra})</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (busquedaProducto.trim().length > 0 && productoData?.nombre !== busquedaProducto && 
                <Text style={styles.errorSmall}>Producto no encontrado...</Text>
            )}

            {/* Tarjeta de Producto SELECCIONADO */}
            {productoData ? (
                <View style={styles.infoProducto}>
                    <Text>
                        Producto: <Text style={{fontWeight: 'bold'}}>{productoData.nombre}</Text>
                    </Text>
                    <Text>Precio Compra: ${productoData.precio_compra !== undefined ? parseFloat(productoData.precio_compra).toFixed(2) : 'N/A'}</Text>
                </View>
            ) : (
                <Text style={styles.error}>Seleccione un producto de la lista de resultados.</Text>
            )}

            <TextInput 
              style={styles.input} 
              placeholder="Cantidad" 
              value={cantidad} 
              onChangeText={setCantidad} 
              keyboardType="numeric" 
            />
            
            <View style={styles.botonesContainer}>
              <TouchableOpacity style={[styles.boton, styles.botonIzquierda]} onPress={() => setModalDetalleVisible(false)}>
                <Text style={styles.textoBoton}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.boton, styles.botonDerecha]} onPress={agregarItemCompra} disabled={!productoData}>
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
    subtitulo: { fontSize: 18, fontWeight: "bold", marginVertical: 15, textAlign: "center", color: "#333" }, 
    input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 15, padding: 10, borderRadius: 5 }, 
    botonRegistroContainer: { marginBottom: 10, alignItems: "center" },
    botonRegistro: { backgroundColor: "#800080", padding: 12, borderRadius: 5, width: "70%", alignItems: "center" }, 
    textoBoton: { color: "#fff", fontWeight: "bold" },
    botonesContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, paddingHorizontal: 20, paddingBottom: 15 }, 
    boton: { flex: 1, padding: 10, borderRadius: 5, alignItems: "center" },
    botonIzquierda: { backgroundColor: "#888", marginRight: 5 },
    botonDerecha: { backgroundColor: "#FFC107", marginLeft: 5 }, 
    modalFondo: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.7)" },
    keyboardAvoidingContainer: { flex: 1, justifyContent: 'center' }, 
    modalContenido: { backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 10, flex: 1, paddingVertical: 10 }, 
    modalContenidoSmall: { backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 10, padding: 20 }, 
    scrollContent: { paddingHorizontal: 20, paddingBottom: 10 }, 
    tituloModal: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#800080" },
    resultado: { marginVertical: 10, padding: 10, backgroundColor: '#f3e5f5', borderRadius: 5, borderWidth: 1, borderColor: '#800080' },
    totalResultado: { fontSize: 16, fontWeight: 'bold', marginTop: 5, color: '#800080' },
    noEncontrado: { textAlign: "center", marginTop: 10, color: "gray" },
    resultadoBusqueda: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, maxHeight: 150, marginTop: 5 }, 
    opcionBusqueda: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    errorSmall: { color: 'gray', padding: 10, textAlign: 'center', marginBottom: 15 },
    infoProveedor: { backgroundColor: '#f0f4c3', padding: 10, borderRadius: 4, marginVertical: 10, borderWidth: 1, borderColor: '#c0ca33' },
    infoProducto: { backgroundColor: '#fff8e1', padding: 10, borderRadius: 4, marginVertical: 10, borderWidth: 1, borderColor: '#FFC107' },
    error: { color: 'red', marginVertical: 10, padding: 5 },
    detalleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 }, 
    botonAgregar: { backgroundColor: '#FFC107', padding: 5, borderRadius: 5 },
    itemDetalle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 5, marginBottom: 8 },
    itemTexto: { flex: 3 },
    itemTotal: { flex: 1, fontWeight: 'bold', textAlign: 'right', color: '#000' },
    eliminarItem: { color: 'red', marginLeft: 10, fontWeight: 'bold' },
    totalFactura: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginTop: 15, color: '#800080', borderTopWidth: 1, paddingTop: 10, marginBottom: 15 },
});

export default FormularioCompras;
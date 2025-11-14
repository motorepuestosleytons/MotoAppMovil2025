// FormularioProductos.js (FINAL ESTILIZADO)
import React, { useState, useEffect } from "react";
import {
  View, TextInput, StyleSheet, Text, Modal, TouchableOpacity, Alert, Image, ScrollView,
} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Colores de la paleta moderna
const COLOR_PRINCIPAL = "#1E90FF"; // Azul Brillante (Botón Catálogo, Modal Guardar)
const COLOR_EXITO = "#00A878";     // Verde Menta Oscuro (Botón Registrar)
const COLOR_CANCELAR = "#6c757d";  // Gris Oscuro (Botón Cancelar)

const FormularioProductos = ({ cargarDatos }) => {
  const navigation = useNavigation();

  // --- Estados de Formulario y Modal ---
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("");
  const [foto, setFoto] = useState("");
  const [modalRegistroVisible, setModalRegistroVisible] = useState(false);
  
  // --- Estados de Búsqueda ---
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState(null);

  /** Guarda el nuevo producto en Firebase (Tu lógica) */
  const guardarProducto = async () => {
    // Validación de campos
    if (!nombre || !marca || !modelo || !precioCompra || !precioVenta || !stock) {
      Alert.alert("Atención", "Complete todos los campos del producto.");
      return;
    }

    const pcNum = parseFloat(precioCompra.replace(",", "."));
    const pvNum = parseFloat(precioVenta.replace(",", "."));
    const stockNum = parseInt(stock, 10);

    if (isNaN(pcNum) || isNaN(pvNum) || isNaN(stockNum)) {
        Alert.alert("Error", "Precios o stock inválido. Use solo números.");
        return;
    }
    
    try {
      await addDoc(collection(db, "Productos"), {
        nombre,
        marca,
        modelo,
        precio_compra: pcNum, // Usando los valores validados
        precio_venta: pvNum,
        stock: stockNum,
        foto: foto || "",
      });
      
      // Limpiar y Recargar
      setNombre(""); setMarca(""); setModelo(""); setPrecioCompra(""); setPrecioVenta(""); setStock(""); setFoto("");
      cargarDatos(); 
      setModalRegistroVisible(false);
      Alert.alert("Éxito", "Producto registrado correctamente.");
    } catch (error) { 
        console.error("Error al guardar producto:", error); 
        Alert.alert("Error", "No se pudo registrar el producto."); 
    }
  };

  /** Lógica de búsqueda con debounce (Tu lógica) */
  useEffect(() => {
    const buscarProducto = async () => {
      if (!busqueda.trim()) { setResultado(null); return; }
      try {
        const snapshot = await getDocs(collection(db, "Productos"));
        const productoEncontrado = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          .find(p => p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
                      p.marca?.toLowerCase().includes(busqueda.toLowerCase()) || 
                      p.modelo?.toLowerCase().includes(busqueda.toLowerCase()));
        // El resultado puede ser un objeto de producto o null si no se encuentra
        setResultado(productoEncontrado || null); 
      } catch (error) { 
          console.error("Error en la búsqueda:", error); 
          setResultado(false); // Indicador de error de búsqueda
      }
    };
    const handler = setTimeout(() => buscarProducto(), 300);
    return () => clearTimeout(handler);
  }, [busqueda]);

  /** Navegación al Catálogo (Tu lógica) */
  const navegarACatalogo = () => {
    navigation.navigate("Catalogo"); // Asume que 'Catalogo' es el nombre de tu ruta
  };


  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gestión de Productos</Text>

      {/* 🎯 Botones de ACCIÓN PRINCIPAL (Registro y Catálogo) 🎯 */}
      <View style={styles.botonesAccionPrincipalContainer}>
        
        {/* BOTÓN 1: Registrar Producto (Verde) */}
        <TouchableOpacity 
            style={[styles.botonAccion, styles.botonRegistro]} 
            onPress={() => setModalRegistroVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.textoBoton}>Registrar</Text>
        </TouchableOpacity>

        {/* BOTÓN 2: Ver Catálogo (Azul) - Usa tu función de navegación */}
        <TouchableOpacity 
            style={[styles.botonAccion, styles.botonCatalogo]} 
            onPress={navegarACatalogo}
        >
          <Ionicons name="grid-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.textoBoton}>Ver Catálogo</Text>
        </TouchableOpacity>
        
      </View>
      
      {/* Buscador Estilizado */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.inputSearch}
          placeholder="Buscar por nombre, marca o modelo"
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Resultado búsqueda */}
      {busqueda.trim().length > 0 && (
        <View style={styles.resultadoBusquedaContainer}>
          {resultado ? (
            <View style={styles.resultado}>
              <Image
                source={{ uri: resultado.foto || "https://via.placeholder.com/80?text=Sin+Foto" }}
                style={styles.resultadoImagen}
                resizeMode="cover"
              />
              <View>
                <Text style={styles.resultadoTexto}><Text style={styles.label}>Nombre:</Text> {resultado.nombre}</Text>
                <Text style={styles.resultadoTexto}><Text style={styles.label}>Marca/Modelo:</Text> {resultado.marca} / {resultado.modelo}</Text>
                <Text style={styles.resultadoTexto}><Text style={styles.label}>Stock:</Text> {Number(resultado.stock)} unidades</Text>
              </View>
            </View>
          ) : busqueda.trim().length > 0 && <Text style={styles.noEncontrado}>Producto no encontrado.</Text>}
        </View>
      )}

      {/* Modal Registro (Estilizado) */}
      <Modal visible={modalRegistroVisible} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <Text style={styles.tituloModal}>✍️ Registrar Producto</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              
              <Text style={styles.label}>URL de Foto:</Text>
              <TextInput style={styles.input} placeholder="URL (Opcional)" value={foto} onChangeText={setFoto} />
              
              {/* Preview de Imagen */}
              {foto ? (
                <Image source={{ uri: foto }} style={styles.preview} resizeMode="cover" />
              ) : (
                <Text style={styles.mensajePreview}>La imagen se mostrará aquí.</Text>
              )}

              <Text style={styles.label}>Nombre:</Text><TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
              <Text style={styles.label}>Marca:</Text><TextInput style={styles.input} placeholder="Marca" value={marca} onChangeText={setMarca} />
              <Text style={styles.label}>Modelo:</Text><TextInput style={styles.input} placeholder="Modelo" value={modelo} onChangeText={setModelo} />
              <Text style={styles.label}>Precio Compra:</Text><TextInput style={styles.input} placeholder="Precio de compra" value={precioCompra} onChangeText={setPrecioCompra} keyboardType="numeric" />
              <Text style={styles.label}>Precio Venta:</Text><TextInput style={styles.input} placeholder="Precio de venta" value={precioVenta} onChangeText={setPrecioVenta} keyboardType="numeric" />
              <Text style={styles.label}>Stock:</Text><TextInput style={styles.input} placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" />
            </ScrollView>

            <View style={styles.botonesContainer}>
              <TouchableOpacity style={[styles.boton, styles.botonCancelar]} onPress={() => setModalRegistroVisible(false)}>
                <Text style={styles.textoBoton}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.boton, styles.botonGuardar]} onPress={guardarProducto}>
                <Text style={styles.textoBoton}>Guardar</Text>
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
  container: { padding: 15, backgroundColor: "#fff", borderRadius: 10, marginBottom: 20,marginTop: 20 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: '#333' },
  label: { fontWeight: "bold", color: '#555' },
  
  // --- Estilos de Botones de Acción Principal ---
  botonesAccionPrincipalContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 25, 
    paddingHorizontal: 10 
  },
  botonAccion: {
    padding: 12, 
    borderRadius: 8, 
    alignItems: "center", 
    flexDirection: "row", 
    justifyContent: "center",
    width: "48%", 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  botonRegistro: { 
    backgroundColor: COLOR_EXITO,
    shadowColor: COLOR_EXITO, 
  },
  botonCatalogo: { 
    backgroundColor: COLOR_PRINCIPAL,
    shadowColor: COLOR_PRINCIPAL,
  },
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  
  // Registro/Búsqueda (Resto)
  searchContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, backgroundColor: "#fff", paddingHorizontal: 10, marginBottom: 15 },
  inputSearch: { flex: 1, paddingVertical: 10, fontSize: 16, color: "#333" },
  resultadoBusquedaContainer: { marginBottom: 15 },
  resultado: { padding: 15, backgroundColor: "#e6f7ff", borderRadius: 8, borderLeftWidth: 4, borderLeftColor: COLOR_PRINCIPAL, flexDirection: 'row', alignItems: 'center' },
  resultadoImagen: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
  resultadoTexto: { fontSize: 15, lineHeight: 22, color: "#333", marginTop: 3 },
  noEncontrado: { textAlign: "center", padding: 10, backgroundColor: "#f8d7da", color: '#DC3545', fontWeight: "600", borderRadius: 8, borderWidth: 1, borderColor: "#f5c6cb" },
  
  // Modal
  modalFondo: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)" },
  modalContenido: { backgroundColor: "#fff", margin: 20, borderRadius: 15, padding: 25 },
  tituloModal: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center", color: "#333" },
  input: { borderWidth: 1, borderColor: "#ddd", marginBottom: 15, padding: 12, borderRadius: 8, fontSize: 16, backgroundColor: "#fefefe" },
  botonesContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  boton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  botonCancelar: { backgroundColor: COLOR_CANCELAR, marginRight: 5 },
  botonGuardar: { backgroundColor: COLOR_PRINCIPAL, marginLeft: 5 },
  preview: { width: '100%', height: 100, borderRadius: 8, marginBottom: 15, backgroundColor: '#eee', borderWidth: 1, borderColor: '#ccc' },
  mensajePreview: { textAlign: 'center', color: '#999', marginBottom: 15, fontStyle: 'italic', padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
});

export default FormularioProductos;
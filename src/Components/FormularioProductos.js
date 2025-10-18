// src/components/FormularioProductos.js (Ajustado)

import React, { useState, useEffect } from "react";
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ScrollView 
} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Recibe la nueva prop onVerCatalogo
const FormularioProductos = ({ cargarDatos, onVerCatalogo }) => {
  // Lógica NO modificada (useState y useEffect)
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("");
  const [foto, setFoto] = useState("");

  const [modalRegistroVisible, setModalRegistroVisible] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState(null);

  const guardarProducto = async () => {
    // Lógica NO modificada
    if (nombre && marca && modelo && precioCompra && precioVenta && stock) {
      try {
        await addDoc(collection(db, "Productos"), {
          nombre,
          marca,
          modelo,
          precio_compra: parseFloat(precioCompra),
          precio_venta: parseFloat(precioVenta),
          stock: parseInt(stock),
          foto,
        });

        setNombre("");
        setMarca("");
        setModelo("");
        setPrecioCompra("");
        setPrecioVenta("");
        setStock("");
        setFoto("");

        cargarDatos();
        setModalRegistroVisible(false);
        Alert.alert("Éxito", "Producto registrado correctamente.");
      } catch (error) {
        console.error("Error al registrar producto:", error);
        Alert.alert("Error", "No se pudo registrar el producto.");
      }
    } else {
      Alert.alert("Atención", "Por favor, complete todos los campos obligatorios.");
    }
  };

  useEffect(() => {
    // Lógica NO modificada (búsqueda)
    const buscarProducto = async () => {
      if (!busqueda.trim()) {
        setResultado(null);
        return;
      }
      try {
        const snapshot = await getDocs(collection(db, "Productos"));
        const productoEncontrado = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .find(
            (p) =>
              p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
              p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
              p.modelo.toLowerCase().includes(busqueda.toLowerCase())
          );
        setResultado(productoEncontrado || null);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
    };

    const handler = setTimeout(() => {
      buscarProducto();
    }, 300);

    return () => clearTimeout(handler);
  }, [busqueda]);

  return (
    <View style={styles.container}>
      {/* 🔑 Texto encapsulado */}
      <Text style={styles.titulo}>Gestión de Productos</Text>

      <View style={styles.botonRegistroContainer}>
        <TouchableOpacity
          style={styles.botonRegistro}
          onPress={() => setModalRegistroVisible(true)}
        >
          {/* 🔑 Texto encapsulado */}
          <Text style={styles.textoBoton}>Registrar Producto</Text>
        </TouchableOpacity>

        {/* ⬅️ NUEVO: Botón para el Catálogo */}
        {onVerCatalogo && (
          <TouchableOpacity
            style={styles.botonCatalogo} 
            onPress={onVerCatalogo} // Llama a la función de navegación
          >
            <Text style={styles.textoBoton}>Ver Catálogo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Buscador (Input no necesita <Text>) */}
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre, marca o modelo"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Mostrar resultado */}
      {resultado ? (
        <View style={styles.resultado}>
          {/* 🔑 Texto encapsulado */}
          <Text>Nombre: {resultado.nombre}</Text>
          <Text>Marca: {resultado.marca}</Text>
          <Text>Modelo: {resultado.modelo}</Text>
          <Text>Precio compra: {resultado.precio_compra}</Text>
          <Text>Precio venta: {resultado.precio_venta}</Text>
          <Text>Stock: {resultado.stock}</Text>
        </View>
      ) : (
        busqueda.trim().length > 0 && (
          // 🔑 Texto encapsulado
          <Text style={styles.noEncontrado}>No se encontró producto</Text>
        )
      )}

      {/* Modal de registro (NO MODIFICADO) */}
      <Modal visible={modalRegistroVisible} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            {/* 🔑 Texto encapsulado */}
            <Text style={styles.tituloModal}>Registrar Producto</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {/* CAMPO URL DE IMAGEN */}
              {/* 🔑 Texto encapsulado */}
              <Text style={styles.label}>URL de Imagen</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. https://miimagen.com/foto.png (Opcional)"
                value={foto}
                onChangeText={setFoto}
              />
              {/* PREVISUALIZACIÓN */}
              {foto ? (
                <Image
                  source={{ uri: foto }}
                  style={styles.preview}
                  resizeMode="contain"
                  onError={() => console.log('Error al cargar la imagen de preview')}
                />
              ) : (
                // 🔑 Texto encapsulado
                <Text style={styles.mensajePreview}>La imagen se mostrará aquí (si ingresa URL)</Text>
              )}
              {/* CAMPOS RESTANTES */}
              {/* 🔑 Texto encapsulado */}
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
              />
              {/* 🔑 Texto encapsulado */}
              <Text style={styles.label}>Marca</Text>
              <TextInput
                style={styles.input}
                placeholder="Marca"
                value={marca}
                onChangeText={setMarca}
              />
              {/* 🔑 Texto encapsulado */}
              <Text style={styles.label}>Modelo</Text>
              <TextInput
                style={styles.input}
                placeholder="Modelo"
                value={modelo}
                onChangeText={setModelo}
              />
              {/* 🔑 Texto encapsulado */}
              <Text style={styles.label}>Precio de Compra</Text>
              <TextInput
                style={styles.input}
                placeholder="Precio de compra"
                value={precioCompra}
                onChangeText={setPrecioCompra}
                keyboardType="numeric"
              />
              {/* 🔑 Texto encapsulado */}
              <Text style={styles.label}>Precio de Venta</Text>
              <TextInput
                style={styles.input}
                placeholder="Precio de venta"
                value={precioVenta}
                onChangeText={setPrecioVenta}
                keyboardType="numeric"
              />
              {/* 🔑 Texto encapsulado */}
              <Text style={styles.label}>Stock</Text>
              <TextInput
                style={styles.input}
                placeholder="Stock"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.botonesContainer}>
              <TouchableOpacity
                style={[styles.boton, styles.botonIzquierda]}
                onPress={() => setModalRegistroVisible(false)}
              >
                {/* 🔑 Texto encapsulado */}
                <Text style={styles.textoBoton}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.boton, styles.botonDerecha]}
                onPress={guardarProducto}
              >
                {/* 🔑 Texto encapsulado */}
                <Text style={styles.textoBoton}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Estilos Ajustados (Añadiendo el estilo del botón Catálogo)
const styles = StyleSheet.create({
  container: { padding: 10, flex: 1 },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { 
    fontSize: 14, 
    color: '#333',
    marginBottom: 5, 
    fontWeight: 'bold' 
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  botonesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  boton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  botonIzquierda: { backgroundColor: "#007BFF", marginRight: 5 },
  botonDerecha: { backgroundColor: "#28A745", marginLeft: 5 },
  textoBoton: { color: "#fff", fontWeight: "bold" },
  botonRegistroContainer: { 
    marginBottom: 20, 
    flexDirection: 'row', // Para que los botones estén uno al lado del otro
    justifyContent: 'space-around',
  },
  botonRegistro: {
    backgroundColor: "#28A745",
    padding: 10,
    borderRadius: 5,
    width: "45%", // Ajuste para que quepan dos botones
    alignItems: "center",
  },
  // ⬅️ NUEVO ESTILO PARA EL BOTÓN DE CATÁLOGO
  botonCatalogo: { 
    backgroundColor: "#007BFF", // Azul para el Catálogo
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  modalFondo: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContenido: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  tituloModal: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  preview: {
    width: '100%',
    height: 100,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#e0e0e0', // Fondo para la imagen
    borderWidth: 1,
    borderColor: '#ccc'
  },
  mensajePreview: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 10,
    fontStyle: 'italic',
    padding: 10,
  },
  resultado: { marginVertical: 10 },
  noEncontrado: { textAlign: "center", marginTop: 10, color: "gray" },
});

export default FormularioProductos;
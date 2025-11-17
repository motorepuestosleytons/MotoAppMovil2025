// src/Components/FormularioProductos.js (CON VALIDACIONES EN MODAL)
import React, { useState } from "react";
import {
  View, TextInput, StyleSheet, Text, Modal, TouchableOpacity, Alert, Image, ScrollView,
} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore"; // ← Añadí getDocs
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const COLOR_PRINCIPAL = "#1E90FF";
const COLOR_EXITO = "#00A878";
const COLOR_LAMBDA = "#FF6B35";

const FormularioProductos = ({ cargarDatos }) => {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("");
  const [foto, setFoto] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const guardarProducto = async () => {
    if (!nombre || !marca || !modelo || !precioCompra || !precioVenta || !stock) {
      Alert.alert("Atención", "Complete todos los campos.");
      return;
    }
    const pc = parseFloat(precioCompra.replace(",", "."));
    const pv = parseFloat(precioVenta.replace(",", "."));
    const st = parseInt(stock, 10);
    if (isNaN(pc) || isNaN(pv) || isNaN(st)) {
      Alert.alert("Error", "Datos numéricos inválidos.");
      return;
    }
    try {
      await addDoc(collection(db, "Productos"), {
        nombre, marca, modelo,
        precio_compra: pc, precio_venta: pv, stock: st, foto: foto || ""
      });
      limpiarCampos();
      cargarDatos();
      setModalVisible(false);
      Alert.alert("Éxito", "Producto registrado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar.");
    }
  };

  const limpiarCampos = () => {
    setNombre(""); setMarca(""); setModelo(""); setPrecioCompra(""); setPrecioVenta(""); setStock(""); setFoto("");
  };

  const exportarConLambda = async () => {
    try {
      const snap = await getDocs(collection(db, "Productos"));
      const productos = snap.docs.map(doc => {
        const d = doc.data();
        return {
          nombre: d.nombre || '',
          marca: d.marca || '',
          modelo: d.modelo || '',
          precio_compra: d.precio_compra || 0,
          precio_venta: d.precio_venta || 0,
          stock: d.stock || 0
        };
      });
      if (productos.length === 0) {
        Alert.alert("Advertencia", "No hay productos para exportar.");
        return;
      }
      const response = await fetch('https://gzl41lf0z4.execute-api.us-east-1.amazonaws.com/generarexcel_productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datos: productos })
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const fileUri = FileSystem.cacheDirectory + "productos_moto.xlsx";
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'MotoApp - Productos',
        });
        Alert.alert("Éxito", "Excel generado.");
      }
    } catch (error) {
      Alert.alert("Error", `Falló: ${error.message}`);
    }
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gestión de Productos</Text>

      <View style={styles.botonesAccion}>
        <TouchableOpacity style={[styles.boton, styles.botonRegistro]} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.textoBoton}> Registrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.boton, styles.botonCatalogo]} onPress={() => navigation.navigate("Catalogo")}>
          <Ionicons name="grid-outline" size={20} color="#fff" />
          <Text style={styles.textoBoton}> Catálogo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.botonLambdaContainer}>
        <TouchableOpacity style={styles.botonLambda} onPress={exportarConLambda}>
          <Ionicons name="cloud-download-outline" size={22} color="#fff" />
          <Text style={styles.textoBotonLambda}>Exportar Excel</Text>
        </TouchableOpacity>
      </View>

      {/* === MODAL CON VALIDACIONES (MISMA LÓGICA QUE CLIENTES) === */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <View style={styles.modal}>
            <Text style={styles.tituloModal}>Registrar Producto</Text>
            <ScrollView style={{ maxHeight: 400 }}>

              {/* FOTO URL: Permitir URLs completas */}
              <Text style={styles.label}>Foto URL:</Text>
              <TextInput
                style={styles.input}
                placeholder="https://ejemplo.com/foto.jpg"
                value={foto}
                onChangeText={(text) => setFoto(text.trim())}
                autoCapitalize="none"
              />
              {foto && <Image source={{ uri: foto }} style={styles.preview} />}

              {/* NOMBRE: SOLO LETRAS Y ESPACIOS */}
              <Text style={styles.label}>Nombre:</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={(text) => setNombre(text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))}
              />

              {/* MARCA: LETRAS, NÚMEROS Y ESPACIOS */}
              <Text style={styles.label}>Marca:</Text>
              <TextInput
                style={styles.input}
                placeholder="Marca"
                value={marca}
                onChangeText={(text) => setMarca(text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, ''))}
              />

              {/* MODELO: LETRAS, NÚMEROS, GUIONES Y ESPACIOS */}
              <Text style={styles.label}>Modelo:</Text>
              <TextInput
                style={styles.input}
                placeholder="Modelo"
                value={modelo}
                onChangeText={(text) => setModelo(text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-]/g, ''))}
              />

              {/* PRECIO COMPRA: SOLO NÚMEROS Y PUNTO/COMA */}
              <Text style={styles.label}>Precio Compra:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={precioCompra}
                onChangeText={(text) => setPrecioCompra(text.replace(/[^0-9.,]/g, ''))}
                keyboardType="numeric"
              />

              {/* PRECIO VENTA: SOLO NÚMEROS Y PUNTO/COMA */}
              <Text style={styles.label}>Precio Venta:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={precioVenta}
                onChangeText={(text) => setPrecioVenta(text.replace(/[^0-9.,]/g, ''))}
                keyboardType="numeric"
              />

              {/* STOCK: SOLO NÚMEROS ENTEROS */}
              <Text style={styles.label}>Stock:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={stock}
                onChangeText={(text) => setStock(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
              />

            </ScrollView>

            <View style={styles.botonesModal}>
              <TouchableOpacity style={[styles.botonModal, styles.cancelar]} onPress={() => { limpiarCampos(); setModalVisible(false); }}>
                <Text style={styles.textoBotonModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botonModal, styles.guardar]} onPress={guardarProducto}>
                <Text style={styles.textoBotonModal}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#fff", borderRadius: 12, marginVertical: 20, elevation: 3,marginTop: 30 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
  botonesAccion: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  boton: { padding: 12, borderRadius: 10, flexDirection: "row", alignItems: "center", width: "48%", elevation: 3, justifyContent: "center" },
  botonRegistro: { backgroundColor: COLOR_EXITO },
  botonCatalogo: { backgroundColor: COLOR_PRINCIPAL },
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 15, marginLeft: 6 },
  botonLambdaContainer: { marginBottom: 15 },
  botonLambda: { backgroundColor: COLOR_LAMBDA, padding: 14, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", elevation: 5 },
  textoBotonLambda: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
  modalFondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center" },
  modal: { backgroundColor: "#fff", margin: 20, borderRadius: 15, padding: 25, maxHeight: "85%" },
  tituloModal: { fontSize: 20, fontWeight: "700", marginBottom: 15, textAlign: "center" },
  label: { fontWeight: "bold", color: "#555", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginBottom: 10, backgroundColor: "#fefefe" },
  preview: { width: "100%", height: 100, borderRadius: 8, marginBottom: 15 },
  botonesModal: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  botonModal: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
  cancelar: { backgroundColor: "#6c757d", marginRight: 5 },
  guardar: { backgroundColor: COLOR_PRINCIPAL, marginLeft: 5 },
  textoBotonModal: { color: "#fff", fontWeight: "bold" },
});

export default FormularioProductos;
// src/Components/FormularioProveedores.js
import React, { useState, useEffect } from "react";
import {
  View, TextInput, StyleSheet, Text, Modal, TouchableOpacity, Alert,
} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const COLOR_PRINCIPAL = "#1E90FF";
const COLOR_EXITO = "#00A878";
const COLOR_LAMBDA = "#FF6B35";

const FormularioProveedores = ({ cargarDatos }) => {
  const [empresa, setEmpresa] = useState("");
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [telefono, setTelefono] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState(null);

  // === GUARDAR PROVEEDOR ===
  const guardarProveedor = async () => {
    if (!empresa || !nombreProveedor || !telefono) {
      Alert.alert("Atención", "Complete todos los campos.");
      return;
    }
    try {
      await addDoc(collection(db, "Proveedores"), {
        empresa,
        nombre_proveedor: nombreProveedor,
        telefono,
      });
      setEmpresa(""); setNombreProveedor(""); setTelefono("");
      cargarDatos();
      setModalVisible(false);
      Alert.alert("Éxito", "Proveedor registrado.");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar.");
    }
  };

  // === BÚSQUEDA ===
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!busqueda.trim()) { setResultado(null); return; }
      const snap = await getDocs(collection(db, "Proveedores"));
      const encontrado = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .find(c =>
          c.empresa?.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.nombre_proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.telefono?.includes(busqueda)
        );
      setResultado(encontrado || null);
    }, 300);
    return () => clearTimeout(handler);
  }, [busqueda]);

  // === EXPORTAR CON LAMBDA ===
  const exportarConLambda = async () => {
    try {
      const snap = await getDocs(collection(db, "Proveedores"));
      const proveedores = snap.docs.map(doc => {
        const d = doc.data();
        return {
          empresa: d.empresa || '',
          nombre_proveedor: d.nombre_proveedor || '',
          telefono: d.telefono || ''
        };
      });

      if (proveedores.length === 0) {
        Alert.alert("Advertencia", "No hay proveedores para exportar.");
        return;
      }

      const response = await fetch('https://gzl41lf0z4.execute-api.us-east-1.amazonaws.com/generarexcel_proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datos: proveedores })
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const fileUri = FileSystem.cacheDirectory + "proveedores.xlsx";

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Proveedores - Excel',
        });
        Alert.alert("Éxito", "Proveedores exportados con Lambda.");
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
      <Text style={styles.titulo}>Gestión de Proveedores</Text>

      <View style={styles.botonesAccion}>
        <TouchableOpacity style={[styles.boton, styles.botonRegistro]} onPress={() => setModalVisible(true)}>
          <Ionicons name="people-circle-outline" size={20} color="#fff" />
          <Text style={styles.textoBoton}> Registrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.boton, styles.botonLambda]} onPress={exportarConLambda}>
          <Ionicons name="cloud-download-outline" size={22} color="#fff" />
          <Text style={styles.textoBotonLambda}>Exportar Excel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput style={styles.inputSearch} placeholder="Buscar proveedor..." value={busqueda} onChangeText={setBusqueda} />
      </View>

      {busqueda.trim() && (
        <View style={styles.resultadoContainer}>
          {resultado ? (
            <View style={styles.resultado}>
              <Text style={styles.texto}>Empresa: {resultado.empresa}</Text>
              <Text style={styles.texto}>Nombre: {resultado.nombre_proveedor}</Text>
              <Text style={styles.texto}>Teléfono: {resultado.telefono}</Text>
            </View>
          ) : <Text style={styles.noEncontrado}>No encontrado</Text>}
        </View>
      )}

      {/* === MODAL CON VALIDACIONES (MISMA LÓGICA QUE CLIENTES) === */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <View style={styles.modal}>
            <Text style={styles.tituloModal}>Registrar Proveedor</Text>

            {/* EMPRESA: LETRAS, NÚMEROS, ESPACIOS Y CARACTERES COMUNES */}
            <TextInput
              style={styles.input}
              placeholder="Empresa"
              value={empresa}
              onChangeText={(text) => setEmpresa(text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-]/g, ''))}
            />

            {/* NOMBRE PROVEEDOR: SOLO LETRAS Y ESPACIOS */}
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nombreProveedor}
              onChangeText={(text) => setNombreProveedor(text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))}
            />

            {/* TELÉFONO: 8888-8888 (8 DÍGITOS + GUION) */}
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={telefono}
              onChangeText={(text) => {
                let limpio = text.replace(/[^0-9]/g, '');
                if (limpio.length > 4) {
                  limpio = limpio.slice(0, 4) + '-' + limpio.slice(4, 8);
                }
                setTelefono(limpio.slice(0, 9));
              }}
              keyboardType="phone-pad"
              maxLength={9}
            />

            <View style={styles.botonesModal}>
              <TouchableOpacity style={[styles.botonModal, styles.cancelar]} onPress={() => setModalVisible(false)}>
                <Text style={styles.textoBotonModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botonModal, styles.guardar]} onPress={guardarProveedor}>
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
  container: { padding: 15, backgroundColor: "#fff", borderRadius: 12, marginVertical: 20, elevation: 3, marginTop: 30 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
  botonesAccion: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  boton: { padding: 12, borderRadius: 10, flexDirection: "row", alignItems: "center", width: "48%", elevation: 3, justifyContent: "center" },
  botonRegistro: { backgroundColor: COLOR_EXITO },
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 15, marginLeft: 6 },
  botonLambda: { backgroundColor: COLOR_LAMBDA, padding: 14, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", elevation: 5 },
  textoBotonLambda: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
  searchContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ddd", borderRadius: 10, paddingHorizontal: 12, marginBottom: 15 },
  inputSearch: { flex: 1, paddingVertical: 10, fontSize: 16 },
  resultadoContainer: { marginBottom: 15 },
  resultado: { backgroundColor: "#e6f7ff", padding: 12, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: COLOR_PRINCIPAL },
  texto: { fontSize: 15, color: "#333", lineHeight: 22 },
  noEncontrado: { textAlign: "center", padding: 12, backgroundColor: "#f8d7da", color: "#dc3545", borderRadius: 10 },
  modalFondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center" },
  modal: { backgroundColor: "#fff", margin: 20, borderRadius: 15, padding: 25, maxHeight: "85%" },
  tituloModal: { fontSize: 20, fontWeight: "700", marginBottom: 15, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginBottom: 10, backgroundColor: "#fefefe" },
  botonesModal: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  botonModal: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
  cancelar: { backgroundColor: "#6c757d", marginRight: 5 },
  guardar: { backgroundColor: COLOR_PRINCIPAL, marginLeft: 5 },
  textoBotonModal: { color: "#fff", fontWeight: "bold" },
});

export default FormularioProveedores;
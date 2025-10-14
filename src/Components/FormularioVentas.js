import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const FormularioVentas = ({ cargarDatos }) => {
  // Campos de la venta
  const [idVenta, setIdVenta] = useState("");
  const [fechaVenta, setFechaVenta] = useState("");
  const [idCliente, setIdCliente] = useState("");

  // Campos del detalle de venta
  const [idDetalleVenta, setIdDetalleVenta] = useState("");
  const [idProducto, setIdProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [total, setTotal] = useState("");

  // Modal
  const [modalVisible, setModalVisible] = useState(false);

  // Búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState(null);

  // Función para generar fecha actual en formato "YYYY-MM-DD HH:mm:ss"
  const generarFechaActual = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    const horas = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");
    const segundos = String(fecha.getSeconds()).padStart(2, "0");
    return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
  };

  // Guardar venta y detalle
  const guardarVenta = async () => {
    if (idVenta && idCliente) {
      try {
        const fechaActual = generarFechaActual();
        // Registrar la venta principal con fecha automática
        const ventaRef = await addDoc(collection(db, "Ventas"), {
          id_venta: parseInt(idVenta),
          fecha_venta: fechaActual,
          id_cliente: parseInt(idCliente),
        });

        // Registrar detalle dentro de subcolección
        if (idDetalleVenta && idProducto && cantidad && precioUnitario && total) {
          await addDoc(collection(db, `Ventas/${ventaRef.id}/Detalle_Venta`), {
            id_detalle_venta: parseInt(idDetalleVenta),
            id_producto: parseInt(idProducto),
            cantidad: parseInt(cantidad),
            precio_unitario: parseFloat(precioUnitario),
            total: parseFloat(total),
          });
        }

        // Limpiar campos
        setIdVenta("");
        setFechaVenta("");
        setIdCliente("");
        setIdDetalleVenta("");
        setIdProducto("");
        setCantidad("");
        setPrecioUnitario("");
        setTotal("");
        cargarDatos();
        setModalVisible(false);
        alert("Venta registrada correctamente");
      } catch (error) {
        console.error("Error al registrar venta:", error);
      }
    } else {
      alert("Por favor, complete los campos requeridos de la venta.");
    }
  };

  // Búsqueda por ID o cliente
  useEffect(() => {
    const buscarVenta = async () => {
      if (!busqueda.trim()) {
        setResultado(null);
        return;
      }
      try {
        const snapshot = await getDocs(collection(db, "Ventas"));
        const ventaEncontrada = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .find((v) => v.id_venta === parseInt(busqueda) || v.id_cliente === parseInt(busqueda));
        setResultado(ventaEncontrada || null);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
    };
    buscarVenta();
  }, [busqueda]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gestión de Ventas</Text>
      {/* Botón abrir modal */}
      <View style={styles.botonRegistroContainer}>
        <TouchableOpacity style={styles.botonRegistro} onPress={() => {
          setFechaVenta(generarFechaActual());
          setModalVisible(true);
        }}>
          <Text style={styles.textoBoton}>Registrar Venta</Text>
        </TouchableOpacity>
      </View>
      {/* Buscador */}
      <TextInput style={styles.input} placeholder="Buscar venta por ID o cliente" value={busqueda} onChangeText={setBusqueda} keyboardType="numeric" />
      {/* Resultado de búsqueda */}
      {resultado ? (
        <View style={styles.resultado}>
          <Text>ID Venta: {resultado.id_venta}</Text>
          <Text>Fecha: {resultado.fecha_venta}</Text>
          <Text>ID Cliente: {resultado.id_cliente}</Text>
        </View>
      ) : (
        busqueda.trim().length > 0 && (
          <Text style={styles.noEncontrado}>No se encontró la venta</Text>
        )
      )}
      {/* Modal de registro */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <ScrollView>
              <Text style={styles.tituloModal}>Registrar Venta</Text>
              {/* Datos de venta */}
              <TextInput style={styles.input} placeholder="ID Venta" value={idVenta} onChangeText={setIdVenta} keyboardType="numeric" />
              {/* Fecha automática (solo lectura) */}
              <TextInput style={[styles.input, { backgroundColor: "#eee" }]} placeholder="Fecha automática" value={fechaVenta} editable={false} />
              <TextInput style={styles.input} placeholder="ID Cliente" value={idCliente} onChangeText={setIdCliente} keyboardType="numeric" />
              <Text style={styles.subtitulo}>Detalle de Venta</Text>
              <TextInput style={styles.input} placeholder="ID Detalle Venta" value={idDetalleVenta} onChangeText={setIdDetalleVenta} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="ID Producto" value={idProducto} onChangeText={setIdProducto} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="Cantidad" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="Precio Unitario" value={precioUnitario} onChangeText={setPrecioUnitario} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="Total" value={total} onChangeText={setTotal} keyboardType="numeric" />
              <View style={styles.botonesContainer}>
                <TouchableOpacity style={[styles.boton, styles.botonIzquierda]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.textoBoton}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.boton, styles.botonDerecha]} onPress={guardarVenta}>
                  <Text style={styles.textoBoton}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, flex: 1 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginTop: 15, marginBottom: 10, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 10, padding: 10, borderRadius: 5 },
  botonesContainer: { flexDirection: "row", justifyContent: "space-between" },
  boton: { flex: 1, padding: 10, borderRadius: 5, alignItems: "center" },
  botonIzquierda: { backgroundColor: "#007BFF", marginRight: 5 },
  botonDerecha: { backgroundColor: "#28A745", marginLeft: 5 },
  textoBoton: { color: "#fff", fontWeight: "bold" },
  botonRegistroContainer: { marginBottom: 20, alignItems: "center" },
  botonRegistro: { backgroundColor: "#28A745", padding: 10, borderRadius: 5, width: "60%", alignItems: "center" },
  modalFondo: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContenido: { backgroundColor: "#fff", margin: 20, borderRadius: 10, padding: 20, maxHeight: "85%" },
  tituloModal: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  resultado: { marginVertical: 10 },
  noEncontrado: { textAlign: "center", marginTop: 10, color: "gray" },
});

export default FormularioVentas;
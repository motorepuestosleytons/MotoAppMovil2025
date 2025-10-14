import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const FormularioCompras = ({ cargarDatos }) => {
  // Campos de la compra
  const [idCompra, setIdCompra] = useState("");
  const [fechaCompra, setFechaCompra] = useState(""); // Se llenará automáticamente
  const [idProveedor, setIdProveedor] = useState("");

  // Campos del detalle de compra
  const [idDetalleCompra, setIdDetalleCompra] = useState("");
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

  // Guardar compra y detalle
  const guardarCompra = async () => {
    if (idCompra && idProveedor) {
      try {
        const fechaActual = generarFechaActual();

        // Registrar la compra principal con fecha automática
        const compraRef = await addDoc(collection(db, "Compras"), {
          id_compra: parseInt(idCompra),
          fecha_compra: fechaActual,
          id_proveedor: parseInt(idProveedor),
        });

        // Registrar detalle dentro de subcolección
        if (idDetalleCompra && idProducto && cantidad && precioUnitario && total) {
          await addDoc(collection(db, `Compras/${compraRef.id}/Detalle_Compra`), {
            id_detalle_compra: parseInt(idDetalleCompra),
            id_producto: parseInt(idProducto),
            cantidad: parseInt(cantidad),
            precio_unitario: parseFloat(precioUnitario),
            total: parseFloat(total),
          });
        }

        // Limpiar campos
        setIdCompra("");
        setFechaCompra("");
        setIdProveedor("");
        setIdDetalleCompra("");
        setIdProducto("");
        setCantidad("");
        setPrecioUnitario("");
        setTotal("");

        cargarDatos();
        setModalVisible(false);
        alert("Compra registrada correctamente");
      } catch (error) {
        console.error("Error al registrar compra:", error);
      }
    } else {
      alert("Por favor, complete los campos requeridos de la compra.");
    }
  };

  // Búsqueda por ID o proveedor
  useEffect(() => {
    const buscarCompra = async () => {
      if (!busqueda.trim()) {
        setResultado(null);
        return;
      }
      try {
        const snapshot = await getDocs(collection(db, "Compras"));
        const compraEncontrada = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .find(
            (c) =>
              c.id_compra === parseInt(busqueda) ||
              c.id_proveedor === parseInt(busqueda)
          );
        setResultado(compraEncontrada || null);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
    };

    buscarCompra();
  }, [busqueda]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gestión de Compras</Text>

      {/* Botón abrir modal */}
      <View style={styles.botonRegistroContainer}>
        <TouchableOpacity
          style={styles.botonRegistro}
          onPress={() => {
            setFechaCompra(generarFechaActual());
            setModalVisible(true);
          }}
        >
          <Text style={styles.textoBoton}>Registrar Compra</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <TextInput
        style={styles.input}
        placeholder="Buscar compra por ID o proveedor"
        value={busqueda}
        onChangeText={setBusqueda}
        keyboardType="numeric"
      />

      {/* Resultado de búsqueda */}
      {resultado ? (
        <View style={styles.resultado}>
          <Text>ID Compra: {resultado.id_compra}</Text>
          <Text>Fecha: {resultado.fecha_compra}</Text>
          <Text>ID Proveedor: {resultado.id_proveedor}</Text>
        </View>
      ) : (
        busqueda.trim().length > 0 && (
          <Text style={styles.noEncontrado}>No se encontró la compra</Text>
        )
      )}

      {/* Modal de registro */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <ScrollView>
              <Text style={styles.tituloModal}>Registrar Compra</Text>

              {/* Datos de compra */}
              <TextInput
                style={styles.input}
                placeholder="ID Compra"
                value={idCompra}
                onChangeText={setIdCompra}
                keyboardType="numeric"
              />

              {/* Fecha automática (solo lectura) */}
              <TextInput
                style={[styles.input, { backgroundColor: "#eee" }]}
                placeholder="Fecha automática"
                value={fechaCompra}
                editable={false}
              />

              <TextInput
                style={styles.input}
                placeholder="ID Proveedor"
                value={idProveedor}
                onChangeText={setIdProveedor}
                keyboardType="numeric"
              />

              <Text style={styles.subtitulo}>Detalle de Compra</Text>

              <TextInput
                style={styles.input}
                placeholder="ID Detalle Compra"
                value={idDetalleCompra}
                onChangeText={setIdDetalleCompra}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="ID Producto"
                value={idProducto}
                onChangeText={setIdProducto}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Cantidad"
                value={cantidad}
                onChangeText={setCantidad}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Precio Unitario"
                value={precioUnitario}
                onChangeText={setPrecioUnitario}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Total"
                value={total}
                onChangeText={setTotal}
                keyboardType="numeric"
              />

              <View style={styles.botonesContainer}>
                <TouchableOpacity
                  style={[styles.boton, styles.botonIzquierda]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.textoBoton}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.boton, styles.botonDerecha]}
                  onPress={guardarCompra}
                >
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
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
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
  botonRegistroContainer: { marginBottom: 20, alignItems: "center" },
  botonRegistro: {
    backgroundColor: "#28A745",
    padding: 10,
    borderRadius: 5,
    width: "60%",
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
    maxHeight: "85%",
  },
  tituloModal: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  resultado: { marginVertical: 10 },
  noEncontrado: { textAlign: "center", marginTop: 10, color: "gray" },
});

export default FormularioCompras;

import React, { useState, useEffect } from "react";
import { View,TextInput,StyleSheet,Text,Modal,TouchableOpacity, Alert} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const FormularioProductos = ({ cargarDatos }) => {
  // Campos del formulario (sin idProducto)
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("");

  // Modal de registro
  const [modalRegistroVisible, setModalRegistroVisible] = useState(false);

  // Búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState(null);

  // Guardar producto
  const guardarProducto = async () => {
    if (nombre && marca && modelo && precioCompra && precioVenta && stock) {
      try {
        await addDoc(collection(db, "Productos"), {
          nombre,
          marca,
          modelo,
          precio_compra: parseFloat(precioCompra),
          precio_venta: parseFloat(precioVenta),
          stock: parseInt(stock),
        });

        // Limpiar campos
        setNombre("");
        setMarca("");
        setModelo("");
        setPrecioCompra("");
        setPrecioVenta("");
        setStock("");

        cargarDatos();
        setModalRegistroVisible(false);
        Alert.alert("Éxito", "Producto registrado correctamente.");
      } catch (error) {
        console.error("Error al registrar producto:", error);
        Alert.alert("Error", "No se pudo registrar el producto.");
      }
    } else {
      Alert.alert("Atención", "Por favor, complete todos los campos.");
    }
  };

  // Búsqueda automática (con debounce)
  useEffect(() => {
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
      <Text style={styles.titulo}>Gestión de Productos</Text>

      <View style={styles.botonRegistroContainer}>
        <TouchableOpacity
          style={styles.botonRegistro}
          onPress={() => setModalRegistroVisible(true)}
        >
          <Text style={styles.textoBoton}>Registrar Producto</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre, marca o modelo"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Mostrar resultado */}
      {resultado ? (
        <View style={styles.resultado}>
          <Text>Nombre: {resultado.nombre}</Text>
          <Text>Marca: {resultado.marca}</Text>
          <Text>Modelo: {resultado.modelo}</Text>
          <Text>Precio compra: {resultado.precio_compra}</Text>
          <Text>Precio venta: {resultado.precio_venta}</Text>
          <Text>Stock: {resultado.stock}</Text>
        </View>
      ) : (
        busqueda.trim().length > 0 && (
          <Text style={styles.noEncontrado}>No se encontró producto</Text>
        )
      )}

      {/* Modal de registro */}
      <Modal visible={modalRegistroVisible} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <Text style={styles.tituloModal}>Registrar Producto</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Marca"
              value={marca}
              onChangeText={setMarca}
            />
            <TextInput
              style={styles.input}
              placeholder="Modelo"
              value={modelo}
              onChangeText={setModelo}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio de compra"
              value={precioCompra}
              onChangeText={setPrecioCompra}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Precio de venta"
              value={precioVenta}
              onChangeText={setPrecioVenta}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Stock"
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />

            <View style={styles.botonesContainer}>
              <TouchableOpacity
                style={[styles.boton, styles.botonIzquierda]}
                onPress={() => setModalRegistroVisible(false)}
              >
                <Text style={styles.textoBoton}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.boton, styles.botonDerecha]}
                onPress={guardarProducto}
              >
                <Text style={styles.textoBoton}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// === Estilos iguales a los de Clientes ===
const styles = StyleSheet.create({
  container: { padding: 10, flex: 1 },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
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
    width: "50%",
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
  resultado: { marginVertical: 10 },
  noEncontrado: { textAlign: "center", marginTop: 10, color: "gray" },
});

export default FormularioProductos;
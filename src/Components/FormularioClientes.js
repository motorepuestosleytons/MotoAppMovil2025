import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const FormularioClientes = ({ cargarDatos }) => {
  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [idCliente, setIdCliente] = useState("");

  // Modal de registro
  const [modalRegistroVisible, setModalRegistroVisible] = useState(false);

  // Búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState(null);

  // Guardar cliente
  const guardarCliente = async () => {
    if (nombre && apellido && cedula && telefono && idCliente) {
      try {
        await addDoc(collection(db, "Clientes"), {
          id_cliente: parseInt(idCliente),
          nombre,
          apellido,
          cedula,
          telefono,
        });
        // Limpiar inputs
        setNombre("");
        setApellido("");
        setCedula("");
        setTelefono("");
        setIdCliente("");
        cargarDatos();
        setModalRegistroVisible(false);
      } catch (error) {
        console.error("Error al registrar cliente:", error);
      }
    } else {
      alert("Por favor, complete todos los campos.");
    }
  };

  // Búsqueda automática
  useEffect(() => {
    const buscarCliente = async () => {
      if (!busqueda.trim()) {
        setResultado(null);
        return;
      }
      try {
        const snapshot = await getDocs(collection(db, "Clientes"));
        const clienteEncontrado = snapshot.docs
          .map((doc) => doc.data())
          .find(
            (c) =>
              c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
              c.cedula.includes(busqueda)
          );
        setResultado(clienteEncontrado || null);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
    };

    buscarCliente();
  }, [busqueda]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gestión de Clientes</Text>

      {/* Botón para abrir modal de registro arriba */}
      <View style={styles.botonRegistroContainer}>
        <TouchableOpacity
          style={styles.botonRegistro}
          onPress={() => setModalRegistroVisible(true)}
        >
          <Text style={styles.textoBoton}>Registrar Cliente</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador automático */}
      <TextInput
        style={styles.input}
        placeholder="Buscar cliente por nombre o cédula"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Mostrar resultado */}
      {resultado ? (
        <View style={styles.resultado}>
          <Text>ID: {resultado.id_cliente}</Text>
          <Text>Nombre: {resultado.nombre}</Text>
          <Text>Apellido: {resultado.apellido}</Text>
          <Text>Cédula: {resultado.cedula}</Text>
          <Text>Teléfono: {resultado.telefono}</Text>
        </View>
      ) : (
        busqueda.trim().length > 0 && (
          <Text style={styles.noEncontrado}>No se encontró cliente</Text>
        )
      )}

      {/* Modal de registro */}
      <Modal visible={modalRegistroVisible} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <Text style={styles.tituloModal}>Registrar Cliente</Text>

            <TextInput
              style={styles.input}
              placeholder="ID Cliente"
              value={idCliente}
              onChangeText={setIdCliente}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
            />

            <TextInput
              style={styles.input}
              placeholder="Apellido"
              value={apellido}
              onChangeText={setApellido}
            />

            <TextInput
              style={styles.input}
              placeholder="Cédula"
              value={cedula}
              onChangeText={setCedula}
            />

            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
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
                onPress={guardarCliente}
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

export default FormularioClientes;

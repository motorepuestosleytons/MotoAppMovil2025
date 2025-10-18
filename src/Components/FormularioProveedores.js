import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  Alert, // Usamos Alert en lugar de alert
} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

// El componente se renombra a FormularioProveedores
const FormularioProveedores = ({ cargarDatos }) => {
  // Campos del formulario adaptados a la imagen: empresa, nombre_proveedor, telefono
  const [empresa, setEmpresa] = useState("");
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [telefono, setTelefono] = useState("");

  // Modal de registro
  const [modalRegistroVisible, setModalRegistroVisible] = useState(false);

  // Búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState(null);

  // Guardar proveedor - Se ha modificado para guardar en la colección 'Proveedores'
  // y usar los nuevos campos.
  const guardarProveedor = async () => {
    // Validamos que los 3 campos estén llenos
    if (empresa && nombreProveedor && telefono) {
      try {
        // Colección cambiada de "Clientes" a "Proveedores"
        await addDoc(collection(db, "Proveedores"), {
          empresa: empresa, // Campo 'empresa'
          nombre_proveedor: nombreProveedor, // Campo 'nombre_proveedor'
          telefono: telefono, // Campo 'telefono'
        });
        // Limpiar inputs
        setEmpresa("");
        setNombreProveedor("");
        setTelefono("");
        cargarDatos();
        setModalRegistroVisible(false);
        // Mensaje adaptado
        Alert.alert("Éxito", "Proveedor registrado correctamente.");
      } catch (error) {
        console.error("Error al registrar proveedor:", error);
        // Mensaje adaptado
        Alert.alert("Error", "Hubo un problema al registrar el proveedor.");
      }
    } else {
      Alert.alert("Atención", "Por favor, complete todos los campos.");
    }
  };

  // Búsqueda automática - Adaptada para buscar en la colección 'Proveedores'
  // por 'empresa' o 'nombre_proveedor' (antes 'cedula').
  useEffect(() => {
    const buscarProveedor = async () => {
      if (!busqueda.trim()) {
        setResultado(null);
        return;
      }
      try {
        // Colección cambiada de "Clientes" a "Proveedores"
        const snapshot = await getDocs(collection(db, "Proveedores"));
        const proveedorEncontrado = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() })) // Incluir ID de documento
          .find(
            (c) =>
              c.empresa.toLowerCase().includes(busqueda.toLowerCase()) || // Buscar por 'empresa'
              c.nombre_proveedor.toLowerCase().includes(busqueda.toLowerCase()) // Buscar por 'nombre_proveedor'
          );
        setResultado(proveedorEncontrado || null);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
    };

    // Pequeño debounce para evitar llamadas excesivas a Firestore
    const handler = setTimeout(() => {
      buscarProveedor();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [busqueda]);

  return (
    <View style={styles.container}>
      {/* Título adaptado */}
      <Text style={styles.titulo}>Gestión de Proveedores</Text>

      {/* Botón para abrir modal de registro arriba - Texto adaptado */}
      <View style={styles.botonRegistroContainer}>
        <TouchableOpacity
          style={styles.botonRegistro}
          onPress={() => setModalRegistroVisible(true)}
        >
          <Text style={styles.textoBoton}>Registrar Proveedor</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador automático - Placeholder adaptado */}
      <TextInput
        style={styles.input}
        placeholder="Buscar proveedor por empresa o nombre"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Mostrar resultado - Campos mostrados adaptados */}
      {resultado ? (
        <View style={styles.resultado}>
          <Text>Empresa: {resultado.empresa}</Text>
          <Text>Nombre Proveedor: {resultado.nombre_proveedor}</Text>
          <Text>Teléfono: {resultado.telefono}</Text>
        </View>
      ) : (
        busqueda.trim().length > 0 && (
          // Mensaje adaptado
          <Text style={styles.noEncontrado}>No se encontró proveedor</Text>
        )
      )}

      {/* Modal de registro */}
      <Modal visible={modalRegistroVisible} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            {/* Título del modal adaptado */}
            <Text style={styles.tituloModal}>Registrar Proveedor</Text>

            {/* Input para Empresa (Nuevo) */}
            <TextInput
              style={styles.input}
              placeholder="Empresa"
              value={empresa}
              onChangeText={setEmpresa}
            />

            {/* Input para Nombre Proveedor (Reemplaza a 'Nombre') */}
            <TextInput
              style={styles.input}
              placeholder="Nombre Proveedor"
              value={nombreProveedor}
              onChangeText={setNombreProveedor}
            />

            {/* Input para Teléfono (Igual) */}
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
                onPress={guardarProveedor} // Función adaptada
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

// Se mantienen los estilos
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

// Se exporta el nuevo nombre del componente
export default FormularioProveedores;
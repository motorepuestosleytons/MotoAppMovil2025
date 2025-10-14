import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";

const FormularioProveedores = ({ cargarDatos }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const [idProv, setIdProv] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [telefono, setTelefono] = useState("");

  const guardarProveedor = async () => {
    if (idProv && empresa && nombreProveedor && telefono) {
      try {
        await addDoc(collection(db, "Proveedores"), {
          id_prov: parseInt(idProv),
          empresa,
          nombre_proveedor: nombreProveedor,
          telefono,
        });

        // limpiar inputs
        setIdProv("");
        setEmpresa("");
        setNombreProveedor("");
        setTelefono("");

        cargarDatos();
        setModalVisible(false); // cerrar modal al guardar
      } catch (error) {
        console.error("Error al registrar proveedor:", error);
      }
    } else {
      alert("Por favor, complete todos los campos.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón alineado a la izquierda */}
      <TouchableOpacity
        style={styles.botonAbrir}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.textoBoton}>+ Agregar Proveedor</Text>
      </TouchableOpacity>

      {/* Modal con el formulario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <Text style={styles.titulo}>Registro de Proveedores</Text>

            <TextInput
              style={styles.input}
              placeholder="ID Proveedor"
              value={idProv}
              onChangeText={setIdProv}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Empresa"
              value={empresa}
              onChangeText={setEmpresa}
            />

            <TextInput
              style={styles.input}
              placeholder="Nombre del Proveedor"
              value={nombreProveedor}
              onChangeText={setNombreProveedor}
            />

            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />

            <View style={styles.botones}>
              <Button title="Guardar" onPress={guardarProveedor} />
              <Button
                title="Cancelar"
                color="red"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "flex-start", // 👈 alinea el botón a la izquierda
  },
  botonAbrir: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContenido: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "85%",
    elevation: 5,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
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
  botones: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default FormularioProveedores;

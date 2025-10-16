import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import BotonEliminarCliente from "./BotonEliminarCliente.js";

const TablaClientes = ({ clientes, eliminarCliente, editarCliente }) => {
  // ... (toda la lógica de state y funciones se mantiene igual)
  const [visible, setVisible] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [datosEditados, setDatosEditados] = useState({
    id_cliente: "",
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
  });

  const abrirModal = (cliente) => {
    setClienteSeleccionado(cliente);
    setDatosEditados({
      id_cliente: cliente.id_cliente || "",
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      cedula: cliente.cedula || "",
      telefono: cliente.telefono || "",
    });
    setVisible(true);
  };

  const guardarCambios = () => {
    editarCliente({ ...clienteSeleccionado, ...datosEditados });
    setVisible(false);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Tabla de Clientes</Text>

      <ScrollView horizontal>
        {/* Usamos un ancho mínimo para asegurar que todo quepa */}
        <View style={{ minWidth: 700 }}>
          {/* Encabezado de la tabla con estilos de ancho específicos */}
          <View style={[styles.fila, styles.encabezado]}>
            <Text style={[styles.textoEncabezado, styles.columnaId]}>ID</Text>
            <Text style={[styles.textoEncabezado, styles.columnaNombre]}>Nombre</Text>
            <Text style={[styles.textoEncabezado, styles.columnaApellido]}>Apellido</Text>
            <Text style={[styles.textoEncabezado, styles.columnaCedula]}>Cédula</Text>
            <Text style={[styles.textoEncabezado, styles.columnaTelefono]}>Teléfono</Text>
            <Text style={[styles.textoEncabezado, styles.columnaAcciones]}>Acciones</Text>
          </View>

          {/* Contenido de la tabla con estilos de ancho específicos */}
          <ScrollView>
            {clientes.map((item) => (
              <View key={item.id} style={styles.fila}>
                <Text style={[styles.celda, styles.columnaId]}>{item.id_cliente}</Text>
                <Text style={[styles.celda, styles.columnaNombre]}>{item.nombre}</Text>
                <Text style={[styles.celda, styles.columnaApellido]}>{item.apellido}</Text>
                <Text style={[styles.celda, styles.columnaCedula]}>{item.cedula}</Text>
                <Text style={[styles.celda, styles.columnaTelefono]}>{item.telefono}</Text>
                <View style={[styles.celda, styles.columnaAcciones]}>
                   <View style={styles.contenedorBotones}>
                    <TouchableOpacity
                      style={styles.botonEditar}
                      onPress={() => abrirModal(item)}
                    >
                      <Text style={styles.textoBotonEditar}>🖋️</Text>
                    </TouchableOpacity>
                    <BotonEliminarCliente
                      id={item.id}
                      eliminarCliente={eliminarCliente}
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* El Modal no necesita cambios */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.textoModal}>
              Editar Cliente: {datosEditados.nombre} {datosEditados.apellido}
            </Text>
            {/* ... Inputs y botones del modal se mantienen igual ... */}
            <ScrollView style={{ width: "100%" }}>
              <TextInput
                style={styles.input}
                placeholder="ID Cliente"
                value={String(datosEditados.id_cliente)} 
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, id_cliente: valor })
                }
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={datosEditados.nombre}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, nombre: valor })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={datosEditados.apellido}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, apellido: valor })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Cédula"
                value={datosEditados.cedula}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, cedula: valor })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={datosEditados.telefono}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, telefono: valor })
                }
                keyboardType="phone-pad"
              />
            </ScrollView>

            <View style={styles.filaBotones}>
              <TouchableOpacity
                style={[styles.botonAccion, styles.cancelar]}
                onPress={() => setVisible(false)}
              >
                <Text style={styles.textoAccion}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botonAccion, styles.confirmar]}
                onPress={guardarCambios}
              >
                <Text style={styles.textoAccion}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


// =========== ESTILOS MODIFICADOS ===========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignSelf: "stretch",
  },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  fila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#CCC",
    alignItems: "center", // Centra verticalmente el contenido
  },
  encabezado: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
  },
  celda: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 5,
    paddingVertical: 6,
  },
  textoEncabezado: {
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  // --- Nuevos estilos para anchos de columna ---
  columnaId: {
    width: 60, // Ancho fijo para el ID
  },
  columnaNombre: {
    width: 150, // Más ancho para el nombre
  },
  columnaApellido: {
    width: 150, // Más ancho para el apellido
  },
  columnaCedula: {
    width: 150, // Más ancho para la cédula
  },
  columnaTelefono: {
    width: 110, // Ancho intermedio para el teléfono
  },
  columnaAcciones: {
    width: 120, // Ancho para los dos botones
  },
  // ---------------------------------------------
  contenedorBotones: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  botonEditar: {
    backgroundColor: "#7c787886",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  textoBotonEditar: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  // --- Estilos del Modal (sin cambios) ---
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "85%",
  },
  textoModal: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  filaBotones: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  botonAccion: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelar: { backgroundColor: "#ccc" },
  confirmar: { backgroundColor: "#457b9d" },
  textoAccion: { color: "white", fontWeight: "bold" },
});

export default TablaClientes;
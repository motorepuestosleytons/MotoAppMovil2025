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
  // Estados para el Modal de Edición
  const [visible, setVisible] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  // Se eliminan 'id_cliente' y 'apellido' de los datos editados
  const [datosEditados, setDatosEditados] = useState({
    nombre: "",
    cedula: "",
    telefono: "",
  });

  const abrirModal = (cliente) => {
    setClienteSeleccionado(cliente);
    // Solo se inicializan los campos restantes
    setDatosEditados({
      nombre: cliente.nombre || "",
      cedula: cliente.cedula || "",
      telefono: cliente.telefono || "",
    });
    setVisible(true);
  };

  const guardarCambios = () => {
    // Se envía el cliente seleccionado fusionado con los datos editados (sin id_cliente ni apellido)
    editarCliente({ ...clienteSeleccionado, ...datosEditados });
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Tabla de Clientes</Text>

      <ScrollView horizontal>
        {/* Se ajusta el minWidth para las columnas restantes */}
        <View style={{ minWidth: 500 }}>
          {/* Encabezado de la tabla */}
          <View style={[styles.fila, styles.encabezado]}>
            {/* Se elimina 'ID' */}
            <Text style={[styles.textoEncabezado, styles.columnaNombre]}>Nombre</Text>
            {/* Se elimina 'Apellido' */}
            <Text style={[styles.textoEncabezado, styles.columnaCedula]}>Cédula</Text>
            <Text style={[styles.textoEncabezado, styles.columnaTelefono]}>Teléfono</Text>
            <Text style={[styles.textoEncabezado, styles.columnaAcciones]}>Acciones</Text>
          </View>

          {/* Contenido de la tabla */}
          <ScrollView>
            {clientes.map((item) => (
              <View key={item.id} style={styles.fila}>
                {/* Se elimina la columna de item.id_cliente */}
                <Text style={[styles.celda, styles.columnaNombre]}>{item.nombre}</Text>
                {/* Se elimina la columna de item.apellido */}
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

      {/* Modal de Edición */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.textoModal}>
              {/* Se ajusta el título del modal */}
              Editar Cliente: {datosEditados.nombre}
            </Text>

            <ScrollView style={{ width: "100%" }}>
              {/* Se elimina el TextInput de ID Cliente */}

              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={datosEditados.nombre}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, nombre: valor })
                }
              />
              {/* Se elimina el TextInput de Apellido */}

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

// Se ajustan los estilos para reflejar los cambios en las columnas
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignSelf: "stretch",
    marginTop: -225,
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
  // --- Estilos de ancho de columna ajustados ---
  columnaNombre: {
    width: 150, // Mantenemos ancho para el nombre
  },
  columnaCedula: {
    width: 150, // Mantenemos ancho para la cédula
  },
  columnaTelefono: {
    width: 110, // Ancho intermedio para el teléfono
  },
  columnaAcciones: {
    width: 90, // Se redujo el ancho para los botones de acción
  },
  // Las columnas columnaId y columnaApellido se eliminan de la tabla y de los estilos de referencia si no se usan.
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
  // --- Estilos del Modal (sin cambios estructurales mayores) ---
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
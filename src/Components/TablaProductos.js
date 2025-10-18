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

const TablaProductos = ({ productos, eliminarProducto, editarProducto }) => {
  const [visible, setVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  const [datosEditados, setDatosEditados] = useState({
    nombre: "",
    modelo: "",
    precio_compra: "",
    precio_venta: "",
    stock: "",
  });

  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    
    setDatosEditados({
      nombre: producto.nombre?.toString() || "",
      modelo: producto.modelo?.toString() || "",
      precio_compra: producto.precio_compra?.toString() || "",
      precio_venta: producto.precio_venta?.toString() || "",
      stock: producto.stock?.toString() || "",
    });
    setVisible(true);
  };

  const guardarCambios = () => {
    // Se envía el producto seleccionado (con ID) fusionado con los datos editados (todos son String).
    const productoAEnviar = { ...productoSeleccionado, ...datosEditados };
    
    editarProducto(productoAEnviar);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Tabla de Productos</Text>

      <ScrollView horizontal>
        <View style={{ minWidth: 680 }}>
          <View style={[styles.fila, styles.encabezado]}>
            <Text style={[styles.textoEncabezado, styles.columnaNombre]}>Nombre</Text>
            <Text style={[styles.textoEncabezado, styles.columnaModelo]}>MODELO</Text>
            <Text style={[styles.textoEncabezado, styles.columnaPrecioC]}>P. Compra</Text>
            <Text style={[styles.textoEncabezado, styles.columnaPrecioV]}>P. Venta</Text>
            <Text style={[styles.textoEncabezado, styles.columnaStock]}>Stock</Text>
            <Text style={[styles.textoEncabezado, styles.columnaAcciones]}>Acciones</Text>
          </View>

          <ScrollView>
            {productos.map((item) => (
              <View key={item.id} style={styles.fila}>
                <Text style={[styles.celda, styles.columnaNombre]}>{item.nombre?.toString()}</Text>
                <Text style={[styles.celda, styles.columnaModelo]}>
                    {item.modelo?.toString().toUpperCase()}
                </Text>
                <Text style={[styles.celda, styles.columnaPrecioC]}>{item.precio_compra?.toString()}</Text>
                <Text style={[styles.celda, styles.columnaPrecioV]}>{item.precio_venta?.toString()}</Text>
                <Text style={[styles.celda, styles.columnaStock]}>{item.stock?.toString()}</Text>
                
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
                      eliminarCliente={eliminarProducto}
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.textoModal}>
              Editar Producto: {datosEditados.nombre}
            </Text>

            <ScrollView style={{ width: "100%" }}>
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
                placeholder="Modelo"
                value={datosEditados.modelo}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, modelo: valor })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="P. Compra"
                value={datosEditados.precio_compra}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, precio_compra: valor })
                }
                keyboardType="default"
              />
              <TextInput
                style={styles.input}
                placeholder="P. Venta"
                value={datosEditados.precio_venta}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, precio_venta: valor })
                }
                keyboardType="default"
              />
              <TextInput
                style={styles.input}
                placeholder="Stock"
                value={datosEditados.stock}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, stock: valor })
                }
                keyboardType="default"
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
    alignItems: "center",
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
  columnaNombre: {
    width: 150,
  },
  columnaModelo: {
    width: 120,
  },
  columnaPrecioC: {
    width: 120,
  },
  columnaPrecioV: {
    width: 120,
  },
  columnaStock: {
    width: 80,
  },
  columnaAcciones: {
    width: 90,
  },
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

export default TablaProductos;
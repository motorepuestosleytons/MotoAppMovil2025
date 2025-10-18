import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from "react-native";
import BotonEliminarProducto from "./BotonEliminarProducto.js";

const TablaProductos = ({ productos, eliminarProducto, editarProducto }) => {
  const [visible, setVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    setVisible(true);
  };

  const cerrarModal = () => {
    setVisible(false);
    setProductoSeleccionado(null);
  };

  const guardarCambios = () => {
    if (productoSeleccionado) {
      editarProducto(productoSeleccionado);
      cerrarModal();
    }
  };

  const manejoCambio = (campo, valor) => {
    setProductoSeleccionado((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📦 Lista de Productos</Text>

      <ScrollView horizontal>
        <View>
          {/* Encabezados */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { width: 80 }]}>Imagen</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Nombre</Text>
            <Text style={[styles.headerCell, { width: 80 }]}>Marca</Text>
            <Text style={[styles.headerCell, { width: 80 }]}>Modelo</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Compra</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Venta</Text>
            <Text style={[styles.headerCell, { width: 70 }]}>Stock</Text>
            <Text style={[styles.headerCell, { width: 120 }]}>Acciones</Text>
          </View>

          {/* Filas */}
          {productos.map((producto) => (
            <View key={producto.id} style={styles.row}>
              {/* Imagen del producto */}
              <View style={[styles.cell, { width: 80 }]}>
                {producto.foto ? (
                  <Image
                    source={{ uri: producto.foto }}
                    style={styles.imagenProducto}
                  />
                ) : (
                  <Text style={styles.sinImagen}>Sin foto</Text>
                )}
              </View>

              <Text style={[styles.cell, { width: 100 }]}>{producto.nombre}</Text>
              <Text style={[styles.cell, { width: 80 }]}>{producto.marca}</Text>
              <Text style={[styles.cell, { width: 80 }]}>{producto.modelo}</Text>
              <Text style={[styles.cell, { width: 100 }]}>
                {producto.precio_compra}
              </Text>
              <Text style={[styles.cell, { width: 100 }]}>
                {producto.precio_venta}
              </Text>
              <Text style={[styles.cell, { width: 70 }]}>{producto.stock}</Text>

              <View style={[styles.cell, { width: 120, flexDirection: "row" }]}>
                <TouchableOpacity
                  style={styles.botonEditar}
                  onPress={() => abrirModal(producto)}
                >
                  <Text style={styles.textoBoton}>✏️</Text>
                </TouchableOpacity>

                <BotonEliminarProducto
                  id={producto.id}
                  eliminarProducto={eliminarProducto}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal de edición */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>✏️ Editar Producto</Text>

            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={productoSeleccionado?.nombre}
                onChangeText={(valor) => manejoCambio("nombre", valor)}
              />
              <TextInput
                style={styles.input}
                placeholder="Marca"
                value={productoSeleccionado?.marca}
                onChangeText={(valor) => manejoCambio("marca", valor)}
              />
              <TextInput
                style={styles.input}
                placeholder="Modelo"
                value={productoSeleccionado?.modelo}
                onChangeText={(valor) => manejoCambio("modelo", valor)}
              />
              <TextInput
                style={styles.input}
                placeholder="Precio compra"
                keyboardType="numeric"
                value={String(productoSeleccionado?.precio_compra || "")}
                onChangeText={(valor) => manejoCambio("precio_compra", valor)}
              />
              <TextInput
                style={styles.input}
                placeholder="Precio venta"
                keyboardType="numeric"
                value={String(productoSeleccionado?.precio_venta || "")}
                onChangeText={(valor) => manejoCambio("precio_venta", valor)}
              />
              <TextInput
                style={styles.input}
                placeholder="Stock"
                keyboardType="numeric"
                value={String(productoSeleccionado?.stock || "")}
                onChangeText={(valor) => manejoCambio("stock", valor)}
              />
              <TextInput
                style={styles.input}
                placeholder="URL Foto"
                value={productoSeleccionado?.foto}
                onChangeText={(valor) => manejoCambio("foto", valor)}
              />

              {productoSeleccionado?.foto ? (
                <Image
                  source={{ uri: productoSeleccionado.foto }}
                  style={styles.imagenModal}
                />
              ) : null}

              <View style={styles.botonesModal}>
                <TouchableOpacity
                  style={[styles.boton, styles.botonGuardar]}
                  onPress={guardarCambios}
                >
                  <Text style={styles.textoBoton}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.boton, styles.botonCancelar]}
                  onPress={cerrarModal}
                >
                  <Text style={styles.textoBoton}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 🎨 Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: -35,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 5,
  },
  headerCell: {
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    paddingVertical: 5,
  },
  cell: {
    textAlign: "center",
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  imagenProducto: {
    width: 50,
    height: 50,
    borderRadius: 6,
    resizeMode: "cover",
  },
  sinImagen: {
    fontSize: 10,
    color: "#888",
  },
  botonEditar: {
    backgroundColor: "#7c787886",
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContenido: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  imagenModal: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 8,
    resizeMode: "cover",
  },
  botonesModal: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  boton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  botonGuardar: {
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },
  botonCancelar: {
    backgroundColor: "#F44336",
    marginLeft: 5,
  },
});

export default TablaProductos;
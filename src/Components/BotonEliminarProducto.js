import React from "react";
import { TouchableOpacity, Text, Alert, StyleSheet } from "react-native";

const BotonEliminarProducto = ({ id, eliminarProducto }) => {
  // Lógica NO modificada: Muestra alerta antes de eliminar
  const confirmarEliminacion = () => {
    Alert.alert(
      "Confirmar Eliminación",
      `¿Está seguro de que desea eliminar el producto con ID: ${id}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: () => eliminarProducto(id),
          style: "destructive",
        },
      ]
    );
  };

  return (
    // El texto '🗑️' está encapsulado en <Text>
    <TouchableOpacity style={styles.botonEliminar} onPress={confirmarEliminacion}>
      <Text style={styles.textoBoton}>🗑️</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  botonEliminar: {
    backgroundColor: "#ffffffff", // Color rojo para eliminar
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  textoBoton: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BotonEliminarProducto;
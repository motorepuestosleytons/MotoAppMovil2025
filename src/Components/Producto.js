// src/components/Producto.js
import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function Producto({
  item,
  imagen,
  precio,
  tiempo,
  texto,
  onAgregar,
}) {
if (!item || !item.id || !imagen) return null;

  const [esFavorito, setEsFavorito] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const toggleFavorito = () => {
    setEsFavorito(!esFavorito);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.productoCard}>
      <TouchableOpacity onPress={toggleFavorito} style={styles.corazonContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <FontAwesome5
            name="heart"
            size={20}
            color={esFavorito ? "#e74c3c" : "#95a5a6"}
            solid={esFavorito}
          />
        </Animated.View>
      </TouchableOpacity>

      {imagen && imagen !== "null" ? (
        <Image source={{ uri: imagen }} style={styles.productoImage} resizeMode="cover" />
      ) : (
        <View style={styles.noImagen}>
          <Text style={styles.noImagenTexto}>No hay foto</Text>
        </View>
      )}

      <View style={styles.productoInfo}>
        <Text style={styles.productoTitulo} numberOfLines={2}>
          {texto}
        </Text>
        <Text style={styles.productoPrecio}>{precio}</Text>
        <Text style={styles.productoTiempo}>{tiempo}</Text>

        <TouchableOpacity style={styles.addButton} onPress={() => onAgregar(item)}>
          <FontAwesome5 name="cart-plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}> Agregar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  productoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 8,
    width: "45%",
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  corazonContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: 6,
    borderRadius: 20,
    marginTop: 154,
  },
  productoImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 5,
  },
  productoInfo: {
    width: "100%",
    paddingHorizontal: 5,
  },
  productoTitulo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    minHeight: 35,
  },
  productoPrecio: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginTop: 4,
  },
  productoTiempo: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#007BFF",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  noImagen: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  noImagenTexto: {
    color: "#777",
    fontSize: 12,
    fontWeight: "bold",
  },
});
// src/components/Producto.js (Ajustado con botón 'Agregar')

import { StyleSheet, Text, View , Image, TouchableOpacity } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useState } from "react";

// ⬅️ Recibe onAgregar
export default function Producto({ item, imagen, precio, tiempo, texto, favorito, onAgregar }) {
  const [imagenValida, setImagenValida] = useState(true); 
  const isFavorite = favorito === 'heart' || favorito === true;

  const manejarErrorImagen = () => {
    setImagenValida(false);
  };
    
  return (
    <View style={styles.productoCard}>
        <FontAwesome5 
            name="heart" 
            size={20} 
            color={isFavorite ? "red" : "gray"} 
            solid={isFavorite} 
            style={styles.heart} 
        />

        {imagenValida ? (
            <Image 
                source={{ uri: imagen }} 
                style={styles.productoImage} 
                onError={manejarErrorImagen}
                resizeMode="cover"
            />
        ) : (
            <View style={styles.noImagen}>
                <Text style={styles.noImagenTexto}>🖼️ No hay foto</Text>
            </View>
        )}
      
        <View style={styles.productoInfo}>
            <Text style={styles.productoTitulo} numberOfLines={2}>{texto}</Text> 
            <Text style={styles.productoPrecio}>{precio}</Text>
            <Text style={styles.productoTiempo}>{tiempo}</Text>

            {/* ⬅️ NUEVO BOTÓN AGREGAR */}
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => onAgregar(item)} // Llama a la función con el objeto producto
            >
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
     width: '45%', 
     margin: 8, 
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 10,
     elevation: 5,
     alignItems: "center",
     justifyContent: "space-between",
   },
   productoImage: {
     width: '100%',
     height: 120, 
     borderRadius: 10,
     marginBottom: 5,
   },
   productoInfo: {
     width: '100%',
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
     marginBottom: 8, // Espacio antes del botón
   },
   // ⬅️ NUEVO ESTILO DEL BOTÓN
   addButton: {
    flexDirection: 'row',
    backgroundColor: '#007BFF', // Azul para el botón
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
   },
   addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
   },
   // ... (Resto de estilos sin cambios)
   noImagen: {
        width: '100%',
        height: 120,
        borderRadius: 10,
        marginBottom: 5,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
   },
   noImagenTexto: {
        color: '#777',
        fontSize: 12,
        fontWeight: 'bold',
   },
   heart: {
     position: "absolute",
     top: 15,
     marginTop: 153,
     right: 15,
     zIndex: 10,
     backgroundColor: 'rgba(255, 255, 255, 0.7)',
     padding: 5,
     borderRadius: 15,
   },
});
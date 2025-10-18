// src/components/Producto.js (Ajustado para manejar errores de imagen)

import { StyleSheet, Text, View , Image } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useState } from "react";

export default function Producto({ imagen, nombre, precio, tiempo, texto, favorito }) {
  const [imagenValida, setImagenValida] = useState(true); // ⬅️ NUEVO ESTADO
  const isFavorite = favorito === 'heart' || favorito === true;

  // 💡 Función para manejar el error de carga de imagen
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

        {/* ⬅️ AJUSTE CLAVE: Renderizado condicional */}
        {imagenValida ? (
            <Image 
                source={{ uri: imagen }} 
                style={styles.productoImage} 
                onError={manejarErrorImagen} // Llama a la función si falla
                resizeMode="cover"
            />
        ) : (
            // Si la imagen no es válida, muestra un texto en su lugar
            <View style={styles.noImagen}>
                <Text style={styles.noImagenTexto}>🖼️ No hay foto</Text>
            </View>
        )}
      
        <View style={styles.productoInfo}>
            <Text style={styles.productoTitulo} numberOfLines={2}>{texto}</Text> 
            <Text style={styles.productoPrecio}>{precio}</Text>
            <Text style={styles.productoTiempo}>{tiempo}</Text>
        </View>
    </View>
  );
}

// Estilos ajustados (Se agrega el estilo para "No hay foto")
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
   // ⬅️ NUEVOS ESTILOS PARA EL PLACEHOLDER DE TEXTO
   noImagen: {
        width: '100%',
        height: 120,
        borderRadius: 10,
        marginBottom: 5,
        backgroundColor: '#e0e0e0', // Gris claro de fondo
        justifyContent: 'center',
        alignItems: 'center',
   },
   noImagenTexto: {
        color: '#777',
        fontSize: 12,
        fontWeight: 'bold',
   },
   // ... (resto de estilos sin cambios)
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
   },
   heart: {
     position: "absolute",
     top: 15,
     right: 15,
     zIndex: 10,
     backgroundColor: 'rgba(255, 255, 255, 0.7)',
     padding: 5,
     borderRadius: 15,
     marginTop: 158
   },
});
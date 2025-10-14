import { StyleSheet, Text, View , Image } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";

export default function Producto({ imagen, nombre, precio, tiempo, texto,favorito }) {
  return (
    <View style={styles.productoCard}>

      <FontAwesome5 name={nombre} size={40} color="black" style={{ marginRight: 10 }} />
      
      
      <View style={styles.productoInfo}>
          {/* Imagen del producto */}
      <Image source={{ uri: imagen }} style={styles.productoImage} />
       
        <Text style={styles.productoTitulo}>{texto}</Text>
        <Text style={styles.productoPrecio}>{precio}</Text>
        <Text style={styles.productoTiempo}>{tiempo}</Text>
        <FontAwesome5 name={favorito} size={20} color="black" style={styles.heart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
   productoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    width: 150, 
    height: 250, // para que entren 2 por fila en el grid
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 100,
    elevation: 3,
    marginTop: 10,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",

  },
  productoImage: {
    width: 140,
    height: 160,
    borderRadius: 10,
    alignItems: "center",
  },
  productoTitulo: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",

    
  },
  productoPrecio: {
    fontSize: 12,
    fontWeight: "bold",
    color: "black",
    alignItems: "center",
  },
  productoTiempo: {
    fontSize: 10,
    fontWeight: "bold",
    alignItems: "center",
    color: "#000000ff",
    justifyContent: "center",
  },

  heart: {
   position: "relative",
    top: -20,
    right: -115,
    alignContent: "space-between",
   
  },
  
});

import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs } from "firebase/firestore";
import FormularioVentas from "../Components/FormularioVentas.js"; 

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventaExpandida, setVentaExpandida] = useState(null); 

  // Función para cargar los datos desde Firestore
  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Ventas"));
      
      const ventasData = await Promise.all(
        querySnapshot.docs.map(async (docVenta) => {
          const venta = { id: docVenta.id, ...docVenta.data() };
          
          // Obtener la subcolección Detalle_Venta
          const detalleSnapshot = await getDocs(collection(db, `Ventas/${docVenta.id}/detalle_venta`));
          const detalleItems = detalleSnapshot.docs.map(docDetalle => ({ id: docDetalle.id, ...docDetalle.data() }));
          venta.detalle = detalleItems;

          // Calcular el total de la factura
          venta.total_calculado = detalleItems.reduce((sum, item) => sum + item.total_item, 0);
          
          return venta;
        })
      );
      ventasData.sort((a, b) => new Date(b.fecha_venta) - new Date(a.fecha_venta));
      setVentas(ventasData);
    } catch (error) {
      console.error("Error al obtener las ventas:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para renderizar el detalle de la venta (Subcolección)
  const renderDetalle = (detalle) => (
    <View style={styles.detalleContainer}>
      <Text style={styles.detalleTitulo}>Detalle de la Venta:</Text>
      {detalle.map((item, index) => (
        <View key={index} style={styles.detalleItem}>
          <Text style={styles.detalleNombre}>{item.nombre_producto}</Text>
          <Text style={styles.detalleInfo}>({item.cantidad} x ${item.precio_unitario.toFixed(2)})</Text>
          <Text style={styles.detalleTotal}>Total Item: ${item.total_item.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}> 
      <View style={styles.container}>
        
        {/* Contenedor del Formulario (Botón y Buscador de Ventas) */}
        <View style={styles.headerContent}> 
          <FormularioVentas cargarDatos={cargarDatos} />
        </View>
        
        {/* Sección de Lista de Ventas: ocupa el espacio restante (flex: 1) */}
        <View style={styles.listaContainer}> 
          <Text style={styles.listaTitulo}>Ventas Registradas</Text>

          <FlatList
            data={ventas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.item} 
                onPress={() => setVentaExpandida(ventaExpandida === item.id ? null : item.id)}
              >
                {/* CORRECCIONES APLICADAS EN LA VISTA */}
                <Text style={styles.tituloItem}>
                    Venta ID: <Text style={{fontWeight: 'normal', color: '#000'}}>{item.id}</Text>
                </Text>
                
                <Text>
                    Cliente: <Text style={{fontWeight: 'bold'}}>{item.nombre_cliente || item.id_documento_cliente}</Text>
                </Text>
                
                <Text>Fecha: {item.fecha_venta ? new Date(item.fecha_venta).toLocaleDateString() : 'Fecha no disponible'}</Text>
                
                <Text style={styles.totalItem}>TOTAL FACTURA: ${item.total_calculado ? item.total_calculado.toFixed(2) : 'N/A'}</Text>
                <Text style={styles.expandir}>{ventaExpandida === item.id ? '▲ Ocultar Detalle' : '▼ Ver Detalle'}</Text>

                {ventaExpandida === item.id && renderDetalle(item.detalle)}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noData}>No hay ventas registradas.</Text>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
      flex: 1,
      backgroundColor: "#f2f2f2" 
  },
  container: { 
    flex: 1, 
    backgroundColor: "#f2f2f2" 
  },
  
  headerContent: {
      paddingHorizontal: 10, 
      paddingTop: 15, 
  },
  
  listaContainer: {
    flex: 2, 
 marginTop: 80
  },
  
  listaTitulo: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginTop: 10, 
    marginBottom: 10, 
    textAlign: "center", 
    borderTopWidth: 1, 
    borderTopColor: '#ccc', 
    paddingTop: 10 
  },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  tituloItem: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: '#007BFF' },
  totalItem: { fontSize: 16, fontWeight: "bold", marginTop: 8, color: '#28A745', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 5 },
  expandir: { color: '#888', textAlign: 'center', marginTop: 5, fontSize: 12 },
  noData: { textAlign: "center", color: "#999", marginTop: 20 },
  
  // Estilos para el detalle de venta
  detalleContainer: { marginTop: 10, padding: 5, backgroundColor: '#f5f5f5', borderRadius: 5, borderLeftWidth: 3, borderLeftColor: '#FFC107' },
  detalleTitulo: { fontWeight: 'bold', marginBottom: 5, color: '#555' },
  detalleItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  detalleNombre: { flex: 2.5, fontSize: 14 },
  detalleInfo: { flex: 2, textAlign: 'right', fontSize: 14, color: '#666' },
  detalleTotal: { flex: 1.5, fontWeight: 'bold', textAlign: 'right', fontSize: 14 },
});

export default Ventas;
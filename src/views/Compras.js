import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs } from "firebase/firestore";
import FormularioCompras from "../Components/FormularioCompras.js"; 

const Compras = () => { 
  const [compras, setCompras] = useState([]);
  const [compraExpandida, setCompraExpandida] = useState(null); 

  // Función auxiliar para manejar el formato de fecha (Robusta)
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
        let date;
        if (dateValue && dateValue.toDate) {
            date = dateValue.toDate();
        } else if (typeof dateValue === 'string') {
            date = new Date(dateValue);
        } else if (dateValue instanceof Date) {
            date = dateValue;
        } else {
            return 'N/A';
        }
        
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        return date.toLocaleDateString();
    } catch (e) {
        return 'N/A';
    }
  };

  // Función para cargar los datos desde Firestore
  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Compras"));
      
      const comprasData = await Promise.all(
        querySnapshot.docs.map(async (docCompra) => {
          const compra = { id: docCompra.id, ...docCompra.data() }; 
          
          // Obtener la subcolección Detalle_Compra
          const detalleSnapshot = await getDocs(collection(db, `Compras/${docCompra.id}/detalle_compra`)); 
          const detalleItems = detalleSnapshot.docs.map(docDetalle => ({ 
              id: docDetalle.id, 
              // Aseguramos que los campos numéricos sean números
              total_item: parseFloat(docDetalle.data().total_item) || 0,
              precio_unitario: parseFloat(docDetalle.data().precio_unitario) || 0,
              ...docDetalle.data() 
          }));
          compra.detalle = detalleItems;

          // Se asegura de que total_compra sea un número (si existe) o lo calcula.
          const totalFromDoc = parseFloat(compra.total_compra);
          compra.total_calculado = isNaN(totalFromDoc) 
              ? detalleItems.reduce((sum, item) => sum + item.total_item, 0)
              : totalFromDoc;
          
          return compra;
        })
      );
      // Ordenar por fecha_compra
      comprasData.sort((a, b) => new Date(b.fecha_compra) - new Date(a.fecha_compra));
      setCompras(comprasData);
    } catch (error) {
      console.error("Error al obtener las compras:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para renderizar el detalle de la compra (Subcolección)
  const renderDetalle = (detalle) => (
    <View style={styles.detalleContainer}>
      <Text style={styles.detalleTitulo}>Detalle de la Compra:</Text>
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
        
        {/* Contenedor del Formulario (Botón y Buscador de Compras) */}
        <View style={styles.headerContent}> 
          <FormularioCompras cargarDatos={cargarDatos} />
        </View>
        
        {/* Sección de Lista de Compras */}
        <View style={styles.listaContainer}> 
          <Text style={styles.listaTitulo}>Compras Registradas</Text>

          <FlatList
            data={compras}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.item} 
                onPress={() => setCompraExpandida(compraExpandida === item.id ? null : item.id)}
              >
                <Text style={styles.tituloItem}>
                    Compra ID: <Text style={{fontWeight: 'normal', color: '#000'}}>{item.id}</Text>
                </Text>
                
                <Text>
                    Proveedor: <Text style={{fontWeight: 'bold'}}>{item.nombre_proveedor || item.id_documento_proveedor}</Text>
                </Text>
                
                <Text>Fecha: {formatDate(item.fecha_compra)}</Text>
                
                <Text style={styles.totalItem}>TOTAL FACTURA: ${item.total_calculado !== undefined ? item.total_calculado.toFixed(2) : 'N/A'}</Text>
                <Text style={styles.expandir}>{compraExpandida === item.id ? '▲ Ocultar Detalle' : '▼ Ver Detalle'}</Text>

                {compraExpandida === item.id && item.detalle && renderDetalle(item.detalle)}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noData}>No hay compras registradas.</Text>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f2f2f2" },
  container: { flex: 1, backgroundColor: "#f2f2f2",marginTop: 45},
  headerContent: { paddingHorizontal: 10, paddingTop: 15 },
  listaContainer: { 
    flex: 2, 
    paddingHorizontal: 10,
    marginTop: -20 
  },
  listaTitulo: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginTop: 10, 
    marginBottom: 10, 
    textAlign: "center", 
    borderTopWidth: 1, 
    borderTopColor: '#ccc', 
    paddingTop: 10,
    color: '#800080' 
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
  tituloItem: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: '#800080' },
  totalItem: { fontSize: 16, fontWeight: "bold", marginTop: 8, color: '#FFC107', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 5 }, 
  expandir: { color: '#888', textAlign: 'center', marginTop: 5, fontSize: 12 },
  noData: { textAlign: "center", color: "#999", marginTop: 20 },
  
  // Estilos para el detalle de compra
  detalleContainer: { marginTop: 10, padding: 5, backgroundColor: '#f9f9f9', borderRadius: 5, borderLeftWidth: 3, borderLeftColor: '#FFC107' },
  detalleTitulo: { fontWeight: 'bold', marginBottom: 5, color: '#555' },
  detalleItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  detalleNombre: { flex: 2.5, fontSize: 14 },
  detalleInfo: { flex: 2, textAlign: 'right', fontSize: 14, color: '#666' },
  detalleTotal: { flex: 1.5, fontWeight: 'bold', textAlign: 'right', fontSize: 14 },
});

export default Compras;
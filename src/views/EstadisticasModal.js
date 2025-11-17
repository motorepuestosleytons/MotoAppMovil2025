// src/views/EstadisticasModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../database/firebaseconfig';

// IMPORTS CORREGIDOS: rutas correctas + minúsculas
import GraficoProductos from '../Components/estadisticas/GraficoProductos';
import GraficoVentasHoy from '../Components/estadisticas/GraficoVentasHoy';
import GraficoTopClientes from '../Components/estadisticas/GraficoTopClientes';
import GraficoProductosMasVendidos from '../Components/estadisticas/GraficoProductosMasVendidos';

const EstadisticasModal = ({ visible, onClose }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;

    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, 'Productos'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error cargando productos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [visible]);

  // Preparar datos para el gráfico de productos
  const nombres = productos.map(p => p.nombre || 'Sin nombre');
  const precios = productos.map(p => parseFloat(p.precio_venta) || 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Estadísticas</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Cargando datos...</Text>
              </View>
            ) : (
              <>
                <GraficoProductos nombres={nombres} precios={precios} />
                <GraficoVentasHoy />
                <GraficoTopClientes />
                <GraficoProductosMasVendidos />
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 20,
    maxHeight: '90%',
    width: '95%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    padding: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EstadisticasModal;
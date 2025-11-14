// src/components/estadisticas/GraficoProductosMasVendidos.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '../../database/firebaseconfig';
import moment from 'moment';

const GraficoProductosMasVendidos = () => {
  const [topProductos, setTopProductos] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const hoy = moment().startOf('day').toISOString();
      const detallesRef = collectionGroup(db, 'detalle_venta');
      const q = query(detallesRef, where('__name__', '>=', ''), where('__name__', '<=', '\uf8ff')); // Todos
      const snap = await getDocs(q);
      const detalles = snap.docs.map(doc => doc.data());

      const productosMap = {};
      detalles.forEach(d => {
        const nombre = d.nombre_producto || 'Desconocido';
        productosMap[nombre] = (productosMap[nombre] || 0) + (d.cantidad || 0);
      });

      const sorted = Object.entries(productosMap)
        .map(([nombre, cantidad]) => ({ nombre: nombre.substring(0, 14), cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      setTopProductos(sorted);
    };
    fetch();
  }, []);

  const maxCantidad = Math.max(...topProductos.map(p => p.cantidad), 1);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Top 5 Productos Vendidos</Text>
        {topProductos.length === 0 ? (
          <Text style={styles.empty}>Sin ventas</Text>
        ) : (
          <View style={styles.list}>
            {topProductos.map((prod, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.rank}>#{index + 1}</Text>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${(prod.cantidad / maxCantidad) * 100}%`, backgroundColor: '#e74c3c' },
                    ]}
                  />
                </View>
                <Text style={styles.name}>{prod.nombre}</Text>
                <Text style={styles.amount}>{prod.cantidad} und</Text>
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginVertical: 12, elevation: 4 },
  title: { textAlign: 'center', fontWeight: 'bold', fontSize: 20, color: '#2c3e50', marginBottom: 15 },
  empty: { textAlign: 'center', color: '#999', fontStyle: 'italic' },
  list: { paddingHorizontal: 10 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rank: { fontSize: 16, fontWeight: 'bold', width: 30, color: '#c0392b' },
  barWrapper: { flex: 1, height: 20, backgroundColor: '#fadbd8', borderRadius: 10, overflow: 'hidden', marginHorizontal: 8 },
  bar: { height: '100%', borderRadius: 8 },
  name: { fontSize: 13, fontWeight: '600', width: 100, color: '#2c3e50' },
  amount: { fontSize: 13, fontWeight: 'bold', color: '#e74c3c' },
});

export default GraficoProductosMasVendidos;
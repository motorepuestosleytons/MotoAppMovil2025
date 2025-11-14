// src/components/estadisticas/GraficoTopClientes.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebaseconfig';
import moment from 'moment';

const GraficoTopClientes = () => {
  const [topClientes, setTopClientes] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const hoy = moment().startOf('day').toISOString();
      const q = query(collection(db, 'Ventas'), where('fecha_venta', '>=', hoy));
      const snap = await getDocs(q);
      const ventas = snap.docs.map(doc => doc.data());

      const clientesMap = {};
      ventas.forEach(v => {
        const nombre = v.nombre_cliente || 'Desconocido';
        clientesMap[nombre] = (clientesMap[nombre] || 0) + (v.total_factura || 0);
      });

      const sorted = Object.entries(clientesMap)
        .map(([nombre, total]) => ({ nombre: nombre.substring(0, 12), total: Math.round(total) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setTopClientes(sorted);
    };
    fetch();
  }, []);

  const maxTotal = Math.max(...topClientes.map(c => c.total), 1);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Top 5 Clientes Hoy</Text>
        {topClientes.length === 0 ? (
          <Text style={styles.empty}>Sin ventas hoy</Text>
        ) : (
          <View style={styles.list}>
            {topClientes.map((cliente, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.rank}>#{index + 1}</Text>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${(cliente.total / maxTotal) * 100}%`, backgroundColor: '#3498db' },
                    ]}
                  />
                </View>
                <Text style={styles.name}>{cliente.nombre}</Text>
                <Text style={styles.amount}>C$ {cliente.total}</Text>
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
  rank: { fontSize: 16, fontWeight: 'bold', width: 30, color: '#8e44ad' },
  barWrapper: { flex: 1, height: 20, backgroundColor: '#ecf0f1', borderRadius: 10, overflow: 'hidden', marginHorizontal: 8 },
  bar: { height: '100%', borderRadius: 8 },
  name: { fontSize: 13, fontWeight: '600', width: 90, color: '#2c3e50' },
  amount: { fontSize: 13, fontWeight: 'bold', color: '#27ae60' },
});

export default GraficoTopClientes;
// src/components/estadisticas/GraficoVentasHoy.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebaseconfig';
import moment from 'moment';

const GraficoVentasHoy = () => {
  const [totalHoy, setTotalHoy] = useState(0);
  const [ventasHoy, setVentasHoy] = useState(0);
  const [horasData, setHorasData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const hoy = moment().startOf('day').toISOString();
        const q = query(
          collection(db, 'Ventas'),
          where('fecha_venta', '>=', hoy)
        );

        const snap = await getDocs(q);
        const ventas = snap.docs.map(doc => doc.data());

        const total = ventas.reduce((sum, v) => sum + (v.total_factura || 0), 0);
        setTotalHoy(total);
        setVentasHoy(ventas.length);

        const horas = Array(8).fill(0);
        ventas.forEach(v => {
          const hora = moment(v.fecha_venta).hour();
          if (hora >= 8 && hora < 16) {
            horas[hora - 8] += v.total_factura;
          }
        });

        setHorasData(horas.map((v, i) => ({ hora: 8 + i, total: Math.round(v) })));
      } catch (error) {
        console.error("Error en ventas hoy:", error);
      }
    };
    fetch();
  }, []);

  const maxTotal = Math.max(...horasData.map(h => h.total), 1);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Ventas de Hoy</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>C$ {totalHoy.toFixed(0)}</Text>
          </View>
          <View style={styles.stat}>
  <Text style={styles.label}>Ventas</Text>
            <Text style={styles.value}>{ventasHoy}</Text>
          </View>
        </View>
        <View style={styles.chart}>
          {horasData.map((item, index) => (
            <View key={index} style={styles.hourBar}>
              <Text style={styles.hourLabel}>{item.hora}h</Text>
              <View style={styles.hourWrapper}>
                <View
                  style={[
                    styles.hourBarFill,
                    {
                      height: `${(item.total / maxTotal) * 100}%`,
                      backgroundColor: '#28a745',
                    },
                  ]}
                />
              </View>
              <Text style={styles.hourValue}>C$ {item.total}</Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginVertical: 8 },
  title: { textAlign: 'center', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  stat: { alignItems: 'center' },
  label: { fontSize: 12, color: '#666' },
  value: { fontSize: 16, fontWeight: 'bold', color: '#28a745' },
  chart: { flexDirection: 'row', justifyContent: 'space-around', height: 100 },
  hourBar: { alignItems: 'center', width: 30 },
  hourLabel: { fontSize: 10, marginBottom: 5 },
  hourWrapper: { width: 20, height: 80, justifyContent: 'flex-end', borderRadius: 2, borderWidth: 1, borderColor: '#eee' },
  hourBarFill: { width: '100%', borderRadius: 1 },
  hourValue: { fontSize: 9, marginTop: 2 },
});

export default GraficoVentasHoy;
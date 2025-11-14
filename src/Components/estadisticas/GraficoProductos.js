// src/components/estadisticas/GraficoProductos.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from 'react-native-paper';

const { width } = Dimensions.get('window');
const MAX_BAR_WIDTH = width * 0.7; // Más espacio para la barra

const GraficoProductos = ({ nombres = [], precios = [] }) => {
  const validData = nombres
    .map((n, i) => ({
      nombre: (n || 'Sin nombre').trim(),
      precio: parseFloat(precios[i]) || 0,
    }))
    .filter(d => d.precio > 0)
    .sort((a, b) => b.precio - a.precio)
    .slice(0, 8);

  const maxPrice = Math.max(...validData.map(d => d.precio), 1);

  if (validData.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Precios de Productos</Text>
          <Text style={styles.empty}>No hay productos</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Precios de Productos (Top 8)</Text>
        <View style={styles.list}>
          {validData.map((item, index) => {
            const barWidth = (item.precio / maxPrice) * MAX_BAR_WIDTH;

            return (
              <View key={index} style={styles.item}>
                {/* Barra + Precio */}
                <View style={styles.row}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { width: barWidth, backgroundColor: getBarColor(barWidth, MAX_BAR_WIDTH) },
                      ]}
                    />
                  </View>
                  <Text style={styles.price}>C$ {item.precio.toFixed(0)}</Text>
                </View>

                {/* NOMBRE DEBAJO */}
                <Text style={styles.name} numberOfLines={2}>
                  {item.nombre}
                </Text>
              </View>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );
};

// Colores según tamaño
const getBarColor = (width, max) => {
  const ratio = width / max;
  if (ratio > 0.8) return '#e74c3c';
  if (ratio > 0.5) return '#f39c12';
  if (ratio > 0.25) return '#27ae60';
  return '#3498db';
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 12,
    marginHorizontal: 8,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 16,
  },
  empty: {
    textAlign: 'center',
    color: '#95a5a6',
    fontStyle: 'italic',
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 8,
  },
  item: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
  },
  barContainer: {
    height: 22,
    backgroundColor: '#ecf0f1',
    borderRadius: 11,
    overflow: 'hidden',
    flex: 1,
    marginRight: 10,
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
    minWidth: 70,
    textAlign: 'right',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d3436',
    marginTop: 4,
    textAlign: 'left',
    paddingLeft: 2,
    lineHeight: 16,
  },
});

export default GraficoProductos;
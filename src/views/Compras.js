// src/views/Compras.js (IGUAL QUE VENTAS)
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, StyleSheet, FlatList, Text, TouchableOpacity,
  Modal, Animated, RefreshControl, SafeAreaView, TextInput
} from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, onSnapshot, query, orderBy, getDocs } from "firebase/firestore";
import FormularioCompras from "../Components/FormularioCompras.js";
import { Ionicons } from "@expo/vector-icons";

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [compraExpandida, setCompraExpandida] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const q = query(collection(db, "Compras"), orderBy("fecha_compra", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const comprasData = await Promise.all(
        snapshot.docs.map(async (docCompra) => {
          const compra = { id: docCompra.id, ...docCompra.data() };
          const detalleSnap = await getDocs(collection(db, `Compras/${docCompra.id}/detalle_compra`));
          compra.detalle = detalleSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          compra.total_calculado = compra.total_compra || compra.detalle.reduce((s, i) => s + i.total_item, 0);
          return compra;
        })
      );
      setCompras(comprasData);
    });
    return () => unsubscribe();
  }, []);

  const recargarManual = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const q = query(collection(db, "Compras"), orderBy("fecha_compra", "desc"));
      const snap = await getDocs(q);
      const comprasData = await Promise.all(
        snap.docs.map(async (docCompra) => {
          const compra = { id: docCompra.id, ...docCompra.data() };
          const detalleSnap = await getDocs(collection(db, `Compras/${docCompra.id}/detalle_compra`));
          compra.detalle = detalleSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          compra.total_calculado = compra.total_compra || compra.detalle.reduce((s, i) => s + i.total_item, 0);
          return compra;
        })
      );
      setCompras(comprasData);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const comprasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return compras;
    const term = busqueda.toLowerCase().trim();
    return compras.filter(c =>
      c.id.toLowerCase().includes(term) ||
      (c.nombre_proveedor && c.nombre_proveedor.toLowerCase().includes(term))
    );
  }, [compras, busqueda]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => setCompraExpandida(compraExpandida === item.id ? null : item.id)}
    >
      <Text style={styles.tituloItem}>Compra #{item.id.substring(0, 8)}...</Text>
      <Text>Proveedor: <Text style={{fontWeight: 'bold'}}>{item.nombre_proveedor}</Text></Text>
      <View style={styles.infoRow}>
        <Text>{new Date(item.fecha_compra).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.totalItem}>TOTAL: C${parseFloat(item.total_calculado).toFixed(2)}</Text>
      <Text style={styles.expandir}>
        {compraExpandida === item.id ? "Ocultar" : "Ver detalle"}
      </Text>
      {compraExpandida === item.id && (
        <View style={styles.detalleContainer}>
          <Text style={styles.detalleTitulo}>Detalle:</Text>
          {item.detalle.map((d, i) => (
            <View key={i} style={styles.detalleItem}>
              <Text style={styles.detalleNombre}>{d.nombre_producto}</Text>
              <Text style={styles.detalleInfo}>({d.cantidad} x C${d.precio_unitario})</Text>
              <Text style={styles.detalleTotal}>C${d.total_item.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FormularioCompras cargarDatos={recargarManual} />

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por ID o Proveedor..."
            value={busqueda}
            onChangeText={setBusqueda}
            placeholderTextColor="#aaa"
          />
          {busqueda ? (
            <TouchableOpacity onPress={() => setBusqueda("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          data={comprasFiltradas}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={recargarManual} />}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.noData}>
              {busqueda ? "No se encontraron compras" : "No hay compras registradas"}
            </Text>
          }
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f2f2f2" },
  container: { flex: 1, marginTop: 60 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },
  listContainer: { paddingHorizontal: 10, paddingBottom: 20 },
  item: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 15, elevation: 3 },
  tituloItem: { fontSize: 16, fontWeight: "bold", color: "#800080" },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
  totalItem: { fontSize: 16, fontWeight: "bold", color: "#FFC107", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 5 },
  expandir: { color: "#888", textAlign: "center", marginTop: 5 },
  noData: { textAlign: "center", color: "#999", marginTop: 20, fontStyle: 'italic' },
  detalleContainer: { marginTop: 10, padding: 10, backgroundColor: "#f8f9fa", borderRadius: 8, borderLeftWidth: 3, borderLeftColor: "#FFC107" },
  detalleTitulo: { fontWeight: "bold", marginBottom: 5, color: "#333" },
  detalleItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
});

export default Compras;
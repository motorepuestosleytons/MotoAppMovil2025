// src/views/Ventas.js (BUSQUEDA FILTRADA + BOTÓN MODAL SENSIBLE)
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, StyleSheet, FlatList, Text, TouchableOpacity,
  Modal, RefreshControl, SafeAreaView, TextInput
} from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, onSnapshot, query, orderBy, updateDoc, doc, getDocs } from "firebase/firestore";
import FormularioVentas from "../Components/FormularioVentas.js";
import { Ionicons } from "@expo/vector-icons";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventaExpandida, setVentaExpandida] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({ visible: false, id: '', estado: '' });
  const [busqueda, setBusqueda] = useState(""); // ← NUEVO

  const estadosPosibles = ["Recibido", "En Proceso", "Enviado", "Entregado", "Reportado", "Cancelado"];
  const coloresEstado = {
    Recibido: "#FFC107", "En Proceso": "#17A2B8", Enviado: "#007bff",
    Entregado: "#28A745", Reportado: "#DC3545", Cancelado: "#6c757d"
  };

  // === TIEMPO REAL ===
  useEffect(() => {
    const q = query(collection(db, "Ventas"), orderBy("fecha_venta", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const ventasData = await Promise.all(
        snapshot.docs.map(async (docVenta) => {
          const venta = { id: docVenta.id, ...docVenta.data() };
          const detalleSnap = await getDocs(collection(db, `Ventas/${docVenta.id}/detalle_venta`));
          venta.detalle = detalleSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          venta.total_calculado = venta.total_factura || venta.detalle.reduce((s, i) => s + i.total_item, 0);
          return venta;
        })
      );
      setVentas(ventasData);
    });

    return () => unsubscribe();
  }, []);

  // === RECARGA MANUAL ===
  const recargarManual = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const q = query(collection(db, "Ventas"), orderBy("fecha_venta", "desc"));
      const snap = await getDocs(q);
      const ventasData = await Promise.all(
        snap.docs.map(async (docVenta) => {
          const venta = { id: docVenta.id, ...docVenta.data() };
          const detalleSnap = await getDocs(collection(db, `Ventas/${docVenta.id}/detalle_venta`));
          venta.detalle = detalleSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          venta.total_calculado = venta.total_factura || venta.detalle.reduce((s, i) => s + i.total_item, 0);
          return venta;
        })
      );
      setVentas(ventasData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // === FILTRO EN TIEMPO REAL (useMemo) ===
  const ventasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return ventas;
    const term = busqueda.toLowerCase().trim();
    return ventas.filter(v =>
      v.id.toLowerCase().includes(term) ||
      (v.nombre_cliente && v.nombre_cliente.toLowerCase().includes(term))
    );
  }, [ventas, busqueda]);

  // === ACCIONES ===
  const actualizarEstadoLocal = (ventaId, nuevoEstado) => {
    setVentas(prev => prev.map(v => v.id === ventaId ? { ...v, estado: nuevoEstado } : v));
    setVentaExpandida(null);
  };

  const abrirModal = (id, estado) => {
    const venta = ventas.find(v => v.id === id);
    if (["Entregado", "Reportado"].includes(venta.estado)) return;
    setModalConfirm({ visible: true, id, estado });
  };

  const confirmarCambio = async () => {
    const { id, estado } = modalConfirm;
    try {
      await updateDoc(doc(db, "Ventas", id), { estado });
      actualizarEstadoLocal(id, estado);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setModalConfirm({ visible: false });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => setVentaExpandida(ventaExpandida === item.id ? null : item.id)}
    >
      <Text style={styles.tituloItem}>Venta #{item.id.substring(0, 8)}...</Text>
      <Text>Cliente: <Text style={{fontWeight: 'bold'}}>{item.nombre_cliente}</Text></Text>
      <View style={styles.infoRow}>
        <Text>{new Date(item.fecha_venta).toLocaleDateString()}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: coloresEstado[item.estado] || "#ccc" }]}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.totalItem}>TOTAL: C${parseFloat(item.total_calculado).toFixed(2)}</Text>
      <Text style={styles.expandir}>
        {ventaExpandida === item.id ? "Ocultar" : "Ver detalle"}
      </Text>
      {ventaExpandida === item.id && (
        <View>
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
          <View style={styles.gestionEstadoContainer}>
            <Text style={styles.gestionTitulo}>Cambiar Estado:</Text>
            <View style={styles.estadoBotonesContainer}>
              {estadosPosibles.map(estado => (
                <TouchableOpacity
                  key={estado}
                  style={[
                    styles.botonEstado,
                    { backgroundColor: coloresEstado[estado] },
                    item.estado === estado && styles.botonEstadoActivo
                  ]}
                  onPress={() => abrirModal(item.id, estado)}
                  disabled={item.estado === estado}
                >
                  <Text style={styles.textoBotonEstado}>{estado}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FormularioVentas />

        {/* === BARRA DE BÚSQUEDA === */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por ID o Cliente..."
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

        {/* === RESULTADOS FILTRADOS === */}
        <FlatList
          data={ventasFiltradas}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={recargarManual} />}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.noData}>
              {busqueda ? "No se encontraron ventas" : "No hay ventas registradas"}
            </Text>
          }
          contentContainerStyle={styles.listContainer}
        />
      </View>

      {/* === MODAL BONITO (SIN ANIMACIÓN) === */}
      <ConfirmModal
        visible={modalConfirm.visible}
        title="Cambiar Estado"
        message={`¿Cambiar a "${modalConfirm.estado}"?`}
        onConfirm={confirmarCambio}
        onCancel={() => setModalConfirm({ ...modalConfirm, visible: false })}
        icon="swap-horizontal"
        color="#007bff"
      />
    </SafeAreaView>
  );
};

// === MODAL (RESPUESTA INMEDIATA) ===
const ConfirmModal = ({ visible, title, message, onConfirm, onCancel, icon, color }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={[styles.modalIcon, { backgroundColor: color }]}>
            <Ionicons name={icon} size={32} color="#fff" />
          </View>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={onCancel}>
              <Text style={styles.modalBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtnConfirm, { backgroundColor: color }]} onPress={onConfirm}>
              <Text style={styles.modalBtnText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// === ESTILOS ===
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },
  listContainer: { paddingHorizontal: 10, paddingBottom: 20 },
  item: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 15, elevation: 3 },
  tituloItem: { fontSize: 16, fontWeight: "bold", color: "#007BFF" },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
  totalItem: { fontSize: 16, fontWeight: "bold", color: "#28A745", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 5 },
  expandir: { color: "#888", textAlign: "center", marginTop: 5 },
  noData: { textAlign: "center", color: "#999", marginTop: 20, fontStyle: 'italic' },
  detalleContainer: { marginTop: 10, padding: 10, backgroundColor: "#f8f9fa", borderRadius: 8, borderLeftWidth: 3, borderLeftColor: "#FFC107" },
  detalleTitulo: { fontWeight: "bold", marginBottom: 5, color: "#333" },
  detalleItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  gestionEstadoContainer: { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#ddd" },
  gestionTitulo: { fontSize: 15, fontWeight: "bold", marginBottom: 8, color: "#333" },
  estadoBotonesContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  botonEstado: { padding: 8, borderRadius: 5, marginVertical: 4, width: "48%", alignItems: "center", opacity: 0.9 },
  botonEstadoActivo: { borderWidth: 2, borderColor: "#000", opacity: 1 },
  textoBotonEstado: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15, width: '85%', alignItems: 'center' },
  modalIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  modalMessage: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalBtnCancel: { flex: 1, padding: 12, backgroundColor: '#ccc', borderRadius: 8, marginRight: 8, alignItems: 'center' },
  modalBtnConfirm: { flex: 1, padding: 12, borderRadius: 8, marginLeft: 8, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default Ventas;
// src/views/Ventas.js (Vista del Administrador)

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import FormularioVentas from "../Components/FormularioVentas.js";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventaExpandida, setVentaExpandida] = useState(null);

  // 🚨 ACTUALIZACIÓN CLAVE: Incluir todos los estados, especialmente "Llegó a su Destino" y "Reportado"
  const estadosPosibles = [
    "Recibido",
    "En Proceso",
    "Enviado", // ⬅️ Estado que el Admin debe seleccionar para activar acción del Cliente
    "Entregado",
    "Reportado",
    "Cancelado",
  ];
  
  // Colores para todos los estados
  const coloresEstado = {
    Recibido: "#FFC107", // Amarillo (Pedido Recibido)
    "En Proceso": "#17A2B8", // Turquesa (En ruta/Procesando)
    "Enviado": "#007bff", // 🚨 Azul (Listo para entrega final)
    Entregado: "#28A745", // Verde (Confirmado por el Cliente)
    Reportado: "#DC3545", // Rojo (Problema/Requiere atención Admin)
    Cancelado: "#6c757d", // Gris (Cancelado)
  };

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Ventas"));

      const ventasData = await Promise.all(
        querySnapshot.docs.map(async (docVenta) => {
          const venta = { id: docVenta.id, ...docVenta.data() };

          const detalleSnapshot = await getDocs(
            collection(db, `Ventas/${docVenta.id}/detalle_venta`)
          );
          const detalleItems = detalleSnapshot.docs.map((docDetalle) => ({
            id: docDetalle.id,
            ...docDetalle.data(),
          }));
          venta.detalle = detalleItems;

          // Utiliza el total almacenado o calcula si es necesario (buena práctica)
          venta.total_calculado =
            parseFloat(venta.total_factura) ||
            detalleItems.reduce((sum, item) => sum + item.total_item, 0);

          return venta;
        })
      );

      // Ordenar por fecha de venta, la más reciente primero
      ventasData.sort((a, b) => new Date(b.fecha_venta) - new Date(a.fecha_venta));
      setVentas(ventasData);
    } catch (error) {
      console.error("Error al obtener las ventas:", error);
    }
  };

  const actualizarEstadoVenta = async (ventaId, nuevoEstado) => {
    // Validamos que el estado sea uno de los posibles
    if (!nuevoEstado || !estadosPosibles.includes(nuevoEstado)) {
      Alert.alert("Error", "Seleccione un estado válido.");
      return;
    }

    // El administrador puede cambiar el estado A MENOS que haya sido finalizado por el cliente
    if (["Entregado", "Reportado"].includes(ventas.find(v => v.id === ventaId)?.estado)) {
        Alert.alert("Advertencia", "Este pedido ya fue finalizado o reportado por el cliente. No se puede cambiar el estado.");
        return;
    }


    try {
      const ventaRef = doc(db, "Ventas", ventaId);
      await updateDoc(ventaRef, { estado: nuevoEstado });
      Alert.alert(
        "Éxito",
        `Estado de la venta ${ventaId.substring(0, 6)}... actualizado a: ${nuevoEstado}`
      );
      cargarDatos();
      setVentaExpandida(null);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      Alert.alert("Error", "No se pudo actualizar el estado de la venta.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const renderDetalleYAcciones = (item) => (
    <View>
      <View style={styles.detalleContainer}>
        <Text style={styles.detalleTitulo}>Detalle de la Venta:</Text>
        {item.detalle.map((detalleItem, index) => (
          <View key={index} style={styles.detalleItem}>
            <Text style={styles.detalleNombre}>
              {detalleItem.nombre_producto}
            </Text>
            <Text style={styles.detalleInfo}>
              ({detalleItem.cantidad} x $
              {parseFloat(detalleItem.precio_unitario || 0).toFixed(2)})
            </Text>
            <Text style={styles.detalleTotal}>
              Total Item: $
              {parseFloat(detalleItem.total_item || 0).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.gestionEstadoContainer}>
        <Text style={styles.gestionTitulo}>Gestionar Estado del Pedido:</Text>
        <View style={styles.estadoBotonesContainer}>
          {estadosPosibles.map((estado) => (
            <TouchableOpacity
              key={estado}
              style={[
                styles.botonEstado,
                { backgroundColor: coloresEstado[estado] },
                item.estado === estado && styles.botonEstadoActivo,
              ]}
              // Deshabilita el botón si el estado ya está activo
              onPress={() => actualizarEstadoVenta(item.id, estado)}
              disabled={item.estado === estado}
            >
              <Text style={styles.textoBotonEstado}>{estado}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContent}>
          <FormularioVentas cargarDatos={cargarDatos} />
        </View>

        <View style={styles.listaContainer}>
          <Text style={styles.listaTitulo}>Ventas Registradas</Text>

          <FlatList
            data={ventas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() =>
                  setVentaExpandida(ventaExpandida === item.id ? null : item.id)
                }
              >
                <Text style={styles.tituloItem}>
                  Venta ID: {item.id.substring(0, 8)}...
                </Text>

                <Text>
                  Cliente: <Text style={{ fontWeight: "bold" }}>
                    {item.nombre_cliente || item.id_documento_cliente}
                  </Text>
                </Text>

                <View style={styles.infoRow}>
                    <Text>
                      Fecha: {item.fecha_venta
                        ? new Date(item.fecha_venta).toLocaleDateString()
                        : "Fecha no disponible"}
                    </Text>
                
                    <View style={[
                      styles.estadoBadge,
                      { backgroundColor: coloresEstado[item.estado] || "#6c757d" }
                    ]}>
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        {item.estado || "N/A"}
                      </Text>
                    </View>
                </View>

                <Text style={styles.totalItem}>
                  TOTAL FACTURA: $
                  {parseFloat(item.total_calculado || 0).toFixed(2)}
                </Text>

                <Text style={styles.expandir}>
                  {ventaExpandida === item.id
                    ? "Ocultar Detalle y Acciones"
                    : "Ver Detalle y Acciones"}
                </Text>

                {ventaExpandida === item.id && renderDetalleYAcciones(item)}
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
    backgroundColor: "#f2f2f2",
  },
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    marginTop: 45,
  },
  headerContent: {
    paddingHorizontal: 10,
    paddingTop: 15,
  },
  listaContainer: {
    flex: 2,
    paddingHorizontal: 10,
    marginTop: 0,
  },
  listaTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
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
  tituloItem: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#007BFF",
  },
  // MODIFICACIÓN: Contenedor para alinear fecha y estado
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalItem: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    color: "#28A745",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 5,
  },
  expandir: {
    color: "#888",
    textAlign: "center",
    marginTop: 5,
    fontSize: 12,
  },
  noData: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  detalleContainer: {
    marginTop: 10,
    padding: 5,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#FFC107",
  },
  detalleTitulo: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555",
  },
  detalleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  detalleNombre: {
    flex: 2.5,
    fontSize: 14,
  },
  detalleInfo: {
    flex: 2,
    textAlign: "right",
    fontSize: 14,
    color: "#666",
  },
  detalleTotal: {
    flex: 1.5,
    fontWeight: "bold",
    textAlign: "right",
    fontSize: 14,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginVertical: 5,
  },
  gestionEstadoContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  gestionTitulo: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  estadoBotonesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  botonEstado: {
    padding: 8,
    borderRadius: 5,
    marginVertical: 4,
    width: "48%",
    alignItems: "center",
    opacity: 0.8,
  },
  botonEstadoActivo: {
    borderWidth: 2,
    borderColor: "#000",
    opacity: 1,
  },
  textoBotonEstado: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default Ventas;
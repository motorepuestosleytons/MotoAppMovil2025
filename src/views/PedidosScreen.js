// src/views/PedidosScreen.js (NUEVO ARCHIVO para el cliente)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl, SafeAreaView } from 'react-native';
import { db } from '../database/firebaseconfig'; 
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Ionicons } from "@expo/vector-icons";

// Componente para el badge de estado
const EstadoBadge = ({ estado }) => {
    let color = '#ccc';
    let icon = 'sync-outline';
    
    switch (estado) {
        case 'Recibido': // Estado inicial al crear la venta
            color = '#007bff'; // Azul
            icon = 'mail-open-outline';
            break;
        case 'En Proceso':
            color = '#ffc107'; // Amarillo/Naranja
            icon = 'timer-outline';
            break;
        case 'Llegó a su Destino':
        case 'Entregado': // Incluye una posible variación de "recibición del paquete"
            color = '#28a745'; // Verde
            icon = 'checkmark-circle-outline';
            break;
        case 'Cancelado':
            color = '#dc3545'; // Rojo
            icon = 'close-circle-outline';
            break;
        default:
            color = '#6c757d'; // Gris
            icon = 'help-circle-outline';
    }

    return (
        <View style={[pedidosStyles.badgeContainer, { backgroundColor: color }]}>
            <Ionicons name={icon} size={14} color="#fff" style={{ marginRight: 5 }} />
            <Text style={pedidosStyles.badgeText}>{estado}</Text>
        </View>
    );
};


// Componente para renderizar cada pedido
const PedidoItem = ({ pedido }) => {
    // Formato de fecha simple (ej. DD/MM/YYYY)
    const fecha = pedido.fecha_venta ? new Date(pedido.fecha_venta).toLocaleDateString() : 'N/A';
    
    return (
        <View style={pedidosStyles.itemContainer}>
            <View style={pedidosStyles.itemHeader}>
                <Text style={pedidosStyles.pedidoId}>Pedido # {pedido.id.substring(0, 8)}...</Text>
                <EstadoBadge estado={pedido.estado} />
            </View>
            <Text style={pedidosStyles.itemDetail}>Cliente: {pedido.nombre_cliente}</Text>
            <Text style={pedidosStyles.itemDetail}>Fecha: {fecha}</Text>
            <Text style={pedidosStyles.itemTotal}>Total: ${pedido.total_factura.toFixed(2)}</Text>
        </View>
    );
};

// Pantalla principal de Pedidos
const PedidosScreen = ({ clienteId, navigation }) => {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const fetchPedidos = useCallback(async (isRefresh = false) => {
        if (clienteId === "INVITADO_NO_AUTH") {
            setPedidos([]);
            setCargando(false);
            if (!isRefresh) {
                Alert.alert("Acceso Restringido", "Debe iniciar sesión para ver el historial de pedidos.");
            }
            return;
        }
        
        if (!isRefresh) setCargando(true);
        else setIsRefreshing(true);
        
        try {
            // Consulta a la colección Ventas, filtrada por el ID del cliente autenticado
            const q = query(
                collection(db, 'Ventas'),
                where('id_documento_cliente', '==', clienteId),
                orderBy('fecha_venta', 'desc') // Ordenar por fecha, el más reciente primero
            );
            
            const querySnapshot = await getDocs(q);
            
            const listaPedidos = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            
            setPedidos(listaPedidos);
            
        } catch (error) {
            console.error("Error al cargar los pedidos:", error);
            Alert.alert("Error", "No se pudieron cargar los pedidos. Verifique su conexión.");
        } finally {
            setCargando(false);
            setIsRefreshing(false);
        }
    }, [clienteId]);
    
    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    return (
        <SafeAreaView style={pedidosStyles.safeArea}>
            <View style={pedidosStyles.container}>
                <Text style={pedidosStyles.title}>📦 Mis Pedidos</Text>
                
                {cargando && !isRefreshing ? (
                    <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={pedidos}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <PedidoItem pedido={item} />}
                        contentContainerStyle={pedidosStyles.listContainer}
                        ListEmptyComponent={() => (
                            <View style={pedidosStyles.emptyContainer}>
                                <Ionicons name="receipt-outline" size={50} color="#ccc" />
                                <Text style={pedidosStyles.emptyText}>No has realizado ningún pedido aún.</Text>
                            </View>
                        )}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchPedidos(true)} />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const pedidosStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: { 
        flex: 1, 
        paddingHorizontal: 15, 
        paddingTop: 40,
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20, 
        textAlign: 'center',
        color: '#333',
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#007bff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    pedidoId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    itemDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#28a745',
        marginTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 5,
    },
    emptyContainer: {
        marginTop: 50,
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
    },
    // Estilos para el Badge de Estado
    badgeContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    }
});

export default PedidosScreen;
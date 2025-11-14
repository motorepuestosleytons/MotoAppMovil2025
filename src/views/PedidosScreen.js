// src/views/PedidosScreen.js (CORREGIDO: SIN ALERT, MENSAJE BONITO)
import { Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import { db } from '../database/firebaseconfig'; 
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore'; 
import { Ionicons } from "@expo/vector-icons";

// --------------------------------------------------------------------
// Badge de Estado
// --------------------------------------------------------------------
const EstadoBadge = ({ estado }) => {
    let color = '#ccc';
    let icon = 'sync-outline';
    
    switch (estado) {
        case 'Recibido': color = '#FFC107'; icon = 'mail-open-outline'; break;
        case 'En Proceso': color = '#17a2b8'; icon = 'timer-outline'; break;
        case 'Llegó a su Destino': color = '#007bff'; icon = 'cube-outline'; break;
        case 'Entregado': color = '#28a745'; icon = 'checkmark-circle-outline'; break;
        case 'Reportado': color = '#DC3545'; icon = 'alert-triangle-outline'; break;
        case 'Cancelado': color = '#6c757d'; icon = 'close-circle-outline'; break;
        default: color = '#6c757d'; icon = 'help-circle-outline';
    }

    return (
        <View style={[styles.badgeContainer, { backgroundColor: color }]}>
            <Ionicons name={icon} size={14} color="#fff" style={{ marginRight: 5 }} />
            <Text style={styles.badgeText}>{estado}</Text>
        </View>
    );
};

// --------------------------------------------------------------------
// Pedido Item (con acciones)
// --------------------------------------------------------------------
const PedidoItem = ({ pedido, isExpanded, onToggle, onConfirmReception, onReportProblem }) => {
    const fecha = pedido.fecha_venta ? new Date(pedido.fecha_venta).toLocaleDateString() : 'N/A';
    const isReadyForReception = pedido.estado === 'Enviado';
    const isFinalized = ['Entregado', 'Cancelado', 'Reportado'].includes(pedido.estado);

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={onToggle}>
            <View style={styles.itemHeader}>
                <Text style={styles.pedidoId}>Pedido # {pedido.id.substring(0, 8)}...</Text>
                <EstadoBadge estado={pedido.estado} />
            </View>
            <Text style={styles.itemDetail}>Cliente: {pedido.nombre_cliente}</Text>
            <Text style={styles.itemDetail}>Fecha: {fecha}</Text>
            <Text style={styles.itemTotal}>Total: C$ {pedido.total_factura}</Text>

            {isExpanded && (
                <View style={styles.expansionContainer}>
                    <Text style={styles.expansionTitle}>Acciones y Detalles:</Text>
                    
                    {isReadyForReception && (
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.confirmButton]} 
                                onPress={() => onConfirmReception(pedido.id)}
                            >
                                <Ionicons name="bag-check-outline" size={18} color="#fff" />
                                <Text style={styles.actionButtonText}>Confirmar Pedido</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.reportButton]} 
                                onPress={() => onReportProblem(pedido.id)} 
                            >
                                <Ionicons name="alert-circle-outline" size={18} color="#fff" />
                                <Text style={styles.actionButtonText}>Reportar Problema</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    {isFinalized && (
                        <Text style={pedido.estado === 'Reportado' ? styles.reportedText : styles.finalizedText}>
                            {pedido.estado === 'Entregado' ? "¡Pedido recibido con éxito!" : 
                             pedido.estado === 'Cancelado' ? "Este pedido fue cancelado." :
                             "Reporte enviado. Soporte te contactará pronto."}
                        </Text>
                    )}

                    {!isReadyForReception && !isFinalized && (
                        <Text style={styles.pendingText}>
                            En **{pedido.estado}**. Botón disponible cuando llegue.
                        </Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

// --------------------------------------------------------------------
// PedidosScreen
// --------------------------------------------------------------------
const PedidosScreen = ({ clienteId, navigation }) => {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pedidoExpandido, setPedidoExpandido] = useState(null); 

    // Confirmar recepción
    const confirmarRecepcion = async (pedidoId) => {
        Alert.alert(
            "Confirmar Recepción",
            "¿Recibiste el pedido correctamente?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sí, Confirmar", 
                    onPress: async () => {
                        try {
                            await updateDoc(doc(db, "Ventas", pedidoId), { estado: "Entregado" });
                            Alert.alert("¡Confirmado!", "Gracias por tu compra.");
                            fetchPedidos(true);
                            setPedidoExpandido(null);
                        } catch (error) {
                            Alert.alert("Error", "No se pudo confirmar.");
                        }
                    }
                }
            ]
        );
    };

    // Reportar problema
    const reportarProblema = async (pedidoId) => {
        Alert.alert(
            "Reportar Problema",
            "¿Hubo un problema con la entrega?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Reportar", 
                    onPress: async () => {
                        try {
                            await updateDoc(doc(db, "Ventas", pedidoId), { estado: "Reportado" });
                            Alert.alert("Reportado", "Soporte te contactará.");
                            fetchPedidos(true);
                            setPedidoExpandido(null);
                        } catch (error) {
                            Alert.alert("Error", "No se pudo reportar.");
                        }
                    }
                }
            ]
        );
    };

    const fetchPedidos = useCallback(async (isRefresh = false) => {
        if (clienteId === "INVITADO_NO_AUTH") {
            setPedidos([]);
            setCargando(false);
            return;
        }

        if (!isRefresh) setCargando(true);
        else setIsRefreshing(true);

        try {
            const q = query(
                collection(db, 'Ventas'),
                where('id_documento_cliente', '==', clienteId),
                orderBy('fecha_venta', 'desc')
            );
            const snapshot = await getDocs(q);
            const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPedidos(lista);
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "No se pudieron cargar los pedidos.");
        } finally {
            setCargando(false);
            setIsRefreshing(false);
        }
    }, [clienteId]);

    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    const toggleExpandido = (id) => {
        setPedidoExpandido(prev => prev === id ? null : id);
    };

    // SI NO ESTÁ LOGUEADO → MENSAJE BONITO
    if (clienteId === "INVITADO_NO_AUTH") {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="log-in-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>
                        Inicia sesión para ver tus pedidos
                    </Text>
                    <TouchableOpacity 
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Mis Pedidos</Text>
                
                {cargando && !isRefreshing ? (
                    <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={pedidos}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <PedidoItem 
                                pedido={item} 
                                isExpanded={pedidoExpandido === item.id}
                                onToggle={() => toggleExpandido(item.id)}
                                onConfirmReception={confirmarRecepcion} 
                                onReportProblem={reportarProblema} 
                            />
                        )}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="receipt-outline" size={50} color="#ccc" />
                                <Text style={styles.emptyText}>No tienes pedidos aún.</Text>
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

// --------------------------------------------------------------------
// ESTILOS
// --------------------------------------------------------------------
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
    container: { flex: 1, paddingHorizontal: 15, paddingTop: 40 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
    listContainer: { paddingBottom: 20 },
    itemContainer: { 
        backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10,
        borderLeftWidth: 5, borderLeftColor: '#007bff', elevation: 2
    },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    pedidoId: { fontSize: 16, fontWeight: '600', color: '#555' },
    itemDetail: { fontSize: 14, color: '#666', marginBottom: 3 },
    itemTotal: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginTop: 5, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 5 },
    badgeContainer: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, alignItems: 'center' },
    badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    expansionContainer: { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    expansionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    actionButton: { flexDirection: 'row', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', width: '48%' },
    actionButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 5, fontSize: 12, textAlign: 'center' },
    confirmButton: { backgroundColor: '#28a745' },
    reportButton: { backgroundColor: '#DC3545' },
    finalizedText: { textAlign: 'center', marginTop: 10, fontSize: 15, fontWeight: 'bold', color: '#28a745', backgroundColor: '#e6ffed', padding: 8, borderRadius: 5 },
    pendingText: { textAlign: 'center', marginTop: 10, fontSize: 14, color: '#007bff', fontStyle: 'italic', padding: 8, backgroundColor: '#e3f2fd', borderRadius: 5 },
    reportedText: { textAlign: 'center', marginTop: 10, fontSize: 15, fontWeight: 'bold', color: '#856404', backgroundColor: '#fff3cd', padding: 8, borderRadius: 5 },
    emptyContainer: { marginTop: 50, alignItems: 'center', padding: 20 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 10, textAlign: 'center' },
    loginButton: { marginTop: 15, backgroundColor: '#007bff', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 10 },
    loginButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default PedidosScreen;
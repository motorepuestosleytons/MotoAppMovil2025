// src/views/CatalogoScreen.js (LIMPIADO - SIN BOTÓN DE SALIR)

import React from 'react';
import { StyleSheet, View, SafeAreaView, Text } from 'react-native'; 
import ListaCategorias from '../Components/ListaCategorias';
import CatalogoGrid from '../Components/CatalogoGrid';     
// 🚨 NO ES NECESARIO Ionicons

const CATEGORIAS_MOCK = [
    { id: 'c1', texto: 'Soportes', nombreIcono: 'boxes' }, 
    { id: 'c2', texto: 'Accesorios', nombreIcono: 'wrench' }, 
    { id: 'c3', texto: 'Cascos', nombreIcono: 'motorcycle' }, 
    { id: 'c4', texto: 'Llantas', nombreIcono: 'circle' },
];

// 🚨 ELIMINAMOS CustomHeader, ahora es un encabezado simple
const SimpleHeader = () => (
    <View style={headerStyles.headerContainer}>
        <Text style={headerStyles.headerTitle}>Catálogo de Productos</Text>
    </View>
);

// 🚨 CORRECCIÓN: Ahora ya NO necesita 'cerrarSesion' ni 'navigation'
const CatalogoScreen = ({ onAgregar }) => { 
    return (
        <SafeAreaView style={styles.safeArea}>
            
            <SimpleHeader />
            
            <View style={styles.container}>
                <ListaCategorias categorias={CATEGORIAS_MOCK} />
                
                <CatalogoGrid onAgregar={onAgregar} /> 
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1, 
        backgroundColor: '#f5f5f5',
    },
});

const headerStyles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // Centrado para un catálogo de cliente
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 40, // Espacio superior extra para iOS
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    // 🚨 ELIMINAMOS ESTILOS DE LOGOUT
});

export default CatalogoScreen;
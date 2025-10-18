import React from 'react';
import { StyleSheet, View, SafeAreaView, Text } from 'react-native';
import ListaCategorias from '../Components/ListaCategorias';
import CatalogoGrid from '../Components/CatalogoGrid';

// Datos de categorías (Ajustados los nombres de iconos)
const CATEGORIAS_MOCK = [
    // Iconos cambiados para asegurar que existan en FontAwesome5
    { id: 'c1', texto: 'Soportes', nombreIcono: 'boxes' }, 
    { id: 'c2', texto: 'Accesorios', nombreIcono: 'wrench' }, 
    { id: 'c3', texto: 'Cascos', nombreIcono: 'motorcycle' }, // 'motorcycle' como casco genérico
    { id: 'c4', texto: 'Llantas', nombreIcono: 'circle' },
];

const CatalogoScreen = () => {
    return (
        // Mantener SafeAreaView por compatibilidad visual, aunque haya un warning.
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* 1. SECCIÓN DE CATEGORÍAS (Esta usa ScrollView horizontal, lo cual es correcto) */}
                <ListaCategorias categorias={CATEGORIAS_MOCK} />

                {/* 2. SECCIÓN DE PRODUCTOS EN CUADRÍCULA (CatalogoGrid usa FlatList, NO debe ir en un ScrollView) */}
                <CatalogoGrid /> 
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
        flex: 1, // Es crucial que el contenedor principal tenga flex: 1
        backgroundColor: '#f5f5f5',
    },
});

export default CatalogoScreen;
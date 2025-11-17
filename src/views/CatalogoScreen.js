// src/views/CatalogoScreen.js
import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text } from 'react-native'; 
import ListaCategorias from '../Components/ListaCategorias';
import CatalogoGrid from '../Components/CatalogoGrid';     

const CATEGORIAS_MOCK = [
    { id: 'all', texto: '    Todos    ', nombreIcono: 'th-large' },
    { id: 'c1', texto: '  Soportes  ', nombreIcono: 'boxes' }, 
    { id: 'c2', texto: 'Accesorios', nombreIcono: 'wrench' }, 
    { id: 'c3', texto: '  Baterias  ', nombreIcono: 'motorcycle' }, 
    { id: 'c4', texto: '   Llantas', nombreIcono: 'circle' },
];

const SimpleHeader = () => (
    <View style={headerStyles.headerContainer}>
        <Text style={headerStyles.headerTitle}>Catálogo de Productos</Text>
    </View>
);

const CatalogoScreen = ({ onAgregar }) => {
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('all');

    return (
        <SafeAreaView style={styles.safeArea}>
            <SimpleHeader />
            
            <View style={styles.container}>
                <ListaCategorias 
                    categorias={CATEGORIAS_MOCK} 
                    seleccionada={categoriaSeleccionada}
                    onSeleccionar={setCategoriaSeleccionada}
                />
                <CatalogoGrid 
                    onAgregar={onAgregar} 
                    categoriaId={categoriaSeleccionada}
                /> 
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, backgroundColor: '#f5f5f5' },
});

const headerStyles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 40,
        marginTop:-10
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
});

export default CatalogoScreen;
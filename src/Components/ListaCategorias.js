// src/components/ListaCategorias.js

import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import Categoria from '../Components/Categoria'; // Importa tu componente Categoria

const ListaCategorias = ({ categorias }) => {
    // Si no hay categorías, no muestra nada
    if (!categorias || categorias.length === 0) {
        return null;
    }
    
    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categorias.map((cat) => (
                    <View key={cat.id} style={styles.categoriaWrapper}>
                        <Categoria
                            nombre={cat.nombreIcono} // Icono de FontAwesome5
                            texto={cat.texto}
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 100, // Altura adecuada para los componentes Categoria
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoriaWrapper: {
        marginLeft: 10,
        marginRight: 5,
        // Los estilos de Categoria.js ya definen el resto
    }
});

export default ListaCategorias;
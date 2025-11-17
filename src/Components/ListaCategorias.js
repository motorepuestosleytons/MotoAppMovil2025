// src/components/ListaCategorias.js
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Categoria from './Categoria';

const ListaCategorias = ({ categorias, seleccionada, onSeleccionar }) => {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
        >
            {categorias.map(cat => {
                const esActiva = seleccionada === cat.id;

                return (
                    <TouchableOpacity
                        key={cat.id}
                        onPress={() => onSeleccionar(cat.id)}
                        style={[
                            styles.categoriaWrapper,
                            esActiva && styles.categoriaActivaWrapper
                        ]}
                        activeOpacity={0.7} // Suave al tocar
                    >
                        <Categoria 
                            nombre={cat.nombreIcono} 
                            texto={cat.texto} 
                            activa={esActiva}
                        />
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    categoriaWrapper: {
        marginHorizontal: 6,
    },
    categoriaActivaWrapper: {
        // Solo cambia estilo del wrapper si quieres
        // Aquí no hacemos nada visual extra
    },
});

export default ListaCategorias;
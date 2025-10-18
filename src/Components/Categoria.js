// src/components/Categoria.js

import { StyleSheet, Text, View } from 'react-native'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React from 'react'

export default function Categoria({nombre,texto}) {
    return (
        <View style={styles.container}>
            {/* 'nombre' es el nombre del icono de FontAwesome5 (ej: 'laptop', 'wrench') */}
            <FontAwesome5 name={nombre} size={24} color="#007BFF" /> 
            <Text style={styles.text}>{texto}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        // Estilo básico para que se vean bien en un ScrollView horizontal
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: "#fff",
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 80, 
        width: 100,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    text: {
        fontWeight: 'bold',
        color: '#667eea',
        marginTop: 5,
        textAlign: 'center',
        fontSize: 12,
    },
});
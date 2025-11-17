// src/components/Categoria.js
import { StyleSheet, Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React from 'react';

export default function Categoria({ nombre, texto, activa = false }) {
    return (
        <View style={[
            styles.container,
            activa && styles.containerActiva
        ]}>
            <FontAwesome5 
                name={nombre} 
                size={32} 
                color={activa ? "#FFF" : "#007BFF"} 
            />
            <Text style={[
                styles.text,
                activa && styles.textActiva
            ]}>
                {texto}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 19,
        backgroundColor: "#fff",
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 95,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#eee',
        marginTop:15
    },
    containerActiva: {
        backgroundColor: "#007BFF",
        borderColor: "#007BFF",
        shadowOpacity: 0.25,
    },
    text: {
        fontWeight: '600',
        color: '#333',
        marginTop: 6,
        fontSize: 13,
        textAlign: 'center',
    },
    textActiva: {
        color: '#FFF',
        fontWeight: '700',
    },
});
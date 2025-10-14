import { StyleSheet, Text, View } from 'react-native'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React from 'react'

export default function Categoria({nombre,texto}) {
    return (
        <View style={styles.container}>
            <FontAwesome5 name={nombre} size={24} color="black" />
            <Text style={styles.text}>{texto}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#fff",
    },



    text: {
       fontWeight: 'bold',
       color: '#667eea',
    },
})
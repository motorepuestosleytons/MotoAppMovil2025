// src/components/CatalogoGrid.js (Ajustado para pasar onAgregar)

import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import Producto from './Producto'; 
import { db } from '../database/firebaseconfig'; 
import { collection, getDocs } from 'firebase/firestore'; 

const PLACEHOLDER_IMAGE = 'https://cdn.pixabay.com/photo/2014/11/22/00/36/no-photo-541575_1280.png';

// ⬅️ Recibe onAgregar
const CatalogoGrid = ({ onAgregar }) => {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarProductosCatalogo = async () => {
        try {
            setCargando(true);
            const productosSnapshot = await getDocs(collection(db, "Productos"));
            const listaProductos = productosSnapshot.docs.map(doc => {
                const data = doc.data();
                
                const fotoUrl = (data.foto && data.foto.startsWith('http')) 
                                ? data.foto 
                                : PLACEHOLDER_IMAGE; 

                // 💡 Importante: parsear el precio_venta a número aquí para el carrito
                const precioNumerico = parseFloat(data.precio_venta || 0);

                return {
                    id: doc.id,
                    nombre: data.nombre || 'Producto sin nombre',
                    imagen: fotoUrl, 
                    precio: `$${precioNumerico.toFixed(2)}`,
                    precio_venta: precioNumerico, // ⬅️ NUEVO: Precio numérico para el cálculo
                    tiempo: data.stock > 0 ? 'En Stock' : 'Agotado',
                    favorito: 'heart-o', 
                    texto: data.nombre || 'Sin descripción',
                };
            });
            setProductos(listaProductos);
        } catch (error) {
            console.error("Error al cargar productos del catálogo:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarProductosCatalogo();
    }, []);

    const renderProducto = ({ item }) => (
        <Producto
            item={item} // Pasamos el objeto completo para el botón
            imagen={item.imagen} 
            nombre={item.nombre} 
            precio={item.precio}
            tiempo={item.tiempo}
            texto={item.texto} 
            favorito={item.favorito}
            onAgregar={onAgregar} // ⬅️ Pasamos la función al hijo
        />
    );
    
    if (cargando) {
        return (
            <View style={styles.cargandoContainer}>
                <ActivityIndicator size="large" color="#457b9d" />
                <Text>Cargando catálogo...</Text>
            </View>
        );
    }
    
    if (productos.length === 0 && !cargando) {
        return (
            <View style={styles.cargandoContainer}>
                <Text style={styles.titulo}>Catálogo</Text>
                <Text>No hay productos registrados en la base de datos.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Productos Destacados</Text>
            <FlatList
                data={productos}
                renderItem={renderProducto}
                keyExtractor={(item) => item.id}
                numColumns={2} 
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                refreshing={cargando} 
                onRefresh={cargarProductosCatalogo} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 5,
        backgroundColor: '#fff',
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        marginLeft: 15,
        color: '#333',
    },
    row: {
        justifyContent: 'space-around', 
    },
    cargandoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    }
});

export default CatalogoGrid;
// src/components/CatalogoGrid.js
import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import Producto from './Producto';
import { db } from '../database/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';

const PLACEHOLDER_IMAGE = 'https://cdn.pixabay.com/photo/2014/11/22/00/36/no-photo-541575_1280.png';

const FILTROS_CATEGORIA = {
    'all': () => true,
    'c1': (texto) => /Acelerador|base|stand|pie|support|soportes/i.test(texto),
    'c2': (texto) => /accesorio|bujias|cable|luz|espejo|protector|manija|kit|accesorios|carcasa|tapón/i.test(texto),
    'c3': (texto) => /casco|helmet|casco de moto|protección cabeza/i.test(texto),
    'c4': (texto) => /llanta|rueda|neumático|rin|tire|wheel|llantas/i.test(texto),
};

// === NOMBRES DE CATEGORÍAS PARA TÍTULO ===
const NOMBRE_CATEGORIA = {
    'all': 'Todos los Productos',
    'c1': 'Soportes',
    'c2': 'Accesorios',
    'c3': 'Baterias',
    'c4': 'Llantas',
};

const CatalogoGrid = ({ onAgregar, categoriaId = 'all' }) => {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarProductosCatalogo = async () => {
        try {
            setCargando(true);
            const snapshot = await getDocs(collection(db, "Productos"));
            const lista = snapshot.docs.map(doc => {
                const d = doc.data();
                const fotoUrl = (d.foto && d.foto.startsWith('http')) ? d.foto : PLACEHOLDER_IMAGE;
                const precioNum = parseFloat(d.precio_venta || 0);

                // Texto combinado para filtrar (todo en minúsculas)
                const textoBusqueda = `${d.nombre || ''} ${d.marca || ''} ${d.modelo || ''}`.toLowerCase();

                return {
                    id: doc.id,
                    nombre: d.nombre || 'Sin nombre',
                    marca: d.marca || '',
                    modelo: d.modelo || '',
                    imagen: fotoUrl,
                    precio: `$${precioNum.toFixed(2)}`,
                    precio_venta: precioNum,
                    tiempo: d.stock > 0 ? 'En Stock' : 'Agotado',
                    favorito: 'heart-o',
                    texto: d.nombre || '',
                    textoBusqueda, // Para filtrado
                };
            });

            // Aplicar filtro local
            const filtro = FILTROS_CATEGORIA[categoriaId] || FILTROS_CATEGORIA['all'];
            const filtrados = lista.filter(item => filtro(item.textoBusqueda));

            setProductos(filtrados);
        } catch (error) {
            console.error("Error al cargar productos:", error);
            setProductos([]);
        } finally {
            setCargando(false);
        }
    };

    // Recargar al cambiar categoría
    useEffect(() => {
        cargarProductosCatalogo();
    }, [categoriaId]);

    const renderProducto = ({ item }) => (
        <Producto
            item={item}
            imagen={item.imagen}
            nombre={item.nombre}
            precio={item.precio}
            tiempo={item.tiempo}
            texto={item.nombre}
            favorito={item.favorito}
            onAgregar={onAgregar}
        />
    );

    // === ESTADOS DE UI ===
    if (cargando) {
        return (
            <View style={styles.cargandoContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.textoCargando}>
                    Cargando {NOMBRE_CATEGORIA[categoriaId]}...
                </Text>
            </View>
        );
    }

    if (productos.length === 0) {
        return (
            <View style={styles.cargandoContainer}>
                <Text style={styles.tituloVacio}>Catálogo</Text>
                <Text style={styles.textoVacio}>
                    No hay productos en esta categoría.
                </Text>
            </View>
        );
    }

    // === VISTA PRINCIPAL ===
    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>
                {NOMBRE_CATEGORIA[categoriaId] || 'Productos'}
            </Text>
            <FlatList
                data={productos}
                renderItem={renderProducto}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.lista}
                onRefresh={cargarProductosCatalogo}
                refreshing={cargando}
            />
        </View>
    );
};

// === ESTILOS ===
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 5,
        backgroundColor: '#fff',
        marginTop:-438
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 12,
        marginLeft: 15,
        color: '#333',
    },
    row: {
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    lista: {
        paddingBottom: 20,
    },
    cargandoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    textoCargando: {
        marginTop: 12,
        color: '#666',
        fontSize: 16,
    },
    tituloVacio: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    textoVacio: {
        color: '#999',
        fontSize: 15,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default CatalogoGrid;
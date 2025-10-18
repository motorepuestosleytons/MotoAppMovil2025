import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
// Se asume que este componente ha sido renombrado y adaptado previamente
import BotonEliminarProveedor from "./BotonEliminarProveedor.js"; 

// El componente se renombra a TablaProveedores
const TablaProveedores = ({ proveedores, eliminarProveedor, editarProveedor }) => {
  // Estados para el Modal de Edición
  const [visible, setVisible] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  
  // Se adaptan los campos de datos editados a los del proveedor
  const [datosEditados, setDatosEditados] = useState({
    empresa: "",          // Reemplaza a 'nombre'
    nombre_proveedor: "", // Reemplaza a 'cedula'
    telefono: "",
  });

  const abrirModal = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    // Inicialización de campos adaptada
    setDatosEditados({
      empresa: proveedor.empresa || "",
      nombre_proveedor: proveedor.nombre_proveedor || "",
      telefono: proveedor.telefono || "",
    });
    setVisible(true);
  };

  const guardarCambios = () => {
    // Se envía el proveedor seleccionado fusionado con los datos editados
    editarProveedor({ ...proveedorSeleccionado, ...datosEditados });
    setVisible(false);
  };
   
  return (
    <View style={styles.container}>
      {/* Título adaptado */}
      <Text style={styles.titulo}>Tabla de Proveedores</Text>

      <ScrollView horizontal>
        {/* Se ajusta el minWidth para las columnas restantes */}
        <View style={{ minWidth: 500 }}>
          {/* Encabezado de la tabla - Títulos adaptados */}
          <View style={[styles.fila, styles.encabezado]}>
            <Text style={[styles.textoEncabezado, styles.columnaEmpresa]}>Empresa</Text>
            <Text style={[styles.textoEncabezado, styles.columnaNombreProveedor]}>Nombre Proveedor</Text>
            <Text style={[styles.textoEncabezado, styles.columnaTelefono]}>Teléfono</Text>
            <Text style={[styles.textoEncabezado, styles.columnaAcciones]}>Acciones</Text>
          </View>

          {/* Contenido de la tabla - Se usa la prop 'proveedores' */}
          <ScrollView>
            {proveedores.map((item) => (
              <View key={item.id} style={styles.fila}>
                {/* Columnas de datos adaptadas */}
                <Text style={[styles.celda, styles.columnaEmpresa]}>{item.empresa}</Text>
                <Text style={[styles.celda, styles.columnaNombreProveedor]}>{item.nombre_proveedor}</Text>
                <Text style={[styles.celda, styles.columnaTelefono]}>{item.telefono}</Text>
                
                <View style={[styles.celda, styles.columnaAcciones]}>
                  <View style={styles.contenedorBotones}>
                    <TouchableOpacity
                      style={styles.botonEditar}
                      onPress={() => abrirModal(item)}
                    >
                      <Text style={styles.textoBotonEditar}>🖋️</Text>
                    </TouchableOpacity>
                    {/* Componente de eliminación adaptado */}
                    <BotonEliminarProveedor
                      id={item.id}
                      eliminarProveedor={eliminarProveedor}
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Modal de Edición */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.textoModal}>
              {/* Título del modal adaptado */}
              Editar Proveedor: {datosEditados.empresa}
            </Text>
            
            <ScrollView style={{ width: "100%" }}>

              {/* Input para Empresa (antes 'Nombre') */}
              <TextInput
                style={styles.input}
                placeholder="Empresa"
                value={datosEditados.empresa}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, empresa: valor })
                }
              />

              {/* Input para Nombre Proveedor (antes 'Cédula') */}
              <TextInput
                style={styles.input}
                placeholder="Nombre Proveedor"
                value={datosEditados.nombre_proveedor}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, nombre_proveedor: valor })
                }
              />
              
              {/* Input para Teléfono (Sin cambios) */}
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={datosEditados.telefono}
                onChangeText={(valor) =>
                  setDatosEditados({ ...datosEditados, telefono: valor })
                }
                keyboardType="phone-pad"
              />
            </ScrollView>

            <View style={styles.filaBotones}>
              <TouchableOpacity
                style={[styles.botonAccion, styles.cancelar]}
                onPress={() => setVisible(false)}
              >
                <Text style={styles.textoAccion}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botonAccion, styles.confirmar]}
                onPress={guardarCambios}
              >
                <Text style={styles.textoAccion}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Se mantienen los estilos de la estructura original, pero se ajustan los nombres de las columnas en 'styles' para claridad.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignSelf: "stretch",
     marginTop: -153,
  },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  fila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#CCC",
    alignItems: "center", 
  },
  encabezado: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
  },
  celda: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 5,
    paddingVertical: 6,
  },
  textoEncabezado: {
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  // --- Estilos de ancho de columna (nombres adaptados para reflejar los datos) ---
  columnaEmpresa: {
    width: 150, // Antes 'columnaNombre'
  },
  columnaNombreProveedor: {
    width: 150, // Antes 'columnaCedula'
  },
  columnaTelefono: {
    width: 110,
  },
  columnaAcciones: {
    width: 90, 
  },
  // ---------------------------------------------
  contenedorBotones: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  botonEditar: {
    backgroundColor: "#7c787886",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  textoBotonEditar: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  // --- Estilos del Modal (sin cambios) ---
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "85%",
  },
  textoModal: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  filaBotones: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  botonAccion: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelar: { backgroundColor: "#ccc" },
  confirmar: { backgroundColor: "#457b9d" },
  textoAccion: { color: "white", fontWeight: "bold" },
});

export default TablaProveedores;
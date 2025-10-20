// Navegacion.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AntDesign from '@expo/vector-icons/AntDesign';

// 🚨 IMPORTACIONES DE VISTAS
import Clientes from './src/views/Clientes'; 
import Productos from './src/views/Productos'; 
import Proveedores from './src/views/Proveedores'; 
import Compras from './src/views/Compras';    
import Ventas from './src/views/Ventas';  
import CatalogoScreen from './src/views/CatalogoScreen'; 

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ClientesStack({ cerrarSesion }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Clientes" options={{ title: 'Gestión de Clientes' }}>
        {(props) => <Clientes {...props} cerrarSesion={cerrarSesion} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function ProductosStack({ cerrarSesion }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductosPrincipal" options={{ title: 'Gestión de Productos' }}>
        {(props) => <Productos {...props} cerrarSesion={cerrarSesion} />}
      </Stack.Screen>
      <Stack.Screen name="Catalogo" component={CatalogoScreen} options={{ title: 'Catálogo de Productos' }} />
    </Stack.Navigator>
  );
}

export default function Navegacion({ cerrarSesion }) {
  return (
    <Tab.Navigator
      initialRouteName="ClientesTab"
      screenOptions={{
        tabBarActiveTintColor: '#457b9d',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ClientesTab"
        options={{
          tabBarLabel: 'Clientes',
          tabBarIcon: ({ color, size }) => <AntDesign name="team" size={size} color={color} />,
        }}
      >
        {() => <ClientesStack cerrarSesion={cerrarSesion} />}
      </Tab.Screen>

      <Tab.Screen
        name="ProductosTab"
        options={{
          tabBarLabel: 'Productos',
          tabBarIcon: ({ color, size }) => <AntDesign name="tag" size={size} color={color} />,
        }}
      >
        {() => <ProductosStack cerrarSesion={cerrarSesion} />}
      </Tab.Screen>

      <Tab.Screen
        name="ProveedoresTab"
        component={Proveedores}
        options={{
          tabBarLabel: 'Proveedores',
          tabBarIcon: ({ color, size }) => <AntDesign name="dropbox" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ComprasTab"
        component={Compras}
        options={{
          tabBarLabel: 'Compras',
          tabBarIcon: ({ color, size }) => <AntDesign name="shopping" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="VentasTab"
        component={Ventas}
        options={{
          tabBarLabel: 'Ventas',
          tabBarIcon: ({ color, size }) => <AntDesign name="shopping-cart" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

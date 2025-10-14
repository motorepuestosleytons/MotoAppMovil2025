import React from "react";
import Clientes from "./src/views/Clientes";
import Proveedores from "./src/views/Proveedores";
import Productos from "./src/views/Productos";
import Compras from "./src/views/Compras";
import Ventas from "./src/views/Ventas";
import { ScrollView } from "react-native";



export default function App( ) {

return (
<>

<ScrollView>
<Compras    />
<Ventas
/>
<Proveedores/>
<Productos />
<Clientes/>
</ScrollView>
</>

);
}
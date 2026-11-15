# BiciSabana · Mockup del Sistema de Préstamos

Mockup académico (caso ficticio, datos ilustrativos) de la página web de BiciSabana, para Fundamentos de Programación, con el logo y la paleta de la Universidad de La Sabana. HTML + CSS + JavaScript, sin compilación.

## Cómo probarlo
Abre `index.html` en el navegador (o la página publicada con GitHub Pages). En el login hay botones para rellenar las cuentas demo.

| Rol | Código | Contraseña |
|---|---|---|
| Estudiante | 202601 | Sabana2026 |
| Administrador | 100001 | Admin2026 |

Cuentas **ficticias** solo para demostración.

> **Aviso:** autenticación simulada para fines académicos; no ofrece seguridad real. Un sistema real requiere autenticación en servidor, contraseñas con hash y HTTPS.

## Estructura
```
index.html      Inicio de sesión (pantalla dividida)
app.html        Panel (protegido)
css/styles.css  Estilos y paleta
css/campus.css  Estilos de la pestaña Campus
js/auth.js      Login simulado, roles, bloqueo, inactividad
js/datos.js     30 bicicletas y reglas de préstamo/devolución
js/campus.js    Mapa esquemático del campus (SVG) y puntos de préstamo
js/app.js       Vistas del panel
assets/logo.png Logo de la Universidad de La Sabana (versión reducida)
```

## Paleta extraída del logo
| Color | HEX | Uso |
|---|---|---|
| Azul institucional | #043470 | Primario, encabezado, estado Disponible |
| Rojo escudo | #9C080C | Alertas y estado Prestada |
| Dorado | #D0A00C | Acentos, pestaña activa, bordes y foco |

## Pantallas
- **Login:** pantalla dividida con ilustración, validación de código (6 números), mostrar/ocultar contraseña y bloqueo temporal.
- **Inicio:** saludo, cifras rápidas, barra de ocupación, accesos directos y "Mis préstamos" (o prestadas ahora, para el administrador).
- **Bicicletas:** tarjetas con buscador por código y filtros Todas / Disponibles / Prestadas; préstamo y devolución rápidos desde cada tarjeta.
- **Prestar / Devolver:** formularios con códigos sugeridos y reglas a la vista.
- **Estación:** los 30 puestos (3 filas × 10) con una bicicleta dibujada en cada uno.
- **Campus:** mapa esquemático de la universidad con 6 puntos de préstamo; se pueden elegir tocando el mapa, con teclado o desde la lista. La Estación Central muestra las bicicletas disponibles en vivo y los demás puntos son ilustrativos. Si agregas la captura del campus como `assets/campus.jpg`, aparece un botón "Vista satélite" (los puntos están en el mismo sistema de coordenadas de la captura).
- **Totales (solo administrador):** anillo de porcentaje prestado, cifras e intentos rechazados.

## Requisitos del notebook cubiertos
RF-01/02 ver bicicletas · RF-03/04/08 prestar con código de 6 números · RF-05 devolver · RF-06 disponibles (filtro) · RF-07 buscar por código · RF-09 totales e intentos rechazados (admin) · RF-10 mapa 3×10 (Estación) · RF-11 menú siempre disponible · RNF-01/02/03 mensajes amables y sin errores que rompan la interfaz.

## Decisiones de diseño
1. **Paleta y contraste:** azul para estructura y Disponible, rojo para Prestada y alertas; el dorado como acento (texto oscuro sobre dorado). El estado nunca depende solo del color (texto "Disponible/Prestada" y letras D/P en el mapa).
2. **Flujo:** login → inicio → acciones con mensajes inmediatos y avisos emergentes; así Laura evita préstamos dobles y devoluciones sin registro.
3. **Roles:** el estudiante ve, busca, presta y devuelve lo suyo; el administrador además ve totales, intentos rechazados y puede operar por cualquier estudiante.
4. **Validación:** código vacío, con letras o de longitud distinta de 6, bicicleta inexistente, ya prestada, devolución de una no prestada, opción inválida del menú, credenciales incorrectas y bloqueo de 30 s tras 3 intentos fallidos (un código con formato inválido también cuenta como intento). Supuesto: los códigos de bicicleta no distinguen mayúsculas.
5. **Límites del login simulado:** el hash y las cuentas viven en el navegador; en producción se necesita servidor, hash con sal, HTTPS y control de sesiones.
6. **Accesibilidad:** etiquetas en campos, foco visible, navegación por teclado, regiones `aria-live`, enlace "saltar al contenido" y respeto por `prefers-reduced-motion`.
7. **Interfaz atractiva y práctica:** degradados y tarjetas con la paleta del logo, iconos SVG propios, animaciones suaves y, en celular, barra de navegación inferior para usar con el pulgar.
8. **Mapa del campus:** dibujado en SVG propio a partir de una captura del campus (río, vías, edificios y parqueadero), para que sea ligero, escalable y accesible. Las ubicaciones de los puntos son ilustrativas; en un sistema real vendrían de una base de datos de estaciones.

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
js/tema.js      Modo claro / oscuro (RP-01)
js/auth.js      Login simulado, roles, bloqueo, inactividad
js/datos.js     30 bicicletas, reglas de préstamo/devolución, reservas, historial, logros y CSV
js/campus.js    Mapa del campus (vista satélite y vista mapa) y puntos de préstamo
js/mapas/       Imágenes del campus incrustadas como texto (base64) en trozos
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
- **Inicio:** saludo, cifras rápidas (incluye CO₂ evitado), barra de ocupación, accesos directos, aviso de préstamos vencidos y "Mis préstamos y reservas" (o prestadas ahora, para el administrador).
- **Bicicletas:** tarjetas con buscador por código y filtros Todas / Disponibles / Prestadas / Favoritas; préstamo, reserva y devolución rápidos desde cada tarjeta, con el tiempo del préstamo en vivo.
- **Prestar / Devolver:** formularios con códigos sugeridos y reglas a la vista; al devolver se califica el viaje y se puede reportar un daño.
- **Estación:** los 30 puestos (3 filas × 10) con 4 estados: Disponible, Reservada, Prestada y Mantenimiento; los préstamos vencidos se marcan con borde punteado.
- **Campus:** mapa real de la universidad con selector **Satélite / Mapa** y 6 puntos de préstamo numerados; se eligen tocando el mapa, con teclado o desde la lista. La Estación Central muestra las bicicletas disponibles en vivo y los demás puntos son ilustrativos.
- **Historial:** huella verde, insignias y tabla de viajes (el administrador ve los viajes de todos).
- **Totales (solo administrador):** anillo de porcentaje prestado, cifras, intentos rechazados, mantenimiento, satisfacción promedio y reportes CSV.

## Requerimientos propios (creativos)
| ID | Requerimiento | Cómo se cumple en el mockup |
|---|---|---|
| RP-01 | **Modo oscuro** | Botón luna/sol en el encabezado. Por defecto sigue la preferencia del sistema y recuerda la elección en el navegador. |
| RP-02 | **Reserva de 10 minutos** | El estudiante aparta una bicicleta disponible desde su tarjeta; nadie más puede prestarla mientras dure. Solo una reserva a la vez y se libera sola al vencer. |
| RP-03 | **Tiempo de préstamo en vivo y límite de 2 horas** | Cada préstamo muestra cuánto lleva y cuánto le queda; al pasar 2 horas se marca como vencido y aparece un aviso en Inicio y Totales. |
| RP-04 | **Historial de viajes** | Cada devolución queda registrada con bicicleta, fecha, duración, entrega a tiempo o tarde, calificación y daño. |
| RP-05 | **Huella verde** | Estima los km pedaleados (hasta 30 min por viaje a 12 km/h) y el CO₂ evitado frente a un carro (0,12 kg/km). Cifras ilustrativas. |
| RP-06 | **Reporte de daños y mantenimiento** | Al devolver se puede reportar llanta, frenos, cadena, sillín u otro; la bicicleta pasa a Mantenimiento, no se puede prestar y el administrador la marca como reparada. |
| RP-07 | **Bicicletas favoritas** | Estrella en cada tarjeta, filtro "★ Favoritas" y las favoritas aparecen primero al prestar. Se guardan por usuario. |
| RP-08 | **Logros e insignias** | 5 insignias (Primer pedalazo, Ciclista frecuente, Siempre a tiempo, Guardián de la flota, Kilómetro verde) con barra de progreso y aviso al desbloquearlas. |
| RP-09 | **Calificación del viaje** | 1 a 5 estrellas opcionales al devolver; el administrador ve el promedio de satisfacción. |
| RP-10 | **Reportes CSV** | El administrador descarga Bicicletas e Historial en CSV (separado por punto y coma, con tildes) para abrir en Excel o Google Sheets. |

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
8. **Mapa del campus:** usa dos capturas del campus (satélite y mapa oscuro), reducidas a 640 px e incrustadas en `js/mapas/` para que la página funcione sin archivos de imagen aparte. Los puntos se colocan junto a lugares visibles en cada imagen; son ilustrativos y en un sistema real vendrían de una base de datos de estaciones. Imágenes: capturas de Apple Maps.
9. **Requerimientos propios:** reglas en `js/datos.js` (sin tocar la interfaz) para que se puedan probar solas; los datos se guardan en el navegador con la llave `bs_datos_v2` y se reinician desde Totales.

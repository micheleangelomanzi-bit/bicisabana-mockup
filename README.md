# BiciSabana · Mockup del Sistema de Préstamos

Mockup académico (caso ficticio, datos ilustrativos) de la página web de BiciSabana, para Fundamentos de Programación, con el logo y la paleta de la Universidad de La Sabana. HTML + CSS + JavaScript, sin compilación.

## Cómo probarlo
Abre `index.html` en el navegador (o publica con GitHub Pages).

| Rol | Código | Contraseña |
|---|---|---|
| Estudiante | 202601 | Sabana2026 |
| Administrador | 100001 | Admin2026 |

Cuentas **ficticias** solo para demostración.

> **Aviso:** autenticación simulada para fines académicos; no ofrece seguridad real. Un sistema real requiere autenticación en servidor, contraseñas con hash y HTTPS.

## Estructura
```
index.html      Inicio de sesión
app.html        Panel (protegido)
css/styles.css  Estilos y paleta
js/auth.js      Login simulado, roles, bloqueo, inactividad
js/datos.js     30 bicicletas y reglas de préstamo/devolución
js/app.js       Vistas del panel
assets/logo.png Logo de la Universidad de La Sabana (versión reducida)
```

## Paleta extraída del logo
| Color | HEX | Uso |
|---|---|---|
| Azul institucional | #043470 | Primario, encabezado, estado Disponible |
| Rojo escudo | #9C080C | Alertas y estado Prestada |
| Dorado | #D0A00C | Acentos, bordes y foco (no como texto sobre blanco) |

## Requisitos del notebook cubiertos
RF-01/02 ver bicicletas · RF-03/04/08 prestar con código de 6 números · RF-05 devolver · RF-06 disponibles · RF-07 buscar · RF-09 totales e intentos rechazados (admin) · RF-10 mapa 3×10 · RF-11 menú siempre disponible · RNF-01/02/03 mensajes amables y sin errores que rompan la interfaz.

## Decisiones de diseño
1. **Paleta y contraste:** azul para estructura y Disponible, rojo para Prestada y alertas; el dorado solo como acento. El estado nunca depende solo del color (texto "Disponible/Prestada" y letras D/P en el mapa).
2. **Flujo:** login → panel con menú por rol → acciones con mensajes inmediatos; así Laura evita préstamos dobles y devoluciones sin registro.
3. **Roles:** el estudiante ve, busca, presta y devuelve lo suyo; el administrador además ve totales, intentos rechazados y puede operar por cualquier estudiante.
4. **Validación:** código vacío, con letras o de longitud distinta de 6, bicicleta inexistente, ya prestada, devolución de una no prestada, opción inválida del menú, credenciales incorrectas y bloqueo de 30 s tras 3 fallos. Supuesto: los códigos de bicicleta no distinguen mayúsculas.
5. **Límites del login simulado:** el hash y las cuentas viven en el navegador; en producción se necesita servidor, hash con sal, HTTPS y control de sesiones.
6. **Accesibilidad:** etiquetas en campos, foco visible, navegación por teclado, regiones `aria-live` y enlace "saltar al contenido"; diseño responsivo con tablas desplazables.

/* BiciSabana · Mapa del campus con los puntos de préstamo.
   Usa dos capturas del campus (satélite y mapa), reducidas a 640 px e incrustadas en js/mapas/*.js.
   Las ubicaciones de los puntos son ILUSTRATIVAS. Todo el SVG se arma solo con constantes de este archivo. */
const Campus = (() => {
  // Tamaño de cada imagen (en píxeles) y longitud esperada del texto base64 (para detectar archivos incompletos)
  const VISTAS = {
    sat:  { ancho: 640, alto: 794, longitud: 44988, mime: "image/webp", etiqueta: "Satélite" },
    mapa: { ancho: 640, alto: 892, longitud: 20332, mime: "image/webp", etiqueta: "Mapa" }
  };

  // pos: punta del pin en coordenadas de cada imagen [x, y]
  const PUNTOS = [
    { id: "central", n: 1, nombre: "Estación Central BiciSabana", activo: true,
      cerca: "Junto al edificio principal de la Universidad de La Sabana.", pos: { sat: [459, 381], mapa: [484, 436] } },
    { id: "ingenieria", n: 2, nombre: "Punto Facultad de Ingeniería", activo: false,
      cerca: "Al lado de la Facultad de Ingeniería, frente al Río Bogotá.", pos: { sat: [427, 255], mapa: [445, 311] } },
    { id: "adportas", n: 3, nombre: "Punto Ad Portas y Café de la Bolsa", activo: false,
      cerca: "Zona de acceso, cerca de Ad Portas y el Café de la Bolsa.", pos: { sat: [574, 374], mapa: [602, 432] } },
    { id: "embarcadero", n: 4, nombre: "Punto Embarcadero", activo: false,
      cerca: "Cerca del Embarcadero y de los parqueaderos del campus.", pos: { sat: [366, 566], mapa: [388, 638] } },
    { id: "inalde", n: 5, nombre: "Punto INALDE Business School", activo: false,
      cerca: "Al costado de INALDE Business School.", pos: { sat: [52, 555], mapa: [56, 632] } },
    { id: "arena", n: 6, nombre: "Punto Arena Sabana", activo: false,
      cerca: "Cerca de Arena Sabana.", pos: { sat: [180, 386], mapa: [182, 452] } }
  ];

  const imagen = (clave) => {
    const datos = (window.MAPAS || {})[clave];
    return datos && datos.length === VISTAS[clave].longitud ? `data:${VISTAS[clave].mime};base64,${datos}` : null;
  };

  function pin(p, clave) {
    const [x, y] = p.pos[clave];
    const color = p.activo ? "#9c080c" : "#043470";
    return `<g class="pin${p.activo ? " central" : ""}" data-id="${p.id}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="${p.n}. ${p.nombre}">
      ${p.activo ? '<circle class="pulso" cy="-40" r="24" fill="#9c080c" opacity=".4"/>' : ""}
      <g class="cuerpo-g">
        <path class="cuerpo" d="M0 0 C-6 -12 -22 -24 -22 -40 a22 22 0 0 1 44 0 C22 -24 6 -12 0 0Z" fill="${color}" stroke="#ffffff" stroke-width="3.5"/>
        <circle cy="-40" r="13" fill="#ffffff"/>
        <text y="-34" text-anchor="middle" font-size="17" font-weight="800" fill="${color}">${p.n}</text>
      </g>
    </g>`;
  }

  function vista(clave) {
    const v = VISTAS[clave], src = imagen(clave);
    return `<svg class="campus-svg vista-${clave}" viewBox="0 0 ${v.ancho} ${v.alto}" role="group" aria-label="${v.etiqueta}: campus con seis puntos de préstamo" xmlns="http://www.w3.org/2000/svg" font-family="Poppins, 'Segoe UI', Arial, sans-serif">
      <rect width="${v.ancho}" height="${v.alto}" fill="#2f3d57"/>
      ${src ? `<image href="${src}" x="0" y="0" width="${v.ancho}" height="${v.alto}"/>`
            : `<text x="${v.ancho / 2}" y="${v.alto / 2}" text-anchor="middle" font-size="20" fill="#ffffff">La imagen del mapa no se pudo cargar.</text>`}
      <g class="ruta" display="none"><line class="ruta-fondo" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/><line class="ruta-linea" stroke="#d0a00c" stroke-width="5" stroke-linecap="round" stroke-dasharray="12 9"/></g>
      <g class="pines">${PUNTOS.map(p => pin(p, clave)).join("")}</g>
    </svg>`;
  }

  // RP-13: distancia aproximada entre dos puntos. Escala estimada a ojo sobre la imagen satelital
  // y un factor de 1,3 porque los caminos del campus no son líneas rectas. Cifras ilustrativas.
  const METROS_POR_PX = 2.6, FACTOR_CAMINO = 1.3;
  function distancia(idA, idB) {
    const a = PUNTOS.find(p => p.id === idA), b = PUNTOS.find(p => p.id === idB);
    if (!a || !b || a === b) return 0;
    const [x1, y1] = a.pos.sat, [x2, y2] = b.pos.sat;
    return Math.round(Math.hypot(x2 - x1, y2 - y1) * METROS_POR_PX * FACTOR_CAMINO / 10) * 10;
  }
  // Minutos en bicicleta (12 km/h) y caminando (4,8 km/h)
  const tiempos = (metros) => ({ bici: Math.max(1, Math.round(metros / 1000 / 12 * 60)), pie: Math.max(1, Math.round(metros / 1000 / 4.8 * 60)) });

  const svg = () => vista("sat") + vista("mapa");
  const vistas = Object.keys(VISTAS).map(k => [k, VISTAS[k].etiqueta]);

  // Dibuja (o esconde) la ruta entre dos puntos en las dos vistas del mapa
  function mostrarRuta(caja, idA, idB) {
    caja.querySelectorAll("svg.campus-svg").forEach(s => {
      const clave = s.classList.contains("vista-sat") ? "sat" : "mapa";
      const g = s.querySelector(".ruta");
      const a = PUNTOS.find(p => p.id === idA), b = PUNTOS.find(p => p.id === idB);
      if (!g) return;
      if (!a || !b || a === b) { g.setAttribute("display", "none"); return; }
      g.querySelectorAll("line").forEach(l => {
        l.setAttribute("x1", a.pos[clave][0]); l.setAttribute("y1", a.pos[clave][1]);
        l.setAttribute("x2", b.pos[clave][0]); l.setAttribute("y2", b.pos[clave][1]);
      });
      g.removeAttribute("display");
    });
  }

  return { PUNTOS, VISTAS, svg, vistas, distancia, tiempos, mostrarRuta };
})();

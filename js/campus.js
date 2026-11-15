/* BiciSabana · Mapa esquemático del campus (SVG dibujado a partir de una captura del campus).
   Las ubicaciones de los puntos de préstamo son ILUSTRATIVAS. El SVG se arma solo con constantes de este archivo. */
const Campus = (() => {
  const ANCHO = 1148, ALTO = 1059;   // mismo sistema de coordenadas de la captura original (por si se añade como capa satélite)

  const PUNTOS = [
    { id: "central", n: 1, corto: "Central", nombre: "Estación Central BiciSabana", x: 505, y: 300, activo: true,
      cerca: "Junto al edificio principal de la Universidad, en el corazón del campus." },
    { id: "ingenieria", n: 2, corto: "Ingeniería", nombre: "Punto Facultad de Ingeniería", x: 300, y: 372, activo: false,
      cerca: "Frente a la Facultad de Ingeniería, al lado del Río Bogotá." },
    { id: "adportas", n: 3, corto: "Ad Portas", nombre: "Punto Ad Portas y Café de la Bolsa", x: 392, y: 188, activo: false,
      cerca: "Zona de acceso norte, cerca de Ad Portas y el Café de la Bolsa." },
    { id: "parqueadero", n: 4, corto: "Parqueadero", nombre: "Punto Parqueadero", x: 690, y: 590, activo: false,
      cerca: "Entrada del parqueadero, camino hacia la Autopista Norte." },
    { id: "inalde", n: 5, corto: "INALDE", nombre: "Punto INALDE Business School", x: 575, y: 712, activo: false,
      cerca: "Al costado de INALDE Business School." },
    { id: "clinica", n: 6, corto: "Clínica", nombre: "Punto Clínica Universidad de La Sabana", x: 760, y: 940, activo: false,
      cerca: "Acceso a la Clínica Universidad de La Sabana, cerca de la Vía Chía." }
  ];

  const AGUA = 'fill="#2f6fb3" font-style="italic" font-weight="600"';
  const ETQ = 'fill="#3a4a63" font-weight="600"';

  function vector() {
    return `
    <!-- Zonas verdes -->
    <path d="M790 250 L990 215 L1005 560 L865 625 L790 455Z" fill="#d4e6c6"/>
    <path d="M55 500 L370 478 L392 640 L255 705 L30 610Z" fill="#d9e9cc"/>
    <path d="M520 420 L655 440 L645 545 L540 535Z" fill="#c6e0b6"/>
    <path d="M620 40 L720 70 L735 140 L640 130Z" fill="#cfe3c2"/>
    <path d="M0 880 L330 940 L480 1059 L0 1059Z" fill="#dcebd0"/>
    <path d="M820 440 L960 515 L945 625 L810 550Z" fill="#e6efe0" stroke="#c9d8be" stroke-width="2"/>

    <!-- Río Bogotá y Quebrada Honda -->
    <path id="rio" d="M10 55 C70 40 110 60 115 120 C118 190 55 220 50 300 C45 380 70 460 150 490 C230 515 330 470 385 455 C405 450 405 500 395 530 C380 580 290 620 255 680 C235 730 300 765 370 740 C450 710 520 680 590 640 C680 590 730 530 750 470 C780 390 770 300 785 230 C800 140 850 80 890 20 L905 0"
          fill="none" stroke="#7fb0e3" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 55 C70 40 110 60 115 120 C118 190 55 220 50 300 C45 380 70 460 150 490 C230 515 330 470 385 455 C405 450 405 500 395 530 C380 580 290 620 255 680 C235 730 300 765 370 740 C450 710 520 680 590 640 C680 590 730 530 750 470 C780 390 770 300 785 230 C800 140 850 80 890 20 L905 0"
          fill="none" stroke="#b7d5f2" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M935 668 C860 625 790 585 700 566" fill="none" stroke="#a9cdee" stroke-width="7" stroke-linecap="round"/>

    <!-- Vías -->
    <path d="M0 565 C60 645 130 705 200 768 C300 860 400 930 520 1059" fill="none" stroke="#b9c0cc" stroke-width="20" stroke-linecap="round"/>
    <path d="M0 565 C60 645 130 705 200 768 C300 860 400 930 520 1059" fill="none" stroke="#ffffff" stroke-width="13" stroke-linecap="round"/>
    <path d="M1118 0 C1092 120 1042 250 1030 420 C1015 600 975 800 935 1059" fill="none" stroke="#a7afbd" stroke-width="44"/>
    <path d="M1118 0 C1092 120 1042 250 1030 420 C1015 600 975 800 935 1059" fill="none" stroke="#f4f6fa" stroke-width="4" stroke-dasharray="16 14"/>
    <path d="M1148 320 C1100 450 1052 600 1000 725" fill="none" stroke="#b9c0cc" stroke-width="22"/>
    <path d="M1148 320 C1100 450 1052 600 1000 725" fill="none" stroke="#ffffff" stroke-width="14"/>
    <path d="M0 8 C120 32 220 58 330 46 C430 38 520 25 620 20" fill="none" stroke="#b9c0cc" stroke-width="17" stroke-linecap="round"/>
    <path d="M0 8 C120 32 220 58 330 46 C430 38 520 25 620 20" fill="none" stroke="#ffffff" stroke-width="11" stroke-linecap="round"/>
    <circle cx="255" cy="115" r="20" fill="#f4f6fa" stroke="#b9c0cc" stroke-width="3"/>
    <!-- Caminos del campus -->
    <path d="M330 190 C360 250 400 310 430 400 C440 450 445 505 450 565" fill="none" stroke="#fffdf6" stroke-width="8" stroke-linecap="round"/>
    <path d="M250 135 L340 215" fill="none" stroke="#fffdf6" stroke-width="7" stroke-linecap="round"/>
    <path d="M440 330 L560 340 L640 330" fill="none" stroke="#fffdf6" stroke-width="6" stroke-linecap="round"/>
    <path d="M455 565 C520 580 600 590 700 592" fill="none" stroke="#fffdf6" stroke-width="7" stroke-linecap="round"/>
    <path d="M455 580 C470 640 520 700 575 715" fill="none" stroke="#fffdf6" stroke-width="6" stroke-linecap="round"/>
    <path d="M470 740 L760 800 L760 900" fill="none" stroke="#fffdf6" stroke-width="6" stroke-linecap="round"/>

    <!-- Parqueadero -->
    <path d="M655 565 L820 570 L830 685 L665 690Z" fill="#d6dae3" stroke="#b9c0cc" stroke-width="2"/>
    <path d="M680 580 L690 680 M705 580 L715 680 M730 580 L740 680 M755 580 L765 680 M780 580 L790 680 M805 585 L812 680" stroke="#f4f6fa" stroke-width="3"/>
    <path d="M520 870 L585 870 L585 980 L520 980Z" fill="#e4e7ee" stroke="#c6ccd8" stroke-width="2"/>

    <!-- Edificios -->
    <g fill="#d9c4ac" stroke="#b9a38b" stroke-width="2" stroke-linejoin="round">
      <path d="M300 170 L350 125 L395 135 L340 197Z"/>
      <path d="M480 100 L600 135 L590 162 L470 127Z"/>
      <path d="M190 420 L330 365 L345 388 L205 442Z"/>
      <path d="M230 335 L320 320 L330 352 L240 362Z"/>
      <path d="M420 235 L482 225 L482 292 L425 292Z"/>
      <path d="M560 330 L682 250 L692 312 L602 382Z"/>
      <path d="M592 372 L695 362 L682 452 L612 442Z"/>
      <path d="M448 435 L496 435 L496 478 L448 478Z"/>
      <path d="M425 500 L476 500 L476 548 L425 548Z"/>
      <path d="M330 652 L420 625 L432 657 L346 692Z"/>
      <path d="M690 880 L742 890 L802 960 L812 1022 L752 1032 L702 962Z"/>
      <path d="M640 962 L692 952 L702 1002 L652 1012Z"/>
      <path d="M1066 722 L1122 702 L1132 822 L1086 836Z" fill="#cfd5e2" stroke="#aeb7c8"/>
    </g>

    <!-- Nombres -->
    <g font-size="15">
      <text x="300" y="104" ${ETQ}>Ad Portas · Café de la Bolsa</text>
      <text x="85" y="310" ${ETQ}>Facultad de Ingeniería</text>
      <text x="425" y="214" ${ETQ}>Universidad de La Sabana</text>
      <text x="438" y="738" ${ETQ}>INALDE Business School</text>
      <text x="722" y="676" ${ETQ}>Parqueadero</text>
      <text x="610" y="1050" ${ETQ}>Clínica Universidad de La Sabana</text>
      <text x="1040" y="858" ${ETQ}>Hotel · GHT</text>
      <text x="268" y="560" ${AGUA} transform="rotate(-62 268 560)" font-size="17">Río Bogotá</text>
      <text x="822" y="640" ${AGUA} transform="rotate(30 822 640)" font-size="14">Quebrada Honda</text>
      <text x="272" y="858" ${ETQ} transform="rotate(41 272 858)" font-size="16">Vía Chía</text>
      <text x="1060" y="300" ${ETQ} transform="rotate(80 1060 300)" font-size="15">Autopista Norte (45A)</text>
    </g>

    <!-- Rosa de los vientos -->
    <g transform="translate(70 975)">
      <circle r="30" fill="#ffffff" stroke="#c9d3e6" stroke-width="2"/>
      <path d="M0 -22 L8 6 L0 0 L-8 6Z" fill="#9c080c"/>
      <path d="M0 22 L8 -6 L0 0 L-8 -6Z" fill="#043470"/>
      <text y="-34" text-anchor="middle" font-size="15" font-weight="800" fill="#043470">N</text>
    </g>`;
  }

  function pin(p) {
    const color = p.activo ? "#9c080c" : "#043470";
    return `<g class="pin${p.activo ? " central" : ""}" data-id="${p.id}" transform="translate(${p.x} ${p.y})" tabindex="0" role="button" aria-label="${p.n}. ${p.nombre}">
      ${p.activo ? '<circle class="pulso" cy="-40" r="24" fill="#9c080c" opacity=".35"/>' : ""}
      <g class="cuerpo-g">
        <path class="cuerpo" d="M0 0 C-6 -12 -22 -24 -22 -40 a22 22 0 0 1 44 0 C22 -24 6 -12 0 0Z" fill="${color}" stroke="#ffffff" stroke-width="3"/>
        <circle cy="-40" r="12" fill="#ffffff"/>
        <text y="-34.5" text-anchor="middle" font-size="15" font-weight="800" fill="${color}">${p.n}</text>
      </g>
      <text x="30" y="-34" font-size="17" font-weight="700" fill="#ffffff" stroke="#ffffff" stroke-width="6" stroke-linejoin="round">${p.corto}</text>
      <text x="30" y="-34" font-size="17" font-weight="700" fill="#14203a">${p.corto}</text>
    </g>`;
  }

  function svg() {
    return `<svg class="campus-svg" viewBox="0 0 ${ANCHO} ${ALTO}" role="group" aria-label="Mapa esquemático del campus con seis puntos de préstamo" xmlns="http://www.w3.org/2000/svg" font-family="Poppins, 'Segoe UI', Arial, sans-serif">
      <rect width="${ANCHO}" height="${ALTO}" fill="#e7eedf"/>
      <image class="foto" href="assets/campus.jpg" x="0" y="0" width="${ANCHO}" height="${ALTO}" preserveAspectRatio="xMidYMid slice" display="none"/>
      <g class="vector">${vector()}</g>
      <g class="pines">${PUNTOS.map(pin).join("")}</g>
    </svg>`;
  }

  return { PUNTOS, svg, ANCHO, ALTO };
})();

/* BiciSabana · Panel principal.
   Todo texto que viene del usuario se inserta con textContent; innerHTML solo se usa para iconos SVG estáticos. */
(() => {
  const sesion = Auth.exigirSesion();       // sin sesión vuelve al login
  if (!sesion) return;
  const esAdmin = sesion.rol === "Administrador";
  const primerNombre = sesion.nombre.split(" ")[0];

  // ---------- Utilidades de DOM ----------
  function h(tag, attrs, ...hijos) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, "");
      else if (v !== false && v != null) el.setAttribute(k, v);
    }
    for (const hijo of hijos.flat()) if (hijo != null) el.append(hijo.nodeType ? hijo : document.createTextNode(hijo));
    return el;
  }

  // Iconos SVG estáticos (sin datos del usuario)
  const ICONOS = {
    inicio: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    bicis: '<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l4-8h6l2 8M10 8l2 8M9 5h3"/>',
    prestar: '<path d="M12 5v14M5 12h14"/>',
    devolver: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    mapa: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    totales: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'
  };
  function icono(nombre) {
    const s = h("span", { class: "ico", "aria-hidden": "true" });
    s.innerHTML = `<svg viewBox="0 0 24 24">${ICONOS[nombre] || ""}</svg>`;
    return s;
  }
  function dibujoBici(clase) {
    const s = h("span", { class: clase || "", "aria-hidden": "true" });
    s.innerHTML = '<svg viewBox="0 0 64 44" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="31" r="9"/><circle cx="52" cy="31" r="9"/><path d="M12 31h16l-6-17-10 17M22 14h24L28 31M46 14l6 17M46 14l-2-6h6M17 10h9"/></svg>';
    return s;
  }
  const COLORES = { Rojo: "#c62828", Azul: "#1565c0", Verde: "#2e7d32", Negro: "#212121", Blanco: "#fafafa", Gris: "#9e9e9e" };

  const mensaje = () => h("div", { class: "msg", role: "status", "aria-live": "polite" });
  function poner(el, r) { el.className = "msg " + r.tipo; el.textContent = r.texto; }
  function toast(r) {
    const cont = document.getElementById("toasts");
    const t = h("div", { class: "toast " + r.tipo }, r.texto);
    cont.append(t);
    while (cont.children.length > 3) cont.firstChild.remove();
    setTimeout(() => t.remove(), 4200);
  }

  // ---------- Estado de la interfaz ----------
  let actual = "inicio";
  let filtro = "todas";
  let textoBusqueda = "";
  let precarga = "";   // código de bicicleta sugerido al ir a "Prestar"

  // ---------- Acciones rápidas ----------
  function accionPrestar(codigo) {
    if (esAdmin) { precarga = codigo; renderizar("prestar"); return; }
    const r = Datos.prestar(codigo, { codigo: sesion.codigo, nombre: sesion.nombre });
    toast(r); renderizar(actual);
  }
  function accionDevolver(codigo) {
    toast(Datos.devolver(codigo, sesion)); renderizar(actual);
  }
  const puedeDevolver = (b) => !b.disponible && (esAdmin || b.prestadaA === sesion.codigo);

  function tarjetaBici(b) {
    const acciones = h("div", { class: "pie-tarjeta" });
    if (b.disponible) acciones.append(h("button", { class: "btn mini", type: "button", onclick: () => accionPrestar(b.codigo) }, "Prestar"));
    else if (puedeDevolver(b)) acciones.append(h("button", { class: "btn mini rojo", type: "button", onclick: () => accionDevolver(b.codigo) }, "Devolver"));
    return h("article", { class: "bici " + (b.disponible ? "d" : "p"), "aria-label": `Bicicleta ${b.codigo}` },
      !b.disponible && b.prestadaA === sesion.codigo ? h("span", { class: "etiqueta-tuya" }, "Tuya") : null,
      dibujoBici("dibujo"),
      h("div", { class: "codigo" }, b.codigo),
      h("div", { class: "color" }, h("span", { class: "punto", style: `background:${COLORES[b.color] || "#9e9e9e"}` }), b.color),
      h("span", { class: "insignia " + (b.disponible ? "d" : "p") }, b.disponible ? "Disponible" : "Prestada"),
      acciones);
  }

  function chipsSugeridos(lista, alElegir) {
    return h("div", { class: "sugeridas" }, lista.map(b => h("button", { type: "button", class: "sugerida", onclick: () => alElegir(b.codigo) }, b.codigo)));
  }

  // ---------- Vistas ----------
  const vistas = {
    inicio() {
      const t = Datos.totales();
      const mias = Datos.bicis().filter(b => esAdmin ? !b.disponible : b.prestadaA === sesion.codigo && !b.disponible);
      const stat = (cls, ic, num, et, extra) => h("div", { class: "stat " + cls }, h("div", { class: "ico-caja" }, icono(ic)),
        h("div", { style: "flex:1" }, h("div", { class: "num" }, String(num)), h("div", { class: "et" }, et), extra));
      const accion = (vista, ic, titulo, desc) => h("button", { class: "accion", type: "button", onclick: () => renderizar(vista) },
        h("div", { class: "ico-caja" }, icono(ic)), h("strong", {}, titulo), h("span", { class: "d" }, desc));

      const lista = h("div", { class: "tarjeta" }, h("h2", { class: "titulo" }, icono("reloj"), esAdmin ? "Bicicletas prestadas ahora" : "Mis préstamos"),
        mias.length === 0
          ? h("p", { class: "vacio" }, esAdmin ? "No hay bicicletas prestadas en este momento." : "No tienes bicicletas prestadas. ¡Anímate a pedalear!")
          : h("div", { class: "rejilla" }, mias.map(tarjetaBici)));

      return h("div", { class: "vista-anim" },
        h("section", { class: "bienvenida" }, h("h2", {}, `¡Hola, ${primerNombre}!`),
          h("p", {}, esAdmin ? "Panel de administración de la estación BiciSabana." : "¿Listo para pedalear por el campus? Elige una opción.")),
        h("div", { class: "stats" },
          stat("", "check", t.disponibles, "Bicicletas disponibles"),
          stat("rojo", "reloj", t.prestadas, "Bicicletas prestadas"),
          stat("oro", "bicis", `${t.porcentaje.toFixed(0)} %`, "Ocupación de la estación",
            h("div", { class: "barra", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(Math.round(t.porcentaje)) },
              h("i", { style: `width:${t.porcentaje}%` })))),
        h("div", { class: "acciones" },
          accion("prestar", "prestar", "Prestar", "Pide una bicicleta disponible"),
          accion("devolver", "devolver", "Devolver", "Registra la devolución"),
          accion("bicicletas", "buscar", "Ver y buscar", "Explora y filtra las bicicletas"),
          accion("campus", "pin", "Puntos de préstamo", "Encuentra dónde pedir una bicicleta"),
          accion("mapa", "mapa", "Estación", "Mira los puestos 3 × 10"),
          esAdmin ? accion("totales", "totales", "Totales", "Cifras e intentos rechazados") : null),
        lista);
    },

    bicicletas() {  // RF-01, RF-02, RF-06, RF-07
      const rejilla = h("div", { class: "rejilla" });
      const aviso = h("div");
      const cuenta = h("p", { class: "ayuda", "aria-live": "polite" });
      const buscador = h("input", { id: "bus", type: "search", autocomplete: "off", maxlength: "4", placeholder: "Buscar por código (ej.: B03)", "aria-label": "Buscar bicicleta por código" });
      buscador.value = textoBusqueda;

      const botones = [["todas", "Todas"], ["disponibles", "Disponibles"], ["prestadas", "Prestadas"]].map(([clave, texto]) =>
        h("button", { type: "button", class: "filtro", "aria-pressed": String(filtro === clave), onclick: () => { filtro = clave; pintar(); } }, texto));

      function pintar() {
        botones.forEach((b, i) => b.setAttribute("aria-pressed", String(["todas", "disponibles", "prestadas"][i] === filtro)));
        rejilla.replaceChildren(); aviso.replaceChildren();
        const todas = Datos.bicis();
        const t = Datos.normalizar(buscador.value);
        let lista = todas.filter(b => filtro === "todas" || (filtro === "disponibles" ? b.disponible : !b.disponible));
        if (t) lista = lista.filter(b => b.codigo.includes(t));
        cuenta.textContent = `${lista.length} de ${todas.length} bicicletas`;
        if (lista.length === 0) {
          const m = mensaje();
          const existe = t && todas.some(b => b.codigo.includes(t));
          poner(m, t
            ? (existe ? { tipo: "aviso", texto: `La bicicleta ${t} existe, pero no coincide con el filtro seleccionado.` }
                      : { tipo: "aviso", texto: `No existe una bicicleta con el código ${t}` })
            : { tipo: "aviso", texto: "No hay bicicletas con este filtro por ahora." });
          aviso.append(m); return;
        }
        lista.forEach(b => rejilla.append(tarjetaBici(b)));
      }
      buscador.addEventListener("input", () => { textoBusqueda = buscador.value; pintar(); });
      pintar();

      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("bicis"), "Bicicletas"),
        h("p", { class: "subtitulo" }, "Busca por código o filtra por estado."),
        h("div", { class: "herramientas" }, h("div", { class: "buscador con-icono" }, icono("buscar"), buscador), h("div", { class: "filtros", role: "group", "aria-label": "Filtrar por estado" }, botones)),
        cuenta, aviso, rejilla);
    },

    prestar() {     // RF-03, RF-04, RF-08, RNF-02
      const msg = mensaje();
      const nombre = h("input", { id: "nombre", type: "text", autocomplete: "off", value: esAdmin ? "" : sesion.nombre, readonly: !esAdmin });
      const codEst = h("input", { id: "cod-est", type: "text", inputmode: "numeric", maxlength: "6", autocomplete: "off", value: esAdmin ? "" : sesion.codigo, readonly: !esAdmin, "aria-describedby": "ay-est" });
      const codBici = h("input", { id: "cod-bici", type: "text", autocomplete: "off", placeholder: "Ej.: B05", maxlength: "4" });
      codBici.value = precarga; precarga = "";
      const libres = Datos.bicis().filter(b => b.disponible).slice(0, 8);
      const form = h("form", { novalidate: true, onsubmit: (e) => {
        e.preventDefault();
        const nom = nombre.value.trim();
        const est = codEst.value.trim();
        if (esAdmin && nom === "") return poner(msg, { tipo: "error", texto: "Escribe el nombre del estudiante." });
        if (!Auth.codigoValido(est)) {          // solo si el código es válido se continúa
          Datos.sumarRechazado();
          return poner(msg, { tipo: "error", texto: "Código de estudiante inválido. No se puede prestar. Debe tener 6 números." });
        }
        if (codBici.value.trim() === "") return poner(msg, { tipo: "error", texto: "Escribe el código de la bicicleta." });
        const r = Datos.prestar(codBici.value, { codigo: est, nombre: nom || sesion.nombre });
        poner(msg, r); toast(r);
        if (r.tipo === "ok") { codBici.value = ""; renderizar("prestar", null, r); } else codBici.focus();
      }},
        h("div", { class: "campo" }, h("label", { for: "nombre" }, "Nombre del estudiante"), nombre),
        h("div", { class: "campo" }, h("label", { for: "cod-est" }, "Código del estudiante (6 números)"), codEst,
          h("p", { class: "ayuda", id: "ay-est" }, esAdmin ? "Si el código no es válido, el intento se cuenta como rechazado." : "Tus datos vienen de tu sesión.")),
        h("div", { class: "campo" }, h("label", { for: "cod-bici" }, "Código de la bicicleta"), codBici,
          libres.length ? h("p", { class: "ayuda" }, "Disponibles ahora (toca para elegir):") : h("p", { class: "ayuda" }, "No hay bicicletas disponibles por ahora."),
          chipsSugeridos(libres, (c) => { codBici.value = c; codBici.focus(); })),
        h("button", { class: "btn", type: "submit" }, icono("prestar"), "Prestar bicicleta"));
      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("prestar"), "Prestar una bicicleta"),
        h("p", { class: "subtitulo" }, "Completa los datos y la bicicleta queda a nombre del estudiante."),
        h("div", { class: "dos-col" }, h("div", { class: "tarjeta" }, form, msg),
          h("aside", { class: "lateral" }, h("h3", {}, "Reglas del préstamo"),
            h("ul", {}, h("li", {}, "El código de estudiante tiene exactamente 6 números."), h("li", {}, "Una bicicleta prestada no se puede prestar de nuevo."),
              h("li", {}, "Los intentos con código inválido quedan registrados."), h("li", {}, "Escribe el código de la bicicleta como B05 o b05.")))));
    },

    devolver() {    // RF-05
      const msg = mensaje();
      const cod = h("input", { id: "dev", type: "text", autocomplete: "off", placeholder: "Ej.: B30", maxlength: "4" });
      const mias = Datos.bicis().filter(puedeDevolver);
      const form = h("form", { novalidate: true, onsubmit: (e) => {
        e.preventDefault();
        if (cod.value.trim() === "") return poner(msg, { tipo: "error", texto: "Escribe el código de la bicicleta." });
        const r = Datos.devolver(cod.value, sesion);
        poner(msg, r); toast(r);
        if (r.tipo === "ok") { cod.value = ""; renderizar("devolver", null, r); } else cod.focus();
      }},
        h("div", { class: "campo" }, h("label", { for: "dev" }, "Código de la bicicleta a devolver"), cod,
          h("p", { class: "ayuda" }, esAdmin ? "Como administrador puedes registrar cualquier devolución." : "Solo puedes devolver las bicicletas prestadas a tu cuenta."),
          mias.length ? h("p", { class: "ayuda" }, esAdmin ? "Prestadas ahora (toca para elegir):" : "Tus bicicletas (toca para elegir):") : h("p", { class: "ayuda" }, "No hay bicicletas para devolver por ahora."),
          chipsSugeridos(mias, (c) => { cod.value = c; cod.focus(); })),
        h("button", { class: "btn rojo", type: "submit" }, icono("devolver"), "Devolver bicicleta"));
      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("devolver"), "Devolver una bicicleta"),
        h("p", { class: "subtitulo" }, "Registra la devolución para dejarla disponible."),
        h("div", { class: "dos-col" }, h("div", { class: "tarjeta" }, form, msg),
          h("aside", { class: "lateral" }, h("h3", {}, "Antes de devolver"),
            h("ul", {}, h("li", {}, "Deja la bicicleta en su puesto de la estación."), h("li", {}, "Si no estaba prestada, te avisaremos sin cambiar nada."), h("li", {}, "Si el código no existe, revisa el mapa de la estación.")))));
    },

    mapa() {        // RF-10: 3 filas × 10 puestos
      const celdas = Datos.bicis().map(b => {
        const c = h("div", { class: "puesto " + (b.disponible ? "d" : "p"), role: "img", title: `${b.codigo}: ${b.disponible ? "disponible" : "prestada"}`,
          "aria-label": `${b.codigo}: ${b.disponible ? "disponible" : "prestada"}` });
        const d = dibujoBici(""); c.append(d, b.codigo, h("small", {}, b.disponible ? "D" : "P"));
        return c;
      });
      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("mapa"), "Mapa de la estación"),
        h("p", { class: "subtitulo" }, `${Datos.FILAS} filas × ${Datos.PUESTOS} puestos`),
        h("div", { class: "tarjeta" }, h("div", { class: "estacion" }, h("div", { class: "mapa" }, celdas)),
          h("div", { class: "leyenda" }, h("span", {}, h("span", { class: "insignia d" }, "D · Disponible")), h("span", {}, h("span", { class: "insignia p" }, "P · Prestada")))));
    },

    campus() {      // Mapa del campus con los puntos de préstamo (ubicaciones ilustrativas)
      const caja = h("div", { class: "mapa-campus" });
      caja.innerHTML = Campus.svg();   // SVG armado solo con constantes de campus.js
      const panel = h("aside", { class: "panel-punto", "aria-live": "polite" });
      const lista = h("div", { class: "lista-puntos", role: "group", "aria-label": "Lista de puntos de préstamo" });
      const botonesLista = Campus.PUNTOS.map(p => h("button", { type: "button", class: "item-punto", "data-id": p.id, onclick: () => seleccionar(p.id) },
        h("span", { class: "num" + (p.activo ? " central" : "") }, String(p.n)), p.nombre));
      lista.append(...botonesLista);
      const satelite = h("button", { type: "button", class: "btn sec mini btn-sat", hidden: true, "aria-pressed": "false" }, "Vista satélite");
      let sel = "central";

      function pintarPanel() {
        const p = Campus.PUNTOS.find(x => x.id === sel);
        panel.replaceChildren(h("span", { class: "etiqueta-estado " + (p.activo ? "activo" : "ilustrativo") }, p.activo ? "Con bicicletas en este prototipo" : "Punto ilustrativo"),
          h("h3", {}, `${p.n}. ${p.nombre}`), h("p", {}, p.cerca));
        if (p.activo) {
          const t = Datos.totales();
          panel.append(h("div", { class: "stat", style: "box-shadow:none;padding:.6rem 0" }, h("div", { class: "ico-caja" }, icono("check")),
            h("div", { style: "flex:1" }, h("div", { class: "num" }, `${t.disponibles} de ${t.total}`), h("div", { class: "et" }, "bicicletas disponibles ahora"),
              h("div", { class: "barra", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(Math.round(t.porcentaje)) }, h("i", { style: `width:${t.porcentaje}%` })))),
            h("div", { class: "pie-tarjeta" }, h("button", { class: "btn mini", type: "button", onclick: () => renderizar("bicicletas") }, "Ver bicicletas"),
              h("button", { class: "btn mini sec", type: "button", onclick: () => renderizar("mapa") }, "Ver estación 3 × 10")));
        } else {
          panel.append(h("p", { class: "ayuda" }, "Ubicación de ejemplo para el mockup: en el sistema real aquí verías las bicicletas disponibles de este punto."),
            h("div", { class: "pie-tarjeta" }, h("button", { class: "btn mini sec", type: "button", onclick: () => seleccionar("central") }, "Ir a la Estación Central")));
        }
      }
      function seleccionar(id) {
        sel = id;
        caja.querySelectorAll(".pin").forEach(g => g.classList.toggle("sel", g.dataset.id === id));
        botonesLista.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
        pintarPanel();
      }
      caja.addEventListener("click", (e) => { const g = e.target.closest(".pin"); if (g) seleccionar(g.dataset.id); });
      caja.addEventListener("keydown", (e) => {
        const g = e.target.closest && e.target.closest(".pin");
        if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); seleccionar(g.dataset.id); }
      });

      // Capa satélite opcional: solo aparece si existe assets/campus.jpg (la captura original del campus)
      const prueba = new Image();
      prueba.onload = () => { satelite.hidden = false; };
      prueba.src = "assets/campus.jpg";
      satelite.addEventListener("click", () => {
        const on = caja.classList.toggle("sat");
        satelite.setAttribute("aria-pressed", String(on));
        satelite.textContent = on ? "Vista esquemática" : "Vista satélite";
      });

      seleccionar("central");
      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("pin"), "Puntos de préstamo"),
        h("p", { class: "subtitulo" }, "Toca un punto del mapa o de la lista para ver sus detalles."),
        h("div", { class: "campus-grid" },
          h("div", {}, h("div", { class: "tarjeta", style: "padding:.8rem" }, caja,
            h("div", { class: "leyenda" }, h("span", {}, h("span", { class: "leyenda-pin central" }), "Estación con bicicletas"), h("span", {}, h("span", { class: "leyenda-pin" }), "Punto ilustrativo"), satelite),
            h("p", { class: "ayuda" }, "Mapa esquemático del campus dibujado a partir de una captura de Apple Maps. Las ubicaciones son ilustrativas.")),
            lista),
          panel));
    },

    totales() {     // RF-09 (solo administrador)
      const t = Datos.totales();
      const msg = mensaje();
      const C = 2 * Math.PI * 60;
      const anillo = h("div", { class: "anillo" });
      anillo.innerHTML = `<svg class="anillo" viewBox="0 0 150 150" role="img" aria-label="${t.porcentaje.toFixed(1)} por ciento de bicicletas prestadas">` +
        '<defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d0a00c"/><stop offset="1" stop-color="#9c080c"/></linearGradient></defs>' +
        '<circle class="fondo" cx="75" cy="75" r="60" fill="none" stroke-width="16"/>' +
        `<circle class="valor" cx="75" cy="75" r="60" fill="none" stroke-width="16" stroke-linecap="round" transform="rotate(-90 75 75)" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - t.porcentaje / 100)).toFixed(2)}"/>` +
        `<text x="75" y="82">${t.porcentaje.toFixed(1)} %</text></svg>`;
      const stat = (cls, ic, num, et) => h("div", { class: "stat " + cls }, h("div", { class: "ico-caja" }, icono(ic)), h("div", {}, h("div", { class: "num" }, String(num)), h("div", { class: "et" }, et)));
      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("totales"), "Totales de la estación"),
        h("p", { class: "subtitulo" }, "Resumen para la administración."),
        h("div", { class: "tarjeta anillo-caja" }, anillo, h("div", { style: "flex:1;min-width:220px" }, h("strong", { style: "color:var(--azul);font-size:1.1rem" }, "Porcentaje prestado"),
          h("p", { class: "ayuda" }, `${t.prestadas} de ${t.total} bicicletas están prestadas.`))),
        h("div", { class: "stats" }, stat("", "check", t.disponibles, "Disponibles"), stat("rojo", "reloj", t.prestadas, "Prestadas"), stat("", "bicis", t.total, "Total"),
          stat("oro", "alerta", t.rechazados, "Intentos rechazados")),
        h("div", { class: "tarjeta" }, h("p", { class: "ayuda" }, "Los intentos rechazados suman cada vez que se escribe un código de estudiante inválido."),
          h("button", { class: "btn sec", type: "button", onclick: () => { Datos.reiniciar(); renderizar("totales"); toast({ tipo: "ok", texto: "Datos de demostración reiniciados." }); } }, "Reiniciar datos de demostración"), msg));
    }
  };

  const ETIQUETAS = { inicio: ["Inicio", "inicio"], bicicletas: ["Bicicletas", "bicis"], prestar: ["Prestar", "prestar"], devolver: ["Devolver", "devolver"], mapa: ["Estación", "mapa"], campus: ["Campus", "pin"], totales: ["Totales", "totales"] };
  const PERMITIDAS = esAdmin ? Object.keys(ETIQUETAS) : Object.keys(ETIQUETAS).filter(k => k !== "totales");
  const ALIAS = { disponibles: "bicicletas", buscar: "bicicletas" };   // enlaces de la versión anterior

  // ---------- Navegación (hash simple #nombre) ----------
  const vista = document.getElementById("vista");
  const menu = document.getElementById("menu");

  function renderizar(nombre, aviso, mensajeTrasAccion) {
    let destino = ALIAS[nombre] || nombre;
    // Al entrar a Bicicletas desde otra pestaña se reinician filtro y búsqueda (se conservan al prestar/devolver desde las tarjetas)
    if (destino === "bicicletas" && actual !== "bicicletas") { filtro = "todas"; textoBusqueda = ""; }
    if (nombre === "disponibles") filtro = "disponibles";
    let nota = null;
    if (!PERMITIDAS.includes(destino)) {
      nota = destino === "totales" ? "Los totales son solo para administración. Te llevamos al inicio." : null;
      destino = "inicio";
    }
    actual = destino;
    menu.querySelectorAll("button").forEach(b => b.removeAttribute("aria-current"));
    const activo = menu.querySelector(`[data-vista="${destino}"]`);
    if (activo) activo.setAttribute("aria-current", "page");
    vista.replaceChildren();
    if (nota || aviso) { const m = mensaje(); poner(m, { tipo: "aviso", texto: nota || aviso }); vista.append(m); }
    try {
      vista.append(vistas[destino]());
      if (mensajeTrasAccion) {   // conserva el mensaje en pantalla tras una acción exitosa
        const cont = vista.querySelector(".msg[role=status]");
        if (cont) poner(cont, mensajeTrasAccion);
      }
    } catch (err) {
      const m = mensaje(); poner(m, { tipo: "error", texto: "No pudimos mostrar esta pantalla. Intenta con otra opción del menú." }); vista.append(m);
    }
    if (location.hash !== "#" + destino) history.replaceState(null, "", "#" + destino);
    window.scrollTo({ top: 0 });
  }

  PERMITIDAS.forEach(k => menu.append(h("button", { type: "button", "data-vista": k, onclick: () => renderizar(k) }, icono(ETIQUETAS[k][1]), ETIQUETAS[k][0])));
  document.getElementById("chip-usuario").replaceChildren(icono("usuario"), h("span", { class: "nom" }, sesion.nombre), h("b", {}, sesion.rol));
  document.getElementById("salir").addEventListener("click", () => Auth.cerrarSesion("salida"));

  window.addEventListener("hashchange", () => {
    const n = location.hash.slice(1);
    if (n === actual) return;
    const valido = vistas[n] || ALIAS[n];
    renderizar(valido ? n : "inicio", valido ? null : "Esa opción no existe. Elige una del menú.");
  });
  const inicial = location.hash.slice(1);
  renderizar(vistas[inicial] || ALIAS[inicial] ? inicial : "inicio");
})();

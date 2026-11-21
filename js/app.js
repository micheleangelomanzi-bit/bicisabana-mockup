/* BiciSabana · Panel principal.
   Todo texto que viene del usuario se inserta con textContent; innerHTML solo se usa para iconos SVG estáticos.
   Requerimientos propios: RP-01 modo oscuro · RP-02 reservas · RP-03 tiempo en vivo · RP-04 historial ·
   RP-05 huella verde · RP-06 daños y mantenimiento · RP-07 favoritas · RP-08 logros · RP-09 calificación · RP-10 CSV. */
(() => {
  const sesion = Auth.exigirSesion();       // sin sesión vuelve al login
  if (!sesion) return;
  const esAdmin = sesion.rol === "Administrador";
  const primerNombre = sesion.nombre.split(" ")[0];
  const yo = { codigo: sesion.codigo, nombre: sesion.nombre };

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
  const num = (n, dec) => Number(n).toLocaleString("es-CO", { maximumFractionDigits: dec || 0, minimumFractionDigits: dec || 0 });
  const fecha = (ms) => new Date(ms).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

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
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    historial: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    hoja: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19c3-4 6-6 10-8"/>',
    medalla: '<circle cx="12" cy="15" r="6"/><path d="M8 3h8l-2 6h-4z"/><path d="M12 12.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z"/>',
    llave: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    descarga: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    estrella: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    luna: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
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
  const ESTADOS = { disponible: ["d", "Disponible", "D"], reservada: ["r", "Reservada", "R"], prestada: ["p", "Prestada", "P"], mantenimiento: ["m", "Mantenimiento", "M"] };

  const mensaje = () => h("div", { class: "msg", role: "status", "aria-live": "polite" });
  function poner(el, r) { el.className = "msg " + r.tipo; el.textContent = r.texto; }
  function toast(r) {
    const cont = document.getElementById("toasts");
    const t = h("div", { class: "toast " + r.tipo }, r.texto);
    cont.append(t);
    while (cont.children.length > 3) cont.firstChild.remove();
    setTimeout(() => t.remove(), 4800);
  }

  // ---------- RP-07: favoritas por usuario ----------
  const LLAVE_FAV = "bs_fav_" + sesion.codigo;
  let favoritas = new Set();
  try { const v = JSON.parse(localStorage.getItem(LLAVE_FAV)); if (Array.isArray(v)) favoritas = new Set(v); } catch (e) { /* sin almacenamiento */ }
  function alternarFavorita(codigo) {
    if (favoritas.has(codigo)) favoritas.delete(codigo); else favoritas.add(codigo);
    try { localStorage.setItem(LLAVE_FAV, JSON.stringify([...favoritas])); } catch (e) { /* se mantiene en memoria */ }
  }

  // ---------- Estado de la interfaz ----------
  let actual = "inicio";
  let filtro = "todas";
  let textoBusqueda = "";
  let precarga = "";   // código de bicicleta sugerido al ir a "Prestar"

  // ---------- RP-08: avisar logros nuevos ----------
  function conLogros(accion) {
    if (esAdmin) return accion();
    const antes = new Set(Datos.logros(sesion.codigo).filter(l => l.obtenido).map(l => l.id));
    const r = accion();
    Datos.logros(sesion.codigo).filter(l => l.obtenido && !antes.has(l.id))
      .forEach((l, i) => setTimeout(() => toast({ tipo: "ok", texto: `🏅 ¡Logro desbloqueado: ${l.nombre}!` }), 500 + i * 400));
    return r;
  }

  // ---------- Acciones rápidas ----------
  function accionPrestar(codigo) {
    if (esAdmin) { precarga = codigo; renderizar("prestar"); return; }
    toast(Datos.prestar(codigo, yo)); renderizar(actual);
  }
  function accionDevolver(codigo) { toast(conLogros(() => Datos.devolver(codigo, sesion))); renderizar(actual); }
  function accionReservar(codigo) { toast(Datos.reservar(codigo, yo)); renderizar(actual); }
  function accionCancelar(codigo) { toast(Datos.cancelarReserva(codigo, sesion)); renderizar(actual); }
  function accionReparar(codigo) { toast(Datos.reparar(codigo)); renderizar(actual); }
  const puedeDevolver = (b) => !b.disponible && (esAdmin || b.prestadaA === sesion.codigo);
  const esMiReserva = (b) => Datos.estado(b) === "reservada" && b.reservadaA === sesion.codigo;

  // RP-03 / RP-02: textos de tiempo que se actualizan solos
  function textoTiempo(b) {
    const m = Datos.minutosPrestada(b);
    return Datos.vencida(b) ? `Vencida · lleva ${Datos.duracion(m)}` : `Lleva ${Datos.duracion(m)} · quedan ${Datos.duracion(Datos.LIMITE_MIN - m)}`;
  }
  const textoReserva = (b) => Datos.minutosReserva(b) > 0 ? `Quedan ${Datos.minutosReserva(b)} min de reserva` : "La reserva venció";
  function etiquetaTiempo(b) {
    const e = Datos.estado(b);
    if (e === "prestada") return h("div", { class: "tiempo" + (Datos.vencida(b) ? " vencida" : ""), "data-bici": b.codigo, "data-tipo": "prestamo" }, icono("reloj"), textoTiempo(b));
    if (e === "reservada" && (esMiReserva(b) || esAdmin)) return h("div", { class: "tiempo reserva", "data-bici": b.codigo, "data-tipo": "reserva" }, icono("reloj"), textoReserva(b));
    if (e === "mantenimiento") return h("div", { class: "tiempo mant" }, icono("llave"), `Daño: ${b.mantenimiento.tipo}`);
    return null;
  }

  function tarjetaBici(b) {
    const e = Datos.estado(b);
    const [clase, texto] = ESTADOS[e];
    const acciones = h("div", { class: "pie-tarjeta" });
    const boton = (cls, txt, fn) => h("button", { class: "btn mini " + cls, type: "button", onclick: () => fn(b.codigo) }, txt);
    if (e === "disponible") {
      acciones.append(boton("", "Prestar", accionPrestar));
      if (!esAdmin) acciones.append(boton("sec", "Reservar", accionReservar));
    } else if (e === "reservada") {
      if (esMiReserva(b)) acciones.append(boton("", "Retirar", accionPrestar), boton("sec", "Cancelar", accionCancelar));
      else if (esAdmin) acciones.append(boton("sec", "Cancelar reserva", accionCancelar));
    } else if (e === "prestada" && puedeDevolver(b)) acciones.append(boton("rojo", "Devolver", accionDevolver));
    else if (e === "mantenimiento" && esAdmin) acciones.append(boton("oro", "Marcar reparada", accionReparar));

    const fav = h("button", { type: "button", class: "fav", "aria-pressed": String(favoritas.has(b.codigo)),
      "aria-label": `Marcar ${b.codigo} como favorita`, title: "Favorita", onclick: () => {
        alternarFavorita(b.codigo);
        fav.setAttribute("aria-pressed", String(favoritas.has(b.codigo)));
        if (actual === "bicicletas" && filtro === "favoritas") renderizar("bicicletas");
      } }, icono("estrella"));
    const tuya = (!b.disponible && b.prestadaA === sesion.codigo) || esMiReserva(b);
    return h("article", { class: "bici " + clase + (Datos.vencida(b) ? " vencida" : ""), "aria-label": `Bicicleta ${b.codigo}: ${texto}` },
      fav, tuya ? h("span", { class: "etiqueta-tuya" }, "Tuya") : null,
      dibujoBici("dibujo"),
      h("div", { class: "codigo" }, b.codigo),
      h("div", { class: "color" }, h("span", { class: "punto", style: `background:${COLORES[b.color] || "#9e9e9e"}` }), b.color),
      h("span", { class: "insignia " + clase }, texto),
      etiquetaTiempo(b),
      esAdmin && !b.disponible ? h("div", { class: "ayuda" }, b.nombre) : null,
      acciones);
  }

  function chipsSugeridos(lista, alElegir) {
    return h("div", { class: "sugeridas" }, lista.map(b => h("button", { type: "button", class: "sugerida" + (favoritas.has(b.codigo) ? " favorita" : ""), onclick: () => alElegir(b.codigo) },
      favoritas.has(b.codigo) ? "★ " + b.codigo : b.codigo)));
  }
  const stat = (cls, ic, valor, et, extra) => h("div", { class: "stat " + cls }, h("div", { class: "ico-caja" }, icono(ic)),
    h("div", { style: "flex:1" }, h("div", { class: "num" }, String(valor)), h("div", { class: "et" }, et), extra));

  function descargar(nombre, texto) {   // RP-10
    try {
      const url = URL.createObjectURL(new Blob([texto], { type: "text/csv;charset=utf-8" }));
      const a = h("a", { href: url, download: nombre });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast({ tipo: "ok", texto: `Descargando ${nombre}` });
    } catch (e) { toast({ tipo: "error", texto: "No se pudo generar el archivo en este navegador." }); }
  }
  const hoy = () => new Date().toISOString().slice(0, 10);

  // ---------- Vistas ----------
  const vistas = {
    inicio() {
      const t = Datos.totales();
      const r = Datos.resumen(sesion.codigo);
      const mias = Datos.bicis().filter(b => esAdmin ? !b.disponible : (b.prestadaA === sesion.codigo && !b.disponible) || esMiReserva(b));
      const misVencidas = mias.filter(Datos.vencida).length;
      const accion = (vista, ic, titulo, desc) => h("button", { class: "accion", type: "button", onclick: () => renderizar(vista) },
        h("div", { class: "ico-caja" }, icono(ic)), h("strong", {}, titulo), h("span", { class: "d" }, desc));

      let alerta = null;
      if (misVencidas) {
        alerta = mensaje();
        poner(alerta, { tipo: "aviso", texto: esAdmin ? `Hay ${misVencidas} bicicleta(s) con más de 2 horas de préstamo.` : "Tienes una bicicleta con más de 2 horas de préstamo. Devuélvela pronto." });
      }
      const lista = h("div", { class: "tarjeta" }, h("h2", { class: "titulo" }, icono("reloj"), esAdmin ? "Bicicletas prestadas ahora" : "Mis préstamos y reservas"),
        mias.length === 0
          ? h("p", { class: "vacio" }, esAdmin ? "No hay bicicletas prestadas en este momento." : "No tienes bicicletas prestadas ni reservadas. ¡Anímate a pedalear!")
          : h("div", { class: "rejilla" }, mias.map(tarjetaBici)));

      return h("div", { class: "vista-anim" },
        h("section", { class: "bienvenida" }, h("h2", {}, `¡Hola, ${primerNombre}!`),
          h("p", {}, esAdmin ? "Panel de administración de la estación BiciSabana." : "¿Listo para pedalear por el campus? Elige una opción.")),
        alerta,
        h("div", { class: "stats" },
          stat("", "check", t.disponibles, "Bicicletas disponibles"),
          stat("rojo", "reloj", t.prestadas, "Bicicletas prestadas"),
          stat("oro", "bicis", `${t.porcentaje.toFixed(0)} %`, "Ocupación de la estación",
            h("div", { class: "barra", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(Math.round(t.porcentaje)) },
              h("i", { style: `width:${t.porcentaje}%` }))),
          esAdmin ? stat("oro", "llave", t.mantenimiento, "En mantenimiento")
                  : stat("verde", "hoja", `${num(r.co2, 2)} kg`, "CO₂ que has evitado")),
        h("div", { class: "acciones" },
          accion("prestar", "prestar", "Prestar", "Pide una bicicleta disponible"),
          accion("devolver", "devolver", "Devolver", "Registra la devolución"),
          accion("bicicletas", "buscar", "Ver, buscar y reservar", "Explora, filtra y aparta una bicicleta"),
          accion("campus", "pin", "Puntos de préstamo", "Encuentra dónde pedir una bicicleta"),
          accion("historial", "historial", esAdmin ? "Historial de viajes" : "Mis viajes y logros", esAdmin ? "Todos los préstamos registrados" : "Tu huella verde e insignias"),
          accion("mapa", "mapa", "Estación", "Mira los puestos 3 × 10"),
          esAdmin ? accion("totales", "totales", "Totales y reportes", "Cifras, mantenimiento y CSV") : null),
        lista);
    },

    bicicletas() {  // RF-01, RF-02, RF-06, RF-07 + RP-02, RP-07
      const rejilla = h("div", { class: "rejilla" });
      const aviso = h("div");
      const cuenta = h("p", { class: "ayuda", "aria-live": "polite" });
      const buscador = h("input", { id: "bus", type: "search", autocomplete: "off", maxlength: "4", placeholder: "Buscar por código (ej.: B03)", "aria-label": "Buscar bicicleta por código" });
      buscador.value = textoBusqueda;

      const FILTROS = [["todas", "Todas"], ["disponibles", "Disponibles"], ["prestadas", "Prestadas"], ["favoritas", "★ Favoritas"]];
      const botones = FILTROS.map(([clave, texto]) =>
        h("button", { type: "button", class: "filtro", "data-f": clave, "aria-pressed": String(filtro === clave), onclick: () => { filtro = clave; pintar(); } }, texto));
      const pasa = (b) => {
        const e = Datos.estado(b);
        if (filtro === "disponibles") return e === "disponible" || esMiReserva(b);
        if (filtro === "prestadas") return e === "prestada";
        if (filtro === "favoritas") return favoritas.has(b.codigo);
        return true;
      };

      function pintar() {
        botones.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.f === filtro)));
        rejilla.replaceChildren(); aviso.replaceChildren();
        const todas = Datos.bicis();
        const t = Datos.normalizar(buscador.value);
        let lista = todas.filter(pasa);
        if (t) lista = lista.filter(b => b.codigo.includes(t));
        cuenta.textContent = `${lista.length} de ${todas.length} bicicletas`;
        if (lista.length === 0) {
          const m = mensaje();
          const existe = t && todas.some(b => b.codigo.includes(t));
          poner(m, t
            ? (existe ? { tipo: "aviso", texto: `La bicicleta ${t} existe, pero no coincide con el filtro seleccionado.` }
                      : { tipo: "aviso", texto: `No existe una bicicleta con el código ${t}` })
            : { tipo: "aviso", texto: filtro === "favoritas" ? "Aún no tienes favoritas. Toca la estrella de una bicicleta para guardarla." : "No hay bicicletas con este filtro por ahora." });
          aviso.append(m); return;
        }
        lista.forEach(b => rejilla.append(tarjetaBici(b)));
      }
      buscador.addEventListener("input", () => { textoBusqueda = buscador.value; pintar(); });
      pintar();

      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("bicis"), "Bicicletas"),
        h("p", { class: "subtitulo" }, esAdmin ? "Busca por código o filtra por estado." : `Busca, filtra, guarda tus favoritas o reserva una por ${Datos.RESERVA_MIN} minutos.`),
        h("div", { class: "herramientas" }, h("div", { class: "buscador con-icono" }, icono("buscar"), buscador), h("div", { class: "filtros", role: "group", "aria-label": "Filtrar por estado" }, botones)),
        cuenta, aviso, rejilla);
    },

    prestar() {     // RF-03, RF-04, RF-08, RNF-02
      const msg = mensaje();
      const nombre = h("input", { id: "nombre", type: "text", autocomplete: "off", value: esAdmin ? "" : sesion.nombre, readonly: !esAdmin });
      const codEst = h("input", { id: "cod-est", type: "text", inputmode: "numeric", maxlength: "6", autocomplete: "off", value: esAdmin ? "" : sesion.codigo, readonly: !esAdmin, "aria-describedby": "ay-est" });
      const codBici = h("input", { id: "cod-bici", type: "text", autocomplete: "off", placeholder: "Ej.: B05", maxlength: "4" });
      codBici.value = precarga; precarga = "";
      // Las reservadas por mí y las favoritas aparecen primero
      const libres = Datos.bicis().filter(b => Datos.libreParaEstudiante(b, esAdmin ? "" : sesion.codigo))
        .sort((a, b) => (esMiReserva(b) - esMiReserva(a)) || (favoritas.has(b.codigo) - favoritas.has(a.codigo))).slice(0, 8);
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
          libres.length ? h("p", { class: "ayuda" }, "Disponibles ahora (toca para elegir; ★ = favorita):") : h("p", { class: "ayuda" }, "No hay bicicletas disponibles por ahora."),
          chipsSugeridos(libres, (c) => { codBici.value = c; codBici.focus(); })),
        h("button", { class: "btn", type: "submit" }, icono("prestar"), "Prestar bicicleta"));
      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("prestar"), "Prestar una bicicleta"),
        h("p", { class: "subtitulo" }, "Completa los datos y la bicicleta queda a nombre del estudiante."),
        h("div", { class: "dos-col" }, h("div", { class: "tarjeta" }, form, msg),
          h("aside", { class: "lateral" }, h("h3", {}, "Reglas del préstamo"),
            h("ul", {}, h("li", {}, "El código de estudiante tiene exactamente 6 números."), h("li", {}, "Una bicicleta prestada, reservada por otra persona o en mantenimiento no se puede prestar."),
              h("li", {}, "El préstamo dura máximo 2 horas."), h("li", {}, "Los intentos con código inválido quedan registrados."), h("li", {}, "Escribe el código de la bicicleta como B05 o b05.")))));
    },

    devolver() {    // RF-05 + RP-06, RP-09
      const msg = mensaje();
      const cod = h("input", { id: "dev", type: "text", autocomplete: "off", placeholder: "Ej.: B30", maxlength: "4" });
      const mias = Datos.bicis().filter(puedeDevolver);

      // RP-09: calificación de 1 a 5 estrellas (opcional)
      let nota = null;
      const estrellas = [1, 2, 3, 4, 5].map(n => h("button", { type: "button", class: "estrella", "aria-pressed": "false", "aria-label": `${n} de 5 estrellas`,
        onclick: () => { nota = nota === n ? null : n; estrellas.forEach((e, i) => { e.classList.toggle("on", nota !== null && i < nota); e.setAttribute("aria-pressed", String(i + 1 === nota)); }); } }, icono("estrella")));
      // RP-06: reporte de daño
      const tipo = h("select", { id: "tipo-dano", disabled: true, "aria-label": "Tipo de daño" }, Datos.TIPOS_DANO.map(t => h("option", { value: t }, t)));
      const hayDano = h("input", { id: "hay-dano", type: "checkbox", onchange: () => { tipo.disabled = !hayDano.checked; } });

      const form = h("form", { novalidate: true, onsubmit: (e) => {
        e.preventDefault();
        if (cod.value.trim() === "") return poner(msg, { tipo: "error", texto: "Escribe el código de la bicicleta." });
        const r = conLogros(() => Datos.devolver(cod.value, sesion, { calificacion: nota, dano: hayDano.checked ? tipo.value : null }));
        poner(msg, r); toast(r);
        if (r.texto.startsWith("Gracias")) { cod.value = ""; renderizar("devolver", null, r); } else cod.focus();
      }},
        h("div", { class: "campo" }, h("label", { for: "dev" }, "Código de la bicicleta a devolver"), cod,
          h("p", { class: "ayuda" }, esAdmin ? "Como administrador puedes registrar cualquier devolución." : "Solo puedes devolver las bicicletas prestadas a tu cuenta."),
          mias.length ? h("p", { class: "ayuda" }, esAdmin ? "Prestadas ahora (toca para elegir):" : "Tus bicicletas (toca para elegir):") : h("p", { class: "ayuda" }, "No hay bicicletas para devolver por ahora."),
          chipsSugeridos(mias, (c) => { cod.value = c; cod.focus(); })),
        h("div", { class: "campo" }, h("span", { class: "etiqueta", id: "et-cal" }, "¿Cómo estuvo tu viaje? (opcional)"),
          h("div", { class: "estrellas", role: "group", "aria-labelledby": "et-cal" }, estrellas)),
        h("div", { class: "campo dano" }, h("label", { class: "check", for: "hay-dano" }, hayDano, "La bicicleta tiene un daño"), tipo,
          h("p", { class: "ayuda" }, "Si reportas un daño, la bicicleta pasa a mantenimiento y nadie podrá prestarla hasta que la reparen.")),
        h("button", { class: "btn rojo", type: "submit" }, icono("devolver"), "Devolver bicicleta"));
      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("devolver"), "Devolver una bicicleta"),
        h("p", { class: "subtitulo" }, "Registra la devolución para dejarla disponible."),
        h("div", { class: "dos-col" }, h("div", { class: "tarjeta" }, form, msg),
          h("aside", { class: "lateral" }, h("h3", {}, "Antes de devolver"),
            h("ul", {}, h("li", {}, "Deja la bicicleta en su puesto de la estación."), h("li", {}, "Revisa llantas, frenos y cadena; si algo falla, repórtalo."),
              h("li", {}, "Si no estaba prestada, te avisaremos sin cambiar nada."), h("li", {}, "Califica tu viaje para ayudar a mejorar el servicio.")))));
    },

    mapa() {        // RF-10: 3 filas × 10 puestos
      const celdas = Datos.bicis().map(b => {
        const [clase, texto, letra] = ESTADOS[Datos.estado(b)];
        const etiqueta = `${b.codigo}: ${texto.toLowerCase()}${Datos.vencida(b) ? " (vencida)" : ""}`;
        const c = h("div", { class: "puesto " + clase + (Datos.vencida(b) ? " vencida" : ""), role: "img", title: etiqueta, "aria-label": etiqueta });
        c.append(dibujoBici(""), b.codigo, h("small", {}, letra));
        return c;
      });
      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("mapa"), "Mapa de la estación"),
        h("p", { class: "subtitulo" }, `${Datos.FILAS} filas × ${Datos.PUESTOS} puestos`),
        h("div", { class: "tarjeta" }, h("div", { class: "estacion" }, h("div", { class: "mapa" }, celdas)),
          h("div", { class: "leyenda" }, Object.values(ESTADOS).map(([clase, texto, letra]) => h("span", {}, h("span", { class: "insignia " + clase }, `${letra} · ${texto}`))))));
    },

    campus() {      // Mapa del campus con los puntos de préstamo (ubicaciones ilustrativas)
      const caja = h("div", { class: "mapa-campus" });
      caja.innerHTML = Campus.svg();   // SVG armado solo con constantes de campus.js
      const panel = h("aside", { class: "panel-punto", "aria-live": "polite" });
      const lista = h("div", { class: "lista-puntos", role: "group", "aria-label": "Lista de puntos de préstamo" });
      const botonesLista = Campus.PUNTOS.map(p => h("button", { type: "button", class: "item-punto", "data-id": p.id, onclick: () => seleccionar(p.id) },
        h("span", { class: "num" + (p.activo ? " central" : "") }, String(p.n)), p.nombre));
      lista.append(...botonesLista);
      caja.dataset.vista = "sat";
      const botonesVista = Campus.vistas.map(([clave, texto]) => h("button", { type: "button", class: "seg", "data-k": clave, "aria-pressed": String(clave === "sat"),
        onclick: () => { caja.dataset.vista = clave; botonesVista.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.k === clave))); } }, texto));
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

      seleccionar("central");
      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("pin"), "Puntos de préstamo"),
        h("p", { class: "subtitulo" }, "Toca un punto del mapa o de la lista para ver sus detalles."),
        h("div", { class: "campus-grid" },
          h("div", {}, h("div", { class: "tarjeta", style: "padding:.8rem" },
            h("div", { class: "selector-vista", role: "group", "aria-label": "Tipo de mapa" }, botonesVista), caja,
            h("div", { class: "leyenda" }, h("span", {}, h("span", { class: "leyenda-pin central" }), "Estación con bicicletas"), h("span", {}, h("span", { class: "leyenda-pin" }), "Punto ilustrativo")),
            h("p", { class: "ayuda" }, "Imágenes: capturas de Apple Maps, reducidas para la web. Las ubicaciones de los puntos son ilustrativas.")),
            lista),
          panel));
    },

    historial() {   // RP-04, RP-05, RP-08
      const codigo = esAdmin ? null : sesion.codigo;
      const r = Datos.resumen(codigo);
      const viajes = Datos.historial(codigo);

      const huella = h("div", { class: "stats" },
        stat("", "bicis", r.viajes, "Viajes completados"),
        stat("oro", "reloj", Datos.duracion(r.minutos), "Tiempo pedaleando"),
        stat("", "mapa", `${num(r.km, 1)} km`, "Distancia estimada"),
        stat("verde", "hoja", `${num(r.co2, 2)} kg`, "CO₂ evitado"));

      let logros = null;
      if (!esAdmin) {
        const lista = Datos.logros(sesion.codigo);
        logros = h("div", { class: "tarjeta" }, h("h2", { class: "titulo" }, icono("medalla"), "Mis logros"),
          h("p", { class: "subtitulo" }, `${lista.filter(l => l.obtenido).length} de ${lista.length} insignias obtenidas`),
          h("div", { class: "logros" }, lista.map(l => h("div", { class: "logro" + (l.obtenido ? " ok" : "") },
            h("div", { class: "medalla" }, icono("medalla")),
            h("div", {}, h("strong", {}, l.nombre), h("span", { class: "d" }, l.desc),
              h("div", { class: "barra", role: "progressbar", "aria-label": `Progreso de ${l.nombre}`, "aria-valuemin": "0", "aria-valuemax": String(l.meta), "aria-valuenow": String(l.valor) },
                h("i", { style: `width:${(l.valor / l.meta) * 100}%` })),
              h("span", { class: "progreso" }, l.obtenido ? "¡Obtenido!" : `${l.valor} de ${l.meta}`))))));
      }

      const filas = viajes.map(v => h("tr", {},
        h("td", {}, h("strong", {}, v.bici)),
        esAdmin ? h("td", {}, v.nombre) : null,
        h("td", {}, fecha(v.inicio)),
        h("td", {}, Datos.duracion(v.minutos)),
        h("td", {}, h("span", { class: "insignia " + (v.minutos > Datos.LIMITE_MIN ? "p" : "d") }, v.minutos > Datos.LIMITE_MIN ? "Tarde" : "A tiempo")),
        h("td", { "aria-label": v.calificacion ? `${v.calificacion} de 5 estrellas` : "Sin calificar" }, v.calificacion ? h("span", { class: "nota" }, "★".repeat(v.calificacion) + "☆".repeat(5 - v.calificacion)) : "—"),
        h("td", {}, v.dano || "—")));
      const tabla = viajes.length
        ? h("div", { class: "tabla-caja" }, h("table", { class: "tabla" },
            h("thead", {}, h("tr", {}, ["Bicicleta", esAdmin ? "Estudiante" : null, "Fecha", "Duración", "Entrega", "Calificación", "Daño"].filter(Boolean).map(t => h("th", { scope: "col" }, t)))),
            h("tbody", {}, filas)))
        : h("p", { class: "vacio" }, "Todavía no hay viajes registrados.");

      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("historial"), esAdmin ? "Historial de viajes" : "Mis viajes"),
        h("p", { class: "subtitulo" }, esAdmin ? "Todos los préstamos devueltos y la huella verde de la estación." : "Tu huella verde, tus insignias y cada viaje que has hecho."),
        huella,
        h("p", { class: "ayuda nota-huella" }, "Huella verde estimada: hasta 30 min de pedaleo por viaje a 12 km/h y 0,12 kg de CO₂ por km que se habrían emitido en carro. Cifras ilustrativas."),
        logros,
        h("div", { class: "tarjeta" }, h("h2", { class: "titulo" }, icono("reloj"), "Viajes"), tabla));
    },

    totales() {     // RF-09 (solo administrador) + RP-06, RP-09, RP-10
      const t = Datos.totales();
      const s = Datos.satisfaccion();
      const msg = mensaje();
      const C = 2 * Math.PI * 60;
      const anillo = h("div", { class: "anillo" });
      anillo.innerHTML = `<svg class="anillo" viewBox="0 0 150 150" role="img" aria-label="${t.porcentaje.toFixed(1)} por ciento de bicicletas prestadas">` +
        '<defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d0a00c"/><stop offset="1" stop-color="#9c080c"/></linearGradient></defs>' +
        '<circle class="fondo" cx="75" cy="75" r="60" fill="none" stroke-width="16"/>' +
        `<circle class="valor" cx="75" cy="75" r="60" fill="none" stroke-width="16" stroke-linecap="round" transform="rotate(-90 75 75)" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - t.porcentaje / 100)).toFixed(2)}"/>` +
        `<text x="75" y="82">${t.porcentaje.toFixed(1)} %</text></svg>`;
      const enMant = Datos.bicis().filter(b => Datos.estado(b) === "mantenimiento");

      return h("div", { class: "vista-anim" },
        h("h2", { class: "titulo" }, icono("totales"), "Totales de la estación"),
        h("p", { class: "subtitulo" }, "Resumen, mantenimiento y reportes para la administración."),
        h("div", { class: "tarjeta anillo-caja" }, anillo, h("div", { style: "flex:1;min-width:220px" }, h("strong", { class: "destacado" }, "Porcentaje prestado"),
          h("p", { class: "ayuda" }, `${t.prestadas} de ${t.total} bicicletas están prestadas.`),
          t.vencidas ? h("p", { class: "ayuda alerta-texto" }, `${t.vencidas} préstamo(s) superan el límite de 2 horas.`) : null)),
        h("div", { class: "stats" }, stat("", "check", t.disponibles, "Disponibles"), stat("rojo", "reloj", t.prestadas, "Prestadas"),
          stat("", "estrella", t.reservadas, "Reservadas"), stat("oro", "llave", t.mantenimiento, "En mantenimiento"),
          stat("", "bicis", t.total, "Total"), stat("oro", "alerta", t.rechazados, "Intentos rechazados")),
        h("div", { class: "dos-col" },
          h("div", { class: "tarjeta" }, h("h2", { class: "titulo" }, icono("llave"), "Mantenimiento"),
            enMant.length === 0 ? h("p", { class: "vacio" }, "Ninguna bicicleta está en mantenimiento.")
              : h("ul", { class: "lista-mant" }, enMant.map(b => h("li", {}, h("div", {}, h("strong", {}, b.codigo), ` · ${b.mantenimiento.tipo}`,
                  h("div", { class: "ayuda" }, `Reportada el ${fecha(b.mantenimiento.fecha)}`)),
                  h("button", { class: "btn mini oro", type: "button", onclick: () => accionReparar(b.codigo) }, "Marcar reparada"))))),
          h("div", { class: "tarjeta" }, h("h2", { class: "titulo" }, icono("estrella"), "Satisfacción"),
            s.n ? h("div", {}, h("div", { class: "nota grande", "aria-label": `${num(s.promedio, 1)} de 5` }, `${num(s.promedio, 1)} ★`),
                    h("p", { class: "ayuda" }, `Promedio de ${s.n} viaje(s) calificados.`))
                : h("p", { class: "vacio" }, "Aún no hay viajes calificados."))),
        h("div", { class: "tarjeta" }, h("h2", { class: "titulo" }, icono("descarga"), "Reportes"),
          h("p", { class: "ayuda" }, "Descarga los datos en CSV (separados por punto y coma) para abrirlos en Excel o Google Sheets."),
          h("div", { class: "pie-tarjeta" },
            h("button", { class: "btn", type: "button", onclick: () => descargar(`bicisabana-bicicletas-${hoy()}.csv`, Datos.csvBicis()) }, icono("descarga"), "Bicicletas (CSV)"),
            h("button", { class: "btn sec", type: "button", onclick: () => descargar(`bicisabana-historial-${hoy()}.csv`, Datos.csvHistorial()) }, icono("descarga"), "Historial (CSV)"))),
        h("div", { class: "tarjeta" }, h("p", { class: "ayuda" }, "Los intentos rechazados suman cada vez que se escribe un código de estudiante inválido."),
          h("button", { class: "btn sec", type: "button", onclick: () => { Datos.reiniciar(); renderizar("totales"); toast({ tipo: "ok", texto: "Datos de demostración reiniciados." }); } }, "Reiniciar datos de demostración"), msg));
    }
  };

  const ETIQUETAS = { inicio: ["Inicio", "inicio"], bicicletas: ["Bicicletas", "bicis"], prestar: ["Prestar", "prestar"], devolver: ["Devolver", "devolver"],
    mapa: ["Estación", "mapa"], campus: ["Campus", "pin"], historial: ["Historial", "historial"], totales: ["Totales", "totales"] };
  const PERMITIDAS = esAdmin ? Object.keys(ETIQUETAS) : Object.keys(ETIQUETAS).filter(k => k !== "totales");
  const ALIAS = { disponibles: "bicicletas", buscar: "bicicletas", viajes: "historial" };   // enlaces de la versión anterior

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

  // RP-02 / RP-03: actualiza los contadores cada 20 s sin redibujar la pantalla
  function actualizarTiempos() {
    vista.querySelectorAll(".tiempo[data-bici]").forEach(el => {
      const b = Datos.buscar(el.dataset.bici);
      if (!b) return;
      const txt = el.dataset.tipo === "prestamo" ? (b.disponible ? "Devuelta" : textoTiempo(b)) : textoReserva(b);
      el.lastChild.textContent = txt;
      if (el.dataset.tipo === "prestamo") el.classList.toggle("vencida", Datos.vencida(b));
    });
  }
  setInterval(actualizarTiempos, 20000);

  // RP-01: botón de modo oscuro en el encabezado
  const botonTema = h("button", { type: "button", id: "tema", class: "btn sec solo-icono", onclick: () => { Tema.alternar(); pintarTema(); } });
  function pintarTema() {
    const oscuro = Tema.actual() === "oscuro";
    botonTema.replaceChildren(icono(oscuro ? "sol" : "luna"));
    botonTema.setAttribute("aria-pressed", String(oscuro));
    botonTema.setAttribute("aria-label", "Modo oscuro");
    botonTema.title = oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  }
  pintarTema();
  document.getElementById("salir").before(botonTema);

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

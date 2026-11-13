/* BiciSabana · Panel principal. Se construye con DOM seguro (textContent), sin innerHTML con datos del usuario. */
(() => {
  const sesion = Auth.exigirSesion();       // sin sesión vuelve al login
  if (!sesion) return;
  const esAdmin = sesion.rol === "Administrador";

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
  const insignia = (b) => h("span", { class: "insignia " + (b.disponible ? "d" : "p") }, b.disponible ? "Disponible" : "Prestada");
  const mensaje = () => h("div", { class: "msg", role: "status", "aria-live": "polite" });
  function poner(el, r) { el.className = "msg " + r.tipo; el.textContent = r.texto; }

  function tablaBicis(lista, leyenda) {
    return h("div", { class: "cuadro-tabla" }, h("table", {},
      h("caption", {}, leyenda),
      h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Código"), h("th", { scope: "col" }, "Color"), h("th", { scope: "col" }, "Estado"))),
      h("tbody", {}, lista.map(b => h("tr", {}, h("td", {}, b.codigo), h("td", {}, b.color), h("td", {}, insignia(b)))))));
  }

  // ---------- Vistas ----------
  const vistas = {
    bicicletas() {  // RF-01, RF-02
      const lista = Datos.bicis();
      return h("section", { class: "tarjeta" }, h("h2", {}, "Todas las bicicletas"), tablaBicis(lista, `${lista.length} bicicletas en la estación`));
    },

    disponibles() { // RF-06
      const lista = Datos.bicis().filter(b => b.disponible);
      return h("section", { class: "tarjeta" }, h("h2", {}, "Bicicletas disponibles"),
        lista.length ? tablaBicis(lista, `${lista.length} disponibles ahora`) : h("p", {}, "Por ahora no hay bicicletas disponibles. ¡Intenta más tarde!"));
    },

    prestar() {     // RF-03, RF-04, RF-08, RNF-02
      const msg = mensaje();
      const nombre = h("input", { id: "nombre", type: "text", autocomplete: "off", value: esAdmin ? "" : sesion.nombre, readonly: !esAdmin });
      const codEst = h("input", { id: "cod-est", type: "text", inputmode: "numeric", maxlength: "6", autocomplete: "off", value: esAdmin ? "" : sesion.codigo, readonly: !esAdmin, "aria-describedby": "ay-est" });
      const codBici = h("input", { id: "cod-bici", type: "text", autocomplete: "off", placeholder: "Ej.: B05", maxlength: "4" });
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
        poner(msg, Datos.prestar(codBici.value, { codigo: est, nombre: nom || sesion.nombre }));
        codBici.value = ""; codBici.focus();
      }},
        h("div", { class: "campo" }, h("label", { for: "nombre" }, "Nombre del estudiante"), nombre),
        h("div", { class: "campo" }, h("label", { for: "cod-est" }, "Código del estudiante (6 números)"), codEst,
          h("p", { class: "ayuda", id: "ay-est" }, esAdmin ? "Si el código no es válido, el intento se cuenta como rechazado." : "Tus datos vienen de tu sesión.")),
        h("div", { class: "campo" }, h("label", { for: "cod-bici" }, "Código de la bicicleta"), codBici),
        h("button", { class: "btn", type: "submit" }, "Prestar bicicleta"));
      return h("section", { class: "tarjeta" }, h("h2", {}, "Prestar una bicicleta"), form, msg);
    },

    devolver() {    // RF-05
      const msg = mensaje();
      const cod = h("input", { id: "dev", type: "text", autocomplete: "off", placeholder: "Ej.: B30", maxlength: "4" });
      const form = h("form", { novalidate: true, onsubmit: (e) => {
        e.preventDefault();
        if (cod.value.trim() === "") return poner(msg, { tipo: "error", texto: "Escribe el código de la bicicleta." });
        poner(msg, Datos.devolver(cod.value, sesion));
        cod.value = ""; cod.focus();
      }},
        h("div", { class: "campo" }, h("label", { for: "dev" }, "Código de la bicicleta a devolver"), cod,
          h("p", { class: "ayuda" }, esAdmin ? "Como administrador puedes registrar cualquier devolución." : "Solo puedes devolver las bicicletas prestadas a tu cuenta.")),
        h("button", { class: "btn", type: "submit" }, "Devolver bicicleta"));
      return h("section", { class: "tarjeta" }, h("h2", {}, "Devolver una bicicleta"), form, msg);
    },

    buscar() {      // RF-07
      const resultado = h("div", { "aria-live": "polite" });
      const cod = h("input", { id: "bus", type: "search", autocomplete: "off", placeholder: "Ej.: B03", maxlength: "4" });
      const form = h("form", { novalidate: true, onsubmit: (e) => {
        e.preventDefault();
        resultado.replaceChildren();
        const texto = Datos.normalizar(cod.value);
        if (texto === "") { const m = mensaje(); poner(m, { tipo: "error", texto: "Escribe el código de la bicicleta." }); return resultado.append(m); }
        const b = Datos.buscar(texto);
        if (!b) { const m = mensaje(); poner(m, { tipo: "aviso", texto: `No existe una bicicleta con el código ${texto}` }); return resultado.append(m); }
        resultado.append(tablaBicis([b], "Resultado de la búsqueda"));
      }},
        h("div", { class: "campo" }, h("label", { for: "bus" }, "Código de la bicicleta a buscar"), cod,
          h("p", { class: "ayuda" }, "No importa si escribes en minúscula: B03 y b03 son lo mismo.")),
        h("button", { class: "btn", type: "submit" }, "Buscar"));
      return h("section", { class: "tarjeta" }, h("h2", {}, "Buscar por código"), form, resultado);
    },

    mapa() {        // RF-10: 3 filas × 10 puestos
      const bicis = Datos.bicis();
      const celdas = bicis.map(b => h("div", {
        class: "puesto " + (b.disponible ? "d" : "p"),
        role: "img", "aria-label": `${b.codigo}: ${b.disponible ? "disponible" : "prestada"}`
      }, h("span", {}, b.disponible ? "D" : "P"), b.codigo));
      return h("section", { class: "tarjeta" }, h("h2", {}, "Mapa de la estación"),
        h("p", {}, `${Datos.FILAS} filas × ${Datos.PUESTOS} puestos`),
        h("div", { class: "cuadro-tabla" }, h("div", { class: "mapa" }, celdas)),
        h("div", { class: "leyenda" }, h("span", {}, "D = disponible"), h("span", {}, "P = prestada")));
    },

    totales() {     // RF-09 (solo administrador)
      const t = Datos.totales();
      const caja = (cls, num, et) => h("div", { class: "total " + cls }, h("div", { class: "num" }, String(num)), h("div", { class: "et" }, et));
      const msg = mensaje();
      return h("section", {}, h("div", { class: "tarjeta" }, h("h2", {}, "Totales de la estación"),
        h("div", { class: "totales" },
          caja("", t.disponibles, "Disponibles"), caja("rojo", t.prestadas, "Prestadas"), caja("", t.total, "Total"),
          caja("oro", t.porcentaje.toFixed(1) + " %", "Porcentaje prestado"), caja("rojo", t.rechazados, "Intentos rechazados"))),
        h("div", { class: "tarjeta" }, h("p", { class: "ayuda" }, "Los intentos rechazados suman cada vez que se escribe un código de estudiante inválido."),
          h("button", { class: "btn sec", type: "button", onclick: () => { Datos.reiniciar(); poner(msg, { tipo: "ok", texto: "Datos de demostración reiniciados." }); renderizar("totales"); } }, "Reiniciar datos de demostración"), msg));
    }
  };

  const ETIQUETAS = { bicicletas: "Ver todas", disponibles: "Disponibles", prestar: "Prestar", devolver: "Devolver", buscar: "Buscar", mapa: "Mapa", totales: "Totales" };
  const PERMITIDAS = esAdmin ? Object.keys(ETIQUETAS) : Object.keys(ETIQUETAS).filter(k => k !== "totales");

  // ---------- Navegación (hash simple #nombre) ----------
  const vista = document.getElementById("vista");
  const menu = document.getElementById("menu");

  function renderizar(nombre, aviso) {
    let destino = nombre;
    let nota = null;
    if (!PERMITIDAS.includes(destino)) {
      nota = destino === "totales" ? "Los totales son solo para administración. Te llevamos al inicio." : null;
      destino = "bicicletas";
    }
    menu.querySelectorAll("button").forEach(b => b.toggleAttribute("aria-current", false));
    const activo = menu.querySelector(`[data-vista="${destino}"]`);
    if (activo) activo.setAttribute("aria-current", "page");
    vista.replaceChildren();
    if (nota || aviso) { const m = mensaje(); poner(m, { tipo: "aviso", texto: nota || aviso }); vista.append(m); }
    try { vista.append(vistas[destino]()); }
    catch (err) { const m = mensaje(); poner(m, { tipo: "error", texto: "No pudimos mostrar esta pantalla. Intenta con otra opción del menú." }); vista.append(m); }
    if (location.hash !== "#" + destino) history.replaceState(null, "", "#" + destino);
  }

  PERMITIDAS.forEach(k => menu.append(h("button", { type: "button", "data-vista": k, onclick: () => renderizar(k) }, ETIQUETAS[k])));
  document.getElementById("chip-usuario").replaceChildren(sesion.nombre + " · ", h("b", {}, sesion.rol));
  document.getElementById("salir").addEventListener("click", () => Auth.cerrarSesion("salida"));

  window.addEventListener("hashchange", () => {
    const n = location.hash.slice(1);
    renderizar(vistas[n] ? n : "bicicletas", vistas[n] ? null : "Esa opción no existe. Elige una del menú.");
  });
  const inicial = location.hash.slice(1);
  renderizar(vistas[inicial] ? inicial : "bicicletas");
})();

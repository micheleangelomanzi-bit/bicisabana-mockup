/* BiciSabana · Datos ilustrativos (el caso es ficticio).
   Persistencia con localStorage protegida con try/catch y respaldo en memoria. */
const Datos = (() => {
  const LLAVE = "bs_datos_v1";
  const FILAS = 3, PUESTOS = 10;
  let memoria = null;

  function semilla() {
    const colores = { 1: "Rojo", 2: "Azul", 3: "Verde", 4: "Negro", 5: "Blanco" };
    const bicis = [];
    for (let n = 1; n <= FILAS * PUESTOS; n++) {
      const codigo = (n < 10 ? "B0" : "B") + n;                 // B01…B09, B10…B30
      bicis.push({ codigo, color: colores[n] || "Gris", disponible: true, prestadaA: null, nombre: null });
    }
    // Estado inicial igual al ejemplo del notebook: B03 y B30 prestadas.
    bicis[2].disponible = false; bicis[2].prestadaA = "202345"; bicis[2].nombre = "Luis Torres";
    bicis[29].disponible = false; bicis[29].prestadaA = "202601"; bicis[29].nombre = "Sofía Ramírez";
    return { bicis, rechazados: 0 };
  }

  function cargar() {
    if (memoria) return memoria;
    try {
      const txt = localStorage.getItem(LLAVE);
      if (txt) { memoria = JSON.parse(txt); return memoria; }
    } catch (e) { /* almacenamiento vacío o bloqueado */ }
    memoria = semilla();
    return memoria;
  }
  function guardar() { try { localStorage.setItem(LLAVE, JSON.stringify(memoria)); } catch (e) { /* ignorar */ } }

  const bicis = () => cargar().bicis;
  const rechazados = () => cargar().rechazados;
  function sumarRechazado() { cargar().rechazados += 1; guardar(); }
  function reiniciar() { memoria = semilla(); guardar(); }

  // Búsqueda tolerante a minúsculas y espacios (mejora el caso "b03" del ejercicio 7).
  const normalizar = (t) => (t || "").trim().toUpperCase();
  const buscar = (codigo) => bicis().find(b => b.codigo === normalizar(codigo)) || null;

  function totales() {
    let disponibles = 0, prestadas = 0;
    for (const b of bicis()) { if (b.disponible) disponibles++; else prestadas++; }
    const total = disponibles + prestadas;
    const porcentaje = total === 0 ? 0 : (prestadas / total) * 100;
    return { disponibles, prestadas, total, porcentaje, rechazados: rechazados() };
  }

  function prestar(codigoBici, estudiante) {
    const b = buscar(codigoBici);
    const cod = normalizar(codigoBici);
    if (!b) return { tipo: "error", texto: `No existe una bicicleta con el código ${cod || "(vacío)"}` };
    if (!b.disponible) return { tipo: "aviso", texto: `Aviso: la bicicleta ${b.codigo} ya está prestada.` };
    b.disponible = false; b.prestadaA = estudiante.codigo; b.nombre = estudiante.nombre;
    guardar();
    return { tipo: "ok", texto: `Listo: la bicicleta ${b.codigo} fue prestada.` };
  }

  function devolver(codigoBici, sesion) {
    const b = buscar(codigoBici);
    const cod = normalizar(codigoBici);
    if (!b) return { tipo: "error", texto: `No existe una bicicleta con el código ${cod || "(vacío)"}` };
    if (b.disponible) return { tipo: "aviso", texto: `Aviso: la bicicleta ${b.codigo} no estaba prestada.` };
    if (sesion.rol !== "Administrador" && b.prestadaA !== sesion.codigo) {
      return { tipo: "aviso", texto: `Aviso: la bicicleta ${b.codigo} no está prestada a tu cuenta. Pide ayuda a la administración.` };
    }
    b.disponible = true; b.prestadaA = null; b.nombre = null;
    guardar();
    return { tipo: "ok", texto: `Gracias: la bicicleta ${b.codigo} fue devuelta.` };
  }

  return { bicis, buscar, totales, prestar, devolver, sumarRechazado, reiniciar, normalizar, FILAS, PUESTOS };
})();

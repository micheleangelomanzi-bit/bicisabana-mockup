/* BiciSabana · Datos ilustrativos (el caso es ficticio).
   Persistencia con localStorage protegida con try/catch y respaldo en memoria.
   Incluye los requerimientos propios RP-02 a RP-10 (reservas, tiempo de préstamo, historial,
   huella verde, mantenimiento, logros, calificación y reportes CSV). */
const Datos = (() => {
  const LLAVE = "bs_datos_v2";          // v2: nuevo modelo con historial, reservas y mantenimiento
  const FILAS = 3, PUESTOS = 10;
  const LIMITE_MIN = 120;               // RP-03: un préstamo dura máximo 2 horas
  const RESERVA_MIN = 10;               // RP-02: una reserva aparta la bicicleta 10 minutos
  const KM_POR_HORA = 12;               // RP-05: velocidad promedio supuesta dentro del campus
  const CO2_KG_POR_KM = 0.12;           // RP-05: emisión aproximada de un carro particular
  const PEDALEO_MAX_MIN = 30;           // RP-05: de cada préstamo se cuentan como máximo 30 min de pedaleo
  const TIPOS_DANO = ["Llanta", "Frenos", "Cadena", "Sillín", "Otro"];
  const MIN = 60 * 1000;
  let memoria = null;

  // Reloj reemplazable (permite probar vencimientos sin esperar)
  let ahora = () => Date.now();
  function usarReloj(fn) { ahora = fn; }

  function semilla() {
    const t = ahora();
    const colores = { 1: "Rojo", 2: "Azul", 3: "Verde", 4: "Negro", 5: "Blanco" };
    const bicis = [];
    for (let n = 1; n <= FILAS * PUESTOS; n++) {
      const codigo = (n < 10 ? "B0" : "B") + n;                 // B01…B09, B10…B30
      bicis.push({ codigo, color: colores[n] || "Gris", disponible: true, prestadaA: null, nombre: null,
        desde: null, reservadaA: null, reservaHasta: null, mantenimiento: null });
    }
    // Estado inicial igual al ejemplo del notebook: B03 y B30 prestadas.
    Object.assign(bicis[2], { disponible: false, prestadaA: "202345", nombre: "Luis Torres", desde: t - 150 * MIN });   // vencida (más de 2 h)
    Object.assign(bicis[29], { disponible: false, prestadaA: "202601", nombre: "Sofía Ramírez", desde: t - 35 * MIN });
    // Una bicicleta en mantenimiento para mostrar RP-06
    bicis[16].mantenimiento = { tipo: "Frenos", fecha: t - 26 * 60 * MIN, por: "202345" };
    // Viajes anteriores (RP-04) para que el historial y los logros no empiecen vacíos
    const viaje = (bici, codigo, nombre, diasAtras, minutos, calificacion, dano) => {
      const inicio = t - diasAtras * 24 * 60 * MIN;
      return { bici, codigo, nombre, inicio, fin: inicio + minutos * MIN, minutos, calificacion, dano: dano || null };
    };
    const historial = [
      viaje("B12", "202601", "Sofía Ramírez", 6, 42, 5),
      viaje("B07", "202601", "Sofía Ramírez", 4, 150, 3),
      viaje("B21", "202601", "Sofía Ramírez", 2, 28, 4),
      viaje("B17", "202345", "Luis Torres", 1, 55, 2, "Frenos")
    ];
    return { bicis, rechazados: 0, historial };
  }

  function cargar() {
    if (memoria) return memoria;
    try {
      const txt = localStorage.getItem(LLAVE);
      if (txt) {
        const d = JSON.parse(txt);
        if (d && Array.isArray(d.bicis) && Array.isArray(d.historial)) { memoria = d; return memoria; }
      }
    } catch (e) { /* almacenamiento vacío, dañado o bloqueado */ }
    memoria = semilla();
    return memoria;
  }
  function guardar() { try { localStorage.setItem(LLAVE, JSON.stringify(memoria)); } catch (e) { /* ignorar */ } }

  // RP-02: las reservas vencidas se liberan solas
  function limpiarReservas() {
    let cambio = false;
    for (const b of cargar().bicis) {
      if (b.reservadaA && b.reservaHasta <= ahora()) { b.reservadaA = null; b.reservaHasta = null; cambio = true; }
    }
    if (cambio) guardar();
  }

  const bicis = () => { limpiarReservas(); return cargar().bicis; };
  const rechazados = () => cargar().rechazados;
  function sumarRechazado() { cargar().rechazados += 1; guardar(); }
  function reiniciar() { memoria = semilla(); guardar(); }

  // Búsqueda tolerante a minúsculas y espacios (mejora el caso "b03" del ejercicio 7).
  const normalizar = (t) => (t || "").trim().toUpperCase();
  const buscar = (codigo) => bicis().find(b => b.codigo === normalizar(codigo)) || null;

  /* Estado de una bicicleta: "disponible" | "reservada" | "prestada" | "mantenimiento" */
  function estado(b) {
    if (!b.disponible) return "prestada";
    if (b.mantenimiento) return "mantenimiento";
    if (b.reservadaA && b.reservaHasta > ahora()) return "reservada";
    return "disponible";
  }
  // Se puede prestar a este estudiante si está libre o reservada por él mismo
  const libreParaEstudiante = (b, codigo) => estado(b) === "disponible" || (estado(b) === "reservada" && b.reservadaA === codigo);

  // RP-03: minutos que lleva un préstamo y si superó el límite
  const minutosPrestada = (b) => b.desde ? Math.max(0, Math.floor((ahora() - b.desde) / MIN)) : 0;
  const vencida = (b) => !b.disponible && minutosPrestada(b) > LIMITE_MIN;
  const minutosReserva = (b) => b.reservaHasta ? Math.max(0, Math.ceil((b.reservaHasta - ahora()) / MIN)) : 0;

  function totales() {
    const c = { disponible: 0, reservada: 0, prestada: 0, mantenimiento: 0 };
    for (const b of bicis()) c[estado(b)]++;
    const total = c.disponible + c.reservada + c.prestada + c.mantenimiento;
    const porcentaje = total === 0 ? 0 : (c.prestada / total) * 100;
    const vencidas = bicis().filter(vencida).length;
    return { disponibles: c.disponible, reservadas: c.reservada, prestadas: c.prestada, mantenimiento: c.mantenimiento,
      vencidas, total, porcentaje, rechazados: rechazados() };
  }

  function prestar(codigoBici, estudiante) {
    const b = buscar(codigoBici);
    const cod = normalizar(codigoBici);
    if (!b) return { tipo: "error", texto: `No existe una bicicleta con el código ${cod || "(vacío)"}` };
    const e = estado(b);
    if (e === "prestada") return { tipo: "aviso", texto: `Aviso: la bicicleta ${b.codigo} ya está prestada.` };
    if (e === "mantenimiento") return { tipo: "aviso", texto: `Aviso: la bicicleta ${b.codigo} está en mantenimiento (${b.mantenimiento.tipo}). Elige otra.` };
    if (e === "reservada" && b.reservadaA !== estudiante.codigo) {
      return { tipo: "aviso", texto: `Aviso: la bicicleta ${b.codigo} está reservada por otra persona durante ${minutosReserva(b)} min más.` };
    }
    Object.assign(b, { disponible: false, prestadaA: estudiante.codigo, nombre: estudiante.nombre, desde: ahora(), reservadaA: null, reservaHasta: null });
    guardar();
    return { tipo: "ok", texto: `Listo: la bicicleta ${b.codigo} fue prestada. Recuerda devolverla antes de ${LIMITE_MIN / 60} horas.` };
  }

  /* RP-02: reservar una bicicleta disponible por 10 minutos (máximo una reserva por estudiante) */
  function reservar(codigoBici, estudiante) {
    const b = buscar(codigoBici);
    if (!b) return { tipo: "error", texto: `No existe una bicicleta con el código ${normalizar(codigoBici) || "(vacío)"}` };
    if (estado(b) !== "disponible") return { tipo: "aviso", texto: `Aviso: la bicicleta ${b.codigo} no está disponible para reservar.` };
    const otra = bicis().find(x => estado(x) === "reservada" && x.reservadaA === estudiante.codigo);
    if (otra) return { tipo: "aviso", texto: `Ya tienes reservada la ${otra.codigo}. Solo se permite una reserva a la vez.` };
    b.reservadaA = estudiante.codigo; b.reservaHasta = ahora() + RESERVA_MIN * MIN;
    guardar();
    return { tipo: "ok", texto: `Reservaste la ${b.codigo} por ${RESERVA_MIN} minutos. Pásate por la estación para retirarla.` };
  }
  function cancelarReserva(codigoBici, sesion) {
    const b = buscar(codigoBici);
    if (!b || estado(b) !== "reservada") return { tipo: "aviso", texto: "No hay una reserva activa para esa bicicleta." };
    if (sesion.rol !== "Administrador" && b.reservadaA !== sesion.codigo) return { tipo: "aviso", texto: "Esa reserva no es tuya." };
    b.reservadaA = null; b.reservaHasta = null; guardar();
    return { tipo: "ok", texto: `Reserva de la ${b.codigo} cancelada.` };
  }

  /* opciones: { calificacion: 1-5 | null, dano: uno de TIPOS_DANO | null } */
  function devolver(codigoBici, sesion, opciones) {
    const op = opciones || {};
    const b = buscar(codigoBici);
    const cod = normalizar(codigoBici);
    if (!b) return { tipo: "error", texto: `No existe una bicicleta con el código ${cod || "(vacío)"}` };
    if (b.disponible) return { tipo: "aviso", texto: `Aviso: la bicicleta ${b.codigo} no estaba prestada.` };
    if (sesion.rol !== "Administrador" && b.prestadaA !== sesion.codigo) {
      return { tipo: "aviso", texto: `Aviso: la bicicleta ${b.codigo} no está prestada a tu cuenta. Pide ayuda a la administración.` };
    }
    const calificacion = Number.isInteger(op.calificacion) && op.calificacion >= 1 && op.calificacion <= 5 ? op.calificacion : null;
    const dano = TIPOS_DANO.includes(op.dano) ? op.dano : null;
    const fin = ahora();
    const inicio = b.desde || fin;
    const minutos = Math.max(1, Math.round((fin - inicio) / MIN));
    cargar().historial.push({ bici: b.codigo, codigo: b.prestadaA, nombre: b.nombre, inicio, fin, minutos, calificacion, dano });
    const tarde = minutos > LIMITE_MIN;
    Object.assign(b, { disponible: true, prestadaA: null, nombre: null, desde: null });
    if (dano) b.mantenimiento = { tipo: dano, fecha: fin, por: sesion.codigo };
    guardar();
    let texto = `Gracias: la bicicleta ${b.codigo} fue devuelta (${duracion(minutos)}).`;
    if (dano) texto += ` Quedó en mantenimiento por: ${dano}.`;
    if (tarde) texto += " Se entregó después del límite de 2 horas.";
    return { tipo: tarde ? "aviso" : "ok", texto };
  }

  /* RP-06: la administración marca la bicicleta como reparada */
  function reparar(codigoBici) {
    const b = buscar(codigoBici);
    if (!b || !b.mantenimiento) return { tipo: "aviso", texto: "Esa bicicleta no está en mantenimiento." };
    b.mantenimiento = null; guardar();
    return { tipo: "ok", texto: `La bicicleta ${b.codigo} volvió a estar disponible.` };
  }

  // RP-04: historial (más reciente primero); sin código devuelve el de todos
  const historial = (codigo) => cargar().historial.filter(v => !codigo || v.codigo === codigo).slice().sort((a, b) => b.fin - a.fin);

  // RP-05: huella verde estimada a partir de los minutos pedaleados
  function resumen(codigo) {
    const viajes = historial(codigo);
    const minutos = viajes.reduce((s, v) => s + v.minutos, 0);
    const pedaleo = viajes.reduce((s, v) => s + Math.min(v.minutos, PEDALEO_MAX_MIN), 0);
    const km = pedaleo / 60 * KM_POR_HORA;
    return { viajes: viajes.length, minutos, km, co2: km * CO2_KG_POR_KM,
      puntuales: viajes.filter(v => v.minutos <= LIMITE_MIN).length, danos: viajes.filter(v => v.dano).length };
  }

  // RP-08: logros calculados a partir del historial
  function logros(codigo) {
    const r = resumen(codigo);
    const def = [
      { id: "primero", nombre: "Primer pedalazo", desc: "Completa tu primer viaje.", valor: r.viajes, meta: 1 },
      { id: "frecuente", nombre: "Ciclista frecuente", desc: "Completa 5 viajes.", valor: r.viajes, meta: 5 },
      { id: "puntual", nombre: "Siempre a tiempo", desc: "Devuelve 3 bicicletas antes de 2 horas.", valor: r.puntuales, meta: 3 },
      { id: "guardian", nombre: "Guardián de la flota", desc: "Reporta un daño al devolver.", valor: r.danos, meta: 1 },
      { id: "verde", nombre: "Kilómetro verde", desc: "Acumula 25 km pedaleados.", valor: Math.floor(r.km), meta: 25 }
    ];
    return def.map(l => ({ ...l, valor: Math.min(l.valor, l.meta), obtenido: l.valor >= l.meta }));
  }

  // RP-09: satisfacción promedio de los viajes calificados
  function satisfaccion() {
    const notas = cargar().historial.map(v => v.calificacion).filter(n => n);
    return { n: notas.length, promedio: notas.length ? notas.reduce((s, n) => s + n, 0) / notas.length : 0 };
  }

  // RP-10: reportes CSV (separador ";" para que Excel en español separe las columnas)
  const celda = (v) => { const t = v == null ? "" : String(v); return /[";\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const fechaISO = (ms) => ms ? new Date(ms).toISOString().replace("T", " ").slice(0, 16) : "";
  const filasCsv = (filas) => "﻿" + filas.map(f => f.map(celda).join(";")).join("\r\n") + "\r\n";
  function csvBicis() {
    return filasCsv([["Código", "Color", "Estado", "Código estudiante", "Nombre", "Prestada desde (UTC)", "Minutos", "Daño"],
      ...bicis().map(b => [b.codigo, b.color, estado(b), b.prestadaA, b.nombre, fechaISO(b.desde), b.disponible ? "" : minutosPrestada(b), b.mantenimiento ? b.mantenimiento.tipo : ""])]);
  }
  function csvHistorial() {
    return filasCsv([["Bicicleta", "Código estudiante", "Nombre", "Inicio (UTC)", "Fin (UTC)", "Minutos", "Calificación", "Daño"],
      ...historial().map(v => [v.bici, v.codigo, v.nombre, fechaISO(v.inicio), fechaISO(v.fin), v.minutos, v.calificacion, v.dano])]);
  }

  function duracion(min) {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }

  return { bicis, buscar, estado, libreParaEstudiante, totales, prestar, devolver, reservar, cancelarReserva, reparar, sumarRechazado, reiniciar, normalizar,
    minutosPrestada, vencida, minutosReserva, historial, resumen, logros, satisfaccion, csvBicis, csvHistorial, duracion, usarReloj,
    FILAS, PUESTOS, LIMITE_MIN, RESERVA_MIN, TIPOS_DANO };
})();

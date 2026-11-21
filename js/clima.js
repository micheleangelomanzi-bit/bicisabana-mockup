/* BiciSabana · RP-11 Alerta de lluvia.
   Consulta el pronóstico real del campus (Chía, Cundinamarca) en Open-Meteo, un servicio gratuito sin llave.
   Se guarda 30 minutos en la pestaña para no repetir la consulta. Si falla, la página sigue funcionando. */
const Clima = (() => {
  const LAT = 4.8617, LON = -74.0336;   // Universidad de La Sabana (aproximado)
  const URL_API = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    "&current=temperature_2m,precipitation&hourly=precipitation_probability&forecast_hours=3&timezone=America%2FBogota";
  const LLAVE = "bs_clima", VIGENCIA = 30 * 60 * 1000;
  let promesa = null;

  // Convierte la respuesta de la API en { prob, temp, lloviendo, hora }
  function interpretar(d) {
    const probs = ((d && d.hourly && d.hourly.precipitation_probability) || []).filter(n => typeof n === "number");
    const prob = probs.length ? Math.max(...probs) : null;
    const temp = d && d.current && typeof d.current.temperature_2m === "number" ? d.current.temperature_2m : null;
    const lloviendo = !!(d && d.current && d.current.precipitation > 0);
    if (prob === null && temp === null) throw new Error("respuesta sin datos");
    return { prob, temp, lloviendo, hora: Date.now() };
  }

  // alta: está lloviendo o hay 60 % o más · media: 30 % a 59 % · baja: menos de 30 %
  function nivel(c) {
    if (c.lloviendo || (c.prob !== null && c.prob >= 60)) return "alta";
    if (c.prob !== null && c.prob >= 30) return "media";
    return "baja";
  }
  const CONSEJOS = {
    alta: "Se viene lluvia: lleva chaqueta impermeable y frena con más distancia.",
    media: "Puede lloviznar. Si vas lejos, lleva algo para la lluvia.",
    baja: "Buen momento para pedalear por el campus."
  };

  function consultar() {
    if (promesa) return promesa;
    try {
      const g = JSON.parse(sessionStorage.getItem(LLAVE));
      if (g && Date.now() - g.hora < VIGENCIA) return (promesa = Promise.resolve(g));
    } catch (e) { /* sin almacenamiento */ }
    if (typeof fetch !== "function") return Promise.resolve(null);
    const ctrl = typeof AbortController === "function" ? new AbortController() : null;
    const limite = setTimeout(() => ctrl && ctrl.abort(), 7000);
    promesa = fetch(URL_API, ctrl ? { signal: ctrl.signal } : {})
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(interpretar)
      .then(c => { try { sessionStorage.setItem(LLAVE, JSON.stringify(c)); } catch (e) { /* ignorar */ } return c; })
      .catch(() => { promesa = null; return null; })
      .finally(() => clearTimeout(limite));
    return promesa;
  }

  return { consultar, interpretar, nivel, CONSEJOS };
})();

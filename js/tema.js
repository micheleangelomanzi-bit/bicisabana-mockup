/* BiciSabana · RP-01 Modo oscuro.
   Se carga en <head> para aplicar el tema antes de pintar. Por defecto sigue la preferencia del sistema;
   la elección del usuario se recuerda en este navegador (si el almacenamiento falla, dura mientras la página siga abierta). */
const Tema = (() => {
  const LLAVE = "bs_tema";
  let elegido = null;
  try { elegido = localStorage.getItem(LLAVE); } catch (e) { /* almacenamiento bloqueado */ }
  const sistemaOscuro = () => { try { return window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; } };
  const actual = () => (elegido === "oscuro" || elegido === "claro") ? elegido : (sistemaOscuro() ? "oscuro" : "claro");
  const aplicar = () => { document.documentElement.dataset.tema = actual(); };
  function alternar() {
    elegido = actual() === "oscuro" ? "claro" : "oscuro";
    try { localStorage.setItem(LLAVE, elegido); } catch (e) { /* se mantiene en memoria */ }
    aplicar();
    return elegido;
  }
  aplicar();
  return { actual, alternar };
})();

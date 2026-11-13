/* BiciSabana · Autenticación SIMULADA (solo front-end, con fines académicos).
   No ofrece seguridad real: un sistema real autentica en servidor, con hash + sal y HTTPS. */
const Auth = (() => {
  const LLAVE_SESION = "bs_sesion";
  const LLAVE_BLOQUEO = "bs_bloqueo";
  const MAX_INTENTOS = 3;          // intentos fallidos antes del bloqueo
  const SEGUNDOS_BLOQUEO = 30;     // duración del bloqueo temporal
  const MINUTOS_INACTIVIDAD = 10;  // cierre de sesión por inactividad (configurable)

  // Cuentas FICTICIAS de demostración. Solo se guarda el hash SHA-256 de "codigo:contraseña".
  const CUENTAS = [
    { codigo: "202601", nombre: "Sofía Ramírez", rol: "Estudiante",
      hash: "2a88da701d1c94541eaa67af1505752b3dbd14064e23b81115c31f17adf73ac8" },
    { codigo: "100001", nombre: "Laura (Administradora)", rol: "Administrador",
      hash: "caca43a3177b2818c2516e560e7d8a171856815c3c6dbac5f7c21ffcd28a85a8" }
  ];

  const leer = (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } };
  const guardar = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  const borrar = (k) => { try { sessionStorage.removeItem(k); } catch (e) { /* nada */ } };

  async function sha256(texto) {
    const datos = new TextEncoder().encode(texto);
    const buf = await crypto.subtle.digest("SHA-256", datos);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // Regla del notebook (RF-08): el código tiene exactamente 6 números.
  function codigoValido(codigo) {
    return typeof codigo === "string" && /^[0-9]{6}$/.test(codigo);
  }

  function segundosBloqueo() {
    const b = leer(LLAVE_BLOQUEO);
    if (!b || !b.hasta) return 0;
    const resto = Math.ceil((b.hasta - Date.now()) / 1000);
    if (resto <= 0) { borrar(LLAVE_BLOQUEO); return 0; }
    return resto;
  }

  function registrarFallo() {
    const b = leer(LLAVE_BLOQUEO) || { fallos: 0 };
    b.fallos = (b.fallos || 0) + 1;
    if (b.fallos >= MAX_INTENTOS) { b.hasta = Date.now() + SEGUNDOS_BLOQUEO * 1000; b.fallos = 0; }
    guardar(LLAVE_BLOQUEO, b);
    return b.fallos;
  }

  /* Devuelve { ok, mensaje, tipo } */
  async function iniciarSesion(codigo, clave) {
    const espera = segundosBloqueo();
    if (espera > 0) return { ok: false, tipo: "aviso", mensaje: `Demasiados intentos. Intenta de nuevo en ${espera} segundos.` };
    codigo = (codigo || "").trim();
    if (codigo === "") { return { ok: false, tipo: "error", mensaje: "Escribe tu código de estudiante." }; }
    if (!codigoValido(codigo)) {
      registrarFallo();
      if (typeof Datos !== "undefined") Datos.sumarRechazado();
      return { ok: false, tipo: "error", mensaje: "Código inválido. Debe tener exactamente 6 números." };
    }
    if (!clave) { return { ok: false, tipo: "error", mensaje: "Escribe tu contraseña." }; }
    const hash = await sha256(`${codigo}:${clave}`);
    const cuenta = CUENTAS.find(c => c.codigo === codigo && c.hash === hash);
    if (!cuenta) {
      const fallos = registrarFallo();
      const restantes = MAX_INTENTOS - fallos;
      const extra = segundosBloqueo() > 0
        ? ` Acceso bloqueado por ${SEGUNDOS_BLOQUEO} segundos.`
        : ` Te quedan ${restantes} intento(s).`;
      return { ok: false, tipo: "error", mensaje: "Código o contraseña incorrectos." + extra };
    }
    borrar(LLAVE_BLOQUEO);
    guardar(LLAVE_SESION, { codigo: cuenta.codigo, nombre: cuenta.nombre, rol: cuenta.rol, ultimo: Date.now() });
    return { ok: true, tipo: "ok", mensaje: "Bienvenido(a)." };
  }

  const sesion = () => leer(LLAVE_SESION);

  function cerrarSesion(motivo) {
    borrar(LLAVE_SESION);
    window.location.href = "index.html" + (motivo ? "?motivo=" + encodeURIComponent(motivo) : "");
  }

  /* Protege pantallas internas: sin sesión (o vencida) vuelve al login. */
  function exigirSesion() {
    const s = sesion();
    const vencida = s && (Date.now() - s.ultimo > MINUTOS_INACTIVIDAD * 60 * 1000);
    if (!s || vencida) { cerrarSesion(vencida ? "inactividad" : "protegida"); return null; }
    iniciarVigilanciaInactividad();
    return s;
  }

  let temporizador;
  function iniciarVigilanciaInactividad() {
    const reiniciar = () => {
      const s = sesion(); if (!s) return;
      s.ultimo = Date.now(); guardar(LLAVE_SESION, s);
      clearTimeout(temporizador);
      temporizador = setTimeout(() => cerrarSesion("inactividad"), MINUTOS_INACTIVIDAD * 60 * 1000);
    };
    ["click", "keydown", "touchstart"].forEach(ev => document.addEventListener(ev, reiniciar, { passive: true }));
    reiniciar();
  }

  return { iniciarSesion, sesion, cerrarSesion, exigirSesion, codigoValido, segundosBloqueo, CUENTAS };
})();

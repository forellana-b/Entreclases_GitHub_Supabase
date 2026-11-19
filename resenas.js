const Resenas = (() => {
  const config = window.ENTRECLASES_CONFIG || {};
  const client = config.url && config.publishableKey && window.supabase
    ? window.supabase.createClient(config.url, config.publishableKey)
    : null;
  function checkConnection() {
    if (!client) throw new Error("Revisa config.js y tu conexión a internet.");
  }
  async function leer() {
    checkConnection();
    const result = [], pageSize = 200;
    for (let first = 0; ; first += pageSize) {
      const { data, error } = await client.from("resenas")
        .select("id,lugar_id,estrellas,alias,comentario,creado_en")
        .order("creado_en").order("id").range(first, first + pageSize - 1);
      if (error) throw error;
      result.push(...data.map(row => ({
        id: row.lugar_id, stars: row.estrellas, author: row.alias, text: row.comentario
      })));
      if (data.length < pageSize) return result;
    }
  }
  async function guardar(lugar, stars, author, text) {
    checkConnection();
    const { data, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (!data.session) {
      const { error } = await client.auth.signInAnonymously();
      if (error) throw error;
    }
    const { error } = await client.from("resenas").insert({
      lugar_id: lugar, estrellas: stars, alias: author, comentario: text
    });
    if (error) throw error;
  }
  return { leer, guardar };
})();

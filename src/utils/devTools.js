// ─── Inspecionar todos os tokens -------------------------------------------------------------------------------------

export function inspecionarTokens() {
  if (import.meta.env.PROD) {
    console.warn('[devTools] Indisponível em produção.');
    return;
  }

  const resultado = [];

  // Verifica localStorage e sessionStorage
  [localStorage, sessionStorage].forEach((storage, idx) => {
    const nome = idx === 0 ? 'localStorage' : 'sessionStorage';
    Object.keys(storage).forEach((key) => {
      const raw = storage.getItem(key);
      try {
        const item = JSON.parse(raw);
        // Entrada MSAL com expiração
        if (item?.expiresOn || item?.extended_expires_on || item?.extendedExpiresOn) {
          const ts = item.expiresOn || item.extended_expires_on || item.extendedExpiresOn;
          const expiresOn = new Date(Number(ts) * 1000);
          resultado.push({
            storage: nome,
            chave: key.substring(0, 60) + (key.length > 60 ? '...' : ''),
            expiresOn: expiresOn.toLocaleString(),
            expirado: expiresOn < new Date() ? '❌ Sim' : '✅ Não',
          });
        }
        // Entrada MSAL encriptada (lastUpdatedAt sem expiresOn)
        if (item?.data && item?.lastUpdatedAt) {
          resultado.push({
            storage: nome,
            chave: key.substring(0, 60) + (key.length > 60 ? '...' : ''),
            expiresOn: 'Encriptado pelo MSAL v3',
            expirado: '⚠️ Não verificável',
          });
        }
      } catch {
        // JWT raw
        if (raw?.startsWith('eyJ')) {
          resultado.push({
            storage: nome,
            chave: key,
            expiresOn: 'JWT raw — decode manual necessário',
            expirado: '⚠️ Ver abaixo',
          });
        }
      }
    });
  });

  if (resultado.length === 0) {
    console.warn('[devTools] Nenhum token encontrado. Estás autenticado?');
    return;
  }

  console.table(resultado);

  // Decodifica o JWT raw para mostrar expiração real
  Object.keys(localStorage).forEach((key) => {
    const raw = localStorage.getItem(key);
    if (raw?.startsWith('eyJ')) {
      try {
        const payload = JSON.parse(atob(raw.split('.')[1]));
        const exp = new Date(payload.exp * 1000);
        console.info(
          `🔍 JWT "${key}" expira em: ${exp.toLocaleString()} — expirado: ${exp < new Date() ? '❌ Sim' : '✅ Não'}`
        );
      } catch {
        /* ignora */
      }
    }
  });
}

// ─── Limpar sessão MSAL ----------------------------------------------------------------------------------------------

export function limparSessaoMsal() {
  if (import.meta.env.PROD) {
    console.warn('[devTools] Indisponível em produção.');
    return;
  }

  let count = 0;
  [localStorage, sessionStorage].forEach((storage) => {
    Object.keys(storage)
      .filter((key) => key.toLowerCase().includes('msal') || key === 'accessToken')
      .forEach((key) => {
        storage.removeItem(key);
        count++;
      });
  });

  console.info(`🗑️ [devTools] ${count} entrada(s) removida(s).`);
}

// ─── Expõe no window -------------------------------------------------------------------------------------------------

if (import.meta.env.DEV) {
  window.__dev = { inspecionarTokens, limparSessaoMsal };

  console.info(
    '🛠️ [devTools] Funções disponíveis:\n' +
      '  __dev.inspecionarTokens()     — estado atual dos tokens\n' +
      '  __dev.limparSessaoMsal()      — limpa sessão completa\n'
  );
}

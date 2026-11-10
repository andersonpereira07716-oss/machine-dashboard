const QUEUE_KEY = 'nexa_offline_queue';

export const guardarOffline = (acao) => {
  const fila = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  fila.push({ ...acao, timestamp: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(fila));
  console.log('[OFFLINE] Ação guardada na fila local:', acao);
};

export const processarFilaOffline = async (callbackEnvio) => {
  const fila = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  if (fila.length === 0) return;

  console.log(`[OFFLINE] A processar ${fila.length} itens pendentes...`);
  const restantes = [];
  for (const item of fila) {
    try {
      const sucesso = await callbackEnvio(item);
      if (!sucesso) restantes.push(item);
    } catch (e) {
      restantes.push(item);
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(restantes));
};

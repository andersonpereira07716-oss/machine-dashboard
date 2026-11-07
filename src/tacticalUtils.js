// Utilitários Avançados para A Máquina - Gov-Ops Resilience Engine

export const guardarOcorrenciaOffline = (dados) => {
  try {
    const chave = 'a_maquina_sync_queue';
    const pendentes = JSON.parse(localStorage.getItem(chave) || '[]');
    
    const novoRegisto = {
      id: 'offline_' + Date.now(),
      ...dados,
      timestamp: new Date().toISOString(),
      sincronizado: false
    };
    
    pendentes.push(novoRegisto);
    localStorage.setItem(chave, JSON.stringify(pendentes));
    console.log('[+] Registo gravado na fila de contingência offline.');
    return true;
  } catch (e) {
    console.error('[-] Erro crítico no armazenamento local:', e);
    return false;
  }
};

export const obterLocalizacaoAtual = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // Fallback padrão para Patos-PB em caso de ausência total de hardware GPS
      console.warn('[-] Geolocalização não suportada. A utilizar coordenada padrão de Patos-PB.');
      resolve([-7.0142, -37.2910]);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.warn('[-] Falha no sinal GPS (' + error.message + '). Utilizando setor base Patos-PB.');
        // Fallback tático para manter o operador operacional sem travar o app
        resolve([-7.0142, -37.2910]);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
};

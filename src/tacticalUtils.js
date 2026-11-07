// Utilitários para A Máquina - Gestão Offline e SOS Tático

export const guardarOcorrenciaOffline = (dados) => {
  try {
    const pendentes = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    pendentes.push({ ...dados, timestamp: new Date().toISOString() });
    localStorage.setItem('offline_queue', JSON.stringify(pendentes));
    console.log('[+] Ocorrência guardada localmente (Modo Offline).');
    return true;
  } catch (e) {
    console.error('[-] Erro ao guardar offline:', e);
    return false;
  }
};

export const obterLocalizacaoAtual = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocalização não suportada pelo navegador.');
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          reject('Não foi possível obter a posição GPS.');
        }
      );
    }
  });
};

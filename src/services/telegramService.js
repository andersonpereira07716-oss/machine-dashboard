export const dispararAlertaTelegramTatico = async (detalhesAlvo) => {
  const TOKEN = import.meta.env.VITE_TELEGRAM_TOKEN || '9209061704:AAFQVzgb66KVrCLoD38Am1YdwVJNLkuZrfQ';
  const CHAT_ID = import.meta.env.VITE_CHAT_ID || '7370681538';
  
  const mensagem = `🚨 **[CENTRAL CAD - PROTOCOLO TÁTICO]** 🚨\n\n` +
                   `🎯 **Alvo:** ${detalhesAlvo || 'Carlos Alberto (Foragido Prisional)'}\n` +
                   `📍 **Localização:** Patos-PB (-7.0142, -37.2910)\n` +
                   `🔒 **Estado:** Protocolo de interceção acionado em campo.\n` +
                   `⚡ **Transmissão:** Sincronizado via A Máquina Gov-Ops.`;

  if (!navigator.onLine) {
    const fila = JSON.parse(localStorage.getItem('telegram_offline_queue') || '[]');
    fila.push({ mensagem, timestamp: new Date().toISOString() });
    localStorage.setItem('telegram_offline_queue', JSON.stringify(fila));
    alert('⚠️ Sem conexão! Alerta retido na fila local. Será transmitido assim que recuperar o sinal.');
    return false;
  }

  try {
    const fila = JSON.parse(localStorage.getItem('telegram_offline_queue') || '[]');
    if (fila.length > 0) {
      for (const item of fila) {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: item.mensagem + `\n*(Enviado após reconexão)*`, parse_mode: 'Markdown' })
        });
      }
      localStorage.removeItem('telegram_offline_queue');
    }

    const resposta = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensagem,
        parse_mode: 'Markdown'
      })
    });
    
    const resultado = await resposta.json();
    return resultado.ok;
  } catch (erro) {
    const fila = JSON.parse(localStorage.getItem('telegram_offline_queue') || '[]');
    fila.push({ mensagem, timestamp: new Date().toISOString() });
    localStorage.setItem('telegram_offline_queue', JSON.stringify(fila));
    return false;
  }
};

window.addEventListener('online', () => {
  dispararAlertaTelegramTatico('Sincronização Automática Pós-Queda de Rede');
});

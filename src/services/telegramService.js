export const dispararAlertaTelegramTatico = async (detalhesAlvo) => {
  const TOKEN = import.meta.env.VITE_TELEGRAM_TOKEN || '9209061704:AAFQVzgb66KVrCLoD38Am1YdwVJNLkuZrfQ';
  const CHAT_ID = import.meta.env.VITE_CHAT_ID || '7370681538';
  
  const mensagem = `🚨 **[CENTRAL CAD - PROTOCOLO TÁTICO]** 🚨\n\n` +
                   `🎯 **Alvo:** ${detalhesAlvo || 'Carlos Alberto (Foragido Prisional)'}\n` +
                   `📍 **Localização:** Patos-PB (-7.0142, -37.2910)\n` +
                   `🔒 **Estado:** Protocolo de interceção acionado em campo.\n` +
                   `⚡ **Transmissão:** Sincronizado via A Máquina Gov-Ops.`;

  // Verificar se o dispositivo está online
  if (!navigator.onLine) {
    console.warn('[-] Dispositivo offline. A guardar alerta na fila de contingência local...');
    const fila = JSON.parse(localStorage.getItem('telegram_offline_queue') || '[]');
    fila.push({ mensagem, timestamp: new Date().toISOString() });
    localStorage.setItem('telegram_offline_queue', JSON.stringify(fila));
    alert('⚠️ Sem conexão à internet! O alerta foi guardado na fila e será enviado automaticamente assim que o sinal for restabelecido.');
    return false;
  }

  try {
    // Tentar enviar pendentes anteriores da fila primeiro
    const fila = JSON.parse(localStorage.getItem('telegram_offline_queue') || '[]');
    if (fila.length > 0) {
      console.log(`[*] A descarregar ${fila.length} alertas pendentes da fila offline...`);
      for (const item of fila) {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: item.mensagem + `\n*(Enviado após reconexão)*`, parse_mode: 'Markdown' })
        });
      }
      localStorage.removeItem('telegram_offline_queue');
    }

    // Enviar o alerta atual
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
    if (resultado.ok) {
      console.log('[+] Alerta tático enviado com sucesso para o Telegram!');
      return true;
    } else {
      console.error('[-] Rejeitado pela API do Telegram:', resultado);
      return false;
    }
  } catch (erro) {
    console.error('[-] Falha de rede. A guardar na fila offline:', erro);
    const fila = JSON.parse(localStorage.getItem('telegram_offline_queue') || '[]');
    fila.push({ mensagem, timestamp: new Date().toISOString() });
    localStorage.setItem('telegram_offline_queue', JSON.stringify(fila));
    return false;
  }
};

// Deteta automaticamente quando a internet volta e dispara a fila
window.addEventListener('online', () => {
  console.log('[+] Conexão detetada. A processar fila offline do Telegram...');
  dispararAlertaTelegramTatico('Sincronização Automática Pós-Queda de Rede');
});

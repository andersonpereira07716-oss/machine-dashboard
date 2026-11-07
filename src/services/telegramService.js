export const dispararAlertaTelegramTatico = async (detalhesAlvo) => {
  const TOKEN = '9209061704:AAFQVzgb66KVrCLoD38Am1YdwVJNLkuZrfQ';
  const CHAT_ID = '7370681538';
  
  console.log("[*] Função dispararAlertaTelegramTatico acionada!");
  
  const mensagem = `🚨 **[CENTRAL CAD - PROTOCOLO TÁTICO WEB]** 🚨\n\n` +
                   `🎯 **Alvo:** ${detalhesAlvo || 'Carlos Alberto (Foragido Prisional)'}\n` +
                   `📍 **Localização:** Patos-PB (-7.0142, -37.2910)\n` +
                   `🔒 **Estado:** Acionado via Botão Tático (Interface PWA).\n` +
                   `⚡ **Transmissão:** @TheMachineAlertsBot Operacional.`;

  try {
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
      alert('🚀 Alerta enviado com sucesso para o Telegram!');
      return true;
    } else {
      alert('❌ Erro na API do Telegram: ' + (resultado.description || 'Desconhecido'));
      return false;
    }
  } catch (erro) {
    alert('⚠️ Erro de rede ao contactar o Telegram: ' + erro.message);
    return false;
  }
};

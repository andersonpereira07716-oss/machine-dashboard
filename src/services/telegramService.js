export const dispararAlertaTelegramTatico = async (detalhesAlvo) => {
  const TOKEN = '9209061704:AAFQVzgb66KVrCLoD38Am1YdwVJNLkuZrfQ';
  const CHAT_ID = '7370681538';
  
  const mensagem = `🚨 **[CENTRAL CAD - PROTOCOLO TÁTICO]** 🚨\n\n` +
                   `🎯 **Alvo:** ${detalhesAlvo || 'Carlos Alberto (Foragido Prisional)'}\n` +
                   `📍 **Localização:** Patos-PB (-7.0142, -37.2910)\n` +
                   `🔒 **Estado:** Protocolo de interceção acionado pelo operador via PWA.\n` +
                   `⚡ **Transmissão:** Sincronizado com A Máquina Gov-Ops.`;

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
      console.log('[+] Alerta tático enviado com sucesso!');
      alert('🚀 Alerta transmitido com sucesso para o Telegram!');
      return true;
    } else {
      console.error('[-] Erro retornado pelo Telegram:', resultado);
      alert('❌ Erro ao enviar para o Telegram. Verifique o console.');
      return false;
    }
  } catch (erro) {
    console.error('[-] Falha de rede:', erro);
    alert('⚠️ Erro de rede ao tentar contactar o Telegram.');
    return false;
  }
};

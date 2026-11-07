export const dispararAlertaTelegramTatico = async (detalhesAlvo) => {
  const TOKEN = '9209061704:AAFQVzgb66KVrCLoD38Am1YdwVJNLkuZrfQ';
  const CHAT_ID = '7370681538';
  
  const mensagem = `🚨 **[CENTRAL CAD - PROTOCOLO TÁTICO]** 🚨\n\n` +
                   `🎯 **Alvo:** ${detalhesAlvo || 'Carlos Alberto (Foragido Prisional)'}\n` +
                   `📍 **Localização:** Patos-PB (-7.0142, -37.2910)\n` +
                   `🔒 **Estado:** Protocolo de interceção acionado pelo operador em campo.\n` +
                   `⚡ **Transmissão:** Sincronizado via A Máquina Gov-Ops.`;

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
      console.log('[+] Alerta enviado com sucesso para o Telegram!');
      return true;
    } else {
      console.error('[-] Rejeitado pela API do Telegram:', resultado);
      return false;
    }
  } catch (erro) {
    console.error('[-] Erro de rede ao contactar o Telegram:', erro);
    return false;
  }
};

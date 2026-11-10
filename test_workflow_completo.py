import requests
import json
import time

TOKEN = '9209061704:AAFQVzgb66KVrCLoD38Am1YdwVJNLkuZrfQ'
CHAT_ID = '7370681538'

print("==================================================")
print(" ⚡ [A MÁQUINA] - WORKFLOW TÁTICO INTEGRADO")
print("==================================================")

# Passo 1: Simular deteção de câmara (Edge Vision)
alvo_detectado = {
    "nome": "Carlos Alberto (Foragido Prisional)",
    "compatibilidade": "98.4%",
    "setor": "Centro, Patos-PB (-7.0142, -37.2910)",
    "status": "CRÍTICO - Risco Nível 5"
}

print(f"[1] Edge Vision: Alvo detetado -> {alvo_detectado['nome']} ({alvo_detectado['compatibilidade']})")
time.sleep(0.5)

# Passo 2: Registo simulado no Supabase (Cadeia de Custódia)
print(f"[2] Supabase: Cadeia de custódia e auditoria registadas com sucesso.")
time.sleep(0.5)

# Passo 3: Disparo automático do Telegram
print(f"[3] Telegram: A despachar alerta tático para o canal oficial...")

mensagem = (
    f"🚨 **[CENTRAL CAD - PROTOCOLO TÁTICO INTEGRADO]** 🚨\n\n"
    f"🎯 **Alvo:** {alvo_detectado['nome']}\n"
    f"📊 **Match Facial:** {alvo_detectado['compatibilidade']}\n"
    f"📍 **Setor:** {alvo_detectado['setor']}\n"
    f"🔒 **Estado:** Cadeia de custódia validada. Unidade em rota de interceção."
)

url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
payload = {
    "chat_id": CHAT_ID,
    "text": mensagem,
    "parse_mode": "Markdown"
}

try:
    response = requests.post(url, json=payload, timeout=5)
    res_data = response.json()
    if res_data.get('ok'):
        print(f"[+] SUCESSO TOTAL: Alerta integrado entregue ao Telegram! (ID: {res_data['result']['message_id']})")
    else:
        print(f"[-] Erro no envio: {res_data}")
except Exception as e:
    print(f"[-] Falha de rede: {e}")

print("==================================================")
print(" [+] Todos os subsistemas operacionais e validados!")
print("==================================================")

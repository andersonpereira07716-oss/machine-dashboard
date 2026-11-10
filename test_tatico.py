import requests
import json
import os

TOKEN = '9209061704:AAFQVzgb66KVrCLoD38Am1YdwVJNLkuZrfQ'
CHAT_ID = '7370681538'

print("==================================================")
print(" 🚀 [A MÁQUINA] - DIAGNÓSTICO DO TELEGRAM & GOV-OPS")
print("==================================================")

# 1. Testar Validade do Bot
print("[*] A verificar token do bot...")
me_url = f"https://api.telegram.org/bot{TOKEN}/getMe"
try:
    res_me = requests.get(me_url, timeout=5)
    data_me = res_me.json()
    if data_me.get('ok'):
        print(f"[+] SUCESSO: Bot verificado -> @{data_me['result']['username']}")
    else:
        print(f"[-] ERRO: Token inválido ou revogado -> {data_me}")
        exit(1)
except Exception as e:
    print(f"[-] ERRO DE REDE (getMe): {e}")
    exit(1)

# 2. Testar Envio Direto de Alerta Tático
print("\n[*] A enviar alerta tático simulado para o Telegram...")
send_url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
payload = {
    "chat_id": CHAT_ID,
    "text": "🚨 **[CENTRAL CAD - TESTE DIRETO TERMUX]** 🚨\n\n🎯 **Alvo:** Carlos Alberto (Foragido Prisional)\n📍 **Localização:** Patos-PB (-7.0142, -37.2910)\n🔒 **Estado:** Teste de diagnóstico executado via terminal.\n⚡ **Transmissão:** Operacional.",
    "parse_mode": "Markdown"
}

try:
    res_send = requests.post(send_url, json=payload, timeout=5)
    data_send = res_send.json()
    if data_send.get('ok'):
        print(f"[+] SUCESSO: Mensagem enviada para o chat {CHAT_ID}!")
        print(f"    ID da Mensagem: {data_send['result']['message_id']}")
    else:
        print(f"[-] ERRO NO ENVIO: {data_send}")
except Exception as e:
    print(f"[-] ERRO DE REDE (sendMessage): {e}")

print("==================================================")
print(" [+] Testes concluídos com sucesso!")
print("==================================================")

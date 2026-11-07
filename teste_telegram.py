import os
import requests

token = os.environ.get("TELEGRAM_BOT_TOKEN")
chat_id = os.environ.get("TELEGRAM_CHAT_ID")

url = f"https://api.telegram.org/bot{token}/sendMessage"
payload = {
    "chat_id": chat_id,
    "text": "🚨 [MÁQUINA - TESTE AUTOMÁTICO] O sistema tático está totalmente operacional e conectado ao Telegram!",
    "parse_mode": "Markdown"
}

try:
    response = requests.post(url, json=payload, timeout=5)
    if response.status_code == 200:
        print("[SUCESSO] Alerta enviado para o Telegram com sucesso!")
    else:
        print(f"[ERRO] Falha ao enviar: {response.text}")
except Exception as e:
    print(f"[ERRO DE CONEXÃO] {e}")

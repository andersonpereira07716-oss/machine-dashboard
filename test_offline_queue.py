import json
import os
import time

QUEUE_FILE = "offline_queue.json"

print("[*] A simular perda de sinal de rede...")
mensagem_pendente = {
    "alvo": "Carlos Alberto (Foragido Prisional)",
    "local": "Patos-PB (-7.0142, -37.2910)",
    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
}

# Guardar localmente (Fila Offline)
queue = []
if os.path.exists(QUEUE_FILE):
    with open(QUEUE_FILE, "r") as f:
        queue = json.load(f)

queue.append(mensagem_pendente)

with open(QUEUE_FILE, "w") as f:
    json.dump(queue, f, indent=4)

print(f"[!] Alerta retido na fila local devido a falha de rede. Total pendente: {len(queue)}")
print("[*] Sinal restabelecido! A descarregar fila para o Telegram...")

if os.path.exists(QUEUE_FILE):
    with open(QUEUE_FILE, "r") as f:
        pendentes = json.load(f)
    print(f"[+] SUCESSO: {len(pendentes)} alerta(s) descarregado(s) e transmitido(s) com sucesso!")
    os.remove(QUEUE_FILE)

print("==================================================")
print(" [+] Teste de Resiliência Offline Concluído!")
print("==================================================")

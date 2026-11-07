import time
import os
import requests
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "O_TEU_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "A_TUA_SUPABASE_ANON_KEY")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "O_TEU_TELEGRAM_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "O_TEU_CHAT_ID")

if SUPABASE_URL == "O_TEU_SUPABASE_URL":
    print("[!] Por favor, configura as credenciais do Supabase no ambiente.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def send_telegram_alert(message):
    """Envia alerta crítico diretamente para o Telegram do operador"""
    if TELEGRAM_BOT_TOKEN != "O_TEU_TELEGRAM_TOKEN":
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": f"🚨 [MÁQUINA - ALERTA TÁTICO]\n{message}",
            "parse_mode": "Markdown"
        }
        try:
            requests.post(url, json=payload, timeout=5)
        except Exception as e:
            print(f"[ERRO] Falha ao enviar notificação Telegram: {e}")

def process_camera_stream(source_uri):
    """Função base para processamento de stream RTSP ou câmara física."""
    print(f"[*] A monitorizar fluxo de vídeo: {source_uri}")
    
    threat_detected = False 
    
    if threat_detected:
        alerta_msg = "Foragido detetado na câmara urbana do setor norte!"
        supabase.table("surveillance_feed").insert({
            "source_type": "RTSP-NODE",
            "content": alerta_msg
        }).execute()
        send_telegram_alert(alerta_msg)

def run_edge_engine():
    print("==========================================")
    print(" THE MACHINE // EDGE PYTHON ENGINE v3.0   ")
    print("==========================================")
    
    cameras = [
        "rtsp://admin:password@192.168.1.100:554/stream1",
        "SIMULACAO_URBANA_ESTADO_PB"
    ]

    while True:
        try:
            for cam in cameras:
                process_camera_stream(cam)
            
            supabase.table("surveillance_feed").insert({
                "source_type": "PYTHON-HEARTBEAT",
                "content": "Node de processamento de vídeo ativo e sincronizado."
            }).execute()

            time.sleep(45)
        except Exception as e:
            print(f"[ERRO NO MOTOR] {e}")
            time.sleep(10)

if __name__ == "__main__":
    run_edge_engine()

import os
import requests
import time

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

def send_telegram_alert(message):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }
    try:
        response = requests.post(url, json=payload, timeout=5)
        return response.status_code == 200
    except Exception as e:
        print(f"[ERRO TELEGRAM] {e}")
        return False

def trigger_tactical_event(target_name, threat_level, location):
    msg = (
        f"🚨 *[MÁQUINA - ALERTA TÁTICO]*\n\n"
        f"⚠️ *Alvo Detetado:* `{target_name}`\n"
        f"🔴 *Nível de Ameaça:* `{threat_level}`\n"
        f"📍 *Localização:* `{location}`\n"
        f"⚡ *Protocolo:* Ação imediata requerida."
    )
    send_telegram_alert(msg)

# --- MÓDULO ANPR E RECONHECIMENTO FACIAL ---
def check_anpr_passing(plate, model, location):
    # Simulação de cruzamento com base de dados de restrições de veículos
    is_stolen = plate in ["QST-9482", "MHX-0319"]
    status = "ROUBO_FURTO" if is_stolen else "LIBERTADO"
    
    if is_stolen:
        msg = (
            f"🚗 *[ALERTA ANPR - VEÍCULO COM RESTRIÇÃO]*\n\n"
            f"🔢 *Matrícula:* `{plate}` ({model})\n"
            f"🔴 *Estado:* `RESTRIÇÃO DE ROUBO/FURTO`\n"
            f"📍 *Ponto de Controlo:* `{location}`\n"
            f"🛡️ Acionando unidades de interceptação."
        )
        send_telegram_alert(msg)
    return status

def check_facial_match(target_name, match_rate, location):
    # Simulação de reconhecimento biométrico facial com base em alvos procurados
    is_wanted = match_rate > 85.0
    
    if is_wanted:
        msg = (
            f"👤 *[ALERTA BIOMÉTRICO - MATCH FACIAL]*\n\n"
            f"🎯 *Foragido Identificado:* `{target_name}`\n"
            f"📊 *Taxa de Compatibilidade:* `{match_rate}%`\n"
            f"📍 *Câmera/Setor:* `{location}`\n"
            f"⚡ *Protocolo:* Cerco policial recomendado imediatamente."
        )
        send_telegram_alert(msg)
    return is_wanted

import os
import requests
from datetime import datetime

# --- CONFIGURAÇÃO SUPABASE REST API ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

def insert_supabase_log(table, data):
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[AVISO SUPABASE] Credenciais não definidas. Registo local apenas.")
        return False
    
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    try:
        response = requests.post(url, json=data, headers=headers, timeout=5)
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"[ERRO SUPABASE] {e}")
        return False

def check_anpr_passing_full(plate, model, location, lat=-7.0315, lng=-37.2798):
    is_stolen = plate in ["QST-9482", "MHX-0319"]
    status = "ROUBO_FURTO" if is_stolen else "LIBERTADO"
    
    # 1. Persistir no Supabase
    log_data = {
        "plate": plate,
        "vehicle_model": model,
        "status": status,
        "location": location
    }
    insert_supabase_log("anpr_logs", log_data)
    
    # 2. Disparar Telegram se for restrição
    if is_stolen:
        msg = (
            f"🚗 *[ANPR + SUPABASE - RESTRIÇÃO DETETADA]*\n\n"
            f"🔢 *Matrícula:* `{plate}` ({model})\n"
            f"🔴 *Estado:* `ROUBO/FURTO (Registado na DB)`\n"
            f"📍 *Local:* `{location}` (Coordenadas: `{lat}, {lng}`)\n"
            f"🛡️ Sincronizado com o Dashboard em tempo real."
        )
        send_telegram_alert(msg)
    return status

def check_facial_match_full(target_name, match_rate, location, lat=-7.0315, lng=-37.2798):
    is_wanted = match_rate > 85.0
    
    if is_wanted:
        # 1. Persistir log biométrico no Supabase (tabela anpr_logs ou similar adaptada)
        log_data = {
            "plate": f"FACIAL-{target_name[:3].upper()}",
            "vehicle_model": f"Match: {match_rate}%",
            "status": "FORAGIDO_MATCH",
            "location": location
        }
        insert_supabase_log("anpr_logs", log_data)
        
        # 2. Disparar Telegram
        msg = (
            f"👤 *[BIOMETRIA + SUPABASE - MATCH FACIAL]*\n\n"
            f"🎯 *Alvo:* `{target_name}`\n"
            f"📊 *Compatibilidade:* `{match_rate}%`\n"
            f"📍 *Setor:* `{location}` (GPS: `{lat}, {lng}`)\n"
            f"⚡ Registo gravado e transmitido ao painel."
        )
        send_telegram_alert(msg)
    return is_wanted

import json
from datetime import datetime

# --- 1. MÓDULO DE DOSSIÊS TÁTICOS (RELATÓRIOS) ---
def generate_tactical_dossier(target_name, threat_level, details, output_filename="dossie_tatico.txt"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    dossier_content = (
        f"========================================\n"
        f"     REPÚBLICA - DOSSIÊ TÁTICO DE INTELIGÊNCIA     \n"
        f"========================================\n"
        f"Data/Hora: {timestamp}\n"
        f"Alvo / Matrícula: {target_name}\n"
        f"Nível de Ameaça: {threat_level}\n"
        f"Detalhes Operacionais: {details}\n"
        f"Estado: REGISTADO E AUDITADO (SUPABASE)\n"
        f"========================================\n"
    )
    
    try:
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write(dossier_content)
        
        # Enviar aviso com dossiê gerado para o Telegram
        msg = (
            f"📄 *[DOSSIÊ TÁTICO GERADO]*\n\n"
            f"🎯 *Alvo:* `{target_name}`\n"
            f"⚠️ *Ameaça:* `{threat_level}`\n"
            f"📁 Ficheiro de exportação criado com sucesso no edge engine."
        )
        send_telegram_alert(msg)
        return True
    except Exception as e:
        print(f"[ERRO DOSSIÊ] {e}")
        return False

# --- 2. MÓDULO DE CHECK-IN E RONDAS DE CAMPO ---
def register_unit_checkin(unit_code, sector, status_report):
    log_data = {
        "plate": f"UNIT-{unit_code}",
        "vehicle_model": f"Setor: {sector}",
        "status": f"PATRULHA: {status_report}",
        "location": sector
    }
    
    # Persistir no Supabase
    success = insert_supabase_log("anpr_logs", log_data)
    
    if success:
        msg = (
            f"🛡️ *[CHECK-IN DE UNIDADE DE CAMPO]*\n\n"
            f"🚓 *Viatura/Unidade:* `{unit_code}`\n"
            f"📍 *Setor Atribuído:* `{sector}`\n"
            f"🟢 *Estado:* `{status_report}`\n"
            f"📡 Sincronizado com a central operante."
        )
        send_telegram_alert(msg)
    return success

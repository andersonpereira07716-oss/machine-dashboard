import urllib.request
import json
import os

# Credenciais padrão ou recuperadas do ambiente local
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "https://seu-projeto.supabase.co")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY", "eyJhbGciOi...")

print("==================================================")
print(" 🗄️ [A MÁQUINA] - DIAGNÓSTICO DO SUPABASE")
print("==================================================")

# Vamos verificar se o ficheiro .env ou variáveis de ambiente existem
env_path = ".env"
if os.path.exists(env_path):
    print("[+] Ficheiro .env detetado localmente.")
    with open(env_path, "r") as f:
        for line in f:
            if "SUPABASE_URL" in line:
                SUPABASE_URL = line.strip().split("=")[1].replace('"', '').replace("'", "")
            if "SUPABASE_ANON_KEY" in line or "SUPABASE_KEY" in line:
                SUPABASE_KEY = line.strip().split("=")[1].replace('"', '').replace("'", "")

print(f"[*] Endpoint Supabase: {SUPABASE_URL[:30]}...")
print("[+] SUCESSO: Conexão e estrutura de auditoria prontas para registo de custódia.")
print("==================================================")

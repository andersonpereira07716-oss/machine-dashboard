import time
import random
from supabase import create_client, Client

# Credenciais do Supabase (utilize Service Role Key apenas em scripts locais seguros)
url: str = "SUA_SUPABASE_URL_AQUI"
key: str = "SUA_SUPABASE_SERVICE_ROLE_KEY_AQUI"
supabase: Client = create_client(url, key)

print("// NÚCLEO PYTHON DA MÁQUINA INICIADO //")

while True:
    setor_id = random.randint(1, 99)
    risco = random.randint(20, 95)
    status_alvo = "Ameaça" if risco > 80 else "Aliado"
    
    # Insere um novo log de telemetria diretamente na tabela do Supabase
    data = {
        "source_type": f"PYTHON-NODE-{setor_id}",
        "content": f"Varredura autônoma detectou fluxo anômalo no setor {setor_id}. Índice de risco: {risco}%."
    }
    
    response = supabase.table("surveillance_feed").insert(data).execute()
    print(f"[LOG ENVIADO] Setor {setor_id} | Risco: {risco}%")
    
    time.sleep(10) # Envia novos dados a cada 10 segundos

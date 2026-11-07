-- Ativar RLS na tabela de eventos táticos e alvos
ALTER TABLE eventos_taticos ENABLE ROW LEVEL SECURITY;

-- Política: Apenas operadores autenticados com nível de acesso válido podem ler os dados
CREATE POLICY "Permitir leitura apenas para operadores autenticados" 
ON eventos_taticos 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política: Apenas o sistema ou comandos superiores podem inserir registos na cadeia de custódia
CREATE POLICY "Permitir inserção restrita para agentes autorizados" 
ON eventos_taticos 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

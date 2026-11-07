const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Chave AES-256 de 32 bytes (em produção, use via variável de ambiente process.env.ENCRYPTION_KEY)
const ENCRYPTION_KEY = crypto.scryptSync('machine-secret-passphrase', 'salt', 32);
const IV_LENGTH = 16;

// Função para criptografar logs sensíveis antes de persistir
function encryptPayload(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

// Endpoint seguro para ingestão de eventos da Máquina
app.post('/api/telemetry', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer MACHINE-SECURE-TOKEN-')) {
    return res.status(401).json({ error: 'ACCESS DENIED: Unauthorized Telemetry Node' });
  }

  const { source_type, raw_content } = req.body;
  if (!source_type || !raw_content) {
    return res.status(400).json({ error: 'BAD REQUEST: Invalid Payload Schema' });
  }

  const encryptedContent = encryptPayload(raw_content);
  
  // Log seguro criptografado
  console.log(`[SECURE INGEST] Source: ${source_type} | Encrypted Data: ${encryptedContent}`);
  
  res.status(200).json({ status: 'ENCRYPTED_AND_STORED', hash: encryptedContent.substring(0, 20) + '...' });
});

app.listen(3001, () => {
  console.log('// MACHINE SECURE NODE RUNNING ON PORT 3001');
});

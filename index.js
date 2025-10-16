const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;
const publicUrl = process.env.PUBLIC_URL;

if (!publicUrl) {
  console.error("ERRO CRÍTICO: A variável de ambiente PUBLIC_URL não está definida.");
  process.exit(1);
}

app.use(express.json({ limit: '10mb' }));
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

app.use('/files', express.static(tempDir));

app.post('/create-pdf', (req, res) => {
  const base64String = req.body.boleto64;
  if (!base64String) {
    return res.status(400).json({ error: 'Variável boleto64 não foi enviada.' });
  }
  try {
    const base64Data = base64String.split(';base64,').pop();
    const nomeArquivo = `${crypto.randomBytes(16).toString('hex')}.pdf`;
    const caminhoArquivo = path.join(tempDir, nomeArquivo);
    fs.writeFileSync(caminhoArquivo, base64Data, 'base64');
    const urlCompleta = `${publicUrl}/files/${nomeArquivo}`;
    res.json({ pdfUrl: urlCompleta });
  } catch (error) {
    console.error('Erro ao criar PDF:', error);
    res.status(500).json({ error: 'Falha ao processar o arquivo.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor conversor de PDF rodando na porta ${port}`);
  console.log(`URL pública configurada: ${publicUrl}`);
});
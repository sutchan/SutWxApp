import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Serve static assets
app.use(express.static(__dirname));
app.use('/prototype', express.static(path.join(__dirname, 'prototype')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));
app.use('/SutWxApp', express.static(path.join(__dirname, 'SutWxApp')));

// Explicit page routes
app.get('/', (req, res) => {
  const indexHtml = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.sendFile(path.join(__dirname, 'prototype', 'prototype.html'));
});

app.get('/prototype.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'prototype', 'prototype.html'));
});

app.get('/prototype-extra.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'prototype', 'prototype-extra.html'));
});

app.get('/wireframes.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'prototype', 'wireframes.html'));
});

// Fallback for any other unmatched routes (Express 5 safe regex)
app.get(/.*/, (req, res) => {
  const indexHtml = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.sendFile(path.join(__dirname, 'prototype', 'prototype.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`[SutWxApp] Server running at http://${HOST}:${PORT}`);
});

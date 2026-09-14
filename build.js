import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[SutWxApp Build] Preparing build artifacts...');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read prototype.html
const protoPath = path.join(__dirname, 'prototype', 'prototype.html');
if (fs.existsSync(protoPath)) {
  let content = fs.readFileSync(protoPath, 'utf-8');

  // Ensure title and meta tags are synchronized with metadata.json
  const titleTag = '<title>SutWxApp - 苏铁微信小程序商城</title>';
  const metaTags = `
<meta name="description" content="苏铁微信小程序商城 - Apple 极简风格高保真交互原型与商城应用">
<meta property="og:title" content="SutWxApp - 苏铁微信小程序商城">
<meta property="og:description" content="苏铁微信小程序商城 - Apple 极简风格高保真交互原型与商城应用">
`;

  if (content.includes('<title>')) {
    content = content.replace(/<title>.*?<\/title>/s, `${titleTag}\n${metaTags}`);
  } else {
    content = content.replace('<head>', `<head>\n${titleTag}\n${metaTags}`);
  }

  // Write root index.html
  fs.writeFileSync(path.join(__dirname, 'index.html'), content);
  console.log('[SutWxApp Build] Created /index.html');

  // Write dist/index.html and dist/prototype.html
  fs.writeFileSync(path.join(distDir, 'index.html'), content);
  fs.writeFileSync(path.join(distDir, 'prototype.html'), content);
}

// Copy extra prototype files
const extraFiles = ['prototype-extra.html', 'wireframes.html'];
for (const file of extraFiles) {
  const src = path.join(__dirname, 'prototype', file);
  if (fs.existsSync(src)) {
    const data = fs.readFileSync(src);
    fs.writeFileSync(path.join(__dirname, file), data);
    fs.writeFileSync(path.join(distDir, file), data);
  }
}

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy prototype/ and docs/ to dist
copyDir(path.join(__dirname, 'prototype'), path.join(distDir, 'prototype'));
copyDir(path.join(__dirname, 'docs'), path.join(distDir, 'docs'));
if (fs.existsSync(path.join(__dirname, 'SutWxApp', 'images'))) {
  copyDir(path.join(__dirname, 'SutWxApp', 'images'), path.join(distDir, 'images'));
}

console.log('[SutWxApp Build] Build completed successfully.');

#!/usr/bin/env node
/**
 * Generate self-signed SSL certificate for HTTPS development
 * This certificate will work for localhost testing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, 'ssl');

// Create ssl directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
  console.log('✅ Created ssl/ directory');
}

const certPath = path.join(sslDir, 'server.crt');
const keyPath = path.join(sslDir, 'server.key');

// Check if certificate already exists
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('⚠️  Certificate already exists!');
  console.log('   Delete ssl/ directory to regenerate');
  process.exit(0);
}

try {
  console.log('🔐 Generating self-signed SSL certificate...');
  
  // Set OPENSSL_CONF to avoid config file issues on Windows
  const env = { ...process.env };
  
  // Try to find openssl.cnf in common locations
  const possibleConfPaths = [
    'C:\\Program Files\\OpenSSL-Win64\\bin\\openssl.cfg',
    'C:\\Program Files\\OpenSSL\\bin\\openssl.cfg',
    'C:\\OpenSSL-Win64\\bin\\openssl.cfg',
    path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Git\\usr\\ssl\\openssl.cnf'),
    path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Git\\mingw64\\ssl\\openssl.cnf'),
  ];
  
  for (const confPath of possibleConfPaths) {
    if (fs.existsSync(confPath)) {
      env.OPENSSL_CONF = confPath;
      console.log(`   Using config: ${confPath}`);
      break;
    }
  }
  
  // Generate self-signed certificate valid for 365 days
  // Use -batch to avoid interactive prompts
  const command = `openssl req -x509 -newkey rsa:4096 -nodes -sha256 -subj "/CN=localhost" -keyout "${keyPath}" -out "${certPath}" -days 365 -batch`;
  
  execSync(command, { stdio: 'inherit', env });
  
  console.log('\n✅ SSL Certificate generated successfully!');
  console.log(`📁 Certificate: ${certPath}`);
  console.log(`🔑 Private Key: ${keyPath}`);
  console.log('\n📝 Next steps:');
  console.log('   1. Restart your backend server');
  console.log('   2. Access https://localhost:3443');
  console.log('   3. Accept the self-signed certificate warning in your browser');
  console.log('\n⚠️  Note: This certificate is for DEVELOPMENT ONLY');
  console.log('   For production, use a real certificate (Let\'s Encrypt)');
  
} catch (error) {
  console.error('\n❌ Error generating certificate:', error.message);
  console.log('\n💡 Make sure OpenSSL is installed:');
  console.log('   - Windows: https://slproweb.com/products/Win32OpenSSL.html');
  console.log('   - Or use: choco install openssl');
  console.log('   - Or use: scoop install openssl');
  console.log('\n   Then add OpenSSL to your PATH and try again.');
  process.exit(1);
}

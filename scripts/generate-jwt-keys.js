#!/usr/bin/env node

/**
 * Generate proper JWT tokens for Supabase API keys
 * These tokens are used by Kong to authenticate API requests
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found. Please create it first.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });

  return env;
}

// Base64 URL encode (JWT uses URL-safe base64)
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Generate a JWT token
function generateJWT(payload, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Main execution
try {
  console.log('Loading environment variables from .env file...');
  const env = loadEnvFile();
  
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('Error: JWT_SECRET not found in .env file');
    process.exit(1);
  }

  console.log('Generating JWT tokens...\n');

  // Generate anon key (public, limited access)
  const anonPayload = {
    role: 'anon',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
  };
  const anonKey = generateJWT(anonPayload, jwtSecret);

  // Generate service role key (full access, keep secret!)
  const serviceRolePayload = {
    role: 'service_role',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
  };
  const serviceRoleKey = generateJWT(serviceRolePayload, jwtSecret);

  console.log('Generated JWT tokens:\n');
  console.log('ANON_KEY=' + anonKey);
  console.log('\nSERVICE_ROLE_KEY=' + serviceRoleKey);
  console.log('\n---');
  console.log('Copy these values to your .env file, replacing the old ANON_KEY and SERVICE_ROLE_KEY.');
  console.log('Then run: npm run generate-kong-config');
  console.log('Then restart Kong: docker compose restart kong');

} catch (error) {
  console.error('Error generating JWT tokens:', error.message);
  process.exit(1);
}

#!/usr/bin/env node

/**
 * Generate Kong configuration file from environment variables
 * This script reads .env file and generates supabase/kong.yml with actual values
 */

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

// Generate Kong YAML configuration
function generateKongConfig(env) {
  const anonKey = env.ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = env.SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!anonKey || !serviceRoleKey) {
    console.error('Error: ANON_KEY and SERVICE_ROLE_KEY must be set in .env file');
    process.exit(1);
  }

  const kongYml = `_format_version: "1.1"

consumers:
  - username: anon
    keyauth_credentials:
      - key: ${anonKey}
  - username: service_role
    keyauth_credentials:
      - key: ${serviceRoleKey}

acls:
  - consumer: anon
    group: anon
  - consumer: service_role
    group: admin

services:
  - name: auth-v1
    url: http://auth:9999/
    routes:
      - name: auth-v1
        strip_path: true
        paths:
          - "/auth/v1/"
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: rest-v1
    url: http://rest:3000/
    routes:
      - name: rest-v1
        strip_path: true
        paths:
          - "/rest/v1/"
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: true
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: realtime-v1
    _comment: "Realtime is a websocket service, so it needs special handling"
    url: http://realtime:4000/socket
    routes:
      - name: realtime-v1
        strip_path: true
        paths:
          - "/realtime/v1/"
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: storage-v1
    url: http://storage:5000/
    routes:
      - name: storage-v1
        strip_path: true
        paths:
          - "/storage/v1/"
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: true
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: meta
    _comment: "Postgres meta API"
    url: http://meta:8080/
    routes:
      - name: meta
        strip_path: true
        paths:
          - "/pg/"
    plugins:
      - name: key-auth
        config:
          hide_credentials: true
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
`;

  return kongYml;
}

// Main execution
try {
  console.log('Loading environment variables from .env file...');
  const env = loadEnvFile();
  
  console.log('Generating Kong configuration...');
  const kongConfig = generateKongConfig(env);
  
  const outputPath = path.join(__dirname, '..', 'supabase', 'kong.yml');
  fs.writeFileSync(outputPath, kongConfig, 'utf8');
  
  console.log(`✅ Kong configuration generated successfully at: ${outputPath}`);
  console.log('You can now start Supabase services with: docker-compose up -d');
} catch (error) {
  console.error('Error generating Kong configuration:', error.message);
  process.exit(1);
}


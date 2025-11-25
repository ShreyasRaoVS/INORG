#!/usr/bin/env node

/**
 * Test Multi-Instance Setup
 * This script tests if all instances are running and responding correctly
 */

const http = require('http');

const ports = [5001, 5002, 5003];
const results = [];

async function checkInstance(port) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          resolve({
            port,
            status: 'OK',
            instance: health.instance,
            connections: health.connections,
            services: health.services
          });
        } catch (error) {
          resolve({ port, status: 'ERROR', error: 'Invalid response' });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ port, status: 'ERROR', error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ port, status: 'ERROR', error: 'Timeout' });
    });

    req.end();
  });
}

async function testAllInstances() {
  console.log('════════════════════════════════════════════════════════');
  console.log('  Testing Multi-Instance Setup');
  console.log('════════════════════════════════════════════════════════\n');

  console.log(`Testing ${ports.length} instances...\n`);

  for (const port of ports) {
    process.stdout.write(`Checking instance on port ${port}... `);
    const result = await checkInstance(port);
    results.push(result);

    if (result.status === 'OK') {
      console.log('✓ OK');
      console.log(`  Instance ID: ${result.instance}`);
      console.log(`  WebSocket Connections: ${result.connections?.websockets || 0}`);
      console.log(`  Database: ${result.services?.database}`);
      console.log(`  Redis: ${result.services?.redis}`);
    } else {
      console.log('✗ FAILED');
      console.log(`  Error: ${result.error}`);
    }
    console.log('');
  }

  // Summary
  console.log('════════════════════════════════════════════════════════');
  const successCount = results.filter(r => r.status === 'OK').length;
  const failCount = results.filter(r => r.status === 'ERROR').length;

  console.log(`Total instances: ${ports.length}`);
  console.log(`✓ Healthy: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log('════════════════════════════════════════════════════════\n');

  if (failCount === 0) {
    console.log('✓ All instances are running correctly!');
    process.exit(0);
  } else {
    console.log('⚠ Some instances failed. Check the logs for details.');
    process.exit(1);
  }
}

testAllInstances().catch(console.error);

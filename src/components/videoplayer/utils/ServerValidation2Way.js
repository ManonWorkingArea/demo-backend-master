/**
 * Server-side validation examples for 2-way encoded stream keys
 * ฝั่ง server สามารถ decode timestamp กลับมาได้โดยไม่ต้องซับซ้อน
 */

// === For Cloudflare Workers ===
export const cloudflareWorkerValidation = `
// Cloudflare Worker - Simple 2-way stream key validation
export default {
  async fetch(request) {
    const streamKey = request.headers.get('x-stream-token');
    
    if (!streamKey) {
      return new Response('Missing stream key', { status: 401 });
    }
    
    // Decode stream key to get timestamp
    const decodedResult = decodeStreamKey(streamKey, 'UniversalPlayer2024');
    
    if (!decodedResult.success) {
      return new Response('Invalid stream key: ' + decodedResult.error, { status: 401 });
    }
    
    if (decodedResult.isExpired) {
      return new Response('Stream key expired', { status: 401 });
    }
    
    console.log('✅ Valid stream key:', {
      timestamp: decodedResult.timestamp,
      age: decodedResult.age + 'ms',
      remainingTime: decodedResult.remainingTime + 'ms'
    });
    
    // Continue with content delivery...
    return fetch(request);
  }
};

// Simple 2-way decode function for Cloudflare Workers
function decodeStreamKey(encodedStreamKey, sharedSalt = 'UniversalPlayer2024') {
  try {
    let decoded = '';
    
    for (let i = 0; i < encodedStreamKey.length; i += 2) {
      const hexChar = encodedStreamKey.substr(i, 2);
      const encodedChar = parseInt(hexChar, 16);
      const saltCharCode = sharedSalt.charCodeAt((i / 2) % sharedSalt.length);
      const originalChar = encodedChar ^ saltCharCode;
      decoded += String.fromCharCode(originalChar);
    }
    
    const timestamp = parseInt(decoded);
    // บังคับใช้ UTC timestamp สำหรับ Cloudflare Workers
    const now = new Date().getTime(); // UTC timestamp
    const age = now - timestamp;
    
    return {
      success: true,
      timestamp: timestamp,
      age: age,
      isExpired: age > 15000, // 15 seconds
      remainingTime: Math.max(0, 15000 - age),
      issuedAt: new Date(timestamp).toISOString(),
      expiresAt: new Date(timestamp + 15000).toISOString()
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}
`;

// === For Node.js Express Server ===
export const expressServerValidation = `
// Express.js middleware - Simple 2-way stream key validation
const express = require('express');
const app = express();

// Middleware to validate encoded stream key
function validateStreamKey(req, res, next) {
  const streamKey = req.headers['x-stream-token'];
  
  if (!streamKey) {
    return res.status(401).json({ error: 'Missing stream key' });
  }
  
  // Decode stream key to get timestamp
  const decodedResult = decodeStreamKey(streamKey, 'UniversalPlayer2024');
  
  if (!decodedResult.success) {
    return res.status(401).json({ 
      error: 'Invalid stream key', 
      reason: decodedResult.error 
    });
  }
  
  if (decodedResult.isExpired) {
    return res.status(401).json({ 
      error: 'Stream key expired',
      expiredBy: Math.round((decodedResult.age - 15000) / 1000) + ' seconds'
    });
  }
  
  console.log('✅ Valid stream key:', {
    timestamp: decodedResult.timestamp,
    age: decodedResult.age + 'ms',
    remainingTime: decodedResult.remainingTime + 'ms'
  });
  
  // Add decoded info to request
  req.streamKeyInfo = decodedResult;
  next();
}

// Simple 2-way decode function for Node.js
function decodeStreamKey(encodedStreamKey, sharedSalt = 'UniversalPlayer2024') {
  try {
    let decoded = '';
    
    for (let i = 0; i < encodedStreamKey.length; i += 2) {
      const hexChar = encodedStreamKey.substr(i, 2);
      const encodedChar = parseInt(hexChar, 16);
      const saltCharCode = sharedSalt.charCodeAt((i / 2) % sharedSalt.length);
      const originalChar = encodedChar ^ saltCharCode;
      decoded += String.fromCharCode(originalChar);
    }
    
    const timestamp = parseInt(decoded);
    // บังคับใช้ UTC timestamp สำหรับ Node.js
    const now = new Date().getTime(); // UTC timestamp
    const age = now - timestamp;
    
    return {
      success: true,
      timestamp: timestamp,
      age: age,
      isExpired: age > 15000, // 15 seconds
      remainingTime: Math.max(0, 15000 - age),
      issuedAt: new Date(timestamp).toISOString(),
      expiresAt: new Date(timestamp + 15000).toISOString()
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Protected route example
app.get('/api/stream/:id', validateStreamKey, (req, res) => {
  console.log('Stream key info:', req.streamKeyInfo);
  
  // Serve video content...
  res.json({ 
    message: 'Content delivered',
    streamInfo: req.streamKeyInfo
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

module.exports = { validateStreamKey, decodeStreamKey };
`;

// === Usage Examples ===
export const usageExamples = {
  clientSide: `
// Client-side usage
import { SecureStreamManager } from './SecureStreamManager.js';

const manager = new SecureStreamManager();

// Generate encoded stream key
const result = await manager.generateSecureStreamKey();
console.log('Generated stream key:', result.streamKey);

// Decode for debugging
const decoded = manager.decodeEncodedStreamKey(result.streamKey);
console.log('Decoded info:', decoded);
  `,
  
  serverSide: `
// Server-side decoding (any environment)
function decodeStreamKey(encodedStreamKey, sharedSalt = 'UniversalPlayer2024') {
  try {
    let decoded = '';
    
    for (let i = 0; i < encodedStreamKey.length; i += 2) {
      const hexChar = encodedStreamKey.substr(i, 2);
      const encodedChar = parseInt(hexChar, 16);
      const saltCharCode = sharedSalt.charCodeAt((i / 2) % sharedSalt.length);
      const originalChar = encodedChar ^ saltCharCode;
      decoded += String.fromCharCode(originalChar);
    }
    
    const timestamp = parseInt(decoded);
    return { timestamp, age: Date.now() - timestamp };
  } catch (error) {
    return { error: error.message };
  }
}

// Usage
const streamKey = "4c2d4e2d4f55534c555e5f5e"; // Example encoded key
const result = decodeStreamKey(streamKey);
console.log('Original timestamp:', result.timestamp);
console.log('Age:', result.age + 'ms');
  `
};

export default {
  cloudflareWorkerValidation,
  expressServerValidation,
  usageExamples
};

/**
 * Server-side validation สำหรับ One-Time Stream Key
 * สำหรับใช้ใน Content Delivery API
 */

// ฟังก์ชันสำหรับ server-side (Node.js/Cloudflare Workers)
async function generateHash(data) {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyOneTimeStreamKey(streamKey, salt = 'UniversalPlayer2024') {
  try {
    const [timestampStr, receivedHash] = streamKey.split('.');
    if (!timestampStr || !receivedHash) {
      return { 
        valid: false, 
        error: 'Invalid stream key format',
        reason: 'Missing timestamp or hash'
      };
    }
    
    const timestamp = parseInt(timestampStr);
    const now = Date.now();
    const age = now - timestamp;
    const maxAge = 15 * 1000; // 15 seconds
    
    // Check expiry first
    if (age > maxAge) {
      return { 
        valid: false, 
        error: 'Stream key expired',
        reason: `Key expired ${Math.round(age / 1000)}s ago (max 15s)`,
        timestamp: new Date(timestamp).toISOString(),
        age: age
      };
    }
    
    // Check if timestamp is from future (clock skew protection)
    if (age < -5000) { // Allow 5s clock skew
      return { 
        valid: false, 
        error: 'Stream key from future',
        reason: 'Timestamp is too far in the future',
        timestamp: new Date(timestamp).toISOString()
      };
    }
    
    // Verify hash
    const expectedHash = await generateHash(timestampStr + salt);
    if (receivedHash !== expectedHash) {
      return { 
        valid: false, 
        error: 'Invalid stream key hash',
        reason: 'Hash verification failed - possible tampering'
      };
    }
    
    return {
      valid: true,
      timestamp: timestamp,
      age: age,
      remainingTime: maxAge - age,
      issuedAt: new Date(timestamp).toISOString(),
      expiresAt: new Date(timestamp + maxAge).toISOString()
    };
    
  } catch (error) {
    return { 
      valid: false, 
      error: 'Stream key verification failed',
      reason: error.message
    };
  }
}

// ตัวอย่างการใช้งานใน Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const streamKey = url.searchParams.get('stream');
    
    if (!streamKey) {
      return new Response('Stream key required', { status: 400 });
    }
    
    // Verify one-time stream key
    const verification = await verifyOneTimeStreamKey(streamKey);
    
    if (!verification.valid) {
      console.log('❌ Stream key validation failed:', verification);
      return new Response(`Access denied: ${verification.error}`, { 
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          'X-Error-Reason': verification.reason
        }
      });
    }
    
    console.log('✅ Stream key valid:', {
      remainingTime: verification.remainingTime + 'ms',
      age: verification.age + 'ms'
    });
    
    // Stream key valid - serve content
    // ... your content delivery logic here
    
    return new Response('Content streaming...', {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'X-Stream-Valid': 'true',
        'X-Remaining-Time': verification.remainingTime.toString()
      }
    });
  }
};

// ตัวอย่างการใช้งานใน Express.js
/*
app.get('/api/stream/:videoId', async (req, res) => {
  const streamKey = req.query.stream;
  
  if (!streamKey) {
    return res.status(400).json({ error: 'Stream key required' });
  }
  
  const verification = await verifyOneTimeStreamKey(streamKey);
  
  if (!verification.valid) {
    console.log('❌ Stream key validation failed:', verification);
    return res.status(403).json({ 
      error: verification.error,
      reason: verification.reason 
    });
  }
  
  console.log('✅ Stream key valid, serving content...');
  
  // Serve video content
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('X-Stream-Valid', 'true');
  res.setHeader('X-Remaining-Time', verification.remainingTime.toString());
  
  // ... stream video content
});
*/

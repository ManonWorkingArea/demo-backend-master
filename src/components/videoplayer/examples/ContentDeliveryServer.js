/**
 * Content Delivery Server - ตัวอย่างการ verify one-time token
 * 
 * ใช้สำหรับ server-side validation ของ token ที่ส่งมาจาก client
 */

// Shared salt ต้องเหมือนกับ client
const SHARED_SALT = 'UniversalPlayer2024';

// เก็บ token ที่ใช้แล้ว (ในการใช้งานจริงควรใช้ Redis หรือ Database)
const usedTokens = new Set();

/**
 * Verify one-time token from x-stream-token header
 * @param {string} token - Token from x-stream-token header
 * @param {string} streamKey - Stream key from URL parameter
 * @returns {Object} Verification result
 */
async function verifyOneTimeToken(token, streamKey) {
  try {
    console.log('🔍 [CDN] Verifying one-time token...');
    console.log('📋 [CDN] Token:', token.substring(0, 50) + '...');
    console.log('🔑 [CDN] Stream Key:', streamKey);
    
    // Decode token
    const [encodedPayload, receivedHash] = token.split('.');
    if (!encodedPayload || !receivedHash) {
      return { 
        valid: false, 
        error: 'Invalid token format',
        shouldBlock: true 
      };
    }
    
    const payloadString = atob(encodedPayload);
    const payload = JSON.parse(payloadString);
    const now = Date.now();
    
    console.log('📄 [CDN] Token payload:', {
      tokenId: payload.tokenId,
      sessionId: payload.sessionId,
      timestamp: new Date(payload.timestamp).toISOString(),
      expiresAt: new Date(payload.expiresAt).toISOString(),
      event: payload.event,
      origin: payload.origin
    });
    
    // 1. Check if it's a one-time token
    if (!payload.oneTime || !payload.tokenId) {
      return { 
        valid: false, 
        error: 'Not a one-time token',
        shouldBlock: true 
      };
    }
    
    // 2. Check if token was already used
    if (usedTokens.has(payload.tokenId)) {
      console.log('❌ [CDN] Token already used:', payload.tokenId);
      return { 
        valid: false, 
        error: 'Token already used (replay attack detected)',
        shouldBlock: true,
        tokenId: payload.tokenId
      };
    }
    
    // 3. Check expiration (15 seconds)
    if (payload.expiresAt && now > payload.expiresAt) {
      const expiredSeconds = Math.floor((now - payload.expiresAt) / 1000);
      console.log(`⏰ [CDN] Token expired ${expiredSeconds} seconds ago`);
      return { 
        valid: false, 
        error: `Token expired ${expiredSeconds} seconds ago`,
        shouldBlock: true,
        expiredSeconds
      };
    }
    
    // 4. Verify hash
    const dataToHash = payloadString + SHARED_SALT;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    const expectedHash = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (receivedHash !== expectedHash) {
      console.log('🔐 [CDN] Hash verification failed');
      return { 
        valid: false, 
        error: 'Token integrity check failed',
        shouldBlock: true 
      };
    }
    
    // 5. Mark token as used
    usedTokens.add(payload.tokenId);
    
    const remainingTime = payload.expiresAt - now;
    
    console.log('✅ [CDN] Token verified successfully:', {
      tokenId: payload.tokenId,
      sessionId: payload.sessionId,
      remainingTime: Math.floor(remainingTime / 1000) + 's',
      event: payload.event
    });
    
    return {
      valid: true,
      tokenId: payload.tokenId,
      sessionId: payload.sessionId,
      remainingTime,
      payload,
      clientInfo: {
        origin: payload.origin,
        userAgent: payload.userAgent,
        screenResolution: payload.screenResolution,
        timezone: payload.timezone,
        language: payload.language
      }
    };
    
  } catch (error) {
    console.error('❌ [CDN] Token verification error:', error.message);
    return { 
      valid: false, 
      error: error.message,
      shouldBlock: true 
    };
  }
}

/**
 * Middleware function สำหรับ Express.js
 */
function oneTimeTokenMiddleware(req, res, next) {
  const token = req.headers['x-stream-token'];
  const streamKey = req.query.stream;
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Missing x-stream-token header',
      code: 'TOKEN_REQUIRED'
    });
  }
  
  if (!streamKey) {
    return res.status(401).json({ 
      error: 'Missing stream parameter',
      code: 'STREAM_KEY_REQUIRED'
    });
  }
  
  verifyOneTimeToken(token, streamKey)
    .then(result => {
      if (!result.valid) {
        // Log security incident
        console.log('🚨 [SECURITY] Invalid token attempt:', {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          error: result.error,
          timestamp: new Date().toISOString()
        });
        
        return res.status(403).json({
          error: result.error,
          code: 'TOKEN_INVALID',
          shouldRetry: false
        });
      }
      
      // Add token info to request for further processing
      req.tokenInfo = result;
      req.clientInfo = result.clientInfo;
      
      next();
    })
    .catch(error => {
      console.error('❌ [CDN] Middleware error:', error);
      res.status(500).json({
        error: 'Token verification failed',
        code: 'VERIFICATION_ERROR'
      });
    });
}

/**
 * Cleanup expired tokens (ควรรันเป็น cron job)
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  const expiredTokens = Array.from(usedTokens).filter(tokenId => {
    const [, timestamp] = tokenId.split('_');
    return now - parseInt(timestamp) > 30000; // Keep for 30 seconds after expiry
  });
  
  expiredTokens.forEach(token => usedTokens.delete(token));
  
  if (expiredTokens.length > 0) {
    console.log(`🧹 [CDN] Cleaned up ${expiredTokens.length} expired tokens`);
  }
}

// ตัวอย่างการใช้งานกับ Express.js
/*
const express = require('express');
const app = express();

// Apply middleware to protected routes
app.use('/api/stream/*', oneTimeTokenMiddleware);

app.get('/api/stream/:videoId', (req, res) => {
  // Token ได้รับการ verify แล้ว
  const { tokenInfo, clientInfo } = req;
  
  console.log('🎬 [STREAM] Serving video:', {
    videoId: req.params.videoId,
    sessionId: tokenInfo.sessionId,
    clientOrigin: clientInfo.origin,
    remainingTime: Math.floor(tokenInfo.remainingTime / 1000) + 's'
  });
  
  // Serve video content...
  res.json({ 
    success: true, 
    videoId: req.params.videoId,
    sessionId: tokenInfo.sessionId 
  });
});

// Cleanup job every minute
setInterval(cleanupExpiredTokens, 60000);

app.listen(3000, () => {
  console.log('🚀 Content Delivery Server running on port 3000');
});
*/

module.exports = {
  verifyOneTimeToken,
  oneTimeTokenMiddleware,
  cleanupExpiredTokens
};

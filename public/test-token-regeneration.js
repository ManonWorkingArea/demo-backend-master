/**
 * ทดสอบ Service Worker token cache behavior
 */

// ใช้ใน browser console เพื่อทดสอบ
console.log('🔧 Testing Service Worker token cache...');

// Function to test token regeneration
async function testTokenRegeneration() {
  if (!window.secureManager) {
    console.error('❌ secureManager not found. Make sure UniversalPlayer is loaded.');
    return;
  }
  
  console.log('🧪 [TEST] Starting token regeneration test...');
  
  // Test 1: Clear and generate new token
  console.log('\n1️⃣ [TEST-1] Clear cache and generate new token:');
  await window.secureManager.forceRefreshSWToken();
  
  const token1 = await window.secureManager.generateSecureStreamKey();
  await window.secureManager.updateSWSecureToken(token1);
  
  console.log('Token 1:', {
    streamKey: token1.streamKey,
    timestamp: token1.timestamp,
    time: new Date(token1.timestamp).toISOString()
  });
  
  // Test 2: Wait and generate another
  console.log('\n2️⃣ [TEST-2] Generate another token after 2 seconds:');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const token2 = await window.secureManager.generateSecureStreamKey();
  await window.secureManager.updateSWSecureToken(token2);
  
  console.log('Token 2:', {
    streamKey: token2.streamKey,
    timestamp: token2.timestamp,
    time: new Date(token2.timestamp).toISOString(),
    different: token1.streamKey !== token2.streamKey
  });
  
  // Test 3: Check Service Worker message handling
  console.log('\n3️⃣ [TEST-3] Check Service Worker response:');
  
  return {
    token1: token1.streamKey,
    token2: token2.streamKey,
    different: token1.streamKey !== token2.streamKey,
    timeDiff: token2.timestamp - token1.timestamp
  };
}

// Function to manually trigger token refresh
async function forceTokenRefresh() {
  if (!window.secureManager) {
    console.error('❌ secureManager not found');
    return;
  }
  
  console.log('🔄 [FORCE-REFRESH] Forcing token refresh...');
  
  // Clear Service Worker cache
  await window.secureManager.forceRefreshSWToken();
  
  // Generate new token
  const newToken = await window.secureManager.generateSecureStreamKey();
  await window.secureManager.updateSWSecureToken(newToken);
  
  console.log('✅ [FORCE-REFRESH] New token generated:', {
    streamKey: newToken.streamKey,
    timestamp: new Date(newToken.timestamp).toISOString()
  });
  
  return newToken;
}

// Function to check current Service Worker token
function checkCurrentSWToken() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'PING' });
    console.log('🏓 [CHECK] Pinged Service Worker to check status');
  } else {
    console.warn('⚠️ [CHECK] No Service Worker controller found');
  }
}

// Add functions to window for easy testing
window.testTokenRegeneration = testTokenRegeneration;
window.forceTokenRefresh = forceTokenRefresh;
window.checkCurrentSWToken = checkCurrentSWToken;

console.log(`
📋 [TEST-HELPER] Test functions available:
- testTokenRegeneration() - Test full regeneration flow
- forceTokenRefresh() - Force refresh current token
- checkCurrentSWToken() - Check Service Worker status

💡 Usage in console:
await testTokenRegeneration()
await forceTokenRefresh()
checkCurrentSWToken()
`);

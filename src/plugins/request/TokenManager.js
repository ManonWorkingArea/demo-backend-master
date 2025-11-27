import debug from '@/plugins/Logger.js';

/**
 * TokenManager - Handles token management and AES-GCM encryption
 * 
 * Features:
 * - AES-GCM token encryption/decryption
 * - Token expiry management with countdown
 * - Direct token usage (non-encrypted)
 * - Token status monitoring
 */
export class TokenManager {
  constructor() {
    this.authSecret = null;
    this.currentToken = null;
    this.currentTokenExpiry = null;
    this.tokenRefreshInterval = null;
    this.defaultTTL = 15; // 15 seconds TTL for encrypted tokens
    this.enableLogging = true;
  }

  /**
   * Set authentication secret for AES-GCM encryption
   * @param {string} authSecret - AUTH_SECRET for encryption
   */
  setAuthSecret(authSecret) {
    this.authSecret = authSecret;
    
    if (this.enableLogging) {
      debug.log('TokenManager: AUTH_SECRET updated');
    }
  }

  /**
   * Generate random nonce for encryption
   * @returns {string} Random nonce
   */
  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * AES-GCM Encryption
   * @param {string} text - Text to encrypt
   * @param {string} secret - Encryption secret
   * @returns {Promise<string>} Encrypted base64 string
   */
  async aesEncrypt(text, secret) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      // Generate random IV (12 bytes for GCM)
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Create key from secret using PBKDF2
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        'PBKDF2',
        false,
        ['deriveKey']
      );
      
      const cryptoKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('api-gateway-salt-2025'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
      
      // Encrypt with AES-GCM
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        data
      );
      
      // Combine IV + encrypted data
      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encrypted), iv.length);
      
      return btoa(String.fromCharCode.apply(null, result));
    } catch (error) {
      if (this.enableLogging) {
        debug.error('TokenManager: AES encryption failed:', error);
      }
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Generate encrypted token with AES-GCM
   * @param {string} baseToken - Base token to encrypt
   * @param {number} ttlSeconds - Time to live in seconds
   * @returns {Promise<Object>} Token data with expiry
   */
  async generateEncryptedToken(baseToken, ttlSeconds = null) {
    if (!this.authSecret) {
      throw new Error('AUTH_SECRET is required for token encryption');
    }
    
    if (!baseToken) {
      throw new Error('Base token is required');
    }
    
    const ttl = ttlSeconds || this.defaultTTL;
    const timestamp = Date.now();
    const expiresAt = timestamp + (ttl * 1000);
    const nonce = this.generateNonce();
    
    const payload = {
      token: baseToken,
      timestamp: expiresAt,
      expiresAt: expiresAt,
      nonce: nonce
    };
    
    try {
      const payloadString = JSON.stringify(payload);
      const encrypted = await this.aesEncrypt(payloadString, this.authSecret);
      
      this.currentToken = encrypted;
      this.currentTokenExpiry = expiresAt;
      
      if (this.enableLogging) {
        debug.log('TokenManager: Generated encrypted token', {
          expiresAt: new Date(expiresAt).toISOString(),
          ttl: ttl
        });
      }
      
      // Start countdown for token expiry
      this.startTokenCountdown();
      
      return {
        token: encrypted,
        expiresAt: expiresAt,
        ttl: ttl
      };
    } catch (error) {
      if (this.enableLogging) {
        debug.error('TokenManager: Token generation failed:', error);
      }
      throw new Error(`Failed to generate encrypted token: ${error.message}`);
    }
  }

  /**
   * Use token directly without encryption
   * @param {string} token - Direct token to use
   */
  useTokenDirectly(token) {
    if (!token) {
      throw new Error('Token is required');
    }
    
    this.currentToken = token;
    this.currentTokenExpiry = null;
    
    // Clear any existing countdown
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
    
    if (this.enableLogging) {
      debug.log('TokenManager: Using direct token (no encryption)');
    }
  }

  /**
   * Start token expiry countdown
   */
  startTokenCountdown() {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
    }
    
    this.tokenRefreshInterval = setInterval(() => {
      if (!this.currentTokenExpiry) {
        clearInterval(this.tokenRefreshInterval);
        return;
      }
      
      const now = Date.now();
      const timeLeft = Math.max(0, this.currentTokenExpiry - now);
      
      if (timeLeft <= 0) {
        if (this.enableLogging) {
          debug.warn('TokenManager: Token expired! Generate a new token.');
        }
        this.currentToken = null;
        this.currentTokenExpiry = null;
        clearInterval(this.tokenRefreshInterval);
        this.tokenRefreshInterval = null;
      } else if (timeLeft <= 5000) {
        const seconds = Math.ceil(timeLeft / 1000);
        if (this.enableLogging) {
          debug.warn(`TokenManager: Token expires in ${seconds}s!`);
        }
      }
    }, 1000);
  }

  /**
   * Get current token status
   * @returns {Object} Token status information
   */
  getTokenStatus() {
    const status = {
      hasToken: !!this.currentToken,
      isEncrypted: !!this.currentTokenExpiry,
      expiresAt: this.currentTokenExpiry,
      timeLeft: this.currentTokenExpiry ? Math.max(0, this.currentTokenExpiry - Date.now()) : null,
      isExpired: false,
      timeLeftSeconds: null,
      statusMessage: null
    };
    
    if (status.timeLeft !== null) {
      status.timeLeftSeconds = Math.ceil(status.timeLeft / 1000);
      status.isExpired = status.timeLeft <= 0;
      
      if (status.isExpired) {
        status.statusMessage = 'Token expired - generate new token';
      } else if (status.timeLeftSeconds <= 5) {
        status.statusMessage = `Token expires in ${status.timeLeftSeconds}s!`;
      } else {
        status.statusMessage = `Token expires in: ${status.timeLeftSeconds}s`;
      }
    } else if (status.hasToken) {
      status.statusMessage = 'Using token directly (no encryption)';
    } else {
      status.statusMessage = 'No token available';
    }
    
    return status;
  }

  /**
   * Clear current token
   */
  clearToken() {
    this.currentToken = null;
    this.currentTokenExpiry = null;
    
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
    
    if (this.enableLogging) {
      debug.log('TokenManager: Token cleared');
    }
  }

  /**
   * Get current token
   * @returns {string|null} Current token
   */
  getCurrentToken() {
    return this.currentToken;
  }

  /**
   * Check if token is valid (not expired)
   * @returns {boolean} True if token is valid
   */
  isTokenValid() {
    if (!this.currentToken) {
      return false;
    }
    
    if (this.currentTokenExpiry) {
      return Date.now() < this.currentTokenExpiry;
    }
    
    // Direct token (no expiry)
    return true;
  }

  /**
   * Enable or disable logging
   * @param {boolean} enable - Enable logging
   */
  setLogging(enable) {
    this.enableLogging = enable;
  }

  /**
   * Destroy token manager and clean up resources
   */
  destroy() {
    this.clearToken();
    
    if (this.enableLogging) {
      debug.log('TokenManager: Destroyed');
    }
  }

  /**
   * Check if token countdown is active
   * @returns {boolean} True if countdown is running
   */
  hasActiveCountdown() {
    return !!this.tokenRefreshInterval;
  }
}

export default TokenManager;

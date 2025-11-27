import CryptoJS from 'crypto-js';

class StorageManager {
  constructor(storageType = 'localStorage') {
    this.useEncryption = false; // Default to no encryption for performance
    this.secretKey = 'GZp5+YcJml0SW5JFQVZ9TQ==';
    this.storage = this.getStorageInstance(storageType);
    this.storageType = storageType;
    
    // Performance optimization: Cache for frequently accessed data
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache timeout
    this.lastCacheCleanup = Date.now();
    
    // Error tracking
    this.errorCount = 0;
    this.maxErrors = 10;
    
    // Initialize cleanup interval
    this.initializeCacheCleanup();
  }

  get(name, key = null) {
    if (!name) {
      console.warn('StorageManager: Empty name provided to get()');
      return null;
    }

    try {
      // Check cache first for performance
      const cacheKey = `${name}:${key || 'root'}`;
      const cached = this.getCachedItem(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const item = this.storage.getItem(name);
      const result = this.retrieveItem(item, key);
      
      // Cache the result for future use
      this.setCachedItem(cacheKey, result);
      
      return result;
    } catch (error) {
      this.handleError(`Error getting item '${name}':`, error);
      return null;
    }
  }

  set(name, item) {
    if (!name) {
      console.warn('StorageManager: Empty name provided to set()');
      return false;
    }

    try {
      this.storeItem(name, item);
      
      // Update cache
      this.setCachedItem(`${name}:root`, item);
      
      // Clear related cached items
      this.clearRelatedCache(name);
      
      return true;
    } catch (error) {
      this.handleError(`Error setting item '${name}':`, error);
      return false;
    }
  }

  update(name, newItem) {
    if (!name || !newItem) {
      console.warn('StorageManager: Invalid parameters provided to update()');
      return false;
    }

    try {
      const existingItem = this.get(name);
      const mergedItem = existingItem 
        ? { ...existingItem, ...newItem }
        : newItem;
      
      return this.set(name, mergedItem);
    } catch (error) {
      this.handleError(`Error updating item '${name}':`, error);
      return false;
    }
  }

  delete(name) {
    if (!name) {
      console.warn('StorageManager: Empty name provided to delete()');
      return false;
    }

    try {
      this.storage.removeItem(name);
      
      // Clear from cache
      this.clearRelatedCache(name);
      
      return true;
    } catch (error) {
      this.handleError(`Error deleting item '${name}':`, error);
      return false;
    }
  }

  // New method: Check if item exists
  exists(name) {
    if (!name) return false;
    
    try {
      return this.storage.getItem(name) !== null;
    } catch (error) {
      this.handleError(`Error checking existence of '${name}':`, error);
      return false;
    }
  }

  // New method: Get all storage keys
  getAllKeys() {
    try {
      const keys = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      this.handleError('Error getting all keys:', error);
      return [];
    }
  }

  // New method: Clear all storage
  clear() {
    try {
      this.storage.clear();
      this.cache.clear();
      return true;
    } catch (error) {
      this.handleError('Error clearing storage:', error);
      return false;
    }
  }

  // New method: Get storage size info
  getStorageInfo() {
    try {
      const keys = this.getAllKeys();
      let totalSize = 0;
      
      keys.forEach(key => {
        const item = this.storage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });
      
      return {
        keyCount: keys.length,
        totalSize: totalSize,
        estimatedSizeKB: Math.round(totalSize / 1024 * 100) / 100,
        storageType: this.storageType
      };
    } catch (error) {
      this.handleError('Error getting storage info:', error);
      return null;
    }
  }

  encrypt(data) {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
    } catch (error) {
      this.handleError('Error encrypting data:', error);
      return null;
    }
  }

  decrypt(ciphertext) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Failed to decrypt data - invalid key or corrupted data');
      }
      
      return JSON.parse(decryptedText);
    } catch (error) {
      this.handleError('Error decrypting data:', error);
      return null;
    }
  }

  setEncryption(enabled) {
    if (typeof enabled !== 'boolean') {
      console.warn('StorageManager: setEncryption expects a boolean value');
      return;
    }
    
    this.useEncryption = enabled;
    
    // Clear cache when encryption setting changes
    this.cache.clear();
  }

  // Utility function to get the appropriate storage instance
  getStorageInstance(storageType) {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Window object is not available');
      }

      switch (storageType) {
        case 'localStorage':
          if (!window.localStorage) {
            throw new Error('localStorage is not supported');
          }
          return window.localStorage;
          
        case 'sessionStorage':
          if (!window.sessionStorage) {
            throw new Error('sessionStorage is not supported');
          }
          return window.sessionStorage;
          
        case 'cookies':
          // Note: Cookie storage implementation would need additional logic
          console.warn('Cookie storage not fully implemented');
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {},
            length: 0,
            key: () => null
          };
          
        default:
          throw new Error(`Invalid storage type: ${storageType}`);
      }
    } catch (error) {
      console.error('StorageManager initialization error:', error);
      // Fallback to a dummy storage object
      return {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null
      };
    }
  }

  // Utility functions for working with data
  retrieveItem(item, key) {
    if (!item) {
      return null;
    }

    try {
      const data = this.useEncryption ? this.decrypt(item) : JSON.parse(item);
      
      if (data === null) {
        return null;
      }
      
      if (key) {
        return data && typeof data === 'object' ? data[key] : null;
      }
      
      return data;
    } catch (error) {
      this.handleError('Error retrieving item:', error);
      return null;
    }
  }

  storeItem(name, item) {
    try {
      if (item === undefined) {
        console.warn(`StorageManager: Attempting to store undefined value for '${name}'`);
        return;
      }
      
      const data = this.serializeItem(item);
      if (data !== null) {
        this.storage.setItem(name, data);
      }
    } catch (error) {
      this.handleError(`Error storing item '${name}':`, error);
      throw error; // Re-throw for caller to handle
    }
  }

  serializeItem(item) {
    try {
      return this.useEncryption ? this.encrypt(item) : JSON.stringify(item);
    } catch (error) {
      this.handleError('Error serializing item:', error);
      return null;
    }
  }

  // Cache management methods
  getCachedItem(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key); // Remove expired cache
    }
    
    return null;
  }

  setCachedItem(key, data) {
    // Limit cache size to prevent memory issues
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
    
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  clearRelatedCache(name) {
    // Clear all cache entries related to this storage item
    const keysToDelete = [];
    for (const [cacheKey] of this.cache) {
      if (cacheKey.startsWith(`${name}:`)) {
        keysToDelete.push(cacheKey);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  cleanupCache() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, value] of this.cache) {
      if (now - value.timestamp > this.cacheTimeout) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  initializeCacheCleanup() {
    // Cleanup cache every 5 minutes
    setInterval(() => {
      this.cleanupCache();
    }, 300000);
  }

  // Error handling
  handleError(message, error) {
    this.errorCount++;
    console.error(`StorageManager Error: ${message}`, error);
    
    if (this.errorCount > this.maxErrors) {
      console.warn('StorageManager: Too many errors detected. Consider checking storage availability.');
    }
    
    // You could implement error reporting here
    // For example, send to analytics or logging service
  }

  // Diagnostic methods
  getStatus() {
    return {
      isAvailable: this.storage !== null,
      storageType: this.storageType,
      useEncryption: this.useEncryption,
      cacheSize: this.cache.size,
      errorCount: this.errorCount,
      ...this.getStorageInfo()
    };
  }

  // Method to test storage functionality
  testStorage() {
    const testKey = '__storage_test__';
    const testValue = { test: true, timestamp: Date.now() };
    
    try {
      this.set(testKey, testValue);
      const retrieved = this.get(testKey);
      this.delete(testKey);
      
      return JSON.stringify(retrieved) === JSON.stringify(testValue);
    } catch (error) {
      console.error('Storage test failed:', error);
      return false;
    }
  }

  // Batch operations for better performance
  batchSet(items) {
    if (!Array.isArray(items)) {
      console.warn('StorageManager: batchSet expects an array of {name, data} objects');
      return false;
    }

    const results = [];
    
    try {
      items.forEach(({ name, data }) => {
        if (name && data !== undefined) {
          const result = this.set(name, data);
          results.push({ name, success: result });
        } else {
          results.push({ name, success: false, error: 'Invalid name or data' });
        }
      });
      
      return results;
    } catch (error) {
      this.handleError('Error in batch set operation:', error);
      return false;
    }
  }

  batchGet(names) {
    if (!Array.isArray(names)) {
      console.warn('StorageManager: batchGet expects an array of names');
      return {};
    }

    const results = {};
    
    try {
      names.forEach(name => {
        if (name) {
          results[name] = this.get(name);
        }
      });
      
      return results;
    } catch (error) {
      this.handleError('Error in batch get operation:', error);
      return {};
    }
  }

  // Performance monitoring
  measurePerformance(operation, ...args) {
    const startTime = performance.now();
    let result;
    
    try {
      switch (operation) {
        case 'get':
          result = this.get(...args);
          break;
        case 'set':
          result = this.set(...args);
          break;
        case 'update':
          result = this.update(...args);
          break;
        case 'delete':
          result = this.delete(...args);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.debug(`StorageManager.${operation} took ${duration.toFixed(2)}ms`);
      
      return { result, duration };
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.handleError(`Performance measurement failed for ${operation}:`, error);
      return { result: null, duration, error };
    }
  }

  // Migration helper
  migrate(oldKey, newKey, transformer = null) {
    try {
      const oldData = this.get(oldKey);
      if (oldData !== null) {
        const newData = transformer ? transformer(oldData) : oldData;
        const success = this.set(newKey, newData);
        
        if (success) {
          this.delete(oldKey);
          console.log(`StorageManager: Successfully migrated '${oldKey}' to '${newKey}'`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.handleError(`Migration failed from '${oldKey}' to '${newKey}':`, error);
      return false;
    }
  }

  // Subscribe to storage changes (for same-origin tabs)
  onStorageChange(callback) {
    if (this.storageType === 'localStorage' && typeof window !== 'undefined') {
      const handler = (event) => {
        if (event.storageArea === this.storage) {
          callback({
            key: event.key,
            oldValue: event.oldValue,
            newValue: event.newValue,
            url: event.url
          });
        }
      };
      
      window.addEventListener('storage', handler);
      
      // Return unsubscribe function
      return () => window.removeEventListener('storage', handler);
    }
    
    return () => {}; // No-op for non-localStorage or non-browser environments
  }
}

const storageManager = new StorageManager('localStorage'); // Default to localStorage

export default storageManager;

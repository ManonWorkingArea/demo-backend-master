import debug from '@/plugins/Logger.js';

/**
 * TenantManager - Handles tenant data injection and management
 * 
 * Features:
 * - Tenant data validation and injection
 * - Hostname and token management from tenant data
 * - Integration with TokenManager for token handling
 */
export class TenantManager {
  constructor(tokenManager) {
    this.tokenManager = tokenManager;
    this.hostname = null;
    this.hostkey = null;
    this.enableLogging = true;
  }

  /**
   * Set hostname reference
   * @param {string} hostname - Hostname for API requests
   */
  setHostname(hostname) {
    this.hostname = hostname;
    
    if (this.enableLogging) {
      debug.log('TenantManager: Hostname updated:', hostname);
    }
  }

  /**
   * Set host key (token)
   * @param {string} hostkey - Token for API requests
   */
  setHostkey(hostkey) {
    this.hostkey = hostkey;
    
    if (this.enableLogging) {
      debug.log('TenantManager: Hostkey updated:', hostkey ? hostkey.substring(0, 8) + '...' : 'none');
    }
  }

  /**
   * Inject tenant data
   * @param {Object} tenantData - Tenant data object
   * @param {Object} tenantData.child - Child tenant data
   * @param {string} tenantData.child.hostname - Tenant hostname
   * @param {string} tenantData.child.token - Tenant token
   */
  injectTenantData(tenantData) {
    if (!tenantData || !tenantData.child) {
      throw new Error('Invalid tenant data: missing child property');
    }
    
    const tenantChild = tenantData.child;
    
    if (tenantChild.hostname) {
      this.setHostname(tenantChild.hostname);
      
      if (this.enableLogging) {
        debug.log('TenantManager: Updated hostname from tenant injection:', tenantChild.hostname);
      }
    }
    
    if (tenantChild.token) {
      this.setHostkey(tenantChild.token);
      this.tokenManager.useTokenDirectly(tenantChild.token);
      
      if (this.enableLogging) {
        debug.log('TenantManager: Updated token from tenant injection:', tenantChild.token.substring(0, 8) + '...');
      }
    }
    
    if (this.enableLogging) {
      debug.log('TenantManager: Successfully injected tenant data:', {
        hostname: tenantChild.hostname,
        hasToken: !!tenantChild.token
      });
    }
    
    return this;
  }

  /**
   * Get current hostname
   * @returns {string|null} Current hostname
   */
  getHostname() {
    return this.hostname;
  }

  /**
   * Get current hostkey
   * @returns {string|null} Current hostkey
   */
  getHostkey() {
    return this.hostkey;
  }

  /**
   * Get tenant configuration
   * @returns {Object} Current tenant configuration
   */
  getTenantConfig() {
    return {
      hostname: this.hostname,
      hasHostkey: !!this.hostkey,
      hasToken: this.tokenManager.isTokenValid()
    };
  }

  /**
   * Enable or disable logging
   * @param {boolean} enable - Enable logging
   */
  setLogging(enable) {
    this.enableLogging = enable;
  }

  /**
   * Clear tenant data
   */
  clear() {
    this.hostname = null;
    this.hostkey = null;
    this.tokenManager.clearToken();
    
    if (this.enableLogging) {
      debug.log('TenantManager: Cleared tenant data');
    }
  }
}

export default TenantManager;

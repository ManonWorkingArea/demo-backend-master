/**
 * ServiceFactory - Factory for creating and managing CRUD services
 * 
 * 🏭 Factory Pattern implementation for service creation
 * ✅ Environment-aware service creation (development, testing, production)
 * 🔧 Centralized configuration management
 * 🎯 Simplified service instantiation
 * 🚫 NO impact on existing components - 100% backward compatible
 * 📊 Built-in logging and monitoring capabilities
 */

import PackageService from './service/PackageService.js';
import ContractService from './service/ContractService.js';
import SubscriptionService from './service/SubscriptionService.js';
import InvoiceService from './service/InvoiceService.js';
import ReceiptService from './service/ReceiptService.js';
import OwnershipService from './service/OwnershipService.js';
import CollectionService from './service/CollectionService.js';

class ServiceFactory {
  /**
   * 📋 Service class registry - มี service classes ทั้งหมด
   */
  static serviceClasses = {
    package: PackageService,
    contract: ContractService,
    subscription: SubscriptionService,
    invoice: InvoiceService,
    receipt: ReceiptService,
    ownership: OwnershipService,
    collection: CollectionService
  };

  /**
   * 💾 Singleton instances cache (optional optimization)
   */
  static singletons = new Map();

  /**
   * 🎨 Default configuration for all environments
   */
  static getDefaultConfig() {
    return {
      enableCache: true,
      timeout: 30000,
      retryAttempts: 3,
      logLevel: 'info'
    };
  }

  /**
   * 🎯 Service-specific configurations
   */
  static getServiceConfigs() {
    return {
      package: {
        enableCache: true,
        timeout: 10000,
        retryAttempts: 2,
        description: 'Package management service'
      },
      
      contract: {
        enableCache: true,
        timeout: 20000,
        retryAttempts: 3,
        description: 'Contract management service'
      },
      
      subscription: {
        enableCache: true,
        timeout: 15000,
        retryAttempts: 3,
        description: 'Subscription management service'
      },
      
      invoice: {
        enableCache: false, // Real-time financial data
        timeout: 5000,
        retryAttempts: 2,
        description: 'Invoice management service'
      },
      
      receipt: {
        enableCache: false, // Real-time financial data
        timeout: 5000,
        retryAttempts: 2,
        description: 'Receipt management service'
      },
      
      ownership: {
        enableCache: true,
        timeout: 25000,
        retryAttempts: 4, // Critical for billing
        description: 'Ownership management service'
      },
      
      collection: {
        enableCache: true,
        timeout: 20000,
        retryAttempts: 3,
        description: 'Collection management service'
      }
    };
  }

  /**
   * 🌍 Environment-specific configurations
   */
  static getEnvironmentConfig(environment = 'production') {
    const configs = {
      development: {
        enableCache: false,
        timeout: 60000,
        logLevel: 'debug',
        enableLogging: true
      },
      
      testing: {
        enableCache: false,
        timeout: 10000,
        logLevel: 'error',
        enableLogging: false
      },
      
      staging: {
        enableCache: true,
        timeout: 20000,
        logLevel: 'warn',
        enableLogging: true
      },
      
      production: {
        enableCache: true,
        timeout: 30000,
        logLevel: 'error',
        enableLogging: false
      }
    };

    return configs[environment] || configs.production;
  }

  /**
   * 🏭 Create a single service instance
   * @param {string} serviceType - Type of service to create
   * @param {string} hostkey - Host key for the service
   * @param {Object} options - Additional options
   * @returns {Object} Service instance
   */
  static createService(serviceType, hostkey, options = {}) {
    const ServiceClass = this.serviceClasses[serviceType];
    
    if (!ServiceClass) {
      throw new Error(`❌ Unknown service type: ${serviceType}`);
    }

    // Get merged configuration
    const config = this.getMergedConfig(serviceType, options);

    // Create service instance
    const service = new ServiceClass(hostkey);

    // Apply decorators if needed
    const decoratedService = this.decorateService(service, serviceType, config);

    return decoratedService;
  }

  /**
   * 🏭 Create all services at once - หลักของ Factory Pattern
   * @param {string} hostkey - Host key for all services
   * @param {Object} options - Options for service creation
   * @returns {Object} Object containing all service instances
   */
  static createAllServices(hostkey, options = {}) {
    const services = {};
    const serviceTypes = Object.keys(this.serviceClasses);

    // Create each service
    serviceTypes.forEach(serviceType => {
      try {
        services[serviceType] = this.createService(serviceType, hostkey, options);
      } catch (error) {
        console.error(`❌ ServiceFactory: Failed to create ${serviceType} service:`, error);
        throw error;
      }
    });

    return services;
  }

  /**
   * 🔧 Get merged configuration for a service
   * @param {string} serviceType - Type of service
   * @param {Object} options - User options
   * @returns {Object} Merged configuration
   */
  static getMergedConfig(serviceType, options = {}) {
    const defaultConfig = this.getDefaultConfig();
    const environmentConfig = this.getEnvironmentConfig(options.environment || 'production');
    const serviceConfig = this.getServiceConfigs()[serviceType] || {};
    const customConfig = options.config || {};

    return {
      ...defaultConfig,
      ...environmentConfig,
      ...serviceConfig,
      ...customConfig,
      serviceType,
      environment: options.environment || 'production'
    };
  }

  /**
   * 🎭 Apply decorators to service (logging, monitoring, etc.)
   * @param {Object} service - Service instance
   * @param {string} serviceType - Type of service
   * @param {Object} config - Service configuration
   * @returns {Object} Decorated service
   */
  static decorateService(service, serviceType, config = {}) {
    let decoratedService = service;

    // Apply logging decorator if enabled
    if (config.enableLogging) {
      decoratedService = this.addLoggingDecorator(decoratedService, serviceType);
    }

    // Apply performance monitoring if enabled
    if (config.enableMetrics) {
      decoratedService = this.addMetricsDecorator(decoratedService);
    }

    return decoratedService;
  }

  /**
   * 📝 Add logging decorator - แยกออกมาเพื่อความชัดเจน
   */
  static addLoggingDecorator(service, serviceType) {
    return new Proxy(service, {
      get(target, prop) {
        const value = target[prop];
        
        if (typeof value === 'function') {
          return function(...args) {
            const result = value.apply(this, args);
            
            // Handle async functions
            if (result instanceof Promise) {
              return result
                .catch(err => {
                  console.error(`❌ ${serviceType}.${prop}() failed:`, err.message);
                  throw err;
                });
            }
            
            return result;
          };
        }
        
        return value;
      }
    });
  }

  /**
   * 📊 Add performance metrics decorator
   */
  static addMetricsDecorator(service) {
    return new Proxy(service, {
      get(target, prop) {
        const value = target[prop];
        
        if (typeof value === 'function') {
          return function(...args) {
            const result = value.apply(this, args);
            
            // Handle async functions
            if (result instanceof Promise) {
              return result.finally(() => {
                // Metrics tracking without console noise
                // Could send to monitoring service here
              });
            }
            
            // Handle sync functions
            // Could send to monitoring service here
            return result;
          };
        }
        
        return value;
      }
    });
  }

  /**
   * 🔄 Get singleton instance (optional optimization feature)
   * @param {string} serviceType - Type of service
   * @param {string} hostkey - Host key
   * @param {Object} options - Service options
   * @returns {Object} Singleton service instance
   */
  static getSingleton(serviceType, hostkey, options = {}) {
    const key = `${serviceType}_${hostkey}_${options.environment || 'production'}`;
    
    if (!this.singletons.has(key)) {
      this.singletons.set(key, this.createService(serviceType, hostkey, options));
    }
    
    return this.singletons.get(key);
  }

  /**
   * 🧹 Clear singleton cache (useful for testing)
   */
  static clearSingletons() {
    this.singletons.clear();
  }

  /**
   * 📊 Get factory statistics
   */
  static getStats() {
    return {
      registeredServices: Object.keys(this.serviceClasses).length,
      singletonInstances: this.singletons.size,
      serviceTypes: Object.keys(this.serviceClasses)
    };
  }

  /**
   * 🔧 Register new service class (for extensibility)
   * @param {string} serviceType - Type of service
   * @param {Class} ServiceClass - Service class constructor
   */
  static registerService(serviceType, ServiceClass) {
    this.serviceClasses[serviceType] = ServiceClass;
  }

  /**
   * 🔍 Check if service type is registered
   * @param {string} serviceType - Type of service to check
   * @returns {boolean} Whether service is registered
   */
  static isServiceRegistered(serviceType) {
    return serviceType in this.serviceClasses;
  }

  /**
   * 📋 Get list of available service types
   * @returns {Array} List of service type names
   */
  static getAvailableServices() {
    return Object.keys(this.serviceClasses);
  }
}

export default ServiceFactory; 
/**
 * ERP Core Configuration
 * กำหนด default behavior ของ ERP Core
 */

// ตรวจสอบว่าควรใช้ driver อะไร
export function getDefaultDriver() {
  // ถ้ามี environment variable กำหนดไว้
  if (process.env.VUE_APP_ERP_DRIVER) {
    return process.env.VUE_APP_ERP_DRIVER
  }
  
  // ถ้าอยู่ใน production ให้ใช้ API
  if (process.env.NODE_ENV === 'production') {
    return 'api'
  }
  
  // Default: localStorage (สำหรับ development)
  return 'local'
}

// Configuration object
export const ERP_CONFIG = {
  // Driver configuration
  driver: {
    default: getDefaultDriver(),
    
    // API options
    api: {
      baseEndpoint: process.env.VUE_APP_ERP_ENDPOINT || 'transaction',
      prefix: process.env.VUE_APP_API_PREFIX || '/api/'
    },
    
    // LocalStorage options
    local: {
      prefix: 'erp_'
    }
  },
  
  // Performance
  cache: {
    enabled: true,
    ttl: 300000 // 5 minutes
  },
  
  // Logging
  logging: {
    enabled: process.env.NODE_ENV !== 'production',
    level: process.env.VUE_APP_LOG_LEVEL || 'info'
  }
}

export default ERP_CONFIG

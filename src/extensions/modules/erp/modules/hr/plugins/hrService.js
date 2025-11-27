/**
 * HR Module Plugin - HRService Integration
 * Auto-initialize HRService for Gateway API integration
 */

import { hrService } from '@/services/HRService.js'
import positionService from '@/services/PositionService.js'

export default {
  async install(app) {
    // Auto-initialize HRService with app context
    try {
      console.log('🚀 [HR Module] Initializing HRService...')
      
      // Initialize with app's global properties
      hrService.initialize(app.config.globalProperties)
      
      // Make service available globally
      app.config.globalProperties.$hrService = hrService
      app.provide('hrService', hrService)
      
      console.log('✅ [HR Module] HRService initialized successfully')
      
      // Debug: Show available methods
      console.log('🔧 [HR Module] Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(hrService)))
      
    } catch (error) {
      console.error('❌ [HR Module] Failed to initialize HRService:', error)
    }

    // Initialize PositionService
    try {
      console.log('🚀 [HR Module] Initializing PositionService...')
      
      positionService.initialize(app.config.globalProperties)
      
      app.config.globalProperties.$positionService = positionService
      app.provide('positionService', positionService)
      
      console.log('✅ [HR Module] PositionService initialized successfully')
      
    } catch (error) {
      console.error('❌ [HR Module] Failed to initialize PositionService:', error)
    }

    // Setup global helpers
    app.config.globalProperties.$hrHelpers = {
      // Quick access to user management
      async createUser(userData) {
        return await hrService.createUser(userData)
      },
      
      async getUsers() {
        return await hrService.getUsers()
      },
      
      async getUserById(userId) {
        return await hrService.getUserById(userId)
      },
      
      async updateUser(userId, updateData) {
        return await hrService.updateUser(userId, updateData)
      },
      
      async deleteUser(userId) {
        return await hrService.deleteUser(userId)
      },

      // Authentication
      async authenticate(username, password) {
        return await hrService.authenticate(username, password)
      },

      // Password utilities
      generatePasswordHash(password) {
        return hrService.generatePasswordHash(password)
      },
      
      verifyPassword(password, hash, salt) {
        return hrService.verifyPassword(password, hash, salt)
      },

      // Configuration
      setParentOrganization(parentId) {
        hrService.setParentOrganization(parentId)
      },
      
      clearCache() {
        hrService.clearCache()
      },

      // Debug helpers
      getServiceInfo() {
        return {
          initialized: hrService.initialized,
          hasGatewayKey: !!hrService.gatewayKey,
          hasErpKey: !!hrService.erpKey,
          parentOrgId: hrService.parentOrgId,
          gatewayUrl: hrService.gatewayUrl,
          erpCentralUrl: hrService.erpCentralUrl,
          cacheSize: {
            users: hrService.cache.users.length,
            employees: hrService.cache.employees.length
          },
          lastUpdated: hrService.cache.lastUpdated
        }
      }
    }

    console.log('✅ [HR Module] Plugin installed with HRService integration')
  }
}

// Export hrService for direct imports
export { hrService }

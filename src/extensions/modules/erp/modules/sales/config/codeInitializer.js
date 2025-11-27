/**
 * Sales Code Pattern Initializer
 * ตัวช่วยในการ initialize code patterns สำหรับ sales module
 */

import { SALES_CODE_PATTERNS } from './codePatterns.js'

export class SalesCodeInitializer {
  constructor(codeManager = null) {
    this.codeManager = codeManager || window.ERP_CORE?.codeManager
    this.initialized = false
  }

  /**
   * Initialize all sales code patterns
   */
  async initializeSalesPatterns() {
    try {
      console.log('🚀 [SalesCodeInitializer] Initializing sales code patterns...')

      if (!this.codeManager) {
        console.warn('⚠️ [SalesCodeInitializer] No CodeManager available')
        return false
      }

      const results = []

      // Install each sales pattern
      for (const [moduleKey, pattern] of Object.entries(SALES_CODE_PATTERNS)) {
        try {
          console.log(`📋 [SalesCodeInitializer] Installing pattern for ${moduleKey}...`)
          
          const result = await this.installPattern(pattern)
          results.push({
            module: moduleKey,
            success: result.success,
            message: result.message
          })

          if (result.success) {
            console.log(`✅ [SalesCodeInitializer] Pattern installed: ${moduleKey}`)
          } else {
            console.warn(`⚠️ [SalesCodeInitializer] Pattern installation failed: ${moduleKey} - ${result.message}`)
          }

        } catch (error) {
          console.error(`❌ [SalesCodeInitializer] Error installing pattern ${moduleKey}:`, error)
          results.push({
            module: moduleKey,
            success: false,
            message: error.message
          })
        }
      }

      this.initialized = true
      
      const successCount = results.filter(r => r.success).length
      console.log(`✅ [SalesCodeInitializer] Initialized ${successCount}/${results.length} sales patterns successfully`)

      return {
        success: true,
        totalPatterns: results.length,
        successfulPatterns: successCount,
        results: results
      }

    } catch (error) {
      console.error('❌ [SalesCodeInitializer] Failed to initialize sales patterns:', error)
      return {
        success: false,
        error: error.message,
        results: []
      }
    }
  }

  /**
   * Install single pattern
   */
  async installPattern(pattern) {
    try {
      // Check if pattern already exists
      const existingPattern = this.codeManager.getPatternForModule(pattern.module)
      
      if (existingPattern) {
        console.log(`📋 [SalesCodeInitializer] Pattern already exists for ${pattern.module}, updating...`)
        
        // Update existing pattern
        await this.codeManager.updatePattern(pattern.module, pattern)
        
        return {
          success: true,
          message: `Pattern updated for ${pattern.module}`
        }
      } else {
        console.log(`📋 [SalesCodeInitializer] Creating new pattern for ${pattern.module}...`)
        
        // Create new pattern
        await this.codeManager.addPattern(pattern.module, pattern)
        
        return {
          success: true,
          message: `Pattern created for ${pattern.module}`
        }
      }

    } catch (error) {
      console.error(`❌ [SalesCodeInitializer] Failed to install pattern for ${pattern.module}:`, error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * Verify all sales patterns are installed
   */
  async verifySalesPatterns() {
    try {
      const results = []

      for (const [moduleKey, pattern] of Object.entries(SALES_CODE_PATTERNS)) {
        const existingPattern = this.codeManager.getPatternForModule(pattern.module)
        
        results.push({
          module: moduleKey,
          installed: !!existingPattern,
          pattern: existingPattern || null
        })
      }

      const installedCount = results.filter(r => r.installed).length
      
      console.log(`📊 [SalesCodeInitializer] Verification: ${installedCount}/${results.length} sales patterns installed`)

      return {
        totalPatterns: results.length,
        installedPatterns: installedCount,
        allInstalled: installedCount === results.length,
        results: results
      }

    } catch (error) {
      console.error('❌ [SalesCodeInitializer] Failed to verify sales patterns:', error)
      return {
        totalPatterns: 0,
        installedPatterns: 0,
        allInstalled: false,
        error: error.message
      }
    }
  }

  /**
   * Reset all sales sequences (use with caution!)
   */
  async resetSalesSequences() {
    try {
      console.log('🔄 [SalesCodeInitializer] Resetting all sales sequences...')

      const results = []

      for (const [moduleKey, pattern] of Object.entries(SALES_CODE_PATTERNS)) {
        try {
          if (this.codeManager.resetSequence) {
            await this.codeManager.resetSequence(pattern.module)
            results.push({
              module: moduleKey,
              success: true,
              message: 'Sequence reset successfully'
            })
          } else {
            results.push({
              module: moduleKey,
              success: false,
              message: 'Reset method not available'
            })
          }
        } catch (error) {
          results.push({
            module: moduleKey,
            success: false,
            message: error.message
          })
        }
      }

      const successCount = results.filter(r => r.success).length
      console.log(`✅ [SalesCodeInitializer] Reset ${successCount}/${results.length} sales sequences`)

      return {
        success: true,
        totalSequences: results.length,
        successfulResets: successCount,
        results: results
      }

    } catch (error) {
      console.error('❌ [SalesCodeInitializer] Failed to reset sales sequences:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Generate test codes for all sales patterns
   */
  async generateTestCodes() {
    try {
      console.log('🧪 [SalesCodeInitializer] Generating test codes for all sales patterns...')

      const results = []

      for (const [moduleKey, pattern] of Object.entries(SALES_CODE_PATTERNS)) {
        try {
          const testCode = await this.codeManager.generateCode(pattern.module, null, {
            testMode: true
          })

          results.push({
            module: moduleKey,
            success: !!testCode,
            testCode: testCode,
            pattern: pattern.format
          })

        } catch (error) {
          results.push({
            module: moduleKey,
            success: false,
            error: error.message,
            pattern: pattern.format
          })
        }
      }

      console.log('🧪 [SalesCodeInitializer] Test code generation results:', results)
      return results

    } catch (error) {
      console.error('❌ [SalesCodeInitializer] Failed to generate test codes:', error)
      return []
    }
  }
}

// Auto-initialize when imported (if CodeManager is available)
let autoInitializer = null

export async function autoInitializeSalesPatterns() {
  try {
    // Wait for CodeManager to be ready
    if (window.ERP_CORE?.codeManager) {
      autoInitializer = new SalesCodeInitializer(window.ERP_CORE.codeManager)
      
      console.log('🔄 [Sales Module] Auto-initializing sales code patterns...')
      const result = await autoInitializer.initializeSalesPatterns()
      
      if (result.success) {
        console.log('✅ [Sales Module] Sales code patterns auto-initialized successfully')
      } else {
        console.warn('⚠️ [Sales Module] Sales code patterns auto-initialization had issues:', result)
      }
      
      return result
    } else {
      console.log('⏳ [Sales Module] Waiting for CodeManager to be ready...')
      return null
    }
  } catch (error) {
    console.error('❌ [Sales Module] Auto-initialization failed:', error)
    return null
  }
}

export default SalesCodeInitializer
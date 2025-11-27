/**
 * Centralized Code Manager
 * ระบบจัดการรหัสแบบศูนย์กลางสำหรับทุก Module
 */

// ใช้ hardcoded patterns แทน import ที่อาจไม่มี
const DEFAULT_CODE_PATTERNS = null // จะใช้ hardcoded patterns

import {
  getAllCodePatterns,
  saveCodePattern,
  updateCodePattern,
  validateCode,
  generateCodeExample,
  resetSequence
} from './masterdata/codeManagement/data.js'

export class CodeManager {
  constructor(engine = null) {
    this.engine = engine // รับ engine จากภายนอก
    this.initialized = false
    this.patterns = new Map()
    this.cache = new Map()
    this.sequenceLocks = new Map() // 🔒 Lock สำหรับ sequence generation
    this.SEQUENCE_LOCK_TIMEOUT = 10000 // 10 seconds สำหรับ code generation
    console.log('[CodeManager] 🚀 Initializing Centralized Code Manager', engine ? 'with custom engine' : 'without engine')
  }
  
  /**
   * Set engine instance (for API driver support)
   */
  setEngine(engine) {
    this.engine = engine
    console.log('[CodeManager] 🔄 Engine updated:', engine?.driverType || 'unknown')
  }

  /**
   * 🔒 Acquire sequence lock
   * @param {string} module - Module name
   * @returns {boolean} True if lock acquired
   * @throws {Error} If lock is already held
   */
  acquireSequenceLock(module) {
    const lockKey = `sequence_${module}`
    
    if (this.sequenceLocks.has(lockKey)) {
      const lockInfo = this.sequenceLocks.get(lockKey)
      const age = Date.now() - lockInfo.startTime
      throw new Error(`🔒 Sequence generation already in progress for ${module} (${age}ms)`)
    }
    
    // Set lock with auto-timeout
    const startTime = Date.now()
    const timeoutId = setTimeout(() => {
      if (this.sequenceLocks.has(lockKey)) {
        this.sequenceLocks.delete(lockKey)
        console.warn(`⚠️ [CodeManager] Sequence lock timeout for ${module} after ${this.SEQUENCE_LOCK_TIMEOUT}ms`)
      }
    }, this.SEQUENCE_LOCK_TIMEOUT)
    
    this.sequenceLocks.set(lockKey, { startTime, timeoutId })
    return true
  }

  /**
   * 🔓 Release sequence lock
   * @param {string} module - Module name
   */
  releaseSequenceLock(module) {
    const lockKey = `sequence_${module}`
    const lockInfo = this.sequenceLocks.get(lockKey)
    
    if (lockInfo) {
      clearTimeout(lockInfo.timeoutId)
      const duration = Date.now() - lockInfo.startTime
      this.sequenceLocks.delete(lockKey)
      
      if (duration > 1000) {
        console.warn(`⏱️ [CodeManager] Sequence generation took ${duration}ms for ${module}`)
      }
    }
  }

  /**
   * 🔧 Initialize Code Manager
   */
  async initialize() {
    try {
      console.log('[CodeManager] 📋 Loading code patterns...')
      
      // โหลด patterns ทั้งหมดจาก storage
      await this.loadAllPatterns()
      
      // โหลด patterns จาก masterdata modules
      await this.loadModulePatterns()
      
      // ตรวจสอบและสร้าง default patterns หากยังไม่มี
      await this.ensureDefaultPatterns()
      
      this.initialized = true
      console.log('[CodeManager] ✅ Code Manager initialized successfully')
      console.log(`[CodeManager] 📊 Loaded ${this.patterns.size} patterns:`, Array.from(this.patterns.keys()))
      
    } catch (error) {
      console.error('[CodeManager] ❌ Failed to initialize:', error)
      // ใช้ default patterns หากมีปัญหา
      this.loadDefaultPatterns()
      this.initialized = true
    }
  }

  /**
   * 📋 โหลด patterns ทั้งหมดจาก storage
   */
  async loadAllPatterns() {
    try {
      const patterns = await getAllCodePatterns()
      
      patterns.forEach(pattern => {
        this.patterns.set(pattern.module, pattern)
      })
      
      console.log(`[CodeManager] 📥 Loaded ${patterns.length} patterns from storage`)
      
    } catch (error) {
      console.error('[CodeManager] ❌ Error loading patterns:', error)
    }
  }

  /**
   * 🎯 ตรวจสอบและสร้าง default patterns
   */
  async ensureDefaultPatterns() {
    // ⛔ ไม่ใช้ hardcoded patterns - บังคับให้ใช้ config จากโมดูลเท่านั้น
    console.log('[CodeManager] � Skipping hardcoded patterns - using module configs only')
    return
  }



  /**
   * 🔄 โหลด patterns จาก masterdata modules (ตาม core architecture)
   */
  async loadModulePatterns() {
    console.log('[CodeManager] 🔄 Loading module patterns from ERP_CORE')
    
    try {
      // โหลดจาก ERP_CORE masterdata เท่านั้น (core ได้โหลดไว้แล้ว)
      await this.loadFromERPCore()
      
      console.log(`[CodeManager] 📊 Total loaded patterns: ${this.patterns.size}`)
      console.log(`[CodeManager] 🗂️ Available modules:`, Array.from(this.patterns.keys()))
      
    } catch (error) {
      console.error('[CodeManager] ❌ Error loading module patterns:', error)
    }
  }

  /**
   * 🎯 โหลด code configs จาก ERP_CORE masterdata
   */
  async loadFromERPCore() {
    console.log('[CodeManager] 🎯 Loading patterns from ERP_CORE masterdata')
    
    if (!window.ERP_CORE) {
      console.error('[CodeManager] ❌ ERP_CORE not available - core not initialized')
      return
    }
    
    if (!window.ERP_CORE.masterdata) {
      console.error('[CodeManager] ❌ ERP_CORE.masterdata not available - masterdata not loaded')
      return
    }
    
    const masterdataModules = [
      'supplier', 'customer', 'purchase', 'inventory', 'sales', 'document', 
      'delivery', 'payment', 'production', 'quotation', 'returns', 'workorder'
    ]
    
    console.log('[CodeManager] 🔍 Available ERP_CORE modules:', Object.keys(window.ERP_CORE.masterdata))
    
    for (const module of masterdataModules) {
      try {
        const moduleData = window.ERP_CORE.masterdata[module]
        const configKey = `${module.toUpperCase()}_CODE_CONFIG`
        
        console.log(`[CodeManager] 🔍 Checking ${module}:`, {
          hasModule: !!moduleData,
          hasConfig: !!(moduleData && moduleData[configKey]),
          configKey
        })
        
        if (moduleData && moduleData[configKey]) {
          const config = moduleData[configKey]
          console.log(`[CodeManager] ✅ Found ERP_CORE pattern for ${module}:`, {
            patterns: Object.keys(config.patterns || {}),
            firstPatternPrefix: config.patterns?.default?.prefix || 'N/A',
            configSource: 'erp_core'
          })
          console.log(`[CodeManager] 🔍 ${module} config details:`, config)
          this.patterns.set(module, config)
        } else {
          console.log(`[CodeManager] 💡 No ${configKey} found in ERP_CORE.masterdata.${module}`)
        }
      } catch (error) {
        console.warn(`[CodeManager] ⚠️ Error accessing ERP_CORE module ${module}:`, error.message)
      }
    }
  }

  /**
   * ⛔ ไม่โหลด default patterns - บังคับใช้ config จากโมดูล
   */
  loadDefaultPatterns() {
    console.log('[CodeManager] ⛔ Default patterns disabled - use module configs only')
    return
  }

  /**
   * ⛔ ไม่ใช้ hardcoded patterns - บังคับให้ใช้ config จากโมดูล
   */
  loadHardcodedPatterns() {
    console.log('[CodeManager] ⛔ Hardcoded patterns disabled - use module configs only')
    return
  }




  /**
   * 🎯 ดึง pattern สำหรับ module จาก CorporateConfig (Priority 1) หรือ masterdata (Priority 2)
   */
  async getPatternForModule(module, type = null) {
    console.log(`[CodeManager] 🎯 Getting pattern for ${module}${type ? ` (type: ${type})` : ''}`)
    
    // 🗺️ Module mapping for legacy support
    const moduleMapping = {
      'category': { sourceModule: 'inventory', patternKey: 'category' },
      'stockMovement': { sourceModule: 'inventory', patternKey: 'stockMovement' },
      'stockAdjustment': { sourceModule: 'inventory', patternKey: 'stockAdjustment' },
      'stockTransfer': { sourceModule: 'inventory', patternKey: 'stockTransfer' },
      // 🆕 Purchase module sub-patterns
      'purchase': { sourceModule: 'purchase', patternKey: 'purchaseRequest' } // Default สำหรับ Purchase
    }
    
    // Check if this module needs special mapping
    const mapping = moduleMapping[module]
    let actualModule = module
    let patternKey = type
    
    if (mapping) {
      actualModule = mapping.sourceModule
      patternKey = mapping.patternKey
      console.log(`[CodeManager] 🔄 Mapped ${module} -> ${actualModule}.${patternKey}`)
    } else if (module === 'purchase' && !type) {
      // 🆕 ถ้าเป็น purchase module แต่ไม่ระบุ type ให้ใช้ purchaseRequest เป็น default
      patternKey = 'purchaseRequest'
      console.log(`[CodeManager] 🔄 Using default purchase pattern: purchaseRequest`)
    }
    
    // 🏆 Priority 1: Check CorporateConfig database first
    try {
      const accountingSettings = window.ERP_CORE?.accounting
      if (accountingSettings) {
        // ✅ Initialize AccountingSettings if not already initialized
        if (!accountingSettings.initialized) {
          try {
            // ใช้ window.vueApp ที่มี $Request service จริง
            if (window.vueApp && window.vueApp.$Request) {
              accountingSettings.initialize(window.vueApp)
              console.log('[CodeManager] ✅ AccountingSettings initialized with window.vueApp')
            } else if (this.engine?.apiDriver) {
              // Fallback: สร้าง mock Vue context ด้วย apiDriver
              const vueContext = {
                $Request: this.engine.apiDriver,
                $Key: null
              }
              accountingSettings.initialize(vueContext)
              console.log('[CodeManager] ✅ AccountingSettings initialized with engine.apiDriver')
            } else {
              console.warn('[CodeManager] ⚠️ No $Request service available')
            }
          } catch (error) {
            console.warn('[CodeManager] ⚠️ Failed to initialize AccountingSettings:', error.message)
          }
        }
        
        // ตรวจสอบว่า initialized สำเร็จหรือไม่
        if (!accountingSettings.initialized || !accountingSettings.apiRequest) {
          console.log('[CodeManager] ⚠️ AccountingSettings not properly initialized, skipping database check')
        } else {
          console.log('[CodeManager] 🔄 Loading settings from database...')
          // โหลด settings จาก database
          await accountingSettings.loadSettings()
          
          // ลองดึง pattern จาก database
          // ⚠️ สำหรับ product module: ไม่ต้องใส่ patternKey ซ้ำ
          let configKey
          if (actualModule === 'product' && patternKey === 'product') {
            // กรณีพิเศษ: product.product → ใช้แค่ product
            configKey = `number_series.${actualModule}`
          } else if (patternKey) {
            configKey = `number_series.${actualModule}.${patternKey}`
          } else {
            configKey = `number_series.${actualModule}`
          }
          
          console.log(`[CodeManager] 🔑 Database config key: "${configKey}" (module: ${actualModule}, patternKey: ${patternKey})`)
          const savedPattern = await accountingSettings.getConfig(configKey)
        
          if (savedPattern && savedPattern.prefix && savedPattern.format) {
            console.log(`[CodeManager] 💾 Found pattern in database for ${configKey}:`, {
              prefix: savedPattern.prefix,
              format: savedPattern.format,
              sequenceCurrent: savedPattern.sequence?.current,
              sequenceNext: savedPattern.sequence?.next,
              sequenceDigits: savedPattern.sequence?.digits,
              resetOnYearChange: savedPattern.sequence?.resetOnYearChange,
              updatedAt: savedPattern.updatedAt
            })
            
            // แปลงจากรูปแบบ CorporateConfig เป็นรูปแบบที่ CodeManager ใช้งาน
            return {
              source: 'corporate_config',
              config: {
                module: actualModule,
                patternKey: patternKey
              },
              pattern: {
                prefix: savedPattern.prefix,
                format: savedPattern.format,
                year: savedPattern.format.includes('YYYY') || savedPattern.format.includes('{year}'),
                sequence: {
                  digits: savedPattern.sequence?.digits || 4,
                  start: savedPattern.sequence?.start || 1,
                  resetOnYearChange: savedPattern.sequence?.resetOnYearChange || false,
                  current: savedPattern.sequence?.current || 0, // 🔢 เก็บ sequence ปัจจุบัน
                  next: savedPattern.sequence?.next || (savedPattern.sequence?.current || 0) + 1 // 🔢 เพิ่ม next
                },
                resetPeriod: savedPattern.resetPeriod || 'yearly',
                updatedAt: savedPattern.updatedAt
              }
            }
          }
          
          console.log(`[CodeManager] 💡 No database pattern for ${configKey}, checking masterdata`)
        }
      }
    } catch (error) {
      console.log(`[CodeManager] ⚠️ Error accessing database pattern:`, error.message)
    }
    
    // Priority 2: ERP_CORE masterdata (from actual masterdata files)
    try {
      // แนวทางใหม่: อ่านจาก ERP_CORE masterdata object ที่โหลดจริง
      const erpCorePattern = window.ERP_CORE?.masterdata?.[actualModule]?.[`${actualModule.toUpperCase()}_CODE_CONFIG`]
      
      console.log(`[CodeManager] 🔍 ERP_CORE masterdata check:`, {
        originalModule: module,
        actualModule,
        patternKey,
        hasERP_CORE: !!window.ERP_CORE,
        hasMasterdata: !!window.ERP_CORE?.masterdata,
        hasModule: !!window.ERP_CORE?.masterdata?.[actualModule],
        hasConfig: !!erpCorePattern,
        configKey: `${actualModule.toUpperCase()}_CODE_CONFIG`,
        source: 'ERP_CORE.masterdata (loaded from files)',
        availableModules: Object.keys(window.ERP_CORE?.masterdata || {})
      })
      
      if (erpCorePattern) {
        console.log(`[CodeManager] 🏢 Found ERP_CORE masterdata pattern for ${actualModule}:`, erpCorePattern)
        
        // ถ้าต้องการ pattern เฉพաaะ type หรือ mapped pattern
        if (patternKey && erpCorePattern.patterns?.[patternKey]) {
          console.log(`[CodeManager] 🎯 Using specific pattern "${patternKey}":`, erpCorePattern.patterns[patternKey])
          return {
            source: 'erp_core_specific',
            config: erpCorePattern,
            pattern: erpCorePattern.patterns[patternKey]
          }
        }
        
        // ถ้าต้องการ pattern เฉพาะ type (legacy)
        if (type && erpCorePattern.settings?.useTypeBasedCodes && erpCorePattern.patterns?.byType?.[type]) {
          console.log(`[CodeManager] 🏷️ Using type-specific pattern for ${type}:`, erpCorePattern.patterns.byType[type])
          return {
            source: 'erp_core_typed',
            config: erpCorePattern,
            pattern: erpCorePattern.patterns.byType[type]
          }
        }
        
        // ใช้ default pattern
        const defaultPatternName = erpCorePattern.settings?.defaultPattern || 'product'
        const defaultPattern = erpCorePattern.patterns?.[defaultPatternName]
        console.log(`[CodeManager] 📋 Using default pattern "${defaultPatternName}":`, defaultPattern)
        
        return {
          source: 'erp_core_default',
          config: erpCorePattern,
          pattern: defaultPattern || erpCorePattern.patterns?.product || erpCorePattern
        }
      } else {
        console.log(`[CodeManager] 💡 No ERP_CORE pattern for ${actualModule}, using loaded patterns`)
      }
    } catch (error) {
      console.log(`[CodeManager] 💡 ERP_CORE pattern access failed for ${module}, using fallback`)
    }
    
    // Priority 3: Loaded patterns from imports
    const loadedPattern = this.patterns.get(module)
    if (loadedPattern) {
      console.log(`[CodeManager] � Using loaded pattern for ${module}`)
      
      // ถ้าต้องการ pattern เฉพาะแบบ mapped
      if (patternKey && loadedPattern.patterns?.[patternKey]) {
        return {
          source: 'loaded_specific',
          config: loadedPattern,
          pattern: loadedPattern.patterns[patternKey]
        }
      }
      
      // ถ้าต้องการ pattern เฉพาะ type (legacy)
      if (type && loadedPattern.settings?.useTypeBasedCodes && loadedPattern.patterns?.byType?.[type]) {
        return {
          source: 'loaded_typed',
          config: loadedPattern,
          pattern: loadedPattern.patterns.byType[type]
        }
      }
      
      // ใช้ default pattern
      return {
        source: 'loaded_default',
        config: loadedPattern,
        pattern: loadedPattern.patterns?.default || loadedPattern
      }
    }
    
    // ⛔ No fallback - require module config
    console.error(`[CodeManager] ❌ No pattern found for ${module} (mapped to ${actualModule}) - module config required`)
    
    if (mapping) {
      throw new Error(`No code pattern configuration found for module '${module}' (requires ${actualModule.toUpperCase()}_CODE_CONFIG with pattern '${patternKey}'). Please check that the configuration is exported from ./masterdata/${actualModule}/data.js`)
    } else {
      throw new Error(`No code pattern configuration found for module '${module}'. Please check that ${module.toUpperCase()}_CODE_CONFIG is exported from ./masterdata/${module}/data.js`)
    }
  }

  /**
   * 🔧 ดึง hardcoded pattern สำหรับ module
   */
  getHardcodedPattern(module) {
    const hardcodedPatterns = {
      supplier: {
        prefix: 'SUP',
        year: true,
        sequence: { digits: 4, start: 1, resetOnYearChange: true },
        format: '{prefix}{year}{sequence}'
      },
      purchase: {
        prefix: 'PUR',
        year: true,
        sequence: { digits: 4, start: 1, resetOnYearChange: true },
        format: '{prefix}{year}{sequence}'
      },
      inventory: {
        prefix: 'INV',
        year: true,
        sequence: { digits: 4, start: 1, resetOnYearChange: true },
        format: '{prefix}{year}{sequence}'
      },
      sales: {
        prefix: 'SAL',
        year: true,
        sequence: { digits: 4, start: 1, resetOnYearChange: true },
        format: '{prefix}{year}{sequence}'
      },
      document: {
        prefix: 'DOC',
        year: true,
        sequence: { digits: 5, start: 1, resetOnYearChange: true },
        format: '{prefix}{year}{sequence}'
      }
    }
    
    return hardcodedPatterns[module] || {
      prefix: module.toUpperCase().substring(0, 3),
      year: true,
      sequence: { digits: 4, start: 1, resetOnYearChange: true },
      format: '{prefix}{year}{sequence}'
    }
  }

  /**
   * � ดึงข้อมูลล่าสุดสำหรับ module (Auto-fetch)
   */
  async fetchLatestRecords(module, options = {}) {
    try {
      console.log(`[CodeManager] 📊 Fetching latest records for ${module}`)
      
      // ตรวจสอบ cache ก่อน
      const cacheKey = `${module}_latest_records`
      const cached = this.cache.get(cacheKey)
      const cacheMaxAge = options.cacheMaxAge || 60000 // 1 นาที default
      
      if (cached && (Date.now() - cached.timestamp) < cacheMaxAge) {
        console.log(`[CodeManager] 📋 Using cached records for ${module} (${cached.records.length} records)`)
        return cached.records
      }
      
      // ดึงข้อมูลใหม่จาก ERP_CORE
      let records = []
      
      if (window.ERP_CORE?.engine) {
        const result = await window.ERP_CORE.engine.list(module, {
          limit: options.limit || 2000, // เพิ่ม limit
          sortBy: options.sortBy || 'created_at',
          sortOrder: 'desc',
          fields: options.fields || ['id', `${module}_code`, 'product_code', 'supplier_code', 'code', 'created_at', 'updated_at']
        })
        
        if (result.success) {
          records = result.data || []
          console.log(`[CodeManager] ✅ Fetched ${records.length} records for ${module}`)
        } else {
          console.warn(`[CodeManager] ⚠️ Failed to fetch records for ${module}:`, result.message)
        }
      } else {
        console.warn(`[CodeManager] ⚠️ ERP_CORE.engine not available`)
      }
      
      // Cache ผลลัพธ์
      this.cache.set(cacheKey, {
        records,
        timestamp: Date.now(),
        count: records.length
      })
      
      return records
      
    } catch (error) {
      console.error(`[CodeManager] ❌ Error fetching latest records for ${module}:`, error)
      return [] // fallback เป็น array ว่าง
    }
  }

  /**
   * �🔢 สร้างรหัสใหม่สำหรับ module (Enhanced with auto-fetch and atomic lock)
   */
  async generateCode(module, existingRecords = null, options = {}) {
    // 🔒 Acquire lock for atomic sequence generation
    let lockAcquired = false
    
    try {
      if (!this.initialized) {
        await this.initialize()
      }

      console.log(`[CodeManager] 🔢 Generating code for ${module}`, options)
      
      // 🔒 Acquire sequence lock (prevents race conditions)
      this.acquireSequenceLock(module)
      lockAcquired = true
      
      // ถ้าไม่ได้ส่ง existingRecords มา ให้ดึงข้อมูลล่าสุดเอง
      let records = existingRecords
      if (!records || (Array.isArray(records) && records.length === 0)) {
        console.log(`[CodeManager] 📊 Auto-fetching latest records for ${module}`)
        records = await this.fetchLatestRecords(module, {
          cacheMaxAge: options.cacheMaxAge || 30000, // 30 วินาที สำหรับการสร้างรหัส
          limit: options.recordLimit || 500,
          fields: [`${module}_code`, 'code', 'id', 'created_date']
        })
      }
      
      // ดึง pattern ที่เหมาะสม
      const patternInfo = await this.getPatternForModule(module, options.type)
      
      if (!patternInfo || !patternInfo.pattern) {
        throw new Error(`No valid pattern found for module '${module}'`)
      }
      
      console.log(`[CodeManager] 📋 Using pattern from ${patternInfo.source}:`, {
        pattern: patternInfo.pattern,
        recordsType: typeof records,
        recordsIsArray: Array.isArray(records),
        recordsLength: Array.isArray(records) ? records.length : 'N/A'
      })
      
      // ตรวจสอบว่า records เป็น array
      if (!Array.isArray(records)) {
        console.warn(`[CodeManager] ⚠️ Converting records to array. Was: ${typeof records}`, records)
        records = []
      }
      
      // สร้างรหัสตาม pattern
      const code = await this.buildCodeFromPattern(patternInfo.pattern, records, { ...options, module })
      
      // 🔄 อัปเดต sequence ใน database (ถ้าเป็น pattern จาก database)
      if (patternInfo.source === 'corporate_config' && patternInfo.pattern.sequence) {
        await this.updateSequenceInDatabase(module, patternInfo, options.type)
      }
      
      // Cache ผลลัพธ์
      const cacheKey = `${module}_last_generated`
      this.cache.set(cacheKey, {
        code,
        timestamp: Date.now(),
        pattern: patternInfo.pattern,
        source: patternInfo.source,
        recordCount: records.length
      })
      
      // ล้าง records cache เพื่อให้ดึงข้อมูลใหม่ครั้งถัดไป
      this.invalidateRecordsCache(module, 'code_generated')
      
      console.log(`[CodeManager] ✅ Generated code for ${module}: ${code} (from ${patternInfo.source}, ${records.length} records checked)`)
      return code
      
    } catch (error) {
      console.error(`[CodeManager] ❌ Error generating code for ${module}:`, error)
      throw error
    } finally {
      // 🔓 Always release lock
      if (lockAcquired) {
        this.releaseSequenceLock(module)
      }
    }
  }

  /**
   * 🏗️ สร้างรหัสจาก pattern
   */
  async buildCodeFromPattern(pattern, existingRecords = [], options = {}) {
    try {
      console.log('[CodeManager] 🏗️ Building code from pattern:', JSON.stringify(pattern, null, 2))
      console.log('[CodeManager] 🏗️ Input details:', {
        patternKeys: Object.keys(pattern),
        hasPrefix: !!pattern.prefix,
        hasFormat: !!pattern.format,
        prefixValue: pattern.prefix,
        formatValue: pattern.format
      })
      
      let code = pattern.format || '{prefix}{year}{sequence}'
      console.log('[CodeManager] 🏗️ Initial format:', code)
      
      // แทนที่ prefix
      if (pattern.prefix) {
        const oldCode = code
        code = code.replace('{prefix}', pattern.prefix)
        console.log('[CodeManager] 🏗️ After prefix replacement:', { from: oldCode, to: code, prefix: pattern.prefix })
      } else {
        console.warn('[CodeManager] ⚠️ No prefix found in pattern!')
      }
      
      // แทนที่ year
      if (pattern.year || code.includes('{year}')) {
        const currentYear = new Date().getFullYear()
        const oldCode = code
        code = code.replace('{year}', currentYear.toString())
        console.log('[CodeManager] 🏗️ After year replacement:', { from: oldCode, to: code, year: currentYear })
      }
      
      // แทนที่ sequence
      if (code.includes('{sequence}')) {
        const sequence = await this.getNextSequence(pattern, existingRecords, { ...options, module: options.module })
        const paddedSequence = sequence.toString().padStart(pattern.sequence?.digits || 4, '0')
        const oldCode = code
        code = code.replace('{sequence}', paddedSequence)
        console.log('[CodeManager] 🏗️ After sequence replacement:', { 
          from: oldCode, 
          to: code, 
          sequence, 
          paddedSequence,
          digits: pattern.sequence?.digits || 4
        })
      }
      
      // แทนที่ month (ถ้ามี)
      if (code.includes('{month}')) {
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
        code = code.replace('{month}', currentMonth)
      }
      
      console.log('[CodeManager] 🏗️ Final generated code:', code)
      return code
      
    } catch (error) {
      console.error('[CodeManager] ❌ Error building code from pattern:', error)
      console.error('[CodeManager] ❌ Pattern was:', pattern)
      throw error
    }
  }

  /**
   * 🔢 ดึงเลขลำดับถัดไป (Optimized with database sequence storage)
   * ใช้ sequence ที่เก็บใน database แทนการนับจาก records
   */
  async getNextSequence(pattern, existingRecords = [], options = {}) {
    try {
      const sequenceConfig = pattern.sequence || { digits: 4, start: 1, resetOnYearChange: true }
      const module = options.module || 'unknown'
      
      console.log(`[CodeManager] 🔢 Getting next sequence for ${module}:`, {
        patternPrefix: pattern.prefix,
        sequenceConfig,
        hasNext: typeof sequenceConfig.next === 'number',
        hasCurrent: typeof sequenceConfig.current === 'number',
        nextValue: sequenceConfig.next,
        currentValue: sequenceConfig.current,
        source: pattern.updatedAt ? 'database' : 'default'
      })
      
      // 🏆 Priority 1: ใช้ next จาก database ถ้ามี (ชัดเจนที่สุด)
      if (typeof sequenceConfig.next === 'number' && sequenceConfig.next > 0) {
        console.log(`[CodeManager] 💾 Using NEXT sequence from database:`, {
          next: sequenceConfig.next,
          current: sequenceConfig.current,
          source: 'corporate_config (next field)'
        })
        
        return sequenceConfig.next
      }
      
      // 🏆 Priority 2: ใช้ current + 1 จาก database ถ้ามี
      if (typeof sequenceConfig.current === 'number' && sequenceConfig.current >= 0) {
        const nextSequence = sequenceConfig.current + 1
        
        console.log(`[CodeManager] 💾 Using sequence from database (current + 1):`, {
          current: sequenceConfig.current,
          next: nextSequence,
          source: 'corporate_config (calculated)'
        })
        
        return nextSequence
      }
      
      // 🔄 Priority 2: Fallback - คำนวณจาก existing records (backward compatibility)
      console.log(`[CodeManager] 📊 No database sequence found, calculating from records...`)
      
      // ใช้ options สำหรับการกำหนดค่าเพิ่มเติม
      const customStart = options.startFrom || sequenceConfig.start || 1
      const forceReset = options.forceReset || false
      
      // 🚀 Optimized: กรองเลขที่มีอยู่แล้วจาก records ด้วย Set
      const currentYear = new Date().getFullYear().toString()
      let maxSequenceFromRecords = 0
      
      if (existingRecords.length > 0) {
        const prefix = pattern.prefix || ''
        const year = currentYear
        
        // สร้าง regex pattern สำหรับ matching ที่แม่นยำขึ้น
        let regexPattern = (pattern.format || '{prefix}{year}{sequence}')
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape special chars
          .replace('\\{prefix\\}', prefix)
          .replace('\\{year\\}', year)
          .replace('\\{sequence\\}', '(\\d+)')
        
        const regex = new RegExp(`^${regexPattern}$`)
        
        console.log(`[CodeManager] 🔍 Using regex pattern: ${regexPattern}`)
        
        // ตรวจสอบว่า existingRecords เป็น array
        if (!Array.isArray(existingRecords)) {
          console.warn('[CodeManager] ⚠️ existingRecords is not array:', typeof existingRecords, existingRecords)
          existingRecords = []
        }
        
        // 🚀 Use Set for O(1) lookup and deduplication
        const existingSequences = new Set()
        const primaryFields = [`${module}_code`, 'code', 'id'] // Priority fields
        
        for (const record of existingRecords) {
          if (!record) continue
          
          // 🎯 Check primary fields first (fast path)
          let matched = false
          for (const field of primaryFields) {
            const code = record[field]
            if (code) {
              const match = String(code).match(regex)
              if (match) {
                existingSequences.add(parseInt(match[1]))
                matched = true
                break // Found match, skip to next record
              }
            }
          }
          
          // 🔍 Fallback: scan all fields (only if primary fields didn't match)
          if (!matched) {
            for (const key of Object.keys(record)) {
              const val = record[key]
              if (val !== null && val !== undefined && (typeof val === 'string' || typeof val === 'number')) {
                const match = String(val).match(regex)
                if (match) {
                  existingSequences.add(parseInt(match[1]))
                  break // Found match, skip to next field
                }
              }
            }
          }
        }
        
        // 🚀 Find max sequence in O(n) instead of O(n²)
        if (existingSequences.size > 0) {
          maxSequenceFromRecords = Math.max(...existingSequences)
        }
        
        console.log(`[CodeManager] 📊 Sequence analysis:`, {
          totalRecords: existingRecords.length,
          uniqueSequences: existingSequences.size,
          maxFromRecords: maxSequenceFromRecords,
          sampleSequences: Array.from(existingSequences).slice(0, 5)
        })
      }
      
      // หาเลขถัดไป (คำนวณจาก records ที่ดึงมาจาก API เท่านั้น)
      let nextSequence
      
      if (forceReset) {
        nextSequence = customStart
      } else {
        // ใช้ max sequence จาก existing records + 1
        nextSequence = maxSequenceFromRecords + 1
        
        // ตรวจสอบว่าไม่ต่ำกว่า start
        if (nextSequence < customStart) {
          nextSequence = customStart
        }
      }
      
      console.log(`[CodeManager] 🔢 Final sequence decision:`, {
        maxFromRecords: maxSequenceFromRecords,
        nextSequence,
        source: 'calculated_from_api_records'
      })
      
      return nextSequence
      
    } catch (error) {
      console.error('[CodeManager] ❌ Error getting next sequence:', error)
      return 1 // fallback
    }
  }

  /**
   */
  getPattern(module) {
    if (!this.initialized) {
      console.warn('[CodeManager] ⚠️ Not initialized, using default pattern')
      return DEFAULT_CODE_PATTERNS[module] || null
    }
    
    return this.patterns.get(module) || null
  }

  /**
   * 📋 ดึงรายการ patterns ทั้งหมด
   */
  getAllPatterns() {
    return Array.from(this.patterns.values())
  }

  /**
   * 💾 บันทึก pattern ใหม่
   */
  async savePattern(patternData) {
    try {
      const result = await saveCodePattern(patternData)
      
      if (result.success) {
        this.patterns.set(patternData.module, result.data)
        console.log(`[CodeManager] ✅ Saved pattern for ${patternData.module}`)
        
        // Clear cache สำหรับ module นี้
        this.clearModuleCache(patternData.module)
      }
      
      return result
      
    } catch (error) {
      console.error(`[CodeManager] ❌ Error saving pattern:`, error)
      throw error
    }
  }

  /**
   * 🔧 อัปเดต pattern
   */
  async updatePattern(module, updates) {
    try {
      const pattern = this.patterns.get(module)
      if (!pattern || !pattern.id) {
        throw new Error(`Pattern not found for module: ${module}`)
      }
      
      const result = await updateCodePattern(pattern.id, updates)
      
      if (result.success) {
        this.patterns.set(module, result.data)
        console.log(`[CodeManager] ✅ Updated pattern for ${module}`)
        
        // Clear cache สำหรับ module นี้
        this.clearModuleCache(module)
      }
      
      return result
      
    } catch (error) {
      console.error(`[CodeManager] ❌ Error updating pattern for ${module}:`, error)
      throw error
    }
  }

  /**
   * ✅ ตรวจสอบความถูกต้องของรหัส
   */
  validateCode(code, module) {
    const validation = validateCode(code)
    
    // เพิ่มการตรวจสอบ pattern specific หากต้องการ
    if (validation.isValid && module) {
      const pattern = this.getPattern(module)
      if (pattern && pattern.validationPattern) {
        const regex = new RegExp(pattern.validationPattern)
        if (!regex.test(code)) {
          return {
            isValid: false,
            error: `รหัสไม่ตรงตาม pattern ของ ${module}`
          }
        }
      }
    }
    
    return validation
  }

  /**
   * 🎨 สร้างตัวอย่างรหัส
   */
  generateExample(module) {
    const pattern = this.getPattern(module)
    if (!pattern) {
      return null
    }
    
    return generateCodeExample(pattern)
  }

  /**
   * 🔄 รีเซ็ตเลขลำดับ
   */
  async resetSequence(module) {
    try {
      const result = await resetSequence(module)
      
      if (result.success) {
        // อัปเดต pattern ใน memory
        const pattern = result.data
        this.patterns.set(module, pattern)
        
        // Clear cache
        this.clearModuleCache(module)
        
        console.log(`[CodeManager] ✅ Reset sequence for ${module}`)
      }
      
      return result
      
    } catch (error) {
      console.error(`[CodeManager] ❌ Error resetting sequence for ${module}:`, error)
      throw error
    }
  }

  /**
   * 🔄 อัปเดต sequence ใน database หลังสร้างรหัสเสร็จ
   */
  async updateSequenceInDatabase(module, patternInfo, type = null) {
    try {
      console.log(`[CodeManager] 🔄 Updating sequence in database for ${module}${type ? ` (${type})` : ''}`)
      
      const accountingSettings = window.ERP_CORE?.accounting
      if (!accountingSettings) {
        console.warn('[CodeManager] ⚠️ AccountingSettings not available, skipping sequence update')
        return
      }
      
      // ตรวจสอบว่า initialized แล้วหรือยัง
      if (!accountingSettings.initialized || !accountingSettings.apiRequest) {
        console.log('[CodeManager] 🔧 Initializing AccountingSettings...')
        
        // ลองหา $Request service
        if (window.vueApp && window.vueApp.$Request) {
          accountingSettings.initialize(window.vueApp)
          console.log('[CodeManager] ✅ AccountingSettings initialized with window.vueApp')
        } else if (this.engine?.apiDriver) {
          const vueContext = {
            $Request: this.engine.apiDriver,
            $Key: null
          }
          accountingSettings.initialize(vueContext)
          console.log('[CodeManager] ✅ AccountingSettings initialized with engine.apiDriver')
        } else {
          console.warn('[CodeManager] ⚠️ No $Request service available for AccountingSettings')
          return
        }
      }
      
      // สร้าง config key
      const configKey = type 
        ? `number_series.${module}.${type}`
        : `number_series.${module}`
      
      console.log(`[CodeManager] 📝 Config key: ${configKey}`)
      
      // ดึง config ปัจจุบัน
      const currentConfig = await accountingSettings.getConfig(configKey)
      
      // รับ sequence ที่เพิ่งใช้ไปจาก patternInfo
      const usedSequence = patternInfo.pattern.sequence?.current || 0
      const nextSequence = usedSequence + 1
      
      console.log(`[CodeManager] 🔢 Sequence update:`, {
        configKey,
        usedSequence,      // sequence ที่เพิ่งใช้ไป
        nextSequence,      // sequence ถัดไปที่จะใช้
        hasCurrentConfig: !!currentConfig
      })
      
      // สร้าง config object
      let configToSave
      
      if (currentConfig) {
        // อัปเดต config ที่มีอยู่
        configToSave = {
          ...currentConfig,
          sequence: {
            ...currentConfig.sequence,
            current: usedSequence,    // บันทึก sequence ที่เพิ่งใช้ไป
            next: nextSequence,       // บันทึก sequence ถัดไปที่จะใช้
            lastUpdated: new Date().toISOString()
          },
          lastUsed: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      } else {
        // สร้าง config ใหม่จาก pattern
        configToSave = {
          prefix: patternInfo.pattern.prefix || module.toUpperCase(),
          format: patternInfo.pattern.format || '{prefix}{year}{sequence}',
          sequence: {
            digits: patternInfo.pattern.sequence?.digits || 5,
            start: patternInfo.pattern.sequence?.start || 1,
            current: usedSequence,    // บันทึก sequence ที่เพิ่งใช้ไป
            next: nextSequence,       // บันทึก sequence ถัดไปที่จะใช้
            resetOnYearChange: patternInfo.pattern.sequence?.resetOnYearChange || false,
            lastUpdated: new Date().toISOString()
          },
          resetPeriod: patternInfo.pattern.resetPeriod || 'yearly',
          lastUsed: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
      
      // บันทึกลง database
      await accountingSettings.saveConfig(configKey, configToSave, {
        name: `Number Series: ${module}${type ? ` - ${type}` : ''}`,
        description: `Auto sequence counter (used: ${usedSequence}, next: ${nextSequence})`
      })
      
      console.log(`[CodeManager] ✅ Sequence updated in database: ${configKey} → used=${usedSequence}, next=${nextSequence}`)
      
      // Invalidate cache
      this.invalidateRecordsCache(module, 'sequence_updated')
      
      return {
        success: true,
        sequence: nextSequence,  // ส่ง next sequence กลับไป
        current: usedSequence,   // ส่ง used sequence กลับไป
        next: nextSequence,      // ส่ง next sequence กลับไป
        configKey
      }
      
    } catch (error) {
      console.error('[CodeManager] ❌ Error updating sequence in database:', error)
      // ไม่ throw error เพื่อไม่ให้กระทบการสร้างรหัส
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * � Invalidate cache เมื่อมีการเพิ่ม/แก้ไขข้อมูล
   */
  invalidateRecordsCache(module, reason = 'data_changed') {
    const cacheKey = `${module}_latest_records`
    const hadCache = this.cache.has(cacheKey)
    
    if (hadCache) {
      this.cache.delete(cacheKey)
      console.log(`[CodeManager] 🔄 Invalidated records cache for ${module} (reason: ${reason})`)
    }
    
    return hadCache
  }

  /**
   * 📈 ดึงสถิติการใช้งาน cache
   */
  getCacheStats(module = null) {
    if (module) {
      const moduleKeys = Array.from(this.cache.keys()).filter(key => key.startsWith(module))
      const stats = {}
      
      moduleKeys.forEach(key => {
        const entry = this.cache.get(key)
        stats[key] = {
          timestamp: entry.timestamp,
          age: Date.now() - entry.timestamp,
          size: entry.records?.length || entry.recordCount || 'unknown'
        }
      })
      
      return stats
    }
    
    return {
      totalEntries: this.cache.size,
      modules: Array.from(new Set(
        Array.from(this.cache.keys()).map(key => key.split('_')[0])
      ))
    }
  }

  /**
   * �🗑️ ล้าง cache สำหรับ module
   */
  clearModuleCache(module) {
    const keys = Array.from(this.cache.keys()).filter(key => key.startsWith(module))
    keys.forEach(key => this.cache.delete(key))
    console.log(`[CodeManager] 🗑️ Cleared ${keys.length} cache entries for ${module}`)
  }

  /**
   * 🗑️ ล้าง cache ทั้งหมด
   */
  clearAllCache() {
    const size = this.cache.size
    this.cache.clear()
    console.log(`[CodeManager] 🗑️ Cleared all ${size} cache entries`)
  }

  /**
   * 📊 ดึงสถิติการใช้งาน
   */
  getStatistics() {
    return {
      totalPatterns: this.patterns.size,
      activePatterns: Array.from(this.patterns.values()).filter(p => p.isActive).length,
      cacheSize: this.cache.size,
      initialized: this.initialized,
      availableModules: Array.from(this.patterns.keys()),
      activeLocks: this.sequenceLocks.size,
      lockInfo: this.getActiveLocks(),
      lastGenerated: Array.from(this.cache.entries()).map(([key, value]) => ({
        module: key.replace('_last_generated', ''),
        code: value.code,
        timestamp: new Date(value.timestamp).toISOString(),
        pattern: value.pattern
      }))
    }
  }

  /**
   * 🔒 Get active locks information
   * @returns {array} Active locks with details
   */
  getActiveLocks() {
    const locks = []
    
    for (const [lockKey, lockInfo] of this.sequenceLocks.entries()) {
      locks.push({
        lockKey,
        module: lockKey.replace('sequence_', ''),
        age: Date.now() - lockInfo.startTime,
        startTime: new Date(lockInfo.startTime).toISOString(),
        timeout: this.SEQUENCE_LOCK_TIMEOUT,
        remainingTime: this.SEQUENCE_LOCK_TIMEOUT - (Date.now() - lockInfo.startTime)
      })
    }
    
    return locks.sort((a, b) => b.age - a.age) // Sort by age (oldest first)
  }

  /**
   * ⚡ Get performance metrics
   * @returns {object} Performance metrics
   */
  getPerformanceMetrics() {
    const cacheStats = {}
    let totalCacheSize = 0
    
    for (const [key, value] of this.cache.entries()) {
      const module = key.split('_')[0]
      if (!cacheStats[module]) {
        cacheStats[module] = { entries: 0, totalSize: 0 }
      }
      cacheStats[module].entries++
      
      const size = JSON.stringify(value).length
      cacheStats[module].totalSize += size
      totalCacheSize += size
    }
    
    return {
      cacheEntries: this.cache.size,
      totalCacheSize,
      cacheByModule: cacheStats,
      activeLocks: this.sequenceLocks.size,
      patterns: this.patterns.size
    }
  }

  /**
   * 🔧 รีโหลด patterns จาก storage
   */
  async reload() {
    console.log('[CodeManager] 🔄 Reloading patterns...')
    
    this.patterns.clear()
    this.cache.clear()
    
    await this.loadAllPatterns()
    await this.ensureDefaultPatterns()
    
    console.log('[CodeManager] ✅ Patterns reloaded successfully')
  }

  /**
   * 🔧 แก้ไข format ที่ผิดใน database (Migration helper)
   */
  async fixDatabaseFormat(module, correctFormat = '{prefix}{year}{sequence}') {
    try {
      console.log(`[CodeManager] 🔧 Fixing database format for ${module}...`)
      
      const accountingSettings = window.ERP_CORE?.accounting
      if (!accountingSettings) {
        console.warn('[CodeManager] ⚠️ AccountingSettings not available')
        return { success: false, error: 'AccountingSettings not available' }
      }
      
      // Initialize if needed
      if (!accountingSettings.initialized || !accountingSettings.apiRequest) {
        if (window.vueApp && window.vueApp.$Request) {
          accountingSettings.initialize(window.vueApp)
        } else if (this.engine?.apiDriver) {
          accountingSettings.initialize({ $Request: this.engine.apiDriver, $Key: null })
        } else {
          return { success: false, error: 'No $Request service available' }
        }
      }
      
      const configKey = `number_series.${module}`
      console.log(`[CodeManager] 📝 Checking config: ${configKey}`)
      
      // Load settings first
      await accountingSettings.loadSettings()
      
      // Get current config
      const currentConfig = await accountingSettings.getConfig(configKey)
      
      if (!currentConfig) {
        console.log(`[CodeManager] ⚠️ No config found for ${configKey}`)
        return { success: false, error: 'Config not found' }
      }
      
      console.log(`[CodeManager] 📋 Current config:`, {
        prefix: currentConfig.prefix,
        format: currentConfig.format,
        sequenceCurrent: currentConfig.sequence?.current,
        sequenceNext: currentConfig.sequence?.next
      })
      
      // Update format
      const updatedConfig = {
        ...currentConfig,
        format: correctFormat,
        sequence: {
          ...currentConfig.sequence,
          next: (currentConfig.sequence?.next || currentConfig.sequence?.current || 0) + 1
        },
        updatedAt: new Date().toISOString()
      }
      
      // Save to database
      await accountingSettings.saveConfig(configKey, updatedConfig, {
        name: `Number Series: ${module}`,
        description: `Fixed format to ${correctFormat} (current: ${updatedConfig.sequence.current}, next: ${updatedConfig.sequence.next})`
      })
      
      console.log(`[CodeManager] ✅ Format fixed for ${configKey}:`, {
        oldFormat: currentConfig.format,
        newFormat: correctFormat,
        current: updatedConfig.sequence.current,
        next: updatedConfig.sequence.next
      })
      
      // Invalidate cache
      this.invalidateRecordsCache(module, 'format_fixed')
      
      return {
        success: true,
        oldFormat: currentConfig.format,
        newFormat: correctFormat,
        sequence: updatedConfig.sequence
      }
      
    } catch (error) {
      console.error('[CodeManager] ❌ Error fixing database format:', error)
      return { success: false, error: error.message }
    }
  }
}

// ไม่ export singleton - ให้แต่ละ ERP_CORE instance สร้างเอง
// export const codeManager = new CodeManager() // ❌ ลบออก

// Export class for testing or multiple instances
export default CodeManager
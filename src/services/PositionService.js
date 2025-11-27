/**
 * Position Service
 * บริการสำหรับจัดการข้อมูลตำแหน่งงาน (Master Data)
 * ไม่รวม permissions (จะจัดการใน DepartmentPositions แทน)
 */

class PositionService {
  constructor() {
    this.apiRequest = null
    this.clientKey = null
    this.initialized = false
    this.cache = {
      positions: [],
      lastUpdated: null
    }
  }

  /**
   * Initialize with Vue app instance
   */
  initialize(vueAppOrInstance) {
    this.clientKey = window.ERP_CORE?.clientKey || null
    
    if (vueAppOrInstance?.$Request && typeof vueAppOrInstance.$Request === 'object') {
      this.apiRequest = vueAppOrInstance.$Request
      if (!this.clientKey) {
        this.clientKey = vueAppOrInstance.$Key || null
      }
      this.initialized = true
      console.log('🔑 [PositionService] Initialized from component instance')
    } else if (vueAppOrInstance?.appContext?.config?.globalProperties?.$Request) {
      this.apiRequest = vueAppOrInstance.appContext.config.globalProperties.$Request
      if (!this.clientKey) {
        this.clientKey = vueAppOrInstance.appContext.config.globalProperties.$Key || null
      }
      this.initialized = true
      console.log('🔑 [PositionService] Initialized from appContext')
    } else if (typeof window !== 'undefined' && window.vueApp?.$Request) {
      this.apiRequest = window.vueApp.$Request
      if (!this.clientKey) {
        this.clientKey = window.vueApp.$Key || null
      }
      this.initialized = true
      console.log('🔑 [PositionService] Initialized from window.vueApp')
    }
    
    console.log('🔑 [PositionService] Client Key:', {
      hasKey: !!this.clientKey,
      keyPreview: this.clientKey ? '***' + this.clientKey.slice(-4) : 'null',
      initialized: this.initialized
    })
  }

  /**
   * Refresh clientKey จาก ERP_CORE
   */
  refreshClientKey() {
    if (window.ERP_CORE?.clientKey) {
      this.clientKey = window.ERP_CORE.clientKey
    }
  }

  /**
   * สร้างรหัสตำแหน่งอัตโนมัติ
   */
  generatePositionCode() {
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
    return `POS${random}`
  }

  /**
   * ดึงข้อมูลตำแหน่งทั้งหมด
   */
  async getPositions(filters = {}) {
    if (!this.apiRequest) {
      console.warn('⚠️ PositionService not initialized')
      return []
    }

    this.refreshClientKey()

    try {
      const pipeline = [
        { 
          $match: { 
            status: { $ne: 'deleted' }
          } 
        }
      ]

      if (filters.status) {
        pipeline[0].$match.status = filters.status
      }

      if (filters.search) {
        const searchRegex = { $regex: filters.search, $options: 'i' }
        pipeline[0].$match.$or = [
          { code: searchRegex },
          { name: searchRegex }
        ]
      }

      if (filters.level) {
        pipeline[0].$match.level = filters.level
      }

      pipeline.push({ $sort: { created_at: -1 } })

      const response = await this.apiRequest.POST('positions/aggregate', {
        pipeline: pipeline
      }, this.clientKey)

      if (response && response.data) {
        const positions = response.data.map(pos => ({
          ...pos,
          id: pos._id || pos.id
        }))
        
        this.cache.positions = positions
        this.cache.lastUpdated = new Date()
        return positions
      }
      return []
    } catch (error) {
      console.error('❌ Failed to get positions:', error)
      return []
    }
  }

  /**
   * ดึงข้อมูลตำแหน่งตาม ID
   */
  async getPositionById(positionId) {
    if (!this.apiRequest) {
      console.warn('⚠️ PositionService not initialized')
      return null
    }

    this.refreshClientKey()

    try {
      const response = await this.apiRequest.POST('positions/aggregate', {
        pipeline: [
          { $match: { _id: positionId } },
          { $limit: 1 }
        ]
      }, this.clientKey)

      if (response && response.data && response.data.length > 0) {
        return {
          ...response.data[0],
          id: response.data[0]._id || response.data[0].id
        }
      }
      return null
    } catch (error) {
      console.error('❌ Failed to get position by ID:', error)
      return null
    }
  }

  /**
   * สร้างตำแหน่งใหม่
   */
  async createPosition(positionData) {
    if (!this.apiRequest) {
      throw new Error('PositionService not initialized')
    }

    this.refreshClientKey()

    try {
      const dataToSave = {
        code: positionData.code,
        name: positionData.name,
        level: positionData.level,
        description: positionData.description || '',
        status: positionData.status || 'active',
        created_at: new Date().toISOString(),
        created_by: 'system'
      }

      console.log('📤 [PositionService] Creating position:', dataToSave)

      const response = await this.apiRequest.POST('positions', {
        data: dataToSave
      }, this.clientKey)

      if (response && response.data) {
        console.log('✅ [PositionService] Position created:', response.data)
        this.cache.positions = [] // Clear cache
        return {
          success: true,
          data: response.data,
          message: 'สร้างตำแหน่งเรียบร้อยแล้ว'
        }
      }

      throw new Error('Invalid response from server')
    } catch (error) {
      console.error('❌ [PositionService] Create position error:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการสร้างตำแหน่ง'
      }
    }
  }

  /**
   * อัปเดตตำแหน่ง
   */
  async updatePosition(positionId, positionData) {
    if (!this.apiRequest) {
      throw new Error('PositionService not initialized')
    }

    this.refreshClientKey()

    try {
      const dataToUpdate = {
        name: positionData.name,
        level: positionData.level,
        description: positionData.description || '',
        status: positionData.status,
        updated_at: new Date().toISOString()
      }

      console.log('📤 [PositionService] Updating position:', positionId, dataToUpdate)

      const response = await this.apiRequest.PUT(`positions/${positionId}`, {
        data: dataToUpdate
      }, this.clientKey)

      console.log('✅ [PositionService] Position updated:', response)
      this.cache.positions = [] // Clear cache

      return {
        success: true,
        data: response?.data || response,
        message: 'อัปเดตตำแหน่งเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ [PositionService] Update position error:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการอัปเดตตำแหน่ง'
      }
    }
  }

  /**
   * ลบตำแหน่ง (soft delete)
   */
  async deletePosition(positionId) {
    if (!this.apiRequest) {
      throw new Error('PositionService not initialized')
    }

    this.refreshClientKey()

    try {
      await this.apiRequest.PUT(`positions/${positionId}`, {
        data: {
          status: 'deleted',
          deleted_at: new Date().toISOString()
        }
      }, this.clientKey)

      this.cache.positions = [] // Clear cache

      return {
        success: true,
        message: 'ลบตำแหน่งเรียบร้อยแล้ว'
      }
    } catch (error) {
      console.error('❌ [PositionService] Delete position error:', error)
      return {
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาดในการลบตำแหน่ง'
      }
    }
  }
}

// Export singleton instance
const positionService = new PositionService()
export default positionService

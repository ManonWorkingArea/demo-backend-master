// Real API Service สำหรับ Product Lot Summary
export class ProductLotSummaryService {
  constructor() {
    this.apiRequest = null
  }

  initialize(apiRequest) {
    this.apiRequest = apiRequest
  }

  /**
   * ดึงข้อมูลสินค้าและ lot summary
   */
  async getProductWithLots(productId) {
    try {
      if (!this.apiRequest) {
        throw new Error('API Request not initialized - Real API required')
      }

      console.log(`🔍 Fetching product lots for ID: ${productId}`)

      // Call API endpoint
      const response = await this.apiRequest({
        method: 'GET',
        endpoint: `/inventory/products/${productId}/lot-summary`,
        params: {
          include_lots: true,
          include_usage_history: true,
          include_statistics: true
        }
      })

      if (response.success) {
        console.log('✅ Product lot summary loaded:', response.data)
        return {
          success: true,
          data: this.processLotData(response.data)
        }
      } else {
        throw new Error(response.message || 'Failed to load product lot summary')
      }

    } catch (error) {
      console.error('❌ Error loading product lot summary:', error)
      
      // Don't return mock data - return error instead
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * ประมวลผลและจัดระเบียบข้อมูล lot
   */
  processLotData(rawData) {
    const { product, lots = [], summary = {} } = rawData

    // คำนวณสถิติ
    const processedLots = lots.map(lot => ({
      ...lot,
      usage_percentage: this.calculateUsagePercentage(lot),
      status_class: this.getLotStatusClass(lot),
      roll_type: this.determineRollType(lot)
    }))

    const statistics = {
      total_lots: processedLots.length,
      active_lots: processedLots.filter(lot => 
        lot.lot_status === 'active' || lot.lot_status === 'partial'
      ).length,
      total_meters: processedLots
        .filter(lot => lot.lot_status === 'active' || lot.lot_status === 'partial')
        .reduce((sum, lot) => sum + (lot.current_meters || 0), 0),
      total_weight: processedLots
        .filter(lot => lot.lot_status === 'active' || lot.lot_status === 'partial')  
        .reduce((sum, lot) => sum + (lot.current_weight_kg || 0), 0),
      total_value: 0, // จะคำนวณจาก total_meters * price_per_meter
      full_rolls: {
        count: processedLots.filter(lot => lot.roll_type === 'full').length,
        meters: processedLots
          .filter(lot => lot.roll_type === 'full')
          .reduce((sum, lot) => sum + (lot.current_meters || 0), 0)
      },
      partial_rolls: {
        count: processedLots.filter(lot => lot.roll_type === 'partial').length,
        meters: processedLots
          .filter(lot => lot.roll_type === 'partial')
          .reduce((sum, lot) => sum + (lot.current_meters || 0), 0)
      },
      consumed_rolls: {
        count: processedLots.filter(lot => lot.roll_type === 'consumed').length,
        meters: processedLots
          .filter(lot => lot.roll_type === 'consumed')
          .reduce((sum, lot) => sum + ((lot.calculated_meters || 0) - (lot.current_meters || 0)), 0)
      }
    }

    // คำนวณมูลค่า
    statistics.total_value = statistics.total_meters * (product.price_per_meter || 450)

    return {
      product: {
        ...product,
        // Ensure proper formatting
        product_code: product.product_code || this.generateProductCode(product),
        sku: product.sku || this.generateSKU(product)
      },
      lots: processedLots,
      statistics,
      summary: {
        ...statistics,
        ...summary
      }
    }
  }

  /**
   * คำนวณเปอร์เซ็นต์การใช้งาน
   */
  calculateUsagePercentage(lot) {
    if (!lot.calculated_meters || lot.calculated_meters === 0) return 0
    
    const used = (lot.calculated_meters || 0) - (lot.current_meters || 0)
    return Math.round((used / lot.calculated_meters) * 100)
  }

  /**
   * กำหนดประเภทของม้วน
   */
  determineRollType(lot) {
    if (lot.lot_status === 'consumed' || lot.current_meters === 0) {
      return 'consumed'
    } else if (lot.current_meters === lot.calculated_meters) {
      return 'full'
    } else {
      return 'partial'
    }
  }

  /**
   * กำหนด CSS class สำหรับสถานะ lot
   */
  getLotStatusClass(lot) {
    const rollType = this.determineRollType(lot)
    
    switch (rollType) {
      case 'full':
        return 'bg-green-500'
      case 'partial':
        return 'bg-yellow-500'
      case 'consumed':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  /**
   * สร้าง Product Code หากไม่มี
   */
  generateProductCode(product) {
    if (product.model_code && product.color_code && product.fabric_width_cm) {
      const model = String(product.model_code).padStart(3, '0')
      const color = String(product.color_code).padStart(3, '0')
      const width = String(product.fabric_width_cm).padStart(3, '0')
      return `PRD-${model}-${color}-${width}`
    }
    return product.product_code || 'PRD-000-000-000'
  }

  /**
   * สร้าง SKU หากไม่มี
   */
  generateSKU(product) {
    if (product.model_code && product.color_code && product.fabric_width_cm) {
      const model = String(product.model_code).padStart(3, '0')
      const color = String(product.color_code).padStart(3, '0')
      const width = String(product.fabric_width_cm).padStart(3, '0')
      return `FAB-${model}-${color}-${width}`
    }
    return product.sku || 'FAB-000-000-000'
  }

  /**
   * ข้อมูล Mock สำหรับการพัฒนา (ใช้ข้อมูลจริงจากภาพ)
   */
  getMockData(productId) {
    return {
      product: {
        id: productId,
        product_code: "PRD-402-177-152",
        product_name: "ผ้าฝ้าย สีกรม 152cm",
        sku: "FAB-402-177-152",
        model_code: "402",
        color_code: "177",
        fabric_width_cm: 152,
        fabric_type: "cotton",
        weight_per_meter: 0.3,
        gsm: 180,
        price_per_meter: 450,
        category: "textile",
        enable_lot_tracking: true
      },
      lots: [
        {
          lot_id: "LOT-08883",
          lot_status: "active",
          original_weight_kg: 25.5,
          current_weight_kg: 25.5,
          calculated_meters: 85.0,
          current_meters: 85.0,
          usage_percentage: 0,
          roll_type: "full",
          status_class: "bg-green-500",
          supplier_name: "บริษัท ผ้าไทย จำกัด",
          current_location: "WH01-A-001",
          warehouse: "WH01",
          created_date: "2024-01-15T08:00:00Z",
          last_updated: "2024-01-15T08:00:00Z"
        },
        {
          lot_id: "LOT-08884",
          lot_status: "partial",
          original_weight_kg: 30.0,
          current_weight_kg: 18.6,
          calculated_meters: 100.0,
          current_meters: 62.0,
          usage_percentage: 38,
          roll_type: "partial",
          status_class: "bg-yellow-500",
          supplier_name: "บริษัท ผ้าไทย จำกัด",
          current_location: "WH01-A-002",
          warehouse: "WH01",
          created_date: "2024-01-16T09:00:00Z",
          last_updated: "2024-01-20T14:30:00Z",
          usage_history: [
            {
              date: "2024-01-20T14:30:00Z",
              amount_used: 38.0,
              unit: "เมตร",
              remaining: 62.0,
              purpose: "production",
              reference: "WO-2024-001"
            }
          ]
        }
      ],
      statistics: {
        total_lots: 2,
        active_lots: 2,
        total_meters: 147.0,
        total_weight: 44.1,
        total_value: 66150,
        full_rolls: { count: 1, meters: 85.0 },
        partial_rolls: { count: 1, meters: 62.0 },
        consumed_rolls: { count: 0, meters: 0 }
      }
    }
  }

  /**
   * ดึงข้อมูลประวัติการใช้งาน lot
   */
  async getLotUsageHistory(lotId) {
    try {
      const response = await this.apiRequest({
        method: 'GET',
        endpoint: `/inventory/lots/${lotId}/usage-history`
      })

      return response.success ? response.data : []
    } catch (error) {
      console.error('❌ Error loading lot usage history:', error)
      return []
    }
  }

  /**
   * อัปเดตข้อมูล lot
   */
  async updateLotData(lotId, updateData) {
    try {
      const response = await this.apiRequest({
        method: 'PUT',
        endpoint: `/inventory/lots/${lotId}`,
        data: updateData
      })

      return response
    } catch (error) {
      console.error('❌ Error updating lot data:', error)
      return { success: false, error: error.message }
    }
  }
}

// Export singleton instance
export default new ProductLotSummaryService()
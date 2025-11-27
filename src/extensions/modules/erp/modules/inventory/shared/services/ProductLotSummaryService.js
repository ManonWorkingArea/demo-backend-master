/**
 * Product Lot Summary Service
 * 
 * Service for handling product lot tracking data for the summary component
 */
export default {
  // API request handler (will be initialized)
  apiRequest: null,
  clientKey: null,

  /**
   * Initialize the service with API handler and client key
   * @param {Function} apiRequestHandler - The API request function
   * @param {string} clientKey - The client key for API authentication
   */
  initialize(apiRequestHandler, clientKey) {
    this.apiRequest = apiRequestHandler
    this.clientKey = clientKey
  },

  /**
   * Get lot tracking data for a specific product
   * @param {string} productId - The product ID to get lots for
   * @returns {Promise<Object>} Response with lot tracking data
   */
  async getProductLots(productId) {
    if (!this.apiRequest) {
      throw new Error('Service not initialized. Call initialize() first.')
    }

    try {
      // Use the same aggregation endpoint as Product Detail
      const response = await this.apiRequest.POST('lot_tracking/aggregate', {
        pipeline: [
          {
            $match: {
              product_id: productId,
              status: { $ne: 'deleted' }
            }
          },
          {
            $sort: { created_at: -1 }
          }
        ]
      }, this.clientKey)

      return {
        success: true,
        data: response.data || []
      }
    } catch (error) {
      console.error('❌ [ProductLotSummaryService] Failed to fetch lot data:', error)
      return {
        success: false,
        error: error.message || 'Failed to fetch lot tracking data',
        data: []
      }
    }
  },

  /**
   * Get product information with lots
   * @param {string} productId - The product ID
   * @returns {Promise<Object>} Response with product and lot data
   */
  async getProductWithLots(productId) {
    if (!this.apiRequest) {
      throw new Error('Service not initialized. Call initialize() first.')
    }

    try {
      // Get product details
      const productResponse = await this.apiRequest({
        method: 'GET',
        url: `/api/products/${productId}`,
        timeout: 10000
      })

      // Get lot tracking data
      const lotsResponse = await this.getProductLots(productId)

      return {
        success: true,
        data: {
          product: productResponse.data,
          lots: lotsResponse.data
        }
      }
    } catch (error) {
      console.error('❌ [ProductLotSummaryService] Failed to fetch product with lots:', error)
      return {
        success: false,
        error: error.message || 'Failed to fetch product and lot data',
        data: {
          product: null,
          lots: []
        }
      }
    }
  },

  /**
   * Calculate summary statistics from lot data
   * @param {Array} lots - Array of lot tracking records
   * @returns {Object} Summary statistics
   */
  calculateSummary(lots) {
    if (!lots || !Array.isArray(lots)) {
      return {
        totalWeight: 0,
        totalMeters: 0,
        totalLots: 0,
        activeLots: 0,
        partialLots: 0,
        emptyLots: 0
      }
    }

    const summary = lots.reduce((acc, lot) => {
      if (!lot) return acc

      acc.totalWeight += lot.weight_kg || 0
      acc.totalMeters += lot.calculated_meters || 0
      acc.totalLots += 1

      // Count by status
      switch (lot.status) {
        case 'active':
          acc.activeLots += 1
          break
        case 'partial':
          acc.partialLots += 1
          break
        case 'empty':
          acc.emptyLots += 1
          break
      }

      return acc
    }, {
      totalWeight: 0,
      totalMeters: 0,
      totalLots: 0,
      activeLots: 0,
      partialLots: 0,
      emptyLots: 0
    })

    return summary
  }
}
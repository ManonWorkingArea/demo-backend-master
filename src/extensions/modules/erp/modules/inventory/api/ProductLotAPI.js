// API Endpoints สำหรับ Product Lot Summary

/**
 * GET /api/products/:productId/lot-summary
 * ดึงข้อมูลสินค้าพร้อม lots ทั้งหมด
 */
export const getProductLotSummary = async (productId, apiRequest) => {
  try {
    const response = await apiRequest({
      method: 'GET',
      endpoint: `/products/${productId}/lot-summary`
    })
    
    return response.data
  } catch (error) {
    console.error('❌ Error fetching product lot summary:', error)
    // Return mock data for development
    return getMockProductLotData(productId)
  }
}

/**
 * Mock data สำหรับการพัฒนา
 */
const getMockProductLotData = (productId) => {
  return {
    product: {
      id: productId,
      product_code: "PRD-402-177-152",
      product_name: "ผ้าฝ้าย สีกรม 152cm",
      model_code: "402",
      color_code: "177", 
      fabric_width_cm: 152,
      fabric_type: "cotton",
      weight_per_meter: 0.3,
      price_per_meter: 450
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
        location: "WH01-A-001",
        created_date: "2024-01-15"
      },
      {
        lot_id: "LOT-08884",
        lot_status: "partial",
        original_weight_kg: 30.0,
        current_weight_kg: 18.6,
        calculated_meters: 100.0,
        current_meters: 62.0,
        usage_percentage: 38,
        location: "WH01-A-002", 
        created_date: "2024-01-16"
      },
      {
        lot_id: "LOT-08885",
        lot_status: "consumed",
        original_weight_kg: 22.2,
        current_weight_kg: 0,
        calculated_meters: 74.0,
        current_meters: 0,
        usage_percentage: 100,
        location: "WH01-A-003",
        created_date: "2024-01-10"
      }
    ],
    summary: {
      total_lots: 3,
      active_lots: 2,
      total_meters: 147.0,
      total_value: 66150,
      full_rolls: { count: 1, meters: 85.0 },
      partial_rolls: { count: 1, meters: 62.0 },
      consumed_rolls: { count: 1, meters: 74.0 }
    }
  }
}

/**
 * MongoDB Aggregation Pipeline สำหรับดึงข้อมูล
 */
export const createLotSummaryAggregation = (productId) => {
  return [
    // Match product
    { $match: { product_id: productId } },
    
    // Lookup lots
    {
      $lookup: {
        from: "lot_registry",
        localField: "id", 
        foreignField: "product_id",
        as: "lots"
      }
    },
    
    // Calculate lot statistics
    {
      $addFields: {
        "summary.total_lots": { $size: "$lots" },
        "summary.active_lots": {
          $size: {
            $filter: {
              input: "$lots",
              cond: { 
                $in: ["$$this.lot_status", ["active", "partial"]]
              }
            }
          }
        },
        "summary.total_meters": {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$lots",
                  cond: { $in: ["$$this.lot_status", ["active", "partial"]] }
                }
              },
              in: "$$this.current_meters"
            }
          }
        }
      }
    },
    
    // Add usage percentage to each lot
    {
      $addFields: {
        lots: {
          $map: {
            input: "$lots",
            in: {
              $mergeObjects: [
                "$$this",
                {
                  usage_percentage: {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$$this.calculated_meters", "$$this.current_meters"] },
                          "$$this.calculated_meters"
                        ]
                      },
                      100
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    }
  ]
}
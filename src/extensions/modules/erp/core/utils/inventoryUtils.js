// ==========================================
// Inventory Utilities
// ==========================================

/**
 * Calculate stock levels and availability
 * @param {Object} product - Product data
 * @param {Array} movements - Stock movements
 * @returns {Object} - Stock calculations
 */
export const calculateStockLevels = (product = {}, movements = []) => {
  const {
    minimumStock = 0,
    maximumStock = null,
    reorderPoint = 0,
    safetyStock = 0
  } = product

  // Calculate current stock from movements
  let currentStock = 0
  let reservedStock = 0
  let availableStock = 0

  movements.forEach(movement => {
    const quantity = movement.quantity || 0
    const type = movement.type || movement.movement_type

    switch (type) {
      case 'in':
      case 'receipt':
      case 'purchase':
      case 'adjustment_in':
        currentStock += quantity
        break
      case 'out':
      case 'issue':
      case 'sale':
      case 'adjustment_out':
        currentStock -= quantity
        break
      case 'reserved':
      case 'allocation':
        reservedStock += quantity
        break
    }
  })

  availableStock = currentStock - reservedStock

  // Determine stock status
  let stockStatus = 'normal'
  if (availableStock <= 0) {
    stockStatus = 'out_of_stock'
  } else if (availableStock <= reorderPoint) {
    stockStatus = 'reorder'
  } else if (availableStock <= minimumStock) {
    stockStatus = 'low'
  } else if (maximumStock && availableStock >= maximumStock) {
    stockStatus = 'overstock'
  }

  // Calculate stock days
  const averageDailyUsage = calculateAverageDailyUsage(movements)
  const stockDays = averageDailyUsage > 0 ? availableStock / averageDailyUsage : null

  return {
    currentStock,
    reservedStock,
    availableStock,
    stockStatus,
    stockDays,
    minimumStock,
    maximumStock,
    reorderPoint,
    safetyStock,
    needsReorder: availableStock <= reorderPoint,
    isLowStock: availableStock <= minimumStock,
    isOutOfStock: availableStock <= 0,
    isOverstock: maximumStock && availableStock >= maximumStock
  }
}

/**
 * Calculate average daily usage
 * @param {Array} movements - Stock movements
 * @param {number} days - Number of days to calculate average
 * @returns {number} - Average daily usage
 */
export const calculateAverageDailyUsage = (movements = [], days = 30) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const outMovements = movements.filter(movement => {
    const movementDate = new Date(movement.created_at || movement.date)
    const type = movement.type || movement.movement_type
    const isOutbound = ['out', 'issue', 'sale', 'adjustment_out'].includes(type)
    
    return isOutbound && movementDate >= cutoffDate
  })

  const totalUsage = outMovements.reduce((sum, movement) => 
    sum + Math.abs(movement.quantity || 0), 0
  )

  return totalUsage / days
}

/**
 * Calculate ABC analysis for inventory
 * @param {Array} products - Array of products with sales data
 * @returns {Array} - Products with ABC classification
 */
export const calculateABCAnalysis = (products = []) => {
  // Calculate total value for each product (quantity * unit_cost)
  const productsWithValue = products.map(product => {
    const annualSales = product.annualSales || product.annual_sales || 0
    const unitCost = product.unitCost || product.unit_cost || 0
    const totalValue = annualSales * unitCost

    return {
      ...product,
      totalValue,
      annualSales,
      unitCost
    }
  })

  // Sort by total value (descending)
  productsWithValue.sort((a, b) => b.totalValue - a.totalValue)

  // Calculate cumulative percentages
  const totalInventoryValue = productsWithValue.reduce((sum, p) => sum + p.totalValue, 0)
  let cumulativeValue = 0

  return productsWithValue.map((product, index) => {
    cumulativeValue += product.totalValue
    const cumulativePercentage = (cumulativeValue / totalInventoryValue) * 100

    let classification = 'C'
    if (cumulativePercentage <= 80) {
      classification = 'A'
    } else if (cumulativePercentage <= 95) {
      classification = 'B'
    }

    return {
      ...product,
      rank: index + 1,
      valuePercentage: (product.totalValue / totalInventoryValue) * 100,
      cumulativePercentage,
      classification
    }
  })
}

/**
 * Calculate inventory turnover ratio
 * @param {number} costOfGoodsSold - COGS for the period
 * @param {number} averageInventory - Average inventory value
 * @returns {Object} - Turnover metrics
 */
export const calculateInventoryTurnover = (costOfGoodsSold = 0, averageInventory = 0) => {
  if (averageInventory === 0) {
    return {
      turnoverRatio: 0,
      daysSalesInventory: 0,
      status: 'no_data'
    }
  }

  const turnoverRatio = costOfGoodsSold / averageInventory
  const daysSalesInventory = 365 / turnoverRatio

  let status = 'normal'
  if (turnoverRatio < 2) {
    status = 'slow_moving'
  } else if (turnoverRatio > 12) {
    status = 'fast_moving'
  }

  return {
    turnoverRatio: Math.round(turnoverRatio * 100) / 100,
    daysSalesInventory: Math.round(daysSalesInventory),
    status,
    costOfGoodsSold,
    averageInventory
  }
}

/**
 * Calculate reorder quantity using Economic Order Quantity (EOQ)
 * @param {Object} options - EOQ calculation options
 * @returns {Object} - EOQ calculation result
 */
export const calculateEOQ = (options = {}) => {
  const {
    annualDemand = 0,
    orderingCost = 0,
    holdingCostPerUnit = 0,
    unitCost = 0,
    holdingCostRate = 0.2 // 20% default holding cost rate
  } = options

  if (annualDemand === 0 || orderingCost === 0) {
    return {
      eoq: 0,
      totalCost: 0,
      orderingCost: 0,
      holdingCost: 0,
      numberOfOrders: 0
    }
  }

  // Calculate holding cost per unit if not provided
  const holdingCost = holdingCostPerUnit || (unitCost * holdingCostRate)

  // EOQ formula: √(2 * D * S / H)
  const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost)

  // Calculate total costs
  const numberOfOrders = annualDemand / eoq
  const annualOrderingCost = numberOfOrders * orderingCost
  const annualHoldingCost = (eoq / 2) * holdingCost
  const totalCost = annualOrderingCost + annualHoldingCost

  return {
    eoq: Math.round(eoq),
    totalCost: Math.round(totalCost),
    orderingCost: Math.round(annualOrderingCost),
    holdingCost: Math.round(annualHoldingCost),
    numberOfOrders: Math.round(numberOfOrders * 100) / 100,
    costBreakdown: {
      ordering: annualOrderingCost,
      holding: annualHoldingCost,
      total: totalCost
    }
  }
}

/**
 * Calculate safety stock using standard deviation method
 * @param {Object} options - Safety stock calculation options
 * @returns {Object} - Safety stock calculation
 */
export const calculateSafetyStock = (options = {}) => {
  const {
    averageDemand = 0,
    demandVariability = 0, // Standard deviation of demand
    leadTime = 7, // Days
    leadTimeVariability = 0, // Standard deviation of lead time
    serviceLevel = 0.95 // 95% service level
  } = options

  // Z-score for service level (95% = 1.65, 99% = 2.33)
  const zScores = {
    0.90: 1.28,
    0.95: 1.65,
    0.99: 2.33,
    0.995: 2.58
  }

  const zScore = zScores[serviceLevel] || 1.65

  // Calculate safety stock
  // SS = Z × √(LT × σD² + D̄² × σLT²)
  const demandVariance = demandVariability * demandVariability
  const leadTimeVariance = leadTimeVariability * leadTimeVariability

  const variance = (leadTime * demandVariance) + 
                  (averageDemand * averageDemand * leadTimeVariance)

  const safetyStock = zScore * Math.sqrt(variance)

  return {
    safetyStock: Math.round(safetyStock),
    serviceLevel,
    zScore,
    averageDemand,
    demandVariability,
    leadTime,
    leadTimeVariability,
    reorderPoint: Math.round((averageDemand * leadTime) + safetyStock)
  }
}

/**
 * Analyze slow-moving and dead stock
 * @param {Array} products - Array of products with movement data
 * @param {Object} options - Analysis options
 * @returns {Object} - Slow-moving analysis
 */
export const analyzeSlowMovingStock = (products = [], options = {}) => {
  const {
    slowMovingDays = 90,
    deadStockDays = 180,
    minimumValue = 0
  } = options

  const cutoffDate = new Date()
  const slowMovingCutoff = new Date(cutoffDate.getTime() - (slowMovingDays * 24 * 60 * 60 * 1000))
  const deadStockCutoff = new Date(cutoffDate.getTime() - (deadStockDays * 24 * 60 * 60 * 1000))

  const analysis = {
    slowMoving: [],
    deadStock: [],
    totalValue: 0,
    slowMovingValue: 0,
    deadStockValue: 0
  }

  products.forEach(product => {
    const movements = product.movements || []
    const lastSaleDate = getLastSaleDate(movements)
    const currentStock = product.currentStock || product.current_stock || 0
    const unitCost = product.unitCost || product.unit_cost || 0
    const stockValue = currentStock * unitCost

    analysis.totalValue += stockValue

    if (stockValue >= minimumValue && currentStock > 0) {
      if (!lastSaleDate || lastSaleDate < deadStockCutoff) {
        analysis.deadStock.push({
          ...product,
          lastSaleDate,
          daysSinceLastSale: lastSaleDate ? 
            Math.floor((cutoffDate - lastSaleDate) / (24 * 60 * 60 * 1000)) : null,
          stockValue,
          category: 'dead'
        })
        analysis.deadStockValue += stockValue
      } else if (lastSaleDate < slowMovingCutoff) {
        analysis.slowMoving.push({
          ...product,
          lastSaleDate,
          daysSinceLastSale: Math.floor((cutoffDate - lastSaleDate) / (24 * 60 * 60 * 1000)),
          stockValue,
          category: 'slow'
        })
        analysis.slowMovingValue += stockValue
      }
    }
  })

  // Sort by value (descending)
  analysis.slowMoving.sort((a, b) => b.stockValue - a.stockValue)
  analysis.deadStock.sort((a, b) => b.stockValue - a.stockValue)

  return {
    ...analysis,
    slowMovingPercentage: analysis.totalValue > 0 ? 
      (analysis.slowMovingValue / analysis.totalValue) * 100 : 0,
    deadStockPercentage: analysis.totalValue > 0 ? 
      (analysis.deadStockValue / analysis.totalValue) * 100 : 0,
    summary: {
      totalProducts: products.length,
      slowMovingCount: analysis.slowMoving.length,
      deadStockCount: analysis.deadStock.length,
      totalValue: analysis.totalValue,
      slowMovingValue: analysis.slowMovingValue,
      deadStockValue: analysis.deadStockValue
    }
  }
}

/**
 * Get last sale date from movements
 * @param {Array} movements - Stock movements
 * @returns {Date|null} - Last sale date
 */
const getLastSaleDate = (movements = []) => {
  const saleMovements = movements.filter(movement => {
    const type = movement.type || movement.movement_type
    return ['out', 'issue', 'sale'].includes(type)
  })

  if (saleMovements.length === 0) return null

  const dates = saleMovements.map(movement => 
    new Date(movement.created_at || movement.date)
  )

  return new Date(Math.max(...dates))
}
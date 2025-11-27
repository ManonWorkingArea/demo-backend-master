// ==========================================
// Production Utilities
// ==========================================

/**
 * Calculate production capacity and efficiency
 * @param {Object} options - Production calculation options
 * @returns {Object} - Production metrics
 */
export const calculateProductionCapacity = (options = {}) => {
  const {
    availableHours = 8, // Hours per day
    workingDays = 22, // Working days per month
    numberOfMachines = 1,
    cycleTime = 60, // Minutes per unit
    efficiency = 0.85, // 85% efficiency
    setupTime = 30, // Minutes setup time per batch
    batchSize = 100
  } = options

  // Calculate theoretical capacity
  const totalAvailableMinutes = availableHours * 60 * workingDays * numberOfMachines
  const setupTimePerUnit = batchSize > 0 ? setupTime / batchSize : 0
  const effectiveCycleTime = cycleTime + setupTimePerUnit
  
  const theoreticalCapacity = totalAvailableMinutes / effectiveCycleTime
  const practicalCapacity = theoreticalCapacity * efficiency

  // Calculate utilization metrics
  const utilizationRate = efficiency * 100
  const capacityUtilization = (options.actualProduction || 0) / practicalCapacity * 100

  return {
    theoreticalCapacity: Math.round(theoreticalCapacity),
    practicalCapacity: Math.round(practicalCapacity),
    availableCapacity: Math.round(practicalCapacity - (options.actualProduction || 0)),
    utilizationRate: Math.round(utilizationRate * 100) / 100,
    capacityUtilization: Math.round(capacityUtilization * 100) / 100,
    efficiency: Math.round(efficiency * 10000) / 100,
    bottleneck: effectiveCycleTime > (options.targetCycleTime || cycleTime),
    metrics: {
      cycleTime: effectiveCycleTime,
      setupTimePerUnit,
      totalAvailableTime: totalAvailableMinutes,
      effectiveProductionTime: totalAvailableMinutes * efficiency
    }
  }
}

/**
 * Calculate Overall Equipment Effectiveness (OEE)
 * @param {Object} options - OEE calculation options
 * @returns {Object} - OEE metrics
 */
export const calculateOEE = (options = {}) => {
  const {
    plannedProductionTime = 480, // Minutes
    actualRunTime = 400, // Minutes (excluding breakdowns)
    idealCycleTime = 1.0, // Minutes per unit
    totalUnitsProduced = 350,
    goodUnitsProduced = 320,
    targetOEE = 0.85 // 85% target OEE
  } = options

  // Availability = (Actual Run Time / Planned Production Time) * 100
  const availability = actualRunTime / plannedProductionTime

  // Performance = (Total Units × Ideal Cycle Time) / Actual Run Time * 100
  const performance = (totalUnitsProduced * idealCycleTime) / actualRunTime

  // Quality = (Good Units / Total Units) * 100
  const quality = totalUnitsProduced > 0 ? goodUnitsProduced / totalUnitsProduced : 0

  // OEE = Availability × Performance × Quality
  const oee = availability * performance * quality

  // Calculate losses
  const availabilityLoss = plannedProductionTime - actualRunTime
  const performanceLoss = actualRunTime - (totalUnitsProduced * idealCycleTime)
  const qualityLoss = totalUnitsProduced - goodUnitsProduced

  // Determine OEE class
  let oeeClass = 'poor'
  if (oee >= 0.85) {
    oeeClass = 'world_class'
  } else if (oee >= 0.65) {
    oeeClass = 'acceptable'
  } else if (oee >= 0.40) {
    oeeClass = 'low'
  }

  return {
    oee: Math.round(oee * 10000) / 100,
    availability: Math.round(availability * 10000) / 100,
    performance: Math.round(performance * 10000) / 100,
    quality: Math.round(quality * 10000) / 100,
    oeeClass,
    meetsTarget: oee >= targetOEE,
    losses: {
      availability: availabilityLoss,
      performance: performanceLoss,
      quality: qualityLoss,
      total: availabilityLoss + performanceLoss + (qualityLoss * idealCycleTime)
    },
    metrics: {
      plannedProductionTime,
      actualRunTime,
      totalUnitsProduced,
      goodUnitsProduced,
      defectiveUnits: totalUnitsProduced - goodUnitsProduced,
      idealCycleTime
    }
  }
}

/**
 * Calculate Material Requirements Planning (MRP)
 * @param {Object} options - MRP calculation options
 * @returns {Object} - MRP calculation result
 */
export const calculateMRP = (options = {}) => {
  const {
    demandForecast = [], // Array of demand by period
    bomStructure = [], // Bill of Materials
    currentInventory = {},
    leadTimes = {},
    safetyStock = {},
    lotSizes = {}
  } = options

  const mrpResults = {}

  // Process each item in BOM
  bomStructure.forEach(bomItem => {
    const { itemCode, level } = bomItem
    
    if (!mrpResults[itemCode]) {
      mrpResults[itemCode] = {
        itemCode,
        level,
        requirements: [],
        plannedOrderReleases: [],
        projectedOnHand: [],
        netRequirements: []
      }
    }

    // Calculate gross requirements
    const grossRequirements = calculateGrossRequirements(
      itemCode, demandForecast, bomStructure, mrpResults
    )

    // Calculate net requirements
    let onHand = currentInventory[itemCode] || 0
    const safety = safetyStock[itemCode] || 0
    const leadTime = leadTimes[itemCode] || 0
    const lotSize = lotSizes[itemCode] || 1

    grossRequirements.forEach((requirement, period) => {
      const netReq = Math.max(0, requirement + safety - onHand)
      
      if (netReq > 0) {
        // Calculate lot-sized order
        const orderQuantity = Math.ceil(netReq / lotSize) * lotSize
        
        // Schedule order release (considering lead time)
        const orderReleasePeriod = Math.max(0, period - leadTime)
        
        if (!mrpResults[itemCode].plannedOrderReleases[orderReleasePeriod]) {
          mrpResults[itemCode].plannedOrderReleases[orderReleasePeriod] = 0
        }
        mrpResults[itemCode].plannedOrderReleases[orderReleasePeriod] += orderQuantity
        
        onHand += orderQuantity
      }

      onHand -= requirement
      mrpResults[itemCode].requirements[period] = requirement
      mrpResults[itemCode].netRequirements[period] = netReq
      mrpResults[itemCode].projectedOnHand[period] = onHand
    })
  })

  return {
    mrpResults,
    summary: {
      totalItems: Object.keys(mrpResults).length,
      totalPlannedOrders: Object.values(mrpResults).reduce((sum, item) => 
        sum + item.plannedOrderReleases.reduce((orderSum, qty) => orderSum + (qty || 0), 0), 0
      ),
      criticalItems: Object.entries(mrpResults)
        .filter(([, data]) => data.netRequirements.some(req => req > 0))
        .map(([itemCode]) => itemCode)
    }
  }
}

/**
 * Calculate production schedule optimization
 * @param {Array} orders - Production orders
 * @param {Object} constraints - Production constraints
 * @returns {Object} - Optimized schedule
 */
export const calculateProductionSchedule = (orders = [], constraints = {}) => {
  const {
    availableHours = 8,
    setupTimes = {},
    processingTimes = {},
    dueDates = {},
    priorities = {},
    maxWIP = null // Maximum Work In Progress
  } = constraints

  // Sort orders by priority and due date
  const sortedOrders = orders.slice().sort((a, b) => {
    const priorityA = priorities[a.id] || 5
    const priorityB = priorities[b.id] || 5
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB // Lower number = higher priority
    }
    
    // If same priority, sort by due date
    const dueDateA = new Date(dueDates[a.id] || a.dueDate || '2099-12-31')
    const dueDateB = new Date(dueDates[b.id] || b.dueDate || '2099-12-31')
    return dueDateA - dueDateB
  })

  const schedule = []
  let currentTime = 0
  let wipCount = 0

  sortedOrders.forEach((order, index) => {
    const orderId = order.id
    const quantity = order.quantity || 1
    const setupTime = setupTimes[orderId] || setupTimes[order.productId] || 0
    const processingTime = (processingTimes[orderId] || processingTimes[order.productId] || 60) * quantity

    // Check WIP constraint
    if (maxWIP && wipCount >= maxWIP) {
      // Skip this order for now (simplified scheduling)
      return
    }

    const totalTime = setupTime + processingTime
    const startTime = currentTime
    const endTime = currentTime + totalTime

    const dueDate = new Date(dueDates[orderId] || order.dueDate || '2099-12-31')
    const scheduledEndDate = new Date()
    scheduledEndDate.setMinutes(scheduledEndDate.getMinutes() + endTime)

    const isLate = scheduledEndDate > dueDate
    const lateness = isLate ? (scheduledEndDate - dueDate) / (1000 * 60 * 60) : 0 // Hours late

    schedule.push({
      orderId,
      productId: order.productId,
      quantity,
      startTime,
      endTime,
      setupTime,
      processingTime,
      totalTime,
      dueDate: dueDate.toISOString().split('T')[0],
      scheduledEndDate: scheduledEndDate.toISOString(),
      isLate,
      lateness: Math.round(lateness * 100) / 100,
      priority: priorities[orderId] || 5,
      sequenceNumber: index + 1
    })

    currentTime = endTime
    wipCount++
  })

  // Calculate schedule metrics
  const totalMakespan = currentTime
  const totalLateness = schedule.reduce((sum, item) => sum + (item.lateness || 0), 0)
  const lateOrders = schedule.filter(item => item.isLate).length
  const onTimePerformance = schedule.length > 0 ? 
    ((schedule.length - lateOrders) / schedule.length) * 100 : 100

  return {
    schedule,
    metrics: {
      totalMakespan,
      totalOrders: schedule.length,
      lateOrders,
      onTimePerformance: Math.round(onTimePerformance * 100) / 100,
      averageLateness: schedule.length > 0 ? totalLateness / schedule.length : 0,
      utilizationRate: availableHours > 0 ? (totalMakespan / 60) / availableHours * 100 : 0
    },
    recommendations: generateSchedulingRecommendations(schedule, constraints)
  }
}

/**
 * Calculate Work In Progress (WIP) metrics
 * @param {Array} workOrders - Current work orders
 * @returns {Object} - WIP analysis
 */
export const calculateWIPMetrics = (workOrders = []) => {
  const wipAnalysis = {
    totalWIP: workOrders.length,
    wipByStatus: {},
    wipByProduct: {},
    wipByWorkCenter: {},
    totalWIPValue: 0,
    averageCycleTime: 0,
    averageWaitTime: 0
  }

  let totalCycleTime = 0
  let totalWaitTime = 0
  let ordersWithTiming = 0

  workOrders.forEach(order => {
    const status = order.status || 'unknown'
    const productId = order.productId || 'unknown'
    const workCenter = order.workCenter || 'unknown'
    const wipValue = (order.quantity || 0) * (order.unitCost || 0)

    // Count by status
    wipAnalysis.wipByStatus[status] = (wipAnalysis.wipByStatus[status] || 0) + 1

    // Count by product
    wipAnalysis.wipByProduct[productId] = (wipAnalysis.wipByProduct[productId] || 0) + 1

    // Count by work center
    wipAnalysis.wipByWorkCenter[workCenter] = (wipAnalysis.wipByWorkCenter[workCenter] || 0) + 1

    // Sum WIP value
    wipAnalysis.totalWIPValue += wipValue

    // Calculate timing metrics
    if (order.startDate) {
      const startDate = new Date(order.startDate)
      const currentDate = new Date()
      const cycleTime = (currentDate - startDate) / (1000 * 60 * 60 * 24) // Days

      totalCycleTime += cycleTime
      ordersWithTiming++

      // Calculate wait time (time between operations)
      if (order.operations && Array.isArray(order.operations)) {
        let operationWaitTime = 0
        order.operations.forEach((operation, index) => {
          if (index > 0 && operation.startDate) {
            const prevOperation = order.operations[index - 1]
            if (prevOperation.endDate) {
              const waitTime = (new Date(operation.startDate) - new Date(prevOperation.endDate)) / (1000 * 60 * 60)
              operationWaitTime += waitTime
            }
          }
        })
        totalWaitTime += operationWaitTime
      }
    }
  })

  wipAnalysis.averageCycleTime = ordersWithTiming > 0 ? 
    Math.round((totalCycleTime / ordersWithTiming) * 100) / 100 : 0

  wipAnalysis.averageWaitTime = ordersWithTiming > 0 ? 
    Math.round((totalWaitTime / ordersWithTiming) * 100) / 100 : 0

  return wipAnalysis
}

/**
 * Calculate gross requirements for MRP
 * @private
 */
const calculateGrossRequirements = (itemCode, demandForecast, bomStructure, mrpResults) => {
  // Start with independent demand
  let grossRequirements = [...demandForecast]

  // Add dependent demand from parent items
  bomStructure.forEach(bomItem => {
    if (bomItem.itemCode === itemCode && bomItem.parentItem) {
      const parentResults = mrpResults[bomItem.parentItem]
      if (parentResults && parentResults.plannedOrderReleases) {
        parentResults.plannedOrderReleases.forEach((orderQty, period) => {
          if (orderQty > 0) {
            grossRequirements[period] = (grossRequirements[period] || 0) + 
              (orderQty * bomItem.quantityRequired)
          }
        })
      }
    }
  })

  return grossRequirements
}

/**
 * Generate scheduling recommendations
 * @private
 */
const generateSchedulingRecommendations = (schedule, constraints) => {
  const recommendations = []

  // Check for late orders
  const lateOrders = schedule.filter(item => item.isLate)
  if (lateOrders.length > 0) {
    recommendations.push({
      type: 'late_orders',
      priority: 'high',
      message: `${lateOrders.length} orders will be late. Consider expediting or rescheduling.`,
      affectedOrders: lateOrders.map(order => order.orderId)
    })
  }

  // Check utilization
  const utilizationRate = schedule.length > 0 ? 
    schedule.reduce((sum, item) => sum + item.totalTime, 0) / (constraints.availableHours * 60) * 100 : 0

  if (utilizationRate > 90) {
    recommendations.push({
      type: 'high_utilization',
      priority: 'medium',
      message: 'Production utilization is high. Consider additional capacity or overtime.',
      utilizationRate: Math.round(utilizationRate * 100) / 100
    })
  } else if (utilizationRate < 60) {
    recommendations.push({
      type: 'low_utilization',
      priority: 'low',
      message: 'Production utilization is low. Look for additional orders or maintenance opportunities.',
      utilizationRate: Math.round(utilizationRate * 100) / 100
    })
  }

  return recommendations
}
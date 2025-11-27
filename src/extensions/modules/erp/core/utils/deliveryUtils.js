// ==========================================
// Delivery Calculator Utilities
// ==========================================

/**
 * Calculate shipping cost based on various factors
 * @param {Object} options - Shipping calculation options
 * @returns {number} - Total shipping cost
 */
export const calculateShippingCost = (options = {}) => {
  const {
    shippingMethod = 'delivery',
    deliveryType = 'standard',
    weight = 0,
    volume = 0,
    distance = 0,
    packageType = 'box',
    isFragile = false,
    isUrgent = false
  } = options

  let baseCost = 0
  let weightCost = 0
  let volumeCost = 0
  let distanceCost = 0
  let surcharge = 0

  // Base cost by shipping method
  const baseCosts = {
    pickup: 0,
    delivery: 50,
    post: 20,
    ems: 40,
    kerry: 45,
    dhl: 120,
    fedex: 130,
    ups: 125,
    tnt: 115,
    flash: 40,
    j_and_t: 35,
    ninja_van: 38,
    scg: 42,
    best: 36
  }

  baseCost = baseCosts[shippingMethod] || 50

  // Weight-based cost (per kg)
  if (weight > 0) {
    const weightRates = {
      pickup: 0,
      delivery: 5,
      post: 10,
      ems: 15,
      kerry: 12,
      dhl: 25,
      fedex: 30,
      ups: 28,
      tnt: 24,
      flash: 8,
      j_and_t: 6,
      ninja_van: 7,
      scg: 9,
      best: 6
    }
    weightCost = (weightRates[shippingMethod] || 5) * weight
  }

  // Volume-based cost (per cubic meter)
  if (volume > 0) {
    volumeCost = volume * 100 // 100 บาท/ลบ.ม.
  }

  // Distance-based cost (per km)
  if (distance > 0 && shippingMethod === 'delivery') {
    if (distance <= 10) {
      distanceCost = 0 // Free for first 10km
    } else if (distance <= 50) {
      distanceCost = (distance - 10) * 2 // 2 บาท/กม.
    } else {
      distanceCost = 80 + (distance - 50) * 5 // 5 บาท/กม. สำหรับระยะไกล
    }
  }

  // Delivery type surcharge
  const deliveryTypeSurcharge = {
    standard: 0,
    express: baseCost * 0.5,
    same_day: baseCost * 1.0,
    next_day: baseCost * 0.3,
    scheduled: baseCost * 0.2,
    bulk: -baseCost * 0.1, // Discount for bulk
    partial: baseCost * 0.1,
    direct: baseCost * 0.4,
    transfer: baseCost * 0.2
  }

  surcharge += deliveryTypeSurcharge[deliveryType] || 0

  // Package type surcharge
  const packageTypeSurcharge = {
    box: 0,
    envelope: -10,
    pallet: 50,
    bulk: 30,
    fragile: 25
  }

  surcharge += packageTypeSurcharge[packageType] || 0

  // Additional surcharges
  if (isFragile) surcharge += 20
  if (isUrgent) surcharge += baseCost * 0.3

  const totalCost = baseCost + weightCost + volumeCost + distanceCost + surcharge
  return Math.max(totalCost, 0) // Ensure non-negative
}

/**
 * Calculate estimated delivery time
 * @param {Object} options - Delivery time calculation options
 * @returns {Object} - Estimated delivery dates
 */
export const calculateDeliveryTime = (options = {}) => {
  const {
    shippingMethod = 'delivery',
    deliveryType = 'standard',
    distance = 0,
    businessDaysOnly = true
  } = options

  let estimatedDays = 0

  // Base delivery days by shipping method
  const baseDays = {
    pickup: 0,
    delivery: 1,
    post: 3,
    ems: 1,
    kerry: 1,
    dhl: 2,
    fedex: 2,
    ups: 3,
    tnt: 3,
    flash: 1,
    j_and_t: 2,
    ninja_van: 2,
    scg: 2,
    best: 2
  }

  estimatedDays = baseDays[shippingMethod] || 2

  // Adjust for delivery type
  switch (deliveryType) {
    case 'express':
      estimatedDays = Math.max(estimatedDays - 1, 0)
      break
    case 'same_day':
      estimatedDays = 0
      break
    case 'next_day':
      estimatedDays = 1
      break
  }

  // Adjust for distance (for delivery method)
  if (shippingMethod === 'delivery' && distance > 100) {
    estimatedDays += 1
  }

  const now = new Date()
  const estimatedDate = new Date(now)

  if (businessDaysOnly) {
    let daysAdded = 0
    while (daysAdded < estimatedDays) {
      estimatedDate.setDate(estimatedDate.getDate() + 1)
      const dayOfWeek = estimatedDate.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        daysAdded++
      }
    }
  } else {
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays)
  }

  return {
    estimatedDays,
    estimatedDate: estimatedDate.toISOString().split('T')[0],
    businessDaysOnly
  }
}

/**
 * Calculate total package weight and volume
 * @param {Array} items - Array of delivery items
 * @returns {Object} - Total weight and volume
 */
export const calculatePackageMetrics = (items = []) => {
  let totalWeight = 0
  let totalVolume = 0

  items.forEach(item => {
    const quantity = item.deliveredQuantity || item.orderedQuantity || 0
    totalWeight += (item.weight || 0) * quantity
    totalVolume += (item.volume || 0) * quantity
  })

  return {
    totalWeight,
    totalVolume,
    itemCount: items.length
  }
}

/**
 * Calculate delivery cost breakdown
 * @param {Object} delivery - Delivery object
 * @returns {Object} - Cost breakdown
 */
export const calculateDeliveryCostBreakdown = (delivery) => {
  const { items = [], packages = [], shippingCost = 0 } = delivery

  const metrics = calculatePackageMetrics(items)
  
  const packagingCost = packages.reduce((total, pkg) => {
    const packageCosts = {
      box: 15,
      envelope: 5,
      pallet: 100,
      bulk: 0,
      fragile: 25
    }
    return total + (packageCosts[pkg.packageType] || 10)
  }, 0)

  const handlingCost = Math.ceil(metrics.itemCount / 10) * 10 // 10 บาทต่อ 10 รายการ

  const totalCost = shippingCost + packagingCost + handlingCost

  return {
    shippingCost,
    packagingCost,
    handlingCost,
    totalCost,
    breakdown: {
      shipping: shippingCost,
      packaging: packagingCost,
      handling: handlingCost
    }
  }
}

/**
 * Calculate packaging cost based on type and metrics
 * @param {string} packageType - Type of package
 * @param {number} weight - Package weight
 * @param {number} volume - Package volume
 * @returns {number} - Packaging cost
 */
export const calculatePackagingCost = (packageType = 'box', weight = 0, volume = 0) => {
  const baseCosts = {
    box: 15,
    envelope: 5,
    pallet: 100,
    bulk: 0,
    fragile: 25
  }

  let baseCost = baseCosts[packageType] || 10

  // Weight surcharge
  if (weight > 5) {
    baseCost += Math.ceil((weight - 5) / 5) * 5 // 5 บาทต่อ 5 กก.
  }

  // Volume surcharge
  if (volume > 0.1) {
    baseCost += Math.ceil((volume - 0.1) / 0.1) * 10 // 10 บาทต่อ 0.1 ลบ.ม.
  }

  return baseCost
}
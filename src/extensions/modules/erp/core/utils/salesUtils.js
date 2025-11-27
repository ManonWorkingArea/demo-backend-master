// ==========================================
// Sales Utilities
// ==========================================

/**
 * Calculate order total with taxes and discounts
 * @param {Array} items - Array of order items
 * @param {Object} options - Calculation options
 * @returns {Object} - Order total breakdown
 */
export const calculateOrderTotal = (items = [], options = {}) => {
  const {
    taxRate = 0.07, // 7% VAT
    discountType = 'percentage', // 'percentage' or 'amount'
    discountValue = 0,
    shippingCost = 0,
    includeShipping = true
  } = options

  let subtotal = 0
  let totalDiscount = 0

  // Calculate subtotal
  items.forEach(item => {
    const quantity = item.quantity || 0
    const unitPrice = item.unitPrice || item.unit_price || 0
    const itemDiscount = item.discount || 0
    
    const itemTotal = quantity * unitPrice
    const itemDiscountAmount = discountType === 'percentage' ? 
      itemTotal * (itemDiscount / 100) : itemDiscount
    
    subtotal += itemTotal - itemDiscountAmount
    totalDiscount += itemDiscountAmount
  })

  // Apply order-level discount
  let orderDiscount = 0
  if (discountValue > 0) {
    orderDiscount = discountType === 'percentage' ? 
      subtotal * (discountValue / 100) : discountValue
  }

  const discountedAmount = subtotal - orderDiscount
  const taxAmount = discountedAmount * taxRate
  const shipping = includeShipping ? shippingCost : 0
  const total = discountedAmount + taxAmount + shipping

  return {
    subtotal,
    totalDiscount: totalDiscount + orderDiscount,
    orderDiscount,
    taxAmount,
    shippingCost: shipping,
    total,
    breakdown: {
      subtotal,
      itemDiscount: totalDiscount,
      orderDiscount,
      taxableAmount: discountedAmount,
      tax: taxAmount,
      shipping,
      grandTotal: total
    }
  }
}

/**
 * Calculate commission for sales person
 * @param {number} saleAmount - Total sale amount
 * @param {Object} options - Commission calculation options
 * @returns {Object} - Commission breakdown
 */
export const calculateCommission = (saleAmount = 0, options = {}) => {
  const {
    rate = 0.05, // 5% default commission
    type = 'percentage', // 'percentage' or 'fixed'
    minimumSale = 0,
    maximumCommission = null,
    tiered = false,
    tiers = []
  } = options

  if (saleAmount < minimumSale) {
    return {
      commission: 0,
      rate: 0,
      saleAmount,
      eligible: false
    }
  }

  let commission = 0

  if (tiered && tiers.length > 0) {
    // Calculate tiered commission
    let remainingAmount = saleAmount
    
    tiers.forEach(tier => {
      const { threshold, rate: tierRate } = tier
      if (remainingAmount > 0) {
        const tierAmount = Math.min(remainingAmount, threshold)
        commission += tierAmount * tierRate
        remainingAmount -= tierAmount
      }
    })
  } else {
    // Calculate simple commission
    commission = type === 'percentage' ? saleAmount * rate : rate
  }

  // Apply maximum commission limit
  if (maximumCommission && commission > maximumCommission) {
    commission = maximumCommission
  }

  return {
    commission,
    rate: tiered ? 'tiered' : rate,
    saleAmount,
    eligible: true,
    effectiveRate: commission / saleAmount
  }
}

/**
 * Calculate sales metrics and KPIs
 * @param {Array} orders - Array of sales orders
 * @param {Object} options - Calculation options
 * @returns {Object} - Sales metrics
 */
export const calculateSalesMetrics = (orders = [], options = {}) => {
  const {
    periodStart = null,
    periodEnd = null,
    groupBy = null // 'day', 'week', 'month'
  } = options

  let filteredOrders = orders

  // Filter by period if specified
  if (periodStart || periodEnd) {
    filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate || order.created_at)
      if (periodStart && orderDate < new Date(periodStart)) return false
      if (periodEnd && orderDate > new Date(periodEnd)) return false
      return true
    })
  }

  const totalOrders = filteredOrders.length
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Calculate conversion metrics
  const completedOrders = filteredOrders.filter(order => 
    order.status === 'completed' || order.state === 'completed'
  ).length

  const conversionRate = totalOrders > 0 ? completedOrders / totalOrders : 0

  // Group by period if specified
  let groupedData = {}
  if (groupBy) {
    groupedData = filteredOrders.reduce((groups, order) => {
      const orderDate = new Date(order.orderDate || order.created_at)
      let key = ''

      switch (groupBy) {
        case 'day':
          key = orderDate.toISOString().split('T')[0]
          break
        case 'week': {
          const weekStart = new Date(orderDate)
          weekStart.setDate(orderDate.getDate() - orderDate.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        }
        case 'month':
          key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`
          break
      }

      if (!groups[key]) {
        groups[key] = {
          orders: 0,
          revenue: 0,
          items: 0
        }
      }

      groups[key].orders++
      groups[key].revenue += order.total || 0
      groups[key].items += (order.items || []).reduce((sum, item) => 
        sum + (item.quantity || 0), 0
      )

      return groups
    }, {})
  }

  return {
    totalOrders,
    completedOrders,
    totalRevenue,
    averageOrderValue,
    conversionRate,
    groupedData,
    summary: {
      orders: totalOrders,
      revenue: totalRevenue,
      avgOrder: averageOrderValue,
      conversion: conversionRate
    }
  }
}

/**
 * Calculate discount amount
 * @param {number} amount - Original amount
 * @param {Object} discount - Discount configuration
 * @returns {number} - Discount amount
 */
export const calculateDiscount = (amount = 0, discount = {}) => {
  const { type = 'percentage', value = 0, maximum = null } = discount

  if (!value || value <= 0) return 0

  let discountAmount = 0

  switch (type) {
    case 'percentage':
      discountAmount = amount * (value / 100)
      break
    case 'amount':
    case 'fixed':
      discountAmount = value
      break
    default:
      discountAmount = 0
  }

  // Apply maximum discount limit
  if (maximum && discountAmount > maximum) {
    discountAmount = maximum
  }

  // Ensure discount doesn't exceed original amount
  return Math.min(discountAmount, amount)
}

/**
 * Validate order data
 * @param {Object} order - Order data to validate
 * @returns {Object} - Validation result
 */
export const validateOrder = (order = {}) => {
  const errors = []
  const warnings = []

  // Required fields
  if (!order.customerId && !order.customer_id) {
    errors.push('Customer ID is required')
  }

  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must have at least one item')
  }

  // Validate items
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach((item, index) => {
      if (!item.productId && !item.product_id) {
        errors.push(`Item ${index + 1}: Product ID is required`)
      }

      const quantity = item.quantity || 0
      if (quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
      }

      const price = item.unitPrice || item.unit_price || 0
      if (price < 0) {
        errors.push(`Item ${index + 1}: Unit price cannot be negative`)
      }
    })
  }

  // Validate totals
  if (order.total && order.total < 0) {
    errors.push('Order total cannot be negative')
  }

  // Warnings
  if (order.total && order.total > 100000) {
    warnings.push('High value order - consider additional verification')
  }

  if (!order.shippingAddress && !order.shipping_address) {
    warnings.push('No shipping address specified')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasWarnings: warnings.length > 0
  }
}

/**
 * Calculate order fulfillment status
 * @param {Object} order - Order data
 * @returns {Object} - Fulfillment status
 */
export const calculateFulfillmentStatus = (order = {}) => {
  const items = order.items || []
  
  if (items.length === 0) {
    return {
      status: 'pending',
      percentage: 0,
      fulfilledItems: 0,
      totalItems: 0
    }
  }

  let fulfilledQuantity = 0
  let totalQuantity = 0

  items.forEach(item => {
    const ordered = item.quantity || item.orderedQuantity || 0
    const fulfilled = item.fulfilledQuantity || item.deliveredQuantity || 0
    
    totalQuantity += ordered
    fulfilledQuantity += Math.min(fulfilled, ordered)
  })

  const percentage = totalQuantity > 0 ? (fulfilledQuantity / totalQuantity) * 100 : 0

  let status = 'pending'
  if (percentage === 0) {
    status = 'pending'
  } else if (percentage < 100) {
    status = 'partial'
  } else {
    status = 'fulfilled'
  }

  return {
    status,
    percentage: Math.round(percentage * 100) / 100,
    fulfilledQuantity,
    totalQuantity,
    remainingQuantity: totalQuantity - fulfilledQuantity
  }
}
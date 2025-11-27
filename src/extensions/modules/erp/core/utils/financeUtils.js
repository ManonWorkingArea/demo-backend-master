// ==========================================
// Finance Utilities
// ==========================================

/**
 * Calculate financial ratios
 * @param {Object} financialData - Financial statements data
 * @returns {Object} - Financial ratios
 */
export const calculateFinancialRatios = (financialData = {}) => {
  const {
    currentAssets = 0,
    currentLiabilities = 0,
    totalAssets = 0,
    totalLiabilities = 0,
    inventory = 0,
    revenue = 0,
    netIncome = 0,
    grossProfit = 0,
    operatingIncome = 0,
    totalEquity = 0,
    accountsReceivable = 0,
    costOfGoodsSold = 0
  } = financialData

  // Liquidity Ratios
  const currentRatio = currentLiabilities !== 0 ? currentAssets / currentLiabilities : 0
  const quickRatio = currentLiabilities !== 0 ? 
    (currentAssets - inventory) / currentLiabilities : 0
  const cashRatio = currentLiabilities !== 0 ? 
    (financialData.cash || 0) / currentLiabilities : 0

  // Profitability Ratios
  const grossProfitMargin = revenue !== 0 ? (grossProfit / revenue) * 100 : 0
  const operatingMargin = revenue !== 0 ? (operatingIncome / revenue) * 100 : 0
  const netProfitMargin = revenue !== 0 ? (netIncome / revenue) * 100 : 0
  const roa = totalAssets !== 0 ? (netIncome / totalAssets) * 100 : 0
  const roe = totalEquity !== 0 ? (netIncome / totalEquity) * 100 : 0

  // Activity Ratios
  const inventoryTurnover = inventory !== 0 ? costOfGoodsSold / inventory : 0
  const receivablesTurnover = accountsReceivable !== 0 ? revenue / accountsReceivable : 0
  const assetTurnover = totalAssets !== 0 ? revenue / totalAssets : 0
  
  // Days calculations
  const daysInInventory = inventoryTurnover !== 0 ? 365 / inventoryTurnover : 0
  const daysInReceivables = receivablesTurnover !== 0 ? 365 / receivablesTurnover : 0

  // Leverage Ratios
  const debtToAsset = totalAssets !== 0 ? (totalLiabilities / totalAssets) * 100 : 0
  const debtToEquity = totalEquity !== 0 ? (totalLiabilities / totalEquity) * 100 : 0
  const equityRatio = totalAssets !== 0 ? (totalEquity / totalAssets) * 100 : 0

  return {
    liquidity: {
      currentRatio: Math.round(currentRatio * 100) / 100,
      quickRatio: Math.round(quickRatio * 100) / 100,
      cashRatio: Math.round(cashRatio * 100) / 100
    },
    profitability: {
      grossProfitMargin: Math.round(grossProfitMargin * 100) / 100,
      operatingMargin: Math.round(operatingMargin * 100) / 100,
      netProfitMargin: Math.round(netProfitMargin * 100) / 100,
      roa: Math.round(roa * 100) / 100,
      roe: Math.round(roe * 100) / 100
    },
    activity: {
      inventoryTurnover: Math.round(inventoryTurnover * 100) / 100,
      receivablesTurnover: Math.round(receivablesTurnover * 100) / 100,
      assetTurnover: Math.round(assetTurnover * 100) / 100,
      daysInInventory: Math.round(daysInInventory),
      daysInReceivables: Math.round(daysInReceivables)
    },
    leverage: {
      debtToAsset: Math.round(debtToAsset * 100) / 100,
      debtToEquity: Math.round(debtToEquity * 100) / 100,
      equityRatio: Math.round(equityRatio * 100) / 100
    }
  }
}

/**
 * Calculate cash flow projections
 * @param {Array} transactions - Historical transactions
 * @param {Object} options - Projection options
 * @returns {Object} - Cash flow projection
 */
export const calculateCashFlowProjection = (transactions = [], options = {}) => {
  const {
    periods = 12, // Number of periods to project
    periodType = 'month', // 'day', 'week', 'month', 'quarter'
    growthRate = 0, // Expected growth rate per period
    includeSeasonality = false,
    seasonalityFactors = [] // Array of seasonal factors by period
  } = options

  // Group historical transactions by period
  const historicalData = groupTransactionsByPeriod(transactions, periodType)
  
  // Calculate average cash flow per period
  const periods_data = Object.values(historicalData)
  const averageCashFlow = periods_data.reduce((sum, period) => 
    sum + period.netCashFlow, 0) / periods_data.length

  // Generate projections
  const projections = []
  let cumulativeCashFlow = 0

  for (let i = 1; i <= periods; i++) {
    let projectedCashFlow = averageCashFlow

    // Apply growth rate
    if (growthRate !== 0) {
      projectedCashFlow *= Math.pow(1 + growthRate, i)
    }

    // Apply seasonality
    if (includeSeasonality && seasonalityFactors.length > 0) {
      const seasonalIndex = (i - 1) % seasonalityFactors.length
      projectedCashFlow *= seasonalityFactors[seasonalIndex]
    }

    cumulativeCashFlow += projectedCashFlow

    const currentDate = new Date()
    const projectionDate = new Date(currentDate)

    switch (periodType) {
      case 'day':
        projectionDate.setDate(currentDate.getDate() + i)
        break
      case 'week':
        projectionDate.setDate(currentDate.getDate() + (i * 7))
        break
      case 'month':
        projectionDate.setMonth(currentDate.getMonth() + i)
        break
      case 'quarter':
        projectionDate.setMonth(currentDate.getMonth() + (i * 3))
        break
    }

    projections.push({
      period: i,
      date: projectionDate.toISOString().split('T')[0],
      projectedCashFlow: Math.round(projectedCashFlow),
      cumulativeCashFlow: Math.round(cumulativeCashFlow)
    })
  }

  return {
    projections,
    averageHistoricalCashFlow: Math.round(averageCashFlow),
    totalProjectedCashFlow: Math.round(cumulativeCashFlow),
    growthRate,
    periodType,
    periods
  }
}

/**
 * Calculate break-even analysis
 * @param {Object} options - Break-even calculation options
 * @returns {Object} - Break-even analysis
 */
export const calculateBreakEvenAnalysis = (options = {}) => {
  const {
    fixedCosts = 0,
    variableCostPerUnit = 0,
    sellingPricePerUnit = 0,
    targetProfit = 0
  } = options

  if (sellingPricePerUnit <= variableCostPerUnit) {
    return {
      isValid: false,
      error: 'Selling price must be greater than variable cost per unit',
      breakEvenUnits: 0,
      breakEvenRevenue: 0
    }
  }

  const contributionMarginPerUnit = sellingPricePerUnit - variableCostPerUnit
  const contributionMarginRatio = contributionMarginPerUnit / sellingPricePerUnit

  // Break-even point in units
  const breakEvenUnits = Math.ceil(fixedCosts / contributionMarginPerUnit)
  
  // Break-even point in revenue
  const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit

  // Target profit calculations
  const targetProfitUnits = targetProfit > 0 ? 
    Math.ceil((fixedCosts + targetProfit) / contributionMarginPerUnit) : 0
  const targetProfitRevenue = targetProfitUnits * sellingPricePerUnit

  // Margin of safety
  const marginOfSafetyUnits = options.currentSales ? 
    Math.max(0, (options.currentSales || 0) - breakEvenUnits) : 0
  const marginOfSafetyPercentage = options.currentSales ? 
    (marginOfSafetyUnits / (options.currentSales || 1)) * 100 : 0

  return {
    isValid: true,
    breakEvenUnits,
    breakEvenRevenue,
    contributionMarginPerUnit,
    contributionMarginRatio: Math.round(contributionMarginRatio * 10000) / 100,
    targetProfitUnits,
    targetProfitRevenue,
    marginOfSafetyUnits,
    marginOfSafetyPercentage: Math.round(marginOfSafetyPercentage * 100) / 100,
    analysis: {
      fixedCosts,
      variableCostPerUnit,
      sellingPricePerUnit,
      contributionMargin: contributionMarginPerUnit,
      breakEvenPoint: {
        units: breakEvenUnits,
        revenue: breakEvenRevenue
      }
    }
  }
}

/**
 * Calculate loan payment and schedule
 * @param {Object} options - Loan calculation options
 * @returns {Object} - Loan calculation results
 */
export const calculateLoanPayment = (options = {}) => {
  const {
    principal = 0,
    annualInterestRate = 0,
    termInMonths = 12,
    paymentFrequency = 'monthly' // 'monthly', 'quarterly', 'annually'
  } = options

  if (principal <= 0 || termInMonths <= 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      schedule: []
    }
  }

  // Convert annual rate to period rate
  let periodsPerYear = 12
  switch (paymentFrequency) {
    case 'quarterly':
      periodsPerYear = 4
      break
    case 'annually':
      periodsPerYear = 1
      break
  }

  const periodRate = annualInterestRate / 100 / periodsPerYear
  const numberOfPayments = termInMonths / (12 / periodsPerYear)

  let payment = 0
  if (periodRate > 0) {
    // Calculate payment using PMT formula
    payment = principal * (periodRate * Math.pow(1 + periodRate, numberOfPayments)) /
              (Math.pow(1 + periodRate, numberOfPayments) - 1)
  } else {
    // No interest
    payment = principal / numberOfPayments
  }

  // Generate payment schedule
  const schedule = []
  let remainingBalance = principal
  let totalInterestPaid = 0

  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPayment = remainingBalance * periodRate
    const principalPayment = payment - interestPayment
    remainingBalance -= principalPayment
    totalInterestPaid += interestPayment

    // Adjust last payment for rounding
    if (i === numberOfPayments && remainingBalance !== 0) {
      payment += remainingBalance
      remainingBalance = 0
    }

    schedule.push({
      paymentNumber: i,
      payment: Math.round(payment * 100) / 100,
      principalPayment: Math.round(principalPayment * 100) / 100,
      interestPayment: Math.round(interestPayment * 100) / 100,
      remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100)
    })
  }

  return {
    monthlyPayment: Math.round(payment * 100) / 100,
    totalPayment: Math.round(payment * numberOfPayments * 100) / 100,
    totalInterest: Math.round(totalInterestPaid * 100) / 100,
    schedule,
    loanDetails: {
      principal,
      annualInterestRate,
      termInMonths,
      paymentFrequency,
      numberOfPayments
    }
  }
}

/**
 * Calculate Net Present Value (NPV)
 * @param {Array} cashFlows - Array of cash flows by period
 * @param {number} discountRate - Discount rate (as decimal)
 * @returns {Object} - NPV calculation
 */
export const calculateNPV = (cashFlows = [], discountRate = 0.1) => {
  if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
    return {
      npv: 0,
      presentValues: [],
      totalInvestment: 0,
      totalCashFlows: 0
    }
  }

  const presentValues = cashFlows.map((cashFlow, index) => {
    const period = index
    const presentValue = cashFlow / Math.pow(1 + discountRate, period)
    return {
      period,
      cashFlow,
      presentValue: Math.round(presentValue * 100) / 100
    }
  })

  const npv = presentValues.reduce((sum, pv) => sum + pv.presentValue, 0)
  const totalCashFlows = cashFlows.reduce((sum, cf) => sum + cf, 0)

  return {
    npv: Math.round(npv * 100) / 100,
    presentValues,
    totalInvestment: Math.abs(cashFlows[0] || 0),
    totalCashFlows: Math.round(totalCashFlows * 100) / 100,
    discountRate,
    isPositive: npv > 0
  }
}

/**
 * Group transactions by period
 * @param {Array} transactions - Array of transactions
 * @param {string} periodType - Type of period grouping
 * @returns {Object} - Grouped transactions
 */
const groupTransactionsByPeriod = (transactions, periodType) => {
  const grouped = {}

  transactions.forEach(transaction => {
    const date = new Date(transaction.date || transaction.created_at)
    let key = ''

    switch (periodType) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week': {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      }
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'quarter': {
        const quarter = Math.floor(date.getMonth() / 3) + 1
        key = `${date.getFullYear()}-Q${quarter}`
        break
      }
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        inflow: 0,
        outflow: 0,
        netCashFlow: 0,
        transactions: []
      }
    }

    const amount = transaction.amount || 0
    if (amount > 0) {
      grouped[key].inflow += amount
    } else {
      grouped[key].outflow += Math.abs(amount)
    }

    grouped[key].netCashFlow = grouped[key].inflow - grouped[key].outflow
    grouped[key].transactions.push(transaction)
  })

  return grouped
}
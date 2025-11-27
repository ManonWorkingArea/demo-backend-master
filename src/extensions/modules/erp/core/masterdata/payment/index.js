/**
 * Payment Module Exports
 * ส่งออกฟังก์ชันและค่าคงที่สำหรับโมดูลการชำระเงิน
 */

// Schema exports
export {
  PAYMENT_TYPES,
  PAYMENT_STATUS,
  TRANSACTION_TYPES,
  PAYMENT_METHODS,
  BANK_TYPES,
  CURRENCIES,
  RISK_LEVELS,
  FEE_TYPES,
  REFUND_TYPES,
  REFUND_REASONS,
  INSTALLMENT_TYPES,
  PAYMENT_CHANNELS,
  VERIFICATION_TYPES,
  APPROVAL_LEVELS,
  PAYMENT_CONFIG,
  PAYMENT_DEFAULTS,
  PAYMENT_TEMPLATES,
  PAYMENT_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  BANK_TYPE_LABELS,
  CURRENCY_LABELS,
  RISK_LEVEL_LABELS,
  FEE_TYPE_LABELS,
  REFUND_TYPE_LABELS,
  REFUND_REASON_LABELS,
  INSTALLMENT_TYPE_LABELS,
  PAYMENT_CHANNEL_LABELS,
  VERIFICATION_TYPE_LABELS,
  APPROVAL_LEVEL_LABELS
} from './schema.js'

// Data function exports
export {
  generatePaymentNumber,
  calculatePaymentFee,
  calculateNetAmount,
  calculateInstallmentSchedule,
  validatePayment,
  getRequiredApprovalLevel,
  assessRiskLevel,
  calculateLatePenalty,
  checkPaymentStatus,
  generateReceipt,
  processRefund,
  generatePaymentReport,
  createPaymentFromTemplate,
  formatters,
  filters
} from './data.js'

// Import all for utility object
import * as schema from './schema.js'
import * as data from './data.js'

// Combined utility object for convenience
export const PaymentUtils = {
  // Document management
  generateNumber: data.generatePaymentNumber,
  calculateFee: data.calculatePaymentFee,
  calculateNetAmount: data.calculateNetAmount,
  validate: data.validatePayment,
  
  // Installment management
  calculateInstallmentSchedule: data.calculateInstallmentSchedule,
  
  // Risk and approval
  getRequiredApprovalLevel: data.getRequiredApprovalLevel,
  assessRiskLevel: data.assessRiskLevel,
  
  // Status and penalties
  checkStatus: data.checkPaymentStatus,
  calculateLatePenalty: data.calculateLatePenalty,
  
  // Document generation
  generateReceipt: data.generateReceipt,
  processRefund: data.processRefund,
  generateReport: data.generatePaymentReport,
  
  // Template management
  createFromTemplate: data.createPaymentFromTemplate,
  
  // Formatting and filtering
  formatters: data.formatters,
  filters: data.filters
}

// Re-export everything
export * from './schema.js'
export * from './data.js'
export { PAYMENT_CODE_CONFIG } from './data.js'

// Default export
export default {
  // Constants
  TYPES: schema.PAYMENT_TYPES,
  STATUS: schema.PAYMENT_STATUS,
  TRANSACTION_TYPES: schema.TRANSACTION_TYPES,
  METHODS: schema.PAYMENT_METHODS,
  BANK_TYPES: schema.BANK_TYPES,
  CURRENCIES: schema.CURRENCIES,
  RISK_LEVELS: schema.RISK_LEVELS,
  FEE_TYPES: schema.FEE_TYPES,
  REFUND_TYPES: schema.REFUND_TYPES,
  REFUND_REASONS: schema.REFUND_REASONS,
  INSTALLMENT_TYPES: schema.INSTALLMENT_TYPES,
  PAYMENT_CHANNELS: schema.PAYMENT_CHANNELS,
  VERIFICATION_TYPES: schema.VERIFICATION_TYPES,
  APPROVAL_LEVELS: schema.APPROVAL_LEVELS,
  CONFIG: schema.PAYMENT_CONFIG,
  DEFAULTS: schema.PAYMENT_DEFAULTS,
  TEMPLATES: schema.PAYMENT_TEMPLATES,
  
  // Labels
  TYPE_LABELS: schema.PAYMENT_TYPE_LABELS,
  STATUS_LABELS: schema.PAYMENT_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS: schema.TRANSACTION_TYPE_LABELS,
  METHOD_LABELS: schema.PAYMENT_METHOD_LABELS,
  BANK_TYPE_LABELS: schema.BANK_TYPE_LABELS,
  CURRENCY_LABELS: schema.CURRENCY_LABELS,
  RISK_LEVEL_LABELS: schema.RISK_LEVEL_LABELS,
  FEE_TYPE_LABELS: schema.FEE_TYPE_LABELS,
  REFUND_TYPE_LABELS: schema.REFUND_TYPE_LABELS,
  REFUND_REASON_LABELS: schema.REFUND_REASON_LABELS,
  INSTALLMENT_TYPE_LABELS: schema.INSTALLMENT_TYPE_LABELS,
  PAYMENT_CHANNEL_LABELS: schema.PAYMENT_CHANNEL_LABELS,
  VERIFICATION_TYPE_LABELS: schema.VERIFICATION_TYPE_LABELS,
  APPROVAL_LEVEL_LABELS: schema.APPROVAL_LEVEL_LABELS,
  
  // Utilities
  utils: PaymentUtils
}
// ==========================================
// Delivery Module - Index Configuration
// ==========================================

import { TRANSACTION_TYPES } from '../../../core'
import { ERP_CORE } from '../../../core'
const { delivery, general } = ERP_CORE.utils

// Re-export TRANSACTION_TYPES for components
export { TRANSACTION_TYPES }

// Re-export utils for components
export { delivery as deliveryUtils, general as generalUtils }

// Delivery States Configuration
export const DELIVERY_STATES = {
  SCHEDULED: 'scheduled',
  PICKING: 'picking',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed'
}

// Delivery State Labels (Thai)
export const DELIVERY_STATE_LABELS = {
  [DELIVERY_STATES.SCHEDULED]: 'นัดจัดส่ง',
  [DELIVERY_STATES.PICKING]: 'เบิกสินค้า',
  [DELIVERY_STATES.PACKED]: 'แพ็คแล้ว',
  [DELIVERY_STATES.SHIPPED]: 'ส่งแล้ว',
  [DELIVERY_STATES.DELIVERED]: 'ลูกค้ารับแล้ว',
  [DELIVERY_STATES.COMPLETED]: 'ปิดงาน'
}

// Delivery State Colors
export const DELIVERY_STATE_COLORS = {
  [DELIVERY_STATES.SCHEDULED]: '#6b7280',
  [DELIVERY_STATES.PICKING]: '#3b82f6',
  [DELIVERY_STATES.PACKED]: '#f59e0b',
  [DELIVERY_STATES.SHIPPED]: '#8b5cf6',
  [DELIVERY_STATES.DELIVERED]: '#10b981',
  [DELIVERY_STATES.COMPLETED]: '#059669'
}

// Delivery Module Configuration
export const DELIVERY_MODULE = {
  name: 'delivery',
  title: 'Delivery Management',
  description: 'ระบบจัดการการจัดส่งสินค้า',
  version: '1.0.0',
  transactionType: TRANSACTION_TYPES.DELIVERY,
  states: DELIVERY_STATES,
  stateLabels: DELIVERY_STATE_LABELS,
  stateColors: DELIVERY_STATE_COLORS,
  features: {
    orderFulfillment: true,
    inventoryIntegration: true,
    shippingTracking: true,
    deliveryNotes: true,
    customerNotification: true,
    proofOfDelivery: true,
    multipleShippingMethods: true,
    routeOptimization: true
  }
}

// Shipping Methods (aligned with schema)
export const SHIPPING_METHODS = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
  POST: 'post',
  EMS: 'ems',
  KERRY: 'kerry',
  DHL: 'dhl',
  FEDEX: 'fedex',
  UPS: 'ups',
  TNT: 'tnt',
  FLASH: 'flash',
  J_AND_T: 'j_and_t',
  NINJA_VAN: 'ninja_van',
  SCG: 'scg',
  BEST: 'best'
}

// Shipping Method Labels
export const SHIPPING_METHOD_LABELS = {
  [SHIPPING_METHODS.PICKUP]: 'รับที่หน้าร้าน',
  [SHIPPING_METHODS.DELIVERY]: 'จัดส่ง',
  [SHIPPING_METHODS.POST]: 'ไปรษณีย์',
  [SHIPPING_METHODS.EMS]: 'EMS',
  [SHIPPING_METHODS.KERRY]: 'Kerry Express',
  [SHIPPING_METHODS.DHL]: 'DHL',
  [SHIPPING_METHODS.FEDEX]: 'FedEx',
  [SHIPPING_METHODS.UPS]: 'UPS',
  [SHIPPING_METHODS.TNT]: 'TNT',
  [SHIPPING_METHODS.FLASH]: 'Flash Express',
  [SHIPPING_METHODS.J_AND_T]: 'J&T Express',
  [SHIPPING_METHODS.NINJA_VAN]: 'Ninja Van',
  [SHIPPING_METHODS.SCG]: 'SCG',
  [SHIPPING_METHODS.BEST]: 'Best Express'
}

// Delivery Types (aligned with schema)
export const DELIVERY_TYPES = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  SAME_DAY: 'same_day',
  NEXT_DAY: 'next_day',
  SCHEDULED: 'scheduled',
  BULK: 'bulk',
  PARTIAL: 'partial',
  DIRECT: 'direct',
  TRANSFER: 'transfer'
}

// Delivery Type Labels
export const DELIVERY_TYPE_LABELS = {
  [DELIVERY_TYPES.STANDARD]: 'ปกติ',
  [DELIVERY_TYPES.EXPRESS]: 'ด่วนพิเศษ',
  [DELIVERY_TYPES.SAME_DAY]: 'ส่งวันเดียวกัน',
  [DELIVERY_TYPES.NEXT_DAY]: 'ส่งวันถัดไป',
  [DELIVERY_TYPES.SCHEDULED]: 'กำหนดเวลา',
  [DELIVERY_TYPES.BULK]: 'จัดส่งรวม',
  [DELIVERY_TYPES.PARTIAL]: 'จัดส่งบางส่วน',
  [DELIVERY_TYPES.DIRECT]: 'ส่งตรง',
  [DELIVERY_TYPES.TRANSFER]: 'โอนย้าย'
}

// Delivery Priority
export const DELIVERY_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
}

// Delivery Priority Labels
export const DELIVERY_PRIORITY_LABELS = {
  [DELIVERY_PRIORITY.LOW]: 'ต่ำ',
  [DELIVERY_PRIORITY.NORMAL]: 'ปกติ',
  [DELIVERY_PRIORITY.HIGH]: 'สูง',
  [DELIVERY_PRIORITY.URGENT]: 'เร่งด่วน'
}

// Delivery Status
export const DELIVERY_STATUS = {
  ON_TIME: 'on_time',
  DELAYED: 'delayed',
  EARLY: 'early',
  FAILED: 'failed',
  RETURNED: 'returned'
}

// Delivery Status Labels
export const DELIVERY_STATUS_LABELS = {
  [DELIVERY_STATUS.ON_TIME]: 'ตรงเวลา',
  [DELIVERY_STATUS.DELAYED]: 'ล่าช้า',
  [DELIVERY_STATUS.EARLY]: 'เร็วกว่ากำหนด',
  [DELIVERY_STATUS.FAILED]: 'ส่งไม่สำเร็จ',
  [DELIVERY_STATUS.RETURNED]: 'ส่งคืน'
}

// Package Types
export const PACKAGE_TYPES = {
  BOX: 'box',
  ENVELOPE: 'envelope',
  PALLET: 'pallet',
  BULK: 'bulk',
  FRAGILE: 'fragile'
}

// Package Type Labels
export const PACKAGE_TYPE_LABELS = {
  [PACKAGE_TYPES.BOX]: 'กล่อง',
  [PACKAGE_TYPES.ENVELOPE]: 'ซอง',
  [PACKAGE_TYPES.PALLET]: 'พาเลท',
  [PACKAGE_TYPES.BULK]: 'россып',
  [PACKAGE_TYPES.FRAGILE]: 'ของแตกหักง่าย'
}

// Default Delivery Structure
export const DEFAULT_DELIVERY = {
  id: null,
  deliveryNumber: '',
  salesOrderId: '',
  salesOrderNumber: '',
  customerId: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  deliveryType: DELIVERY_TYPES.STANDARD,
  shippingMethod: SHIPPING_METHODS.DELIVERY,
  priority: DELIVERY_PRIORITY.NORMAL,
  state: DELIVERY_STATES.SCHEDULED,
  status: DELIVERY_STATUS.ON_TIME,
  
  // Addresses
  shippingAddress: {
    name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Thailand',
    phone: '',
    email: ''
  },
  
  billingAddress: {
    name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Thailand',
    phone: '',
    email: ''
  },
  
  // Items
  items: [],
  
  // Scheduling
  scheduledDate: new Date().toISOString().split('T')[0],
  scheduledTime: '',
  estimatedDeliveryDate: null,
  actualDeliveryDate: null,
  
  // Packaging
  packages: [],
  totalWeight: 0,
  totalVolume: 0,
  packageType: PACKAGE_TYPES.BOX,
  
  // Shipping
  trackingNumber: '',
  carrier: '',
  shippingCost: 0,
  shippingNotes: '',
  
  // Delivery
  deliveredBy: '',
  receivedBy: '',
  receivedAt: null,
  deliveryNotes: '',
  proofOfDelivery: null,
  deliveryPhoto: null,
  signature: null,
  
  // Costs
  costs: {
    shippingCost: 0,
    packagingCost: 0,
    handlingCost: 0,
    totalCost: 0
  },
  
  // Metadata
  notes: '',
  internalNotes: '',
  createdBy: '',
  assignedTo: '',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stateHistory: []
}

// Helper Functions using ERP utils
export const createDelivery = (data = {}) => {
  const delivery = { ...DEFAULT_DELIVERY, ...data }
  
  // Auto-generate delivery number if not provided
  if (!delivery.deliveryNumber) {
    delivery.deliveryNumber = general.generateReferenceNumber('DEL')
  }
  
  // Calculate estimated delivery date if not provided
  if (!delivery.estimatedDeliveryDate && delivery.scheduledDate) {
    const scheduledDate = new Date(delivery.scheduledDate)
    const deliveryDays = getDeliveryDays(delivery.shippingMethod, delivery.deliveryType)
    delivery.estimatedDeliveryDate = delivery.calculateDeliveryTime(scheduledDate, deliveryDays).toISOString().split('T')[0]
  }
  
  return delivery
}

// Get delivery days based on shipping method and type
export const getDeliveryDays = (shippingMethod, deliveryType) => {
  const deliveryTimes = {
    [SHIPPING_METHODS.PICKUP]: 0,
    [SHIPPING_METHODS.DELIVERY]: deliveryType === DELIVERY_TYPES.SAME_DAY ? 0 : 1,
    [SHIPPING_METHODS.POST]: 3,
    [SHIPPING_METHODS.EMS]: 1,
    [SHIPPING_METHODS.KERRY]: 1,
    [SHIPPING_METHODS.DHL]: 1,
    [SHIPPING_METHODS.FEDEX]: 1,
    [SHIPPING_METHODS.UPS]: 2,
    [SHIPPING_METHODS.TNT]: 2,
    [SHIPPING_METHODS.FLASH]: 1,
    [SHIPPING_METHODS.J_AND_T]: 2,
    [SHIPPING_METHODS.NINJA_VAN]: 1,
    [SHIPPING_METHODS.SCG]: 3,
    [SHIPPING_METHODS.BEST]: 2
  }
  
  return deliveryTimes[shippingMethod] || 1
}

// Calculate total delivery cost
export const calculateDeliveryCost = (deliveryData) => {
  const { items, shippingAddress, shippingMethod, deliveryType, packages } = deliveryData
  
  // Calculate shipping cost using delivery utils
  const shippingCost = delivery.calculateShippingCost(
    packages.reduce((total, pkg) => total + pkg.weight, 0), // total weight
    packages.reduce((total, pkg) => total + pkg.volume, 0), // total volume
    shippingAddress,
    shippingMethod,
    { deliveryType }
  )
  
  // Calculate packaging cost
  const packagingCost = packages.reduce((total, pkg) => {
    return total + delivery.calculatePackagingCost(pkg.packageType, pkg.weight, pkg.volume)
  }, 0)
  
  // Calculate handling cost (2% of item total or minimum 20 THB)
  const itemTotal = items.reduce((total, item) => total + item.totalPrice, 0)
  const handlingCost = Math.max(itemTotal * 0.02, 20)
  
  const totalCost = shippingCost + packagingCost + handlingCost
  
  return {
    shippingCost,
    packagingCost,
    handlingCost,
    totalCost
  }
}

// State Transition Rules
export const STATE_TRANSITIONS = {
  [DELIVERY_STATES.SCHEDULED]: [DELIVERY_STATES.PICKING],
  [DELIVERY_STATES.PICKING]: [DELIVERY_STATES.PACKED, DELIVERY_STATES.SCHEDULED],
  [DELIVERY_STATES.PACKED]: [DELIVERY_STATES.SHIPPED, DELIVERY_STATES.PICKING],
  [DELIVERY_STATES.SHIPPED]: [DELIVERY_STATES.DELIVERED, DELIVERY_STATES.PACKED],
  [DELIVERY_STATES.DELIVERED]: [DELIVERY_STATES.COMPLETED, DELIVERY_STATES.SHIPPED],
  [DELIVERY_STATES.COMPLETED]: [] // Final state
}

// State Actions
export const STATE_ACTIONS = {
  [DELIVERY_STATES.SCHEDULED]: {
    onEnter: ['validateOrder', 'checkInventory', 'calculateShipping'],
    onExit: []
  },
  [DELIVERY_STATES.PICKING]: {
    onEnter: ['reserveInventory', 'generatePickingList', 'notifyWarehouse'],
    onExit: ['releaseReservation']
  },
  [DELIVERY_STATES.PACKED]: {
    onEnter: ['updatePackaging', 'generateShippingLabel', 'calculateWeight'],
    onExit: ['reversePackaging']
  },
  [DELIVERY_STATES.SHIPPED]: {
    onEnter: ['updateInventory', 'generateTrackingNumber', 'notifyCustomer'],
    onExit: ['reverseInventoryUpdate']
  },
  [DELIVERY_STATES.DELIVERED]: {
    onEnter: ['confirmDelivery', 'updateCustomerOrder', 'collectProofOfDelivery'],
    onExit: ['reverseDeliveryConfirmation']
  },
  [DELIVERY_STATES.COMPLETED]: {
    onEnter: ['generateDeliveryNote', 'finalizeTransaction', 'archiveDocuments'],
    onExit: [] // Cannot exit from completed state
  }
}

// Delivery Item Structure
export const DEFAULT_DELIVERY_ITEM = {
  id: null,
  salesOrderItemId: '',
  productId: '',
  productName: '',
  productCode: '',
  productSku: '',
  orderedQuantity: 0,
  deliveredQuantity: 0,
  backOrderQuantity: 0,
  unitOfMeasure: 'PCS',
  unitPrice: 0,
  totalPrice: 0,
  weight: 0,
  volume: 0,
  batchNumber: '',
  serialNumbers: [],
  expiryDate: null,
  notes: ''
}

// Package Structure
export const DEFAULT_PACKAGE = {
  id: null,
  packageNumber: '',
  packageType: PACKAGE_TYPES.BOX,
  weight: 0,
  volume: 0,
  dimensions: {
    length: 0,
    width: 0,
    height: 0,
    unit: 'cm'
  },
  items: [],
  trackingNumber: '',
  notes: ''
}

// Tracking Event Types
export const TRACKING_EVENT_TYPES = {
  CREATED: 'created',
  PICKED: 'picked',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED_DELIVERY: 'failed_delivery',
  RETURNED: 'returned'
}

// Tracking Event Labels
export const TRACKING_EVENT_LABELS = {
  [TRACKING_EVENT_TYPES.CREATED]: 'สร้างใบจัดส่ง',
  [TRACKING_EVENT_TYPES.PICKED]: 'เบิกสินค้า',
  [TRACKING_EVENT_TYPES.PACKED]: 'แพ็คสินค้า',
  [TRACKING_EVENT_TYPES.SHIPPED]: 'ส่งออกจากคลัง',
  [TRACKING_EVENT_TYPES.IN_TRANSIT]: 'อยู่ระหว่างขนส่ง',
  [TRACKING_EVENT_TYPES.OUT_FOR_DELIVERY]: 'กำลังจัดส่ง',
  [TRACKING_EVENT_TYPES.DELIVERED]: 'ส่งถึงแล้ว',
  [TRACKING_EVENT_TYPES.FAILED_DELIVERY]: 'จัดส่งไม่สำเร็จ',
  [TRACKING_EVENT_TYPES.RETURNED]: 'ส่งคืน'
}

// Delivery Notification Types
export const NOTIFICATION_TYPES = {
  ORDER_CONFIRMED: 'order_confirmed',
  SHIPMENT_CREATED: 'shipment_created',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  DELIVERY_FAILED: 'delivery_failed'
}

// Notification Templates
export const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.ORDER_CONFIRMED]: {
    subject: 'ยืนยันคำสั่งซื้อ #{orderNumber}',
    template: 'order_confirmed'
  },
  [NOTIFICATION_TYPES.SHIPMENT_CREATED]: {
    subject: 'สร้างใบจัดส่ง #{deliveryNumber}',
    template: 'shipment_created'
  },
  [NOTIFICATION_TYPES.PICKED_UP]: {
    subject: 'สินค้าของคุณถูกรับขนส่งแล้ว',
    template: 'picked_up'
  },
  [NOTIFICATION_TYPES.IN_TRANSIT]: {
    subject: 'สินค้าอยู่ระหว่างขนส่ง',
    template: 'in_transit'
  },
  [NOTIFICATION_TYPES.OUT_FOR_DELIVERY]: {
    subject: 'สินค้าจะถึงวันนี้',
    template: 'out_for_delivery'
  },
  [NOTIFICATION_TYPES.DELIVERED]: {
    subject: 'จัดส่งเรียบร้อยแล้ว',
    template: 'delivered'
  },
  [NOTIFICATION_TYPES.DELIVERY_FAILED]: {
    subject: 'การจัดส่งไม่สำเร็จ',
    template: 'delivery_failed'
  }
}

// Export Components
export { default as DeliveryManager } from '../shared/DeliveryManager.vue'

// Export Configuration
export default DELIVERY_MODULE
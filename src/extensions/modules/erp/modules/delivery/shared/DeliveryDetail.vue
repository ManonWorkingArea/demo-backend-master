<template>
  <div class="delivery-detail">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-shipping-fast"></i>
          รายละเอียดใบจัดส่ง
        </h1>
        <div class="header-meta" v-if="delivery">
          <span class="delivery-number">{{ delivery.delivery_number }}</span>
          <span class="divider">•</span>
          <span class="customer">{{ delivery.customer_name }}</span>
          <span class="divider">•</span>
          <span class="workflow-badge">
            <i class="fas fa-route"></i>
            Production → Delivery
          </span>
        </div>
        
        <div class="header-actions">
          <button 
            v-if="delivery && delivery.shipping_label_number" 
            class="btn btn-warning" 
            @click="printShippingLabel"
          >
            <i class="fas fa-print"></i>
            พิมพ์ใบปะหน้า
          </button>
          <button class="btn btn-success" @click="generateReceipt" :disabled="generatingReceipt">
            <i class="fas fa-spinner fa-spin" v-if="generatingReceipt"></i>
            <i class="fas fa-receipt" v-else></i>
            {{ generatingReceipt ? 'กำลังสร้าง...' : 'สร้างใบเสร็จ' }}
          </button>
          <button class="btn btn-info" @click="generateTaxInvoice" :disabled="generatingTaxInvoice">
            <i class="fas fa-spinner fa-spin" v-if="generatingTaxInvoice"></i>
            <i class="fas fa-file-invoice-dollar" v-else></i>
            {{ generatingTaxInvoice ? 'กำลังสร้าง...' : 'สร้างใบกำกับภาษี' }}
          </button>
          <button class="btn btn-outline" @click="printDelivery">
            <i class="fas fa-print"></i>
            พิมพ์ใบจัดส่ง
          </button>
          <button class="btn btn-outline" @click="refreshData">
            <i class="fas fa-refresh"></i>
            รีเฟรช
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>เกิดข้อผิดพลาด</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadDelivery">
        <i class="fas fa-refresh"></i>
        ลองใหม่
      </button>
    </div>

    <!-- Delivery Content -->
    <div v-else-if="delivery" class="delivery-content">
      
      <!-- Status Section -->
      <div class="status-section">
        <div class="current-status">
          <div class="status-badge" :class="'status-' + delivery.status">
            <i class="fas" :class="getStatusIcon(delivery.status)"></i>
            {{ getStatusText(delivery.status) }}
          </div>
          <div class="status-description">
            {{ getStatusDescription(delivery.status) }}
          </div>
          <div v-if="delivery.work_order_number" class="work-order-link">
            <i class="fas fa-link"></i>
            มาจาก Work Order: 
            <a @click="viewWorkOrder" class="link">{{ delivery.work_order_number }}</a>
            <span class="ready-indicator">
              <i class="fas fa-check-circle"></i>
              เตรียมพร้อมจากฝ่าย Production
            </span>
          </div>
        </div>
        
        <div class="status-actions" v-if="availableActions.length > 0">
          <button 
            v-for="action in availableActions" 
            :key="action.key"
            class="btn btn-sm"
            :class="action.class"
            @click="changeStatus(action.status)"
            :disabled="processingStatus"
          >
            <i class="fas" :class="action.icon"></i>
            {{ action.label }}
          </button>
        </div>
      </div>

      <!-- Main Info Grid -->
      <div class="info-grid">
        <!-- Delivery Information -->
        <div class="info-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-truck"></i>
              ข้อมูลการจัดส่ง
            </h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <label>เลขที่ใบจัดส่ง:</label>
              <span class="value">{{ delivery.delivery_number }}</span>
            </div>
            <div class="info-row">
              <label>Work Order:</label>
              <span class="value">
                <a v-if="delivery.work_order_number" 
                   @click="viewWorkOrder" 
                   class="link">
                  {{ delivery.work_order_number }}
                </a>
                <span v-else>-</span>
              </span>
            </div>
            <div class="info-row">
              <label>Sales Order:</label>
              <span class="value">
                <a v-if="delivery.sales_order_number" 
                   @click="viewSalesOrder" 
                   class="link">
                  {{ delivery.sales_order_number }}
                </a>
                <span v-else>-</span>
              </span>
            </div>
            <div class="info-row">
              <label>วันที่สร้าง:</label>
              <span class="value">{{ formatDate(delivery.created_date) }}</span>
            </div>
            <div class="info-row">
              <label>วันที่นัดส่ง:</label>
              <span class="value">{{ formatDate(delivery.scheduled_date) }}</span>
            </div>
            <div class="info-row">
              <label>ประเภทการจัดส่ง:</label>
              <span class="value">{{ getDeliveryTypeText(delivery.delivery_type) }}</span>
            </div>
            <div class="info-row">
              <label>วิธีจัดส่ง:</label>
              <span class="value">{{ getShippingMethodText(delivery.shipping_method) }}</span>
            </div>
            <div class="info-row" v-if="delivery.work_order_completed_date">
              <label>วันที่ Production เสร็จ:</label>
              <span class="value">{{ formatDate(delivery.work_order_completed_date) }}</span>
            </div>
            <div class="info-row" v-if="delivery.items_status">
              <label>สถานะสินค้า:</label>
              <span class="value items-status-badge">
                <i class="fas fa-check-circle"></i>
                เบิกครบทุกรายการ
              </span>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="info-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-user"></i>
              ข้อมูลลูกค้า
            </h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <label>ชื่อลูกค้า:</label>
              <span class="value">{{ delivery.customer_name || 'ไม่ระบุ' }}</span>
            </div>
            <div class="info-row">
              <label>เบอร์โทร:</label>
              <span class="value">{{ delivery.customer_phone || 'ไม่ระบุ' }}</span>
            </div>
            <div class="info-row" v-if="delivery.customer_email">
              <label>อีเมล:</label>
              <span class="value">{{ delivery.customer_email }}</span>
            </div>
            <div class="info-row" v-if="delivery.shipping_address">
              <label>ที่อยู่จัดส่ง:</label>
              <div class="value address">
                <div v-if="delivery.shipping_address.company">{{ delivery.shipping_address.company }}</div>
                <div>{{ delivery.shipping_address.address1 }}</div>
                <div v-if="delivery.shipping_address.address2">{{ delivery.shipping_address.address2 }}</div>
                <div>
                  {{ delivery.shipping_address.city }} 
                  {{ delivery.shipping_address.state }} 
                  {{ delivery.shipping_address.postal_code }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Summary -->
        <div class="info-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-calculator"></i>
              สรุปการเงิน
            </h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <label>มูลค่าสินค้า:</label>
              <span class="value money">฿{{ formatNumber(delivery.total_amount || 0) }}</span>
            </div>
            <div class="info-row">
              <label>ค่าจัดส่ง:</label>
              <span class="value money">
                ฿{{ formatNumber(delivery.shipping_cost || 0) }}
                <small v-if="delivery.shipping_cost !== calculateShippingCost()" style="color: #28a745; margin-left: 8px;">
                  (คำนวณใหม่: ฿{{ formatNumber(calculateShippingCost()) }})
                </small>
              </span>
            </div>
            <div class="info-row">
              <label>ค่าใช้จ่ายรวม:</label>
              <span class="value money">฿{{ formatNumber(getTotalCost()) }}</span>
            </div>
            <div class="info-row total-row">
              <label>รวมทั้งสิ้น:</label>
              <span class="value money total">฿{{ formatNumber(getGrandTotal()) }}</span>
            </div>
          </div>
        </div>

        <!-- Shipping & Tracking Information -->
        <div class="info-card" v-if="delivery.selected_carrier || delivery.tracking_number || delivery.carrier || delivery.shipping_label_number">
          <div class="card-header">
            <h3>
              <i class="fas fa-shipping-fast"></i>
              ข้อมูลการจัดส่ง & ติดตาม
            </h3>
          </div>
          <div class="card-content">
            <div class="info-row" v-if="delivery.selected_carrier">
              <label>บริษัทขนส่งที่เลือก:</label>
              <span class="value carrier-badge">
                <i class="fas fa-truck"></i>
                {{ delivery.selected_carrier }}
              </span>
            </div>
            <div class="info-row" v-if="delivery.shipping_label_number">
              <label>หมายเลขใบปะหน้า:</label>
              <span class="value shipping-label">
                {{ delivery.shipping_label_number }}
                <i class="fas fa-check-circle" style="color: #28a745; margin-left: 8px;" title="พิมพ์แล้ว"></i>
              </span>
            </div>
            <div class="info-row" v-if="delivery.ready_to_ship_date">
              <label>วันที่เตรียมจัดส่ง:</label>
              <span class="value">{{ formatDate(delivery.ready_to_ship_date) }}</span>
            </div>
            <div class="info-row" v-if="delivery.tracking_number">
              <label>Tracking Number:</label>
              <span class="value tracking">{{ delivery.tracking_number }}</span>
            </div>
            <div class="info-row" v-if="delivery.carrier && delivery.carrier !== delivery.selected_carrier">
              <label>บริษัทขนส่ง:</label>
              <span class="value">{{ delivery.carrier }}</span>
            </div>
            <div class="info-row" v-if="delivery.estimated_delivery_date">
              <label>วันที่คาดว่าจะถึง:</label>
              <span class="value">
                {{ formatDate(delivery.estimated_delivery_date) }}
                <div style="font-size: 0.8rem; color: #6c757d; margin-top: 4px;">
                  Utils คำนวณ: {{ calculateEstimatedDeliveryTime()?.estimatedDays || 0 }} วัน
                  ({{ calculateEstimatedDeliveryTime()?.estimatedDate || '-' }})
                </div>
              </span>
            </div>
            <div class="info-row" v-if="delivery.actual_delivery_date">
              <label>วันที่ส่งจริง:</label>
              <span class="value">{{ formatDate(delivery.actual_delivery_date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Production Summary Section -->
      <div v-if="delivery.work_order_id" class="production-summary-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-industry"></i>
            สรุปจากฝ่าย Production
          </h3>
          <div class="section-meta">
            Work Order: {{ delivery.work_order_number }}
          </div>
        </div>
        
        <div class="production-info-grid">
          <div class="production-card">
            <div class="production-icon">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <div class="production-content">
              <h4>Work Order เสร็จสิ้น</h4>
              <p>ฝ่าย Production ได้เบิกสินค้าและเตรียมครบถ้วนแล้ว</p>
              <div class="production-status">
                <i class="fas fa-check-circle"></i>
                สถานะ: ready-to-ship
              </div>
            </div>
          </div>
          
          <div class="production-card">
            <div class="production-icon">
              <i class="fas fa-boxes"></i>
            </div>
            <div class="production-content">
              <h4>สินค้าพร้อมจัดส่ง</h4>
              <p>สต็อคถูกตัดแล้ว สินค้าพร้อมสำหรับจัดส่ง</p>
              <div class="production-status">
                <i class="fas fa-check-circle"></i>
                {{ getItemsCount() }} รายการ เตรียมครบ
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Section -->
      <div class="items-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-box"></i>
            รายการสินค้า
          </h3>
          <div class="section-meta">
            {{ getItemsCount() }} รายการ
          </div>
        </div>
        
        <div class="items-table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>จำนวนสั่ง</th>
                <th>จำนวนเบิก</th>
                <th>จำนวนส่ง</th>
                <th>หน่วย</th>
                <th>ราคา/หน่วย</th>
                <th>รวม</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in getDeliveryItems()" :key="item.id || item.product_id">
                <td>
                  <div class="product-info">
                    <strong>{{ item.product_name || 'ไม่ระบุ' }}</strong>
                    <div v-if="item.product_code" class="product-code">
                      รหัส: {{ item.product_code }}
                    </div>
                  </div>
                </td>
                <td class="quantity">{{ item.quantity || 0 }}</td>
                <td class="picked-quantity">
                  <span class="picked-badge">{{ item.picked_quantity || item.delivery_quantity || 0 }}</span>
                </td>
                <td class="delivery-quantity">{{ item.delivery_quantity || 0 }}</td>
                <td class="unit">{{ item.unit || 'ชิ้น' }}</td>
                <td class="price">฿{{ formatNumber(item.unit_price || 0) }}</td>
                <td class="total">฿{{ formatNumber((item.delivery_quantity || 0) * (item.unit_price || 0)) }}</td>
                <td>
                  <span class="item-status-badge" :class="'item-status-' + (item.status || 'pending')">
                    {{ getItemStatusText(item.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="6"><strong>รวมทั้งหมด:</strong></td>
                <td class="total"><strong>฿{{ formatNumber(delivery.total_amount || 0) }}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Activities Section -->
      <div v-if="delivery.activities && delivery.activities.length > 0" class="activities-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-history"></i>
            กิจกรรม
          </h3>
        </div>
        
        <div class="activities-timeline">
          <div v-for="activity in delivery.activities" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="'activity-' + activity.type">
              <i class="fas" :class="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-content">
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-meta">
                <span class="activity-user">{{ activity.user }}</span>
                <span class="activity-time">{{ formatDateTime(activity.timestamp) }}</span>
              </div>
              <div v-if="activity.notes" class="activity-notes">{{ activity.notes }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents Section -->
      <div class="documents-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-file-alt"></i>
            เอกสารที่เกี่ยวข้อง
          </h3>
        </div>
        
        <div class="documents-grid">
          <div class="document-card" v-if="hasReceipt">
            <div class="document-icon receipt">
              <i class="fas fa-receipt"></i>
            </div>
            <div class="document-info">
              <h4>ใบเสร็จรับเงิน</h4>
              <p>เลขที่: {{ receiptNumber }}</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-outline" @click="viewReceipt">
                  <i class="fas fa-eye"></i>
                  ดู
                </button>
                <button class="btn btn-sm btn-outline" @click="printReceipt">
                  <i class="fas fa-print"></i>
                  พิมพ์
                </button>
              </div>
            </div>
          </div>

          <div class="document-card" v-if="hasTaxInvoice">
            <div class="document-icon tax-invoice">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div class="document-info">
              <h4>ใบกำกับภาษี</h4>
              <p>เลขที่: {{ taxInvoiceNumber }}</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-outline" @click="viewTaxInvoice">
                  <i class="fas fa-eye"></i>
                  ดู
                </button>
                <button class="btn btn-sm btn-outline" @click="printTaxInvoice">
                  <i class="fas fa-print"></i>
                  พิมพ์
                </button>
              </div>
            </div>
          </div>

          <div class="document-card" v-if="hasShippingLabel">
            <div class="document-icon shipping-label">
              <i class="fas fa-shipping-fast"></i>
            </div>
            <div class="document-info">
              <h4>ใบปะหน้า</h4>
              <p>เลขที่: {{ delivery.shipping_label_number }}</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-outline" @click="viewShippingLabel">
                  <i class="fas fa-eye"></i>
                  ดู
                </button>
                <button class="btn btn-sm btn-outline" @click="printShippingLabel">
                  <i class="fas fa-print"></i>
                  พิมพ์
                </button>
              </div>
            </div>
          </div>

          <div class="document-card placeholder" v-if="!hasReceipt">
            <div class="document-icon">
              <i class="fas fa-receipt"></i>
            </div>
            <div class="document-info">
              <h4>ใบเสร็จรับเงิน</h4>
              <p>ยังไม่ได้สร้าง</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-success" @click="generateReceipt" :disabled="generatingReceipt">
                  <i class="fas fa-plus"></i>
                  สร้าง
                </button>
              </div>
            </div>
          </div>

          <div class="document-card placeholder" v-if="!hasTaxInvoice">
            <div class="document-icon">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div class="document-info">
              <h4>ใบกำกับภาษี</h4>
              <p>ยังไม่ได้สร้าง</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-info" @click="generateTaxInvoice" :disabled="generatingTaxInvoice">
                  <i class="fas fa-plus"></i>
                  สร้าง
                </button>
              </div>
            </div>
          </div>

          <div class="document-card placeholder" v-if="!hasShippingLabel">
            <div class="document-icon">
              <i class="fas fa-shipping-fast"></i>
            </div>
            <div class="document-info">
              <h4>ใบปะหน้า</h4>
              <p>ยังไม่ได้สร้าง</p>
              <div class="document-actions">
                <button class="btn btn-sm btn-warning" @click="generateShippingLabel" :disabled="generatingShippingLabel">
                  <i class="fas fa-plus"></i>
                  สร้าง
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div v-if="delivery.notes || delivery.internal_notes" class="notes-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-sticky-note"></i>
            หมายเหตุ
          </h3>
        </div>
        
        <div class="notes-content">
          <div v-if="delivery.notes" class="note-item">
            <label>หมายเหตุทั่วไป:</label>
            <p>{{ delivery.notes }}</p>
          </div>
          <div v-if="delivery.internal_notes" class="note-item">
            <label>หมายเหตุภายใน:</label>
            <p>{{ delivery.internal_notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Change Modal -->
    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>เปลี่ยนสถานะใบจัดส่ง</h3>
          <button class="btn-close" @click="closeStatusModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="status-change-info">
            <p>เปลี่ยนสถานะจาก <strong>{{ getStatusText(delivery.status) }}</strong> 
               เป็น <strong>{{ getStatusText(pendingStatus) }}</strong></p>
          </div>
          
          <div class="form-group">
            <label>หมายเหตุ:</label>
            <textarea 
              v-model="statusNotes"
              class="form-control"
              rows="3"
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeStatusModal">
            ยกเลิก
          </button>
          <button 
            class="btn btn-primary" 
            @click="confirmStatusChange"
            :disabled="processingStatus"
          >
            <i class="fas fa-spinner fa-spin" v-if="processingStatus"></i>
            ยืนยัน
          </button>
        </div>
      </div>
    </div>

    <!-- Receipt Modal -->
    <Teleport to="body" v-if="showReceiptModal">
      <div class="modal-overlay receipt-modal" @click="closeReceiptModal">
        <div class="modal-content large-modal" @click.stop>
          <div class="modal-header">
            <h3>ใบเสร็จรับเงิน</h3>
            <button class="btn-close" @click="closeReceiptModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <ReceiptDocument
              v-if="delivery && receiptNumber"
              :receiptNumber="receiptNumber"
              :delivery="delivery"
              :paymentInfo="paymentInfo"
              @close="closeReceiptModal"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Tax Invoice Modal -->
    <Teleport to="body" v-if="showTaxInvoiceModal">
      <div class="modal-overlay tax-invoice-modal" @click="closeTaxInvoiceModal">
        <div class="modal-content large-modal" @click.stop>
          <div class="modal-header">
            <h3>ใบกำกับภาษี</h3>
            <button class="btn-close" @click="closeTaxInvoiceModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <TaxInvoiceDocument
              v-if="delivery && taxInvoiceNumber"
              :taxInvoiceNumber="taxInvoiceNumber"
              :delivery="delivery"
              :paymentInfo="paymentInfo"
              :vatRate="7"
              @close="closeTaxInvoiceModal"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Shipping Label Modal -->
    <Teleport to="body" v-if="showShippingLabelModal">
      <div class="modal-overlay shipping-label-modal" @click="closeShippingLabelModal">
        <div class="modal-content large-modal" @click.stop>
          <div class="modal-header">
            <h3>ใบปะหน้า / Shipping Label</h3>
            <button class="btn-close" @click="closeShippingLabelModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <ShippingLabelDocument
              v-if="delivery && delivery.shipping_label_number"
              :delivery="delivery"
              @close="closeShippingLabelModal"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TransactionEngine, TRANSACTION_TYPES } from '@/extensions/modules/erp'
import ReceiptDocument from './ReceiptDocument.vue'
import TaxInvoiceDocument from './TaxInvoiceDocument.vue'
import ShippingLabelDocument from './ShippingLabelDocument.vue'

// ใช้ ERP_CORE จาก window (ถูก inject ใน main.js)
const ERP_CORE = window.ERP_CORE
const { delivery: deliveryUtils, general } = ERP_CORE.utils

export default {
  name: 'DeliveryDetail',
  components: {
    ReceiptDocument,
    TaxInvoiceDocument,
    ShippingLabelDocument
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // Core Engine
    const engine = new TransactionEngine('local')
    
    // Reactive State
    const delivery = ref(null)
    const loading = ref(true)
    const error = ref('')
    
    // Status change modal
    const showStatusModal = ref(false)
    const pendingStatus = ref('')
    const statusNotes = ref('')
    const processingStatus = ref(false)
    
    // Document generation
    const generatingReceipt = ref(false)
    const generatingTaxInvoice = ref(false)
    const generatingShippingLabel = ref(false)
    const receiptNumber = ref('')
    const taxInvoiceNumber = ref('')
    const hasReceipt = ref(false)
    const hasTaxInvoice = ref(false)
    const hasShippingLabel = ref(false)
    
    // Document modals
    const showReceiptModal = ref(false)
    const showTaxInvoiceModal = ref(false)
    const showShippingLabelModal = ref(false)
    const paymentInfo = ref({
      method: 'เงินสด',
      date: new Date(),
      reference: '',
      terms: 'ชำระเงินสดทันที'
    })

    // Status definitions with available actions
    const statusDefinitions = {
      'scheduled': {
        label: 'นัดจัดส่ง',
        icon: 'fa-calendar-alt',
        color: '#6c757d',
        description: 'กำหนดวันเวลาจัดส่ง รอเบิกสินค้า',
        actions: ['packed'] // ข้ามไป packed เลย เพราะเบิกแล้วใน production
      },
      'picking': {
        label: 'กำลังเบิกสินค้า',
        icon: 'fa-hand-paper',
        color: '#17a2b8',
        description: 'เบิกสินค้าจาก Work Order ที่เตรียมไว้',
        actions: ['packed', 'scheduled']
      },
      'packed': {
        label: 'แพ็คเรียบร้อย',
        icon: 'fa-box',
        color: '#ffc107',
        description: 'สินค้าพร้อมจัดส่ง - เลือกขนส่งและพิมพ์ใบปะหน้า',
        actions: ['ready_to_ship', 'scheduled']
      },
      'ready_to_ship': {
        label: 'พร้อมจัดส่ง',
        icon: 'fa-truck-loading',
        color: '#17a2b8',
        description: 'เลือกขนส่งแล้ว พิมพ์ใบปะหน้าแล้ว',
        actions: ['shipped', 'packed']
      },
      'shipped': {
        label: 'จัดส่งแล้ว',
        icon: 'fa-shipping-fast',
        color: '#007bff',
        description: 'อยู่ระหว่างขนส่ง มี tracking number',
        actions: ['delivered', 'packed']
      },
      'delivered': {
        label: 'ลูกค้ารับแล้ว',
        icon: 'fa-check-circle',
        color: '#28a745',
        description: 'ลูกค้าเซ็นรับสินค้าเรียบร้อย',
        actions: ['completed']
      },
      'completed': {
        label: 'เสร็จสิ้นทุกขั้นตอน',
        icon: 'fa-flag-checkered',
        color: '#6f42c1',
        description: 'สามารถออกเอกสารและสรุปการเงิน',
        actions: []
      }
    }

    // Available actions based on current status
    const availableActions = computed(() => {
      if (!delivery.value) return []
      
      const currentStatus = statusDefinitions[delivery.value.status]
      if (!currentStatus) return []
      
      return currentStatus.actions.map(actionStatus => ({
        key: actionStatus,
        status: actionStatus,
        label: statusDefinitions[actionStatus].label,
        icon: statusDefinitions[actionStatus].icon,
        class: getActionClass(actionStatus)
      }))
    })

    // Methods
    const loadDelivery = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const deliveryId = route.params.id
        const result = await engine.read(TRANSACTION_TYPES.DELIVERY, deliveryId)
        
        if (result.success) {
          delivery.value = result.data
          
          // ✅ Ensure enum values are valid
          if (delivery.value.delivery_type && !['standard', 'express', 'same_day', 'next_day', 'scheduled', 'bulk', 'partial', 'direct', 'transfer'].includes(delivery.value.delivery_type)) {
            delivery.value.delivery_type = 'standard'
          }
          if (delivery.value.shipping_method && !['pickup', 'delivery', 'post', 'ems', 'kerry', 'dhl', 'fedex', 'ups', 'tnt', 'flash', 'j_and_t', 'ninja_van', 'scg', 'best'].includes(delivery.value.shipping_method)) {
            delivery.value.shipping_method = 'delivery'
          }
          
          // Check for existing documents
          checkExistingDocuments()
          
          console.log('📦 Loaded delivery:', delivery.value)
        } else {
          throw new Error(result.error || 'ไม่พบใบจัดส่งที่ระบุ')
        }
        
      } catch (err) {
        console.error('❌ Error loading delivery:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }

    const checkExistingDocuments = () => {
      // Check if receipt, tax invoice, and shipping label exist
      // This would typically check from a documents service or database
      // For demo purposes, we'll check if they were previously generated
      const deliveryId = delivery.value.id
      
      // Simulate checking for existing documents
      hasReceipt.value = localStorage.getItem('receipt_' + deliveryId) !== null
      hasTaxInvoice.value = localStorage.getItem('tax_invoice_' + deliveryId) !== null
      hasShippingLabel.value = delivery.value.shipping_label_number !== null && delivery.value.shipping_label_number !== undefined
      
      if (hasReceipt.value) {
        receiptNumber.value = localStorage.getItem('receipt_' + deliveryId)
      }
      if (hasTaxInvoice.value) {
        taxInvoiceNumber.value = localStorage.getItem('tax_invoice_' + deliveryId)
      }
    }

    const changeStatus = (newStatus) => {
      pendingStatus.value = newStatus
      statusNotes.value = ''
      showStatusModal.value = true
    }

    const confirmStatusChange = async () => {
      try {
        processingStatus.value = true
        
        const oldStatus = delivery.value.status
        
        // Prepare status-specific data
        let statusSpecificData = {}
        
        if (pendingStatus.value === 'ready_to_ship') {
          // When ready to ship - select carrier and generate shipping label
          const carriers = ['Kerry Express', 'Thailand Post', 'Flash Express', 'J&T Express', 'Ninja Van']
          const selectedCarrier = carriers[Math.floor(Math.random() * carriers.length)]
          const shippingLabelNumber = 'SL' + Date.now()
          
          statusSpecificData = {
            selected_carrier: selectedCarrier,
            shipping_label_number: shippingLabelNumber,
            shipping_label_printed: true,
            ready_to_ship_date: new Date().toISOString().split('T')[0]
          }
        } else if (pendingStatus.value === 'shipped') {
          // Generate tracking number when shipped
          const trackingNumber = 'TH' + Date.now() + Math.floor(Math.random() * 100)
          statusSpecificData = {
            tracking_number: trackingNumber,
            carrier: delivery.value.selected_carrier || 'ขนส่งมาตรฐาน',
            shipped_date: new Date().toISOString().split('T')[0],
            estimated_delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +2 days
          }
        } else if (pendingStatus.value === 'delivered') {
          // Set actual delivery date
          statusSpecificData = {
            actual_delivery_date: new Date().toISOString().split('T')[0],
            delivery_confirmed_by: 'ลูกค้า',
            delivery_time: new Date().toLocaleTimeString('th-TH')
          }
        }
        
        const newActivity = {
          id: Math.random().toString(36).substr(2, 9),
          type: pendingStatus.value,
          description: 'เปลี่ยนสถานะจาก "' + getStatusText(oldStatus) + '" เป็น "' + getStatusText(pendingStatus.value) + '"',
          user: 'ผู้ใช้ปัจจุบัน',
          timestamp: new Date().toISOString(),
          notes: statusNotes.value
        }
        
        // Add specific activity details
        if (pendingStatus.value === 'ready_to_ship' && statusSpecificData.selected_carrier) {
          newActivity.description += ' - ขนส่ง: ' + statusSpecificData.selected_carrier + ', ใบปะหน้า: ' + statusSpecificData.shipping_label_number
        } else if (pendingStatus.value === 'shipped' && statusSpecificData.tracking_number) {
          newActivity.description += ' - Tracking: ' + statusSpecificData.tracking_number
        }
        
        const updatedDelivery = {
          ...delivery.value,
          ...statusSpecificData,
          status: pendingStatus.value,
          updated_date: new Date().toISOString(),
          activities: [...(delivery.value.activities || []), newActivity],
          // ✅ Fix enum values to match schema
          delivery_type: delivery.value.delivery_type || 'standard', // ensure valid enum value
          shipping_method: delivery.value.shipping_method || 'delivery' // ensure valid enum value
        }
        
        if (statusNotes.value) {
          updatedDelivery.notes = (delivery.value.notes || '') + '\n' + 
            '[' + new Date().toLocaleString('th-TH') + '] ' + statusNotes.value
        }
        
        const result = await engine.update(TRANSACTION_TYPES.DELIVERY, delivery.value.id, updatedDelivery)
        
        if (result.success) {
          delivery.value = result.data
          closeStatusModal()
          
          // Show success notification with specific info
          if (pendingStatus.value === 'ready_to_ship' && statusSpecificData.selected_carrier) {
            alert('เตรียมจัดส่งเรียบร้อย!\nขนส่ง: ' + statusSpecificData.selected_carrier + '\nใบปะหน้า: ' + statusSpecificData.shipping_label_number + '\n✅ พิมพ์ใบปะหน้าแล้ว - พร้อมมอบให้ขนส่ง')
          } else if (pendingStatus.value === 'shipped' && statusSpecificData.tracking_number) {
            alert('จัดส่งสำเร็จ!\nTracking Number: ' + statusSpecificData.tracking_number + '\nคาดว่าจะถึงมือลูกค้าใน 2 วันทำการ')
          } else if (pendingStatus.value === 'delivered') {
            alert('ยืนยันการส่งมอบสำเร็จ! ลูกค้าได้รับสินค้าเรียบร้อยแล้ว')
          }
          
          console.log('✅ Status updated successfully:', pendingStatus.value)
        } else {
          throw new Error(result.error || 'ไม่สามารถเปลี่ยนสถานะได้')
        }
        
      } catch (err) {
        console.error('❌ Error updating status:', err)
        alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ: ' + err.message)
      } finally {
        processingStatus.value = false
      }
    }

    const closeStatusModal = () => {
      showStatusModal.value = false
      pendingStatus.value = ''
      statusNotes.value = ''
    }

    const generateReceipt = async () => {
      if (!delivery.value) {
        alert('ไม่พบข้อมูลใบจัดส่ง')
        return
      }
      
      try {
        generatingReceipt.value = true
        
        // Generate receipt through Transaction Engine (จะใช้ Receipt MasterData Schema validation อัตโนมัติ)
        const receiptNum = general.generateReferenceNumber({
          prefix: 'RC',
          includeDate: true,
          length: 4
        })
        
        const receiptData = {
          receipt_number: receiptNum,
          receipt_date: new Date().toISOString(),
          delivery_id: delivery.value.id,
          delivery_number: delivery.value.delivery_number,
          customer_name: delivery.value.customer_name,
          customer_phone: delivery.value.customer_phone,
          customer_email: delivery.value.customer_email,
          customer_address: delivery.value.shipping_address?.address1 || '',
          items: delivery.value.items || [],
          subtotal: delivery.value.total_amount || 0,
          shipping_cost: delivery.value.shipping_cost || 0,
          discount_amount: delivery.value.discount_amount || 0,
          total_amount: (delivery.value.total_amount || 0) + (delivery.value.shipping_cost || 0) - (delivery.value.discount_amount || 0),
          payment_method: 'cash', // ใช้ enum value ที่ถูกต้องตาม Receipt MasterData Schema
          payment_terms: 'ชำระเงินสดทันที',
          payment_date: new Date().toISOString(),
          issued_by: 'ผู้ใช้ปัจจุบัน',
          issued_date: new Date().toISOString(),
          notes: `สร้างจากใบจัดส่ง ${delivery.value.delivery_number}`,
          status: 'issued'
        }
        
        // Log receipt data for debugging
        console.log('Sending receipt data to TransactionEngine:', receiptData)
        
        // Create receipt transaction through Core Engine
        const result = await engine.create(TRANSACTION_TYPES.RECEIPT, receiptData)
        
        if (result.success) {
          // Store receipt information locally (for demo)
          localStorage.setItem(`receipt_${delivery.value.id}`, receiptNum)
          receiptNumber.value = receiptNum
          hasReceipt.value = true
          
          // Set payment info for document components
          paymentInfo.value = {
            method: 'เงินสด',
            date: new Date(),
            reference: result.data.id,
            terms: 'ชำระเงินสดทันที'
          }
          
          // 📝 Update delivery with receipt reference through Core Engine
          const deliveryUpdate = {
            receipt_id: result.data.id,
            receipt_number: receiptNum,
            activities: [...(delivery.value.activities || []), {
              id: Math.random().toString(36).substr(2, 9),
              type: 'receipt_generated',
              description: `สร้างใบเสร็จเลขที่ ${receiptNum} ผ่าน Transaction Engine`,
              user: 'ผู้ใช้ปัจจุบัน',
              timestamp: new Date().toISOString()
            }]
          }
          
          const updateResult = await engine.update(TRANSACTION_TYPES.DELIVERY, delivery.value.id, deliveryUpdate)
          if (updateResult.success) {
            delivery.value = updateResult.data
          }
          
          console.log('✅ Receipt generated through Transaction Engine (using Receipt MasterData):', receiptNum)
          
          // Show success message with receipt details
          alert(`สร้างใบเสร็จสำเร็จ!\nเลขที่: ${receiptNum}\nยอดเงิน: ฿${formatNumber(receiptData.total_amount)}\nวิธีชำระ: ${getPaymentMethodText(receiptData.payment_method)}`)
          
          // Auto open receipt modal
          showReceiptModal.value = true
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้างใบเสร็จได้')
        }
        
      } catch (err) {
        console.error('❌ Error generating receipt:', err)
        alert('เกิดข้อผิดพลาดในการสร้างใบเสร็จ: ' + err.message)
      } finally {
        generatingReceipt.value = false
      }
    }

    const generateTaxInvoice = async () => {
      if (!delivery.value) {
        alert('ไม่พบข้อมูลใบจัดส่ง')
        return
      }
      
      try {
        generatingTaxInvoice.value = true
        
        // 🧾 Generate tax invoice through Transaction Engine (จะใช้ Tax Invoice MasterData Schema validation อัตโนมัติ)
        const taxInvoiceNum = general.generateReferenceNumber({
          prefix: 'TAX',
          includeDate: true,
          length: 4
        })
        
        // Prepare customer address
        const customerAddress = delivery.value.shipping_address ? {
          address: delivery.value.shipping_address.address1 || '',
          district: delivery.value.shipping_address.district || '',
          amphoe: delivery.value.shipping_address.amphoe || '',
          province: delivery.value.shipping_address.province || '',
          postal_code: delivery.value.shipping_address.postal_code || ''
        } : {}
        
        // Calculate VAT (7%)
        const subtotal = delivery.value.total_amount || 0
        const shippingCost = delivery.value.shipping_cost || 0
        const discountAmount = delivery.value.discount_amount || 0
        const netTotal = subtotal + shippingCost - discountAmount
        const vatRate = 7
        const vatAmount = (netTotal * vatRate) / 100
        const grandTotal = netTotal + vatAmount
        
        const taxInvoiceData = {
          tax_invoice_number: taxInvoiceNum,
          tax_invoice_date: new Date().toISOString(),
          delivery_id: delivery.value.id,
          delivery_number: delivery.value.delivery_number,
          customer_name: delivery.value.customer_name,
          customer_phone: delivery.value.customer_phone,
          customer_email: delivery.value.customer_email,
          customer_tax_id: delivery.value.customer_tax_id || '',
          customer_address: customerAddress,
          items: delivery.value.items || [],
          subtotal: subtotal,
          shipping_cost: shippingCost,
          discount_amount: discountAmount,
          net_total: netTotal,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          grand_total: grandTotal,
          vat_type: 'standard', // ใช้ VAT_TYPES.STANDARD enum value
          payment_terms: 'ชำระเงินสดทันที',
          branch_code: '00000', // ใช้ BRANCH_TYPES.HEAD_OFFICE enum value
          issued_by: 'ผู้ใช้ปัจจุบัน',
          issued_date: new Date().toISOString(),
          notes: `สร้างจากใบจัดส่ง ${delivery.value.delivery_number}`,
          status: 'issued'
        }
        
        // 💾 Create tax invoice transaction through Core Engine
        const result = await engine.create(TRANSACTION_TYPES.TAX_INVOICE, taxInvoiceData)
        
        if (result.success) {
          // Store tax invoice information locally (for demo)
          localStorage.setItem(`tax_invoice_${delivery.value.id}`, taxInvoiceNum)
          taxInvoiceNumber.value = taxInvoiceNum
          hasTaxInvoice.value = true
          
          // Set payment info for document components
          paymentInfo.value = {
            method: 'เงินสด',
            date: new Date(),
            reference: result.data.id,
            terms: 'ชำระเงินสดทันที'
          }
          
          // 📝 Update delivery with tax invoice reference through Core Engine
          const deliveryUpdate = {
            tax_invoice_id: result.data.id,
            tax_invoice_number: taxInvoiceNum,
            activities: [...(delivery.value.activities || []), {
              id: Math.random().toString(36).substr(2, 9),
              type: 'tax_invoice_generated',
              description: `สร้างใบกำกับภาษีเลขที่ ${taxInvoiceNum} ผ่าน Transaction Engine`,
              user: 'ผู้ใช้ปัจจุบัน',
              timestamp: new Date().toISOString()
            }]
          }
          
          const updateResult = await engine.update(TRANSACTION_TYPES.DELIVERY, delivery.value.id, deliveryUpdate)
          if (updateResult.success) {
            delivery.value = updateResult.data
          }
          
          console.log('✅ Tax invoice generated through Transaction Engine (using Tax Invoice MasterData):', taxInvoiceNum)
          
          // Show success message with tax invoice details  
          alert(`สร้างใบกำกับภาษีสำเร็จ!\nเลขที่: ${taxInvoiceNum}\nยอดก่อน VAT: ฿${formatNumber(netTotal)}\nVAT ${vatRate}%: ฿${formatNumber(vatAmount)}\nยอดรวม: ฿${formatNumber(grandTotal)}`)
          
          // Auto open tax invoice modal
          showTaxInvoiceModal.value = true
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้างใบกำกับภาษีได้')
        }
        
      } catch (err) {
        console.error('❌ Error generating tax invoice:', err)
        alert('เกิดข้อผิดพลาดในการสร้างใบกำกับภาษี: ' + err.message)
      } finally {
        generatingTaxInvoice.value = false
      }
    }

    const refreshData = () => {
      loadDelivery()
    }

    const printDelivery = () => {
      window.print()
    }

    const printShippingLabel = () => {
      if (!delivery.value.shipping_label_number) {
        alert('ไม่พบหมายเลขใบปะหน้า')
        return
      }
      
      // แสดง modal ใบปะหน้า
      showShippingLabelModal.value = true
      
      console.log('🖨️ Opening shipping label modal:', {
        labelNumber: delivery.value.shipping_label_number,
        carrier: delivery.value.selected_carrier,
        customer: delivery.value.customer_name,
        address: delivery.value.shipping_address
      })
    }

    const viewWorkOrder = () => {
      if (delivery.value.work_order_id) {
        router.push(`/production/work-order/${delivery.value.work_order_id}`)
      }
    }

    const viewSalesOrder = () => {
      if (delivery.value.sales_order_id) {
        router.push(`/sales/sales-order/${delivery.value.sales_order_id}`)
      }
    }

    const viewReceipt = () => {
      if (hasReceipt.value) {
        showReceiptModal.value = true
      }
    }

    const printReceipt = () => {
      if (hasReceipt.value) {
        showReceiptModal.value = true
        // The ReceiptDocument component will handle printing
      }
    }

    const viewTaxInvoice = () => {
      if (hasTaxInvoice.value) {
        showTaxInvoiceModal.value = true
      }
    }

    const printTaxInvoice = () => {
      if (hasTaxInvoice.value) {
        showTaxInvoiceModal.value = true
        // The TaxInvoiceDocument component will handle printing
      }
    }

    const closeReceiptModal = () => {
      showReceiptModal.value = false
    }

    const closeTaxInvoiceModal = () => {
      showTaxInvoiceModal.value = false
    }

    const closeShippingLabelModal = () => {
      showShippingLabelModal.value = false
    }

    const generateShippingLabel = async () => {
      if (!delivery.value) {
        alert('ไม่พบข้อมูลใบจัดส่ง')
        return
      }

      try {
        generatingShippingLabel.value = true

        // Generate shipping label using utils
        const labelNumber = general.generateReferenceNumber({
          prefix: 'SL',
          includeDate: true,
          length: 4
        })
        const trackingNumber = general.generateReferenceNumber({
          prefix: 'TH',
          includeDate: false,
          length: 8
        })

        // Update delivery with shipping label info
        const deliveryUpdate = {
          shipping_label_number: labelNumber,
          tracking_number: trackingNumber,
          shipping_label_printed: true,
          activities: [...(delivery.value.activities || []), {
            id: Math.random().toString(36).substr(2, 9),
            type: 'shipping_label_generated',
            description: `สร้างใบปะหน้าเลขที่ ${labelNumber}`,
            user: 'ผู้ใช้ปัจจุบัน',
            timestamp: new Date().toISOString()
          }]
        }

        const result = await engine.update(TRANSACTION_TYPES.DELIVERY, delivery.value.id, deliveryUpdate)
        
        if (result.success) {
          delivery.value = result.data
          hasShippingLabel.value = true
          
          console.log('✅ Shipping label generated:', labelNumber)
          alert(`สร้างใบปะหน้าสำเร็จ!\nเลขที่: ${labelNumber}\nTracking: ${trackingNumber}`)
          
          // Auto open shipping label modal
          showShippingLabelModal.value = true
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้างใบปะหน้าได้')
        }

      } catch (err) {
        console.error('❌ Error generating shipping label:', err)
        alert('เกิดข้อผิดพลาดในการสร้างใบปะหน้า: ' + err.message)
      } finally {
        generatingShippingLabel.value = false
      }
    }

    const viewShippingLabel = () => {
      if (hasShippingLabel.value) {
        showShippingLabelModal.value = true
      }
    }

    const getDeliveryItems = () => {
      return delivery.value.items || []
    }

    const getItemsCount = () => {
      return getDeliveryItems().length
    }

    const getTotalCost = () => {
      // Use delivery utils to calculate cost breakdown
      if (delivery.value) {
        const costBreakdown = deliveryUtils.calculateDeliveryCostBreakdown(delivery.value)
        return costBreakdown.totalCost
      }
      return 0
    }

    const getGrandTotal = () => {
      return (delivery.value.total_amount || 0) + getTotalCost()
    }

    const getStatusText = (status) => {
      return statusDefinitions[status]?.label || status
    }

    const getStatusIcon = (status) => {
      return statusDefinitions[status]?.icon || 'fa-question'
    }

    const getStatusDescription = (status) => {
      return statusDefinitions[status]?.description || 'ไม่มีรายละเอียด'
    }

    const getActionClass = (status) => {
      const classMap = {
        'picking': 'btn-info',
        'packed': 'btn-warning',
        'shipped': 'btn-primary',
        'delivered': 'btn-success',
        'completed': 'btn-dark'
      }
      return classMap[status] || 'btn-secondary'
    }

    const getDeliveryTypeText = (type) => {
      const typeMap = {
        'full_delivery': 'ส่งครบ',
        'partial_delivery': 'ส่งบางส่วน'
      }
      return typeMap[type] || type
    }

    const getShippingMethodText = (method) => {
      const methodMap = {
        'standard': 'ปกติ',
        'express': 'ด่วน',
        'internal': 'รถบริษัท'
      }
      return methodMap[method] || method
    }

    const getItemStatusText = (status) => {
      const statusMap = {
        'pending': 'รอดำเนินการ',
        'picked': 'เบิกแล้ว',
        'packed': 'แพ็คแล้ว',
        'delivered': 'ส่งแล้ว'
      }
      return statusMap[status] || status
    }

    const getActivityIcon = (type) => {
      const iconMap = {
        'created': 'fa-plus',
        'picked': 'fa-hand-paper',
        'packed': 'fa-box',
        'ready_to_ship': 'fa-truck-loading',
        'shipped': 'fa-shipping-fast',
        'delivered': 'fa-check-circle',
        'receipt_generated': 'fa-receipt',
        'tax_invoice_generated': 'fa-file-invoice-dollar'
      }
      return iconMap[type] || 'fa-circle'
    }

    // Use ERP Utils for formatting
    const formatDate = (dateString) => {
      return general.formatDate(dateString, 'long')
    }

    // Calculate shipping cost using delivery utils
    const calculateShippingCost = () => {
      if (!delivery.value) return 0
      
      return deliveryUtils.calculateShippingCost({
        shippingMethod: delivery.value.shipping_method || 'delivery',
        deliveryType: delivery.value.delivery_type || 'standard',
        weight: delivery.value.total_weight || 2,
        distance: delivery.value.distance || 15,
        isFragile: delivery.value.has_fragile_items || false,
        isUrgent: delivery.value.priority === 'urgent'
      })
    }

    // Calculate delivery time using delivery utils
    const calculateEstimatedDeliveryTime = () => {
      if (!delivery.value) return null
      
      return deliveryUtils.calculateDeliveryTime({
        shippingMethod: delivery.value.shipping_method || 'delivery',
        deliveryType: delivery.value.delivery_type || 'standard',
        distance: delivery.value.distance || 15
      })
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return dateString
      }
    }

    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(number || 0)
    }

    // Helper function to convert payment method enum to Thai text
    const getPaymentMethodText = (method) => {
      const methodMap = {
        'cash': 'เงินสด',
        'bank_transfer': 'โอนเงิน',
        'credit_card': 'บัตรเครดิต',
        'debit_card': 'บัตรเดบิต',
        'cheque': 'เช็ค',
        'promissory_note': 'ตั๋วเงิน'
      }
      return methodMap[method] || method
    }



    // Lifecycle
    onMounted(() => {
      loadDelivery()
    })

    return {
      // Data
      delivery,
      loading,
      error,
      showStatusModal,
      pendingStatus,
      statusNotes,
      processingStatus,
      generatingReceipt,
      generatingTaxInvoice,
      receiptNumber,
      taxInvoiceNumber,
      hasReceipt,
      hasTaxInvoice,
      showReceiptModal,
      showTaxInvoiceModal,
      showShippingLabelModal,
      generatingShippingLabel,
      hasShippingLabel,
      paymentInfo,
      
      // Computed
      availableActions,
      
      // Methods
      loadDelivery,
      changeStatus,
      confirmStatusChange,
      closeStatusModal,
      generateReceipt,
      generateTaxInvoice,
      refreshData,
      printDelivery,
      viewWorkOrder,
      viewSalesOrder,
      viewReceipt,
      printReceipt,
      viewTaxInvoice,
      printTaxInvoice,
      closeReceiptModal,
      closeTaxInvoiceModal,
      closeShippingLabelModal,
      generateShippingLabel,
      viewShippingLabel,
      getDeliveryItems,
      getItemsCount,
      getTotalCost,
      getGrandTotal,
      getStatusText,
      getStatusIcon,
      getStatusDescription,
      printShippingLabel,
      getDeliveryTypeText,
      getShippingMethodText,
      getItemStatusText,
      getActivityIcon,
      formatDate,
      formatDateTime,
      formatNumber,
      getPaymentMethodText,
      calculateShippingCost,
      calculateEstimatedDeliveryTime
    }
  }
}
</script>

<style scoped>
.delivery-detail {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h1 i {
  color: #e67e22;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.delivery-number {
  font-weight: 600;
  color: #2c3e50;
}

.workflow-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.divider {
  color: #bdc3c7;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Status Section */
.status-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
}

.status-scheduled {
  background: #f8f9fa;
  color: #6c757d;
}

.status-picking {
  background: #d4edda;
  color: #155724;
}

.status-packed {
  background: #fff3cd;
  color: #856404;
}

.status-ready_to_ship {
  background: #d1ecf1;
  color: #0c5460;
}

.status-shipped {
  background: #cce5ff;
  color: #004085;
}

.status-delivered {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: #e2e3e5;
  color: #383d41;
}

.status-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.work-order-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 8px;
}

.work-order-link .link {
  font-weight: 600;
  color: #3498db;
}

.ready-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #28a745;
  font-weight: 500;
  margin-left: auto;
}

.ready-indicator i {
  font-size: 0.8rem;
}

.status-actions {
  display: flex;
  gap: 8px;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  background: #f8f9fa;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-content {
  padding: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row label {
  font-weight: 600;
  color: #6c757d;
  min-width: 120px;
  font-size: 0.9rem;
}

.info-row .value {
  color: #2c3e50;
  text-align: right;
  flex: 1;
}

.info-row .value.money {
  font-weight: 600;
  color: #28a745;
}

.info-row .value.tracking {
  font-family: monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.carrier-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.9rem;
}

.shipping-label {
  font-family: monospace;
  background: #e7f3ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  color: #0066cc;
  display: inline-flex;
  align-items: center;
}

.info-row.total-row {
  border-top: 2px solid #e9ecef;
  margin-top: 8px;
  padding-top: 12px;
}

.info-row.total-row .value.total {
  font-size: 1.2rem;
  font-weight: 700;
}

.address {
  text-align: right;
  line-height: 1.4;
}

.link {
  color: #3498db;
  cursor: pointer;
  text-decoration: underline;
}

.link:hover {
  color: #2980b9;
}

.items-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #d4edda;
  color: #155724;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Production Summary Section */
.production-summary-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.production-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.production-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid #28a745;
  transition: transform 0.2s ease;
}

.production-card:hover {
  transform: translateY(-2px);
}

.production-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.production-content h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.production-content p {
  margin: 0 0 12px 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.production-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #28a745;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Items Section */
.items-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-meta {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.items-table-container {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

.items-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f3f4;
}

.items-table tbody tr:hover {
  background: #f8f9fa;
}

.product-info strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 4px;
}

.product-code {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.quantity, .picked-quantity, .delivery-quantity, .unit, .price, .total {
  text-align: center;
}

.picked-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #d1ecf1;
  color: #0c5460;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
}

.price, .total {
  font-weight: 500;
}

.item-status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
}

.item-status-pending {
  background: #f8d7da;
  color: #721c24;
}

.item-status-picked {
  background: #d1ecf1;
  color: #0c5460;
}

.item-status-packed {
  background: #fff3cd;
  color: #856404;
}

.item-status-delivered {
  background: #d4edda;
  color: #155724;
}

.total-row {
  background: #f8f9fa;
  font-size: 1.1rem;
}

.total-row td {
  border-top: 2px solid #e9ecef;
  border-bottom: none;
}

/* Activities Section */
.activities-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.activities-timeline {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f3f4;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.activity-created {
  background: #28a745;
}

.activity-picked {
  background: #17a2b8;
}

.activity-packed {
  background: #ffc107;
  color: #212529;
}

.activity-ready_to_ship {
  background: #17a2b8;
}

.activity-shipped {
  background: #007bff;
}

.activity-delivered {
  background: #28a745;
}

.activity-receipt_generated {
  background: #6f42c1;
}

.activity-tax_invoice_generated {
  background: #fd7e14;
}

.activity-content {
  flex: 1;
}

.activity-description {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 6px;
}

.activity-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 6px;
}

.activity-notes {
  color: #6c757d;
  font-size: 0.9rem;
  font-style: italic;
}

/* Documents Section */
.documents-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.document-card {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.document-card:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.document-card.placeholder {
  border-style: dashed;
  border-color: #bdc3c7;
}

.document-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.document-icon.receipt {
  background: linear-gradient(135deg, #6f42c1 0%, #8e5bbf 100%);
}

.document-icon.tax-invoice {
  background: linear-gradient(135deg, #fd7e14 0%, #fc6c0f 100%);
}

.document-card.placeholder .document-icon {
  background: #f8f9fa;
  color: #bdc3c7;
}

.document-info {
  flex: 1;
}

.document-info h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.document-info p {
  margin: 0 0 12px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.document-actions {
  display: flex;
  gap: 8px;
}

/* Notes Section */
.notes-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.notes-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-item label {
  display: block;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 8px;
}

.note-item p {
  color: #2c3e50;
  line-height: 1.6;
  margin: 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

/* Loading & Error States */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-state i {
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 16px;
}

.error-state i {
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 16px;
}

.loading-state p, .error-state p {
  color: #7f8c8d;
  margin: 8px 0;
}

.error-state h3 {
  color: #2c3e50;
  margin: 0 0 8px 0;
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #138496;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
}

.btn-dark {
  background: #343a40;
  color: white;
}

.btn-dark:hover:not(:disabled) {
  background: #23272b;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.receipt-modal,
.tax-invoice-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-content.large-modal {
  max-width: 90vw;
  max-height: 95vh;
  width: 90vw;
}

.receipt-modal .modal-content,
.tax-invoice-modal .modal-content {
  max-width: 95vw;
  width: 95vw;
  max-height: 98vh;
}

.receipt-modal .modal-body,
.tax-invoice-modal .modal-body {
  padding: 0;
  overflow-y: auto;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.btn-close:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.status-change-info {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .delivery-detail {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .status-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .documents-grid {
    grid-template-columns: 1fr;
  }
  
  .items-table-container {
    overflow-x: scroll;
  }
  
  .items-table {
    min-width: 600px;
  }
  
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
}

/* Print styles */
@media print {
  .header-actions,
  .status-actions,
  .document-actions,
  .modal-overlay {
    display: none !important;
  }
  
  .delivery-detail {
    padding: 0;
    max-width: none;
  }
  
  .page-header,
  .info-card,
  .items-section,
  .activities-section,
  .documents-section,
  .notes-section {
    box-shadow: none;
    border: 1px solid #ddd;
    break-inside: avoid;
  }
}
</style>
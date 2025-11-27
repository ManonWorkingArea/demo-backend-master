<template>
  <div class="pagination-container" :class="containerClasses">
    <!-- Footer Mode Layout -->
    <div v-if="showFooterMode" class="pagination-footer-layout">
      <!-- Statistics in Center -->
      <div class="footer-statistics">
        <span class="footer-summary-text">
          แสดง
          <span class="footer-summary-highlight">{{ startItem }}</span>
          ถึง
          <span class="footer-summary-highlight">{{ endItem }}</span>
          จาก
          <span class="footer-summary-highlight">{{ formatNumber(totalItems) }}</span>
          รายการ
        </span>
      </div>
      
      <!-- Navigation Buttons on Right -->
      <div class="footer-navigation">
        <!-- Previous Button -->
        <button
          @click="handleButtonClick(activePage - 1)"
          :disabled="dataLoading || buttonClicked || activePage === 1"
          :class="buttonClasses('prev')"
          :aria-label="translate('pagination-previous')"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="pagination-icon" />
        </button>

        <!-- Page Info in Center -->
        <div class="footer-page-info">
          <span class="page-current">หน้า {{ activePage }}</span>
          <span class="page-separator">/</span>
          <span class="page-total">{{ totalPages }}</span>
        </div>

        <!-- Next Button -->
        <button
          @click="handleButtonClick(activePage + 1)"
          :disabled="dataLoading || buttonClicked || activePage === totalPages"
          :class="buttonClasses('next')"
          :aria-label="translate('pagination-next')"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="pagination-icon" />
        </button>
      </div>
    </div>

    <!-- Pagination Navigation -->
    <nav v-if="showNavigation" class="pagination-nav" aria-label="Pagination Navigation">
      <!-- Previous Button -->
      <button
        @click="handleButtonClick(activePage - 1)"
        :disabled="dataLoading || buttonClicked || activePage === 1"
        :class="buttonClasses('prev')"
        :aria-label="translate('pagination-previous')"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" class="pagination-icon" />
        <span v-if="showLabels" class="pagination-label">{{ translate('pagination-previous') }}</span>
      </button>

      <!-- First Page -->
      <button
        v-if="shouldShowFirstPage"
        @click="handleButtonClick(1)"
        :disabled="dataLoading || buttonClicked"
        :class="buttonClasses('page')"
        :aria-label="translate('pagination-first-page')"
      >
        1
      </button>

      <!-- First Ellipsis -->
      <span v-if="shouldShowFirstEllipsis" class="pagination-ellipsis">
        <font-awesome-icon :icon="['fas', 'ellipsis-h']" />
      </span>

      <!-- Page Numbers -->
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="handleButtonClick(page)"
        :disabled="dataLoading || buttonClicked"
        :class="buttonClasses('page', page === activePage)"
        :aria-label="translate('pagination-page-n', { page })"
        :aria-current="page === activePage ? 'page' : undefined"
      >
        {{ formatPageNumber(page) }}
      </button>

      <!-- Last Ellipsis -->
      <span v-if="shouldShowLastEllipsis" class="pagination-ellipsis">
        <font-awesome-icon :icon="['fas', 'ellipsis-h']" />
      </span>

      <!-- Last Page -->
      <button
        v-if="shouldShowLastPage"
        @click="handleButtonClick(totalPages)"
        :disabled="dataLoading || buttonClicked"
        :class="buttonClasses('page')"
        :aria-label="translate('pagination-last-page')"
      >
        {{ formatPageNumber(totalPages) }}
      </button>

      <!-- Next Button -->
      <button
        @click="handleButtonClick(activePage + 1)"
        :disabled="dataLoading || buttonClicked || activePage === totalPages"
        :class="buttonClasses('next')"
        :aria-label="translate('pagination-next')"
      >
        <span v-if="showLabels" class="pagination-label">{{ translate('pagination-next') }}</span>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="pagination-icon" />
      </button>
    </nav>

    <!-- Page Size Selector -->
    <div v-if="showPageSizeSelector" class="page-size-selector">
      <label class="page-size-label">{{ translate('pagination-items-per-page') }}</label>
      <select 
        v-model="localLimitItems" 
        @change="handlePageSizeChange"
        class="page-size-select"
        :disabled="dataLoading"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </div>

    <!-- Summary Information -->
    <div v-if="showSummary" class="pagination-summary" role="status" :aria-live="dataLoading ? 'polite' : 'off'">
      <span class="summary-text">
        {{ translate('pagination-showing') }}
        <span class="summary-highlight">{{ startItem }}</span>
        {{ translate('pagination-to') }}
        <span class="summary-highlight">{{ endItem }}</span>
        {{ translate('pagination-of') }}
        <span class="summary-highlight">{{ formatNumber(totalItems) }}</span>
        {{ translate('pagination-items') }}
      </span>
      <span v-if="totalPages > 1" class="summary-pages">
        ({{ translate('pagination-page') }} {{ activePage }} {{ translate('pagination-of') }} {{ formatNumber(totalPages) }})
      </span>
    </div>

    <!-- Jump to Page -->
    <div v-if="showJumpToPage && totalPages > jumpThreshold" class="jump-to-page">
      <label class="jump-label">{{ translate('pagination-go-to-page') }}</label>
      <input
        v-model.number="jumpToPageValue"
        @keyup.enter="handleJumpToPage"
        @blur="handleJumpToPage"
        type="number"
        :min="1"
        :max="totalPages"
        class="jump-input"
        :disabled="dataLoading"
      >
      <button
        @click="handleJumpToPage"
        :disabled="dataLoading || !isValidJumpPage"
        class="jump-button"
      >
        {{ translate('pagination-go') }}
      </button>
    </div>

    <!-- Loading Indicator - ซ่อนใน compact และ footer mode -->
    <div v-if="dataLoading && variant !== 'compact' && displayMode !== 'footer'" class="pagination-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">{{ translate('pagination-loading') }}</span>
    </div>
  </div>
</template>

<script>
import { translate } from '@/plugins/language.js'
import convertUtils from "@/plugins/convertUtils"

export default {
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    limitItems: {
      type: Number,
      required: true,
    },
    dataLoading: {
      type: Boolean,
      default: false,
    },
    displayMode: {
      type: String,
      default: 'full',
      validator: value => ['nav', 'summary', 'full', 'compact', 'footer'].includes(value)
    },
    // New props for enhanced functionality
    showLabels: {
      type: Boolean,
      default: false
    },
    showFirstLast: {
      type: Boolean,
      default: true
    },
    showPageSizeSelector: {
      type: Boolean,
      default: false
    },
    showJumpToPage: {
      type: Boolean,
      default: false
    },
    pageSizeOptions: {
      type: Array,
      default: () => [10, 25, 50, 100]
    },
    visibleRange: {
      type: Number,
      default: 2
    },
    jumpThreshold: {
      type: Number,
      default: 10
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: value => ['default', 'minimal', 'rounded', 'compact'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activePage: this.currentPage,
      buttonClicked: false,
      localLimitItems: this.limitItems,
      jumpToPageValue: this.currentPage
    }
  },
  computed: {
    showNavigation() {
      return ['nav', 'full', 'compact'].includes(this.displayMode)
    },
    showSummary() {
      return ['summary', 'full'].includes(this.displayMode)
    },
    showFooterMode() {
      return this.displayMode === 'footer'
    },
    containerClasses() {
      return {
        [`pagination-${this.size}`]: true,
        'pagination-loading-state': this.dataLoading && this.variant !== 'compact',
        'pagination-disabled': this.disabled,
        'pagination-compact-mode': this.variant === 'compact',
        'pagination-footer-mode': this.displayMode === 'footer'
      }
    },
    visiblePages() {
      const range = this.visibleRange
      const current = this.activePage
      const total = this.totalPages
      
      let start = Math.max(1, current - range)
      let end = Math.min(total, current + range)
      
      // Adjust if we're near the beginning or end
      if (end - start < range * 2) {
        if (start === 1) {
          end = Math.min(total, start + range * 2)
        } else if (end === total) {
          start = Math.max(1, end - range * 2)
        }
      }
      
      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    },
    startItem() {
      if (this.totalItems === 0) return 0
      return (this.activePage - 1) * this.limitItems + 1
    },
    endItem() {
      const calculated = this.activePage * this.limitItems
      return Math.min(calculated, this.totalItems)
    },
    isValidJumpPage() {
      return this.jumpToPageValue >= 1 && 
             this.jumpToPageValue <= this.totalPages && 
             this.jumpToPageValue !== this.activePage
    },
    shouldShowFirstEllipsis() {
      // แสดง ellipsis แรกเมื่อมีหน้าระหว่างหน้า 1 และ visiblePages แรก
      if (this.totalPages <= this.visibleRange * 2 + 3) return false
      const firstVisiblePage = Math.min(...this.visiblePages)
      return firstVisiblePage > 2
    },
    shouldShowLastEllipsis() {
      // แสดง ellipsis สุดท้ายเมื่อมีหน้าระหว่าง visiblePages สุดท้ายและหน้าสุดท้าย
      if (this.totalPages <= this.visibleRange * 2 + 3) return false
      const lastVisiblePage = Math.max(...this.visiblePages)
      return lastVisiblePage < this.totalPages - 1
    },
    shouldShowFirstPage() {
      // แสดงหน้าแรกเมื่อไม่ได้อยู่ใน visiblePages
      return this.totalPages > 1 && !this.visiblePages.includes(1)
    },
    shouldShowLastPage() {
      // แสดงหน้าสุดท้ายเมื่อไม่ได้อยู่ใน visiblePages
      return this.totalPages > 1 && !this.visiblePages.includes(this.totalPages)
    }
  },
  watch: {
    currentPage(newVal) {
      this.activePage = newVal
      this.jumpToPageValue = newVal
    },
    limitItems(newVal) {
      this.localLimitItems = newVal
    }
  },
  methods: {
    translate,
    formatNumber: convertUtils.formatNumber || (num => num.toLocaleString()),
    formatPageNumber(page) {
      // ในโหมด compact ให้แสดงหมายเลขหน้าธรรมดา
      if (this.variant === 'compact') {
        return page.toString()
      }
      return this.size === 'large' ? page.toString() : page.toString().padStart(2, '0')
    },
    buttonClasses(type, isActive = false) {
      const baseClasses = ['pagination-button', `pagination-button-${type}`]
      
      if (isActive) {
        baseClasses.push('pagination-button-active')
      }
      
      if (this.dataLoading || this.disabled) {
        baseClasses.push('pagination-button-disabled')
      }
      
      return baseClasses
    },
    async handleButtonClick(page) {
      if (this.dataLoading || this.buttonClicked || this.disabled) return
      if (page < 1 || page > this.totalPages || page === this.activePage) return

      this.buttonClicked = true
      this.activePage = page

      try {
        this.$emit('page-changed', page)
        await this.$nextTick()
      } finally {
        setTimeout(() => {
          this.buttonClicked = false
        }, 300)
      }
    },
    handlePageSizeChange() {
      this.$emit('page-size-changed', this.localLimitItems)
    },
    handleJumpToPage() {
      if (this.isValidJumpPage) {
        this.handleButtonClick(this.jumpToPageValue)
      }
    }
  }
}
</script>

<style scoped>
/* Pagination Container */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-family: inherit;
}

.pagination-container.pagination-disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Pagination Navigation */
.pagination-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* Button Base Styles */
.pagination-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.pagination-button:hover:not(.pagination-button-disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.pagination-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.pagination-button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Size Variants */
.pagination-small .pagination-button {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
}

.pagination-medium .pagination-button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.5rem;
}

.pagination-large .pagination-button {
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}

/* Button Types */
.pagination-button-prev,
.pagination-button-next {
  gap: 0.5rem;
  min-width: 2.5rem;
}

.pagination-button-page {
  min-width: 2.5rem;
}

.pagination-button-active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
}

.pagination-button-active:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

/* Style Variants */
.pagination-minimal .pagination-button {
  border: none;
  background-color: transparent;
  border-radius: 0.5rem;
}

.pagination-minimal .pagination-button:hover {
  background-color: #f3f4f6;
}

.pagination-minimal .pagination-button-active {
  background-color: #3b82f6;
  color: white;
}

.pagination-rounded .pagination-button {
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
}

.pagination-rounded.pagination-large .pagination-button {
  width: 3rem;
  height: 3rem;
}

/* Icons */
.pagination-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.pagination-label {
  font-size: 0.875rem;
}

/* Ellipsis */
.pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Page Size Selector */
.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.page-size-label {
  color: #6b7280;
  font-weight: 500;
}

.page-size-select {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.page-size-select:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Summary */
.pagination-summary {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.summary-highlight {
  font-weight: 600;
  color: #374151;
}

.summary-pages {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Jump to Page */
.jump-to-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.jump-label {
  color: #6b7280;
  font-weight: 500;
}

.jump-input {
  width: 4rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  text-align: center;
}

.jump-input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.jump-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.jump-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.jump-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading Indicator */
.pagination-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-weight: 500;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Loading State */
.pagination-loading-state {
  opacity: 0.7;
}

.pagination-loading-state .pagination-button {
  pointer-events: none;
}

/* Hide loading elements in compact variant */
.pagination-compact-mode .pagination-loading,
.pagination-compact-mode .loading-spinner,
.pagination-compact-mode .loading-text {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

/* Ensure loading text is not visible */
.pagination-compact-mode [class*="loading"] {
  display: none !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pagination-nav {
    gap: 0.125rem;
  }
  
  .pagination-button {
    min-width: 2rem;
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .pagination-label {
    display: none;
  }
  
  .jump-to-page,
  .page-size-selector {
    flex-direction: column;
    text-align: center;
  }
  
  .pagination-summary {
    font-size: 0.75rem;
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .pagination-container {
    gap: 0.75rem;
  }
  
  .pagination-nav {
    max-width: 100%;
    overflow-x: auto;
    padding: 0.25rem;
  }
  
  .pagination-ellipsis {
    display: none;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .pagination-button {
    background-color: #1f2937;
    border-color: #374151;
    color: #e5e7eb;
  }
  
  .pagination-button:hover:not(.pagination-button-disabled) {
    background-color: #374151;
    border-color: #4b5563;
  }
  
  .pagination-button-active {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
  
  .page-size-select,
  .jump-input {
    background-color: #1f2937;
    border-color: #374151;
    color: #e5e7eb;
  }
  
  .pagination-summary,
  .page-size-label,
  .jump-label {
    color: #d1d5db;
  }
  
  .summary-highlight {
    color: #f3f4f6;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .pagination-button {
    border-width: 2px;
  }
  
  .pagination-button-active {
    border-color: #000;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .pagination-button,
  .loading-spinner {
    transition: none;
    animation: none;
  }
}

/* Compact Variant Styles - Clean & Modern */
.pagination-compact-mode {
  gap: 0.25rem !important;
  padding: 0.5rem !important;
  margin: 0 !important;
  border-radius: 0.5rem !important;
  background: transparent !important;
}

.pagination-compact-mode .pagination-container {
  min-height: auto !important;
  height: auto !important;
  font-size: 0.875rem !important;
}

.pagination-compact-mode .pagination-nav {
  gap: 0.25rem !important;
  flex-wrap: nowrap !important;
  padding: 0 !important;
  margin: 0 !important;
}

.pagination-compact-mode .pagination-button {
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 0.375rem !important;
  border: 1px solid #e5e7eb !important;
  background-color: #ffffff !important;
  color: #6b7280 !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  width: 2.25rem !important;
  height: 2.25rem !important;
  min-width: 2.25rem !important;
  max-width: 2.25rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 0.875rem !important;
  line-height: 1 !important;
  flex-shrink: 0 !important;
  text-decoration: none !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.pagination-compact-mode .pagination-button-prev,
.pagination-compact-mode .pagination-button-next {
  width: 2.25rem !important;
  min-width: 2.25rem !important;
  max-width: 2.25rem !important;
  background: #ffffff !important;
  border-color: #e5e7eb !important;
  color: #6b7280 !important;
}

.pagination-compact-mode .pagination-button:hover:not(.pagination-button-disabled) {
  background-color: #f9fafb !important;
  border-color: #d1d5db !important;
  color: #374151 !important;
  transform: none !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.pagination-compact-mode .pagination-button-active {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
  color: white !important;
  font-weight: 600 !important;
  transform: none !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
}

.pagination-compact-mode .pagination-button-disabled {
  opacity: 0.4 !important;
  cursor: not-allowed !important;
  background-color: #f9fafb !important;
  color: #d1d5db !important;
  border-color: #e5e7eb !important;
  position: relative !important;
  transform: none !important;
  box-shadow: none !important;
}

.pagination-compact-mode.pagination-loading-state .pagination-button {
  pointer-events: none !important;
  position: relative !important;
  opacity: 0.7 !important;
}

.pagination-compact-mode.pagination-loading-state .pagination-button::after {
  content: '' !important;
  position: absolute !important;
  top: 3px !important;
  right: 3px !important;
  width: 4px !important;
  height: 4px !important;
  background: #3b82f6 !important;
  border-radius: 50% !important;
  animation: pulse-dot 1.5s ease-in-out infinite !important;
  opacity: 0.8 !important;
}

@keyframes pulse-dot {
  0%, 100% { 
    transform: scale(0.8); 
    opacity: 0.3; 
  }
  50% { 
    transform: scale(1.2); 
    opacity: 0.8; 
  }
}

.pagination-compact-mode .pagination-ellipsis {
  padding: 0 !important;
  margin: 0 0.25rem !important;
  font-size: 0.875rem !important;
  color: #9ca3af !important;
  width: auto !important;
  min-width: auto !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 2.25rem !important;
}

.pagination-compact-mode .pagination-icon {
  width: 0.875rem !important;
  height: 0.875rem !important;
  flex-shrink: 0 !important;
}

.pagination-compact-mode .pagination-label {
  display: none;
}

.pagination-compact-mode .page-size-selector,
.pagination-compact-mode .pagination-summary,
.pagination-compact-mode .jump-to-page {
  display: none !important;
}

/* Force hide pagination info/summary */
.pagination-compact-mode .pagination-info {
  display: none !important;
}

/* Compact mobile responsive - Clean & Modern */
@media (max-width: 768px) {
  .pagination-compact-mode {
    gap: 0.1875rem !important;
    padding: 0.375rem !important;
  }
  
  .pagination-compact-mode .pagination-button {
    width: 2rem !important;
    height: 2rem !important;
    min-width: 2rem !important;
    max-width: 2rem !important;
    font-size: 0.8125rem !important;
    border-radius: 0.3125rem !important;
  }
  
  .pagination-compact-mode .pagination-button-prev,
  .pagination-compact-mode .pagination-button-next {
    width: 2rem !important;
    min-width: 2rem !important;
    max-width: 2rem !important;
  }
  
  .pagination-compact-mode .pagination-nav {
    gap: 0.1875rem !important;
  }
  
  .pagination-compact-mode .pagination-ellipsis {
    margin: 0 0.1875rem !important;
    font-size: 0.8125rem !important;
    height: 2rem !important;
  }
  
  .pagination-compact-mode .pagination-icon {
    width: 0.8125rem !important;
    height: 0.8125rem !important;
  }
  
  .pagination-compact-mode.pagination-loading-state .pagination-button::after {
    width: 3px !important;
    height: 3px !important;
    top: 2px !important;
    right: 2px !important;
  }
}

@media (max-width: 480px) {
  .pagination-compact-mode {
    gap: 0.125rem !important;
    padding: 0.25rem !important;
  }
  
  .pagination-compact-mode .pagination-button {
    width: 1.75rem !important;
    height: 1.75rem !important;
    min-width: 1.75rem !important;
    max-width: 1.75rem !important;
    font-size: 0.75rem !important;
    border-radius: 0.25rem !important;
  }
  
  .pagination-compact-mode .pagination-button-prev,
  .pagination-compact-mode .pagination-button-next {
    width: 1.75rem !important;
    min-width: 1.75rem !important;
    max-width: 1.75rem !important;
  }
  
  .pagination-compact-mode .pagination-nav {
    gap: 0.125rem !important;
  }
  
  .pagination-compact-mode .pagination-ellipsis {
    margin: 0 0.125rem !important;
    font-size: 0.75rem !important;
    height: 1.75rem !important;
  }
  
  .pagination-compact-mode.pagination-loading-state .pagination-button::after {
    width: 2px !important;
    height: 2px !important;
    top: 1px !important;
    right: 1px !important;
  }
}

/* Footer Mode Styles */
.pagination-footer-mode {
  width: 100% !important;
  gap: 0 !important;
  padding: 0rem 0 !important;
}

/* ซ่อน loading elements ใน footer mode */
.pagination-footer-mode .pagination-loading,
.pagination-footer-mode .loading-spinner,
.pagination-footer-mode .loading-text {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

.pagination-footer-mode [class*="loading"] {
  display: none !important;
}

.pagination-footer-layout {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  position: relative !important;
}

.footer-statistics {
  position: absolute !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 0.875rem !important;
  color: #6b7280 !important;
  white-space: nowrap !important;
  z-index: 1 !important;
}

.footer-summary-text {
  font-weight: 500 !important;
}

.footer-summary-highlight {
  font-weight: 600 !important;
  color: #374151 !important;
}

.footer-navigation {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  margin-left: auto !important;
  z-index: 2 !important;
}

.footer-page-info {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 0.875rem !important;
  color: #6b7280 !important;
  font-weight: 500 !important;
  min-width: 4rem !important;
  padding: 0 0.5rem !important;
  white-space: nowrap !important;
}

.page-current {
  color: #374151 !important;
  font-weight: 600 !important;
}

.page-separator {
  margin: 0 0.25rem !important;
  color: #9ca3af !important;
}

.page-total {
  color: #6b7280 !important;
  font-weight: 500 !important;
}

.pagination-footer-mode .pagination-button {
  width: 2.25rem !important;
  height: 2.25rem !important;
  min-width: 2.25rem !important;
  max-width: 2.25rem !important;
  padding: 0 !important;
  border-radius: 0.375rem !important;
  border: 1px solid #e5e7eb !important;
  background-color: #ffffff !important;
  color: #6b7280 !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.pagination-footer-mode .pagination-button:hover:not(.pagination-button-disabled) {
  background-color: #f9fafb !important;
  border-color: #d1d5db !important;
  color: #374151 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.pagination-footer-mode .pagination-button-disabled {
  opacity: 0.4 !important;
  cursor: not-allowed !important;
  background-color: #f9fafb !important;
  color: #d1d5db !important;
  border-color: #e5e7eb !important;
}

.pagination-footer-mode .pagination-icon {
  width: 0.875rem !important;
  height: 0.875rem !important;
  flex-shrink: 0 !important;
}

/* Footer Mode Responsive */
@media (max-width: 768px) {
  .footer-statistics {
    font-size: 0.8125rem !important;
  }
  
  .pagination-footer-mode .pagination-button {
    width: 2rem !important;
    height: 2rem !important;
    min-width: 2rem !important;
    max-width: 2rem !important;
  }
  
  .footer-navigation {
    gap: 0.375rem !important;
  }
  
  .footer-page-info {
    font-size: 0.8125rem !important;
    min-width: 3.5rem !important;
    padding: 0 0.375rem !important;
  }
  
  .pagination-footer-mode .pagination-icon {
    width: 0.8125rem !important;
    height: 0.8125rem !important;
  }
}

@media (max-width: 480px) {
  .footer-statistics {
    font-size: 0.75rem !important;
    max-width: 60% !important;
    text-align: center !important;
  }
  
  .pagination-footer-mode .pagination-button {
    width: 1.875rem !important;
    height: 1.875rem !important;
    min-width: 1.875rem !important;
    max-width: 1.875rem !important;
  }
  
  .footer-navigation {
    gap: 0.25rem !important;
  }
  
  .footer-page-info {
    font-size: 0.75rem !important;
    min-width: 3rem !important;
    padding: 0 0.25rem !important;
  }
  
  .pagination-footer-mode .pagination-icon {
    width: 0.75rem !important;
    height: 0.75rem !important;
  }
}
</style>

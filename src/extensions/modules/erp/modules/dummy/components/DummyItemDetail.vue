<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Item Details</h1>
            <p class="mt-2 text-gray-600">รายละเอียดของ {{ itemData.name }}</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="editItem"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-edit mr-2"></i>
              Edit
            </button>
            <button 
              @click="duplicateItem"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-copy mr-2"></i>
              Duplicate
            </button>
            <button 
              @click="deleteItem"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-trash mr-2"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="animate-pulse">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-lg p-6">
              <div class="h-6 bg-gray-200 rounded mb-4"></div>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          <div class="space-y-6">
            <div class="bg-white rounded-lg p-6">
              <div class="h-6 bg-gray-200 rounded mb-4"></div>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-medium">{{ itemData.name }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Item Code</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-mono">{{ itemData.code }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ itemData.category }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <span
                      :class="getStatusClass(itemData.status)"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ itemData.status }}
                    </span>
                  </div>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ itemData.description || 'No description provided' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pricing & Inventory -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Pricing & Inventory</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-semibold text-lg">{{ formatCurrency(itemData.price) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Cost Price</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ formatCurrency(itemData.cost_price) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-medium">{{ itemData.stock_quantity }} units</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Technical Specifications -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Technical Specifications</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-for="(value, key) in itemData.specifications" :key="key">
                  <label class="block text-sm font-medium text-gray-700 mb-2 capitalize">{{ key.replace('_', ' ') }}</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ value }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Related Data -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Related Items</h3>
                <span class="text-sm text-gray-500">{{ relatedItems.length }} items</span>
              </div>
            </div>
            <div class="p-6">
              <div v-if="relatedItems.length === 0" class="text-center py-8 text-gray-500">
                <i class="fas fa-box-open text-4xl mb-4 opacity-50"></i>
                <p>No related items found</p>
              </div>
              <div v-else class="space-y-4">
                <div 
                  v-for="item in relatedItems" 
                  :key="item.id"
                  class="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border"
                  @click="viewRelatedItem(item.id)"
                >
                  <div class="bg-blue-100 p-3 rounded-lg">
                    <i class="fas fa-cube text-blue-600"></i>
                  </div>
                  <div class="ml-4 flex-1">
                    <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
                    <p class="text-sm text-gray-500">{{ item.code }} • {{ item.category }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-900">{{ formatCurrency(item.price) }}</p>
                    <p class="text-sm text-gray-500">{{ item.relationship }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status & Actions -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Status & Actions</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="text-center">
                <span
                  :class="getStatusClass(itemData.status)"
                  class="inline-flex px-4 py-2 text-sm font-semibold rounded-full"
                >
                  {{ itemData.status.toUpperCase() }}
                </span>
              </div>
              <div class="space-y-2">
                <button 
                  @click="changeStatus('active')"
                  :disabled="itemData.status === 'active'"
                  class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <i class="fas fa-check mr-2"></i>
                  Activate
                </button>
                <button 
                  @click="changeStatus('inactive')"
                  :disabled="itemData.status === 'inactive'"
                  class="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <i class="fas fa-pause mr-2"></i>
                  Deactivate
                </button>
                <button 
                  @click="archiveItem"
                  class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <i class="fas fa-archive mr-2"></i>
                  Archive
                </button>
              </div>
            </div>
          </div>

          <!-- Meta Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Meta Information</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <p class="text-sm text-gray-600">{{ formatDateTime(itemData.created_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p class="text-sm text-gray-600">{{ formatDateTime(itemData.updated_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <p class="text-sm text-gray-600">{{ itemData.created_by || 'System' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Modified By</label>
                <p class="text-sm text-gray-600">{{ itemData.updated_by || 'System' }}</p>
              </div>
            </div>
          </div>

          <!-- Action History -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Action History</h3>
                <button 
                  @click="refreshHistory"
                  class="text-blue-600 hover:text-blue-700 text-sm"
                >
                  <i class="fas fa-sync-alt mr-1"></i>
                  Refresh
                </button>
              </div>
            </div>
            <div class="p-6">
              <div v-if="actionHistory.length === 0" class="text-center py-4 text-gray-500">
                <i class="fas fa-history text-2xl mb-2 opacity-50"></i>
                <p class="text-sm">No action history</p>
              </div>
              <div v-else class="space-y-4">
                <div 
                  v-for="action in actionHistory" 
                  :key="action.id"
                  class="border-l-4 pl-4 py-2"
                  :class="getActionTypeClass(action.type)"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-900">{{ action.action }}</span>
                    <span class="text-xs text-gray-500">{{ formatDateTime(action.timestamp) }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ action.description }}</p>
                  <p class="text-xs text-gray-500 mt-1">By: {{ action.user }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <h3 class="text-lg font-semibold mb-4">Quick Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm opacity-90">Total Views</span>
                <span class="font-semibold">{{ itemData.view_count || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm opacity-90">Times Sold</span>
                <span class="font-semibold">{{ itemData.sales_count || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm opacity-90">Revenue Generated</span>
                <span class="font-semibold">{{ formatCurrency(itemData.total_revenue || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm opacity-90">Last Sale</span>
                <span class="font-semibold">{{ itemData.last_sale_date ? formatDate(itemData.last_sale_date) : 'Never' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MODULE_UTILS } from '../plugins/index.js'
import { ErpBreadcrumb } from '../../../ui-kit'

export default {
  name: 'DummyItemDetail',
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      // Breadcrumb navigation
      breadcrumbNav: [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Dummy Module', path: '/dummy', icon: 'fas fa-cube' },
        { name: 'Items Management', path: '/dummy/items', icon: 'fas fa-list' },
        { name: 'Item Detail' }
      ],
      
      loading: true,
      itemId: null,
      itemData: {},
      relatedItems: [],
      actionHistory: []
    }
  },

  async mounted() {
    this.itemId = this.$route.params.id
    await this.loadItemData()
  },

  watch: {
    '$route.params.id': {
      handler(newId) {
        if (newId !== this.itemId) {
          this.itemId = newId
          this.loadItemData()
        }
      },
      immediate: false
    }
  },

  methods: {
    async loadItemData() {
      try {
        this.loading = true
        
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Mock item data
        this.itemData = {
          id: this.itemId,
          name: `Sample Item ${this.itemId}`,
          code: `SI-${String(this.itemId).padStart(3, '0')}`,
          category: 'Electronics',
          status: 'active',
          description: 'This is a detailed description of the sample item. It includes various features and specifications that make it unique and valuable.',
          price: 1299.99,
          cost_price: 899.99,
          stock_quantity: 150,
          specifications: {
            weight: '2.5 kg',
            dimensions: '30cm x 20cm x 10cm',
            material: 'Aluminum Alloy',
            warranty: '2 Years',
            color: 'Silver'
          },
          view_count: 1247,
          sales_count: 89,
          total_revenue: 115789.11,
          last_sale_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          created_by: 'John Doe',
          updated_by: 'Jane Smith'
        }

        // Mock related items
        this.relatedItems = [
          {
            id: 2,
            name: 'Related Item 1',
            code: 'SI-002',
            category: 'Electronics',
            price: 899.99,
            relationship: 'Compatible'
          },
          {
            id: 3,
            name: 'Related Item 2',
            code: 'SI-003',
            category: 'Accessories',
            price: 199.99,
            relationship: 'Accessory'
          }
        ]

        // Mock action history
        this.actionHistory = [
          {
            id: 1,
            action: 'Status Changed',
            description: 'Status changed from pending to active',
            type: 'status',
            user: 'Jane Smith',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            id: 2,
            action: 'Price Updated',
            description: 'Unit price updated from $1199.99 to $1299.99',
            type: 'update',
            user: 'John Doe',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            id: 3,
            action: 'Item Created',
            description: 'Item was created in the system',
            type: 'create',
            user: 'System',
            timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        ]
        
      } catch (error) {
        console.error('Error loading item data:', error)
      } finally {
        this.loading = false
      }
    },

    // Actions
    editItem() {
      this.$router.push(`/dummy/items/${this.itemId}/edit`)
    },

    duplicateItem() {
      if (confirm('Are you sure you want to duplicate this item?')) {
        console.log('Duplicate item:', this.itemId)
        alert('Item duplicated successfully!')
      }
    },

    deleteItem() {
      if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        console.log('Delete item:', this.itemId)
        this.$router.push('/dummy/items')
      }
    },

    changeStatus(newStatus) {
      if (confirm(`Are you sure you want to change status to ${newStatus}?`)) {
        this.itemData.status = newStatus
        this.itemData.updated_at = new Date()
        
        // Add to action history
        this.actionHistory.unshift({
          id: Date.now(),
          action: 'Status Changed',
          description: `Status changed to ${newStatus}`,
          type: 'status',
          user: 'Current User',
          timestamp: new Date()
        })
        
        console.log('Status changed to:', newStatus)
      }
    },

    archiveItem() {
      if (confirm('Are you sure you want to archive this item?')) {
        console.log('Archive item:', this.itemId)
        alert('Item archived successfully!')
      }
    },

    refreshHistory() {
      console.log('Refresh action history')
      this.loadItemData()
    },

    viewRelatedItem(itemId) {
      this.$router.push(`/dummy/items/${itemId}`)
    },

    // Utility methods
    formatCurrency(amount) {
      return MODULE_UTILS.formatCurrency(amount)
    },

    formatDate(date) {
      return MODULE_UTILS.formatDate(date)
    },

    formatDateTime(date) {
      return new Date(date).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusClass(status) {
      const statusClasses = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-gray-100 text-gray-800',
        draft: 'bg-blue-100 text-blue-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    },

    getActionTypeClass(type) {
      const typeClasses = {
        create: 'border-green-400',
        update: 'border-blue-400',
        status: 'border-yellow-400',
        delete: 'border-red-400'
      }
      return typeClasses[type] || 'border-gray-400'
    }
  }
}
</script>

<style scoped>
/* Custom animations */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Hover animations */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
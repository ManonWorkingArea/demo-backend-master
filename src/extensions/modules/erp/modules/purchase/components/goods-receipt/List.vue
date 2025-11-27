<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link 
                to="/purchase/dashboard" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Purchase Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Goods Receipt (GRN)</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="goods-receipt-list">
      <h2>Goods Receipt List</h2>
      <!-- Goods Receipt listing component -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoodsReceiptList',
  data() {
    return {
      receipts: []
    }
  }
}
</script>
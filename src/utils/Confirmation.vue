<template>
  <div class="z-20 fixed inset-0 flex items-center justify-center" @keydown.enter="confirmDeletion" @keydown.esc="cancelDeletion" ref="popupContainer" tabindex="0">
    <div class="fixed inset-0 bg-black bg-opacity-50"></div>
    <div class="w-[420px] bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden confirmation-modal" tabindex="0">
      <!-- Modern Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center space-x-2">
          <div :class="[
            'w-6 h-6 rounded-md flex items-center justify-center',
            iconBadgeClass
          ]">
            <font-awesome-icon :icon="iconType" class="h-3 w-3 text-white" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">{{ header }}</h2>
            <p class="text-xs text-gray-500">โปรดยืนยันการดำเนินการ</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-4 py-4">
        <div class="text-sm text-gray-700 leading-relaxed" v-html="message"></div>
      </div>

      <!-- Actions -->
      <div class="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end space-x-2">
        <button 
          @click="cancelDeletion" 
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          ยกเลิก
        </button>
        <button 
          :class="confirmButtonClass" 
          @click="confirmDeletion" 
          class="px-3 py-1.5 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'check']" class="h-3.5 w-3.5 mr-1.5" />
          ตกลง
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    header: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'default' // Default type is 'default'
    }
  },
  mounted() {
    this.$refs.popupContainer.focus();
  },
  computed: {
    iconType() {
      if (this.type === 'warning') {
        return ['fas', 'exclamation-triangle'];
      } else if (this.type === 'success') {
        return ['fas', 'check-circle'];
      } else if (this.type === 'information') {
        return ['fas', 'info-circle'];
      } else {
        return ['fas', 'question-circle'];
      }
    },
    iconBadgeClass() {
      if (this.type === 'warning') {
        return 'bg-red-500';
      } else if (this.type === 'success') {
        return 'bg-green-500';
      } else if (this.type === 'information') {
        return 'bg-blue-500';
      } else {
        return 'bg-gray-500';
      }
    },
    confirmButtonClass() {
      if (this.type === 'warning') {
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      } else if (this.type === 'success') {
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      } else if (this.type === 'information') {
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      } else {
        return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500';
      }
    }
  },
  methods: {
    confirmDeletion() {
      this.$emit('confirm');
    },
    cancelDeletion() {
      this.$emit('cancel');
    }
  }
}
</script>

<style scoped>
.confirmation-modal {
  z-index: 9999;
}
</style>

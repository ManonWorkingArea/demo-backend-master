<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h4 class="text-sm font-medium text-gray-700">ตารางราคาตามช่วงเวลา</h4>
      <button @click="addSchedule" type="button" class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <font-awesome-icon :icon="['fas', 'plus']" class="mr-1" />
        เพิ่มช่วงราคา
      </button>
    </div>

    <div v-if="schedules.length === 0" class="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
      <font-awesome-icon :icon="['fas', 'calendar-alt']" class="text-3xl mb-2" />
      <p>ยังไม่มีตารางราคา คลิกเพิ่มช่วงราคาเพื่อเริ่มต้น</p>
    </div>

    <div v-for="(schedule, index) in schedules" :key="index" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div class="flex justify-between items-start mb-4">
        <h5 class="text-sm font-medium text-gray-800">ช่วงราคาที่ {{ index + 1 }}</h5>
        <button @click="removeSchedule(index)" type="button" class="text-red-500 hover:text-red-700 focus:outline-none">
          <font-awesome-icon :icon="['fas', 'trash']" />
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label :for="'start_date_' + index" class="block text-sm font-medium text-gray-700">วันเริ่มต้น</label>
          <input 
            v-model="schedule.start_date" 
            :id="'start_date_' + index"
            type="date" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
            @change="updateSchedules"
          >
        </div>
        <div>
          <label :for="'end_date_' + index" class="block text-sm font-medium text-gray-700">วันสิ้นสุด</label>
          <input 
            v-model="schedule.end_date" 
            :id="'end_date_' + index"
            type="date" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
            @change="updateSchedules"
          >
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทการลด</label>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center p-2 border border-gray-200 rounded-md">
              <input 
                v-model="schedule.discount_type" 
                :id="'fix_' + index" 
                value="fix" 
                type="radio" 
                class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                @change="updateSchedules"
              >
              <label :for="'fix_' + index" class="ml-2 text-sm font-medium text-gray-900">ราคาคงที่</label>
            </div>
            <div class="flex items-center p-2 border border-gray-200 rounded-md">
              <input 
                v-model="schedule.discount_type" 
                :id="'percent_' + index" 
                value="percent" 
                type="radio" 
                class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                @change="updateSchedules"
              >
              <label :for="'percent_' + index" class="ml-2 text-sm font-medium text-gray-900">เปอร์เซ็นต์</label>
            </div>
          </div>
        </div>
        
        <div>
          <div v-if="schedule.discount_type === 'fix'">
            <label :for="'sale_price_' + index" class="block text-sm font-medium text-gray-700">ราคาขาย</label>
            <input 
              v-model="schedule.sale_price" 
              :id="'sale_price_' + index"
              type="number" 
              step="0.01"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              @input="updateSchedules"
            >
          </div>
          <div v-if="schedule.discount_type === 'percent'">
            <label :for="'discount_percent_' + index" class="block text-sm font-medium text-gray-700">เปอร์เซ็นต์ส่วนลด (%)</label>
            <input 
              v-model="schedule.discount_percent" 
              :id="'discount_percent_' + index"
              type="number" 
              min="0" 
              max="100"
              step="0.01"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
              @input="updateSchedules"
            >
          </div>
        </div>
        
        <div>
          <label :for="'description_' + index" class="block text-sm font-medium text-gray-700">คำอธิบาย (ไม่บังคับ)</label>
          <input 
            v-model="schedule.description" 
            :id="'description_' + index"
            type="text" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
            @input="updateSchedules"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SchedulePrice',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    regularPrice: {
      type: [String, Number],
      default: 0
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      schedules: []
    }
  },
  watch: {
    modelValue: {
      handler(newValue) {
        this.schedules = newValue || []
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    addSchedule() {
      const newSchedule = {
        start_date: '',
        end_date: '',
        discount_type: 'fix',
        sale_price: '',
        discount_percent: '',
        description: ''
      }
      this.schedules.push(newSchedule)
      this.updateSchedules()
    },
    removeSchedule(index) {
      this.schedules.splice(index, 1)
      this.updateSchedules()
    },
    updateSchedules() {
      this.$emit('update:modelValue', this.schedules)
    }
  }
}
</script> 
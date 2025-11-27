<template>
  <div>
    <div v-if="showShortText" class="">
      <Tooltip title="ดูข้อมูลทั้งหมด" size="12">
        <div @click="showFullText = true" class="cursor-pointer bg-blue-600 text-white p-2 rounded-sm text-xs">
          <font-awesome-icon :icon="['fas','square-pen']"/> {{ value.length }} รายการ
        </div>
      </Tooltip>
    </div>
    <div v-else>
      <table class="min-w-full bg-white border-collapse border">
        <thead>
          <tr>
            <th v-for="(header, index) in tableHeaders" :key="index" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in value" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="px-6 py-4 whitespace-nowrap border-b">{{ cell.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <button
      v-if="showShortText && value.length > maxLength"
      @click="showFullText = true"
      class="mt-2 text-center text-blue-500 hover:underline"
    >
      Show More
    </button>

    <div v-if="showFullText" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div class="relative bg-white rounded-sm p-5">
        <div class="grid grid-cols-2 mb-2">
          <span class="font-bold">ข้อมูลทั้งหมด</span>
          <span class="text-right">
            <span class="text-lg text-gray-600 cursor-pointer" @click="closeFullText">&times;</span>
          </span>
        </div>
        
        <div>
          <table class="min-w-full bg-white border-collapse border">
            <thead>
              <tr>
                <th v-for="(header, index) in tableHeaders" :key="index" class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider border-b">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in value" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="px-6 py-4 whitespace-nowrap border-b">{{ cell.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- The rest of your component remains unchanged -->


<script>
import { Tooltip } from '@programic/vue3-tooltip';

export default {
  props: {
    value: {
      type: Array,
      required: true,
    },
    maxLength: {
      type: Number,
      default: 100,
    },
  },
  data() {
    return {
      showShortText: true,
      showFullText: false,
    };
  },
  components: {
    Tooltip
  },
  computed: {
    tableHeaders() {
      // Assuming the first row in the array has the same structure as the others
      const firstRow = this.value[0];
      if (firstRow) {
        return firstRow.map(cell => cell.name);
      }
      return [];
    },
  },
  methods: {
    closeFullText() {
      this.showFullText = false;
    },
  },
};
</script>

<style>
/* No custom styles required with Tailwind CSS */
</style>

<template>
    <div>
      <table class="min-w-full bg-white border-collapse border-t border-b">
        <thead>
          <tr>
            <th v-for="(header, index) in tableHeaders" :key="index" class="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider border-b">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in value" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="px-6 py-4 whitespace-nowrap border-b text-xs text-gray-500">
              <template v-if="cell.type==='select'">{{cell.value.label}}</template>
              <template v-else>{{cell.value}}</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      value: {
        type: Array,
        required: true,
      },
    },
    computed: {
      tableHeaders() {
        const firstRow = this.value[0];
        if (firstRow) {
          return firstRow.map(cell => cell.name);
        }
        return [];
      },
    },
  };
  </script>
  
  <style>
  </style>
  
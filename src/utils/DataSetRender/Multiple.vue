<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 text-sm mt-3">
      <template v-for="(cell, cellIndex) in value" :key="cellIndex">
        <div class="p-2">
          <div class="flex justify-between items-center font-semibold text-gray-800 mb-2">
            <span class="">{{ cell.name }}</span>
            <button @click="toggleEditMode(cell)" v-if="!cell.editMode && session.role==='admin'">
              <font-awesome-icon :icon="['fas', 'pencil']" class="w-3 text-gray-400" />
            </button>
          </div>    
          <template v-if="!cell.editMode">
            <div>
              <span v-if="cell.type === 'select'">{{ cell.value.label }}</span>
              <span v-if="cell.type === 'datetime'">{{ formatThaidate(cell.value) }}</span>
              <span v-if="cell.type === 'input'">{{ cell.value }}</span>
            </div>
          </template>
          <template v-else>
            <div class="relative" >
              <template v-if="cell.master && cell.master.type === 'select'">
                <select v-model="cell.value.value" class="w-full text-gray-500 p-3 text-sm rounded-sm border border-gray-200">
                  <option v-for="option in cell.master.options" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </template>
              <template v-else-if="cell.master && cell.master.type === 'radiobox'">
                <div>
                  <label v-for="option in cell.master.options" :key="option.value">
                    <input type="radio" v-model="cell.value" :value="option.value" class="mr-2">
                    {{ option.label }}
                  </label>
                </div>
              </template>
              <template v-else-if="cell.master && cell.master.type === 'datetime'">
                <div>
                  <datetime :data="cell.master" :item="cell.key" :defaultTime="cell.value" @update:modelValue="handleDatetimeUpdated"/>
                </div>
              </template>
              <template v-else>
                <input type="text" v-model="cell.value" class="w-full text-gray-500 p-3 rounded-sm border border-gray-200"  @keypress.enter="saveCell(cell)">
              </template>
              <button class="bg-gray-300 mt-1 p-2 text-sm rounded-sm text-gray-600" @click="saveCell(cell)">
                <font-awesome-icon :icon="['fas', 'save']" class="w-3 text-gray-600" /> บันทึก
              </button>
            </div>
          </template>
        </div>
      </template>
      
    </div>
  </template>
  
  <script>
  import convertUtils from "@/plugins/convertUtils";
  import storageManager from '@/plugins/storage';
  // Builder
  import datetime from '@/interface/template/builder/form/formDatetimepicker.vue';

  export default {
    props: {
      value: {
        type: Array,
        required: true,
      },
      set: {
        type: String,
        required: true,
      },
    },
    components: {
      datetime
    },
    data() {
        return {
          session: storageManager.get('session'),
          returnData:null,
        };
      },
    methods: {
      formatThaidate(date) {
        return convertUtils.toThaiDatetime(date,'date');
      },
      toggleEditMode(cell) {
        cell.editMode = !cell.editMode;
      },
      handleDatetimeUpdated(data) {
        this.returnData = data
        console.log("handleDatetimeUpdated",data);
      },
      saveCell(cell) {
        console.log(cell.master.type);
        if(cell.master.type==='select' || cell.master.type ==='radiobox') {
          cell.value.label = cell.master.options.find(option => option.value === cell.value.value)?.label || '';
        } else if(cell.master.type==='datetime') {
          cell.value = this.returnData
        }
        cell.editMode = false;
        
        console.log(this.returnData,cell.value);
        this.$emit('set-updated', this.value, this.set);
      }
    }
  };
  </script>
  
  <style>
  </style>
  
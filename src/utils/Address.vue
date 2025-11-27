<template>
    <div>
      <div v-if="showShortText" class="">
        <Tooltip title="ดูที่อยู่เต็ม" size="12">
            <span @click="showFullText = true" class="cursor-pointer">{{ address }}</span>
        </Tooltip>
        
      </div>
      <div v-else>{{ value }}</div>
      <button
        v-if="showShortText && address.length > maxLength"
        @click="showFullText = true"
        class="mt-2 text-center text-blue-500 hover:underline"
      >
        Show More
      </button>
      <div v-if="showFullText" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
        <div class="relative bg-white rounded-sm p-5 w-[500px]">
          <span class="absolute top-2 right-2 text-lg text-gray-600 cursor-pointer" @click="closeFullText">&times;</span>
          <div class="">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2"> <span class="font-bold text-gray-800">รายละเอียดที่อยู่</span></div>
              <div class="pr-20 border-r border-gray-200">
                <p class="text-md text-gray-600"><span class="font-bold">หมู่ที่ </span> {{ value.MOO }} เลขที่ {{ value.NO }}</p>
                <p class="text-md text-gray-600"><span class="font-bold">อาคาร/หมู่บ้าน/สำนักงาน</span> {{ value.BUILDING_TH }}</p>
                <p class="text-md text-gray-600"><span class="font-bold">ถนน</span> {{ value.ROAD_TH }}</p>
                <p class="text-md text-gray-600"><span class="font-bold">ตำบล</span> {{ value.subdistrict }}</p>
              </div>
              <div class="text-right">
                <p class="text-md text-gray-600"><span class="font-bold">อำเภอ</span> {{ value.district }}</p>
                <p class="text-md text-gray-600"><span class="font-bold">จังหวัด</span> {{ value.province }}</p>
                <p class="text-md text-gray-600"><span class="font-bold">รหัสไปรษณีย์</span> {{ value.zipcode }}</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </template>
  
  <script>
  import { Tooltip } from '@programic/vue3-tooltip';
  export default {
    props: {
      value: {
        type: Object,
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
      address() {
        const { province, zipcode } = this.value;
        return `${province}, ${zipcode}`;
      },
    },
    methods: {
      getShortText(text) {
        if (text && text.length > this.maxLength) {
          return text.substring(0, this.maxLength) + '...';
        }
        return text;
      },
      closeFullText() {
        this.showFullText = false;
      },
    },
  };
  </script>
  
  <style>
  /* No custom styles required with Tailwind CSS */
  </style>
  
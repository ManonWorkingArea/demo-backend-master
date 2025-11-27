<script>
import storageManager from '@/plugins/storage';
import debug from '@/plugins/Logger.js';
export default {
  data() {
    return {
      configs: storageManager.get('configs'),
      session: null,
      dataItem: null,
      listItems: [],
    };
  },
  async mounted() {
    try {
      await this.getData();
    } catch (error) {
      debug.log(error);
    }
  },
  methods: {
    descriptionWithoutTags(description) {
      if (description) {
        return description.replace(/<\/?[^>]+(>|$)/g, "");
      }
      return "";
    },
    truncateText(text, maxLength) {
      if (text.length > maxLength) {
        return text.slice(0, maxLength) + "...";
      }
      return text;
    },
    async getData() {
        try {
            // Define the collections we want counts for
            const collections = ["user", "course", "enroll",'certification']; // Adjust collection names as needed

            const resAPI = await fetch(
            "https://gateway.cloudrestfulapi.com/api/multi-count", // Endpoint for multi-count
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                "client-token-key": this.configs.key,
                },
                body: JSON.stringify({ collections }),
            }
            );

            const RestReturn = await resAPI.json();

            if (RestReturn && RestReturn.status) {
            // Assuming RestReturn.counts has the counts keyed by collection name
            this.listItems = RestReturn.counts; // Adjust as needed for display or further processing
            } else {
            console.error("Error retrieving counts:", RestReturn.message);
            }
        } catch (error) {
            console.error("Error in getData:", error);
        }
    },

  },
};
</script>

<template>
    <div>
      <div class="bg-white">
        <div class="mx-auto mt-6 max-w-7xl px-3 lg:px-4">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6">Statistics of FTI Academy</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Total Users Widget -->
            <div class="p-6 bg-indigo-50 rounded-lg shadow-md flex items-center space-x-4">
              <div class="p-4 bg-indigo-200 h-16 w-16 rounded-full text-center">
                <font-awesome-icon :icon="['fas','user']" class="h-6 w-6 text-indigo-600"/>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-700">สมาชิก</h3>
                <p class="text-3xl font-bold text-indigo-600">
                {{ new Intl.NumberFormat('en-US').format(listItems?.user?.allTime) }}
                </p>
                <p class="text-md text-gray-500 mt-1">
                ลงทะเบียนเดือนนี้ {{ new Intl.NumberFormat('en-US').format(listItems?.user?.currentMonth) }} ราย
                </p>                   
              </div>
            </div>
  
            <!-- Revenue Widget -->
            <div class="p-6 bg-green-50 rounded-lg shadow-md flex items-center space-x-4">
              <div class="p-4 bg-green-200 h-16 w-16 rounded-full text-center">
                <font-awesome-icon :icon="['fas','graduation-cap']" class="h-6 w-6 text-green-600"/>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-700">หลักสูตร</h3>
                <p class="text-3xl font-bold text-green-600">
                {{ new Intl.NumberFormat('en-US').format(listItems?.course?.allTime) }}
                </p>
                <p class="text-md text-gray-500 mt-1">
                    หลักสูตรใหม่ {{ new Intl.NumberFormat('en-US').format(listItems?.course?.currentMonth) }} หลักสูตร
                </p>
              </div>
            </div>
  
            <!-- New Signups Widget -->
            <div class="p-6 bg-red-50 rounded-lg shadow-md flex items-center space-x-4">
                <div class="p-4 bg-red-200 h-16 w-16 rounded-full text-center">
                    <font-awesome-icon :icon="['fas','user-graduate']" class="h-6 w-6 text-red-600"/>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-700">จำนวนใบรับรอง</h3>
                    <p class="text-3xl font-bold text-red-600">
                    {{ new Intl.NumberFormat('en-US').format(listItems?.certification?.allTime) }}
                    </p>
                    <p class="text-md text-gray-500 mt-1">
                        ออกใบรับรองล่าสุด {{ new Intl.NumberFormat('en-US').format(listItems?.certification?.currentMonth) }} รายการ
                    </p>
                </div>
              </div>
              
          </div>
        </div>
      </div>
    </div>
  </template>
<script>
import storageManager from '@/plugins/storage';
import debug from '@/plugins/Logger.js';
export default {
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
          configs: storageManager.get('configs'),
          session: null,
          dataItem: null,
          listItems: [],
          isDropdownOpen: false,
          showMockupResults: false,
          searchTerm:'',
          mockupResults: [],
        };
    },
    async mounted() {
        try {
        await this.getData();
        } catch (error) {
        debug.log(error);
        }
    },
    watch: {
      searchTerm() {
        this.showMockupSearchResults();
        this.searchCourse();
      }
    },
    computed: {
      highlightKeywords() {
        return (text) => {
          if (text && this.searchTerm) {
            const words = this.searchTerm.split(/\s+/).filter(Boolean);
            const regex = new RegExp(`(${words.join('|')})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
          }
          return text;
        };
      },
    },
    methods: {
      navigateToCourse(id) {
        this.$router.push(`/lesson/detail/${id}`);
      },
      clearInput() {
        this.searchTerm = '';
      },
      showMockupSearchResults() {
        this.showMockupResults = true;
      },
      descriptionWithoutTags(description) {
        if (description) {
          return description.replace(/<\/?[^>]+(>|$)/g, "");
        }
        return "";
      },
      toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
      },
    truncateText(text, maxLength) {
      if (text.length > maxLength) {
        return text.slice(0, maxLength) + "...";
      }
      return text;
    },
    async searchCourse() {
      try {

        let andConditions = [
          { type: { $ne: "onsite" } },
          { unit: this.configs.siteID, status: true }
        ];

        if (this.searchTerm) {
          andConditions.push({ name: { $regex: this.searchTerm, $options: 'i' } });
        }

        const query = { $and: andConditions };

        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/course/query", {
            method: 'POST',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
                method: 'find',
                args: [query],
            })
        });

        const RestReturn   = await resAPI.json();

        if(resAPI.status===200) {
          this.mockupResults    = RestReturn;
        }
      } catch (error) {
        debug.log(error)
      } finally {
        this.activeBlock  = false;
      }
    },
    async getData() {
      try {
        const baseMatchStage = {
            $match: {
                unit: this.configs.siteID,
                visible: true,
            },
        };

        const pipeline = [];

        if (this.data.categoriesDisplay !== 'all') {
        // Add the category filtering condition if not 'all'
        baseMatchStage.$match['category'] = { $in: [this.data.categoriesCode] };
        }

        pipeline.push(baseMatchStage);

        const resAPI = await fetch('https://gateway.cloudrestfulapi.com/api/category/aggregate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify({ pipeline }),
        });

        const RestReturn = await resAPI.json();
        //debug.log("Get School", RestReturn);

        if (RestReturn) {
          this.listItems = RestReturn;
        }
      } catch (error) {
        debug.log(error);
      }
    },
  },
};
</script>

<template>

    <div class="flex items-center">
        <button @click="toggleDropdown" class="bg-gray-200 px-3 py-2 rounded-md hover:bg-gray-300 focus:outline-none flex items-center" v-if="data.categoriesDropdown">
          <span>หมวดหมู่</span>
          <font-awesome-icon :icon="isDropdownOpen ? ['fas', 'angle-up'] : ['fas', 'angle-down']" class="text-black ml-2 text-sm"/>
        </button>

        <div class="relative ml-4 w-60" v-if="data.categoriesSearch">
            <input
            v-model="searchTerm"
            type="text"
            placeholder="ค้นหา..."
            class="w-60 pl-4 pr-4 py-2 rounded-xs border-2 border-gray-300 focus:border-gray-400 focus:ring-0"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <font-awesome-icon icon="search" class="text-gray-400" />
            </div>

            <div v-if="searchTerm" class="absolute w-96 bg-white border mt-1 border-gray-300 z-50">
              <ul class="">

                <li v-for="(result, index) in mockupResults.slice(0, 5)" :key="index" class="p-2 border-b border-gray-300 hover:bg-gray-100 cursor-pointer" @click.stop="navigateToCourse(result._id)"> 
                  <div class="text-black hover:underline text-base font-semibold"><span v-html="highlightKeywords(result.name)"></span></div>
                  <p class="text-gray-600 text-sm">เรียนได้ {{ result.hours }} ช.ม. | {{ result.days }} วัน</p>
                </li>

                <li class="p-2 bg-indigo-50 border-b border-gray-100 hover:bg-indigo-100 cursor-pointer text-sm" v-if="mockupResults.length>0 && mockupResults.length<6">
                  <p class="text-black font-bold">ผลการค้นหา</p>
                  <p class="text-gray-600">{{ mockupResults.length }} รายการ </p>
                </li>
                <li class="p-2 bg-indigo-50 border-b border-gray-100 hover:bg-indigo-100 cursor-pointer text-sm" v-if="mockupResults.length>0 && mockupResults.length>6">
                  <router-link :to="'/lesson/search/' + searchTerm" class="text-black font-bold hover:underline">ผลการค้นหา</router-link>
                  <p class="text-gray-600">{{ mockupResults.length }} รายการ <span class="float-right text-right font-bold">ดูทั้งหมด</span></p>
                </li>
                <li class="p-1 bg-indigo-50 border-b border-gray-100 hover:bg-indigo-100 cursor-pointer text-sm" v-if="mockupResults.length===0">
                  <p class="text-black font-bold">ผลการค้นหา</p>
                  <p class="text-gray-600">ไม่มีผลการค้นหา</p>
                </li>

              </ul>
            </div>
        </div>

        <router-link to="/lesson/home" class="ml-4 text-blue-500 hover:underline"  v-if="data.categoriesMenu">คอร์สเรียนทั้งหมด</router-link>
    </div>

    <div v-if="isDropdownOpen" class="absolute z-10 top-12 bg-white border border-gray-300 shadow-md max-h-50 overflow-y-auto p-2 rounded-sm">
        <div :class="['grid', 'grid-cols-' + (listItems.length <= 4 ? listItems.length : 4), 'gap-0']">
        <template v-for="(item) in listItems" :key="item._id">
            <div>
                <router-link :to="'/lesson/categories/' + item.code" class="border border-gray-300 flex flex-col h-full p-2 flex-1 block text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    <h2 class="font-semibold text-gray-900 mb-2">{{ item.name }}</h2>
                    {{ item.description }}
                </router-link>
            </div>
        </template>
        </div>
    </div>

</template>

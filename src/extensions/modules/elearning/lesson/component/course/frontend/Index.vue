<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';
import { ref } from 'vue';
import convertUtils from "@/plugins/convertUtils";
import {budget,kind}  from "@/master/type";
import Pagination from '@/utils/Paginated.vue';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';

export default {
	name: 'Lesson Index',
	components: {
    Pagination,
	},
	data() {
		return {
      login: storageManager.get('session','login'),
      configs: storageManager.get('configs'),
      showFilter: false,
      lessons:[],
      categories:[],
      typeData:[],
      budgetData:[],
      displayData:[],
      selectedCategories: [],
      selectedType: [],
      selectedBudget: [],
      limitItem:30,
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      searchTerm:'',
      activeBlock: false,
      processing_text : "กำลังโหลดข้อมูลหมวดหมู่....."
		}
	},
  watch: {
    selectedCategories: {
      handler() {
        this.currentPage=1;
        this.getData();
      },
      deep: true
    },
    selectedType: {
      handler() {
        this.currentPage=1;
        this.getData();
      },
      deep: true
    },
    selectedBudget: {
      handler() {
        this.currentPage=1;
        this.getData();
      },
      deep: true
    },
    searchTerm(newSearchTerm, oldSearchTerm) {
      if (newSearchTerm !== oldSearchTerm) {
        this.currentPage = 1;
        this.getData(newSearchTerm);
      }
    }
  },
	methods: {
    getSubCategories(parentId) {
      return this.categories.filter(category => category.type === 'sub' && category.parent === parentId);
    },
    getCategoryName(code) {
      return this.categoryMap[code] || "";
    },
    getCategoryExists(code) {
      return !!this.categoryMap[code];
    },
    handlePageChanged(page) {
      this.currentPage = page
      this.getData()
    },
    formatPrice(regular,sale) {
        return convertUtils.formatPriceCompact(regular,sale);
    },
    async getData() {
      try {

        this.activeBlock   = true;
        debug.log("Loader Start");

        let andConditions = [
          { type: { $ne: "onsite" } },
          { unit: this.configs.siteID, status: true }
        ];

        if (this.selectedCategories.length > 0) {
          andConditions.push({ category: { $in: this.selectedCategories } });
        }

        if (this.selectedType.length > 0) {
          andConditions.push({ type: { $in: this.selectedType } });
        }

        if (this.selectedBudget.length > 0) {
          if (this.selectedBudget.includes('free')) {
            andConditions.push({ sale_price: '0' });
          }

          if (this.selectedBudget.includes('paid')) {
            andConditions.push({ sale_price: { $ne: '0' } });
          }
        }

        if (this.searchTerm) {
          andConditions.push({ name: { $regex: this.searchTerm, $options: 'i' } });
        }

        const query = { $and: andConditions };

        const resAPI = await Request.POST('course/query', {
          method: 'find',
          args: [query],
          paging: { page: this.currentPage, limit: this.limitItem }
        }, this.configs.key, true);

        const RestReturn = resAPI.data;

        if(resAPI.status===200) {
          const Category        = await this.getCategoryData();

          this.currentPage      = RestReturn.paging.page;
          this.totalPages       = RestReturn.paging.totalPages;
          this.totalItems       = RestReturn.total;
          this.lessons          = RestReturn.data;

          this.categories       = Category;
          this.typeData         = kind
          this.budgetData       = budget
        }
      } catch (error) {
        debug.log(error)
      } finally {
        this.activeBlock  = false;
      }
    },
    async getCategoryData() {
      try {
          this.loading_sources = false;

          const pipeline = [
            {
              $match: {
                unit: this.configs.siteID // Replace 'xxxxx' with the actual value you're filtering by
              }
            },
            {
              $lookup: {
                from: "course",
                localField: "code",
                foreignField: "category",
                as: "courses"
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                code: 1,
                type: 1,
                parent: 1,
                count: { $size: "$courses" }
              }
            }
          ];
          const resAPI      = await Request.POST('category/aggregate', { pipeline }, this.configs.key, true);
          const RestReturn  = resAPI.data;
          return RestReturn
      } catch (error) {
          debug.log(error)
      }
    },
	},
    async mounted () {
      try {
        const categoryId = this.$route.params.id;
        if (categoryId) {
          this.selectedCategories.push(categoryId);
        }
        const keyword = this.$route.params.keyword;
        if (keyword) {
          this.searchTerm = keyword;
        }
        this.getData();
      } catch (error) {
        debug.log(Error);
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
      mainCategories() {
        return this.categories.filter(category => category.type === "main");
      },
      hasSubCategories() {
        return category => {
          const subCategories = this.getSubCategories(category._id);
          return subCategories.length > 0;
        };
      },
      categoryMap() {
        const map = {};
        for (const category of this.categories) {
          map[category.code] = category.name;
        }
        return map;
      },
      filterLessons() {
        return this.lessons.filter((lesson) => {
          // Filter by category
          if (this.selectedCategories.length > 0 && !lesson.category.some((category) => this.selectedCategories.includes(category))) {
            return false;
          }
          
          // Filter by type
          if (this.selectedType.length > 0 && !this.selectedType.includes(lesson.type)) {
            return false;
          }
          
          // Filter by budget
          if (this.selectedBudget.length > 0) {
            const salePrice = Number(lesson.sale_price);
            if (this.selectedBudget.includes('free') && salePrice > 0) {
              return false;
            }

            if (this.selectedBudget.includes('paid') && salePrice === 0) {
              return false;
            }
          }
          // If all conditions are met, return true
          return true;
        });
      },
      loggedInComputed() {
        const login     = storageManager.get('session', 'login');
        const enroll    = storageManager.get('session', 'enroll');

        if (login) {
          return {
            enrollAccess(courseId) {
              if (!enroll || enroll.length === 0) {
                return false;
              }
              const course = enroll.find(item => item.courseID === courseId);
              return !!course;
            }
          };
        } else {
          return {
            enrollAccess() {
              return false;
            }
          };
        }
      },
    },
	setup() {
      const route = useRoute();
      const routeName = route.meta.title;
      useTitle(routeName);

      const expanded0 = ref(true);
      const expanded1 = ref(true);
      const expanded2 = ref(true);

      return {
        expanded0,
        expanded1,
        expanded2,
      };
  }
};
</script>

<template> 

  <div v-if="showFilter" class="relative z-40 lg:hidden" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-black bg-opacity-25"></div>
      <div class="fixed inset-0 z-40 flex">
        <div
          class="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl"
        >
          <div class="flex items-center justify-between px-4">
            <h2 class="text-lg font-medium text-gray-900">Filters</h2>
            <button
              type="button"
              class="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
              @click="showFilter = false"
            >
              <span class="sr-only">Close menu</span>
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form class="m-4 border-t border-gray-200">
            <div class="border-b border-gray-200 py-6">
                <h3 class="-my-3 flow-root">
                  <button 
                    type="button" 
                    class="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500" 
                    @click="expanded0 = !expanded0" :aria-expanded="expanded0" 
                    aria-controls="filter-section-2">

                    <span class="font-semibold text-gray-900">หมวดหมู่หลักสูตร</span>
                    <span class="ml-6 flex items-center">
                      <font-awesome-icon v-if="!expanded0" :icon="['fas', 'plus']" class="h-4 w-4" />
                      <font-awesome-icon v-else :icon="['fas', 'minus']" class="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <div class="pt-6" :id="'filter-section-2'" v-show="expanded0">
                  <div class="space-y-4">
                    <div v-for="category in categories" :key="category._id" class="flex items-center">
                      <input 
                      :id="'filter-size-2-' + category._id" :name="'category-' + category._id" :value="category.code" 
                      type="checkbox" 
                      class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      v-model="selectedCategories" :checked="true">
                      <label :for="'filter-size-2-' + category._id" class="ml-3 text-sm text-gray-600">{{ category.name }}</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="border-b border-gray-200 py-6">
                <h3 class="-my-3 flow-root">

                  <button 
                    type="button" 
                    class="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500" 
                    @click="expanded1 = !expanded1" :aria-expanded="expanded1" 
                    aria-controls="filter-section-2">

                    <span class="font-semibold text-gray-900">ประเภทหลักสูตร</span>
                    <span class="ml-6 flex items-center">
                      <font-awesome-icon v-if="!expanded1" :icon="['fas', 'plus']" class="h-4 w-4" />
                      <font-awesome-icon v-else :icon="['fas', 'minus']" class="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <div class="pt-6" :id="'filter-section-2'" v-show="expanded1">
                  <div class="space-y-4">
                    <div v-for="type in typeData" :key="type.code" class="flex items-center">
                      <input 
                      :id="'filter-size-2-' + type.code" :name="'type-' + type.code" :value="type.code" 
                      type="checkbox" 
                      class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      v-model="selectedType" :checked="true">
                      <label :for="'filter-size-2-' + type.code" class="ml-3 text-sm text-gray-600">{{ type.name }}</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="border-b border-gray-200 py-6">
                <h3 class="-my-3 flow-root">

                  <button 
                    type="button" 
                    class="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500" 
                    @click="expanded2 = !expanded2" :aria-expanded="expanded2" 
                    aria-controls="filter-section-2">

                    <span class="font-semibold text-gray-900">ค่าใช้จ่ายหลักสูตร</span>
                    <span class="ml-6 flex items-center">
                      <font-awesome-icon v-if="!expanded2" :icon="['fas', 'plus']" class="h-4 w-4" />
                      <font-awesome-icon v-else :icon="['fas', 'minus']" class="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <div class="pt-6" :id="'filter-section-2'" v-show="expanded2">
                  <div class="space-y-4">
                    <div v-for="budget in budgetData" :key="budget.code" class="flex items-center">
                      <input 
                      :id="'filter-size-2-' + budget.code" :name="'budget-' + budget.code" :value="budget.code" 
                      type="checkbox" 
                      class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      v-model="selectedBudget" :checked="true">
                      <label :for="'filter-size-2-' + budget.code" class="ml-3 text-sm text-gray-600">{{ budget.name }}</label>
                    </div>
                  </div>
                </div>
              </div>
          </form>
        </div>
      </div>
  </div>
      
  <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    
      <div class="flex flex-col md:flex-row mt-6 mb-0 md:mb-3">
        <div class="w-full md:w-4/5 md:mr-2 mb-4 md:mb-0">
          <h1 class="text-2xl font-bold tracking-tight text-gray-900">หลักสูตร ({{this.totalItems}}) </h1>
          <p class="text-sm"><span class="text-gray-400 text-sm font-normal" v-if="this.searchTerm">ผลการค้นหา : {{ this.searchTerm }}</span></p>
        </div>
  
        <div class="w-full md:w-1/5 md:ml-2 flex items-center justify-center md:justify-start">
          
          <div class="relative flex items-center w-full">
            <input v-model="searchTerm" type="text" name="searchTerm" id="searchTerm" class="block w-full text-lg rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            <div class="absolute inset-y-0 right-0 flex py-1.5 pr-2 pl-2">
              <kbd class="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
                <span v-if="searchTerm" @click="searchTerm=''" class="cursor-pointer"><font-awesome-icon :icon="['fas', 'times']" class="h-3 w-3 mr-1 ml-1 flex-shrink-0 text-gray-500"/> เคลียร์ </span>
                <span v-else><font-awesome-icon :icon="['fas', 'search']" class="h-3 w-3 mr-1 ml-1 flex-shrink-0 text-gray-500"/> ค้นหา </span>
              </kbd>
            </div>
          </div>
          
          <button type="button" class="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden" @click="showFilter = true">
            <span class="sr-only">Filters</span>
            <font-awesome-icon :icon="['fas', 'filter']" class="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400"/>
          </button>
        </div>
  
      </div>

      <section aria-labelledby="products-heading" class="pb-24 pt-1">
        <div class="grid grid-cols-1 gap-x-4 gap-y-5 lg:grid-cols-5">
          <div class="sidebar">
            <form class="hidden lg:block">

                <div class="border-b border-gray-200 py-6">
                  <h3 class="-my-3 flow-root">
                    <button 
                      type="button" 
                      class="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500" 
                      @click="expanded0 = !expanded0" :aria-expanded="expanded0" 
                      aria-controls="filter-section-2">

                      <span class="font-semibold text-gray-900">หมวดหมู่หลักสูตร</span>
                      <span class="ml-6 flex items-center">
                        <font-awesome-icon v-if="!expanded0" :icon="['fas', 'plus']" class="h-4 w-4" />
                        <font-awesome-icon v-else :icon="['fas', 'minus']" class="h-4 w-4" />
                      </span>
                    </button>
                  </h3>
                  <div class="pt-6" :id="'filter-section-2'" v-show="expanded0">
                    <div class="space-y-4">


                      <div v-for="category in mainCategories" :key="category._id">
                        <div class="block w-full">
                          <input 
                            :id="'filter-size-2-' + category._id" 
                            :name="'category-' + category._id" 
                            :value="category.code" 
                            type="checkbox" 
                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                            v-model="selectedCategories" 
                            :checked="true"
                          >
                          <label 
                            :for="'filter-size-2-' + category._id" 
                            :class="['ml-1', 'text-sm', 'text-gray-600', { 'font-bold': hasSubCategories(category) }]">
                            {{ category.name }} ({{ category.count }})
                          </label>
                        </div>
                        
                        <div v-for="subCategory in getSubCategories(category._id)" :key="subCategory._id" class="ml-6 flex items-center">
                          <input 
                            :id="'filter-size-2-' + subCategory._id" 
                            :name="'category-' + subCategory._id" 
                            :value="subCategory.code" 
                            type="checkbox" 
                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                            v-model="selectedCategories" 
                            :checked="true"
                          >
                          <label :for="'filter-size-2-' + subCategory._id" class="ml-3 text-sm text-gray-600">{{ subCategory.name }} ({{ subCategory.count }})</label>
                        </div>
                      </div>
                      

                    </div>
                  </div>
                </div>

                <div class="border-b border-gray-200 py-6">
                  <h3 class="-my-3 flow-root">

                    <button 
                      type="button" 
                      class="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500" 
                      @click="expanded1 = !expanded1" :aria-expanded="expanded1" 
                      aria-controls="filter-section-2">

                      <span class="font-semibold text-gray-900">ประเภทหลักสูตร</span>
                      <span class="ml-6 flex items-center">
                        <font-awesome-icon v-if="!expanded1" :icon="['fas', 'plus']" class="h-4 w-4" />
                        <font-awesome-icon v-else :icon="['fas', 'minus']" class="h-4 w-4" />
                      </span>
                    </button>
                  </h3>
                  <div class="pt-6" :id="'filter-section-2'" v-show="expanded1">
                    <div class="space-y-4">
                      <div v-for="type in typeData" :key="type.code" class="flex items-center">
                        <input 
                        :id="'filter-size-2-' + type.code" :name="'type-' + type.code" :value="type.code" 
                        type="checkbox" 
                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        v-model="selectedType" :checked="true">
                        <label :for="'filter-size-2-' + type.code" class="ml-3 text-sm text-gray-600">{{ type.name }}</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border-b border-gray-200 py-6">
                  <h3 class="-my-3 flow-root">

                    <button 
                      type="button" 
                      class="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500" 
                      @click="expanded2 = !expanded2" :aria-expanded="expanded2" 
                      aria-controls="filter-section-2">

                      <span class="font-semibold text-gray-900">ค่าใช้จ่ายหลักสูตร</span>
                      <span class="ml-6 flex items-center">
                        <font-awesome-icon v-if="!expanded2" :icon="['fas', 'plus']" class="h-4 w-4" />
                        <font-awesome-icon v-else :icon="['fas', 'minus']" class="h-4 w-4" />
                      </span>
                    </button>
                  </h3>
                  <div class="pt-6" :id="'filter-section-2'" v-show="expanded2">
                    <div class="space-y-4">
                      <div v-for="budget in budgetData" :key="budget.code" class="flex items-center">
                        <input 
                        :id="'filter-size-2-' + budget.code" :name="'budget-' + budget.code" :value="budget.code" 
                        type="checkbox" 
                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                        v-model="selectedBudget" :checked="true">
                        <label :for="'filter-size-2-' + budget.code" class="ml-3 text-sm text-gray-600">{{ budget.name }}</label>
                      </div>
                    </div>
                  </div>
                </div>
            
            </form>
          </div>
          <div class="col-span-4">

            <div v-if="filterLessons.length > 0" class="grid grid-cols-2 gap-x-3 sm:grid-cols-3 gap-y-10 lg:col-span-4 lg:gap-x-8 relative" :data-content="processing_text" :class="[(activeBlock?'isblock' : 'isunblock')]">
              <router-link v-for="(course) in filterLessons" :key="course._id" :to="'/lesson/detail/' + course._id" class="group text-sm">
                  <div class="aspect-video rounded-xl bg-gray-50 object-cover overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75 relative">

                      <div class="absolute">
                        <template v-for="(item, index) in course.category" :key="index">
                        <div v-if="getCategoryExists(item)" class="m-1 p-1 rounded-md bg-gray-800">
                          <p class="text-white text-center">{{ getCategoryName(item) }}</p>
                        </div>
                        </template>
                      </div>

                      <img :src="course.cover" class="h-full w-full object-cover object-center">
                      <template v-if="loggedInComputed.enrollAccess(course._id) && course.sale_price">
                          <div class="absolute top-10 -right-10 bg-red-500 text-white font-bold py-0 px-10 transform rotate-45 shadow-xl">
                              ลงทะเบียนแล้ว
                          </div>
                      </template>
                  </div>
                  
                  <h3 class="mt-4 font-semibold text-indigo-900">
                    <!-- {{course.name}} -->
                    <span v-html="highlightKeywords(course.name)"></span>
                  </h3>
                  <p class="italic text-gray-500">
                    <font-awesome-icon :icon="['fas', 'user-tie']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"/>
                    <template v-if="Array.isArray(course.lecturer)">
                      <template v-for="lecturer in course.lecturer" :key="lecturer.id">
                        {{ lecturer.name }}
                        <br>
                      </template>
                    </template>
                    <template v-else>
                      {{ course.lecturer }}
                    </template>
                  </p>                      
                  <div class="mt-2 grid grid-cols-2 md:grid-cols-3 items-center gap-2 text-gray-500">
                    <span class="col-span-1 font-medium text-gray-500"><font-awesome-icon :icon="['far', 'clock']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"/>{{ course.hours }} ชม.</span>
                    <span class="col-span-1 font-medium"><font-awesome-icon :icon="['far', 'calendar']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"/>{{ course.days }} วัน</span>
                    <span class="col-span-2 md:col-span-1 font-medium"><font-awesome-icon :icon="['fas', 'medal']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"/>{{ course.certification === 'yes' ? 'มีใบรับรอง' : 'ไม่มีใบรับรอง' }}</span>
                  </div>
                  <p class="mt-2 font-medium text-gray-900" v-html="formatPrice(course.regular_price, course.sale_price)"></p>

              </router-link>

              <div class="col-span-full">
                <Pagination :current-page="currentPage" :total-items="totalItems" :total-pages="totalPages" :limit-items="limitItem" @page-changed="handlePageChanged" />
              </div>

          </div>
          
          <div v-else class="text-center">ไม่พบหลักสูตรที่ต้องการ</div>

          </div>

        </div>
      </section>
  </main>
    
</template>
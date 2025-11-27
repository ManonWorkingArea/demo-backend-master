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
        const baseMatchStage = {
        $match: {
            unit: this.configs.siteID,
            status: true,
            mode: 'standard',
            lesson_type: 'child',
        },
        };

        const pipeline = [];

        if (this.data.categoriesDisplay !== 'all') {
        // Add the category filtering condition if not 'all'
        baseMatchStage.$match['category'] = { $in: [this.data.categoriesCode] };
        }

        pipeline.push(baseMatchStage);

        const resAPI = await fetch('https://gateway.cloudrestfulapi.com/api/course/aggregate', {
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
      <div class="mb-5 pb-8 border-b border-gray-100">
        <div class="pb-5">
          <div class="text-left">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h2 class="text-2xl font-bold tracking-tight text-blue-900">{{ this.data.categoriesName }}</h2>
              </div>
              <div class="text-right">
                <router-link v-if="this.data.categoriesDisplay !== 'all'" :to="'/lesson/categories/' + this.data.categoriesCode" class="text-blue-600 hover:underline">ดูทั้งหมด</router-link>
                <router-link v-else :to="'/lesson/home/'" class="text-blue-600 hover:underline">ดูทั้งหมด</router-link>
              </div>
            </div>
          </div>
        </div>
        <div class="grid max-w-2xl grid-cols-1 gap-x-4 gap-y-5 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            <article v-for="(item, itemIndex) in listItems" :key="itemIndex" class="flex flex-col">
                <router-link :to="'/lesson/detail/' + item._id">
                    <div class="relative w-full">
                        <img :src="item.cover" alt="" class="aspect-[16/9] w-full rounded-lg bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]">
                        <div class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10"></div>
                        </div>
                        <div class="max-w-xl">
                        <div class="mt-2 flex items-center gap-x-4 text-xs">
                            <time datetime="2020-03-16" class="text-gray-500">{{ item.hours }} ชั่วโมง | {{ item.days }} วัน</time>
                            <a href="#" class="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100">Marketing</a>
                        </div>
                        <div class="group relative">
                            <h3 class="text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                            <span class="absolute inset-0"></span>
                            {{ item.name }}
                            </h3>
                            <p class="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{{ truncateText(descriptionWithoutTags(item.description), 100) }}</p>
                        </div>
                    </div>
                </router-link>
            </article>
        </div>
    </div>
</template>

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
        const pipeline = [
        {
          $match: {
            unit: this.configs.siteID, 
            status: true, 
            mode:'standard', 
            lesson_type:'child'
          },
        },
        {
          $lookup: {
            from: "category",
            localField: "category",
            foreignField: "code",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $group: {
            _id: "$category.code",
            name: {
              $first: "$category.name",
            },
            description: {
              $first: "$category.description",
            },
            items: {
              $push: "$$ROOT",
            },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            name: 1,
            description: 1,
            items: {
              $slice: ["$items", 4],
            },
          },
        },
        {
          $sort: {
            category: 1,
          },
        },
      ];
        const resAPI = await fetch(
          "https://gateway.cloudrestfulapi.com/api/course/aggregate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",'client-token-key':this.configs.key
            },
            body: JSON.stringify({ pipeline }),
          }
        );

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
  <div>
    <template v-for="(category, index) in listItems" :key="index">
      <div v-if="category.items.length > 1">
        <div class="bg-white py-6 sm:py-8">
          <div class="mx-auto mt-6 max-w-7xl px-6 lg:px-8">
            <router-link :to="'/lesson/detail/' + category.items[0]._id">
              <div class="mx-auto grid max-w-2xl grid-cols-1 items-start gap-x-8 gap-y-16 sm:gap-y-24 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                <div class="lg:pr-4">
                  <figure>
                    <img class="aspect-video rounded-xl bg-gray-50 object-cover" :src="category.items[0].cover" alt="">
                  </figure>
                </div>
                <div>
                  <div class="text-base leading-7 text-gray-700 lg:max-w-lg">
                    <p class="text-base font-semibold leading-7 text-indigo-600">Highlight of {{category.name}}</p>
                    <h1 class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{{ category.items[0].name }}</h1>
                    <div class="max-w-xl">
                      <p class="mt-6">{{ truncateText(descriptionWithoutTags(category.items[0].short_description), 100) }}</p>
                    </div>
                  </div>
                  <dl class="mt-10 grid grid-cols-2 gap-8 border-t border-gray-900/10 pt-10 sm:grid-cols-4">
                    <div>
                      <dt class="text-sm font-semibold leading-6 text-gray-600">เวลาเรียน</dt>
                      <dd class="mt-2 text-3xl font-bold leading-10 tracking-tight text-gray-900">{{ category.items[0].hours }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-semibold leading-6 text-gray-600">จำนวนวัน</dt>
                      <dd class="mt-2 text-3xl font-bold leading-10 tracking-tight text-gray-900">{{ category.items[0].days }}</dd>
                    </div>
                    <!-- <div>
                      <dt class="text-sm font-semibold leading-6 text-gray-600">ผู้ลงทะเบียน</dt>
                      <dd class="mt-2 text-3xl font-bold leading-10 tracking-tight text-gray-900">{{ category.items[0].enroll ? category.items[0].enroll.length : 0 }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-semibold leading-6 text-gray-600">ใบรับรอง</dt>
                      <dd class="mt-2 text-3xl font-bold leading-10 tracking-tight text-gray-900">$25M</dd>
                    </div> -->
                  </dl>
                  <div class="mt-10 flex">
                    <a href="#" class="text-base font-semibold leading-7 text-indigo-600">ดูรายละเอียดหลักสูตรนี้ <span aria-hidden="true">&rarr;</span></a>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <div class="bg-gray-100 py-12 sm:py-16">
          <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <div class="mx-auto max-w-2xl text-center">
              <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{{ category.name }}</h2>
              <p class="mt-2 text-lg leading-8 text-gray-600">{{ category.description }}</p>
            </div>
            <div class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              <article v-for="(item, itemIndex) in category.items.slice(1)" :key="itemIndex" class="flex flex-col">
                <router-link :to="'/lesson/detail/' + item._id">
                  <div class="relative w-full">
                    <img :src="item.cover" alt="" class="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]">
                    <div class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10"></div>
                  </div>
                  <div class="max-w-xl">
                    <div class="mt-8 flex items-center gap-x-4 text-xs">
                      <time datetime="2020-03-16" class="text-gray-500">{{ item.hours }} ชั่วโมง | {{ item.days }} วัน</time>
                      <a href="#" class="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100">Marketing</a>
                    </div>
                    <div class="group relative">
                      <h3 class="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                        <span class="absolute inset-0"></span>
                        {{ item.name }}
                      </h3>
                      <p class="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{{ truncateText(descriptionWithoutTags(item.description), 100) }}</p>
                    </div>
                    <div class="relative mt-4 flex items-center gap-x-4">
                      <div class="text-sm leading-6">
                        <p class="font-semibold text-gray-900">
                          <template v-if="Array.isArray(item.lecturer)">
                            <template v-for="lecturer in item.lecturer" :key="lecturer.id">
                              {{ lecturer.name }}
                              <br>
                            </template>
                          </template>
                          <template v-else>
                            {{ item.lecturer }}
                          </template>
                        </p>
                        <p class="text-gray-600">วิทยากร</p>
                      </div>
                    </div>
                  </div>
                </router-link>
              </article>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

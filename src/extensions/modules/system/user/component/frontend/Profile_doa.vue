<script>
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import avatar from '@/utils/Avatar.vue';

import Application from '@/extensions/modules/standard/application/component/frontend/Dashboard.vue';
import Lesson from '@/extensions/modules/elearning/lesson/component/course/frontend/OrderDashboard.vue';
import Shop from '@/extensions/modules/ecommerce/shop/component/frontend/Dashboard.vue';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';

export default {
	name: 'User Profile DOA',
	components: {avatar},
	data() {
		return {
      config: storageManager.get('configs'),
      profile: storageManager.get('session','user'),
      session: storageManager.get('session'),
      enroll:[],
      avatarData: {
        image: null, // Replace with the actual image path
      },
		}
	},
  created() {
    if (this.profile.req_reset) {
      this.$router.push('/user/reset');
    }
  },
	methods: {
    getComponent(plugin) {
      const componentMap = {
        application: Application,
        lesson: Lesson,
        shop: Shop
      };
      return componentMap[plugin] || null;
    },
    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date);
    },
    logout() {
      this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 500,
          icon: 'success',
          title: 'แจ้งเตือน',
          text: 'ออกจากระบบเรียบร้อยแล้ว',
      }).then(() => 
      {
        storageManager.delete('session');
        window.location.href = "/"
      });
    },
    countEnrollmentsByStatus(enrollments = [], status) {
      if (!enrollments || enrollments.length === 0) {
        return 0;
      }
      return enrollments.filter((enrollment) => enrollment.analytics && enrollment.analytics.status && enrollment.analytics.status.trim() === status).length;
    },
    countTotalEnrollments(enrollments = []) {
      if (!enrollments) {
        return 0;
      }
      return enrollments.length;
    },
    async getData() {
        try {

          this.activeBlock   = true;

          const pipeline = [
            {
              $match: {
                $and: [{ userID: this.session.userID }]
              },
            },
            {
              $set: {courseID: { $toObjectId: "$courseID" }},
            },
            {
              $lookup: {
                from: "course",
                localField: "courseID",
                foreignField: "_id",
                as: "course"
              },
            },
            {
              $unwind: "$course"
            },
            {
              $facet: {
                enroll: [{$skip: (1 - 1) * 100,},{$limit: 100}],
                totalCount: [{$count: 'count'}],
              },
            },
          ];

          const resAPI = await Request.POST('enroll/aggregate', { pipeline }, this.config.key);
          const data = resAPI.data;
          
          this.enroll       = data[0].enroll;
          this.activeBlock  = false;

        } catch (error) {
          debug.log(error)
        }
      }
	},
  async mounted () {
    try {
      await this.getData();
    } catch (error) {
      debug.log(Error);
    }
  },
  computed: {
    countPendingEnrollments() {
      return this.countEnrollmentsByStatus(this.enroll, 'pending');
    },
    countProcessingEnrollments() {
      return this.countEnrollmentsByStatus(this.enroll, 'processing');
    },
    countCompleteEnrollments() {
      return this.countEnrollmentsByStatus(this.enroll, 'complete');
    },
    countTotalEnrollment() {
      return this.countTotalEnrollments(this.enroll);
    }
  }
};
</script>

<template>
  <header class="relative isolate pt-1">
    <div class="absolute inset-0 -z-10 overflow-hidden bg-profile" aria-hidden="true">
      <div class="absolute left-16 top-full -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
      </div>
      <div class="absolute inset-x-0 bottom-0 h-px bg-gray-900/5"></div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div class="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
        <div class="flex items-center gap-x-6">
          <span class="relative inline-block">
              <avatar :data="{ name: profile.firstname + ' ' + profile.lastname, image: profile.avatar, size:14 }" class="h-16 w-16"/>
              <span class="absolute right-0 top-0 block h-4 w-4 rounded-full bg-green-400 ring-2 ring-white"></span>
            </span>
          <h1>
            <div class="text-sm leading-6 text-white">{{ this.profile.email }}</div>
            <div class="mt-1 text-base font-semibold leading-6 text-white">{{ this.profile.firstname }} {{ this.profile.lastname }}</div>
          </h1>
        </div>
        <div class="flex items-center gap-x-4 sm:gap-x-6">
          <a href="#" class="hidden text-sm font-semibold leading-6 text-white sm:block">แก้ไขข้อมูลส่วนตัว</a>
          <button @click="logout()" 
          type="button" 
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <font-awesome-icon :icon="['fas','power-off']"/>
          </button>
        </div>
      </div>
    </div>
  </header>

  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pt-0">

    <dl class="mx-auto mb-5 grid grid-cols-1 gap-px bg-white sm:grid-cols-2 lg:grid-cols-3">

      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8 border-r border-gray-200">
        <dt class="text-sm font-semibold leading-6 text-gray-700">
          <font-awesome-icon :icon="['fas','shopping-cart']" class="text-xl pr-2"/> คำสั่งซื้อ
        </dt>
        <dd class="text-xs font-medium text-gray-700">Shop</dd>
        <dd class="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">{{ countProcessingEnrollments }}</dd>
      </div>

      <!-- <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8 border-r border-gray-200" v-if="config.plugins.includes('lesson')">
        <dt class="text-sm font-semibold leading-6 text-gray-700">
          <font-awesome-icon :icon="['fas','graduation-cap']" class="text-xl pr-2"/> หลักสูตรที่ลงทะเบียน
        </dt>
        <dd class="text-xs font-medium text-gray-700">Enroll</dd>
        <dd class="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">{{ countTotalEnrollment }}</dd>
      </div>

      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8 border-r border-gray-200" v-if="config.plugins.includes('application')">
        <dt class="text-sm font-semibold leading-6 text-gray-700">
          <font-awesome-icon :icon="['fas','file-alt']" class="text-xl pr-2"/> แบบฟอร์มการลงทะเบียน
        </dt>
        <dd class="text-xs font-medium text-gray-700">Assignment</dd>
        <dd class="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">{{ countCompleteEnrollments }}</dd>
      </div> -->

    </dl>
    
    <div class="mx-auto">

      <template v-for="plugin in config.plugins" :key="plugin">
        <component :is="getComponent(plugin)"></component>
      </template>

    </div>

  </div>
</template>

<style>
.bg-profile {
  background: rgb(9,9,121);
background: -moz-linear-gradient(90deg, rgba(9,9,121,1) 0%, rgba(76,76,200,1) 50%, rgba(9,9,121,1) 100%);
background: -webkit-linear-gradient(90deg, rgba(9,9,121,1) 0%, rgba(76,76,200,1) 50%, rgba(9,9,121,1) 100%);
background: linear-gradient(90deg, rgba(9,9,121,1) 0%, rgba(76,76,200,1) 50%, rgba(9,9,121,1) 100%);
filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#090979",endColorstr="#090979",GradientType=1);
}
</style>
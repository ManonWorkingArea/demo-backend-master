<template>
    <div class="mb-4 -mx-4 px-4 py-4 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-4 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-8 xl:pb-10 xl:pt-8">

        <h2 class="text-base font-semibold leading-6 text-gray-900 ">
          <font-awesome-icon :icon="['fas','graduation-cap']" class="text-xl pr-2"/> หลักสูตรที่ลงทะเบียน
        </h2>

        <table class="mt-2 w-full whitespace-nowrap text-left text-sm leading-6">
          <colgroup>
            <col class="w-full">
            <col>
            <col>
            <col>
          </colgroup>
          <thead class="border-b border-gray-200 text-gray-900">
            <tr>
              <th scope="col" class="px-0 py-3 font-semibold">ชื่อหลักสูตร</th>
              <th scope="col" class="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">เนื้อหา</th>
              <th scope="col" class="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell">เรียนแล้ว</th>
              <th scope="col" class="py-3 pl-8 pr-0 text-right font-semibold">สถานะ</th>
            </tr>
          </thead>
          <tbody>

            <tr v-for="(item) in this.enroll" :key="item._id" class="border-b border-gray-100">
              <template v-if="item.course.unit == config.siteID">
                <td class="max-w-0 px-0 py-5 align-top">
                  <router-link :to="'/lesson/detail/' + item.course._id" class="font-semibold text-indigo-800 hover:text-black">
                    {{item.course.name}}
                  </router-link>
                  <div class="truncate text-gray-500"><font-awesome-icon :icon="['fas', 'calendar-alt']" class="mr-1 h-3 w-3 flex-shrink-0 text-gray-400" /> {{formatThaidate(item.createdAt)}}</div>
                </td>
                <td class="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell">{{item.analytics && item.analytics.total ? item.analytics.total + ' บท' : 'N/A'}}</td>
                <td class="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell">{{item.analytics && item.analytics.percent ? item.analytics.percent + ' %' : 'N/A'}}</td>
                <td class="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700">{{item.analytics && item.analytics.message ? item.analytics.message : 'N/A'}}</td>
              </template>
            </tr>

          </tbody>
        </table>
      </div>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import convertUtils from "@/plugins/convertUtils";
  import requestClient from '@/plugins/requestClient';
  const Request = new requestClient(false);
  
  export default {
    name: 'Student Profile',
    components: {
    },
    data() {
      return {
        config: storageManager.get('configs'),
        profile: storageManager.get('session','user'),
        session: storageManager.get('session'),
        enroll:[],
      }
    },
    created() {
      if (this.profile.req_reset) {
        this.$router.push('/student/reset');
      }
    },
    methods: {
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
          window.location.href = ""
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
          console.log(error)
        }
      }
    },
    async mounted () {
      try {
        await this.getData();
      } catch (error) {
        console.log(Error);
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
  
  <style>
  </style>
  
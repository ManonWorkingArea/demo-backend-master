<script>
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";

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
          const enrollAPI = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({
                  method: 'find',
                  args: [
                  {
                      $and: [
                        { 
                          userID: this.session.userID,
                        }
                      ]
                  }
                  ]
              })
          });

          const enrollReturn    = await enrollAPI.json();

          for (let i = 0; i < enrollReturn.length; i++) {
            const enroll = enrollReturn[i];
            const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/course/${enroll.courseID}`, {
              method: 'GET',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            });
            const courseData = await resAPI.json();
            enroll.course = courseData;
          }

          this.enroll = enrollReturn;

          this.activeBlock      = false;

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

<template>
  <header class="relative isolate pt-1">
    <div class="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div class="absolute left-16 top-full -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
        <div class="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]" style="clip-path: polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)"></div>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-px bg-gray-900/5"></div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div class="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
        <div class="flex items-center gap-x-6">
          <span class="relative inline-block">
              <img class="h-16 w-16 rounded-full" src="https://vue-project.sgp1.digitaloceanspaces.com/Logo/default-avatarjpg.jpg" alt="">
              <span class="absolute right-0 top-0 block h-4 w-4 rounded-full bg-green-400 ring-2 ring-white"></span>
            </span>
          <h1>
            <div class="text-sm leading-6 text-gray-500">{{ this.profile.email }}</div>
            <div class="mt-1 text-base font-semibold leading-6 text-gray-900">{{ this.profile.firstname }} {{ this.profile.lastname }}</div>
          </h1>
        </div>
        <div class="flex items-center gap-x-4 sm:gap-x-6">
          <a href="#" class="hidden text-sm font-semibold leading-6 text-gray-900 sm:block">Edit Profile</a>
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

    <dl class="mx-auto mb-5 grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-3">
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8">
        <dt class="text-sm font-semibold leading-6 text-gray-700">หลักสูตรที่ลงทะเบียน</dt>
        <dd class="text-xs font-medium text-gray-700">Enroll</dd>
        <dd class="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">{{ countTotalEnrollment }}</dd>
      </div>
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8">
        <dt class="text-sm font-semibold leading-6 text-gray-700">หลักสูตรที่เรียนจบแล้ว</dt>
        <dd class="text-xs font-medium text-rose-600">Complete</dd>
        <dd class="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">{{ countCompleteEnrollments }}</dd>
      </div>
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8">
        <dt class="text-sm font-semibold leading-6 text-gray-700">หลักสูตรที่กำลังเรียน</dt>
        <dd class="text-xs font-medium text-gray-700">Processing</dd>
        <dd class="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">{{ countProcessingEnrollments }}</dd>
      </div>
    </dl>
    
    <div class="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-1">

      <div class="-mx-4 px-4 py-4 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-4 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-8 xl:pb-10 xl:pt-8">

        <h2 class="text-base font-semibold leading-6 text-gray-900 ">หลักสูตรที่ลงทะเบียน</h2>

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

            <tr v-for="(enroll) in this.enroll" :key="enroll._id" class="border-b border-gray-100">
              <td class="max-w-0 px-0 py-5 align-top">
                <router-link :to="'/lesson/detail/' + enroll.course._id" class="truncate font-semibold text-indigo-800 hover:text-black">
                  {{enroll.course.name}}
                </router-link>
                <div class="truncate text-gray-500"><font-awesome-icon :icon="['fas', 'calendar-alt']" class="mr-1 h-3 w-3 flex-shrink-0 text-gray-400" /> {{formatThaidate(enroll.createdAt)}}</div>
              </td>
              <td class="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell">{{enroll.analytics && enroll.analytics.total ? enroll.analytics.total + ' %' : 'N/A'}}</td>
              <td class="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell">{{enroll.analytics && enroll.analytics.percent ? enroll.analytics.percent + ' %' : 'N/A'}}</td>
              <td class="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700">{{enroll.analytics && enroll.analytics.message ? enroll.analytics.message : 'N/A'}}</td>
            </tr>

          </tbody>
        </table>
      </div>

      <!-- <div class="lg:col-start-3">
        <h2 class="text-sm font-semibold leading-6 text-gray-900">ประวัติการใช้งาน</h2>
        <ul role="list" class="mt-6 space-y-6">
          <li class="relative flex gap-x-4">
            <div class="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
              <div class="w-px bg-gray-200"></div>
            </div>

            <div class="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
              <div class="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300"></div>
            </div>
            <p class="flex-auto py-0.5 text-xs leading-5 text-gray-500"><span class="font-medium text-gray-900">Chelsea Hagon</span> created the invoice.</p>
            <time datetime="2023-01-23T10:32" class="flex-none py-0.5 text-xs leading-5 text-gray-500">7d ago</time>
          </li>

          <li class="relative flex gap-x-4">
            <div class="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
              <div class="w-px bg-gray-200"></div>
            </div>

            <div class="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
              <div class="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300"></div>
            </div>
            <p class="flex-auto py-0.5 text-xs leading-5 text-gray-500"><span class="font-medium text-gray-900">Chelsea Hagon</span> edited the invoice.</p>
            <time datetime="2023-01-23T11:03" class="flex-none py-0.5 text-xs leading-5 text-gray-500">6d ago</time>
          </li>

          <li class="relative flex gap-x-4">
            <div class="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
              <div class="w-px bg-gray-200"></div>
            </div>

            <div class="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
              <div class="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300"></div>
            </div>
            <p class="flex-auto py-0.5 text-xs leading-5 text-gray-500"><span class="font-medium text-gray-900">Chelsea Hagon</span> sent the invoice.</p>
            <time datetime="2023-01-23T11:24" class="flex-none py-0.5 text-xs leading-5 text-gray-500">6d ago</time>
          </li>

          <li class="relative flex gap-x-4">
            <div class="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
              <div class="w-px bg-gray-200"></div>
            </div>

            <img src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" class="relative mt-3 h-6 w-6 flex-none rounded-full bg-gray-50">
            <div class="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
              <div class="flex justify-between gap-x-4">
                <div class="py-0.5 text-xs leading-5 text-gray-500"><span class="font-medium text-gray-900">Chelsea Hagon</span> commented</div>
                <time datetime="2023-01-23T15:56" class="flex-none py-0.5 text-xs leading-5 text-gray-500">3d ago</time>
              </div>
              <p class="text-sm leading-6 text-gray-500">Called client, they reassured me the invoice would be paid by the 25th.</p>
            </div>
          </li>

          <li class="relative flex gap-x-4">
            <div class="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
              <div class="w-px bg-gray-200"></div>
            </div>

            <div class="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
              <div class="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300"></div>
            </div>
            <p class="flex-auto py-0.5 text-xs leading-5 text-gray-500"><span class="font-medium text-gray-900">Alex Curren</span> viewed the invoice.</p>
            <time datetime="2023-01-24T09:12" class="flex-none py-0.5 text-xs leading-5 text-gray-500">2d ago</time>
          </li>

          <li class="relative flex gap-x-4">
            <div class="absolute left-0 top-0 flex w-6 justify-center h-6">
              <div class="w-px bg-gray-200"></div>
            </div>

            <div class="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
              <svg class="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="flex-auto py-0.5 text-xs leading-5 text-gray-500"><span class="font-medium text-gray-900">Alex Curren</span> paid the invoice.</p>
            <time datetime="2023-01-24T09:20" class="flex-none py-0.5 text-xs leading-5 text-gray-500">1d ago</time>
          </li>
        </ul>

      </div> -->
    </div>
  </div>
</template>
<script>
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import avatar from '@/utils/Avatar.vue';

import Application from '@/extensions/modules/standard/application/component/frontend/Dashboard.vue';
import Lesson from '@/extensions/modules/elearning/lesson/component/course/frontend/Dashboard.vue';
import Shop from '@/extensions/modules/ecommerce/shop/component/frontend/Dashboard.vue';

export default {
	name: 'User Profile',
	components: {avatar},
	data() {
		return {
      configs: storageManager.get('configs'),
      profile: storageManager.get('session','user'),
      session: storageManager.get('session'),
      categories:[],
      enroll:[],
      target:[],
      courses:[],
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
    formatPrice(regular,sale) {
        return convertUtils.formatPriceCompact(regular,sale);
    },
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
          
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/category/aggregate`, {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
              },
              body: JSON.stringify({ pipeline })
          });
          
          const RestReturn = await resAPI.json();
          return RestReturn
      } catch (error) {
          console.log(error)
      }
    },
    getCategoryName(code) {
      // Return the name of the category based on its code
      return this.categoryMap[code] || "";
    },
    async getDataCourse() {
        try {
            this.loading_sources  = false;
            const targetCode = this.profile.info.bandCode; 
            const pipeline = [
              {
                $match: {
                  "target.code": targetCode
                }
              },
              {
                $group: {
                  _id: null,
                  courses: {
                    $push: "$$ROOT"
                  }
                }
              },
              {
                $project: {
                  _id: 0,
                  course: {
                    $arrayToObject: {
                      $map: {
                        input: { $range: [0, { $size: "$courses" }] },
                        as: "index",
                        in: {
                          k: { $toString: "$$index" },
                          v: { $arrayElemAt: ["$courses", "$$index"] }
                        }
                      }
                    }
                  }
                }
              }
            ];

            const certresAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/course/aggregate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json','client-token-key':this.configs.key
              },
              body: JSON.stringify({ pipeline })
            });

            const CertReturn = await certresAPI.json();
            const Category   = await this.getCategoryData();
            const target     = await this.getDataTargetCourse();

            this.categories  = Category;
            this.target      = target[0];

            if (certresAPI.status === 200) {
              this.courses = CertReturn[0].course
            }
        } catch (error) {
            console.log(error)
        }
    },
    async getDataTargetCourse() {
        try {
            this.loading_sources  = false;
            const targetCode = this.profile.info.bandCode; 
            const pipeline = [
              {
                $match: {
                  "code": targetCode
                }
              },
              {
                $group: {
                  _id: null,
                  target: {
                    $push: "$$ROOT"
                  }
                }
              },
              {
                $project: {
                  _id: 0,
                  target: {
                    $arrayToObject: {
                      $map: {
                        input: { $range: [0, { $size: "$target" }] },
                        as: "index",
                        in: {
                          k: { $toString: "$$index" },
                          v: { $arrayElemAt: ["$target", "$$index"] }
                        }
                      }
                    }
                  }
                }
              }
            ];

            const certresAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/target/aggregate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json','client-token-key':this.configs.key
              },
              body: JSON.stringify({ pipeline })
            });

            const CertReturn = await certresAPI.json();

            if (certresAPI.status === 200) {
              return CertReturn[0].target
            }
        } catch (error) {
            console.log(error)
        }
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
              headers: {'Content-Type': 'application/json'},
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
      await this.getDataCourse();
    } catch (error) {
      console.log(Error);
    }
  },
  computed: {
    categoryMap() {
      const map = {};

      // Check if this.categories is defined and not null
      if (this.categories && typeof this.categories === 'object') {
        const categoryKeys = Object.keys(this.categories);
        for (const categoryKey of categoryKeys) {
          const category = this.categories[categoryKey];
          map[category.code] = category.name;
        }
      }

      return map;
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
            <div class="text-sm leading-6 text-white">{{ this.profile.info.departmentName }}</div>
            <div class="mt-1 text-base font-semibold leading-6 text-white">{{ this.profile.firstname }} {{ this.profile.lastname }} <span class="font-normal bg-black text-white px-2 py-1 text-sm"> {{ target.name }}</span></div>
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

  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pt-8" v-if="enroll.length > 0">

    <div class="pb-4 text-xl">
      <font-awesome-icon :icon="['fas','book-open']" class="text-xl pr-1"/> หลักสูตรที่กำลังเรียน
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
      <router-link v-for="(enroll) in enroll" :key="enroll._id" :to="'/lesson/detail/' + enroll.course._id" class="group text-sm">
        <div class="aspect-video rounded-xl bg-gray-50 object-cover overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75 relative">
    
            <div class="absolute">
              <div v-for="(item, index) in enroll.course.category" :key="index" class="m-1 p-1 rounded-md bg-gray-800">
                <p class="text-white text-center">{{ getCategoryName(item) }}</p>
              </div>
            </div>
    
            <img :src="enroll.course.cover" class="h-full w-full object-cover object-center">
            <template v-if="loggedInComputed.enrollAccess(enroll.course._id) && enroll.course.sale_price">
                <div class="absolute top-10 -right-10 bg-red-500 text-white font-bold py-0 px-10 transform rotate-45 shadow-xl">
                เริ่มเข้าอบรมแล้ว
                </div>
            </template>
        </div>
        
        <h3 class="mt-4 font-semibold text-indigo-900">{{enroll.course.name}}</h3>
        <p class="italic text-gray-500">
          <font-awesome-icon :icon="['fas', 'user-tie']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"/>
          <template v-if="Array.isArray(enroll.course.lecturer)">
            <template v-for="lecturer in enroll.course.lecturer" :key="lecturer.id">
              {{ lecturer.name }}
              <br>
            </template>
          </template>
          <template v-else>
            {{ enroll.course.lecturer }}
          </template>
        </p>                      
        <div class="mt-2 grid grid-cols-2 md:grid-cols-3 items-center gap-2 text-gray-500">
          <span class="col-span-1 font-medium text-gray-500"><font-awesome-icon :icon="['far', 'clock']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"/>{{ enroll.course.hours }} ชม.</span>
          <span class="col-span-1 font-medium"><font-awesome-icon :icon="['far', 'calendar']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"/>{{ enroll.course.days }} วัน</span>
          <span class="col-span-2 md:col-span-1 font-medium"><font-awesome-icon :icon="['fas', 'medal']" class="mr-1.5 h-3 w-3 flex-shrink-0 text-gray-400"/>{{ enroll.course.certification === 'yes' ? 'มีใบรับรอง' : 'ไม่มีใบรับรอง' }}</span>
        </div>
     
      </router-link>
    </div>

  </div>

  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pt-8">

    <div class="pb-4 text-xl">
      <font-awesome-icon :icon="['fas','book-open']" class="text-xl pr-1"/> หลักสูตรสำหรับ <span class="font-bold"> {{ target.name }}</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
      <router-link v-for="(course) in courses" :key="course._id" :to="'/lesson/detail/' + course._id" class="group text-sm">
        <div class="aspect-video rounded-xl bg-gray-50 object-cover overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75 relative">
    
            <div class="absolute">
              <div v-for="(item, index) in course.category" :key="index" class="m-1 p-1 rounded-md bg-gray-800">
                <p class="text-white text-center">{{ getCategoryName(item) }}</p>
              </div>
            </div>
    
            <img :src="course.cover" class="h-full w-full object-cover object-center">
            <template v-if="loggedInComputed.enrollAccess(course._id) && course.sale_price">
                <div class="absolute top-10 -right-10 bg-red-500 text-white font-bold py-0 px-10 transform rotate-45 shadow-xl">
                เริ่มเข้าอบรมแล้ว
                </div>
            </template>
        </div>
        
        <h3 class="mt-4 font-semibold text-indigo-900">{{course.name}}</h3>
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
     
      </router-link>
    </div>

  </div>

  <!-- <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pt-0">

    <dl class="mx-auto mb-5 grid grid-cols-1 gap-px bg-white sm:grid-cols-2 lg:grid-cols-3">

      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8 border-r border-gray-200" v-if="configs.plugins.includes('lesson')">
        <dt class="text-sm font-semibold leading-6 text-gray-700">
          <font-awesome-icon :icon="['fas','graduation-cap']" class="text-xl pr-2"/> หลักสูตรที่ลงทะเบียน
        </dt>
        <dd class="text-xs font-medium text-gray-700">Enroll</dd>
        <dd class="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">{{ countTotalEnrollment }}</dd>
      </div>

      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8 border-r border-gray-200" v-if="configs.plugins.includes('application')">
        <dt class="text-sm font-semibold leading-6 text-gray-700">
          <font-awesome-icon :icon="['fas','file-alt']" class="text-xl pr-2"/> แบบฟอร์มการลงทะเบียน
        </dt>
        <dd class="text-xs font-medium text-gray-700">Assignment</dd>
        <dd class="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">{{ countCompleteEnrollments }}</dd>
      </div>

      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8 border-r border-gray-200" v-if="configs.plugins.includes('shop')">
        <dt class="text-sm font-semibold leading-6 text-gray-700">
          <font-awesome-icon :icon="['fas','shopping-cart']" class="text-xl pr-2"/> คำสั่งซื้อ
        </dt>
        <dd class="text-xs font-medium text-gray-700">Shop</dd>
        <dd class="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">{{ countProcessingEnrollments }}</dd>
      </div>

    </dl>
    
    <div class="mx-auto">

      <template v-for="plugin in configs.plugins" :key="plugin">
        <component :is="getComponent(plugin)"></component>
      </template>

    </div>
  </div> -->
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
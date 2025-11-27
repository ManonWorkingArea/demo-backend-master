<script>
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";

import Application from '@/extensions/modules/standard/application/component/frontend/Dashboard.vue';
import Lesson from '@/extensions/modules/elearning/lesson/component/course/frontend/Dashboard.vue';
import Shop from '@/extensions/modules/ecommerce/shop/component/frontend/Dashboard.vue';

import debug from '@/plugins/Logger.js';

export default {
	name: 'User Profile',
	data() {
		return {
      configs: storageManager.get('configs'),
      profile: storageManager.get('session','user'),
      session: storageManager.get('session'),
      loading:true,
      categories:[],
      enroll:[],
      target:[],
      courses:[],
      avatarData: {
        image: null, // Replace with the actual image path
      },
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
              'Content-Type': 'application/json'
              },
              body: JSON.stringify({ pipeline })
          });
          
          const RestReturn = await resAPI.json();
          return RestReturn
      } catch (error) {
          debug.log(error)
      }
    },
    getCategoryName(code) {
      // Return the name of the category based on its code
      return this.categoryMap[code] || "";
    },
    async getDataCourse() {
        try {
            this.loading  = true;
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
                this.courses = CertReturn[0].course;
                if (!this.courses) {
                    this.loading = true;
                    debug.log("Course", this.courses);
                } else {
                    this.loading = false;
                    debug.log("Course", this.courses);
                }
            }

        } catch (error) {
            debug.log(error)
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
            debug.log(error)
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
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            });
            const courseData = await resAPI.json();
            enroll.course = courseData;
          }

          this.enroll = enrollReturn;

          this.activeBlock      = false;

        } catch (error) {
          debug.log(error)
        }
    }
	},
  async mounted () {
    try {
      await this.getData();
      await this.getDataCourse();
    } catch (error) {
      debug.log(Error);
    }
  },
  computed: {
    categoryMap() {
      const map = {};
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
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pt-8" v-if="!loading">
    <div class="pb-4 text-xl">
      <font-awesome-icon :icon="['fas','book-open']" class="text-xl pr-1"/> หลักสูตรสำหรับ <span class="font-bold"> {{ target.name }}</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
</template>
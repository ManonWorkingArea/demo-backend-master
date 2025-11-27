<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import Subhead from '@/interface/template/outline/Subhead.vue';
import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import moment from 'moment';
moment().format();

export default {
    inject: ['apiServer'],
    data() {
      const route = useRoute();
      return {
        configs: storageManager.get('configs'),
        PageName: route.meta.title,
        PageIcon: route.meta.icon,
        PagePath: route.meta.path,
        ParentName: route.meta.parent,
        ParentPage: route.meta.page,
        schoolData: [],
        profile: [],
        enroll: [],
        order: [],
        dataItem: this.$route.params.id,
        loading_sources: true,
        back:'',
        cert_area : [
          { id: "1", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 1 (เชียงใหม่ แพร่ น่าน ลำปาง เชียงราย แม่ฮ่องสอน)"},
          { id: "2", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 2 (พิษณุโลก พิจิตร สุโขทัย ตาก อุตรดิตถ์ เพชรบูรณ์)"},
          { id: "3", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 3 (ขอนแก่น หนองคาย กาฬสินธุ์ เลย อุดรธานี มุกดาหาร สกลนคร นครพนม ชัยภูมิ)"},
          { id: "4", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 4 (อุบลราชธานี นครราชสีมา สุรินทร์ มหาสารคาม ร้อยเอ็ด บุรีรัมย์ ศรีสะเกษ ยโสธร )"},
          { id: "5", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 5 (ชัยนาท กาญจนบุรี เพชรรัตน์เพชรบุรี ปทุมธานี ราชบุรี อุทัยธานี ลพบุรี นครปฐม นครสวรรค์ )"},
          { id: "6", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 6 (จันทบุรี ระยอง ปราจีนบุรี ฉะเชิงเทรา )"},
          { id: "7", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 7 (สุราษฎร์ธานี นครศรีธรรมราช กระบี่ ระนอง ภูเก็ต พังงา ชุมพร )"},
          { id: "8", value: "สำนักวิจัยและพัฒนาการเกษตรเขตที่ 8 (สงขลา ตาราง ตรัง นราธิวาส ปัตตานี ยะลา พัทลุง สตูล )"},
          { id: "9", value: "สำนักควบคุมพืชและวัสดุการเกษตร กรุงเทพมหานคร"},
        ],
        cert_age : [
          { id: "3", value: "จำหน่ายสารไกลโฟเซต"},
          { id: "5", value: "ไม่จำหน่ายสารไกลโฟเซต"},
        ]
      }
    },
    components: {
      Loader,Subhead
    },
    methods: {
      getCertAreaValue(certAreaId) {
        const area = this.cert_area.find(item => item.id === certAreaId);
        return area ? area.value : '';
      },
      getCertAgeValue(certAgeId) {
        const age = this.cert_age.find(item => item.id === certAgeId);
        return age ? age.value : '';
      },
      openCertificatePage(token,lesson) {
        window.open('https://doa.fti.or.th/certification-force?token=' + token + '&session=' + lesson, '_blank');
      },
      formatThaidate(date) {
        return convertUtils.toThaiDatetime(date,"short");
      },
      dateTime(value) {
        return moment(value).format("DD/MM/YYYY hh:mm:ss");
      },
      async getData() {
        if (storageManager.get('session', 'login')) {
          try {
              let item = this.$route.params.id;
              this.loading_sources = false;


              const pipeline = [
              {
                $match: {
                  _id: item
                }
              },
              {
                $lookup: {
                  from: "enroll",
                  let: { enrollIds: "$enroll" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: [{ $toString: "$_id" }, { $map: { input: "$$enrollIds", in: { $toString: "$$this" } } }]
                        }
                      }
                    },
                    {
                      $addFields: {
                        courseID: {
                          $cond: [
                            { $in: [{ $type: "$courseID" }, ["string", "objectId"]] },
                            { $toObjectId: "$courseID" },
                            "$courseID"
                          ]
                        }
                      }
                    },
                    {
                      $lookup: {
                        from: "course",
                        localField: "courseID",
                        foreignField: "_id",
                        as: "courseData"
                      }
                    },
                    {
                      $addFields: {
                        courseData: { $arrayElemAt: ["$courseData", 0] }
                      }
                    },
                    {
                      $unset: ["courseID"]
                    },
                    {
                      $lookup: {
                        from: "order",
                        localField: "courseData._id",
                        foreignField: "courseData._id",
                        as: "orderData"
                      }
                    }
                  ],
                  as: "enrollData"
                }
              },
              {
                $lookup: {
                  from: "course",
                  localField: "enrollData.courseID",
                  foreignField: "_id",
                  as: "courseData"
                }
              },
              {
                $lookup: {
                  from: "order",
                  let: { orderIds: "$order" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: [{ $toString: "$_id" }, { $map: { input: "$$orderIds", in: { $toString: "$$this" } } }]
                        }
                      }
                    },
                    {
                      $addFields: {
                        courseID: {
                          $cond: [
                            { $in: [{ $type: "$courseID" }, ["string", "objectId"]] },
                            { $toObjectId: "$courseID" },
                            "$courseID"
                          ]
                        },
                        userID: {
                          $cond: [
                            { $in: [{ $type: "$userID" }, ["string", "objectId"]] },
                            { $toObjectId: "$userID" },
                            "$userID"
                          ]
                        }
                      }
                    },
                    {
                      $lookup: {
                        from: "course",
                        localField: "courseID",
                        foreignField: "_id",
                        as: "courseData"
                      }
                    },
                    {
                      $addFields: {
                        courseData: { $arrayElemAt: ["$courseData", 0] }
                      }
                    },
                    {
                      $unset: ["courseID"]
                    }
                  ],
                  as: "orderData"
                }
              },
              {
                $addFields: {
                  enroll: {
                    $cond: [
                      { $isArray: "$enrollData" },
                      {
                        $map: {
                          input: "$enrollData",
                          as: "enroll",
                          in: {
                            $mergeObjects: [
                              "$$enroll",
                              {
                                orderData: {
                                  $arrayElemAt: ["$orderData", { $indexOfArray: ["$enrollData.courseData._id", "$$enroll.courseData._id"] }]
                                }
                              }
                            ]
                          }
                        }
                      },
                      []
                    ]
                  },
                  order: "$orderData"
                }
              },
              {
                $project: {
                  profile: {
                    $arrayToObject: {
                      $filter: {
                        input: { $objectToArray: "$$ROOT" },
                        cond: { $not: { $in: ["$$this.k", ["enrollData", "orderData","courseData","enroll","order"]] } }
                      }
                    }
                  },
                  enroll: "$enroll",
                  order: "$order"
                }
              }
            ];

            const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/user/aggregate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json','client-token-key':this.configs.key
              },
              body: JSON.stringify({ pipeline })
            });

            const RestReturn = await resAPI.json();

            if (resAPI.status === 200) {

              const enrollData = RestReturn[0].enroll;
              const orderData = RestReturn[0].order;
              const profileData = RestReturn[0].profile;

              console.log("enrollData",enrollData);
              console.log("orderData",orderData);
              console.log("profileData",profileData);

              this.profile = profileData;
              this.enroll = enrollData;
              this.order = orderData; 

              if(!this.profile.avatar) {
                this.getProfileData(this.profile.old_id);
              }

              this.loading_sources = true;
            }
          } catch (error) {
            console.log(error);
          }
        }
      },
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            let accessToken       = storageManager.get('session','token')
            let item              = this.$route.params.id;
            const resAPI          = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/schools/removeAdmin/" + item,
            {
              method: 'POST',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + accessToken},
              body: JSON.stringify({
                userId: id,
              })
            });

            console.log(await resAPI);

            this.loading_sources = true;
            await this.getData();

          } catch (error) {
            console.log(error)
          }
        }
      },
      async getProfileData(id) {
        if(storageManager.get('session','login')) {
          try {
            const url = `https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-3bf765c8-bb4f-4bac-ba41-9698000f7334/default/getstudentdata?id=${id}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
          } catch (error) {
            console.log(error)
          }
        }
      },
      updated() {
        feather.replace();
      },
    },
    async mounted () {
      try {
        await this.getData();
        const urlParams = new URLSearchParams(window.location.search);
        const backParam = urlParams.get('back');
        this.back = backParam;
      } catch (error) {
        console.log(Error);
      }
    },
    setup() {
      //console.log("Setup");
    },
    computed: {
      showTaxInvoice() {
        return (
          this.enroll.orderData.address.tax.address.taX_ID &&
          this.enroll.orderData.address.tax.address.owneR_NAME_TH
        );
      },
    },
};
</script>

<template>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>

  <Subhead  v-if="loading_sources" 
    :navigation="
    [
      {
        name: 'ย้อนกลับ',
        link: this.back ? this.back : '/student/dashboard',
        style: 'chevron-left',
        class: 'default-btn',
        visible: true,
        type: 'button',
      },
    ]"
  />

<!-- Page header -->
  <div class="mt-8 mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
    
    <div class="flex items-center space-x-5">
      <div class="flex-shrink-0">
        <div class="relative">
          <img class="h-16 w-16 rounded-full" src="https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80" alt="">
          <span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true"></span>
        </div>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ this.profile.firstname + ' ' +  this.profile.lastname }}</h1>
        <p class="text-sm font-medium text-gray-500">ลงทะเบียนเมื่อ <span>{{ formatThaidate(profile.info?.regdate) }}</span></p>
      </div>
    </div>
    <div class="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
      
      <button 
      @click="$router.push('/school/edit/' + this.dataItem)"
      type="button" 
      class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
      <font-awesome-icon :icon="['fas','pencil']" class="text-black text-[12px] mr-2"/> แก้ไขข้อมูล
      </button>

      <button
      @click="$router.push('/school/admin/'+this.dataItem)"
      type="button" 
      class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
      <font-awesome-icon :icon="['fas','user-tie']" class="text-black text-[12px] mr-2"/> เพิ่มผู้ดูแล
      </button>

      <button 
      type="button" 
      class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
      <font-awesome-icon :icon="['fas','trash']" class="text-black text-[12px] mr-2"/> ลบ
      </button>

    </div>
  </div>

  <div class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2 lg:col-start-1">
      <!-- Description list-->
      <section aria-labelledby="applicant-information-title">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h2 id="applicant-information-title" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลส่วนตัวผู้สมัคร</h2>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">

              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">รหัส</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ this.profile.token }}</dd>
              </div>

              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Phone</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ this.profile.phone }}</dd>
              </div>

              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ this.profile.email }}</dd>
              </div>

              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">หลักฐานประกอบการสมัคร</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <ul role="list" class="divide-y divide-gray-200 rounded-md border border-gray-200">
                    <li class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                      <div class="flex w-0 flex-1 items-center">
                        <!-- Heroicon name: mini/paper-clip -->
                        <svg class="h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clip-rule="evenodd" />
                        </svg>
                        <span class="ml-2 w-0 flex-1 truncate">resume_front_end_developer.pdf</span>
                      </div>
                      <div class="ml-4 flex-shrink-0">
                        <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Download</a>
                      </div>
                    </li>

                    <li class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                      <div class="flex w-0 flex-1 items-center">
                        <!-- Heroicon name: mini/paper-clip -->
                        <svg class="h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clip-rule="evenodd" />
                        </svg>
                        <span class="ml-2 w-0 flex-1 truncate">coverletter_front_end_developer.pdf</span>
                      </div>
                      <div class="ml-4 flex-shrink-0">
                        <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Download</a>
                      </div>
                    </li>
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <a href="#" class="block bg-gray-50 px-4 py-4 text-center text-sm font-medium text-gray-500 hover:text-gray-700 sm:rounded-b-lg"><font-awesome-icon :icon="['fas','upload']" class="text-gray-500 text-[12px] mr-2"/> แนบเอกสารใหม่</a>
          </div>
        </div>
      </section>

      <section v-for="(enroll) in this.enroll" :key="enroll._id" aria-labelledby="enroll-card">
        
        <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">

          <div class="divide-y divide-gray-200">

            <div class="bg-black px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 id="notes-title" class="text-[20px] font-bold text-white">{{enroll.courseData.name}}</h2>
              <button class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
                {{enroll.orderData.status}}
              </button>
            </div>
            
            <div class="px-2 py-3 sm:px-3">
              <p>
                <span class="text-gray-500">ชื่อผู้อบรม : </span>
                <span class="text-gray-600 font-semibold">{{ this.profile.firstname + ' ' +  this.profile.lastname }}</span>
              </p>
              <p>
                <span class="text-gray-500">ลงทะเบียนเมื่อ : </span>
                <span class="text-gray-600 font-semibold">{{formatThaidate(enroll.orderData.adddate)}}</span>
              </p>
              <p>
                <span class="text-gray-500">สถานะ : </span>
                <span class="text-gray-600 font-semibold">{{enroll.orderData.status}}</span>
              </p>
            </div>

            <div class="px-4 py-6 sm:px-6">
              <ul role="list" class="space-y-8">
                <li>
                  <div>

                    <div class="flex justify-between items-center">
                      <p class="font-semibold text-gray-900">ผลการเรียน</p>

                      <button class="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded"
                        v-if="enroll.analytics.post.message === 'ผ่านการรับรอง' || enroll.analytics.retest.message === 'ผ่านการรับรอง'"
                        @click="openCertificatePage(this.profile.token, enroll.courseData.lesson_old_id)">
                        <font-awesome-icon :icon="['fas','download']" class="text-[12px]"/> ดาวน์โหลดใบประกาศ
                      </button>
                      
                      <div class="w-32 text-center text-[16px] bg-gray-500 text-white font-medium rounded">

                        <template v-if="enroll.analytics.status === 'complete'">
                          <template v-if="enroll.analytics.post.score >= enroll.analytics.post.measure">
                            <div class="w-32 text-center text-[16px] font-medium rounded"
                                :class="{
                                  'bg-green-500 text-white': enroll.analytics.post.message === 'ผ่านการรับรอง',
                                  'bg-red-500 text-white': enroll.analytics.post.message !== 'ผ่านการรับรอง'
                                }">
                              {{ enroll.analytics.post.message }}
                            </div>
                          </template>
                          <template v-else>
                            <div class="w-32 text-center text-[16px] font-medium rounded"
                              :class="{
                                'bg-green-500 text-white': enroll.analytics.retest.message === 'ผ่านการรับรอง',
                                'bg-red-500 text-white': enroll.analytics.retest.message !== 'ผ่านการรับรอง'
                              }">
                              {{ enroll.analytics.retest.message }}
                            </div>
                          </template>
                        </template>
                        <template v-else>
                          <div class="text-[16px] font-medium">
                            ยังเรียนไม่จบ
                          </div>
                        </template>
                        
                      </div>
                    </div>

                    <div class="mt-4">
                      <span class="flex items-left mb-2 justify-left text-sm text-gray-500 font-medium">
                        Learning Progress: {{ Math.floor((enroll.analytics.complete / enroll.analytics.total) * 100) }}%
                      </span>
                      <div class="bg-gray-200 h-4 rounded-full">
                        <div class="bg-blue-500 h-full rounded-full" :style="{ width: `${(enroll.analytics.complete / enroll.analytics.total) * 100}%` }"></div>
                      </div>
                    </div>

                    <div class="mt-4">
                      <div class="grid grid-cols-4 gap-2">
                        <div class="col-span-1">
                          <div class="border border-gray-200 shadow-sm rounded-md p-4">
                            <div class="text-center">
                              <div class="text-2xl font-bold text-blue-500">{{ enroll.analytics.option.exam_round === 'first' ? 'รอบแรก' : 'รอบสอง' }}</div>
                              <div class="font-medium text-gray-500">รอบการสอบ
                                <button class="bg-transparent font-normal text-sm py-1 px-2 rounded">
                                  <font-awesome-icon :icon="['fas','pencil']" class="text-gray-500 hover:text-gray-700 text-[12px]"/>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-span-1">
                          <div class="border border-gray-200 shadow-sm rounded-md p-4">
                            <div class="text-center">

                              <div class="text-2xl font-bold" :class="{ 'text-green-500': enroll.analytics.pre.score >= enroll.analytics.pre.measure, 'text-red-500': enroll.analytics.pre.score < enroll.analytics.pre.measure }">
                                {{ enroll.analytics.pre.score ? enroll.analytics.pre.score : '0' }}
                              </div>
                              
                              <div class="font-medium text-gray-500">สอบก่อนเรียน
                                <button class="bg-transparent font-normal text-sm py-1 px-2 rounded">
                                  <font-awesome-icon :icon="['fas','search']" class="text-gray-500 hover:text-gray-700 text-[12px]"/>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-span-1">
                          <div class="border border-gray-200 shadow-sm rounded-md p-4">
                            <div class="text-center">
                              <div class="text-2xl font-bold" :class="{ 'text-green-500': enroll.analytics.post.score >= enroll.analytics.post.measure, 'text-red-500': enroll.analytics.post.score < enroll.analytics.post.measure }">
                                {{ enroll.analytics.post.score ? enroll.analytics.post.score : '0' }}
                              </div>

                              <div class="font-medium text-gray-500">สอบวัดผล
                                <button class="bg-transparent font-normal text-sm py-1 px-2 rounded">
                                  <font-awesome-icon :icon="['fas','search']" class="text-gray-500 hover:text-gray-700 text-[12px]"/>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-span-1">
                          <div class="border border-gray-200 shadow-sm rounded-md p-4">
                            <div class="text-center">

                              <template v-if="enroll.analytics.post.score >= enroll.analytics.post.measure">
                                <div class="text-2xl font-bold text-gray-300">{{ enroll.analytics.retest.score ? enroll.analytics.retest.score : 'ไม่มีสอบ' }}</div>
                              </template>
                              <template v-else>
                                <div class="text-2xl font-bold text-red-500">{{ enroll.analytics.retest.score ? enroll.analytics.retest.score : '0' }}</div>
                              </template>

                              <div class="font-medium text-gray-500">สอบซ่อม 
                                <button class="bg-transparent font-normal text-sm py-1 px-2 rounded">
                                  <font-awesome-icon :icon="['fas','search']" class="text-gray-500 hover:text-gray-700 text-[12px]"/>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div class="px-4 py-6 sm:px-6">
              <ul role="list" class="space-y-8">
                <li>
                  <div>
                    <div class="text-md">
                      <p class="font-semibold text-gray-900">ข้อมูลใบรับรอง</p>
                    </div>

                    <div class="mt-4">
                      <div class="grid grid-cols-1 gap-2">
                        <div class="col-span-1">
                          <div class="border border-gray-200 shadow-sm rounded-md p-4">
                            <div class="text-center">
                              <div class="text-lg font-bold text-blue-500">{{ getCertAreaValue(enroll.analytics.option.cert_area) }}</div>
                              <div class="font-medium text-gray-500">พื้นที่การใช้ใบรับรอง
                                <button class="bg-transparent font-normal text-sm py-1 px-2 rounded">
                                  <font-awesome-icon :icon="['fas','pencil']" class="text-gray-500 hover:text-gray-700 text-[12px]"/>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="col-span-1">
                          <div class="border border-gray-200 shadow-sm rounded-md p-4" :class="{ 'opacity-50': !enroll.analytics.option.cert_age }">
                            <div class="text-center">
                              <div class="text-lg font-bold text-blue-500">{{ getCertAgeValue(enroll.analytics.option.cert_age) || 'none'}}</div>
                              <div class="font-medium text-gray-500">การจำหน่ายสาร
                                <button class="bg-transparent font-normal text-sm py-1 px-2 rounded">
                                  <font-awesome-icon :icon="['fas','pencil']" class="text-gray-500 hover:text-gray-700 text-[12px]"/>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            
            <div class="px-4 py-6 sm:px-6">
              <div class="flex justify-between items-center">
                <p class="font-semibold text-gray-900">ข้อมูลการสั่งซื้อ</p>
                <div class="w-24 text-center text-[24px] bg-gray-500 text-white font-medium rounded">
                  {{ enroll.orderData.price }}
                </div>
              </div>
              <div class="mt-2 space-y-2 text-md">

                <div class="mb-5">
                <p>
                  <span class="text-gray-500">ชื่อผู้สั่งซื้อ : </span>
                  <span class="text-gray-600 font-semibold">{{ enroll.orderData.address.invoice.name }}</span>
                </p>
                <p>
                  <span class="text-gray-500">วันที่สั่งซื้อ : </span>
                  <span class="text-gray-600 font-semibold">{{ formatThaidate(enroll.orderData.adddate) }}</span>
                </p>
                <p>
                  <span class="text-gray-500">ช่องทางการชำระเงิน : </span>
                  <span class="text-gray-600 font-semibold">{{ enroll.orderData.payment === 'transfer' ? 'โอนเงิน' : 'บิลเพย์เมนต์' }}</span>
                </p>
                <p>
                  <span class="text-gray-500">ใบเสร็จ : </span>
                  <span class="text-gray-600 font-semibold">{{ enroll.analytics.option.get_receipt === 'online' ? 'ออนไลน์' : 'ตัวจริง' }}</span>
                </p>
                <p>
                  <span class="text-gray-500">Ref1 : </span>
                  <span class="text-gray-600 font-semibold">{{ enroll.orderData.ref1 }}</span>
                </p>
                <p>
                  <span class="text-gray-500">Ref2 : </span>
                  <span class="text-gray-600 font-semibold">{{ enroll.orderData.ref2 }}</span>
                </p>
                <p>
                  <span class="text-gray-500">Ref3 : </span>
                  <span class="text-gray-600 font-semibold">{{ enroll.orderData.ref3 }}</span>
                </p>
                </div>
                

                <div class="flex items-start justify-between border-t border-gray-200 pt-5 pb-5">
                  <div class="w-{{ showTaxInvoice ? '1/3' : '2/3' }} pr-5">
                    <div class="flex items-center">
                      <div>
                        <div class="flex items-center justify-between">
                          <div class="block font-medium text-gray-700 mb-2">ที่อยู่ที่ติดต่อได้/จัดส่งเอกสาร</div>
                          <button class="bg-transparent font-normal text-sm py-1 px-2 rounded">
                            <font-awesome-icon :icon="['fas','pencil']" class="text-gray-500 hover:text-gray-700 text-[10px]"/>
                          </button>
                        </div>
                        <span class="font-normal text-sm text-gray-500">
                          {{ enroll.orderData.address.delivery.name }} <br>
                          {{ enroll.orderData.address.delivery.phone }} <br>
                          เลขที่ {{ enroll.orderData.address.delivery.address.mailinG_NO || '-' }}
                          หมู่ {{ enroll.orderData.address.delivery.address.mailinG_MOO || '-' }}
                          ถนน {{ enroll.orderData.address.delivery.address.mailinG_ROAD_TH || '-' }}
                          อาคาร {{ enroll.orderData.address.delivery.address.mailinG_BUILDING_TH || '-' }}
                          ตำบล {{ enroll.orderData.address.delivery.address.mailinG_SUB_DISTRICT_TH || '-' }}
                          อำเภอ {{ enroll.orderData.address.delivery.address.mailinG_DISTRICT_TH || '-' }}
                          จังหวัด {{ enroll.orderData.address.delivery.province || '-' }}
                          {{ enroll.orderData.address.delivery.zipcode || '-' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="w-{{ showTaxInvoice ? '1/3' : '2/3' }} border-l border-r border-gray-300 pl-4 pr-5">
                    <div class="flex items-center">
                      <div>
                        <div class="flex items-center justify-between">
                          <div class="block font-medium text-gray-700 mb-2">ที่อยู่ออกใบเสร็จ</div>
                          <button class="bg-transparent font-normal text-sm py-1 px-2 rounded">
                            <font-awesome-icon :icon="['fas','pencil']" class="text-gray-500 hover:text-gray-700 text-[10px]"/>
                          </button>
                        </div>
                        <span class="font-normal text-sm text-gray-500">
                          {{ enroll.orderData.address.invoice.name }} <br>
                          {{ enroll.orderData.address.invoice.phone }} <br>
                          เลขที่ {{ enroll.orderData.address.invoice.address.officE_NO || enroll.orderData.address.invoice.address.taX_NO || '-' }}
                          หมู่ {{ enroll.orderData.address.invoice.address.officE_MOO || enroll.orderData.address.invoice.address.taX_MOO || '-' }}
                          ถนน {{ enroll.orderData.address.invoice.address.officE_ROAD_TH || enroll.orderData.address.invoice.address.taX_ROAD_TH || '-' }}
                          อาคาร {{ enroll.orderData.address.invoice.address.officE_BUILDING_TH || enroll.orderData.address.invoice.address.taX_BUILDING_TH || '-' }}
                          ตำบล {{ enroll.orderData.address.invoice.address.officE_SUB_DISTRICT_TH || enroll.orderData.address.invoice.address.taX_SUB_DISTRICT_TH || '-' }}
                          อำเภอ {{ enroll.orderData.address.invoice.address.officE_DISTRICT_TH || enroll.orderData.address.invoice.address.taX_DISTRICT_TH || '-' }}
                          จังหวัด {{ enroll.orderData.address.invoice.province || '-' }}
                          {{ enroll.orderData.address.invoice.zipcode || '-' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="w-{{ showTaxInvoice ? '1/3' : 'hidden' }} pl-4" v-if="enroll.orderData.address.tax.address.taX_ID && enroll.orderData.address.tax.address.owneR_NAME_TH">
                    <div class="flex items-center">
                      <div>
                        <div class="flex items-center justify-between">
                          <div class="block font-medium text-gray-700 mb-2">ที่อยู่ออกใบกำกับภาษี</div>
                          <button class="bg-transparent font-normal text-sm py-1 px-2 rounded">
                            <font-awesome-icon :icon="['fas','pencil']" class="text-gray-500 hover:text-gray-700 text-[10px]"/>
                          </button>
                        </div>
                        <span class="font-normal text-sm text-gray-500">
                          {{ enroll.orderData.address.tax.address.owneR_NAME_TH }} ({{ enroll.orderData.address.tax.address.taX_ID }})<br>
                          {{ enroll.orderData.address.tax.phone }} <br>
                          เลขที่ {{ enroll.orderData.address.tax.address.taX_NO || '-' }}
                          หมู่ {{ enroll.orderData.address.tax.address.taX_MOO || '-' }}
                          ถนน {{ enroll.orderData.address.tax.address.taX_ROAD_TH || '-' }}
                          อาคาร {{ enroll.orderData.address.tax.address.taX_BUILDING_TH || '-' }}
                          ตำบล {{ enroll.orderData.address.tax.address.taX_SUB_DISTRICT_TH || '-' }}
                          อำเภอ {{ enroll.orderData.address.tax.address.taX_DISTRICT_TH || '-' }}
                          จังหวัด {{ enroll.orderData.address.tax.province || '-' }}
                          {{ enroll.orderData.address.invoice.zipcode || '-' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
          </div>

          <footer class="border-t border-gray-300 bg-gray-200 py-4 px-6 flex items-center justify-center">
            <div class="flex space-x-4">
              <button class="bg-blue-500 hover:bg-blue-600 text-sm text-white py-2 px-4 rounded">
                Button 1
              </button>
              <button class="bg-blue-500 hover:bg-blue-600 text-sm text-white py-2 px-4 rounded">
                Button 2
              </button>
              <button class="bg-blue-500 hover:bg-blue-600 text-sm text-white py-2 px-4 rounded">
                Button 3
              </button>
            </div>
          </footer>
        </div>
        
      </section>
      
      

      <!-- Comments-->
      

      <!-- <section aria-labelledby="notes-title">
        <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
          <div class="divide-y divide-gray-200">
            <div class="px-4 py-5 sm:px-6">
              <h2 id="notes-title" class="text-lg font-medium text-gray-900">คำสั่งซื้อ</h2>
            </div>
            <div class="px-4 py-6 sm:px-6">
              <ul role="list" class="space-y-8">

                <li v-for="(order) in this.order" :key="order._id">
                  <div class="flex space-x-3">
                    <div>
                      <div class="text-md">
                        <a href="#" class="font-medium text-gray-900">{{order.courseData.name}} - {{order.status}}</a>
                      </div>
                      <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">ที่อยู่ในการติดต่อ/จัดส่งเอกสาร</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.delivery.name }}</dd>
                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.delivery.address.mailinG_NO }} {{ order.address.delivery.address.mailinG_MOO }} {{ order.address.delivery.address.mailinG_ROAD_TH }} {{ order.address.delivery.address.mailinG_BUILDING_TH }} {{ order.address.delivery.address.mailinG_SUB_DISTRICT_TH }} {{ order.address.delivery.address.mailinG_DISTRICT_TH }}</dd>

                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.delivery.province }}</dd>
                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.delivery.phone }}</dd>
                      </div>
        
                      <div class="mt-4 sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">ที่อยู่ออกใบเสร็จ</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.invoice.name }}</dd>
                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.invoice.address.officE_NO }} {{ order.address.invoice.address.officE_MOO }} {{ order.address.invoice.address.officE_ROAD_TH }} {{ order.address.invoice.address.officE_BUILDING_TH }} {{ order.address.invoice.address.officE_SUB_DISTRICT_TH }} {{ order.address.invoice.address.officE_DISTRICT_TH }}</dd>

                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.invoice.province }}</dd>
                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.invoice.phone }}</dd>
                      </div>
        
                      <div class="mt-4 sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">ที่อยู่ในการออกใบกำกับภาษี</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.tax.name }}</dd>

                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.tax.address.owneR_NAME_TH }}</dd>
                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.tax.address.taX_ID }} {{ order.address.tax.address.taX_NO }} {{ order.address.tax.address.taX_MOO }} {{ order.address.tax.address.taX_ROAD_TH }} {{ order.address.tax.address.taX_BUILDING_TH }} {{ order.address.tax.address.taX_SUB_DISTRICT_TH }} {{ order.address.tax.address.taX_DISTRICT_TH }}</dd>

                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.tax.province }}</dd>
                        <dd class="mt-1 text-sm text-gray-900">{{ order.address.tax.phone }}</dd>
                      </div>
                    </div>
                  </div>
                </li>

              </ul>
            </div>
          </div>
          
        </div>
      </section> -->
      
    </div>

    <section aria-labelledby="timeline-title" class="lg:col-span-1 lg:col-start-3">
      <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">

        <div class="mb-5">
          <h3 class="font-medium text-gray-900">เจ้าหน้าที่</h3>
          <ul role="list" class="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
            
              <li v-for="(admin,index) in schoolAdmin" :key="index" class="flex items-center justify-between py-3">
                <div class="flex items-center">
                  <img src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=1024&amp;h=1024&amp;q=80" alt="" class="h-8 w-8 rounded-full">
                  <p class="ml-4 text-sm font-medium text-gray-900">{{ admin.email }}</p>
                </div>
                <div>
                  <button 
                  type="button" 
                  class="ml-6 rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <font-awesome-icon :icon="['fas','edit']" class="pr-2 pl-2"/> แก้ไข<span class="sr-only"> Aimee Douglas</span>
                  </button>
                  <button 
                  @click="deleteData(admin.id)"
                  type="button" 
                  class="ml-6 rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <font-awesome-icon :icon="['fas','trash']" class="pr-2 pl-2"/> ลบ<span class="sr-only"> Aimee Douglas</span>
                  </button>
                </div>
              </li>
        
            
            <li class="flex items-center justify-between py-2">
              <button type="button" class="group -ml-1 flex items-center rounded-md bg-white p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <span class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400">
                  <svg class="h-5 w-5" x-description="Heroicon name: mini/plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"></path>
                  </svg>
                </span>
                <span class="ml-4 text-sm font-medium text-indigo-600 group-hover:text-indigo-500" @click="$router.push('/school/admin/'+this.dataItem)">เพิ่มเจ้าหน้าที่</span>
              </button>
            </li>
          </ul>
        </div>

        <h2 id="timeline-title" class="text-lg font-medium text-gray-900">ประวัติการทำรายการ</h2>

        <!-- Activity Feed -->
        <div class="mt-6 flow-root">
          <ul role="list" class="-mb-8">
            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/user -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Applied to <a href="#" class="font-medium text-gray-900">Front End Developer</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-20">Sep 20</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/hand-thumb-up -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Advanced to phone screening by <a href="#" class="font-medium text-gray-900">Bethany Blake</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-22">Sep 22</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/check -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Completed phone screening with <a href="#" class="font-medium text-gray-900">Martha Gardner</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-28">Sep 28</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/hand-thumb-up -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Advanced to interview by <a href="#" class="font-medium text-gray-900">Bethany Blake</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-30">Sep 30</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/check -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Completed interview with <a href="#" class="font-medium text-gray-900">Katherine Snyder</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-10-04">Oct 4</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="justify-stretch mt-6 flex flex-col">
          <button type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Advance to offer</button>
        </div>
      </div>
    </section>
  </div>
</template>
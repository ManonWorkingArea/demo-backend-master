<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import Subhead from '@/interface/template/outline/Subhead.vue';

import Image from '@/interface/template/Image.vue';

import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";

import moment from 'moment';

moment().format();

import Enroll from "@/extensions/modules/elearning/student/component/resource/Enroll.vue";
import Document from "@/extensions/modules/elearning/student/component/resource/Document.vue";
import Order from "@/extensions/modules/elearning/student/component/resource/Order.vue";
import Profile from "@/extensions/modules/elearning/student/component/resource/Profile.vue";

import CopyButton from '@/utils/Clipboard.vue';

export default {

    data() {
      const route           = useRoute();
      return {
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        showCertAreaList: false,
        editingExamRound: false,
        editingCertAge: false,
        selectedAreaId: '', // Holds the selected area id
        selectedExamRound:'',
        selectedCertAge:'',
        PageName: route.meta.title,
        PageIcon: route.meta.icon,
        PagePath: route.meta.path,
        ParentName: route.meta.parent,
        ParentPage: route.meta.page,
        schoolData: [],
        profile: [],
        profileLoaded: false,
        enroll: [],
        order: [],
        dataItem: this.$route.params.id,
        loading_sources: true,
        back:'',
        capturedImageSrc: null,
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
        ],
        showPopup: false,

        // Wallet Config
        credits:0,
        amount: 0,
        walletMember: this.$route.params.id,
        walletMethod:'deposit',

        // Tab Content
        activeTab: 'enroll',
        tabs: [
          {
            code: "enroll",
            icon: 'book',
            shortname: "Enroll",
            name: "หลักสูตร",
            description: "Personal details and application.",
          },
          {
            code: "order",
            icon: 'shopping-cart',
            shortname: "Order",
            name: "คำสั่งซื้อ",
            description: "Asset details.",
          },
          {
            code: "document",
            icon: 'file',
            shortname: "File",
            name: "เอกสาร",
            description: "Admin settings.",
          },
          {
            code: "profile",
            icon: 'user',
            shortname: "Profile",
            name: "ข้อมูลส่วนตัว",
            description: "Storage information.",
          }
        ]
      }
    },
    components: {
      Loader,Subhead,Image,
      Enroll,
      Document,
      Order,
      Profile,
      CopyButton
    },
    methods: {
      // Tab Content
      setActiveTab(tabCode) {
        this.activeTab = tabCode;
        window.location.hash = `#${tabCode}`;
      },
     
      redirectToExternalUrl(token) {
        window.open("https://"+this.session.current.hostname + "/user/bypass/" + token, '_blank');
      },
      toggleCertAreaList(area) {
        this.showCertAreaList = !this.showCertAreaList;
        this.selectedAreaId = area
      },
      toggleCerAgeList(age) {
        this.editingCertAge = !this.editingCertAge;
        this.selectedCertAge = age
      },
      editExamRound(round) {
        this.editingExamRound   = !this.editingExamRound;
        this.selectedExamRound  = round;
      },
      openPopup(imageUrl) {
        this.imageUrl = imageUrl
        this.originalImageUrl = imageUrl
        this.showPopup        = true;
      },
      closePopup() {
        this.showPopup = false;
      },
      handleFileUrlUpdated(fileUrl) {
        this.updataData(fileUrl)
      },
      async updataData(image) {
          const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/user/" + this.profile._id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify({
                data: {
                  "avatar_img": image,
                },
                options: {}
            })
        });
        await callApi.json();

        if (callApi.status===200) {
          await this.getData(true);
          console.log("Update Profile Image");
        }
      },
      async submitArea(enroll) {
        try {
          enroll.activeBlock = true
          this.showCertAreaList = false
          // Prepare the request headers
          const headers = new Headers();
          headers.append('API-KEY', '5CB584F5ECFD7');
          headers.append('SECRET-KEY', '6A5891C7352197F8A5CE8A9B67EF3');

          // Make the POST request using the fetch API
          const response = await fetch('https://api2.fti.academy/api/editcert', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              student: this.profile.token,
              area_cert: this.selectedAreaId,
            })
          });
          const result = await response.json();
          
          this.updateEnroll(enroll._id)
          console.log("result",result);
        } catch (error) {
          console.error('An error occurred:', error);
        }
      },
      async submitRound(enroll) {
        try {
          this.editingExamRound = false
          enroll.activeBlock = true
          const headers = new Headers();
          headers.append('API-KEY', '5CB584F5ECFD7');
          headers.append('SECRET-KEY', '6A5891C7352197F8A5CE8A9B67EF3');
          const response = await fetch('https://api2.fti.academy/api/editround', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              student: this.profile.token,
              exam_round: this.selectedExamRound,
            })
          });
          const result = await response.json();
          this.updateEnrollRound(enroll._id)
          console.log("result",result);
        } catch (error) {
          console.error('An error occurred:', error);
        }
      },
      async submitAge(enroll) {
        try {
          this.editingCertAge = false
          enroll.activeBlock = true
          // Prepare the request headers
          const headers = new Headers();
          headers.append('API-KEY', '5CB584F5ECFD7');
          headers.append('SECRET-KEY', '6A5891C7352197F8A5CE8A9B67EF3');

          // Make the POST request using the fetch API
          const response = await fetch('https://api2.fti.academy/api/edit_certage', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              student: this.profile.token,
              cert_age: this.selectedCertAge,
            })
          });
          const result = await response.json();
          this.updateEnrollAge(enroll._id)
          console.log("result",result);
        } catch (error) {
          console.error('An error occurred:', error);
        }
      },
      async updateEnrollAge(id) {
        try {
          const resAPI2 = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/" + id);
          const existingData = await resAPI2.json();
          const newData = {
            ...existingData,
            analytics: {
              ...existingData.analytics,
              option: {
                ...existingData.analytics.option,
                cert_age: this.selectedCertAge,
              },
            },
          };

          delete newData._id;

          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/" + id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: newData,
            }),
          });

          await resAPI.json();
          await this.getData(false);

          if (resAPI.status === 200) {
            //console.log("Enroll " + id + " updated successfully!");
          }
        } catch (error) {
          console.log(error);
        }
      },
      async updateEnrollRound(id) {
        try {
          const resAPI2 = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/" + id);
          const existingData = await resAPI2.json();
          const newData = {
            ...existingData,
            analytics: {
              ...existingData.analytics,
              option: {
                ...existingData.analytics.option,
                exam_round: this.selectedExamRound,
              },
            },
          };

          delete newData._id;

          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/" + id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: newData,
            }),
          });

          await resAPI.json();
          await this.getData(false);

          if (resAPI.status === 200) {
            //console.log("Enroll " + id + " updated successfully!");
          }
        } catch (error) {
          console.log(error);
        }
      },
      async updateEnroll(id) {
        try {
          const resAPI2 = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/" + id);
          const existingData = await resAPI2.json();
          const newData = {
            ...existingData,
            analytics: {
              ...existingData.analytics,
              option: {
                ...existingData.analytics.option,
                cert_area: this.selectedAreaId,
              },
            },
          };

          delete newData._id;

          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/" + id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: newData,
            }),
          });

          await resAPI.json();
          await this.getData(false);

          if (resAPI.status === 200) {
            //console.log("Enroll " + id + " updated successfully!");
          }
        } catch (error) {
          console.log(error);
        }
      },
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
      async getData(force) {
        if (storageManager.get('session', 'login')) {
          try {
              let item = this.$route.params.id;

              if(force) {
                this.loading_sources = false;
              }
              
              const pipeline = [
              {
                $match: {
                  _id: item
                }
              },
              {
                $project: {
                  profile: "$$ROOT"
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

              //const enrollData = RestReturn[0].enroll;
              //const orderData = RestReturn[0].order;
              const profileData = RestReturn[0].profile;

              //console.log("enrollData",enrollData);
              //console.log("orderData",orderData);
              console.log("profileData",profileData);

              this.profile = profileData;
              this.profileLoaded = true;
              //this.order = orderData;
              this.credits = profileData && profileData.point && profileData.point.active ? profileData.point.active : 0;

              // Set activeBlock to false for each item in enrollData
              /*const processedEnrollData = enrollData.map(item => ({
                ...item,
                activeBlock: false
              }));

              this.enroll = processedEnrollData; // Use processedEnrollData
              */
              if(!this.profile.avatar_img) {
                this.profile.avatar_img = 'https://doa-academy.sgp1.digitaloceanspaces.com/2023/12/1701849647875.png';
              }
              if(force) {
                this.loading_sources = true;
              }
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
            await this.getData(true);

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
        await this.getData(true);
        await this.balanceTransactions();
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
    created() {
      //this.rotateImage(); // Rotate initially when the component is created
    },
    computed: {
      showTaxInvoice() {
        return (
          this.enroll.orderData.address.tax.address.taX_ID &&
          this.enroll.orderData.address.tax.address.owneR_NAME_TH
        );
      },
      imageStyle() {
        return {
          transform: `translate(${this.imagePositionX}px, ${this.imagePositionY}px) scale(${this.zoomPercentage / 100}) rotate(${this.rotationAngle}deg)`,
        };
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

  <Image v-if="showPopup"
  :cropImageWidth="'600px'"
  :cropImageHeight="'600px'"
  :uploadPath="'Upload/_profile/'" 
  :imageUrl="imageUrl"
  :filePrefix="this.profile._id" 
  @fileUrlUpdated="handleFileUrlUpdated" 
  @close-popup-event="closePopup"/>

  <div class="bg-white border-b border-gray-200">

    <div v-if="loading_sources" class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      
      <div class="pt-5">
        
        <div class="mx-auto max-w-3xl md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl ">

          <div class="flex items-center space-x-5">
      
            <div class="flex-shrink-0">
              <div class="relative">
                <div class="h-24 w-24 rounded-md cursor-pointer">
      
                  <img
                    class="h-full w-full rounded-md"
                    :src="profile.avatar_img"
                    :key="profile.avatar_img"
                    alt=""
                  />
                  <div class="absolute inset-0 rounded-md bg-black bg-opacity-0 hover:bg-opacity-50 flex justify-center items-center transition duration-300"
                  @click="openPopup(profile.avatar_img)"
                  >
                  <font-awesome-icon :icon="['fas','upload']" class="text-white text-[24px] opacity-0 hover:opacity-100"/>
                  </div>
                </div>
      
              </div>
            </div>
      
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ this.profile.firstname + ' ' +  this.profile.lastname }}</h1>
              <p class="text-sm text-gray-800">ลงทะเบียน : <span class="text-gray-500">{{ this.profile?.createdAt }}</span></p>
              <p class="text-sm text-gray-800">Email : <span class="text-gray-500">{{ this.profile?.email }}</span></p>
              <p class="text-sm text-gray-800">Phone : <span class="text-gray-500">{{ this.profile?.phone }}</span></p>
            </div>
      
          </div>
          <div class="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            
            <!-- <button 
            @click="$router.push('/school/edit/' + this.dataItem)"
            type="button" 
            class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
            <font-awesome-icon :icon="['fas','pencil']" class="text-black text-[12px] mr-2"/> แก้ไข
            </button> -->
            
            <copy-button class="ml-1 text-gray-600 text-sm" :text="`https://${this.session.current.hostname}/user/bypass/${this.profile._id}`" :buttonText="`คัดลอกลิงค์เข้าสู่ระบบ`" :buttonTextDone="`คัดลอกแล้ว`"/>

            <button
              @click="redirectToExternalUrl(this.profile._id);"
              type="button" 
              class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            >
              <font-awesome-icon :icon="['fas','key']" class="text-black text-[12px] mr-2"/> เข้าสู่ระบบ
            </button>

            <button 
            type="button" 
            class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
            <font-awesome-icon :icon="['fas','trash']" class="text-black text-[12px] mr-2"/> ลบ
            </button>
      
          </div>
        </div>

      </div>
    
      <div>
        <div class="border-t border-gray-200 pt-3 mt-5">
          <ul class="flex space-x-2"  id="tab-list">
            <li
              v-for="(tab) in tabs"
              :key="tab.code"
              :class="{ 'text-gray-500': activeTab !== tab.code, 'text-black': activeTab === tab.code, 'border-b-4 border-blue-500': activeTab === tab.code }"
              class="cursor-pointer py-2 px-2"
              @click="setActiveTab(tab.code)"
            >
              <span class="hidden md:inline"><font-awesome-icon :icon="['fas',tab.icon]"/> {{ tab.name }} 
                <span v-if="tab.code === 'enroll'" class="text-xs bg-red-500 text-white py-0 px-1 rounded-md text-center">{{enroll.length}}</span>
                <span v-if="tab.code === 'material'" class="text-xs bg-red-500 text-white py-0 px-1 rounded-md text-center">0</span>
              </span>
              <span class="md:hidden text-xs"><font-awesome-icon :icon="['fas',tab.icon]"/> {{ tab.shortname }}</span> <!-- Add icon here -->
            </li>
          </ul> 
          <select class="mb-3 md:hidden w-full border border-gray-300 rounded-md" id="tab-dropdown" @change="setActiveTab($event.target.value)">
            <option v-for="(tab) in tabs" :key="tab.code" :value="tab.code">{{ tab.name }}
              <template v-if="tab.code === 'enroll'">{{enroll.length}}</template>
              <template v-if="tab.code === 'material'">{{ playerCount }}</template>
            </option>
          </select>       
        </div>
      </div>
      
    </div>
  </div>

  <div class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-1">
    <div class="space-y-6 lg:col-span-2 lg:col-start-1">

      <section aria-labelledby="applicant-information-title" v-if="activeTab === 'enroll'">
        <Enroll v-if="profileLoaded" :enrolls="enroll" :member="profile" ref="enroll" :tabs="TabData" @update-badge="handleUpdateBadge"/>
      </section>

      <section aria-labelledby="applicant-information-title" v-if="activeTab === 'order'">
        <Order v-if="profileLoaded" :member="profile" ref="order" :tabs="TabData" @update-badge="handleUpdateBadge"/>
      </section>

      <section aria-labelledby="applicant-information-title" v-if="activeTab === 'document'">
        <Document v-if="profileLoaded" :member="profile" ref="document" :tabs="TabData" @update-badge="handleUpdateBadge"/>
      </section>

      <section aria-labelledby="applicant-information-title" v-if="activeTab === 'profile'">
        <Profile v-if="profileLoaded" :member="profile" ref="profile" :tabs="TabData" @update-badge="handleUpdateBadge"/>
      </section>

    </div>
  </div>
</template>
<style>
.master-image {
  display: inline-block;
  vertical-align: top;
}

canvas {
  display: inline-block;
  vertical-align: top;
  border: 1px solid #ccc;
  margin-left: 10px;
}
</style>
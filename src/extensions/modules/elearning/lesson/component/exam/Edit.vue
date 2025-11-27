<script>
import {useRoute} from 'vue-router'
import storageManager from '@/plugins/storage';
import ExamForm from './ExamForm.vue';

export default {
  name: 'ExamEdit',
  data() {
    const route = useRoute();
    return {
      PageName: route.meta.title,
      PageIcon: route.meta.icon,
      PagePath: route.meta.path,
      ParentName: route.meta.parent,
      ParentPage: route.meta.page,

      activeBlock: false,
      loading_sources: true,
      dataItem: this.$route.params.id,
      course: this.$route.params.id,
      history: this.$route.params.history,
      login: storageManager.get('session','login'),
      accessToken:storageManager.get('session','token'),
      configs: storageManager.get('configs'),
      examData: {},
      activeTab: 'tab1',
    }
  },
  components: {
    ExamForm
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    async getData() {
      if(this.login) {
        try {
          this.loading_sources = false;
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/exam/" + this.dataItem, {
            method: 'GET',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          });

          const RestReturn = await resAPI.json();
          this.examData = RestReturn;
          this.loading_sources = true;
        } catch (error) {
          console.log(error)
        }
      }
    },
    async handleSubmit(formData) {
      if(this.login) {
        try {
          const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/exam/" + this.dataItem, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            body: JSON.stringify({
              data: formData,
              options: {}
            })
          });
          
          await callApi.json();

          if(callApi.status===200) {
            this.$swal({ 
              title: "บันทึกข้อมูลเรียบร้อยแล้ว ?",
              text: "คุณต้องการที่จะดำเนินการอย่างไร !",
              type: "success",
              showCancelButton: true,
              confirmButtonColor: "#0054b4",
              confirmButtonText: "กลับไปหน้าแบบทดสอบ",
              cancelButtonText: "แก้ไขต่อ",
              closeOnConfirm: false,
              closeOnCancel: false 
            }).then((confirmed) => {
              if (confirmed.isConfirmed) {
                window.location.href = "/lesson/exam/detail/" + this.history
              } else {
                window.location.reload();
              }
            });
          }
        } catch (error) {
          console.log(error)
        }
      }
    },
    handleCancel() {
      this.$router.push('/lesson/detail/' + this.history)
    },
    saveData() {
      if (this.$refs.examFormComponent) {
        this.$refs.examFormComponent.handleSubmit();
      }
    }
  },
  async mounted() { 
    try {
      await this.getData();
      const access = storageManager.get('session','access')
      this.accessSession = access.current;
    } catch (error) {
      console.log(error);
    }
  }
}
</script>

<template>

<div v-if="loading_sources">
  <header class="py-2 border-gray-800 bg-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
      <div class="min-w-0 flex-1">
        <h1 class="text-xl font-bold leading-7 text-gray-700 sm:truncate sm:text-1xl sm:tracking-tight">
          <font-awesome-icon :icon="['fas',PageIcon]" class="text-gray-500 text-[24px]" /> {{ PageName }}
        </h1>
      </div>
      <div class="mt-5 flex xl:mt-0 xl:ml-4">
        <span class="hidden sm:block">
          <button @click="$router.push('/lesson/detail/' + this.history)" type="button" class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
            <font-awesome-icon :icon="['fas','chevron-left']" class="text-black text-[12px] mr-2" />
            ย้อนกลับ
          </button>

          <button @click="saveData" type="button" class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <font-awesome-icon :icon="['fas','save']" class="text-white text-[12px] pt-[3px] mr-2" /> บันทึกข้อมูล
          </button>
        </span>
      </div>
    </div>
  </header>

  <div class="flex-1 bg-gray-100 pt-2 pb-5 border-t">
    <div class="mt-4">
      <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
        <div class="sm:px-6 lg:col-span-9 lg:px-0">

          <div class="tabs relative mb-6">
            <ul class="flex">
              <li class="mr-1">
                <a @click="setActiveTab('tab1')" class="inline-block py-3 px-6 text-md rounded-md " :class="{ 'shadow bg-white text-blue-800': activeTab === 'tab1' }">
                  <i class="fas fa-clipboard-list"></i> แก้ไขแบบทดสอบ
                </a>
              </li>
              <li class="mr-1">
                <a @click="setActiveTab('tab2')" class="inline-block py-3 px-6 text-md rounded-md " :class="{ 'shadow bg-white text-blue-800': activeTab === 'tab2' }">
                  <i class="fas fa-question-circle"></i> จัดการคำถาม
                </a>
              </li>
              <li class="mr-1">
                <a @click="setActiveTab('tab3')" class="inline-block py-3 px-6 text-md rounded-md " :class="{ 'shadow bg-white text-blue-800': activeTab === 'tab3' }">
                  <i class="fas fa-chart-bar"></i> รายงานผลการสอบ
                </a>
              </li>
            </ul>
          </div>

          <div v-if="activeTab === 'tab1'" class="">
            <ExamForm
              ref="examFormComponent"
              mode="edit"
              :examData="examData"
              :course="course"
              :history="history"
              @submit="handleSubmit"
              @cancel="handleCancel"
            />
          </div>

          <div v-if="activeTab === 'tab2'" class="tab-content">
            <section aria-labelledby="questions-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
              <div class="divide-y divide-gray-200 overflow-hidden bg-white mb-8 shadow rounded-md">
                <div class="px-4 py-5 sm:px-6">
                  <h2 id="questions-heading" class="text-lg font-bold leading-6 text-gray-900">จัดการคำถาม</h2>
                  <p class="mt-1 text-sm text-gray-500">เพิ่ม แก้ไข และจัดการคำถามของแบบทดสอบ</p>
                </div>
                <div class="px-4 py-5 sm:p-6">
                  <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-question-circle text-4xl mb-4"></i>
                    <p>ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div v-if="activeTab === 'tab3'" class="tab-content">
            <section aria-labelledby="reports-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
              <div class="divide-y divide-gray-200 overflow-hidden bg-white mb-8 shadow rounded-md">
                <div class="px-4 py-5 sm:px-6">
                  <h2 id="reports-heading" class="text-lg font-bold leading-6 text-gray-900">รายงานผลการสอบ</h2>
                  <p class="mt-1 text-sm text-gray-500">ดูสถิติและรายงานผลการสอบของผู้เรียน</p>
                </div>
                <div class="px-4 py-5 sm:p-6">
                  <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-chart-bar text-4xl mb-4"></i>
                    <p>ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>

</template>
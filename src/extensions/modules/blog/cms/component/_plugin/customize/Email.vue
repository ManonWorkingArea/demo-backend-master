<template>
  <div class="my-5">
      <div class="px-2 pb-4 flex justify-between items-center">
          <div>
              <h1 class="text-lg font-bold">Header</h1>
              <p class="mt-2 text-gray-600">This is the main body content section.</p>
          </div>
          <button @click="saveConfig" class="bg-blue-500 text-white px-4 py-2 rounded">
            <i class="fa fa-save"></i> บันทึกข้อมูล
          </button>
      </div>

      
      <!-- Row 1 -->
      <div class="flex flex-col md:flex-row">
        <div class="w-full md:w-9/12 p-2 order-2 md:order-1 border border-gray-200">
          <!-- Side bar -->
          <header class="shadow">
            <Render v-if="load_hostname" :key="selectedItems.welcomeEmail" :dataItem="selectedItems.welcomeEmail" :mode="'id'"/>
          </header>
        </div>
        <div class="w-full md:w-3/12 p-2 order-1 md:order-2 border border-gray-200">
          <!-- Main Content -->
          <header class="relative bg-white shadow p-5">
            <h1 class="text-lg font-bold">welcomeEmail Section</h1>
            <div class="flex">
              <div class="w-1/2 pr-2">
                <p>{{ getPageTitle(selectedItems.welcomeEmail) }}</p>
              </div>
              <div class="w-1/2 pl-2">
                <input 
                  type="text" 
                  v-model="searchTerms.welcomeEmail" 
                  @focus="showPanels.welcomeEmail = true; filterOptions('welcomeEmail')" 
                  
                  @input="filterOptions('welcomeEmail')" 
                  class="w-full border rounded p-2"
                  placeholder="ค้นหา welcomeEmail..."
                />
                
                <div v-if="showPanels.welcomeEmail" class="panel shadow">
                  <div class="p-2 flex justify-between items-center">
                    <h2 class="font-bold">welcomeEmail Options</h2>
                    <button @click="hidePanel('welcomeEmail')" class="text-red-500">ปิด</button>
                  </div>
                  <div v-for="(page, index) in filteredLists.welcomeEmail" :key="index" @click.stop="selectPage(page, 'welcomeEmail')" class="p-2 hover:bg-gray-200 cursor-pointer">
                    {{ page.title }}
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      <!-- Row 1 -->
      <div class="flex flex-col md:flex-row">
        <div class="w-full md:w-9/12 p-2 order-2 md:order-1 border border-gray-200">
          <!-- Side bar -->
          <header class="shadow">
            <Render v-if="load_hostname" :key="selectedItems.recoveryPassword" :dataItem="selectedItems.recoveryPassword" :mode="'id'"/>
          </header>
        </div>
        <div class="w-full md:w-3/12 p-2 order-1 md:order-2 border border-gray-200">
          <!-- Main Content -->
          <header class="relative bg-white shadow p-5">
            <h1 class="text-lg font-bold">recoveryPassword Section</h1>
            <div class="flex">
              <div class="w-1/2 pr-2">
                <p>{{ getPageTitle(selectedItems.recoveryPassword) }}</p>
              </div>
              <div class="w-1/2 pl-2">
                <input 
                  type="text" 
                  v-model="searchTerms.recoveryPassword" 
                  @focus="showPanels.recoveryPassword = true; filterOptions('recoveryPassword')" 
                  
                  @input="filterOptions('recoveryPassword')" 
                  class="w-full border rounded p-2"
                  placeholder="ค้นหา recoveryPassword..."
                />
                
                <div v-if="showPanels.recoveryPassword" class="panel shadow">
                  <div class="p-2 flex justify-between items-center">
                    <h2 class="font-bold">recoveryPassword Options</h2>
                    <button @click="hidePanel('recoveryPassword')" class="text-red-500">ปิด</button>
                  </div>
                  <div v-for="(page, index) in filteredLists.recoveryPassword" :key="index" @click.stop="selectPage(page, 'recoveryPassword')" class="p-2 hover:bg-gray-200 cursor-pointer">
                    {{ page.title }}
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      <!-- Row 1 -->
      <div class="flex flex-col md:flex-row">
        <div class="w-full md:w-9/12 p-2 order-2 md:order-1 border border-gray-200">
          <!-- Side bar -->
          <header class="shadow">
            <Render v-if="load_hostname" :key="selectedItems.general" :dataItem="selectedItems.general" :mode="'id'"/>
          </header>
        </div>
        <div class="w-full md:w-3/12 p-2 order-1 md:order-2 border border-gray-200">
          <!-- Main Content -->
          <header class="relative bg-white shadow p-5">
            <h1 class="text-lg font-bold">general Section</h1>
            <div class="flex">
              <div class="w-1/2 pr-2">
                <p>{{ getPageTitle(selectedItems.general) }}</p>
              </div>
              <div class="w-1/2 pl-2">
                <input 
                  type="text" 
                  v-model="searchTerms.general" 
                  @focus="showPanels.general = true; filterOptions('general')" 
                  
                  @input="filterOptions('general')" 
                  class="w-full border rounded p-2"
                  placeholder="ค้นหา general..."
                />
                
                <div v-if="showPanels.general" class="panel shadow">
                  <div class="p-2 flex justify-between items-center">
                    <h2 class="font-bold">general Options</h2>
                    <button @click="hidePanel('general')" class="text-red-500">ปิด</button>
                  </div>
                  <div v-for="(page, index) in filteredLists.general" :key="index" @click.stop="selectPage(page, 'general')" class="p-2 hover:bg-gray-200 cursor-pointer">
                    {{ page.title }}
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      <!-- Row 1 -->
      <div class="flex flex-col md:flex-row">
        <div class="w-full md:w-9/12 p-2 order-2 md:order-1 border border-gray-200">
          <!-- Side bar -->
          <header class="shadow">
            <Render v-if="load_hostname" :key="selectedItems.otp" :dataItem="selectedItems.otp" :mode="'id'"/>
          </header>
        </div>
        <div class="w-full md:w-3/12 p-2 order-1 md:order-2 border border-gray-200">
          <!-- Main Content -->
          <header class="relative bg-white shadow p-5">
            <h1 class="text-lg font-bold">otp Section</h1>
            <div class="flex">
              <div class="w-1/2 pr-2">
                <p>{{ getPageTitle(selectedItems.otp) }}</p>
              </div>
              <div class="w-1/2 pl-2">
                <input 
                  type="text" 
                  v-model="searchTerms.otp" 
                  @focus="showPanels.otp = true; filterOptions('otp')" 
                  
                  @input="filterOptions('otp')" 
                  class="w-full border rounded p-2"
                  placeholder="ค้นหา otp..."
                />
                
                <div v-if="showPanels.otp" class="panel shadow">
                  <div class="p-2 flex justify-between items-center">
                    <h2 class="font-bold">otp Options</h2>
                    <button @click="hidePanel('otp')" class="text-red-500">ปิด</button>
                  </div>
                  <div v-for="(page, index) in filteredLists.otp" :key="index" @click.stop="selectPage(page, 'otp')" class="p-2 hover:bg-gray-200 cursor-pointer">
                    {{ page.title }}
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>
      

  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import Render from '@/interface/template/BuilderRender.vue';
export default {
  name: 'ThemeComponent',
  data() {
    const accessToken = storageManager.get('session', 'token');
    const session = storageManager.get('session');
    return {
      accessToken,
      session,
      configs: storageManager.get('configs'),
      hostkey: this.$Key,
      loading_sources: true,
      load_hostname: false,
      limitItem: 50,
      limitOptions: [10, 20, 50, 100, 200, 500, 1000, 2000],
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      searchTerm: '',
      navigatorData: [],
      pageList: [],
      menuData: {
        icon: "list",
        description: "Web Menu",
        type: "navigation",
        name: "เมนู",
        mobile: true,
        tablet: true,
        laptop: true,
        desktop: true,
        position: "relative",
        customClass: "",
        customId: "",
        uid: "1707689005824",
        menu: "",
        menuName: "DOA Menu",
        alignment: "center",
        display: "horizontal",
        fontColor: "text-gray-900",
        hoverColor: "text-orange-600",
        itemSpace: 3,
        paddingTop: "5"
      },
      selectedItems: {
        welcomeEmail: "",
        recoveryPassword: "",
        otp: "",
        general: ""
      },
      theme: {
        homepage: "",
        header: "",
        subheader: "",
        footer: "",
        navigator: "",
        dashboard: "",
        checkout: "",
        login: "",
        resetpassword: "",
        changepassword: "",
        emailTemplates: {
          welcomeEmail: "",
          recoveryPassword: "",
          otp: "",
          general: ""
        }
      },
      showPanels: {
        welcomeEmail: false,
        recoveryPassword: false,
        otp: false,
        general: false
      },
      filteredLists: {
        welcomeEmail: [],
        recoveryPassword: [],
        otp: [],
        general: []
      },
      searchTerms: {
        welcomeEmail: '',
        recoveryPassword: '',
        otp: '',
        general: ''
      }
    };
  },
  components: {Render},
  methods: {
    async fetchDataFromHostname() {
      try {
        const { data, status } = await this.$Request.GET(`hostname/${this.session.current._id}`, this.hostkey);
        if (status === 200) {
          this.load_hostname = true;
          console.log('Data fetched from hostname:', data.theme);
          this.theme = data.theme;
          this.selectedItems.welcomeEmail = data.theme.emailTemplates.welcomeEmail || '';
          this.selectedItems.recoveryPassword = data.theme.emailTemplates.recoveryPassword || '';
          this.selectedItems.otp = data.theme.emailTemplates.otp || '';
          this.selectedItems.general = data.theme.emailTemplates.general || '';
          if (data.theme.navigator) {
             this.menuData.menu = this.selectedItems.navigator;
            // ทำการจัดการกับ navigatorData ตามที่ต้องการ
          }
        }
      } catch (error) {
        console.error('Error fetching data from hostname:', error);
      }
    },
    async getData(silent = false) {
      try {
        if (!silent) {
          this.loading_sources = false;
        }

        const pipeline = [
          {
            $match: {
              $and: [
                { owner: this.session.current._id },
                { type: { $in: ['page', 'layout', 'menu'] } }, // เปลี่ยนเงื่อนไขที่นี่
                {
                  $or: [
                    { title: { $regex: this.searchTerm, $options: 'i' } },
                    { slug: { $regex: this.searchTerm, $options: 'i' } }
                  ]
                }
              ],
            },
          },
          {
            $lookup: {
              from: 'form',
              let: { postID: { $toString: "$_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: [{ $toString: "$formID" }, "$$postID"]
                    }
                  }
                },
                {
                  $count: "formCount"
                }
              ],
              as: 'formCounts',
            },
          },
          {
            $addFields: {
              formCount: { $arrayElemAt: ['$formCounts.formCount', 0] }
            },
          },
          {
            $facet: {
              post: [
                { $skip: (this.currentPage - 1) * this.limitItem },
                { $limit: this.limitItem },
              ],
              totalCount: [{ $count: 'count' }],
            },
          },
        ];
        const requestBody = { pipeline };
        const { data } = await this.$Request.POST(`post/aggregate`, requestBody, this.configs.key);
        if (data) {
          const totalCount = data[0]?.totalCount?.[0]?.count || 0;
          this.pageList = data[0].post;
          this.totalItems = totalCount;
          this.totalPages = Math.ceil(totalCount / this.limitItem);
          if (!silent) {
            this.loading_sources = true;
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    updateConfig() {
      // อัปเดตข้อมูลธีมตามค่าที่เลือก
      if (this.selectedItems.welcomeEmail) {
        this.theme.emailTemplates.welcomeEmail = this.selectedItems.welcomeEmail; // อัปเดตข้อมูลธีมสำหรับ welcomeEmail
      }
      if (this.selectedItems.recoveryPassword) {
        this.theme.emailTemplates.recoveryPassword = this.selectedItems.recoveryPassword; // อัปเดตข้อมูลธีมสำหรับ recoveryPassword
      }
      if (this.selectedItems.general) {
        this.theme.emailTemplates.general = this.selectedItems.general; // อัปเดตข้อมูลธีมสำหรับ general
      }
      if (this.selectedItems.otp) {
        this.theme.emailTemplates.otp = this.selectedItems.otp; // อัปเดตข้อมูลธีมสำหรับ otp
      }
    },
    saveConfig() {
      this.updateThemeData();
      console.log('Config saved');
    },
    getPageTitle(id) {
      const page = this.pageList.find(p => p._id === id);
      return page ? page.title : 'ไม่มีชื่อ';
    },
    filterOptions(type) {
      const searchTerm = this.searchTerms[type];
      const filteredList = searchTerm 
        ? this.pageList.filter(page => 
            page.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [...this.pageList]; // แสดงทั้งหมดเมื่อไม่มีคำค้นหา

      this.filteredLists[type] = filteredList; // อัปเดตค่าที่กรองตามประเภท
    },
    selectPage(page, type) {
      if (page && type) {
        this.selectedItems[type] = page._id;
        this.showPanels[type] = false;
        this.updateConfig();
      } else {
        console.warn('Invalid page or type');
      }
    },
    hidePanel(type) {
      this.showPanels[type] = false;
      this.searchTerms[type] = '';
    },
    async updateThemeData() {
      try {
        const requestBody = {
          data: {
            theme: this.theme // ใช้ข้อมูลธีมที่มีอยู่
          }
        };
        const { data, status } = await this.$Request.PUT(`hostname/${this.session.current._id}`, requestBody, this.hostkey);
        if (status === 200) {
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'success',
            title: 'อัปเดตข้อมูลธีม',
            text: 'อัปเดตข้อมูลธีมสำเร็จแล้ว',
          });
          console.log(data.data);
        }
      } catch (error) {
        console.error('Error updating theme data:', error);
      }
    },
  },
  mounted() {
    this.getData(); // เรียกใช้ฟังก์ชันเมื่อคอมโพเนนต์ถูกเมานต์
    this.fetchDataFromHostname(); // เรียกใช้ฟังก์ชันเมื่อคอมโพเนนต์ถูกเมานต์
    if (this.theme) {
      this.selectedItems.welcomeEmail = this.theme.emailTemplates.welcomeEmail || '';
      this.selectedItems.recoveryPassword = this.theme.emailTemplates.recoveryPassword || '';
      this.selectedItems.otp = this.theme.emailTemplates.otp || '';
      this.selectedItems.general = this.theme.emailTemplates.general || '';
    }
  },
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e5e7eb; /* เพิ่มเส้นขอบด้านล่าง */
}

.fixed-height {
  height: 600px; /* กำหนดความสูงคงที่ */
  overflow: hidden; /* ซ่อนข้อมูลที่ยาวเกินไป */
}

.panel {
  max-height: 200px; /* กำหนดความสูงสูงสุด */
  overflow-y: auto; /* ทำให้สามารถเลื่อนดูได้ */
  position: absolute; /* ทำให้แผงอยู่ในตำแหน่งที่ต้องการ */
  z-index: 10; /* ทำให้แผงอยู่ด้านบน */
  width: 100%; /* กำหนดความกว้างให้เต็ม */
  background-color: white; /* สีพื้นหลัง */
  top: 100%; /* เริ่มต้นจากด้านล่างของ input */
  left: 0; /* เริ่มต้นจากด้านซ้าย */
}
</style>
  
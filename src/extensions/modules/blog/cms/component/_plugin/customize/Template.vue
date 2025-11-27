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
    <div class="flex flex-col md:flex-row border-b">
      <div class="w-full md:w-9/12 p-2 order-2 md:order-1">
        <!-- Side bar -->
        <header class="bg-white shadow">
          <Render v-if="load_hostname" :key="selectedItems.header" :dataItem="selectedItems.header" :mode="'id'"/>
        </header>
      </div>
      <div class="w-full md:w-3/12 p-2 order-1 md:order-2">
        <!-- Main Content -->
        <header class="relative bg-white shadow p-5">
          <h1 class="text-lg font-bold">Header Section</h1>
          <div class="flex">
            <div class="w-1/2 pr-2">
              <p>{{ getPageTitle(selectedItems.header) }}</p>
            </div>
            <div class="w-1/2 pl-2">
              <input 
                type="text" 
                v-model="searchTerms.header" 
                @focus="showPanels.header = true; filterOptions('header')" 
                
                @input="filterOptions('header')" 
                class="w-full border rounded p-2"
                placeholder="ค้นหา Header..."
              />
              
              <div v-if="showPanels.header" class="panel shadow">
                <div class="p-2 flex justify-between items-center">
                  <h2 class="font-bold">Header Options</h2>
                  <button @click="hidePanel('header')" class="text-red-500">ปิด</button>
                </div>
                <div v-for="(page, index) in filteredLists.header" :key="index" @click.stop="selectPage(page, 'header')" class="p-2 hover:bg-gray-200 cursor-pointer">
                  {{ page.title }}
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>

    <div class="flex flex-col md:flex-row border-b">
      <div class="w-full md:w-9/12 p-2 order-2 md:order-1">
        <!-- Side bar -->
        <header class="bg-white shadow py-10">
          <Navigation v-if="load_hostname" :key="selectedItems.navigator" :data="menuData" :mode="'id'"/>
        </header>
      </div>
      <div class="w-full md:w-3/12 p-2 order-1 md:order-2">
        <!-- Main Content -->
        <header class="relative bg-white shadow p-5">
          <h1 class="text-lg font-bold">navigator Section</h1>
          <div class="flex">
            <div class="w-1/2 pr-2">
              <p>{{ getPageTitle(selectedItems.navigator) }}</p>
            </div>
            <div class="w-1/2 pl-2">
              <input 
                type="text" 
                v-model="searchTerms.navigator" 
                @focus="showPanels.navigator = true; filterOptions('navigator')" 
                
                @input="filterOptions('navigator')" 
                class="w-full border rounded p-2"
                placeholder="ค้นหา navigator..."
              />
              
              <div v-if="showPanels.navigator" class="panel shadow">
                <div class="p-2 flex justify-between items-center">
                  <h2 class="font-bold">navigator Options</h2>
                  <button @click="hidePanel('navigator')" class="text-red-500">ปิด</button>
                </div>
                <div v-for="(page, index) in filteredLists.navigator" :key="index" @click.stop="selectPage(page, 'navigator')" class="p-2 hover:bg-gray-200 cursor-pointer">
                  {{ page.title }}
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>

    <!-- Row 2 -->
    <div class="flex flex-col md:flex-row border-b">
      <div class="w-full md:w-9/12 p-2 order-2 md:order-1">
        <!-- Side bar -->
        <header class="bg-white shadow">
          <Render v-if="load_hostname" :key="selectedItems.homepage" :dataItem="selectedItems.homepage" :mode="'id'"/>
        </header>
      </div>
      <div class="w-full md:w-3/12 p-2 order-1 md:order-2">
        <!-- Main Content -->
        <header class="relative bg-white shadow p-5">
          <h1 class="text-lg font-bold">Home Section</h1>
          <div class="flex">
            <div class="w-1/2 pr-2">
              <p>{{ getPageTitle(selectedItems.homepage) }}</p>
            </div>
            <div class="w-1/2 pl-2">
              <input 
                type="text" 
                v-model="searchTerms.homepage" 
                @focus="showPanels.homepage = true; filterOptions('homepage')" 
                
                @input="filterOptions('homepage')" 
                class="w-full border rounded p-2"
                placeholder="ค้นหา Home..."
              />

              <div v-if="showPanels.homepage" class="panel shadow">
                <div class="p-2 flex justify-between items-center">
                  <h2 class="font-bold">Home Options</h2>
                  <button @click="hidePanel('homepage')" class="text-red-500">ปิด</button>
                </div>
                <div v-for="(page, index) in filteredLists.homepage" :key="index" @click.stop="selectPage(page, 'homepage')" class="p-2 hover:bg-gray-200 cursor-pointer">
                  {{ page.title }}
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>

    <!-- Row 3 -->
    <div class="flex flex-col md:flex-row border-b">
      <div class="w-full md:w-9/12 p-2 order-2 md:order-1">
        <!-- Side bar -->
        <header class="bg-white shadow">
          <Render v-if="load_hostname" :key="selectedItems.footer" :dataItem="selectedItems.footer" :mode="'id'"/>
        </header>
      </div>
      <div class="w-full md:w-3/12 p-2 order-1 md:order-2">
        <!-- Main Content -->
        <header class="relative bg-white shadow p-5">
          <h1 class="text-lg font-bold">Footer Section</h1>
          <div class="flex">
            <div class="w-1/2 pr-2">
              <p>{{ getPageTitle(selectedItems.footer) }}</p>
            </div>
            <div class="w-1/2 pl-2">
              <input 
                type="text" 
                v-model="searchTerms.footer" 
                @focus="showPanels.footer = true; filterOptions('footer')" 
                
                @input="filterOptions('footer')" 
                class="w-full border rounded p-2"
                placeholder="ค้นหา Footer..."
              />
              <div v-if="showPanels.footer" class="panel shadow">
                <div class="p-2 flex justify-between items-center">
                  <h2 class="font-bold">Footer Options</h2>
                  <button @click="hidePanel('footer')" class="text-red-500">ปิด</button>
                </div>
                <div v-for="(page, index) in filteredLists.footer" :key="index" 
                     @click.stop="selectPage(page, 'footer')" 
                     class="p-2 hover:bg-gray-200 cursor-pointer">
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
import Navigation from '@/interface/template/builder/Navigation.vue';
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
        header: '',
        navigator: '',
        homepage: '',
        footer: '',
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
        header: false,
        navigator: false,
        homepage: false,
        footer: false,
        welcomeEmail: false,
        recoveryPassword: false,
        otp: false,
        general: false
      },
      filteredLists: {
        header: [],
        navigator: [],
        homepage: [],
        footer: [],
        welcomeEmail: [],
        recoveryPassword: [],
        otp: [],
        general: []
      },
      searchTerms: {
        header: '',
        navigator: '',
        homepage: '',
        footer: '',
        welcomeEmail: '',
        recoveryPassword: '',
        otp: '',
        general: ''
      }
    };
  },
  components: {Render,Navigation},
  methods: {
    async fetchDataFromHostname() {
      try {
        const { data, status } = await this.$Request.GET(`hostname/${this.session.current._id}`, this.hostkey);
        if (status === 200) {
          this.load_hostname = true;
          console.log('Data fetched from hostname:', data.theme);
          this.theme = data.theme;
          this.selectedItems.header = data.theme.header || '';
          this.selectedItems.navigator = data.theme.navigator || '';
          this.selectedItems.homepage = data.theme.homepage || '';
          this.selectedItems.footer = data.theme.footer || '';

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
      if (this.selectedItems.header) {
        this.theme.header = this.selectedItems.header; // อัปเดตข้อมูลธีมสำหรับ Header
      }
      if (this.selectedItems.navigator) {
        this.theme.navigator = this.selectedItems.navigator; // อัปเดตข้อมูลธีมสำหรับ Navigator
      }
      if (this.selectedItems.homepage) {
        this.theme.homepage = this.selectedItems.homepage; // อัปเดตข้อมูลธีมสำหรับ Home
      }
      if (this.selectedItems.footer) {
        this.theme.footer = this.selectedItems.footer; // อัปเดตข้อมูลธีมสำหรับ Footer
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
      this.selectedItems.header = this.theme.header || '';
      this.selectedItems.navigator = this.theme.navigator || '';
      this.selectedItems.homepage = this.theme.homepage || '';
      this.selectedItems.footer = this.theme.footer || '';
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
  
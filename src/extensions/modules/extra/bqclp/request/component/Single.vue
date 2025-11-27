<script>
import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

export default {
  name: 'ContactUs',
  inject: ['apiServer'],
  data() {
    return {
      dataItem: this.$route.params.id,
      title: '',
      slug: 'newpage-slug',
      content: '',
      display: 'single',
      type: 'page',
      owner: '',
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      bqclp: storageManager.get('bqclp'),
      activeBlock: false,
      editing: undefined,
      isComment: undefined,
      isCounter: undefined,
      isMenu: undefined,
      layout: undefined,
      parent: undefined,
      FileBrowserOpen: false,
      parentList: [],
      searchTerm: '',
      showDropdown: false,
      destination: 'form', // default value is 'form'
      defaultCollectionOptions: ['form', 'message'], // dynamic options
      activity_code: '',
      activities: [],
      choose_favor: '',
      sample_code: '',
      sampleOptions: [],
      searchQuery: '',
      selectedItems: [],
      item_select: [],
      isDropdownOpen: false,
      selectAll: false,
      req_no:'',
      total_test:'1',
      language_result:'0',
      receive_result:'0',
      service_code:'',
      return_item: null,
      req_data:'',
      req_test_data:[],
    }
  },
  components: {
    Subhead
  },
  computed: {
    filteredParentList() {
      return this.parentList.filter((parent) =>
        parent.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },
    filteredOptions() {
      const query = this.searchQuery.toLowerCase();
      return this.item_select.filter(option =>
        option.label && option.label.toLowerCase().includes(query)
      );
    },
  },
  methods: {
    updateSelectedItems(value) {
        if (this.selectedItems.includes(value)) {
            this.selectedItems = this.selectedItems.filter(item => item !== value);
        } else {
            this.selectedItems.push(value);
        }
    },
    isSelected(value) {
        return this.selectedItems.includes(value);
    },
    async getRequest() {
        const apiUrl = 'https://sea-turtle-app-hit8g.ondigitalocean.app/query';
        let cate = 2;
        let StrSql = `pl_select_ini_code ${cate}, 'ACTIVITY', ''`;
        const requestBody = {
            StrSql: StrSql,
        };

        try {
            const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            });

            if (response.ok) {
            const data = await response.json();
            console.log("data",data);
            //let res_items = [];

            if (typeof this.dataItem !== 'undefined' && this.dataItem !== '') {
                let req_no = this.dataItem;
                let uss_id = this.bqclp.uss_id;
                //let space = '';
                let QueryStr = `test_inet_SelectReq 3, '${uss_id}', '${req_no}', Null, Null, ''`;
                let params = [];
                let resGetQuery = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ StrSql: QueryStr, params }),
                });
                let datareq = await resGetQuery.json();
                console.log("datareq",datareq);

                this.req_data = datareq.data[0]

                // ----------------------------------------
                this.req_no = this.req_data.req_no
                this.total_test = this.req_data.total_test
                this.activity_code = this.req_data.activity_code
                this.service_code = this.req_data.service_code

                this.SearchSamCodeByGroup();

                this.sample_code = this.req_data.sample_code
                
                // ----------------------------------------

                let StrSql = `Select * From INET_TEST_ITEM Where req_no = '${req_no}'`;
                let item_query = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ StrSql }),
                });
                let item_data = await item_query.json();
                
                console.log("item_data",item_data);

                this.req_test_data = item_data.data.map(option => option.item_code).reverse();
                this.selectedItems = this.req_test_data;
                console.log("req_test_data",this.selectedItems);
            }
            } else {
            throw new Error('Request failed with status ' + response.status);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    toggleSelectAll() {
      this.selectAll = !this.selectAll;
      if (this.selectAll) {
        this.selectedItems = this.filteredOptions.map(option => option.value);
      } else {
        this.selectedItems = [];
      }
    },
    fetchData() {
      fetch('https://sea-turtle-app-hit8g.ondigitalocean.app/activity')
        .then(response => response.json())
        .then(data => {
          this.activities = data.data;
        })
        .catch(error => {
          console.error(error);
        });
    },
    async SearchSamCodeByGroup() {
      if (this.service_code) {
        this.isDropdownOpen = false
        const apiUrl = 'https://sea-turtle-app-hit8g.ondigitalocean.app/query';
        const requestBody = {
          StrSql: `pl_select_ini_code 6, 'SAMPLE', '${this.service_code}'`,
        };

        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          const data = await response.json();

          this.sampleOptions = data.data.map(item => ({
            value: item.ini_code,
            label: item.ini_desc_thai,
          }));
          this.sample_code    = this.sampleOptions.length > 0 ? this.sampleOptions[0].value : '';
          this.selectedItems  = [];
          await this.SearchItemCodeByGroup(); // Call the SearchItemCodeByGroup method
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      } else {
        this.sampleOptions = []; // Clear the options if no category is selected
        this.sample_code = ''; // Reset the sample_code value
      }
    },
    async SearchItemCodeByGroup() {
      if (this.service_code) {
        const apiUrl = 'https://sea-turtle-app-hit8g.ondigitalocean.app/query';
        const requestBody = {
          StrSql: `pl_select_ini_code 6, 'T_ITEM', '${this.service_code}'`,
        };

        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          const data = await response.json();

          this.item_select = data.data.map(item => ({
            value: item.ini_code,
            label: item.ini_desc_thai,
          }));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      } else {
        this.item_select = []; // Clear the options if no category is selected
      }
    },
    async CreateReqNo() {
      let cate = 1;
      let req_no = '';
      let req_random = generateRandomString(20) + Date.now();
      let StrSqlGetNewNo = "test_inet_InsertReqHeader 5, ";
      let StrSql1 = "test_inet_InsertReqHeader " + cate + ", ";
      let StrSql2 = "'" + req_no + "', '" + req_random + "', " + this.total_test + ", '" +
        this.bqclp.uss_id + "', '" + this.service_code + "', '" + this.activity_code + "', '" + this.sample_code + "', '" +
        this.language_result + "', '" + this.receive_result + "', '" + this.bqclp.user_login + "', '" + this.selectedItems.map(item => `[${item}]`).join('') + "' ";
      let StrSql = StrSql1 + StrSql2;
      StrSqlGetNewNo += StrSql2;

      console.log(StrSqlGetNewNo);

      const apiUrl = 'https://sea-turtle-app-hit8g.ondigitalocean.app/query';
      const requestBody = {
        StrSql,
      };

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        console.log(data);
        this.req_no = data.data[0].req_no

        await this.getNewReqNo(StrSqlGetNewNo);

        await this.SearchItemCodeByGroup(); // Call the SearchItemCodeByGroup method
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    async getNewReqNo(StrSqlGetNewNo) {
        
        const apiUrl = 'https://sea-turtle-app-hit8g.ondigitalocean.app/query';
        const requestBody = {
          StrSql:StrSqlGetNewNo,
        };

        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          const data = await response.json();
          this.return_item = data.data[0]
          console.log(data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
    },
    async EditReqNo() {
      let cate = 2;
      let req_no = this.req_no;
      let req_random = '';
      let StrSqlGetNewNo = "test_inet_InsertReqHeader 6, ";
      let StrSql1 = "test_inet_InsertReqHeader " + cate + ", ";
      let StrSql2 = "'" + req_no + "', '" + req_random + "', " + this.total_test + ", '" +
        this.bqclp.uss_id + "', '" + this.service_code + "', '" + this.activity_code + "', '" + this.sample_code + "', '" +
        this.language_result + "', '" + this.receive_result + "', '" + this.bqclp.user_login + "', '" + this.selectedItems.map(item => `[${item}]`).join('') + "' ";
      let StrSql = StrSql1 + StrSql2;
      StrSqlGetNewNo += StrSql2;

      console.log(StrSqlGetNewNo);

      const apiUrl = 'https://sea-turtle-app-hit8g.ondigitalocean.app/query';
      const requestBody = {
        StrSql,
      };

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        console.log(data);
        await this.getNewReqNo(StrSqlGetNewNo);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    slugify(str) {
      if (!str || typeof str !== 'string') {
        return '';
      }
      str = str.trim().toLowerCase();
      var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
      var to = "aaaaaeeeeiiiioooouuuunc------";
      for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
      }
      str = str
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      var lastDotIndex = str.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        str = str.substring(0, lastDotIndex);
      }
      return str;
    },
    async checkSlugExists(slug) {
      try {
        const apiUrl = 'https://gateway.cloudrestfulapi.com/api/post/query';
        const requestBody = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            method: 'find',
            args: [
              {
                $and: [
                  { owner: this.session.current.id },
                  { slug: slug },
                ],
              },
            ],
          }),
        };
        const response = await fetch(apiUrl, requestBody);
        const data = await response.json();
        return data.length > 0;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    updateSlug() {
      const newSlug = this.slugify(this.slug);
      let count = 1;
      const checkSlug = async (slug) => {
        const slugExists = await this.checkSlugExists(slug);
        if (slugExists) {
          slug = `${slug}-${count}`;
          count++;
          checkSlug(slug);
        } else {
          console.log('Slug is available', slug);
          this.slug = slug;
          this.editing = false;
        }
      };
      checkSlug(newSlug);
    },
    onTitleInput() {
      let slug = this.slugify(this.title);
      let count = 1;
      const checkSlug = async (slug) => {
        const slugExists = await this.checkSlugExists(slug);
        if (slugExists) {
          slug = `${slug}-${count}`;
          count++;
          checkSlug(slug);
        } else {
          console.log('Slug is available', slug);
          this.slug = slug;
        }
      };
      checkSlug(slug);
    },
    removeParent() {
      this.searchTerm = '';
      this.parent = undefined;
    },
    OpenFileBrowser(index) {
      this.selectedSlideItemIndex = index;
      this.FileBrowserOpen = true;
    },
    changeFileTrigger(payload) {
      this.FileBrowserOpen = payload;
    },
    selectFileTrigger(payload) {
      console.log("selectFileTrigger");
      if (payload != undefined) {
        this.selectCourseCover = payload;
        console.log("selectFileReturnFunction", payload.file);
        this.feature_image = payload.file;
        this.selectedSlideItemIndex = undefined;
      }
    },
    selectParent(parent) {
      console.log('Selected parent:', parent);
      this.parent = parent;
      this.showDropdown = false;
    },
    async getData() {
      if (storageManager.get('session', 'login')) {
        try {
          this.loading_sources = false;

          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/post/query", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              method: 'find',
              args: [
                { $and: [{ owner: this.session.current._id, type: 'page' }] }
              ]
            })
          });

          const RestReturn = await resAPI.json();
          this.parentList = RestReturn;

          this.service_code = 'A'
          await this.SearchSamCodeByGroup();
          this.loading_sources = true;

        } catch (error) {
          console.log(error)
        }
      }
    },
    async addPost() {
      try {
        this.activeBlock = true;
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/post/", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            data: {
              title: this.title,
              slug: this.slug,
              content: this.content,
              display: this.display,
              type: this.type,
              isComment: this.isComment,
              isCounter: this.isCounter,
              isMenu: this.isMenu,
              status: this.status,
              authen: this.authen,
              parent: this.parent,
              destination: this.destination,
              feature_image: this.feature_image,
              owner: this.session.current._id,
              builder: [],
            },
            options: {
              uniqueFields: [
                ["slug"]
              ]
            }
          })
        });
        const finalRes = await resAPI.json();
        console.log(finalRes);
        this.$router.replace(`/cms/edit/${finalRes._id}`);
      } catch (error) {
        console.log(error)
      }
    }
  },
  setup() {
  },
  async mounted() {
    try {
      window.addEventListener('click', this.onBlur);
      await this.getRequest();
      await this.fetchData();
      const parentId = this.$route.params.id;
      const parent = this.parentList.find((item) => item._id === parentId);
      if (parent) {
        this.parent = parent;
      }
    } catch (error) {
      console.log(Error);
    }
  },
  beforeUnmount() {
    window.removeEventListener('click', this.onBlur);
  },
}
</script>

<template>
  <Subhead
    :navigation="
      [
      {
          name: 'ย้อนกลับ',
          link: '/cms/content',
          style: 'chevron-left',
          class: 'default-btn',
          visible: true,
          type: 'button',
      },
      ]"
  />

  <div class="flex-1 bg-gray-100 pt-2 pb-5">
    <div class="mt-2">
      <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
        <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
          <form @submit.prevent="addAdmin">
            <section
              aria-labelledby="payment-details-heading"
              class="relative"
              :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'"
              :class="[(activeBlock ? 'isblock' : 'isunblock')]"
            >
              <div class="shadow">
                <div class="bg-white py-6 px-4 sm:p-6">
                  <div>
                    <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">สร้างเลขคำขอส่งตัวอย่าง</h2>
                    <p class="mt-1 text-sm text-gray-500">กรอกข้อมูลให้ครบถ้วน.</p>
                  </div>

                  <pre>{{ this.req_data }}</pre>
                  <pre>{{ this.req_test_data }}</pre>

                  <div class="mt-6 grid grid-cols-5 gap-2">

                    <div>
                      <label for="req_no" class="block text-md font-medium text-gray-700">เลขที่คำขอ</label>
                      <input
                        v-model="req_no"
                        type="text"
                        name="req_no"
                        id="req_no"
                        autocomplete="req_no"
                        readonly
                        class="mt-1 block w-full rounded-md bg-gray-100 border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                      >
                    </div>

                    <div>
                      <label for="choose_favor" class="block text-md font-medium text-gray-700">รูปแบบประจำ</label>
                      <select v-model="choose_favor" name="choose_favor" id="choose_favor" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        <option value="" disabled selected>ไม่เลือก</option>
                        <option value="A">แบบที่ 1</option>
                        <option value="B">แบบที่ 2</option>
                      </select>
                    </div>
                    
                    <div>
                      <label for="total_test" class="block text-md font-medium text-gray-700">จำนวน(ต.ย.)*</label>
                      <input
                        v-model="total_test"
                        type="number"
                        name="total_test"
                        id="total_test"
                        autocomplete="total_test"
                        class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
                      >
                    </div>

                    <div>
                      <label for="language_result" class="block text-md font-medium text-gray-700">ภาษา</label>
                      <div class="mt-1">
                        <label class="inline-flex items-center">
                          <input
                            type="radio"
                            v-model="language_result"
                            name="language_result"
                            value="0"
                            class="form-radio h-4 w-4 text-gray-600"
                          >
                          <span class="ml-2">ไทย</span>
                        </label>
                        <label class="inline-flex items-center ml-6">
                          <input
                            type="radio"
                            v-model="language_result"
                            name="language_result"
                            value="1"
                            class="form-radio h-4 w-4 text-gray-600"
                          >
                          <span class="ml-2">อังกฤษ</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label for="receive_result" class="block text-md font-medium text-gray-700">การรับผล</label>
                      <div class="mt-1">
                        <label class="inline-flex items-center">
                          <input
                            type="radio"
                            v-model="receive_result"
                            name="receive_result"
                            value="0"
                            class="form-radio h-4 w-4 text-gray-600"
                          >
                          <span class="ml-2">ด้วยตัวเอง</span>
                        </label>
                        <label class="inline-flex items-center ml-6">
                          <input
                            type="radio"
                            v-model="receive_result"
                            name="receive_result"
                            value="1"
                            class="form-radio h-4 w-4 text-gray-600"
                          >
                          <span class="ml-2">ไปรษณีย์</span>
                        </label>
                      </div>
                    </div>
                    
                  </div>

                  <div class="mt-6 grid grid-cols-5 gap-2">

                    <div class="col-span-3">
                      <label for="req_no" class="block text-md font-medium text-gray-700">กิจกรรม*</label>
                      <select v-model="activity_code" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        <option value="">เลือกกิจกรรม</option>
                        <option v-for="activity in activities" :key="activity.ini_code" :value="activity.ini_code">{{ activity.ini_desc1 }}</option>
                      </select>
                    </div>

                    <div>
                      <label for="service_code" class="block text-md font-medium text-gray-700">ประเภท*</label>
                      <select v-model="service_code" name="service_code" id="service_code" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm" @change="SearchSamCodeByGroup">
                        <option value="" disabled selected>เลือกประเภท</option>
                        <option value="A">เนื้อ/ผลิดภัณฑ์จากสัตว์</option>
                        <option value="B">อาหารสัตว์</option>
                      </select>
                    </div>
                  
                    <div>
                      <label for="sample_code" class="block text-md font-medium text-gray-700">ชนิดตัวอย่าง*</label>
                      <select v-model="sample_code" name="sample_code" id="sample_code" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        <option value="" disabled selected>ไม่เลือก</option>
                        <option v-for="option in sampleOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                      </select>
                    </div>

                  </div>

                  <div class="mt-6 grid grid-cols-5 gap-2">
                    
                    <div class="col-span-3">
                      <label for="item_select" class="block text-md font-medium text-gray-700">เลือกรายการตรวจฯ*</label>
                      {{ this.selectedItems }}
                      {{ this.req_test_data }}
                      <div class="relative mt-1 rounded-md shadow-sm">
                        <input
                          type="text"
                          v-model="searchQuery"
                          placeholder="ค้นหา..."
                          class="w-full py-2 px-3 rounded-md border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900"
                        />
                        <button class="absolute right-0 top-0 bottom-0 px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md focus:outline-none" @click="toggleDropdown">
                          {{ isDropdownOpen ? `บันทึกข้อมูล (${selectedItems.length} new)` : selectedItems.length > 0 ? 'เลือกแล้ว '+ selectedItems.length : 'ยังไม่ได้เลือก' }}
                        </button>
                        <ul class="absolute w-full mt-2 bg-white border rounded-md shadow-lg" v-show="isDropdownOpen && filteredOptions.length > 0" style="height: 300px; overflow-y: auto;" ref="dropdown">
                          <li class="px-3 py-2 ">
                            <label class="flex items-center">
                              <input type="checkbox" v-model="selectAll" @click="toggleSelectAll" class="form-checkbox mr-2" />
                              <span>เลือกทั้งหมด</span>
                            </label>
                          </li>
                          <li v-for="option in filteredOptions" :key="option.value" class="px-3 py-2">
                            <label class="flex items-center">
                              <input type="checkbox" :value="option.value" class="form-checkbox mr-2" @click.stop="updateSelectedItems(option.value)" :checked="this.req_test_data.includes(option.value)" />
                              <span>{{ option.label }}</span>
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div class="col-span-2 mt-7">
                      <button
                        v-if="this.return_item === null"
                        @click.prevent="CreateReqNo"
                        type="button"
                        class="relative rounded-md w-full bg-gray-800 px-4 py-2.5 text-md font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                      >
                        <font-awesome-icon :icon="['fas','plus']" class="pr-2 pl-2"/> สร้างคำขอ
                      </button>

                      <button
                        v-if="this.return_item !== null"
                        @click.prevent="EditReqNo"
                        type="button"
                        class="relative rounded-md w-full bg-blue-800 px-4 py-2.5 text-md font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                      >
                        <font-awesome-icon :icon="['fas','save']" class="pr-2 pl-2"/> แก้ไข
                      </button>
                    </div>
                    
                  </div>

                </div>
              </div>

              <div class="shadow sm:overflow-hidden sm:rounded-md mt-8" v-if="this.return_item !== null">
                <div class="bg-white py-6 px-4 sm:p-6">
                  <!-- <pre>{{ this.return_item }} </pre> -->
                  <div>
                    <h2 id="payment-details-heading" class="text-lg font-medium leading-6 text-gray-900">ข้อมูลคำขอที่บันทึกล่าสุด</h2>
                    <p class="mt-1 text-sm text-gray-500">สามารถแก้ไขข้อมูลได้.</p>
                  </div>

                  <div class="mt-5 overflow-x-auto">
                    <table class="table-auto border border-gray-100 w-full">
                      <thead class="bg-gray-200 text-left border border-gray-100">
                        <tr>
                          <th class="px-4 py-2" scope="col">เลขที่คำขอ</th>
                          <th class="px-4 py-2" scope="col">หมายเลข ต.ย.</th>
                          <th class="px-4 py-2" scope="col">รวม(ต.ย./ตรวจฯ)</th>
                          <th class="px-4 py-2" scope="col">กิจกรรม</th>
                          <th class="px-4 py-2" scope="col">ชนิดตัวอย่าง</th>
                          <th class="px-4 py-2" scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody class="border border-gray-100">
                        <tr>
                          <td class="px-4 py-2">{{this.req_no}}</td>
                          <td class="px-4 py-2">{{this.return_item.AllTestNo}}</td>
                          <td class="px-4 py-2">{{this.return_item.total_test}}/{{this.return_item.TotalItem}}</td>
                          <td class="px-4 py-2">{{this.return_item.ActivityName}}</td>
                          <td class="px-4 py-2">{{this.return_item.SampleName}}</td>
                          <td class="px-4 py-2">
                            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">แก้ไข</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

            </section>

          </form>
        </div>
      </div>
    </div>
  </div>
</template>

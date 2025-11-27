<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
//import Pagination from '@/utils/Paginated.vue';
import storageManager from '@/plugins/storage';
import Subhead from '@/interface/template/outline/Subhead.vue';
import CryptoJS from 'crypto-js';

export default {
    inject: ['apiServer'],
    data() {
      return {
        accessToken: storageManager.get('session','token'),
        session: storageManager.get('session','current'),
        listItems: [],
        loading_sources: true,
        studentData: [],
        currentPage: 1,
        itemsPerPage: 100,
        perPageOptions: [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000,20000],
        totalItems: 0,
        totalPages: 0,
        activeBlock: false,
        searchQuery: '',
        filterOptions: [
          { label: 'รุ่น 1', value: 'หลักสูตรผู้ควบคุมการขายวัตถุอันตรายทางการเกษตร รุ่น 1' },
          { label: 'รุ่น 2', value: 'หลักสูตรผู้ควบคุมการขายวัตถุอันตรายทางการเกษตร รุ่น 2' },
          { label: 'รุ่น 3', value: 'หลักสูตรผู้ควบคุมการขายวัตถุอันตรายทางการเกษตร รุ่น 3' },
          { label: 'ปี 66 รุ่น 1', value: 'หลักสูตรผู้ควบคุมการขายวัตถุอันตรายทางการเกษตร ปี 66 รุ่น 1' },
          { label: 'ปี 66 รุ่น 2', value: 'หลักสูตรผู้ควบคุมการขายวัตถุอันตรายทางการเกษตร ปี 66 รุ่น 2' }
        ],
        selectAll: true,
        selectedFilter: [],
        isCreatingUser: false,
        isShowingOverlay: false,
        loadingMessage: '',
        processingCount: '',
      }
    },
    components: {
      Loader,
      Subhead,
      //Pagination,
    },
    methods: {
      async createUser() {
        this.isCreatingUser = true;
        this.isShowingOverlay = true;

        const totalCount = this.studentData.length;
        let count = 0;

        for (const student of this.studentData) {
          count++;
          this.loadingMessage = 'Creating users...';
          this.processingCount = `${count}/${totalCount}`;

          const salt = CryptoJS.lib.WordArray.random(16);
          const hash = CryptoJS.SHA256(student.student_phone + salt).toString();

          const requestBody = {
            data: {
              firstname: student.student_firstname,
              lastname: student.student_lastname,
              citizen: student.student_citizen_id,
              phone: student.student_phone,
              email: student.student_email,
              username: student.student_username,
              password: hash,
              parent: this.session._id,
              salt: salt.toString(),
              role: 'user',
              token: student.student_token,
              old_id: student.student_id,
              info: {
                fti_member: student.student_fti_data ? true : false,
                fti_member_number: student.student_fti_id,
                prefix: student.student_prefix,
                education: student.student_education,
                regdate: student.student_regdate,
                birthday: student.student_birthday,
                experience: student.student_experience,
                agree: true
              }
            },
            options: {
              fieldType: [],
              uniqueFields: [
                ['citizen']
              ]
            }
          };

          try {
            const resAPI = await fetch('https://gateway.cloudrestfulapi.com/api/user/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
              body: JSON.stringify(requestBody)
            });

            const resJSON = await resAPI.json();

            if (resJSON.success) {
              console.log(`User created successfully for student ID: ${student.student_id}`);
            } else {
              console.log(`Error creating user for student ID: ${student.student_id}`);
            }
          } catch (error) {
            console.log(`Error creating user for student ID: ${student.student_id}`);
            console.error(error);
          }

          // Simulating an API call delay with setTimeout
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.loadingMessage = 'Users created successfully!';
        this.processingCount = `${totalCount}/${totalCount}`;

        this.isCreatingUser = false;
        setTimeout(() => {
          this.isShowingOverlay = false;
        }, 2000);
      },
      applyFilter() {
        this.fetchData(this.currentPage, this.itemsPerPage);
      },
      selectAllOptions() {
        if (this.selectAll) {
          this.selectedFilter = this.filterOptions.map(option => option.value);
        } else {
          this.selectedFilter = [];
        }
      },
      saveSelectedFilter() {
        sessionStorage.setItem('selectedFilter', JSON.stringify(this.selectedFilter));
      },
      loadSelectedFilter() {
        const selectedFilter = sessionStorage.getItem('selectedFilter');
        if (selectedFilter) {
          this.selectedFilter = JSON.parse(selectedFilter);
        }
      },
      highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="text-red-500 font-semibold">$1</span>');
      },
      refreshData() {
        this.searchQuery = '';
        this.currentPage = 1;
        this.updateQueryParams();
        this.fetchData(this.currentPage, this.itemsPerPage);
        sessionStorage.setItem('searchQuery', this.searchQuery);
      },
      clearSearchQuery() {
        this.searchQuery = '';
        this.currentPage = 1;
        this.updateQueryParams();
        this.fetchData(this.currentPage, this.itemsPerPage);
        sessionStorage.removeItem('searchQuery');
      },
      getSearchConditions() {
          const conditions = [];
          if (this.searchQuery.length >= 2) {
            conditions.push(`student.student_firstname LIKE '%${this.searchQuery}%'`);
            conditions.push(`student.student_lastname LIKE '%${this.searchQuery}%'`);
            conditions.push(`student.student_email LIKE '%${this.searchQuery}%'`);
            conditions.push(`student.student_phone LIKE '%${this.searchQuery}%'`);
            conditions.push(`student.student_citizen_id LIKE '%${this.searchQuery}%'`);
          }
          return conditions.length > 0 ? `AND (${conditions.join(' OR ')})` : '';
      },
      async fetchData(pageNumber, itemsPerPage) {
        this.activeBlock   = true;

        let offset = (pageNumber - 1) * itemsPerPage;
        if (this.searchQuery.length >= 2) {
          offset = 0;
        }

        const mainQuery = `
          SELECT *
          FROM student
          WHERE student.student_citizen_id IN("3180500512837","3190900102067","1729800123816","2720900019743","1640900057427","1509990001999","1659900751429","3800400866231","3500200765906","1571100094532","5310400047673","1509900394422","3219800074701","3411600226761","3610500019575","3571100049622","3610500019583","3830300370013","3609900510681","3101700752514","1149600026006","1209700137984","1189900194567","1509901317502","1640100064348","1450800049629","3670501189369","3340701659175","3341000066004","3210500473032","3800900130838","1350100299372","5730100041986","3251000262891","3710500004241","3700501116913","3130500196374","3800101522590","3649800063748","1729900105232","3240600108247","3180300116725","1509900282888","3360100468080","1509900306981","1539900599083","1720900287529","5330500001446","3330600325611","3720200014224","1729900292806","1840100488413","1409901008403","1620500105351","3730200389490","3101401187718","1620600132857","2580500019748","5571200006883","3570300546840","3720800038230","3500900029013","3100502950262","3959900138402","3301700823088","1361200201006","3100601241545","1369900141089","1101000076005","3301001143380","316060081072","1409900980110","1671100088256","3900700428891","3570700491198","3191100409045","1629900440661","1900900029331","1500300145334","3360600176748","3570101423543","3850200053512","1269900127354","1509901000631","3800700562823","3110400704386","3550100021581","1509900215811","3200900813027","3570700039635","3501300031191","3579900248821","3170200114887","3301800103958","3659900171747","3801600323780","3500700458352","3809900325246","3419900272901","3340400279136","3540100986005","3800900524411","3300901108377","3560300132328","3640400586419","3620501073735","3530700180001","3600100682161","3250600179951","5740399006685","5571000073366","3170100508707","1103100454828","1309901257374","3801000076838","1620100071352","3490300229551","1301401217503","3100500932399","3800300144633","1411300038572","3570300209495","1730600117288","1409800144701","3341400500003","1100200167445","2800400029226","1670100151992","3650600752231","5650390002742","3530400190745","3901100328129","1420190000176","1620200009985","1840600066739","3210100741161","3500900254882","3240200471930","3210100105184","1760500098061","1509900569702","3929900154637","1411400163905","3430600107311","3679900233386","3800900771663","3310800474637","3730100443841","3470300355352","3770100218154","1720600011391","1411200180911","3500600618374","3840200358658","1609700075071","3810500002344","2610800016701","5550800020525","1630400090239","3480600279457","1103701200324","3800700344176","3660700553273","3350700178289","1100900391844","1309900855499","1479900627193","3601000084409","3120100585411","3301700077912","3720700497747","1310600216565","1330700105200","1471200233721","2430100038584","1630600060261","3300500176312","1100700578959","1840100001352","1579900323398","3301300287251","1860800041314","3560100877001","3670700386946","3102101267512","1410300117579","1849900268602","1709800162021","1339900508705","1910100010270","1509900939917","3321100246829","1400900219038","1509900969794","1310200017000","1300600162759","1550600003624","3210500005969","5849700002130","3300700212151")
          ORDER BY student.student_id DESC
          LIMIT ${itemsPerPage}
          OFFSET ${offset}
        `;

        const countQuery = `
        `;

        const requestBody = {
          query: {
            mainQuery: mainQuery,
            countQuery: countQuery,
          },
        };

        try {
          const response = await fetch('https://multisource-api-edsdv.ondigitalocean.app/api/04ZQdW5sGA9C9eXXXk6x/query', {
          //const response = await fetch('http://localhost:5001/api/04ZQdW5sGA9C9eXXXk6x/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify(requestBody),
          });
          const responseData = await response.json();
          // Extract unique lessons from the result data
          const lessons = [];
          responseData.data.forEach(student => {
            const items = student.items;
            if (items) {
              const splitItems = items.split(';');
              splitItems.forEach(item => {
                const lessonMatch = item.match(/lesson: (.+)/);
                if (lessonMatch) {
                  const lesson = lessonMatch[1].trim();
                  if (!lessons.includes(lesson)) {
                    lessons.push(lesson);
                  }
                }
              });
            }
          });
          // Update the student data and other properties
          this.studentData = responseData.data;
          this.activeBlock = false;
          this.totalItems = responseData.totalItems;
          this.totalPages = Math.ceil(responseData.totalItems / itemsPerPage);

        } catch (error) {
          console.error(error);
        }
      },
      handleItemsPerPageChange() {
        this.currentPage = 1;
        this.updateQueryParams();
        this.fetchData(this.currentPage, this.itemsPerPage);
        sessionStorage.setItem('itemsPerPage', this.itemsPerPage.toString());
      },
      handlePageChange(page) {
        this.currentPage = page;
        this.updateQueryParams();
        this.fetchData(this.currentPage, this.itemsPerPage);
      },
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            console.log("id",id)
            const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/schools/" + id, {
              method: 'DELETE',
              headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
            });
            console.log(await resAPI);
            this.loading_sources = true;
            await this.getData();

          } catch (error) {
            console.log(error)
          }
        }
      },
      updated() {
        feather.replace();
      },
      updateQueryParams() {
        if (this.currentPage === 1) {
          return;
        }
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set('page', this.currentPage.toString());

        const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      },
    },
    async mounted() {
      const queryParams = new URLSearchParams(window.location.search);
      const pageParam = queryParams.get('page');
      const page = parseInt(pageParam);

      const storedItemsPerPage = sessionStorage.getItem('itemsPerPage');
      if (storedItemsPerPage) {
        this.itemsPerPage = parseInt(storedItemsPerPage);
      }

      const storedSearchQuery = sessionStorage.getItem('searchQuery');
      if (storedSearchQuery) {
        this.searchQuery = storedSearchQuery;
      }

      this.loadSelectedFilter();
      this.selectAllOptions();
      
      if (page && !isNaN(page)) {
        this.currentPage = page;
      } else {
        try {
          await this.fetchData(this.currentPage, this.itemsPerPage);
        } catch (error) {
          console.log(error);
        }
      }
    },
    computed: {
      pagedStudentData() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredStudentData.slice(startIndex, endIndex);
      },
      filteredStudentData() {
        let filteredData = this.studentData;

        // Apply search query if it exists
        if (this.searchQuery.length >= 2) {
          const query = this.searchQuery.toLowerCase();
          filteredData = filteredData.filter(student => {
            const firstName = student.student_firstname.toLowerCase();
            const lastName = student.student_lastname.toLowerCase();
            const email = student.student_email.toLowerCase();
            const phone = student.student_phone.toLowerCase();
            const citizenId = student.student_citizen_id.toLowerCase();
            const items = Array.isArray(student.items) ? student.items : student.items.split(';');

            return (
              firstName.includes(query) ||
              lastName.includes(query) ||
              email.includes(query) ||
              phone.includes(query) ||
              citizenId.includes(query) ||
              items.some(item => item.includes(query))
            );
          });
        }

        return filteredData;
      }
    },
    watch: {
      searchQuery(newQuery) {
        if (newQuery.length >= 2) {
          this.currentPage = 1;
          sessionStorage.setItem('searchQuery', this.searchQuery);
          this.fetchData(this.currentPage, this.itemsPerPage);
        } else if (newQuery.length === 0) {
          this.refreshData();
        }
      },
      selectedFilter() {
        //this.fetchData(this.currentPage, this.itemsPerPage);
        this.saveSelectedFilter(); // Save selectedFilter to session storage
      }
    },
    setup() {
      //console.log("Setup");
    },
};
</script>

<template>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>

  <Subhead 
  :navigation="
  [
      {
          name: 'Select Status',
          function: 'toggleStatus',
          style: 'pencil',
          type: 'select',
          value: 'waiting',
          placeholder: 'เลือกสถานะ',
          options: [
            { name: 'รอดำเนินการ', value: 'waiting' },
            { name: 'สำเร็จแล้ว', value: 'success' },
            { name: 'ยกเลิก', value: 'cancelled' }
          ]
      },
      {
        name: 'Select Group',
        function: 'toggleStatus',
        style: 'pencil',
        type: 'select',
        value: 'corp',
        placeholder: 'เลือกกลุ่ม',
        options: [
          { name: 'องค์กร', value: 'corp' },
          { name: 'บุคคลทั่วไป', value: 'general' },
          { name: 'สมาชิก สอท', value: 'member' }
        ]
    },
      {
          name: 'เพิ่มใหม่',
          link: '/student/add',
          style: 'plus',
          type: 'button',
          class: 'primary-btn'
      }
      
  ]"
  @toggleStatus="toggleStatus"
  /> 

  <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t" v-if="loading_sources">
      <div class="mt-4">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">

          <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">

                <div class="mb-5">
                  <input v-model="searchQuery" type="text" placeholder="Search..." />
                  <button v-if="searchQuery.length > 0" @click="clearSearchQuery">Clear</button>

                  <select v-model="itemsPerPage" class="form-select w-24 mr-2" @change="handleItemsPerPageChange">
                    <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
                  </select>

                  <div>
                    <label>
                      <input type="checkbox" v-model="selectAll" @change="selectAllOptions">
                      Select All
                    </label>
                  </div>
                  <div v-for="(option, index) in filterOptions" :key="index">
                    <label>
                      <input type="checkbox" :value="option.value" v-model="selectedFilter">
                      {{ option.label }}
                    </label>
                  </div>

                  <button @click="applyFilter">Apply Filter</button>


                  <div>
                    <button @click="createUser" :disabled="isCreatingUser">Create Users</button>
                    <div v-if="isShowingOverlay" class="loading-overlay">
                      <div class="loading-text">{{ loadingMessage }}</div>
                      <div class="processing-count">{{ processingCount }}</div>
                    </div>
                  </div>

                  

                  <span class="text-gray-500" v-if="searchQuery.length > 0">ผลการค้นหา : <span class="text-black">{{ this.searchQuery }}</span></span>
                </div>

                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  
                  <table class="min-w-full divide-y divide-gray-300 relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ชื่อ-นามสกุล</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">หมายเลขบัตรประชาชน</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">อีเมล์</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">เบอร์โทร</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">หลักสูตร</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">เครื่องมือ</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      
                      <tr v-for="(student, index) in filteredStudentData" :key="student.code">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <a :href="'/school/detail/'+student.student_token" class="text-gray-500 hover:text-indigo-900" v-html="student.student_firstname + ' ' + student.student_lastname"></a>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500" v-html="student.student_citizen_id"></td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500" v-html="student.student_email"></td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500" v-html="student.student_phone"></td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ student.count }}</td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-md font-medium sm:pr-6">
                          <button @click="$router.push('/school/edit/'+ student.student_token)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                          <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                          <span>แก้ไข</span>
                          </button>
                          <button type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                          <font-awesome-icon :icon="['fas','user-tie']" class="text-black mt-[3px] mr-2 text-md"/>
                          <span>ผู้ดูแล</span>
                          </button>
                          <button @click="deleteData(school.id)" type="button" class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                          <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                          <span>ลบ</span>
                          </button>
                        </td>
                      </tr>

                    </tbody>
                  </table>

                </div>

                <!-- <pagination
                    :current-page="currentPage"
                    :total-items="totalItems"
                    :total-pages="totalPages"
                    :limit-items="itemsPerPage"
                    @page-changed="handlePageChange"
                  ></pagination> -->
                
              </div>
            </div>
          </div>

      </div>
    </div>
  </div>
</template>

<style>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 9999;
}

.loading-text {
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
}

.processing-count {
  color: #fff;
  font-size: 18px;
}
</style>
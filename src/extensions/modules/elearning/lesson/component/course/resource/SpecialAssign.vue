<template>
  <div>
    <button @click="toggleDropdown" class="px-4 py-2 bg-blue-500 text-white rounded shadow">
      <font-awesome-icon :icon="['fas', 'lock']" class="text-gray-200 pr-2" />
      การเข้าถึงบทเรียน
    </button>
    <div v-if="isDropdownVisible" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-50" @click="closeDropdown"></div>
      <div class="relative p-4 w-96 bg-white border rounded shadow-lg z-10">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4 border-b border-b-gray-200 mb-3 pb-3">
          <h3 class="text-gray-700 font-semibold">
            <font-awesome-icon :icon="['fas', 'lock']" class="text-gray-300 pr-1" />
            ตั้งค่าการเข้าถึงเนื้อหา
          </h3>
          <button @click="closeDropdown" class="px-4 py-2 bg-blue-500 text-white rounded shadow">
            ปิด
          </button>
        </div>

        <!-- New Section for Checkboxes -->
        <div class="mb-4 pb-4 border-b border-b-gray-200">
          <h4 class="text-gray-700 font-semibold text-left mb-2">การเข้าถึงมาตรฐาน</h4>
          <div class="flex space-x-4">
            <div class="flex items-center">
              <input
                v-model="localNotVisible"
                @change="updatePlayer"
                type="checkbox"
                class="rounded-sm border border-gray-300 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
              />
              <label class="ml-2 text-sm font-medium text-gray-900">ปิดการเข้าถึง</label>
            </div>
            <div class="flex items-center">
              <input
                v-model="localStatus"
                @change="updatePlayer"
                type="checkbox"
                class="rounded-sm border border-gray-300 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
              />
              <label class="ml-2 text-sm font-medium text-gray-900">ไม่แสดง</label>
            </div>
            <div class="flex items-center">
              <input
                v-model="localPublicByDate"
                @change="updatePlayer"
                type="checkbox"
                class="rounded-sm border border-gray-300 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"
              />
              <label class="ml-2 text-sm font-medium text-gray-900">ตั้งเวลา</label>
            </div>
          </div>

          <!-- Date Pickers for Public By Date -->
          <div v-if="localPublicByDate" class="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 text-left">Select Start Date:</label>
              <Datepicker v-model="startDate" @update:model-value="updatePlayer" :clearable="true">
                <template v-slot:clear="{ onClear }">
                  <button @click="onClear">Clear</button>
                </template>
              </Datepicker>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 text-left">Select Stop Date:</label>
              <Datepicker v-model="stopDate" @update:model-value="updatePlayer" :clearable="true">
                <template v-slot:clear="{ onClear }">
                  <button @click="onClear">Clear</button>
                </template>
              </Datepicker>
            </div>
          </div>


        </div>

        <!-- Assignment Items -->
        <div class="mb-4 pb-4 border-b border-b-gray-200">
          <h4 class="text-gray-700 font-semibold text-left">การเข้าถึงแบบพิเศษ (กำหนดรายชื่อ)</h4>
          <ul v-if="checkedItems.length > 0">
            <li v-for="(user, index) in checkedItems" :key="user._id" class="py-2 px-4 bg-gray-100 mt-2 rounded">
              <div class="flex items-center justify-between text-left">
                <div>
                  <div class="font-bold text-sm pb-2">{{ index + 1 }}. {{ user.firstname }} {{ user.lastname }}</div>
                  <div class="text-sm text-gray-700">
                    <div class="flex items-center space-x-2">
                      <button @click="toggleExpire(user._id)" class="px-2 py-1 bg-blue-500 text-white text-xs rounded shadow">
                        <font-awesome-icon :icon="['fas', 'calendar']" class="text-white pr-1" /> วันหมดอายุ
                      </button>
                      <button @click="removeAssignment(user._id)" class="px-2 py-1 bg-red-500 text-white text-xs rounded shadow">
                        <font-awesome-icon :icon="['fas', 'trash']" class="text-white pr-1" /> ลบรายชื่อ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="showExpirePanel[user._id]" class="mt-2">
                <Datepicker v-model="expireDates[user._id]" @update:model-value="onDateSelect(user._id)" :clearable="true">
                  <template v-slot:clear="{ onClear }">
                    <button @click="onClear">Clear</button>
                  </template>
                </Datepicker>
              </div>
              <div v-if="user.expireDate && user.expireDate !== 'none'" class="text-sm text-gray-500 mt-1">
                Expiration Date: {{ formatThaidate(user.expireDate) }}
                <button @click="clearExpireDate(user._id)" class="ml-2 text-blue-500 hover:underline focus:outline-none">
                  ล้าง
                </button>
              </div>
            </li>
          </ul>
          <div v-else class="text-center text-gray-500 pt-3">ไม่มีข้อมูลที่บันทึกไว้</div>
        </div>

        <h4 class="text-gray-700 font-semibold pb-2 text-left">เพิ่มรายชื่อใหม่:</h4>

        <!-- Search Input -->
        <div class="flex justify-between items-center mb-4">
          <input
            id="search"
            type="text"
            class="px-4 py-2 w-full border-b border-gray-300 focus:outline-none"
            placeholder="ค้นหา..."
            v-model="searchQuery"
          />
        </div>

        <!-- Search Results -->
        <div v-if="searchQuery.length > 0" class="mt-2 text-left text-gray-500">
          ผลการค้นหา <span class="text-black font-semibold">{{ totalItems }}</span> รายการ
          <button @click="clearSearchQuery" type="button" class="ml-2 text-blue-500 hover:underline focus:outline-none">
            Clear
          </button>
        </div>
        <ul v-if="searchResults.length > 0" class="mt-2">
          <li v-for="result in searchResults" :key="result.enroll._id" class="py-2 px-4 hover:bg-gray-100 cursor-pointer">
            <div class="flex items-center text-left">
              <input
                type="checkbox"
                :value="result.user"
                :checked="isUserChecked(result.user._id)"
                @change="toggleCheckedItem(result.user)"
                class="mr-2"
              />
              <div>
                <div class="font-bold text-sm" v-html="highlight(result.user.firstname + ' ' + result.user.lastname)"></div>
                <div class="text-xs text-gray-700" v-html="highlight(result.user.email)"></div>
                <div class="text-xs text-gray-600 mt-1" v-html="highlight('Status: ' + result.enroll.analytics.status)"></div>
              </div>
            </div>
          </li>
        </ul>
        <div v-if="loading" class="mt-2 px-4 text-center text-gray-500">กำลังโหลด...</div>
        <div v-if="!loading && searchResults.length === 0" class="mt-2 px-4 text-center text-gray-500">ไม่พบข้อมูลที่ค้นหา.</div>

        <!-- Footer -->
        <div class="flex justify-end mt-4 border-t border-t-gray-200 mt-3 pt-3">
          * เลือกรายชื่อผู้ที่เข้าเรียนแบบพิเศษหลังจากปิดการแสดงผล
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import convertUtils from "@/plugins/convertUtils";

export default {
  props: {
    player: Object,
  },
  components: {
    Datepicker,
  },
  data() {
    return {
      isDropdownVisible: false,
      configs: storageManager.get('configs'),
      searchQuery: '',
      searchResults: [],
      totalItems: 0,
      debounceTimer: null,
      loading: false,
      activeBlock: false,
      listItems: [],
      currentPage: 1,
      limitItem: 10,
      statusFilter: 'all',
      dataItem: this.$route.params.id,
      checkedItems: [],
      showExpirePanel: {},
      expireDates: {},
      assign: [],
      localNotVisible: this.player.not_visible,
      localStatus: this.player.status,
      localPublicByDate: this.player.public_by_date || false,
      startDate: this.player.start_date || null,
      stopDate: this.player.stop_date || null,
    };
  },
  watch: {
    searchQuery() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(this.handleSearchQuery, 500);
    },
    expireDates: {
      handler(val) {
        for (const [userId, date] of Object.entries(val)) {
          if (date) {
            this.updateCheckedItem(userId, date);
            this.hideExpirePanel(userId);
          }
        }
      },
      deep: true,
    },
    isDropdownVisible(newValue) {
      if (newValue) {
        this.initializeCheckedItems();
      }
    },
    localNotVisible(newVal) {
      this.updatePlayer(newVal);
    },
    localStatus(newVal) {
      this.updatePlayer(newVal);
    },
    localPublicByDate(newVal) {
      this.updatePlayer(newVal);
    },
    startDate(newVal) {
      this.updatePlayer(newVal);
    },
    stopDate(newVal) {
      this.updatePlayer(newVal);
    }
  },
  methods: {
    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date, "short");
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    closeDropdown() {
      this.checkedItems = [];
      this.isDropdownVisible = false;
    },
    clearSearchQuery() {
      this.searchQuery = '';
      this.searchResults = [];
      this.totalItems = 0;
    },
    async handleSearchQuery() {
      if (this.searchQuery.length >= 3) {
        await this.getData();
      } else {
        this.searchResults = [];
        this.totalItems = 0;
      }
    },
    async getData() {
      this.loading = true;
      this.activeBlock = true;
      this.listItems = [];

      let andConditions = [{ courseID: this.dataItem }];

      if (this.statusFilter !== 'all') {
        andConditions.push({ status: this.statusFilter });
      }

      const pipeline = [
        { $match: { $and: andConditions } },
        { $set: { userID: { $toObjectId: "$userID" }, courseID: { $toObjectId: "$courseID" } } },
        { $lookup: { from: "user", localField: "userID", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $lookup: { from: "course", localField: "courseID", foreignField: "_id", as: "course" } },
        { $unwind: "$course" },
        {
          $lookup: {
            from: "exam",
            let: { masterID: "$course.master" },
            pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$courseId", "$$masterID"] }, { $eq: ["$type", "pre"] }] } } }],
            as: "examPre",
          },
        },
        { $unwind: { path: "$examPre", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "exam",
            let: { masterID: "$course.master" },
            pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$courseId", "$$masterID"] }, { $eq: ["$type", "post"] }] } } }],
            as: "examPost",
          },
        },
        { $unwind: { path: "$examPost", preserveNullAndEmptyArrays: true } },
        ...(this.searchQuery ? [{ $match: { $or: [{ "user.firstname": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                                                 { "user.lastname": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                                                 { "user.email": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                                                 { "user.citizen": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                                                 { "user.phone": { $regex: `.*${this.searchQuery}.*`, $options: 'i' } }
                                               ] } }] : []),
      { $facet: { paginatedData: [{ $skip: (this.currentPage - 1) * this.limitItem }, { $limit: this.limitItem },
                                   { $project: { enroll: "$$ROOT", user: "$user", course: "$course" } }],
                   totalCount: [{ $count: "count" }] } },
    ];

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
      body: JSON.stringify({ pipeline: pipeline }),
    };

    try {
      const resAPI = await fetch('https://gateway.cloudrestfulapi.com/api/enroll/aggregate', requestOptions);
      const RestReturn = await resAPI.json();

      if (RestReturn && RestReturn.length > 0) {
        const paginatedData = RestReturn[0].paginatedData;
        const totalCount = RestReturn[0].totalCount;

        const formattedData = {
          data: paginatedData.map(item => ({ enroll: item.enroll, user: item.enroll.user, course: item.enroll.course,
                                             checked: this.checkedItems.some(checkedItem => checkedItem._id === item.enroll.user._id) })),
          total: totalCount.length > 0 ? totalCount[0].count : 0,
          paging: { page: this.currentPage, limit: this.limitItem, totalPages: totalCount.length > 0 ? Math.ceil(totalCount[0].count / this.limitItem) : 0 }
        };

        this.searchResults = formattedData.data;
        this.totalItems = formattedData.total;
        this.totalPages = formattedData.paging.totalPages;

        this.loading = false;
        this.activeBlock = false;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      this.loading = false;
      this.activeBlock = false;
    }
  },
  async getUser(userID) {
    try {
      const { data } = await this.$Request.GET(`user/${userID}`, this.configs.key);
      return data;
    } catch (error) {
      console.error(`Error fetching user data for ID: ${userID}`, error);
      return null;
    }
  },
  async initializeCheckedItems() {
    await this.getPlayer();
    if (this.assign && Array.isArray(this.assign)) {
      const userPromises = this.assign.map(async assignment => {
        const user = await this.getUser(assignment.userID);
        if (user) {
          this.checkedItems.push({
            ...user,
            expireDate: assignment.expire
          });
          this.expireDates[user._id] = assignment.expire; // Initialize expireDates
        }
      });
      await Promise.all(userPromises);
    }
  },
  async getPlayer() {
    try {
      const { data } = await this.$Request.GET(`player/${this.player._id}`, this.configs.key);
      this.assign = data.assignments || [];
    } catch (error) {
      console.error(`Error fetching player data for ID: ${this.player._id}`, error);
      return null;
    }
  },
  async assignEnroll(userId, expireDate) {
    expireDate = expireDate || 'none'; // Set 'none' if expireDate is null or undefined
    if (!this.assign) {
      this.assign = [];
    }
    const existingAssignmentIndex = this.assign.findIndex(item => item.userID === userId);

    if (existingAssignmentIndex !== -1) {
      // Update the existing assignment
      this.assign[existingAssignmentIndex].expire = expireDate;
    } else {
      // Push a new assignment
      this.assign.push({ userID: userId, expire: expireDate });
    }

    await this.updateAssignments();
  },
  async removeAssignment(userId) {
    // Remove the assignment
    this.assign = this.assign.filter(item => item.userID !== userId);

    // Update checkedItems
    this.checkedItems = this.checkedItems.filter(item => item._id !== userId);

    await this.updateAssignments();
  },
  async updateAssignments() {
    const requestBody = {
      data: {
        assignments: this.assign
      }
    };

    try {
      const response = await this.$Request.PUT(`player/${this.player._id}`, requestBody, this.configs.key);
      const { data, status } = response;

      if (status === 200) {
        console.log(`Successfully updated assignments for session ID: ${this.player._id}`);
        console.log('Updated Data:', data);
      } else {
        console.error(`Failed to update assignments for session ID: ${this.player._id}. Status: ${status}`);
      }
    } catch (error) {
      console.error(`Error updating assignments for session ID: ${this.player._id}`, error);
    }
  },
  toggleExpire(userId) {
    const newShowExpirePanel = { ...this.showExpirePanel };
    newShowExpirePanel[userId] = !newShowExpirePanel[userId];
    this.showExpirePanel = newShowExpirePanel;
  },
  onDateSelect(userId) {
    const date = this.expireDates[userId];
    if (date) {
      this.updateCheckedItem(userId, date);
      this.hideExpirePanel(userId);
    }
  },
  updateCheckedItem(userId, date) {
    const updatedCheckedItems = this.checkedItems.map(item => {
      if (item._id === userId) {
        return { ...item, expireDate: date };
      }
      return item;
    });
    this.checkedItems = updatedCheckedItems;
    this.assignEnroll(userId, date); // Automatically update assignment when expiration date changes
  },
  hideExpirePanel(userId) {
    const newShowExpirePanel = { ...this.showExpirePanel };
    delete newShowExpirePanel[userId];
    this.showExpirePanel = newShowExpirePanel;
  },
  highlight(text) {
    if (!this.searchQuery) return text;
    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, '<span class="bg-black text-white">$1</span>');
  },
  clearExpireDate(userId) {
    const updatedCheckedItems = this.checkedItems.map(item => {
      if (item._id === userId) {
        return { ...item, expireDate: null };
      }
      return item;
    });
    this.checkedItems = updatedCheckedItems;
    this.expireDates = { ...this.expireDates, [userId]: null };
    this.assignEnroll(userId, null); // Automatically update assignment when expiration date is cleared
  },
  isUserChecked(userId) {
    return this.checkedItems.some(user => user._id === userId);
  },
  async toggleCheckedItem(user) {
    const existingIndex = this.checkedItems.findIndex(item => item._id === user._id);
    if (existingIndex === -1) {
      this.checkedItems.push(user);
      await this.assignEnroll(user._id, this.expireDates[user._id] || 'none'); // Automatically assign when checked
    } else {
      this.checkedItems.splice(existingIndex, 1);
      await this.removeAssignment(user._id); // Automatically remove when unchecked
    }
  },
  async updatePlayer() {
    const requestBody = {
      data: {
        assignments: this.assign,
        not_visible: this.localNotVisible,
        status: this.localStatus,
        public_by_date: this.localPublicByDate,
        start_date: this.startDate,
        stop_date: this.stopDate,
      },
    };

    try {
      const response = await this.$Request.PUT(`player/${this.player._id}`, requestBody, this.configs.key);
      const { data, status } = response;

      if (status === 200) {
        console.log(`Successfully updated player data for session ID: ${this.player._id}`);
        console.log('Updated Data:', data);
        this.$emit('set-content-reload');
      } else {
        console.error(`Failed to update player data for session ID: ${this.player._id}. Status: ${status}`);
      }
    } catch (error) {
      console.error(`Error updating player data for session ID: ${this.player._id}`, error);
    }
  },
},
};

</script>

<style scoped>
/* Add any custom styles here */
</style>

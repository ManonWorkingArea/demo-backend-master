<script>
import feather from 'feather-icons';
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import Preview from '@/interface/template/Preview.vue';
import Pagination from '@/utils/Paginated.vue';
import CustomConfirmation from '@/utils/Confirmation.vue';

export default {
  inject: ['apiRequest'],
  props: {
    itemType: {
      type: String,
      default: 'page'
    },
    dataItem: {
      type: [Object, String, null],
      default: null
    }
  },
  data() {
    const accessToken = storageManager.get('session', 'token');
    const session = storageManager.get('session');

    const currentTheme = session.current.theme || {}; // Ensure current.theme is defined
    const selectedHome = currentTheme.homepage || '';
    const selectedHeader = currentTheme.header || '';
    const selectedFooter = currentTheme.footer || '';
    const selectedNavigator = currentTheme.navigator || '';
    const selectedSubheader = currentTheme.subheader || '';

    const selectedCheckoutPage = currentTheme.checkout || '';
    const selectedDashboardPage = currentTheme.dashboard || '';
    const selectedLoginPage = currentTheme.login || '';
    const selectedResetPasswordPage = currentTheme.resetpassword || '';
    const selectedForgotPasswordPage = currentTheme.changepassword || '';

    return {
      configs: storageManager.get('configs'),
      hostkey: this.$Key,
      accessToken,
      session,
      listItems: [],
      selectedHome,
      selectedHeader,
      selectedSubheader,
      selectedFooter,
      selectedNavigator,
      loading_sources: true,
      showPopup: false,
      limitItem: 50,
      limitOptions: [10, 20, 50, 100, 200, 500, 1000, 2000], // Define the available options
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      notificationCount: 2,
      filterTypes: [
        { name: 'หน้าเว็บ', value: 'page', icon: 'fas fa-file', color: '#3b82f6' },
        { name: 'แบบฟอร์ม', value: 'form', icon: 'fas fa-file-alt', color: '#1f2937' },
        { name: 'ดีไซน์', value: 'layout', icon: 'fas fa-pencil-ruler', color: '#ef4444' },
        { name: 'เมนู', value: 'menu', icon: 'fas fa-list', color: '#22c55e' }
      ],
      selectedTypes: [],
      localDataItem: this.dataItem,
      previewVisible: false,
      confirmationMessage: '',
      confirmationHeader: '',
      showConfirmation: false,
      deletionData: null,
      searchTerm: '',
      activeTab: 'home',
      selectedLoginPage, // Selected page for User Login
      selectedResetPasswordPage, // Selected page for User Reset Password
      selectedForgotPasswordPage, // Selected page for User Change Password
      selectedCheckoutPage,
      selectedDashboardPage, // Selected page for User Dashboard
      emailTemplates: {
        welcomeEmail: '',
        recoveryPassword: '',
        otp: '',
        general: ''
      },
      emailTemplateOptions: [], // List of available email templates
      viewMode: this.dataItem ? 'list' : 'grid', // ถ้ามี dataItem ให้ default เป็น list
      bulkActions: false,
      selectedItems: [],
      sortBy: 'date_desc',
      activeFilters: [],
      openCardMenu: null,
      parentPageInfo: null, // เก็บข้อมูลของหน้าหลัก
    };
  },
  components: {
    Preview,
    CustomConfirmation,
    Pagination
  },
  methods: {
    // Helper method สำหรับ API calls
    async makeApiCall(endpoint, method = 'GET', data = null, collection = 'post') {
      if (!this.apiRequest) {
        console.warn('ApiRequest not available');
        throw new Error('ApiRequest service not available');
      }

      try {
        // เพิ่ม /api prefix โดยอัตโนมัติถ้ายังไม่มี
        const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api/${collection}${endpoint}`;
        
        console.log(`API Call: ${method} ${apiEndpoint}`);
        
        const response = await this.apiRequest.apiCall(apiEndpoint, {
          method: method,
          body: data
        });

        return response;
      } catch (error) {
        const finalEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api/${collection}${endpoint}`;
        console.error(`API call failed for ${method} ${finalEndpoint}:`, error);
        throw error;
      }
    },

    removeItem(itemIndex) {
      this.confirmationMessage = 'คุณต้องการลบเนื้อหา (Page) นี้ ?';
      this.confirmationHeader = 'ยืนยันการทำรายการ';
      this.deletionData = {
        itemIndex
      };
      this.showConfirmation = true;
    },
    confirmRemoveItem() {
      const { itemIndex, bulkDelete, items } = this.deletionData;
      
      if (bulkDelete && items) {
        // Handle bulk delete
        console.log("Bulk Delete", items);
        this.bulkDeleteItems(items);
      } else if (itemIndex) {
        // Handle single delete
        console.log("Delete", itemIndex);
        this.deleteData(itemIndex);
      }
      
      this.handleConfirmCancel();
    },
    handleConfirmCancel() {
      this.deletionData = null;
      this.confirmationMessage = '';
      this.confirmationHeader = '';
      this.showConfirmation = false;
    },
    async deleteData(id) {
      if (storageManager.get('session', 'login')) {
        try {
          this.loading_sources = false;
          console.log("id", id)

          const response = await this.makeApiCall(`/${id}`, 'DELETE', null, 'post');
          console.log(response);

          this.loading_sources = true;
          await this.getData();

        } catch (error) {
          console.log(error)
        }
      }
    },
    showPreview(id) {
      this.localDataItem = id
      this.previewVisible = true;
    },
    hidePreview() {
      this.previewVisible = false;
    },
    openPopup() {
      this.showPopup = true;
    },
    resetSelectedOptions() {
      this.selectedNavigator = '';
      this.selectedHome = '';
      this.selectedHeader = '';
      this.selectedSubheader = '';
      this.selectedFooter = '';
      this.selectedLoginPage = '';
      this.selectedResetPasswordPage = '';
      this.selectedForgotPasswordPage = '';
      this.selectedDashboardPage = '';
      this.selectedCheckoutPage = '';
    },
    updateDropdownOptions() {
      this.filteredPageItems = this.listItems.filter(item => item.type === 'page' || item.type === 'form');
      this.filteredLayoutItems = this.listItems.filter(item => item.type === 'layout');
      this.filteredMenuItems = this.listItems.filter(item => item.type === 'menu');
    },
    async savePopup() {
      const layouts = {
        homepage: this.selectedHome,
        header: this.selectedHeader,
        subheader: this.selectedSubheader,
        footer: this.selectedFooter,
        navigator: this.selectedNavigator,
        dashboard: this.selectedDashboardPage,
        checkout: this.selectedCheckoutPage,
        login: this.selectedLoginPage,
        resetpassword: this.selectedResetPasswordPage,
        changepassword: this.selectedForgotPasswordPage,
        emailTemplates: this.emailTemplates
      };

      await this.changeLayout(layouts);
      await this.refreshDropdownData();
      this.cancelPopup();
    },
    async refreshDropdownData() {
      try {
        await this.getData(true);
      } catch (error) {
        console.error("Error refreshing dropdown data:", error);
      }
    },
    cancelPopup() {
      this.showPopup = false;
    },
    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date, "short");
    },
    async getData(silent = false) {
      try {
        if (!silent) {
          this.loading_sources = false;
        }

        // เตรียม match condition
        const matchConditions = [
          { owner: this.session.current._id },
          { type: this.localDataItem && this.localDataItem.type ? 'post' : this.itemType },
          {
            $or: [
              { title: { $regex: this.searchTerm, $options: 'i' } },
              { slug: { $regex: this.searchTerm, $options: 'i' } }
            ]
          }
        ];

        // เพิ่มเงื่อนไขการกรองตาม dataItem หากมี
        if (this.localDataItem) {
          if (typeof this.localDataItem === 'object' && this.localDataItem.id) {
            // กรณีส่งมาเป็น object
            matchConditions.push({ 
              ...(this.localDataItem.type ? { type: this.localDataItem.type } : {}),
              parent: this.localDataItem.id 
            });
          } else if (typeof this.localDataItem === 'string') {
            // กรณีส่งมาเป็น string (id)
            matchConditions.push({ parent: this.localDataItem });
          }
        }

        const pipeline = [
          {
            $match: {
              $and: matchConditions,
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
            $lookup: {
              from: 'post',
              let: { 
                parentID: {
                  $cond: {
                    if: { $and: [{ $eq: ["$type", "post"] }, { $ne: ["$parent", null] }] },
                    then: { $toObjectId: "$parent" },
                    else: null
                  }
                }
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$parentID"]
                    }
                  }
                }
              ],
              as: 'pageData',
            },
          },
          {
            $addFields: {
              formCount: { $arrayElemAt: ['$formCounts.formCount', 0] },
              page: { $arrayElemAt: ['$pageData', 0] }
            },
          },
          {
            $lookup: {
              from: 'post',
              let: { thisId: '$_id', displayType: '$display' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$parent', { $toString: '$$thisId' }] },
                        { $eq: ['$type', 'post'] }
                      ]
                    }
                  }
                },
                { $count: 'cnt' }
              ],
              as: 'subPostCounts'
            }
          },
          {
            $addFields: {
              subPostCount: {
                $cond: [
                  { $eq: ['$display', 'group'] },
                  { $ifNull: [{ $arrayElemAt: ['$subPostCounts.cnt', 0] }, 0] },
                  undefined
                ]
              }
            }
          },
          {
            $unset: ['pageData', 'formCounts', 'subPostCounts']
          },
          {
            $facet: {
              post: [
                { $skip: (this.currentPage - 1) * this.limitItem },
                { $limit: this.limitItem },
                {
                  $project: {
                    page: 0,        // Exclude page field from individual posts
                    pageData: 0     // Exclude pageData field from individual posts
                  }
                }
              ],
              totalCount: [{ $count: 'count' }],
              pageInfo: [
                {
                  $match: {
                    $and: [
                      { type: "post" },
                      { parent: { $ne: null } }
                    ]
                  }
                },
                {
                  $lookup: {
                    from: 'post',
                    let: { parentID: { $toObjectId: "$parent" } },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ["$_id", "$$parentID"] }
                        }
                      }
                    ],
                    as: 'parentPage'
                  }
                },
                {
                  $replaceRoot: {
                    newRoot: { $arrayElemAt: ['$parentPage', 0] }
                  }
                },
                { $limit: 1 }
              ]
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  {
                    totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
                    pageInfo: { $arrayElemAt: ['$pageInfo', 0] }
                  },
                  { post: '$post' }
                ]
              }
            }
          }

        ];
        const requestBody = { pipeline };
        const response = await this.makeApiCall('/aggregate', 'POST', requestBody, 'post');

        // ปรับให้รองรับ response format ใหม่
        if (response && response.success && response.data && Array.isArray(response.data)) {
          // ดึง object เดียวออกมาจาก response.data array
          const dataReturn = response.data[0] || {};

          const totalCount = dataReturn.totalCount || 0;
          const pageInfo = dataReturn.pageInfo || null;

          this.listItems = Array.isArray(dataReturn.post) ? dataReturn.post : [];
          this.filteredItems = this.listItems;
          this.totalItems = totalCount;
          this.totalPages = Math.ceil(totalCount / this.limitItem);
          
          // Set parent page info directly (now it's a single object)
          if (pageInfo) {
            this.parentPageInfo = pageInfo;
          }
          
          if (!silent) {
            this.loading_sources = true;
          }
        } else {
          // Handle case when response is not successful or data is missing
          this.listItems = [];
          this.filteredItems = [];
          this.totalItems = 0;
          this.totalPages = 0;
          this.parentPageInfo = null;
          
          if (!silent) {
            this.loading_sources = true;
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    handlePageChanged(page) {
      if (page !== this.currentPage) {
        window.scrollTo(0, 0);
        this.currentPage = page;
        const session = storageManager.get('session');
        session.currentPage = this.currentPage;
        storageManager.set('session', session);
        console.log("getdata", "handlePageChanged");
        this.getData();
      }
    },
    async countFormPost(formID, formDestination) {
      if (storageManager.get('session', 'login')) {
        try {
          this.loading_sources = false;

          const requestBody = {
            method: 'find',
            args: [{ formID: formID }],
            paging: { page: this.currentPage, limit: this.limitItem },
          };

          const response = await this.makeApiCall('/count', 'POST', requestBody, formDestination);
          
          // ปรับให้รองรับ response format ใหม่
          let count = 0;
          if (response && response.success && response.data) {
            count = response.data.count || response.count || 0;
          } else if (response && response.count !== undefined) {
            // Fallback สำหรับ format เก่า
            count = response.count;
          }

          this.loading_sources = true;
          return count;
        } catch (error) {
          console.log(error);
        }
      }
    },
    async changeLayout(layouts) {
      try {
        this.activeBlock = true;

        const requestBody = {
          data: {
            theme: layouts
          }
        };

        const response = await this.makeApiCall(`/${this.session.current._id}`, 'PUT', requestBody, 'hostname');

        if (response) {
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'success',
            title: 'บันทึกข้อมูลหน้า Home',
            text: 'บันทึกข้อมูลสำหรับหน้า Home สำเร็จแล้ว',
          });

          this.activeBlock = false;
          this.getData();
          console.log(response);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async addPost(post) {
      try {
        this.activeBlock = true;

        const requestBody = {
          data: {
            ...post,
            owner: this.session.current._id,
          },
          options: {
            uniqueFields: []
          }
        };

        const response = await this.makeApiCall('/', 'POST', requestBody, 'post');

        if (response) {
          console.log(response);
          await this.getData();
        }
      } catch (error) {
        console.log(error)
      }
    },
    duplicateItem(post) {
      const clonedPost = { ...post };
      delete clonedPost._id;
      clonedPost.slug = `${clonedPost.slug}-copy`;
      clonedPost.status = false;

      let counter = 1;
      let originalTitle = clonedPost.title;

      while (this.isTitleExists(clonedPost.title)) {
        clonedPost.title = `${originalTitle} (Copy ${counter})`;
        clonedPost.slug = `${clonedPost.slug}-${counter}`;
        counter++;
      }

      this.addPost(clonedPost);
    },
    isTitleExists(title) {
      return this.listItems.some(item => item.title === title);
    },
    updated() {
      feather.replace();
    },
    selectTab(index) {
      this.selectedTab = index;
      // เปลี่ยน URL โดยเพิ่มพารามิเตอร์ #tab
      window.location.hash = `#tab${index + 1}`; // เพิ่ม 1 เพื่อให้แท็บเริ่มจาก 1
    },
    applySorting() {
      this.getData(true);
    },
    getTypeName(type) {
      const typeInfo = this.filterTypes.find(t => t.value === type);
      return typeInfo ? typeInfo.name : type.charAt(0).toUpperCase() + type.slice(1);
    },
    getTypeIcon(type) {
      const typeInfo = this.filterTypes.find(t => t.value === type);
      return typeInfo ? typeInfo.icon : 'fas fa-file';
    },
    getTypeColor(type) {
      const typeInfo = this.filterTypes.find(t => t.value === type);
      return typeInfo ? typeInfo.color : '#6b7280';
    },
    getTotalViews() {
      return this.listItems.reduce((total, item) => total + (item.views || 0), 0);
    },
    getLastUpdate() {
      if (this.listItems.length === 0) return 'ไม่มีข้อมูล';
      const lastUpdate = this.listItems.reduce((latest, item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate > latest ? itemDate : latest;
      }, new Date(0));
      return this.formatThaidate(lastUpdate);
    },
    getPostTypeIcon(post) {
      if (post.type === 'page' && post.isHome) {
        return 'fas fa-home';
      }
      if (post.display === 'group') {
        return 'fas fa-folder';
      }
      const typeInfo = this.filterTypes.find(t => t.value === post.type);
      return typeInfo ? typeInfo.icon : 'fas fa-file';
    },
    getPostTypeColor(post) {
      if (post.type === 'page' && post.isHome) {
        return '#f59e0b';
      }
      const typeInfo = this.filterTypes.find(t => t.value === post.type);
      return typeInfo ? typeInfo.color : '#6b7280';
    },
    toggleSelectAll(event) {
      if (event.target.checked) {
        this.selectedItems = this.filteredListItems.map(item => item._id);
      } else {
        this.selectedItems = [];
      }
    },
    async bulkDelete() {
      if (this.selectedItems.length === 0) return;
      
      this.confirmationMessage = `คุณต้องการลบเนื้อหา ${this.selectedItems.length} รายการ ?`;
      this.confirmationHeader = 'ยืนยันการลบหลายรายการ';
      this.deletionData = {
        bulkDelete: true,
        items: [...this.selectedItems]
      };
      this.showConfirmation = true;
    },
    async bulkDuplicate() {
      if (this.selectedItems.length === 0) return;
      
      try {
        this.loading_sources = false;
        
        for (const itemId of this.selectedItems) {
          const post = this.listItems.find(item => item._id === itemId);
          if (post) {
            await this.duplicateItem(post);
          }
        }
        
        this.selectedItems = [];
        this.bulkActions = false;
        await this.getData();
        this.loading_sources = true;
      } catch (error) {
        console.error('Error in bulk duplicate:', error);
        this.loading_sources = true;
      }
    },
    clearAllFilters() {
      this.searchTerm = '';
      this.selectedTypes = [];
      this.activeFilters = [];
      this.sortBy = 'date_desc';
      this.getData(true);
    },
    removeFilter(filterKey) {
      this.activeFilters = this.activeFilters.filter(f => f.key !== filterKey);
      // Implement filter removal logic based on filterKey
      this.getData(true);
    },
    async bulkDeleteItems(itemIds) {
      if (storageManager.get('session', 'login')) {
        try {
          this.loading_sources = false;
          
          for (const itemId of itemIds) {
            await this.makeApiCall(`/${itemId}`, 'DELETE', null, 'post');
          }
          
          this.selectedItems = [];
          this.bulkActions = false;
          this.loading_sources = true;
          await this.getData();

        } catch (error) {
          console.log(error);
          this.loading_sources = true;
        }
      }
    },
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.$toast.success('คัดลอกลิงค์แล้ว');
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.$toast.success('คัดลอกลิงค์แล้ว');
      }
    },
    toggleCardMenu(postId) {
      this.openCardMenu = this.openCardMenu === postId ? null : postId;
    },
    closeCardMenu() {
      this.openCardMenu = null;
    },
    async toggleFavorite(post) {
      try {
        post.isFavorite = !post.isFavorite;
        
        // Update in API if needed
        const response = await this.makeApiCall(`/${post._id}`, 'PUT', {
          data: {
            isFavorite: post.isFavorite
          }
        }, 'post');
        
        if (response) {
          this.$toast.success(post.isFavorite ? 'เพิ่มในรายการโปรดแล้ว' : 'ลบออกจากรายการโปรดแล้ว');
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        // Revert the change if API call fails
        post.isFavorite = !post.isFavorite;
        this.$toast.error('เกิดข้อผิดพลาด');
      }
    },
    handleClickOutside(event) {
      if (this.openCardMenu && !this.$el.contains(event.target)) {
        this.closeCardMenu();
      }
    },
    async getParentPageInfo() {
      if (this.localDataItem && this.localDataItem.id) {
        try {
          const response = await this.makeApiCall(`/${this.localDataItem.id}`, 'GET', null, 'post');
          
          // ปรับให้รองรับ response format ใหม่
          if (response && response.success && response.data) {
            this.parentPageInfo = response.data;
          } else if (response && response.data) {
            // Fallback สำหรับ format เก่า
            this.parentPageInfo = response.data;
          }
        } catch (error) {
          console.error('Error fetching parent page info:', error);
        }
      }
    },
  },
  watch: {
    listItems(newValue) {
      if (newValue && newValue.length) {
        this.updateDropdownOptions();
      }
    },
    searchTerm() {
      this.getData(true);
    }
  },
  async mounted() {
    try {
      await this.getData();
      await this.getParentPageInfo(); // เพิ่มการโหลดข้อมูลหน้าหลัก
      this.updateDropdownOptions();
      
      // ตรวจสอบพารามิเตอร์ใน URL
      const hash = window.location.hash;
      if (hash) {
        const tabIndex = parseInt(hash.replace('#tab', '')) - 1; // แปลงพารามิเตอร์เป็นหมายเลขแท็บ
        if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < this.tabs.length) {
          this.selectedTab = tabIndex; // ตั้งค่าแท็บที่ถูกเลือก
        }
      }

      // Add click outside listener for dropdown menus
      document.addEventListener('click', this.handleClickOutside);
    } catch (error) {
      console.log(Error);
    }
  },
  beforeUnmount() {
    // Remove event listener
    document.removeEventListener('click', this.handleClickOutside);
  },
  computed: {
    filteredListItems() {
      if (this.selectedTypes.length === 0) {
        const sortedItems = [...this.listItems];
        sortedItems.sort((a, b) => {
          if (a.type === 'page') {
            return -1;
          } else if (a.type === 'form' && b.type === 'layout') {
            return -1;
          } else if (a.type === 'layout' && b.type === 'form') {
            return 1;
          } else {
            return 0;
          }
        });

        const mappedItems = sortedItems.map(item => ({
          ...item,
          isHome: item._id === this.selectedHome
        }));

        const homeItemIndex = mappedItems.findIndex(item => item.isHome === true);

        if (homeItemIndex !== -1) {
          const homeItem = mappedItems.splice(homeItemIndex, 1)[0];
          mappedItems.unshift(homeItem);
        }

        return mappedItems;
      } else {
        const sortedItems = [...this.listItems];
        sortedItems.sort((a, b) => {
          if (this.selectedTypes.includes(a.type) && this.selectedTypes.includes(b.type)) {
            if (a.type === 'page') {
              return -1;
            } else if (a.type === 'form' && b.type === 'layout') {
              return -1;
            } else if (a.type === 'layout' && b.type === 'form') {
              return 1;
            } else {
              return 0;
            }
          } else if (this.selectedTypes.includes(a.type)) {
            return -1;
          } else if (this.selectedTypes.includes(b.type)) {
            return 1;
          } else {
            return 0;
          }
        });

        const filteredItems = sortedItems.map(item => ({
          ...item,
          isHome: item._id === this.selectedHome
        })).filter(item => this.selectedTypes.includes(item.type));

        const homeItemIndex = filteredItems.findIndex(item => item.isHome === true);

        if (homeItemIndex !== -1) {
          const homeItem = filteredItems.splice(homeItemIndex, 1)[0];
          filteredItems.unshift(homeItem);
        }

        return filteredItems;
      }
    },
    filteredPageItems() {
      return this.listItems.filter(item => item.type === 'page' || item.type === 'form');
    },
    filteredLayoutItems() {
      return this.listItems.filter(item => item.type === 'layout');
    },
    filteredMenuItems() {
      return this.listItems.filter(item => item.type === 'menu');
    }
  },
}
</script>

<template>
  <custom-confirmation
  v-if="showConfirmation"
  :message="confirmationMessage"
  :header="confirmationHeader"
  @confirm="confirmRemoveItem"
  @cancel="handleConfirmCancel"
  ></custom-confirmation>

  <Preview :visible="this.previewVisible" :data-item="this.localDataItem" @close="hidePreview"></Preview>
  
  <div class="space-y-4">
    <!-- Parent Page Header (แสดงเมื่อมี pageInfo) -->
    <div v-if="parentPageInfo" class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <i :class="getPostTypeIcon(parentPageInfo)" class="text-white text-xl"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ parentPageInfo.title }}</h1>
            <p class="text-sm text-gray-600">จัดการเนื้อหาภายใน{{ getTypeName(parentPageInfo.type) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <router-link 
            :to="`/cms/edit/${parentPageInfo._id}#${parentPageInfo.type}`"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <i class="fas fa-edit"></i>
            <span>แก้ไขหน้าหลัก</span>
          </router-link>
          <router-link 
            :to="`/cms/builder/${parentPageInfo._id}`"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <i class="fas fa-palette"></i>
            <span>ออกแบบหน้าหลัก</span>
          </router-link>
        </div>
      </div>
      
      <!-- Parent Page Stats -->
      <div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-3 border border-blue-100">
          <div class="flex items-center gap-2">
            <i class="fas fa-eye text-blue-500"></i>
            <div>
              <p class="text-xs text-gray-500">การเข้าชม</p>
              <p class="font-semibold text-gray-900">{{ formatNumber(parentPageInfo.visitor || 0) }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg p-3 border border-blue-100">
          <div class="flex items-center gap-2">
            <i class="fas fa-newspaper text-green-500"></i>
            <div>
              <p class="text-xs text-gray-500">เนื้อหาทั้งหมด</p>
              <p class="font-semibold text-gray-900">{{ totalItems }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg p-3 border border-blue-100">
          <div class="flex items-center gap-2">
            <i class="fas fa-check-circle text-green-500"></i>
            <div>
              <p class="text-xs text-gray-500">เผยแพร่แล้ว</p>
              <p class="font-semibold text-gray-900">{{ filteredListItems.filter(item => item.status).length }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg p-3 border border-blue-100">
          <div class="flex items-center gap-2">
            <i class="fas fa-edit text-orange-500"></i>
            <div>
              <p class="text-xs text-gray-500">ร่าง</p>
              <p class="font-semibold text-gray-900">{{ filteredListItems.filter(item => !item.status).length }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Header Section -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <!-- Breadcrumb Navigation (ปรับปรุงให้แสดงข้อมูลชัดเจนขึ้น) -->
        <div class="flex items-center gap-2 text-sm">
          <router-link 
            to="/cms/pages" 
            class="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <i class="fas fa-home text-xs"></i>
            <span>หน้าหลัก</span>
          </router-link>
          
          <i class="fas fa-chevron-right text-xs text-gray-400"></i>
          
          <div v-if="parentPageInfo" class="flex items-center gap-2">
            <div 
              class="w-6 h-6 rounded flex items-center justify-center text-xs"
              :style="{ backgroundColor: `${getPostTypeColor(parentPageInfo)}15`, color: getPostTypeColor(parentPageInfo) }"
            >
              <i :class="getPostTypeIcon(parentPageInfo)"></i>
            </div>
            <span class="font-medium text-gray-700">{{ parentPageInfo.title }}</span>
            <span class="text-xs text-gray-500">({{ getTypeName(parentPageInfo.type) }})</span>
          </div>
          <div v-else>
            <span class="font-medium text-gray-700">{{ getTypeName(itemType) }}</span>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="flex flex-col md:flex-row gap-3 flex-1">
          <!-- Search Input -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input 
                v-model="searchTerm" 
                type="text" 
                placeholder="ค้นหาเนื้อหา..." 
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <!-- Sort Options -->
          <div class="flex gap-2">
            <select 
              v-model="sortBy" 
              @change="applySorting"
              class="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="date_desc">วันที่ล่าสุด</option>
              <option value="date_asc">วันที่เก่าสุด</option>
              <option value="title_asc">ชื่อ A-Z</option>
              <option value="title_desc">ชื่อ Z-A</option>
            </select>

            <!-- View Mode Toggle -->
            <div class="flex border border-gray-200 rounded-lg overflow-hidden">
              <button 
                @click="viewMode = 'grid'"
                :class="viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
                class="px-3 py-2.5 text-sm transition-colors"
              >
                <i class="fas fa-th"></i>
              </button>
              <button 
                @click="viewMode = 'list'"
                :class="viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
                class="px-3 py-2.5 text-sm transition-colors border-l border-gray-200"
              >
                <i class="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button 
            @click="bulkActions = !bulkActions"
            class="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
          >
            <i class="fas fa-check-square"></i>
            <span>เลือกหลายรายการ</span>
          </button>
        </div>

        <!-- Back Button for Parent Item (ปรับปรุงให้ชัดเจนขึ้น) -->
        <div v-if="parentPageInfo" class="flex items-center gap-2">
          <router-link 
            :to="`/cms/pages/`" 
            class="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
          >
            <i class="fas fa-arrow-left"></i>
            <span>กลับไปยังรายการหลัก</span>
          </router-link>
        </div>
      </div>

      <!-- Filter Tags -->
      <div v-if="activeFilters.length > 0" class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
        <span class="text-sm text-gray-500">ตัวกรอง:</span>
        <span 
          v-for="filter in activeFilters" 
          :key="filter.key"
          class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
        >
          {{ filter.label }}
          <button @click="removeFilter(filter.key)" class="hover:text-blue-600">
            <i class="fas fa-times text-xs"></i>
          </button>
        </span>
        <button @click="clearAllFilters" class="text-xs text-gray-500 hover:text-gray-700">
          ล้างทั้งหมด
        </button>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div v-if="bulkActions && selectedItems.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div class="flex items-center justify-between">
        <span class="text-sm text-blue-700">เลือกแล้ว {{ selectedItems.length }} รายการ</span>
        <div class="flex gap-2">
          <button 
            @click="bulkDelete"
            class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
          >
            <i class="fas fa-trash mr-1"></i>
            ลบที่เลือก
          </button>
          <button 
            @click="bulkDuplicate"
            class="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            <i class="fas fa-clone mr-1"></i>
            สำเนาที่เลือก
          </button>
        </div>
      </div>
    </div>

    <!-- Current Filter Info (ปรับปรุงให้แสดงข้อมูลหน้าหลัก) -->
    <div v-if="loading_sources" class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-gray-900">
          <span v-if="parentPageInfo">เนื้อหาใน "{{ parentPageInfo.title }}"</span>
          <span v-else class="capitalize">
            {{ itemType === 'page' ? 'หน้าเว็บ' : itemType === 'form' ? 'แบบฟอร์ม' : itemType === 'layout' ? 'เลย์เอาต์' : 'เมนู' }}
          </span>
        </h2>
        <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
          {{ filteredListItems.length }} รายการ
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!loading_sources" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Content Grid/List -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <!-- Content Cards -->
      <div 
        v-for="(post) in filteredListItems" 
        :key="post._id" 
        class="group relative bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden content-card transition-all duration-200 hover:shadow-lg"
        :class="{ 
          'ring-1 ring-blue-500': selectedItems.includes(post._id),
          'folder': post.display === 'group', 
          'file': post.display !== 'group' 
        }"
      >
        <!-- Card Header -->
        <div class="relative p-3">
          <!-- Top Row: Selection, Type Icon & Status -->
          <div class="flex items-center justify-between mb-2">
            <!-- Left: Selection & Type Icon -->
            <div class="flex items-center gap-2">
              <div v-if="bulkActions" class="flex-shrink-0">
                <input 
                  type="checkbox" 
                  :value="post._id"
                  v-model="selectedItems"
                  class="w-3.5 h-3.5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                />
              </div>
              
              <div 
                class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative"
                :style="{ backgroundColor: `${getPostTypeColor(post)}15`, color: getPostTypeColor(post) }"
              >
                <i 
                  :class="getPostTypeIcon(post)" 
                  class="text-sm"
                ></i>

                <!-- Sub Post Count Badge for Group Posts -->
                <div 
                  v-if="post.display === 'group' && post.subPostCount !== undefined" 
                  class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white"
                  :title="`${post.subPostCount} บทความ`"
                >
                  <span class="text-[10px] leading-none">{{ post.subPostCount > 99 ? '99+' : post.subPostCount }}</span>
                </div>
              </div>
              
            </div>

            <!-- Center: Special Badges -->
            <div class="flex-1 flex justify-center">
              <div v-if="post.isHome" class="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <i class="fas fa-home text-xs"></i>
                <span>หน้าหลัก</span>
              </div>
              <div v-else-if="post.isTemplate" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                <i class="fas fa-palette text-xs"></i>
                <span>เทมเพลต</span>
              </div>
            </div>

            <!-- Right: Status & Quick Actions -->
            <div class="flex items-center gap-2">
              <!-- Status Indicator -->
              <div class="flex items-center gap-1">
                <div 
                  :class="{
                    'bg-green-500': post.status,
                    'bg-gray-400': !post.status
                  }"
                  class="w-1.5 h-1.5 rounded-full"
                ></div>
                <span 
                  :class="{
                    'text-green-600': post.status,
                    'text-gray-500': !post.status
                  }"
                  class="text-xs font-medium"
                >
                  {{ post.status ? 'เผยแพร่' : 'ร่าง' }}
                </span>
              </div>

              <!-- Quick Actions Dropdown -->
              <div class="relative opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  @click="toggleCardMenu(post._id)"
                  class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <i class="fas fa-ellipsis-h text-xs"></i>
                </button>
                
                <!-- Dropdown Menu -->
                <div 
                  v-if="openCardMenu === post._id"
                  class="absolute right-0 top-6 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 dropdown-menu"
                >
                  <router-link 
                    :to="'/cms/edit/' + post._id + '#' + itemType"
                    class="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                    @click="closeCardMenu"
                  >
                    <i class="fas fa-edit text-blue-500 w-3"></i>
                    <span>แก้ไข</span>
                  </router-link>
                  
                  <button 
                    @click="duplicateItem(post); closeCardMenu()"
                    class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <i class="fas fa-clone text-green-500 w-3"></i>
                    <span>สำเนา</span>
                  </button>
                  
                  <button 
                    @click="showPreview(post._id); closeCardMenu()"
                    class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <i class="fas fa-globe text-purple-500 w-3"></i>
                    <span>ดูตัวอย่าง</span>
                  </button>
                  
                  <div class="border-t border-gray-100 my-1"></div>
                  
                  <button 
                    @click="removeItem(post._id); closeCardMenu()"
                    class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    <i class="fas fa-trash text-red-500 w-3"></i>
                    <span>ลบ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Body -->
        <div class="px-3 pb-2">
          <!-- Title -->
          <component 
            :is="post.display === 'group' ? 'router-link' : 'router-link'"
            :to="post.display === 'group' ? `/cms/pages/${post._id}` : `/cms/edit/${post._id}#${itemType}`"
            class="block group/title"
          >
            <h3 class="font-semibold text-gray-900 group-hover/title:text-blue-600 transition-colors text-sm leading-5 line-clamp-2 mb-2 min-h-[2.5rem]">
              {{ post.title }}
            </h3>
          </component>

          <!-- Slug -->
          <div class="flex items-center gap-1 mb-2">
            <div class="flex-1 bg-gray-50 px-2 py-1 rounded-md">
              <p class="text-xs text-gray-600 font-mono truncate">
                {{ post.slug }}
              </p>
            </div>
            <button 
              @click="copyToClipboard(post.slug)"
              class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="คัดลอกลิงค์"
            >
              <i class="fas fa-copy text-xs"></i>
            </button>
          </div>

          <!-- Meta Information -->
          <div class="space-y-1.5 mb-3">
            <!-- Date & Views -->
            <div class="flex items-center justify-between text-xs text-gray-500">
              <div class="flex items-center gap-1">
                <i class="fas fa-calendar-alt text-gray-400"></i>
                <span>{{ formatThaidate(post.createdAt) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <i class="fas fa-eye text-gray-400"></i>
                <span>{{ formatNumber(post.views || 0) }}</span>
              </div>
            </div>
            
            <!-- Additional Meta -->
            <div class="flex flex-wrap gap-1">
              <div v-if="post.type === 'form' && post.formCount" class="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                <i class="fas fa-paper-plane text-xs"></i>
                <span>{{ post.formCount }}</span>
              </div>

              <!-- <div v-if="post.display === 'group' && post.subPostCount !== undefined" class="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                <i class="fas fa-newspaper text-xs"></i>
                <span>{{ post.subPostCount }} บทความ</span>
              </div> -->
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="border-t border-gray-100">
          <!-- Primary Action Bar -->
          <div 
            class="px-3 py-2 flex items-center justify-between text-white text-xs font-medium"
            :style="{ backgroundColor: getPostTypeColor(post) }"
          >
            <template v-if="post.type === 'page' || post.type === 'layout' || post.type === 'form'">
              <router-link 
                :to="'/cms/builder/' + post._id" 
                class="flex items-center gap-1.5 hover:text-gray-200 transition-colors"
              >
                <i class="fas fa-palette"></i>
                <span>ออกแบบ</span>
              </router-link>

              <div class="flex items-center gap-2">
                <button 
                  @click="showPreview(post._id)" 
                  class="flex items-center gap-1.5 hover:text-gray-200 transition-colors"
                >
                  <i class="fas fa-external-link-alt"></i>
                  <span>ดู</span>
                </button>
                
                <router-link 
                  :to="'/cms/edit/' + post._id + '#' + itemType"
                  class="flex items-center gap-1.5 hover:text-gray-200 transition-colors"
                >
                  <i class="fas fa-edit"></i>
                  <span>แก้ไข</span>
                </router-link>
              </div>
            </template>

            <template v-else-if="post.type === 'menu'">
              <router-link 
                :to="'/cms/menu/' + post._id" 
                class="flex items-center gap-1.5 hover:text-gray-200 transition-colors"
              >
                <i class="fas fa-palette"></i>
                <span>ออกแบบ</span>
              </router-link>
              
              <router-link 
                :to="'/cms/edit/' + post._id + '#' + itemType"
                class="flex items-center gap-1.5 hover:text-gray-200 transition-colors"
              >
                <i class="fas fa-edit"></i>
                <span>แก้ไข</span>
              </router-link>
            </template>
          </div>

          <!-- Secondary Actions -->
          <div class="bg-gray-50 px-3 py-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <router-link 
                v-if="post.display === 'group'" 
                :to="'/cms/pages/' + post._id" 
                class="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
              >
                <i class="fas fa-newspaper"></i>
                <span>{{ post.subPostCount || 0 }} บทความ</span>
              </router-link>

              <router-link 
                v-if="post.type === 'form'" 
                :to="'/cms/form/' + post._id" 
                class="flex items-center gap-1 text-xs text-gray-600 hover:text-green-600 transition-colors"
              >
                <div class="w-4 h-4 bg-green-500 text-white rounded text-xs flex items-center justify-center font-bold">
                  {{ post.formCount || 0 }}
                </div>
                <span>ข้อมูล</span>
              </router-link>
            </div>

            <!-- Quick Actions -->
            <div class="flex items-center gap-0.5">
              <button 
                @click="toggleFavorite(post)"
                :class="post.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'"
                class="p-1 rounded-md hover:bg-white transition-all"
                title="เพิ่มในรายการโปรด"
              >
                <i :class="post.isFavorite ? 'fas fa-star' : 'far fa-star'" class="text-xs"></i>
              </button>
              
              <button 
                @click="duplicateItem(post)" 
                class="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded-md transition-all"
                title="สำเนา"
              >
                <i class="fas fa-clone text-xs"></i>
              </button>
              
              <button 
                @click="removeItem(post._id)" 
                class="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded-md transition-all"
                title="ลบ"
              >
                <i class="fas fa-trash text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading Overlay -->
        <div v-if="post.loading" class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-1"></div>
            <p class="text-xs text-gray-500">กำลังดำเนินการ...</p>
          </div>
        </div>
      </div>

      <!-- Add New Item Card -->
      <router-link 
        :to="localDataItem && localDataItem.id 
          ? `/cms/post/${localDataItem.id}/add` 
          : '/cms/add'" 
        class="group bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer add-content-card hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 min-h-[240px]"
      >
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-200 mb-3 shadow-lg shadow-blue-500/25">
          <i class="fas fa-plus text-lg"></i>
        </div>
        <h3 class="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors mb-1">เพิ่มเนื้อหาใหม่</h3>
        <p class="text-sm text-gray-500 text-center">สร้าง{{ getTypeName(itemType).toLowerCase() }}ใหม่</p>
      </router-link>
    </div>

    <!-- List View -->
    <div v-else-if="viewMode === 'list'" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <!-- List Header -->
      <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div v-if="bulkActions" class="flex items-center">
              <input 
                type="checkbox" 
                @change="toggleSelectAll"
                :checked="selectedItems.length === filteredListItems.length && filteredListItems.length > 0"
                class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span class="ml-2 text-sm text-gray-600">เลือกทั้งหมด</span>
            </div>
            <h3 class="text-sm font-medium text-gray-900">รายการเนื้อหา</h3>
          </div>
          <div class="text-sm text-gray-500">
            {{ filteredListItems.length }} รายการ
          </div>
        </div>
      </div>

      <!-- List Items -->
      <div class="divide-y divide-gray-200">
        <div 
          v-for="(post) in filteredListItems" 
          :key="post._id"
          class="group hover:bg-gray-50 transition-colors duration-200"
          :class="{ 'bg-blue-50': selectedItems.includes(post._id) }"
        >
          <div class="px-4 py-4">
            <div class="flex items-center gap-4">
              <!-- Selection Checkbox -->
              <div v-if="bulkActions" class="flex-shrink-0">
                <input 
                  type="checkbox" 
                  :value="post._id"
                  v-model="selectedItems"
                  class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </div>

              <!-- Type Icon -->
              <div class="flex-shrink-0">
                <div 
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :style="{ backgroundColor: `${getPostTypeColor(post)}15`, color: getPostTypeColor(post) }"
                >
                  <i 
                    :class="getPostTypeIcon(post)" 
                    class="text-lg"
                  ></i>
                </div>
              </div>

              <!-- Content Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <!-- Title -->
                  <component 
                    :is="post.display === 'group' ? 'router-link' : 'router-link'"
                    :to="post.display === 'group' ? `/cms/pages/${post._id}` : `/cms/edit/${post._id}#${itemType}`"
                    class="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm"
                  >
                    {{ post.title }}
                  </component>

                  <!-- Special Badges -->
                  <div v-if="post.isHome" class="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                    <i class="fas fa-home text-xs"></i>
                    <span>หน้าหลัก</span>
                  </div>
                  <div v-else-if="post.isTemplate" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                    <i class="fas fa-palette text-xs"></i>
                    <span>เทมเพลต</span>
                  </div>
                </div>

                <!-- Slug -->
                <div class="flex items-center gap-2 mb-2">
                  <div class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-mono">
                    {{ post.slug }}
                  </div>
                  <button 
                    @click="copyToClipboard(post.slug)"
                    class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                    title="คัดลอกลิงค์"
                  >
                    <i class="fas fa-copy text-xs"></i>
                  </button>
                </div>

                <!-- Meta Information -->
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <div class="flex items-center gap-1">
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ formatThaidate(post.createdAt) }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <i class="fas fa-eye"></i>
                    <span>{{ formatNumber(post.views || 0) }} ครั้ง</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span>ประเภท:</span>
                    <span class="font-medium">{{ getTypeName(post.type) }}</span>
                  </div>
                </div>
              </div>

              <!-- Status -->
              <div class="flex-shrink-0">
                <div class="flex items-center gap-1">
                  <div 
                    :class="{
                      'bg-green-500': post.status,
                      'bg-gray-400': !post.status
                    }"
                    class="w-2 h-2 rounded-full"
                  ></div>
                  <span 
                    :class="{
                      'text-green-600': post.status,
                      'text-gray-500': !post.status
                    }"
                    class="text-sm font-medium"
                  >
                    {{ post.status ? 'เผยแพร่' : 'ร่าง' }}
                  </span>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="flex-shrink-0">
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <!-- Primary Actions -->
                  <template v-if="post.type === 'page' || post.type === 'layout' || post.type === 'form'">
                    <router-link 
                      :to="'/cms/builder/' + post._id" 
                      class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="ออกแบบ"
                    >
                      <i class="fas fa-palette text-sm"></i>
                    </router-link>
                    <button 
                      @click="showPreview(post._id)" 
                      class="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="ดูตัวอย่าง"
                    >
                      <i class="fas fa-external-link-alt text-sm"></i>
                    </button>
                  </template>
                  <template v-else-if="post.type === 'menu'">
                    <router-link 
                      :to="'/cms/menu/' + post._id" 
                      class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="ออกแบบเมนู"
                    >
                      <i class="fas fa-palette text-sm"></i>
                    </router-link>
                  </template>

                  <!-- Secondary Actions -->
                  <router-link 
                    :to="'/cms/edit/' + post._id + '#' + itemType"
                    class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <i class="fas fa-edit text-sm"></i>
                  </router-link>
                  
                  <button 
                    @click="toggleFavorite(post)"
                    :class="post.isFavorite ? 'text-yellow-500 hover:bg-yellow-100' : 'text-gray-400 hover:bg-gray-100'"
                    class="p-2 rounded-lg transition-colors"
                    title="เพิ่มในรายการโปรด"
                  >
                    <i :class="post.isFavorite ? 'fas fa-star' : 'far fa-star'" class="text-sm"></i>
                  </button>
                  
                  <button 
                    @click="duplicateItem(post)" 
                    class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="สำเนา"
                  >
                    <i class="fas fa-clone text-sm"></i>
                  </button>
                  
                  <button 
                    @click="removeItem(post._id)" 
                    class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <i class="fas fa-trash text-sm"></i>
                  </button>
                </div>
              </div>

              <!-- More Actions Dropdown -->
              <div class="flex-shrink-0 relative">
                <button 
                  @click="toggleCardMenu(post._id)"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i class="fas fa-ellipsis-v text-sm"></i>
                </button>
                
                <!-- Dropdown Menu -->
                <div 
                  v-if="openCardMenu === post._id"
                  class="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 dropdown-menu"
                >
                  <router-link 
                    :to="'/cms/edit/' + post._id + '#' + itemType"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    @click="closeCardMenu"
                  >
                    <i class="fas fa-edit text-blue-500 w-4"></i>
                    <span>แก้ไขเนื้อหา</span>
                  </router-link>
                  
                  <router-link 
                    v-if="post.display === 'group'" 
                    :to="'/cms/pages/' + post._id"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    @click="closeCardMenu"
                  >
                    <i class="fas fa-newspaper text-blue-500 w-4"></i>
                    <span>จัดการบทความ ({{ post.subPostCount || 0 }})</span>
                  </router-link>

                  <router-link 
                    v-if="post.type === 'form'" 
                    :to="'/cms/form/' + post._id"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    @click="closeCardMenu"
                  >
                    <i class="fas fa-database text-green-500 w-4"></i>
                    <span>ข้อมูลที่ส่ง ({{ post.formCount || 0 }})</span>
                  </router-link>
                  
                  <button 
                    @click="duplicateItem(post); closeCardMenu()"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <i class="fas fa-clone text-green-500 w-4"></i>
                    <span>สำเนารายการ</span>
                  </button>
                  
                  <button 
                    @click="showPreview(post._id); closeCardMenu()"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <i class="fas fa-globe text-purple-500 w-4"></i>
                    <span>ดูตัวอย่าง</span>
                  </button>
                  
                  <div class="border-t border-gray-100 my-1"></div>
                  
                  <button 
                    @click="removeItem(post._id); closeCardMenu()"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <i class="fas fa-trash text-red-500 w-4"></i>
                    <span>ลบรายการ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add New Item Row -->
      <div class="border-t border-gray-200 bg-gray-50">
        <router-link 
          :to="localDataItem && localDataItem.id 
            ? `/cms/post/${localDataItem.id}/add` 
            : '/cms/add'" 
          class="group flex items-center gap-4 px-4 py-4 hover:bg-gray-100 transition-colors"
        >
          <div class="w-10 h-10 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 transition-colors">
            <i class="fas fa-plus text-gray-400 group-hover:text-blue-500 transition-colors"></i>
          </div>
          <div>
            <div class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">เพิ่มเนื้อหาใหม่</div>
            <div class="text-sm text-gray-500">สร้าง{{ getTypeName(itemType).toLowerCase() }}ใหม่</div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredListItems.length === 0" class="text-center py-20">
      <i class="fas fa-file-alt text-gray-300 text-6xl mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบเนื้อหา</h3>
      <p class="text-gray-500 mb-6">ยังไม่มีเนื้อหาในประเภทนี้</p>
      <router-link 
        :to="localDataItem && localDataItem.id 
          ? `/cms/post/${localDataItem.id}/add` 
          : '/cms/add'" 
        class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
      >
        <i class="fas fa-plus text-sm"></i>
        เพิ่มเนื้อหาใหม่
      </router-link>
    </div>

    <!-- Footer Pagination -->
    <div class="border-t border-gray-200 bg-white rounded-lg p-4 mt-8">
      <Pagination 
        :current-page="currentPage" 
        :total-items="totalItems" 
        :total-pages="totalPages" 
        :limit-items="limitItem" 
        :data-loading="!loading_sources" 
        :display-mode="'summary'" 
        @page-changed="handlePageChanged" 
      />
    </div>
  </div>
</template>

<style scoped>
.tab-folder {
  display: flex;
}

.tab-folder-item {
  padding: 10px 20px 5px 20px;
  cursor: pointer;
}

.tab-folder-item:hover {
}

.tab-folder-item.active {
  font-weight: bold;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.transition-opacity {
  transition: opacity 0.2s ease-in-out;
}

/* Focus states */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Content card animations */
.content-card {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.content-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Enhanced add content card */
.add-content-card {
  transition: all 0.2s ease;
  border: 2px dashed #d1d5db;
  position: relative;
}

.add-content-card:hover {
  transform: translateY(-2px);
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

/* Dropdown menu animations */
.dropdown-menu {
  animation: dropdownFadeIn 0.15s ease-out;
  transform-origin: top right;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Quick action buttons */
.quick-action {
  transition: all 0.15s ease;
}

.quick-action:hover {
  transform: scale(1.05);
}

.quick-action:active {
  transform: scale(0.95);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Enhanced responsive design */
@media (max-width: 1024px) {
  .content-card:hover {
    transform: translateY(-1px);
  }
  
  .add-content-card:hover {
    transform: translateY(-1px);
  }
}

@media (max-width: 768px) {
  .content-card {
    border-radius: 0.75rem;
  }
  
  .dropdown-menu {
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    top: auto;
    width: auto;
    transform-origin: bottom center;
  }
}

@media (max-width: 640px) {
  .content-card:hover {
    transform: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .add-content-card:hover {
    transform: none;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
}

/* Enhanced focus states */
.content-card:focus-within {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .content-card,
  .add-content-card,
  .quick-action {
    transition: none !important;
    animation: none !important;
  }
  
  .content-card:hover,
  .add-content-card:hover {
    transform: none !important;
  }
}

</style>
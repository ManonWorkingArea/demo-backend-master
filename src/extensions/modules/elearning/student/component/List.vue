<script>
import storageManager from "@/plugins/storage";
import Subhead from "@/interface/template/outline/Subhead.vue";
import Pagination from "@/utils/Paginated.vue";
import BatchProgress from "@/utils/BatchProgress.vue";
import AddUserModal from "./AddUserModal.vue";
import LazyImage from "@/components/LazyImage.vue";
import convertUtils from "@/plugins/convertUtils";
import CryptoJS from "crypto-js";

export default {
  props: {
    // ประเภทของ header layout
    headerType: {
      type: String,
      default: null,
      validator: value => ['topbar', 'breadcrumb', 'full-admin', null].includes(value)
    },
    // ความสูงของ header แบบกำหนดเอง
    headerHeight: {
      type: [Number, String],
      default: null
    },
    // ความสูงทั้งหมดแบบกำหนดเอง
    customHeight: {
      type: String,
      default: null
    },
    // CSS class เพิ่มเติม
    customClass: {
      type: String,
      default: ''
    }
  },
  data() {
    const session = storageManager.get("session");
    const paging = storageManager.get("paging");
    return {
      open: false,
      dataItem: this.$route.params.id,
      school: session.current.id,
      login: session.login,
      courseData: [],
      listItems: [],
      categoryData: [],
      loading_sources: true,
      endpoint: "",
      master: session.master,
      accessToken: storageManager.get("session", "token"),
      configs: storageManager.get("configs"),
      session: storageManager.get("session"),

      limitOptions: [1, 10, 50, 100, 200, 500, 1000, 2000, 3000, 4000], // Define the available options
      totalPages: 0,
      totalItems: 0,

      limitItem: 50,
      currentPage: 1,
      searchQuery: "",
      debounceTimer: null,

      pagingInfo: paging || {
        [this.$route.path]: {
          limitItem: 50,
          currentPage: 1,
          searchQuery: "",
        },
      },

      showPasswordChangeModal: false,
      newPassword: "",

      loading: false,
      showingOverlay: false,
      statusFilter: "all",
      isCreatingUser: false,
      isShowingOverlay: false,
      loadingMessage: "",
      processingCount: "",
      activeBlock: false,
      scb: [],
      isProcessing: false,
      processName: "",
      progressText: "",
      progressTotal: 0,
      progressCurrent: 0,
      startTime: null,
      endTime: null,
      layoutVisibility: {
        order: true,
        enroll: true,
      },

      showMobileSidebar: false,
      
      // เพิ่มตัวแปรสำหรับ Advanced Filtering
      showAdvancedFilter: false,
      
      // เพิ่มตัวแปรสำหรับ UI enhancements
      showRowActions: null,
      copiedId: null,
      
      // Progressive/Lazy Rendering Options
      lazy: true, // Option to enable/disable lazy rendering
      initialDisplayCount: 30, // จำนวนที่แสดงครั้งแรก
      loadMoreCount: 10, // จำนวนที่โหลดเพิ่มทีละครั้ง
      currentDisplayCount: 30, // จำนวนที่แสดงปัจจุบัน
      isLoadingMore: false, // สถานะการโหลดเพิ่ม
      
      filterOptions: {
        dateRange: {
          start: null,
          end: null
        },
        enrollmentCount: {
          min: null,
          max: null
        },
        status: 'all',
        hasAvatar: null, // null = all, true = มีรูป, false = ไม่มีรูป
        registrationSource: 'all' // all, online, offline, import
      },
      
      // เพิ่มตัวแปรสำหรับ Bulk Operations
      selectedItems: [],
      bulkActionMode: false,
      showBulkActions: false,
      
      // เพิ่มตัวแปรสำหรับ Export
      exportLoading: false,
      exportProgress: 0,
      
      // เพิ่มตัวแปรสำหรับ Quick Actions
      showQuickActions: false,
      quickActionTarget: null,
      
      // เพิ่มตัวแปรสำหรับติดตามสถานะรูป
      imageLoadErrors: {},
      
      // เพิ่มตัวแปรสำหรับ Add User Modal
      showAddUserModal: false,
    };
  },
  components: {
    Subhead,
    Pagination,
    BatchProgress,
    AddUserModal,
    LazyImage,
  },
  methods: {
    async batchProcessInChunks() {
      this.isProcessing = true;
      this.processName = `Processing Items`;
      this.progressTotal = 28779; // Set progressTotal to 200
      this.progressCurrent = 0;
      this.startTime = new Date().toISOString();
      this.endTime = null;

      const totalPages = Math.ceil(this.totalItems / this.limitItem);
      let processedCount = 0;

      for (let page = 1; page <= totalPages; page++) {
        await this.getData(page, this.limitItem, true);

        for (const item of this.listItems) {
          const additionalData = await this.fetchAdditionalData(item);
          if (additionalData && additionalData[0]) {
            console.log("User", item._id); // Process the item
            console.log("Form", additionalData[0].formData["upload-33-13-13"].value[0]); // Process additional data if needed

            const avatarImg = additionalData[0].formData["upload-33-13-13"].value[0];
            await this.updateAvatarImg(item, avatarImg);
          }

          this.progressCurrent++;
          this.progressText = `Processing: ${this.progressCurrent}/${this.progressTotal}`;
          processedCount++;

          // Introduce a delay every 100 items to prevent batch force detection
          if (processedCount % 100 === 0) {
            await this.delay(1000); // Delay for 1 second
          }

          // Stop processing after 200 items
          if (processedCount >= 28779) {
            this.progressText = `Processed 200 items, stopping...`;
            this.endTime = new Date().toISOString();
            this.isProcessing = false;
            return;
          }
        }
      }

      this.progressText = `All Process: Done`;
      this.endTime = new Date().toISOString();
      this.isProcessing = false;
    },

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async updateAvatarImg(item, avatarImg) {
      const requestBody = {
        data: {
          avatar_img: avatarImg,
        },
        options: {},
      };

      try {
        const { data, status } = await this.$Request.PUT(
          `user/${item._id}`,
          requestBody,
          this.configs.key
        );
        if (status === 200) {
          console.log(`Avatar updated for user ${item._id} ${data}`);
        } else {
          console.error(`Failed to update avatar for user ${item._id}`);
        }
      } catch (error) {
        console.error(`Error updating avatar for user ${item._id}:`, error);
      }
    },

    async fetchAdditionalData(item) {
      try {
        const response = await this.$Request.POST(
          "form/query",
          { method: "find", args: [{ $and: [{ userID: item._id }] }] },
          this.configs.key
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching additional data:", error);
        return null;
      }
    },
    openPasswordChangeModal(userId) {
      this.userIdForPasswordChange = userId; // Store the user._id
      this.showPasswordChangeModal = true;
    },
    closePasswordChangeModal() {
      this.showPasswordChangeModal = false;
    },
    openAddUserModal() {
      this.showAddUserModal = true;
    },
    closeAddUserModal() {
      this.showAddUserModal = false;
    },
    async handleAddUserSubmit(formData) {
      // Handle form submission here
      console.log('Form submitted:', formData);
      console.log('Taxonomy terms selected:', formData.taxonomy_terms);
      
      // Example API call (uncomment and modify as needed):
      /*
      try {
        const salt = CryptoJS.lib.WordArray.random(16);
        const hash = CryptoJS.SHA256(formData.password + salt).toString();
        
        const response = await this.$Request.POST('/api/users', {
          firstname: formData.firstName,
          lastname: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          idCard: formData.idCard,
          password: hash,
          salt: salt.toString(),
          sendWelcomeEmail: formData.sendWelcomeEmail,
          forcePasswordChange: formData.forcePasswordChange,
          taxonomy_terms: formData.taxonomy_terms || [] // รวม taxonomy terms ในการสร้าง user
        });
        
        if (response.success) {
          await this.getData();
          this.$swal('สำเร็จ', 'เพิ่มผู้เรียนใหม่เรียบร้อยแล้ว', 'success');
        }
      } catch (error) {
        console.error('Error creating user:', error);
        this.$swal('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มผู้เรียนได้', 'error');
      }
      */
    },
    async changePassword() {
      try {
        const userId = this.userIdForPasswordChange;
        console.log(userId);

        const salt = CryptoJS.lib.WordArray.random(16);
        const hash = CryptoJS.SHA256(this.newPassword + salt).toString();

        const { data, status } = await this.$Request.PUT(
          `user/${userId}`,
          {
            data: {
              password: hash,
              salt: salt.toString(),
              req_reset: true,
            },
          },
          this.configs.key
        );

        console.log("Data:", data);
        console.log("Status:", status);

        if (status === 200) {
          console.log("Password changed successfully!");
          // Close the password change modal here
          this.closePasswordChangeModal();
        } else {
          console.error("Failed to change password.");
        }
      } catch (error) {
        console.error("An error occurred while changing the password:", error);
      }
    },
    togglePanel() {
      this.open = !this.open;
    },
    closePanel() {
      this.open = false;
    },
    leadingZero(number) {
      return number < 10 ? "0" + number : number.toString();
    },
    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date, "short");
    },
    updateURLParameters() {
      const updatedUrlParams = new URLSearchParams(window.location.search);
      if (this.currentPage > 1) {
        updatedUrlParams.set("page", this.currentPage);
      } else {
        updatedUrlParams.delete("page");
      }
      if (this.searchQuery) {
        updatedUrlParams.set("searchQuery", this.searchQuery);
      } else {
        updatedUrlParams.delete("searchQuery");
      }
      const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
      window.history.replaceState({}, "", updatedUrl);
    },
    handleLimitChange() {
      console.log(`🔄 Limit changed to: ${this.limitItem}`);
      const paging = storageManager.get("paging") || {};
      paging[this.$route.path] = {
        limitItem: this.limitItem,
        currentPage: 1,
        searchQuery: this.searchQuery,
      };
      storageManager.set("paging", paging);
      this.updateURLParameters();
      this.getData();
    },
    handlePageChanged(page) {
      if (page !== this.currentPage) {
        window.scrollTo(0, 0);
        this.currentPage = page;
        const paging = storageManager.get("paging") || {};
        paging[this.$route.path] = {
          limitItem: this.limitItem,
          currentPage: this.currentPage,
          searchQuery: this.searchQuery,
        };
        storageManager.set("paging", paging);
        this.updateURLParameters();
        this.getData();
      }
    },
    clearSearchQuery() {
      this.searchQuery = "";
      const paging = storageManager.get("paging") || {};
      paging[this.$route.path] = {
        limitItem: this.limitItem,
        currentPage: this.currentPage,
        searchQuery: this.searchQuery,
      };
      storageManager.set("paging", paging);
      this.updateURLParameters();
      this.handleSearchKeydown({ key: "Enter" });
      this.getData();
    },
    handleSearchKeydown(event) {
      clearTimeout(this.debounceTimer);
      const updateDataAndURL = () => {
        this.getData();
        const paging = storageManager.get("paging") || {};
        paging[this.$route.path] = {
          limitItem: this.limitItem,
          currentPage: 1, // Reset current page to 1
          searchQuery: this.searchQuery,
        };
        storageManager.set("paging", paging);
        this.updateURLParameters();
        this.handlePageChanged(1);
      };
      if (event.key === "Enter" && this.searchQuery.length >= 3) {
        updateDataAndURL();
      } else {
        this.debounceTimer = setTimeout(updateDataAndURL, 500);
      }
    },
    toggleStatus(status) {
      console.log("Toggle Status", status);
      this.statusFilter = status;
      this.getData();
    },
    closeProgress() {
      this.isProcessing = false;
    },
    async batchProcess() {
      this.open = false;
      let totalItems = this.listItems.length;
      let counter = 0;
      /* Batch Process Param */
      this.isProcessing = true;
      this.processName = `Render Billing`;
      this.progressTotal = totalItems;
      this.startTime = new Date().toISOString();
      this.endTime = null;
      for (const item of this.listItems) {
        counter++;
        /* Batch Process Param */
        this.progressText = `Processing : ${counter}/${totalItems}`;
        this.progressCurrent = counter;
        await this.executeCustomQueries(item.order.ref, item.order._id);
      }
      /* Batch Process Param */
      this.progressText = `All Process : Done`;
      this.endTime = new Date().toISOString();
    },
    async getData(page = this.currentPage, limit = this.limitItem, silent = false) {
      const startTime = performance.now();
      console.log(`⏱️ getData started - Page: ${page}, Limit: ${limit}, Silent: ${silent}`);
      
      this.listItems = [];
      this.totalItems = 0;

      if (!silent) {
        this.loading = true;
        this.activeBlock = true;
      }

      try {
        let andConditions = [{ parent: this.session.current._id }];
        
        // Basic search
        if (this.searchQuery) {
          andConditions.push({
            $or: [
              { name: { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
              { citizen: { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
              { email: { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
              { firstname: { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
              { lastname: { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
              { old_id: { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
              { phone: { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
              { token: { $regex: `.*${this.searchQuery}.*`, $options: "i" } },
            ],
          });
        }

        // Advanced Filtering
        // Date Range Filter
        if (this.filterOptions.dateRange.start || this.filterOptions.dateRange.end) {
          const dateFilter = {};
          if (this.filterOptions.dateRange.start) {
            dateFilter.$gte = new Date(this.filterOptions.dateRange.start);
          }
          if (this.filterOptions.dateRange.end) {
            dateFilter.$lte = new Date(this.filterOptions.dateRange.end);
          }
          andConditions.push({ createdAt: dateFilter });
        }

        // Avatar Filter
        if (this.filterOptions.hasAvatar !== null) {
          if (this.filterOptions.hasAvatar) {
            andConditions.push({ 
              avatar_img: { $exists: true, $nin: [null, ""] } 
            });
          } else {
            andConditions.push({ 
              $or: [
                { avatar_img: { $exists: false } },
                { avatar_img: null },
                { avatar_img: "" }
              ]
            });
          }
        }

        // Status Filter
        if (this.filterOptions.status !== 'all') {
          andConditions.push({ status: this.filterOptions.status });
        }

        const pipeline = [
          {
            $match: {
              $and: andConditions,
            },
          },
          // Efficient lookup and count in one go
          {
            $lookup: {
              from: "enroll",
              let: { userId: { $toString: "$_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$userID", "$$userId"] }
                  }
                },
                {
                  $project: { _id: 1 }
                }
              ],
              as: "enrolls"
            }
          },
          {
            $addFields: {
              enrollCount: { $size: "$enrolls" }
            }
          },
          {
            $unset: "enrolls"  // Remove array after counting
          },
          // Filter by enrollment count if specified
          ...(this.filterOptions.enrollmentCount.min !== null || this.filterOptions.enrollmentCount.max !== null ? [{
            $match: {
              $and: [
                ...(this.filterOptions.enrollmentCount.min !== null ? [{ enrollCount: { $gte: parseInt(this.filterOptions.enrollmentCount.min) } }] : []),
                ...(this.filterOptions.enrollmentCount.max !== null ? [{ enrollCount: { $lte: parseInt(this.filterOptions.enrollmentCount.max) } }] : [])
              ]
            }
          }] : []),
          {
            $facet: {
              paginatedData: [
                { $skip: (page - 1) * limit },
                { $limit: limit },
                {
                  $project: {
                    user: "$$ROOT",
                  },
                },
              ],
              totalCount: [{ $count: "count" }],
            },
          },
        ];

        const mongoStartTime = performance.now();
        console.log(`🔍 MongoDB query started - Pipeline stages: ${pipeline.length}`);

        const { data: restReturn } = await this.$Request.POST(
          "user/aggregate",
          { pipeline: pipeline },
          this.configs.key
        );

        const mongoEndTime = performance.now();
        const mongoTime = (mongoEndTime - mongoStartTime).toFixed(2);
        console.log(`📊 MongoDB query completed - Time: ${mongoTime}ms, Data size: ${JSON.stringify(restReturn).length} bytes`);

        if (restReturn && restReturn.length > 0) {
          const firstItem = restReturn[0];
          if (firstItem.paginatedData && firstItem.paginatedData.length > 0) {
            const paginatedData = firstItem.paginatedData;

            const totalCount = firstItem.totalCount[0].count;

            const transformStartTime = performance.now();
            console.log(`🔄 Data transformation started - Items to process: ${paginatedData.length}`);

            const formattedData = {
              data: paginatedData,
              total: totalCount,
              paging: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(totalCount / limit),
              },
            };

            this.listItems = formattedData.data.map((item) => {
              const updatedItem = { ...item.user };

              Object.keys(updatedItem).forEach((key) => {
                const value = updatedItem[key];

                if (typeof value === "string") {
                  const lowerCaseValue = value.toLowerCase();
                  const searchQuery = this.searchQuery.toLowerCase();
                  const startIndex = lowerCaseValue.indexOf(searchQuery);

                  if (startIndex !== -1 && searchQuery.length > 0) {
                    const endIndex = startIndex + searchQuery.length;
                    const highlightedValue =
                      value.substring(0, startIndex) +
                      '<span class="text-red-500 font-bold">' +
                      value.substring(startIndex, endIndex) +
                      "</span>" +
                      value.substring(endIndex);
                    updatedItem[key] = highlightedValue;
                  }
                }
              });

              return updatedItem;
            });

            const transformEndTime = performance.now();
            const transformTime = (transformEndTime - transformStartTime).toFixed(2);
            console.log(`✨ Data transformation completed - Time: ${transformTime}ms, Items processed: ${this.listItems.length}`);

            this.totalItems = formattedData.total;
            this.totalPages = formattedData.paging.totalPages;

            if (!silent) {
              this.loading = false;
              this.activeBlock = false;
            }
            
            const endTime = performance.now();
            const processingTime = (endTime - startTime).toFixed(2);
            const totalMongoTime = mongoTime;
            const networkTime = (parseFloat(processingTime) - parseFloat(mongoTime) - parseFloat(transformTime)).toFixed(2);
            
            console.log(`✅ getData completed - Total: ${processingTime}ms`);
            console.log(`📈 Performance breakdown:`);
            console.log(`  🔗 Network + Overhead: ${networkTime}ms`);
            console.log(`  🗄️  MongoDB Processing: ${totalMongoTime}ms`);
            console.log(`  🔄 Data Transformation: ${transformTime}ms`);
            console.log(`  📊 Items: ${this.listItems.length}, Total Records: ${this.totalItems}`);
            
            // Reset display count สำหรับ lazy loading
            if (this.lazy) {
              this.resetDisplayCount();
            }
            
            // Wait for Vue reactivity and browser paint to complete
            await this.$nextTick();
            await new Promise(resolve => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  // Double RAF to ensure paint is complete
                  setTimeout(resolve, 0);
                });
              });
            });
            
            const finalEndTime = performance.now();
            const finalProcessingTime = (finalEndTime - startTime).toFixed(2);
            const renderTime = (finalEndTime - endTime).toFixed(2);
            
            console.log(`🏁 Final completion (including DOM render) - Total: ${finalProcessingTime}ms`);
            console.log(`🎨 DOM Render Time: ${renderTime}ms`);
            console.log(`📈 Complete breakdown:`);
            console.log(`  🔗 Network + Overhead: ${networkTime}ms`);
            console.log(`  🗄️  MongoDB Processing: ${totalMongoTime}ms`);
            console.log(`  🔄 Data Transformation: ${transformTime}ms`);
            console.log(`  🎨 DOM Rendering: ${renderTime}ms`);
            console.log(`  📊 Performance ratio: MongoDB(${(parseFloat(totalMongoTime)/parseFloat(finalProcessingTime)*100).toFixed(1)}%) | Transform(${(parseFloat(transformTime)/parseFloat(finalProcessingTime)*100).toFixed(1)}%) | Render(${(parseFloat(renderTime)/parseFloat(finalProcessingTime)*100).toFixed(1)}%)`);
          } else {
            console.error("Paginated data is missing or empty.");
          }
        } else {
          console.error("No data in 'restReturn' or 'restReturn' is empty.");
        }
      } catch (error) {
        console.log(error);
        const endTime = performance.now();
        const processingTime = (endTime - startTime).toFixed(2);
        console.log(`❌ getData error - Time: ${processingTime}ms, Error:`, error);
      } finally {
        if (!silent) {
          this.loading = false;
          this.activeBlock = false;
        }
      }
    },
    toggleMobileSidebar() {
      this.showMobileSidebar = !this.showMobileSidebar;
    },
    calculateHeaderHeight() {
      // ถ้ามี customHeight หรือ headerHeight ที่กำหนดไว้แล้ว ไม่ต้องคำนวณ
      if (this.customHeight || this.headerHeight) {
        if (this.headerHeight) {
          const height = typeof this.headerHeight === 'number' 
            ? `${this.headerHeight}px` 
            : this.headerHeight;
          document.documentElement.style.setProperty('--header-height', height);
        }
        return;
      }
      
      // ตรวจสอบว่า component element พร้อมแล้วหรือไม่
      if (!this.$el || typeof this.$el.getBoundingClientRect !== 'function') {
        console.log('List Component: Element not ready yet, using default height');
        const defaultHeight = window.innerWidth <= 768 ? 56 : 80;
        document.documentElement.style.setProperty('--header-height', `${defaultHeight}px`);
        return;
      }
      
      // ตรวจจับความสูงของ header elements ที่อยู่ด้านบน
      let headerHeight = 0;
      
      // ค้นหา header elements ทั่วไป
      const possibleHeaders = [
        'header',
        '.header',
        '.navbar',
        '.topbar',
        '.breadcrumb',
        '.access-bar',
        '[class*="header"]',
        '[class*="navbar"]',
        '[class*="topbar"]',
        '[role="banner"]'
      ];
      
      possibleHeaders.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (element && this.isElementAbove(element)) {
              headerHeight += element.offsetHeight;
            }
          });
        } catch (error) {
          console.warn(`Error checking element with selector ${selector}:`, error);
        }
      });
      
      // ถ้าไม่พบ header ให้ใช้ค่าเริ่มต้นตาม headerType
      if (headerHeight === 0) {
        switch (this.headerType) {
          case 'topbar':
            headerHeight = 120;
            break;
          case 'breadcrumb':
            headerHeight = 140;
            break;
          case 'full-admin':
            headerHeight = 160;
            break;
          default:
            headerHeight = window.innerWidth <= 768 ? 56 : 80;
        }
      }
      
      // เพิ่ม padding เล็กน้อยเพื่อความปลอดภัย
      headerHeight += 8;
      
      // ตั้งค่า CSS variable
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      
      // Log สำหรับ debug
      console.log(`List Component: Calculated header height = ${headerHeight}px`);
    },
    
    isElementAbove(element) {
      // ตรวจสอบว่า element และ component element มีอยู่จริงและเป็น DOM element
      if (!element || !this.$el) return false;
      
      // ตรวจสอบเพิ่มเติมว่า this.$el เป็น DOM element จริงๆ
      if (typeof this.$el.getBoundingClientRect !== 'function') {
        console.warn('this.$el is not a valid DOM element');
        return false;
      }
      
      try {
        const elementRect = element.getBoundingClientRect();
        const listRect = this.$el.getBoundingClientRect();
        
        return elementRect.bottom <= listRect.top;
      } catch (error) {
        console.warn('Error in isElementAbove:', error);
        return false;
      }
    },
    // =============== Advanced Filtering Methods ===============
    toggleAdvancedFilter() {
      this.showAdvancedFilter = !this.showAdvancedFilter;
    },
    
    applyAdvancedFilter() {
      this.currentPage = 1;
      this.getData();
      this.showAdvancedFilter = false;
    },
    
    clearAdvancedFilter() {
      this.filterOptions = {
        dateRange: { start: null, end: null },
        enrollmentCount: { min: null, max: null },
        status: 'all',
        hasAvatar: null,
        registrationSource: 'all'
      };
      this.getData();
    },
    
    // =============== Bulk Operations Methods ===============
    toggleBulkMode() {
      this.bulkActionMode = !this.bulkActionMode;
      this.selectedItems = [];
      this.showBulkActions = false;
      
      // รอให้ Vue อัปเดต DOM ก่อนดำเนินการต่อ
      this.$nextTick(() => {
        // DOM อัปเดตเสร็จแล้ว สามารถทำการอื่นๆ ได้
        console.log('Bulk mode toggled:', this.bulkActionMode);
      });
    },
    
    toggleItemSelection(itemId) {
      const index = this.selectedItems.indexOf(itemId);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      } else {
        this.selectedItems.push(itemId);
      }
      this.showBulkActions = this.selectedItems.length > 0;
    },
    
    selectAllItems() {
      if (this.selectedItems.length === this.listItems.length) {
        this.selectedItems = [];
      } else {
        this.selectedItems = this.listItems.map(item => item._id);
      }
      this.showBulkActions = this.selectedItems.length > 0;
    },
    
    async bulkDeleteItems() {
      if (!confirm(`คุณต้องการลบรายการที่เลือก ${this.selectedItems.length} รายการใช่หรือไม่?`)) {
        return;
      }
      
      this.isProcessing = true;
      this.processName = 'กำลังลบข้อมูล';
      this.progressTotal = this.selectedItems.length;
      this.progressCurrent = 0;
      
      for (const itemId of this.selectedItems) {
        try {
          await this.$Request.DELETE(`user/${itemId}`, {}, this.configs.key);
          this.progressCurrent++;
          this.progressText = `ลบแล้ว: ${this.progressCurrent}/${this.progressTotal}`;
        } catch (error) {
          console.error(`Error deleting user ${itemId}:`, error);
        }
      }
      
      this.isProcessing = false;
      this.selectedItems = [];
      this.showBulkActions = false;
      this.bulkActionMode = false;
      await this.getData();
    },
    
    async bulkSendEmail() {
      if (!confirm(`คุณต้องการส่งอีเมลไปยัง ${this.selectedItems.length} คนใช่หรือไม่?`)) {
        return;
      }
      
      this.isProcessing = true;
      this.processName = 'กำลังส่งอีเมล';
      this.progressTotal = this.selectedItems.length;
      this.progressCurrent = 0;
      
      for (const itemId of this.selectedItems) {
        try {
          const user = this.listItems.find(item => item._id === itemId);
          if (user && user.email) {
            // เรียก API ส่งอีเมล
            await this.$Request.POST('email/send', {
              to: user.email,
              subject: 'การแจ้งเตือนจากระบบ',
              template: 'notification',
              data: { name: user.firstname + ' ' + user.lastname }
            }, this.configs.key);
            
            this.progressCurrent++;
            this.progressText = `ส่งแล้ว: ${this.progressCurrent}/${this.progressTotal}`;
          }
        } catch (error) {
          console.error(`Error sending email to user ${itemId}:`, error);
        }
      }
      
      this.isProcessing = false;
      this.selectedItems = [];
      this.showBulkActions = false;
    },
    
    // =============== Export Methods ===============
    async exportToCSV() {
      this.exportLoading = true;
      this.exportProgress = 0;
      
      try {
        const response = await this.$Request.POST('user/export', {
          format: 'csv',
          filters: this.getExportFilters(),
          selectedIds: this.selectedItems.length > 0 ? this.selectedItems : null
        }, this.configs.key);
        
        // สร้างและดาวน์โหลดไฟล์
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('Export error:', error);
        alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
      } finally {
        this.exportLoading = false;
      }
    },
    
    async exportToExcel() {
      this.exportLoading = true;
      
      try {
        const response = await this.$Request.POST('user/export', {
          format: 'excel',
          filters: this.getExportFilters(),
          selectedIds: this.selectedItems.length > 0 ? this.selectedItems : null
        }, this.configs.key);
        
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `students_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('Export error:', error);
        alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
      } finally {
        this.exportLoading = false;
      }
    },
    
    getExportFilters() {
      return {
        searchQuery: this.searchQuery,
        dateRange: this.filterOptions.dateRange,
        enrollmentCount: this.filterOptions.enrollmentCount,
        status: this.filterOptions.status,
        hasAvatar: this.filterOptions.hasAvatar,
        registrationSource: this.filterOptions.registrationSource
      };
    },
    
    // =============== Quick Actions Methods ===============
    showQuickActionsFor(user) {
      this.quickActionTarget = user;
      this.showQuickActions = true;
    },
    
    hideQuickActions() {
      this.showQuickActions = false;
      this.quickActionTarget = null;
    },
    
    async quickEnrollStudent(courseId) {
      if (!this.quickActionTarget) return;
      
      try {
        await this.$Request.POST('enrollment/create', {
          userId: this.quickActionTarget._id,
          courseId: courseId
        }, this.configs.key);
        
        alert('ลงทะเบียนเรียบร้อยแล้ว');
        this.hideQuickActions();
        await this.getData();
      } catch (error) {
        console.error('Quick enroll error:', error);
        alert('เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    },
    
    async quickSendMessage(template) {
      if (!this.quickActionTarget) return;
      
      try {
        await this.$Request.POST('message/send', {
          userId: this.quickActionTarget._id,
          template: template,
          data: {
            name: this.quickActionTarget.firstname + ' ' + this.quickActionTarget.lastname
          }
        }, this.configs.key);
        
        alert('ส่งข้อความเรียบร้อยแล้ว');
        this.hideQuickActions();
      } catch (error) {
        console.error('Quick message error:', error);
        alert('เกิดข้อผิดพลาดในการส่งข้อความ');
      }
    },
    
    // =============== Statistics Methods ===============
    async generateReport(type) {
      this.isProcessing = true;
      this.processName = 'กำลังสร้างรายงาน';
      
      try {
        const response = await this.$Request.POST('reports/generate', {
          type: type,
          filters: this.getExportFilters(),
          dateRange: this.filterOptions.dateRange
        }, this.configs.key);
        
        // เปิดรายงานในแท็บใหม่หรือดาวน์โหลด
        if (response.data.url) {
          window.open(response.data.url, '_blank');
        }
        
      } catch (error) {
        console.error('Report generation error:', error);
        alert('เกิดข้อผิดพลาดในการสร้างรายงาน');
      } finally {
        this.isProcessing = false;
      }
    },

    // =============== Error Prevention Methods ===============
    safeToggleBulkMode() {
      try {
        this.$nextTick(() => {
          this.toggleBulkMode();
        });
      } catch (error) {
        console.error('Error toggling bulk mode:', error);
        // รีเซ็ตสถานะในกรณีเกิดข้อผิดพลาด
        this.bulkActionMode = false;
        this.selectedItems = [];
        this.showBulkActions = false;
      }
    },

    safeToggleAdvancedFilter() {
      try {
        this.$nextTick(() => {
          this.toggleAdvancedFilter();
        });
      } catch (error) {
        console.error('Error toggling advanced filter:', error);
        this.showAdvancedFilter = false;
      }
    },

    safeShowQuickActions(user) {
      try {
        if (user && user._id) {
          this.$nextTick(() => {
            this.showQuickActionsFor(user);
          });
        }
      } catch (error) {
        console.error('Error showing quick actions:', error);
        this.hideQuickActions();
      }
    },

    // =============== Utility Methods ===============
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.copiedId = text;
        setTimeout(() => {
          this.copiedId = null;
        }, 2000);
        
        // แสดง toast notification
        this.showToast('คัดลอกแล้ว!', 'success');
      } catch (error) {
        console.error('ไม่สามารถคัดลอกได้:', error);
        this.showToast('ไม่สามารถคัดลอกได้', 'error');
      }
    },

    showToast(message, type = 'info') {
      // Simple toast implementation
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
      }`;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 2000);
    },

    getRelativeTime(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 60) {
        return `${diffMinutes} นาทีที่แล้ว`;
      } else if (diffHours < 24) {
        return `${diffHours} ชั่วโมงที่แล้ว`;
      } else if (diffDays < 7) {
        return `${diffDays} วันที่แล้ว`;
      } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
      } else if (diffDays < 365) {
        return `${Math.floor(diffDays / 30)} เดือนที่แล้ว`;
      } else {
        return `${Math.floor(diffDays / 365)} ปีที่แล้ว`;
      }
    },

    formatNumber(num) {
      return new Intl.NumberFormat('th-TH').format(num);
    },

    getInitials(firstname, lastname) {
      const first = firstname ? firstname.charAt(0).toUpperCase() : '';
      const last = lastname ? lastname.charAt(0).toUpperCase() : '';
      return first + last || 'U';
    },

    getAvatarColor(name) {
      // สร้างสีจากชื่อเพื่อให้แต่ละคนมีสีที่ไม่เหมือนกัน
      const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
        'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500',
        'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500'
      ];
      
      let hash = 0;
      if (name) {
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
      }
      
      return colors[Math.abs(hash) % colors.length];
    },

    // =============== Animation Helpers ===============
    animateCount(element, start, end, duration = 1000) {
      const range = end - start;
      const increment = range / (duration / 16);
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          current = end;
          clearInterval(timer);
        }
        element.textContent = Math.floor(current);
      }, 16);
    },

    // =============== Lazy Loading Methods ===============
    loadMoreItems() {
      if (!this.lazy || this.isLoadingMore || !this.hasMoreItems) return;
      
      this.isLoadingMore = true;
      console.log(`📦 Loading more items: ${this.currentDisplayCount} + ${this.loadMoreCount}`);
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        const newCount = Math.min(
          this.currentDisplayCount + this.loadMoreCount,
          this.listItems.length
        );
        this.currentDisplayCount = newCount;
        this.isLoadingMore = false;
        console.log(`✅ Loaded more items. Showing: ${this.currentDisplayCount}/${this.listItems.length}`);
      }, 300);
    },
    
    setupScrollDetection() {
      if (!this.lazy) return;
      
      this.$nextTick(() => {
        const handleScroll = () => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = document.documentElement.clientHeight;
          
          // Check if the body/document is actually scrollable
          if (scrollHeight <= clientHeight) {
            return;
          }

          const scrollPercent = (scrollTop + clientHeight) / scrollHeight;
          
          // โหลดเพิ่มเมื่อ scroll ถึง 80% หรือ ใกล้ถึงด้านล่างสุดมากๆ (200px)
          if ((scrollPercent > 0.8 || (scrollHeight - scrollTop - clientHeight) < 200) && this.hasMoreItems && !this.isLoadingMore) {
            this.loadMoreItems();
          }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        this.scrollCleanup = () => {
          window.removeEventListener('scroll', handleScroll);
        };
      });
    },
    
    resetDisplayCount() {
      this.currentDisplayCount = this.initialDisplayCount;
      this.isLoadingMore = false;
    },
    
    toggleLazyMode() {
      this.lazy = !this.lazy;
      console.log(`🔄 Lazy rendering: ${this.lazy ? 'Enabled' : 'Disabled'}`);
      
      if (this.lazy) {
        this.resetDisplayCount();
        this.$nextTick(() => {
          this.setupScrollDetection();
        });
      } else {
        if (this.scrollCleanup) {
          this.scrollCleanup();
        }
      }
    },
  },
  async mounted() {
    try {
      const paging = storageManager.get("paging") || {};
      const routePaging = paging[this.$route.path] || {};

      // Apply the paging information from 'paging' constant
      this.limitItem = routePaging.limitItem || 50;
      this.currentPage = routePaging.currentPage || 1;
      this.searchQuery = routePaging.searchQuery || "";

      // Update URL parameters based on the paging information
      this.updateURLParameters();

      // Calculate header height for dynamic layout after DOM is ready
      await this.$nextTick();
      // รอให้ DOM พร้อมอย่างสมบูรณ์ก่อนคำนวณ header height
      setTimeout(() => {
        if (this.$el && typeof this.$el.getBoundingClientRect === 'function') {
          this.calculateHeaderHeight();
          window.addEventListener('resize', this.calculateHeaderHeight);
        } else {
          console.warn('DOM element not ready, skipping header height calculation');
          // ใช้ค่าเริ่มต้น
          const defaultHeight = window.innerWidth <= 768 ? 56 : 80;
          document.documentElement.style.setProperty('--header-height', `${defaultHeight}px`);
        }
      }, 100);

      await this.getData();
      
      // Setup lazy loading scroll detection
      if (this.lazy) {
        this.setupScrollDetection();
      }
    } catch (error) {
      console.error(error);
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateHeaderHeight);
    // Cleanup scroll listener
    if (this.scrollCleanup) {
      this.scrollCleanup();
    }
  },
  setup() {
    //console.log("Setup");
  },
  computed: {
    filteredListItems() {
      if (this.selectedStatus === "All") {
        return this.listItems;
      } else {
        return this.listItems.filter((item) => item.status === this.selectedStatus);
      }
    },
    
    // เพิ่ม computed สำหรับ styling
    getStatusBadge() {
      return (user) => {
        const enrollmentCount = user.enrollCount || 0;
        if (enrollmentCount === 0) {
          return { 
            text: 'ยังไม่เรียน', 
            class: 'bg-gray-100 text-gray-800 border border-gray-300' 
          };
        } else if (enrollmentCount <= 2) {
          return { 
            text: 'เรียนน้อย', 
            class: 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
          };
        } else if (enrollmentCount <= 5) {
          return { 
            text: 'เรียนปานกลาง', 
            class: 'bg-blue-100 text-blue-800 border border-blue-300' 
          };
        } else {
          return { 
            text: 'เรียนเยอะ', 
            class: 'bg-green-100 text-green-800 border border-green-300' 
          };
        }
      };
    },
    
    getActivityStatus() {
      return (user) => {
        const lastLogin = user.lastLogin || user.createdAt;
        const daysSinceLogin = Math.floor((new Date() - new Date(lastLogin)) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLogin <= 1) {
          return { 
            text: 'ออนไลน์', 
            class: 'bg-green-500', 
            icon: 'fas fa-circle' 
          };
        } else if (daysSinceLogin <= 7) {
          return { 
            text: 'ใช้งานล่าสุด', 
            class: 'bg-yellow-500', 
            icon: 'fas fa-circle' 
          };
        } else {
          return { 
            text: 'ไม่ได้ใช้งาน', 
            class: 'bg-gray-400', 
            icon: 'fas fa-circle' 
          };
        }
      };
    },
    
    // Progressive/Lazy rendering computed
    visibleItems() {
      if (!this.lazy) {
        return this.listItems; // แสดงทั้งหมดถ้าไม่ใช้ lazy
      }
      return this.listItems.slice(0, this.currentDisplayCount);
    },
    
    hasMoreItems() {
      return this.lazy && this.currentDisplayCount < this.listItems.length;
    },
  },
};
</script>

<template>
  <div class="bg-gray-50 flex list-container" 
       style="min-height: calc(100vh - 140px);"
       :class="[
         headerType && `with-${headerType}`,
         customClass
       ]">
    
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:flex-col transition-all duration-300 lg:w-64">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center px-4 py-4 border-b border-gray-200 flex-shrink-0">
          <h1 class="text-lg font-semibold text-gray-900">จัดการผู้เรียน</h1>
        </div>

        <!-- Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm text-gray-700">ทั้งหมด</span>
              </div>
              <span class="text-sm font-semibold text-blue-600">{{ totalItems }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-700">หน้าปัจจุบัน</span>
              </div>
              <span class="text-sm font-semibold text-green-600">{{ listItems.length }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">เครื่องมือ</h3>
          <nav class="space-y-1">
            <button 
              @click="getData"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-sync-alt text-sm w-4"></i>
              <span class="flex-1 text-left">รีเฟรชข้อมูล</span>
            </button>
            <button 
              @click="togglePanel"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-cogs text-sm w-4"></i>
              <span class="flex-1 text-left">เครื่องมือขั้นสูง</span>
            </button>
            <button 
              @click="safeToggleAdvancedFilter"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
              :class="[showAdvancedFilter ? 'bg-blue-50 text-blue-600' : '']"
            >
              <i class="fas fa-filter text-sm w-4"></i>
              <span class="flex-1 text-left">ตัวกรองขั้นสูง</span>
              <i :class="showAdvancedFilter ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-xs"></i>
            </button>
            <button 
              @click="safeToggleBulkMode"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
              :class="[bulkActionMode ? 'bg-orange-50 text-orange-600' : '']"
            >
              <i class="fas fa-check-square text-sm w-4"></i>
              <span class="flex-1 text-left">จัดการหลายรายการ</span>
            </button>
            <button 
              @click="toggleLazyMode"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
              :class="[lazy ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600']"
            >
              <i class="fas fa-rocket text-sm w-4"></i>
              <span class="flex-1 text-left">{{ lazy ? 'Progressive Loading (เปิด)' : 'แสดงทั้งหมด (ปิด)' }}</span>
              <div class="flex items-center">
                <span class="text-xs">{{ lazy ? 'ON' : 'OFF' }}</span>
              </div>
            </button>
          </nav>
        </div>

        <!-- Advanced Filter Panel -->
        <div v-show="showAdvancedFilter" class="px-4 py-4 border-b border-gray-200 bg-blue-50" :class="{ 'hidden': !showAdvancedFilter }">
          <h3 class="text-sm font-medium text-gray-700 mb-3">ตัวกรองขั้นสูง</h3>
          
          <!-- Date Range Filter -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-600 mb-2">ช่วงวันที่ลงทะเบียน</label>
            <div class="space-y-2">
              <input
                type="date"
                v-model="filterOptions.dateRange.start"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="เริ่มต้น"
              />
              <input
                type="date"
                v-model="filterOptions.dateRange.end"
                class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="สิ้นสุด"
              />
            </div>
          </div>

          <!-- Enrollment Count Filter -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-600 mb-2">จำนวนหลักสูตร</label>
            <div class="flex space-x-2">
              <input
                type="number"
                v-model="filterOptions.enrollmentCount.min"
                class="w-1/2 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="ต่ำสุด"
                min="0"
              />
              <input
                type="number"
                v-model="filterOptions.enrollmentCount.max"
                class="w-1/2 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="สูงสุด"
                min="0"
              />
            </div>
          </div>

          <!-- Avatar Filter -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-600 mb-2">รูปโปรไฟล์</label>
            <select 
              v-model="filterOptions.hasAvatar"
              class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option :value="null">ทั้งหมด</option>
              <option :value="true">มีรูปโปรไฟล์</option>
              <option :value="false">ไม่มีรูปโปรไฟล์</option>
            </select>
          </div>

          <!-- Filter Actions -->
          <div class="flex space-x-2">
            <button
              @click="applyAdvancedFilter"
              class="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              กรองข้อมูล
            </button>
            <button
              @click="clearAdvancedFilter"
              class="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              ล้าง
            </button>
          </div>
        </div>

        <!-- Export Tools -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">เครื่องมือส่งออก</h3>
          <div class="space-y-2">
            <button 
              @click="exportToCSV"
              :disabled="exportLoading"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <i class="fas fa-file-csv text-sm w-4 text-green-600"></i>
              <span class="flex-1 text-left">ส่งออก CSV</span>
            </button>
            <button 
              @click="exportToExcel"
              :disabled="exportLoading"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <i class="fas fa-file-excel text-sm w-4 text-green-700"></i>
              <span class="flex-1 text-left">ส่งออก Excel</span>
            </button>
            <button 
              @click="generateReport('summary')"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-chart-bar text-sm w-4 text-blue-600"></i>
              <span class="flex-1 text-left">รายงานสถิติ</span>
            </button>
          </div>
        </div>

        <!-- Bulk Actions Panel -->
        <div v-show="showBulkActions" class="px-4 py-4 border-b border-gray-200 bg-orange-50" :class="{ 'hidden': !showBulkActions }">
          <h3 class="text-sm font-medium text-gray-700 mb-3">
            การดำเนินการหลายรายการ ({{ selectedItems.length }})
          </h3>
          <div class="space-y-2">
            <button 
              @click="bulkSendEmail"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-orange-600 hover:bg-orange-100 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-envelope text-sm w-4"></i>
              <span class="flex-1 text-left">ส่งอีเมล</span>
            </button>
            <button 
              @click="bulkDeleteItems"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-trash text-sm w-4"></i>
              <span class="flex-1 text-left">ลบรายการ</span>
            </button>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการ</h3>
          <div class="space-y-2">
            <button 
              @click="openAddUserModal"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-green-600 hover:bg-green-100 hover:text-green-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-user-plus text-sm w-4"></i>
              <span class="flex-1 text-left">เพิ่มผู้เรียนใหม่</span>
            </button>
            <router-link 
              :to="'/lesson/detail/' + dataItem"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
              :class="sidebarCollapsed ? 'justify-center px-2' : ''"
              :title="sidebarCollapsed ? 'ย้อนกลับ' : ''"
            >
              <i class="fas fa-chevron-left text-sm w-4"></i>
              <span v-if="!sidebarCollapsed">ย้อนกลับ</span>
            </router-link>
          </div>
        </div>

        <!-- Layout Options -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">ตัวเลือกการแสดงผล</h3>
          <div class="space-y-2">
            <label class="flex items-center cursor-pointer text-sm">
              <input
                type="checkbox"
                v-model="layoutVisibility.order"
                class="mr-2 rounded-sm border-gray-400"
              />
              แสดงคำสั่งซื้อ
            </label>
            <label class="flex items-center cursor-pointer text-sm">
              <input
                type="checkbox"
                v-model="layoutVisibility.enroll"
                class="mr-2 rounded-sm border-gray-400"
              />
              แสดงการเรียน
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 h-full">
      <!-- Mobile Header - ปรับให้กะทัดรัดขึ้น -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-3 py-2 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h1 class="text-base font-semibold text-gray-900">จัดการผู้เรียน</h1>
          <button 
            @click="toggleMobileSidebar" 
            class="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-bars text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1">
        <!-- Password Change Modal -->
        <div
          v-if="showPasswordChangeModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div class="bg-white rounded-md shadow-sm p-4 w-96">
            <h2 class="text-2xl font-semibold mb-4">เปลี่ยนรหัสผ่านสมาชิก</h2>
            <form @submit.prevent="changePassword">
              <div class="mb-4">
                <label for="newPassword" class="block text-sm font-medium text-gray-700"
                  >ระบุรหัสผ่านใหม่</label
                >
                <input
                  type="text"
                  id="newPassword"
                  v-model="newPassword"
                  class="mt-1 p-2 w-full border rounded-md"
                  required
                />
              </div>

              <div class="flex justify-between items-center">
                <button
                  class="text-sm text-gray-500 cursor-pointer hover:underline"
                  @click="closePasswordChangeModal"
                >
                  ยกเลิก
                </button>
                <button type="submit" class="bg-indigo-500 text-white px-4 py-2 rounded-md">
                  เปลี่ยนรหัส
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Add User Modal -->
        <AddUserModal 
          :showModal="showAddUserModal"
          @close="closeAddUserModal"
          @submit="handleAddUserSubmit"
        />

        <!-- Quick Actions Modal -->
        <div
          v-if="showQuickActions && quickActionTarget"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          @click="hideQuickActions"
        >
          <div class="bg-white rounded-lg shadow-lg p-6 w-96 max-w-md" @click.stop>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">การดำเนินการเร็ว</h3>
              <button @click="hideQuickActions" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="mb-4 p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-14 h-14 rounded-lg mr-3 overflow-hidden bg-gray-200 flex items-center justify-center">
                  <LazyImage
                    v-if="quickActionTarget.avatar_img && quickActionTarget.avatar_img.trim() !== ''"
                    :src="quickActionTarget.avatar_img"
                    :alt="`Profile: ${quickActionTarget.firstname} ${quickActionTarget.lastname}`"
                    container-class="w-full h-full"
                    image-class="w-full h-full object-cover"
                    skeleton-class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"
                    error-class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"
                    :root-margin="'20px'"
                    :threshold="0.1"
                  >
                    <template #loading>
                      <div class="w-full h-full flex items-center justify-center">
                        <i class="fas fa-user text-gray-400 text-lg animate-pulse"></i>
                      </div>
                    </template>
                    <template #error>
                      <div class="w-full h-full flex items-center justify-center text-white font-semibold text-sm"
                           :class="getAvatarColor(quickActionTarget.firstname + quickActionTarget.lastname)">
                        {{ getInitials(quickActionTarget.firstname, quickActionTarget.lastname) }}
                      </div>
                    </template>
                  </LazyImage>
                  
                  <div 
                    v-if="!quickActionTarget.avatar_img || quickActionTarget.avatar_img.trim() === ''"
                    class="w-full h-full flex items-center justify-center text-white font-semibold text-sm"
                    :class="getAvatarColor(quickActionTarget.firstname + quickActionTarget.lastname)">
                    {{ getInitials(quickActionTarget.firstname, quickActionTarget.lastname) }}
                  </div>
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ quickActionTarget.firstname }} {{ quickActionTarget.lastname }}
                  </p>
                  <p class="text-sm text-gray-500">{{ quickActionTarget.email }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <button
                @click="quickSendMessage('welcome')"
                class="w-full flex items-center gap-3 px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-envelope text-blue-600"></i>
                <div>
                  <p class="font-medium text-gray-900">ส่งข้อความต้อนรับ</p>
                  <p class="text-sm text-gray-500">ส่งอีเมลต้อนรับผู้เรียนใหม่</p>
                </div>
              </button>

              <button
                @click="quickSendMessage('reminder')"
                class="w-full flex items-center gap-3 px-4 py-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-bell text-yellow-600"></i>
                <div>
                  <p class="font-medium text-gray-900">ส่งการแจ้งเตือน</p>
                  <p class="text-sm text-gray-500">แจ้งเตือนงานที่ค้างอยู่</p>
                </div>
              </button>

              <button
                @click="$router.push('/student/detail/' + quickActionTarget._id); hideQuickActions()"
                class="w-full flex items-center gap-3 px-4 py-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-user-edit text-green-600"></i>
                <div>
                  <p class="font-medium text-gray-900">แก้ไขข้อมูล</p>
                  <p class="text-sm text-gray-500">ดูและแก้ไขรายละเอียดผู้เรียน</p>
                </div>
              </button>

              <button
                @click="openPasswordChangeModal(quickActionTarget._id); hideQuickActions()"
                class="w-full flex items-center gap-3 px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-key text-purple-600"></i>
                <div>
                  <p class="font-medium text-gray-900">เปลี่ยนรหัสผ่าน</p>
                  <p class="text-sm text-gray-500">ตั้งรหัสผ่านใหม่ให้ผู้เรียน</p>
                </div>
              </button>

              <button
                @click="quickEnrollStudent('default'); hideQuickActions()"
                class="w-full flex items-center gap-3 px-4 py-3 text-left bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-graduation-cap text-indigo-600"></i>
                <div>
                  <p class="font-medium text-gray-900">ลงทะเบียนเรียน</p>
                  <p class="text-sm text-gray-500">เพิ่มหลักสูตรให้ผู้เรียน</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Side Panel -->
        <div
          v-if="open"
          class="relative z-10"
          aria-labelledby="slide-over-title"
          role="dialog"
          aria-modal="true"
        >
          <div class="fixed inset-0"></div>
          <div class="fixed inset-0 overflow-hidden">
            <div class="absolute inset-0 overflow-hidden">
              <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div class="pointer-events-auto w-screen max-w-md">
                  <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div class="px-4 sm:px-6">
                      <div class="flex items-start justify-between">
                        <h2
                          class="text-base font-semibold leading-6 text-gray-900"
                          id="slide-over-title"
                        >
                          Panel title
                        </h2>
                        <div class="ml-3 flex h-7 items-center">
                          <button
                            @click="closePanel"
                            type="button"
                            class="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            <span class="absolute -inset-2.5"></span>
                            <span class="sr-only">Close panel</span>
                            <svg
                              class="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="relative mt-6 flex-1 px-4 sm:px-6">
                      <ul class="space-y-4">
                        <li>
                          <button class="text-blue-600 hover:underline" @click="renderBilling">
                            Render Billing
                          </button>
                        </li>
                        <li>
                          <button class="text-blue-600 hover:underline" @click="renderEnroll()">
                            Render Enroll
                          </button>
                        </li>
                        <li>
                          <button class="text-blue-600 hover:underline" @click="renderProfile">
                            Render Profile
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Batch Progress -->
        <batch-progress
          :processName="processName"
          :progressText="progressText"
          :progressTotal="progressTotal"
          :progressCurrent="progressCurrent"
          :isVisible="isProcessing"
          :startTime="startTime"
          :endTime="endTime"
         
          @close="closeProgress"
        />

        <!-- Subhead Component -->
        <div class="bg-white border-0 border-gray-200">
          <Subhead
            :navigation="[
              {
                name: 'เพิ่มผู้เรียน',
                function: 'openAddUserModal',
                style: 'user-plus',
                class: 'success-btn',
                visible: true,
                type: 'button',
              },
              {
                name: 'Export',
                function: 'exportToCSV',
                style: 'download',
                class: 'primary-btn',
                visible: true,
                type: 'button',
              },
              {
                name: null,
                function: 'togglePanel',
                style: 'cogs',
                class: 'default-btn',
                visible: true,
                type: 'button',
              },
              {
                name: null,
                function: 'getData',
                style: 'refresh',
                class: 'default-btn',
                visible: true,
                type: 'button',
              },
              {
                name: 'ย้อนกลับ',
                link: '/lesson/detail/' + this.dataItem,
                style: 'chevron-left',
                class: 'default-btn',
                visible: true,
                type: 'button',
              },
            ]"
            @openAddUserModal="openAddUserModal"
            @exportToCSV="exportToCSV"
            @togglePanel="togglePanel"
            @getData="getData"
          />
        </div>

        <!-- Loading Overlay -->
        <div v-if="isShowingOverlay" class="loading-overlay">
          <div class="loading-text">{{ loadingMessage }}</div>
          <div class="processing-count">{{ processingCount }}</div>
        </div>

        <!-- Main Content List -->
        <div class="flex-1 bg-gray-100">
          <div class="h-full flex flex-col">
            <div class="flex-1 flex flex-col min-h-0">
              <div class="bg-white shadow ring-1 ring-black ring-opacity-5 flex-1 flex flex-col m-2 min-h-0">
                <!-- Search and Controls Section -->
                <div class="bg-gray-100 flex-shrink-0">
                  <div class="p-2 lg:p-2">
                    <div class="flex justify-between flex-col lg:flex-row">
                      <div class="flex flex-col lg:flex-row mb-2 lg:w-1/2 lg:mr-2 lg:mb-0">
                        <input
                          id="search"
                          type="text"
                          class="px-3 py-1.5 lg:px-4 lg:py-2 rounded-md border-gray-300 bg-white focus:outline-none w-full lg:w-48 text-sm"
                          placeholder="ค้นหา..."
                          v-model="searchQuery"
                          @keydown="handleSearchKeydown"
                        />
                        <div v-if="searchQuery.length > 0">
                          <div class="ml-1 text-left text-gray-500 text-xs lg:text-sm">
                            ผลการค้นหา
                            <span class="text-black font-semibold">{{ totalItems }}</span>
                            รายการ (s)
                            <button
                              type="button"
                              class="mt-1 lg:mt-2 text-blue-500 hover:underline focus:outline-none text-xs"
                              v-if="searchQuery.length > 0"
                              @click="clearSearchQuery"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>

                      <div class="flex flex-col mb-2 lg:mb-0 lg:flex-row items-center">
                        <select
                          v-model="limitItem"
                          @change="handleLimitChange"
                          class="px-3 py-1.5 lg:px-4 lg:py-2 rounded-md border-gray-300 bg-white focus:outline-none w-full lg:w-24 lg:mr-2 text-sm"
                        >
                          <option
                            v-for="option in limitOptions"
                            :key="option"
                            :value="option"
                          >
                            {{ option }}
                          </option>
                        </select>
                        <!-- Header Pagination -->
                        <Pagination
                          :current-page="currentPage"
                          :total-items="totalItems"
                          :total-pages="totalPages"
                          :limit-items="limitItem"
                          :data-loading="loading"
                          :display-mode="'compact'"
                          :size="'small'"
                          :variant="'compact'"
                          :show-labels="false"
                          :show-first-last="false"
                          :show-page-size-selector="false"
                          :show-jump-to-page="false"
                          :visible-range="2"
                          @page-changed="handlePageChanged"
                          class="mt-2 lg:mt-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bulk Actions Bar -->
                <div v-show="showBulkActions" class="bg-orange-100 border-b border-orange-200 flex-shrink-0" :class="{ 'hidden': !showBulkActions }">
                  <div class="p-2 lg:p-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <i class="fas fa-info-circle text-orange-600 mr-2"></i>
                        <span class="text-xs lg:text-sm text-orange-800 font-medium">
                          เลือกแล้ว {{ selectedItems.length }} รายการ
                        </span>
                      </div>
                      <div class="flex items-center space-x-1 lg:space-x-2">
                        <button
                          @click="bulkSendEmail"
                          class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <i class="fas fa-envelope mr-1"></i>
                          ส่งอีเมล
                        </button>
                        <button
                          @click="exportToCSV"
                          class="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <i class="fas fa-download mr-1"></i>
                          ส่งออก
                        </button>
                        <button
                          @click="bulkDeleteItems"
                          class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          <i class="fas fa-trash mr-1"></i>
                          ลบ
                        </button>
                        <button
                          @click="selectedItems = []; showBulkActions = false"
                          class="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                          <i class="fas fa-times mr-1"></i>
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Layout Options - ทำให้กะทัดรัดสำหรับมือถือ -->
                <div class="border-t bg-gray-50 border-gray-300 flex-shrink-0 lg:block hidden">
                  <div class="flex text-sm text-gray-900">
                    <div class="w-6/12 md:w-2/12 py-2 pl-4 text-left">
                      <label class="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          v-model="layoutVisibility.order"
                          class="mr-1 rounded-sm border-gray-400"
                        />
                        คำสั่งซื้อ
                      </label>
                    </div>
                    <div class="w-6/12 md:w-2/12 py-2 pl-4 text-left">
                      <label class="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          v-model="layoutVisibility.enroll"
                          class="mr-1 rounded-sm border-gray-400"
                        />
                        การเรียน
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Table Header -->
                <div class="border-b border-t bg-gray-200 border-gray-300 flex-shrink-0">
                  <div class="flex text-sm font-semibold text-gray-900">
                    <div v-show="bulkActionMode" class="w-10 py-2 pl-2 text-center flex-shrink-0" :class="{ 'hidden': !bulkActionMode }">
                      <input
                        type="checkbox"
                        @change="selectAllItems"
                        :checked="selectedItems.length === listItems.length && listItems.length > 0"
                        :indeterminate="selectedItems.length > 0 && selectedItems.length < listItems.length"
                        class="rounded border-gray-400 w-3 h-3"
                      />
                    </div>
                    <div class="w-12 py-2 pl-2 text-center flex-shrink-0">#</div>
                    <div class="flex-1 md:w-3/12 py-2 pl-3 text-left">ชื่อ-นามสกุล</div>
                    <div class="hidden md:block md:w-2/12 py-2 pl-3 text-left">Citizen ID</div>
                    <div class="hidden md:block md:w-2/12 py-2 pl-3 text-left">การติดต่อ</div>
                    <div class="hidden md:block w-1/12 py-2 pl-3 text-left">หลักสูตร</div>
                    <div class="hidden md:block w-2/12 py-2 pl-3 text-left">
                      วันที่ลงทะเบียน
                    </div>
                    <div class="hidden md:block w-2/12 py-2 pl-3 text-left">เครื่องมือ</div>
                  </div>
                </div>

                <!-- Table content with scroll - ใช้พื้นที่ที่เหลือทั้งหมด -->
                <div
                  ref="scrollContainer"
                  class="bg-white relative table-scroll-container flex-1 pb-20 lg:pb-0"
                >
                  <div>
                    <template v-if="listItems && listItems.length > 0">
                      <template v-for="(user, index) in visibleItems" :key="`user-${user._id}-${bulkActionMode}`">
                        <div class="flex border-b border-gray-200 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group" 
                             :class="selectedItems.includes(user._id) ? 'bg-blue-50 shadow-md' : ''"
                             @mouseenter="showRowActions = user._id"
                             @mouseleave="showRowActions = null">
                          
                          <!-- Bulk Selection Checkbox -->
                          <div v-show="bulkActionMode" class="w-10 py-2 flex items-center justify-center flex-shrink-0" :class="{ 'hidden': !bulkActionMode }">
                            <input
                              type="checkbox"
                              :checked="selectedItems.includes(user._id)"
                              @change="toggleItemSelection(user._id)"
                              class="rounded border-gray-400 focus:ring-2 focus:ring-blue-500 transition-colors w-3 h-3"
                            />
                          </div>

                          <!-- Row Number with Animation -->
                          <div class="w-12 py-2 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 relative flex-shrink-0">
                            <span class="text-gray-600 font-semibold text-xs relative z-10">{{
                              leadingZero((currentPage - 1) * limitItem + index + 1)
                            }}</span>
                            <div class="absolute inset-0 bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>

                          <!-- User Info with Compact Avatar -->
                          <div class="w-full md:w-3/12 py-2 pl-3">
                            <router-link
                              :to="'/student/detail/' + user._id"
                              class="text-gray-700 hover:text-indigo-600 transition-colors duration-200 block"
                            >
                              <div class="flex items-center">
                                <!-- Compact Avatar with Status Indicator -->
                                <div class="relative mr-2 flex-shrink-0">
                                  <!-- Avatar with Initials Fallback -->
                                  <div class="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center shadow-sm ring-1 ring-white group-hover:ring-blue-200 transition-all duration-300 relative overflow-hidden">
                                    <!-- User Image with Lazy Loading -->
                                    <LazyImage
                                      v-if="user.avatar_img && user.avatar_img.trim() !== ''"
                                      :src="user.avatar_img"
                                      :alt="`Profile Image: ${user.firstname} ${user.lastname}`"
                                      container-class="w-full h-full absolute inset-0"
                                      image-class="w-full h-full object-cover"
                                      skeleton-class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"
                                      error-class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"
                                      :root-margin="'50px'"
                                      :threshold="0.1"
                                    >
                                      <template #loading>
                                        <div class="w-full h-full flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-gray-100 to-gray-200">
                                          <i class="fas fa-user text-gray-400 text-sm animate-pulse"></i>
                                        </div>
                                      </template>
                                      <template #error>
                                        <div class="w-full h-full flex items-center justify-center text-white font-semibold text-sm"
                                             :class="getAvatarColor(user.firstname + user.lastname)">
                                          {{ getInitials(user.firstname, user.lastname) }}
                                        </div>
                                      </template>
                                    </LazyImage>
                                    
                                    <!-- Initials Fallback -->
                                    <div 
                                      v-if="!user.avatar_img || user.avatar_img.trim() === ''"
                                      class="w-full h-full flex items-center justify-center text-white font-semibold text-sm"
                                      :class="getAvatarColor(user.firstname + user.lastname)"
                                    >
                                      {{ getInitials(user.firstname, user.lastname) }}
                                    </div>
                                  </div>
                                  <!-- Activity Status Dot -->
                                  <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-1 border-white shadow-sm"
                                       :class="getActivityStatus(user).class"
                                       :title="getActivityStatus(user).text">
                                  </div>
                                </div>
                                
                                <!-- User Details -->
                                <div class="ml-1 flex-1 min-w-0">
                                  <div class="flex items-center gap-1">
                                    <span
                                      class="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors text-sm truncate"
                                      v-html="
                                        user.firstname +
                                        ' ' +
                                        user.lastname +
                                        (user.old_id ? ' (' + user.old_id + ')' : '')
                                      "
                                    ></span>
                                    <!-- Compact Status Badge -->
                                    <span 
                                      class="px-1.5 py-0.5 text-xs font-medium rounded-full transition-all duration-200 flex-shrink-0"
                                      :class="getStatusBadge(user).class">
                                      {{ getStatusBadge(user).text }}
                                    </span>
                                  </div>
                                  
                                  <div class="flex items-center gap-2 mt-1">
                                    <span
                                      class="text-sm font-normal text-gray-500 truncate"
                                      v-html="user.token"
                                    ></span>
                                    <!-- Verification Badge -->
                                    <i v-if="user.email" class="fas fa-check-circle text-green-500 text-xs" title="อีเมลยืนยันแล้ว"></i>
                                  </div>
                                </div>
                              </div>
                            </router-link>
                            <!-- Mobile Only: Citizen ID and Contact Info -->
                            <div class="mt-2 space-y-1 md:hidden">
                              <!-- Citizen ID for Mobile -->
                              <div class="flex items-center text-sm">
                                <font-awesome-icon
                                  :icon="['fas', 'id-card']"
                                  class="text-gray-400 mr-2 w-4 text-center"
                                />
                                <span v-html="user.citizen"></span>
                              </div>
                              <!-- Contact Info for Mobile -->
                              <div class="flex items-center text-sm">
                                <font-awesome-icon
                                  :icon="['fas', 'phone']"
                                  class="text-gray-400 mr-2 w-4 text-center"
                                />
                                <span v-html="user.phone"></span>
                              </div>
                              <div class="flex items-center text-sm">
                                <font-awesome-icon
                                  :icon="['fas', 'envelope']"
                                  class="text-gray-400 mr-2 w-4 text-center"
                                />
                                <span v-html="user.email" class="truncate"></span>
                              </div>
                            </div>
                          </div>

                          <!-- Citizen ID with Copy Feature (Desktop) -->
                          <div class="hidden md:block md:w-2/12 py-3 pl-4">
                            <div class="flex items-center group/copy cursor-pointer" @click="copyToClipboard(user.citizen)">
                              <font-awesome-icon
                                :icon="['fas', 'id-card']"
                                class="text-gray-400 mt-[3px] mr-2 text-sm group-hover/copy:text-blue-500 transition-colors"
                              />
                              <span 
                                v-html="user.citizen" 
                                class="group-hover/copy:text-blue-600 transition-colors">
                              </span>
                              <i class="fas fa-copy text-xs text-gray-400 ml-2 opacity-0 group-hover/copy:opacity-100 transition-opacity"></i>
                            </div>
                          </div>

                          <!-- Contact Info with Enhanced Icons (Desktop) -->
                          <div class="hidden md:block md:w-2/12 py-3 pl-4 pr-3">
                            <div class="space-y-1">
                              <div class="flex items-center">
                                <font-awesome-icon
                                  :icon="['fas', 'phone']"
                                  class="text-gray-400 mt-[3px] mr-2 text-sm"
                                />
                                <span v-html="user.phone" class="text-sm"></span>
                                <a :href="`tel:${user.phone}`" class="ml-2 text-green-600 hover:text-green-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <i class="fas fa-phone-alt text-xs"></i>
                                </a>
                              </div>
                              <div class="flex items-center">
                                <font-awesome-icon
                                  :icon="['fas', 'envelope']"
                                  class="text-gray-400 mt-[3px] mr-2 text-sm"
                                />
                                <span v-html="user.email" class="text-sm"></span>
                                <a :href="`mailto:${user.email}`" class="ml-2 text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <i class="fas fa-external-link-alt text-xs"></i>
                                </a>
                              </div>
                            </div>
                          </div>

                          <!-- Course Progress with Visual Bar -->
                          <div class="hidden md:block w-1/12 py-3 pl-4 pr-3">
                            <div class="flex flex-col items-center">
                              <span class="font-semibold text-blue-600 text-lg">{{
                                user.enrollCount || 0
                              }}</span>
                              <!-- Progress Bar -->
                              <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  class="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                                  :style="{ width: Math.min((user.enrollCount || 0) * 20, 100) + '%' }">
                                </div>
                              </div>
                              <span class="text-xs text-gray-500 mt-1">หลักสูตร</span>
                            </div>
                          </div>

                          <!-- Registration Date with Relative Time -->
                          <div class="hidden md:block w-2/12 py-3 pl-4 pr-3">
                            <div class="text-sm text-gray-600">
                              {{ formatThaidate(user?.info?.regdate || user.createdAt || new Date()) }}
                            </div>
                            <div class="text-xs text-gray-400">
                              {{ getRelativeTime(user?.info?.regdate || user.createdAt) }}
                            </div>
                          </div>

                          <!-- Enhanced Action Buttons -->
                          <div class="hidden md:block w-2/12 py-3 pl-4 pr-3">
                            <!-- เครื่องมือ Mobile: 3 columns, Desktop: 2 columns -->
                            <div class="grid grid-cols-3 md:grid-cols-2 gap-x-1 gap-y-1 p-1">
                              
                              <!-- Row 1, Column 1: View Details -->
                              <div class="flex items-center">
                                <button @click="$router.push('/student/detail/' + user._id)" 
                                        type="button" 
                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200">
                                  <font-awesome-icon :icon="['fas','eye']" class="w-3 h-3" />
                                </button>
                                <div class="ml-1 flex-1">
                                  <span class="text-xs font-medium text-gray-700">รายละเอียด</span>
                                </div>
                              </div>
                              
                              <!-- Row 1, Column 2: Edit User -->
                              <div class="flex items-center">
                                <button @click="$router.push('/student/edit/' + user._id)" 
                                        type="button" 
                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200">
                                  <font-awesome-icon :icon="['fas','square-pen']" class="w-3 h-3" />
                                </button>
                                <div class="ml-1 flex-1">
                                  <span class="text-xs font-medium text-gray-700">แก้ไขข้อมูล</span>
                                </div>
                              </div>
                              
                              <!-- Row 1, Column 3 (Mobile) / Row 2, Column 1 (Desktop): Password Change -->
                              <div class="flex items-center">
                                <button @click="openPasswordChangeModal(user._id)" 
                                        type="button" 
                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-purple-300 bg-white text-gray-700 shadow-sm hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-all duration-200">
                                  <font-awesome-icon :icon="['fas','key']" class="w-3 h-3" />
                                </button>
                                <div class="ml-1 flex-1">
                                  <span class="text-xs font-medium text-gray-700">เปลี่ยนรหัส</span>
                                </div>
                              </div>
                              
                              <!-- Row 2, Column 1 (Mobile) / Row 2, Column 2 (Desktop): Course Management -->
                              <div class="flex items-center">
                                <button @click="$router.push('/student/detail/' + user._id + '/courses')" 
                                        type="button" 
                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-green-50 hover:border-green-300 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-200">
                                  <font-awesome-icon :icon="['fas','graduation-cap']" class="w-3 h-3" />
                                </button>
                                <div class="ml-1 flex-1">
                                  <span class="text-xs font-medium text-gray-700">หลักสูตร</span>
                                </div>
                              </div>
                              
                              <!-- Row 2, Column 2 (Mobile) / Row 3, Column 1 (Desktop): Send Message -->
                              <div class="flex items-center">
                                <button @click="quickSendMessage('welcome')" 
                                        type="button" 
                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 transition-all duration-200">
                                  <font-awesome-icon :icon="['fas','envelope']" class="w-3 h-3" />
                                </button>
                                <div class="ml-1 flex-1">
                                  <span class="text-xs font-medium text-gray-700">ส่งข้อความ</span>
                                </div>
                              </div>
                              
                              <!-- Row 2, Column 3 (Mobile) / Row 3, Column 2 (Desktop): More Actions -->
                              <div class="flex items-center">
                                <button @click="safeShowQuickActions(user)" 
                                        type="button" 
                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-all duration-200">
                                  <font-awesome-icon :icon="['fas','ellipsis-v']" class="w-3 h-3" />
                                </button>
                                <div class="ml-1 flex-1">
                                  <span class="text-xs font-medium text-gray-700">เพิ่มเติม</span>
                                </div>
                              </div>
                              
                            </div>
                          </div>
                        </div>

                        <div class="md:hidden p-2 border-b border-gray-300 bg-blue-50">
                          <div class="w-full">
                            <button
                              @click="$router.push('/student/detail/' + user._id)"
                              type="button"
                              class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'square-pen']"
                                class="text-black mt-[3px] mr-2 text-md"
                              />
                              <span>รายละเอียด</span>
                            </button>
                          </div>
                        </div>
                      </template>

                      <!-- Lazy Loading Indicators -->
                      <template v-if="lazy">
                        <!-- Loading More Indicator -->
                        <div v-if="isLoadingMore" class="flex justify-center items-center py-6 border-b border-gray-200">
                          <div class="flex items-center gap-3 text-blue-600">
                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span class="text-sm font-medium">กำลังโหลดข้อมูลเพิ่ม...</span>
                          </div>
                        </div>
                        
                        <!-- Load More Button -->
                        <div v-else-if="hasMoreItems" class="flex justify-center items-center py-6 border-b border-gray-200">
                          <button
                            @click="loadMoreItems"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <i class="fas fa-plus mr-2"></i>
                            โหลดเพิ่ม ({{ Math.min(loadMoreCount, listItems.length - currentDisplayCount) }} รายการ)
                          </button>
                        </div>
                        
                        <!-- All Items Loaded -->
                        <div v-else-if="listItems.length > initialDisplayCount" class="flex justify-center items-center border-b border-gray-200">
                          <div class="flex items-center gap-2 text-green-600">
                            <i class="fas fa-check-circle"></i>
                            <span class="text-sm font-medium">แสดงครบทั้งหมด {{ listItems.length }} รายการแล้ว</span>
                          </div>
                        </div>
                      </template>

                    </template>

                    <template v-else-if="!loading">
                      <!-- Enhanced Empty State -->
                      <div class="text-center py-16 px-4">
                        <div class="max-w-md mx-auto">
                          <!-- Empty State Icon -->
                          <div class="mb-6">
                            <div class="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                              <i class="fas fa-users text-gray-400 text-3xl"></i>
                            </div>
                          </div>
                          
                          <!-- Empty State Content -->
                          <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีข้อมูลผู้เรียน</h3>
                          <p class="text-gray-500 mb-6">
                            {{ searchQuery ? 'ไม่พบผลการค้นหาที่ตรงกับคำที่ระบุ' : 'ยังไม่มีผู้เรียนในระบบ' }}
                          </p>
                          
                          <!-- Empty State Actions -->
                          <div class="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                              v-if="searchQuery"
                              @click="clearSearchQuery"
                              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                              <i class="fas fa-times mr-2"></i>
                              ล้างการค้นหา
                            </button>
                            
                            <button
                              @click="getData"
                              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                              <i class="fas fa-sync-alt mr-2"></i>
                              รีเฟรชข้อมูล
                            </button>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Loading Skeleton -->
                    <template v-if="loading">
                      <div v-for="n in 5" :key="n" class="flex border-b border-gray-200 text-sm animate-pulse">
                        <div class="py-2 flex items-center justify-center bg-gray-100 w-12">
                          <div class="h-3 w-6 bg-gray-300 rounded"></div>
                        </div>
                        <div class="py-2 pl-3 w-4/12">
                          <div class="flex items-center">
                            <div class="w-10 h-10 bg-gray-300 rounded-lg mr-2 flex items-center justify-center">
                              <div class="w-6 h-6 bg-gray-400 rounded animate-pulse"></div>
                            </div>
                            <div class="flex-1">
                              <div class="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
                              <div class="h-2 bg-gray-300 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                        <div class="w-2/12 py-2 pl-3 hidden md:block">
                          <div class="h-3 bg-gray-300 rounded w-24"></div>
                        </div>
                        <div class="w-4/12 py-2 pl-3 pr-2 hidden md:block">
                          <div class="space-y-1">
                            <div class="h-2 bg-gray-300 rounded w-20"></div>
                            <div class="h-2 bg-gray-300 rounded w-28"></div>
                          </div>
                        </div>
                        <div class="w-1/12 py-2 pl-3 pr-2 hidden md:block">
                          <div class="h-3 bg-gray-300 rounded w-6 mx-auto"></div>
                        </div>
                        <div class="w-2/12 py-2 pl-3 pr-2 hidden md:block">
                          <div class="h-2 bg-gray-300 rounded w-12 mb-1"></div>
                          <div class="h-2 bg-gray-300 rounded w-10"></div>
                        </div>
                        <div class="w-3/12 py-2 pl-3 pr-2 hidden md:block">
                          <div class="flex space-x-1">
                            <div class="h-6 w-6 bg-gray-300 rounded"></div>
                            <div class="h-6 w-6 bg-gray-300 rounded"></div>
                            <div class="h-6 w-6 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Mobile Sticky Footer for Pagination and Limit -->
                <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-lg">
                  <div class="p-3">
                    <!-- Mobile Pagination Footer Layout -->
                    <div class="flex items-center justify-between">
                      <!-- Items per page on left -->
                      <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-600 font-medium">แสดง:</span>
                        <select 
                          v-model="limitItem" 
                          @change="handleLimitChange" 
                          class="h-9 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 cursor-pointer hover:border-gray-400 min-w-[4.5rem] w-auto"
                        >
                          <option v-for="option in limitOptions" :key="option" :value="option">{{ option }}</option>
                        </select>
                        <span class="text-sm text-gray-500">รายการ</span>
                      </div>
                      
                      <!-- Footer Mode Pagination -->
                      <div class="flex-1 flex justify-center">
                        <Pagination 
                          :current-page="currentPage" 
                          :total-items="totalItems" 
                          :total-pages="totalPages" 
                          :limit-items="limitItem" 
                          :data-loading="loading" 
                          :display-mode="'footer'" 
                          :size="'small'"
                          :variant="'default'"
                          :show-labels="false"
                          :show-first-last="false"
                          :show-page-size-selector="false"
                          :show-jump-to-page="false"
                          :visible-range="2"
                          @page-changed="handlePageChanged" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pagination Footer (Desktop) -->
                <div class="hidden lg:block bg-gray-50 border-t border-gray-200">
                  <div class="p-3">
                    <!-- Desktop Pagination Footer Layout -->
                    <div class="flex items-center justify-between">
                      <!-- Items per page on left -->
                      <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-600 font-medium">แสดง:</span>
                        <select 
                          v-model="limitItem" 
                          @change="handleLimitChange" 
                          class="h-9 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 cursor-pointer hover:border-gray-400 min-w-[4.5rem] w-auto"
                        >
                          <option v-for="option in limitOptions" :key="option" :value="option">{{ option }}</option>
                        </select>
                        <span class="text-sm text-gray-500">รายการ</span>
                      </div>
                      
                      <!-- Footer Mode Pagination -->
                      <div class="flex-1 flex justify-center">
                        <Pagination 
                          :current-page="currentPage" 
                          :total-items="totalItems" 
                          :total-pages="totalPages" 
                          :limit-items="limitItem" 
                          :data-loading="loading" 
                          :display-mode="'footer'" 
                          :size="'medium'"
                          :variant="'default'"
                          :show-labels="false"
                          :show-first-last="false"
                          :show-page-size-selector="false"
                          :show-jump-to-page="false"
                          :visible-range="2"
                          @page-changed="handlePageChanged" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="showMobileSidebar" 
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="toggleMobileSidebar"
    >
      <div 
        class="w-64 h-full bg-white transform transition-transform duration-300"
        @click.stop
      >
        <!-- Mobile Sidebar Content (same as desktop sidebar) -->
        <div class="flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h1 class="text-lg font-semibold text-gray-900">จัดการผู้เรียน</h1>
            <button 
              @click="toggleMobileSidebar"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Quick Stats in Mobile -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
            <div class="space-y-2">
              <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg stats-card">
                <span class="text-sm text-gray-700">ทั้งหมด</span>
                <span class="text-sm font-semibold text-blue-600">{{ totalItems }}</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
                <span class="text-sm text-gray-700">หน้าปัจจุบัน</span>
                <span class="text-sm font-semibold text-green-600">{{ listItems.length }}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Menu in Mobile -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">เครื่องมือ</h3>
            <nav class="space-y-1">
              <button 
                @click="openAddUserModal(); toggleMobileSidebar()"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-green-600 hover:bg-green-100 hover:text-green-900 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-user-plus text-sm w-4"></i>
                <span class="flex-1 text-left">เพิ่มผู้เรียนใหม่</span>
              </button>
              <button 
                @click="getData; toggleMobileSidebar()"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-sync-alt text-sm w-4"></i>
                <span class="flex-1 text-left">รีเฟรชข้อมูล</span>
              </button>
              <button 
                @click="togglePanel; toggleMobileSidebar()"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-cogs text-sm w-4"></i>
                <span class="flex-1 text-left">เครื่องมือขั้นสูง</span>
              </button>
              <button 
                @click="safeToggleBulkMode; toggleMobileSidebar()"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-check-square text-sm w-4"></i>
                <span class="flex-1 text-left">จัดการหลายรายการ</span>
              </button>
              <button 
                @click="toggleLazyMode"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
                :class="[lazy ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600']"
              >
                <i class="fas fa-rocket text-sm w-4"></i>
                <span class="flex-1 text-left">{{ lazy ? 'Progressive Loading (เปิด)' : 'แสดงทั้งหมด (ปิด)' }}</span>
                <div class="flex items-center">
                  <span class="text-xs">{{ lazy ? 'ON' : 'OFF' }}</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
input:focus-visible {
  outline: none;
}

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

/* Enhanced Stats Cards */
.stats-card {
  transition: all 0.3s ease;
  cursor: default;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Row hover effects */
.group:hover .group-hover\:ring-blue-200 {
  --tw-ring-color: rgb(147 197 253);
}

/* Progress bar animations */
@keyframes progressFill {
  from {
    width: 0%;
  }
  to {
    width: var(--progress-width);
  }
}

.progress-bar {
  animation: progressFill 1s ease-out;
}

/* Status badge animations */
.status-badge {
  transition: all 0.2s ease;
}

.status-badge:hover {
  transform: scale(1.05);
}

/* Copy to clipboard effect */
.copy-success {
  animation: copyPulse 0.6s ease-out;
}

@keyframes copyPulse {
  0% {
    transform: scale(1);
    background-color: rgb(59 130 246);
  }
  50% {
    transform: scale(1.1);
    background-color: rgb(34 197 94);
  }
  100% {
    transform: scale(1);
    background-color: rgb(59 130 246);
  }
}

/* Loading skeleton animation */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-pulse {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
}

/* Enhanced hover effects for action buttons */
.action-btn {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

/* Activity status indicators */
.activity-dot {
  position: relative;
}

.activity-dot::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* List container with dynamic height calculation */
.list-container {
  display: flex;
  flex-direction: row;
}

/* Custom table scroll for taller tables */
.table-scroll-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

/* Basic responsive */
@media (max-width: 768px) {
  .list-container {
    min-height: calc(100vh - 180px);
  }
}

/* บังคับให้ table ใช้พื้นที่เต็มที่ */
.list-container .bg-white.shadow {
  height: 100%;
  max-height: 100%;
}

/* บังคับให้ main content areas ใช้ความสูงเต็มที่ */
.list-container .flex-1.bg-gray-100 {
  height: 100%;
}

.list-container .h-full.flex.flex-col {
  height: 100%;
}

.list-container .flex-1.flex.flex-col {
  height: 100%;
  min-height: 0;
}

/* ปรับแต่งการแสดงผลเมื่อไม่มีข้อมูล */
.table-scroll-container > div:first-child:empty::before {
  content: "กำลังโหลดข้อมูล...";
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
}

/* ปรับแต่ง pagination footer */
.list-container .p-2.text-center.flex-shrink-0 {
  background: white !important;
  border-top: 1px solid #e5e7eb !important;
  padding: 16px !important;
  flex-shrink: 0 !important;
  display: block !important;
  min-height: 80px !important;
  max-height: 120px !important;
  position: relative !important;
  z-index: 10 !important;
  overflow: visible !important;
  width: 100% !important;
}

/* ให้แน่ใจว่า Pagination component แสดงออกมา */
.list-container .p-2.text-center.flex-shrink-0 > * {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  max-height: none !important;
  overflow: visible !important;
}

/* บังคับให้ table container ไม่กินพื้นที่ของ footer */
.table-scroll-container {
  flex: 1 1 auto;
  min-height: 0;
  max-height: calc(100% - 120px);
  overflow: hidden;
  margin-bottom: 0;
}

/* ปรับแต่ง layout ให้ footer อยู่ด้านล่างเสมอ */
.list-container .bg-white.shadow.flex-1.flex.flex-col {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  overflow: hidden !important;
  padding-bottom: 0; /* Reset for desktop */
}

@media (max-width: 1023px) { /* Apply padding for screens smaller than lg */
  .list-container .bg-white.shadow.flex-1.flex.flex-col {
    padding-bottom: 60px; /* Adjust this value based on the actual height of the sticky footer */
  }
}

/* ให้ table content ใช้พื้นที่ที่เหลือ และ footer อยู่ด้านล่าง */
.list-container .bg-white.shadow .table-scroll-container {
  flex: 1;
  overflow: hidden;
}

.list-container .bg-white.shadow > div:last-child {
  flex: 0 0 auto;
  margin-top: 0;
  width: 100%;
}

/* Enhanced Mobile Styles */
@media (max-width: 768px) {
  .stats-card {
    padding: 8px;
  }
  
  .group:hover {
    transform: none;
  }
  
  .action-btn {
    padding: 6px 8px;
    font-size: 12px;
  }
}

/* Compact Row Styles */
.compact-row {
  min-height: 40px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.compact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

/* Avatar Initials Styles */
.avatar-initials {
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar-initials:hover {
  transform: scale(1.05);
}

/* การป้องกัน flickering ของรูป */
.avatar-container img {
  transition: opacity 0.2s ease-in-out;
}

.avatar-container img[style*="display: none"] {
  opacity: 0;
}

.compact-text {
  font-size: 12px;
  line-height: 1.3;
}

.compact-badge {
  font-size: 10px;
  padding: 2px 6px;
}

.compact-button {
  padding: 4px 6px;
  font-size: 11px;
  min-height: 24px;
  min-width: 24px;
}

.compact-progress-bar {
  height: 3px;
  border-radius: 2px;
}

.compact-status-dot {
  width: 8px;
  height: 8px;
}

/* Tighter spacing for compact layout */
.compact-layout .space-y-0\.5 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 2px;
}

.compact-layout .gap-1 {
  gap: 2px;
}

/* Enhanced truncation for tight spaces */
.text-truncate-tight {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Improved responsive behavior */
@media (max-width: 1024px) {
  .compact-text {
    font-size: 11px;
  }
  
  .compact-avatar {
    width: 36px;
    height: 36px;
  }
}

/* Dark mode support (ถ้าต้องการ) */
@media (prefers-color-scheme: dark) {
  .stats-card {
    background-color: rgba(31, 41, 55, 0.8);
    border-color: rgba(75, 85, 99, 0.3);
  }
}
</style>
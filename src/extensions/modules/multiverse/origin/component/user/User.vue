<script>
import storageManager from '@/plugins/storage';
import BatchProgress from '@/utils/BatchProgress.vue';
import convertUtils from "@/plugins/convertUtils";

export default {
    data() {
      const session = storageManager.get('session')
      const paging = storageManager.get('paging');
      return {
        hostkey:this.$Key,
        open: false,
        dataItem: this.$route.params.id,
        school: session.current.id,
        login:session.login,
        courseData: [],
        listItems: [],
        categoryData:[],
        loading_sources: true,
        endpoint: "",
        master:session.master,
        accessToken: storageManager.get('session','token'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),

        limitOptions: [10, 25, 50, 100, 200, 500],
        totalPages: 0,
        totalItems: 0,

        limitItem:25,
        currentPage: 1,
        searchQuery: "",
        debounceTimer: null,

        pagingInfo: paging || {
          [this.$route.path]: {
            limitItem: 25,
            currentPage: 1,
            searchQuery: "",
          },
        },

        loading: false,
        showingOverlay: false,
        statusFilter:"all",
        isCreatingUser: false,
        isShowingOverlay: false,
        loadingMessage: '',
        processingCount: '',
        activeBlock: false,
        scb:[],
        isProcessing: false,
        processName: "",
        progressText: "",
        progressTotal: 0,
        progressCurrent: 0,
        startTime: null,
        endTime: null,
        layoutVisibility: {
          order: true,
          enroll: true
        },
        
        // Modern UI properties similar to Collection.vue
        viewMode: 'grid',
        showMobileSidebar: false,
        todayUsers: 0,
        error: null,
        isRefreshing: false,
        
        // Bulk selection system
        selectedItems: [],
        bulkActions: false,
        openCardMenu: null,
        showBulkStatusMenu: false,
        
        // Role-based filtering
        activeFilter: 'all',
        activeQuickFilter: null,
        
        // Stats for different roles
        stats: {
          total: 0,
          root: 0,
          superadmin: 0,
          admin: 0,
          manager: 0,
          todayUsers: 0
        },
        
        // Sidebar menu items for roles
        sidebarMenuItems: [
          { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-users', count: 0 },
          { value: 'root', label: 'Root', icon: 'fas fa-crown', count: 0 },
          { value: 'superadmin', label: 'Super Admin', icon: 'fas fa-user-shield', count: 0 },
          { value: 'admin', label: 'Admin', icon: 'fas fa-user-tie', count: 0 },
          { value: 'manager', label: 'Manager', icon: 'fas fa-user-cog', count: 0 },
          { value: 'recent', label: 'สร้างล่าสุด', icon: 'fas fa-clock', count: 0 }
        ],
        
        // Quick filters
        quickFilters: [
          { value: 'hasPhone', label: 'มีเบอร์โทร', icon: 'fas fa-phone' },
          { value: 'noPhone', label: 'ไม่มีเบอร์โทร', icon: 'fas fa-phone-slash' },
          { value: 'hasEmail', label: 'มีอีเมล', icon: 'fas fa-envelope' },
          { value: 'noEmail', label: 'ไม่มีอีเมล', icon: 'fas fa-envelope-slash' },
          { value: 'hasCitizen', label: 'มีเลขบัตรประชาชน', icon: 'fas fa-id-card' },
          { value: 'hasAvatar', label: 'มีรูปโปรไฟล์', icon: 'fas fa-user-circle' },
          { value: 'hasParent', label: 'มี Parent', icon: 'fas fa-sitemap' },
          { value: 'hasUnit', label: 'มี Unit', icon: 'fas fa-building' },
          { value: 'hasAsset', label: 'มี Asset', icon: 'fas fa-briefcase' },
          { value: 'hasCollection', label: 'มี Collection', icon: 'fas fa-layer-group' },
          { value: 'hasCourse', label: 'มี Course', icon: 'fas fa-graduation-cap' }
        ],
        
        // Sort options
        sortBy: 'name_asc',
      }
    },
    components: {
      BatchProgress
    },
    watch: {
      // Watch for changes in selectedItems to update checkbox states
      selectedItems: {
        handler(newSelection) {
          this.bulkActions = newSelection.length > 0;
          
          this.$nextTick(() => {
            this.updateHeaderCheckboxStates();
          });
        },
        deep: true
      },
      
      // Watch for changes in filteredListItems to update selection
      filteredListItems: {
        handler(newUsers) {
          if (this.selectedItems.length > 0) {
            const visibleIds = newUsers.map(item => item.user._id);
            this.selectedItems = this.selectedItems.filter(id => visibleIds.includes(id));
            this.bulkActions = this.selectedItems.length > 0;
          }
        },
        deep: true
      }
    },
    methods: {
      togglePanel() {
        this.open = !this.open;
      },
      closePanel() {
        this.open = false;
      },
      leadingZero(number) {
        return number < 10 ? '0' + number : number.toString();
      },
      formatThaidate(date) {
        return convertUtils.toThaiDatetime(date,"short");
      },
      updateURLParameters() {
        const updatedUrlParams = new URLSearchParams(window.location.search);
        if (this.currentPage > 1) {
          updatedUrlParams.set('page', this.currentPage);
        } else {
          updatedUrlParams.delete('page');
        }
        if (this.searchQuery) {
          updatedUrlParams.set('searchQuery', this.searchQuery);
        } else {
          updatedUrlParams.delete('searchQuery');
        }
        const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
        window.history.replaceState({}, '', updatedUrl);
      },
      handleLimitChange() {
        const paging = storageManager.get('paging') || {};
        paging[this.$route.path] = {
          limitItem: this.limitItem,
          currentPage: 1,
          searchQuery: this.searchQuery,
        };
        storageManager.set('paging', paging);
        this.updateURLParameters();
        this.getData();
      },
      handlePageChanged(page) {
        if (page !== this.currentPage) {
          window.scrollTo(0, 0);
          this.currentPage = page;
          const paging = storageManager.get('paging') || {};
          paging[this.$route.path] = {
            limitItem: this.limitItem,
            currentPage: this.currentPage,
            searchQuery: this.searchQuery,
          };
          storageManager.set('paging', paging);
          this.updateURLParameters();
          this.getData();
        }
      },
      clearSearchQuery() {
        this.searchQuery = '';
        const paging = storageManager.get('paging') || {};
        paging[this.$route.path] = {
          limitItem: this.limitItem,
          currentPage: this.currentPage,
          searchQuery: this.searchQuery,
        };
        storageManager.set('paging', paging);
        this.updateURLParameters();
        this.handleSearchKeydown({ key: 'Enter' });
        this.getData();
      },
      handleSearchKeydown(event) {
        clearTimeout(this.debounceTimer);
        const updateDataAndURL = () => {
          this.getData();
          const paging = storageManager.get('paging') || {};
          paging[this.$route.path] = {
            limitItem: this.limitItem,
            currentPage: 1, // Reset current page to 1
            searchQuery: this.searchQuery,
          };
          storageManager.set('paging', paging)
          this.updateURLParameters();
          this.handlePageChanged(1);
        };
        if (event.key === 'Enter' && this.searchQuery.length >= 3) {
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
        this.open         = false;
        let totalItems  = this.listItems.length;
        let counter       = 0;
        /* Batch Process Param */
        this.isProcessing   = true;
        this.processName    = `Render Billing`;
        this.progressTotal  = totalItems
        this.startTime      = new Date().toISOString();
        this.endTime        = null;
        for (const item of this.listItems) {
          counter++;
          /* Batch Process Param */
          this.progressText     = `Processing : ${counter}/${totalItems}`;
          this.progressCurrent  =  counter
          await this.executeCustomQueries(item.order.ref, item.order._id);
        }
        /* Batch Process Param */
        this.progressText = `All Process : Done`;
        this.endTime      = new Date().toISOString();
      },
      async getData() {
        if (!storageManager.get('session', 'login')) {
          return;
        }

        this.listItems = [];
        this.totalItems = 0;
        this.loading = true;
        this.error = null;
        this.loading_sources = false;
        
        try {
          console.log('Loading users data with aggregation...');
          
          // Build match conditions for aggregation pipeline
          let matchConditions = { 
            role: { 
              $in: ['root', 'superadmin', 'admin', 'manager'] 
            } 
          };
          
          if (this.searchQuery && this.searchQuery.trim()) {
            matchConditions = {
              $and: [
                { 
                  role: { 
                    $in: ['root', 'superadmin', 'admin', 'manager'] 
                  } 
                },
                {
                  $or: [
                    { firstname: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                    { lastname: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                    { email: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                    { username: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                    { phone: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                    { citizen: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                    { old_id: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                    { token: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } }
                  ]
                }
              ]
            };
          }

          // Build aggregation pipeline with lookups for related data
          const pipeline = [
            {
              $match: matchConditions
            },
            // Convert string arrays to ObjectId arrays if needed
            {
              $addFields: {
                unitObjectIds: {
                  $map: {
                    input: { $ifNull: ["$unit", []] },
                    as: "unitId",
                    in: {
                      $cond: {
                        if: { $ne: ["$$unitId", null] },
                        then: { $toObjectId: "$$unitId" },
                        else: null
                      }
                    }
                  }
                },
                assetObjectIds: {
                  $map: {
                    input: { $ifNull: ["$asset", []] },
                    as: "assetId", 
                    in: {
                      $cond: {
                        if: { $ne: ["$$assetId", null] },
                        then: { $toObjectId: "$$assetId" },
                        else: null
                      }
                    }
                  }
                },
                collectionObjectIds: {
                  $map: {
                    input: { $ifNull: ["$collection", []] },
                    as: "collectionId",
                    in: {
                      $cond: {
                        if: { $ne: ["$$collectionId", null] },
                        then: { $toObjectId: "$$collectionId" },
                        else: null
                      }
                    }
                  }
                }
              }
            },
            // Lookup units from hostname collection
            {
              $lookup: {
                from: "hostname",
                localField: "unitObjectIds",
                foreignField: "_id",
                as: "unitDetails"
              }
            },
            // Lookup assets from hostname collection
            {
              $lookup: {
                from: "hostname",
                localField: "assetObjectIds", 
                foreignField: "_id",
                as: "assetDetails"
              }
            },
            // Lookup collections from hostname collection
            {
              $lookup: {
                from: "hostname",
                localField: "collectionObjectIds",
                foreignField: "_id",
                as: "collectionDetails"
              }
            },
            // Lookup courses data if user has courses
            {
              $lookup: {
                from: "course",
                localField: "code",
                foreignField: "category",
                as: "courses"
              }
            },
            // Project final structure with counts and joined data
            {
              $project: {
                _id: 1,
                firstname: 1,
                lastname: 1,
                email: 1,
                username: 1,
                phone: 1,
                citizen: 1,
                old_id: 1,
                token: 1,
                role: 1,
                status: 1,
                avatar_img: 1,
                createAt: 1,
                createdAt: 1,
                updatedAt: 1,
                parent: 1,
                // Original arrays for compatibility
                unit: 1,
                collection: 1,
                asset: 1,
                // Joined data with details
                unitDetails: 1,
                collectionDetails: 1,
                assetDetails: 1,
                courses: 1,
                // Counts for quick reference
                unitCount: { $size: { $ifNull: ["$unitDetails", []] } },
                collectionCount: { $size: { $ifNull: ["$collectionDetails", []] } },
                assetCount: { $size: { $ifNull: ["$assetDetails", []] } },
                courseCount: { $size: { $ifNull: ["$courses", []] } },
                totalHostnames: { 
                  $add: [
                    { $size: { $ifNull: ["$unitDetails", []] } },
                    { $size: { $ifNull: ["$assetDetails", []] } },
                    { $size: { $ifNull: ["$collectionDetails", []] } }
                  ]
                }
              }
            },
            // Sort by name
            {
              $sort: { firstname: 1, lastname: 1 }
            }
          ];

          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/aggregate", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': this.hostkey
            },
            body: JSON.stringify({
              pipeline: pipeline
            })
          });

          console.log('API Response status:', resAPI.status);

          if (!resAPI.ok) {
            throw new Error(`HTTP error! status: ${resAPI.status}`);
          }

          const restReturn = await resAPI.json();
          console.log('API Response data:', restReturn);
          
          // Debug: Log sample user data to check joined collections
          if (Array.isArray(restReturn) && restReturn.length > 0) {
            // Find a user with collection data for better debugging
            const userWithCollections = restReturn.find(user => user.collection && user.collection.length > 0);
            const sampleUser = userWithCollections || restReturn[0];
            
            console.log('Sample user with joined data:', {
              user: sampleUser,
              originalArrays: {
                unit: sampleUser.unit,
                asset: sampleUser.asset,
                collection: sampleUser.collection
              },
              joinedData: {
                unitDetails: sampleUser.unitDetails,
                assetDetails: sampleUser.assetDetails,
                collectionDetails: sampleUser.collectionDetails
              },
              counts: {
                unitCount: sampleUser.unitCount,
                assetCount: sampleUser.assetCount,
                collectionCount: sampleUser.collectionCount,
                totalHostnames: sampleUser.totalHostnames
              }
            });
            
            // Log specifically for collection debugging
            if (userWithCollections) {
              console.log('User with collections found:', {
                userId: userWithCollections._id,
                firstname: userWithCollections.firstname,
                lastname: userWithCollections.lastname,
                collectionArray: userWithCollections.collection,
                collectionDetails: userWithCollections.collectionDetails,
                collectionCount: userWithCollections.collectionCount
              });
            }
          }

          if (Array.isArray(restReturn)) {
            // Convert to the expected format with user wrapper
            const allUsers = restReturn.map(user => ({ user: user }));
            
            // Apply pagination manually
            const startIndex = (this.currentPage - 1) * this.limitItem;
            const endIndex = startIndex + this.limitItem;
            
            this.listItems = allUsers.slice(startIndex, endIndex);
            this.totalItems = allUsers.length;
            this.totalPages = Math.ceil(allUsers.length / this.limitItem);
            
            console.log('Processed aggregated data:', {
              totalItems: this.totalItems,
              currentPage: this.currentPage,
              limitItem: this.limitItem,
              listItems: this.listItems.length,
              sampleUser: this.listItems[0]?.user
            });
            
            this.calculateStats();
          } else {
            console.error('Unexpected response format:', restReturn);
            this.listItems = [];
            this.totalItems = 0;
            this.totalPages = 0;
          }

        } catch (error) {
          console.error('Error loading users with aggregation:', error);
          this.error = `ไม่สามารถโหลดข้อมูลผู้ใช้ได้: ${error.message}`;
          this.listItems = [];
          this.totalItems = 0;
          this.totalPages = 0;
        } finally {
          this.loading = false;
          this.activeBlock = false;
          this.loading_sources = true;
        }
      },

      // Calculate stats for dashboard
      calculateStats() {
        const root = this.listItems.filter(item => item.user.role === 'root').length;
        const superadmin = this.listItems.filter(item => item.user.role === 'superadmin').length;
        const admin = this.listItems.filter(item => item.user.role === 'admin').length;
        const manager = this.listItems.filter(item => item.user.role === 'manager').length;
        
        // Calculate recently created (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentlyCreated = this.listItems.filter(item => {
          if (!item.user.createAt) return false;
          return new Date(item.user.createAt) >= weekAgo;
        }).length;

        const today = new Date().toDateString();
        const todayUsers = this.listItems.filter(item => {
          if (item.user.createAt) {
            const createDate = new Date(item.user.createAt).toDateString();
            return createDate === today;
          }
          return false;
        }).length;

        // Calculate hostname stats
        const totalUnits = this.listItems.reduce((sum, item) => sum + (item.user.unitCount || 0), 0);
        const totalAssets = this.listItems.reduce((sum, item) => sum + (item.user.assetCount || 0), 0);
        const totalCollections = this.listItems.reduce((sum, item) => sum + (item.user.collectionCount || 0), 0);

        this.stats = {
          total: this.listItems.length,
          root: root,
          superadmin: superadmin,
          admin: admin,
          manager: manager,
          todayUsers: todayUsers,
          totalUnits: totalUnits,
          totalAssets: totalAssets,
          totalCollections: totalCollections
        };

        // Update sidebar menu counts
        this.sidebarMenuItems.forEach(item => {
          switch(item.value) {
            case 'all':
              item.count = this.stats.total;
              break;
            case 'root':
              item.count = root;
              break;
            case 'superadmin':
              item.count = superadmin;
              break;
            case 'admin':
              item.count = admin;
              break;
            case 'manager':
              item.count = manager;
              break;
            case 'recent':
              item.count = recentlyCreated;
              break;
          }
        });
      },

      // Refresh data
      async refreshData() {
        if (this.isRefreshing) return;
        
        try {
          this.isRefreshing = true;
          await this.getData();
        } catch (error) {
          console.error('Error refreshing users:', error);
          this.error = 'ไม่สามารถรีเฟรชข้อมูลได้';
        } finally {
          this.isRefreshing = false;
        }
      },

      // Dismiss error
      dismissError() {
        this.error = null;
      },

      // Bulk selection methods
      toggleSelectAll(event) {
        if (event.target.checked) {
          this.selectedItems = this.filteredListItems.map(item => item.user._id);
          this.bulkActions = true;
        } else {
          this.selectedItems = [];
          this.bulkActions = false;
        }
        
        this.$nextTick(() => {
          this.updateHeaderCheckboxStates();
        });
      },

      toggleSelection(userId) {
        const index = this.selectedItems.indexOf(userId);
        if (index > -1) {
          this.selectedItems.splice(index, 1);
        } else {
          this.selectedItems.push(userId);
        }
        this.bulkActions = this.selectedItems.length > 0;
        
        this.$nextTick(() => {
          this.updateHeaderCheckboxStates();
        });
      },

      updateHeaderCheckboxStates() {
        const headerCheckboxes = document.querySelectorAll('.header-select-all');
        headerCheckboxes.forEach(checkbox => {
          if (checkbox) {
            const shouldBeIndeterminate = this.someSelected && !this.allSelected;
            checkbox.indeterminate = shouldBeIndeterminate;
          }
        });
      },

      toggleSelectAllVisible() {
        if (this.allSelected) {
          this.selectedItems = [];
          this.bulkActions = false;
        } else {
          this.selectedItems = this.filteredListItems.map(item => item.user._id);
          this.bulkActions = true;
        }
        
        this.$nextTick(() => {
          this.updateHeaderCheckboxStates();
        });
      },

      clearSelection() {
        this.selectedItems = [];
        this.bulkActions = false;
        this.showBulkStatusMenu = false;
        
        this.$nextTick(() => {
          this.updateHeaderCheckboxStates();
        });
      },

      // Bulk actions
      async bulkDelete() {
        if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ ${this.selectedItems.length} รายการ?`)) {
          return;
        }

        try {
          this.loading = true;
          
          for (const userId of this.selectedItems) {
            // เรียก API ลบผู้ใช้
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/delete", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'client-token-key': this.hostkey
              },
              body: JSON.stringify({
                method: "deleteOne",
                args: [{ _id: userId }]
              })
            });

            if (!resAPI.ok) {
              throw new Error(`HTTP error! status: ${resAPI.status}`);
            }
          }
          
          this.selectedItems = [];
          this.bulkActions = false;
          await this.getData();
          this.showNotification('success', `ลบผู้ใช้ ${this.selectedItems.length} รายการสำเร็จ`);

        } catch (error) {
          console.error('Error bulk deleting users:', error);
          this.error = 'ไม่สามารถลบผู้ใช้ได้';
        } finally {
          this.loading = false;
        }
      },

      async bulkExport() {
        try {
          const selectedUsers = this.listItems.filter(item => 
            this.selectedItems.includes(item.user._id)
          );
          
          const exportData = {
            exportDate: new Date().toISOString(),
            totalItems: selectedUsers.length,
            users: selectedUsers.map(userItem => ({
              _id: userItem.user._id,
              firstname: userItem.user.firstname,
              lastname: userItem.user.lastname,
              email: userItem.user.email,
              phone: userItem.user.phone,
              username: userItem.user.username,
              role: userItem.user.role,
              citizen: userItem.user.citizen,
              parent: userItem.user.parent,
              // Counts from aggregation
              unitCount: userItem.user.unitCount || 0,
              assetCount: userItem.user.assetCount || 0,
              collectionCount: userItem.user.collectionCount || 0,
              courseCount: userItem.user.courseCount || 0,
              // Detailed joined data
              unitDetails: userItem.user.unitDetails || [],
              assetDetails: userItem.user.assetDetails || [],
              collectionDetails: userItem.user.collectionDetails || [],
              courses: userItem.user.courses || [],
              hasAvatar: !!userItem.user.avatar_img,
              createdAt: userItem.user.createdAt || userItem.user.createAt,
              updatedAt: userItem.user.updatedAt
            }))
          };

          const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
          });
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `selected-users-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          this.showNotification('success', `ส่งออกข้อมูล ${this.selectedItems.length} รายการสำเร็จ`);
          
        } catch (error) {
          console.error('Error exporting users:', error);
          this.error = 'ไม่สามารถส่งออกข้อมูลได้';
        }
      },

      showNotification(type, message) {
        if (type === 'success') {
          console.log('✅ Success:', message);
        } else {
          console.error('❌ Error:', message);
        }
      },

      // Filtering methods
      selectFilter(filterValue) {
        this.activeFilter = filterValue;
        this.selectedItems = [];
        this.bulkActions = false;
        if (this.showMobileSidebar) {
          this.toggleMobileSidebar();
        }
      },

      applyQuickFilter(filter) {
        if (this.activeQuickFilter === filter.value) {
          this.activeQuickFilter = null;
        } else {
          this.activeQuickFilter = filter.value;
        }
      },

      clearAllFilters() {
        this.searchQuery = '';
        this.activeFilter = 'all';
        this.activeQuickFilter = null;
        this.selectedItems = [];
        this.bulkActions = false;
      },

      // Sorting
      sortUsers(users) {
        return users.sort((a, b) => {
          switch(this.sortBy) {
            case 'name_asc':
              return (a.user.firstname || '').localeCompare(b.user.firstname || '');
            case 'name_desc':
              return (b.user.firstname || '').localeCompare(a.user.firstname || '');
            case 'email_asc':
              return (a.user.email || '').localeCompare(b.user.email || '');
            case 'email_desc':
              return (b.user.email || '').localeCompare(a.user.email || '');
            case 'role_asc':
              return (a.user.role || '').localeCompare(b.user.role || '');
            case 'role_desc':
              return (b.user.role || '').localeCompare(a.user.role || '');
            case 'date_desc':
              return new Date(b.user.createAt || 0) - new Date(a.user.createAt || 0);
            case 'date_asc':
              return new Date(a.user.createAt || 0) - new Date(b.user.createAt || 0);
            default:
              return 0;
          }
        });
      },

      // Mobile sidebar
      toggleMobileSidebar() {
        this.showMobileSidebar = !this.showMobileSidebar;
      },

      // Card menu
      toggleCardMenu(userId) {
        this.openCardMenu = this.openCardMenu === userId ? null : userId;
      },

      closeCardMenu() {
        this.openCardMenu = null;
      },

      // Handle click outside
      handleClickOutside(event) {
        if (this.openCardMenu && !event.target.closest('.dropdown-menu')) {
          this.closeCardMenu();
        }
        
        if (this.showBulkStatusMenu && !event.target.closest('.relative')) {
          this.showBulkStatusMenu = false;
        }
      },

      // Change password method
      async changePassword(userId) {
        this.closeCardMenu();
        
        const newPassword = prompt('กรุณาใส่รหัสผ่านใหม่:');
        if (!newPassword) {
          return;
        }
        
        if (newPassword.length < 6) {
          alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
          return;
        }
        
        if (!confirm(`คุณแน่ใจหรือไม่ที่จะเปลี่ยนรหัสผ่านของผู้ใช้นี้?`)) {
          return;
        }

        try {
          this.loading = true;
          
          // Hash the password (simple example - in production use proper hashing)
          const hashedPassword = await this.hashPassword(newPassword);
          
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/update", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': this.hostkey
            },
            body: JSON.stringify({
              method: "updateOne",
              args: [
                { _id: userId },
                { 
                  password: hashedPassword,
                  updatedAt: new Date().toISOString()
                }
              ]
            })
          });

          if (!resAPI.ok) {
            throw new Error(`HTTP error! status: ${resAPI.status}`);
          }
          
          this.showNotification('success', 'เปลี่ยนรหัสผ่านสำเร็จ');
          await this.getData();

        } catch (error) {
          console.error('Error changing password:', error);
          this.error = 'ไม่สามารถเปลี่ยนรหัสผ่านได้';
        } finally {
          this.loading = false;
        }
      },

      // Toggle account lock method
      async toggleAccountLock(userId, currentStatus) {
        this.closeCardMenu();
        
        const newStatus = currentStatus === 'locked' ? 'active' : 'locked';
        const action = newStatus === 'locked' ? 'ล็อค' : 'ปลดล็อค';
        
        if (!confirm(`คุณแน่ใจหรือไม่ที่จะ${action}บัญชีนี้?`)) {
          return;
        }

        try {
          this.loading = true;
          
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/update", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': this.hostkey
            },
            body: JSON.stringify({
              method: "updateOne",
              args: [
                { _id: userId },
                { 
                  status: newStatus,
                  updatedAt: new Date().toISOString()
                }
              ]
            })
          });

          if (!resAPI.ok) {
            throw new Error(`HTTP error! status: ${resAPI.status}`);
          }
          
          this.showNotification('success', `${action}บัญชีสำเร็จ`);
          await this.getData();

        } catch (error) {
          console.error('Error toggling account lock:', error);
          this.error = `ไม่สามารถ${action}บัญชีได้`;
        } finally {
          this.loading = false;
        }
      },

      // Simple password hashing (in production, use proper server-side hashing)
      async hashPassword(password) {
        // This is a simple example - in production, use proper hashing on server side
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      },

      // Keyboard shortcuts
      handleKeydown(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'a' && !event.target.matches('input, textarea')) {
          event.preventDefault();
          this.toggleSelectAllVisible();
        }
        
        if (event.key === 'Escape') {
          if (this.selectedItems.length > 0) {
            this.clearSelection();
          }
          if (this.showBulkStatusMenu) {
            this.showBulkStatusMenu = false;
          }
          if (this.openCardMenu) {
            this.closeCardMenu();
          }
        }
        
        if (event.key === 'Delete' && this.selectedItems.length > 0 && !event.target.matches('input, textarea')) {
          event.preventDefault();
          this.bulkDelete();
        }
      },
    },
    async mounted () {
      try {
        console.log('User component mounted');
        console.log('Session:', storageManager.get('session'));
        console.log('Configs:', storageManager.get('configs'));
        console.log('Host key:', this.hostkey);

        const paging = storageManager.get('paging') || {};
        const routePaging = paging[this.$route.path] || {};

        // Apply the paging information from 'paging' constant
        this.limitItem = routePaging.limitItem || 25;
        this.currentPage = routePaging.currentPage || 1;
        this.searchQuery = routePaging.searchQuery || '';

        // Add event listeners
        document.addEventListener('click', this.handleClickOutside);
        document.addEventListener('keydown', this.handleKeydown);

        // Update URL parameters based on the paging information
        this.updateURLParameters();

        await this.getData();
      } catch (error) {
        console.error('Error in mounted:', error);
        this.error = 'เกิดข้อผิดพลาดในการเริ่มต้นระบบ';
      }
    },
    beforeUnmount() {
      // Remove event listeners
      document.removeEventListener('click', this.handleClickOutside);
      document.removeEventListener('keydown', this.handleKeydown);
    },
    updated() {
      // Handle indeterminate state for checkboxes
      this.$nextTick(() => {
        const headerCheckboxes = document.querySelectorAll('.header-select-all, input[type="checkbox"][data-select-all]');
        headerCheckboxes.forEach(checkbox => {
          if (checkbox) {
            checkbox.indeterminate = this.someSelected && !this.allSelected;
          }
        });
      });
    },
    setup() {
      //console.log("Setup");
    },
    computed: {
      filteredListItems() {
        let filtered = this.listItems;

        // Apply quick filters first
        if (this.activeQuickFilter) {
          switch (this.activeQuickFilter) {
            case 'hasPhone':
              filtered = filtered.filter(item => item.user.phone && item.user.phone.trim());
              break;
            case 'noPhone':
              filtered = filtered.filter(item => !item.user.phone || !item.user.phone.trim());
              break;
            case 'hasEmail':
              filtered = filtered.filter(item => item.user.email && item.user.email.trim());
              break;
            case 'noEmail':
              filtered = filtered.filter(item => !item.user.email || !item.user.email.trim());
              break;
            case 'hasCitizen':
              filtered = filtered.filter(item => item.user.citizen && item.user.citizen.trim());
              break;
            case 'hasAvatar':
              filtered = filtered.filter(item => item.user.avatar_img && item.user.avatar_img.trim());
              break;
            case 'hasParent':
              filtered = filtered.filter(item => item.user.parent);
              break;
            case 'hasUnit':
              filtered = filtered.filter(item => item.user.unitCount > 0);
              break;
            case 'hasAsset':
              filtered = filtered.filter(item => item.user.assetCount > 0);
              break;
            case 'hasCollection':
              filtered = filtered.filter(item => item.user.collectionCount > 0);
              break;
            case 'hasCourse':
              filtered = filtered.filter(item => item.user.courseCount > 0);
              break;
          }
        }

        // Filter by role
        if (this.activeFilter !== 'all') {
          if (this.activeFilter === 'recent') {
            // Show users created in the last 7 days
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(item => {
              if (!item.user.createAt) return false;
              return new Date(item.user.createAt) >= weekAgo;
            });
          } else {
            filtered = filtered.filter(item => item.user.role === this.activeFilter);
          }
        }

        // Filter by search term
        if (this.searchQuery && this.searchQuery.trim()) {
          const search = this.searchQuery.toLowerCase();
          filtered = filtered.filter(item => 
            (item.user.firstname && item.user.firstname.toLowerCase().includes(search)) ||
            (item.user.lastname && item.user.lastname.toLowerCase().includes(search)) ||
            (item.user.email && item.user.email.toLowerCase().includes(search)) ||
            (item.user.username && item.user.username.toLowerCase().includes(search)) ||
            (item.user.phone && item.user.phone.toLowerCase().includes(search)) ||
            (item.user.citizen && item.user.citizen.toLowerCase().includes(search)) ||
            (item.user.old_id && item.user.old_id.toLowerCase().includes(search)) ||
            (item.user.token && item.user.token.toLowerCase().includes(search))
          );
        }

        // Sort users
        return this.sortUsers(filtered);
      },

      // Computed properties for select all checkbox states
      allSelected() {
        return this.selectedItems.length === this.filteredListItems.length && this.filteredListItems.length > 0;
      },

      someSelected() {
        return this.selectedItems.length > 0 && this.selectedItems.length < this.filteredListItems.length;
      },

      // Stats for selected users
      selectedUserStats() {
        const selectedUsers = this.listItems.filter(item => 
          this.selectedItems.includes(item.user._id)
        );
        
        return {
          rootCount: selectedUsers.filter(item => item.user.role === 'root').length,
          superadminCount: selectedUsers.filter(item => item.user.role === 'superadmin').length,
          adminCount: selectedUsers.filter(item => item.user.role === 'admin').length,
          managerCount: selectedUsers.filter(item => item.user.role === 'manager').length
        };
      }
    }
};
</script>

<template>
  <div class="bg-gray-50 flex user-container min-h-screen">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0 h-[65px]">
          <h2 class="text-lg font-semibold text-gray-900">ผู้ใช้ระบบ</h2>
          <button
            @click="togglePanel"
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="เครื่องมือ"
          >
            <i class="fas fa-cogs"></i>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div class="text-blue-600 text-xs font-medium">ทั้งหมด</div>
              <div class="text-blue-900 text-lg font-bold">{{ stats.total }}</div>
            </div>
            <div class="bg-red-50 rounded-lg p-3 border border-red-100">
              <div class="text-red-600 text-xs font-medium">Root</div>
              <div class="text-red-900 text-lg font-bold">{{ stats.root }}</div>
            </div>
            <div class="bg-green-50 rounded-lg p-3 border border-green-100">
              <div class="text-green-600 text-xs font-medium">Admin</div>
              <div class="text-green-900 text-lg font-bold">{{ stats.admin + stats.superadmin }}</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div class="text-purple-600 text-xs font-medium">Manager</div>
              <div class="text-purple-900 text-lg font-bold">{{ stats.manager }}</div>
            </div>
          </div>
          
          <!-- Hostname Stats -->
          <div class="grid grid-cols-3 gap-3 mt-3">
            <div class="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <div class="text-orange-600 text-xs font-medium">Units</div>
              <div class="text-orange-900 text-lg font-bold">{{ stats.totalUnits }}</div>
            </div>
            <div class="bg-teal-50 rounded-lg p-3 border border-teal-100">
              <div class="text-teal-600 text-xs font-medium">Assets</div>
              <div class="text-teal-900 text-lg font-bold">{{ stats.totalAssets }}</div>
            </div>
            <div class="bg-pink-50 rounded-lg p-3 border border-pink-100">
              <div class="text-pink-600 text-xs font-medium">Collections</div>
              <div class="text-pink-900 text-lg font-bold">{{ stats.totalCollections }}</div>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="relative">
            <input
              v-model="searchQuery"
              @keydown="handleSearchKeydown"
              type="text"
              placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร, Username, Citizen ID..."
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <button 
              v-if="searchQuery" 
              @click="clearSearchQuery"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Quick Filter Tags -->
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="quickFilter in quickFilters"
              :key="quickFilter.value"
              @click="applyQuickFilter(quickFilter)"
              class="px-3 py-1 text-xs rounded-full transition-colors duration-200"
              :class="activeQuickFilter === quickFilter.value 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'"
            >
              <i :class="quickFilter.icon" class="mr-1"></i>
              {{ quickFilter.label }}
            </button>
          </div>
          
          <div v-if="searchQuery.length > 0" class="mt-2 text-xs text-gray-500">
            ผลการค้นหา <span class="font-semibold text-gray-900">{{ filteredListItems.length }}</span> รายการ
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <div class="space-y-1">
            <button
              v-for="item in sidebarMenuItems"
              :key="item.value"
              @click="selectFilter(item.value)"
              :class="[
                'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-200',
                activeFilter === item.value 
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <div class="flex items-center gap-3">
                <i :class="item.icon"></i>
                <span>{{ item.label }}</span>
              </div>
              <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {{ item.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Sort Options -->
        <div class="px-4 py-4">
          <label class="block text-xs font-medium text-gray-700 mb-2">เรียงลำดับ</label>
          <select
            v-model="sortBy"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name_asc">ชื่อ A-Z</option>
            <option value="name_desc">ชื่อ Z-A</option>
            <option value="email_asc">อีเมล A-Z</option>
            <option value="email_desc">อีเมล Z-A</option>
            <option value="role_asc">Role A-Z</option>
            <option value="role_desc">Role Z-A</option>
            <option value="date_desc">วันที่ใหม่-เก่า</option>
            <option value="date_asc">วันที่ เก่า-ใหม่</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 h-full">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3 h-[65px]">
        <div class="flex items-center justify-between h-full">
          <button
            @click="toggleMobileSidebar"
            class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <i class="fas fa-bars"></i>
          </button>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-semibold text-gray-900">ผู้ใช้ระบบ</h1>
            <span v-if="selectedItems.length > 0" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {{ selectedItems.length }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <!-- Mobile Select All -->
            <button
              v-if="filteredListItems.length > 0"
              @click="toggleSelectAllVisible"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              :title="allSelected ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกทั้งหมด'"
            >
              <i :class="['fas', allSelected ? 'fa-check-double' : someSelected ? 'fa-minus' : 'fa-check']"></i>
            </button>
            <button
              @click="togglePanel"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <i class="fas fa-cogs"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Header Section -->
      <div class="bg-white border-b border-gray-200 px-4 py-3 h-[65px]">
        <div class="flex items-center justify-between h-full gap-4">
          <div class="flex items-center gap-2 lg:gap-4 min-w-0 flex-1">
            <h1 class="hidden lg:block text-xl font-bold text-gray-900 flex-shrink-0">User Management</h1>
            
            <!-- Select All Checkbox -->
            <div class="flex items-center gap-2 lg:gap-3 min-w-0">
              <div class="flex items-center gap-2 flex-shrink-0 relative">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  @change="toggleSelectAll"
                  class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 header-select-all flex-shrink-0 relative z-10"
                  data-select-all="true"
                  :title="allSelected ? 'ยกเลิกการเลือกทั้งหมด' : someSelected ? 'เลือกทั้งหมด' : 'เลือกทั้งหมด'"
                />
                <label class="text-sm text-gray-600 cursor-pointer select-none truncate ml-2" @click="toggleSelectAllVisible">
                  <span class="hidden sm:inline">เลือกทั้งหมด </span>({{ selectedItems.length }}/{{ filteredListItems.length }})
                </label>
              </div>
            </div>
            
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                @click="refreshData"
                :disabled="isRefreshing"
                class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                <i :class="['fas', isRefreshing ? 'fa-spinner fa-spin' : 'fa-refresh']"></i>
                <span class="hidden sm:inline">{{ isRefreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช' }}</span>
              </button>
            </div>
          </div>
          
          <!-- View Mode Toggle -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200',
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              <i class="fas fa-th"></i>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200',
                viewMode === 'list' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-4">
        <!-- Loading State -->
        <div v-if="!loading_sources" class="flex items-center justify-center py-20">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">กำลังโหลดข้อมูล</h3>
              <p class="text-xs text-gray-500">กรุณารอสักครู่...</p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-else-if="error" class="mb-4">
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">เกิดข้อผิดพลาด!</strong>
            <span class="block sm:inline"> {{ error }}</span>
            <span class="absolute top-0 bottom-0 right-0 px-4 py-3" @click="dismissError">
              <svg class="fill-current h-6 w-6 text-red-500 cursor-pointer" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>ปิด</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </span>
          </div>
        </div>

        <!-- Bulk Actions Bar -->
        <div v-if="bulkActions && selectedItems.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <!-- Selection Info -->
            <div class="flex flex-col lg:flex-row lg:items-center gap-3">
              <div class="flex items-center gap-3">
                <span class="text-blue-800 font-medium">เลือกแล้ว {{ selectedItems.length }} รายการ</span>
                <span class="text-blue-600 text-sm">จาก {{ filteredListItems.length }} รายการ</span>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Select All/None Toggle -->
              <button
                @click="toggleSelectAllVisible"
                class="px-3 py-2 text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm"
              >
                <i class="fas fa-check-double mr-1"></i>
                {{ allSelected ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด' }}
              </button>
              
              <!-- Bulk Export Button -->
              <button
                @click="bulkExport"
                class="px-3 py-2 text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm"
              >
                <i class="fas fa-download mr-1"></i>
                ส่งออก
              </button>
              
              <!-- Bulk Delete Button -->
              <button
                @click="bulkDelete"
                class="px-3 py-2 text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm"
              >
                <i class="fas fa-trash mr-1"></i>
                ลบ
              </button>
              
              <!-- Cancel Button -->
              <button
                @click="clearSelection"
                class="px-3 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
              >
                <i class="fas fa-times mr-1"></i>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div v-else>
          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <div v-for="user in filteredListItems" :key="user.user._id" 
                 class="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-80"
                 :class="selectedItems.includes(user.user._id) ? 'ring-2 ring-blue-500' : ''">
              
              <!-- Background Image -->
              <div class="relative h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80" 
                  class="w-full h-full object-cover opacity-80"
                  alt="Background"
                />
                <!-- Selection Checkbox -->
                <div class="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    :value="user.user._id"
                    v-model="selectedItems"
                    @click.stop
                    class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <!-- Card Menu -->
                <div class="absolute top-3 right-3 z-10">
                  <button
                    @click.stop.prevent="toggleCardMenu(user.user._id)"
                    class="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors duration-200"
                  >
                    <i class="fas fa-ellipsis-v text-gray-600 text-sm"></i>
                  </button>
                  <!-- Dropdown Menu -->
                  <div
                    v-if="openCardMenu === user.user._id"
                    class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 dropdown-menu z-20"
                  >
                    <router-link
                      :to="`/lesson/edit/${user.user._id}`"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="closeCardMenu"
                    >
                      <i class="fas fa-eye text-blue-500"></i>
                      <span>ดูรายละเอียด</span>
                    </router-link>
                    <router-link
                      :to="`/lesson/edit/${user.user._id}`"
                      class="flex items-center gap-3 px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                      @click="closeCardMenu"
                    >
                      <i class="fas fa-edit text-yellow-500"></i>
                      <span>แก้ไขข้อมูล</span>
                    </router-link>
                    <button
                      @click.stop="changePassword(user.user._id)"
                      class="w-full flex items-center gap-3 px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                    >
                      <i class="fas fa-key text-orange-500"></i>
                      <span>เปลี่ยนรหัสผ่าน</span>
                    </button>
                    <button
                      @click.stop="toggleAccountLock(user.user._id, user.user.status)"
                      class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-red-50"
                      :class="user.user.status === 'locked' ? 'text-green-700' : 'text-red-700'"
                    >
                      <i :class="user.user.status === 'locked' ? 'fas fa-unlock text-green-500' : 'fas fa-lock text-red-500'"></i>
                      <span>{{ user.user.status === 'locked' ? 'ปลดล็อคบัญชี' : 'ล็อคบัญชี' }}</span>
                    </button>
                  </div>
                </div>
                
                <!-- Status Badge -->
                <div class="absolute top-3 left-1/2 transform -translate-x-1/2">
                  <span class="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                    ใช้งานได้
                  </span>
                </div>
              </div>

              <!-- User Info Section -->
              <div class="flex-1 p-4 flex flex-col">
                <!-- User Avatar & Name -->
                <div class="flex items-center space-x-3 mb-3 -mt-8 relative z-10">
                  <div class="relative">
                    <img 
                      :src="user.user.avatar_img || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user.firstname + ' ' + user.user.lastname)}&background=e5e7eb&color=374151&size=60`" 
                      class="w-12 h-12 rounded-full object-cover border-3 border-white shadow-lg"
                      :alt="user.user.firstname"
                    />
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                         :class="user.user.status === 'locked' ? 'bg-red-400' : 'bg-green-400'"></div>
                  </div>
                  <div class="flex-1 min-w-0 mt-5">
                    <h3 class="font-semibold text-gray-900 text-sm truncate">
                      {{ user.user.firstname }} {{ user.user.lastname }}
                    </h3>
                    <p class="text-xs text-gray-500 truncate">{{ user.user.email }}</p>
                  </div>
                </div>

                <!-- User Details -->
                <div class="space-y-2 text-xs text-gray-600 flex-1">
                  <div v-if="user.user.username" class="flex items-center">
                    <i class="fas fa-user w-4 mr-2 text-gray-400"></i>
                    <span class="truncate">{{ user.user.username }}</span>
                  </div>
                  <div v-if="user.user.phone" class="flex items-center">
                    <i class="fas fa-phone w-4 mr-2 text-gray-400"></i>
                    <span>{{ user.user.phone }}</span>
                  </div>
                  <div v-if="user.user.citizen" class="flex items-center">
                    <i class="fas fa-id-card w-4 mr-2 text-gray-400"></i>
                    <span>{{ user.user.citizen }}</span>
                  </div>
                  
                  <!-- Joined Data Summary -->
                  <div v-if="user.user.unitDetails && user.user.unitDetails.length > 0" class="flex items-center text-green-600">
                    <i class="fas fa-building w-4 mr-2"></i>
                    <span class="truncate">{{ user.user.unitDetails[0].siteName || user.user.unitDetails[0].hostname || 'Unit' }}</span>
                    <span v-if="user.user.unitCount > 1" class="ml-1">+{{ user.user.unitCount - 1 }}</span>
                  </div>
                  
                  <div v-if="user.user.assetDetails && user.user.assetDetails.length > 0" class="flex items-center text-orange-600">
                    <i class="fas fa-briefcase w-4 mr-2"></i>
                    <span class="truncate">{{ user.user.assetDetails[0].siteName || user.user.assetDetails[0].hostname || 'Asset' }}</span>
                    <span v-if="user.user.assetCount > 1" class="ml-1">+{{ user.user.assetCount - 1 }}</span>
                  </div>
                  
                  <div v-if="user.user.collectionDetails && user.user.collectionDetails.length > 0" class="flex items-center text-purple-600">
                    <i class="fas fa-layer-group w-4 mr-2"></i>
                    <span class="truncate">{{ user.user.collectionDetails[0].siteName || user.user.collectionDetails[0].hostname || 'Collection' }}</span>
                    <span v-if="user.user.collectionCount > 1" class="ml-1">+{{ user.user.collectionCount - 1 }}</span>
                  </div>
                  
                  <!-- Role Badge -->
                  <div class="mt-2">
                    <span :class="[
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      user.user.role === 'root' ? 'bg-red-100 text-red-800' :
                      user.user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                      user.user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      user.user.role === 'manager' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    ]">
                      {{ user.user.role || 'Unknown' }}
                    </span>
                  </div>
                </div>

                <!-- Stats Row -->
                <div class="flex justify-between items-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                  <div v-if="user.user.assetCount > 0" class="text-center">
                    <div class="font-semibold text-gray-900">{{ user.user.assetCount }}</div>
                    <div>Assets</div>
                  </div>
                  <div v-if="user.user.unitCount > 0" class="text-center">
                    <div class="font-semibold text-gray-900">{{ user.user.unitCount }}</div>
                    <div>Units</div>
                  </div>
                  <div v-if="user.user.collectionCount > 0" class="text-center">
                    <div class="font-semibold text-gray-900">{{ user.user.collectionCount }}</div>
                    <div>Collections</div>
                  </div>
                  <div v-if="user.user.courseCount > 0" class="text-center">
                    <div class="font-semibold text-gray-900">{{ user.user.courseCount }}</div>
                    <div>Courses</div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="p-4 pt-0">
                <div class="flex justify-between items-center">
                  <button 
                    @click.stop="$router.push('/origin/user/detail/'+ user.user._id)"
                    class="flex flex-col items-center text-blue-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    <i class="fas fa-eye text-lg mb-1"></i>
                    <span class="text-xs">ดู</span>
                  </button>
                  <button 
                    @click.stop="$router.push('/lesson/edit/'+ user.user._id)"
                    class="flex flex-col items-center text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
                  >
                    <i class="fas fa-edit text-lg mb-1"></i>
                    <span class="text-xs">แก้ไข</span>
                  </button>
                  <button 
                    @click.stop="changePassword(user.user._id)"
                    class="flex flex-col items-center text-purple-500 hover:text-purple-600 transition-colors duration-200"
                  >
                    <i class="fas fa-cog text-lg mb-1"></i>
                    <span class="text-xs">เพิ่มเติม</span>
                  </button>
                  <button 
                    @click.stop="toggleAccountLock(user.user._id, user.user.status)"
                    :class="user.user.status === 'locked' ? 
                      'text-green-500 hover:text-green-600' : 
                      'text-red-500 hover:text-red-600'"
                    class="flex flex-col items-center transition-colors duration-200"
                  >
                    <i :class="user.user.status === 'locked' ? 'fas fa-unlock text-lg mb-1' : 'fas fa-trash text-lg mb-1'"></i>
                    <span class="text-xs">{{ user.user.status === 'locked' ? 'ปลดล็อค' : 'ลบ' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else-if="viewMode === 'list'" class="bg-white rounded-lg shadow overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        :checked="allSelected"
                        :indeterminate="someSelected"
                        @change="toggleSelectAll"
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 header-select-all"
                        data-select-all="true"
                      />
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ใช้</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การติดต่อ</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ข้อมูลเพิ่มเติม</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สร้าง</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="user in filteredListItems" :key="user.user._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        :value="user.user._id"
                        v-model="selectedItems"
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img 
                          :src="user.user.avatar_img || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user.firstname + ' ' + user.user.lastname)}&background=e5e7eb&color=374151&size=40`" 
                          class="w-8 h-8 rounded-full object-cover mr-3"
                        />
                        <div>
                          <div class="text-sm font-medium text-gray-900">
                            {{ user.user.firstname }} {{ user.user.lastname }}
                          </div>
                          <div class="text-sm text-gray-500 truncate">{{ user.user.old_id }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        user.user.role === 'root' ? 'bg-red-100 text-red-800' :
                        user.user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                        user.user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        user.user.role === 'manager' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      ]">
                        <i :class="[
                          'mr-1 fas',
                          user.user.role === 'root' ? 'fa-crown' :
                          user.user.role === 'superadmin' ? 'fa-user-shield' :
                          user.user.role === 'admin' ? 'fa-user-tie' :
                          user.user.role === 'manager' ? 'fa-user-cog' :
                          'fa-user'
                        ]"></i>
                        {{ user.user.role || 'Unknown' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ user.user.username }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{{ user.user.phone }}</div>
                      <div class="text-xs text-gray-400">{{ user.user.email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div class="space-y-1">
                        <div v-if="user.user.citizen" class="text-xs">
                          <i class="fas fa-id-card mr-1"></i>{{ user.user.citizen }}
                        </div>
                        <div v-if="user.user.unitCount > 0" class="text-xs text-green-600" :title="user.user.unitDetails && user.user.unitDetails.length > 0 ? user.user.unitDetails.map(u => u.siteName || u.hostname).join(', ') : ''">
                          <i class="fas fa-building mr-1"></i>{{ user.user.unitCount }} Units
                          <span v-if="user.user.unitDetails && user.user.unitDetails.length > 0" class="ml-1 text-gray-400">
                            ({{ user.user.unitDetails[0].siteName || user.user.unitDetails[0].hostname || 'Unknown' }}{{ user.user.unitCount > 1 ? ` +${user.user.unitCount - 1}` : '' }})
                          </span>
                        </div>
                        <div v-if="user.user.assetCount > 0" class="text-xs text-orange-600" :title="user.user.assetDetails && user.user.assetDetails.length > 0 ? user.user.assetDetails.map(a => a.siteName || a.hostname).join(', ') : ''">
                          <i class="fas fa-briefcase mr-1"></i>{{ user.user.assetCount }} Assets
                          <span v-if="user.user.assetDetails && user.user.assetDetails.length > 0" class="ml-1 text-gray-400">
                            ({{ user.user.assetDetails[0].siteName || user.user.assetDetails[0].hostname || 'Unknown' }}{{ user.user.assetCount > 1 ? ` +${user.user.assetCount - 1}` : '' }})
                          </span>
                        </div>
                        <div v-if="user.user.collectionCount > 0" class="text-xs text-purple-600" :title="user.user.collectionDetails && user.user.collectionDetails.length > 0 ? user.user.collectionDetails.map(c => c.siteName || c.hostname).join(', ') : ''">
                          <i class="fas fa-layer-group mr-1"></i>{{ user.user.collectionCount }} Collections
                          <span v-if="user.user.collectionDetails && user.user.collectionDetails.length > 0" class="ml-1 text-gray-400">
                            ({{ user.user.collectionDetails[0].siteName || user.user.collectionDetails[0].hostname || 'Unknown' }}{{ user.user.collectionCount > 1 ? ` +${user.user.collectionCount - 1}` : '' }})
                          </span>
                        </div>
                        <div v-if="user.user.courseCount > 0" class="text-xs text-blue-600">
                          <i class="fas fa-graduation-cap mr-1"></i>{{ user.user.courseCount }} Courses
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatThaidate(user.user.createdAt || user.user.createAt) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        @click="$router.push('/lesson/edit/'+ user.user._id)"
                        class="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        <i class="fas fa-edit mr-1"></i>
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredListItems.length === 0" class="text-center py-12">
            <i class="fas fa-users text-gray-400 text-5xl mb-4"></i>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ searchQuery || activeFilter !== 'all' || activeQuickFilter ? 'ไม่พบผู้ใช้ที่ตรงกับการค้นหา' : 'ไม่พบผู้ใช้' }}
            </h3>
            <p class="text-gray-600 mb-6">
              {{ searchQuery ? `ไม่พบผลลัพธ์สำหรับ "${searchQuery}"` : 
                 activeFilter !== 'all' ? 'ลองเปลี่ยนตัวกรองหรือเพิ่มผู้ใช้ใหม่' : 
                 'ยังไม่มีผู้ใช้ในระบบ' }}
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                v-if="searchQuery || activeFilter !== 'all' || activeQuickFilter"
                @click="clearAllFilters"
                class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <i class="fas fa-times"></i>
                <span>ล้างตัวกรอง</span>
              </button>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="filteredListItems.length > 0" class="mt-6 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              แสดง {{ filteredListItems.length }} รายการ
              {{ searchQuery || activeFilter !== 'all' || activeQuickFilter ? 'ที่ตรงกับการค้นหา' : '' }}
              จากทั้งหมด {{ stats.total }} รายการ
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar -->
    <div 
      v-if="showMobileSidebar" 
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="showMobileSidebar = false"
    >
      <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">ผู้ใช้ระบบ</h2>
            <button
              @click="showMobileSidebar = false"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <!-- Mobile sidebar content (same as desktop) -->
        </div>
      </div>
    </div>
  </div>

  <!-- Side Panel for Tools -->
  <div v-if="open" class="fixed inset-0 z-50 overflow-hidden">
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="closePanel"></div>
    <div class="fixed inset-y-0 right-0 w-96 bg-white shadow-xl">
      <div class="flex h-full flex-col">
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">เครื่องมือ</h2>
            <button @click="closePanel" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="flex-1 p-4">
          <div class="space-y-3">
            <button class="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200" @click="batchProcess">
              <i class="fas fa-calculator mr-2"></i>
              Render Billing
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Batch Progress Modal -->
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
</template>

<style scoped>
/* User container with proper height */
.user-container {
  min-height: 100vh;
}

/* Loading states */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

/* Focus states */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Responsive adjustments */
@media (max-width: 1024px) { 
  .sidebar-desktop {
    display: none;
  }
}

@media (max-width: 768px) { 
  .gap-3 {
    gap: 0.5rem;
  }
  
  .p-4 {
    padding: 0.75rem;
  }
  
  .text-sm {
    font-size: 0.8rem;
  }
}

/* Remove scrollbar styling to prevent unwanted scrolling */

/* User card animations */
.user-card {
  transition: all 0.2s ease-in-out;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Mobile sidebar animation */
.mobile-sidebar-enter {
  transform: translateX(-100%);
}

.mobile-sidebar-enter-active {
  transition: transform 0.3s ease-out;
}

.mobile-sidebar-enter-to {
  transform: translateX(0);
}

.mobile-sidebar-leave {
  transform: translateX(0);
}

.mobile-sidebar-leave-active {
  transition: transform 0.3s ease-in;
}

.mobile-sidebar-leave-to {
  transform: translateX(-100%);
}

/* Button hover effects */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

input:focus-visible {
  outline: none;
}

/* Original loading overlay styles */
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

/* User avatar styling */
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.user-avatar:hover {
  border-color: #3b82f6;
}

/* Status indicators */
.status-online {
  background-color: #10b981;
}

.status-offline {
  background-color: #ef4444;
}

/* Card styling */
.user-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease;
}

.user-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

/* Grid responsive */
.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .user-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.75rem;
  }
}

/* Table hover effects */
.table-row:hover {
  background-color: #f9fafb;
}

/* Quick stats styling */
.stat-card {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Search input styling */
.search-input {
  transition: all 0.2s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Sidebar styling */
.sidebar {
  background: white;
  border-right: 1px solid #e5e7eb;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-item {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin: 0.25rem 0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sidebar-item:hover {
  background-color: #f3f4f6;
}

.sidebar-item.active {
  background-color: #dbeafe;
  color: #1d4ed8;
  font-weight: 600;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .user-container {
    flex-direction: column;
  }
  
  .sidebar {
    display: none;
  }
  
  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .mobile-sidebar-content {
    width: 280px;
    height: 100%;
    background: white;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
}

/* Checkbox styling */
input[type="checkbox"] {
  accent-color: #3b82f6;
}

/* Pagination styling */
.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-button {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.pagination-button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty state styling */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-state-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
}
</style>
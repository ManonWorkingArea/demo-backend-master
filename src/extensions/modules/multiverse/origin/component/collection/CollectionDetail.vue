<script>

// Component
import feather from 'feather-icons';
import storageManager from '@/plugins/storage';
import moment from 'moment';
import CollectionDetailTab from './module/plugin/CollectionDetailTab.vue';
import CollectionAssetTab from './module/plugin/CollectionAssetTab.vue';
import CollectionAdminTab from './module/plugin/CollectionAdminTab.vue';
import CollectionStorageTab from './module/plugin/CollectionStorageTab.vue';
import OwnershipManager from './module/plugin/OwnershipManager.vue';
moment().format();

export default {
    inject: ['apiServer'],
    data() {
      return {
        hostkey:this.$Key,
        collectionData: {},
        assetData: [],
        spaceData: {},
        collectionAdmin: [],
        dataItem: this.$route.params.id,
        loading_sources: true,
        activeTab: 'detail',
        showDeleteModal: false,
        showEditModal: false,
        editForm: {
          siteName: '',
          hostname: '',
          relation: ''
        },
        searchQuery: '',
        sortBy: 'name',
        sortOrder: 'asc',
        refreshInterval: null,
        lastRefresh: null,
        notifications: [],
        activityLog: [],
        recentActivities: [],
        
        // Enhanced features (shared between components)
        showAdvancedSearch: false,
        showQuickActions: false,
        showAnalyticsModal: false,
        quickActions: [
          { name: 'Export All', icon: 'download', action: 'exportAll' },
          { name: 'Backup', icon: 'shield', action: 'backup' },
          { name: 'Sync', icon: 'refresh', action: 'sync' },
          { name: 'Analytics', icon: 'chart-bar', action: 'analytics' },
          { name: 'Import Data', icon: 'upload', action: 'import' },
          { name: 'Settings', icon: 'settings', action: 'settings' }
        ],
        bulkActions: [
          { name: 'Delete Selected', icon: 'trash', action: 'delete', color: 'red' },
          { name: 'Export Selected', icon: 'download', action: 'export', color: 'blue' },
          { name: 'Archive Selected', icon: 'archive', action: 'archive', color: 'yellow' },
          { name: 'Activate Selected', icon: 'check', action: 'activate', color: 'green' }
        ],
        analytics: {
          totalRequests: 0,
          totalBandwidth: 0,
          avgResponseTime: 0,
          uptime: 0,
          errorRate: 0
        },
        
        tabs: [
        {
          code: "detail",
          name: "รายละเอียด",
          description: "Personal details and application.",
        },
        {
          code: "asset",
          name: "เว็บไซต์",
          description: "Asset details.",
        },
        {
          code: "admin",
          name: "ทีมงาน",
          description: "Admin settings.",
        },
        {
          code: "storage",
          name: "พื้นที่",
          description: "Storage information.",
        },
        {
          code: "ownership",
          name: "เจ้าของ",
          description: "Ownership and contact information.",
        },
        {
          code: "activity",
          name: "กิจกรรม",
          description: "Activity log and history.",
        },
      ],
      }
    },
    components: {
      CollectionDetailTab,
      CollectionAssetTab,
      CollectionAdminTab,
      CollectionStorageTab,
      OwnershipManager
    },
    methods: {
      dateTime(value) {
        return moment(value).format("DD/MM/YYYY hh:mm:ss");
      },
      formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      },
      getStatusColor(status) {
        const colors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
          maintenance: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || colors.inactive;
      },
      filteredAssets() {
        let filtered = this.assetData;
        
        if (this.searchQuery) {
          filtered = filtered.filter(asset => 
            asset.siteName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            asset.hostname.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        }
        
        return filtered.sort((a, b) => {
          const aVal = a[this.sortBy] || '';
          const bVal = b[this.sortBy] || '';
          
          if (this.sortOrder === 'asc') {
            return aVal.localeCompare(bVal);
          } else {
            return bVal.localeCompare(aVal);
          }
        });
      },
      openEditModal() {
        this.editForm = {
          siteName: this.collectionData.siteName || '',
          hostname: this.collectionData.hostname || '',
          relation: this.collectionData.relation || ''
        };
        this.showEditModal = true;
      },
      closeEditModal() {
        this.showEditModal = false;
        this.editForm = { siteName: '', hostname: '', relation: '' };
      },
      async saveChanges() {
        try {
          this.loading_sources = false;
          
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/hostname/${this.dataItem}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': this.hostkey
            },
            body: JSON.stringify(this.editForm)
          });

          if (resAPI.status === 200) {
            this.collectionData = { ...this.collectionData, ...this.editForm };
            this.closeEditModal();
            this.addNotification('success', 'บันทึกข้อมูลสำเร็จ');
            this.logActivity('แก้ไขข้อมูล', `แก้ไขข้อมูลคอลเลกชัน ${this.editForm.siteName}`);
          } else {
            this.addNotification('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
          }
          
          this.loading_sources = true;
        } catch (error) {
          console.log(error);
          this.addNotification('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
          this.loading_sources = true;
        }
      },
      confirmDelete() {
        this.showDeleteModal = true;
      },
      async executeDelete() {
        try {
          this.loading_sources = false;
          
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/hostname/${this.dataItem}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': this.hostkey
            }
          });

          if (resAPI.status === 200) {
            this.addNotification('success', 'ลบคอลเลกชันสำเร็จ');
            this.logActivity('ลบคอลเลกชัน', `ลบคอลเลกชัน ${this.collectionData.siteName}`);
            this.$router.push('/origin/collection');
          } else {
            this.addNotification('error', 'เกิดข้อผิดพลาดในการลบข้อมูล');
          }
          
          this.loading_sources = true;
        } catch (error) {
          console.log(error);
          this.addNotification('error', 'เกิดข้อผิดพลาดในการลบข้อมูล');
          this.loading_sources = true;
        }
      },
      exportData() {
        const data = {
          collection: this.collectionData,
          assets: this.assetData,
          admins: this.collectionAdmin,
          space: this.spaceData
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `collection-${this.collectionData.siteName}-export.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      refreshData() {
        this.lastRefresh = new Date();
        this.getData();
      },
      startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
          this.refreshData();
        }, 300000); // Refresh every 5 minutes
      },
      stopAutoRefresh() {
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval);
          this.refreshInterval = null;
        }
      },
      addNotification(type, message) {
        const notification = {
          id: Date.now(),
          type,
          message,
          timestamp: new Date()
        };
        this.notifications.unshift(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          this.removeNotification(notification.id);
        }, 5000);
      },
      removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
      },
      logActivity(action, details) {
        this.activityLog.unshift({
          id: Date.now(),
          action,
          details,
          timestamp: new Date(),
          user: 'Current User' // Replace with actual user data
        });
        
        // Keep only last 50 activities
        if (this.activityLog.length > 50) {
          this.activityLog = this.activityLog.slice(0, 50);
        }
      },
      copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          this.addNotification('success', 'คัดลอกไปยังคลิปบอร์ดแล้ว');
        });
      },
      getRelativeTime(date) {
        return moment(date).fromNow();
      },

      getTimeSinceCreated() {
        if (!this.collectionData?.createdAt) return '';
        const now = new Date();
        const created = new Date(this.collectionData.createdAt);
        const diffTime = Math.abs(now - created);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'วันนี้';
        if (diffDays === 1) return '1 วัน';
        if (diffDays < 30) return `${diffDays} วัน`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} เดือน`;
        return `${Math.floor(diffDays / 365)} ปี`;
      },
      
      // Enhanced methods for child components
      handleBulkAction(payload) {
        const { action, assetIds } = payload;
        
        switch (action) {
          case 'archive':
            this.bulkArchiveAssetsFromChild(assetIds);
            break;
          case 'delete':
            this.bulkDeleteAssetsFromChild(assetIds);
            break;
          case 'export':
            this.bulkExportAssetsFromChild(assetIds);
            break;
          case 'status-active':
            this.bulkActivateAssetsFromChild(assetIds);
            break;
          case 'status-inactive':
            this.bulkDeactivateAssetsFromChild(assetIds);
            break;
        }
      },
      
      showCopySuccessMessage() {
        this.addNotification('success', 'คัดลอกไปยังคลิปบอร์ดแล้ว');
      },
      
      async bulkArchiveAssetsFromChild(assetIds) {
        try {
          this.loading_sources = false;
          const updatePromises = assetIds.map(assetId => 
            fetch(`https://gateway.cloudrestfulapi.com/api/hostname/${assetId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'client-token-key': this.hostkey
              },
              body: JSON.stringify({ status: 'archived' })
            })
          );
          
          await Promise.all(updatePromises);
          this.addNotification('success', `เก็บถาวร ${assetIds.length} รายการสำเร็จ`);
          await this.getData();
        } catch (error) {
          this.addNotification('error', 'เกิดข้อผิดพลาดในการเก็บถาวร');
        } finally {
          this.loading_sources = true;
        }
      },
      
      async bulkActivateAssetsFromChild(assetIds) {
        try {
          this.loading_sources = false;
          const updatePromises = assetIds.map(assetId => 
            fetch(`https://gateway.cloudrestfulapi.com/api/hostname/${assetId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'client-token-key': this.hostkey
              },
              body: JSON.stringify({ status: 'active' })
            })
          );
          
          await Promise.all(updatePromises);
          this.addNotification('success', `เปิดใช้งาน ${assetIds.length} รายการสำเร็จ`);
          await this.getData();
        } catch (error) {
          this.addNotification('error', 'เกิดข้อผิดพลาดในการเปิดใช้งาน');
        } finally {
          this.loading_sources = true;
        }
      },
      
      async bulkDeactivateAssetsFromChild(assetIds) {
        try {
          this.loading_sources = false;
          const updatePromises = assetIds.map(assetId => 
            fetch(`https://gateway.cloudrestfulapi.com/api/hostname/${assetId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'client-token-key': this.hostkey
              },
              body: JSON.stringify({ status: 'inactive' })
            })
          );
          
          await Promise.all(updatePromises);
          this.addNotification('success', `ปิดใช้งาน ${assetIds.length} รายการสำเร็จ`);
          await this.getData();
        } catch (error) {
          this.addNotification('error', 'เกิดข้อผิดพลาดในการปิดใช้งาน');
        } finally {
          this.loading_sources = true;
        }
      },
      
      async bulkDeleteAssetsFromChild(assetIds) {
        try {
          this.loading_sources = false;
          const deletePromises = assetIds.map(assetId => 
            fetch(`https://gateway.cloudrestfulapi.com/api/hostname/${assetId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'client-token-key': this.hostkey
              }
            })
          );
          
          await Promise.all(deletePromises);
          this.addNotification('success', `ลบ ${assetIds.length} รายการสำเร็จ`);
          await this.getData();
        } catch (error) {
          this.addNotification('error', 'เกิดข้อผิดพลาดในการลบข้อมูล');
        } finally {
          this.loading_sources = true;
        }
      },
      
      async bulkExportAssetsFromChild(assetIds) {
        const selectedData = this.assetData.filter(asset => 
          assetIds.includes(asset._id)
        );
        
        const blob = new Blob([JSON.stringify(selectedData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selected-assets-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.addNotification('success', `ส่งออกข้อมูล ${assetIds.length} รายการสำเร็จ`);
      },
      
      async handleQuickAction(action) {
        this.showQuickActions = false;
        
        switch (action) {
          case 'exportAll':
            this.exportData();
            break;
          case 'backup':
            await this.createBackup();
            break;
          case 'sync':
            await this.syncData();
            break;
          case 'analytics':
            this.showAnalyticsModal = true;
            await this.loadAnalyticsData();
            break;
          case 'import':
            await this.importData();
            break;
          case 'settings':
            this.openSettingsModal();
            break;
        }
      },
      
      async loadAnalyticsData() {
        try {
          // Simulate loading analytics data - replace with actual API
          this.analytics = {
            totalRequests: Math.floor(Math.random() * 100000),
            totalBandwidth: Math.floor(Math.random() * 1000), // GB
            avgResponseTime: Math.floor(Math.random() * 500), // ms
            uptime: 99.9,
            errorRate: Math.random() * 5 // percentage
          };
        } catch (error) {
          console.error('Error loading analytics:', error);
        }
      },
      
      async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
          const file = event.target.files[0];
          if (file) {
            try {
              const text = await file.text();
              const importedData = JSON.parse(text);
              
              // Process import data - merge with existing assets if it's an array
              if (Array.isArray(importedData)) {
                // If it's an array of assets, add them to the current collection
                const newAssets = importedData.filter(item => item.siteName && item.hostname);
                if (newAssets.length > 0) {
                  this.assetData = [...this.assetData, ...newAssets];
                  this.addNotification('success', `นำเข้าข้อมูล ${newAssets.length} รายการสำเร็จ`);
                } else {
                  this.addNotification('warning', 'ไม่พบข้อมูลที่ถูกต้องในไฟล์');
                }
              } else if (importedData.assets && Array.isArray(importedData.assets)) {
                // If it's a full backup with assets property
                const newAssets = importedData.assets.filter(item => item.siteName && item.hostname);
                if (newAssets.length > 0) {
                  this.assetData = [...this.assetData, ...newAssets];
                  this.addNotification('success', `นำเข้าข้อมูล ${newAssets.length} รายการสำเร็จ`);
                } else {
                  this.addNotification('warning', 'ไม่พบข้อมูล assets ในไฟล์');
                }
              } else {
                this.addNotification('warning', 'รูปแบบไฟล์ไม่ถูกต้อง');
              }
              
              this.logActivity('นำเข้าข้อมูล', `นำเข้าข้อมูลจากไฟล์ ${file.name}`);
            } catch (error) {
              this.addNotification('error', 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล: รูปแบบไฟล์ไม่ถูกต้อง');
            }
          }
        };
        input.click();
      },
      
      openSettingsModal() {
        // Open settings modal
        this.addNotification('info', 'เปิดหน้าการตั้งค่า');
      },
      
      async createBackup() {
        try {
          this.loading_sources = false;
          const backupData = {
            collection: this.collectionData,
            assets: this.assetData,
            admins: this.collectionAdmin,
            space: this.spaceData,
            backup_date: new Date().toISOString(),
            version: '1.0'
          };
          
          const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backup-${this.collectionData.siteName}-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          
          this.addNotification('success', 'สร้างไฟล์สำรองข้อมูลสำเร็จ');
          this.logActivity('สำรองข้อมูล', 'สร้างไฟล์สำรองข้อมูลคอลเลกชัน');
        } catch (error) {
          this.addNotification('error', 'เกิดข้อผิดพลาดในการสำรองข้อมูล');
        } finally {
          this.loading_sources = true;
        }
      },
      
      async syncData() {
        try {
          this.loading_sources = false;
          await this.getData();
          this.addNotification('success', 'ซิงค์ข้อมูลสำเร็จ');
          this.logActivity('ซิงค์ข้อมูล', 'ซิงค์ข้อมูลจากเซิร์ฟเวอร์');
        } catch (error) {
          this.addNotification('error', 'เกิดข้อผิดพลาดในการซิงค์ข้อมูล');
        } finally {
          this.loading_sources = true;
        }
      },
      
      showAnalytics() {
        const analytics = {
          totalAssets: this.assetData.length,
          totalAdmins: this.collectionAdmin.length,
          spaceUsage: this.spaceData.usedSpace || 0,
          spacePercentage: Math.round(((this.spaceData.usedSpace || 0) / (this.spaceData.totalSpace || 1073741824)) * 100),
          lastUpdate: this.collectionData.updatedAt,
          activeAssets: this.assetData.filter(asset => asset.status === 'active').length,
          inactiveAssets: this.assetData.filter(asset => asset.status !== 'active').length
        };
        
        this.addNotification('info', `Analytics: ${analytics.totalAssets} เว็บไซต์, ${analytics.totalAdmins} ทีมงาน, ใช้พื้นที่ ${analytics.spacePercentage}%`);
      },
      
      applyAdvancedFilters() {
        this.addNotification('success', 'ใช้ตัวกรองขั้นสูงแล้ว');
      },
      
      clearAdvancedFilters() {
        this.addNotification('info', 'ล้างตัวกรองแล้ว');
      },
      
      exportSelectedData() {
        this.addNotification('info', 'การส่งออกข้อมูลจะทำผ่านแท็บเว็บไซต์');
      },
      
      getAssetStatusIcon(status) {
        const icons = {
          active: 'check-circle',
          inactive: 'x-circle',
          pending: 'clock',
          maintenance: 'exclamation-triangle',
          archived: 'archive'
        };
        return icons[status] || 'question-mark-circle';
      },
      
      getAssetStatusColor(status) {
        const colors = {
          active: 'text-green-500',
          inactive: 'text-red-500',
          pending: 'text-yellow-500',
          maintenance: 'text-blue-500',
          archived: 'text-gray-500'
        };
        return colors[status] || 'text-gray-400';
      },
      
      async getData() {
        if(storageManager.get('session','login')) {
          try {
            let item              = this.$route.params.id;
            this.loading_sources  = false;
            
            // ใช้ CollectionService เพื่อดึงข้อมูลพร้อม ownership
            const CollectionService = (await import('./module/function/CollectionService.js')).default;
            const collectionService = new CollectionService(this.hostkey);
            const collectionRes = await collectionService.getCollectionWithOwnership(item);

            if(collectionRes) {
              await this.getDBinfo();
              const adminRes           = await this.getAdminData(collectionRes)
              const spaceRes           = await this.getSpace(collectionRes)
              // console.log("adminRes",adminRes);

              if(adminRes) {

                const assetRes          = await this.getAssetsData()
                // console.log("assetRes",assetRes);

                if(assetRes) {
                  this.collectionAdmin  = adminRes;
                  this.assetData        = assetRes;
                  this.collectionData   = collectionRes;
                  this.spaceData        = spaceRes;
                  this.loading_sources  = true;
                }
              }
            }
            this.loading_sources = true;

          } catch (error) {
            console.log(error)
            this.loading_sources = true;
          }
        }
      },
      async getSpace(item) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources  = false;
            const resAPI          = await fetch("https://gateway.cloudrestfulapi.com/api/space/" + item.spaceId,
            {
              method: 'GET',
              headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
            });

            const spaceRes   = await resAPI.json();
            return spaceRes
          } catch (error) {
            console.log(error)
          }
        }
      },
      async getAdminData(collection) {
        if(storageManager.get('session','login')) {
          try {

            let item  = this.$route.params.id;

            const resAPI   = await fetch("https://gateway.cloudrestfulapi.com/api/user/query", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':collection.key},
                body: JSON.stringify({
                    method: "find",
                    args: [
                    {
                      "collection": {
                        $in: [item]
                      }
                    }
                  ]
                })
            });

            const adminRes   = await resAPI.json();
            // console.log("getAdminData",adminRes);
            
            return adminRes

          } catch (error) {
            console.log(error)
          }
        }
      },
      async getAssetsData() {
        if(storageManager.get('session','login')) {
          try {

            let item  = this.$route.params.id;

            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/hostname/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
              body: JSON.stringify({
                method: 'find',
                args: [
                  {
                    $and: [
                      { siteType: 'asset' },
                      { parent: item }
                    ]
                  }
                ]
              })
            });

            const assetRes   = await resAPI.json();
            
            return assetRes

          } catch (error) {
            console.log(error)
          }
        }
      },
      async getDBinfo() {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources  = false;
            const resAPI          = await fetch("https://gateway.cloudrestfulapi.com/api/db-info/",
            {
              method: 'GET',
              headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
            });

            const collectionRes   = await resAPI.json();

            if(resAPI.status === 200) {
              console.log("dbinfo",collectionRes);
            }
            this.loading_sources = true;

          } catch (error) {
            console.log(error)
          }
        }
      },
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            console.log("Removing admin with id:", id)
            
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/" + id + "/collection", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.hostkey},
              body: JSON.stringify({
                action: "remove",
                element: this.dataItem,
                type: "string",
              })
            });

            if(resAPI.status === 200) {
              this.addNotification('success', 'ลบผู้ดูแลสำเร็จ');
              this.logActivity('ลบผู้ดูแล', `ลบผู้ดูแลออกจากคอลเลกชัน`);
              await this.getData(); // Refresh data
            } else {
              this.addNotification('error', 'เกิดข้อผิดพลาดในการลบผู้ดูแล');
            }

            this.loading_sources = true;

          } catch (error) {
            console.log(error);
            this.addNotification('error', 'เกิดข้อผิดพลาดในการลบผู้ดูแล');
            this.loading_sources = true;
          }
        }
      },
      async refreshRecentActivities() {
        await this.loadRecentActivities();
      },
      async loadRecentActivities() {
        try {
          // Simulate loading recent activities - replace with actual API
          this.recentActivities = [
            {
              id: 1,
              message: 'Collection updated',
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              message: 'New asset added',
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ];
        } catch (error) {
          console.error('Error loading recent activities:', error);
          this.recentActivities = [];
        }
      },

      handleOwnershipUpdated(ownershipData) {
        // Update collection data with new ownership information
        this.collectionData.ownershipInfo = ownershipData;
        this.logActivity('อัพเดทข้อมูลเจ้าของ', 'อัพเดทข้อมูลการติดต่อและเจ้าของ Collection');
      },
      updated() {
        feather.replace();
      },
    },
    async mounted () {
      try {
        await this.getData();
        this.startAutoRefresh();
        this.logActivity('เข้าชมหน้า', 'เข้าชมหน้ารายละเอียดคอลเลกชัน');
        
        // Check for tab parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && this.tabs.some(tab => tab.code === tabParam)) {
          this.activeTab = tabParam;
        }
      } catch (error) {
        console.log(Error);
      }
    },
    beforeUnmount() {
      this.stopAutoRefresh();
    },
    setup() {
      //console.log("Setup");
    },
};
</script>

<template>
  <div class="collection-detail min-h-screen bg-gray-50">
    
    <!-- Loading Overlay -->
    <transition 
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="!loading_sources" class="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-lg p-6 mx-4">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">กำลังโหลดข้อมูล</h3>
              <p class="text-xs text-gray-500">โปรดรอสักครู่...</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <transition-group 
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div v-for="notification in notifications" :key="notification.id"
             :class="{
               'bg-green-50 border-green-200 text-green-800': notification.type === 'success',
               'bg-red-50 border-red-200 text-red-800': notification.type === 'error',
               'bg-yellow-50 border-yellow-200 text-yellow-800': notification.type === 'warning',
               'bg-blue-50 border-blue-200 text-blue-800': notification.type === 'info'
             }"
             class="max-w-sm p-4 border rounded-lg shadow-lg">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">{{ notification.message }}</p>
            <button @click="removeNotification(notification.id)" class="ml-2 text-gray-400 hover:text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="w-full px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <button 
              @click="$router.push('/origin/collection')"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="p-2 bg-indigo-100 rounded-lg">
              <svg class="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Collection Detail</h1>
              <p class="text-sm text-gray-600">จัดการและดูรายละเอียดคอลเลกชัน</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center text-xs text-gray-500">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              System Online
            </div>
            
            <!-- Quick Actions Dropdown -->
            <div class="relative">
              <button 
                @click="showQuickActions = !showQuickActions"
                class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Quick Actions
                <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <div v-if="showQuickActions" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div class="py-1">
                  <button 
                    v-for="action in quickActions" 
                    :key="action.action"
                    @click="handleQuickAction(action.action)"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="action.icon === 'download'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      <path v-else-if="action.icon === 'shield'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      <path v-else-if="action.icon === 'refresh'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      <path v-else-if="action.icon === 'chart-bar'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    {{ action.name }}
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              @click="$router.push(`/origin/package/management/${this.dataItem}`)"
              class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors">
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              จัดการ Package
            </button>
            
            <button
              @click="refreshData"
              :disabled="!loading_sources"
              class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg 
                :class="['mr-2 h-4 w-4', { 'animate-spin': !loading_sources }]" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              รีเฟรช
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Header Section -->
    <div class="bg-white">
      <div class="pl-6 pr-6 pt-6">
        <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <img class="w-16 h-16 rounded-lg object-cover" :src="collectionData.loginLogo" alt="">
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-semibold text-gray-900">{{ this.collectionData.siteName }}</h1>          <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
            <p class="text-gray-500 text-sm">
              สร้างเมื่อ {{ this.dateTime(this.collectionData.updatedAt) }}
            </p>
            <span :class="getStatusColor(collectionData.status)" class="inline-block px-2 py-1 text-xs font-medium rounded-full w-fit">
              {{ collectionData.status || 'active' }}
            </span>
            <p v-if="lastRefresh" class="text-gray-400 text-xs">
              อัพเดทล่าสุด: {{ getRelativeTime(lastRefresh) }}
            </p>
          </div>
          </div>
          
          <!-- Quick Stats -->
          <div class="grid grid-cols-3 gap-4 md:flex md:space-x-6">
            <div class="text-center">
              <div class="text-xl md:text-2xl font-bold text-gray-900">{{ (assetData && assetData.length) || 0 }}</div>
              <div class="text-xs md:text-sm text-gray-500">เว็บไซต์</div>
            </div>
            <div class="text-center">
              <div class="text-xl md:text-2xl font-bold text-gray-900">{{ (collectionAdmin && collectionAdmin.length) || 0 }}</div>
              <div class="text-xs md:text-sm text-gray-500">ทีมงาน</div>
            </div>
            <div class="text-center">
              <div class="text-xl md:text-2xl font-bold text-gray-900">{{ spaceData && spaceData.usedSpace ? formatFileSize(spaceData.usedSpace) : '0 MB' }}</div>
              <div class="text-xs md:text-sm text-gray-500">พื้นที่ใช้</div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="mt-2 md:mt-2">
          <nav class="flex space-x-4 md:space-x-8 border-b border-gray-200 overflow-x-auto">
            <button
              v-for="(tab) in tabs"
              :key="tab.code"
              :class="{ 
                'border-blue-500 text-blue-600': activeTab === tab.code, 
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== tab.code 
              }"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap"
              @click="activeTab = tab.code"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 md:px-6 py-6">
      
      <!-- Detail Tab -->
      <CollectionDetailTab 
        v-if="activeTab === 'detail'" 
        :collectionData="collectionData"
        :assetData="assetData"
        :collectionAdmin="collectionAdmin"
        @edit="openEditModal"
        @delete="confirmDelete"
        @copy="copyToClipboard"
        @refresh="refreshData"
        @export="exportData"
      />

      <!-- Asset Tab -->
      <CollectionAssetTab 
        v-if="activeTab === 'asset'" 
        :assetData="assetData"
        @bulk-action="handleBulkAction"
        @copy-success="showCopySuccessMessage"
      />

      <!-- Admin Tab -->
      <CollectionAdminTab 
        v-if="activeTab === 'admin'" 
        :collectionKey="collectionData.key"
        :collectionAdmin="collectionAdmin"
        :dataItem="dataItem"
        @delete-admin="deleteData"
      />

      <!-- Storage Tab -->
      <CollectionStorageTab 
        v-if="activeTab === 'storage'" 
        :spaceData="spaceData"
        :collectionData="collectionData"
      />

      <!-- Ownership Tab -->
      <OwnershipManager 
        v-if="activeTab === 'ownership'" 
        :collection-id="dataItem"
        :initial-ownership="collectionData.ownershipInfo || {}"
        :hostkey="hostkey"
        :readonly="false"
        @ownership-updated="handleOwnershipUpdated"
        @success="addNotification('success', $event)"
        @error="addNotification('error', $event)"
      />

      <!-- Activity Tab -->
      <section v-if="activeTab === 'activity'" class="animate-fade-in">
        <div class="bg-white rounded-lg border border-gray-200 hover-lift">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">กิจกรรมล่าสุด</h2>
                <p class="text-gray-500 text-sm mt-1">ประวัติการใช้งานและกิจกรรมในระบบ</p>
              </div>
              
              <button 
                @click="activityLog = []"
                class="text-gray-400 hover:text-gray-600 px-3 py-1 text-sm">
                ล้างประวัติ
              </button>
            </div>
          </div>
          
          <div class="border-t border-gray-100">
            <div class="divide-y divide-gray-100">
              <div v-for="activity in activityLog" :key="activity.id" 
                   class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-start space-x-4">
                  <div class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <p class="font-medium text-gray-900">{{ activity.action }}</p>
                      <span class="text-xs text-gray-500">{{ getRelativeTime(activity.timestamp) }}</span>
                    </div>
                    <p class="text-gray-600 text-sm mt-1">{{ activity.details }}</p>
                    <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>โดย {{ activity.user }}</span>
                      <span>{{ dateTime(activity.timestamp) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="activityLog.length === 0" class="p-12 text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีกิจกรรม</h3>
                <p class="text-gray-500">ยังไม่มีประวัติการใช้งาน</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>

  <!-- Edit Modal -->
  <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
    <div class="bg-white rounded-lg max-w-2xl w-full mx-4 animate-fade-in" style="animation-delay: 0.1s">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">แก้ไขข้อมูลคอลเลกชัน</h3>
      </div>
      
      <div class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อเว็บไซต์</label>
          <input 
            v-model="editForm.siteName"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hostname</label>
          <input 
            v-model="editForm.hostname"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">รายละเอียดเพิ่มเติม</label>
          <textarea 
            v-model="editForm.relation"
            rows="4"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </textarea>
        </div>
      </div>
      
      <div class="p-6 border-t border-gray-200 flex justify-end space-x-3">
        <button 
          @click="closeEditModal"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
          ยกเลิก
        </button>
        <button 
          @click="saveChanges"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          บันทึก
        </button>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
    <div class="bg-white rounded-lg max-w-md w-full mx-4 animate-fade-in" style="animation-delay: 0.1s">
      <div class="p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">ยืนยันการลบ</h3>
            <p class="text-gray-500 text-sm mt-1">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
          </div>
        </div>
        
        <p class="text-gray-700 mb-6">
          คุณต้องการลบคอลเลกชัน "<strong>{{ collectionData.siteName }}</strong>" หรือไม่? 
          ข้อมูลทั้งหมดจะถูกลบอย่างถาวร
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
            ยกเลิก
          </button>
          <button 
            @click="executeDelete"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            ลบถาวร
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.animate-spin {
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

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Enhanced button styles */
.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #fecaca;
}

.btn-danger:hover {
  background-color: #fee2e2;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.btn-icon {
  padding: 0.5rem;
  color: #9ca3af;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  color: #4b5563;
  background-color: #f3f4f6;
}

/* Info card styling */
.info-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.info-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
  transform: translateY(-1px);
}

/* Copy button */
.copy-btn {
  color: #9ca3af;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  color: #4b5563;
  background-color: #f3f4f6;
}

/* Enhanced status badge */
.status-badge-enhanced {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1px solid;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-right: 0.5rem;
}

/* Status badge colors */
.status-badge-enhanced.bg-green-100 {
  background-color: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.status-badge-enhanced.bg-green-100 .status-dot {
  background-color: #22c55e;
}

.status-badge-enhanced.bg-yellow-100 {
  background-color: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.status-badge-enhanced.bg-yellow-100 .status-dot {
  background-color: #f59e0b;
}

.status-badge-enhanced.bg-red-100 {
  background-color: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.status-badge-enhanced.bg-red-100 .status-dot {
  background-color: #ef4444;
}

/* Shadow utility */
.shadow-soft {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* Enhanced animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Simple scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 0.25rem;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 0.25rem;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Simple transitions */
button,
.transition-colors {
  transition: all 0.2s ease;
}

/* Hover effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Loading skeleton */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0f0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Status indicators */
.status-active {
  position: relative;
}

.status-active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid {
    gap: 1rem;
  }
  
  .rounded-lg {
    border-radius: 0.5rem;
  }
}

/* Grid responsive */
.grid-responsive {
  display: grid;
}

@media (max-width: 640px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
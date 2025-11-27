<template>
  <FileBrowser 
    v-if="FileBannerOpen" 
    :isWindowsOpen="true" 
    :callbackFunction="'banner'"
    :allowFileType="['jpg','gif','png','jpeg']" 
    @file-browser-trigger="changeFileTrigger" 
    @file-browser-callback="selectFileTrigger"
  />

  <FileBrowser 
    v-if="FileLogoOpen" 
    :isWindowsOpen="true" 
    :callbackFunction="'logo'"
    :allowFileType="['jpg','gif','png','jpeg']" 
    @file-browser-trigger="changeFileTriggerLogo" 
    @file-browser-callback="selectFileTriggerLogo"
  />

  <!-- Header Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','bullseye']" class="text-white text-sm" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">กลุ่มเป้าหมาย</h2>
            <p class="text-xs text-gray-500">{{ getMainTargets.length }} กลุ่มเป้าหมาย</p>
          </div>
        </div>
        <button
          @click="addTarget('main')"
          type="button"
          class="inline-flex items-center rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          เพิ่มกลุ่มเป้าหมาย
        </button>
      </div>
    </div>

    <!-- Navigation Section -->
    <div class="bg-gray-50 border-b border-gray-200 px-4 py-2">
      <button
        @click="$router.push('/lesson/home')"
        type="button"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" class="mr-1.5 text-xs" />
        ย้อนกลับ
      </button>
    </div>

    <!-- Target List -->
    <div class="p-4">
      <div v-if="getMainTargets.length === 0" class="text-center py-8">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <font-awesome-icon :icon="['fas','bullseye']" class="text-gray-400 text-lg" />
        </div>
        <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีกลุ่มเป้าหมาย</h3>
        <p class="text-sm text-gray-500 mb-4">เริ่มต้นสร้างกลุ่มเป้าหมายสำหรับหลักสูตร</p>
        <button
          @click="addTarget('main')"
          type="button"
          class="inline-flex items-center rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          สร้างกลุ่มเป้าหมายแรก
        </button>
      </div>

      <div v-else class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <template v-for="(target) in flattenedTargets">
            <div v-if="target.type === 'main'" :key="target._id" class="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group overflow-hidden">
              <!-- Banner Image -->
              <div class="h-32 bg-gray-100 relative overflow-hidden">
                <div 
                  class="w-full h-full bg-cover bg-center"
                  :style="{ backgroundImage: target.banner ? `url(${target.banner})` : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }"
                ></div>
                <div class="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>

              <div class="p-4 relative">
                <!-- Logo -->
                <div class="absolute -top-8 left-4">
                  <div class="w-16 h-16 bg-white rounded-lg border-2 border-white shadow-lg overflow-hidden">
                    <img 
                      :src="target.logo || 'https://dummyimage.com/400x400/dbdbdb/6e6e6e.jpg&text=++TARGET++'" 
                      alt="Logo" 
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <!-- Target Info -->
                <div class="pt-10">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <h3 class="text-base font-semibold text-gray-900 mb-1">
                        {{ getMainTargetIndex(target) }}. {{ target.name }}
                      </h3>
                      <p class="text-xs text-gray-500 mb-1">{{ target.code }}</p>
                      <div class="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block">
                        <font-awesome-icon :icon="['fas','bullseye']" class="mr-1" />
                        กลุ่มเป้าหมาย
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-end pt-3 border-t border-gray-100 space-x-1">
                    <button 
                      @click="openRenameDialog(target)" 
                      class="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-all duration-200"
                    >
                      <font-awesome-icon :icon="['fas','edit']" class="mr-1 text-xs" />
                      แก้ไข
                    </button>
                    <button 
                      @click="removeMainTargetConfirmation(target)" 
                      class="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200"
                    >
                      <font-awesome-icon :icon="['fas','trash']" class="mr-1 text-xs" />
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- Modern Edit Dialog -->
  <Transition
    enter-active-class="modal-enter-active"
    leave-active-class="modal-leave-active"
    enter-from-class="modal-enter-from"
    leave-to-class="modal-leave-to"
  >
    <div v-if="showRenameDialog" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" @click="closeRenameDialog"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
          <!-- Banner Section -->
          <div class="h-32 bg-gray-100 relative overflow-hidden rounded-t-xl">
            <div 
              class="w-full h-full bg-cover bg-center"
              :style="{ backgroundImage: selectedTarget?.banner ? `url(${selectedTarget.banner})` : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }"
            ></div>
            <div class="absolute inset-0 bg-black bg-opacity-20"></div>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <button 
                @click="OpenFileBrowser"
                class="bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200"
              >
                <font-awesome-icon :icon="['fas','image']" class="mr-1.5" />
                เปลี่ยนรูปปก
              </button>
            </div>
          </div>

          <!-- Logo Section -->
          <div class="absolute top-20 left-6">
            <div class="w-16 h-16 bg-white rounded-lg border-2 border-white shadow-lg overflow-hidden relative group">
              <img 
                :src="selectedTarget?.logo || 'https://dummyimage.com/400x400/dbdbdb/6e6e6e.jpg&text=++TARGET++'" 
                alt="Logo" 
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
                <button 
                  @click="OpenFileBrowserLogo"
                  class="text-white text-xs"
                >
                  <font-awesome-icon :icon="['fas','image']" />
                </button>
              </div>
            </div>
          </div>

          <!-- Content Section -->
          <div class="p-5 pt-12">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <font-awesome-icon :icon="['fas','edit']" class="text-orange-600 text-sm" />
                </div>
                <div>
                  <h3 class="text-base font-semibold text-gray-900">แก้ไขกลุ่มเป้าหมาย</h3>
                  <p class="text-xs text-gray-500">จัดการข้อมูลกลุ่มเป้าหมาย</p>
                </div>
              </div>
              <button @click="closeRenameDialog" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200">
                <font-awesome-icon :icon="['fas','times']" class="text-sm" />
              </button>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อกลุ่มเป้าหมาย</label>
                <input 
                  v-model="selectedTarget.name" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm"
                  placeholder="ระบุชื่อกลุ่มเป้าหมาย"
                />
              </div>
              
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">รหัสกลุ่มเป้าหมาย</label>
                <input 
                  v-model="selectedTarget.code" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm"
                  placeholder="ระบุรหัสกลุ่มเป้าหมาย"
                />
              </div>

              <!-- Hidden inputs for file uploads -->
              <input v-model="selectedTarget.logo" type="hidden" />
              <input v-model="selectedTarget.banner" type="hidden" />
            </div>

            <div class="flex justify-end space-x-2 mt-5">
              <button 
                @click="closeRenameDialog" 
                class="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button 
                @click="renameTarget(selectedTarget)" 
                class="px-3 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-all duration-200"
              >
                <font-awesome-icon :icon="['fas','save']" class="mr-1" />
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modern Confirmation Dialog -->
  <Transition
    enter-active-class="modal-enter-active"
    leave-active-class="modal-leave-active"
    enter-from-class="modal-enter-from"
    leave-to-class="modal-leave-to"
  >
    <div v-if="showConfirmationPopup" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" @click="cancelRemoveMainTarget"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas','exclamation-triangle']" class="text-red-600 text-sm" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900">ยืนยันการลบ</h3>
                <p class="text-xs text-gray-500">กลุ่มเป้าหมาย</p>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-600">คุณแน่ใจหรือไม่ที่จะลบกลุ่มเป้าหมายนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
          </div>

          <div class="flex justify-end space-x-2">
            <button 
              @click="cancelRemoveMainTarget" 
              class="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              ยกเลิก
            </button>
            <button 
              @click="confirmRemoveMainTarget" 
              class="px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import storageManager from '@/plugins/storage';
import FileBrowser from '@/interface/modal/FileBrowser.vue';

export default {
  name: 'TargetList',
  data() {
    return {
      session: storageManager.get('session'),
      configs: storageManager.get('configs'),
      targets: [],
      uniqueIdCounter: 5, // Initial value for the unique ID counter
      showRenameDialog: false,
      selectedTarget: null,
      showMoveDialog: false,
      selectedTargetParent: null,
      FileBannerOpen: false,
      FileLogoOpen: false,
      showConfirmationPopup: false,
    };
  },
  components: {
    FileBrowser
  },
  computed: {
    flattenedTargets() {
      return this.flattenTargets(this.targets);
    },
    getMainTargets() {
      return this.targets.filter(target => target.type === 'main');
    },
  },
  async mounted() {
    try {
      await this.getTargetData();
    } catch (error) {
      console.log(Error);
    }
  },
  methods: {
    // Update Banner
    OpenFileBrowser() {
      this.FileBannerOpen = true;
    },
    changeFileTrigger(payload) {
      this.FileBannerOpen = payload;
    },
    selectFileTrigger(payload) {
      if (payload != undefined) {
        this.updateBanner(payload.file);
      }
    },
    async updateBanner(banner) {
      try {
        const target = this.selectedTarget;

        const updatedTarget = {
          ...target,
          banner: banner,
        };
        delete updatedTarget._id;

        const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/target/${target._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            data: updatedTarget,
            options: {},
          }),
        });

        if (resAPI.ok) {
          this.selectedTarget.banner = banner;
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'success',
            title: 'แก้ไขรูปหน้าปก',
            text: 'แก้ไขรูปหน้าปก สำเร็จแล้ว',
          });
        }
      } catch (error) {
        console.log(error);
      }
    },
    // Update Logo
    OpenFileBrowserLogo() {
      this.FileLogoOpen = true;
    },
    changeFileTriggerLogo(payload) {
      this.FileLogoOpen = payload;
    },
    selectFileTriggerLogo(payload) {
      if (payload != undefined) {
        this.updateLogo(payload.file);
      }
    },
    async updateLogo(logo) {
      try {
        const target = this.selectedTarget;

        const updatedTarget = {
          ...target,
          logo: logo,
        };
        delete updatedTarget._id;

        const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/target/${target._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            data: updatedTarget,
            options: {},
          }),
        });

        if (resAPI.ok) {
          this.selectedTarget.logo = logo;
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'success',
            title: 'แก้ไขรูปหน้าปก',
            text: 'แก้ไขรูปหน้าปก สำเร็จแล้ว',
          });
        }
      } catch (error) {
        console.log(error);
      }
    },
    async getTargetData() {
      const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/target/query", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
        body: JSON.stringify({
          method: 'find',
          args: [
            {
              $and: [
                { unit: this.session.current._id }
              ]
            }
          ],
          paging: { page: 1, limit: 200 }
        })
      });
      if (resAPI.ok) {
        const finalRes = await resAPI.json();
        console.log("finalRes", finalRes);
        this.targets = finalRes.data;
      } else {
        // Handle error condition
      }
    },
    async addTarget(mode, target) {
      try {
        const requestData = {
          unit: this.session.current._id,
          name: 'กลุ่มเป้าหมายใหม่',
          code: 'รหัสกลุ่มเป้าหมาย',
          type: 'main',
          order: 0
        };

        if (mode === "sub") {
          requestData.type = 'sub';
          requestData.parent = target._id;
        }

        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/target/", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            data: requestData,
            options: {}
          })
        });

        if (resAPI.ok) {
          await this.getTargetData();
          const finalRes = await resAPI.json();
          console.log("finalRes", finalRes);
        } else {
          // Handle error condition
        }
      } catch (error) {
        console.error(error);
      }
    },
    async updateTarget(target) {
      const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/target/" + target._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
        body: JSON.stringify({
          data: {
            "name": target.name,
            "code": target.code,
            "order": target.order,
          },
          options: {}
        })
      });
      if (resAPI.ok) {
        await this.getTargetData();
        const finalRes = await resAPI.json();
        console.log("finalRes", finalRes);
      } else {
        // Handle error condition
      }
    },
    async deleteTarget(target) {
      const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/target/" + target._id, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
      });
      if (resAPI.ok) {
        await this.getTargetData();
        const finalRes = await resAPI.json();
        console.log("finalRes", finalRes);
      } else {
        // Handle error condition
      }
    },
    getMainTargetIndex(target) {
      const mainTargets = this.flattenedTargets.filter(inst => inst.type === 'main');
      return mainTargets.findIndex(inst => inst._id === target._id) + 1;
    },
    flattenTargets(targets) {
      return targets.reduce((result, target) => {
        result.push(target);
        return result;
      }, []);
    },
    async removeMainTarget(target) {
      try {
        const index = this.targets.findIndex(i => i._id === target._id && i.type === 'main');
        if (index !== -1) {
          this.targets.splice(index, 1);
          await this.deleteTarget(target);
        }
      } catch (error) {
        console.error(error);
      }
    },
    openRenameDialog(target) {
      this.selectedTarget = target;
      this.showRenameDialog = true;
    },
    closeRenameDialog() {
      this.showRenameDialog = false;
      this.selectedTarget = null;
    },
    async renameTarget(target) {
      try {
        const newName = target.name.trim();
        const newCode = target.code.trim();

        if (newName !== '') {
          target.name = newName;
        }
        if (newCode !== '') {
          target.code = newCode;
        }
        await this.updateTarget(target);
        this.closeRenameDialog();
      } catch (error) {
        console.error(error);
      }
    },
    async removeMainTargetConfirmation(target) {
      this.selectedTarget = target;
      this.showConfirmationPopup = true;
    },
    async cancelRemoveMainTarget() {
      this.showConfirmationPopup = false;
    },
    async confirmRemoveMainTarget() {
      await this.removeMainTarget(this.selectedTarget);
      this.showConfirmationPopup = false;
    },
  }
};
</script>

<style scoped>
/* Modern Design Enhancements */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

/* Card Hover Effects */
.group:hover .group-hover\:bg-orange-100 {
  background-color: #fed7aa;
}

/* Button Hover Effects */
button {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

/* Input Focus States */
input:focus,
textarea:focus,
select:focus {
  @apply ring-2 ring-orange-500 ring-offset-2;
}

/* Smooth Animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Target Card Enhancements */
.target-card {
  @apply bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden;
}

.target-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Banner Image */
.banner-image {
  @apply h-32 bg-gray-100 relative overflow-hidden;
}

.banner-overlay {
  @apply absolute inset-0 bg-black bg-opacity-20;
}

/* Logo Container */
.logo-container {
  @apply w-16 h-16 bg-white rounded-lg border-2 border-white shadow-lg overflow-hidden;
}

/* Icon Containers */
.icon-container {
  @apply flex items-center justify-center rounded-lg transition-all duration-200;
}

.icon-container:hover {
  transform: scale(1.05);
}

/* Action Buttons */
.action-btn {
  @apply inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-all duration-200;
}

.action-btn-primary {
  @apply action-btn text-orange-600 hover:text-orange-700 hover:bg-orange-50;
}

.action-btn-secondary {
  @apply action-btn text-gray-600 hover:text-gray-700 hover:bg-gray-50;
}

.action-btn-danger {
  @apply action-btn text-red-600 hover:text-red-700 hover:bg-red-50;
}

/* Icon Buttons */
.icon-btn {
  @apply p-1 text-gray-400 hover:bg-gray-100 rounded transition-all duration-200;
}

.icon-btn:hover {
  transform: scale(1.1);
}

.icon-btn-orange:hover {
  @apply text-orange-600 bg-orange-50;
}

.icon-btn-red:hover {
  @apply text-red-600 bg-red-50;
}

/* Form Elements */
.form-input {
  @apply w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm;
}

.form-textarea {
  @apply form-input resize-none;
}

/* Modal Backdrop */
.modal-backdrop {
  @apply fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300;
}

/* Modal Container */
.modal-container {
  @apply relative bg-white rounded-xl shadow-xl max-w-lg w-full;
}

/* Button Variants */
.btn-primary {
  @apply px-3 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-all duration-200;
}

.btn-secondary {
  @apply px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200;
}

.btn-danger {
  @apply px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200;
}

/* Empty State */
.empty-state {
  @apply text-center py-8;
}

.empty-state-icon {
  @apply w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3;
}

.empty-state-title {
  @apply text-base font-medium text-gray-900 mb-2;
}

.empty-state-description {
  @apply text-sm text-gray-500 mb-4;
}

/* Loading States */
.loading-spinner {
  @apply inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin;
}

/* Target Badge */
.target-badge {
  @apply text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block;
}

/* Banner Edit Overlay */
.banner-edit-overlay {
  @apply absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300;
}

.banner-edit-btn {
  @apply bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200;
}

/* Logo Edit Overlay */
.logo-edit-overlay {
  @apply absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    @apply mx-4;
  }
  
  .grid {
    @apply grid-cols-1;
  }
  
  .action-btn {
    @apply px-2 py-1 text-xs;
  }
  
  .banner-image {
    @apply h-24;
  }
  
  .logo-container {
    @apply w-12 h-12;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .dark-mode {
    @apply bg-gray-900 text-white;
  }
  
  .dark-mode .modal-container {
    @apply bg-gray-800 border-gray-700;
  }
  
  .dark-mode .form-input {
    @apply bg-gray-700 border-gray-600 text-white;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus States */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500;
}

/* Animation Keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Utility Classes */
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out;
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .high-contrast {
    @apply border-2 border-black;
  }
}

/* Target Specific Styles */
.target-header {
  @apply px-4 py-3 border-b border-gray-200;
}

.target-nav {
  @apply bg-gray-50 border-b border-gray-200 px-4 py-2;
}

.target-content {
  @apply p-4;
}

.target-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3;
}

.target-info {
  @apply pt-10;
}

.target-actions {
  @apply flex items-center justify-end pt-3 border-t border-gray-100 space-x-1;
}

/* Modal Edit Specific */
.modal-banner {
  @apply h-32 bg-gray-100 relative overflow-hidden rounded-t-xl;
}

.modal-logo {
  @apply absolute top-20 left-6;
}

.modal-content {
  @apply p-5 pt-12;
}

.modal-header {
  @apply flex items-center justify-between mb-4;
}

.modal-form {
  @apply space-y-3;
}

.modal-actions {
  @apply flex justify-end space-x-2 mt-5;
}

/* Gradient Backgrounds */
.gradient-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

/* Shadow Utilities */
.shadow-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.shadow-card-hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-modal {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Border Utilities */
.border-light {
  border-color: #f1f5f9;
}

.border-medium {
  border-color: #e2e8f0;
}

/* Text Utilities */
.text-muted {
  color: #64748b;
}

.text-emphasis {
  color: #1e293b;
}

/* Spacing Utilities */
.space-compact > * + * {
  margin-top: 0.5rem;
}

.space-comfortable > * + * {
  margin-top: 1rem;
}

/* Interactive States */
.interactive:hover {
  transform: translateY(-1px);
}

.interactive:active {
  transform: translateY(0);
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus Visible */
.focus-visible:focus-visible {
  outline: 2px solid #f97316;
  outline-offset: 2px;
}

/* Target Card Layout */
.target-card-header {
  @apply h-32 bg-gray-100 relative overflow-hidden;
}

.target-card-body {
  @apply p-4 relative;
}

.target-card-logo {
  @apply absolute -top-8 left-4;
}

.target-card-info {
  @apply pt-10;
}

.target-card-actions {
  @apply flex items-center justify-end pt-3 border-t border-gray-100 space-x-1;
}

/* Confirmation Dialog */
.confirmation-dialog {
  @apply relative bg-white rounded-xl shadow-xl max-w-md w-full p-5;
}

.confirmation-header {
  @apply flex items-center justify-between mb-4;
}

.confirmation-content {
  @apply mb-4;
}

.confirmation-actions {
  @apply flex justify-end space-x-2;
}

/* Orange Theme Variants */
.bg-orange-gradient {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.text-orange-primary {
  color: #ea580c;
}

.bg-orange-primary {
  background-color: #ea580c;
}

.border-orange-primary {
  border-color: #ea580c;
}

/* Hover Effects */
.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* Transition Groups */
.transition-fast {
  transition-duration: 150ms;
}

.transition-normal {
  transition-duration: 200ms;
}

.transition-slow {
  transition-duration: 300ms;
}

/* Bullseye Icon Specific */
.bullseye-icon {
  @apply text-orange-600;
}

.bullseye-badge {
  @apply text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-flex items-center;
}

/* Target Specific Colors */
.target-primary {
  color: #f97316;
}

.target-secondary {
  color: #ea580c;
}

.bg-target-light {
  background-color: #fff7ed;
}

.border-target {
  border-color: #f97316;
}
</style>

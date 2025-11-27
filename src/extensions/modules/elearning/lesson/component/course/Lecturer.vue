<template>
  <div v-if="FileBannerOpen" class="fixed inset-0 z-[9999]">
    <FileBrowser 
      :isWindowsOpen="true" 
      :callbackFunction="'banner'"
      :allowFileType="['jpg','gif','png','jpeg']" 
      @file-browser-trigger="changeFileTrigger" 
      @file-browser-callback="selectFileTrigger"
    />
  </div>

  <div v-if="FileLogoOpen" class="fixed inset-0 z-[9999]">
    <FileBrowser 
      :isWindowsOpen="true" 
      :callbackFunction="'logo'"
      :allowFileType="['jpg','gif','png','jpeg']" 
      @file-browser-trigger="changeFileTriggerLogo" 
      @file-browser-callback="selectFileTriggerLogo"
    />
  </div>

  <!-- Header Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','chalkboard-teacher']" class="text-white text-sm" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">วิทยากร</h2>
            <p class="text-xs text-gray-500">{{ getMainLecturers.length }} วิทยากร</p>
          </div>
        </div>
        <button
          @click="addLecturer('main')"
          type="button"
          class="inline-flex items-center rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          เพิ่มวิทยากร
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

    <!-- Lecturer List -->
    <div class="p-4">
      <div v-if="getMainLecturers.length === 0" class="text-center py-8">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <font-awesome-icon :icon="['fas','chalkboard-teacher']" class="text-gray-400 text-lg" />
        </div>
        <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีวิทยากร</h3>
        <p class="text-sm text-gray-500 mb-4">เริ่มต้นเพิ่มวิทยากรสำหรับการสอน</p>
        <button
          @click="addLecturer('main')"
          type="button"
          class="inline-flex items-center rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          เพิ่มวิทยากรคนแรก
        </button>
      </div>

      <div v-else class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <template v-for="(lecturer) in flattenedLecturers">
            <div v-if="lecturer.type === 'main'" :key="lecturer._id" class="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group overflow-hidden">
              <!-- Banner Image -->
              <div class="h-32 bg-gray-100 relative overflow-hidden">
                <div 
                  class="w-full h-full bg-cover bg-center"
                  :style="{ backgroundImage: lecturer.banner ? `url(${lecturer.banner})` : 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }"
                ></div>
                <div class="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>

              <div class="p-4 relative">
                <!-- Avatar -->
                <div class="absolute -top-8 left-4">
                  <div class="w-16 h-16 bg-white rounded-full border-2 border-white shadow-lg overflow-hidden">
                    <img 
                      :src="lecturer.logo || 'https://dummyimage.com/400x400/dbdbdb/6e6e6e.jpg&text=++AVATAR++'" 
                      alt="Avatar" 
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <!-- Lecturer Info -->
                <div class="pt-10">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <h3 class="text-base font-semibold text-gray-900 mb-1">
                        {{ getMainLecturerIndex(lecturer) }}. {{ lecturer.name }}
                      </h3>
                      <p class="text-xs text-gray-500 mb-1">{{ lecturer.code }}</p>
                      <p class="text-sm text-gray-600 line-clamp-2 mb-2">{{ lecturer.description }}</p>
                      <div v-if="lecturer.education" class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">
                        การศึกษา: {{ lecturer.education }}
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-end pt-3 border-t border-gray-100 space-x-1">
                    <button 
                      @click="openRenameDialog(lecturer)" 
                      class="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200"
                    >
                      <font-awesome-icon :icon="['fas','edit']" class="mr-1 text-xs" />
                      แก้ไข
                    </button>
                    <button 
                      @click="removeMainLecturerConfirmation(lecturer)" 
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
              :style="{ backgroundImage: selectedLecturer?.banner ? `url(${selectedLecturer.banner})` : 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }"
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

          <!-- Avatar Section -->
          <div class="absolute top-20 left-6">
            <div class="w-16 h-16 bg-white rounded-full border-2 border-white shadow-lg overflow-hidden relative group">
              <img 
                :src="selectedLecturer?.logo || 'https://dummyimage.com/400x400/dbdbdb/6e6e6e.jpg&text=++AVATAR++'" 
                alt="Avatar" 
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-full">
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
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <font-awesome-icon :icon="['fas','edit']" class="text-green-600 text-sm" />
                </div>
                <div>
                  <h3 class="text-base font-semibold text-gray-900">แก้ไขข้อมูลวิทยากร</h3>
                  <p class="text-xs text-gray-500">จัดการข้อมูลและประวัติ</p>
                </div>
              </div>
              <button @click="closeRenameDialog" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200">
                <font-awesome-icon :icon="['fas','times']" class="text-sm" />
              </button>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อวิทยากร</label>
                <input 
                  v-model="selectedLecturer.name" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm"
                  placeholder="ระบุชื่อวิทยากร"
                />
              </div>
              
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">รหัสวิทยากร</label>
                <input 
                  v-model="selectedLecturer.code" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm"
                  placeholder="ระบุรหัสวิทยากร"
                />
              </div>
              
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">ประวัติการทำงาน</label>
                <textarea 
                  v-model="selectedLecturer.description" 
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none text-sm"
                  placeholder="ระบุประวัติการทำงาน"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">ประวัติการศึกษา</label>
                <textarea 
                  v-model="selectedLecturer.education" 
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none text-sm"
                  placeholder="ระบุประวัติการศึกษา"
                ></textarea>
              </div>

              <!-- Hidden inputs for file uploads -->
              <input v-model="selectedLecturer.logo" type="hidden" />
              <input v-model="selectedLecturer.banner" type="hidden" />
            </div>

            <div class="flex justify-end space-x-2 mt-5">
              <button 
                @click="closeRenameDialog" 
                class="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button 
                @click="renameLecturer(selectedLecturer)" 
                class="px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200"
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
        <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" @click="cancelRemoveMainLecturer"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas','exclamation-triangle']" class="text-red-600 text-sm" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900">ยืนยันการลบ</h3>
                <p class="text-xs text-gray-500">วิทยากร</p>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-600">คุณแน่ใจหรือไม่ที่จะลบวิทยากรนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
          </div>

          <div class="flex justify-end space-x-2">
            <button 
              @click="cancelRemoveMainLecturer" 
              class="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              ยกเลิก
            </button>
            <button 
              @click="confirmRemoveMainLecturer" 
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
  name: 'LecturerList',
  data() {
    return {
      session: storageManager.get('session'),
      configs: storageManager.get('configs'),
      lecturers: [],
      uniqueIdCounter: 5, // Initial value for the unique ID counter
      showRenameDialog: false,
      selectedLecturer: null,
      showMoveDialog: false,
      selectedLecturerParent: null,
      FileBannerOpen: false,
      FileLogoOpen: false,
      showConfirmationPopup: false,
    };
  },
  components: {
    FileBrowser
  },
  computed: {
    flattenedLecturers() {
      return this.flattenLecturers(this.lecturers);
    },
    getMainLecturers() {
      return this.lecturers.filter(lecturer => lecturer.type === 'main');
    },
  },
  async mounted() {
    try {
      await this.getLecturerData();
    } catch (error) {
      console.log(Error);
    }
  },
  methods: {
    // Update Banner
    OpenFileBrowser() {
      // ปิด modal แล้วค่อยเปิด FileBrowser
      this.showRenameDialog = false;
      this.$nextTick(() => {
        this.FileBannerOpen = true;
      });
    },
    changeFileTrigger(payload) {
      this.FileBannerOpen = payload;
    },
    selectFileTrigger(payload) {
      if (payload != undefined) {
        this.updateBanner(payload.file);
      }
      // เปิด modal กลับมาหลังจากเลือกไฟล์เสร็จ
      this.showRenameDialog = true;
    },
    async updateBanner(banner) {
      try {
        const lecturer = this.selectedLecturer;

        const updatedLecturer = {
          ...lecturer,
          banner: banner,
        };
        delete updatedLecturer._id;

        const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/lecturer/${lecturer._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            data: updatedLecturer,
            options: {},
          }),
        });

        if (resAPI.ok) {
          this.selectedLecturer.banner = banner;
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
      // ปิด modal แล้วค่อยเปิด FileBrowser
      this.showRenameDialog = false;
      this.$nextTick(() => {
        this.FileLogoOpen = true;
      });
    },
    changeFileTriggerLogo(payload) {
      this.FileLogoOpen = payload;
    },
    selectFileTriggerLogo(payload) {
      if (payload != undefined) {
        this.updateLogo(payload.file);
      }
      // เปิด modal กลับมาหลังจากเลือกไฟล์เสร็จ
      this.showRenameDialog = true;
    },
    async updateLogo(logo) {
      try {
        const lecturer = this.selectedLecturer;

        const updatedLecturer = {
          ...lecturer,
          logo: logo,
        };
        delete updatedLecturer._id;

        const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/lecturer/${lecturer._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            data: updatedLecturer,
            options: {},
          }),
        });

        if (resAPI.ok) {
          this.selectedLecturer.logo = logo;
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
    async getLecturerData() {
      const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/lecturer/query", {
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
        this.lecturers = finalRes.data;
      } else {
        // Handle error condition
      }
    },
    async addLecturer(mode, lecturer) {
      try {
        const requestData = {
          unit: this.session.current._id,
          name: 'New Lecturer',
          code: 'lecturer-code',
          description: 'Description for New Lecturer',
          education: 'Education for New Lecturer',
          type: 'main',
          order: 0
        };

        if (mode === "sub") {
          requestData.type = 'sub';
          requestData.parent = lecturer._id;
        }

        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/lecturer/", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            data: requestData,
            options: {}
          })
        });

        if (resAPI.ok) {
          await this.getLecturerData();
          const finalRes = await resAPI.json();
          console.log("finalRes", finalRes);
        } else {
          // Handle error condition
        }
      } catch (error) {
        console.error(error);
      }
    },
    async updateLecturer(lecturer) {
      const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/lecturer/" + lecturer._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
        body: JSON.stringify({
          data: {
            "name": lecturer.name,
            "code": lecturer.code,
            "description": lecturer.description,
            "education": lecturer.education,
            "order": lecturer.order,
          },
          options: {}
        })
      });
      if (resAPI.ok) {
        await this.getLecturerData();
        const finalRes = await resAPI.json();
        console.log("finalRes", finalRes);
      } else {
        // Handle error condition
      }
    },
    async deleteLecturer(lecturer) {
      const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/lecturer/" + lecturer._id, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
      });
      if (resAPI.ok) {
        await this.getLecturerData();
        const finalRes = await resAPI.json();
        console.log("finalRes", finalRes);
      } else {
        // Handle error condition
      }
    },
    getMainLecturerIndex(lecturer) {
      const mainLecturers = this.flattenedLecturers.filter(inst => inst.type === 'main');
      return mainLecturers.findIndex(inst => inst._id === lecturer._id) + 1;
    },
    flattenLecturers(lecturers) {
      return lecturers.reduce((result, lecturer) => {
        result.push(lecturer);
        return result;
      }, []);
    },
    async removeMainLecturer(lecturer) {
      try {
        const index = this.lecturers.findIndex(i => i._id === lecturer._id && i.type === 'main');
        if (index !== -1) {
          this.lecturers.splice(index, 1);
          await this.deleteLecturer(lecturer);
        }
      } catch (error) {
        console.error(error);
      }
    },
    openRenameDialog(lecturer) {
      this.selectedLecturer = lecturer;
      this.showRenameDialog = true;
    },
    closeRenameDialog() {
      this.showRenameDialog = false;
      this.selectedLecturer = null;
    },
    async renameLecturer(lecturer) {
      try {
        const newName = lecturer.name.trim();
        const newCode = lecturer.code.trim();
        const newDescription = lecturer.description.trim();
        const newEducation = lecturer.education.trim();

        if (newName !== '') {
          lecturer.name = newName;
        }
        if (newCode !== '') {
          lecturer.code = newCode;
        }
        if (newDescription !== '') {
          lecturer.description = newDescription;
        }
        if (newEducation !== '') {
          lecturer.education = newEducation;
        }
        await this.updateLecturer(lecturer);
        this.closeRenameDialog();
      } catch (error) {
        console.error(error);
      }
    },
    openMoveDialog(lecturer) {
      this.selectedLecturer = lecturer;
      this.selectedLecturerParent = lecturer.parent;
      this.showMoveDialog = true;
    },
    closeMoveDialog() {
      this.showMoveDialog = false;
      this.selectedLecturer = null;
      this.selectedLecturerParent = null;
    },
    updateSelectedLecturerParent() {
      this.selectedLecturer.parent = this.selectedLecturerParent;
      this.closeMoveDialog();
    },
    async removeMainLecturerConfirmation(lecturer) {
      this.selectedLecturer = lecturer;
      this.showConfirmationPopup = true;
    },
    async cancelRemoveMainLecturer() {
      this.showConfirmationPopup = false;
      this.selectedLecturer = null;
    },
    async confirmRemoveMainLecturer() {
      try {
        await this.removeMainLecturer(this.selectedLecturer);
        this.showConfirmationPopup = false;
      } catch (error) {
        console.error(error);
      }
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
.group:hover .group-hover\:bg-green-100 {
  background-color: #dcfce7;
}

/* Button Hover Effects */
button {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

/* Input Focus States */
input:focus,
textarea:focus,
select:focus {
  @apply ring-2 ring-green-500 ring-offset-2;
}

/* Smooth Animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Lecturer Card Enhancements */
.lecturer-card {
  @apply bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden;
}

.lecturer-card:hover {
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

/* Avatar Container */
.avatar-container {
  @apply w-16 h-16 bg-white rounded-full border-2 border-white shadow-lg overflow-hidden;
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
  @apply action-btn text-green-600 hover:text-green-700 hover:bg-green-50;
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

.icon-btn-green:hover {
  @apply text-green-600 bg-green-50;
}

.icon-btn-red:hover {
  @apply text-red-600 bg-red-50;
}

/* Form Elements */
.form-input {
  @apply w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm;
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
  @apply px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200;
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

/* Line Clamp Utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Education Badge */
.education-badge {
  @apply text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block;
}

/* Banner Edit Overlay */
.banner-edit-overlay {
  @apply absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300;
}

.banner-edit-btn {
  @apply bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200;
}

/* Avatar Edit Overlay */
.avatar-edit-overlay {
  @apply absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-full;
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
  
  .avatar-container {
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
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500;
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

/* Lecturer Specific Styles */
.lecturer-header {
  @apply px-4 py-3 border-b border-gray-200;
}

.lecturer-nav {
  @apply bg-gray-50 border-b border-gray-200 px-4 py-2;
}

.lecturer-content {
  @apply p-4;
}

.lecturer-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3;
}

.lecturer-info {
  @apply pt-10;
}

.lecturer-actions {
  @apply flex items-center justify-end pt-3 border-t border-gray-100 space-x-1;
}

/* Modal Edit Specific */
.modal-banner {
  @apply h-32 bg-gray-100 relative overflow-hidden rounded-t-xl;
}

.modal-avatar {
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
.gradient-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

/* Avatar Specific Styles */
.avatar-round {
  @apply rounded-full;
}

.avatar-square {
  @apply rounded-lg;
}

/* Education Info */
.education-info {
  @apply text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block;
}

/* Lecturer Card Layout */
.lecturer-card-header {
  @apply h-32 bg-gray-100 relative overflow-hidden;
}

.lecturer-card-body {
  @apply p-4 relative;
}

.lecturer-card-avatar {
  @apply absolute -top-8 left-4;
}

.lecturer-card-info {
  @apply pt-10;
}

.lecturer-card-actions {
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

/* Green Theme Variants */
.bg-green-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.text-green-primary {
  color: #059669;
}

.bg-green-primary {
  background-color: #059669;
}

.border-green-primary {
  border-color: #059669;
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
</style>
  
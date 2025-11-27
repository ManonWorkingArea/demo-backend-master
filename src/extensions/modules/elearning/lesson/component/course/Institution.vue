<template>
    <FileBrowser 
    v-if="FileBannerOpen" 
    :isWindowsOpen="true" 
    :callbackFunction="'banner'"
    :allowFileType="['jpg','gif','png','jpeg']" 
    @file-browser-trigger="changeFileTrigger" 
    @file-browser-callback="selectFileTrigger"/>

    <FileBrowser 
    v-if="FileLogoOpen" 
    :isWindowsOpen="true" 
    :callbackFunction="'logo'"
    :allowFileType="['jpg','gif','png','jpeg']" 
    @file-browser-trigger="changeFileTriggerLogo" 
    @file-browser-callback="selectFileTriggerLogo"/>

    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-4 py-3 border-b border-gray-200">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <font-awesome-icon :icon="['fas','university']" class="text-white text-sm" />
                    </div>
                    <div>
                        <h2 class="text-base font-semibold text-gray-900">สถาบัน</h2>
                        <p class="text-xs text-gray-500">{{ getMainInstitutions.length }} สถาบัน</p>
                    </div>
                </div>
                <button
                    @click="addInstitution('main')"
                    type="button"
                    class="inline-flex items-center rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
                >
                    <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
                    เพิ่มสถาบัน
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

        <!-- Institution List -->
        <div class="p-4">
            <div v-if="getMainInstitutions.length === 0" class="text-center py-8">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <font-awesome-icon :icon="['fas','university']" class="text-gray-400 text-lg" />
                </div>
                <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีสถาบัน</h3>
                <p class="text-sm text-gray-500 mb-4">เริ่มต้นสร้างสถาบันสำหรับจัดการหลักสูตร</p>
                <button
                    @click="addInstitution('main')"
                    type="button"
                    class="inline-flex items-center rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
                >
                    <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
                    สร้างสถาบันแรก
                </button>
            </div>

            <div v-else class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <template v-for="(institution) in flattenedInstitutions">
                        <div v-if="institution.type === 'main'" :key="institution._id" class="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group overflow-hidden">
                            <!-- Banner Image -->
                            <div class="h-32 bg-gray-100 relative overflow-hidden">
                                <div 
                                    class="w-full h-full bg-cover bg-center"
                                    :style="{ backgroundImage: institution.banner ? `url(${institution.banner})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
                                ></div>
                                <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                            </div>

                            <div class="p-4 relative">
                                <!-- Logo -->
                                <div class="absolute -top-8 left-4">
                                    <div class="w-16 h-16 bg-white rounded-lg border-2 border-white shadow-lg overflow-hidden">
                                        <img 
                                            :src="institution.logo || 'https://dummyimage.com/400x400/dbdbdb/6e6e6e.jpg&text=++LOGO++'" 
                                            alt="Logo" 
                                            class="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                <!-- Institution Info -->
                                <div class="pt-10">
                                    <div class="flex items-start justify-between mb-2">
                                        <div class="flex-1">
                                            <h3 class="text-base font-semibold text-gray-900 mb-1">
                                                {{ getMainInstitutionIndex(institution) }}. {{ institution.name }}
                                            </h3>
                                            <p class="text-xs text-gray-500 mb-1">{{ institution.code }}</p>
                                            <p class="text-sm text-gray-600 line-clamp-2">{{ institution.description }}</p>
                                        </div>
                                        <div 
                                            v-if="institution.color" 
                                            class="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0 ml-2"
                                            :style="{ backgroundColor: institution.color }"
                                            :title="`สีสถาบัน: ${institution.color}`"
                                        ></div>
                                    </div>

                                    <!-- Action Buttons -->
                                    <div class="flex items-center justify-end pt-3 border-t border-gray-100 space-x-1">
                                        <button 
                                            @click="openRenameDialog(institution)" 
                                            class="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-all duration-200"
                                        >
                                            <font-awesome-icon :icon="['fas','edit']" class="mr-1 text-xs" />
                                            แก้ไข
                                        </button>
                                        <button 
                                            @click="removeMainCategoryConfirmation(institution)" 
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
                            :style="{ backgroundImage: selectedInstitution?.banner ? `url(${selectedInstitution.banner})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
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
                                :src="selectedInstitution?.logo || 'https://dummyimage.com/400x400/dbdbdb/6e6e6e.jpg&text=++LOGO++'" 
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
                                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <font-awesome-icon :icon="['fas','edit']" class="text-purple-600 text-sm" />
                                </div>
                                <div>
                                    <h3 class="text-base font-semibold text-gray-900">แก้ไขข้อมูลสถาบัน</h3>
                                    <p class="text-xs text-gray-500">จัดการข้อมูลและการตั้งค่า</p>
                                </div>
                            </div>
                            <button @click="closeRenameDialog" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200">
                                <font-awesome-icon :icon="['fas','times']" class="text-sm" />
                            </button>
                        </div>

                        <div class="space-y-3">
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อสถาบัน</label>
                                <input 
                                    v-model="selectedInstitution.name" 
                                    type="text" 
                                    class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm"
                                    placeholder="ระบุชื่อสถาบัน"
                                />
                            </div>
                            
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">รหัสสถาบัน</label>
                                <input 
                                    v-model="selectedInstitution.code" 
                                    type="text" 
                                    class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm"
                                    placeholder="ระบุรหัสสถาบัน"
                                />
                            </div>
                            
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">รายละเอียด</label>
                                <textarea 
                                    v-model="selectedInstitution.description" 
                                    rows="2"
                                    class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none text-sm"
                                    placeholder="ระบุรายละเอียดสถาบัน"
                                ></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">สีประจำสถาบัน</label>
                                <div class="flex items-center space-x-2">
                                    <input 
                                        v-model="selectedInstitution.color" 
                                        type="color" 
                                        class="w-12 h-8 border border-gray-200 rounded cursor-pointer"
                                    />
                                    <input 
                                        v-model="selectedInstitution.color" 
                                        type="text" 
                                        class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>

                            <!-- Hidden inputs for file uploads -->
                            <input v-model="selectedInstitution.logo" type="hidden" />
                            <input v-model="selectedInstitution.banner" type="hidden" />
                        </div>

                        <div class="flex justify-end space-x-2 mt-5">
                            <button 
                                @click="closeRenameDialog" 
                                class="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                @click="renameInstitution(selectedInstitution)" 
                                class="px-3 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200"
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
                <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" @click="cancelRemoveMainCategory"></div>
                <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <font-awesome-icon :icon="['fas','exclamation-triangle']" class="text-red-600 text-sm" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold text-gray-900">ยืนยันการลบ</h3>
                                <p class="text-xs text-gray-500">สถาบัน</p>
                            </div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <p class="text-sm text-gray-600">คุณแน่ใจหรือไม่ที่จะลบสถาบันนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
                    </div>

                    <div class="flex justify-end space-x-2">
                        <button 
                            @click="cancelRemoveMainCategory" 
                            class="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                        >
                            ยกเลิก
                        </button>
                        <button 
                            @click="removeMainInstitution" 
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
    name: 'InstitutionList',
    data() {
        return {
            session: storageManager.get('session'),
            configs: storageManager.get('configs'),
            institutions: [],
            uniqueIdCounter: 5,
            showRenameDialog: false,
            selectedInstitution: null,
            showMoveDialog: false,
            selectedInstitutionParent: null,
            FileBannerOpen: false,
            FileLogoOpen: false,
            showConfirmationPopup: false,
            categoryToRemove: null,
        };
    },
    components: {
        FileBrowser
    },
    computed: {
        flattenedInstitutions() {
            return this.flattenInstitutions(this.institutions);
        },
        getMainInstitutions() {
            return this.institutions.filter(institution => institution.type === 'main');
        },
    },
    async mounted() {
        try {
            await this.getInstitutionData();
        } catch (error) {
            console.log(Error);
        }
    },
    methods: {
        // Update Banner
        OpenFileBrowser()
        {
            this.FileBannerOpen = true;
        },
        changeFileTrigger(payload) {
            this.FileBannerOpen = payload;
        },
        selectFileTrigger(payload) {
            console.log("selectFileTrigger");
            if(payload!=undefined) {
                console.log("selectFileReturnFunction",payload.file)
                this.updateBanner(payload.file);
            }
        },
        async updateBanner(banner) {
            try {
            const institution = this.selectedInstitution;

            const updatedInstitution = {
            ...institution,
            banner: banner,
            };
            delete updatedInstitution._id;

            const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/institution/${institution._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                body: JSON.stringify({
                data: updatedInstitution,
                options: {},
                }),
            });

            if (resAPI.ok) {
                this.selectedInstitution.banner = banner;
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
        OpenFileBrowserLogo()
        {
            this.FileLogoOpen = true;
        },
        changeFileTriggerLogo(payload) {
            this.FileLogoOpen = payload;
        },
        selectFileTriggerLogo(payload) {
            console.log("selectFileTrigger");
            if(payload!=undefined) {
                console.log("selectFileReturnFunction",payload.file)
                this.updateLogo(payload.file);
            }
        },
        async updateLogo(logo) {
            try {
            const institution = this.selectedInstitution;

            const updatedInstitution = {
            ...institution,
            logo: logo,
            };
            delete updatedInstitution._id;

            const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/institution/${institution._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                body: JSON.stringify({
                data: updatedInstitution,
                options: {},
                }),
            });

            if (resAPI.ok) {
                this.selectedInstitution.logo = logo;
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
        async getInstitutionData() {
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/institution/query", {
            method: 'POST',
            headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
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
            this.institutions = finalRes.data.map(inst => ({
                ...inst,
                color: inst.color || '#000000' // กำหนดค่าเริ่มต้นถ้าไม่มีสี
            }));
            } else {
            // Handle error condition
            }
        },
      async addInstitution(mode, institution) {
        try {
          const requestData = {
            unit: this.session.current._id,
            name: 'New Institution',
            code: 'institution-code',
            description: 'Description for New Institution',
            type: 'main', // Default type is 'main'
            order: 0
          };
  
          if (mode === "sub") {
            requestData.type = 'sub';
            requestData.parent = institution._id;
          }
  
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/institution/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: requestData,
              options: {}
            })
          });
  
          if (resAPI.ok) {
            await this.getInstitutionData();
            const finalRes = await resAPI.json();
            console.log("finalRes", finalRes);
          } else {
            // Handle error condition
          }
        } catch (error) {
          console.error(error);
        }
      },
      async updateInstitution(institution) {
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/institution/" + institution._id, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
          body: JSON.stringify({
            data: {
              "name": institution.name,
              "code": institution.code,
              "description": institution.description,
              "order": institution.order,
              "color": institution.color,
            },
            options: {}
          })
        });
        if (resAPI.ok) {
          await this.getInstitutionData();
          const finalRes = await resAPI.json();
          console.log("finalRes", finalRes);
        } else {
          // Handle error condition
        }
      },
      async deleteInstitution(institution) {
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/institution/" + institution._id, {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
        });
        if (resAPI.ok) {
          await this.getInstitutionData();
          const finalRes = await resAPI.json();
          console.log("finalRes", finalRes);
        } else {
          // Handle error condition
        }
      },
      getMainInstitutionIndex(institution) {
        const mainInstitutions = this.flattenedInstitutions.filter(inst => inst.type === 'main');
        return mainInstitutions.findIndex(inst => inst._id === institution._id) + 1;
      },
      flattenInstitutions(institutions) {
        return institutions.reduce((result, institution) => {
          result.push(institution);
          return result;
        }, []);
      },
      moveMainInstitutionUp(institution) {
        const index = this.institutions.findIndex(i => i._id === institution._id && i.type === 'main');
        if (index > 0) {
          const movedInstitution = this.institutions.splice(index, 1)[0];
          this.institutions.splice(index - 1, 0, movedInstitution);
        }
      },
      moveMainInstitutionDown(institution) {
        const index = this.institutions.findIndex(i => i._id === institution._id && i.type === 'main');
        if (index < this.institutions.length - 1) {
          const movedInstitution = this.institutions.splice(index, 1)[0];
          this.institutions.splice(index + 1, 0, movedInstitution);
        }
      },
      async removeMainCategoryConfirmation(category) {
        this.categoryToRemove = category;
        this.showConfirmationPopup = true;
      },
      async removeMainInstitution() {
        try {
          const institution = this.categoryToRemove;
          const index = this.institutions.findIndex(i => i._id === institution._id && i.type === 'main');
          if (index !== -1) {
            this.institutions.splice(index, 1);
            await this.deleteInstitution(institution);
          }
          this.categoryToRemove = null;
          this.showConfirmationPopup = false;
        } catch (error) {
          console.error(error);
        }
      },
      cancelRemoveMainCategory() {
        this.categoryToRemove = null;
        this.showConfirmationPopup = false;
      },
      openRenameDialog(institution) {
        this.selectedInstitution = institution;
        this.showRenameDialog = true;
      },
      closeRenameDialog() {
        this.showRenameDialog = false;
        this.selectedInstitution = null;
      },
      async renameInstitution(institution) {
        try {
          const newName = institution.name.trim();
          const newCode = institution.code.trim();
          const newDescription = institution.description.trim();
          const newColor = institution.color.trim();
  
          if (newName !== '') {
            institution.name = newName;
          }
          if (newCode !== '') {
            institution.code = newCode;
          }
          if (newDescription !== '') {
            institution.description = newDescription;
          }
          if (newColor !== '') {
            institution.color = newColor;
          }
          await this.updateInstitution(institution);
          this.closeRenameDialog();
        } catch (error) {
          console.error(error);
        }
      },
      openMoveDialog(institution) {
        this.selectedInstitution = institution;
        this.selectedInstitutionParent = institution.parent;
        this.showMoveDialog = true;
      },
      closeMoveDialog() {
        this.showMoveDialog = false;
        this.selectedInstitution = null;
        this.selectedInstitutionParent = null;
      },
      updateSelectedInstitutionParent() {
        this.selectedInstitution.parent = this.selectedInstitutionParent;
        this.closeMoveDialog();
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
.group:hover .group-hover\:bg-purple-100 {
  background-color: #f3e8ff;
}

/* Button Hover Effects */
button {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

/* Input Focus States */
input:focus,
textarea:focus,
select:focus {
  @apply ring-2 ring-purple-500 ring-offset-2;
}

/* Smooth Animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Institution Card Enhancements */
.institution-card {
  @apply bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden;
}

.institution-card:hover {
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
  @apply action-btn text-purple-600 hover:text-purple-700 hover:bg-purple-50;
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

.icon-btn-purple:hover {
  @apply text-purple-600 bg-purple-50;
}

.icon-btn-red:hover {
  @apply text-red-600 bg-red-50;
}

/* Form Elements */
.form-input {
  @apply w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm;
}

.form-textarea {
  @apply form-input resize-none;
}

.form-color-input {
  @apply w-12 h-8 border border-gray-200 rounded cursor-pointer;
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
  @apply px-3 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200;
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

/* Color Indicator */
.color-indicator {
  @apply w-4 h-4 rounded-full border border-gray-200 flex-shrink-0;
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
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500;
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

/* Institution Specific Styles */
.institution-header {
  @apply px-4 py-3 border-b border-gray-200;
}

.institution-nav {
  @apply bg-gray-50 border-b border-gray-200 px-4 py-2;
}

.institution-content {
  @apply p-4;
}

.institution-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-3;
}

.institution-info {
  @apply pt-10;
}

.institution-actions {
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

/* Color Input Group */
.color-input-group {
  @apply flex items-center space-x-2;
}

/* Gradient Backgrounds */
.gradient-purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
}
</style>
  
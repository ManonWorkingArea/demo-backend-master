<script>

// Plugin
//import { ls } from 'vue-lsp'
import FileManager from '@/interface/template/FileManager.vue';

export default {
    props: ['isWindowsOpen','allowFileType','callbackFunction'],
    data() {
      //const userSession = ls.get('school') !=undefined ? ls.get('school') : "";
      console.log('FileBrowser props:', this.isWindowsOpen, this.allowFileType, this.callbackFunction);
      return {
        SessionList: [],
        loading_sources: true,
        activeBlock: false,
        //currentSchool:userSession,
        schoolId: '',
        isOpen:this.isWindowsOpen,
        isAllow:this.allowFileType,
        isCallback:this.callbackFunction,
        mode: 'popup'
      }
    },
    components: {
      FileManager
    },
    watch: {
      isWindowsOpen(newVal) {
        console.log('isWindowsOpen changed to:', newVal);
        this.isOpen = newVal;
      }
    },
    methods: {
      selectFileTrigger(payload) {
        this.selectFileTrigger = payload;
        this.closeModal()
        this.selectFile(payload);
      },
      closeModal() {
        this.isOpen = false
        this.$emit("fileBrowserTrigger", false)
      },
      selectFile(obj) {
        this.$emit("fileBrowserCallback", obj)
      }
    },
    async mounted () {
      console.log('FileBrowser mounted with isOpen:', this.isOpen, 'isWindowsOpen:', this.isWindowsOpen);
      try {
        /*
        await this.getuserSession();
        let schoolSession = ls.get('school');
        if(schoolSession!=undefined) {
        this.currentSchool = schoolSession
        } else {
        this.currentSchool = ''
        }
        console.log(this.currentSchool);
        */
      } catch (error) {
        console.log(Error);
      }
    },
    setup() {
    },
};
</script>

<script setup>
import {TransitionRoot,TransitionChild,Dialog,DialogPanel,DialogTitle } from '@headlessui/vue'
</script>

<template>

    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="closeModal" class="relative z-10">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
       <div class="fixed inset-0 bg-black bg-opacity-25" />
    </TransitionChild>
   
      <div class="fixed inset-0 overflow-y-auto" v-if="loading_sources">
       <div class="flex min-h-full items-center justify-center p-4 text-center">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
         <DialogPanel class="w-[60rem] z-40 transform overflow-hidden bg-white p-3 text-left align-middle shadow-xl transition-all blocking relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
            <DialogTitle as="h3" class="text-md pb-2 font-bold leading-6 text-gray-900 border-b">เลือกไฟล์ (Select File)  <p class="text-sm font-medium">อนุญาติเฉพาะไฟล์ <span v-for="(fileType) in allowFileType" :key="fileType.code" class="text-xs font-medium bg-indigo-600 pl-2 pr-2 pt-1 mr-1 rounded text-white">{{fileType}}</span></p>
                <button @click="closeModal" type="button" class="z-50 absolute top-2 right-2">
                  <div class="bg-black w-8 h-8 right-2 top-2 leading-8 hover:bg-gray-500">
                    <font-awesome-icon :icon="['fas','times']" class="text-white mt-[7px] font-sm"/>
                  </div>
                </button>
            </DialogTitle>
          <div>
            <FileManager 
            @select-file-trigger="selectFileTrigger" 
            @close="closeModal"
            :Mode="mode" 
            :AllowFile="isAllow" 
            :CallbackFunc="isCallback"/>
          </div>
         </DialogPanel>
        </TransitionChild>
       </div>
      </div>
     </Dialog>
    </TransitionRoot>
   </template>
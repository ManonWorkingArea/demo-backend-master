<script>

export default {
    props: ['isWindowsOpen','allowFileType','callbackFunction'],
    data() {
      return {
        isOpen:this.isWindowsOpen,
        loading_sources: true,
        activeBlock: false,
        foldername: '',
      }
    },
    components: {},
    methods: {
        createFolder() {
            console.log("foldername",this.foldername);
            this.$emit('createFolderEvent', { foldername: this.$refs.form.foldername.value})
        },
        isLetterOrNumber(e) {
            let char = String.fromCharCode(e.keyCode);
            if (/^[a-zA-Z0-9@#&().+_"-]*$/.test(char)) return true;
            else e.preventDefault();
        },
        closeModal() {
            this.isOpen = false
            this.$emit("createFolderTrigger", false)
        },
	},
    mounted () {},
    setup () {},
};
</script>

<script setup>
import { TransitionRoot,TransitionChild,Dialog,DialogPanel,DialogTitle } from '@headlessui/vue'
</script>

<template>

    <TransitionRoot appear :show="isOpen" as="template" v-if="loading_sources">
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
   
      <div class="fixed inset-0 overflow-y-auto">
       <div class="flex min-h-full items-center justify-center p-4 text-center z-[99999]">
        <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
        >
         <DialogPanel class="w-[20rem] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all blocking relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
          <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 pb-4 border-b">สร้างโฟลเดอร์ใหม่ (Create Folder)</DialogTitle>
          <div class="mt-2 pb-4 border-b">
            <form @submit.prevent="createFolder" ref="form">
                <input v-model="foldername" @keydown.enter.prevent="createFolder" type="text" name="foldername" id="foldername" autocomplete="foldername" class="mt-1 block w-full rounded-md py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
            </form>
          </div>
   
          <div class="mt-4">
           <button
            type="button"
            class="w-50 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-md font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="createFolder"
            >
            <font-awesome-icon :icon="['fas','check']" class="text-white text-[12px] mr-2"/> 
            สร้าง
           </button>

           <button
            type="button"
            class="w-50 inline-flex items-center rounded-md border border-transparent bg-indigo-600 ml-2 px-4 py-2 text-md font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="closeModal"
            >
            <font-awesome-icon :icon="['fas','check']" class="text-white text-[12px] mr-2"/> 
            ยกเลิก
           </button>
          </div>
         </DialogPanel>
        </TransitionChild>
       </div>
      </div>
     </Dialog>
    </TransitionRoot>
   </template>
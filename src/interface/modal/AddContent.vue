<script>
import { ls } from 'vue-lsp'
export default {
    props: ['isWindowsOpen','Action','callbackData','Count'],
    data() {
      return {
        SessionList: [],
        loading_sources: true,
        activeBlock: false,
        isOpen:this.isWindowsOpen,
        isAction:this.Action,
        isCallback:this.callbackData,
        isCount:this.Count,
        name:'',
        type:'',
        position:'',
        accessToken:ls.get("token"),
        school:ls.get("school")
      }
    },
    components: {
    },
    methods: {
        addContentTrigger(payload) {
            this.closeModal()
            this.addContent(payload);
        },
        closeModal() {
            this.isOpen = false
            this.$emit("addContentTrigger", false)
        },
        addContent() {
            this.$emit("addContentCallback")
        },
        async addData() {
            try {
                this.activeBlock = true;
                const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/contents/", {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.accessToken},
                    body: JSON.stringify({
                        schoolId: this.school,
                        name: this.name,
                        mode: this.mode,
                        order: (this.isCount+1),
                        position: this.position,
                        detail: "none",
                        type: "block",
                    })
                });
                const finalRes   = await resAPI.json();

                if(finalRes.success) {
                    this.addContentTrigger()
                }

                console.log(finalRes);
            } catch (error) {
                console.log(error)
            }
        }
    },
    async mounted () {
      try {
        console.log("Mount");
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
         <DialogPanel class="w-[40rem] transform overflow-hidden rounded-2xl bg-white p-3 text-left align-middle shadow-xl transition-all blocking relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
            <DialogTitle as="h3" class="text-lg font-bold leading-6 text-gray-900 pb-2 border-b">เพิ่มเนื้อหา - {{isAction}}
                <button @click="closeModal" type="button" class="inset-0 focus:outline-none">
                  <div class="z-50 absolute bg-black w-8 h-8 right-2 top-2 rounded-full leading-8  hover:bg-gray-500">
                    <font-awesome-icon :icon="['fas','times']" class="text-white mt-[7px] font-sm"/>
                  </div>
                </button>
            </DialogTitle>

            <form @submit.prevent="addData">
                <div class="px-4 py-5 sm:p-6">
    
                    <div class="grid grid-cols-4 gap-6">

                        <div class="col-span-2 sm:col-span-2">
                            <label for="name" class="block text-md font-bold text-gray-700">name</label>
                            <input 
                            v-model="name" 
                            type="text" name="name" id="name" autocomplete="name" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        </div>

                        <div class="col-span-2 sm:col-span-2">
                            <label for="mode" class="block text-md font-bold text-gray-700">mode</label>
                            <input 
                            v-model="mode"
                            type="text" name="mode" id="mode" autocomplete="mode" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        </div>

                        <div class="col-span-2 sm:col-span-2">
                            <label for="position" class="block text-md font-bold text-gray-700">position</label>
                            <input 
                            v-model="position"
                            type="text" name="position" id="position" autocomplete="position" 
                            class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                        </div>

                    </div>

                </div>

                <div class="bg-gray-50 px-4 py-4 sm:px-6 text-right">

                    <button
                    @click="closeModal"
                    type="button" 
                    class="inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    ยกเลิก
                    </button>

                    <button 
                    type="submit" 
                    class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <font-awesome-icon :icon="['fas','save']" class="pr-2 pl-2"/>บันทึกข้อมูล
                    </button>

                </div>
            </form>

         </DialogPanel>
        </TransitionChild>
       </div>
      </div>
     </Dialog>
    </TransitionRoot>
   </template>
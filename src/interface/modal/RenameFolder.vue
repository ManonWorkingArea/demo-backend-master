<script>

export default {
    data() {
      return {
        loading_sources: true,
        activeBlock: false,
        foldername: '',
        originalname: '',
        originalid: '',
      }
    },
    components: {
    },
    methods: {
        renameFolder() {
            this.$emit('rename-folder-event', { foldername: this.$refs.form.foldername.value, originalname: this.$refs.form.originalname.value, originalid: this.$refs.form.originalid.value })
        },
        isLetterOrNumber(e) {
            let char = String.fromCharCode(e.keyCode);
            if (/^[a-zA-Z0-9@#&().+_"-]*$/.test(char)) return true;
            else e.preventDefault();
        }
	},
    async mounted () {
    },
    setup() {
    },
    watch: {
        foldername(value) {
            console.log(value);
            let str = value.replace(/[^\x20-\x7E]/g, '');
            console.log(str);
            this.foldername = str;
        }
    },
};
</script>

<script setup>
import { ref,defineProps,defineEmits } from 'vue'
import { TransitionRoot,TransitionChild,Dialog,DialogPanel,DialogTitle } from '@headlessui/vue'

const props = defineProps({
    isWindowsOpen:Boolean,
    renameTriggerObj:String,
    renameTriggerId:String,
    oldname:String,
})

const emits = defineEmits(['rename-folder-trigger','rename-folder-event'])

const isOpen = ref(props.isWindowsOpen)
const renameTriggerObj = ref(props.renameTriggerObj)
const renameTriggerId = ref(props.renameTriggerId)
const oldname = ref(props.oldname)

emits('rename-folder-trigger', true)

function closeModal() {
    isOpen.value = false
    emits('rename-folder-trigger', false)
}

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
         <DialogPanel class="w-[20rem] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all blocking relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
          <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 pb-4 border-b">เปลี่ยนชื่อ <br><small class="text-gray-500">{{oldname}}</small></DialogTitle>
          <div class="mt-2 pb-4 border-b">
            <form @submit.prevent="renameFolder" ref="form">
                <input 
                type="text" 
                name="foldername" 
                id="foldername" autocomplete="foldername" class="mt-1 block w-full rounded-md py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm" 
                v-bind:value=oldname
                @keydown.enter.prevent="renameFolder">
                <input 
                type="hidden" 
                name="originalname" 
                id="originalname" autocomplete="originalname" class="mt-1 block w-full rounded-md py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm" v-bind:value=renameTriggerObj>
                <input 
                type="hidden" 
                name="originalid" 
                id="originalid" autocomplete="originalid" class="mt-1 block w-full rounded-md py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm" v-bind:value=renameTriggerId>
            </form>
          </div>
   
          <div class="mt-4">
           <button
            type="button"
            class="w-50 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-md font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="renameFolder"
            >
            <font-awesome-icon :icon="['fas','check']" class="text-white text-[12px] mr-2"/> 
            เปลี่ยนชื่อ
           </button>

           <button
            type="button"
            class="w-50 inline-flex items-center rounded-md border border-gray-300 bg-gray-200 ml-2 px-4 py-2 text-md font-medium text-black shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="closeModal"
            >
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
<script>

export default {
    data() {
      return {
        loading_sources: true,
        activeBlock: false,
        contentURL: '',
        contentType: '',
        contentOriginal: '',
      }
    },
    components: {
    },
    methods: {
        setContentSource() {
            this.$emit('set-content-event', { contentURL: this.$refs.form.contentURL.value, contentOriginal: this.$refs.form.contentOriginal.value })
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
        contentURL(value) {
            console.log(value);
            let str = value.replace(/[^\x20-\x7E]/g, '');
            console.log(str);
            this.contentURL = str;
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
    contentType:String,
    contentOriginal:String,
})

const emits = defineEmits(['set-content-trigger','set-content-event'])

const isOpen = ref(props.isWindowsOpen)
const renameTriggerObj = ref(props.renameTriggerObj)
const contentType = ref(props.contentType)
const contentOriginal = ref(props.contentOriginal)

emits('set-content-trigger', true)

function closeModal() {
    isOpen.value = false
    emits('set-content-trigger', false)
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
         <DialogPanel class="w-[40rem] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all blocking relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
          <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 pb-4 border-b">แก้ไขต้นฉบับเนื้อหา <br><small class="text-gray-500">ประเภท <span class="font-bold">{{contentType}}</span></small></DialogTitle>
          <div class="mt-2 pb-4 border-b">
            <form @submit.prevent="setContentSource" ref="form">
                <input 
                type="text" 
                name="contentURL" 
                id="contentURL" autocomplete="contentURL" class="mt-1 block w-full rounded-md py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm" v-bind:value=contentOriginal>
                <input 
                type="hidden" 
                name="contentOriginal" 
                id="contentOriginal" autocomplete="contentOriginal" class="mt-1 block w-full rounded-md py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm" v-bind:value=renameTriggerObj>
            </form>
          </div>
   
          <div class="mt-4">

            <button
            type="button"
            class="w-50 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-md font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            @click="closeModal"
            >
            <font-awesome-icon :icon="['fas','times']" class="text-black text-[12px] mr-2"/> 
            ยกเลิก
           </button>
           
           <button
            type="button"
            class="w-50 float-right inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-md font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="setContentSource"
            >
            <font-awesome-icon :icon="['fas','check']" class="text-white text-[12px] mr-2"/> 
            เพิ่มเนื้อหา
           </button>

          </div>
         </DialogPanel>
        </TransitionChild>
       </div>
      </div>
     </Dialog>
    </TransitionRoot>
   </template>
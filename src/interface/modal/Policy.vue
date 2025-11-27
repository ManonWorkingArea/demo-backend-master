<script setup>
import { ref,defineProps } from 'vue'
import { TransitionRoot,TransitionChild,Dialog,DialogPanel,DialogTitle } from '@headlessui/vue'

const props = defineProps({
    title:String,
})
const isOpen = ref(false)

function closeModal() {
    isOpen.value = false
}
function openModal() {
    isOpen.value = true
}
</script>

<template>
    <button
      type="button"
      @click="openModal"
      class="background-transparent font-medium text-indigo-600 fpx-3 py-1 outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
     >
     {{ props.title }}
     </button>
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
         <DialogPanel class="w-[38rem] transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all">
          <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 pb-4 border-b">

          นโยบายคุกกี้ (Cookies Policy)

          </DialogTitle>
          <div class="mt-4 pb-4 border-b">
           <p class="text-sm text-gray-500">
            เมื่อท่านได้เข้าสู่เว็บไซต์ (https://fti.academy/home) ข้อมูลที่เกี่ยวข้องกับการเข้าสู่เว็บไซต์ ของท่านจะถูกบันทึกไว้ในรูปแบบของคุกกี้ โดยนโยบายคุกกี้นี้จะอธิบายถึงความหมาย การทำงาน วัตถุประสงค์ รวมถึงการลบและการปฏิเสธการเก็บคุกกี้ เพื่อความเป็นส่วนตัวของท่าน โดยการเข้าสู่เว็บไซต์นี้ถือว่าท่านได้อนุญาตให้เราใช้คุกกี้ตามนโยบายคุกกี้ ที่มีรายละเอียดดังต่อไปนี้
            <br><br>
            <strong>คุกกี้คืออะไร</strong><br>
            คุกกี้ คือ ไฟล์เล็ก ๆ เพื่อจัดเก็บข้อมูลการเข้าใช้งานเว็บไซต์ โดยจะบันทึกลงไปในอุปกรณ์คอมพิวเตอร์ และ/หรือ เครื่องมือสื่อสารที่เข้าใช้งานของท่าน ผ่านทางเว็บเบราว์เซอร์ในขณะที่ท่านเข้าสู่เว็บไซต์ โดยคุกกี้จะไม่ก่อให้เกิดอันตรายต่ออุปกรณ์คอมพิวเตอร์ และ/หรือ เครื่องมือสื่อสารของท่าน ข้อมูลส่วนบุคคลของท่านอาจถูกจัดเก็บเพื่อใช้เพิ่มประสบการณ์การใช้งานบ ริการทางออนไลน์ โดยจะจำเอกลักษณ์ของภาษาและปรับแต่งข้อมูลการใช้งานตามความต้องก ารของท่าน เป็นการยืนยันคุณลักษณะเฉพาะตัว ข้อมูลความปลอดภัยของท่าน รวมถึงบริการที่ท่านสนใจ นอกจากนี้คุกกี้ยังถูกใช้เพื่อวัดปริมาณการเข้าใช้งานบริการทางออนไลน์ การปรับเปลี่ยนเนื้อหาตามการใช้งานของท่านโดยพิจารณาจากพฤติกรรมก ารเข้าใช้งานครั้งก่อน ๆ และ ณ ปัจจุบัน และอาจมีวัตถุประสงค์เพื่อการโฆษณาประชาสัมพันธ์ ทั้งนี้ท่านสามารถค้นหาข้อมูลเพิ่มเติมเกี่ยวกับคุกกี้ได้ที่ www.allaboutcookies.org
            <br><br>
            <strong>หน่วยงาน ใช้คุกกี้อย่างไร</strong><br>
            หน่วยงาน ใช้คุกกี้ เพื่อบันทึกการเข้าเยี่ยมชมและสมัครเข้าใช้งานเว็บไซต์ของท่าน โดยทำให้ หน่วยงาน สามารถจดจำการใช้งานเว็บไซต์ของท่านได้ง่ายขึ้น และข้อมูลเหล่านี้จะถูกนำไปเพื่อปรับปรุงเว็บไซต์ของ หน่วยงาน ให้ตรงกับความต้องการของท่านมากยิ่งขึ้น เพื่ออำนวยความสะดวกให้เกิดความรวดเร็วในการใช้งานเว็บไซต์ของท่าน และในบางกรณี หน่วยงาน จำเป็นต้องให้บุคคลที่สามช่วยดำเนินการดังกล่าว ซึ่งอาจจะต้องใช้ อินเทอร์เน็ตโปรโตคอลแอดเดรส (IP Address) และคุกกี้เพื่อวิเคราะห์ทางสถิติ ตลอดจนเชื่อมโยงข้อมูล และประมวลผลตามวัตถุประสงค์ทางการตลาด ทั้งนี้ โปรดทราบว่า หากท่านเลือกที่จะปิดการใช้งานคุกกี้บนเบราว์เซอร์หรืออุปกรณ์ของท่าน อาจส่งผลกระทบกับการทำงานบางส่วนของเว็บไซต์ของ หน่วยงาน ที่ไม่สามารถทำงานหรือให้บริการได้เป็นปกติ
            <br><br>
            <strong>การเชื่อมโยงข้อมูลกับเว็บไซต์อื่น</strong><br>
            เว็บไซต์ของ หน่วยงาน อาจมีการเชื่อมโยงไปยังเว็บไซต์หรือโซเชียลมีเดียของบุคคลภายนอก รวมถึงอาจมีการฝังเนื้อหาหรือวีดีโอที่มาจากโซเชียลมีเดีย เช่น YouTube หรือ Facebook เป็นต้น ซึ่งจะช่วยให้ท่านเข้าถึงเนื้อหาและสร้างการปฏิสัมพันธ์กับบุคคลอื่นบนโซเชี ยลมีเดียจากเว็บไซต์ของ หน่วยงาน ได้ ซึ่งเว็บไซต์หรือโซเชียลมีเดียของบุคคลภายนอกจะมีการกำหนดและตั้งค่าคุ กกี้ขึ้นมาเอง โดยที่ หน่วยงาน ไม่สามารถควบคุมหรือรับผิดชอบต่อคุกกี้เหล่านั้นได้ และขอแนะนำให้ท่านควรเข้าไปอ่านและศึกษานโยบายหรือประกาศการใช้ คุกกี้ของบุคคลภายนอกเหล่านั้นด้วย
            <br><br>
            <strong>การเปลี่ยนแปลงประกาศ</strong><br>
            ประกาศนี้อาจมีการปรับปรุงให้เหมาะสมและสอดคล้องกับสถานการณ์ และตามการให้บริการจริง โดย หน่วยงาน จะมีการแจ้งประกาศที่มีการปรับปรุงใหม่บนเว็บไซต์นี้ ดังนั้น หน่วยงาน ขอแนะนำให้ท่านตรวจสอบให้แน่ใจว่าท่านได้เข้าใจการเปลี่ยนแปลงตามข้อกำหนดดังกล่าว
           </p>
          </div>
   
          <div class="mt-4">
           <button
            type="button"
            class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            @click="closeModal"
           >
           ตกลง
           </button>
          </div>
         </DialogPanel>
        </TransitionChild>
       </div>
      </div>
     </Dialog>
    </TransitionRoot>
   </template>
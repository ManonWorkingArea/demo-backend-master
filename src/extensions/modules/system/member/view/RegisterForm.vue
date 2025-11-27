<script>

// Component

import Modal from '@/interface/modal/Policy.vue';

// Plugin

import { useToast } from "vue-toastification";
const toast = useToast();

export default {
  name: 'Register',
  inject: ['apiServer'],
  data() {
    return {
      activeBlock: false,
      firstname: '',
      lastname: '',
      phone: '',
      email: '',
      username: '',
      password: '',
      cpassword: '',
    }
  },
  components: {
    
    Modal
  },
  methods: {
    async register() {
        try 
        {
            const resAPI = await fetch(this.apiServer + "user/register",
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                //make sure to serialize your JSON body
                body: JSON.stringify({
                    firstname: this.firstname,
                    lastname: this.lastname,
                    phone: this.phone,
                    email: this.email,
                    username: this.username,
                    password: this.password
                })
            });
            const finalRes   = await resAPI.json();

            if(finalRes.success)
            {
                toast.success("สมัครสมาชิกเรียบร้อยแล้ว.....", {timeout:5000});
                console.log("Register")
                window.location.href = "/member/login"
            }
            else
            {
                toast.error(finalRes.error, {timeout:5000});
            }
        } 
        catch (error) 
        {
            console.log(error)
        }
    }
  },
  setup() {
  
  },
  
  mounted() {
    // let my_cookie_value = this.cookies.get("myCoookie");
    // console.log(my_cookie_value);
  }
}
</script>

<template>
    
    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-100">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">ลงทะเบียน</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          หรือ
          <a href="login" class="font-medium text-indigo-600 hover:text-indigo-500">เข้าสู่ระบบ</a>
        </p>
      </div>
  
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 container" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
          <form class="space-y-6" @submit.prevent="register">

            <div class="grid grid-cols-6 gap-6">
              <div class="col-span-6 sm:col-span-3">
                <label for="firstname" class="block text-sm font-medium text-gray-700">ชื่อ</label>
                <input v-model="firstname" type="text" placeholder="ชื่อ" name="firstname" id="firstname" autocomplete="firstname" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
              </div>

              <div class="col-span-6 sm:col-span-3">
                <label for="lastname" class="block text-sm font-medium text-gray-700">นามสกุล</label>
                <input v-model="lastname" type="text" placeholder="นามสกุล" name="lastname" id="lastname" autocomplete="lastname" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
              </div>
            </div>

            <div class="grid grid-cols-6 gap-6">
              <div class="col-span-6 sm:col-span-3">
                <label for="email" class="block text-sm font-medium text-gray-700">อีเมล์</label>
                <input v-model="email" type="text" placeholder="อีเมล์" name="email" id="email" autocomplete="email" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
              </div>

              <div class="col-span-6 sm:col-span-3">
                <label for="phone" class="block text-sm font-medium text-gray-700">เบอร์โทร</label>
                <input v-model="phone" type="text" placeholder="เบอร์โทร" name="phone" id="phone" autocomplete="phone" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">ชื่อผู้ใช้งาน</label>
              <div class="mt-1">
                <input v-model="username" name="username" placeholder="ชื่อผู้ใช้" type="username" autocomplete="username" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
              </div>
            </div>
  
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
              <div class="mt-1">
                <input v-model="password" name="password" placeholder="รหัสผ่าน" type="password" autocomplete="password" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="cpassword" class="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
              <div class="mt-1">
                <input v-model="cpassword" name="cpassword" placeholder="รหัสผ่าน" type="password" autocomplete="cpassword" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex h-5 items-center">
                <input id="comments" name="comments" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
              </div>
              <div class="ml-3 text-sm">
                <label for="comments" class="font-medium text-gray-700">ฉันยอมรับ <Modal title="นโยบายความเป็นส่วนตัว"/></label>
                <p class="text-gray-500">เมื่อคลิกที่ตัวเลือก "ฉันยอมรับ" หรือ "ฉันยอมรับ..." ในระหว่างการลงทะเบียนสมาชิกใหม่ จะถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขของข้อตกลงและรับทราบถึงนโยบายความเป็นส่วนตัวของเราแล้ว</p>
              </div>
            </div>
            
            <div>
              <button type="submit" class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">ลงทะเบียน</button>
            </div>
          </form>
  
        </div>
      </div>
    </div>
</template>
<script>
import storageManager from '@/plugins/storage';
import { sendEmail } from '@/plugins/sendEmail';
import CryptoJS from 'crypto-js';

export default {
	name: 'Login',
	components: {
	},
  props: {
    showModal: {
      type: Boolean,
      default: false
    }
  },
	data() {
		return {
            config: storageManager.get('configs'),
            session: storageManager.get('session','user'),
            password: '',
            confirmPassword: '',
            errorStage: false,
            errorMessage: '',
            buttonText:'เปลี่ยนรหัสผ่าน'
		}
	},
    created() {
        if (!this.session || !this.session.req_reset) {
            this.$router.push('/student/login');
        }
    },
	methods: {
      logout() {
          this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 500,
              icon: 'success',
              title: 'แจ้งเตือน',
              text: 'ออกจากระบบเรียบร้อยแล้ว',
          }).then(() => 
          {
            storageManager.delete('session');
            window.location.href = "/"
          });
        },
        async changePassword() {
            try {
                this.activeBlock    = true;
                this.errorStage     = false;
                const newPassword = this.password;
                const confirmPassword = this.confirmPassword;

                if (newPassword !== confirmPassword) {
                    this.activeBlock    = false;
                    this.errorStage = true;
                    this.errorMessage = "รหัสผ่านไม่ตรงกัน";
                    this.buttonText = "เปลี่ยนรหัสผ่าน";
                    return;
                }

                const salt = CryptoJS.lib.WordArray.random(16);
                const hash = CryptoJS.SHA256(newPassword + salt).toString();

                const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/user/${this.session._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                    body: JSON.stringify({
                        data: {
                        password: hash,
                        salt: salt.toString(),
                        req_reset: false
                        }
                    })
                });

                const getLogin  = await resAPI.json();
                console.log(getLogin);
                const emailData = {
                    email: this.session.email,
                    name: this.session.firstname + '' + this.session.lastname
                };
                await sendEmail(emailData,'change-password');
                this.$swal({
                    icon: 'success',
                    title: 'การเปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว',
                    text: 'ระบบได้ทำการเปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่อีกครั้ง',
                    showCancelButton: false,
                    confirmButtonText: 'ตกลง',
                }).then(() => {
                    storageManager.delete('session')
                    this.$router.push("/student/login");
                });
                this.activeBlock  = false;
            } catch (error) {
                console.log(error);
                this.buttonText = "เปลี่ยนรหัสผ่าน";
                this.buttonDisabled = false;
            }
        },
	},
};
</script>

<template>
  <div class="bg-gray-50">

    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-lg">
        <img class="mx-auto h-24 w-auto" :src="this.config.siteLogo" alt="Your Company" v-if="!this.showModal">
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">เปลี่ยนรหัสผ่าน FTI Academy</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          หรือ
          <router-link :to="'/student/register'" class="font-medium text-indigo-600 hover:text-indigo-500">
          ลงทะเบียนผู้อบรมใหม่
          </router-link>
        </p>
      </div>
  
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
        <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form class="space-y-6" @submit.prevent="changePassword">

            <div>
                <label for="new-password" class="block text-md font-semibold leading-6 text-gray-900">รหัสผ่านใหม่</label>
                <div class="mt-2">
                <input v-model="password" id="new-password" name="new-password" type="password" autocomplete="new-password" required="" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                </div>
            </div>

            <div>
                <label for="confirm-password" class="block text-md font-semibold leading-6 text-gray-900">ยืนยันรหัสผ่านใหม่</label>
                <div class="mt-2">
                <input v-model="confirmPassword" id="confirm-password" name="confirm-password" type="password" autocomplete="new-password" required="" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                </div>
            </div>
  
            <div>
              <div v-if="errorStage" class="col-span-2">
                <div class="items-center px-3 py-1 rounded-md bg-red-100 text-sm text-black pb-5 mb-5">
                  <div class="font-semibold pt-3 pb-3">เกิดข้อผิดพลาด</div>
                  <div class="w-full">{{ errorMessage }}</div>
                </div>
              </div>
              <button
              type="submit"
              :disabled="buttonDisabled"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-4 text-md font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {{ buttonText }}
            </button>
            <button
            @click="logout()"
              class="flex w-full justify-center rounded-md bg-gray-300 text-md font-semibold text-gray-700 shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 mt-4 py-2"
            >
             ออกจากระบบ
            </button>
            </div>
          </form>
  
        </div>
      </div>
    </div>
  
    </div>
</template>
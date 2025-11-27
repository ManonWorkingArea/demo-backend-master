<script>
import storageManager from '@/plugins/storage';
import { sendEmail } from '@/plugins/sendEmail';
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
      email: '',
      password: '',
      errorStage: false,
      errorMessage: '',
      buttonText:'ส่งข้อมูลเพื่อขอรับรหัสผ่านใหม่'
		}
	},
	methods: {
    async resetPassword() {
      try {
        
          this.activeBlock    = true;
          this.errorStage     = false;
          this.buttonText     = "กำลังดำเนินการ...";
          const resAPILogin   = await fetch("https://gateway.cloudrestfulapi.com/api/user/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
              body: JSON.stringify({
                method: 'find',
                args: [
                  {
                    $and: [
                      { email: this.email }
                    ]
                  }
                ]
              })
          });
          
          const getLogin  = await resAPILogin.json();

          console.log(getLogin);
          const loginData = getLogin.length > 0 ? getLogin[0] : null;

          if (!getLogin || getLogin.length === 0) {
            this.errorStage = true;
            this.errorMessage = "ไม่พบอีเมล์นี้ในระบบ กรุณาตรวจสอบหรือติดต่อทีมงาน";
            this.activeBlock = false;
            this.buttonText = "ส่งข้อมูลเพื่อขอรับรหัสผ่านใหม่";
            this.buttonDisabled = false;
            return;
          } else {
            // Send Email
            const emailData = {
              email: loginData.email, // Use the email from the retrieved loginData
              name: loginData.firstname + '' + loginData.lastname, // Use the name from the retrieved loginData
            };
            await sendEmail(emailData,'reset-password');

            this.$swal({
                icon: 'success',
                title: 'การรีเซ็ตรหัสผ่านใหม่เรียบร้อยแล้ว',
                text: 'ระบบได้ทำการรีเซ็ตและจัดส่งรหัสผ่านใหม่ให้ทางอีเมล์แล้ว กรุณาตรวจสอบอีเมล์และเข้าสู่ระบบด้วยวรหัสผ่านใหม่ เมื่อเข้าสู่ระบบครั้งแรก กรุณาเปลี่ยนรหัสผ่านใหม่อีกครั้งเพื่อความปลอดภัย',
                showCancelButton: false,
                confirmButtonText: 'ตกลง',
              }).then(() => {
                this.$router.push("/student/login");
              });
          }
          this.activeBlock  = false;
      } catch (error) {
        console.log(error)
        this.buttonText = "ส่งข้อมูลเพื่อขอรับรหัสผ่านใหม่";
        this.buttonDisabled = false;
      }
    }
	},
};
</script>

<template>
  <div class="bg-gray-50">
    
    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-lg">
        <img class="mx-auto h-24 w-auto" :src="this.config.siteLogo" alt="Your Company" v-if="!this.showModal">
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">ลืมรหัสผ่าน FTI Academy</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          หรือ
          <router-link :to="'/student/register'" class="font-medium text-indigo-600 hover:text-indigo-500">
          ลงทะเบียนผู้อบรมใหม่
          </router-link>
        </p>
      </div>
  
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
        <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form class="space-y-6" @submit.prevent="resetPassword">
            <div>
              <label for="email" class="block text-md font-semibold leading-6 text-gray-900">อีเมล์ที่ลงทะเบียน</label>
              <div class="mt-2">
                <input v-model="email" id="email" name="email" type="email" autocomplete="email" required="" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
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
            </div>
          </form>
  
        </div>
      </div>
    </div>
  
    </div>
</template>
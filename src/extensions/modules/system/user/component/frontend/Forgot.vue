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
      errorStage: false,
      errorMessage: '',
      buttonText:'ส่งข้อมูลเพื่อขอรับรหัสผ่านใหม่'
		}
	},
	methods: {
    async resetPassword() {
      try {

        if (!this.email) {
            this.errorStage = true;
            this.errorMessage = "โปรดกรอกอีเมล์";
            this.activeBlock = false;
            return;
          }
        
          this.activeBlock    = true;
          this.errorStage     = false;
          this.buttonText     = "กำลังดำเนินการ...";
          const resAPILogin   = await fetch("https://gateway.cloudrestfulapi.com/api/user/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key':this.config.key},
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
                this.$router.push("/user/login");
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
        <img class="mx-auto h-16 w-auto" :src="this.config.siteLogo" alt="Your Company" v-if="!this.showModal">
        <h2 class="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">ลืมรหัสผ่าน</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          หรือ
          <router-link :to="'/user/register'" class="font-medium text-indigo-600 hover:text-indigo-500">
          ลงทะเบียนสมาชิกใหม่
          </router-link>
        </p>
      </div>
  
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
        <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form class="space-y-6" @submit.prevent="resetPassword">

            <div>
              <div class="relative mt-2">
                  <span class="input-label">อีเมล์ที่ลงทะเบียน <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                  <input
                    v-model="email"
                    type="text"
                    placeholder="อีเมล์ที่ลงทะเบียน"
                    class="w-full p-4 border border-gray-200 text-sm"
                  />
                </div>
            </div>
            
            <div>
              <strong>*หมายเหตุ*</strong><br/>
              กรอกเลขที่บัตรประชาชนที่ลงทะเบียนไว้ในระบบ หลังจากคลิ๊ก "ตั้งค่ารหัสผ่าน" เรียบร้อยแล้ว ระบบจะทำการสร้างรหัสผ่านเป็นเบอร์โทรที่ลงทะเบียนไว้ในระบบ หากจำเบอร์โทรไม่ได้ กรุณาแจ้งทีมงานที่ @doacer
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
              <font-awesome-icon :icon="['fas', 'refresh']" class="mr-2"/> {{ buttonText }}
            </button>
            <router-link :to="'/user/login'" class="flex w-full justify-center rounded-md bg-gray-300 text-md font-semibold text-gray-700 shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 mt-4 py-2">
              ย้อนกลับ
            </router-link>
            </div>
          </form>
  
        </div>
      </div>
    </div>
  
    </div>
</template>

<style scoped>
.input-label{
    font-size: 15px;
    background: #fff;
    position: absolute;
    left: 10px;
    top: -10px;
    padding-left: 4px;
    padding-right: 5px;
    color: #000000;
    font-weight: bold;
}
</style>
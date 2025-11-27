<script>

// Component

import storageManager from '@/plugins/storage';

// Plugin


export default {
  name: 'ContactUs',
  inject: ['apiServer'],
  data() {
    return {
      logo:require('@/assets/images/color-logo.png'),
      email: '',
      password: '',
      showPassword: false,
      returnSecureToken:true,
      passwordFieldType: "password",
      activeBlock: false
    }
  },
  components: {
  },
  methods: {
    async login() {
        try {
          // Request user login
          this.activeBlock  = true;
          let userToken     = "";
          let userTokenRefresh     = "";
          const resAPILogin = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDODKwE1BfZOj9ieB6pisJm-p2MmudWLSw", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
              returnSecureToken: this.returnSecureToken,
            })
          });

          const getLogin  = await resAPILogin.json();
          const status = resAPILogin.status;
          console.log("resAPILogin",getLogin);

          if(status=="200") {
            
            userToken = getLogin.idToken;
            this.cookies.set("userToken", userToken);
            this.cookies.set("hasLogin", true);

            userTokenRefresh = getLogin.refreshToken;
            this.cookies.set("userTokenRefresh", userTokenRefresh);

            console.log("userToken",userToken);

            const resAPIRole = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/auth/role/", {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userToken,
              }
            });
            const getRole  = await resAPIRole.json();

            console.log("Role",getRole)
            
            if(getRole.success)
            {
              // --------------------------------------------
              const session = {
                role: getRole.data.role,
                token: userToken,
                refresh: userTokenRefresh,
              };
              storageManager.update('session',session)
              // --------------------------------------------
              
              // Return to interface
              this.$swal({
                  toast: true,
                  position: 'bottom-end',
                  showConfirmButton: false,
                  timer: 1000,
                  icon: 'success',
                  title: 'แจ้งเตือน',
                  text: 'เข้าสู่ระบบเรียบร้อยแล้ว',
              }).then(() => 
              {
                // window.location.href = "/"
              });
            }
          } else {
            this.$swal({
            title: 'เกิดข้อผิดพลาด',
            text: getLogin.message,
            icon: 'error',
            confirmButtonText: 'ตกลง'
            }).then(() => {
              this.activeBlock = false;
            })
          }
        } catch (error) {
          console.log(error)
        }
    },
    switchVisibility() {
      this.passwordFieldType = this.passwordFieldType === "password" ? "text" : "password";
      this.show = !this.show;
      this.$refs.btnToggle.innerText = this.show?'ซ่อน':'แสดง';
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

  

  <div class="flex min-h-screen">
    <div class="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 blocking relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
      <div class="mx-auto w-full max-w-sm lg:w-96 " >
        <div>
          <img class="mx-auto h-24 w-auto" :src="logo" alt="FTI Academy">
          <h2 class="mt-6 text-3xl font-bold tracking-tight text-gray-900 text-center">เข้าสู่ระบบ FTI Academy</h2>
        </div>

        <div class="mt-8 border-t">

          <div class="mt-6">
            <form class="space-y-6" @submit.prevent="login">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">อีเมล์/ชื่อผู้ใช้งาน</label>
                <div class="mt-1">
                  <input v-model="email" id="email" name="email" type="text" autocomplete="email" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                </div>
              </div>

              <div class="space-y-1">
                <label for="password" class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                  <div class="mt-1">
                    <div class="relative w-full">
                      <div class="absolute inset-y-0 right-0 flex items-center px-2">
                        <input class="hidden js-password-toggle" id="toggle" type="checkbox" />
                        <label class="bg-gray-300 hover:bg-gray-400 rounded px-2 py-1 text-sm text-gray-600 font-mono cursor-pointer js-password-label" for="toggle" @click="switchVisibility" ref="btnToggle">แสดง</label>
                      </div>
                      <input v-model="password" id="password" name="password" placeholder="รหัสผ่าน" :type="passwordFieldType" autocomplete="off" class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"/>
                    </div>
                  </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                  <label for="remember-me" class="ml-2 block text-sm text-gray-900">จำข้อมูลของฉัน</label>
                </div>

                <div class="text-sm">
                  <a href="forgot" class="font-medium text-indigo-600 hover:text-indigo-500">ลืมรหัสผ่าน?</a>
                </div>
              </div>

              <div>
                <button type="submit" class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">เข้าสู่ระบบ</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="relative hidden w-0 flex-1 lg:block">
      <img class="absolute inset-0 h-full w-full object-cover" src="https://img.freepik.com/free-photo/business-freelance-asian-woman-working-doing-projects-sending-email-laptop-computer-while-sitting-table-cafe_7861-1332.jpg?w=1480&t=st=1667435493~exp=1667436093~hmac=f007ab2e563a0ca4ba5a740b4472aba8345881433a772ac3ef9017ef30e6dd5c" alt="">
    </div>
  </div>
  
</template>
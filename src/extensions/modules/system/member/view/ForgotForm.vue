<script>

// Component
import storageManager from '@/plugins/storage';
// Plugin

export default {
  name: 'ContactUs',
  data() {
    return {
      username: '',
      activeBlock: false
    }
  },
  components: {    
  },
  methods: {
    async login() {
        try 
        {
          this.activeBlock = true;
          const resAPI = await fetch("https://weiscp.fti.or.th/connector/api/user/login",
          {
            method: 'POST',
            body: JSON.stringify({
              username: this.username,
              password: this.password
            }),
            headers: {
              'API-KEY': 'h1MFg89fZh',
              'SECRET-KEY': 'f03y28LikajofkavhTN5P57lKnuUTT',
            }
          });

          const finalRes   = await resAPI.json();

          if(finalRes.login)
          {
            //toast.success("เข้าสู่ระบบเรียบร้อยแล้ว.....", {timeout:1000});
            let userToken = finalRes.access.token;
            // --------------------------------------------
            const session = {
              token: userToken,
              login: true,
              current: "none",
            };
            storageManager.update('session',session)
            // --------------------------------------------

            console.log("Login")
            this.$swal({
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 2000,
                icon: 'success',
                title: 'แจ้งเตือน',
                text: 'เข้าสู่ระบบเรียบร้อยแล้ว',
            }).then(() => 
            {
              //location.reload();
              this.$router.push('/member')
              this.$router.go(this.$router.currentRoute)
            });
          }
          else
          {
            //toast.error(finalRes.return, {timeout:1000});
            this.$swal({
            title: 'เกิดข้อผิดพลาด',
            text: finalRes.return,
            icon: 'error',
            confirmButtonText: 'ตกลง'
            }).then(() => {
              this.activeBlock = false;
            })
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
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">ลืมรหัสผ่าน</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        หรือ
        <a href="login" class="font-medium text-indigo-600 hover:text-indigo-500">เข้าสู่ระบบ</a>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 container" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
        <form class="space-y-6" @submit.prevent="login">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">อีเมล์/ชื่อผู้ใช้งาน</label>
            <div class="mt-1">
              <input v-model="username" name="username" placeholder="ชื่อผู้ใช้" type="email" autocomplete="email" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
            </div>
          </div>

          <p class="block text-sm font-medium text-gray-700">กรอกชื่อผู้ใช้งาน/อีเมล์ ที่ลงทะเบียนไว้กับเรา เพื่อขอรับลิงค์สำหรับตั้งค่ารหัสผ่านใหม่</p>

          <div>
            <button type="submit" class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">ขอรับรหัสผ่านใหม่</button>
          </div>
        </form>

      </div>
    </div>
  </div>

</template>
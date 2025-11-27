<script>
import storageManager from '@/plugins/storage';
import Modal from '@/interface/modal/Policy.vue';
import CryptoJS from 'crypto-js';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

function getLabelText(field) {
  const label = document.querySelector(`label[for="${field}"]`);
  return label ? label.textContent.trim() : field;
}

export default {
  name: 'Register',
  components: {
    Modal
  },
  data() {
    return {
      session: storageManager.get('session'),
      config: storageManager.get('configs'),
      ftiMember: false,
      password: '',
      cpassword: '',
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      citizen: '',
      fti_member: '',
      passwordMatch: true,
      showPassword1: false,
      showPassword2: false,
      agreedToPolicy: false,
      activeBlock: false,
    };
  },
  watch: {
    password() {
        this.checkPasswords();
        this.passwordValid = this.checkPasswordValid(this.password);
    },
    cpassword() {
        this.checkPasswords();
        this.cpasswordValid = this.checkCPasswordValid(this.cpassword);
    },
    email(newEmail) {
      // block Thai text and spaces
      const emailRegex = /^[^\sก-๙]+@[^\sก-๙]+\.[^\sก-๙]+$/;
      if (!emailRegex.test(newEmail)) {
        this.email = newEmail.replace(/[^\w.@-]/gi, '');
      }
    }
  },
  computed: {
    citizenValid() {
      return /^\d{13}$/.test(this.citizen);
    },
    validPhone() {
      return /^\d{10}$/.test(this.phone);
    },
    ftiMemberValid() {
      return !this.ftiMember || (this.ftiMember && this.fti_member && this.fti_member.trim().length > 0);
    },
    emailValid() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    },
    validForm() {
        const formattedPassword = this.password.replace(/\s/g, '');
        const formattedCPassword = this.cpassword.replace(/\s/g, '');
        const passwordValid = formattedPassword && !/\s/.test(formattedPassword) && !/[ก-๙]/.test(formattedPassword) && formattedPassword.length >= 8;
        const cpasswordValid = formattedCPassword && !/\s/.test(formattedCPassword) && !/[ก-๙]/.test(formattedCPassword);
        const citizenValid = /^\d{13}$/.test(this.citizen);
        const nameValid = this.firstname.trim() && this.lastname.trim();
        const phoneValid = /^\d{10}$/.test(this.phone);
        const ftiMemberValid = !this.ftiMember || (this.ftiMember && this.fti_member && this.fti_member.trim());
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email) && !/example\.com/.test(this.email); // Modify this line
        const policyAgreed = this.agreedToPolicy; // Add this line
        return passwordValid && cpasswordValid && this.passwordMatch && citizenValid && nameValid && phoneValid && ftiMemberValid && emailValid && policyAgreed;
    }
  },
  methods: {
    validateEmail(e) {
        const key = e.key;
        if (/\s/.test(key) || /[ก-๙]/.test(key)) {
        e.preventDefault();
        }
    },
    checkPasswordValid(password) {
        const formattedPassword = password.replace(/\s/g, '');
        return formattedPassword && !/\s/.test(formattedPassword) && !/[ก-๙]/.test(formattedPassword);
    },
    checkCPasswordValid(cpassword) {
        const formattedCPassword = cpassword.replace(/\s/g, '');
        return formattedCPassword && !/\s/.test(formattedCPassword) && !/[ก-๙]/.test(formattedCPassword) && formattedCPassword === this.password;
    },
    checkPasswords() {
        const formattedPassword = this.password.replace(/\s/g, '');
        const formattedCPassword = this.cpassword.replace(/\s/g, '');
        this.passwordMatch = formattedPassword === formattedCPassword;
        if (formattedPassword.length < 8 || /\s/.test(formattedPassword) || /[ก-๙]/.test(formattedPassword)) {
            this.passwordValid = false;
        } else {
            this.passwordValid = true;
        }
        this.password = formattedPassword;
        this.cpassword = formattedCPassword;
    },
    validatePassword(e) {
      const key = e.key;
      if (/\s/.test(key) || /[ก-๙]/.test(key)) {
        e.preventDefault();
      }
    },
    preventPaste(e) {
      e.preventDefault();
    },
    async submitForm() {
        if (this.validForm) {
            console.log("All Form Valid");
            try {
                this.activeBlock = true
                const salt = CryptoJS.lib.WordArray.random(16);
                const hash = CryptoJS.SHA256(this.password + salt).toString();
                const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/", {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json','client-token-key':this.config.key},
                    body: JSON.stringify({
                        data: {
                            firstname: this.firstname,
                            lastname: this.lastname,
                            citizen: this.citizen,
                            phone: this.phone,
                            email: this.email,
                            username: this.email,
                            password: hash,
                            parent: this.config.siteID,
                            salt: salt.toString(),
                            role: "user",
                            info: { 
                                fti_member: this.fti_member ? true : false,
                                fti_member_number: this.fti_member,
                                agree: this.agreedToPolicy
                            }
                        },
                        options: {
                            fieldType: [],
                            uniqueFields: [
                                ["email","phone","citizen"]
                            ]
                        }
                    })
                });
                const resJSON = await resAPI.json();
                
                if (resAPI.status === 400 && resJSON.message === "duplicate") {
                    this.activeBlock = false;
                    const fields = resJSON.fields.map(field => getLabelText(field)).join(', ');
                    this.$swal({ 
                        title: "มีข้อมูลเหล่านี้อยู่ในระบบแล้ว !",
                        text: `ฟิลด์: ${fields} กรุณาตรวจสอบข้อมูลของคุณให้ถูกต้องอีกครั้ง`,
                        type: "error",
                        showCancelButton: false,
                        confirmButtonColor: "#0054b4",
                        confirmButtonText: "ตกลง",
                        closeOnConfirm: true,
                        closeOnCancel: false 
                    });
                } else if(resAPI.status === 200) {
                    this.activeBlock = false;
                    this.$swal({ 
                        title: "ทำการลงทะเบียนเรียบร้อยแล้ว ?",
                        text: "คุณต้องการที่จะดำเนินการอย่างไร !",
                        type: "success",
                        showCancelButton: true,
                        confirmButtonColor: "#0054b4",
                        confirmButtonText: "เข้าสู่ระบบ",
                        closeOnConfirm: false,
                        closeOnCancel: false 
                    }).then((confirmed) => {
                    if (confirmed.isConfirmed) {
                        console.log("Home");
                        //window.location.href = "/student/login"
                        //this.$router.push("/user/login");
                        this.login();
                    } else {
                        this.login();
                    }
                    });
                }
                else
                {
                    this.activeBlock = false;
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            console.log("Any Form not Valid");
        }
    },
    async login() {
        try {
          
            this.activeBlock   = true;

            const resAPILogin = await Request.POST('user/query', {
              method: 'find',
              args: [
                {
                  $and: [
                    { username: this.email }
                  ]
                }
              ]
            }, this.config.key);

            const getLogin  = resAPILogin.data;
            const loginData = getLogin.length > 0 ? getLogin[0] : null;

            console.log("loginData",loginData)

            if (loginData === null || loginData === '' || loginData === undefined) {
              this.errorStage   = true
              this.errorMessage = "ไม่พบข้อมูลบัญชีผู้ใช้นี้";
              this.activeBlock  = false;
              return;
            } else {
              const salt        = loginData.salt;
              const inputHash   = CryptoJS.SHA256(this.password + salt).toString();
              const storedHash  = loginData.password;

              console.log(inputHash,storedHash)

              if (inputHash === storedHash) {

                if(loginData.role!="user") {
                  this.errorStage   = true
                  this.errorMessage = "ไม่มีสิทธิ์เข้าใช้งานเว็บไซต์นี้";
                } else {
                  // Get User Enroll
                  const resAPI = await Request.POST('enroll/query', {
                    method: 'find',
                    hidden:  ['userID'],
                    args: [
                      {
                        $and: [
                          { userID: loginData._id }
                        ]
                      }
                    ]
                  }, this.config.key);

                  const getEnroll  = resAPI.data;
                  if(resAPI.status===200) {
                    let unitList = [];
                    let currentAccess = "";

                    const session = {
                      active: true,
                      token: loginData._id,
                      refresh: "",
                      login: true,
                      userID: loginData._id,
                      user: loginData,
                      loader: false,
                      role: loginData.role,
                      nav: "normal-nav",
                      layout: "frontend-layout",
                      current: currentAccess,
                      list: unitList,
                      enroll: getEnroll,
                      channel: 'web',
                    };
                    storageManager.update('session',session)
                    console.log("session",session);

                    if (this.showModal) {
                      window.location.reload();
                    }
                    else
                    {
                      this.$swal({
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 500,
                        icon: 'success',
                        title: 'แจ้งเตือน',
                        text: 'เข้าสู่ระบบเรียบร้อยแล้ว',
                      }).then(() => 
                      {
                        if(loginData.req_reset)
                        {
                            window.location.href = "/user/reset"
                        }
                        else {
                            window.location.reload();
                        }
                      });
                    }
                    
                  }
                }
              } else {
                this.errorStage   = true
                this.errorMessage = "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง";
              }
            }
            this.activeBlock  = false;
        } catch (error) {
          console.log(error)
        }
    }
  },
};
</script>

<template>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
        <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
            <form class="grid grid-cols-2 gap-6" @submit.prevent>
                
                <div>
                  <div class="relative mt-1">
                    <span class="input-label">ชื่อ <small class="text-red-400">(*จำเป็น)</small></span>
                    <input
                      v-model="firstname"
                      type="text"
                      placeholder="ชื่อ"
                      class="w-full p-4 border border-gray-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div class="relative mt-1">
                    <span class="input-label">นามสกุล <small class="text-red-400">(*จำเป็น)</small></span>
                    <input
                      v-model="lastname"
                      type="text"
                      placeholder="นามสกุล"
                      class="w-full p-4 border border-gray-200 text-sm"
                    />
                  </div>
                </div>
            
                <div class="col-span-2">

                  <div>
                    <div class="relative mt-1">
                      <span class="input-label">หมายเลขบัตรประจำตัวประชาชน <small class="text-red-400">(*จำเป็น)</small></span>
                      <input
                        v-model="citizen"
                        @input="citizen = $event.target.value.replace(/\D/, '').slice(0, 13)" 
                        id="citizen" 
                        name="citizen" 
                        type="text" 
                        autocomplete="" 
                        placeholder="หมายเลขบัตรประจำตัวประชาชน"
                        class="w-full p-4 border border-gray-200 text-sm"
                      />
                      <small class="text-gray-500"><span class="text-red-600 font-bold text-[16px]">*</span> ระบุเป็นตัวเลข 13 หลักเท่านั้น</small>
                    </div>
                  </div>

                </div>
                
                <div class="col-span-2">

                  <div>
                    <div class="relative mt-1">
                      <span class="input-label">อีเมล์ <small class="text-red-400">(*จำเป็น)</small></span>
                      <input
                        v-model="email"
                        id="email" 
                        name="email"
                        type="text"
                        placeholder="อีเมล์"
                        class="w-full p-4 border border-gray-200 text-sm"
                        @keypress="validateEmail"
                      />
                      <small class="text-gray-500"><span class="text-red-600 font-bold text-[16px]">*</span> ใช้สำหรับเข้าสู่ระบบ</small>
                    </div>
                  </div>
                </div>

                <div>
                  <div class="relative mt-1">
                    <span class="input-label">รหัสผ่าน <small class="text-red-400">(*จำเป็น)</small></span>
                    <input v-model="password" id="password" name="password" :type="showPassword1 ? 'text' : 'password'" autocomplete="" placeholder="****" class="block w-full p-3 border border-gray-200 text-sm" @keypress="validatePassword" @paste="preventPaste">
                    <button @click="showPassword1 = !showPassword1" type="button" class="absolute top-[10px] right-[12px] px-2 py-1 bg-gray-200 rounded-md text-xs">
                        {{ showPassword1 ? 'ซ่อน' : 'แสดง' }}
                    </button>
                  </div>
                </div>

                <div>
                  <div class="relative mt-1">
                    <span class="input-label">ยืนยันรหัสผ่าน <small class="text-red-400">(*จำเป็น)</small></span>
                    <input v-model="cpassword" id="cpassword" name="cpassword" :type="showPassword2 ? 'text' : 'password'" autocomplete="" placeholder="****" class="block w-full p-3 border border-gray-200 text-sm" @keypress="validatePassword" @paste="preventPaste">
                    <button @click="showPassword2 = !showPassword2" type="button" class="absolute top-[10px] right-[12px] px-2 py-1 bg-gray-200 rounded-md text-xs">
                        {{ showPassword2 ? 'ซ่อน' : 'แสดง' }}
                    </button>
                  </div>
                </div>
                        
                <div class="col-span-2">

                  <div>
                    <div class="relative mt-1">
                      <span class="input-label">เบอร์โทร <small class="text-red-400">(*จำเป็น)</small></span>
                      <input 
                      v-model="phone"
                      @input="phone = $event.target.value.replace(/\D/, '').slice(0, 10)"
                      id="phone"
                      name="phone"
                      type="text"
                      autocomplete="phone"
                      placeholder="เบอร์โทร"
                      class="w-full p-4 border border-gray-200 text-sm"
                      />
                      <small class="text-gray-500"><span class="text-red-600 font-bold text-[16px]">*</span> ระบุเป็นตัวเลขมือถือ 10 หลักเท่านั้น</small>
                    </div>
                  </div>

                </div>
                
                <div class="col-span-2 hidden ">
                    <div class="flex items-center">
                        <input id="ftiMember" name="ftiMember" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" v-model="ftiMember">
                        <label for="ftiMember" class="ml-2 block text-md text-gray-900">สมัครในนามสมาชิก สภาอุตสาหกรรมแห่งประเทศไทย</label>
                    </div>
                </div>

                <div class="col-span-2" v-if="ftiMember">
                    <label for="fti_member" class="block text-md font-semibold leading-6 text-gray-900">หมายเลขสมาชิก ส.อ.ท.</label>
                    <div class="mt-2">
                        <input v-model="fti_member" id="fti_member" name="fti_member" type="text" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    </div>
                </div>

                <div class="col-span-2">
                    <div class="flex items-center">
                        <input v-model="agreedToPolicy" id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
                        <label for="remember-me" class="ml-2 block text-md text-gray-900">คุณยอมรับ <Modal title="นโยบายความเป็นส่วนตัว"/> ของ เว็บไซต์.</label>
                    </div>
                </div>
            
                <div class="col-span-2">
                    <div class="col-span-2" v-if="!validForm">
                        <div class=" items-center px-3 py-1 rounded-md bg-blue-100 text-sm text-black pb-5 mb-5">
                            <div class="font-semibold pt-3 pb-3">คำแนะนำในการสมัคร</div>

                            <div v-if="!firstname" class="w-full">
                            ** กรุณากรอกชื่อ
                            </div>

                            <div v-if="!lastname" class="w-full">
                            ** กรุณากรอกนามสกุล
                            </div>

                            <div v-if="!citizenValid" class="w-full">
                            ** หมายเลขบัตรประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น
                            </div>

                            <div v-if="!validPhone" class="w-full">
                            ** เบอร์โทรต้องเป็นตัวเลข 10 หลักเท่านั้น
                            </div>

                            <div v-if="!passwordValid" class="w-full">
                            ** รหัสผ่านต้องมีอักขระ 8-20 ตัวและไม่มีช่องว่าง
                            </div>

                            <div v-if="!cpasswordValid" class="w-full">
                            ** ยืนยันรหัสผ่านไม่ตรงกับรหัสผ่าน
                            </div>

                            <div v-if="ftiMember && (!fti_member || !fti_member.trim())" class="w-full">
                            ** กรุณากรอกหมายเลขสมาชิก ส.อ.ท.
                            </div>
                            
                            <div v-if="!emailValid" class="w-full">
                            ** กรุณากรอกอีเมล์ให้ถูกต้อง
                            </div>

                            <div v-if="!agreedToPolicy" class="w-full">
                            ** กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนลงทะเบียน
                            </div>

                        </div>
                    </div>
                      
                    <button @click="submitForm" :disabled="!validForm" type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-4 text-ทก font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                      <font-awesome-icon :icon="['fas', 'user-plus']" class="mr-2"/> สมัครสมาชิก
                    </button>
                    
                </div>

            </form>
  
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
<template>
    <div>
      <button @click="openComposeEmailPopup" :disabled="toast !== null">
        <font-awesome-icon :icon="['fas','envelope']" class="text-black text-md"/> email {{ toast }}
      </button>
      <div v-if="showComposePopup" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="fixed inset-0 bg-black bg-opacity-50"></div>
        <div class="bg-white w-[500px] shadow-md relative">

            <div class="bg-gray-700 border-b border-gray-200 p-2">
                <h3 class="text-base text-white text-left"><font-awesome-icon :icon="['fas','envelope']" class="text-white text-md"/> ส่งข้อความใหม่</h3>
                <div class="absolute top-0 right-0 m-3">
                    <button @click="closeComposeEmailPopup" class="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <font-awesome-icon :icon="['fas','times']" class="text-white text-md"/>
                    </button>
                </div>
            </div>

            <div class="border-b border-gray-200 p-4">
                <p class="text-gray-400 text-left">
                    <span class="block pb-1"><font-awesome-icon :icon="['fas','user']" class="text-gray-500 text-md"/> <span class="text-gray-600"><span class="font-bold mr-1">{{ this.name }} </span>&lt;{{this.email}}&gt;</span></span>
                </p>
            </div>

          <div class="p-4">
            
            <div class="mt-2 mb-4 relative">
              <label for="subject" class="absolute top-0 left-0 bg-white text-sm text-left compose-label">หัวข้อ</label>
              <input
                type="text"
                v-model="subject"
                id="subject"
                placeholder="Subject"
                class="w-full py-2 px-3 border border-gray-300 focus:outline-none"
              />
            </div>
          
            <div class="relative">
              <MiniMCE v-model="body" :options="{ menubar: false , toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | forecolor | removeformat' }" />
            </div>

          </div>

          <div class="bg-gray-100 border-t border-gray-200 p-4">
            <div class="flex justify-start">
                <button
                  @click="sendEmail"
                  :disabled="sending"
                  class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-sm text-base focus:outline-none"
                >
                <font-awesome-icon :icon="['fas','envelope']" class="text-white text-md"/> ส่งข้อความ
                </button>
                <button
                  @click="closeComposeEmailPopup"
                  class="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-sm text-base focus:outline-none ml-2"
                >
                  ยกเลิก
                </button>
            </div>
        </div>
          
        </div>
      </div>

    </div>
  </template>
  
  <script>

  import { sendEmail } from '@/plugins/sendEmail.js';
  import toast from '@/plugins/ToastUI.js';
  
  import MiniMCE from 'minimce'
  import 'tinymce/skins/ui/oxide/skin.min.css'
  import 'tinymce/themes/silver/theme'
  import 'tinymce/icons/default/icons'
  
  export default {
    props: {
      emailData: {
        type: Object,
        required: true,
      },
    },
    components: {
        MiniMCE
    },
    data() {
      return {
        toast: null,
        showComposePopup: false,
        subject: '',
        body: '',
        email: '',
        name: '',
        sending: false,
      };
    },
    methods: {
      openComposeEmailPopup() {
        this.showComposePopup = true;
        this.subject = this.emailData.subject;
        this.body = this.emailData.body;
        this.email = this.emailData.email;
        this.name = this.emailData.name;
      },
      closeComposeEmailPopup() {
        this.showComposePopup = false;
        this.subject = '';
        this.body = '';
        this.email = '';
        this.name = '';
      },
      async sendEmail() {
        this.showComposePopup = false;
        this.sending = true;
        this.toast = toast({ type: 'pending', message: 'Sending email...' });

        try {
          const response = await sendEmail({
            subject: this.subject,
            body: this.body,
            email: this.email,
            name: this.name,
          });

          this.toast.hide('Email sent successfully.', 'success', 300);
          this.toast = null;

          //this.showToast('Email sent successfully.', 'success');
          this.$emit('email-sent', true, response);

        } catch (error) {

          this.showToast('Failed to send email.', 'error');
          this.$emit('email-sent', false, error);

        } finally {
          this.sending = false;
        }
      },
    },
  };
  </script>

  <style scoped>
    .compose-label {
        margin-top: -10px;
        margin-left: 5px;
        padding-right: 10px;
        padding-left: 10px;
        font-size: 12px;
        color: #b6b6b6;
    }

    .fade-in {
        opacity: 1;
        transition: opacity 0.3s ease-in;
    }

    .fade-out {
        opacity: 0;
        transition: opacity 0.3s ease-out;
    }
    .tox-tinymce {
        border: 1px solid #dedede!important;
        border-radius: 0px!important;
        font-family: Noto Sans Thai, Sans-serif!important;
    }

    .tox {
        font-family: Noto Sans Thai, Sans-serif!important;
    }
  </style>
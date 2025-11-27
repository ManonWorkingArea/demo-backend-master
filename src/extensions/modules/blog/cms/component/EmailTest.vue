<template>
    <div class="email-test">
      <h2>Test Send Email</h2>
      <div>
        <label>Recipient Name:</label>
        <input v-model="recipientName" placeholder="Enter recipient name" />
      </div>
      <div>
        <label>Recipient Email:</label>
        <input v-model="recipientEmail" placeholder="Enter recipient email" />
      </div>
      <div>
        <label>Email Subject:</label>
        <input v-model="emailSubject" placeholder="Enter email subject" />
      </div>
      <div>
        <label>Email Content:</label>
        <MiniMCE v-model="emailContent" :options="{ menubar: false , toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | forecolor | removeformat' }" />
      </div>
      <div>
        <label>Insert Shortcode:</label>
        <div class="shortcode-tags">
          <span class="shortcode-tag" @click="insertShortcode('[sitename]')">[sitename]</span>
          <span class="shortcode-tag" @click="insertShortcode('[customer_name]')">[customer_name]</span>
          <span class="shortcode-tag" @click="insertShortcode('[customer_email]')">[customer_email]</span>
        </div>
      </div>
      <button @click="sendTestEmail">Send Test Email</button>
    </div>
  </template>
  
  <script>
  import { sendEmail } from './sendEmail';

  import MiniMCE from 'minimce'
  import 'tinymce/skins/ui/oxide/skin.min.css'
  import 'tinymce/themes/silver/theme'
  import 'tinymce/icons/default/icons'
  export default {
    components: {
        MiniMCE
    },
    data() {
      return {
        recipientName: '',
        recipientEmail: '',
        emailSubject: '',
        emailContent: ''
      };
    },
    methods: {
      async sendTestEmail() {
        const emailData = {
          name: this.recipientName,
          email: this.recipientEmail,
          subject: this.emailSubject,
          body: this.emailContent
        };
  
        try {
          const response = await sendEmail(emailData);
          console.log('Email sent successfully:', response);
        } catch (error) {
          console.error('Error sending email:', error);
        }
      },
      insertShortcode(shortcode) {
        this.emailContent += ` ${shortcode}`;
      }
    }
  };
  </script>
  
  <style scoped>
  .email-test {
    max-width: 500px;
    margin: 0 auto;
  }
  .email-test div {
    margin-bottom: 15px;
  }
  .email-test label {
    display: block;
    margin-bottom: 5px;
  }
  .email-test input, .email-test textarea {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  .shortcode-tags {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  .shortcode-tag {
    padding: 5px 10px;
    background-color: #f0f0f0;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .shortcode-tag:hover {
    background-color: #d0d0d0;
  }
  </style>
  
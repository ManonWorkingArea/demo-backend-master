<template>
    <div></div>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  
  export default {
    props: ['data'],
    data() {
      return {
        login: storageManager.get('session', 'login'), // Getting the login session
      };
    },
    mounted() {
      this.checkAuthentication();
    },
    methods: {
      checkAuthentication() {
        // Determine if the check condition is met
        const checkPassed = (this.data.check === 'user' && this.login) || (this.data.check === 'guest' && !this.login);
  
        if (!checkPassed) {
          // Handle the condition if the check fails
          this.handleFailedCheck();
        }
      },
      handleFailedCheck() {
        const condition = this.data.condition;
        switch (condition) {
          case 'redirect':
            window.location.href = this.data.redirectUrl || '/login'; // Redirect to login or specified URL
            break;
          case 'popup':
            alert(this.data.popupText || 'You do not have the necessary permissions to view this content.'); // Show a popup message with custom or default text
            break;
          case 'block':
            console.log(this.data.blockText || 'Access blocked.'); // Log a message with custom or default text
            break;
          default:
            console.warn('Unknown condition:', condition);
        }
      }
    }
  };
  </script>
  
<template>
    <div class="cookie-policy-popup-overlay" v-if="!this.hasAgreedToCookiePolicy">
      <div class="cookie-policy-popup-modal">

            <div class="cookie-policy-header font-bold">
            Cookie Policy
            </div>

            <div class="cookie-policy-body">
                <div v-if="showCookieDetails" class="cookie-details">
                    <h3>Cookie Details</h3>
                    <p>This website uses the following types of cookies:</p>
                    <ul>
                    <li>
                        <input type="checkbox" v-model="allowSessionCookies" />
                        <strong>Session cookies: </strong><br>used to remember your preferences and settings during your current visit
                    </li>
                    <li>
                        <input type="checkbox" v-model="allowAnalyticsCookies" />
                        <strong>Analytics cookies:</strong><br>used to collect data about how visitors use our site, such as the pages they visit and the links they click on
                    </li>
                    <li>
                        <input type="checkbox" v-model="allowAdvertisingCookies" />
                        <strong>Advertising cookies:</strong><br>used to show you relevant ads based on your interests and browsing history
                    </li>
                    <li>
                        <input type="checkbox" v-model="allowNonEssentialCookies" />
                        <strong>Non-essential cookies:</strong><br>used for non-essential functionality such as analytics, advertising, and social media integration
                        </li>
                        <li>
                        <input type="checkbox" v-model="allowMarketingCookies" />
                        <strong>Marketing cookies:</strong><br>used to show you relevant ads based on your interests and browsing history
                        </li>
                    </ul>
                </div>
                <p class="pt-5">This website uses cookies to improve your experience. By clicking "Agree", you consent to the use of cookies.</p>
                <a href="#" @click.prevent="showCookieDetails = !showCookieDetails">{{ showCookieDetails ? 'Hide cookie details' : 'View cookie details' }}</a>
                <div class="cookie-policy-buttons">
                    <button class="bg-gray-300 hover:bg-gray-400" @click="declineCookiePolicy">Decline</button>
                    <button class="bg-blue-500 hover:bg-blue-600" @click="agreeToCookiePolicy">Agree</button>
                    </div>
                </div>
                
            </div>
    </div>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  export default {
    name: 'CookiePolicyPopup',
    data() {
    return {
      showCookieDetails: false,
      allowSessionCookies: true,
      allowAnalyticsCookies: true,
      allowAdvertisingCookies: true,
      allowNonEssentialCookies: true,
      allowMarketingCookies: true,
    }
  },
    computed: {
    hasAgreedToCookiePolicy: {
      get() {
        return storageManager.get('cookie','agree')
      },
      set(value) {
        const cookie = {
          agree: value,
        };
        storageManager.update('cookie',cookie)
      }
    }
  },
  methods: {
    agreeToCookiePolicy() {
        const cookie = {
          'agree': true,
          'allowSessionCookies': this.allowSessionCookies,
          'allowAnalyticsCookies': this.allowAnalyticsCookies,
          'allowAdvertisingCookies': this.allowAdvertisingCookies,
          'allowNonEssentialCookies': this.allowNonEssentialCookies,
          'allowMarketingCookies': this.allowMarketingCookies
        };
        storageManager.update('cookie',cookie)
        
        this.$nextTick(() => {
          if (!this.hasAgreedToCookiePolicy) {
            this.hideModal()
          }
        })
    },
    declineCookiePolicy() {
          this.hasAgreedToCookiePolicy = false
          this.$nextTick(() => {
            if (!this.hasAgreedToCookiePolicy) {
              this.hideModal()
            }
          })
        },
      hideModal() {
        const modal = document.querySelector('.cookie-policy-popup-overlay')
        modal.style.display = 'none'
      }
    }
  }
  </script>
  
  <style>

  .cookie-policy-buttons {
    display: flex;
    justify-content: space-between;
  }
  
  .cookie-details h3::before {
    content: '';
    display: inline-block;
    vertical-align: middle;
    background: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dL6YVxRFIpiADJDmDFl-PZv8CMzzk1Tugr6V3b1OrW52WUjcvSKRqdelHu3_7U2xfs4&usqp=CAU') no-repeat;
    background-size: contain;
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }

  .cookie-policy-popup-overlay {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    overflow: auto;
  }
  
  .cookie-policy-popup-modal {
    width: 500px;
    max-width: 100%;
    margin: 50px auto;
    background: white;
    border-radius: 5px;
    padding: 20px;
    text-align: center;
  }
  
  .cookie-policy-popup-modal p {
    font-size: 14px;
    margin: 0 0 10px;
  }
  
  .cookie-policy-popup-modal a {
    font-size: 14px;
    color: #007bff;
    text-decoration: none;
  }
  
  .cookie-policy-popup-modal .cookie-details {
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 20px 0;
    padding: 20px;
  }
  
  .cookie-policy-popup-modal .cookie-details h3 {
    margin: 0 0 10px;
    font-size: 16px;
  }
  
  .cookie-policy-popup-modal .cookie-details p {
    font-size: 14px;
    margin: 0 0 10px;
  }
  
  .cookie-policy-popup-modal .cookie-details ul {
    list-style: none;
    margin: 0;
    padding: 0;
    text-align: left;
    margin-left: 0;
  padding-left: 0;
  }
  
  .cookie-policy-popup-modal .cookie-details ul li {
    margin: 5px 0;
    border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
  }

  .cookie-details ul li input[type="checkbox"] {
    margin-right: 10px;
  }

  .cookie-details ul li:last-child {
    border-bottom: none;
  }
  
  .cookie-policy-popup-modal button {
    display: block;
    margin: 10px auto 0;
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .cookie-policy-popup-modal button:hover {
    background: #0069d9;
  }
  </style>
  
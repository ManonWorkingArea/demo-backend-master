<template>
<div class="form-wrapper">
    <div>
        <form ref="form" @submit.prevent="submitForm">
            <slot />
        </form>
        <div v-if="submitting" class="overlay fixed inset-0 bg-white/90 z-50">
            <Loading />
            <div class="preload">
                <div class="loading-text">{{ loadingText }}</div>
                <div class="loading-dot"><span class="dot dot1">.</span><span class="dot dot2">.</span><span class="dot dot3">.</span></div>
            </div>
        </div>
        <div v-if="isSuccessful" class="overlay success fixed bg-white/90">
            <div class="relative">
                <div class="mx-auto flex mb-5 h-12 w-12 items-center justify-center rounded-full bg-green-700">
                    <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                <div>
                    <div class="success-message text-green-500">{{ successText }}</div>
                </div>
                <div class="">
                    <button @click="successCallback" type="button" class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm">
                        ปิดการแจ้งเตือน
                    </button>
                </div>
            </div>
        </div>
        <div v-if="error" class="overlay error fixed bg-white/90">

            <div class="relative">

                <div class="mx-auto flex mb-5 h-12 w-12 items-center justify-center rounded-full bg-red-700">
                  <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12" y2="16"></line>
                  </svg>
                </div>

                <div>
                    <div class="error-message text-red-500">{{ error.message }}</div>
                </div>
                <div class="">
                    <button @click="closeOverlay" type="button" class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm">
                        ปิดการแจ้งเตือน
                    </button>
                </div>
            </div>

        </div>
    </div>
</div>
</template>

<script>
import axios from 'axios'
import Loading from '../utils/Loading';
export default {
    name: 'FormWrapper',
    data() {
        return {
            submitting: false,
            error: null,
            success: false,
            successText: 'Success!',
        }
    },
    components: {
        Loading,
    },
    computed: {
        isSuccessful() {
            return this.success;
        },
    },
    methods: {
        async submitForm(event) {
            event.preventDefault();
            this.submitting = true;
            try {
                const formData = new FormData(this.$refs.form);
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
                const response = await axios.post(this.url, formData, config);
                this.success = true;
                this.$emit('success', response.data);
                this.successText = response
                if (this.successCallback) {
                    this.successCallback(response.data);
                }
            } catch (error) {
                console.log('Error', error.response.data.message);
                this.handleError(error);
            } finally {
                this.submitting = false;
            }
        },

        closeOverlay() {
            this.error = null
        },
        handleError(error) {
            console.log(error.response.data.message)
            this.error = error.response.data || error
            this.$emit('error', error.response || error)
        }
    },
    props: {
        url: {
            type: String,
            required: true
        },
        successCallback: {
            type: Function,
            required: false
        },
        loadingText: {
            type: String,
            default: 'กำลังโหลดข้อมูล',
        },
    }
}
</script>

<style>
.loader-spinner {
    width: 64px;
    height: 44px;
    position: relative;
    border: 5px solid #000;
    border-radius: 8px;
}

.loader-spinner::before {
    content: '';
    position: absolute;
    border: 5px solid #000;
    width: 32px;
    height: 28px;
    border-radius: 50% 50% 0 0;
    left: 50%;
    top: 0;
    transform: translate(-50%, -100%)
}

.loader-spinner::after {
    content: '';
    position: absolute;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #000;
    box-shadow: 16px 0 #000, -16px 0 #000;
    animation: flash 0.5s ease-out infinite alternate;
}

.loading-text {
    float: left;
    position: absolute;
    margin-top: 100px;
}

.form-wrapper {
    position: relative;
}

.overlay {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.error-message {
    text-align: center;
    margin-bottom: 1rem;
}

.success-message {
  text-align: center;
  margin-bottom: 1rem;
}
</style>

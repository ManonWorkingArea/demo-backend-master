<template>
    <div class="bg-gray-50">
        <div  v-if="userData">
            <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div class="sm:mx-auto sm:w-full sm:max-w-lg">
                    <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">ตรวจสอบข้อมูลบัญชีเรียบร้อย</h2>
                    <p class="mt-2 text-center text-sm text-gray-600">
                        ระบบกำลังประมวลผล และจะดำเนินการในขั้นตอนต่อไปโดยอัตโนมัติ...
                    </p>
                </div>
        
                <div class="mt-8  bg-white rounded-lg shadow-md sm:mx-auto sm:w-full sm:max-w-sm">
                    <div class="px-6 py-8">
                        <div class="flex justify-center mb-4">
                            <img v-if="userData.pictureUrl" :src="userData.pictureUrl" alt="Profile Picture" class="w-24 h-24 rounded-full" />
                        </div>
                        <div class="text-center">
                            <h2 class="text-2xl font-semibold">{{ userData.displayName }}</h2>
                            <p class="text-gray-600">{{ userData.userId }}</p>
                            <p v-if="userData.statusMessage" class="mt-2 text-gray-700">{{ userData.statusMessage }}</p>
                        </div>
                        <div class="text-center mt-4 text-gray-600" v-if="countdown > 0">
                            จะเปลี่ยนหน้าใน {{ countdown }} วินาที...
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div class="sm:mx-auto sm:w-full sm:max-w-lg">
                    <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">กำลังตรวจสอบบัญชีของคุณ</h2>
                    <p class="mt-2 text-center text-sm text-gray-600">
                        Handling authentication...
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

export default {
    name: 'AuthHandler',
    data() {
        return {
            configs: storageManager.get('configs'),
            hostname: storageManager.get('hostname'),
            session: storageManager.get('session'),
            userData: null,
            messageText: '',
            countdown: 5,
        };
    },
    mounted() {
        this.handleAuth();
    },
    methods: {
        async handleAuth() {
            const code      = this.$route.query.code;
            const stateData = JSON.parse(atob(this.$route.query.state));
            const callback  = stateData.redirect;
            const hostname  = this.configs.hostname;

            if (!code) {
                console.error('No code found in URL');
                this.$router.push({ name: 'Error' });
                return;
            }

            try {
                const response = await fetch('https://gateway.cloudrestfulapi.com/auth/line', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code, hostname }),
                });

                if (!response.ok) {
                    throw new Error('Failed to login with LINE');
                }

                const { userData }  = await response.json();
                const userExists    = await this.checkUserExists(userData);

                if (!userExists) {
                    await this.createUser(userData,callback);
                } else {
                    const sessionData = this.constructSessionData(userData, userExists);
                    storageManager.update('session', sessionData);
                }
                this.userData = userData;
                this.startCountdown(callback);

            } catch (error) {
                console.error('Error during LINE authentication:', error);
            }
        },
        async checkUserExists(userData) {
            try {
                const resAPILogin = await Request.POST('user/query', {
                    method: 'find',
                    args: [{
                        $and: [
                            { username: userData.userId, channel: 'line' }
                        ]
                    }]
                }, this.configs.key);
                const getLogin = resAPILogin.data[0];
                return getLogin;
            } catch (error) {
                console.error('Error checking user existence:', error);
                throw error;
            }
        },
        constructSessionData(userData,userExists) {
            const session = {
                active: true,
                token: userExists._id,
                refresh: "",
                login: true,
                userID: userExists._id,
                user: userExists,
                loader: false,
                role: userExists.role,
                nav: "normal-nav",
                layout: "frontend-layout",
                current: '',
                list: '',
                enroll: '',
                channel: 'line',
            };
            return session;
        },
        async createUser(userData,callback) {
            try {
                const response = await fetch('https://gateway.cloudrestfulapi.com/api/user/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
                    body: JSON.stringify({
                        data: {
                            firstname: userData.displayName,
                            lastname: userData.statusMessage,
                            avatar_img: userData.pictureUrl,
                            citizen: '',
                            phone: '',
                            email: '',
                            username: userData.userId,
                            parent: this.configs.siteID,
                            role: "user",
                            channel: "line",
                            info: {}
                        },
                        options: {
                            fieldType: [],
                            uniqueFields: [
                                ["username"]
                            ]
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to create user');
                }
                const userJSON = await response.json();
                console.log("createUser",userJSON);

                const sessionData = this.constructSessionData(userJSON, userJSON);
                storageManager.update('session', sessionData);

                this.userData = userData;
                this.startCountdown(callback);
            } catch (error) {
                console.error('Error creating user:', error);
                throw error;
            }
        },
        startCountdown(callback) {
            // Countdown timer
            const timer = setInterval(() => {
                this.countdown--;
                if (this.countdown === 0) {
                    clearInterval(timer); // Stop countdown when it reaches 0
                    window.location.href = callback; // Redirect
                }
            }, 1000); // Update countdown every second
        },
        
    },
};
</script>
  
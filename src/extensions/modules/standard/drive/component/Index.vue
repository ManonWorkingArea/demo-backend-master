<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <!-- Enhanced Header Topbar -->
        <div v-if="hostnameData" class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-lg">
            <div class="w-full px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-18 py-2">
                    <div class="flex items-center space-x-6">
                        <div class="flex items-center space-x-4">
                            <div v-if="hostnameData.siteLogo" class="relative">
                                <img 
                                    :src="hostnameData.siteLogo" 
                                    :alt="hostnameData.siteName"
                                    class="h-12 w-auto rounded-lg"
                                >
                            </div>
                            <div class="flex flex-col">
                                <h1 class="text-sm font-bold text-gray-900 tracking-tight">{{ hostnameData.siteName }}</h1>
                                <p class="text-xs text-gray-500 font-medium">{{ hostnameData.hostname }}</p>
                            </div>
                        </div>
                        <div class="hidden sm:block h-8 w-px bg-gray-300"></div>
                        <div class="hidden sm:flex items-center space-x-2">
                            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span class="text-sm text-gray-600 font-medium">กำลังเชื่อมต่อ</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <span class="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 shadow-sm">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                            </svg>
                            เนื้อหาที่แชร์
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 min-h-0">
            <!-- Normal Mode (เมื่อไม่มี ID ใน route) -->
            <FileManager 
                v-if="!shareId"
                Mode="normal"
                :AllowFile="['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'mp4', 'mp3', 'avi', 'mov', 'wmv', 'zip', 'rar']"
                CallbackFunc=""
                Client="drive"
                :Space="[]"
            />
            
            <!-- Share Mode for Folder (เมื่อมี ID และเป็นโฟลเดอร์) -->
            <FileManager 
                v-if="shareId && shareType === 'folder'"
                Mode="share"
                :ShareId="shareId"
                :ShareKey="shareKey"
                :AllowFile="['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'mp4', 'mp3', 'avi', 'mov', 'wmv', 'zip', 'rar']"
                CallbackFunc=""
                Client="drive"
                :Space="[]"
            />
            
            <!-- Share Mode for File (เมื่อมี ID และเป็นไฟล์) -->
            <div v-if="shareId && shareType === 'file'" class="flex-1 bg-gray-50">
                <FilePreview :fileId="shareId" :shareKey="shareKey" />
            </div>
            
            <!-- Error State (เมื่อไม่พบไฟล์หรือไม่ได้แชร์) -->
            <div v-if="shareId && (shareType === 'notfound' || shareType === 'error' || shareType === 'expired')" class="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
                <div class="text-center max-w-md w-full px-6">
                    <!-- Error Icon -->
                    <div class="relative mb-8">
                        <div class="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-white">
                            <font-awesome-icon 
                                :icon="shareType === 'error' ? ['fas', 'exclamation-triangle'] : shareType === 'expired' ? ['fas', 'clock'] : ['fas', 'folder-open']" 
                                class="text-red-500 text-3xl"
                            />
                        </div>
                    </div>
                    
                    <!-- Error Title -->
                    <h2 class="text-3xl font-extrabold text-gray-800 mb-3 tracking-tight">
                        {{ shareType === 'error' ? '⚠️ เกิดข้อผิดพลาด' : shareType === 'expired' ? '⏰ ลิงก์หมดอายุ' : '🔍 ไม่พบรายการ' }}
                    </h2>
                    
                    <!-- Error Subtitle -->
                    <p class="text-lg text-gray-600 mb-8 font-medium">
                        {{ shareType === 'error' ? 'ระบบไม่สามารถโหลดข้อมูลได้' : shareType === 'expired' ? 'ลิงก์แชร์นี้หมดอายุแล้ว' : 'รายการที่แชร์ไม่พร้อมใช้งาน' }}
                    </p>
                    
                    <!-- Error Message Card -->
                    <div class="bg-white rounded-2xl p-6 mb-8 shadow-xl border border-gray-200 backdrop-blur-sm">
                        <div class="flex items-start space-x-3">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <font-awesome-icon :icon="['fas', 'info-circle']" class="text-red-500 text-sm"/>
                                </div>
                            </div>
                            <div class="flex-1 text-left">
                                <p class="text-gray-700 leading-relaxed text-sm">
                                    {{ shareType === 'error' 
                                        ? 'เซิร์ฟเวอร์กำลังประสบปัญหาชั่วคราว กรุณาลองใหม่ในอีกสักครู่' 
                                        : shareType === 'expired'
                                        ? 'ลิงก์แชร์นี้เกินระยะเวลาที่กำหนดแล้ว กรุณาติดต่อผู้แชร์เพื่อขอลิงก์ใหม่'
                                        : 'ไฟล์หรือโฟลเดอร์นี้อาจถูกลบ หยุดแชร์ หรือลิงก์ไม่ถูกต้อง' 
                                    }}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Help Text -->
                    <div class="mt-8 pt-6 border-t border-gray-200">
                        <p class="text-gray-500 text-xs leading-relaxed">
                            💡 <strong>เคล็ดลับ:</strong> {{ shareType === 'expired' ? 'ติดต่อผู้แชร์เพื่อขอลิงก์ใหม่' : 'ตรวจสอบลิงก์ให้ถูกต้อง หรือติดต่อผู้แชร์รายการนี้' }}
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Loading State -->
            <div v-if="shareId && shareType === null" class="flex-1 flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        </div>
        
        <!-- Password Modal -->
        <div v-if="showPasswordModal" class="fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <!-- Background overlay -->
                <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

                <!-- Modal panel -->
                <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                    <div>
                        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                            <font-awesome-icon :icon="['fas', 'lock']" class="h-6 w-6 text-blue-600"/>
                        </div>
                        <div class="mt-3 text-center sm:mt-5">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">
                                ป้อนรหัสผ่าน
                            </h3>
                            <div class="mt-2">
                                <p class="text-sm text-gray-500">
                                    เนื้อหานี้ได้รับการป้องกันด้วยรหัสผ่าน กรุณาป้อนรหัสผ่านเพื่อเข้าถึง
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="mt-5 sm:mt-6">
                        <input 
                            v-model="passwordInput"
                            type="password"
                            placeholder="กรุณาป้อนรหัสผ่าน"
                            @keyup.enter="checkPassword"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div v-if="passwordError" class="mt-2 text-sm text-red-600">
                            {{ passwordError }}
                        </div>
                        <button
                            @click="checkPassword"
                            type="button"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
                            เข้าถึง
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import FileManager from '@/interface/template/FileManager.vue';
import FilePreview from './FilePreview.vue';
import storageManager from '@/plugins/storage';

export default {
    data() {
        const session = storageManager.get('session');

        return {
            hostkey: this.$Key,
            session: session,
            shareId: null, // ID ของโฟลเดอร์หรือไฟล์ที่จะแชร์
            shareKey: null, // Key สำหรับการยืนยันความปลอดภัย
            shareType: null, // 'folder' หรือ 'file'
            hostnameData: null, // เก็บข้อมูล hostname
            shareData: null, // เก็บข้อมูลการแชร์
            passwordRequired: false, // ต้องใส่รหัสผ่านหรือไม่
            passwordInput: '', // รหัสผ่านที่ผู้ใช้ป้อน
            passwordError: '', // ข้อความ error รหัสผ่าน
            isExpired: false, // หมดอายุหรือไม่
            showPasswordModal: false, // แสดง modal รหัสผ่านหรือไม่
        };
    },
    components: {
        FileManager,
        FilePreview,
    },
    async mounted() {
        // ตรวจสอบว่ามี ID และ shareKey ใน route parameter หรือไม่
        if (this.$route.params.id) {
            this.shareId = this.$route.params.id;
            this.shareKey = this.$route.params.shareKey;
            await this.checkShareType();
        } else {
            this.$setPageTitle("จัดการไฟล์");
        }
    },
    watch: {
        // เฝ้าติดตาม route parameter เมื่อมีการเปลี่ยนแปลง
        '$route.params': {
            async handler(newParams) {
                this.shareId = newParams.id;
                this.shareKey = newParams.shareKey;
                if (newParams.id) {
                    await this.checkShareType();
                } else {
                    this.shareType = null;
                    this.$setPageTitle("จัดการไฟล์");
                }
            },
            immediate: true
        }
    },
    methods: {
        async checkShareType() {
            try {
                // ตรวจสอบว่ามี shareKey หรือไม่ (สำหรับความปลอดภัย)
                if (!this.shareKey) {
                    this.shareType = 'notfound';
                    this.$setPageTitle("ลิงก์ไม่ถูกต้อง");
                    return;
                }

                // ใช้ aggregate เพื่อตรวจสอบประเภทของ share ID และเช็ค share status
                const pipeline = [
                    {
                        $match: {
                            _id: this.shareId,
                            share: true,  // เช็คว่ารายการนี้ถูกแชร์หรือไม่
                            shareKey: this.shareKey  // เช็ค shareKey ที่ตรงกัน
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            mimetype: 1,
                            owner: 1,
                            share: 1,
                            shareKey: 1,
                            sharePassword: 1,
                            shareExpiryDate: 1,
                            sharePermission: 1,
                            path: 1,
                            original: 1,
                            size: 1,
                            type: 1,
                            createdAt: 1
                        }
                    }
                ];

                const payload = {
                    pipeline: pipeline
                };
                
                // ใช้ 'public' key สำหรับ share mode
                const response = await this.$Request.POST('storage/aggregate', payload, this.hostkey);
                
                if (response.data && response.data.length > 0) {
                    const item = response.data[0];
                    this.shareData = item;
                    
                    // ตรวจสอบวันหมดอายุ
                    if (item.shareExpiryDate) {
                        const expiryDate = new Date(item.shareExpiryDate);
                        const currentDate = new Date();
                        
                        if (currentDate > expiryDate) {
                            this.isExpired = true;
                            this.shareType = 'expired';
                            this.$setPageTitle("ลิงก์หมดอายุแล้ว");
                            return;
                        }
                    }
                    
                    // ตรวจสอบรหัสผ่าน
                    if (item.sharePassword) {
                        this.passwordRequired = true;
                        
                        // ตรวจสอบว่าผู้ใช้ป้อนรหัสผ่านหรือยัง
                        const enteredPassword = sessionStorage.getItem(`share_password_${this.shareId}`);
                        if (!enteredPassword || enteredPassword !== item.sharePassword) {
                            this.showPasswordModal = true;
                            return; // รอให้ป้อนรหัสผ่านก่อน
                        }
                    }
                    
                    this.shareType = item.mimetype === 'folder' ? 'folder' : 'file';
                    
                    // Step 2: ใช้ owner ในการดึงข้อมูลจาก hostname/aggregate (ข้อมูลคนละส่วน)
                    if (item.owner) {
                        const secondPipeline = [
                            {
                                $match: {
                                    _id: item.owner
                                }
                            }
                        ];

                        const secondPayload = {
                            pipeline: secondPipeline
                        };
                        
                        try {
                            // ใช้ hostname/aggregate กับ owner key (ข้อมูลต่างจาก storage/aggregate)
                            const hostnameResponse = await this.$Request.POST('hostname/aggregate', secondPayload, this.hostkey);
                            
                            // เก็บข้อมูล hostname ไว้ใช้งาน (ไม่กระทบ logic หลัก)
                            if (hostnameResponse.data && hostnameResponse.data.length > 0) {
                                this.hostnameData = hostnameResponse.data[0];
                                console.log('Hostname data loaded:', this.hostnameData);
                                
                                // อัพเดท page title ด้วยข้อมูล site
                                const siteName = this.hostnameData.siteName || 'Unknown Site';
                                if (this.shareType === 'folder') {
                                    this.$setPageTitle(`โฟลเดอร์ที่แชร์ - ${siteName}`);
                                } else {
                                    this.$setPageTitle(`${item.name} - ${siteName}`);
                                }
                                return; // ออกจาก function เพื่อไม่ให้ set title ซ้ำ
                            }
                        } catch (hostnameError) {
                            console.warn('Failed to load hostname data:', hostnameError);
                            // ไม่ให้ error นี้กระทบต่อ logic หลัก
                        }
                    }
                    
                    if (this.shareType === 'folder') {
                        this.$setPageTitle("โฟลเดอร์ที่แชร์");
                    } else {
                        this.$setPageTitle(`${item.name} - ไฟล์ที่แชร์`);
                    }
                } else {
                    this.shareType = 'notfound';
                    this.$setPageTitle("ไม่พบรายการที่แชร์");
                }
            } catch (error) {
                console.error('Error checking share type:', error);
                this.shareType = 'error';
                this.$setPageTitle("เกิดข้อผิดพลาด");
            }
        },

        // Method สำหรับตรวจสอบรหัสผ่าน
        checkPassword() {
            if (this.passwordInput === this.shareData.sharePassword) {
                // รหัสผ่านถูกต้อง - เก็บไว้ใน sessionStorage
                sessionStorage.setItem(`share_password_${this.shareId}`, this.passwordInput);
                this.showPasswordModal = false;
                this.passwordError = '';
                
                // ดำเนินการแสดงเนื้อหาต่อ
                this.shareType = this.shareData.mimetype === 'folder' ? 'folder' : 'file';
                
                if (this.shareType === 'folder') {
                    this.$setPageTitle("โฟลเดอร์ที่แชร์");
                } else {
                    this.$setPageTitle(`${this.shareData.name} - ไฟล์ที่แชร์`);
                }
            } else {
                this.passwordError = 'รหัสผ่านไม่ถูกต้อง';
            }
        }
    }
};
</script>

<style>
/* Your component's styles go here */
</style>

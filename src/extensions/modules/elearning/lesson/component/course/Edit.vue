<script>

import { useRoute } from 'vue-router'
import Loader from '@/interface/template/Loader.vue';
import Editor from '@/extensions/modules/elearning/lesson/component/course/resource/CourseForm.vue';
import '@vuepic/vue-datepicker/dist/main.css'
import storageManager from '@/plugins/storage';

export default {
    name: 'EditLesson',
    data() {
        const route = useRoute();
        const session = storageManager.get('session')
        return {
            configs: storageManager.get('configs'),
            PageName: route.meta.title,
            PageIcon: route.meta.icon,
            PagePath: route.meta.path,
            ParentName: route.meta.parent,
            ParentPage: route.meta.page,

            checked: [],
            categoryArray: [],
            checkedType: '',
            checkedMode: '',
            checkedDisplay: '',
            checkedCertification: '',
            checkedSkip: '',

            checkedSurvey: '',

            checkedIdle: '',
            idle_popup:'5',
            idle_timeout:'30',
            idle_debug:false,

            name: '',
            ref: '',
            slug: '',
            lecturer: [],
            erp_code: '',
            hours: '',
            days: '',
            regular_price: '',
            sale_price: '',

            description: '',
            short_description: '',
            principles: '',
            objective: '',
            target: '',
            structure: '',
            
            cert_owner_personal: '',
            cert_owner_corperate: '',


            startRegistDate: '',
            endRegistDate: '',

            accessDate: '',
            endDate: '',
            endDateComplete: false,

            pretestDate: '',
            posttestDate: '',
            posttestEndDate: '',

            retestDateRound1: '',
            retestDateEndDateRound1: '',

            retestDateRound2: '',
            retestDateEndDateRound2: '',

            scoreDate: '',
            certDate: '',

            limit_seat: 'yes',
            days_class: '0',
            seat: '0',

            categoryData: [],
            typeData: [],
            modeData: [],
            displayData: [],

            isDropdownOpen: false,

            lecturersData: [],
            institutionsData: [],
            targetsData: [],
            
            selectedLecturers: [],
            selectedInstitutions: [],
            selectedTargets: [],

            isLecturerDropdownOpen: false,
            isInstitutionDropdownOpen: false,
            isTargetnDropdownOpen: false,

            

            endpoint: "",

            selectedCertificationType: '',
            selectedCertificationTemplate: '',

            cert_name: "",
            cert_qrcode: "",
            cert_course_name: "",
            cert_date: "",
            cert_age: "",
            cert_bg: "",
            cert_detail: "",

            activeBlock: false,
            schoolData: [],
            loading_sources: true,
            dataItem: this.$route.params.id,
            mode: this.$route.params.mode,
            history: this.$route.params.history,
            accessToken: session.token,
            login: session.login,
            master: session.master,
            current: session.current,

            show_description: true,
            show_short_description: true,
            show_principles: false,
            show_objective: false,
            show_target: false,
            show_structure: false,

            standalone: false,

            online: false,
            offline: false,

            has_duedate:false,
            activeTab: 'tab1', // เพิ่มตัวแปรเพื่อเก็บแท็บที่เปิดอยู่
        }
    },
    components: {
        Loader,Editor
    },
    watch: {},
    methods: {
        setActiveTab(tab) {
            this.activeTab = tab; // ฟังก์ชันเพื่อเปลี่ยนแท็บที่เปิดอยู่
        },
        // เพิ่มฟังก์ชันสำหรับเรียกใช้ฟังก์ชันของ Editor
        callEditorMethod(methodName, ...args) {
            if (this.$refs.editorComponent && typeof this.$refs.editorComponent[methodName] === 'function') {
                return this.$refs.editorComponent[methodName](...args);
            } else {
                console.error(`ไม่พบเมธอด ${methodName} ในคอมโพเนนต์ Editor`);
                return null;
            }
        },
        updataData() {
            // เรียกใช้เมธอด saveData ใน Editor (ถ้ามี) เมื่อกดปุ่มบันทึกข้อมูล
            if (this.activeTab === 'tab1' && this.$refs.editorComponent) {
                this.callEditorMethod('updataData');
            } else {
                // ตรรกะการบันทึกข้อมูลอื่นๆ สำหรับแท็บอื่น
                console.log('บันทึกข้อมูลสำหรับแท็บ:', this.activeTab);
            }
        }
    },
}
</script>

<template>
<div v-if="!loading_sources" class="text-center">
    <Loader />
</div>
<div v-if="loading_sources">

    <header class="py-2 border-gray-800 bg-white">
        <div class="w-full px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
            <div class="min-w-0 flex-1">
                <h1 class="text-xl font-bold leading-7 text-gray-700 sm:truncate sm:text-1xl sm:tracking-tight">
                    <font-awesome-icon :icon="['fas',PageIcon]" class="text-gray-500 text-[24px]" />
                    {{ PageName }}
                    <span v-if="this.master" class="text-xs font-medium bg-rose-600 pl-2 pr-2 pt-1 pb-1 ml-5 text-white">MASTER MODE</span>
                    <span v-if="!this.master" class="text-xs font-medium bg-emerald-600 pl-2 pr-2 pt-1 pb-1 ml-5 text-white">CHILD MODE</span>

                </h1>
            </div>
            <div class="mt-5 flex xl:mt-0 xl:ml-4">
                <span class="hidden sm:block">
                
                    <button @click="$router.push('/lesson/detail/' + this.history)" type="button" class="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                        <font-awesome-icon :icon="['fas','chevron-left']" class="text-black text-[12px] mr-2" /> ย้อนกลับ
                    </button>

                    <button @click="updataData" type="button" class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <font-awesome-icon :icon="['fas','save']" class="text-white text-[12px] pt-[3px] mr-2" /> บันทึกข้อมูล
                    </button>

                </span>
            </div>
        </div>
    </header>

    <div class="flex-1 bg-gray-100 border-t">
        <div class="">
            <div class="w-full">
                <div class=" sm:px-6 lg:col-span-9 lg:px-0">

                    <div class="rounded-md bg-red-50 border border-red-100 p-4 mb-5" v-if="this.master">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-bold text-red-800">คุณกำลังแก้ไขข้อมูลใน Master Data</h3>
                                <div class="mt-2 text-sm text-red-700">
                                    <ul role="list" class="list-disc space-y-1">
                                        <li>การแก้ไขข้อมูลใน Master หลังจากข้อมูลได้รับการบันทึกแล้ว หลักสููตรอื่นๆภายใต้ข้อมูลของ Master จะถูกเปลี่ยนแปลงไปด้วย กรุณาระมัดระวังในการแก้ไขข้อมูลในส่วนนี้</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Editor ref="editorComponent" :mode="'edit'" />

                </div>
            </div>
        </div>
    </div>
</div>
</template>
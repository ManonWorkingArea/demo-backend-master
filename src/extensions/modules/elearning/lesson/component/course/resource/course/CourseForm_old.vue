<script>
import { mode, display, kind, view} from "@/master/type";
import { useRoute } from 'vue-router'
import { ls } from 'vue-lsp'

/*
import MiniMCE from 'minimce'
import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/themes/silver/theme'
import 'tinymce/icons/default/icons'
*/

//import Datepicker from '@vuepic/vue-datepicker';
//import '@vuepic/vue-datepicker/dist/main.css'
import storageManager from '@/plugins/storage';

import editor from '@/interface/template/editor.vue';
import SchedulePrice from './SchedulePrice.vue';

// เพิ่ม import สำหรับ taxonomy system
import { useTaxonomy } from '@/composables/useTaxonomy';
import TaxonomySelector from './taxonomy/TaxonomySelector.vue';

export default {
    name: 'EditLesson',
    props: {
        mode: {
            type: String,
            required: true,
            validator: (value) => ['add', 'edit'].includes(value) // ตรวจสอบค่า mode
        }
    },
    data() {
        const route = useRoute();
        const session = storageManager.get('session')
        
        // Setup taxonomy composable
        const { taxonomy, loading: taxonomyLoading, error: taxonomyError } = useTaxonomy()
        
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
            checkedView: this.mode === 'add' ? 'single' : '',
            checkedMode: '',
            checkedDisplay: '',
            checkedCertification: '',
            checkedSkip: '',

            checkedSurvey: '',

            // เพิ่มตัวแปรสำหรับ certification checkbox
            certRequireExam: false,
            certRequireAssignment: false,

            checkedIdle: '',
            idle_popup:'5',
            idle_timeout:'30',
            idle_debug:false,

            checkedPricing: 'free', // เพิ่มตัวแปรสำหรับเลือกประเภทราคา

            name: '',
            ref: '',
            slug: '',
            lecturer: [],
            erp_code: '',
            hours: '',
            days: '',
            regular_price: '',
            sale_price: '',
            priceSchedules: [], // เพิ่มตัวแปรสำหรับเก็บ schedule price

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
            viewData: [],
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

            endpoint: this.mode === 'add' ? "mcourse" : "course",

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
            keywords: ['cat'],
            newKeyword: '',
            
            // เพิ่มตัวแปรสำหรับ taxonomy
            selectedTaxonomyTerms: [], // Array ของ term IDs ที่ถูกเลือก
            taxonomy: taxonomy, // Taxonomy composable instance
            taxonomyLoading: taxonomyLoading, // Loading state
            taxonomyError: taxonomyError // Error state
        }
    },
    components: {
        //Datepicker,
        editor,
        SchedulePrice,
        TaxonomySelector
    },
    computed: {
    filteredOptions() {
      return this.availableOptions.filter(option =>
        option.toLowerCase().includes(this.newKeyword.toLowerCase())
      );
    }
  },
    watch: {
        checkedType(newValue) {
            if (newValue === "onsite") {
                this.online = false;
                this.offline = true;
            }
            else
            {
                this.online = true;
                this.offline = false;
            }
        },
        checkedPricing(newValue) {
            // เคลียร์ข้อมูล priceSchedules เมื่อเปลี่ยนเป็น option อื่นที่ไม่ใช่ "มีเงื่อนไข"
            if (newValue !== 'conditional') {
                this.priceSchedules = [];
            }
        },
    },
    methods: {
        addKeyword() {
        const trimmedKeyword = this.newKeyword.trim();
        // ตรวจสอบให้แน่ใจว่า this.keywords เป็นอาร์เรย์
        if (!Array.isArray(this.keywords)) {
            this.keywords = []; // กำหนดค่าเริ่มต้นเป็นอาร์เรย์ถ้ายังไม่ได้กำหนด
        }
        if (trimmedKeyword && !this.keywords.includes(trimmedKeyword)) {
            this.keywords.push(trimmedKeyword);
        }
        this.newKeyword = '';
        },
        removeKeyword(index) {
        this.keywords.splice(index, 1);
        },
        toggleDropdown(type) {
            if (type === 'lecturer') {
                this.isLecturerDropdownOpen = !this.isLecturerDropdownOpen;
            } else if (type === 'institution') {
                this.isInstitutionDropdownOpen = !this.isInstitutionDropdownOpen;
            } else if (type === 'target') {
                this.isTargetnDropdownOpen = !this.isTargetnDropdownOpen;
            }
        },
        selectItem(item, type) {
            let selectedItems;
            if (type === 'lecturer') {
                selectedItems = this.selectedLecturers;
            } else if (type === 'institution') {
                selectedItems = this.selectedInstitutions;
            } else if (type === 'target') {
                selectedItems = this.selectedTargets;
            }

            const selectedItem = this.lecturersData.find((dataItem) => dataItem._id === item._id);

            if (selectedItems.includes(selectedItem)) {
                selectedItems = selectedItems.filter((selectedItem) => selectedItem !== selectedItem);
            } else {
                selectedItems.push(selectedItem);
            }

            if (type === 'lecturer') {
                this.selectedLecturers = selectedItems;
            } else if (type === 'institution') {
                this.selectedInstitutions = selectedItems;
            } else if (type === 'target') {
                this.selectedTargets = selectedItems;
            }
        },
        clearSelectedLecturers() {
            this.selectedLecturers = []; // Clear the selected lecturers array
        },
        clearSelectedInstitutions() {
            this.selectedInstitutions = []; // Clear the selected lecturers array
        },
        clearSelectedTargets() {
            this.selectedTargets = []; // Clear the selected lecturers array
        },
        handleCheckboxChange() {
            this.checked = this.checked.filter(item => item !== null);
            console.log(this.checked);
        },
        slugify(str) {
            str = str.replace(/^\s+|\s+$/g, ''); // trim
            str = str.toLowerCase();
            // remove accents, swap ñ for n, etc
            var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
            var to = "aaaaaeeeeiiiioooouuuunc------";
            for (var i = 0, l = from.length; i < l; i++) {
                str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }
            str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                .replace(/\s+/g, '-') // collapse whitespace and replace by -
                .replace(/-+/g, '-'); // collapse dashes
            return str;
        },
        async getData() {
            if (this.login) {
                try {
                    console.log("Auth : Course List : ", ls.get('auth'));
                    this.loading_sources = false;

                    const resAPI          = await fetch("https://gateway.cloudrestfulapi.com/api/"+this.endpoint+"/" + this.dataItem, {
                        method: 'GET',
                        headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                    });

                    const RestReturn = await resAPI.json();
                    console.log(RestReturn);

                    if (resAPI.status===200) {
                        this.name = RestReturn.name
                        this.ref = RestReturn.ref
                        this.slug = RestReturn.slug

                        this.lecturer               = RestReturn.lecturer
                        this.selectedLecturers      = RestReturn.lecturer || []
                        
                        this.institution            = RestReturn.institution
                        this.selectedInstitutions   = RestReturn.institution || []

                        this.target                 = RestReturn.target
                        this.selectedTargets        = RestReturn.target || []
                        
                        this.erp_code = RestReturn.erp_code
                        this.hours = RestReturn.hours

                        this.standalone = RestReturn.standalone

                        this.days = RestReturn.days
                        this.regular_price = RestReturn.regular_price
                        this.sale_price = RestReturn.sale_price
                        this.principles = RestReturn.principles
                        this.objective = RestReturn.objective
                        this.description = RestReturn.description
                        this.short_description = RestReturn.short_description

                        this.cert_owner_personal = RestReturn.cert_owner_personal
                        this.cert_owner_corperate = RestReturn.cert_owner_corperate
                        
                        this.structure = RestReturn.structure
                        this.schoolData = RestReturn
                        //this.checked         = RestReturn.data.category
                        this.checkedType = RestReturn.type
                        this.checkedView = RestReturn.view || 'single';
                        this.checkedMode = RestReturn.mode
                        this.checkedDisplay = RestReturn.display
                        this.checkedCertification = RestReturn.certification
                        this.selectedCertificationType = RestReturn.certification_type
                        this.checkedSkip = RestReturn.skip
                        this.checkedSurvey = RestReturn.survey
                        this.keywords = RestReturn.keywords

                        this.checkedIdle = RestReturn.idle
                        this.idle_popup = RestReturn.idle_popup
                        this.idle_timeout = RestReturn.idle_timeout
                        this.idle_debug = RestReturn.idle_debug

                        this.checkedPricing = RestReturn.pricing_type || 'free' // เพิ่มการโหลดค่า pricing_type
                        this.priceSchedules = RestReturn.price_schedules || [] // เพิ่มการโหลดข้อมูล schedule price

                        this.startRegistDate = RestReturn.startRegistDate
                        this.endRegistDate = RestReturn.endRegistDate

                        this.accessDate = RestReturn.accessDate
                        this.endDate = RestReturn.endDate
                        this.endDateComplete = RestReturn.endDateComplete

                        this.pretestDate = RestReturn.pretestDate
                        this.posttestDate = RestReturn.posttestDate
                        this.posttestEndDate = RestReturn.posttestEndDate

                        this.retestDateRound1 = RestReturn.retestDateRound1
                        this.retestDateEndDateRound1 = RestReturn.retestDateEndDateRound1

                        this.retestDateRound2 = RestReturn.retestDateRound2
                        this.retestDateEndDateRound2 = RestReturn.retestDateEndDateRound2

                        this.scoreDate = RestReturn.scoreDate
                        this.certDate = RestReturn.certDate

                        this.limit_seat = RestReturn.limit_seat
                        this.days_class = RestReturn.days_class
                        this.seat = RestReturn.seat

                        this.lesson_type = RestReturn.lesson_type

                        this.selectedCertificationTemplate = RestReturn.certification_template
                        this.cert_name = RestReturn.cert_name
                        this.cert_qrcode = RestReturn.cert_qrcode
                        this.cert_course_name = RestReturn.cert_course_name
                        this.cert_date = RestReturn.cert_date
                        this.cert_age = RestReturn.cert_age
                        this.cert_bg = RestReturn.cert_bg
                        this.cert_detail = RestReturn.cert_detail

                        this.show_description = RestReturn.show_description ? true : false;
                        this.show_short_description = RestReturn.show_short_description ? true : false;
                        this.show_principles = RestReturn.show_principles ? true : false;
                        this.show_objective = RestReturn.show_objective ? true : false;
                        this.show_target = RestReturn.show_target ? true : false;
                        this.show_structure = RestReturn.show_structure ? true : false;

                        this.has_duedate = RestReturn.has_duedate ? true : false;
                        
                        if (Array.isArray(RestReturn.category)) {
                            this.checked = RestReturn.category
                        } else {
                            this.checked = []
                        }

                        console.log("Get Cat", RestReturn.category);
                        this.loading_sources = true;

                        // โหลดข้อมูล certification checkbox
                        this.checkedCertification = RestReturn.certification
                        this.selectedCertificationType = RestReturn.certification_type
                        
                        // โหลดข้อมูล certification checkbox และรองรับระบบเก่า
                        this.certRequireExam = RestReturn.cert_require_exam || false
                        this.certRequireAssignment = RestReturn.cert_require_assignment || false
                        
                        // แปลงข้อมูลเก่าให้เข้ากับระบบใหม่
                        if (RestReturn.certification_type === 'pass_online') {
                            this.selectedCertificationType = 'online_flexible'
                            this.certRequireExam = true
                            this.certRequireAssignment = false
                        } else if (RestReturn.certification_type === 'pass_and_assignment') {
                            this.selectedCertificationType = 'online_flexible'
                            this.certRequireExam = true
                            this.certRequireAssignment = true
                        } else if (RestReturn.certification_type === 'assignment_only') {
                            this.selectedCertificationType = 'online_flexible'
                            this.certRequireExam = false
                            this.certRequireAssignment = true
                        }
                        
                        // โหลดข้อมูล taxonomy terms
                        this.loadTaxonomyTermsFromCourse(RestReturn);
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        },
        async getCategoryData() {
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/category/query", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                body: JSON.stringify({
                method: 'find',
                args: [
                    {
                    $and: [
                        { unit: this.current._id }
                    ]
                    }
                ],
                paging: { page: 1, limit: 200 }
                })
            });
            if (resAPI.ok) {
                const finalRes = await resAPI.json();
                console.log("finalRes",finalRes);
                return finalRes
            } else {
                // Handle error condition
            }
        },
        async getTypeData() {
            if (this.login) {
                try {
                    let accessToken = storageManager.get('session','token')
                    this.loading_sources = false;
                    const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/types/", {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + accessToken
                        },
                    });
                    const RestReturn = await resAPI.json();
                    console.log("Types", RestReturn);
                    return RestReturn
                } catch (error) {
                    console.log(error)
                }
            }
        },
        async getModesData() {
            if (this.login) {
                try {
                    let accessToken = storageManager.get('session','token')
                    this.loading_sources = false;
                    const resAPI = await fetch("https://asia-southeast2-elearning-6871c.cloudfunctions.net/modes/", {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + accessToken
                        },
                    });
                    const RestReturn = await resAPI.json();
                    console.log("Modes", RestReturn);
                    return RestReturn
                } catch (error) {
                    console.log(error)
                }
            }
        },
        async updataData() {
            if (this.login) {
                try {
                    this.loading_sources = true;

                    // ตรวจสอบฟิลด์ที่จำเป็น
                    if (!this.name) {
                        this.$swal({
                            title: "ข้อมูลไม่ครบถ้วน",
                            text: "กรุณากรอกชื่อหลักสูตร",
                            icon: "warning"
                        });
                        //this.loading_sources = false; // ปิด loading
                        return; // ออกจากฟังก์ชันหากข้อมูลไม่ครบ
                    }

                    this.checked.filter((value) => value !== null);

                    // ตรวจสอบถ้าเลือกฟรี ให้กำหนดราคาเป็น 0
                    const finalRegularPrice = this.checkedPricing === 'free' ? '0' : this.regular_price;
                    const finalSalePrice = this.checkedPricing === 'free' ? '0' : this.sale_price;
                    const finalPriceSchedules = this.checkedPricing === 'conditional' ? this.priceSchedules : [];

                    const method = this.mode === 'edit' ? 'PUT' : 'POST'; // กำหนดวิธีการตาม mode
                    const endpointURL = `https://gateway.cloudrestfulapi.com/api/${this.endpoint}${this.mode === 'edit' ? '/' + this.dataItem : ''}`;
                    
                    // เตรียมข้อมูล certification ให้รองรับทั้งระบบเก่าและใหม่
                    let finalCertificationType = this.selectedCertificationType
                    
                    // *** สำคัญ: แปลงจากระบบใหม่กลับไปเป็นระบบเก่าเพื่อความเข้ากันได้ย้อนหลัง ***
                    // *** ระบบจะบันทึกเป็นรูปแบบเดิมเสมอ (pass_online, pass_and_assignment, assignment_only, end, pass_offline) ***
                    if (this.selectedCertificationType === 'online_flexible') {
                        if (this.certRequireExam && this.certRequireAssignment) {
                            finalCertificationType = 'pass_and_assignment'
                        } else if (this.certRequireExam && !this.certRequireAssignment) {
                            finalCertificationType = 'pass_online'
                        } else if (!this.certRequireExam && this.certRequireAssignment) {
                            finalCertificationType = 'assignment_only'
                        } else {
                            // หากไม่เลือกเงื่อนไขใดๆ ให้ใช้ 'end'
                            finalCertificationType = 'end'
                        }
                    }
                    
                    // Log เพื่อดูการแปลงข้อมูล
                    console.log('UI Selection:', this.selectedCertificationType)
                    console.log('Exam Required:', this.certRequireExam)
                    console.log('Assignment Required:', this.certRequireAssignment)
                    console.log('Final Type (บันทึกเป็นแบบเดิม):', finalCertificationType)

                    const formData = {
                        unit: this.current._id,
                        name: this.name,
                        slug: this.slugify(this.slug),
                        lecturer: this.selectedLecturers,
                        institution: this.selectedInstitutions,
                        target: this.selectedTargets,
                        erp_code: this.erp_code,
                        hours: this.hours,
                        standalone: this.standalone,
                        days: this.days,
                        category: this.checked,
                        type: this.checkedType,
                        view: this.checkedView,
                        mode: this.checkedMode,
                        display: this.checkedDisplay,
                        certification: this.checkedCertification,
                        certification_type: finalCertificationType,
                        skip: this.checkedSkip,
                        survey: this.checkedSurvey,
                        idle: this.checkedIdle,
                        idle_popup: this.idle_popup,
                        idle_timeout: this.idle_timeout,
                        idle_debug: this.idle_debug,
                        pricing_type: this.checkedPricing, // เพิ่มการส่งค่า pricing_type
                        regular_price: finalRegularPrice,
                        sale_price: finalSalePrice,
                        price_schedules: finalPriceSchedules, // เพิ่มการส่งข้อมูล schedule price
                        principles: this.principles,
                        objective: this.objective,
                        description: this.description,
                        short_description: this.short_description,
                        structure: this.structure,
                        cert_owner_personal: this.cert_owner_personal,
                        cert_owner_corperate: this.cert_owner_corperate,
                        startRegistDate: this.startRegistDate,
                        endRegistDate: this.endRegistDate,
                        accessDate: this.accessDate,
                        endDate: this.endDate,
                        endDateComplete: this.endDateComplete,
                        pretestDate: this.pretestDate,
                        posttestDate: this.posttestDate,
                        posttestEndDate: this.posttestEndDate,
                        retestDateRound1: this.retestDateRound1,
                        retestDateEndDateRound1: this.retestDateEndDateRound1,
                        retestDateRound2: this.retestDateRound2,
                        retestDateEndDateRound2: this.retestDateEndDateRound2,
                        retestDate: this.retestDate,
                        retestDateEndDate: this.retestDateEndDate,
                        scoreDate: this.scoreDate,
                        certDate: this.certDate,
                        limit_seat: this.limit_seat,
                        days_class: this.days_class,
                        seat: this.seat,
                        has_duedate: this.has_duedate,
                        certification_template: this.selectedCertificationTemplate,
                        cert_name: this.cert_name,
                        cert_qrcode: this.cert_qrcode,
                        cert_course_name: this.cert_course_name,
                        cert_date: this.cert_date,
                        cert_age: this.cert_age,
                        cert_bg: this.cert_bg,
                        cert_detail: this.cert_detail,
                        show_description: !!this.show_description,
                        show_short_description: !!this.show_short_description,
                        show_principles: !!this.show_principles,
                        show_objective: !!this.show_objective,
                        show_target: !!this.show_target,
                        show_structure: !!this.show_structure,
                        keywords: this.keywords,
                        
                        // เพิ่มข้อมูล certification checkbox
                        cert_require_exam: this.certRequireExam,
                        cert_require_assignment: this.certRequireAssignment,
                        
                        // เพิ่มข้อมูล taxonomy terms
                        taxonomy_terms: this.selectedTaxonomyTerms,
                    };

                    // Add lesson_type only when mode is 'add'
                    if (this.mode === 'add') {
                        formData.lesson_type = "master";
                    }

                    const callApi = await fetch(endpointURL, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'client-token-key': this.configs.key
                        },
                        body: JSON.stringify({
                            data: formData,
                            options: {}
                        })
                    });
                    const respond = await callApi.json();

                    if (callApi.status === 200) {
                        let masterid = null
                        if (this.mode === 'add') {
                            masterid = await this.cloneData(respond._id); // เรียกใช้ฟังก์ชัน cloneData ก่อนแสดง swal
                            console.log("masterid",masterid);
                        }
                        this.$swal({
                            title: this.mode === 'edit' ? "แก้ไขข้อมูลเรียบร้อยแล้ว" : "บันทึกข้อมูลเรียบร้อยแล้ว",
                            text: "คุณต้องการที่จะดำเนินการอย่างไร !",
                            type: "success",
                            showCancelButton: true,
                            confirmButtonColor: "#0054b4",
                            confirmButtonText: "กลับไปหน้าหลัก",
                            cancelButtonText: "รีเฟรซหน้านี้",
                            closeOnConfirm: false,
                            closeOnCancel: false
                        }).then((confirmed) => {
                            const redirectId = this.mode === 'add' ? respond._id : this.dataItem; // ใช้ respond._id ในโหมด add
                            if (confirmed.isConfirmed) {
                                const redirectUrl = this.mode === 'add' ? "/lesson/edit/" + masterid + '/child/' + masterid : "/lesson/detail/" + redirectId; // เปลี่ยนเส้นทางตามโหมด
                                window.location.href = redirectUrl; // ใช้ redirectUrl
                            } else {
                                window.location.reload(); // โหลดหน้าปัจจุบันใหม่
                            }
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        },
        async cloneData(id) {
            try {
                const count = await this.countChildCourse(id); // นับจำนวนหลักสูตรที่เป็นลูก
                const endpointURL = "https://gateway.cloudrestfulapi.com/api/mcourse/" + id; // URL สำหรับดึงข้อมูลหลักสูตร
                const resAPI = await fetch(endpointURL, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
                });
                const masterCourse = await resAPI.json(); // ดึงข้อมูลหลักสูตร

                const newCourseData = {
                    ...masterCourse,
                    name: `${masterCourse.name} - (${count + 1})`, // เปลี่ยนชื่อหลักสูตร
                    lesson_type: 'child', // กำหนดประเภทหลักสูตร
                    master: id, // กำหนด ID ของหลักสูตรหลัก
                    status: true, // กำหนดสถานะ
                };
                delete newCourseData._id; // Ensure MongoDB generates a new ObjectId
                // ส่งข้อมูลใหม่ไปยัง API เพื่อสร้างหลักสูตรใหม่
                const createResponse = await fetch("https://gateway.cloudrestfulapi.com/api/course", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'client-token-key': this.configs.key,
                    },
                    body: JSON.stringify({
                        data: newCourseData,
                        options: {}
                    })
                });
                const respond = await createResponse.json();

                if (createResponse.ok) {
                    console.log("หลักสูตรใหม่ถูกสร้างเรียบร้อยแล้ว");
                    return respond._id
                }
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการสร้างหลักสูตรใหม่:", error);
            }
        },
        async getLecturerData() {
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/lecturer/query", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
                method: 'find',
                args: [
                {
                    $and: [
                        { unit: this.current._id }
                    ]
                }
                ],
                paging: { page: 1, limit: 200 }
            })
            });
            if (resAPI.ok) {
            const finalRes = await resAPI.json();
            console.log("finalRes", finalRes);
            this.lecturersData = finalRes.data;
            } else {
            // Handle error condition
            }
        },
        async getInstitutionData() {
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/institution/query", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
                method: 'find',
                args: [
                {
                    $and: [
                        { unit: this.current._id }
                    ]
                }
                ],
                paging: { page: 1, limit: 200 }
            })
            });
            if (resAPI.ok) {
            const finalRes = await resAPI.json();
            console.log("finalRes", finalRes);
            this.institutionsData = finalRes.data;
            } else {
            // Handle error condition
            }
        },
        async getTargetsData() {
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/target/query", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
                method: 'find',
                args: [
                {
                    $and: [
                        { unit: this.current._id }
                    ]
                }
                ],
                paging: { page: 1, limit: 200 }
            })
            });
            if (resAPI.ok) {
            const finalRes = await resAPI.json();
            console.log("finalRes", finalRes);
            this.targetsData = finalRes.data;
            } else {
            // Handle error condition
            }
        },
        // เพิ่ม method สำหรับโหลดข้อมูล taxonomy terms
        loadTaxonomyTermsFromCourse(courseData) {
            if (courseData && courseData.taxonomy_terms && Array.isArray(courseData.taxonomy_terms)) {
                this.selectedTaxonomyTerms = courseData.taxonomy_terms;
                console.log('โหลด taxonomy terms จากคอร์ส:', this.selectedTaxonomyTerms);
            } else {
                this.selectedTaxonomyTerms = [];
            }
        },
        async countChildCourse(id) {
            try {
                const endpointURL = "https://gateway.cloudrestfulapi.com/api/course/count";
                const payload = {
                    args: [
                    {
                        $and: [
                        { master: id }
                        ]
                    }
                    ]
                };
                const resAPI = await fetch(endpointURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                    body: JSON.stringify(payload)
                });
                const response = await resAPI.json();
                return response.count
            } catch (error) {
                console.error("An error occurred while fetching score count:", error);
            }
        },
        async deleteData(id) {
            try {
                this.loading_sources = false;
                console.log("id",id)
                const counting = await this.countChildCourse(id);
                if(counting > 1) {
                    this.$swal({
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 5000,
                        icon: 'warning',
                        title: 'แจ้งเตือน',
                        text: 'ไม่สามารถลบหลักสูตรนี้ได้',
                    }).then(() => {
                        this.loading_sources = true
                    });
                } else {
                    const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/mcourse/" + id, {
                        method: 'DELETE',
                        headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                    });
                    console.log(resAPI);
                    this.getData();
                }
                
                this.loading_sources = true;
                await this.getData();

            } catch (error) {
                console.log(error)
            }
        },
        updateItem_short_description(newContent) {
            //console.log(newContent);
            this.short_description = newContent;
        },
        updateItem_description(newContent) {
            //console.log(newContent);
            this.description = newContent;
        },
        updateItem_principles(newContent) {
            //console.log(newContent);
            this.principles = newContent;
        },
        updateItem_objective(newContent) {
            //console.log(newContent);
            this.objective = newContent;
        },
        updateItem_target(newContent) {
            //console.log(newContent);
            this.target = newContent;
        },
        updateItem_structure(newContent) {
            //console.log(newContent);
            this.structure = newContent;
        },
        setActiveTab(tab) {
            this.activeTab = tab; // ฟังก์ชันเพื่อเปลี่ยนแท็บที่เปิดอยู่
        },
    },
    setup() {},
    async mounted() {
        if (this.mode === 'edit') {
            this.getData(); // เรียกใช้ getData เฉพาะเมื่ออยู่ในโหมด edit
        }
        try {
            console.log("mode",this.mode);
            //await this.getData();
            await this.getLecturerData();
            await this.getInstitutionData();
            await this.getTargetsData();

            const Category   = await this.getCategoryData();
            if(Category) {
                let session = 
                {
                    category: Category,
                };
                storageManager.update('session',session)
                this.categoryData     = Category.data
                this.typeData = kind
                this.modeData = mode
                this.displayData = display
                this.viewData = view
            }
            
            // Initialize taxonomy system
            console.log('กำลังโหลดระบบ Taxonomy...');
            
        } catch (error) {
            console.log(Error);
        }
    },
}
</script>

<template>

<div v-if="loading_sources">
    <div class="flex-1 bg-gray-100 ">
        <div class="mt-4">
            <div class="mx-auto ">
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
                    <!-- {{this.endpoint}} - {{this.mode}} -->
                    <form @submit.prevent="updataData">
                        <section aria-labelledby="course-form-section" class="relative"  :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">

                            <!-- Section 1: ข้อมูลทั่วไปของหลักสูตร -->
                            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">

                                <div class="bg-blue-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <!-- Icon -->
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas', 'info-circle']" class="text-3xl text-white" />
                                    </div>
                                    <!-- Vertical Line -->
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <!-- Text Content -->
                                    <div>
                                        <h2 id="online-settings-heading" class="text-lg font-bold leading-6">ข้อมูลทั่วไปของหลักสูตร</h2>
                                        <p class="mt-0 text-sm text-indigo-200">กรอกข้อมูลพื้นฐานที่สำคัญของหลักสูตร</p>
                                    </div>
                                </div>
                                
                                 <div class="px-5 pb-5">

                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">ข้อมูลเบื้องต้นของหลักสูตร</h3>
                                    </div>

                                    <input v-model="ref" type="hidden" name="ref" id="ref" autocomplete="ref" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">

                                    <div class="grid grid-cols-4 gap-6">
                                        <div class="col-span-6 sm:col-span-6">
                                            <label for="name" class="block text-md font-bold text-gray-700">ชื่อรายวิชา</label>
                                            <input v-model="name" type="text" name="name" id="name" autocomplete="name" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                        </div>
                                    </div>

                                    <div class="mt-6 grid grid-cols-4 gap-6">
                                        <div class="col-span-4 sm:col-span-2">
                                            <label for="slug" class="block text-md font-bold text-gray-700">รหัสรายวิชา</label>
                                            <input v-model="slug" type="text" name="slug" id="slug" autocomplete="slug" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                        </div>
                                        <div class="col-span-4 sm:col-span-2">
                                            <label for="erp_code" class="block text-md font-bold text-gray-700">รหัส Product Code (ถ้ามี)</label>
                                            <input v-model="erp_code" type="text" name="erp_code" id="erp_code" autocomplete="erp_code" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                        </div>
                                    </div>

                                    <div class="mt-6 grid grid-cols-4 gap-6">
                                        <div class="col-span-4 sm:col-span-2">
                                            <label for="keywords" class="block text-md font-bold text-gray-700">#Hashtag</label>
                                            <div class="w-full border border-gray-300 rounded px-3 py-2">
                                                <div class="flex flex-wrap gap-2 mb-2">
                                                  <span class="flex items-center bg-blue-500 text-white text-sm rounded px-2 py-1" v-for="(keyword, index) in keywords" :key="index">
                                                    {{ keyword }}
                                                    <button type="button" class="ml-1 text-white hover:text-gray-200 focus:outline-none" @click="removeKeyword(index)">×</button>
                                                  </span>
                                                </div>
                                                <div>
                                                  <input type="text" v-model="newKeyword" @keydown.enter.prevent="addKeyword" placeholder="Enter keyword" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    


                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">ประเภทหลักสูตร (Type)</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                        <div v-for="typeItem in typeData" :key="typeItem.code" class="w-full">
                                            <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                <div class="flex h-5 items-center">
                                                    <input v-model="checkedType" :id="typeItem.code" :value="typeItem.code" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label :for="typeItem.code" class="font-bold text-gray-900">{{typeItem.name}}</label>
                                                    <p class="text-[16px] text-gray-500">{{typeItem.description}}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">วิธีการเรียน (View Mode)</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                        <div v-for="viewItem in viewData" :key="viewItem.code" class="w-full">
                                            <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                <div class="flex h-5 items-center">
                                                    <input v-model="checkedView" :id="viewItem.code" :value="viewItem.code" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label :for="viewItem.code" class="font-bold text-gray-900">{{viewItem.name}}</label>
                                                    <p class="text-[16px] text-gray-500">{{viewItem.description}}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="online || offline">
                                        <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                            <h3 class="text-sm font-semibold text-blue-800">รูปแบบในการเรียน (Learning Mode)</h3>
                                        </div>
                                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                                            <div v-for="modeItem in modeData" :key="modeItem.code" class="w-full">
                                                <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                    <div class="flex h-5 items-center">
                                                        <input v-model="checkedMode" :id="modeItem.code" :value="modeItem.code" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                    </div>
                                                    <div class="ml-3 text-sm w-[90%]">
                                                        <label :for="modeItem.code" class="font-bold text-gray-900">{{modeItem.name}}</label>
                                                        <p class="text-[16px] text-gray-500">{{modeItem.description}}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div v-if="online || offline">
                                        <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                            <h3 class="text-sm font-semibold text-blue-800">การแสดงผลเบื้องต้น (Display Condition)</h3>
                                        </div>
                                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                                            <div v-for="displayItem in displayData" :key="displayItem.code" class="w-full">
                                                <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                    <div class="flex h-5 items-center">
                                                        <input v-model="checkedDisplay" :id="displayItem.code" :value="displayItem.code" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                    </div>
                                                    <div class="ml-3 text-sm w-[90%]">
                                                        <label :for="displayItem.code" class="font-bold text-gray-900">{{displayItem.name}}</label>
                                                        <p class="text-[16px] text-gray-500">{{displayItem.description}}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="online || offline">

                                        <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                            <h3 class="text-sm font-semibold text-blue-800">แบบสำรวจ (Survey)</h3>
                                        </div>
                                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                            <div class="w-full p-3 border border-gray-200 rounded-md">
                                                <div class="flex items-start">
                                                    <div class="flex h-5 items-center">
                                                        <input v-model="checkedSurvey" id="survey1" value="yes" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                    </div>
                                                    <div class="ml-3 text-sm w-[90%]">
                                                        <label for="survey1" class="font-bold text-gray-900">ต้องกรอกแบบสอบถาม</label>
                                                        <p class="text-[16px] text-gray-500">ผู้เรียนต้องทำการกรอกแบบประเมินความพึงพอใจก่อนออกใบรับรอง</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="w-full p-3 border border-gray-200 rounded-md">
                                                <div class="flex items-start">
                                                    <div class="flex h-5 items-center">
                                                        <input v-model="checkedSurvey" id="survey2" value="no" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                    </div>
                                                    <div class="ml-3 text-sm w-[90%]">
                                                        <label for="survey2" class="font-bold text-gray-900">ไม่ต้องกรอกแบบสอบถาม</label>
                                                        <p class="text-[16px] text-gray-500">ผู้เรียนไม่ต้องทำการกรอกแบบประเมินความพึงพอใจ</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">หมวดหมู่ (Category)</h3>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-gray-200 rounded-md">
                                        <template v-for="(categoryItem,index) in categoryData.filter(cat => cat.type === 'main')" :key="categoryItem._id">
                                            <div :class="['p-3', 'border-b', 'border-gray-200', index % 2 === 0 ? 'sm:border-r -mr-[1px]' : 'sm:border-l', (index === categoryData.filter(cat => cat.type === 'main').length - 1 || (index === categoryData.filter(cat => cat.type === 'main').length - 2 && categoryData.filter(cat => cat.type === 'main').length % 2 === 0)) ? 'border-b-0' : '']">
                                                <ul>
                                                    <li>
                                                        <div class="flex items-start">
                                                            <div class="flex h-5 items-center">
                                                                <input v-model="checked" :id="categoryItem.code" :value="categoryItem.code" type="checkbox" class="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                            </div>
                                                            <div class="ml-3 text-sm w-[90%]">
                                                                <label :for="categoryItem.code" class="font-bold text-blue-900">{{ categoryItem.name }}</label>
                                                                <p class="invisible lg:visible text-[14px] text-gray-500 truncate">{{ categoryItem.code }}</p>
                                                            </div>
                                                        </div>
                            
                                                        <ul class="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 mt-3" v-if="categoryData.some(sub => sub.type === 'sub' && sub.parent === categoryItem._id)">
                                                            <li v-for="(subcategory) in categoryData.filter(sub => sub.type === 'sub' && sub.parent === categoryItem._id)" :key="subcategory._id">
                                                                <div class="flex items-start ml-3">
                                                                    <div class="flex h-5 items-center">
                                                                        <input v-model="checked" :id="subcategory.code" :value="subcategory.code" type="checkbox" class="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                                    </div>
                                                                    <div class="ml-3 text-sm w-[90%]">
                                                                        <label :for="subcategory.code" class="font-medium text-blue-900">{{ subcategory.name }}</label>
                                                                        <p class="invisible lg:visible text-[14px] text-gray-500 truncate">{{ subcategory.code }}</p>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                        
                                                    </li>
                                                </ul>
                                            </div>
                                        </template>
                                    </div>

                                    <!-- เพิ่ม Taxonomy Selector Section -->
                                    <div class="bg-green-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-green-100">
                                        <h3 class="text-sm font-semibold text-green-800 flex items-center gap-2">
                                            <i class="fas fa-tags"></i>
                                            หมวดหมู่ Taxonomy (ระบบใหม่)
                                        </h3>
                                        <p class="text-xs text-green-600 mt-1">เลือกหมวดหมู่สำหรับคอร์สเรียนจากระบบ Taxonomy</p>
                                    </div>
                                    
                                    <!-- Taxonomy Selector Component -->
                                    <div class="mb-4">
                                        <TaxonomySelector 
                                            content-type="course"
                                            content-type-label="คอร์สเรียน"
                                            v-model="selectedTaxonomyTerms"
                                            placeholder="เลือกหมวดหมู่สำหรับคอร์สเรียน"
                                        />
                                    </div>

                                </div>
                            </div>

                            <!-- Section 2: เนื้อหาหลักสูตร -->
                            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                                <div class="bg-blue-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <!-- Icon -->
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas', 'file-alt']" class="text-3xl text-white" />
                                    </div>
                                    <!-- Vertical Line -->
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <!-- Text Content for Section Title -->
                                    <div>
                                        <h2 id="content-heading" class="text-lg font-bold leading-6">เนื้อหาและคำอธิบายหลักสูตร</h2>
                                        <p class="mt-0 text-sm text-indigo-200">จัดการคำอธิบายและรายละเอียดเนื้อหาของหลักสูตร</p>
                                    </div>
                                    <!-- Checkboxes on the right -->
                                    <div class="ml-auto flex flex-col items-start sm:items-end">
                                        <div class="flex flex-wrap gap-x-4 gap-y-2">
                                            <div class="flex items-center">
                                                <input type="checkbox" id="show-short-description" name="show-short-description" class="mr-2 h-4 w-4 rounded border-gray-300 text-black focus:ring-indigo-500" v-model="show_short_description">
                                                <label for="show-short-description" class="text-sm text-white">คำอธิบายอย่างสั้น</label>
                                            </div>
                                            <div class="flex items-center">
                                                <input type="checkbox" id="show-description" name="show-description" class="mr-2 h-4 w-4 rounded border-gray-300 text-black focus:ring-indigo-500" v-model="show_description">
                                                <label for="show-description" class="text-sm text-white">คำอธิบาย</label>
                                            </div>
                                            <div class="flex items-center">
                                                <input type="checkbox" id="show-principles" name="show-principles" class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" v-model="show_principles">
                                                <label for="show-principles" class="text-sm text-white">หลักการและเหตุผล</label>
                                            </div>
                                            <div class="flex items-center">
                                                <input type="checkbox" id="show-objective" name="show-objective" class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" v-model="show_objective">
                                                <label for="show-objective" class="text-sm text-white">วัตถุประสงค์</label>
                                            </div>
                                            <div class="flex items-center">
                                                <input type="checkbox" id="show-target" name="show-target" class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" v-model="show_target">
                                                <label for="show-target" class="text-sm text-white">กลุ่มเป้าหมาย</label>
                                            </div>
                                            <div class="flex items-center">
                                                <input type="checkbox" id="show-structure" name="show-structure" class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" v-model="show_structure">
                                                <label for="show-structure" class="text-sm text-white">โครงสร้างหลักสูตร</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="px-5 pb-5">
                                    <div class="grid grid-cols-1 gap-0">
                                        <div v-if="this.show_short_description" class="mt-0">
                                            <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-blue-100">
                                                <label for="short_description_editor" class="block text-sm font-bold text-blue-800">คำอธิบายอย่างสั้น</label>
                                            </div>
                                            <editor :content="short_description" @update-content="updateItem_short_description"/>
                                        </div>
                                        <div v-if="this.show_description" class="mt-4">
                                            <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                                <label for="description_editor" class="block text-sm font-bold text-blue-800">คำอธิบาย</label>
                                            </div>
                                            <editor :content="description" @update-content="updateItem_description"/>
                                        </div>
                                        <div v-if="this.show_principles" class="mt-4">
                                            <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                                <label for="principles_editor" class="block text-sm font-bold text-blue-800">หลักการและเหตุผล</label>
                                            </div>
                                            <editor :content="principles" @update-content="updateItem_principles"/>
                                        </div>
                                        <div v-if="this.show_objective" class="mt-4">
                                            <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                                <label for="objective_editor" class="block text-sm font-bold text-blue-800">วัตถุประสงค์</label>
                                            </div>
                                            <editor :content="objective" @update-content="updateItem_objective"/>
                                        </div>
                                        <div v-if="this.show_target" class="mt-4">
                                            <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                                <label for="target_editor" class="block text-sm font-bold text-blue-800">กลุ่มเป้าหมาย (ในรายละเอียด)</label>
                                            </div>
                                            <editor :content="target" @update-content="updateItem_target"/>
                                        </div>
                                        <div v-if="this.show_structure" class="mt-4">
                                            <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                                <label for="structure_editor" class="block text-sm font-bold text-blue-800">โครงสร้างหลักสูตร</label>
                                            </div>
                                            <editor :content="structure" @update-content="updateItem_structure"/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 3: บุคลากรและกลุ่มเป้าหมาย -->
                            <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                                <div class="bg-blue-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <!-- Icon -->
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas', 'users']" class="text-3xl text-white" />
                                    </div>
                                    <!-- Vertical Line -->
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <!-- Text Content -->
                                    <div>
                                        <h2 id="personnel-heading" class="text-lg font-bold leading-6">บุคลากรและกลุ่มเป้าหมาย</h2>
                                        <p class="mt-0 text-sm text-indigo-200">กำหนดวิทยากร สถาบัน และกลุ่มผู้เรียนเป้าหมาย</p>
                                    </div>
                                </div>
                                <div class="px-4 py-5 sm:p-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div class="bg-blue-50 px-4 py-2 mb-2 rounded-md">
                                                <label for="lecturer" class="block text-md font-bold text-blue-800">วิทยากร</label>
                                            </div>
                                            <div class="">
                                                <div class="py-2 px-4 bg-white border border-gray-200 rounded mb-2" v-if="selectedLecturers?.length > 0">
                                                    <div class="flex items-center justify-between">
                                                        <div class="text-gray-500 text-sm">เลือก {{ selectedLecturers.length }} รายการ</div>
                                                        <button @click="clearSelectedLecturers" type="button" class="text-red-500 hover:text-red-700 focus:outline-none"> <font-awesome-icon :icon="['fas', 'times']" class="w-4 h-4 text-gray-400"/> เคลียร์</button>
                                                    </div>
                                                    <ul class="mt-1 space-y-1 max-h-24 overflow-y-auto">
                                                        <li v-for="item in selectedLecturers" :key="item._id">
                                                            <div class="flex items-center space-x-1 text-sm">
                                                                <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-5 h-5 rounded-sm" />
                                                                <span class="font-medium">{{ item.name }}</span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div @click="toggleDropdown('lecturer')" class="cursor-pointer">
                                                    <div class="py-2 px-4 bg-white border border-gray-200 rounded flex items-center justify-between hover:border-gray-400">
                                                        <span v-if="selectedLecturers?.length > 0">เลือก {{ selectedLecturers.length }} รายการแล้ว</span>
                                                        <span v-else>เลือกวิทยากร</span>
                                                        <font-awesome-icon :icon="['fas', 'chevron-down']" class="w-3 h-3 text-gray-400"/>
                                                    </div>
                                                </div>
                                                <div v-if="isLecturerDropdownOpen" class="absolute w-[calc(33.33%-2rem)] z-10 mt-1 bg-white rounded shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                                                    <div v-for="item in lecturersData" :key="item._id" class="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer">
                                                        <input type="checkbox" :value="item" v-model="selectedLecturers" class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-6 h-auto mr-2 rounded-sm">
                                                        <span>{{ item.name }}</span>
                                                    </div>
                                                    <div class="flex justify-between px-4 py-2 border-t border-gray-200 sticky bottom-0 bg-white">
                                                        <router-link to="/lesson/lecturer" target="_blank" class="text-sm text-indigo-600 hover:text-blue-800 focus:outline-none"><font-awesome-icon :icon="['fas','plus']" class="mr-1"/> เพิ่มวิทยากร</router-link>
                                                        <button @click="toggleDropdown('lecturer')" type="button" class="text-sm text-rose-500 hover:text-rose-700 focus:outline-none"><font-awesome-icon :icon="['fas','times']" class="mr-1"/> ปิด</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div class="bg-blue-50 px-4 py-2 mb-2 rounded-md">
                                                <label for="institution" class="block text-md font-bold text-blue-800">สถาบัน</label>
                                            </div>
                                            <div class="">
                                                <div class="py-2 px-4 bg-white border border-gray-200 rounded mb-2" v-if="selectedInstitutions?.length > 0">
                                                    <div class="flex items-center justify-between">
                                                        <div class="text-gray-500 text-sm">เลือก {{ selectedInstitutions.length }} รายการ</div>
                                                        <button @click="clearSelectedInstitutions" type="button" class="text-red-500 hover:text-red-700 focus:outline-none"> <font-awesome-icon :icon="['fas', 'times']" class="w-4 h-4 text-gray-400"/> เคลียร์</button>
                                                    </div>
                                                     <ul class="mt-1 space-y-1 max-h-24 overflow-y-auto">
                                                        <li v-for="item in selectedInstitutions" :key="item._id">
                                                            <div class="flex items-center space-x-1 text-sm">
                                                                <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-5 h-5 rounded-sm" />
                                                                <span class="font-medium">{{ item.name }}</span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div @click="toggleDropdown('institution')" class="cursor-pointer">
                                                    <div class="py-2 px-4 bg-white border border-gray-200 rounded flex items-center justify-between hover:border-gray-400">
                                                        <span v-if="selectedInstitutions?.length > 0">เลือก {{ selectedInstitutions.length }} รายการแล้ว</span>
                                                        <span v-else>เลือกสถาบัน</span>
                                                        <font-awesome-icon :icon="['fas', 'chevron-down']" class="w-3 h-3 text-gray-400"/>
                                                    </div>
                                                </div>
                                                <div v-if="isInstitutionDropdownOpen" class="absolute w-[calc(33.33%-2rem)] z-10 mt-1 bg-white rounded shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                                                    <div v-for="item in institutionsData" :key="item._id" class="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer">
                                                        <input type="checkbox" :value="item" v-model="selectedInstitutions" class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-6 h-auto mr-2 rounded-sm">
                                                        <span>{{ item.name }}</span>
                                                    </div>
                                                    <div class="flex justify-between px-4 py-2 border-t border-gray-200 sticky bottom-0 bg-white">
                                                        <router-link to="/lesson/institution" target="_blank" class="text-sm text-indigo-600 hover:text-blue-800 focus:outline-none"><font-awesome-icon :icon="['fas','plus']" class="mr-1"/> เพิ่มสถาบัน</router-link>
                                                        <button @click="toggleDropdown('institution')" type="button" class="text-sm text-rose-500 hover:text-rose-700 focus:outline-none"><font-awesome-icon :icon="['fas','times']" class="mr-1"/> ปิด</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div class="bg-blue-50 px-4 py-2 mb-2 rounded-md">
                                                <label for="targetAudience" class="block text-md font-bold text-blue-800">กลุ่มเป้าหมาย</label>
                                            </div>
                                            <div class="">
                                                <div class="py-2 px-4 bg-white border border-gray-200 rounded mb-2" v-if="selectedTargets?.length > 0">
                                                    <div class="flex items-center justify-between">
                                                        <div class="text-gray-500 text-sm">เลือก {{ selectedTargets.length }} รายการ</div>
                                                        <button @click="clearSelectedTargets" type="button" class="text-red-500 hover:text-red-700 focus:outline-none"> <font-awesome-icon :icon="['fas', 'times']" class="w-4 h-4 text-gray-400"/> เคลียร์</button>
                                                    </div>
                                                    <ul class="mt-1 space-y-1 max-h-24 overflow-y-auto">
                                                        <li v-for="item in selectedTargets" :key="item._id">
                                                            <div class="flex items-center space-x-1 text-sm">
                                                                <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-5 h-5 rounded-sm" />
                                                                <span class="font-medium">{{ item.name }}</span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div @click="toggleDropdown('target')" class="cursor-pointer">
                                                    <div class="py-2 px-4 bg-white border border-gray-200 rounded flex items-center justify-between hover:border-gray-400">
                                                         <span v-if="selectedTargets?.length > 0">เลือก {{ selectedTargets.length }} รายการแล้ว</span>
                                                        <span v-else>เลือกกลุ่มเป้าหมาย</span>
                                                        <font-awesome-icon :icon="['fas', 'chevron-down']" class="w-3 h-3 text-gray-400"/>
                                                    </div>
                                                </div>
                                                <div v-if="isTargetnDropdownOpen" class="absolute w-[calc(33.33%-2rem)] z-10 mt-1 bg-white rounded shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                                                    <div v-for="item in targetsData" :key="item._id" class="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer">
                                                        <input type="checkbox" :value="item" v-model="selectedTargets" class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-6 h-6 mr-2 rounded-sm">
                                                        <span>{{ item.name }}</span>
                                                    </div>
                                                    <div class="flex justify-between px-4 py-2 border-t border-gray-200 sticky bottom-0 bg-white">
                                                        <router-link to="/lesson/target" target="_blank" class="text-sm text-indigo-600 hover:text-blue-800 focus:outline-none"><font-awesome-icon :icon="['fas','plus']" class="mr-1"/> เพิ่มกลุ่มเป้าหมาย</router-link>
                                                        <button @click="toggleDropdown('target')" type="button" class="text-sm text-rose-500 hover:text-rose-700 focus:outline-none"><font-awesome-icon :icon="['fas','times']" class="mr-1"/> ปิด</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 4: การตั้งค่าสำหรับหลักสูตรออนไลน์ -->
                            <div v-if="online" class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                                <div class="bg-blue-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <!-- Icon -->
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas', 'cogs']" class="text-3xl text-white" />
                                    </div>
                                    <!-- Vertical Line -->
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <!-- Text Content -->
                                    <div>
                                        <h2 id="online-settings-heading" class="text-lg font-bold leading-6">การตั้งค่าสำหรับหลักสูตรออนไลน์</h2>
                                        <p class="mt-0 text-sm text-indigo-200">ปรับแต่งค่าเฉพาะสำหรับการเรียนการสอนแบบออนไลน์</p>
                                    </div>
                                </div>
                                <div class="px-5 pb-5">
                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">การตั้งค่าการเล่นวิดีโอและผู้เรียน</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input v-model="checkedSkip" id="skip1" value="yes" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="skip1" class="font-bold text-gray-900">ลาก Seekbar ในการเรียนได้</label>
                                                    <p class="text-[16px] text-gray-500">ลาก Seekbar เพื่อข้ามเนื้อหาในการเรียนได้</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input v-model="checkedSkip" id="skip2" value="no" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="skip2" class="font-bold text-gray-900">ลาก Seekbar ในการเรียนไม่ได้</label>
                                                    <p class="text-[16px] text-gray-500">ลาก Seekbar เพื่อข้ามเนื้อหาในการเรียนไม่ได้ ต้องเรียน 100%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input v-model="checkedIdle" id="idle1" value="yes" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="idle1" class="font-bold text-gray-900">ใช้งาน Idle Check</label>
                                                    <p class="text-[16px] text-gray-500">ตรวจสอบสถานะการเรียนผ่านหน้าต่างการแจ้งเตือน</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input v-model="checkedIdle" id="idle2" value="no" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="idle2" class="font-bold text-gray-900">ไม่ใช้งาน Idle Check</label>
                                                    <p class="text-[16px] text-gray-500">ไม่ตรวจสอบสถานะการเรียน</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="checkedIdle==='yes'" class="p-4 border border-gray-200 rounded-md">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="idle_popup" class="block text-sm font-medium text-gray-700">จำนวนกล่องแจ้งเตือน</label>
                                                <input v-model="idle_popup" type="text" name="idle_popup" id="idle_popup" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3">
                                            </div>
                                            <div>
                                                <label for="idle_timeout" class="block text-sm font-medium text-gray-700">จับเวลาที่วินาที</label>
                                                <input v-model="idle_timeout" type="text" name="idle_timeout" id="idle_timeout" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3">
                                            </div>
                                            <div class="md:col-span-2 flex items-center">
                                                <input v-model="idle_debug" type="checkbox" name="idle_debug" id="idle_debug" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                <label for="idle_debug" class="ml-2 block text-sm text-gray-900">Idle Debug</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">ข้อมูลเพิ่มเติม (จำนวนชั่วโมง/วันเรียน, Standalone)</h3>
                                    </div>
                                     <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 border border-gray-200 rounded-md">
                                        <div>
                                            <label for="hours" class="block text-sm font-medium text-gray-700">จำนวนชั่วโมง</label>
                                            <input v-model="hours" type="text" name="hours" id="hours" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3">
                                        </div>
                                        <div>
                                            <label for="days" class="block text-sm font-medium text-gray-700">จำนวนวัน</label>
                                            <input v-model="days" type="text" name="days" id="days" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3">
                                        </div>
                                        <div class="flex items-center mt-4 md:mt-6">
                                            <input type="checkbox" id="standalone" name="standalone" class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" v-model="standalone">
                                            <label for="standalone" class="text-sm font-medium text-gray-700">Standalone Course</label>
                                        </div>
                                    </div>

                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                        <h3 class="text-sm font-semibold text-blue-800">ใบรับรองอิเล็กทรอนิกส์ (e-Certification)</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input v-model="checkedCertification" id="certOptionYes" value="yes" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="certOptionYes" class="font-bold text-gray-900">มีใบรับรอง</label>
                                                    <p class="text-[16px] text-gray-500">รับใบรับรองเมื่อเรียนจบ / สอบผ่าน</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input v-model="checkedCertification" id="certOptionNo" value="no" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="certOptionNo" class="font-bold text-gray-900">ไม่มีใบรับรอง</label>
                                                    <p class="text-[16px] text-gray-500">ไม่ได้แจกใบรับรองให้ผู้เรียน</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="checkedCertification === 'yes'" class="p-4 border border-gray-200 rounded-md">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            <div>
                                                <p class="text-sm font-medium text-gray-700 mb-2">รูปแบบใบรับรอง</p>
                                                <div class="grid grid-cols-2 gap-2">
                                                    <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                        <input v-model="selectedCertificationTemplate" id="cert-standard" value="standard" type="radio" class="h-4 w-4 mt-0.5 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        <label for="cert-standard" class="ml-3 text-sm font-medium text-gray-900">มาตรฐาน</label>
                                                    </div>
                                                    <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                        <input v-model="selectedCertificationTemplate" id="cert-custom" value="custom" type="radio" class="h-4 w-4 mt-0.5 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        <label for="cert-custom" class="ml-3 text-sm font-medium text-gray-900">พิเศษ (กำหนดเอง)</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <p class="text-sm font-medium text-gray-700 mb-2">ออกใบรับรองในนาม</p>
                                                <div class="grid grid-cols-2 gap-2">
                                                    <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                        <input v-model="cert_owner_personal" id="cert_owner_personal_cb" true-value="yes" false-value="no" type="checkbox" class="h-4 w-4 mt-0.5 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        <label for="cert_owner_personal_cb" class="ml-3 text-sm font-medium text-gray-900">บุคคลธรรมดา</label>
                                                    </div>
                                                     <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                        <input v-model="cert_owner_corperate" id="cert_owner_corperate_cb" true-value="yes" false-value="no" type="checkbox" class="h-4 w-4 mt-0.5 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                        <label for="cert_owner_corperate_cb" class="ml-3 text-sm font-medium text-gray-900">นิติบุคคล</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-4 gap-6 mt-2">
                                            <div class="col-span-4 sm:col-span-4">
                                                <p class="mt-1 text-sm font-medium text-gray-700 mb-4">รับใบรับรองเมื่อ</p>
                                                
                                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <!-- ตัวเลือกพื้นฐาน: เรียนจบ -->
                                                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                                                        <div class="flex items-start p-4 bg-blue-50 border-l-4 border-blue-500">
                                                            <div class="flex h-5 items-center mt-0.5">
                                                                <input v-model="selectedCertificationType" id="end" value="end" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-blue-600 focus:ring-blue-500">
                                                            </div>
                                                            <div class="ml-3 flex-1">
                                                                <label for="end" class="text-sm font-semibold text-gray-900 block">เมื่อเรียนจบหลักสูตร</label>
                                                                <p class="text-sm text-gray-600 mt-1">รับใบรับรองเมื่อเรียนครบตามเนื้อหาหลักสูตร (แนะนำ)</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <!-- ตัวเลือกออนไลน์ -->
                                                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                                                        <div class="flex items-start p-4 bg-white hover:bg-gray-50 transition-colors">
                                                            <div class="flex h-5 items-center mt-0.5">
                                                                <input v-model="selectedCertificationType" id="online_flexible" value="online_flexible" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                            </div>
                                                            <div class="ml-3 flex-1">
                                                                <label for="online_flexible" class="text-sm font-semibold text-gray-900 block cursor-pointer">แบบออนไลน์ (กำหนดเงื่อนไขได้)</label>
                                                                <p class="text-sm text-gray-600 mt-1">สามารถกำหนดเงื่อนไขการรับใบรับรองได้ตามต้องการ</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <!-- เงื่อนไขออนไลน์ -->
                                                        <div v-if="selectedCertificationType === 'online_flexible'" class="border-t border-gray-100 bg-gray-50">
                                                            <div class="p-4">
                                                                <div class="mb-3">
                                                                    <h4 class="text-sm font-medium text-gray-800 mb-3">📋 เงื่อนไขการรับใบรับรอง</h4>
                                                                    <p class="text-xs text-gray-500 mb-3">เลือกเงื่อนไขที่ผู้เรียนต้องผ่านก่อนได้รับใบรับรอง (เลือกได้มากกว่า 1 ข้อ)</p>
                                                                </div>
                                                                
                                                                <div class="space-y-3">
                                                                    <div class="flex items-start p-3 bg-white rounded-md border border-gray-200 hover:border-indigo-300 transition-colors">
                                                                        <div class="flex h-5 items-center mt-0.5">
                                                                            <input v-model="certRequireExam" id="require_exam" type="checkbox" class="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                                        </div>
                                                                        <div class="ml-3 flex-1">
                                                                            <label for="require_exam" class="text-sm font-medium text-gray-900 cursor-pointer">🎯 ต้องสอบผ่าน</label>
                                                                            <p class="text-xs text-gray-600 mt-1">ผู้เรียนต้องทำแบบทดสอบและได้คะแนนผ่านเกณฑ์</p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div class="flex items-start p-3 bg-white rounded-md border border-gray-200 hover:border-indigo-300 transition-colors">
                                                                        <div class="flex h-5 items-center mt-0.5">
                                                                            <input v-model="certRequireAssignment" id="require_assignment" type="checkbox" class="h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                                        </div>
                                                                        <div class="ml-3 flex-1">
                                                                            <label for="require_assignment" class="text-sm font-medium text-gray-900 cursor-pointer">📝 ต้องส่งการบ้าน</label>
                                                                            <p class="text-xs text-gray-600 mt-1">ผู้เรียนต้องส่งงานครบถ้วนตามที่กำหนด</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <!-- Status indicator -->
                                                                <div class="mt-4 p-3 rounded-md text-sm">
                                                                    <div v-if="!certRequireExam && !certRequireAssignment" class="flex items-center text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                                                                        <span class="text-amber-500 mr-2">⚠️</span>
                                                                        <span class="font-medium">หากไม่เลือกเงื่อนไขใดๆ จะใช้เงื่อนไข "เรียนจบหลักสูตร" เป็นค่าเริ่มต้น</span>
                                                                    </div>
                                                                    
                                                                    <div v-if="certRequireExam && certRequireAssignment" class="flex items-center text-green-700 bg-green-50 p-2 rounded border border-green-200">
                                                                        <span class="text-green-500 mr-2">✅</span>
                                                                        <span class="font-medium">ต้องสอบผ่าน และ ส่งการบ้านครบถ้วน</span>
                                                                    </div>
                                                                    <div v-else-if="certRequireExam" class="flex items-center text-green-700 bg-green-50 p-2 rounded border border-green-200">
                                                                        <span class="text-green-500 mr-2">✅</span>
                                                                        <span class="font-medium">ต้องสอบผ่านเท่านั้น</span>
                                                                    </div>
                                                                    <div v-else-if="certRequireAssignment" class="flex items-center text-green-700 bg-green-50 p-2 rounded border border-green-200">
                                                                        <span class="text-green-500 mr-2">✅</span>
                                                                        <span class="font-medium">ต้องส่งการบ้านครบถ้วนเท่านั้น</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <!-- ตัวเลือกออฟไลน์ -->
                                                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                                                        <div class="flex items-start p-4 bg-white hover:bg-gray-50 transition-colors">
                                                            <div class="flex h-5 items-center mt-0.5">
                                                                <input v-model="selectedCertificationType" id="pass_offline" value="pass_offline" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-gray-600 focus:ring-gray-500">
                                                            </div>
                                                            <div class="ml-3 flex-1">
                                                                <label for="pass_offline" class="text-sm font-semibold text-gray-900 block cursor-pointer">แบบออฟไลน์เมื่อสอบผ่าน</label>
                                                                <p class="text-sm text-gray-600 mt-1">สำหรับการสอบแบบ On-site หรือมีการสอบภายนอกระบบ</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="selectedCertificationTemplate === 'custom'" class="mt-6">
                                            <p class="text-sm font-medium text-gray-700 mb-2">การแสดงผลบนใบรับรอง (แบบพิเศษ)</p>
                                            <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 p-3 border border-gray-200 rounded-md">
                                                <div class="flex items-center"><input v-model="cert_name" id="cert_name_cb" true-value="yes" false-value="no" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"><label for="cert_name_cb" class="ml-2 text-sm text-gray-700">แสดงชื่อผู้อบรม</label></div>
                                                <div class="flex items-center"><input v-model="cert_qrcode" id="cert_qrcode_cb" true-value="yes" false-value="no" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"><label for="cert_qrcode_cb" class="ml-2 text-sm text-gray-700">แสดง QR Code</label></div>
                                                <div class="flex items-center"><input v-model="cert_course_name" id="cert_course_name_cb" true-value="yes" false-value="no" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"><label for="cert_course_name_cb" class="ml-2 text-sm text-gray-700">แสดงชื่อหลักสูตร</label></div>
                                                <div class="flex items-center"><input v-model="cert_date" id="cert_date_cb" true-value="yes" false-value="no" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"><label for="cert_date_cb" class="ml-2 text-sm text-gray-700">แสดงวันที่ออกใบรับรอง</label></div>
                                                <div class="flex items-center"><input v-model="cert_detail" id="cert_detail_cb" true-value="yes" false-value="no" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"><label for="cert_detail_cb" class="ml-2 text-sm text-gray-700">แสดงรายละเอียดใบรับรอง</label></div>
                                            </div>
                                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                <div>
                                                    <label for="cert_age" class="block text-sm font-medium text-gray-700">อายุใบรับรอง (ปี)</label>
                                                    <input v-model="cert_age" type="text" name="cert_age" id="cert_age" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3">
                                                </div>
                                                <div class="md:col-span-2">
                                                    <label for="cert_bg" class="block text-sm font-medium text-gray-700">BG Image URL</label>
                                                    <input v-model="cert_bg" type="text" name="cert_bg" id="cert_bg" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Section 5: การตั้งค่าสำหรับหลักสูตร On-site -->
                            <div v-if="offline" class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow mb-8">
                                <div class="bg-blue-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <!-- Icon -->
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="text-3xl text-white" />
                                    </div>
                                    <!-- Vertical Line -->
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <!-- Text Content -->
                                    <div>
                                        <h2 id="onsite-settings-heading" class="text-lg font-bold leading-6">การตั้งค่าสำหรับหลักสูตร On-site</h2>
                                        <p class="mt-0 text-sm text-indigo-200">กำหนดค่าเฉพาะสำหรับการเรียนการสอน ณ สถานที่ (On-site)</p>
                                    </div>
                                </div>
                                <div class="px-4 py-5 sm:p-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label for="seat" class="block text-sm font-medium text-gray-700">จำนวนที่นั่ง</label>
                                            <input v-model="seat" type="text" name="seat" id="seat" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3">
                                        </div>
                                        <div>
                                            <label for="days_class" class="block text-sm font-medium text-gray-700">จำนวนวันที่เปิดอบรม</label>
                                            <input v-model="days_class" type="text" name="days_class" id="days_class" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3">
                                        </div>
                                    </div>
                                    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3">
                                        <h3 class="text-sm font-semibold text-blue-800">การจำกัดที่นั่ง</h3>
                                    </div>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input v-model="limit_seat" id="limit_seat1" value="yes" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="limit_seat1" class="font-bold text-gray-900">จำกัดที่นั่ง</label>
                                                    <p class="text-[16px] text-gray-500">ปิดลงทะเบียนเมื่อครบจำนวน</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-full p-3 border border-gray-200 rounded-md">
                                            <div class="flex items-start">
                                                <div class="flex h-5 items-center">
                                                    <input v-model="limit_seat" id="limit_seat2" value="no" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                </div>
                                                <div class="ml-3 text-sm w-[90%]">
                                                    <label for="limit_seat2" class="font-bold text-gray-900">ไม่จำกัดที่นั่ง</label>
                                                    <p class="text-[16px] text-gray-500">เปิดรับสมัครตลอด</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 6: การตั้งค่าการเงินและแบบสำรวจ -->
                            <div class="divide-y divide-gray-200 overflow-hidden rounded-t-lg bg-white shadow">
                                <div class="bg-blue-700 text-white px-2 py-3 sm:px-3 rounded-t-lg flex items-center">
                                    <!-- Icon -->
                                    <div class="mr-4">
                                        <font-awesome-icon :icon="['fas', 'dollar-sign']" class="text-3xl text-white" />
                                        <!-- Optional: Add second icon for survey if desired, e.g., <font-awesome-icon :icon="['fas', 'clipboard-list']" class="text-3xl text-white ml-2" /> -->
                                    </div>
                                    <!-- Vertical Line -->
                                    <div class="h-10 w-px bg-white opacity-50 mr-4"></div>
                                    <!-- Text Content -->
                                    <div>
                                        <h2 id="financial-survey-heading" class="text-lg font-bold leading-6">การตั้งค่าการเงินและแบบสำรวจ</h2>
                                        <p class="mt-0 text-sm text-indigo-200">จัดการเรื่องค่าใช้จ่ายของหลักสูตรและข้อกำหนดแบบสำรวจ</p>
                                    </div>
                                </div>
                                <div class="px-5 pb-5">
                                    <div v-if="online || offline">
                                        <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3 border-b border-blue-100">
                                            <h3 class="text-sm font-semibold text-blue-800">ประเภทค่าใช้จ่าย</h3>
                                        </div>
                                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                                            <div class="w-full">
                                                <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                    <div class="flex h-5 items-center">
                                                        <input v-model="checkedPricing" id="pricing_free" value="free" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                    </div>
                                                    <div class="ml-3 text-sm w-[90%]">
                                                        <label for="pricing_free" class="font-bold text-gray-900">ฟรี</label>
                                                        <p class="text-[16px] text-gray-500">หลักสูตรไม่มีค่าใช้จ่าย</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="w-full">
                                                <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                    <div class="flex h-5 items-center">
                                                        <input v-model="checkedPricing" id="pricing_paid" value="paid" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                    </div>
                                                    <div class="ml-3 text-sm w-[90%]">
                                                        <label for="pricing_paid" class="font-bold text-gray-900">มีค่าใช้จ่าย</label>
                                                        <p class="text-[16px] text-gray-500">หลักสูตรมีค่าใช้จ่าย</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="w-full">
                                                <div class="flex items-start p-3 border border-gray-200 rounded-md">
                                                    <div class="flex h-5 items-center">
                                                        <input v-model="checkedPricing" id="pricing_conditional" value="conditional" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                    </div>
                                                    <div class="ml-3 text-sm w-[90%]">
                                                        <label for="pricing_conditional" class="font-bold text-gray-900">มีเงื่อนไข</label>
                                                        <p class="text-[16px] text-gray-500">ราคาตามช่วงเวลา</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div v-if="checkedPricing === 'paid'">
                                            <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                                <h3 class="text-sm font-semibold text-blue-800">ค่าใช้จ่าย</h3>
                                            </div>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 border border-gray-200 rounded-md">
                                                <div>
                                                    <label for="regular_price" class="block text-sm font-medium text-gray-700">ราคาคอร์ส</label>
                                                    <input v-model="regular_price" type="text" name="regular_price" id="regular_price" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3">
                                                </div>
                                                <div>
                                                    <label for="sale_price" class="block text-sm font-medium text-gray-700">ราคาขาย</label>
                                                    <input v-model="sale_price" type="text" name="sale_price" id="sale_price" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3">
                                                </div>
                                            </div>
                                        </div>

                                        <div v-if="checkedPricing === 'conditional'">
                                            <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
                                                <h3 class="text-sm font-semibold text-blue-800">ตารางราคาตามเงื่อนไข</h3>
                                            </div>
                                            <div class="p-4 border border-gray-200 rounded-md">
                                                <div class="mb-4 max-w-xs">
                                                    <label for="regular_price_base" class="block text-sm font-medium text-gray-700">ราคาคอร์สพื้นฐาน</label>
                                                    <input v-model="regular_price" type="text" name="regular_price_base" id="regular_price_base" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3">
                                                    <p class="mt-1 text-sm text-gray-500">ราคาพื้นฐานที่จะใช้คำนวณส่วนลดแบบเปอร์เซ็นต์</p>
                                                </div>
                                                <SchedulePrice v-model="priceSchedules" :regular-price="regular_price" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center rounded-b-lg shadow border-t border-gray-200">
                                <button :disabled="this.lesson_type === 'child'" :class="{ 'opacity-50 cursor-not-allowed': this.lesson_type === 'child' }" @click="deleteData(dataItem)" type="button" class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                    <font-awesome-icon :icon="['fas','trash']" class="mr-2" />ลบหลักสูตรนี้
                                </button>
                                <div>
                                    <button @click="$router.push('/lesson')" type="button" class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    ยกเลิก
                                    </button>
                                    <button type="submit" class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    <font-awesome-icon :icon="['fas','save']" class="mr-2" />บันทึกข้อมูล
                                    </button>
                                </div>
                            </div>

                        </section>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

</template>
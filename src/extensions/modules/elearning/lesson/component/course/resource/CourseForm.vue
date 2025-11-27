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

import Schedule from '@/extensions/modules/elearning/lesson/component/course/resource/CourseSchedule.vue';

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
            checkedType: this.mode === 'add' ? 'e_learning' : '', // ค่าเริ่มต้นเป็น e-Learning (add mode), ค่าว่าง (edit mode - รอโหลดจาก API)
            checkedView: this.mode === 'add' ? 'single' : '', // add mode: ค่าเริ่มต้น, edit mode: รอโหลดจาก API
            checkedMode: this.mode === 'add' ? 'standard' : '', // add mode: ค่าเริ่มต้น, edit mode: รอโหลดจาก API
            checkedDisplay: this.mode === 'add' ? 'step' : '', // add mode: ค่าเริ่มต้น, edit mode: รอโหลดจาก API
            checkedCertification: this.mode === 'add' ? 'no' : '', // add mode: ไม่มีใบรับรอง, edit mode: รอโหลดจาก API (แก้ปัญหาใบรับรองอิเล็กทรอนิกส์)
            checkedSkip: this.mode === 'add' ? 'no' : '', // add mode: ค่าเริ่มต้น, edit mode: รอโหลดจาก API

            checkedSurvey: this.mode === 'add' ? 'no' : '', // ค่าเริ่มต้น

            // กำหนด required fields ที่สามารถเปลี่ยนแปลงได้
            requiredFields: ['name'], // บังคับเฉพาะชื่อรายวิชา
            
            // กำหนด configuration สำหรับ required fields ของแต่ละประเภทหลักสูตร
            courseTypeRequiredFields: {
                'e_learning': ['name'],
                'onsite': ['name'],
                'public_course': ['name'],
                'online_course': ['name'],
                'premium_course': ['name']
            },

            // เพิ่มตัวแปรสำหรับ certification checkbox
            certRequireExam: false,
            certRequireAssignment: false,

            checkedIdle: this.mode === 'add' ? 'no' : '', // ค่าเริ่มต้นสำหรับ Idle Check
            idle_popup:'5',
            idle_timeout:'30',
            idle_debug:false,

            checkedPricing: this.mode === 'add' ? 'free' : '', // เพิ่มตัวแปรสำหรับเลือกประเภทราคา
            checkedForm: this.mode === 'add' ? 'no' : '', // เพิ่มตัวแปรสำหรับเลือกการกรอกแบบฟอร์ม

            name: '',
            ref: '',
            slug: '',
            lecturer: [],
            erp_code: '',
            hours: '',
            days: '',
            nights: '', // เพิ่มตัวแปรสำหรับจำนวนคืน
            has_nights: false, // เพิ่มตัวแปรสำหรับ checkbox จำนวนคืน
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

            // เพิ่มตัวแปรสำหรับ Course Wizard
            showCourseWizard: false, // เปลี่ยนเป็น false และจะเปิดหลังจากโหลดข้อมูลเสร็จ
            wizardStep: 1, // 1 = เลือกประเภท, 2 = กรอกชื่อ
            wizardSelectedType: '',
            wizardCourseName: '',
            wizardCourseDescription: '', // เพิ่มตัวแปรสำหรับ description (optional)
            isWizardMinimized: false, // สำหรับ minimize wizard

            // เพิ่มตัวแปรสำหรับตรวจสอบการโหลดข้อมูล
            isDataLoaded: false, // ตรวจสอบว่าโหลดข้อมูลพื้นฐานเสร็จแล้วหรือยัง
            isTypeDataLoaded: false, // ตรวจสอบว่าโหลดข้อมูลประเภทหลักสูตรเสร็จแล้วหรือยัง

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
            exam_only: false, // เพิ่มตัวแปรสำหรับหลักสูตรสอบวัดผลอย่างเดียว

            online: false,
            offline: false,

            has_duedate:false,
            activeTab: 'tab1', // เพิ่มตัวแปรเพื่อเก็บแท็บที่เปิดอยู่
            keywords: ['cat'],
            newKeyword: '',
            
            // เพิ่มตัวแปรสำหรับ course form tabs
            courseActiveTab: 'general', // ตัวแปรสำหรับ tab ใหม่ในส่วน course form
            
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
        TaxonomySelector,
        Schedule
    },
    computed: {
        filteredOptions() {
            return this.availableOptions.filter(option =>
                option.toLowerCase().includes(this.newKeyword.toLowerCase())
            );
        },
        
        // เพิ่ม computed สำหรับแสดงชื่อประเภทหลักสูตรปัจจุบัน
        currentTypeName() {
            const type = this.typeData.find(item => item.code === this.checkedType);
            return type ? type.name : '';
        },
        
        // เพิ่ม computed สำหรับตรวจสอบความครบถ้วนของข้อมูล
        isFormValid() {
            return this.validateRequiredFields().length === 0;
        },
        
        // เพิ่ม computed สำหรับแสดงจำนวน required fields ที่กรอกแล้ว
        completedRequiredFields() {
            let completed = 0;
            for (const field of this.requiredFields) {
                switch(field) {
                    case 'name':
                        if (this.name && this.name.trim() !== '') completed++;
                        break;
                    case 'description':
                        if (this.description && this.description.trim() !== '') completed++;
                        break;
                    case 'regular_price':
                        if (this.regular_price && this.regular_price !== '') completed++;
                        break;
                    case 'startRegistDate':
                        if (this.startRegistDate) completed++;
                        break;
                    case 'endRegistDate':
                        if (this.endRegistDate) completed++;
                        break;
                    case 'accessDate':
                        if (this.accessDate) completed++;
                        break;
                    case 'selectedLecturers':
                        if (this.selectedLecturers && this.selectedLecturers.length > 0) completed++;
                        break;
                }
            }
            return completed;
        },
        
        // เพิ่ม computed สำหรับคำนวณเปอร์เซ็นต์ความครบถ้วน
        completionPercentage() {
            if (this.requiredFields.length === 0) return 100;
            return Math.round((this.completedRequiredFields / this.requiredFields.length) * 100);
        }
    },
    watch: {
        checkedType: {
            handler(newValue, oldValue) {
                // Auto-fill settings based on course type (เฉพาะใน add mode เท่านั้น)
                if (newValue !== oldValue && this.mode === 'add') {
                    this.autoFillByType(newValue);
                }
            },
            immediate: false // ไม่ให้ trigger ทันทีเมื่อ component mount
        },
        checkedPricing(newValue) {
            // เคลียร์ข้อมูล priceSchedules เมื่อเปลี่ยนเป็น option อื่นที่ไม่ใช่ "มีเงื่อนไข"
            if (newValue !== 'conditional') {
                this.priceSchedules = [];
            }
        },
        // เพิ่ม watch สำหรับ online/offline status
        online(newValue) {
            if (newValue) {
                this.offline = false;
            }
        },
        offline(newValue) {
            if (newValue) {
                this.online = false;
            }
        },
        // เพิ่ม watch สำหรับ exam_only
        exam_only(newValue) {
            if (newValue) {
                // เมื่อเปิดใช้งาน "สอบวัดผลอย่างเดียว" ให้แจ้งเตือนผู้ใช้
                console.log('เปิดใช้งานหลักสูตรสอบวัดผลอย่างเดียว - ไม่มีเนื้อหาการเรียน');
            }
        },
        // เพิ่ม watch สำหรับ checkbox จำนวนคืน
        has_nights(newValue) {
            if (!newValue) {
                this.nights = ''; // เคลียร์ข้อมูลจำนวนคืนเมื่อยกเลิกการติ๊ก
            }
        }
    },
    methods: {
        // เพิ่มฟังก์ชัน auto-fill ตามประเภทหลักสูตร (ใช้เฉพาะใน add mode)
        // 
        // *** สำคัญ: ฟังก์ชันนี้ใช้เฉพาะใน add mode เท่านั้น ***
        // ใน edit mode จะไม่ทำ auto-fill เพื่อรักษาข้อมูลที่โหลดมาจาก API
        // เป็นการแก้ไขปัญหาใบรับรองอิเล็กทรอนิกส์ที่แสดงเป็น "ไม่มีใบรับรอง" ใน edit mode
        autoFillByType(type) {
            // ตรวจสอบว่าเป็น add mode หรือไม่ ถ้าเป็น edit mode ให้หยุดการทำงาน
            if (this.mode !== 'add') {
                console.log('=== Auto-fill หยุดทำงาน ===');
                console.log('เหตุผล: อยู่ในโหมด', this.mode, '- auto-fill ใช้ได้เฉพาะโหมด add เท่านั้น');
                console.log('ข้อมูลใน edit mode จะแสดงตามที่โหลดมาจาก API');
                return;
            }
            
            console.log('=== Auto-fill เริ่มทำงาน ===');
            console.log('ประเภทหลักสูตรที่เลือก:', type);
            console.log('โหมด:', this.mode);
            
            // ใช้ required fields จาก configuration
            this.requiredFields = this.courseTypeRequiredFields[type] || ['name'];
            
            switch(type) {
                case 'e_learning':
                    this.checkedView = 'single';
                    this.checkedMode = 'standard';
                    this.checkedDisplay = 'step';
                    this.checkedCertification = 'no';
                    this.checkedSkip = 'no';
                    this.checkedSurvey = 'no';
                    this.checkedPricing = 'free';
                    this.checkedIdle = 'no'; // ไม่ใช้งาน Idle Check
                    console.log('ตั้งค่า e-learning เรียบร้อย (ไม่ใช้ Idle Check)');
                    break;
                    
                case 'onsite':
                    this.checkedView = 'single';
                    this.checkedMode = 'seminar';
                    this.checkedDisplay = 'onsite';
                    this.checkedCertification = 'yes'; // มีใบรับรอง
                    this.selectedCertificationType = 'end'; // เมื่อเรียนจบ
                    this.selectedCertificationTemplate = 'standard'; // รูปแบบใบรับรอง: มาตรฐาน
                    this.checkedSkip = 'no';
                    this.checkedSurvey = 'no';
                    this.checkedPricing = 'conditional';
                    this.checkedIdle = 'yes'; // ใช้งาน Idle Check
                    // ตั้งค่าใบรับรองแบบมาตรฐานและบุคคลธรรมดา (ใบรับรองอิเล็กทรอนิกส์)
                    this.cert_owner_personal = 'electronic'; // ใบรับรองอิเล็กทรอนิกส์
                    this.cert_owner_corperate = 'no';
                    console.log('ตั้งค่า onsite เรียบร้อย (มีใบรับรอง + Idle Check + ใบรับรองอิเล็กทรอนิกส์)');
                    break;
                    
                case 'public_course':
                    this.checkedView = 'single';
                    this.checkedMode = 'standard';
                    this.checkedDisplay = 'full';
                    this.checkedCertification = 'yes'; // มีใบรับรอง
                    this.selectedCertificationType = 'end'; // เมื่อเรียนจบ
                    this.selectedCertificationTemplate = 'standard'; // รูปแบบใบรับรอง: มาตรฐาน
                    this.checkedSkip = 'no';
                    this.checkedSurvey = 'no';
                    this.checkedPricing = 'free';
                    this.checkedIdle = 'yes'; // ใช้งาน Idle Check
                    // ตั้งค่าใบรับรองแบบมาตรฐานและบุคคลธรรมดา (ใบรับรองอิเล็กทรอนิกส์)
                    this.cert_owner_personal = 'electronic'; // ใบรับรองอิเล็กทรอนิกส์
                    this.cert_owner_corperate = 'no';
                    console.log('ตั้งค่า public course เรียบร้อย (มีใบรับรอง + Idle Check + ใบรับรองอิเล็กทรอนิกส์)');
                    break;
                    
                case 'online_course':
                    this.checkedView = 'single';
                    this.checkedMode = 'standard';
                    this.checkedDisplay = 'step';
                    this.checkedCertification = 'yes'; // มีใบรับรอง
                    this.selectedCertificationType = 'end'; // เมื่อเรียนจบ
                    this.selectedCertificationTemplate = 'standard'; // รูปแบบใบรับรอง: มาตรฐาน
                    this.checkedSkip = 'no';
                    this.checkedSurvey = 'yes';
                    this.checkedPricing = 'conditional';
                    this.checkedIdle = 'yes'; // ใช้งาน Idle Check
                    // ตั้งค่าใบรับรองแบบมาตรฐานและบุคคลธรรมดา (ใบรับรองอิเล็กทรอนิกส์)
                    this.cert_owner_personal = 'electronic'; // ใบรับรองอิเล็กทรอนิกส์
                    this.cert_owner_corperate = 'no';
                    console.log('ตั้งค่า online course เรียบร้อย (มีใบรับรอง + Idle Check + ใบรับรองอิเล็กทรอนิกส์)');
                    break;
                    
                case 'premium_course':
                    this.checkedView = 'single';
                    this.checkedMode = 'buffe';
                    this.checkedDisplay = 'full';
                    this.checkedCertification = 'yes'; // มีใบรับรอง
                    this.selectedCertificationType = 'end'; // เมื่อเรียนจบ
                    this.selectedCertificationTemplate = 'standard'; // รูปแบบใบรับรอง: มาตรฐาน
                    this.checkedSkip = 'no';
                    this.checkedSurvey = 'yes';
                    this.checkedPricing = 'conditional';
                    this.checkedIdle = 'yes'; // ใช้งาน Idle Check
                    // ตั้งค่าใบรับรองแบบมาตรฐานและบุคคลธรรมดา (ใบรับรองอิเล็กทรอนิกส์)
                    this.cert_owner_personal = 'electronic'; // ใบรับรองอิเล็กทรอนิกส์
                    this.cert_owner_corperate = 'no';
                    console.log('ตั้งค่า premium course เรียบร้อย (มีใบรับรอง + Idle Check + ใบรับรองอิเล็กทรอนิกส์)');
                    break;
                    
                default:
                    this.checkedIdle = 'no';
                    console.log('ใช้ค่าเริ่มต้น');
            }
            
            console.log('ค่าที่ตั้งไว้:', {
                view: this.checkedView,
                mode: this.checkedMode,
                display: this.checkedDisplay,
                certification: this.checkedCertification,
                certificationType: this.selectedCertificationType,
                certificationTemplate: this.selectedCertificationTemplate,
                pricing: this.checkedPricing,
                idle: this.checkedIdle,
                certPersonal: this.cert_owner_personal,
                certCorporate: this.cert_owner_corperate,
                required: this.requiredFields
            });
            
            // Force trigger reactive updates for conditional displays
            this.$nextTick(() => {
                this.triggerConditionalUpdates();
                console.log('=== Auto-fill เสร็จสิ้น ===');
            });
        },

        // ฟังก์ชันสำหรับแสดงข้อมูลใน edit mode โดยไม่ทำ auto-fill
        displayEditModeData() {
            console.log('=== แสดงข้อมูลโหมด Edit ===');
            console.log('checkedType:', this.checkedType);
            console.log('checkedCertification:', this.checkedCertification);
            console.log('cert_owner_personal:', this.cert_owner_personal);
            console.log('cert_owner_corperate:', this.cert_owner_corperate);
            console.log('online:', this.online);
            console.log('offline:', this.offline);
            console.log('ข้อมูลจะแสดงตามที่โหลดมาจาก API โดยไม่มีการ auto-fill');
            
            // ทำ trigger เฉพาะการแสดงผล UI โดยไม่แก้ไขข้อมูล
            this.triggerEditModeDisplay();
            
            console.log('=== จบการแสดงข้อมูลโหมด Edit ===');
        },

        // ฟังก์ชันสำหรับ trigger การแสดงผลใน edit mode โดยไม่แก้ไขข้อมูล
        triggerEditModeDisplay() {
            console.log('กำลัง trigger การแสดงผลใน edit mode...');
            console.log('ไม่มีการแก้ไขข้อมูล - เพียงแค่ trigger การแสดงผล');
            
            // Force re-render เพื่อให้ UI แสดงผลตามข้อมูลที่โหลดมา
            this.$forceUpdate();
            
            console.log('เสร็จสิ้นการ trigger การแสดงผลใน edit mode');
        },

        // ฟังก์ชันช่วยสำหรับ trigger conditional updates
        triggerConditionalUpdates() {
            console.log('กำลัง trigger conditional updates...');
            console.log('โหมด:', this.mode);
            console.log('checkedType:', this.checkedType);
            console.log('checkedPricing:', this.checkedPricing);
            
            // Update online/offline status based on checkedType เฉพาะใน add mode
            // ใน edit mode ให้ใช้ค่าที่โหลดมาจาก API
            if (this.mode === 'add') {
                if (this.checkedType === "onsite") {
                    this.online = false;
                    this.offline = true;
                    console.log('Add mode: กำหนดเป็น offline (onsite)');
                } else {
                    this.online = true;
                    this.offline = false;
                    console.log('Add mode: กำหนดเป็น online');
                }
            } else {
                // ใน edit mode ใช้ค่าที่โหลดมาจาก API
                console.log('Edit mode: ใช้ค่า online/offline ที่โหลดมาจาก API');
                console.log('online:', this.online, 'offline:', this.offline);
            }
            
            // Clear priceSchedules if not conditional pricing เฉพาะใน add mode
            if (this.mode === 'add' && this.checkedPricing !== 'conditional') {
                this.priceSchedules = [];
                console.log('Add mode: ล้าง priceSchedules เพราะไม่ใช่ conditional pricing');
            }
            
            console.log('Final values - online:', this.online, 'offline:', this.offline);
            
            // Force re-render by triggering reactivity
            this.$forceUpdate();
        },

        // ฟังก์ชันสำหรับจัดการ required fields configuration
        updateCourseTypeRequiredFields(courseType, newRequiredFields) {
            console.log(`อัปเดต required fields สำหรับ ${courseType}:`, newRequiredFields);
            this.courseTypeRequiredFields[courseType] = [...newRequiredFields];
            
            // หากเป็นประเภทปัจจุบัน ให้อัปเดต requiredFields ด้วย
            if (this.checkedType === courseType) {
                this.requiredFields = [...newRequiredFields];
                console.log(`อัปเดต requiredFields ปัจจุบันเป็น:`, this.requiredFields);
            }
        },

        // ฟังก์ชันสำหรับเพิ่ม required field ให้กับประเภทหลักสูตรเฉพาะ
        addRequiredFieldToCourseType(courseType, fieldName) {
            if (!this.courseTypeRequiredFields[courseType].includes(fieldName)) {
                this.courseTypeRequiredFields[courseType].push(fieldName);
                console.log(`เพิ่ม ${fieldName} ใน required fields ของ ${courseType}`);
                
                // หากเป็นประเภทปัจจุบัน ให้อัปเดต requiredFields ด้วย
                if (this.checkedType === courseType) {
                    this.requiredFields = [...this.courseTypeRequiredFields[courseType]];
                }
            }
        },

        // ฟังก์ชันสำหรับลบ required field จากประเภทหลักสูตรเฉพาะ
        removeRequiredFieldFromCourseType(courseType, fieldName) {
            const index = this.courseTypeRequiredFields[courseType].indexOf(fieldName);
            if (index > -1) {
                this.courseTypeRequiredFields[courseType].splice(index, 1);
                console.log(`ลบ ${fieldName} จาก required fields ของ ${courseType}`);
                
                // หากเป็นประเภทปัจจุบัน ให้อัปเดต requiredFields ด้วย
                if (this.checkedType === courseType) {
                    this.requiredFields = [...this.courseTypeRequiredFields[courseType]];
                }
            }
        },

        // ฟังก์ชันสำหรับดู required fields ทั้งหมด
        getAllCourseTypeRequiredFields() {
            console.log('=== Required Fields Configuration ===');
            Object.keys(this.courseTypeRequiredFields).forEach(courseType => {
                console.log(`${courseType}:`, this.courseTypeRequiredFields[courseType]);
            });
            console.log('====================================');
            return this.courseTypeRequiredFields;
        },

        // ฟังก์ชันสำหรับ reset required fields เป็นค่าเริ่มต้น
        resetRequiredFieldsToDefault() {
            this.courseTypeRequiredFields = {
                'e_learning': ['name'],
                'onsite': ['name', 'startRegistDate', 'endRegistDate'],
                'public_course': ['name', 'description'],
                'online_course': ['name', 'description', 'accessDate'],
                'premium_course': ['name', 'description', 'regular_price', 'selectedLecturers']
            };
            
            // อัปเดต requiredFields ปัจจุบัน
            if (this.checkedType && this.courseTypeRequiredFields[this.checkedType]) {
                this.requiredFields = [...this.courseTypeRequiredFields[this.checkedType]];
            }
            
            console.log('รีเซ็ต required fields configuration เป็นค่าเริ่มต้น');
        },

        // เพิ่มฟังก์ชันสำหรับ debug การ auto-fill
        debugAutoFill() {
            console.log('=== Debug Auto-fill Status ===');
            console.log('โหมด:', this.mode);
            console.log('checkedType:', this.checkedType);
            console.log('checkedView:', this.checkedView);
            console.log('checkedMode:', this.checkedMode);
            console.log('checkedDisplay:', this.checkedDisplay);
            console.log('checkedCertification:', this.checkedCertification);
            console.log('selectedCertificationType:', this.selectedCertificationType);
            console.log('selectedCertificationTemplate:', this.selectedCertificationTemplate);
            console.log('checkedPricing:', this.checkedPricing);
            console.log('checkedIdle:', this.checkedIdle);
            console.log('cert_owner_personal:', this.cert_owner_personal);
            console.log('cert_owner_corperate:', this.cert_owner_corperate);
            console.log('online:', this.online);
            console.log('offline:', this.offline);
            console.log('requiredFields:', this.requiredFields);
            console.log('=== Required Fields Configuration ===');
            console.log('courseTypeRequiredFields:', this.courseTypeRequiredFields);
            console.log('==============================');
        },

        // เพิ่มฟังก์ชันสำหรับ debug ข้อมูลใน edit mode
        debugEditModeData() {
            console.log('=== Debug Edit Mode Data ===');
            console.log('โหมด:', this.mode);
            console.log('checkedType:', this.checkedType);
            console.log('checkedCertification:', this.checkedCertification);
            console.log('cert_owner_personal:', this.cert_owner_personal);
            console.log('cert_owner_corperate:', this.cert_owner_corperate);
            console.log('selectedCertificationType:', this.selectedCertificationType);
            console.log('selectedCertificationTemplate:', this.selectedCertificationTemplate);
            console.log('online:', this.online);
            console.log('offline:', this.offline);
            console.log('checkedPricing:', this.checkedPricing);
            console.log('priceSchedules:', this.priceSchedules);
            console.log('ข้อมูลจะแสดงตามที่โหลดมาจาก API');
            console.log('ไม่มีการ auto-fill ใน edit mode');
            console.log('==============================');
        },

        // เพิ่มฟังก์ชันสำหรับทดสอบการเปลี่ยนประเภทหลักสูตร
        testTypeChange(newType) {
            console.log('กำลังทดสอบการเปลี่ยนเป็น:', newType, 'ในโหมด:', this.mode);
            this.checkedType = newType;
            this.$nextTick(() => {
                if (this.mode === 'add') {
                    this.debugAutoFill();
                } else {
                    this.displayEditModeData(); // ใช้ displayEditModeData แทน debugEditModeData
                }
            });
        },

        // เพิ่มฟังก์ชันสำหรับรีเซ็ต form เป็นค่าเริ่มต้น
        resetToDefaults() {
            console.log('รีเซ็ตฟอร์มเป็นค่าเริ่มต้น...');
            this.checkedType = 'e_learning';
            this.checkedView = 'single';
            this.checkedMode = 'standard';
            this.checkedDisplay = 'step';
            this.checkedCertification = 'no';
            this.selectedCertificationType = '';
            this.selectedCertificationTemplate = '';
            this.checkedSkip = 'no';
            this.checkedSurvey = 'no';
            this.checkedPricing = 'free';
            this.checkedIdle = 'no'; // ไม่ใช้งาน Idle Check สำหรับ e-Learning
            this.requiredFields = ['name'];
            this.online = true;
            this.offline = false;
            // รีเซ็ตการตั้งค่าใบรับรอง
            this.cert_owner_personal = '';
            this.cert_owner_corperate = '';
            this.$nextTick(() => {
                this.triggerConditionalUpdates();
            });
        },
        
        // เพิ่มฟังก์ชันตรวจสอบ required fields
        validateRequiredFields() {
            const errors = [];
            
            for (const field of this.requiredFields) {
                switch(field) {
                    case 'name':
                        if (!this.name || this.name.trim() === '') {
                            errors.push('กรุณากรอกชื่อรายวิชา');
                        }
                        break;
                        
                    case 'description':
                        if (!this.description || this.description.trim() === '') {
                            errors.push('กรุณากรอกคำอธิบายรายวิชา');
                        }
                        break;
                        
                    case 'regular_price':
                        if (!this.regular_price || this.regular_price === '') {
                            errors.push('กรุณากรอกราคาปกติ');
                        }
                        break;
                        
                    case 'startRegistDate':
                        if (!this.startRegistDate) {
                            errors.push('กรุณาเลือกวันที่เริ่มลงทะเบียน');
                        }
                        break;
                        
                    case 'endRegistDate':
                        if (!this.endRegistDate) {
                            errors.push('กรุณาเลือกวันที่สิ้นสุดการลงทะเบียน');
                        }
                        break;
                        
                    case 'accessDate':
                        if (!this.accessDate) {
                            errors.push('กรุณาเลือกวันที่เริ่มเรียน');
                        }
                        break;
                        
                    case 'selectedLecturers':
                        if (!this.selectedLecturers || this.selectedLecturers.length === 0) {
                            errors.push('กรุณาเลือกวิทยากรอย่างน้อย 1 คน');
                        }
                        break;
                }
            }
            
            return errors;
        },
        
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
                        this.exam_only = RestReturn.exam_only || false // โหลดข้อมูลหลักสูตรสอบวัดผลอย่างเดียว

                        this.days = RestReturn.days
                        this.nights = RestReturn.nights || '' // โหลดข้อมูลจำนวนคืน
                        this.has_nights = RestReturn.has_nights || false // โหลดสถานะ checkbox
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
                        this.checkedForm = RestReturn.form_required || 'no' // เพิ่มการโหลดค่า form_required

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
                        
                        // โหลดค่า online/offline status จาก API (สำคัญสำหรับ edit mode)
                        this.online = RestReturn.online !== undefined ? RestReturn.online : (this.checkedType !== 'onsite');
                        this.offline = RestReturn.offline !== undefined ? RestReturn.offline : (this.checkedType === 'onsite');
                        
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
                        
                        // Trigger การแสดงผลหลังจากโหลดข้อมูลเสร็จ (สำหรับ edit mode)
                        this.$nextTick(() => {
                            this.triggerEditModeDisplay();
                        });
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

                    // ตรวจสอบ required fields ตาม array
                    const validationErrors = this.validateRequiredFields();
                    if (validationErrors.length > 0) {
                        this.$swal({
                            title: "ข้อมูลไม่ครบถ้วน",
                            html: validationErrors.join('<br>'),
                            icon: "warning"
                        });
                        this.loading_sources = false;
                        return;
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
                        exam_only: this.exam_only, // เพิ่มตัวแปรสำหรับหลักสูตรสอบวัดผลอย่างเดียว
                        days: this.days,
                        nights: this.nights, // บันทึกข้อมูลจำนวนคืน
                        has_nights: this.has_nights, // บันทึกสถานะ checkbox
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
                        online: this.online, // บันทึกสถานะ online
                        offline: this.offline, // บันทึกสถานะ offline
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
                        form_required: this.checkedForm, // เพิ่มการส่งค่า form_required
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
        // เพิ่มฟังก์ชันสำหรับ course form tabs
        setCourseActiveTab(tab) {
            this.courseActiveTab = tab; // ฟังก์ชันเพื่อเปลี่ยน course form tab
        },
        
        // ฟังก์ชันสำหรับจัดการ Course Wizard
        selectCourseType(typeCode) {
            this.wizardSelectedType = typeCode;
            this.wizardStep = 2; // ไปขั้นตอนกรอกชื่อ
        },
        
        goBackToTypeSelection() {
            this.wizardStep = 1;
            this.wizardSelectedType = '';
            this.wizardCourseName = '';
            this.wizardCourseDescription = ''; // เคลียร์ description ด้วย
        },
        
        finishWizard() {
            if (!this.wizardCourseName.trim()) {
                alert('กรุณากรอกชื่อหลักสูตร');
                return;
            }
            
            // ตั้งค่าข้อมูลเริ่มต้น
            this.checkedType = this.wizardSelectedType;
            this.name = this.wizardCourseName.trim();
            
            // ตั้งค่า description หากมีการกรอก
            if (this.wizardCourseDescription.trim()) {
                this.description = this.wizardCourseDescription.trim();
            }
            
            // ปิด wizard และแสดงฟอร์ม
            this.showCourseWizard = false;
            
            // Auto-fill ตามประเภทที่เลือก (เฉพาะใน add mode)
            this.$nextTick(() => {
                this.autoFillByType(this.wizardSelectedType);
            });
        },
        
        cancelWizard() {
            // ปิด wizard แต่ยังอยู่ในหน้าฟอร์ม
            this.showCourseWizard = false;
        },
        
        minimizeWizard() {
            this.isWizardMinimized = !this.isWizardMinimized;
        },
        
        reopenWizard() {
            this.showCourseWizard = true;
            this.isWizardMinimized = false;
            // รีเซ็ตข้อมูล wizard
            this.wizardStep = 1;
            this.wizardSelectedType = '';
            this.wizardCourseName = '';
            this.wizardCourseDescription = '';
        },
        
        // เพิ่มฟังก์ชันสำหรับจัดการ dropdown สำหรับวิทยากร สถาบัน และกลุ่มเป้าหมาย
        toggleDropdown(type) {
            switch(type) {
                case 'lecturer':
                    this.isLecturerDropdownOpen = !this.isLecturerDropdownOpen;
                    // ปิด dropdown อื่นๆ
                    this.isInstitutionDropdownOpen = false;
                    this.isTargetnDropdownOpen = false;
                    break;
                case 'institution':
                    this.isInstitutionDropdownOpen = !this.isInstitutionDropdownOpen;
                    // ปิด dropdown อื่นๆ
                    this.isLecturerDropdownOpen = false;
                    this.isTargetnDropdownOpen = false;
                    break;
                case 'target':
                    this.isTargetnDropdownOpen = !this.isTargetnDropdownOpen;
                    // ปิด dropdown อื่นๆ
                    this.isLecturerDropdownOpen = false;
                    this.isInstitutionDropdownOpen = false;
                    break;
                default:
                    console.log('Unknown dropdown type:', type);
            }
        },
        
        // เพิ่มฟังก์ชันสำหรับเลือก/ยกเลิกการเลือก lecturer
        toggleLecturerSelection(lecturer) {
            const index = this.selectedLecturers.findIndex(item => item._id === lecturer._id);
            if (index > -1) {
                // ลบออกจากรายการที่เลือก
                this.selectedLecturers.splice(index, 1);
            } else {
                // เพิ่มเข้ารายการที่เลือก
                this.selectedLecturers.push(lecturer);
            }
        },
        
        // เพิ่มฟังก์ชันสำหรับเลือก/ยกเลิกการเลือก institution
        toggleInstitutionSelection(institution) {
            const index = this.selectedInstitutions.findIndex(item => item._id === institution._id);
            if (index > -1) {
                // ลบออกจากรายการที่เลือก
                this.selectedInstitutions.splice(index, 1);
            } else {
                // เพิ่มเข้ารายการที่เลือก
                this.selectedInstitutions.push(institution);
            }
        },
        
        // เพิ่มฟังก์ชันสำหรับเลือก/ยกเลิกการเลือก target
        toggleTargetSelection(target) {
            const index = this.selectedTargets.findIndex(item => item._id === target._id);
            if (index > -1) {
                // ลบออกจากรายการที่เลือก
                this.selectedTargets.splice(index, 1);
            } else {
                // เพิ่มเข้ารายการที่เลือก
                this.selectedTargets.push(target);
            }
        },
        
        // เพิ่มฟังก์ชันสำหรับตรวจสอบว่าถูกเลือกหรือไม่
        isLecturerSelected(lecturer) {
            return this.selectedLecturers.some(item => item._id === lecturer._id);
        },
        
        isInstitutionSelected(institution) {
            return this.selectedInstitutions.some(item => item._id === institution._id);
        },
        
        isTargetSelected(target) {
            return this.selectedTargets.some(item => item._id === target._id);
        },
        
        // เพิ่มฟังก์ชันสำหรับลบรายการที่เลือกแล้ว
        removeLecturer(lecturer) {
            const index = this.selectedLecturers.findIndex(item => item._id === lecturer._id);
            if (index > -1) {
                this.selectedLecturers.splice(index, 1);
            }
        },
        
        removeInstitution(institution) {
            const index = this.selectedInstitutions.findIndex(item => item._id === institution._id);
            if (index > -1) {
                this.selectedInstitutions.splice(index, 1);
            }
        },
        
        removeTarget(target) {
            const index = this.selectedTargets.findIndex(item => item._id === target._id);
            if (index > -1) {
                this.selectedTargets.splice(index, 1);
            }
        },
        
        // เพิ่มฟังก์ชันสำหรับเคลียร์รายการที่เลือกทั้งหมด
        clearSelectedLecturers() {
            this.selectedLecturers = [];
            this.isLecturerDropdownOpen = false;
        },
        
        clearSelectedInstitutions() {
            this.selectedInstitutions = [];
            this.isInstitutionDropdownOpen = false;
        },
        
        clearSelectedTargets() {
            this.selectedTargets = [];
            this.isTargetnDropdownOpen = false;
        },
        
        // เพิ่มฟังก์ชันสำหรับปิด dropdown เมื่อคลิกข้างนอก
        closeAllDropdowns() {
            this.isLecturerDropdownOpen = false;
            this.isInstitutionDropdownOpen = false;
            this.isTargetnDropdownOpen = false;
        },
        
        // เพิ่ม event listener สำหรับปิด dropdown เมื่อคลิกข้างนอก
        handleClickOutside(event) {
            // ตรวจสอบว่าคลิกอยู่นอก dropdown หรือไม่
            if (!event.target.closest('.dropdown-container')) {
                this.closeAllDropdowns();
            }
        },
    },
    setup() {},
    async mounted() {
        console.log("กำลังโหลดข้อมูล...");
        
        try {
            // โหลดข้อมูลพื้นฐานก่อน
            await this.getLecturerData();
            await this.getInstitutionData();
            await this.getTargetsData();

            const Category = await this.getCategoryData();
            if(Category) {
                let session = {
                    category: Category,
                };
                storageManager.update('session', session);
                this.categoryData = Category.data;
                this.typeData = kind;
                this.modeData = mode;
                this.displayData = display;
                this.viewData = view;
                
                // ตั้งค่าว่าโหลดข้อมูลประเภทหลักสูตรเสร็จแล้ว
                this.isTypeDataLoaded = true;
                console.log("โหลดข้อมูลประเภทหลักสูตรเสร็จแล้ว");
            }
            
            // Initialize taxonomy system
            console.log('กำลังโหลดระบบ Taxonomy...');
            
            // ตั้งค่าว่าโหลดข้อมูลพื้นฐานเสร็จแล้ว
            this.isDataLoaded = true;
            console.log("โหลดข้อมูลพื้นฐานเสร็จแล้ว");
            
            // หากเป็นโหมด edit ให้โหลดข้อมูลหลักสูตร
            if (this.mode === 'edit') {
                await this.getData();
            }
            
            // เปิด wizard สำหรับโหมด add หลังจากโหลดข้อมูลเสร็จ
            if (this.mode === 'add' && this.isTypeDataLoaded) {
                console.log("เปิด Course Wizard");
                this.showCourseWizard = true;
            }
            
            // เรียกใช้ auto-fill หลังจาก component mount เรียบร้อยแล้ว (เฉพาะใน add mode เท่านั้น)
            this.$nextTick(() => {
                if (this.mode === 'add' && this.checkedType) {
                    console.log('กำลังทำ auto-fill สำหรับ:', this.checkedType);
                    this.autoFillByType(this.checkedType);
                } else if (this.mode === 'edit') {
                    console.log('โหมด edit: ไม่ใช้ auto-fill เพื่อรักษาข้อมูลที่โหลดมา');
                    this.displayEditModeData();
                }
            });
            
            // เพิ่ม event listener สำหรับปิด dropdown เมื่อคลิกข้างนอก
            document.addEventListener('click', this.handleClickOutside);
            
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
        } {
            console.log(Error);
        }
    },
    
    // เพิ่ม beforeUnmount เพื่อลบ event listener
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
}
</script>

<template>
<!-- Loading Screen -->
<div v-if="!isDataLoaded || !isTypeDataLoaded" class="fixed inset-0 bg-white flex items-center justify-center z-50">
    <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">กำลังโหลดข้อมูล</h2>
        <p class="text-gray-600">กรุณารอสักครู่...</p>
        <div class="mt-4 space-y-2 text-sm text-gray-500">
            <div class="flex items-center justify-center gap-2">
                <i :class="isDataLoaded ? 'fas fa-check-circle text-green-500' : 'fas fa-circle-notch fa-spin text-blue-500'"></i>
                <span>โหลดข้อมูลพื้นฐาน</span>
            </div>
            <div class="flex items-center justify-center gap-2">
                <i :class="isTypeDataLoaded ? 'fas fa-check-circle text-green-500' : 'fas fa-circle-notch fa-spin text-blue-500'"></i>
                <span>โหลดข้อมูลประเภทหลักสูตร</span>
            </div>
        </div>
    </div>
</div>

<!-- Course Creation Wizard Modal -->
<div v-if="showCourseWizard && mode === 'add' && isDataLoaded && isTypeDataLoaded" class="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <i class="fas fa-magic text-blue-500 text-xl"></i>
                    <h2 class="text-xl font-semibold text-gray-900">ตัวช่วยสร้างหลักสูตร</h2>
                </div>
                <button @click="cancelWizard" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <i class="fas fa-times text-lg"></i>
                </button>
            </div>
            <!-- Progress indicator -->
            <div class="mt-4">
                <div class="flex items-center justify-center space-x-4">
                    <div class="flex items-center">
                        <div :class="wizardStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'" 
                             class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                            1
                        </div>
                        <span class="ml-2 text-sm text-gray-600">เลือกประเภท</span>
                    </div>
                    <div class="w-8 h-0.5 bg-gray-200"></div>
                    <div class="flex items-center">
                        <div :class="wizardStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'" 
                             class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                            2
                        </div>
                        <span class="ml-2 text-sm text-gray-600">กรอกชื่อ</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Content -->
        <div class="px-6 py-6">
            <!-- Step 1: เลือกประเภทหลักสูตร -->
            <div v-if="wizardStep === 1">
                <h3 class="text-lg font-medium text-gray-900 mb-4">เลือกประเภทหลักสูตรที่ต้องการสร้าง</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="typeItem in typeData" :key="typeItem.code"
                         @click="selectCourseType(typeItem.code)"
                         :class="wizardSelectedType === typeItem.code ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
                         class="border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md">
                        <div class="flex items-start gap-3">
                            <div :class="wizardSelectedType === typeItem.code ? 'text-blue-500' : 'text-gray-400'"
                                 class="w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1">
                                <i v-if="wizardSelectedType === typeItem.code" class="fas fa-check text-xs"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-medium text-gray-900 mb-1">{{ typeItem.name }}</h4>
                                <p class="text-sm text-gray-600">{{ typeItem.description }}</p>
                                
                                <!-- แสดงคุณสมบัติพิเศษของแต่ละประเภท -->
                                <div class="mt-3 space-y-1">
                                    <div v-if="typeItem.code === 'e_learning'" class="text-xs text-blue-600">
                                        • เหมาะสำหรับการเรียนออนไลน์ • ไม่ใช้ Idle Check
                                    </div>
                                    <div v-else-if="typeItem.code === 'onsite'" class="text-xs text-blue-600">
                                        • เหมาะสำหรับการเรียนสัมมนา • มีใบรับรอง • ใช้ Idle Check
                                    </div>
                                    <div v-else-if="typeItem.code === 'public_course'" class="text-xs text-blue-600">
                                        • รวมหลักสูตรที่เผยแพร่ • มีใบรับรอง • ใช้ Idle Check
                                    </div>
                                    <div v-else-if="typeItem.code === 'online_course'" class="text-xs text-blue-600">
                                        • งานอบรมผ่านการสัมมนาออนไลน์ • มีใบรับรอง • ใช้ Idle Check
                                    </div>
                                    <div v-else-if="typeItem.code === 'premium_course'" class="text-xs text-blue-600">
                                        • หลักสูตรพิเศษเฉพาะ • มีใบรับรอง • ใช้ Idle Check
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 2: กรอกชื่อหลักสูตร -->
            <div v-if="wizardStep === 2">
                <h3 class="text-lg font-medium text-gray-900 mb-4">กรอกชื่อหลักสูตร</h3>
                
                <!-- แสดงประเภทที่เลือก -->
                <div class="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-info-circle text-blue-500"></i>
                        <span class="text-sm text-blue-700">
                            ประเภทที่เลือก: <strong>{{ typeData.find(t => t.code === wizardSelectedType)?.name }}</strong>
                        </span>
                    </div>
                </div>

                <!-- ฟิลด์กรอกชื่อ -->
                <div class="mb-4">
                    <label for="wizard-course-name" class="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อหลักสูตร *
                    </label>
                    <input 
                        v-model="wizardCourseName" 
                        id="wizard-course-name"
                        type="text" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="กรอกชื่อหลักสูตรที่ต้องการสร้าง..."
                        @keyup.enter="finishWizard"
                        autofocus
                    >
                </div>

                <!-- ฟิลด์กรอกคำอธิบาย (optional) -->
                <div class="mb-6">
                    <label for="wizard-course-description" class="block text-sm font-medium text-gray-700 mb-2">
                        คำอธิบายหลักสูตร (ไม่บังคับ)
                    </label>
                    <textarea 
                        v-model="wizardCourseDescription" 
                        id="wizard-course-description"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="กรอกคำอธิบายหลักสูตร (เช่น วัตถุประสงค์ เนื้อหา หรือกลุ่มเป้าหมาย...)"
                    ></textarea>
                    <p class="mt-1 text-xs text-gray-500">สามารถเว้นว่างไว้และกรอกทีหลังได้</p>
                </div>

                <!-- ตัวอย่างการตั้งค่าที่จะได้รับ -->
                <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-700 mb-3">การตั้งค่าที่จะได้รับ:</h4>
                    <div class="space-y-2 text-xs text-gray-600">
                        <div v-if="wizardSelectedType === 'e_learning'">
                            • วิธีการเรียน: Single • รูปแบบ: Standard • การแสดงผล: Step
                            <br>• ไม่มีใบรับรอง • ไม่ใช้ Idle Check • ราคา: ฟรี
                        </div>
                        <div v-else-if="wizardSelectedType === 'onsite'">
                            • วิธีการเรียน: Single • รูปแบบ: Seminar • การแสดงผล: Onsite
                            <br>• มีใบรับรอง (มาตรฐาน) • ใช้ Idle Check • ราคา: มีเงื่อนไข
                        </div>
                        <div v-else-if="wizardSelectedType === 'public_course'">
                            • วิธีการเรียน: Single • รูปแบบ: Standard • การแสดงผล: Full
                            <br>• มีใบรับรอง (มาตรฐาน) • ใช้ Idle Check • ราคา: ฟรี
                        </div>
                        <div v-else-if="wizardSelectedType === 'online_course'">
                            • วิธีการเรียน: Single • รูปแบบ: Standard • การแสดงผล: Step
                            <br>• มีใบรับรอง (มาตรฐาน) • ใช้ Idle Check • ราคา: มีเงื่อนไข
                        </div>
                        <div v-else-if="wizardSelectedType === 'premium_course'">
                            • วิธีการเรียน: Single • รูปแบบ: Buffer • การแสดงผล: Full
                            <br>• มีใบรับรอง (มาตรฐาน) • ใช้ Idle Check • ราคา: มีเงื่อนไข
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
            <div>
                <button v-if="wizardStep === 2" @click="goBackToTypeSelection" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
                    <i class="fas fa-arrow-left mr-1"></i>
                    ย้อนกลับ
                </button>
            </div>
            <div class="flex gap-2">
                <button @click="cancelWizard" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors">
                    ข้ามขั้นตอนนี้
                </button>
                <button v-if="wizardStep === 1" @click="wizardStep = 2" :disabled="!wizardSelectedType"
                        :class="wizardSelectedType ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
                        class="px-4 py-2 text-sm font-medium rounded-md transition-colors">
                    ถัดไป
                    <i class="fas fa-arrow-right ml-1"></i>
                </button>
                <button v-if="wizardStep === 2" @click="finishWizard" :disabled="!wizardCourseName.trim()"
                        :class="wizardCourseName.trim() ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
                        class="px-4 py-2 text-sm font-medium rounded-md transition-colors">
                    <i class="fas fa-check mr-1"></i>
                    สร้างหลักสูตร
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Reopen Wizard Button (when wizard is closed) -->
<div v-if="!showCourseWizard && mode === 'add' && isDataLoaded && isTypeDataLoaded" class="fixed top-4 right-4 z-40">
    <button @click="reopenWizard" 
            class="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
            title="เปิดตัวช่วยสร้างหลักสูตร">
        <i class="fas fa-magic"></i>
    </button>
</div>

<div class="bg-gray-50 flex cms-container" v-if="loading_sources && isDataLoaded && isTypeDataLoaded">
    <!-- Left Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
        <div class="flex flex-col flex-grow bg-white border-r border-gray-200 min-h-screen">
            <!-- Sidebar Header -->
            <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
                <h1 class="text-lg font-semibold text-gray-900">จัดการหลักสูตร</h1>
                <router-link 
                    to="/lesson" 
                    class="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors duration-200"
                    title="กลับไปหน้าหลัก"
                >
                    <i class="fas fa-arrow-left text-sm"></i>
                </router-link>
            </div>

            <!-- Course Type & Format Settings -->
            <div class="px-4 py-4 border-b border-gray-200">
                <h3 class="text-sm font-medium text-gray-700 mb-3">ประเภทและรูปแบบ</h3>
                
                <!-- ประเภทหลักสูตร -->
                <div class="mb-4">
                    <h4 class="text-xs font-medium text-gray-600 mb-2">ประเภทหลักสูตร</h4>
                    <div class="space-y-2">
                        <div v-for="typeItem in typeData" :key="typeItem.code">
                            <label class="flex items-start gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                                <input v-model="checkedType" :value="typeItem.code" type="radio" class="mt-0.5 h-3 w-3 text-blue-600 focus:ring-blue-500">
                                <div>
                                    <div class="text-xs font-medium text-gray-900">{{ typeItem.name }}</div>
                                    <div class="text-xs text-gray-500">{{ typeItem.description }}</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- วิธีการเรียน -->
                <div class="mb-4">
                    <h4 class="text-xs font-medium text-gray-600 mb-2">วิธีการเรียน</h4>
                    <div class="space-y-2">
                        <div v-for="viewItem in viewData" :key="viewItem.code">
                            <label class="flex items-start gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                                <input v-model="checkedView" :value="viewItem.code" type="radio" class="mt-0.5 h-3 w-3 text-blue-600 focus:ring-blue-500">
                                <div>
                                    <div class="text-xs font-medium text-gray-900">{{ viewItem.name }}</div>
                                    <div class="text-xs text-gray-500">{{ viewItem.description }}</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- รูปแบบในการเรียน -->
                <div v-if="online || offline" class="mb-4">
                    <h4 class="text-xs font-medium text-gray-600 mb-2">รูปแบบการเรียน</h4>
                    <div class="space-y-2">
                        <div v-for="modeItem in modeData" :key="modeItem.code">
                            <label class="flex items-start gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                                <input v-model="checkedMode" :value="modeItem.code" type="radio" class="mt-0.5 h-3 w-3 text-blue-600 focus:ring-blue-500">
                                <div>
                                    <div class="text-xs font-medium text-gray-900">{{ modeItem.name }}</div>
                                    <div class="text-xs text-gray-500">{{ modeItem.description }}</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- การแสดงผลเบื้องต้น -->
                <div v-if="online || offline">
                    <h4 class="text-xs font-medium text-gray-600 mb-2">การแสดงผล</h4>
                    <div class="space-y-2">
                        <div v-for="displayItem in displayData" :key="displayItem.code">
                            <label class="flex items-start gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                                <input v-model="checkedDisplay" :value="displayItem.code" type="radio" class="mt-0.5 h-3 w-3 text-blue-600 focus:ring-blue-500">
                                <div>
                                    <div class="text-xs font-medium text-gray-900">{{ displayItem.name }}</div>
                                    <div class="text-xs text-gray-500">{{ displayItem.description }}</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Course Quality -->
            <div class="px-4 py-4 border-b border-gray-200">
                <h3 class="text-sm font-medium text-gray-700 mb-3">ความสมบูรณ์</h3>
                
                <!-- Course Type Display -->
                <div class="mb-3" v-if="currentTypeName">
                    <div class="text-xs text-gray-600 mb-1">ประเภทที่เลือก</div>
                    <div class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {{ currentTypeName }}
                    </div>
                </div>
                
                <!-- Quality Score -->
                <div class="mb-3">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs text-gray-600">ความครบถ้วน</span>
                        <span class="text-xs font-bold" :class="completionPercentage >= 100 ? 'text-green-600' : 'text-orange-600'">
                            {{ completionPercentage }}%
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div class="h-1.5 rounded-full transition-all duration-300" 
                             :class="completionPercentage >= 100 ? 'bg-green-500' : 'bg-orange-500'" 
                             :style="`width: ${completionPercentage}%`"></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        {{ completedRequiredFields }}/{{ requiredFields.length }} ฟิลด์ที่จำเป็น
                    </div>
                </div>

                <!-- Required Fields Checklist -->
                <div class="space-y-1.5">
                    <div class="text-xs font-medium text-gray-700 mb-2">ฟิลด์ที่จำเป็น:</div>
                    
                    <div class="flex items-center gap-2" v-if="requiredFields.includes('name')">
                        <i :class="['fas text-xs', (name && name.trim()) ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
                        <span class="text-xs text-gray-700">ชื่อรายวิชา</span>
                    </div>
                    
                    <div class="flex items-center gap-2" v-if="requiredFields.includes('description')">
                        <i :class="['fas text-xs', (description && description.trim()) ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
                        <span class="text-xs text-gray-700">คำอธิบาย</span>
                    </div>
                    
                    <div class="flex items-center gap-2" v-if="requiredFields.includes('regular_price')">
                        <i :class="['fas text-xs', regular_price ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
                        <span class="text-xs text-gray-700">ราคาปกติ</span>
                    </div>
                    
                    <div class="flex items-center gap-2" v-if="requiredFields.includes('startRegistDate')">
                        <i :class="['fas text-xs', startRegistDate ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
                        <span class="text-xs text-gray-700">วันเริ่มลงทะเบียน</span>
                    </div>
                    
                    <div class="flex items-center gap-2" v-if="requiredFields.includes('endRegistDate')">
                        <i :class="['fas text-xs', endRegistDate ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
                        <span class="text-xs text-gray-700">วันสิ้นสุดลงทะเบียน</span>
                    </div>
                    
                    <div class="flex items-center gap-2" v-if="requiredFields.includes('accessDate')">
                        <i :class="['fas text-xs', accessDate ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
                        <span class="text-xs text-gray-700">วันที่เริ่มเรียน</span>
                    </div>
                    
                    <div class="flex items-center gap-2" v-if="requiredFields.includes('selectedLecturers')">
                        <i :class="['fas text-xs', (selectedLecturers && selectedLecturers.length > 0) ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
                        <span class="text-xs text-gray-700">วิทยากร</span>
                    </div>
                </div>
                
                <!-- Certificate Settings Display -->
                <div class="mt-3 space-y-1" v-if="checkedCertification === 'yes'">
                    <div class="text-xs font-medium text-gray-700 mb-2">การตั้งค่าใบรับรอง:</div>
                    
                    <div class="flex items-center gap-2">
                        <i :class="['fas text-xs', selectedCertificationTemplate ? 'fa-check-circle text-blue-500' : 'fa-times-circle text-gray-400']"></i>
                        <span class="text-xs text-gray-700">รูปแบบ: 
                            <span class="font-medium text-blue-600">
                                {{ selectedCertificationTemplate === 'standard' ? 'มาตรฐาน' : selectedCertificationTemplate || 'ไม่ได้เลือก' }}
                            </span>
                        </span>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <i :class="['fas text-xs', selectedCertificationType ? 'fa-check-circle text-blue-500' : 'fa-times-circle text-gray-400']"></i>
                        <span class="text-xs text-gray-700">เงื่อนไข: 
                            <span class="font-medium text-blue-600">
                                {{ selectedCertificationType === 'end' ? 'เมื่อเรียนจบ' : selectedCertificationType || 'ไม่ได้เลือก' }}
                            </span>
                        </span>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <i :class="['fas text-xs', cert_owner_personal ? 'fa-check-circle text-green-500' : 'fa-times-circle text-gray-400']"></i>
                        <span class="text-xs text-gray-700">ประเภท: 
                            <span class="font-medium text-green-600">
                                {{ cert_owner_personal === 'electronic' ? 'ใบรับรองอิเล็กทรอนิกส์' : cert_owner_personal || 'ไม่ได้เลือก' }}
                            </span>
                        </span>
                    </div>
                </div>
                
                <!-- Idle Check Display -->
                <div class="mt-3 space-y-1" v-if="checkedIdle === 'yes'">
                    <div class="text-xs font-medium text-gray-700 mb-2">การตั้งค่า Idle Check:</div>
                    
                    <div class="flex items-center gap-2">
                        <i class="fas fa-check-circle text-green-500 text-xs"></i>
                        <span class="text-xs text-gray-700">เปิดใช้งาน Idle Check</span>
                    </div>
                </div>

                <!-- Auto-fill Settings Display -->
                <div class="mt-3 p-2 bg-gray-50 rounded text-xs" v-if="mode === 'add'">
                    <div class="text-xs font-medium text-gray-700 mb-2">การตั้งค่าอัตโนมัติ:</div>
                    <div class="space-y-1">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600">Idle Check:</span>
                            <span :class="checkedIdle === 'yes' ? 'text-green-600 font-medium' : 'text-red-600'">
                                {{ checkedIdle === 'yes' ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600">ใบรับรอง:</span>
                            <span :class="checkedCertification === 'yes' ? 'text-green-600 font-medium' : 'text-red-600'">
                                {{ checkedCertification === 'yes' ? 'มี' : 'ไม่มี' }}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600">สอบวัดผลอย่างเดียว:</span>
                            <span :class="exam_only ? 'text-orange-600 font-medium' : 'text-gray-500'">
                                {{ exam_only ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                            </span>
                        </div>
                        <div v-if="checkedCertification === 'yes'" class="flex items-center justify-between ml-2">
                            <span class="text-gray-600">ประเภท:</span>
                            <span class="text-blue-600 text-xs">เมื่อเรียนจบ</span>
                        </div>
                        <div v-if="checkedCertification === 'yes'" class="flex items-center justify-between ml-2">
                            <span class="text-gray-600">เจาะจง:</span>
                            <span class="text-blue-600 text-xs">บุคคลธรรมดา</span>
                        </div>
                    </div>
                </div>
                
                <!-- Exam Only notification -->
                <div class="mt-3 p-2 bg-orange-50 rounded text-xs text-orange-700" v-if="exam_only">
                    <i class="fas fa-exam mr-1"></i>
                    หลักสูตรนี้ถูกตั้งค่าเป็น "สอบวัดผลอย่างเดียว" ไม่มีเนื้อหาการเรียน
                </div>
                
                <!-- Auto-filled notification -->
                <div class="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700" v-if="mode === 'add'">
                    <i class="fas fa-info-circle mr-1"></i>
                    ระบบได้ตั้งค่าเริ่มต้นให้แล้วตามประเภทหลักสูตร
                </div>
            </div>

            <!-- Quick Links -->
            <!-- <div class="px-4 py-4 border-b border-gray-200">
                <h3 class="text-sm font-medium text-gray-700 mb-3">ลิงก์ด่วน</h3>
                <div class="space-y-1">
                    <router-link 
                        v-if="mode === 'edit'"
                        :to="'/lesson/detail/' + dataItem"
                        class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                        <i class="fas fa-eye text-blue-500 w-4"></i>
                        <span>ดูรายละเอียด</span>
                    </router-link>
                    <router-link 
                        v-if="mode === 'edit'"
                        :to="'/lesson/edit/' + dataItem + '/child/' + dataItem"
                        class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                        <i class="fas fa-graduation-cap text-green-500 w-4"></i>
                        <span>จัดการเนื้อหา</span>
                    </router-link>
                    <router-link 
                        to="/lesson"
                        class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                        <i class="fas fa-list text-purple-500 w-4"></i>
                        <span>กลับไปรายการ</span>
                    </router-link>
                </div>
            </div> -->

            <!-- Tools & Utilities -->
            <!-- <div class="px-4 py-4 border-b border-gray-200">
                <h3 class="text-sm font-medium text-gray-700 mb-3">เครื่องมือ</h3>
                <div class="space-y-1">
                    <router-link 
                        to="/lesson/lecturer"
                        target="_blank"
                        class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                        <i class="fas fa-users text-blue-500 w-4"></i>
                        <span>จัดการวิทยากร</span>
                    </router-link>
                    <router-link 
                        to="/lesson/institution"
                        target="_blank"
                        class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                        <i class="fas fa-building text-green-500 w-4"></i>
                        <span>จัดการสถาบัน</span>
                    </router-link>
                    <router-link 
                        to="/lesson/target"
                        target="_blank"
                        class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                        <i class="fas fa-bullseye text-purple-500 w-4"></i>
                        <span>จัดการกลุ่มเป้าหมาย</span>
                    </router-link>
                </div>
            </div> -->

            <!-- User Info -->
            <div class="mt-auto px-4 py-4 flex-shrink-0">
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-white text-sm"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">{{ login?.name || 'ผู้ใช้' }}</p>
                        <p class="text-xs text-gray-500">ผู้ดูแลระบบ</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
        <!-- Mobile Header -->
        <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div class="flex items-center justify-between">
                <h1 class="text-lg font-semibold text-gray-900">{{ mode === 'add' ? 'เพิ่มหลักสูตร' : 'แก้ไขหลักสูตร' }}</h1>
                <div class="flex items-center gap-2">
                    <button
                        @click="updataData"
                        type="button"
                        :disabled="!isFormValid"
                        :class="[
                            'font-medium px-3 py-2 rounded-lg transition-colors text-sm flex items-center gap-1',
                            isFormValid 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        ]"
                    >
                        <i class="fas fa-save text-xs"></i>
                        <span v-if="isFormValid">บันทึก</span>
                        <span v-else>ไม่ครบ</span>
                    </button>
                    <router-link 
                        to="/lesson" 
                        class="bg-gray-600 hover:bg-gray-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm flex items-center gap-1"
                    >
                        <i class="fas fa-arrow-left text-xs"></i>
                        กลับ
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Header -->
        <div class="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-xl font-semibold text-gray-900">{{ mode === 'add' ? 'เพิ่มหลักสูตรใหม่' : 'แก้ไขหลักสูตร' }}</h1>
                    <p class="text-sm text-gray-500 mt-1">จัดการข้อมูลและการตั้งค่าหลักสูตร</p>
                </div>
                <div class="flex items-center gap-3">
                    <button
                        @click="updataData"
                        type="button"
                        :disabled="!isFormValid"
                        :class="[
                            'font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
                            isFormValid 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        ]"
                    >
                        <i class="fas fa-save"></i>
                        <span v-if="isFormValid">บันทึกข้อมูล</span>
                        <span v-else>ข้อมูลไม่ครบ ({{ completionPercentage }}%)</span>
                    </button>
                    <router-link 
                        to="/lesson" 
                        class="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <i class="fas fa-arrow-left"></i>
                        กลับ
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="hidden lg:block bg-white border-b border-gray-200 px-6">
            <nav class="flex space-x-8" aria-label="Tabs">
                <button
                    @click="setCourseActiveTab('general')"
                    :class="{
                        'border-blue-500 text-blue-600': courseActiveTab === 'general',
                        'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': courseActiveTab !== 'general'
                    }"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                    <i class="fas fa-info-circle mr-2"></i>
                    ทั่วไป
                </button>
                <button
                    @click="setCourseActiveTab('description')"
                    :class="{
                        'border-blue-500 text-blue-600': courseActiveTab === 'description',
                        'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': courseActiveTab !== 'description'
                    }"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                    <i class="fas fa-file-alt mr-2"></i>
                    คำอธิบาย
                </button>
                <button
                    @click="setCourseActiveTab('pricing')"
                    :class="{
                        'border-blue-500 text-blue-600': courseActiveTab === 'pricing',
                        'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': courseActiveTab !== 'pricing'
                    }"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                    <i class="fas fa-money-bill mr-2"></i>
                    การตั้งค่าราคา
                </button>
                <button v-if="offline"
                    @click="setCourseActiveTab('schedule')"
                    :class="{
                        'border-blue-500 text-blue-600': courseActiveTab === 'schedule',
                        'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': courseActiveTab !== 'schedule'
                    }"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                    <i class="fas fa-calendar-alt mr-2"></i>
                    ตารางเรียน
                </button>
                <button
                    @click="setCourseActiveTab('categories')"
                    :class="{
                        'border-blue-500 text-blue-600': courseActiveTab === 'categories',
                        'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': courseActiveTab !== 'categories'
                    }"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                    <i class="fas fa-tags mr-2"></i>
                    หมวดหมู่
                </button>
            </nav>
        </div>

        <!-- Main Form Content -->
        <div class="flex-1 p-4 overflow-y-auto bg-gray-100">
            <div class="max-w-full">
                <!-- Warning for Master Data -->
                <div class="mb-6" v-if="this.master">
                    <div class="rounded-md bg-red-50 border border-red-100 p-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-bold text-red-800">คุณกำลังแก้ไขข้อมูลใน Master Data</h3>
                                <div class="mt-2 text-sm text-red-700">
                                    <p>การแก้ไขข้อมูลใน Master หลังจากข้อมูลได้รับการบันทึกแล้ว หลักสููตรอื่นๆภายใต้ข้อมูลของ Master จะถูกเปลี่ยนแปลงไปด้วย กรุณาระมัดระวังในการแก้ไขข้อมูลในส่วนนี้</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Auto-fill Notification -->
                <div class="mb-6" v-if="mode === 'add'">
                    <div class="rounded-md bg-blue-50 border border-blue-200 p-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-magic text-blue-400 text-lg"></i>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-blue-800">
                                    ระบบ Auto-fill ใช้งานอยู่
                                </h3>
                                <div class="mt-2 text-sm text-blue-700">
                                    <p>เมื่อคุณเลือกประเภทหลักสูตร ระบบจะตั้งค่าเริ่มต้นที่เหมาะสมให้โดยอัตโนมัติ</p>
                                    <ul class="list-disc list-inside mt-2 space-y-1">
                                        <li><strong>หลักสูตร e-Learning:</strong> เหมาะสำหรับการเรียนออนไลน์ทั่วไป</li>
                                        <li><strong>หลักสูตร Onsite:</strong> เหมาะสำหรับการอบรมในสถานที่</li>
                                        <li><strong>หลักสูตร Premium:</strong> เหมาะสำหรับหลักสูตรพิเศษที่มีค่าใช้จ่าย</li>
                                    </ul>
                                    <p class="mt-2 text-xs">
                                        <strong>ตอนนี้:</strong> บังคับกรอกเฉพาะ {{ requiredFields.length }} ฟิลด์ตามประเภทที่เลือก
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <form @submit.prevent="updataData">
                    <section aria-labelledby="course-form-section" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                        
                        <!-- Tab Content: ทั่วไป -->
                        <div v-if="courseActiveTab === 'general'" class="tab-content">

                            <!-- Section 1: ข้อมูลทั่วไปของหลักสูตร -->
                            <div class="bg-white rounded border border-gray-200 mb-4">
                                <div class="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center">
                                    <div class="mr-2">
                                        <i class="fas fa-info-circle text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-sm font-semibold text-gray-800">ข้อมูลทั่วไป</h2>
                                    </div>
                                </div>
                                
                                <div class="p-4">
                                    <div class="space-y-4">
                                        <div>
                                            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">ชื่อรายวิชา *</label>
                                            <input v-model="name" type="text" name="name" id="name" autocomplete="name" class="block w-full rounded border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="กรอกชื่อหลักสูตร...">
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">รหัสรายวิชา</label>
                                                <input v-model="slug" type="text" name="slug" id="slug" autocomplete="slug" class="block w-full rounded border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="เช่น COURSE-001">
                                            </div>
                                            <div>
                                                <label for="erp_code" class="block text-sm font-medium text-gray-700 mb-1">รหัส Product Code</label>
                                                <input v-model="erp_code" type="text" name="erp_code" id="erp_code" autocomplete="erp_code" class="block w-full rounded border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="รหัสสินค้า (ถ้ามี)">
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="hours" class="block text-sm font-medium text-gray-700 mb-1">จำนวนชั่วโมง</label>
                                                <input v-model="hours" type="text" name="hours" id="hours" class="block w-full rounded border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="เช่น 8">
                                            </div>
                                            <div v-if="checkedType === 'onsite'">
                                                <!-- สำหรับ onsite: แสดงในรูปแบบ responsive column -->
                                                <div :class="has_nights ? 'grid grid-cols-2 gap-2' : ''">
                                                    <div>
                                                        <div class="flex items-center space-x-2 mb-1">
                                                            <label for="days" class="text-sm font-medium text-gray-700">จำนวนวัน</label>
                                                            <input 
                                                                v-model="has_nights" 
                                                                type="checkbox" 
                                                                id="has_nights" 
                                                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            >
                                                            <label for="has_nights" class="text-xs text-gray-600">
                                                                มีการพักค้างคืน
                                                            </label>
                                                        </div>
                                                        <input v-model="days" type="text" name="days" id="days" class="block w-full rounded border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="เช่น 1">
                                                    </div>
                                                    <div v-if="has_nights">
                                                        <label for="nights" class="block text-sm font-medium text-gray-700 mb-1">จำนวนคืน</label>
                                                        <input v-model="nights" type="text" name="nights" id="nights" class="block w-full rounded border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="เช่น 2">
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-else>
                                                <!-- สำหรับประเภทอื่น: แสดงเฉพาะจำนวนวัน -->
                                                <div>
                                                    <label for="days" class="block text-sm font-medium text-gray-700 mb-1">จำนวนวัน</label>
                                                    <input v-model="days" type="text" name="days" id="days" class="block w-full rounded border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="เช่น 1">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 2: บุคลากรและกลุ่มเป้าหมาย -->
                            <div class="bg-white rounded border border-gray-200 mb-4">
                                <div class="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center">
                                    <div class="mr-2">
                                        <i class="fas fa-users text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-sm font-semibold text-gray-800">บุคลากรและกลุ่มเป้าหมาย</h2>
                                    </div>
                                </div>

                                <div class="p-4">
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <!-- วิทยากร -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">วิทยากร</label>
                                            <div class="relative dropdown-container">
                                                <div class="py-2 px-3 bg-white border border-gray-200 rounded mb-2" v-if="selectedLecturers?.length > 0">
                                                    <div class="flex items-center justify-between">
                                                        <div class="text-gray-500 text-sm">เลือก {{ selectedLecturers.length }} รายการ</div>
                                                        <button @click="clearSelectedLecturers" type="button" class="text-red-500 hover:text-red-700 focus:outline-none text-xs">
                                                            <i class="fas fa-times"></i> เคลียร์
                                                        </button>
                                                    </div>
                                                    <ul class="mt-2 space-y-1 max-h-16 overflow-y-auto">
                                                        <li v-for="item in selectedLecturers" :key="item._id">
                                                            <div class="flex items-center space-x-2 text-sm">
                                                                <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-4 h-4 rounded-sm" />
                                                                <span class="font-medium">{{ item.name }}</span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div @click="toggleDropdown('lecturer')" class="cursor-pointer">
                                                    <div class="py-2 px-3 bg-white border border-gray-200 rounded flex items-center justify-between hover:border-blue-400 transition-colors">
                                                        <span v-if="selectedLecturers?.length > 0" class="text-sm">เลือก {{ selectedLecturers.length }} รายการแล้ว</span>
                                                        <span v-else class="text-sm text-gray-500">เลือกวิทยากร</span>
                                                        <i class="fas fa-chevron-down text-xs text-gray-400"></i>
                                                    </div>
                                                </div>
                                                <div v-if="isLecturerDropdownOpen" class="absolute w-full z-10 mt-1 bg-white rounded shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                                                    <div v-for="item in lecturersData" :key="item._id" class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer">
                                                        <input type="checkbox" :value="item" v-model="selectedLecturers" class="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                        <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-5 h-5 mr-2 rounded-sm">
                                                        <span class="text-sm">{{ item.name }}</span>
                                                    </div>
                                                    <div class="flex justify-between px-3 py-2 border-t border-gray-200 sticky bottom-0 bg-white">
                                                        <router-link to="/lesson/lecturer" target="_blank" class="text-xs text-blue-600 hover:text-blue-800 focus:outline-none">
                                                            <i class="fas fa-plus mr-1"></i> เพิ่มวิทยากร
                                                        </router-link>
                                                        <button @click="toggleDropdown('lecturer')" type="button" class="text-xs text-red-500 hover:text-red-700 focus:outline-none">
                                                            <i class="fas fa-times mr-1"></i> ปิด
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                            
                                        <!-- สถาบัน -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">สถาบัน</label>
                                            <div class="relative dropdown-container">
                                                <div class="py-2 px-3 bg-white border border-gray-200 rounded mb-2" v-if="selectedInstitutions?.length > 0">
                                                    <div class="flex items-center justify-between">
                                                        <div class="text-gray-500 text-sm">เลือก {{ selectedInstitutions.length }} รายการ</div>
                                                        <button @click="clearSelectedInstitutions" type="button" class="text-red-500 hover:text-red-700 focus:outline-none text-xs">
                                                            <i class="fas fa-times"></i> เคลียร์
                                                        </button>
                                                    </div>
                                                    <ul class="mt-2 space-y-1 max-h-16 overflow-y-auto">
                                                        <li v-for="item in selectedInstitutions" :key="item._id">
                                                            <div class="flex items-center space-x-2 text-sm">
                                                                <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-4 h-4 rounded-sm" />
                                                                <span class="font-medium">{{ item.name }}</span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div @click="toggleDropdown('institution')" class="cursor-pointer">
                                                    <div class="py-2 px-3 bg-white border border-gray-200 rounded flex items-center justify-between hover:border-blue-400 transition-colors">
                                                        <span v-if="selectedInstitutions?.length > 0" class="text-sm">เลือก {{ selectedInstitutions.length }} รายการแล้ว</span>
                                                        <span v-else class="text-sm text-gray-500">เลือกสถาบัน</span>
                                                        <i class="fas fa-chevron-down text-xs text-gray-400"></i>
                                                    </div>
                                                </div>
                                                <div v-if="isInstitutionDropdownOpen" class="absolute w-full z-10 mt-1 bg-white rounded shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                                                    <div v-for="item in institutionsData" :key="item._id" class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer">
                                                        <input type="checkbox" :value="item" v-model="selectedInstitutions" class="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                        <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-5 h-5 mr-2 rounded-sm">
                                                        <span class="text-sm">{{ item.name }}</span>
                                                    </div>
                                                    <div class="flex justify-between px-3 py-2 border-t border-gray-200 sticky bottom-0 bg-white">
                                                        <router-link to="/lesson/institution" target="_blank" class="text-xs text-blue-600 hover:text-blue-800 focus:outline-none">
                                                            <i class="fas fa-plus mr-1"></i> เพิ่มสถาบัน
                                                        </router-link>
                                                        <button @click="toggleDropdown('institution')" type="button" class="text-xs text-red-500 hover:text-red-700 focus:outline-none">
                                                            <i class="fas fa-times mr-1"></i> ปิด
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- กลุ่มเป้าหมาย -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">กลุ่มเป้าหมาย</label>
                                            <div class="relative dropdown-container">
                                                <div class="py-2 px-3 bg-white border border-gray-200 rounded mb-2" v-if="selectedTargets?.length > 0">
                                                    <div class="flex items-center justify-between">
                                                        <div class="text-gray-500 text-sm">เลือก {{ selectedTargets.length }} รายการ</div>
                                                        <button @click="clearSelectedTargets" type="button" class="text-red-500 hover:text-red-700 focus:outline-none text-xs">
                                                            <i class="fas fa-times"></i> เคลียร์
                                                        </button>
                                                    </div>
                                                    <ul class="mt-2 space-y-1 max-h-16 overflow-y-auto">
                                                        <li v-for="item in selectedTargets" :key="item._id">
                                                            <div class="flex items-center space-x-2 text-sm">
                                                                <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-4 h-4 rounded-sm" />
                                                                <span class="font-medium">{{ item.name }}</span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div @click="toggleDropdown('target')" class="cursor-pointer">
                                                    <div class="py-2 px-3 bg-white border border-gray-200 rounded flex items-center justify-between hover:border-blue-400 transition-colors">
                                                        <span v-if="selectedTargets?.length > 0" class="text-sm">เลือก {{ selectedTargets.length }} รายการแล้ว</span>
                                                        <span v-else class="text-sm text-gray-500">เลือกกลุ่มเป้าหมาย</span>
                                                        <i class="fas fa-chevron-down text-xs text-gray-400"></i>
                                                    </div>
                                                </div>
                                                <div v-if="isTargetnDropdownOpen" class="absolute w-full z-10 mt-1 bg-white rounded shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                                                    <div v-for="item in targetsData" :key="item._id" class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer">
                                                        <input type="checkbox" :value="item" v-model="selectedTargets" class="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                        <img v-if="item.logo" :src="item.logo" :alt="item.name" class="w-5 h-5 mr-2 rounded-sm">
                                                        <span class="text-sm">{{ item.name }}</span>
                                                    </div>
                                                    <div class="flex justify-between px-3 py-2 border-t border-gray-200 sticky bottom-0 bg-white">
                                                        <router-link to="/lesson/target" target="_blank" class="text-xs text-blue-600 hover:text-blue-800 focus:outline-none">
                                                            <i class="fas fa-plus mr-1"></i> เพิ่มกลุ่มเป้าหมาย
                                                        </router-link>
                                                        <button @click="toggleDropdown('target')" type="button" class="text-xs text-red-500 hover:text-red-700 focus:outline-none">
                                                            <i class="fas fa-times mr-1"></i> ปิด
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 3: การตั้งค่าแบบฟอร์ม -->
                            <div class="bg-white rounded border border-gray-200 mb-4">
                                <div class="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center">
                                    <div class="mr-2">
                                        <i class="fas fa-clipboard-list text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-sm font-semibold text-gray-800">การตั้งค่าแบบฟอร์ม</h2>
                                    </div>
                                </div>

                                <div class="p-4">
                                    <h3 class="text-sm font-medium text-gray-700 mb-2">การกรอกแบบฟอร์มข้อมูลเพิ่มเติม</h3>
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        <div class="p-3 border border-gray-200 rounded">
                                            <div class="flex items-start">
                                                <input v-model="checkedForm" id="form_yes" value="yes" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                <div class="ml-3">
                                                    <label for="form_yes" class="text-sm font-medium text-gray-900 cursor-pointer">กรอกแบบฟอร์ม</label>
                                                    <p class="text-xs text-gray-600 mt-1">ต้องกรอกข้อมูลเพิ่มเติมก่อนเริ่มเรียน</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="p-3 border border-gray-200 rounded">
                                            <div class="flex items-start">
                                                <input v-model="checkedForm" id="form_no" value="no" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                <div class="ml-3">
                                                    <label for="form_no" class="text-sm font-medium text-gray-900 cursor-pointer">ไม่กรอกแบบฟอร์ม</label>
                                                    <p class="text-xs text-gray-600 mt-1">ไม่ต้องกรอกข้อมูลเพิ่มเติม</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 4: การตั้งค่าออนไลน์และใบรับรอง -->
                            <div v-if="online" class="bg-white rounded border border-gray-200 mb-4">
                                <div class="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center">
                                    <div class="mr-2">
                                        <i class="fas fa-desktop text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-sm font-semibold text-gray-800">การตั้งค่าออนไลน์และใบรับรอง</h2>
                                    </div>
                                </div>
                                
                                <div class="p-4 space-y-4">
                                    <!-- การตั้งค่าการเล่นวิดีโอ -->
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-2">การควบคุมการเรียน</h3>
                                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                                            <div class="p-3 border border-gray-200 rounded">
                                                <div class="flex items-start">
                                                    <input v-model="checkedSkip" id="skip1" value="yes" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                    <div class="ml-3">
                                                        <label for="skip1" class="text-sm font-medium text-gray-900 cursor-pointer">ลาก Seekbar ได้</label>
                                                        <p class="text-xs text-gray-600 mt-1">อนุญาตให้ข้ามเนื้อหาได้</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="p-3 border border-gray-200 rounded">
                                                <div class="flex items-start">
                                                    <input v-model="checkedSkip" id="skip2" value="no" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                    <div class="ml-3">
                                                        <label for="skip2" class="text-sm font-medium text-gray-900 cursor-pointer">ลาง Seekbar ไม่ได้</label>
                                                        <p class="text-xs text-gray-600 mt-1">ต้องเรียนครบ 100%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Idle Check -->
                                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                                            <div class="p-3 border border-gray-200 rounded">
                                                <div class="flex items-start">
                                                    <input v-model="checkedIdle" id="idle1" value="yes" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                    <div class="ml-3">
                                                        <label for="idle1" class="text-sm font-medium text-gray-900 cursor-pointer">ใช้งาน Idle Check</label>
                                                        <p class="text-xs text-gray-600 mt-1">ตรวจสอบสถานะการเรียน</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="p-3 border border-gray-200 rounded">
                                                <div class="flex items-start">
                                                    <input v-model="checkedIdle" id="idle2" value="no" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                    <div class="ml-3">
                                                        <label for="idle2" class="text-sm font-medium text-gray-900 cursor-pointer">ไม่ใช้งาน Idle Check</label>
                                                        <p class="text-xs text-gray-600 mt-1">ไม่ตรวจสอบสถานะ</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Idle Settings -->
                                        <div v-if="checkedIdle==='yes'" class="p-3 border border-blue-200 rounded bg-blue-50">
                                            <h4 class="text-sm font-medium text-blue-800 mb-2">ตั้งค่า Idle Check</h4>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label for="idle_popup" class="block text-xs font-medium text-gray-700 mb-1">จำนวนกล่องแจ้งเตือน</label>
                                                    <input v-model="idle_popup" type="text" id="idle_popup" class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600">
                                                </div>
                                                <div>
                                                    <label for="idle_timeout" class="block text-xs font-medium text-gray-700 mb-1">จับเวลาที่วินาที</label>
                                                    <input v-model="idle_timeout" type="text" id="idle_timeout" class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600">
                                                </div>
                                                <div class="md:col-span-2 flex items-center">
                                                    <input v-model="idle_debug" type="checkbox" id="idle_debug" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                    <label for="idle_debug" class="ml-2 block text-sm text-gray-900">เปิดโหมด Debug</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- แบบสำรวจ -->
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-2">แบบสำรวจความพึงพอใจ</h3>
                                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                            <div class="p-3 border border-gray-200 rounded">
                                                <div class="flex items-start">
                                                    <input v-model="checkedSurvey" id="survey1" value="yes" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                    <div class="ml-3">
                                                        <label for="survey1" class="text-sm font-medium text-gray-900 cursor-pointer">ต้องกรอกแบบสำรวจ</label>
                                                        <p class="text-xs text-gray-600 mt-1">ผู้เรียนต้องกรอกแบบประเมิน</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="p-3 border border-gray-200 rounded">
                                                <div class="flex items-start">
                                                    <input v-model="checkedSurvey" id="survey2" value="no" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                    <div class="ml-3">
                                                        <label for="survey2" class="text-sm font-medium text-gray-900 cursor-pointer">ไม่ต้องกรอกแบบสำรวจ</label>
                                                        <p class="text-xs text-gray-600 mt-1">ไม่บังคับแบบประเมิน</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- ใบรับรอง -->
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-2">ใบรับรองอิเล็กทรอนิกส์</h3>
                                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                                            <div class="p-3 border border-gray-200 rounded">
                                                <div class="flex items-start">
                                                    <input v-model="checkedCertification" id="certOptionYes" value="yes" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                    <div class="ml-3">
                                                        <label for="certOptionYes" class="text-sm font-medium text-gray-900 cursor-pointer">มีใบรับรอง</label>
                                                        <p class="text-xs text-gray-600 mt-1">ออกใบรับรองให้ผู้เรียน</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="p-3 border border-gray-200 rounded">
                                                <div class="flex items-start">
                                                    <input v-model="checkedCertification" id="certOptionNo" value="no" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                    <div class="ml-3">
                                                        <label for="certOptionNo" class="text-sm font-medium text-gray-900 cursor-pointer">ไม่มีใบรับรอง</label>
                                                        <p class="text-xs text-gray-600 mt-1">ไม่ออกใบรับรอง</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- การตั้งค่าใบรับรอง -->
                                        <div v-if="checkedCertification === 'yes'" class="p-4 border border-gray-200 rounded bg-gray-50">
                                            <div class="space-y-4">
                                                <!-- เงื่อนไขการรับใบรับรอง -->
                                                <div>
                                                    <h4 class="text-sm font-medium text-gray-800 mb-3">เงื่อนไขการรับใบรับรอง</h4>
                                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <!-- เรียนจบ -->
                                                        <div class="border border-blue-200 rounded overflow-hidden">
                                                            <div class="p-3 bg-blue-50 border-l-4 border-blue-500">
                                                                <div class="flex items-start">
                                                                    <input v-model="selectedCertificationType" id="end" value="end" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                                    <div class="ml-3">
                                                                        <label for="end" class="text-sm font-medium text-gray-900 cursor-pointer">เมื่อเรียนจบ</label>
                                                                        <p class="text-xs text-gray-600 mt-1">เรียนครบตามเนื้อหา</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <!-- ออนไลน์แบบมีเงื่อนไข -->
                                                        <div class="border border-gray-200 rounded overflow-hidden">
                                                            <div class="p-3">
                                                                <div class="flex items-start">
                                                                    <input v-model="selectedCertificationType" id="online_flexible" value="online_flexible" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                                    <div class="ml-3">
                                                                        <label for="online_flexible" class="text-sm font-medium text-gray-900 cursor-pointer">แบบมีเงื่อนไข</label>
                                                                        <p class="text-xs text-gray-600 mt-1">กำหนดเงื่อนไขได้</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                            
                                                        <!-- ออฟไลน์ -->
                                                        <div class="border border-gray-200 rounded overflow-hidden">
                                                            <div class="p-3">
                                                                <div class="flex items-start">
                                                                    <input v-model="selectedCertificationType" id="pass_offline" value="pass_offline" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                                    <div class="ml-3">
                                                                        <label for="pass_offline" class="text-sm font-medium text-gray-900 cursor-pointer">แบบออฟไลน์</label>
                                                                        <p class="text-xs text-gray-600 mt-1">สอบ On-site</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                        
                                                    <!-- เงื่อนไขออนไลน์ -->
                                                    <div v-if="selectedCertificationType === 'online_flexible'" class="mt-3 p-3 bg-white border border-blue-200 rounded">
                                                        <h5 class="text-sm font-medium text-blue-800 mb-2">📋 เลือกเงื่อนไข</h5>
                                                        <div class="space-y-2">
                                                            <label class="flex items-start p-2 bg-blue-50 rounded border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                                                                <input v-model="certRequireExam" type="checkbox" class="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                                <div class="ml-3">
                                                                    <div class="text-sm font-medium text-gray-900">🎯 ต้องสอบผ่าน</div>
                                                                    <div class="text-xs text-gray-600">ผู้เรียนต้องสอบได้คะแนนผ่านเกณฑ์</div>
                                                                </div>
                                                            </label>
                                                            <label class="flex items-start p-2 bg-blue-50 rounded border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                                                                <input v-model="certRequireAssignment" type="checkbox" class="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                                <div class="ml-3">
                                                                    <div class="text-sm font-medium text-gray-900">📝 ต้องส่งการบ้าน</div>
                                                                    <div class="text-xs text-gray-600">ผู้เรียนต้องส่งงานครบถ้วน</div>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                    
                                                <!-- รูปแบบใบรับรอง -->
                                                <div>
                                                    <h4 class="text-sm font-medium text-gray-800 mb-2">รูปแบบใบรับรอง</h4>
                                                    <div class="grid grid-cols-2 gap-3">
                                                        <label class="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                                                            <input v-model="selectedCertificationTemplate" id="cert-standard" value="standard" type="radio" class="h-4 w-4 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                            <span class="ml-2 text-sm font-medium">มาตรฐาน</span>
                                                        </label>
                                                        <label class="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                                                            <input v-model="selectedCertificationTemplate" id="cert-custom" value="custom" type="radio" class="h-4 w-4 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                            <span class="ml-2 text-sm font-medium">กำหนดเอง</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                    
                                                <!-- ออกในนาม -->
                                                <div>
                                                    <h4 class="text-sm font-medium text-gray-800 mb-2">ออกใบรับรองในนาม</h4>
                                                    <div class="grid grid-cols-2 gap-3">
                                                        <label class="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                                                            <input v-model="cert_owner_personal" true-value="yes" false-value="no" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                            <span class="ml-2 text-sm font-medium">บุคคลธรรมดา</span>
                                                        </label>
                                                        <label class="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                                                            <input v-model="cert_owner_corperate" true-value="yes" false-value="no" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                            <span class="ml-2 text-sm font-medium">นิติบุคคล</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <!-- Tab Content: คำอธิบาย -->
                        <div v-if="courseActiveTab === 'description'" class="tab-content">

                            <!-- Section 3: เนื้อหาหลักสูตร -->
                            <div class="bg-white rounded border border-gray-200 mb-4">
                                <div class="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                                    <div class="flex items-center">
                                        <div class="mr-2">
                                            <i class="fas fa-file-alt text-blue-600"></i>
                                        </div>
                                        <div>
                                            <h2 class="text-sm font-semibold text-gray-800">เนื้อหาและคำอธิบาย</h2>
                                        </div>
                                    </div>
                                    <!-- Checkboxes on the right -->
                                    <div class="flex flex-wrap gap-x-3 gap-y-1">
                                        <div class="flex items-center">
                                            <input type="checkbox" id="show-short-description" class="mr-1 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500" v-model="show_short_description">
                                            <label for="show-short-description" class="text-xs text-gray-600">คำอธิบายสั้น</label>
                                        </div>
                                        <div class="flex items-center">
                                            <input type="checkbox" id="show-description" class="mr-1 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500" v-model="show_description">
                                            <label for="show-description" class="text-xs text-gray-600">คำอธิบาย</label>
                                        </div>
                                        <div class="flex items-center">
                                            <input type="checkbox" id="show-principles" class="mr-1 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500" v-model="show_principles">
                                            <label for="show-principles" class="text-xs text-gray-600">หลักการ</label>
                                        </div>
                                        <div class="flex items-center">
                                            <input type="checkbox" id="show-objective" class="mr-1 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500" v-model="show_objective">
                                            <label for="show-objective" class="text-xs text-gray-600">วัตถุประสงค์</label>
                                        </div>
                                        <div class="flex items-center">
                                            <input type="checkbox" id="show-target" class="mr-1 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500" v-model="show_target">
                                            <label for="show-target" class="text-xs text-gray-600">กลุ่มเป้าหมาย</label>
                                        </div>
                                        <div class="flex items-center">
                                            <input type="checkbox" id="show-structure" class="mr-1 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500" v-model="show_structure">
                                            <label for="show-structure" class="text-xs text-gray-600">โครงสร้าง</label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="p-4">
                                    <div class="space-y-4">
                                        <div v-if="show_short_description">
                                            <label class="block text-sm font-medium text-gray-700 mb-2">คำอธิบายอย่างสั้น</label>
                                            <editor :content="short_description" @update-content="updateItem_short_description"/>
                                        </div>
                                        <div v-if="show_description">
                                            <label class="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                                            <editor :content="description" @update-content="updateItem_description"/>
                                        </div>
                                        <div v-if="show_principles">
                                            <label class="block text-sm font-medium text-gray-700 mb-2">หลักการและเหตุผล</label>
                                            <editor :content="principles" @update-content="updateItem_principles"/>
                                        </div>
                                        <div v-if="show_objective">
                                            <label class="block text-sm font-medium text-gray-700 mb-2">วัตถุประสงค์</label>
                                            <editor :content="objective" @update-content="updateItem_objective"/>
                                        </div>
                                        <div v-if="show_target">
                                            <label class="block text-sm font-medium text-gray-700 mb-2">กลุ่มเป้าหมาย (ในรายละเอียด)</label>
                                            <editor :content="target" @update-content="updateItem_target"/>
                                        </div>
                                        <div v-if="show_structure">
                                            <label class="block text-sm font-medium text-gray-700 mb-2">โครงสร้างหลักสูตร</label>
                                            <editor :content="structure" @update-content="updateItem_structure"/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <!-- Tab Content: ตารางเรียน -->
                        <div v-if="courseActiveTab === 'schedule'" class="tab-content">
                            <div class="bg-white rounded border border-gray-200 mb-4">
                                <div class="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center">
                                    <div class="mr-2">
                                        <i class="fas fa-calendar-alt text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-sm font-semibold text-gray-800">ตารางเรียนและกำหนดการ</h2>
                                    </div>
                                </div>
                                <div class="p-4">
                                    <Schedule ref="scheduleComponent" />
                                </div>
                            </div>
                        </div>

                        <!-- Tab Content: หมวดหมู่ -->
                        <div v-if="courseActiveTab === 'categories'" class="tab-content">

                            <!-- Section 6: หมวดหมู่และ Taxonomy -->
                            <div class="bg-white rounded border border-gray-200 mb-4">
                                <div class="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center">
                                    <div class="mr-2">
                                        <i class="fas fa-tags text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-sm font-semibold text-gray-800">หมวดหมู่และการจัดกลุ่ม</h2>
                                    </div>
                                </div>
                                
                                <div class="p-4 space-y-4">
                                    <!-- หมวดหมู่ Category -->
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-2">หมวดหมู่ (Category)</h3>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-gray-200 rounded overflow-hidden">
                                            <template v-for="(categoryItem,index) in categoryData.filter(cat => cat.type === 'main')" :key="categoryItem._id">
                                                <div :class="['p-3', 'border-b', 'border-gray-200', index % 2 === 0 ? 'sm:border-r' : '', (index === categoryData.filter(cat => cat.type === 'main').length - 1 || (index === categoryData.filter(cat => cat.type === 'main').length - 2 && categoryData.filter(cat => cat.type === 'main').length % 2 === 0)) ? 'border-b-0' : '']">
                                                    <div class="flex items-start mb-2">
                                                        <div class="flex h-5 items-center">
                                                            <input v-model="checked" :id="categoryItem.code" :value="categoryItem.code" type="checkbox" class="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                        </div>
                                                        <div class="ml-3 text-sm w-[90%]">
                                                            <label :for="categoryItem.code" class="font-medium text-blue-900 cursor-pointer">{{ categoryItem.name }}</label>
                                                            <p class="text-gray-500 text-xs mt-1">{{ categoryItem.code }}</p>
                                                        </div>
                                                    </div>
                        
                                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 ml-3" v-if="categoryData.some(sub => sub.type === 'sub' && sub.parent === categoryItem._id)">
                                                        <div v-for="(subcategory) in categoryData.filter(sub => sub.type === 'sub' && sub.parent === categoryItem._id)" :key="subcategory._id">
                                                            <div class="flex items-start p-2 bg-gray-50 rounded">
                                                                <div class="flex h-5 items-center">
                                                                    <input v-model="checked" :id="subcategory.code" :value="subcategory.code" type="checkbox" class="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                                </div>
                                                                <div class="ml-3 text-sm w-[90%]">
                                                                    <label :for="subcategory.code" class="font-medium text-blue-900 cursor-pointer">{{ subcategory.name }}</label>
                                                                    <p class="text-gray-500 text-xs">{{ subcategory.code }}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </div>

                                    <!-- Taxonomy Selector -->
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <i class="fas fa-tags text-green-600"></i>
                                            หมวดหมู่ Taxonomy (ระบบใหม่)
                                        </h3>
                                        <p class="text-xs text-gray-500 mb-3">เลือกหมวดหมู่สำหรับคอร์สเรียนจากระบบ Taxonomy</p>
                                        
                                        <TaxonomySelector 
                                            content-type="course"
                                            content-type-label="คอร์สเรียน"
                                            v-model="selectedTaxonomyTerms"
                                            placeholder="เลือกหมวดหมู่สำหรับคอร์สเรียน"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div v-if="courseActiveTab === 'pricing'" class="tab-content">

                            <!-- Section 5: การตั้งค่าราคา -->
                            <div class="bg-white rounded border border-gray-200 mb-4">
                                <div class="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center">
                                    <div class="mr-2">
                                        <i class="fas fa-dollar-sign text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h2 class="text-sm font-semibold text-gray-800">การตั้งค่าราคาและการเงิน</h2>
                                    </div>
                                </div>
                                
                                <div class="p-4">
                                    <h3 class="text-sm font-medium text-gray-700 mb-2">ประเภทค่าใช้จ่าย</h3>
                                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
                                        <div class="p-3 border border-gray-200 rounded">
                                            <div class="flex items-start">
                                                <input v-model="checkedPricing" id="pricing_free" value="free" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                <div class="ml-3">
                                                    <label for="pricing_free" class="text-sm font-medium text-gray-900 cursor-pointer">ฟรี</label>
                                                    <p class="text-xs text-gray-600 mt-1">ไม่มีค่าใช้จ่าย</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="p-3 border border-gray-200 rounded">
                                            <div class="flex items-start">
                                                <input v-model="checkedPricing" id="pricing_paid" value="paid" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                <div class="ml-3">
                                                    <label for="pricing_paid" class="text-sm font-medium text-gray-900 cursor-pointer">มีค่าใช้จ่าย</label>
                                                    <p class="text-xs text-gray-600 mt-1">ราคาคงที่</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="p-3 border border-gray-200 rounded">
                                            <div class="flex items-start">
                                                <input v-model="checkedPricing" id="pricing_conditional" value="conditional" type="radio" class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500">
                                                <div class="ml-3">
                                                    <label for="pricing_conditional" class="text-sm font-medium text-gray-900 cursor-pointer">มีเงื่อนไข</label>
                                                    <p class="text-xs text-gray-600 mt-1">ราคาตามช่วงเวลา</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- ราคาคงที่ -->
                                    <div v-if="checkedPricing === 'paid'" class="p-3 border border-blue-200 rounded bg-blue-50">
                                        <h4 class="text-sm font-medium text-blue-800 mb-2">ตั้งค่าราคา</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label for="regular_price" class="block text-sm font-medium text-gray-700 mb-1">ราคาคอร์ส</label>
                                                <input v-model="regular_price" type="text" id="regular_price" class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600" placeholder="0">
                                            </div>
                                            <div>
                                                <label for="sale_price" class="block text-sm font-medium text-gray-700 mb-1">ราคาขาย (ถ้ามี)</label>
                                                <input v-model="sale_price" type="text" id="sale_price" class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600" placeholder="0">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- ราคาตามเงื่อนไข -->
                                    <div v-if="checkedPricing === 'conditional'" class="p-3 border border-green-200 rounded bg-green-50">
                                        <h4 class="text-sm font-medium text-green-800 mb-2">ตารางราคาตามเงื่อนไข</h4>
                                        <div class="mb-3 max-w-xs">
                                            <label for="regular_price_base" class="block text-sm font-medium text-gray-700 mb-1">ราคาคอร์สพื้นฐาน</label>
                                            <input v-model="regular_price" type="text" id="regular_price_base" class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-600" placeholder="0">
                                            <p class="mt-1 text-xs text-gray-500">ราคาพื้นฐานสำหรับคำนวณส่วนลด</p>
                                        </div>
                                        <SchedulePrice v-model="priceSchedules" :regular-price="regular_price" />
                                    </div>
                                </div>
                            </div>
                            
                        </div>

                        <!-- Section: การตั้งค่าสำหรับหลักสูตร On-site -->
                        <div v-if="offline" class="bg-white rounded border border-gray-200 mb-4">
                            <div class="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center">
                                <div class="mr-2">
                                    <i class="fas fa-map-marker-alt text-blue-600"></i>
                                </div>
                                <div>
                                    <h2 class="text-sm font-semibold text-gray-800">การตั้งค่าสำหรับหลักสูตร On-site</h2>
                                </div>
                            </div>
                            
                            <div class="p-4">
                                <div class="space-y-4">
                                    <!-- ข้อมูลจำนวน -->
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label for="seat" class="block text-sm font-medium text-gray-700 mb-1">จำนวนที่นั่ง</label>
                                            <input 
                                                v-model="seat" 
                                                type="text" 
                                                name="seat" 
                                                id="seat" 
                                                class="block w-full rounded border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="จำนวนที่นั่งสูงสุด"
                                            >
                                        </div>
                                        <div>
                                            <label for="days_class" class="block text-sm font-medium text-gray-700 mb-1">จำนวนวันที่เปิดอบรม</label>
                                            <input 
                                                v-model="days_class" 
                                                type="text" 
                                                name="days_class" 
                                                id="days_class" 
                                                class="block w-full rounded border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="จำนวนวันที่จัดอบรม"
                                            >
                                        </div>
                                    </div>

                                    <!-- การจำกัดที่นั่ง -->
                                    <div>
                                        <h3 class="text-sm font-medium text-gray-700 mb-2">การจำกัดที่นั่ง</h3>
                                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                            <div class="p-3 border border-gray-200 rounded">
                                                <div class="flex items-start">
                                                    <input 
                                                        v-model="limit_seat" 
                                                        id="limit_seat1" 
                                                        value="yes" 
                                                        type="radio" 
                                                        class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500"
                                                    >
                                                    <div class="ml-3">
                                                        <label for="limit_seat1" class="text-sm font-medium text-gray-900 cursor-pointer">จำกัดที่นั่ง</label>
                                                        <p class="text-xs text-gray-600 mt-1">ปิดลงทะเบียนเมื่อครบจำนวน</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="p-3 border border-gray-200 rounded">
                                                <div class="flex items-start">
                                                    <input 
                                                        v-model="limit_seat" 
                                                        id="limit_seat2" 
                                                        value="no" 
                                                        type="radio" 
                                                        class="h-4 w-4 mt-1 cursor-pointer text-blue-600 focus:ring-blue-500"
                                                    >
                                                    <div class="ml-3">
                                                        <label for="limit_seat2" class="text-sm font-medium text-gray-900 cursor-pointer">ไม่จำกัดที่นั่ง</label>
                                                        <p class="text-xs text-gray-600 mt-1">เปิดรับสมัครตลอด</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>

                    </section>
                </form>
            </div>
        </div>
    </div>

    <!-- Right Sidebar -->
    <div class="hidden xl:flex xl:w-80 xl:flex-col">
        <div class="flex flex-col flex-grow bg-white border-l border-gray-200 min-h-screen">
            <!-- Course Settings -->
            <div class="px-4 py-4 border-b border-gray-200">
                <h3 class="text-sm font-medium text-gray-700 mb-3">การตั้งค่า</h3>
                <div class="space-y-2">
                    <label class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <input type="checkbox" v-model="standalone" class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"/>
                        <div>
                            <div class="text-sm font-medium text-gray-900">Standalone Course</div>
                            <div class="text-xs text-gray-500">หลักสูตรแบบเดี่ยว</div>
                        </div>
                    </label>
                    <label class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <input type="checkbox" v-model="exam_only" class="rounded border-gray-300 text-orange-600 focus:ring-orange-600"/>
                        <div>
                            <div class="text-sm font-medium text-gray-900">Exam Only Course</div>
                            <div class="text-xs text-gray-500">หลักสูตรสำหรับสอบวัดผลอย่างเดียว</div>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Course Details -->
            <div class="px-4 py-4 border-b border-gray-200">
                <h3 class="text-sm font-medium text-gray-700 mb-3">เวลาเรียน</h3>
                <div class="space-y-3">
                    <div>
                        <label for="hours_sidebar" class="block text-xs font-medium text-gray-700 mb-1">จำนวนชั่วโมง</label>
                        <input v-model="hours" type="text" id="hours_sidebar" class="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"/>
                    </div>
                    <div>
                        <label for="days_sidebar" class="block text-xs font-medium text-gray-700 mb-1">จำนวนวัน</label>
                        <input v-model="days" type="text" id="days_sidebar" class="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"/>
                    </div>
                    <div v-if="offline">
                        <label for="seat_sidebar" class="block text-xs font-medium text-gray-700 mb-1">จำนวนที่นั่ง</label>
                        <input v-model="seat" type="text" id="seat_sidebar" class="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"/>
                    </div>
                </div>
            </div>

            <!-- Keywords/Tags -->
            <div class="px-4 py-4 border-b border-gray-200">
                <h3 class="text-sm font-medium text-gray-700 mb-3">#Hashtag</h3>
                
                <!-- Tag Input -->
                <div class="mb-2">
                    <div class="flex">
                        <input v-model="newKeyword" @keyup.enter="addKeyword" type="text" class="flex-1 px-2 py-1 border border-gray-300 rounded-l text-xs focus:outline-none focus:ring-1 focus:ring-blue-600" placeholder="เพิ่มแท็ก..."/>
                        <button @click="addKeyword" type="button" class="px-3 py-1 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                </div>

                <!-- Tags List -->
                <div class="flex flex-wrap gap-1">
                    <span v-for="(keyword, index) in keywords" :key="index" class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {{ keyword }}
                        <button @click="removeKeyword(index)" type="button" class="text-blue-500 hover:text-red-500">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </span>
                </div>
            </div>

            <!-- Meta Information -->
            <div class="px-4 py-4 border-b border-gray-200">
                <h3 class="text-sm font-medium text-gray-700 mb-3">ข้อมูลเพิ่มเติม</h3>
                <div class="space-y-1.5 text-xs text-gray-600">
                    <div class="flex justify-between">
                        <span>โหมด:</span>
                        <span>{{ mode === 'add' ? 'เพิ่มใหม่' : 'แก้ไข' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>ประเภท:</span>
                        <span>{{ checkedType || '-' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>วิธีการเรียน:</span>
                        <span>{{ checkedView || '-' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>หมวดหมู่:</span>
                        <span>{{ checked.length }} รายการ</span>
                    </div>
                    <div class="flex justify-between">
                        <span>สอบวัดผลอย่างเดียว:</span>
                        <span :class="exam_only ? 'text-orange-600 font-medium' : 'text-gray-500'">
                            {{ exam_only ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Action Buttons (Mobile hidden) -->
            <div class="mt-auto px-4 py-4 border-t border-gray-200">
                <div class="space-y-2">
                    <button @click="updataData" type="button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-save"></i>
                        บันทึกข้อมูล
                    </button>
                    <button v-if="mode === 'edit'" :disabled="this.lesson_type === 'child'" :class="{ 'opacity-50 cursor-not-allowed': this.lesson_type === 'child' }" @click="deleteData(dataItem)" type="button" class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-trash"></i>
                        ลบหลักสูตร
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>
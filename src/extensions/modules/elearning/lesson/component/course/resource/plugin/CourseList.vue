<script>
// Component
import feather from 'feather-icons';
import { useRoute } from 'vue-router'
import storageManager from '@/plugins/storage';
import Loader from '@/interface/template/Loader.vue';

// import Subhead from '@/interface/template/outline/Subhead.vue';
import Pagination from '@/utils/Paginated.vue';
import LazyImage from '@/components/LazyImage.vue';

import { S3 } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import CustomConfirmation from '@/utils/Confirmation.vue';

import { translate } from '@/plugins/language.js';

export default {
    props: {
        itemType: {
            type: String,
            default: 'e_learning'
        }
    },
    data() {
        const route = useRoute();
        const session = storageManager.get('session')
        const configs = storageManager.get("configs");
        const schoolSession = configs;
        const s3Client = new S3({
            forcePathStyle: false,
            endpoint: schoolSession.s3EndpointDefault,
            region: schoolSession.s3Region,
            ResponseContentEncoding: "utf-8",
            credentials: {
                accessKeyId: schoolSession.s3Key,
                secretAccessKey: schoolSession.s3Secret,
            },
        });

        return {
            showCategoryPanel: false,
            showInactiveItems: false, // เพิ่มตัวแปรสำหรับแสดงรายการที่สถานะเป็น false
            S3: s3Client,
            schoolSession: schoolSession,
            PageName: route.meta.title,
            PageIcon: route.meta.icon,
            PagePath: route.meta.path,
            ParentName: route.meta.parent,
            ParentPage: route.meta.page,
            school: session.current.id,
            login: session.login,
            listItems: [],
            categoryData: [],
            categoryFullData: [],
            categoryFilter: [],
            loading_sources: true,
            pages: 0,
            current: 0,
            total: 0,
            next: true,
            prev: false,
            hide:true,
            MasterText: session.MasterText,
            endpoint: "",
            master: session.master,
            accessToken: storageManager.get('session', 'token'),
            configs: storageManager.get('configs'),
            session: storageManager.get('session'),
            limitItem: 20,
            limitOptions: [1, 10, 20, 50, 100, 200, 500, 1000, 2000], // เพิ่ม 1 สำหรับ testing
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            loading: false,
            activeBlock: false, // เพิ่มตัวนี้
            showingOverlay: false,
            searchQuery: "",
            typeFilter: ["e_learning", "onsite", "online_course"], // Use an array to store multiple selections
            statusFilter: [true, false], // Use an array to store multiple selections
            typeOptions: [
                { name: 'E-Learning', value: 'e_learning' },
                { name: 'On-Site', value: 'onsite' },
                { name: 'On-Line', value: 'online_course' }

            ],
            statusOptions: [
                { name: this.translate('general-public'), value: true },
                { name: this.translate('general-unpublic'), value: false }
            ],
            //Custom Confirmation
            confirmMessage: '',
            confirmHeader: '',
            confirmType: '',
            showConfirmation: false,
            confirmData: null,
            tableData: [],
            //Custom Confirmation

            // Progressive/Lazy Rendering Options
            lazy: true, // Option to enable/disable lazy rendering
            initialDisplayCount: 20, // จำนวนที่แสดงครั้งแรก
            loadMoreCount: 10, // จำนวนที่โหลดเพิ่มทีละครั้ง
            currentDisplayCount: 20, // จำนวนที่แสดงปัจจุบัน
            isLoadingMore: false, // สถานะการโหลดเพิ่ม
            
            // Image loading performance tracking
            imageLoadStats: {
                totalImages: 0,
                loadedImages: 0,
                failedImages: 0,
                startTime: null
            }
        }
    },
    components: {
        Loader,
        // Subhead,
        Pagination,
        CustomConfirmation,
        LazyImage
    },
    methods: {
        translate,
        isImageValid(url) {
            // ตรวจสอบ URL แบบเรียบง่าย - ให้ผ่านทุก URL ที่เป็น HTTP
            if (!url || typeof url !== 'string') {
                console.log('🔍 Invalid URL - not string:', url);
                return false;
            }
            
            // ตรวจสอบแค่ว่าเป็น HTTP URL เท่านั้น
            const isHttpUrl = url.startsWith('http://') || url.startsWith('https://');
            
            if (!isHttpUrl) {
                console.log('🔍 Invalid URL - not HTTP protocol:', url);
                return false;
            }
            
            // ผ่านทุก HTTP URL - ปล่อยให้ browser และ LazyImage จัดการ
            console.log('✅ Valid URL passed:', url.substring(0, 80) + (url.length > 80 ? '...' : ''));
            return true;
        },
        
        // เพิ่มฟังก์ชันสำหรับ handle S3 URL
        getS3ImageUrl(imageUrl) {
            if (!imageUrl) {
                console.log('🔍 getS3ImageUrl - No image URL provided');
                return null;
            }
            
            // ถ้าเป็น URL เต็มแล้ว ให้ใช้เลย
            if (imageUrl.startsWith('http')) {
                console.log('🔍 getS3ImageUrl - Using full URL:', imageUrl.substring(0, 100) + '...');
                return imageUrl;
            }
            
            // ถ้าเป็น path เฉพาะ ให้สร้าง URL เต็ม
            const baseUrl = this.schoolSession?.s3EndpointDefault || '';
            const fullUrl = `${baseUrl}/${imageUrl}`;
            console.log('🔍 getS3ImageUrl - Created full URL:', fullUrl.substring(0, 100) + '...');
            return fullUrl;
        },
        // Image Loading Event Handlers
        // eslint-disable-next-line no-unused-vars
        onImageLoaded(event) {
            // Handle successful image load from LazyImage component
            // Event object: { src: string, element: HTMLElement }
            this.imageLoadStats.loadedImages++;
            
            console.log('SUCCESS: Image loaded successfully!', {
                src: event?.src?.substring(0, 80) + '...',
                loadedCount: this.imageLoadStats.loadedImages,
                totalCount: this.imageLoadStats.totalImages,
                element: event?.element?.tagName
            });
            
            // Calculate loading performance
            if (this.imageLoadStats.startTime && this.imageLoadStats.loadedImages === 1) {
                const loadTime = (performance.now() - this.imageLoadStats.startTime).toFixed(2);
                console.log('PERFORMANCE: First image loaded in ' + loadTime + 'ms');
            }
        },
        // eslint-disable-next-line no-unused-vars
        onImageError(event) {
            // Handle image load error from LazyImage component  
            // Event object: { src: string, element: HTMLElement, reason?: string }
            this.imageLoadStats.failedImages++;
            const reason = event?.reason || 'Image load failed';
            console.log(`❌ Course image failed (${this.imageLoadStats.failedImages} errors):`, event?.src || 'Unknown source', `- Reason: ${reason}`);
        },
        
        // Initialize image loading tracking
        initImageLoadStats() {
            const coursesWithImages = this.listItems.filter(item => item.cover && item.cover.trim() !== '');
            const coursesWithValidImages = this.listItems.filter(item => 
                item.cover && item.cover.trim() !== '' && this.isImageValid(item.cover)
            );
            
            this.imageLoadStats = {
                totalImages: coursesWithValidImages.length,
                loadedImages: 0,
                failedImages: 0,
                startTime: performance.now()
            };
            
            console.log(`🖼️ Image Loading Analysis:`);
            console.log(`  📊 Total courses: ${this.listItems.length}`);
            console.log(`  📸 Courses with cover field: ${coursesWithImages.length}`);
            console.log(`  ✅ Courses with valid images: ${coursesWithValidImages.length}`);
            console.log(`  ❌ Invalid image URLs: ${coursesWithImages.length - coursesWithValidImages.length}`);
        },
        
        // Debug method to check course data
        debugCourseData() {
            console.log(`🔍 Total courses: ${this.listItems.length}`);
            const coursesWithImages = this.listItems.filter(item => item.cover);
            const coursesWithValidImages = this.listItems.filter(item => item.cover && item.cover.trim() !== '');
            
            console.log(`🖼️ Courses with cover field: ${coursesWithImages.length}`);
            console.log(`✅ Courses with valid cover URLs: ${coursesWithValidImages.length}`);
            
            if (this.listItems.length > 0) {
                console.log(`📝 First course data:`, {
                    name: this.listItems[0].name,
                    cover: this.listItems[0].cover,
                    keys: Object.keys(this.listItems[0])
                });
            }
        },
        //Confirm Dialog
        removeItem(item, master, name) {
            this.confirmMessage = 'คุณต้องการลบหลักสูตร <br> <small class="text-gray-400">' + name + '</small></br><span class="text-red-500">* หลังจากลบแล้วจะไม่สามารถกู้คืนได้</span>';
            this.confirmHeader = 'ยืนยันการทำรายการ';
            this.confirmData = { item, master };
            this.confirmType = 'warning';
            this.showConfirmation = true;
        },
        confirmRemoveItem() {
            const { item, master } = this.confirmData;
            console.log("Delete", item);
            this.deleteData(item, master);
            this.handleConfirmCancel();
        },
        handleConfirmation() {
            if (this.confirmData) {
                this.confirmRemoveItem(); // Corrected function name
            }
        },
        handleConfirmCancel() {
            this.confirmData = null;
            this.confirmMessage = '';
            this.confirmHeader = '';
            this.confirmType = '';
            this.showConfirmation = false;
        },
        //Confirm Dialog
        showOverlay() {
            this.showingOverlay = true
        },
        hideOverlay() {
            this.showingOverlay = false;
        },
        objectFindByKey(array, key, value) {
            for (var i = 0; i < array.length; i++) {
                if (array[i][key] === value) {
                    return array[i];
                }
            }
            return null;
        },
        getCategoryName(code) {
            const category = this.objectFindByKey(this.categoryData, 'code', code);
            return category ? category.name : '';
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
        async fetchScoreCount(id) {
            try {
                const payload = {
                    args: [{
                        $and: [
                            { courseID: id }
                        ]
                    }]
                };

                const { data: response } = await this.$Request.POST(
                    'enroll/count',
                    payload,
                    this.configs.key
                );

                return response.count;
            } catch (error) {
                console.error("An error occurred while fetching score count:", error);
            }
        },
        async fetchScorePassCount(id) {
            try {
                const payload = {
                    args: [{
                        courseID: id,
                        "analytics.post.message": "ผ่านการรับรอง"
                    }]
                };

                const { data: response } = await this.$Request.POST(
                    'enroll/count',
                    payload,
                    this.configs.key
                );

                return response.count;
            } catch (error) {
                console.error("An error occurred while fetching score count:", error);
            }
        },
        handleLimitChange() {
            console.log(`🔄 Limit changed to: ${this.limitItem}`);
            
            const session = storageManager.get('session');
            session.limitItem = this.limitItem;
            storageManager.set('session', session);
            this.currentPage = 1; // Reset current page to 1
            session.currentPage = this.currentPage;
            storageManager.set('session', session);
            const updatedUrlParams = new URLSearchParams(window.location.search);
            updatedUrlParams.set('page', session.currentPage);
            const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
            window.history.replaceState({}, '', updatedUrl);
            
            // 🎯 Auto-adjust lazy loading based on limit
            if (this.limitItem <= 50) {
                // ถ้า limit น้อย ปิด lazy mode
                if (this.lazy) {
                    console.log(`🔄 Auto-disabling lazy mode for small limit: ${this.limitItem}`);
                    this.lazy = false;
                    if (this.scrollCleanup) {
                        this.scrollCleanup();
                    }
                }
            } else {
                // ถ้า limit เยอะ เปิด lazy mode และปรับ initialDisplayCount
                if (!this.lazy) {
                    console.log(`🔄 Auto-enabling lazy mode for large limit: ${this.limitItem}`);
                    this.lazy = true;
                }
                
                // ปรับ initialDisplayCount ตาม limitItem
                if (this.limitItem <= 100) {
                    this.initialDisplayCount = Math.min(50, this.limitItem);
                } else if (this.limitItem <= 500) {
                    this.initialDisplayCount = 100;
                } else {
                    this.initialDisplayCount = 200;
                }
                
                this.resetDisplayCount();
                console.log(`📊 Adjusted initialDisplayCount to: ${this.initialDisplayCount} for limit: ${this.limitItem}`);
                
                // Setup scroll detection สำหรับ lazy mode
                this.$nextTick(() => {
                    this.setupScrollDetection();
                });
            }
            
            //console.log("getdata","handleLimitChange");
            this.getData();
        },
        handlePageChanged(page) {
            if (page !== this.currentPage) {
                window.scrollTo(0, 0);
                this.currentPage = page;
                const session = storageManager.get('session');
                session.currentPage = this.currentPage;
                storageManager.set('session', session);
                //console.log("getdata","handlePageChanged");
                this.getData();
            }
        },
        clearSearchQuery() {
            this.searchQuery = '';
            const session = storageManager.get('session');
            session.searchQuery = '';
            storageManager.set('session', session);
            //console.log("getdata","clearSearchQuery");
            this.getData();
        },
        formatDataRange() {
            if (this.totalItems === 0) return 'ไม่มีข้อมูล';
            
            const startItem = (this.currentPage - 1) * this.limitItem + 1;
            const endItem = Math.min(this.currentPage * this.limitItem, this.totalItems);
            
            return `${startItem.toLocaleString()}-${endItem.toLocaleString()}`;
        },
        toggleCategory(code) {
        const isChecked = this.categoryFilter.includes(code);
        const category = this.categoryFullData.find(c => c.code === code);

        if (!category) return;

        if (category.type === 'main') {
            // หา sub ทั้งหมดที่อยู่ใต้ main นี้
            const subCodes = this.categoryFullData
            .filter(c => c.parent === category._id)
            .map(c => c.code);

            if (isChecked) {
            // ❌ ยกเลิก main → เอา main และ sub ออก
            this.categoryFilter = this.categoryFilter.filter(c =>
                c !== code && !subCodes.includes(c)
            );
            } else {
            // ✅ เลือก main → ใส่ main และ sub เข้า
            this.categoryFilter.push(code);
            this.categoryFilter.push(...subCodes.filter(c => !this.categoryFilter.includes(c)));
            }
        } else if (category.type === 'special') {
            // ✅ จัดการ special category (uncategory)
            if (isChecked) {
                this.categoryFilter = this.categoryFilter.filter(c => c !== code);
            } else {
                this.categoryFilter.push(code);
            }
        } else {
            // ถ้าเป็น sub category → toggle เฉพาะตัวเอง
            if (isChecked) {
            this.categoryFilter = this.categoryFilter.filter(c => c !== code);
            } else {
            this.categoryFilter.push(code);
            }
        }

        this.getData();
        },
        toggleAllCategories() {
            if (this.isAllCategoryChecked) {
            this.categoryFilter = [];
            } else {
            this.categoryFilter = this.categoryFullData.map(cat => cat.code);
            }
            this.getData();
        },
        getSubCategories(parentId) {
            return this.categoryFullData.filter(cat => cat.type === 'sub' && cat.parent === parentId);
        },
        async getCategoryData() {
            try {
                const pipeline = [
  {
    $match: {
      unit: this.session.current._id,
    },
  },
  {
    $sort: {
      name: 1,
    },
  },
  {
    $lookup: {
      from: 'course', // collection name
      let: { categoryCode: '$code' },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ['$$categoryCode', '$category'],
            },
          },
        },
        {
          $count: 'count',
        },
      ],
      as: 'courseUsed',
    },
  },
  {
    $addFields: {
      courseUsedCount: {
        $cond: {
          if: { $gt: [{ $size: '$courseUsed' }, 0] },
          then: { $arrayElemAt: ['$courseUsed.count', 0] },
          else: 0,
        },
      },
    },
  },
  {
    $project: {
      courseUsed: 0, // remove raw array
    },
  },
];

                const { data: finalRes } = await this.$Request.POST('category/aggregate', { pipeline }, this.configs.key);
                
                // ✅ นับจำนวนหลักสูตรที่ไม่มี category
                const uncategorizedCountPipeline = [
                    {
                        $match: {
                            unit: this.session.current._id,
                            type: this.itemType,
                            $or: [
                                { category: { $exists: false } },
                                { category: { $size: 0 } },
                                { category: [] }
                            ]
                        }
                    },
                    {
                        $count: "count"
                    }
                ];
                
                const { data: uncategorizedCount } = await this.$Request.POST('course/aggregate', { pipeline: uncategorizedCountPipeline }, this.configs.key);
                const uncategorizedCourseCount = uncategorizedCount && uncategorizedCount.length > 0 ? uncategorizedCount[0].count : 0;
                
                if (finalRes) {
                    // ✅ ล้างข้อมูลเก่า และกำหนดใหม่
                    this.categoryFullData = [...finalRes]; // ใช้ spread operator เพื่อ clone array
                    
                    // ✅ เพิ่ม "Uncategory" เป็นตัวเลือกพิเศษ เฉพาะเมื่อมีหลักสูตรที่ไม่มี category
                    if (uncategorizedCourseCount > 0) {
                        // ตรวจสอบว่ามี uncategory อยู่แล้วหรือไม่
                        const existingUncategory = this.categoryFullData.find(cat => cat.code === 'uncategory');
                        if (!existingUncategory) {
                            this.categoryFullData.unshift({
                                _id: 'uncategory',
                                code: 'uncategory',
                                name: `ไม่มีหมวดหมู่ (${uncategorizedCourseCount})`,
                                type: 'special',
                                courseUsedCount: uncategorizedCourseCount
                            });
                        }
                    }
                    
                    // ✅ เลือกทั้งหมดเป็นค่าเริ่มต้น
                    this.categoryFilter = this.categoryFullData.map(item => item.code);
                }
            } catch (error) {
                console.error("getCategoryData error", error);
            }
        },
        async getData() {
            const startTime = performance.now();
            console.log(`⏱️ getData started - Page: ${this.currentPage}, Limit: ${this.limitItem}`);

            //console.log("getData", this.login);
            //console.log("Role",this.session.role);

            if (this.login) {
                try {
                    this.loading = true;
                    this.activeBlock = true;
                    this.listItems = [];
                    this.totalItems = 0;

                    // ✅ ลบเงื่อนไขที่บล็อกการแสดงผลเมื่อไม่มี categoryFilter
                    // if (this.categoryFilter.length === 0) {
                    //     this.listItems = [];
                    //     this.totalItems = 0;
                    //     this.totalPages = 0;
                    //     this.loading = false;
                    //     this.activeBlock = false;
                    //     return;
                    // }

                    let andConditions = [{ unit: this.session.current._id }];

                    // Check if 'all' is not selected in typeFilter
                    andConditions.push({ type: this.itemType });

                    // Check if 'all' is not selected in statusFilter
                    if (!this.statusFilter.includes('all')) {
                        andConditions.push({ status: { $in: this.statusFilter } });
                    }

                    if (this.searchQuery) {
                        const trimmedQuery = this.searchQuery.trim();

                        if (trimmedQuery.startsWith('#')) {
                            // ลบ `#` แล้วแยกตาม comma → ['test', 'demo']
                            const keywordsArray = trimmedQuery
                                .replace(/^#+/, '')      // remove leading hash(es)
                                .split(',')
                                .filter(Boolean);        // remove empty strings

                            if (keywordsArray.length > 0) {
                                andConditions.push({
                                    keywords: { $in: keywordsArray }
                                });
                            }
                        } else {
                            andConditions.push({
                                name: { $regex: `.*${trimmedQuery}.*`, $options: 'i' }
                            });
                        }
                    }

                    if (this.categoryFilter.length > 0) {
                        // ✅ ปรับเงื่อนไข category filter ให้รองรับ uncategory
                        const normalCategories = this.categoryFilter.filter(cat => cat !== 'uncategory');
                        const hasUncategory = this.categoryFilter.includes('uncategory');
                        
                        if (normalCategories.length > 0 && hasUncategory) {
                            // ถ้าเลือกทั้ง category ปกติและ uncategory
                            andConditions.push({ 
                                $or: [
                                    { category: { $in: normalCategories } },
                                    { category: { $exists: false } },
                                    { category: { $size: 0 } },
                                    { category: [] }
                                ]
                            });
                        } else if (normalCategories.length > 0) {
                            // ถ้าเลือกเฉพาะ category ปกติ
                            andConditions.push({ category: { $in: normalCategories } });
                        } else if (hasUncategory) {
                            // ถ้าเลือกเฉพาะ uncategory
                            andConditions.push({ 
                                $or: [
                                    { category: { $exists: false } },
                                    { category: { $size: 0 } },
                                    { category: [] }
                                ]
                            });
                        }
                    }

                    // Add condition for manager or admin role
                    if (['manager'].includes(this.session.role)) {
                        andConditions.push({ admin: this.session.userID });
                    }

                    // เพิ่มเงื่อนไขสำหรับกรองสถานะ
                    if (!this.showInactiveItems) {
                        // ถ้าไม่แสดงรายการที่สถานะเป็น false ให้แสดงเฉพาะที่สถานะเป็น true
                        andConditions.push({ status: true });
                    }

                    // Create optimized pipeline without $facet
                    const countPipeline = [
                        {
                            $match: {
                                $and: andConditions,
                            },
                        },
                        {
                            $sort: {
                                createdAt: -1,
                                status: -1,
                                type: 1,
                            }
                        },
                        {
                            $count: "total"
                        }
                    ];

                    const dataPipeline = [
                        {
                            $match: {
                                $and: andConditions,
                            },
                        },
                        {
                            $sort: {
                                createdAt: -1,
                                status: -1,
                                type: 1,
                            }
                        },
                        {
                            $lookup: {
                                from: "category",
                                localField: "category",
                                foreignField: "code",
                                as: "categoryData"
                            }
                        },
                        {
                            $lookup: {
                                from: "enroll",
                                let: { courseId: { $toString: "$_id" } },
                                pipeline: [
                                {
                                    $match: {
                                    $expr: {
                                        $eq: [ "$courseID", "$$courseId" ]
                                    }
                                    }
                                },
                                {
                                    $count: "userCount"
                                }
                                ],
                                as: "enrollInfo"
                            }
                            },
                            {
                            $addFields: {
                                enrollUserCount: {
                                $ifNull: [{ $arrayElemAt: ["$enrollInfo.userCount", 0] }, 0]
                                }
                            }
                            },
                        {
                            $lookup: {
                                from: "post",
                                let: { postIdStr: { $toString: "$_id" } },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$$postIdStr", "$parent"]
                                            }
                                        }
                                    },
                                    {
                                        $count: "subItemCount"
                                    }
                                ],
                                as: "subItemCountArray"
                            }
                        },
                        {
                            $addFields: {
                                subItemCount: {
                                    $ifNull: [{ $arrayElemAt: ["$subItemCountArray.subItemCount", 0] }, 0]
                                }
                            }
                        },
                        { $skip: (this.currentPage - 1) * this.limitItem },
                        { $limit: this.limitItem }
                    ];

                    const mongoStartTime = performance.now();
                    console.log(`🔍 MongoDB query started - Count pipeline stages: ${countPipeline.length}, Data pipeline stages: ${dataPipeline.length}`);

                    // Execute count query first (faster)
                    const countStart = performance.now();
                    const { data: countResult } = await this.$Request.POST(
                        `${this.endpoint}/aggregate`, 
                        { pipeline: countPipeline },
                        this.configs.key
                    );
                    const countTime = (performance.now() - countStart).toFixed(2);
                    
                    const totalCount = countResult && countResult.length > 0 ? countResult[0].total : 0;
                    console.log(`📊 Count query completed - Time: ${countTime}ms, Total: ${totalCount}`);

                    // Execute data query
                    const dataStart = performance.now();
                    const { data: dataResult, status } = await this.$Request.POST(
                        `${this.endpoint}/aggregate`, 
                        { pipeline: dataPipeline },
                        this.configs.key
                    );
                    const dataTime = (performance.now() - dataStart).toFixed(2);

                    const mongoEndTime = performance.now();
                    const mongoTime = (mongoEndTime - mongoStartTime).toFixed(2);
                    console.log(`📊 Data query completed - Time: ${dataTime}ms, Data size: ${JSON.stringify(dataResult).length} bytes`);
                    console.log(`📊 Total MongoDB time - Time: ${mongoTime}ms (Count: ${countTime}ms + Data: ${dataTime}ms)`);

                    if (status === 200) {
                        const transformStartTime = performance.now();
                        console.log(`🔄 Data transformation started - Items to process: ${dataResult.length}`);

                        const formattedData = {
                            data: dataResult || [],
                            total: totalCount,
                            paging: {
                                page: this.currentPage,
                                limit: this.limitItem,
                                totalPages: Math.ceil(totalCount / this.limitItem)
                            }
                        };

                        this.listItems = formattedData.data;
                        this.totalItems = formattedData.total;
                        this.totalPages = formattedData.paging.totalPages;
                        this.loading = false;
                        this.activeBlock = false;

                        // Initialize image loading tracking
                        this.initImageLoadStats();
                        
                        // Debug course data
                        this.debugCourseData();

                        const transformEndTime = performance.now();
                        const transformTime = (transformEndTime - transformStartTime).toFixed(2);
                        console.log(`✨ Data transformation completed - Time: ${transformTime}ms, Items processed: ${this.listItems.length}`);

                        const endTime = performance.now();
                        const processingTime = (endTime - startTime).toFixed(2);
                        const totalMongoTime = mongoTime;
                        const networkTime = (parseFloat(processingTime) - parseFloat(mongoTime) - parseFloat(transformTime)).toFixed(2);
                        
                        console.log(`✅ getData completed - Total: ${processingTime}ms`);
                        console.log(`📈 Performance breakdown:`);
                        console.log(`  🔗 Network + Overhead: ${networkTime}ms`);
                        console.log(`  🗄️  MongoDB Processing: ${totalMongoTime}ms`);
                        console.log(`  🔄 Data Transformation: ${transformTime}ms`);
                        console.log(`  📊 Items: ${this.listItems.length}, Total Records: ${this.totalItems}`);

                        // Reset display count สำหรับ lazy loading
                        if (this.lazy) {
                            this.resetDisplayCount();
                        }
                        
                        // Wait for Vue reactivity and browser paint to complete
                        await this.$nextTick();
                        await new Promise(resolve => {
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    // Double RAF to ensure paint is complete
                                    setTimeout(resolve, 0);
                                });
                            });
                        });
                        
                        const finalEndTime = performance.now();
                        const finalProcessingTime = (finalEndTime - startTime).toFixed(2);
                        const renderTime = (finalEndTime - endTime).toFixed(2);
                        
                        console.log(`🏁 Final completion (including DOM render) - Total: ${finalProcessingTime}ms`);
                        console.log(`🎨 DOM Render Time: ${renderTime}ms`);
                        console.log(`📈 Complete breakdown:`);
                        console.log(`  🔗 Network + Overhead: ${networkTime}ms`);
                        console.log(`  🗄️  MongoDB Processing: ${totalMongoTime}ms`);
                        console.log(`  🔄 Data Transformation: ${transformTime}ms`);
                        console.log(`  🎨 DOM Rendering: ${renderTime}ms`);
                        console.log(`  📊 Performance ratio: MongoDB(${(parseFloat(totalMongoTime)/parseFloat(finalProcessingTime)*100).toFixed(1)}%) | Transform(${(parseFloat(transformTime)/parseFloat(finalProcessingTime)*100).toFixed(1)}%) | Render(${(parseFloat(renderTime)/parseFloat(finalProcessingTime)*100).toFixed(1)}%)`);
                    }

                } catch (error) {
                    console.log(error);
                    const endTime = performance.now();
                    const processingTime = (endTime - startTime).toFixed(2);
                    console.log(`❌ getData error - Time: ${processingTime}ms, Error:`, error);
                } finally {
                    this.loading = false;
                    this.activeBlock = false;
                }
            }
        },
        async countChildCourse(id) {
            try {
                const payload = {
                    args: [{
                        $and: [
                            { master: id }
                        ]
                    }]
                };

                const { data: response } = await this.$Request.POST(
                    'course/count',
                    payload,
                    this.configs.key
                );

                return response.count;
            } catch (error) {
                console.error("An error occurred while fetching score count:", error);
            }
        },
        async deleteData(id, master) {
            if (this.login) {
                try {
                    this.loading_sources = false;
                    console.log("id", id)
                    const counting = await this.countChildCourse(master);
                    console.log("Count", counting);
                    if (counting > 1) {
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
                        const { data: resAPI } = await this.$Request.GET(
                            `${this.endpoint}/${id}`,
                            this.configs.key
                        );
                        console.log(resAPI);

                        // ลบออกจาก master course (ถ้ามี)
                        if (master) {
                            const { data: finalRes } = await this.$Request.POST(
                                `mcourse/${master}/child`, {
                                    action: "remove",
                                    element: id,
                                    type: "string",
                                },
                                this.configs.key
                            );
                            console.log("Remove from master result:", finalRes);
                        }

                        // ลบ course record ตัวจริง
                        const { data: deleteResult } = await this.$Request.DELETE(
                            `${this.endpoint}/${id}`, null,
                            this.configs.key
                        );
                        
                        console.log("Delete course result:", deleteResult);

                        // แสดง success notification
                        this.$swal({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 2000,
                            icon: 'success',
                            title: 'สำเร็จ',
                            text: 'ลบหลักสูตรเรียบร้อยแล้ว',
                        });

                        // อัปเดตข้อมูล
                        this.getData();
                    }

                    this.loading_sources = true;
                    await this.getData();

                } catch (error) {
                    console.log(error)
                }
            }
        },
        async cloneChildData(id) {
            if (this.login) {
                try {
                    if (this.master) {
                        this.endpoint = "mcourses";
                    } else {
                        this.endpoint = "courses";
                    }
                    this.loading_sources = false;

                    const { data: finalRes } = await this.$Request.POST(
                        `mcourses/${id}/cloneCourse/`, {},
                        this.accessToken
                    );

                    if (finalRes.success) {
                        this.$swal({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 500,
                            icon: 'success',
                            title: 'แจ้งเตือน',
                            text: 'สร้างหลักสูตร Cloning เรียบร้อยแล้ว',
                        }).then(() => {
                            this.loading_sources = true;
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        },
        async cloneData(id) {
            try {
                // เปลี่ยนจาก mcourse เป็น course
                const { data: course } = await this.$Request.GET(`course/${id}`, this.configs.key);

                // นับจำนวน child courses ที่มี master เดียวกับ course ต้นทาง
                const countPayload = {
                    method: 'find',
                    args: [{
                        $and: [
                            { master: course.master },
                        ],
                    }, ],
                };
                const { data: count } = await this.$Request.POST('course/count', countPayload, this.configs.key);

                course.category.filter((value) => value !== null);

                const createPayload = {
                    data: {
                        unit: this.session.current._id,
                        name: `${course.name} - (${count.count + 1})`,
                        slug: this.slugify(course.slug),
                        erp_code: course.erp_code,
                        hours: course.hours,
                        days: course.days,
                        category: course.category,
                        type: course.type,
                        mode: course.mode,
                        display: course.display,
                        regular_price: course.regular_price,
                        sale_price: course.sale_price,
                        principles: course.principles,
                        objective: course.objective,
                        lecturer: course.lecturer,
                        target: course.target,
                        institution: course.institution,
                        form: course.form,
                        structure: course.structure,
                        description: course.description,
                        short_description: course.short_description,
                        startRegistDate: course.startRegistDate,
                        endRegistDate: course.endRegistDate,
                        accessDate: course.accessDate,
                        endDate: course.endDate,
                        pretestDate: course.pretestDate,
                        posttestDate: course.posttestDate,
                        scoreDate: course.scoreDate,
                        certDate: course.certDate,
                        limit_seat: course.limit_seat,
                        days_class: course.days_class,
                        seat: course.seat,
                        cover: course.cover,
                        lesson_type: 'child',
                        lesson_old_id: course.lesson_old_id,
                        master: course.master, // ใช้ master ของ course ต้นทาง
                        status: true,
                        // เพิ่มฟิลด์ใหม่ๆ ที่อาจมี
                        formID: course.formID,
                        show_description: course.show_description,
                        show_objective: course.show_objective,
                        show_principles: course.show_principles,
                        show_short_description: course.show_short_description,
                        show_structure: course.show_structure,
                        show_target: course.show_target,
                        scheduleConfig: course.scheduleConfig,
                        standalone: course.standalone,
                        surveyId: course.surveyId,
                        certificationId: course.certificationId,
                        view: course.view,
                        certification: course.certification,
                        certification_template: course.certification_template,
                        certification_type: course.certification_type,
                        has_duedate: course.has_duedate,
                        idle: course.idle,
                        skip: course.skip,
                        survey: course.survey,
                    },
                    options: {},
                };
                const { data: createData } = await this.$Request.POST('course/', createPayload, this.configs.key);

                // เพิ่ม child course เข้าไปใน master course (ใช้ master ของ course ต้นทาง)
                const childPayload = {
                    action: "add",
                    element: createData._id,
                    type: "string",
                };
                const { data: finalRes } = await this.$Request.POST(`mcourse/${course.master}/child`, childPayload, this.configs.key);

                console.log("finalRes", finalRes);

                // Do something with the response data
                console.log(createData);
                this.getData();

                this.$swal({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 1500,
                    icon: 'success',
                    title: 'แจ้งเตือน',
                    text: 'Cloning หลักสูตรเรียบร้อยแล้ว',
                });
            } catch (error) {
                console.log(error);
                
                // แสดงข้อผิดพลาด
                this.$swal({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'error',
                    title: 'ข้อผิดพลาด',
                    text: 'ไม่สามารถ Clone หลักสูตรได้',
                });
            }
        },
        updated() {
            feather.replace();
        },

        toggleMaster() {
            if (this.master) {

                let session = {
                    master: false,
                    MasterText: "Master Mode",
                };
                storageManager.update('session', session)

                this.MasterText = "Master Mode"
                location.reload()
            } else {

                let session = {
                    master: true,
                    MasterText: "Child Mode",
                };
                storageManager.update('session', session)

                this.MasterText = "Child Mode"
                location.reload()
            }
        },
        toggleStatus() {
            this.getData();
        },
        toggleType() {
            this.getData();
        },
        // ฟังก์ชันสำหรับ toggle การแสดงรายการที่สถานะเป็น false
        toggleShowInactiveItems() {
            this.showInactiveItems = !this.showInactiveItems;
            
            // บันทึกสถานะลง session storage
            const session = storageManager.get('session');
            session.showInactiveItems = this.showInactiveItems;
            storageManager.set('session', session);
            
            console.log(`🔄 Toggle show inactive items: ${this.showInactiveItems}`);
            this.getData();
        },
        // เพิ่มฟังก์ชัน toggle course status
        async toggleCourseStatus(courseId, currentStatus) {
            if (!this.login) return;
            
            try {
                const newStatus = !currentStatus;
                console.log(`Toggle course ${courseId} status from ${currentStatus} to ${newStatus}`);
                
                const updatePayload = {
                    data: {
                        status: newStatus
                    },
                    options: {}
                };
                
                const { data: updateResult } = await this.$Request.PUT(
                    `${this.endpoint}/${courseId}`,
                    updatePayload,
                    this.configs.key
                );
                
                console.log("Toggle status result:", updateResult);
                
                // อัปเดตสถานะใน local array
                const courseIndex = this.listItems.findIndex(course => course._id === courseId);
                if (courseIndex !== -1) {
                    this.listItems[courseIndex].status = newStatus;
                }
                
                // แสดง notification
                this.$swal({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 1500,
                    icon: 'success',
                    title: 'สำเร็จ',
                    text: `${newStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}หลักสูตรเรียบร้อยแล้ว`,
                });
                
            } catch (error) {
                console.error("Toggle status error:", error);
                
                this.$swal({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'error',
                    title: 'ข้อผิดพลาด',
                    text: 'ไม่สามารถเปลี่ยนสถานะได้',
                });
            }
        },
        async checkUrl(url, item) {
            const hasSubstring = url.includes('https://content.fti.academy/');

            if (hasSubstring) {
                try {
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);

                    const fileNameWithExtension = url.substring(url.lastIndexOf('/') + 1);
                    const fileName = fileNameWithExtension.substring(0, fileNameWithExtension.lastIndexOf('.'));
                    const fileExtension = fileNameWithExtension.substring(fileNameWithExtension.lastIndexOf('.') + 1);

                    const uploadParams = {
                        Bucket: this.schoolSession.s3Bucket,
                        Key: "Thumbnail/" + fileName + "." + fileExtension,
                        Body: uint8Array,
                        ACL: "public-read",
                    };

                    const data = await this.S3.send(new PutObjectCommand(uploadParams));
                    console.log("File uploaded successfully:", data);
                    const outputLink = this.schoolSession.s3Endpoint + "Thumbnail/" + fileName + "." + fileExtension;
                    console.log("outputLink", outputLink);

                    const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/" + this.endpoint + "/" + item, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'client-token-key': this.configs.key },
                        body: JSON.stringify({
                            data: {
                                "cover": outputLink,
                            },
                            options: {}
                        })
                    });
                    await callApi.json();

                    if (callApi.status === 200) {
                        console.log("Update Status");
                    }

                } catch (error) {
                    console.error("Error uploading file:", error);
                }
            }
        },
        cleanCount(count) {
            if (Array.isArray(count)) {
                if (count.length > 0) {
                return count[0];
                } else {
                return 0; // Return 0 if the array is empty
                }
            }
            return count || 0; // Return the count directly or 0 if it's falsy
        },
        testAccess1() {
            this.$access('itemcode1');
            console.log("Can Access");
        },
        testAccess2() {
            this.$access('itemcode2');
            console.log("Can Access");
        },
        exportToCSV() {
            const headers = ['Index', 'Name', 'Enroll Count', 'Enroll Complete', 'Enroll Pass'];
            const rows = this.tableData.map((item, index) => [
                index + 1,
                item.name,
                this.cleanCount(item.enrollCount),
                this.cleanCount(item.enrollCompleteCount),
                this.cleanCount(item.enrollPostCount)
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.setAttribute('download', 'table-data.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        async executePipeline() {
            try {

                let andConditions = [{ parent: this.session.current._id }];
                const pipeline = [
                {
                    $match: {
                    $and: andConditions,
                    },
                },
                {
                    $sort: {
                    createdAt: -1,
                    status: -1,
                    type: 1,
                    }
                },
                {
                    $lookup: {
                    from: 'enroll',
                    let: { userID: { $toString: "$_id" } },
                    pipeline: [
                        {
                        $match: {
                            $expr: { $eq: [{ $toString: "$userID" }, "$$userID"] }
                        }
                        },
                        {
                        $facet: {
                            enrollCount: [
                            { $count: "count" }
                            ],
                            enrollCompleteCount: [
                            {
                                $match: {
                                $expr: { $eq: ["$analytics.status", "complete"] }
                                }
                            },
                            { $count: "count" }
                            ],
                            enrollPostCount: [
                            {
                                $match: {
                                $expr: { $eq: ["$analytics.post.result", true] }
                                }
                            },
                            { $count: "count" }
                            ]
                        }
                        }
                    ],
                    as: 'enrollStats',
                    },
                },
                {
                    $addFields: {
                    enrollCount: {
                        $ifNull: [{ $arrayElemAt: ['$enrollStats.enrollCount.count', 0] }, 0]
                    },
                    enrollCompleteCount: {
                        $ifNull: [{ $arrayElemAt: ['$enrollStats.enrollCompleteCount.count', 0] }, 0]
                    },
                    enrollPostCount: {
                        $ifNull: [{ $arrayElemAt: ['$enrollStats.enrollPostCount.count', 0] }, 0]
                    }
                    },
                }
                ];

                const { data: RestReturn, status } = await this.$Request.POST(
                `user/aggregate`, { pipeline },
                this.configs.key
                );
                // Handle your response here
                console.log(RestReturn, status);

                // Populate table data and remove brackets by extracting the values from arrays
                this.tableData = RestReturn.map(item => ({
                    _id: item._id,
                    name: item.name,
                    enrollCount: item.enrollCount,  // Already a number after $addFields
                    enrollCompleteCount: item.enrollCompleteCount,  // Already a number after $addFields
                    enrollPostCount: item.enrollPostCount  // Already a number after $addFields
                }));

            } catch (error) {
                console.error('Error running pipeline:', error);
            }
        },
        // =============== Lazy Loading Methods ===============
        loadMoreItems() {
            if (!this.lazy || this.isLoadingMore || !this.hasMoreItems) return;
            
            this.isLoadingMore = true;
            console.log(`📦 Auto-loading more items: ${this.currentDisplayCount} + ${this.loadMoreCount}`);
            
            // ลดเวลา delay ให้เร็วขึ้น
            setTimeout(() => {
                const newCount = Math.min(
                    this.currentDisplayCount + this.loadMoreCount,
                    this.listItems.length
                );
                this.currentDisplayCount = newCount;
                this.isLoadingMore = false;
                console.log(`✅ Auto-loaded more items. Showing: ${this.currentDisplayCount}/${this.listItems.length}`);
                
                // ถ้ายังมีเหลืออยู่ และใกล้จะหมด ให้โหลดต่อทันที
                if (this.hasMoreItems && (this.listItems.length - this.currentDisplayCount) <= this.loadMoreCount) {
                    console.log(`🚀 Near end, loading remaining items...`);
                    setTimeout(() => {
                        this.loadMoreItems();
                    }, 100);
                }
            }, 150); // ลด delay จาก 300ms เป็น 150ms
        },
        
        setupScrollDetection() {
            if (!this.lazy) return;
            
            this.$nextTick(() => {
                // ลองหา scroll container หลายรูปแบบ
                const possibleContainers = [
                    this.$refs.scrollContainer?.querySelector('.overflow-y-auto'),
                    this.$refs.scrollContainer,
                    document.querySelector('.overflow-y-auto'),
                    document.querySelector('[data-content]'),
                    document.querySelector('.divide-y'),
                    document.body,
                    window
                ];
                
                let scrollContainer = null;
                for (const container of possibleContainers) {
                    if (container && container !== document.body) {
                        scrollContainer = container;
                        break;
                    }
                }
                
                if (!scrollContainer) {
                    console.warn('Scroll container not found, using window');
                    scrollContainer = window;
                }
                
                console.log(`📋 Using scroll container:`, scrollContainer === window ? 'window' : scrollContainer);
                
                const handleScroll = () => {
                    if (!this.hasMoreItems || this.isLoadingMore) return;
                    
                    let scrollPercent;
                    
                    if (scrollContainer === window) {
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        const scrollHeight = document.documentElement.scrollHeight;
                        const clientHeight = window.innerHeight;
                        scrollPercent = (scrollTop + clientHeight) / scrollHeight;
                    } else {
                        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
                        scrollPercent = (scrollTop + clientHeight) / scrollHeight;
                    }
                    
                    // โหลดเพิ่มเมื่อ scroll ถึง 60% (เร็วมากขึ้น)
                    if (scrollPercent > 0.6) {
                        console.log(`📊 Scroll reached ${(scrollPercent * 100).toFixed(1)}%, auto-loading more items...`);
                        this.loadMoreItems();
                    }
                };
                
                // ติดตั้ง scroll listeners หลายตัว
                const containers = [scrollContainer];
                if (scrollContainer !== window) {
                    containers.push(window);
                    containers.push(document.body);
                }
                
                containers.forEach(container => {
                    container.addEventListener('scroll', handleScroll, { passive: true });
                    container.addEventListener('wheel', handleScroll, { passive: true });
                });
                
                // Fallback timer สำหรับ auto-load
                const autoLoadTimer = setInterval(() => {
                    if (this.hasMoreItems && !this.isLoadingMore) {
                        console.log(`⏰ Fallback timer triggered auto-load`);
                        this.loadMoreItems();
                    } else if (!this.hasMoreItems) {
                        clearInterval(autoLoadTimer);
                        console.log(`✅ All items loaded, clearing fallback timer`);
                    }
                }, 2000); // ทุก 2 วินาที
                
                // เก็บ reference เพื่อ cleanup
                this.scrollCleanup = () => {
                    containers.forEach(container => {
                        container.removeEventListener('scroll', handleScroll);
                        container.removeEventListener('wheel', handleScroll);
                    });
                    clearInterval(autoLoadTimer);
                };
                
                console.log(`✅ Scroll detection setup complete with 60% trigger + fallback timer`);
                
                // Auto-trigger first load
                setTimeout(() => {
                    if (this.hasMoreItems && !this.isLoadingMore) {
                        console.log(`🚀 Initial auto-load trigger`);
                        this.loadMoreItems();
                    }
                }, 1000);
            });
        },
        
        resetDisplayCount() {
            this.currentDisplayCount = this.initialDisplayCount;
            this.isLoadingMore = false;
            
            // 🎯 Auto-load all if data is not too much
            if (this.listItems.length <= 100) {
                console.log(`📊 Small dataset (${this.listItems.length} items), showing all immediately`);
                this.currentDisplayCount = this.listItems.length;
            } else {
                console.log(`📊 Large dataset (${this.listItems.length} items), using progressive loading`);
                // เริ่มต้นด้วย timeout สำหรับ auto-load ครั้งแรก
                setTimeout(() => {
                    if (this.hasMoreItems && !this.isLoadingMore) {
                        console.log(`🚀 Auto-triggering first load after reset`);
                        this.loadMoreItems();
                    }
                }, 500);
            }
        },
        
        toggleLazyMode() {
            this.lazy = !this.lazy;
            console.log(`🔄 Lazy rendering: ${this.lazy ? 'Enabled' : 'Disabled'}`);
            
            if (this.lazy) {
                this.resetDisplayCount();
                console.log(`📊 Adjusted initialDisplayCount to: ${this.initialDisplayCount} for limit: ${this.limitItem}`);
                
                // Setup scroll detection สำหรับ lazy mode
                this.$nextTick(() => {
                    this.setupScrollDetection();
                });
            } else {
                if (this.scrollCleanup) {
                    this.scrollCleanup();
                }
            }
        },
    },
    async mounted() {
        try {
            if (this.master) {
                this.endpoint = "mcourse";
            } else {
                this.endpoint = "course";
            }
            const urlParams = new URLSearchParams(window.location.search);
            const page = urlParams.get('page');
            if (page && /^\d+$/.test(page)) {
                this.currentPage = parseInt(page);
            } else {
                const session = storageManager.get('session');
                if (session && session.currentPage) {
                    this.currentPage = session.currentPage;
                    const updatedUrlParams = new URLSearchParams(window.location.search);
                    updatedUrlParams.set('page', session.currentPage);
                    const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
                    window.history.replaceState({}, '', updatedUrl);
                }
            }
            const session = storageManager.get('session');
            if (session && session.searchQuery) {
                this.searchQuery = session.searchQuery;
            }
            
            // โหลดสถานะการแสดงรายการที่ปิดใช้งาน
            if (session && session.showInactiveItems !== undefined) {
                this.showInactiveItems = session.showInactiveItems;
            }
            
            const storedLimitItem = session.limitItem;
            if (storedLimitItem) {
                this.limitItem = storedLimitItem;
            }
            await this.getCategoryData();
            await this.getData();
            
            // Setup lazy loading scroll detection
            if (this.lazy) {
                this.setupScrollDetection();
            }
        } catch (error) {
            console.log(Error);
        }
    },
    beforeUnmount() {
        // Cleanup scroll listener
        if (this.scrollCleanup) {
            this.scrollCleanup();
        }
    },
    setup() {
        //console.log("Setup");
    },
    watch: {
        searchQuery() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.getData();
                const session = storageManager.get('session');
                session.searchQuery = this.searchQuery;
                storageManager.set('session', session);

                this.currentPage = 1;
                const updatedUrlParams = new URLSearchParams(window.location.search);
                updatedUrlParams.set('page', session.currentPage);
                const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
                window.history.replaceState({}, '', updatedUrl);
            }, 500);
        }
    },
    computed: {
        mainCategories() {
            return this.categoryFullData.filter(cat => cat.type === 'main');
        },
        isAllCategoryChecked() {
            return (
            this.categoryFullData.length > 0 &&
            this.categoryFilter.length === this.categoryFullData.length
            );
        },
        filteredListItems() {
            if (this.selectedStatus === "All") {
                return this.listItems;
            } else {
                return this.listItems.filter(item => item.status === this.selectedStatus);
            }
        },
        
        // Progressive/Lazy rendering computed
        visibleItems() {
            if (!this.lazy) {
                return this.listItems; // แสดงทั้งหมดถ้าไม่ใช้ lazy
            }
            return this.listItems.slice(0, this.currentDisplayCount);
        },
        
        hasMoreItems() {
            return this.lazy && this.currentDisplayCount < this.listItems.length;
        },
        
        // คำนวณจำนวนรายการที่ปิดใช้งาน
        inactiveItemsCount() {
            return this.listItems.filter(item => item.status === false).length;
        },
        
        // ฟอร์แมตวันที่
        formatDate() {
            return (date) => {
                if (!date) return 'N/A';
                return new Date(date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            };
        },
        
        // คำนวณ progress percentage
        calculateProgress() {
            return (enrolled, limit) => {
                if (!limit || limit === 0) return 0;
                return Math.min((enrolled / limit) * 100, 100);
            };
        }
    }
};
</script>

<template>
    <custom-confirmation v-if="showConfirmation" :type="confirmType" :message="confirmMessage" :header="confirmHeader" @confirm="handleConfirmation" @cancel="handleConfirmCancel"></custom-confirmation>
    <div v-if="!loading_sources" class="text-center"><Loader/></div>
    <div v-if="loading_sources">
        <!-- <Subhead :navigation="
        [
        {
            name: translate('lesson-new'),
            link: '/lesson/add',
            style: 'plus',
            class: 'default-btn',
            //visible: this.master,
            type: 'button',
        },{
            name: 'Player',
            link: '/lesson/player-customize',
            style: 'play',
            class: 'default-btn',
            //visible: this.master,
            type: 'button',
        },
        {
            name: 'Course Detail',
            link: '/lesson/detail-customize',
            style: 'paint-roller',
            class: 'default-btn',
            //visible: this.master,
            type: 'button',
        },
        /*
        {
            name: this.master ? 'Child' : 'Master',
            function: 'toggleMaster',
            style: 'pencil',
            class: this.master ? 'success-btn' : 'danger-btn',
            type: 'button',
        }
        */
        ]" @toggleMaster="toggleMaster" @toggleType="toggleType" @toggleStatus="toggleStatus" /> -->
        
        <div v-if="!hide">
            <button @click="executePipeline">Run Pipeline</button>
            <button @click="exportToCSV">Export to CSV</button>

            <table v-if="tableData.length">
                <thead>
                <tr>
                    <th>Index</th>
                    <th>Name</th>
                    <th>Enroll </th>
                    <th>Enroll Complete</th>
                    <th>Enroll Pass</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in tableData" :key="item._id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ cleanCount(item.enrollCount) }}</td>
                    <td>{{ cleanCount(item.enrollCompleteCount) }}</td>
                    <td>{{ cleanCount(item.enrollPostCount) }}</td>
                </tr>
                </tbody>
            </table>

            <div v-access="'itemcode1'" v-tooltip="'Text to Show'">
            This item is visible if itemcode1 has permission.
            </div>
            <div v-access="'itemcode2'">
            This item is hidden if itemcode2 has permission set to false.
            </div>

            <button @click="testAccess1">Test Access 1</button>
            <button @click="testAccess2">Test Access 2</button>
        </div>

        <div class="mb-4">


            <div class="mt-6" v-show="showCategoryPanel">
                <label class="block mb-2 font-bold">{{ translate('lesson-category') }} :</label>
                <!-- Toggle Button -->
                <div class="mb-3">
                    <button
                        @click="toggleAllCategories"
                        class="px-3 py-1 bg-indigo-600 text-white text-sm font-semibold rounded shadow hover:bg-indigo-700"
                    >
                        {{ isAllCategoryChecked ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด' }}
                    </button>

                    <button
                        @click="showCategoryPanel = !showCategoryPanel"
                        class="ml-1 px-3 py-1 mb-2 bg-gray-700 text-white text-sm font-semibold rounded shadow hover:bg-gray-800"
                    >
                        {{ showCategoryPanel ? 'ซ่อนตัวกรองหมวดหมู่' : 'แสดงตัวกรองหมวดหมู่' }}
                    </button>

                    <button
                        @click="toggleShowInactiveItems"
                        class="ml-1 px-3 py-1 mb-2 text-sm font-semibold rounded shadow"
                        :class="showInactiveItems ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                    >
                        <i class="fas fa-eye-slash mr-1"></i>
                        {{ showInactiveItems ? 'ซ่อนรายการที่ปิดใช้งาน' : 'แสดงรายการที่ปิดใช้งาน' }}
                    </button>

                    <!-- แสดงสถานะปัจจุบัน -->
                    <div v-if="showInactiveItems" class="ml-2 inline-flex items-center px-3 py-1 mb-2 bg-orange-100 border border-orange-200 text-orange-800 text-sm rounded-full">
                        <i class="fas fa-info-circle mr-1"></i>
                        กำลังแสดงรายการทั้งหมด ({{ inactiveItemsCount }} รายการที่ปิดใช้งาน)
                    </div>
                    
                </div>
          
                <!-- Category Tree -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                    <!-- ✅ Special Categories (ไม่มีหมวดหมู่) แสดงเป็นอันแรก -->
                    <div v-for="special in categoryFullData.filter(cat => cat.type === 'special')" :key="special._id" class="bg-amber-50 p-3 rounded border border-amber-200 shadow-sm">
                        <div class="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                :id="'special-' + special.code"
                                :value="special.code"
                                :checked="categoryFilter.includes(special.code)"
                                @change="toggleCategory(special.code)"
                                class="form-checkbox h-4 w-4 text-amber-600"
                            />
                            <label :for="'special-' + special.code" class="text-sm font-semibold text-amber-800">
                                <span class="text-xs bg-amber-500 text-white px-1 py-0 rounded-sm">{{ special.courseUsedCount }}</span> {{ special.name }}
                            </label>
                        </div>
                    </div>
                    
                    <!-- Main Categories -->
                    <div v-for="main in mainCategories" :key="main._id" class="bg-white p-3 rounded border shadow-sm">
                        <div class="flex items-center space-x-2 mb-2">
                            <input
                                type="checkbox"
                                :id="'main-' + main.code"
                                :value="main.code"
                                :checked="categoryFilter.includes(main.code)"
                                @change="toggleCategory(main.code)"
                                class="form-checkbox h-4 w-4 text-indigo-600"
                            />
                            <label :for="'main-' + main.code" class="text-sm font-semibold text-gray-800">
                                <span class="text-xs bg-gray-500 text-white px-1 py-0 rounded-sm">{{ main.courseUsedCount }}</span> {{ main.name }} 
                            </label>
                        </div>
                        <div class="pl-5 space-y-1">
                            <div v-for="sub in getSubCategories(main._id)" :key="sub._id" class="flex items-center space-x-2">
                                <input
                                type="checkbox"
                                :id="'sub-' + sub.code"
                                :value="sub.code"
                                :checked="categoryFilter.includes(sub.code)"
                                @change="toggleCategory(sub.code)"
                                class="form-checkbox h-4 w-4 text-indigo-600"
                                />
                                <label :for="'sub-' + sub.code" class="text-sm text-gray-600">
                                    <span class="text-xs bg-gray-400 text-white px-1 py-0 rounded-sm">{{ sub.courseUsedCount }}</span> {{ sub.name }} 
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
          </div>
          
          
          
          

        <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5">
            <div class="mt-2">
                <div class="mx-auto px-6 sm:px-6 lg:px-6">
                    <div class="mt-2 flex flex-col">
                        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div class="inline-block min-w-full py-2 align-middle md:px-3 lg:px-3">
    
                                <div class="mb-4">
                                    <div class="flex items-start justify-start gap-4 flex-wrap">
                                        <!-- Status Filter -->
                                        <div class="min-w-[250px]">
                                            <label class="block mb-2 font-bold">{{ translate('lesson-status') }}:</label>
                                            <div class="grid grid-cols-2 gap-2">
                                                <div v-for="option in statusOptions" :key="option.value" class="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        :id="option.value"
                                                        :value="option.value"
                                                        v-model="statusFilter"
                                                        @change="toggleStatus(option.value)"
                                                        class="mr-2"
                                                    />
                                                    <label :for="option.value">{{ option.name }}</label>
                                                </div>
                                            </div>
                                        </div>
                                
                                        <!-- Category Toggle Button -->
                                        <div class="mt-6 relative">
                                            <button
                                                @click="showCategoryPanel = !showCategoryPanel"
                                                class="px-4 py-2 bg-gray-700 text-white text-sm font-semibold rounded shadow hover:bg-gray-800"
                                            >
                                                {{ showCategoryPanel ? 'ซ่อนตัวกรองหมวดหมู่' : 'แสดงตัวกรองหมวดหมู่' }}
                                            </button>
                                            
                                            <button
                                                @click="toggleShowInactiveItems"
                                                class="ml-2 px-4 py-2 text-sm font-semibold rounded shadow"
                                                :class="showInactiveItems ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                                            >
                                                <i class="fas fa-eye-slash mr-1"></i>
                                                {{ showInactiveItems ? 'ซ่อนรายการที่ปิดใช้งาน' : 'แสดงรายการที่ปิดใช้งาน' }}
                                                <span v-if="inactiveItemsCount > 0" class="ml-1">({{ inactiveItemsCount }})</span>
                                            </button>
                                        </div>
                                        
                                        <!-- Lazy Loading Toggle - ซ่อนปุ่ม Progressive Loading -->
                                        <div class="mt-6" v-if="false">
                                            <button
                                                @click="toggleLazyMode"
                                                class="px-4 py-2 text-white text-sm font-semibold rounded shadow transition-colors"
                                                :class="[lazy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700']"
                                            >
                                                <i class="fas fa-rocket mr-2"></i>
                                                {{ lazy ? 'Progressive Loading (เปิด)' : 'แสดงทั้งหมด (ปิด)' }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                

    
                                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                    <div class="min-w-full divide-y divide-gray-300">
                                        <div class="bg-gray-50">
                                            <div class="hidden md:block p-0 m-0 bg-gray-50 border-b border-gray-200 w-full">
                                                <div colspan="6" class="p-3 m-0">
                                                    <div class="grid grid-cols-4">
                                                        <div class="col-span-2 flex items-center">
                                                            <div class="relative">
                                                                <input id="search" type="text" class="pl-8 pr-3 py-2 h-9 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-all duration-200" :placeholder="translate('lesson-search')" v-model="searchQuery" />
                                                                <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                                                    <i class="fas fa-search text-gray-400 text-sm"></i>
                                                                </div>
                                                            </div>
                                                            <div v-if="searchQuery.length > 0" class="ml-3">
                                                                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                                                    <i class="fas fa-search mr-1.5"></i>
                                                                    {{ translate('lesson-result')}} <span class="font-semibold ml-1">{{ totalItems }}</span> {{ translate('paging-item')}}
                                                                </span>
                                                            </div>
                                                            <button v-if="searchQuery.length > 0" @click="clearSearchQuery" type="button" class="ml-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition-colors text-xs focus:outline-none focus:ring-2 focus:ring-red-500">
                                                                <i class="fas fa-times mr-1"></i>
                                                                {{translate('lesson-clear')}}
                                                            </button>
                                                        </div>
                                                        <!-- <div class="col-span-1 text-center pt-3 text-sm">
                                              <span :class="[master ? 'bg-red-500' : 'bg-green-500', 'p-1 pl-3 pr-3 text-white rounded-md']">
                                                <font-awesome-icon :icon="[master ? 'fas' : 'fas', master ? 'lock' : 'edit']" class="text-white mt-[3px] mr-1 text-sm" />
                                                {{ master ? 'หลักสูตรต้นฉบับ (Master)' : 'หลักสูตรที่เผยแพร่' }}
                                              </span>
                                            </div> -->
                                                        <div class="col-span-2 flex items-center justify-end space-x-3">
                                                            <!-- Items per page selector -->
                                                            <div class="flex items-center space-x-2">
                                                                <span class="text-sm text-gray-600 font-medium">แสดง:</span>
                                                                <select v-model="limitItem" @change="handleLimitChange" class="h-9 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 cursor-pointer hover:border-gray-400 min-w-[4.5rem] w-auto">
                                                                    <option v-for="option in limitOptions" :key="option" :value="option">{{ option }}</option>
                                                                </select>
                                                            </div>
                                                            
                                                            <!-- Compact Pagination -->
                                                            <div class="relative">
                                                                <!-- Hide custom loading indicator since Paginated component has its own -->
                                                                <Pagination 
                                                                    :current-page="currentPage" 
                                                                    :total-items="totalItems" 
                                                                    :total-pages="totalPages" 
                                                                    :limit-items="limitItem" 
                                                                    :data-loading="loading" 
                                                                    :display-mode="'nav'" 
                                                                    :size="'small'"
                                                                    :variant="'compact'"
                                                                    :show-labels="false"
                                                                    :show-first-last="false"
                                                                    :show-page-size-selector="false"
                                                                    :show-jump-to-page="false"
                                                                    :visible-range="2"
                                                                    @page-changed="handlePageChanged" 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
    
                                            <div class="block md:hidden p-0 m-0 border-b border-gray-200">
                                                <div colspan="3" class="p-3 m-0 text-center">
                                                    <div class="mb-3 mx-auto max-w-full">
                                                        <div class="relative">
                                                            <input id="search" type="text" class="w-full pl-10 pr-4 py-3 h-11 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-all duration-200" :placeholder="translate('lesson-search')" v-model="searchQuery" />
                                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <i class="fas fa-search text-gray-400 text-base"></i>
                                                            </div>
                                                        </div>
                                                        
                                                        <div v-if="searchQuery.length > 0" class="mt-3 text-center">
                                                            <span class="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                                                                <i class="fas fa-search mr-2"></i>
                                                                {{ translate('lesson-result')}} <span class="font-semibold mx-1">{{ totalItems }}</span> {{ translate('paging-item')}}
                                                            </span>
                                                        </div>
                                                        <div v-else-if="listItems.length <= 0" class="mt-3 text-center">
                                                            <span class="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gray-50 text-gray-600 border border-gray-200">
                                                                <i class="fas fa-exclamation-circle mr-2"></i>
                                                                {{translate('lesson-notfound')}}
                                                            </span>
                                                        </div>
                                                        
                                                        <div v-if="searchQuery.length > 0" class="mt-3 text-center">
                                                            <button @click="clearSearchQuery" type="button" class="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                                                                <i class="fas fa-times mr-2"></i>
                                                                {{translate('lesson-clear')}}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- Mobile Pagination -->
                                                    <div class="relative flex justify-center mt-3">
                                                        <!-- Hide custom loading indicator since Paginated component has its own -->
                                                        <Pagination 
                                                            :current-page="currentPage" 
                                                            :total-items="totalItems" 
                                                            :total-pages="totalPages" 
                                                            :limit-items="limitItem" 
                                                            :data-loading="loading" 
                                                            :display-mode="'nav'" 
                                                            :size="'small'"
                                                            :variant="'compact'"
                                                            :show-labels="false"
                                                            :show-first-last="false"
                                                            :show-page-size-selector="false"
                                                            :show-jump-to-page="false"
                                                            :visible-range="2"
                                                            @page-changed="handlePageChanged" 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
    
                                            <div class="grid grid-cols-2 md:grid-cols-6 p-2 bg-gray-200">
                                                <div class="col-span-1 md:col-span-3 text-center text-sm font-semibold text-gray-900 flex items-center justify-center">
                                                    <i class="fas fa-graduation-cap mr-2"></i>
                                                    {{translate('lesson-name')}}
                                                </div>
                                                <div class="text-center text-sm font-semibold text-gray-900 hidden md:flex items-center justify-center">
                                                    <i class="fas fa-tag mr-2"></i>
                                                    {{translate('lesson-price')}}
                                                </div>
                                                <div class="text-center text-sm font-semibold text-gray-900 hidden md:flex items-center justify-center">
                                                    <i class="fas fa-chart-line mr-2"></i>
                                                    สถานะ & สถิติ
                                                </div>
                                                <div class="text-center text-sm font-semibold text-gray-900 flex items-center justify-center">
                                                    <i class="fas fa-tools mr-2"></i>
                                                    {{translate('lesson-tool')}}
                                                </div>
                                            </div>
                                        </div>
    
                                        <div class="divide-y divide-gray-300 bg-white relative" :data-content="translate('database-connect')" :class="[(activeBlock?'isblock' : 'isunblock')]">
    
                                            <div v-if="listItems.length === 0" class="p-3 text-center text-gray-500">
                                                <div>
                                                    <font-awesome-icon :icon="['fas','exclamation-circle']" class="" /> ยังไม่มีข้อมูล</div>
                                            </div>                                            <div v-for="(course, index) in visibleItems" :key="course._id" :class="[
                                                index % 2 === 0 ? 'bg-indigo-50' : 'bg-white',
                                                course.status === false ? 'opacity-40' : ''
                                            ]">
                                                <div class="grid grid-cols-6 gap-1 p-3 hover:bg-gray-50 transition-colors duration-200">
                                                    <div class="col-span-6 md:col-span-3">
                                                        <router-link :to="'/lesson/detail/'+course._id" class="text-gray-700 hover:text-indigo-600 block">
                                                            <div class="flex items-start space-x-3">
                                                                <!-- Course Number -->
                                                                <div class="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                                    <span class="text-xs font-bold text-indigo-600">{{(currentPage - 1) * limitItem + index + 1}}</span>
                                                                </div>
                                                                
                                                                <!-- Course Image -->
                                                                <div class="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 shadow-sm">
                                                                    <!-- Try LazyImage with S3 URL handling -->
                                                                    <LazyImage
                                                                        v-if="course.cover && course.cover.trim() !== ''"
                                                                        :src="getS3ImageUrl(course.cover)"
                                                                        :alt="`Course Image: ${course.name}`"
                                                                        container-class="w-full h-full"
                                                                        image-class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                                                        skeleton-class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"
                                                                        error-class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"
                                                                        icon-size="text-lg"
                                                                        root-margin="50px"
                                                                        :threshold="0.1"
                                                                        :eager="false"
                                                                        @loaded="onImageLoaded"
                                                                        @error="onImageError"
                                                                    >
                                                                        <template #loading>
                                                                            <div class="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-blue-200 animate-pulse">
                                                                                <i class="fas fa-spinner fa-spin text-blue-500 text-lg"></i>
                                                                            </div>
                                                                        </template>
                                                                        <template #error>
                                                                            <div class="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-red-100">
                                                                                <i class="fas fa-exclamation-triangle text-red-400 text-lg"></i>
                                                                            </div>
                                                                        </template>
                                                                    </LazyImage>
                                                                    
                                                                    <!-- No image fallback -->
                                                                    <div v-else class="w-full h-full flex justify-center items-center bg-gradient-to-br from-indigo-100 to-indigo-200">
                                                                        <i class="fas fa-graduation-cap text-indigo-500 text-lg"></i>
                                                                    </div>
                                                                    
                                                                    <!-- Course Type Badge -->
                                                                    <div class="absolute top-1 right-1">
                                                                        <span :class="{'bg-green-500 text-white': course.lesson_type === 'master', 'bg-gray-500 text-white': course.lesson_type === 'child'}" 
                                                                              class="px-1.5 py-0.5 rounded text-xs font-semibold shadow-sm">
                                                                            {{ course.lesson_type === 'child' ? 'CH' : 'MS' }}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <!-- Status Indicator -->
                                                                    <div class="absolute bottom-1 left-1">
                                                                        <div :class="course.status ? 'bg-green-400' : 'bg-red-400'" 
                                                                             class="w-3 h-3 rounded-full border-2 border-white shadow-sm"></div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <!-- Course Details -->
                                                                <div class="flex-1 min-w-0">
                                                                    <!-- Course Title -->
                                                                    <h3 class="font-semibold text-gray-900 text-sm leading-5 truncate mb-1 hover:text-indigo-600 transition-colors">
                                                                        {{ course.name }}
                                                                    </h3>
                                                                    
                                                                    <!-- Course Slug -->
                                                                    <p class="text-xs text-gray-500 truncate mb-2">{{ course.slug }}</p>
                                                                    
                                                                    <!-- Course Stats Row -->
                                                                    <div class="flex items-center space-x-3 text-xs">
                                                                        <!-- Enrolled Users -->
                                                                        <div class="flex items-center space-x-1 text-blue-600">
                                                                            <i class="fas fa-users w-3"></i>
                                                                            <span class="font-medium">{{course.enrollUserCount || 0}} คน</span>
                                                                        </div>
                                                                        
                                                                        <!-- Sub Items / Lessons -->
                                                                        <div class="flex items-center space-x-1 text-gray-500">
                                                                            <i class="fas fa-list w-3"></i>
                                                                            <span>{{(course.child && course.child.length) || course.subItemCount || 0}} รายการ</span>
                                                                        </div>
                                                                        
                                                                        <!-- Created Date -->
                                                                        <div class="flex items-center space-x-1 text-gray-400">
                                                                            <i class="fas fa-calendar w-3"></i>
                                                                            <span>{{ course.createdAt ? new Date(course.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' }) : 'N/A' }}</span>
                                                                        </div>
                                                                        
                                                                        <!-- Duration if available -->
                                                                        <div v-if="course.duration || course.hours" class="flex items-center space-x-1 text-purple-500">
                                                                            <i class="fas fa-clock w-3"></i>
                                                                            <span>{{ course.duration || course.hours || 0 }} ชม.</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </router-link>
                                                    </div>
                                                    
                                                    <!-- Price Column -->
                                                    <div class="hidden md:flex col-span-1 items-center justify-center">
                                                        <div class="text-center">
                                                            <Price :regular="course.regular_price" :sale="course.sale_price" />
                                                            <div v-if="course.sale_price && course.regular_price !== course.sale_price" 
                                                                 class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                                <i class="fas fa-tag mr-1"></i>
                                                                ลดราคา
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- Status Column -->
                                                    <div class="hidden md:flex col-span-1 items-start justify-center pt-2">
                                                        <div class="text-center space-y-2">
                                                            <StatusLabel :check="course.status" />
                                                            
                                                            <!-- Sync Status -->
                                                            <div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                                                 :class="{'bg-orange-100 text-orange-800': course.sync, 'bg-gray-100 text-gray-600': !course.sync}">
                                                                <div :class="{'bg-orange-400': course.sync, 'bg-gray-400': !course.sync}" 
                                                                     class="w-2 h-2 rounded-full mr-1"></div>
                                                                {{ course.sync || 'ไม่ซิงค์' }}
                                                            </div>
                                                            
                                                            <!-- Course Type Badge -->
                                                            <div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                <i class="fas fa-graduation-cap mr-1"></i>
                                                                {{ course.type }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- Tools Column -->
                                                    <div class="col-span-6 md:col-span-1">
                                                        <!-- เครื่องมือ Mobile: 3 columns, Desktop: 2 columns -->
                                                        <div class="grid grid-cols-3 md:grid-cols-2 gap-x-1 gap-y-1 p-1">
                                                            
                                                            <!-- Row 1, Column 1: Clone -->
                                                            <div class="flex items-center">
                                                                <button @click="cloneData(course._id)" 
                                                                        type="button" 
                                                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-gray-600 bg-gray-500 text-white shadow-sm hover:bg-gray-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-all duration-200">
                                                                    <font-awesome-icon :icon="['fas','copy']" class="w-3 h-3" />
                                                                </button>
                                                                <div class="ml-1 flex-1">
                                                                    <span class="text-xs font-medium text-gray-700">สำเนา ({{ course.child !== undefined ? course.child.length : 0 }})</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <!-- Row 1, Column 2: Toggle Status -->
                                                            <div class="flex items-center">
                                                                <button @click="toggleCourseStatus(course._id, course.status)" 
                                                                        type="button" 
                                                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-gray-300 bg-white shadow-sm hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-all duration-200"
                                                                        :class="course.status ? 'text-green-600 border-green-300' : 'text-gray-400'">
                                                                    <font-awesome-icon :icon="['fas', course.status ? 'toggle-on' : 'toggle-off']" class="w-3 h-3" />
                                                                </button>
                                                                <div class="ml-1 flex-1">
                                                                    <span class="text-xs font-medium text-gray-700">สถานะ: {{ course.status ? 'เปิด' : 'ปิด' }}</span>
                                                                                                                               </div>
                                                            </div>
                                                            
                                                            <!-- Row 1, Column 3 (Mobile) / Row 2, Column 1 (Desktop): Edit -->
                                                            <div class="flex items-center">
                                                                <button @click="$router.push('/lesson/edit/' + course._id + '/child/' + course._id)" 
                                                                        type="button" 
                                                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200">
                                                                    <font-awesome-icon :icon="['fas','square-pen']" class="w-3 h-3 text-gray-600" />
                                                                </button>
                                                                <div class="ml-1 flex-1">
                                                                    <span class="text-xs font-medium text-gray-700">แก้ไขเนื้อหา</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <!-- Row 2, Column 1 (Mobile) / Row 2, Column 2 (Desktop): Users -->
                                                            <div class="flex items-center">
                                                                <button @click="$router.push('/lesson/detail/' + course._id + '/enroll')" 
                                                                        type="button" 
                                                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200">
                                                                    <font-awesome-icon :icon="['fas','users']" class="w-3 h-3 text-blue-600" />
                                                                </button>
                                                                <div class="ml-1 flex-1">
                                                                    <span class="text-xs font-medium text-gray-700">ผู้ใช้ {{course.enrollUserCount}} คน</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <!-- Row 2, Column 2 (Mobile) / Row 3, Column 1 (Desktop): Delete -->
                                                            <div class="flex items-center">
                                                                <button @click="removeItem(course._id, course.master, course.name)" 
                                                                        type="button" 
                                                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-red-300 bg-white text-gray-700 shadow-sm hover:bg-red-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200">
                                                                    <font-awesome-icon :icon="['fas','trash-can']" class="w-3 h-3 text-red-600" />
                                                                </button>
                                                                <div class="ml-1 flex-1">
                                                                    <span class="text-xs font-medium text-gray-700">ลบข้อมูล</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <!-- Row 2, Column 3 (Mobile) / Row 3, Column 2 (Desktop): View Details -->
                                                            <div class="flex items-center">
                                                                <button @click="$router.push('/lesson/detail/' + course._id)" 
                                                                        type="button" 
                                                                        class="w-8 h-8 inline-flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200">
                                                                    <font-awesome-icon :icon="['fas','eye']" class="w-3 h-3 text-indigo-600" />
                                                                </button>
                                                                <div class="ml-1 flex-1">
                                                                    <span class="text-xs font-medium text-gray-700">รายละเอียด</span>
                                                                </div>
                                                            </div>
                                                            
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Category and Additional Info Row -->
                                                <div class="grid grid-cols-4 px-3 pb-3 pt-1 border-t border-gray-200 bg-gray-50/50">
                                                    <div class="col-span-3">
                                                        <!-- Categories -->
                                                        <div class="flex flex-wrap gap-1 mb-2">
                                                            <template v-if="Array.isArray(course.categoryData) && course.categoryData.length > 0">
                                                                <span v-for="(categoryItem, index) in course.categoryData" 
                                                                      :key="categoryItem._id"
                                                                      v-show="index < 3" 
                                                                      :class="['inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', categoryItem.name === 'ไม่มีหมวดหมู่' ? 'bg-gray-100 text-gray-800' : 'bg-indigo-100 text-indigo-800']">
                                                                    <i class="fas fa-tag mr-1"></i>
                                                                    {{ categoryItem.name }}
                                                                </span>
                                                                <span v-if="course.categoryData.length > 3" 
                                                                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                    +{{ course.categoryData.length - 3 }} เพิ่มเติม
                                                                </span>
                                                            </template>
                                                            <template v-else>
                                                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                    <i class="fas fa-tag mr-1"></i>
                                                                    ยังไม่มีหมวดหมู่
                                                                </span>
                                                            </template>
                                                        </div>
                                                        
                                                        <!-- Quick Stats -->
                                                        <div class="flex items-center space-x-4 text-xs text-gray-500">
                                                            <div v-if="course.duration || course.hours" class="flex items-center space-x-1">
                                                                <i class="fas fa-clock"></i>
                                                                <span>{{ course.duration || course.hours || 0 }} ชม.</span>
                                                            </div>
                                                            <div v-if="course.days" class="flex items-center space-x-1">
                                                                <i class="fas fa-calendar-days"></i>
                                                                <span>{{ course.days }} วัน</span>
                                                            </div>
                                                            <div v-if="course.level" class="flex items-center space-x-1">
                                                                <i class="fas fa-layer-group"></i>
                                                                <span>{{ course.level }}</span>
                                                            </div>
                                                            <div v-if="course.language" class="flex items-center space-x-1">
                                                                <i class="fas fa-language"></i>
                                                                <span>{{ course.language }}</span>
                                                            </div>
                                                            <div v-if="course.instructor" class="flex items-center space-x-1">
                                                                <i class="fas fa-chalkboard-teacher"></i>
                                                                <span>{{ course.instructor }}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- Quick Actions -->
                                                    <div class="flex justify-end items-center space-x-1">
                                                        <div class="text-right">
                                                            <div class="text-xs text-gray-500">อัปเดต</div>
                                                            <div class="text-xs font-medium text-gray-700">
                                                                {{ new Date(course.updatedAt || course.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' }) }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                      <!-- Lazy Loading Indicators -->
                      <template v-if="lazy">
                        <!-- Loading More Indicator -->
                        <div v-if="isLoadingMore" class="flex justify-center items-center py-6 border-b border-gray-200">
                          <div class="flex items-center gap-3 text-blue-600">
                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span class="text-sm font-medium">กำลังโหลดข้อมูลเพิ่ม...</span>
                          </div>
                        </div>
                        
                        <!-- All Items Loaded -->
                        <div v-else-if="!hasMoreItems && listItems.length > initialDisplayCount" class="flex justify-center items-center py-6 border-b border-gray-200">
                          <div class="flex items-center gap-2 text-green-600">
                            <i class="fas fa-check-circle"></i>
                            <span class="text-sm font-medium">แสดงครบทั้งหมด {{ listItems.length }} รายการแล้ว</span>
                          </div>
                        </div>
                        
                        <!-- Auto-scroll hint for remaining items -->
                        <div v-else-if="hasMoreItems" class="flex justify-center items-center py-4 border-b border-gray-200">
                          <div class="flex flex-col items-center gap-2">
                            <div class="flex items-center gap-2 text-gray-500 text-sm">
                              <i class="fas fa-mouse"></i>
                              <span>เลื่อนลงเพื่อดูเพิ่ม (เหลือ {{ listItems.length - currentDisplayCount }} รายการ)</span>
                            </div>
                            <!-- Emergency show all button -->
                            <button
                              @click="currentDisplayCount = listItems.length"
                              class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              title="กรณีที่ auto-scroll ไม่ทำงาน"
                            >
                              <i class="fas fa-eye mr-1"></i>
                              แสดงทั้งหมดเลย
                            </button>
                          </div>
                        </div>
                      </template>
                    </div>                                    <!-- Pagination Footer -->
                                    <div class="bg-gray-50 border-t border-gray-200">
                                        <div class="p-3">
                                            <!-- Compact Pagination Footer -->
                                            <div class="flex items-center justify-between py-3 border-t border-gray-100">
                                                <!-- Items per page on left -->
                                                <div class="flex items-center space-x-2">
                                                    <span class="text-sm text-gray-600 font-medium">แสดง:</span>
                                                    <select v-model="limitItem" @change="handleLimitChange" class="h-9 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 cursor-pointer hover:border-gray-400 min-w-[4.5rem] w-auto">
                                                        <option v-for="option in limitOptions" :key="option" :value="option">{{ option }}</option>
                                                    </select>
                                                    <span class="text-sm text-gray-500">รายการ</span>
                                                </div>
                                                
                                                <!-- Footer Mode Pagination -->
                                                <div class="w-full">
                                                    <Pagination 
                                                        :current-page="currentPage" 
                                                        :total-items="totalItems" 
                                                        :total-pages="totalPages" 
                                                        :limit-items="limitItem" 
                                                        :data-loading="loading" 
                                                        :display-mode="'footer'" 
                                                        :size="'small'"
                                                        :variant="'default'"
                                                        :show-labels="false"
                                                        :show-first-last="false"
                                                        :show-page-size-selector="false"
                                                        :show-jump-to-page="false"
                                                        :visible-range="2"
                                                        @page-changed="handlePageChanged" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
</template>

<style>
input:focus-visible {
    outline: none;
}

.opacity-bg-indigo-50 {
    background-color: rgba(125, 150, 178, 0.5);
}

/* Course List Optimizations */
.course-item {
    will-change: transform;
    backface-visibility: hidden;
    transform: translateZ(0);
}

.course-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease-out;
}

.course-image {
    object-fit: cover;
    transition: transform 0.2s ease-out;
}

.course-image:hover {
    transform: scale(1.05);
}

/* Status indicator pulse */
.status-active {
    animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
    }
    50% {
        box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
    }
}

/* Button hover effects */
.action-button {
    transition: all 0.2s ease-out;
    transform: translateZ(0);
    backface-visibility: hidden;
}

.action-button:hover {
    transform: translateY(-1px) scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.action-button:active {
    transform: translateY(0) scale(0.98);
}

/* Category badges */
.category-badge {
    transition: all 0.2s ease-out;
}

.category-badge:hover {
    transform: scale(1.05);
}

/* Loading skeleton for images */
.image-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

/* Smooth scrolling for lazy load */
.course-list-container {
    scroll-behavior: smooth;
}

/* Enhanced focus states for accessibility */
.action-button:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

/* Enhanced hover states for interactive elements */
.course-link:hover .course-title {
    color: #3b82f6;
    transition: color 0.2s ease-out;
}



/* Search input enhancements */
.search-input-enhanced {
    transition: all 0.2s ease-out;
}

.search-input-enhanced:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
}

/* Grid layout optimization */
.course-grid {
    contain: layout style paint;
}

/* Performance optimization for large lists */
.course-item {
    contain: layout style paint;
    isolation: isolate;
}

/* Mobile responsive optimizations */
@media (max-width: 768px) {
    .course-item {
        contain: none; /* Better for mobile */
    }
    
    .action-button:hover {
        transform: none; /* Disable hover effects on mobile */
    }
}
</style>
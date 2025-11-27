<script>
import Subhead from "@/interface/template/outline/Subhead.vue";
import storageManager from "@/plugins/storage";
import FileBrowser from "@/interface/modal/FileBrowser.vue";
import { S3 } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import ContentLeftSidebar from "./ContentLeftSidebar.vue";
import ContentRightSidebar from "./ContentRightSidebar.vue";
import ContentFormMain from "./ContentFormMain.vue";
import QRCode from 'qrcode';

// Alternative import for QRCode if needed
let QRCodeLib = QRCode;
if (!QRCodeLib && typeof window !== 'undefined') {
  // Try to access global QRCode if import fails
  QRCodeLib = window.QRCode;
}

export default {
  name: "Edit",
  props: {
    mode: {
      type: String,
      default: 'add',
      validator: value => ['add', 'edit'].includes(value)
    },
    type: {
      type: String,
      default: 'page',
      validator: value => ['page', 'post'].includes(value)
    },
    initialData: {
      type: Object,
      default: () => ({}),
    },
  },
  inject: ["apiServer", "apiRequest"],
  data() {
    const session = storageManager.get("configs");
    const schoolSession = session;
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
      S3: s3Client,
      schoolSession: schoolSession,
      dataItem: this.$route.params.id,
      configs: storageManager.get("configs"),
      session: storageManager.get("session"),
      parentData: "",
      postData: this.mode === 'edit' ? this.initialData : {
        title: '',
        slug: '',
        pageID: '',
        content: '',
        display: '',
        type: '',
        next: '',
        course: '',
        action: '',
        isComment: '',
        isCounter: '',
        isMenu: '',
        password: '',
        status: '',
        isTemplate: '',
        authen: '',
        parent: '',
        destination: '',
        feature_image: '',
        owner: '',
        builder: [],
        // Admin Page Settings
        useAdminPage: false, // ตัวเลือกหลัก: ใช้งาน Admin Page
        adminPassword: '', // รหัสผ่านสำหรับ Admin
        enableAnalytics: false, // เปิดใช้ Analytics Dashboard
        enableExport: false, // เปิดใช้การ Export
        seo: {
          title: '',
          description: '',
          keywords: [],
          image: '',
        },
        // เพิ่ม layout field
        layout: 'standard', // standard, full, block
        // Custom Fields
        customFields: [],
        // Custom Data for posts
        customData: {},
      },
      activeBlock: false,
      editing: undefined,
      FileBrowserOpen: false,
      SEOFileBrowserOpen: false,
      CustomImageBrowserOpen: false,
      destination: "form", // default value is 'form'
      defaultCollectionOptions: ["form", "message"], // dynamic options
      defaultFormActions: ["standard", "course"], // dynamic options
      defaultFormNext: ["standard", "course", "order"], // dynamic options
      parentList: [],
      searchTerm: "",
      showDropdown: false,
      isPasswordModalOpen: false,
      newKeyword: "",
      mceOptions: {
        image_title: true,
        automatic_uploads: true,
        file_picker_types: "image",
        file_picker_callback: (callback) => this.customFilePickerCallback(callback),
        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      },
      redirectLink: '',
      slugDebounceTimer: null, // เพิ่ม timer สำหรับ debounce
      // Sidebar data
      sidebarStats: {
        total: 0,
        published: 0,
        draft: 0,
        favorites: 0
      },
      recentActivities: [
        {
          id: 1,
          type: 'edit',
          title: 'แก้ไข "หน้าแรก"',
          time: '2 นาทีที่แล้ว',
          icon: 'fas fa-edit',
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          id: 2,
          type: 'create',
          title: 'สร้าง "เกี่ยวกับเรา"',
          time: '1 ชั่วโมงที่แล้ว',
          icon: 'fas fa-plus',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      ],
      systemStatus: {
        storage: {
          used: 2.4,
          total: 10,
          percentage: 24
        },
        connection: 'normal',
        lastSync: 'เมื่อไม่นานนี้'
      },
      quickFilters: {
        published: 24,
        draft: 8,
        favorites: 5,
        recent: 12
      },
      // Mobile state
      isMobileSidebarOpen: false,
      // Content Analytics
      contentAnalytics: {
        readingTime: 0,
        wordCount: 0,
        charCount: 0,
        seoScore: 0,
        readabilityScore: 0,
        socialPreview: {
          facebook: '',
          twitter: '',
          linkedin: ''
        }
      },
      // Content Organization
      contentTags: [],
      newTag: '',
      contentCategories: ['general', 'news', 'blog', 'product', 'service'],
      selectedCategory: 'general',
      contentStatus: 'draft',
      relatedContent: [],
      // Content Quality
      contentValidation: {
        hasTitle: false,
        hasSlug: false,
        hasContent: false,
        hasImage: false,
        hasSEO: false,
        score: 0
      },
      // Advanced Features
      contentSchedule: {
        isScheduled: false,
        publishDate: '',
        unpublishDate: ''
      },
      socialSharing: {
        facebook: true,
        twitter: true,
        linkedin: false,
        pinterest: false
      },
      analyticsData: {
        totalViews: 0,
        uniqueVisitors: 0,
        avgTimeOnPage: '0:00',
        bounceRate: '0%',
        sources: {
          google: 0,
          direct: 0,
          social: 0
        },
        devices: {
          desktop: 0,
          mobile: 0,
          tablet: 0
        },
        peakHours: 'กำลังวิเคราะห์...'
      },
      showDetailedAnalytics: false,
      exportDataType: 'analytics',
      exportFormats: {
        csv: false,
        excel: false
      },
      // QR Code data
      qrCode: {
        url: '',
        dataUrl: '',
        isGenerating: false,
        showModal: false
      }
    };
  },
  components: {
    Subhead,
    FileBrowser,
    ContentLeftSidebar,
    ContentRightSidebar,
    ContentFormMain
  },
  computed: {
    filteredParentList() {
      return this.parentList.filter((parent) =>
        parent.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },
    pageTitle() {
      if (this.mode === 'add') {
        return 'เพิ่มเนื้อหาใหม่';
      } else if (this.mode === 'edit') {
        if (this.postData.type === 'page') {
          return `${this.postData.title}`;
        } else if (this.postData.type === 'post') {
          return `${this.parentData?.title || ''} / ${this.postData.title}`;
        }
      }
      return this.postData.title;
    },
  },
  methods: {
    // Helper method for API calls with consistent response handling
    async makeApiCall(endpoint, method = 'GET', body = null) {
      if (!this.apiRequest) {
        throw new Error('ApiRequest service not available');
      }

      // Add /api prefix if endpoint doesn't start with http and doesn't already have /api
      let fullEndpoint = endpoint;
      if (!endpoint.startsWith('http') && !endpoint.startsWith('/api')) {
        fullEndpoint = `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
      }

      try {
        const response = await this.apiRequest.apiCall(fullEndpoint, method, null, body);
        console.log('API Response:', { originalEndpoint: endpoint, fullEndpoint, method, response });
        
        // Handle different response formats from apiRequest
        return response?.data || response;
      } catch (error) {
        console.error('API Call Error:', { originalEndpoint: endpoint, fullEndpoint, method, error });
        throw error;
      }
    },

    togglePasswordModal() {
      this.isPasswordModalOpen = !this.isPasswordModalOpen;
    },
    resetPassword() {
      this.postData.password = "";
      this.isPasswordModalOpen = false;
    },
    generateRandomPassword() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
      let password = "";
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // ตรวจสอบว่าใช้สำหรับ admin password หรือ page password
      if (this.postData.useAdminPage && this.postData.usePassword) {
        this.postData.adminPassword = password;
      } else {
        this.postData.password = password;
        this.postData.usePassword = true; // เปิดใช้งานรหัสผ่านอัตโนมัติ
      }
    },
    customFilePickerCallback(callback) {
      var input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");

      input.onchange = async () => {
        var file = input.files[0];

        var reader = new FileReader();
        reader.onload = async function () {
          //var url = URL.createObjectURL(file); // Create a URL for the selected image file
          //callback(url, { title: file.name });
        };
        reader.readAsDataURL(file);

        const file_name_array = file.name.split(".");
        const file_extension = file_name_array[file_name_array.length - 1];
        const file_name = this.slugify(file.name);

        const uploadParams = {
          Bucket: this.schoolSession.s3Bucket,
          Key: "upload/" + file.name,
          Body: file,
          ACL: "public-read",
        };

        try {
          const data = await this.S3.send(new PutObjectCommand(uploadParams));

          file.status = true;
          file.outputLink =
            this.schoolSession.s3Endpoint + "upload/" + file_name + "." + file_extension;
          // Return the file output link to MiniMCE
          callback(file.outputLink, { title: file.name });
          console.log("Success", file.outputLink, data);
        } catch (error) {
          console.error("Error uploading file:", error);
          // Handle any errors that occur during the upload process
        }
      };
      input.click();
    },
    openFileManager() {
      this.showFileManagerModal = true; // Show the file manager modal
    },
    closeFileManager() {
      this.showFileManagerModal = false; // Hide the file manager modal
    },
    selectFile(file) {
      // Call the stored callback with the selected file URL
      if (this.filePickerCallback) {
        this.filePickerCallback(file.url, { text: file.url, title: file.name });
      }
      this.closeFileManager(); // Close the file manager modal
    },
    slugify(str) {
      if (!str || typeof str !== "string") {
        return "";
      }
      str = str.trim().toLowerCase();
      var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
      var to = "aaaaaeeeeiiiioooouuuunc------";
      for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
      }
      str = str
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      var lastDotIndex = str.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        str = str.substring(0, lastDotIndex);
      }
      return str;
    },
    async checkSlugExists(slug) {
      console.log("Session", this.session.current._id);
      try {
        const requestBody = {
          method: "find",
          args: [
            {
              $and: [{ owner: this.session.current._id }, { slug: slug }],
            },
          ],
        };

        const response = await this.makeApiCall("post/query", "POST", requestBody);
        return response && Array.isArray(response) && response.length > 0;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    updateSlug() {
      // ใช้งานเฉพาะเมื่อไม่ได้อยู่ในโหมดแก้ไข manual
      if (!this.editing) {
        const newSlug = this.slugify(this.postData.slug);
        let count = 1;
        const checkSlug = async (slug) => {
          const slugExists = await this.checkSlugExists(slug);
          if (slugExists) {
            slug = `${slug}-${count}`;
            count++;
            checkSlug(slug);
          } else {
            console.log("Slug is available", slug);
            this.postData.slug = slug;
          }
        };
        checkSlug(newSlug);
      } else {
        // ถ้าอยู่ในโหมดแก้ไข ให้จบการแก้ไขและ validate slug
        this.editing = false;
        this.debouncedSlugUpdate();
      }
    },
    // เพิ่ม method สำหรับ debounce slug
    debouncedSlugUpdate() {
      // ยกเลิก timer เดิมถ้ามี
      if (this.slugDebounceTimer) {
        clearTimeout(this.slugDebounceTimer);
      }
      
      // สร้าง timer ใหม่ที่จะรอ 1 วินาทีหลังจากหยุดพิมพ์
      this.slugDebounceTimer = setTimeout(() => {
        this.validateSlug();
      }, 1000);
    },
    
    // method สำหรับ validate slug หลังจากหยุดพิมพ์
    async validateSlug() {
      const newSlug = this.slugify(this.postData.slug);
      let count = 1;
      
      const checkSlug = async (slug) => {
        const slugExists = await this.checkSlugExists(slug);
        if (slugExists) {
          slug = `${slug}-${count}`;
          count++;
          await checkSlug(slug);
        } else {
          console.log("Slug is available", slug);
          this.postData.slug = slug;
        }
      };
      
      await checkSlug(newSlug);
    },
    
    // Silent validation ที่ไม่ปิดโหมดแก้ไข
    async validateSlugSilently(slug) {
      if (!slug || slug.trim() === '') return;
      
      const cleanSlug = this.slugify(slug);
      let count = 1;
      let finalSlug = cleanSlug;
      
      // ตรวจสอบว่า slug ซ้ำหรือไม่
      const checkSlug = async (testSlug) => {
        const slugExists = await this.checkSlugExists(testSlug);
        if (slugExists) {
          finalSlug = `${cleanSlug}-${count}`;
          count++;
          await checkSlug(finalSlug);
        } else {
          finalSlug = testSlug;
        }
      };
      
      await checkSlug(cleanSlug);
      
      // อัพเดท slug เฉพาะเมื่อมีการเปลี่ยนแปลง
      if (finalSlug !== this.postData.slug) {
        this.postData.slug = finalSlug;
        console.log("Slug silently updated to:", finalSlug);
      }
    },
    
    onTitleInput() {
      let slug = this.slugify(this.postData.title);
      let count = 1;
      const checkSlug = async (slug) => {
        const slugExists = await this.checkSlugExists(slug);
        if (slugExists) {
          slug = `${slug}-${count}`;
          count++;
          checkSlug(slug);
        } else {
          console.log("Slug is available", slug);
          this.postData.slug = slug;
        }
      };
      checkSlug(slug);
    },
    OpenFileBrowser(index) {
      this.selectedSlideItemIndex = index;
      this.FileBrowserOpen = true;
    },
    changeFileTrigger(payload) {
      this.FileBrowserOpen = payload;
    },

    OpenSEOFileBrowser(index) {
      this.selectedSlideItemIndex = index;
      this.SEOFileBrowserOpen = true;
    },
    changeSEOFileTrigger(payload) {
      this.SEOFileBrowserOpen = payload;
    },

    selectSEOFileTrigger(payload) {
      console.log("selectSEOFileTrigger");
      if (payload != undefined) {
        this.selectSeoCover = payload;
        console.log("selectFileReturnFunction", payload.file);
        this.postData.seo.image = payload.file;
        this.selectedSlideItemIndex = undefined;
      }
    },

    selectFileTrigger(payload) {
      console.log("selectFileTrigger");
      if (payload != undefined) {
        this.selectCourseCover = payload;
        console.log("selectFileReturnFunction", payload.file);
        this.postData.feature_image = payload.file;
        this.selectedSlideItemIndex = undefined;
      }
    },
    selectParent(parent) {
      console.log("Selected parent:", parent);
      this.postData.parent = parent;
      this.showDropdown = false;
    },
    addKeyword() {
      const keyword = this.newKeyword.trim();
      if (keyword && !this.postData.seo.keywords.includes(keyword)) {
        this.postData.seo.keywords.push(keyword); // Add keyword to the array
      }
      this.newKeyword = ""; // Clear the input
    },
    removeKeyword(index) {
      this.postData.seo.keywords.splice(index, 1); // Remove keyword by index
    },
    async getPost() {
      try {
        console.log('Getting post data for ID:', this.dataItem);
        
        if (!this.dataItem) {
          throw new Error('Post ID is missing');
        }

        const data = await this.makeApiCall(`post/${this.dataItem}`, "GET");

        console.log('Raw post data:', data);

        if (!data) {
          throw new Error('No data received from server');
        }

        // Initialize และ validate SEO data
        const seoData = {
          title: (data.seo && data.seo.title) ? data.seo.title : "",
          description: (data.seo && data.seo.description) ? data.seo.description : "",
          keywords: (data.seo && Array.isArray(data.seo.keywords)) ? data.seo.keywords : [],
          image: (data.seo && data.seo.image) ? data.seo.image : "",
        };

        // รวมข้อมูลทั้งหมด
        this.postData = {
          ...data,
          seo: seoData,
          // ตรวจสอบ fields ที่อาจจะ undefined
          content: data.content || '',
          display: data.display || 'single',
          next: data.next || '',
          course: data.course || '',
          action: data.action || '',
          destination: data.destination || '',
          feature_image: data.feature_image || '',
          pageID: data.pageID || '',
          // Boolean fields
          isComment: Boolean(data.isComment),
          isCounter: Boolean(data.isCounter),
          isMenu: Boolean(data.isMenu),
          isTemplate: Boolean(data.isTemplate),
          authen: Boolean(data.authen),
          useAdminPage: Boolean(data.useAdminPage),
          usePassword: Boolean(data.usePassword),
          enableAnalytics: Boolean(data.enableAnalytics),
          enableExport: Boolean(data.enableExport),
          // Custom Fields
          customFields: Array.isArray(data.customFields) ? data.customFields : [],
          // Custom Data
          customData: data.customData || {},
        };

        // โหลดข้อมูล exportFormats จากฐานข้อมูล
        if (data.exportFormats) {
          this.exportFormats = {
            csv: Boolean(data.exportFormats.csv),
            excel: Boolean(data.exportFormats.excel)
          };
        }

        console.log('Processed post data:', this.postData);

      } catch (error) {
        console.error("Error fetching post data:", error);
        
        this.$swal({
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
          type: "error",
          confirmButtonText: "ตกลง",
        }).then(() => {
          this.$router.push('/cms/content');
        });
      }
    },
    async updatePost() {
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!this.postData.title || this.postData.title.trim() === '') {
        this.$swal({
          title: "ข้อผิดพลาด",
          text: "กรุณากรอกชื่อเนื้อหา",
          type: "error",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      if (!this.postData.slug || this.postData.slug.trim() === '') {
        this.$swal({
          title: "ข้อผิดพลาด", 
          text: "กรุณากรอก URL Slug",
          type: "error",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      if (!this.postData.type || this.postData.type.trim() === '') {
        this.$swal({
          title: "ข้อผิดพลาด",
          text: "กรุณาเลือกประเภทเนื้อหา",
          type: "error", 
          confirmButtonText: "ตกลง",
        });
        return;
      }
      
      try {
        this.activeBlock = true;
        this.isSaving = true;
        
        // เตรียมข้อมูลสำหรับบันทึก
        const saveData = {
          title: this.postData.title.trim(),
          slug: this.postData.slug.trim(),
          content: this.postData.content || '',
          display: this.postData.display || 'single',
          // กำหนด type สำหรับ post ใหม่
          type: (this.mode === 'add' && this.type === 'post' && this.dataItem) ? 'post' : this.postData.type,
          next: this.postData.next || '',
          course: this.postData.course || '',
          action: this.postData.action || '',
          isComment: Boolean(this.postData.isComment),
          isCounter: Boolean(this.postData.isCounter),
          isMenu: Boolean(this.postData.isMenu),
          password: this.postData.usePassword ? (this.postData.password || '') : '',
          status: this.postData.status || 'draft',
          isTemplate: Boolean(this.postData.isTemplate),
          authen: Boolean(this.postData.authen),
          destination: this.postData.destination || '',
          feature_image: this.postData.feature_image || '',
          pageID: this.postData.pageID || '',
          owner: this.session.current._id,
          parent: this.mode === 'add' && this.type === 'post' && this.dataItem ? this.dataItem : (this.postData.parent?._id || this.postData.parent || ''),
          builder: this.postData.builder || [],
          
          // Layout setting
          layout: this.postData.layout || 'standard',
          
          // Admin Page Settings
          useAdminPage: Boolean(this.postData.useAdminPage),
          adminPassword: this.postData.useAdminPage && this.postData.usePassword ? (this.postData.adminPassword || '') : '',
          enableAnalytics: Boolean(this.postData.enableAnalytics),
          enableExport: Boolean(this.postData.enableExport),
          usePassword: Boolean(this.postData.usePassword),
          
          // Export Formats
          exportFormats: {
            csv: Boolean(this.exportFormats.csv),
            excel: Boolean(this.exportFormats.excel)
          },
          
          // SEO Settings - ปรับปรุงการตรวจสอบ
          seo: {
            title: (this.postData.seo && this.postData.seo.title) ? this.postData.seo.title.trim() : '',
            description: (this.postData.seo && this.postData.seo.description) ? this.postData.seo.description.trim() : '',
            keywords: (this.postData.seo && Array.isArray(this.postData.seo.keywords)) ? this.postData.seo.keywords : [],
            image: (this.postData.seo && this.postData.seo.image) ? this.postData.seo.image : '',
          },
          // Custom Fields
          customFields: this.postData.customFields || [],
          // Custom Data
          customData: this.postData.customData || {},
        };

        console.log('Saving data:', saveData);
        
        const url = this.mode === 'edit' ? `post/${this.dataItem}` : 'post';
        const method = this.mode === 'edit' ? 'PUT' : 'POST';
        
        const response = await this.makeApiCall(url, method, saveData);

        console.log('Save response:', response);

        // Check if the operation was successful
        const isSuccess = response && (response._id || response.acknowledged || response.ok !== false);

        if (isSuccess) {
          this.activeBlock = false;
          this.isSaving = false;
          this.isDirty = false;
          
          // อัพเดทข้อมูลหลังบันทึกสำเร็จ
          if (this.mode === 'add') {
            this.postData = { ...this.postData, ...response };
          }

          this.$swal({
            title: "บันทึกข้อมูลเรียบร้อยแล้ว",
            text: "คุณต้องการที่จะดำเนินการอย่างไร?",
            type: "success",
            showCancelButton: true,
            confirmButtonColor: "#0054b4",
            confirmButtonText: "กลับไปหน้าหลัก",
            cancelButtonText: "แก้ไขต่อ",
            closeOnConfirm: false,
            closeOnCancel: false,
          }).then((confirmed) => {
            if (confirmed.isConfirmed) {
              const redirectUrl = this.mode === 'add' && this.type === 'post' 
                ? `/cms/posts/${this.dataItem}` 
                : `/cms/pages/`;
              this.$router.replace(redirectUrl);
            } else {
              if (this.mode === 'add') {
                this.$router.replace(`/cms/edit/${response._id}`);
              }
            }
          });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        this.activeBlock = false;
        this.isSaving = false;
        
        console.error('Save error:', error);
        
        // จัดการ error ตามประเภท
        if (error.response) {
          const errorData = error.response.data;
          
          if (errorData.message === "duplicate" && errorData.fields?.includes("slug")) {
            this.$swal({
              title: "ข้อผิดพลาด",
              text: "URL Slug ซ้ำกัน กรุณาใช้ slug อื่น",
              type: "error",
              confirmButtonText: "ตกลง",
            });
          } else if (errorData.message === "validation_failed") {
            this.$swal({
              title: "ข้อผิดพลาด",
              text: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่",
              type: "error",
              confirmButtonText: "ตกลง",
            });
          } else if (error.response.status === 401) {
            this.$swal({
              title: "ข้อผิดพลาด",
              text: "ไม่มีสิทธิ์ในการบันทึกข้อมูล กรุณาเข้าสู่ระบบใหม่",
              type: "error",
              confirmButtonText: "ตกลง",
            });
          } else if (error.response.status === 403) {
            this.$swal({
              title: "ข้อผิดพลาด",
              text: "ไม่มีสิทธิ์ในการแก้ไขข้อมูลนี้",
              type: "error",
              confirmButtonText: "ตกลง",
            });
          } else {
            this.$swal({
              title: "ข้อผิดพลาด",
              text: errorData.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
              type: "error",
              confirmButtonText: "ตกลง",
            });
          }
        } else if (error.request) {
          this.$swal({
            title: "ข้อผิดพลาด",
            text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
            type: "error",
            confirmButtonText: "ตกลง",
          });
        } else {
          this.$swal({
            title: "ข้อผิดพลาด",
            text: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
            type: "error", 
            confirmButtonText: "ตกลง",
          });
        }
      }
    },
    async getParentData() {
        try {
          const parentId = this.type === 'post' ? this.dataItem : this.postData.parent;
          const data = await this.makeApiCall(`post/${parentId}`, "GET");
          console.log("Parent Data:", data);
          this.parentData = data;
          // คุณสามารถจัดการข้อมูลที่ดึงมาได้ที่นี่
        } catch (error) { 
          console.error("Error fetching parent data:", error);
        }
    },
    
    // Sidebar Methods
    applyQuickFilter(filterType) {
      // Navigate back to main content page with filter
      this.$router.push({ path: '/cms/content', query: { filter: filterType } });
    },
    
    viewAllActivities() {
      this.$router.push('/cms/activities');
    },
    
    clickActivity(activity) {
      console.log('Navigate to activity:', activity);
    },
    
    async importData() {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv,.xlsx';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            console.log('Importing file:', file.name);
            this.processImportFile(file);
          }
        };
        input.click();
      } catch (error) {
        console.error('Import error:', error);
      }
    },
    
    async exportData() {
      try {
        console.log('Exporting data...');
        const exportData = {
          timestamp: new Date().toISOString(),
          data: this.postData
        };
        this.downloadJSON(exportData, `content_export_${Date.now()}.json`);
        this.$toast?.success('ส่งออกข้อมูลสำเร็จ');
      } catch (error) {
        console.error('Export error:', error);
        this.$toast?.error('เกิดข้อผิดพลาดในการส่งออก');
      }
    },
    
    processImportFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          console.log('Imported data:', data);
          this.$toast?.success('นำเข้าข้อมูลสำเร็จ');
        } catch (error) {
          console.error('Parse error:', error);
          this.$toast?.error('รูปแบบไฟล์ไม่ถูกต้อง');
        }
      };
      reader.readAsText(file);
    },
    
    downloadJSON(data, filename) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    manageTemplates() {
      this.$router.push('/cms/templates');
    },
    
    openMediaLibrary() {
      this.$router.push('/cms/media');
    },
    
    refreshSystemStatus() {
      console.log('Refreshing system status...');
      this.systemStatus.lastSync = 'ล่าสุด';
      this.systemStatus.connection = 'normal';
      setTimeout(() => {
        this.systemStatus.lastSync = 'เมื่อไม่นานนี้';
      }, 3000);
    },
    
    // Mobile Methods
    toggleMobileSidebar() {
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    },
    
    closeMobileSidebar() {
      this.isMobileSidebarOpen = false;
    },
    
    // Content Analytics Methods
    calculateContentAnalytics() {
      const content = this.postData.content || '';
      const title = this.postData.title || '';
      const description = this.postData.seo?.description || '';
      
      // Word count
      this.contentAnalytics.wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      // Character count
      this.contentAnalytics.charCount = content.length;
      
      // Reading time (ประมาณ 200 คำต่อนาที)
      this.contentAnalytics.readingTime = Math.ceil(this.contentAnalytics.wordCount / 200);
      
      // SEO Score (0-100)
      let seoScore = 0;
      if (title.length >= 30 && title.length <= 60) seoScore += 20;
      if (description.length >= 120 && description.length <= 160) seoScore += 20;
      if (this.postData.seo?.keywords?.length >= 1) seoScore += 15;
      if (this.postData.feature_image) seoScore += 15;
      if (this.postData.slug && this.postData.slug.length > 0) seoScore += 15;
      if (content.length >= 300) seoScore += 15;
      
      this.contentAnalytics.seoScore = seoScore;
      
      // Readability Score (เรียบง่าย)
      const avgWordsPerSentence = this.contentAnalytics.wordCount / Math.max(1, content.split(/[.!?]+/).length);
      if (avgWordsPerSentence <= 15) this.contentAnalytics.readabilityScore = 90;
      else if (avgWordsPerSentence <= 20) this.contentAnalytics.readabilityScore = 70;
      else if (avgWordsPerSentence <= 25) this.contentAnalytics.readabilityScore = 50;
      else this.contentAnalytics.readabilityScore = 30;
    },
    
    // Content Validation Methods
    validateContent() {
      this.contentValidation.hasTitle = this.postData.title && this.postData.title.length >= 3;
      this.contentValidation.hasSlug = this.postData.slug && this.postData.slug.length >= 3;
      this.contentValidation.hasContent = this.postData.content && this.postData.content.length >= 50;
      this.contentValidation.hasImage = !!this.postData.feature_image;
      this.contentValidation.hasSEO = !!(this.postData.seo?.title || this.postData.seo?.description);
      
      // Calculate overall score
      const checks = Object.values(this.contentValidation).filter(val => typeof val === 'boolean');
      const passedChecks = checks.filter(check => check).length;
      this.contentValidation.score = Math.round((passedChecks / checks.length) * 100);
    },
    
    // Tags Methods
    addTag() {
      const tag = this.newTag.trim().toLowerCase();
      if (tag && !this.contentTags.includes(tag)) {
        this.contentTags.push(tag);
        this.markDirty();
      }
      this.newTag = '';
    },
    
    removeTag(index) {
      this.contentTags.splice(index, 1);
      this.markDirty();
    },
    
    // Content Scheduling Methods
    scheduleContent() {
      this.contentSchedule.isScheduled = true;
      this.markDirty();
    },
    
    unscheduleContent() {
      this.contentSchedule.isScheduled = false;
      this.contentSchedule.publishDate = '';
      this.contentSchedule.unpublishDate = '';
      this.markDirty();
    },
    
    // Content Duplication
    async duplicateContent() {
      try {
        const duplicatedData = JSON.parse(JSON.stringify(this.postData));
        duplicatedData.title = `${duplicatedData.title} (Copy)`;
        duplicatedData.slug = `${duplicatedData.slug}-copy`;
        delete duplicatedData._id;
        
        const data = await this.makeApiCall('post', 'POST', duplicatedData);
        
        this.$toast?.success('คัดลอกเนื้อหาสำเร็จ');
        this.$router.push(`/cms/edit/${data._id}`);
      } catch (error) {
        console.error('Duplication failed:', error);
        this.$toast?.error('เกิดข้อผิดพลาดในการคัดลอก');
      }
    },
    
    // Content Export/Import
    exportContent() {
      const exportData = {
        content: this.postData,
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0',
          type: 'cms-content'
        }
      };
      
      this.downloadJSON(exportData, `content-${this.postData.slug || 'untitled'}-${Date.now()}.json`);
    },
    
    async importContent(file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importData = JSON.parse(e.target.result);
            if (importData.content) {
              this.postData = { ...this.postData, ...importData.content };
              this.markDirty();
              this.$toast?.success('นำเข้าเนื้อหาสำเร็จ');
            }
          } catch (error) {
            this.$toast?.error('รูปแบบไฟล์ไม่ถูกต้อง');
          }
        };
        reader.readAsText(file);
      } catch (error) {
        this.$toast?.error('เกิดข้อผิดพลาดในการนำเข้า');
      }
    },
    exportAnalytics(format) {
      try {
        let analyticsData = {};
        
        // สร้างข้อมูลตามประเภทที่เลือก
        switch (this.exportDataType) {
          case 'analytics':
            analyticsData = {
              'หน้า': this.postData.title || 'ไม่มีชื่อ',
              'URL': this.postData.slug || '',
              'จำนวนผู้เยี่ยมชม': this.analyticsData.totalViews,
              'ผู้เยี่ยมชมไม่ซ้ำ': this.analyticsData.uniqueVisitors,
              'เวลาเฉลี่ยบนหน้า': this.analyticsData.avgTimeOnPage,
              'Bounce Rate': this.analyticsData.bounceRate,
              'เวลาที่เข้าชมบ่อยสุด': this.analyticsData.peakHours,
              'วันที่ส่งออก': new Date().toLocaleString('th-TH')
            };
            break;
            
          case 'visitors':
            analyticsData = {
              'หน้า': this.postData.title || 'ไม่มีชื่อ',
              'แหล่งที่มา Google': this.analyticsData.sources.google + '%',
              'แหล่งที่มาโดยตรง': this.analyticsData.sources.direct + '%',
              'แหล่งที่มา Social Media': this.analyticsData.sources.social + '%',
              'อุปกรณ์ Desktop': this.analyticsData.devices.desktop + '%',
              'อุปกรณ์ Mobile': this.analyticsData.devices.mobile + '%',
              'อุปกรณ์ Tablet': this.analyticsData.devices.tablet + '%',
              'วันที่ส่งออก': new Date().toLocaleString('th-TH')
            };
            break;
            
          case 'comments':
            analyticsData = {
              'หน้า': this.postData.title || 'ไม่มีชื่อ',
              'เปิดใช้ความคิดเห็น': this.postData.isComment ? 'ใช่' : 'ไม่',
              'จำนวนความคิดเห็น': Math.floor(Math.random() * 50), // Mock data
              'ความคิดเห็นที่รออนุมัติ': Math.floor(Math.random() * 10),
              'ความคิดเห็นที่ถูกบล็อก': Math.floor(Math.random() * 5),
              'วันที่ส่งออก': new Date().toLocaleString('th-TH')
            };
            break;
            
          case 'forms':
            analyticsData = {
              'หน้า': this.postData.title || 'ไม่มีชื่อ',
              'ประเภทหน้า': this.postData.type,
              'การดำเนินการฟอร์ม': this.postData.action || 'ไม่ได้ตั้งค่า',
              'ปลายทางข้อมูล': this.postData.destination || 'ไม่ได้ตั้งค่า',
              'จำนวนการส่งฟอร์ม': Math.floor(Math.random() * 100), // Mock data
              'อัตราการแปลง': (Math.random() * 20 + 5).toFixed(2) + '%',
              'วันที่ส่งออก': new Date().toLocaleString('th-TH')
            };
            break;
            
          case 'all':
            analyticsData = {
              'หน้า': this.postData.title || 'ไม่มีชื่อ',
              'URL': this.postData.slug || '',
              'ประเภทหน้า': this.postData.type,
              'สถานะ': this.postData.status ? 'เผยแพร่' : 'ไม่เผยแพร่',
              'จำนวนผู้เยี่ยมชม': this.analyticsData.totalViews,
              'ผู้เยี่ยมชมไม่ซ้ำ': this.analyticsData.uniqueVisitors,
              'เวลาเฉลี่ยบนหน้า': this.analyticsData.avgTimeOnPage,
              'Bounce Rate': this.analyticsData.bounceRate,
              'แหล่งที่มา Google': this.analyticsData.sources.google + '%',
              'แหล่งที่มาโดยตรง': this.analyticsData.sources.direct + '%',
              'แหล่งที่มา Social Media': this.analyticsData.sources.social + '%',
              'อุปกรณ์ Desktop': this.analyticsData.devices.desktop + '%',
              'อุปกรณ์ Mobile': this.analyticsData.devices.mobile + '%',
              'อุปกรณ์ Tablet': this.analyticsData.devices.tablet + '%',
              'เปิดใช้ความคิดเห็น': this.postData.isComment ? 'ใช่' : 'ไม่',
              'เวลาที่เข้าชมบ่อยสุด': this.analyticsData.peakHours,
              'วันที่ส่งออก': new Date().toLocaleString('th-TH')
            };
            break;
            
          default:
            analyticsData = {
              'ข้อผิดพลาด': 'ไม่พบประเภทข้อมูลที่เลือก',
              'วันที่ส่งออก': new Date().toLocaleString('th-TH')
            };
        }

        if (format === 'csv') {
          this.exportToCSV(analyticsData);
        } else if (format === 'excel') {
          this.exportToExcel(analyticsData);
        }

        this.$toast?.success(`ส่งออกข้อมูล${this.getDataTypeLabel()} ${format.toUpperCase()} สำเร็จ`);
      } catch (error) {
        console.error('Export error:', error);
        this.$toast?.error('เกิดข้อผิดพลาดในการส่งออก');
      }
    },

    getDataTypeLabel() {
      const labels = {
        'analytics': 'การวิเคราะห์',
        'visitors': 'ผู้เยี่ยมชม',
        'comments': 'ความคิดเห็น',
        'forms': 'ฟอร์ม',
        'all': 'ทั้งหมด'
      };
      return labels[this.exportDataType] || '';
    },

    exportToCSV(data) {
      const headers = Object.keys(data);
      const values = Object.values(data);
      
      const csvContent = [
        headers.join(','),
        values.map(value => `"${value}"`).join(',')
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${this.exportDataType}_${this.postData.slug || 'page'}_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    exportToExcel(data) {
      // สำหรับ Excel เราจะใช้รูปแบบ HTML table ที่ Excel สามารถเปิดได้
      const headers = Object.keys(data);
      const values = Object.values(data);
      
      let htmlContent = `
        <table border="1">
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            <tr>${values.map(v => `<td>${v}</td>`).join('')}</tr>
          </tbody>
        </table>
      `;

      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${this.exportDataType}_${this.postData.slug || 'page'}_${Date.now()}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    async loadAnalyticsData() {
      try {
        // เรียก API เพื่อโหลดข้อมูล analytics
        const data = await this.makeApiCall(`analytics/page/${this.dataItem}`, "GET");
        
        this.analyticsData = {
          totalViews: data?.totalViews || 0,
          uniqueVisitors: data?.uniqueVisitors || 0,
          avgTimeOnPage: data?.avgTimeOnPage || '0:00',
          bounceRate: data?.bounceRate || '0%',
          sources: data?.sources || { google: 0, direct: 0, social: 0 },
          devices: data.devices || { desktop: 0, mobile: 0, tablet: 0 },
          peakHours: data.peakHours || 'กำลังวิเคราะห์...'
        };
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        // ใช้ข้อมูล mock เมื่อไม่สามารถโหลดจาก API ได้
        this.analyticsData = {
          totalViews: Math.floor(Math.random() * 1000) + 100,
          uniqueVisitors: Math.floor(Math.random() * 500) + 50,
          avgTimeOnPage: '2:34',
          bounceRate: Math.floor(Math.random() * 50) + 25 + '%',
          sources: { 
            google: Math.floor(Math.random() * 50) + 30, 
            direct: Math.floor(Math.random() * 30) + 20, 
            social: Math.floor(Math.random() * 20) + 10 
          },
          devices: { 
            desktop: Math.floor(Math.random() * 40) + 40, 
            mobile: Math.floor(Math.random() * 40) + 35, 
            tablet: Math.floor(Math.random() * 20) + 5 
          },
          peakHours: '14:00 - 16:00 น.'
        };
      }
    },
    clearPassword() {
      this.postData.password = "";
      this.postData.usePassword = false;
    },
    exportSelectedData() {
      const selectedFormats = ['csv', 'excel'].filter(format => this.exportFormats[format]);
      selectedFormats.forEach(format => this.exportAnalytics(format));
    },
    async checkApiConnection() {
      try {
        console.log('Checking API connection...');
        console.log('API Server:', this.apiServer);
        console.log('Configs:', this.configs);
        console.log('Session:', this.session);
        
        // ทดสอบการเชื่อมต่อ API
        const testResponse = await this.makeApiCall('test', 'GET');
        console.log('API Test Response:', testResponse);
        return true;
      } catch (error) {
        console.error('API Connection Error:', error);
        return false;
      }
    },
    
    async debugSaveData() {
      console.log('=== DEBUG SAVE DATA ===');
      console.log('Mode:', this.mode);
      console.log('Type:', this.type);
      console.log('Data Item:', this.dataItem);
      console.log('Post Data:', JSON.stringify(this.postData, null, 2));
      console.log('Session Current:', this.session?.current);
      console.log('Configs Key:', this.configs?.key);
      console.log('======================');
    },
    goBack() {
      // กรณีเพิ่ม post ย่อยใหม่ (mode = 'add' และ type = 'post' และมี dataItem)
      if (this.mode === 'add' && this.type === 'post' && this.dataItem) {
        this.$router.push(`/cms/pages/${this.dataItem}`);
        return;
      }
      
      // กรณีแก้ไข post ย่อย (postData.type === 'post' และมี parent)
      if (this.postData.type === 'post' && this.postData.parent) {
        this.$router.push(`/cms/pages/${this.postData.parent}`);
        return;
      }
      
      // กรณีปกติ
      this.$router.push(this.redirectLink || '/cms/pages');
    },
    OpenCustomImageBrowser(fieldName) {
      this.currentCustomImageField = fieldName;
      this.CustomImageBrowserOpen = true;
    },

    changeCustomImageFileTrigger(payload) {
      this.CustomImageBrowserOpen = payload;
    },

    selectCustomImageFileTrigger(payload) {
      console.log("selectCustomImageFileTrigger");
      if (payload != undefined && this.currentCustomImageField) {
        console.log("selectFileReturnFunction", payload.file);
        
        // Update the specific field in customData
        this.postData.customData = {
          ...this.postData.customData,
          [this.currentCustomImageField]: payload.file
        };
        
        this.currentCustomImageField = null;
        this.selectedSlideItemIndex = undefined;
        this.markDirty();
      }
    },
    markDirty() {
      // Simple dirty state tracking
      console.log('Content has been modified');
    },
    
    // QR Code Methods
    async generateQRCode() {
      console.log('=== Generating QR Code in ContentForm.vue ===');
      console.log('Method generateQRCode called successfully!');
      console.log('postData.slug:', this.postData.slug);
      console.log('configs:', this.configs);
      
      if (!this.postData.slug || this.postData.slug.trim() === '') {
        console.log('No slug found, showing error dialog');
        this.$swal({
          title: "ข้อผิดพลาด",
          text: "กรุณากรอก URL Slug ก่อนสร้าง QR Code",
          type: "error",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      try {
        this.qrCode.isGenerating = true;
        console.log('Starting QR code generation...');
        
        // สร้าง URL จาก slug
        const baseUrl = this.configs?.siteUrl || window.location.origin;
        this.qrCode.url = `${baseUrl}/${this.postData.slug}`;
        
        console.log('QR Code URL:', this.qrCode.url);
        console.log('QRCode library available:', typeof QRCode);
        console.log('QRCodeLib available:', typeof QRCodeLib);
        
        // ตรวจสอบว่า QRCode library พร้อมใช้งาน
        const qrCodeInstance = QRCodeLib || QRCode;
        if (typeof qrCodeInstance === 'undefined' || !qrCodeInstance.toDataURL) {
          throw new Error('QRCode library is not available or does not have toDataURL method');
        }
        
        // สร้าง QR Code
        const dataUrl = await qrCodeInstance.toDataURL(this.qrCode.url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        console.log('QR Code generated successfully, dataUrl length:', dataUrl.length);
        this.qrCode.dataUrl = dataUrl;
        this.qrCode.showModal = true;
        
        console.log('QR Code modal should be visible now');
        
      } catch (error) {
        console.error('Error generating QR code:', error);
        console.error('Error stack:', error.stack);
        
        let errorMessage = "ไม่สามารถสร้าง QR Code ได้";
        if (error.message.includes('QRCode library')) {
          errorMessage = "ไม่พบ QRCode library กรุณาตรวจสอบการติดตั้ง";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง";
        }
        
        this.$swal({
          title: "ข้อผิดพลาด",
          text: `${errorMessage}\n\nรายละเอียด: ${error.message}`,
          type: "error",
          confirmButtonText: "ตกลง",
        });
      } finally {
        this.qrCode.isGenerating = false;
        console.log('QR Code generation completed, isGenerating:', this.qrCode.isGenerating);
      }
    },
    
    downloadQRCode() {
      if (!this.qrCode.dataUrl) return;
      
      const link = document.createElement('a');
      link.download = `qrcode-${this.postData.slug || 'page'}.png`;
      link.href = this.qrCode.dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    
    closeQRModal() {
      this.qrCode.showModal = false;
    },
    
    async saveQRCodeToGallery() {
      if (!this.qrCode.dataUrl) return;
      
      try {
        // แปลง data URL เป็น blob
        const response = await fetch(this.qrCode.dataUrl);
        const blob = await response.blob();
        
        // สร้างชื่อไฟล์
        const fileName = `qrcode-${this.postData.slug || 'page'}-${Date.now()}.png`;
        
        // อัปโหลดไปยัง S3
        const uploadParams = {
          Bucket: this.schoolSession.s3Bucket,
          Key: `upload/${fileName}`,
          Body: blob,
          ACL: "public-read",
          ContentType: 'image/png'
        };
        
        await this.S3.send(new PutObjectCommand(uploadParams));
        
        this.$swal({
          title: "สำเร็จ",
          text: "บันทึก QR Code ไปยังคลังสื่อแล้ว",
          type: "success",
          confirmButtonText: "ตกลง",
        });
        
      } catch (error) {
        console.error('Error saving QR code:', error);
        this.$swal({
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถบันทึก QR Code ได้",
          type: "error",
          confirmButtonText: "ตกลง",
        });
      }
    },
    
    // Debug method for testing QR Code
    testQRCode() {
      console.log('=== Testing QR Code ===');
      console.log('QRCode library type:', typeof QRCode);
      console.log('QRCodeLib library type:', typeof QRCodeLib);
      console.log('postData.slug:', this.postData.slug);
      console.log('qrCode data:', this.qrCode);
      
      // Test both instances
      const qrCodeInstance = QRCodeLib || QRCode;
      console.log('Using QR instance:', typeof qrCodeInstance);
      
      if (qrCodeInstance && qrCodeInstance.toDataURL) {
        console.log('QRCode.toDataURL method available');
        
        // Test basic QR code generation with Promise
        qrCodeInstance.toDataURL('https://example.com/test', {
          width: 200,
          margin: 2
        }).then(url => {
          console.log('QRCode test successful, dataUrl length:', url.length);
          console.log('Sample dataUrl start:', url.substring(0, 50));
        }).catch(err => {
          console.error('QRCode test error:', err);
        });
      } else {
        console.error('QRCode library not properly loaded or missing toDataURL method');
        console.log('Available methods:', qrCodeInstance ? Object.getOwnPropertyNames(qrCodeInstance) : 'N/A');
      }
    },
    
    // Force show QR modal for debugging
    showQRModalForDebug() {
      console.log('Forcing QR modal to show for debugging...');
      this.qrCode.showModal = true;
      this.qrCode.url = `${window.location.origin}/${this.postData.slug || 'test-page'}`;
    },
  },
  setup() {},
  watch: {
    // Watch for content changes to trigger analytics
    'postData.title': {
      handler() {
        this.markDirty();
        this.validateContent();
        this.calculateContentAnalytics();
      }
    },
    'postData.content': {
      handler() {
        this.markDirty();
        this.validateContent();
        this.calculateContentAnalytics();
      }
    },
    'postData.seo': {
      handler() {
        this.markDirty();
        this.validateContent();
        this.calculateContentAnalytics();
      },
      deep: true
    },
    'postData.feature_image': {
      handler() {
        this.markDirty();
        this.validateContent();
      }
    },
    'postData.slug': {
      handler() {
        this.markDirty();
        this.validateContent();
      }
    },
    'postData.hasAdminResult': {
      handler(newValue) {
        if (newValue && this.mode === 'edit') {
          this.loadAnalyticsData();
        }
        this.markDirty();
      }
    },
    'postData.usePassword': {
      handler(newValue) {
        if (!newValue) {
          this.postData.password = '';
        }
        this.markDirty();
      }
    },
    'postData.useAdminPage': {
      handler(newValue) {
        if (newValue && this.mode === 'edit') {
          if (this.postData.enableAnalytics) {
            this.loadAnalyticsData();
          }
        }
        if (!newValue) {
          this.postData.usePassword = false;
          this.postData.enableAnalytics = false;
          this.postData.enableExport = false;
          this.postData.adminPassword = '';
        }
        this.markDirty();
      }
    },
    'postData.enableAnalytics': {
      handler(newValue) {
        if (newValue && this.postData.useAdminPage && this.mode === 'edit') {
          this.loadAnalyticsData();
        }
        this.markDirty();
      }
    },
    'postData.layout': {
      handler() {
        this.markDirty();
        this.validateContent();
      }
    },
    // Remove or modify any watchers that might cause recursion
    'postData.customFields': {
      handler() {
        this.markDirty();
      },
      deep: true
    },
  },
  beforeUnmount() {
    // ยกเลิก timer เมื่อ component ถูกทำลาย
    if (this.slugDebounceTimer) {
      clearTimeout(this.slugDebounceTimer);
    }
  },
  async mounted() {
    try {
      console.log('=== ContentForm Mounted ===');
      console.log('Mode:', this.mode);
      console.log('Type:', this.type);
      console.log('Route params:', this.$route.params);
      console.log('Initial data:', this.initialData);
      
      // ตรวจสอบ ApiRequest injection
      if (!this.apiRequest) {
        console.warn('ApiRequest not injected, check main.js configuration');
        this.$swal({
          title: "ข้อผิดพลาด",
          text: "ระบบ API ไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง",
          type: "error",
          confirmButtonText: "ตกลง",
        });
        return;
      }
      
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!this.session || !this.session.current || !this.session.current._id) {
        console.error('Session data is missing');
        this.$swal({
          title: "ข้อผิดพลาด",
          text: "ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่",
          type: "error",
          confirmButtonText: "ตกลง",
        }).then(() => {
          this.$router.push('/login');
        });
        return;
      }

      if (!this.configs || !this.configs.key) {
        console.error('Config data is missing');
        this.$swal({
          title: "ข้อผิดพลาด",
          text: "ไม่พบการตั้งค่าระบบ กรุณาตรวจสอบการตั้งค่า",
          type: "error",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      // Initialize SEO data if not exists
      if (!this.postData.seo) {
        this.postData.seo = {
          title: '',
          description: '',
          keywords: [],
          image: '',
        };
      }

      if (this.mode === 'edit') {
        await this.getPost();
        if (this.postData.type === 'post') {
          await this.getParentData(); 
        }
        
        // โหลดข้อมูล analytics ถ้าเปิดใช้งาน
        if (this.postData.hasAdminResult) {
          await this.loadAnalyticsData();
        }
      } else if (this.mode === 'add' && this.type === 'post') {
        await this.getParentData();
      }

      const hash = this.$route.hash;
      if (hash) {
        this.redirectLink = `/cms/pages${hash}`;
      } else {
        // ถ้าเป็น post ให้ redirect ไปที่ parent
        if (this.postData.type === 'post' && this.postData.parent) {
          this.redirectLink = `/cms/pages/${this.postData.parent}`;
        } else {
          this.redirectLink = '/cms/pages';
        }
      }

      // กำหนดประเภทเนื้อหาสำหรับ post
      if (this.type === 'post' && this.dataItem) {
        this.postData.type = 'post';
        this.postData.display = 'single';
      }
      
      // คำนวณ analytics และ validation ครั้งแรก
      this.validateContent();
      this.calculateContentAnalytics();
      
      // Test QRCode library
      console.log('Testing QRCode library at mount...');
      this.testQRCode();
      
      console.log('=== ContentForm Initialized Successfully ===');
      
    } catch (error) {
      console.error('Error in mounted():', error);
      this.$swal({
        title: "ข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการโหลดหน้า กรุณาลองใหม่อีกครั้ง",
        type: "error",
        confirmButtonText: "ตกลง",
      });
    }
  },
};
</script>

<template>
  <div class="bg-gray-50 flex cms-container">
    <!-- Left Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <ContentLeftSidebar
        :post-id="this.postData._id"
        :slug="this.postData.slug"
        :user-name="session?.current?.name || 'ผู้ใช้'"
        :content-analytics="contentAnalytics"
        :content-validation="contentValidation"
        @go-back="goBack"
        @import-data="importData"
        @export-data="exportData"
        @manage-templates="manageTemplates"
        @open-media-library="openMediaLibrary"
        @generate-qr-code="generateQRCode"
      />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button 
              @click="toggleMobileSidebar"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i class="fas fa-bars text-gray-600"></i>
            </button>
            <h1 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h1>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click.prevent="updatePost"
              type="button"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm flex items-center gap-1"
            >
              <i class="fas fa-save text-xs"></i>
              บันทึก
            </button>
            <router-link 
              :to="redirectLink" 
              class="bg-gray-600 hover:bg-gray-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm flex items-center gap-1"
            >
              <i class="fas fa-arrow-left text-xs"></i>
              กลับ
            </router-link>
          </div>
        </div>
      </div>

      <!-- Header with Subhead -->
      <div class="bg-white border-b border-gray-200">
        <Subhead
          :pageTitle="pageTitle"
          :navigation="[
            {
              name: 'บันทึกข้อมูล',
              function: 'updatePost',
              style: 'save',
              class: 'primary-btn',
              visible: true,
              type: 'button',
            },
            {
              name: 'ย้อนกลับ',
              function: 'goBack',
              style: 'chevron-left',
              class: 'default-btn',
              visible: true,
              type: 'button',
            },
          ]"
          @goBack="goBack"
          @updatePost="updatePost"
          @debugSaveData="debugSaveData"
          @checkApiConnection="checkApiConnection"
        />
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-2 pb-4 overflow-visible bg-gray-100">
        <ContentFormMain
          :title="postData.title"
          :slug="postData.slug"
          :is-editing="editing"
          :hostname="session.current.hostname"
          :parent-slug="parentData?.slug"
          :content-type="postData.type"
          :display="postData.display"
          :is-post-type="postData.type === 'post'"
          :is-comment="postData.isComment"
          :is-counter="postData.isCounter"
          :is-menu="postData.isMenu"
          :seo-image="postData.seo?.image"
          :seo-title="postData.seo?.title"
          :seo-description="postData.seo?.description"
          :seo-keywords="postData.seo?.keywords"
          :action="postData.action"
          :destination="postData.destination"
          :next="postData.next"
          :post-id="postData._id"
          :custom-fields="postData.customFields"
          :custom-data="postData.customData"
          :parent-id="type === 'post' ? dataItem : ''"
          :parent-data="parentData"
          :configs="configs"
          :type="type"
          @update:title="postData.title = $event"
          @on-title-input="onTitleInput"
          @on-title-blur="mode === 'add' && postData.title && updateSlug"
          @edit:slug="editing = $event"
          @update:slug="postData.slug = $event"
          @update-slug="updateSlug"
          @validate-slug-silently="validateSlugSilently"
          @update:content-type="postData.type = $event"
          @update:display="postData.display = $event"
          @update:is-comment="postData.isComment = $event"
          @update:is-counter="postData.isCounter = $event"
          @update:is-menu="postData.isMenu = $event"
          @open-seo-file-browser="OpenSEOFileBrowser"
          @update:seo-title="postData.seo.title = $event"
          @update:seo-description="postData.seo.description = $event"
          @remove-keyword="removeKeyword"
          @add-keyword="addKeyword"
          @update:action="postData.action = $event"
          @update:destination="postData.destination = $event"
          @update:next="postData.next = $event"
          @update:custom-fields="postData.customFields = $event"
          @update:custom-data="postData.customData = $event"
          @open-custom-image-browser="OpenCustomImageBrowser"
        />
        
        <!-- FileBrowser Components -->
        <FileBrowser
          class="z-[9999]"
          v-if="FileBrowserOpen"
          :isWindowsOpen="true"
          :callbackFunction="'cover'"
          :allowFileType="['jpg', 'gif', 'png', 'jpeg']"
          @file-browser-trigger="changeFileTrigger"
          @file-browser-callback="selectFileTrigger"
        />

        <FileBrowser
          class="z-[9999]"
          v-if="SEOFileBrowserOpen"
          :isWindowsOpen="true"
          :callbackFunction="'cover'"
          :allowFileType="['jpg', 'gif', 'png', 'jpeg']"
          @file-browser-trigger="changeSEOFileTrigger"
          @file-browser-callback="selectSEOFileTrigger"
        />

        <FileBrowser
          class="z-[9999]"
          v-if="CustomImageBrowserOpen"
          :isWindowsOpen="true"
          :callbackFunction="'cover'"
          :allowFileType="['jpg', 'gif', 'png', 'jpeg']"
          @file-browser-trigger="changeCustomImageFileTrigger"
          @file-browser-callback="selectCustomImageFileTrigger"
        />
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="closeMobileSidebar"
    ></div>

    <!-- Mobile Sidebar -->
    <div 
      class="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 transform transition-transform duration-300 lg:hidden"
      :class="{ 'translate-x-0': isMobileSidebarOpen, '-translate-x-full': !isMobileSidebarOpen }"
    >
      <div class="flex flex-col h-full">
        <ContentLeftSidebar
          :post-id="this.postData._id"
          :slug="this.postData.slug"
          :user-name="session?.current?.name || 'ผู้ใช้'"
          :content-analytics="contentAnalytics"
          :content-validation="contentValidation"
          @go-back="goBack"
          @import-data="importData"
          @export-data="exportData"
          @manage-templates="manageTemplates"
          @open-media-library="openMediaLibrary"
          @generate-qr-code="generateQRCode"
        />
      </div>
    </div>

    <!-- Right Sidebar -->
    <div class="hidden xl:flex xl:w-80 xl:flex-col">
      <ContentRightSidebar
        :feature-image="postData.feature_image"
        :publish-status="!!postData.status"
        :require-auth="postData.authen"
        :use-admin-page="postData.useAdminPage"
        :use-password="postData.usePassword"
        :admin-password="postData.adminPassword"
        :enable-analytics="postData.enableAnalytics"
        :enable-export="postData.enableExport"
        :export-csv="exportFormats.csv"
        :export-excel="exportFormats.excel"
        :is-template="postData.isTemplate"
        :layout="postData.layout"
        :page-id="postData.pageID"
        :page-password="postData.password"
        :is-password-modal-open="isPasswordModalOpen"
        :is-post-type="(type === 'post' && dataItem) || postData.type === 'post'"
        :content-type="(type === 'post' && dataItem) ? 'post' : postData.type"
        :created-date="postData.createdAt ? new Date(postData.createdAt).toLocaleDateString('th-TH') : '-'"
        :updated-date="postData.updatedAt ? new Date(postData.updatedAt).toLocaleDateString('th-TH') : '-'"
        :view-count="postData.views || 0"
        @open-file-browser="OpenFileBrowser"
        @update:publish-status="postData.status = $event ? 'draft' : ''"
        @update:require-auth="postData.authen = $event"
        @update:use-admin-page="postData.useAdminPage = $event"
        @update:use-password="postData.usePassword = $event"
        @update:admin-password="postData.adminPassword = $event"
        @update:enable-analytics="postData.enableAnalytics = $event"
        @update:enable-export="postData.enableExport = $event"
        @update:export-csv="exportFormats.csv = $event"
        @update:export-excel="exportFormats.excel = $event"
        @update:is-template="postData.isTemplate = $event"
        @update:layout="postData.layout = $event"
        @update:page-id="postData.pageID = $event"
        @update:page-password="postData.password = $event"
        @generate-random-password="generateRandomPassword"
        @toggle-password-modal="togglePasswordModal"
        @reset-password="resetPassword"
        @update-post="updatePost"
        @delete-content="deleteContent"
        @duplicate-content="duplicateContent"
        @export-content="exportContent"
        @import-content="importContent"
      />
    </div>

    <!-- QR Code Modal -->
    <div 
      v-if="qrCode.showModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeQRModal"
    >
      <div 
        class="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="bg-blue-600 px-4 py-3 rounded-t-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="fas fa-qrcode text-white"></i>
              <h3 class="text-lg font-medium text-white">QR Code</h3>
            </div>
            <button 
              @click="closeQRModal"
              class="text-white hover:text-blue-200 transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-4">
          <!-- Loading State -->
          <div v-if="qrCode.isGenerating" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mb-3"></div>
            <p class="text-gray-600 text-sm">กำลังสร้าง QR Code...</p>
          </div>

          <!-- QR Code Display -->
          <div v-else-if="qrCode.dataUrl" class="text-center space-y-4">
            <!-- QR Code Container -->
            <div class="bg-gray-50 p-3 rounded-lg inline-block">
              <img 
                :src="qrCode.dataUrl" 
                alt="QR Code"
                class="w-48 h-48 mx-auto"
              />
            </div>
            
            <!-- Page Information -->
            <div class="bg-gray-50 p-3 rounded-lg text-left">
              <h4 class="font-medium text-gray-900 text-sm mb-1">{{ postData.title }}</h4>
              <p class="text-xs text-gray-600 break-all font-mono">{{ qrCode.url }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="downloadQRCode"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
              >
                <i class="fas fa-download text-xs"></i>
                ดาวน์โหลด
              </button>
              <button
                @click="saveQRCodeToGallery"
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
              >
                <i class="fas fa-save text-xs"></i>
                บันทึก
              </button>
            </div>
          </div>
          
          <!-- Error State -->
          <div v-else class="text-center space-y-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-exclamation-triangle text-red-500"></i>
              </div>
              <h4 class="font-medium text-red-800 text-sm mb-2">ไม่สามารถสร้าง QR Code ได้</h4>
              <p class="text-red-600 text-xs mb-3">กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง</p>
              
              <!-- Debug Information -->
              <div class="bg-white rounded p-3 text-left">
                <div class="space-y-1 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-600">URL:</span>
                    <span class="text-gray-800 font-mono truncate ml-2">{{ qrCode.url || 'ไม่ได้ตั้งค่า' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">QRCode Library:</span>
                    <span class="text-gray-800">{{ typeof QRCode !== 'undefined' ? 'พร้อมใช้งาน' : 'ไม่พบ' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Slug:</span>
                    <span class="text-gray-800 font-mono truncate ml-2">{{ postData.slug || 'ไม่ได้ตั้งค่า' }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="testQRCode"
                class="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
              >
                <i class="fas fa-bug text-xs"></i>
                ทดสอบ
              </button>
              <button
                @click="generateQRCode"
                class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
              >
                <i class="fas fa-redo text-xs"></i>
                ลองใหม่
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CMS container with natural height and 3-column layout */
.cms-container {
  min-height: calc(100vh - var(--header-height, 64px));
  overflow: visible;
}

/* Responsive header heights */
@media (min-width: 1024px) {
  .cms-container {
    min-height: calc(100vh - var(--header-height, 80px));
  }
}

@media (max-width: 768px) {
  .cms-container {
    min-height: calc(100vh - var(--header-height, 56px));
  }
}

/* 3-Column Layout */
@media (min-width: 1536px) {
  .cms-container {
    display: grid;
    grid-template-columns: 256px 1fr 320px;
  }
}

@media (min-width: 1280px) and (max-width: 1535px) {
  .cms-container {
    display: grid;
    grid-template-columns: 256px 1fr 320px;
  }
  
  .xl\:w-80 {
    display: flex !important;
  }
}

@media (max-width: 1279px) {
  .xl\:flex {
    display: none !important;
  }
}

/* Stats cards hover effect */
.stats-card {
  transition: all 0.2s ease-in-out;
}

.stats-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Smooth transitions */
.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

/* Focus states */
.focus\:ring-1:focus {
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.5);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Radio button visual improvements */
input[type="radio"]:checked + span {
  color: #3b82f6;
  font-weight: 600;
}

/* Checkbox visual improvements */

input[type="checkbox"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Slug input styling */
.slug-input {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
}

/* Form validation states */
.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.1);
}

.success {
  border-color: #10b981;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.1);
}

/* Compact form elements */
.compact-input {
  padding: 0.375rem  0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
}

.compact-select {
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
}

.compact-textarea {
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  line-height: 1.25rem;
}

/* Section spacing */
.content-section {
  margin-bottom: 0.75rem;
}

.content-section:last-child {
  margin-bottom: 0;
}

/* Panel consistency */
.content-panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.panel-header {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.panel-body {
  padding: 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .lg\:col-span-2 {
    grid-column: span 1;
  }
  
  .lg\:col-span-1 {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .gap-3 {
    gap: 0.5rem;
  }
  
  .p-3 {
    padding: 0.5rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }

  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

/* Mobile sidebar overlay */
@media (max-width: 1023px) {
  .mobile-sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }
  
  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 320px;
    background: white;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
  
  .mobile-sidebar.open {
    transform: translateX(0);
  }
 }


/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Image upload area */
.image-upload-area {
  transition: all 0.2s ease-in-out;
}

.image-upload-area:hover {
  background-color: #f9fafb;
}

/* Tag input improvements */
.tag-input-container {
  min-height: 2rem;
  max-height: 6rem;
  overflow-y: auto;
}

/* Quick action buttons */
.quick-action-btn {
  transition: all 0.2s ease-in-out;
}

.quick-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Content type cards */
.content-type-card {
  transition: all 0.2s ease-in-out;
}

.content-type-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-type-card.selected {
  box-shadow: 0 0 0 2px #3b82f6;
}

/* Builder call-to-action */
.builder-cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  color: white;
}

.builder-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Loading states */
.loading-skeleton {
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

/* Error states */
.field-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2);
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Success states */
.field-success {
  border-color: #10b981;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
}

.success-message {
  color: #10b981;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
</style>

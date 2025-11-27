<script>
import storageManager from '@/plugins/storage';
import Loader       from '@/interface/template/Loader.vue';
import Pagination from '@/utils/Paginated.vue';
import convertUtils from "@/plugins/convertUtils";
import ShortText from '@/utils/ShortText.vue';
import Address from '@/utils/Address.vue';
import DataSet from '@/utils/DataSetTable.vue';
import DataTable from '@/utils/DataTableRender.vue';

export default {
    props: {
        form: String,
        course:String,
        activeFormStatus: Object,
        returnFormStatus: Object,
        parent: Object,
    },
    data() {
      const session = storageManager.get('session')
      return {
        dataItem: this.form,
        dataSub: this.course,
        dataStatus: this.$route.params.status,
        school: session.current.id,
        login:session.login,
        postData: [],
        listItems: [],
        categoryData:[],
        formDataArray:[],
        loading_sources: true,
        endpoint: "",
        master:session.master,
        accessToken: storageManager.get('session','token'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        limitItem:50,
        limitOptions: [1,5,10, 50, 100, 200, 500,600,700,800,1000, 2000, 3000], // Define the available options
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,

        allListItems: [],
        totalItemsFetched: 0, // To keep track of the number of items fetched
        isLoading: false, // To track loading state
        chunkSize: 100, // Size of each data chunk
        progress: 0, // Progress percentage

        loading: false,
        showingOverlay: false,
        searchQuery: "",
        statusFilter:"all",
        isCreatingUser: false,
        isShowingOverlay: false,
        loadingMessage: '',
        processingCount: '',
        debounceTimer: null,
        activeBlock: false,
        selectedStatus: '',
        lightboxVisible: false,
        selectedImage: '',
        selectedItems: [],
        headerGroup: [],
        headLimit: 10,
        showHeaderPanel: false,
        selectedData: [],
        expandedItemIndex: null,
        statusArray:[],
        totalProcessed: 0,
        successfullyProcessed: 0,

        // Performance & Progressive Loading Options  
        lazy: true,
        initialDisplayCount: 30,
        loadMoreCount: 20,
        currentDisplayCount: 30,
        isLoadingMore: false,
        scrollCleanup: null,
      }
    },
    components: {
      Loader,
      Pagination,
      ShortText,
      Address,
      DataSet,
      DataTable
    },
    created() {
      this.selectedItems = this.formDataArray.map((item) => this.headerGroup.includes(item));
    },
    methods: {
      linkUser(target) {
        this.$router.push('/student/detail/' + target);
      },
      async prevItem() {
          if (this.returnFormStatus && this.returnFormStatus.prev) {
              await this.batchProcess(this.returnFormStatus.prev);
              console.log(this.returnFormStatus.prev);
          } else {
              console.log("No previous item to process.");
          }
      },
      async nextItem() {
          if (this.returnFormStatus && this.returnFormStatus.next) {
              await this.batchProcess(this.returnFormStatus.next);
              console.log(this.returnFormStatus.next);
          } else {
              console.log("No next item to process.");
          }
      },
      async assignItem(status) {
        await this.batchAssignProcess(status);
      },
      deleteItem() {
          // Action for "Delete"
          // Your delete logic here...
      },
      async batchProcess(status) {
      if (this.selectedData.length > 0) {
        this.successfullyProcessed = 0
        this.totalProcessed = this.selectedData.length;
        for (const itemId of this.selectedData) {
          const item = { _id: itemId };
          await this.singleProcess(item, status);
          //await this.enrollCourse(item);
        }
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          icon: 'success',
          title: 'อัพเดตสถานะเรียบร้อยแล้ว',
          text: 'อัพเดตสถานะของข้อมูลทั้งหมดสำเร็จแล้ว',
        });
        this.$emit('update-viewer', { update: true, status: status });
        this.selectedData = [];
        this.getData();
      } else {
        console.log("No data selected.");
      }
    },
    async batchAssignProcess(status) {
      if (this.selectedData.length > 0) {
        this.successfullyProcessed = 0
        this.totalProcessed = this.selectedData.length;
        for (const itemId of this.selectedData) {
          const item = { _id: itemId };
          //await this.singleProcess(item, status);
          await this.enrollCourse(item, status);
        }
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          icon: 'success',
          title: 'อัพเดตสถานะเรียบร้อยแล้ว',
          text: 'อัพเดตสถานะของข้อมูลทั้งหมดสำเร็จแล้ว',
        });
        this.$emit('update-viewer', { update: true, status: status });
        this.selectedData = [];
        this.getData();
      } else {
        console.log("No data selected.");
      }
    },
    async singleProcess(item, selectedValue) {
      try {
        this.activeBlock = true;
        const requestBody = {
          data: {
            process: selectedValue,
          },
          options: {}
        };

        const { data, status } = await this.$Request.PUT(`${this.postData.destination}/${item._id}`, requestBody, this.configs.key);

        console.log(data);

        if (status === 200) {
          this.activeBlock = false;
          this.successfullyProcessed++;
        }
      } catch (error) {
        console.log(error);
      }
    },
    async enrollCourse(item, selectedValue) {
      try {
        this.activeBlock = true;
        console.log("Processing form submission:", item);

        // 1. Get form data
        const { data: form } = await this.$Request.GET(`${this.postData.destination}/${item._id}`, this.configs.key);
        
        if (!form || !form.userID || !form.courseID) {
          throw new Error("Invalid form data - missing required fields");
        }

        // 2. Check existing enrollment
        const requestData = {
          method: 'find', 
          args: [{ 
            $and: [
              { userID: form.userID },
              { courseID: form.courseID },
              { unit: form.parent }
            ]
          }],
        };

        const { data: enrollmentData, status: enrollmentStatus } = await this.$Request.POST(`enroll/query`, requestData, this.configs.key);
        console.log("Enrollment check result:", enrollmentData);

        if (enrollmentStatus === 200) {
          // Only proceed if no existing enrollment
          if (!enrollmentData || enrollmentData.length === 0) {
            // 3. Create new enrollment
            const requestBody = {
              data: {
                userID: form.userID,
                courseID: form.courseID,
                formID: form._id,
                unit: form.parent,
              },
              options: {}
            };

            const { data: enrollmentResponse, status: enrollmentResponseStatus } = await this.$Request.POST(`enroll`, requestBody, this.configs.key);
            
            if (enrollmentResponseStatus !== 200 || !enrollmentResponse) {
              throw new Error("Failed to create enrollment");
            }

            // 4. Update form status
            const requestBody2 = {
              data: {
                process: selectedValue,
                enrollID: enrollmentResponse._id,
                status: true
              },
              options: {}
            };

            const { status: updateStatus } = await this.$Request.PUT(`${this.postData.destination}/${item._id}`, requestBody2, this.configs.key);
            
            if (updateStatus === 200) {
              this.$swal({
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'ลงทะเบียนสำเร็จ',
                text: 'ลงทะเบียนและอัพเดทสถานะเรียบร้อยแล้ว',
              });
            }
          } else {
            console.log("User already enrolled in this course");
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'warning',
              title: 'มีการลงทะเบียนแล้ว',
              text: 'ผู้ใช้นี้ได้ลงทะเบียนในหลักสูตรนี้แล้ว',
            });
          }
        }
      } catch (error) {
        console.error("Error in enrollCourse:", error);
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง',
        });
      } finally {
        this.activeBlock = false;
      }
    },
    formatKeyToTitle(key) {
        // Implement your logic here to transform the key into a readable title
        // This is a simple example that replaces underscores with spaces and capitalizes the first letter
        return key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
      },
      getSummaryField(item, fieldIndex) {
        // Convert object properties to an array and get the value of the field by index
        const values = Object.values(item);
        return values[fieldIndex].name + " : " + values[fieldIndex].value ? values[fieldIndex].name + " : " + values[fieldIndex].value : '';
      },
      toggleDetail(index) {
        // Toggle logic: if the clicked item is already expanded, collapse it, otherwise expand it and collapse others
        this.expandedItemIndex = this.expandedItemIndex === index ? null : index;
      },
      logSelectedData() {
        if (this.selectedData.length > 0) {
          console.log(this.selectedData);
        } else {
          console.log("No data selected.");
        }
      },
      toggleSelectAll(event) {
        const isChecked = event.target.checked;
        if (isChecked) {
          this.selectedData = this.listItems.map(item => item._id);
        } else {
          this.selectedData = [];
        }
      },
      toggleHeaderPanel() {
        this.showHeaderPanel = !this.showHeaderPanel;
      },
      moveItemLeft(index) {
        if (index > 0) {
          const itemToMove = this.headerGroup.splice(index, 1)[0];
          this.headerGroup.splice(index - 1, 0, itemToMove);
          //
          const itemToMove2 = this.formDataArray.splice(index, 1)[0];
          this.formDataArray.splice(index - 1, 0, itemToMove2);
        }
      },
      moveItemRight(index) {
        if (index < this.headerGroup.length - 1) {
          const itemToMove = this.headerGroup.splice(index, 1)[0];
          this.headerGroup.splice(index + 1, 0, itemToMove);
          //
          const itemToMove2 = this.formDataArray.splice(index, 1)[0];
          this.formDataArray.splice(index + 1, 0, itemToMove2);
        }
      },
      addToHeaderGroup() {
          this.headerGroup = [];
          let addedItems = 0;
          for (let i = 0; i < this.selectedItems.length && addedItems < this.headLimit; i++) {
              if (this.selectedItems[i]) {
                this.headerGroup.push(this.formDataArray[i]);
                addedItems++;
              }
          }
      },
      updateHeaderGroup(index) {
        if (this.selectedItems[index]) {
          if (!this.headerGroup.includes(this.formDataArray[index])) {
            this.headerGroup.push(this.formDataArray[index]);
          }
        } else {
          const itemToRemove = this.formDataArray[index];
          const itemIndex = this.headerGroup.indexOf(itemToRemove);
          if (itemIndex !== -1) {
            this.headerGroup.splice(itemIndex, 1);
          }
        }
      },
      shouldDisableCheckbox(index) {
          return !this.selectedItems[index] && this.headerGroup.length >= this.headLimit;
      },
      hasSetDataKey(formData) {
        return 'setData' in formData;
      },
      showLightbox(imageUrl) {
        this.lightboxVisible = true;
        this.selectedImage = imageUrl;
      },
      closeLightbox() {
        this.lightboxVisible = false;
        this.selectedImage = '';
      },
      async updateData(item, selectedValue) {
        try {
          this.activeBlock = true;

          const requestBody = {
            data: {
              status: selectedValue,
            },
            options: {}
          };

          const { data, status } = await this.$Request.PUT(`${this.postData.destination}/${item._id}`, requestBody, this.configs.key);

          console.log(data);

          if (status === 200) {
            this.activeBlock = false;
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'อัพเดตสถานะเรียบร้อยแล้ว',
              text: 'อัพเดตสถานะของข้อมูลนี้ สำเร็จแล้ว',
            });
          }
        } catch (error) {
          console.log(error);
        }
      },
      exportToCSV() {
        const dataToExport = this.listItems.map((item, index) => {
          const rowData = {
            "#": (this.currentPage - 1) * this.limitItem + index + 1,
            ...item.formData,
            "หลักสูตร": item.course.name,
            "วันที่ส่งข้อมูล": this.formatThaidate(item.createdAt),
            "สถานะ": item.status,
            "สอบก่อนเรียน": item.enroll?.analytics?.pre?.score ?? "No Data",
            "สอบหลังเรียน": item.enroll?.analytics?.post?.score ?? "No Data",
            "สอบซ่อม": item.enroll?.analytics?.retest?.score ?? "No Data",
          };

          Object.keys(rowData).forEach((key) => {
            if (Array.isArray(rowData[key])) {
              if (rowData[key].length === 1 && rowData[key][0].type === "address") {
                // Convert address to a single multiline string
                const address = rowData[key][0].value;
                rowData[key] = this.getAddressString(address);
              } else {
                rowData[key] = rowData[key].map((value) => {
                  if (typeof value.value === "object") {
                    return JSON.stringify(value.value);
                  } else {
                    return value.value;
                  }
                }).join(", ");
              }
            } else if (typeof rowData[key] === "object" && rowData[key].type === "address") {
              // Convert address value to string
              rowData[key] = this.getAddressString(rowData[key].value);
            } else if (typeof rowData[key] === "object") {
              rowData[key] = JSON.stringify(rowData[key].value);
            }
          });
          return rowData;
        });

        let csvContent = "";
        const headers = Object.keys(dataToExport[0]);
        csvContent += headers.join("\t") + "\n";
        dataToExport.forEach((item) => {
          const row = headers.map((header) => {
            if (header in item) {
              return item[header];
            } else {
              return "";
            }
          });
          csvContent += row.join("\t") + "\n";
        });
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute(
          "download",
          this.postData.title + "_exportdata_" + this.postData._id + ".csv"
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      getAddressString(address) {
        const { MOO, NO, BUILDING_TH, ROAD_TH, subdistrict, district, province, zipcode } = address;
        return `หมู่ที่ ${MOO}, เลขที่ ${NO}, อาคาร/หมู่บ้าน/สำนักงาน ${BUILDING_TH}, ถนน ${ROAD_TH}, ตำบล ${subdistrict}, อำเภอ ${district}, จังหวัด ${province}, รหัสไปรษณีย์ ${zipcode}`;
      },
      navigateToItem(item) {
          const route = `/application/apply/${this.postData._id}/${item.slug}`;
          this.$router.push(route);
      },
      formatThaidate(date) {
        return convertUtils.toThaiDatetime(date,"short");
      },
      handleLimitChange() {
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
        console.log("getdata","handleLimitChange");
        this.getData();
      },
      handlePageChanged(page) {
        if (page !== this.currentPage) {
            window.scrollTo(0, 0);
            this.currentPage = page;
            const session = storageManager.get('session');
            session.currentPage = this.currentPage;
            storageManager.set('session', session);
            console.log("getdata","handlePageChanged");
            this.getData();
        }
        },
        clearSearchQuery() {
            this.searchQuery = '';
            const session = storageManager.get('session');
            session.searchQuery = '';
            storageManager.set('session', session);
            console.log("getdata","clearSearchQuery");
            this.getData();
        },
        async getCourse() {
          try {
            const { data, status } = await this.$Request.GET(`post/${this.dataItem}`, this.configs.key);
            if(status === 200) {
              this.postData = data;
              console.log(data);
            }
          } catch (error) {
            console.error(error);
          }
        },
        resetData() {
          this.allListItems = [];
          this.totalItemsFetched = 0;
          this.isLoading = false;
          this.chunkSize = 100;
          this.progress = 0;
          console.log(`🔄 FormSubmit data reset completed`);
        },
        async loadAllData() {
          try {
            this.isLoading = true;
            this.allListItems = []; // Clear previous data
            this.totalItemsFetched = 0;
            let currentSkip = 0;
            let hasMoreData = true;

            console.log(`🚀 Starting Load All Data process...`);

            // First, get total count
            const countConditions = [];
            if (this.activeFormStatus && this.activeFormStatus.code) {
              countConditions.push({ formID: this.dataItem, process: this.activeFormStatus.code });
            }
            if (this.dataSub) {
              countConditions.push({ courseID: this.dataSub });
            }
            if (this.statusFilter !== 'all') {
              countConditions.push({ status: this.statusFilter });
            }

            const countPipeline = [
              { $match: { $and: countConditions } },
              { $count: "total" }
            ];

            const { data: countData } = await this.$Request.POST(`${this.postData.destination}/aggregate`, { pipeline: countPipeline }, this.configs.key);
            const totalCount = countData?.[0]?.total || 0;
            this.totalItems = totalCount;

            console.log(`📊 Total items to load: ${totalCount}`);

            while (hasMoreData && this.totalItemsFetched < totalCount) {
              const andConditions = [];

              if (this.activeFormStatus && this.activeFormStatus.code) {
                andConditions.push({ formID: this.dataItem, process: this.activeFormStatus.code });
              }

              if (this.dataSub) {
                andConditions.push({ courseID: this.dataSub });
              }

              if (this.statusFilter !== 'all') {
                andConditions.push({ status: this.statusFilter });
              }

              const pipeline = [
                {
                  $match: {
                    $and: andConditions,
                  },
                },
                {
                  $set: {
                    courseID: { $toObjectId: "$courseID" },
                    enrollID: { $toObjectId: "$enrollID" },
                    orderID: { $toObjectId: "$orderID" }
                  },
                },
                {
                  $lookup: {
                    from: 'course',
                    localField: 'courseID',
                    foreignField: '_id',
                    as: 'course',
                    pipeline: [{ $project: { name: 1, certificationId: 1 } }]
                  }
                },
                {
                  $lookup: {
                    from: 'order',
                    let: { 
                      courseID: "$courseID",
                      userID: "$userID",
                      orderID: "$orderID"
                    },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $or: [
                              {
                                $and: [
                                  { $eq: ["$courseID", "$$courseID"] },
                                  { $eq: ["$userID", "$$userID"] }
                                ]
                              },
                              { $eq: ["$_id", { $toObjectId: "$$orderID" }] }
                            ]
                          }
                        }
                      },
                      {
                        $project: {
                          orderCode: 1,
                          rawCode: 1,
                          payment: 1,
                          status: 1,
                          process: 1,
                          type: 1,
                          approve: 1,
                          createdAt: 1,
                          updatedAt: 1,
                          ref1: 1,
                          ref2: 1,
                          detailData: {
                            div_code: 1,
                            sub_section_items: 1,
                            bank_account: 1,
                            transfered_date: 1,
                            transfered_amount: 1,
                            bankAccount: 1,
                            tranNo: 1,
                            transfered_ref1: 1,
                            transfered_ref2: 1,
                            tax_id: 1,
                            branch_id: 1,
                            customer_name: 1,
                            address_1: 1,
                            address_2: 1,
                            city_name: 1,
                            province_name: 1,
                            post_code: 1,
                            receipt_date: 1
                          },
                          mappedData: {
                            courseID: 1,
                            invoice: 1,
                            ref2: 1,
                            taxid_company: 1,
                            taxid_people: 1,
                            branchID: 1,
                            companyName: 1
                          }
                        }
                      }
                    ],
                    as: 'order'
                  }
                },
                {
                  $unwind: {
                    path: "$order",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $unwind: { 
                    path: "$course", 
                    preserveNullAndEmptyArrays: true 
                  }
                },
                {
                  $set: {
                    certID: { $toObjectId: "$course.certificationId" }
                  }
                },
                {
                  $lookup: {
                    from: "certification_template",
                    localField: "certID",
                    foreignField: "_id",
                    as: "certification_template"
                  }
                },
                {
                  $unwind: {
                    path: "$certification_template",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $lookup: {
                    from: "enroll",
                    let: {
                      rootUserId: "$$ROOT.userID",
                      rootCourseId: { $toString: "$$ROOT.courseID" }
                    },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ["$userID", "$$rootUserId"] },
                              { $eq: ["$courseID", "$$rootCourseId"] }
                            ]
                          }
                        }
                      },
                      { 
                        $project: { 
                          analytics: 1 
                        } 
                      }
                    ],
                    as: "enroll"
                  }
                },
                {
                  $unwind: { 
                    path: "$enroll", 
                    preserveNullAndEmptyArrays: true 
                  }
                },
                {
                  $skip: currentSkip
                },
                {
                  $limit: this.chunkSize
                },
                {
                  $project: {
                    formData: 1,
                    courseID: 1,
                    userID: 1,
                    status: 1,
                    createdAt: 1,
                    process: 1,
                    'course.name': 1,
                    'course.certificationId': 1,
                    'enroll.analytics': 1,
                    'order.detailData': 1,
                    'order.orderCode': 1,
                    'order.rawCode': 1,
                    'order.payment': 1,
                    'order.status': 1,
                    'order.process': 1,
                    'order.type': 1,
                    'order.approve': 1,
                    'order.createdAt': 1,
                    'order.updatedAt': 1,
                    'order.ref1': 1,
                    'order.ref2': 1,
                    _id: 1
                  }
                }
              ];

              const requestBody = {
                pipeline: pipeline,
              };

              console.log(`📦 Loading chunk: ${currentSkip} to ${currentSkip + this.chunkSize}`);

              const { data, status } = await this.$Request.POST(`${this.postData.destination}/aggregate`, requestBody, this.configs.key);

              if (status === 200 && data && data.length > 0) {
                // Process additional fields for each item
                const processedData = data.map(item => {
                  if (item.order && item.order.detailData && Array.isArray(item.order.detailData)) {
                    item.additionalFields = {
                      'Certification Code': item.course?.certificationId || '',
                      'INV_NO': item.order.orderCode || '',
                      'SUB_SECTION_AMOUNT': item.order.detailData.reduce((total, detail) => total + (detail.price || 0), 0),
                      'TAX_ID': item.formData?.taxpayer_identification_number?.value || item.formData?.setData?.taxpayer_identification_number || '',
                      'TRANSFER_DATE': item.order.payment?.transferDate || item.order.updatedAt || '',
                      'TRANSFER_REF1': item.order.ref1 || '',
                      'TRANSFER_REF2': item.order.ref2 || '',
                      'URL': `${window.location.origin}/course/detail/${item.courseID}`
                    };
                  } else {
                    item.additionalFields = {
                      'Certification Code': item.course?.certificationId || '',
                      'INV_NO': item.order?.orderCode || '',
                      'SUB_SECTION_AMOUNT': 0,
                      'TAX_ID': item.formData?.taxpayer_identification_number?.value || item.formData?.setData?.taxpayer_identification_number || '',
                      'TRANSFER_DATE': item.order?.payment?.transferDate || item.order?.updatedAt || '',
                      'TRANSFER_REF1': item.order?.ref1 || '',
                      'TRANSFER_REF2': item.order?.ref2 || '',
                      'URL': `${window.location.origin}/course/detail/${item.courseID}`
                    };
                  }
                  return item;
                });

                this.allListItems.push(...processedData);
                this.totalItemsFetched += data.length;

                // Setup formDataArray from first item
                if (this.allListItems.length > 0 && this.formDataArray.length === 0) {
                  const formDataNames = Object.keys(this.allListItems[0].formData).map(
                    (key) => this.allListItems[0].formData[key].name
                  );

                  const setData = this.allListItems[0].formData.setData;
                  let setDataKeys = [];
                  if (setData) {
                    setDataKeys = Object.keys(setData);
                  }

                  this.formDataArray = [...formDataNames, ...setDataKeys];

                  if (this.headerGroup.length === 0) {
                    this.headerGroup = this.formDataArray.slice(0, 10);
                  }
                }

                this.progress = Math.min((this.totalItemsFetched / totalCount) * 100, 100).toFixed(2);
                
                console.log(`✅ Loaded ${data.length} items. Total: ${this.totalItemsFetched}/${totalCount} (${this.progress}%)`);

                // Check if we should continue
                if (data.length < this.chunkSize || this.totalItemsFetched >= totalCount) {
                  hasMoreData = false;
                } else {
                  currentSkip += this.chunkSize;
                }
              } else {
                console.error('Error fetching data chunk:', status);
                hasMoreData = false;
              }

              // Add small delay to prevent overwhelming the server
              await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log(`🎉 Load All Data completed! Total items: ${this.allListItems.length}`);
            this.isLoading = false;
          } catch (error) {
            console.error('Error in loadAllData:', error);
            this.isLoading = false;
          }
        },
        async getData() {
          const startTime = performance.now();
          console.log(`⏱️ FormSubmit getData started - Page: ${this.currentPage}, Limit: ${this.limitItem}`);

          try {
            if (this.login) {
              this.loading = true;
              this.activeBlock = true;

              const andConditions = [];

              // Add formID condition only if this.activeFormStatus.code is defined
              if (this.activeFormStatus && this.activeFormStatus.code) {
                  andConditions.push({ formID: this.dataItem, process: this.activeFormStatus.code });
              }

              if (this.dataSub) {
                  andConditions.push({ courseID: this.dataSub });
              }

              if (this.statusFilter !== 'all') {
                  andConditions.push({ status: this.statusFilter });
              }

              // 🔍 SEARCH FUNCTIONALITY
              if (this.searchQuery && this.searchQuery.trim() !== '') {
                const searchTerm = this.searchQuery.trim();
                console.log(`🔍 FormSubmit adding search condition for: "${searchTerm}"`);
                
                const searchConditions = [
                  { userID: { $regex: searchTerm, $options: 'i' } },
                  { process: { $regex: searchTerm, $options: 'i' } },
                  { status: { $regex: searchTerm, $options: 'i' } },
                  { "formData.input-1-1-3.value": { $regex: searchTerm, $options: 'i' } }, // ชื่อจริง
                  { "formData.input-2-2-3.value": { $regex: searchTerm, $options: 'i' } }, // นามสกุล
                  { "formData.input-9-1-5.value": { $regex: searchTerm, $options: 'i' } }, // เบอร์โทร
                  { "formData.input-10-2-5.value": { $regex: searchTerm, $options: 'i' } }, // อีเมล
                  { "formData.input-6-0-5.value": { $regex: searchTerm, $options: 'i' } }, // เลขบัตรประชาชน
                  { "formData.input-18-1-11.value": { $regex: searchTerm, $options: 'i' } }, // หมายเลขประจำตัวผู้เสียภาษี
                  { "formData.input-20-2-11.value": { $regex: searchTerm, $options: 'i' } }, // ชื่อนิติบุคคล
                ];
                
                andConditions.push({ $or: searchConditions });
              }

              const matchStage = { $and: andConditions };

              // 🚀 OPTIMIZATION 1: แยก Count Query
              let totalCount = 0;
              if (this.currentPage === 1 || (this.searchQuery && this.searchQuery.trim() !== '')) {
                const countStartTime = performance.now();
                console.log(`🔢 FormSubmit counting total items...`);
                
                let countPipeline = [{ $match: matchStage }];
                
                if (this.searchQuery && this.searchQuery.trim() !== '') {
                  const searchTerm = this.searchQuery.trim();
                  countPipeline = [
                    { $match: matchStage },
                    {
                      $addFields: { 
                        courseID_obj: { $toObjectId: "$courseID" }
                      }
                    },
                    {
                      $lookup: {
                        from: 'course',
                        localField: 'courseID_obj',
                        foreignField: '_id',
                        as: 'course',
                        pipeline: [{ $project: { name: 1 } }]
                      }
                    },
                    { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
                    {
                      $match: {
                        $or: [
                          { "course.name": { $regex: searchTerm, $options: 'i' } },
                          { userID: { $regex: searchTerm, $options: 'i' } },
                          { process: { $regex: searchTerm, $options: 'i' } },
                          { "formData.input-1-1-3.value": { $regex: searchTerm, $options: 'i' } },
                          { "formData.input-2-2-3.value": { $regex: searchTerm, $options: 'i' } },
                          { "formData.input-9-1-5.value": { $regex: searchTerm, $options: 'i' } },
                          { "formData.input-10-2-5.value": { $regex: searchTerm, $options: 'i' } },
                          { "formData.input-6-0-5.value": { $regex: searchTerm, $options: 'i' } },
                          { "formData.input-18-1-11.value": { $regex: searchTerm, $options: 'i' } },
                          { "formData.input-20-2-11.value": { $regex: searchTerm, $options: 'i' } },
                        ]
                      }
                    },
                    { $count: 'total' }
                  ];
                } else {
                  countPipeline.push({ $count: 'total' });
                }
                
                const countResult = await this.$Request.POST(`${this.postData.destination}/aggregate`, { pipeline: countPipeline }, this.configs.key);
                
                totalCount = countResult.data?.[0]?.total || 0;
                const countTime = (performance.now() - countStartTime).toFixed(2);
                console.log(`✅ FormSubmit count completed - Total: ${totalCount} items in ${countTime}ms`);
              } else {
                totalCount = this.totalItems;
              }

              // 🚀 OPTIMIZATION 2: Data Pipeline
              const pipeline = [
                {
                  $match: matchStage,
                },
                {
                  $set: {
                    courseID: { $toObjectId: "$courseID" },
                    enrollID: { $toObjectId: "$enrollID" },
                    orderID: { $toObjectId: "$orderID" }
                  },
                },
                {
                  $lookup: {
                    from: 'course',
                    localField: 'courseID',
                    foreignField: '_id',
                    as: 'course',
                    pipeline: [{ $project: { name: 1, certificationId: 1 } }]
                  }
                },
                {
                  $lookup: {
                    from: 'order',
                    let: { 
                      courseID: "$courseID",
                      userID: "$userID",
                      orderID: "$orderID"
                    },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $or: [
                              {
                                $and: [
                                  { $eq: ["$courseID", "$$courseID"] },
                                  { $eq: ["$userID", "$$userID"] }
                                ]
                              },
                              { $eq: ["$_id", { $toObjectId: "$$orderID" }] }
                            ]
                          }
                        }
                      },
                      {
                        $project: {
                          orderCode: 1,
                          rawCode: 1,
                          payment: 1,
                          status: 1,
                          process: 1,
                          type: 1,
                          approve: 1,
                          createdAt: 1,
                          updatedAt: 1,
                          ref1: 1,
                          ref2: 1,
                          detailData: {
                            div_code: 1,
                            sub_section_items: 1,
                            bank_account: 1,
                            transfered_date: 1,
                            transfered_amount: 1,
                            bankAccount: 1,
                            tranNo: 1,
                            transfered_ref1: 1,
                            transfered_ref2: 1,
                            tax_id: 1,
                            branch_id: 1,
                            customer_name: 1,
                            address_1: 1,
                            address_2: 1,
                            city_name: 1,
                            province_name: 1,
                            post_code: 1,
                            receipt_date: 1
                          },
                          mappedData: {
                            courseID: 1,
                            invoice: 1,
                            ref2: 1,
                            taxid_company: 1,
                            taxid_people: 1,
                            branchID: 1,
                            companyName: 1
                          }
                        }
                      }
                    ],
                    as: 'order'
                  }
                },
                {
                  $unwind: {
                    path: "$order",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $unwind: { 
                    path: "$course", 
                    preserveNullAndEmptyArrays: true 
                  }
                },
                {
                  $set: {
                    certID: { $toObjectId: "$course.certificationId" }
                  }
                },
                {
                  $lookup: {
                    from: "certification_template",
                    localField: "certID",
                    foreignField: "_id",
                    as: "certification_template"
                  }
                },
                {
                  $unwind: {
                    path: "$certification_template",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $lookup: {
                    from: "enroll",
                    let: {
                      rootUserId: "$$ROOT.userID",
                      rootCourseId: { $toString: "$$ROOT.courseID" }
                    },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ["$userID", "$$rootUserId"] },
                              { $eq: ["$courseID", "$$rootCourseId"] }
                            ]
                          }
                        }
                      },
                      { 
                        $project: { 
                          analytics: 1 
                        } 
                      }
                    ],
                    as: "enroll"
                  }
                },
                {
                  $unwind: { 
                    path: "$enroll", 
                    preserveNullAndEmptyArrays: true 
                  }
                },
                {
                  $skip: (this.currentPage - 1) * this.limitItem
                },
                {
                  $limit: this.limitItem
                },
                {
                  $project: {
                    formData: 1,
                    courseID: 1,
                    userID: 1,
                    status: 1,
                    createdAt: 1,
                    process: 1,
                    'course.name': 1,
                    'course.certificationId': 1,
                    'enroll.analytics': 1,
                    'order.detailData': 1,
                    'order.orderCode': 1,
                    'order.rawCode': 1,
                    'order.payment': 1,
                    'order.status': 1,
                    'order.process': 1,
                    'order.type': 1,
                    'order.approve': 1,
                    'order.createdAt': 1,
                    'order.updatedAt': 1,
                    'order.ref1': 1,
                    'order.ref2': 1,
                    _id: 1
                  }
                }
              ];

              const mongoStartTime = performance.now();
              console.log(`🔍 FormSubmit optimized MongoDB query started - Pipeline stages: ${pipeline.length}`);

              const { data, status } = await this.$Request.POST(`${this.postData.destination}/aggregate`, { pipeline: pipeline }, this.configs.key);

              const mongoEndTime = performance.now();
              const mongoTime = (mongoEndTime - mongoStartTime).toFixed(2);
              console.log(`📊 FormSubmit MongoDB query completed - Time: ${mongoTime}ms, Records: ${data?.length || 0}`);

              if (status === 200) {
                if (data && data.length > 0) {
                  const transformStartTime = performance.now();
                  console.log(`🔄 FormSubmit data transformation started`);

                  const formattedData = {
                    data: data,
                    total: totalCount,
                    paging: {
                      page: this.currentPage,
                      limit: this.limitItem,
                      totalPages: Math.ceil(totalCount / this.limitItem),
                    },
                  };

                  // ✨ เพิ่มการประมวลผลข้อมูลเพิ่มเติมสำหรับฟิลด์พิเศษ
                  const processedData = formattedData.data.map(item => {
                    const processedItem = { ...item };
                    
                    // เพิ่มฟิลด์พิเศษที่ DataTableRender ต้องการ
                    if (item.order && typeof item.order === 'object') {
                      // สร้าง object ที่มีข้อมูลเพิ่มเติมสำหรับ export
                      processedItem.additionalFields = {
                        'TAX_ID': item.order?.detailData?.tax_id || '',
                        'TRANSFER_DATE': item.order?.detailData?.transfered_date || '',
                        'TRANSFER_REF2': item.order?.detailData?.transfered_ref2 || '',
                        'TRANSFER_REF1': item.order?.detailData?.transfered_ref1 || '',
                        'SUB_SECTION_AMOUNT': item.order?.detailData?.transfered_amount || '',
                        'INV_NO': item.order?.detailData?.tranNo || '',
                        'สถานะ': item.process || '',
                        'ความคืบหน้า': (item.enroll?.analytics?.complete || 0) + "/" + (item.enroll?.analytics?.total || 0),
                        'สอบก่อนเรียน': item.enroll?.analytics?.pre?.score || 0,
                        'สอบหลังเรียน': item.enroll?.analytics?.post?.score || 0,
                        'สอบซ่อม': item.enroll?.analytics?.retest?.score || 0,
                      };
                      
                      // คำนวณผลการสอบ
                      const analytics = item.enroll?.analytics;
                      let postScore = parseInt(analytics?.post?.score || 0);
                      let retestScore = parseInt(analytics?.retest?.score || 0);
                      let measure = parseInt(analytics?.post?.measure || 33);

                      if (postScore >= measure) {
                        processedItem.additionalFields['ผล'] = "ผ่าน";
                      } else if (retestScore < measure) {
                        processedItem.additionalFields['ผล'] = "ไม่ผ่าน";
                      } else {
                        processedItem.additionalFields['ผล'] = "ผ่าน";
                      }

                      // จัดการข้อมูลรอบสอบ
                      const examRoundValue = item.formData?.["radiobox-14-0-9"]?.value?.value;
                      if (examRoundValue === 'round-1') {
                        processedItem.additionalFields['รอบสอบ'] = 'รอบ 1';
                      } else if (examRoundValue === 'round-2') {
                        processedItem.additionalFields['รอบสอบ'] = 'รอบ 2';
                      } else {
                        processedItem.additionalFields['รอบสอบ'] = examRoundValue || 'ไม่ได้เลือก';
                      }

                      // จัดการวันที่ใบรับรอง
                      let certCreateDate = '';
                      let certExpireDate = '';
                      const examRound = item.formData?.["radiobox-14-0-9"]?.value?.value;
                      if (examRound === 'round-1') {
                        certCreateDate = '4 เดือน กันยายน พ.ศ. 2567';
                        certExpireDate = '3 เดือน กันยายน พ.ศ. 2572';
                      } else if (examRound === 'round-2') {
                        certCreateDate = '7 เดือน กันยายน พ.ศ. 2567';
                        certExpireDate = '6 เดือน กันยายน พ.ศ. 2572';
                      }

                      // จัดการข้อมูลใบรับรอง
                      if (processedItem.additionalFields['ผล'] === "ผ่าน") {
                        processedItem.additionalFields['วันที่ออกใบรับรอง'] = certCreateDate;
                        processedItem.additionalFields['วันหมดอายุ'] = certExpireDate;
                        processedItem.additionalFields['URL'] = `https://doa.fti.or.th/lesson/certification/${item.courseID}/${item.userID}`;
                        processedItem.additionalFields['Certification Code'] = item.userID;
                        processedItem.additionalFields['Certification ID'] = `68/1/${item.formData?.["input-6-0-5"]?.value || ''}`;
                      } else {
                        processedItem.additionalFields['วันที่ออกใบรับรอง'] = '';
                        processedItem.additionalFields['วันหมดอายุ'] = '';
                        processedItem.additionalFields['URL'] = '';
                        processedItem.additionalFields['Certification Code'] = '';
                        processedItem.additionalFields['Certification ID'] = '';
                      }
                    }
                    
                    return processedItem;
                  });

                  this.listItems = processedData;
                  this.totalItems = formattedData.total;
                  this.totalPages = formattedData.paging.totalPages;

                  if (formattedData.data[0]?.formData) {
                    console.log("🔧 FormSubmit extracting form structure...");
                    
                    const formDataNames = Object.keys(formattedData.data[0].formData)
                      .map((key) => {
                        const formItem = formattedData.data[0].formData[key];
                        return formItem?.name || formItem || key;
                      })
                      .filter((name) => name && name !== 'setData');

                    const setData = formattedData.data[0].formData.setData;
                    let setDataKeys = [];
                    if (setData && typeof setData === 'object') {
                      setDataKeys = Object.keys(setData).filter(key => key);
                    }

                    this.formDataArray = [...formDataNames, ...setDataKeys];
                    
                    if (this.headerGroup.length === 0 && this.formDataArray.length > 0) {
                      this.headerGroup = this.formDataArray.slice(0, Math.min(10, this.formDataArray.length));
                    }
                    
                    if (this.selectedItems.length !== this.formDataArray.length) {
                      this.selectedItems = this.formDataArray.map((item) => this.headerGroup.includes(item));
                    }
                  }

                  const transformEndTime = performance.now();
                  const transformTime = (transformEndTime - transformStartTime).toFixed(2);
                  console.log(`✨ FormSubmit data transformation completed - Time: ${transformTime}ms`);

                  this.loading = false;
                  this.activeBlock = false;
                  this.resetData();

                  if (this.lazy) {
                    this.resetDisplayCount();
                  }

                  const endTime = performance.now();
                  const processingTime = (endTime - startTime).toFixed(2);
                  
                  console.log(`✅ FormSubmit getData completed - Total: ${processingTime}ms`);
                  console.log(`📈 Performance breakdown:`);
                  console.log(`  🗄️  MongoDB Processing: ${mongoTime}ms`);
                  console.log(`  🔄 Data Transformation: ${transformTime}ms`);
                  console.log(`  📊 Items: ${this.listItems.length}, Total Records: ${this.totalItems}`);

                } else {
                  this.listItems = [];
                  this.totalItems = 0;
                  this.totalPages = 0;
                  this.loading = false;
                  this.activeBlock = false;
                  console.log(`📭 No FormSubmit data found`);
                }
              } else {
                this.formDataArray = [];
                this.listItems = [];
                this.loading = false;
                this.activeBlock = false;
                
                const endTime = performance.now();
                const processingTime = (endTime - startTime).toFixed(2);
                console.log(`❌ FormSubmit getData failed - Time: ${processingTime}ms, Status: ${status}`);
              }
            }
          } catch (error) {
            console.error(error);
            this.loading = false;
            this.activeBlock = false;
            
            const endTime = performance.now();
            const processingTime = (endTime - startTime).toFixed(2);
            console.log(`❌ FormSubmit getData error - Time: ${processingTime}ms, Error:`, error);
          }
        },

        toggleStatus(status) {
            console.log("Toggle Status", status);
            this.statusFilter = status;
            this.getData();
        },

        // =============== Progressive/Lazy Loading Methods ===============
        setupScrollDetection() {
          if (!this.lazy) return;
          
          this.$nextTick(() => {
            console.log(`🔧 FormSubmit setting up scroll detection...`);
            
            // ⚡ ลองหา scroll container ใหม่แบบละเอียดขึ้น (สำหรับ debug เท่านั้น)
            const possibleContainers = [
              document.querySelector('body'),
              document.documentElement,
              window,
              this.$el?.closest('.overflow-y-auto'),
              this.$el?.closest('[data-simplebar]'),
              this.$el?.parentElement,
              document.querySelector('.main-content'),
              document.querySelector('#app')
            ];
            
            console.log(`🔍 FormSubmit testing scroll containers:`, possibleContainers.map(c => c?.tagName || c?.constructor?.name || 'null'));
            
            const handleScroll = () => {
              if (!this.hasMoreItems || this.isLoadingMore) {
                console.log(`⏸️ FormSubmit scroll ignored: hasMore=${this.hasMoreItems}, isLoading=${this.isLoadingMore}`);
                return;
              }
              
              let scrollPercent;
              let scrollInfo = {};
              
              // ⚡ ปรับให้ใช้ window เป็นหลัก
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
              const scrollHeight = Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight,
                document.documentElement.offsetHeight,
                document.documentElement.clientHeight
              );
              const clientHeight = window.innerHeight || document.documentElement.clientHeight;
              
              scrollPercent = (scrollTop + clientHeight) / scrollHeight;
              scrollInfo = { 
                scrollTop: Math.round(scrollTop), 
                scrollHeight: Math.round(scrollHeight), 
                clientHeight: Math.round(clientHeight), 
                container: 'window-improved'
              };
              
              // 🔍 Debug ทุกครั้งที่ scroll
              console.log(`🔍 FormSubmit scroll debug:`, {
                percent: (scrollPercent * 100).toFixed(1) + '%',
                hasMore: this.hasMoreItems,
                isLoading: this.isLoadingMore,
                currentDisplay: this.currentDisplayCount,
                totalItems: this.listItems.length,
                ...scrollInfo
              });
              
              // ⚡ ลด threshold จาก 50% เป็น 40% และเพิ่มเงื่อนไขสำรอง
              if (scrollPercent > 0.4 || scrollTop + clientHeight >= scrollHeight - 100) {
                console.log(`🚀 FormSubmit scroll TRIGGERED at ${(scrollPercent * 100).toFixed(1)}%`);
                this.loadMoreItems();
              }
            };
            
            // ⚡ ติดตั้ง listeners หลายแบบ
            const eventOptions = { passive: true, capture: false };
            
            window.addEventListener('scroll', handleScroll, eventOptions);
            document.addEventListener('scroll', handleScroll, eventOptions);
            document.body.addEventListener('scroll', handleScroll, eventOptions);
            window.addEventListener('wheel', handleScroll, eventOptions);
            window.addEventListener('touchmove', handleScroll, eventOptions);
            
            // ⚡ เพิ่ม resize listener
            const handleResize = () => {
              console.log(`📏 FormSubmit window resized, checking scroll...`);
              setTimeout(handleScroll, 100);
            };
            window.addEventListener('resize', handleResize, eventOptions);
            
            console.log(`✅ FormSubmit multiple scroll listeners installed`);
            
            // 🔄 ปรับ fallback timer ให้ไม่ aggressive เกินไป
            let fallbackAttempts = 0;
            const maxFallbackAttempts = 3;
            
            const autoLoadTimer = setInterval(() => {
              if (this.hasMoreItems && !this.isLoadingMore && fallbackAttempts < maxFallbackAttempts) {
                console.log(`⏰ FormSubmit fallback timer triggered auto-load (attempt ${fallbackAttempts + 1}/${maxFallbackAttempts})`);
                this.loadMoreItems();
                fallbackAttempts++;
              } else if (!this.hasMoreItems || fallbackAttempts >= maxFallbackAttempts) {
                clearInterval(autoLoadTimer);
                if (fallbackAttempts >= maxFallbackAttempts) {
                  console.log(`🛑 FormSubmit stopped auto-loading after ${maxFallbackAttempts} attempts. Please scroll to load more.`);
                } else {
                  console.log(`✅ All form submit items loaded, clearing fallback timer`);
                }
              }
            }, 3000);
            
            // เก็บ reference เพื่อ cleanup
            this.scrollCleanup = () => {
              window.removeEventListener('scroll', handleScroll);
              document.removeEventListener('scroll', handleScroll);
              document.body.removeEventListener('scroll', handleScroll);
              window.removeEventListener('wheel', handleScroll);
              window.removeEventListener('touchmove', handleScroll);
              window.removeEventListener('resize', handleResize);
              clearInterval(autoLoadTimer);
              console.log(`🧹 FormSubmit scroll listeners cleaned up`);
            };
            
            console.log(`✅ FormSubmit scroll detection setup complete with 40% trigger + multiple listeners`);
            
            // ⚡ Initial scroll check หลัง mount
            setTimeout(() => {
              console.log(`🔍 FormSubmit initial scroll check...`);
              handleScroll();
            }, 1000);
          });
        },
        
        // ⚡ เพิ่ม debugging สำหรับ manual button clicks
        loadMoreItems() {
          console.log(`🔘 FormSubmit loadMoreItems called manually - hasMore: ${this.hasMoreItems}, isLoading: ${this.isLoadingMore}`);
          
          if (!this.lazy || this.isLoadingMore || !this.hasMoreItems) {
            console.log(`🚫 FormSubmit loadMoreItems blocked - lazy: ${this.lazy}, isLoading: ${this.isLoadingMore}, hasMore: ${this.hasMoreItems}`);
            return;
          }
          
          this.isLoadingMore = true;
          console.log(`📦 Auto-loading more form submit items: ${this.currentDisplayCount} + ${this.loadMoreCount}`);
          
          setTimeout(() => {
            const newCount = Math.min(
              this.currentDisplayCount + this.loadMoreCount,
              this.listItems.length
            );
            this.currentDisplayCount = newCount;
            this.isLoadingMore = false;
            console.log(`✅ Auto-loaded more form submit items. Showing: ${this.currentDisplayCount}/${this.listItems.length}`);
            
            if (this.hasMoreItems && (this.listItems.length - this.currentDisplayCount) <= this.loadMoreCount) {
              console.log(`🚀 Near end, loading remaining form submit items...`);
              setTimeout(() => {
                this.loadMoreItems();
              }, 50);
            }
          }, 50);
        },
        
        resetDisplayCount() {
          this.currentDisplayCount = this.initialDisplayCount;
          this.isLoadingMore = false;
          
          // ⚡ เปลี่ยนจาก <= 10 เป็น <= 20 เพื่อให้ auto-show มากขึ้น
          if (this.listItems.length <= 20) {
            console.log(`📊 Small form submit dataset (${this.listItems.length} items), showing all immediately`);
            this.currentDisplayCount = this.listItems.length;
          } else {
            console.log(`📊 Form submit dataset (${this.listItems.length} items), using progressive loading - Initial: ${this.initialDisplayCount}`);
            
            // ⚡ เพิ่ม immediate chain loading สำหรับ dataset ขนาดกลาง
            if (this.listItems.length <= 100) {
              console.log(`🚀 Medium dataset detected, starting immediate chain loading...`);
              setTimeout(() => {
                if (this.hasMoreItems && !this.isLoadingMore) {
                  this.loadMoreItems();
                }
              }, 300); // Auto-load หลัง 300ms
            }
          }
        },
        
        toggleLazyMode() {
          this.lazy = !this.lazy;
          console.log(`🔄 FormSubmit lazy rendering: ${this.lazy ? 'Enabled' : 'Disabled'}`);
          
          if (this.lazy) {
            this.resetDisplayCount();
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
    async mounted () {
      try {
        
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
        const storedLimitItem = session.limitItem;
        if (storedLimitItem) {
          this.limitItem = storedLimitItem;
        }
        await this.getCourse();
        await this.getData();
        
        // ⚡ เพิ่ม immediate loading หลัง getData เสร็จ
        this.$nextTick(() => {
          if (this.lazy && this.hasMoreItems) {
            console.log(`🚀 Immediate post-mount loading check...`);
            setTimeout(() => {
              if (this.hasMoreItems && !this.isLoadingMore) {
                console.log(`🚀 Post-mount auto-load triggered`);
                this.loadMoreItems();
              }
            }, 500); // Quick auto-load หลัง mount
          }
        });
        
        // Setup lazy loading scroll detection
        if (this.lazy) {
          this.$nextTick(() => {
            this.setupScrollDetection();
          });
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
      'activeFormStatus.code'() {
        this.selectedData = [];
        this.resetData(); // Reset Load All data when form status changes
        this.getData();
      },
      selectedItems: {
          handler() {
              this.addToHeaderGroup();
          },
          deep: true
      },
      searchQuery() {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(() => {
              this.resetData(); // Reset Load All data when search changes
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
      },
      statusFilter() {
        this.resetData(); // Reset Load All data when status filter changes
        this.getData();
      },
      $route(to, from) {
        if (to.params.status !== from.params.status) {
          this.dataStatus = to.params.status
            this.getData(to.params.status)
            .then(() => {
              console.log("Data fetched successfully.");
            })
            .catch((error) => {
              console.error(error);
            });
        }
      },
    },
    computed: {
      filteredFormData() {
        if (!this.item || !this.item.formData) return [];
        
        // Create a copy of formData excluding 'setData'
        const filtered = { ...this.item.formData };
        delete filtered['setData']; // Remove 'setData' key
        return filtered;
      },
      areAllSelected() {
        return this.listItems.length && this.listItems.every(item => this.selectedData.includes(item._id));
      },
      sortedListItems() {
        const itemsCopy = [...this.listItems];
        itemsCopy.sort((a, b) => {
          const findIndex = (item) => this.headerGroup.indexOf(item);
          return findIndex(a.formItem.name) - findIndex(b.formItem.name);
        });
        return itemsCopy;
      },
      filteredListItems() {
        if (this.selectedStatus === "All") {
          return this.listItems;
        } else {
          return this.listItems.filter(item => item.status === this.selectedStatus);
        }
      },
      activeStatus() {
          const routeStatus = this.$route.params.status;
          return this.postData.status.find((item) => item.slug === routeStatus);
      },
      
      // Progressive/Lazy rendering computed
      visibleItems() {
        if (!this.lazy) {
          console.log(`👁️ Showing ALL form submit items (lazy disabled): ${this.listItems.length} items`);
          return this.listItems; // แสดงทั้งหมดถ้าไม่ใช้ lazy
        }
        const visible = this.listItems.slice(0, this.currentDisplayCount);
        console.log(`👁️ Showing form submit items: ${visible.length}/${this.listItems.length} (displayCount: ${this.currentDisplayCount})`);
        return visible;
      },
      
      hasMoreItems() {
        const hasMore = this.lazy && this.currentDisplayCount < this.listItems.length;
        if (this.lazy) {
          console.log(`❓ hasMoreItems: ${hasMore} (displayCount: ${this.currentDisplayCount}, total: ${this.listItems.length})`);
        }
        return hasMore;
      },
      
      // ✅ ADDED: Debug computed for header status
      debugHeaderInfo() {
        const info = {
          headerGroupLength: this.headerGroup.length,
          headerGroup: this.headerGroup,
          formDataArrayLength: this.formDataArray.length,
          formDataArray: this.formDataArray.slice(0, 5), // first 5 items only
          hasData: this.listItems.length > 0,
          firstItemStructure: this.listItems[0] ? Object.keys(this.listItems[0].formData || {}) : []
        };
        console.log(`🔍 FormSubmit header debug:`, info);
        return info;
      },
      
      // ✅ ADDED: Safe header group with fallback
      safeHeaderGroup() {
        // Ensure we always have some headers to display
        if (this.headerGroup.length === 0 && this.listItems.length > 0) {
          console.warn(`⚠️ FormSubmit empty headerGroup, attempting auto-recovery...`);
          
          // Try to extract headers from first item
          const firstItem = this.listItems[0];
          if (firstItem?.formData) {
            const autoHeaders = Object.keys(firstItem.formData)
              .map(key => {
                const formItem = firstItem.formData[key];
                return formItem?.name || formItem || key;
              })
              .filter(name => name && name !== 'setData')
              .slice(0, 10);
              
            console.log(`🔧 FormSubmit auto-recovered headers:`, autoHeaders);
            return autoHeaders;
          }
          
          // Last resort fallback
          return ['ข้อมูล', 'รายละเอียด'];
        }
        
        return this.headerGroup;
      },
    },
};
</script>

<template>
  <div class="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
    <!-- Loading State -->
    <div v-if="!loading_sources" class="flex justify-center py-8">
      <div class="flex flex-col items-center space-y-2">
        <Loader/>
        <p class="text-gray-600 text-sm">กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="activeFormStatus" class="space-y-3 p-3">
      <!-- Header Controls Section -->
      <div class="bg-white border border-gray-200/50 rounded-lg shadow-sm">
        <div class="px-4 py-2.5 border-b border-gray-100/50 bg-gradient-to-r from-slate-50 to-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <font-awesome-icon :icon="['fas','file-alt']" class="text-white text-sm" />
              </div>
              <div>
                <h2 class="text-lg font-medium text-gray-900">{{ activeFormStatus.name }}</h2>
                <p class="text-sm text-gray-600">จัดการข้อมูลการส่งแบบฟอร์ม</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <data-table :listItems="listItems" :table="false" :export="true" :parent="parent" :status="activeFormStatus.name" :exportButtonText="'Export CSV'"></data-table>
              <data-table v-if="totalItemsFetched >= totalItems && totalItems > 0 && !isLoading" 
                         :listItems="allListItems" 
                         :table="false" 
                         :export="true" 
                         :parent="parent" 
                         :status="activeFormStatus.name" 
                         :exportButtonText="`Export All (${allListItems.length})`"
                         class="opacity-100 transition-opacity duration-300">
              </data-table>
              <div v-else-if="isLoading" class="opacity-50 transition-opacity duration-300">
                <data-table :listItems="[]" 
                           :table="false" 
                           :export="false" 
                           :parent="parent" 
                           :status="activeFormStatus.name" 
                           :exportButtonText="'Export All (กำลังโหลด...)'">
                </data-table>
              </div>
              <button @click="loadAllData" :disabled="isLoading || (totalItemsFetched >= totalItems && totalItems > 0)" 
                      class="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:hover:bg-gray-400 text-white font-bold py-2 px-4 rounded text-sm transition-colors duration-200 disabled:cursor-not-allowed"
                      :title="isLoading ? 'กำลังโหลดข้อมูล...' : (totalItemsFetched >= totalItems && totalItems > 0) ? 'โหลดข้อมูลครบแล้ว' : 'โหลดข้อมูลทั้งหมด'">
                <font-awesome-icon :icon="isLoading ? ['fas','spinner'] : ['fas','download']" class="mr-1" :class="{'animate-spin': isLoading}" />
                {{ isLoading ? 'Loading...' : 'Load All' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Progress Section -->
        <div v-if="isLoading || (totalItemsFetched >= totalItems && totalItems > 0 && !isLoading)" class="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 border-l-2 border-indigo-400">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                <font-awesome-icon :icon="isLoading ? ['fas','spinner'] : ['fas','check-circle']" class="text-indigo-600 text-sm" :class="{'animate-spin': isLoading}" />
              </div>
              <div class="text-sm text-indigo-800">
                <div v-if="isLoading" class="font-medium">
                  <strong>กำลังโหลดข้อมูลทั้งหมด:</strong> {{ progress }}% ({{ allListItems.length }} / {{ totalItems }} รายการ)
                </div>
                <div v-if="totalItemsFetched >= totalItems && totalItems > 0 && !isLoading" class="font-medium">
                  <strong>เสร็จสิ้น:</strong> โหลดข้อมูลครบทั้งหมด {{ allListItems.length }} รายการแล้ว
                </div>
              </div>
            </div>
            <div v-if="isLoading" class="w-32">
              <div class="w-full bg-indigo-200 rounded-full h-1.5 shadow-inner">
                <div class="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all duration-500 ease-out" :style="`width: ${progress}%`"></div>
              </div>
            </div>
            <div v-else-if="totalItemsFetched >= totalItems && totalItems > 0" class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <font-awesome-icon :icon="['fas','check']" class="text-white text-xs" />
              </div>
              <span class="text-sm text-green-700 font-medium">พร้อมใช้งาน</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Batch Actions Section -->
      <div v-if="selectedData.length > 0" class="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-sm">
        <div class="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100/50">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
              <font-awesome-icon :icon="['fas','tasks']" class="text-white text-sm" />
            </div>
            <div>
              <h3 class="text-base font-medium text-gray-900">การดำเนินการกับข้อมูลที่เลือก</h3>
              <p class="text-sm text-gray-600">เลือกแล้ว <span class="font-medium text-emerald-600">{{ selectedData.length }}</span> รายการ</p>
            </div>
          </div>
        </div>
        
        <div class="p-3 bg-gradient-to-br from-white to-gray-50">
          <div class="flex justify-center space-x-2">
            <button @click="prevItem" :disabled="currentIndex === 0"
                    class="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-md transition-all duration-200 shadow-sm text-sm">
              <font-awesome-icon :icon="['fas','arrow-left']" class="mr-1 text-sm" />
              ย้ายไป {{ this.returnFormStatus?.prev }}
            </button>
            <button @click="nextItem" :disabled="currentIndex >= returnFormStatus?.length - 1"
                    class="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-md transition-all duration-200 shadow-sm text-sm">
              <font-awesome-icon :icon="['fas','arrow-right']" class="mr-1 text-sm" />
              เปลี่ยนเป็น {{ this.returnFormStatus?.next }}
            </button>
            <button @click="assignItem('approve')" :disabled="currentIndex >= returnFormStatus?.length - 1"
                    class="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-md transition-all duration-200 shadow-sm text-sm">
              <font-awesome-icon :icon="['fas','check-circle']" class="mr-1 text-sm" />
              Enroll & Approve
            </button>
            <button @click="deleteItem"
                    class="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-md transition-all duration-200 shadow-sm text-sm">
              <font-awesome-icon :icon="['fas','trash']" class="mr-1 text-sm" />
              Delete
            </button>
          </div>
          <div class="mt-2 text-center">
            <div class="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
              <div class="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              <p class="text-sm text-gray-700 font-medium">ประมวลผล: {{ successfullyProcessed }}/{{ selectedData.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-sm">
        <div class="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100/50">
          <div class="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
            <div class="flex-1 max-w-md">
              <div class="relative group">
                <input
                  id="search"
                  type="text"
                  class="w-full px-3 py-2 pl-8 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm text-sm"
                  placeholder="ค้นหาข้อมูล..."
                  v-model="searchQuery"
                />
                <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <font-awesome-icon :icon="['fas','search']" class="text-gray-400 text-sm group-hover:text-indigo-500 transition-colors duration-200" />
                </div>
                <button
                  v-if="searchQuery.length > 0"
                  @click="clearSearchQuery"
                  class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <font-awesome-icon :icon="['fas','times']" class="text-sm" />
                </button>
              </div>
              <div v-if="searchQuery.length > 0" class="mt-1 flex items-center space-x-1">
                <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <p class="text-sm text-gray-600">
                  ผลการค้นหา: <span class="font-medium text-indigo-600">{{ totalItems }}</span> รายการ
                </p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <select
                v-model="limitItem"
                @change="handleLimitChange"
                class="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white/80 backdrop-blur-sm shadow-sm"
              >
                <option v-for="option in limitOptions" :key="option" :value="option">{{ option }} รายการ</option>
              </select>
              <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50">
                <Pagination
                  :current-page="currentPage"
                  :total-items="totalItems"
                  :total-pages="totalPages"
                  :limit-items="limitItem"
                  :data-loading="loading"
                  :display-mode="'nav'"
                  @page-changed="handlePageChanged"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-sm">
        <div class="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-gradient-to-br from-slate-600 to-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                <font-awesome-icon :icon="['fas','table']" class="text-white text-sm" />
              </div>
              <div>
                <h3 class="text-base font-medium text-gray-900">ข้อมูลการส่งแบบฟอร์ม</h3>
                <p class="text-sm text-gray-600">แสดงข้อมูลแบบตาราง</p>
              </div>
            </div>
            <button @click="toggleHeaderPanel" 
                    class="px-2 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-gray-50 transition-all duration-200 shadow-sm flex items-center space-x-1">
              <font-awesome-icon :icon="['fas','cog']" class="text-sm" />
              <span>ตั้งค่าคอลัมน์</span>
            </button>
          </div>
        </div>

        <!-- Mobile View -->
        <div class="lg:hidden">
          <div class="divide-y divide-gray-100">
            <template v-for="(item, index) in visibleItems" :key="item._id">
              <!-- Summary Row -->
              <div class="px-4 py-2.5 flex justify-between items-center cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200" 
                   @click="toggleDetail(index)">
                <div class="flex items-center space-x-2">
                  <input type="checkbox" v-model="selectedData" :value="item._id" 
                         class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3" />
                  <div>
                    <div class="font-medium text-gray-900 text-sm">{{ index + 1 }}. {{ getSummaryField(item.formData, 0) }}</div>
                    <div class="text-sm text-gray-500 flex items-center space-x-1">
                      <font-awesome-icon :icon="['fas','calendar']" class="text-gray-400 text-sm" />
                      <span>{{ formatThaidate(item.createdAt) }}</span>
                    </div>
                  </div>
                </div>
                <div class="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                  <font-awesome-icon :icon="expandedItemIndex === index ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" 
                                     class="text-gray-500 text-sm" />
                </div>
              </div>
              
              <!-- Expanded Details -->
              <div v-if="expandedItemIndex === index" class="px-4 py-2 bg-gradient-to-br from-gray-50 to-white">
                <div class="space-y-2">
                  <div v-for="(field, key) in filteredFormData" :key="key" 
                       class="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-0">
                    <div class="font-medium text-gray-700 w-1/3 text-sm">{{ field.name }}</div>
                    <div class="text-gray-600 w-2/3 text-right text-sm">
                      <template v-if="field.type === 'address'">
                        <div>{{ formatAddress(field.value) }}</div>
                      </template>
                      <template v-else>
                        {{ field.value }}
                      </template>
                    </div>
                  </div>
                  
                  <!-- SetData Section -->
                  <div v-if="item.formData['setData']" class="mt-3">
                    <div v-for="(contactGroups, setDataKey) in item.formData['setData']" :key="setDataKey"
                         class="border border-indigo-200 rounded-lg overflow-hidden shadow-sm">
                      <h4 class="text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-2 py-1.5">{{ setDataKey }}</h4>
                      <div v-if="Array.isArray(contactGroups)" class="divide-y divide-gray-100">
                        <div v-for="(contactGroup, index) in contactGroups" :key="`setDataKey-${index}`">
                          <h5 class="text-sm font-medium bg-gray-50 text-gray-700 px-2 py-1">ข้อมูลชุดที่ {{ index + 1 }}</h5>
                          <div class="px-2 py-1.5 space-y-1">
                            <div v-for="contactDetail in contactGroup" :key="contactDetail.name" 
                                 class="flex justify-between items-center text-sm">
                              <span class="text-gray-600">{{ contactDetail.name }}</span>
                              <span class="text-gray-900 font-medium">{{ contactDetail.value }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Desktop View -->
        <div class="hidden lg:block">
          <!-- Header Panel -->
          <div v-if="showHeaderPanel" class="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-3">
            <div class="grid grid-cols-3 gap-3">
              <template v-for="(item, index) in formDataArray" :key="index">
                <div v-if="item" class="flex items-center justify-between p-2 bg-white/80 backdrop-blur-sm rounded-md border border-gray-200/50 shadow-sm">
                  <div class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      :disabled="shouldDisableCheckbox(index)"
                      v-model="selectedItems[index]"
                      :checked="headerGroup.includes(item)"
                      @change="updateHeaderGroup(index)"
                      class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                    />
                    <span class="text-sm text-gray-700 font-medium truncate max-w-32" :title="item">{{ item }}</span>
                  </div>
                  <div class="flex space-x-0.5">
                    <button @click="moveItemLeft(index)" :disabled="index === 0"
                            class="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50 rounded hover:bg-indigo-50 transition-all duration-200">
                      <font-awesome-icon :icon="['fas','chevron-left']" class="text-sm"/>
                    </button>
                    <button @click="moveItemRight(index)" :disabled="index === headerGroup.length - 1"
                            class="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50 rounded hover:bg-indigo-50 transition-all duration-200">
                      <font-awesome-icon :icon="['fas','chevron-right']" class="text-sm"/>
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Table Header -->
          <div class="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
            <div class="flex items-center">
              <div class="w-4/5">
                <div class="flex">
                  <div class="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-900">
                    <input type="checkbox" @change="toggleSelectAll" :checked="areAllSelected" 
                           class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3">
                    <span>#</span>
                  </div>
                  <div v-for="(key, index) in headerGroup" :key="index" 
                       :class="`flex-1 px-4 py-2.5 text-sm font-medium text-gray-900`">
                    <div class="truncate min-w-0" :title="key">
                      {{ key }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="w-1/5">
                <div class="flex">
                  <div class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-900 truncate" :title="'วันที่'">วันที่</div>
                  <div class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-900 truncate" :title="'จัดการ'">จัดการ</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Table Body -->
          <div class="divide-y divide-gray-100" :class="[(activeBlock?'relative overflow-hidden' : '')]">
            <div v-if="activeBlock" class="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10">
              <div class="text-center p-4 bg-white rounded-lg shadow-md border border-gray-200">
                <div class="relative mb-2">
                  <div class="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                  <div class="absolute inset-0 rounded-full h-8 w-8 border border-purple-200 border-t-purple-500 mx-auto animate-ping"></div>
                </div>
                <p class="text-gray-700 font-medium text-sm">กำลังประมวลผล...</p>
                <p class="text-sm text-gray-500 mt-0.5">กรุณารอสักครู่</p>
              </div>
            </div>
            
            <template v-for="(item, index) in visibleItems" :key="item._id">
              <div class="flex items-center hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200" 
                   :class="{'bg-gradient-to-r from-amber-50 to-yellow-50': hasSetDataKey(item.formData)}">
                <div class="w-4/5">
                  <div class="flex">
                    <div class="flex items-center space-x-2 px-4 py-2">
                      <input type="checkbox" v-model="selectedData" :value="item._id" 
                             class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3">
                      <span class="text-sm text-gray-900" 
                            :class="{'font-medium': hasSetDataKey(item.formData)}">
                        {{ (currentPage - 1) * limitItem + index + 1 }}
                      </span>
                    </div>

                    <template v-for="(header, headerIndex) in headerGroup" :key="headerIndex">
                      <template v-for="(formItem, key) in item.formData" :key="key">
                        <template v-if="formItem.name === header">
                          <div class="flex-1 px-4 py-2">
                            <div class="text-sm text-gray-900 truncate"
                                 :class="{'font-medium': hasSetDataKey(item.formData)}">
                              <template v-if="formItem.type === 'input' || formItem.type === 'text' || formItem.type === 'email'|| formItem.type === 'name' || formItem.type === 'mobile' || formItem.type === 'taxID' || formItem.type === 'taxName' || formItem.type === 'number' || formItem.type === 'hidden'">
                                {{ formItem.value }}
                              </template>
                              <template v-else-if="formItem.type === 'textarea'">
                                <ShortText :value="formItem.value"></ShortText>
                              </template>
                              <template v-else-if="formItem.type === 'datetime'">
                                <div class="flex items-center space-x-1">
                                  <font-awesome-icon :icon="['fas','calendar']" class="text-gray-400 text-sm" />
                                  <span>{{ formatThaidate(formItem.value) }}</span>
                                </div>
                              </template>
                              <template v-else-if="formItem.type === 'address'">
                                <Address :value="formItem.value"></Address>
                              </template>
                              <template v-else-if="formItem.type === 'checkbox'">
                                <div class="flex flex-wrap gap-0.5">
                                  <div v-for="option in formItem.value" :key="option" 
                                       class="inline-flex items-center px-1.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                    {{ option }}
                                  </div>
                                </div>
                              </template>
                              <template v-else-if="formItem.type === 'radiobox'">
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                                  <div class="w-1 h-1 bg-emerald-500 rounded-full mr-1"></div>
                                  {{ formItem.value.label }}
                                </span>
                              </template>
                              <template v-else-if="formItem.type === 'upload'">
                                <div class="relative cursor-pointer group" @click="showLightbox(formItem.value[0])">
                                  <img class="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition-all duration-200" 
                                       :src="formItem.value[0]" alt="Uploaded Image" 
                                       v-if="formItem.value && formItem.value[0]">
                                  <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                    <font-awesome-icon :icon="['fas','search-plus']" class="text-white text-sm" />
                                  </div>
                                </div>
                              </template>
                            </div>
                          </div>
                        </template>
                      </template>
                    </template>
                  </div>
                </div>
                
                <div class="w-1/5">
                  <div class="flex">
                    <div class="flex-1 px-4 py-2 text-sm text-gray-500">
                      <div class="flex items-center space-x-1">
                        <font-awesome-icon :icon="['fas','clock']" class="text-gray-400 text-sm" />
                        <span>{{ formatThaidate(item.createdAt) }}</span>
                      </div>
                    </div>
                    <div class="flex-1 px-4 py-2">
                      <div class="flex space-x-1">
                        <button @click="linkUser(item.userID)" 
                                class="p-1 text-gray-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-all duration-200"
                                title="ดูข้อมูลผู้ใช้">
                          <font-awesome-icon :icon="['fas','user']" class="text-sm" />
                        </button>
                        <button @click="deleteData(item._id)" 
                                class="p-1 text-gray-400 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-all duration-200"
                                title="แก้ไข">
                          <font-awesome-icon :icon="['fas','square-pen']" class="text-sm" />
                        </button>
                        <button @click="removeItem(item._id)" 
                                class="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-all duration-200"
                                title="ลบ">
                          <font-awesome-icon :icon="['fas','trash-can']" class="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- SetData Rows -->
              <template v-if="item.formData && item.formData.setData">
                <div v-for="(contactItem, contactIndex) in item.formData.setData" :key="`contact_${contactIndex}`" 
                     class="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-2 border-amber-400">
                  <data-set :value="contactItem"></data-set>
                </div>
              </template>
            </template>
          </div>
        </div>

        <!-- Progressive Loading Indicators -->
        <template v-if="lazy">
          <!-- Loading More Indicator -->
          <div v-if="isLoadingMore" class="flex justify-center items-center py-6 border-b border-gray-200">
            <div class="flex items-center gap-3 text-blue-600">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span class="text-sm font-medium">กำลังโหลดข้อมูลการส่งแบบฟอร์มเพิ่ม...</span>
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
              <div class="flex gap-2">
                <!-- Manual Load More Button for Testing -->
                <button
                  @click="loadMoreItems"
                  class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  :disabled="isLoadingMore"
                >
                  <i class="fas fa-plus mr-1"></i>
                  โหลดเพิ่ม (+{{ loadMoreCount }})
                </button>
                <!-- Emergency show all button -->
                <button
                  @click="currentDisplayCount = listItems.length"
                  class="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  title="กรณีที่ auto-scroll ไม่ทำงาน"
                >
                  <i class="fas fa-eye mr-1"></i>
                  แสดงทั้งหมดเลย
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Pagination Footer -->
        <div class="px-4 py-2 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
          <Pagination
            :current-page="currentPage"
            :total-items="totalItems"
            :total-pages="totalPages"
            :limit-items="limitItem"
            :data-loading="loading"
            :display-mode="'summary'"
            @page-changed="handlePageChanged"
          />
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div v-if="lightboxVisible" 
         class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         @click.self="closeLightbox">
      <div class="relative max-w-4xl max-h-full">
        <img :src="selectedImage" alt="Lightbox Image" 
             class="max-w-full max-h-full object-contain rounded-lg shadow-2xl">
        <button @click="closeLightbox" 
                class="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-white/20">
          <font-awesome-icon :icon="['fas','times']" class="text-sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<style>
  input:focus-visible {
    outline: none;
  }
  
  /* Text truncation for table headers */
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .min-w-0 {
    min-width: 0;
  }
  
  .max-w-32 {
    max-width: 8rem;
  }
  
  /* Ensure flex items can shrink */
  .flex-1 {
    flex: 1 1 0%;
    min-width: 0;
  }
</style>

<style>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 9999;
}

.loading-text {
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
}

.processing-count {
  color: #fff;
  font-size: 18px;
}
</style>
<script>
import storageManager from '@/plugins/storage';
import Loader       from '@/interface/template/Loader.vue';

import Subhead from '@/interface/template/outline/Subhead.vue';
import Pagination from '@/utils/Paginated.vue';
import convertUtils from "@/plugins/convertUtils";

export default {
    data() {
      const session = storageManager.get('session')
      return {
        school: session.current.id,
        login:session.login,
        listItems: [],
        categoryData:[],
        loading_sources: true,
        endpoint: "",
        master:session.master,
        accessToken: storageManager.get('session','token'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        limitItem:100,
        limitOptions: [10, 50, 100, 200, 500, 1000, 2000], // Define the available options
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        loading: false,
        showingOverlay: false,
        searchQuery: "",
        statusFilter:"all",
        isCreatingUser: false,
        isShowingOverlay: false,
        loadingMessage: '',
        processingCount: '',
        activeBlock: false,
        debounceTimer: null
      }
    },
    components: {
      Loader,
      Subhead,
      Pagination,
    },
    methods: {
      async createData(id) {
      try {
        this.isCreatingUser = true;
        this.isShowingOverlay = true;

        let totalCount = this.listItems.length;
        let count = 0;

        let itemsToProcess = [];

        if (id) {
          const item = this.listItems.find(item => item.old_id === id);
          if (item) {
            itemsToProcess.push(item);
            totalCount = 1;
          }
        } else {
          itemsToProcess = this.listItems;
        }

        for (const student of itemsToProcess) {
            count++;
            this.loadingMessage = 'Creating users...';
            this.processingCount = `${count}/${totalCount}`;

            try {
              const url = `https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-3bf765c8-bb4f-4bac-ba41-9698000f7334/default/getstudentdata?id=${student.old_id}`;
              const response = await fetch(url);
              const data = await response.json();
              const enrollData = data.enroll;

              const courseArray = [
              {
                lessonId: "195",
                value: "646399b1db2e5913d490fdc1",
                measure: "38",
                  first: { create: "2022-03-21 00:00:00", expire: "2027-03-20 00:00:00" },
                  second: { create: "2022-03-30 00:00:00", expire: "2027-03-29 00:00:00" }
              },
              {
                lessonId: "215",
                value: "646399b3db2e5913d490fdc2",
                measure: "38",
                  first: { create: "2022-06-15 00:00:00", expire: "2027-06-14 00:00:00" },
                  second: { create: "2022-05-31 00:00:00", expire: "2027-05-30 00:00:00" }
              },
              {
                lessonId: "219",
                value: "646399b5db2e5913d490fdc3",
                measure: "38",
                  first: { create: "2022-08-15 00:00:00", expire: "2027-08-16 00:00:00" },
                  second: { create: "2022-08-30 00:00:00", expire: "2022-08-30 00:00:00" }
              },
              {
                lessonId: "220",
                value: "646399b6db2e5913d490fdc4",
                measure: "33",
                  first: { create: "2023-02-28 00:00:00", expire: "2028-02-27 00:00:00" },
                  second: { create: "2023-03-17 00:00:00", expire: "2028-03-16 00:00:00" }
              },
              {
                lessonId: "223",
                value: "646399b8db2e5913d490fdc5",
                measure: "33",
                  first: { create: "", expire: "" },
                  second: { create: "", expire: "" }
              }
            ];

              const statusArray = [
                { id: "1", value: "สั่งซื้อ", measure: "38" },
                { id: "2", value: "แจ้งโอน", measure: "38" },
                { id: "3", value: "อนุมัติ", measure: "38" },
                { id: "4", value: "ยกเลิก", measure: "33" },
                { id: "5", value: "รออนุมัติ", measure: "33" },
                { id: "6", value: "ส่งเอกสารแล้ว", measure: "33" },
                { id: "7", value: "ผ่านการพิจารณา", measure: "33" },
                { id: "8", value: "ลงทะเบียนคอร์ส", measure: "33" }
              ];

              for (const lessonId in enrollData) {
                if (Object.prototype.hasOwnProperty.call(enrollData, lessonId)) {

                  const enroll = enrollData[lessonId];

                  const orderBody = {
                    data: {
                      courseID: courseArray.find(course => course.lessonId === enroll.lesson_id)?.value,
                      userID: student._id,
                      price: enroll.order_price,
                      payment: enroll.order_payment,
                      ref: enroll.order_ref,
                      ref1: enroll.order_ref1,
                      ref2: enroll.order_ref2,
                      ref3: enroll.order_ref3,
                      ref_no: enroll.order_ref_no,
                      token: enroll.order_token,
                      type: enroll.order_type,
                      code: enroll.order_code,
                      approve: enroll.order_approve,
                      adddate: enroll.order_adddate,
                      approve_date: enroll.order_approve_date,
                      confirmdate: enroll.order_confirmdate,
                      status: statusArray.find(status => status.id === enroll.order_status)?.value,
                      address: {
                        delivery:{
                          address: enroll.order_delivery_address,
                          email: enroll.order_delivery_email,
                          name: enroll.order_delivery_name,
                          phone: enroll.order_delivery_phone,
                          province: enroll.order_delivery_province_name,
                          zipcode: enroll.order_delivery_zipcode,
                        },
                        invoice:{
                          address: enroll.order_invoice_address,
                          email: enroll.order_invoice_email,
                          name: enroll.order_invoice_name,
                          phone: enroll.order_invoice_phone,
                          province: enroll.order_invoice_province_name,
                          zipcode: enroll.order_invoice_zipcode,
                        },
                        tax:{
                          address: enroll.order_tax_address,
                          email: enroll.order_tax_email,
                          name: enroll.order_tax_name,
                          phone: enroll.order_tax_phone,
                          province: enroll.order_tax_province_name,
                          zipcode: enroll.order_tax_zipcode,
                        },
                      },
                    },
                    options: {
                      fieldType: [],
                    }
                  };

                  try {

                    const checkOrder = await fetch("https://gateway.cloudrestfulapi.com/api/order/query", {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                      body: JSON.stringify({
                        method: 'find',
                        args: [
                          {
                            $and: [
                              { 
                                courseID: courseArray.find(course => course.lessonId === enroll.lesson_id)?.value,
                                userID: student._id,
                              }
                            ]
                          }
                        ]
                      })
                    });
                    const checkOrderRes = await checkOrder.json();

                    if (Object.keys(checkOrderRes).length === 0) {
                      const resAPI = await fetch('https://gateway.cloudrestfulapi.com/api/order/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                        body: JSON.stringify(orderBody)
                      });

                      const orderJSON = await resAPI.json();

                      if (resAPI.status===200) {
                        
                        await fetch("https://gateway.cloudrestfulapi.com/api/user/" + student._id + "/order", {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                          body: JSON.stringify({
                            action: "add",
                            element: orderJSON._id,
                            type: "string",
                          })
                        });
                        
                        console.log(`Order created successfully`);
                      } else {
                        console.log(`Error creating order`);
                      }
                    } else {
                      console.log("มีออเดอร์แล้ว");
                    }
                  } catch (error) {
                    console.log(`Error creating user`);
                    console.error(error);
                  }
                  await new Promise(resolve => setTimeout(resolve, 1000));

                  const progress = Number(enroll.additional.progress);
                  const certArea = enroll.additional.cert_area;
                  const examRound = enroll.additional.exam_round;

                  const enrollBody = {
                    data: {
                      courseID: courseArray.find(course => course.lessonId === enroll.lesson_id)?.value,
                      userID: student._id,
                      analytics: {
                        total: 13,
                        pending: 0,
                        processing: 0,
                        complete: progress,
                        status: progress === 13
                        ? 'complete'
                        : (progress < 13 && progress > 0)
                        ? 'processing'
                        : 'pending',
                        message: progress === 13
                        ? 'เรียนจบแล้ว'
                        : (progress < 13 && progress > 0)
                        ? 'กำลังเรียน'
                        : 'ยังไม่ได้เรียน',
                        post: {
                          req: true,
                          has: true,
                          measure: courseArray.find(course => course.lessonId === enroll.lesson_id)?.measure,
                          score: enroll.additional.posttest,
                          result: enroll.additional.posttest >= (courseArray.find(course => course.lessonId === enroll.lesson_id)?.measure) ? true : false,
                          message: enroll.additional.posttest >= (courseArray.find(course => course.lessonId === enroll.lesson_id)?.measure) ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง',
                        },
                        pre: {
                          req: true,
                          has: true,
                          measure: courseArray.find(course => course.lessonId === enroll.lesson_id)?.measure,
                          score: enroll.additional.pretest,
                          result: enroll.additional.pretest >= (courseArray.find(course => course.lessonId === enroll.lesson_id)?.measure) ? true : false,
                          message: enroll.additional.pretest >= (courseArray.find(course => course.lessonId === enroll.lesson_id)?.measure) ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง',
                        },
                        retest: {
                          req: true,
                          has: true,
                          measure: courseArray.find(course => course.lessonId === enroll.lesson_id)?.measure,
                          score: enroll.additional.retest,
                          result: enroll.additional.retest >= (courseArray.find(course => course.lessonId === enroll.lesson_id)?.measure) ? true : false,
                          message: enroll.additional.retest >= (courseArray.find(course => course.lessonId === enroll.lesson_id)?.measure) ? 'ผ่านการรับรอง' : 'ไม่ผ่านการรับรอง',
                        },
                        option: {
                          cert_age: enroll.additional.cert_age,
                          cert_area: certArea || enroll.additional.option.cert_area,
                          exam_round: examRound || enroll.additional.option.exam_round,
                          get_receipt: enroll.additional.get_receipt,
                        }
                      },
                    },
                    options: {
                      fieldType: [],
                    }
                  };

                  try {

                    const checkEnroll = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/query", {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                      body: JSON.stringify({
                        method: 'find',
                        args: [
                          {
                            $and: [
                              { 
                                courseID: courseArray.find(course => course.lessonId === enroll.lesson_id)?.value,
                                userID: student._id,
                              }
                            ]
                          }
                        ]
                      })
                    });
                    const checkEnrollRes = await checkEnroll.json();

                    if (Object.keys(checkEnrollRes).length === 0) {
                      const resAPI = await fetch('https://gateway.cloudrestfulapi.com/api/enroll/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                        body: JSON.stringify(enrollBody)
                      });

                      const enrollJSON = await resAPI.json();
                      console.log(enrollJSON);

                      if (resAPI.status===200) {
                        
                        await fetch("https://gateway.cloudrestfulapi.com/api/user/" + student._id + "/enroll", {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                          body: JSON.stringify({
                            action: "add",
                            element: enrollJSON._id,
                            type: "string",
                          })
                        });

                        const posttest    = enroll.additional.posttest >= (courseArray.find(course => course.lessonId === enroll.lesson_id)?.measure) ? true : false;
                        const retest      = enroll.additional.retest >= (courseArray.find(course => course.lessonId === enroll.lesson_id)?.measure) ? true : false;
                        

                        if( posttest || retest)
                        {
                          
                          const exam_round = examRound || enroll.additional.option.exam_round;

                          console.log(exam_round);
                          const certificationBody = {
                            data: {
                              courseID: courseArray.find(course => course.lessonId === enroll.lesson_id)?.value,
                              userID: student._id,
                              create: exam_round === 'first' ? courseArray.find(course => course.lessonId === enroll.lesson_id)?.first?.create : courseArray.find(course => course.lessonId === enroll.lesson_id)?.second?.create,
                              expire: exam_round === 'first' ? courseArray.find(course => course.lessonId === enroll.lesson_id)?.first?.expire : courseArray.find(course => course.lessonId === enroll.lesson_id)?.second?.expire,
                            },
                            options: {
                              fieldType: [],
                            }
                          };

                          try {

                            const checkCert = await fetch("https://gateway.cloudrestfulapi.com/api/certification/query", {
                              method: 'POST',
                              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                              body: JSON.stringify({
                                method: 'find',
                                args: [
                                  {
                                    $and: [
                                      { 
                                        courseID: courseArray.find(course => course.lessonId === enroll.lesson_id)?.value,
                                        userID: student._id,
                                      }
                                    ]
                                  }
                                ]
                              })
                            });
                            const ccheckCertRes = await checkCert.json();

                            if (Object.keys(ccheckCertRes).length === 0) {
                              const resAPI = await fetch('https://gateway.cloudrestfulapi.com/api/certification/', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                                body: JSON.stringify(certificationBody)
                              });

                              const certificationJSON = await resAPI.json();
                              console.log(certificationJSON);

                              if (resAPI.status===200) {
                                
                                await fetch("https://gateway.cloudrestfulapi.com/api/user/" + student._id + "/certification", {
                                  method: 'POST',
                                  headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                                  body: JSON.stringify({
                                    action: "add",
                                    element: certificationJSON._id,
                                    type: "string",
                                  })
                                });

                                await fetch("https://gateway.cloudrestfulapi.com/api/enroll/" + enrollJSON._id + "/certification", {
                                  method: 'POST',
                                  headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                                  body: JSON.stringify({
                                    action: "add",
                                    element: certificationJSON._id,
                                    type: "string",
                                  })
                                });
                                
                                console.log(`Certification created successfully`);
                              } else {
                                console.log(`Error creating Certification`);
                              }
                            } else {
                              console.log("มีใบรับรองแล้ว");
                            }
                          } catch (error) {
                            console.log(`Error creating user`);
                            console.error(error);
                          }
                          await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                        console.log(`Enroll created successfully`);
                      } else {
                        console.log(`Error creating Enroll`);
                      }
                    } else {
                      console.log("ลงทะเบียนหลักสูตรนี้แล้ว");
                    }
                  } catch (error) {
                    console.log(`Error creating user`);
                    console.error(error);
                  }
                  await new Promise(resolve => setTimeout(resolve, 1000));

                }
              }

            } catch (error) {
              console.log(error);
            }
          }

          this.loadingMessage = 'Users created successfully!';
          this.processingCount = `${totalCount}/${totalCount}`;

          this.isCreatingUser = false;
          setTimeout(() => {
            this.isShowingOverlay = false;
          }, 2000);
        } catch (error) {
          console.error(error);
        }
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
        this.getData();
      },
      handlePageChanged(page) {
        window.scrollTo(0, 0);
        this.currentPage = page;
        const session = storageManager.get('session');
        session.currentPage = this.currentPage;
        storageManager.set('session', session);
        this.getData();
      },
      clearSearchQuery() {
        this.searchQuery = ''; // Clear the searchQuery
        // Store the cleared searchQuery in session storage
        const session = storageManager.get('session');
        session.searchQuery = '';
        storageManager.set('session', session);
        this.getData(); // Fetch data with cleared searchQuery
      },
      async callAPI(token) {
        try {
          const url = `https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-3bf765c8-bb4f-4bac-ba41-9698000f7334/default/getstudentdata?id=${token}`;
          const response = await fetch(url);
          const data = await response.json();
          
          // Handle the API response data as needed
          console.log(data);
        } catch (error) {
          console.log(error);
        }
      },
      async getData() {
        console.log("getData", this.login);
        if (this.login) {
          try {
            console.log("School", this.school);
            this.loading = true;
            this.activeBlock = true

            let andConditions = [{ parent: this.session.current._id }];

            if (this.searchQuery) {
              andConditions.push({
                $or: [
                  { name: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                  { citizen: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                  { email: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                  { firstname: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                  { lastname: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                  { old_id: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                  { phone: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                  { token: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                ],
              });
            }

            if (this.statusFilter !== 'all') {
              andConditions.push({
                status: this.statusFilter
              });
            }

            const query = { $and: andConditions };
            const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                method: "find",
                args: [query],
                paging: { page: 1, limit: this.limitItem },
              }),
            };

            if (!this.searchQuery) {
              requestOptions.body = JSON.stringify({
                method: "find",
                args: [query],
                paging: { page: this.currentPage, limit: this.limitItem },
              });
            }

            const resAPI = await fetch(
              "https://gateway.cloudrestfulapi.com/api/user/query",
              requestOptions
            );

            const RestReturn = await resAPI.json();
            console.log("Get School", RestReturn);

            if (RestReturn) {
              this.currentPage  = RestReturn.paging.page;
              this.totalPages   = RestReturn.paging.totalPages;
              this.totalItems   = RestReturn.total;
              
              this.listItems = RestReturn.data.map(item => {
                const updatedItem = { ...item };

                Object.keys(updatedItem).forEach(key => {
                  const value = updatedItem[key];

                  if (typeof value === 'string') {
                    const lowerCaseValue = value.toLowerCase();
                    const searchQuery = this.searchQuery.toLowerCase();
                    const startIndex = lowerCaseValue.indexOf(searchQuery);

                    if (startIndex !== -1 && searchQuery.length > 0) {
                      const endIndex = startIndex + searchQuery.length;
                      const highlightedValue = value.substring(0, startIndex) + '<span class="text-red-500 font-bold">' +
                        value.substring(startIndex, endIndex) + '</span>' +
                        value.substring(endIndex);

                      updatedItem[key] = highlightedValue;
                    }
                  }
                });

                return updatedItem;
              }).filter(item => {
                const values = Object.values(item).join('').toLowerCase();
                const searchQuery = this.searchQuery.toLowerCase();

                return values.includes(searchQuery) || searchQuery.length === 0;
              });

              this.loading = false;
              this.activeBlock = false
            }

          } catch (error) {
            console.log(error);
          }
        }
      },
      toggleStatus(status) {
        console.log("Toggle Status", status);
        this.statusFilter = status;
        this.getData();
      }
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

        await this.getData();
      } catch (error) {
        console.log(Error);
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
      filteredListItems() {
        if (this.selectedStatus === "All") {
          return this.listItems;
        } else {
          return this.listItems.filter(item => item.status === this.selectedStatus);
        }
      }
    }
};
</script>

<template>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>
  <div>

    <Subhead 
      :navigation="
      [
        {
          name: 'ค้นหา',
          function: 'showOverlay',
          style: 'search',
          class: 'icon-btn',
          type: 'button',
        },
        {
          name: 'Select Status',
          function: 'toggleStatus',
          style: 'pencil',
          type: 'select',
          value: this.statusFilter,
          placeholder: 'เลือกสถานะ',
          options: [
            { name: 'ทั้งหมด', value: 'all' },
            { name: 'เผยแพร่', value: true },
            { name: 'ไม่เผยแพร่', value: false }
          ]
        },
        {
          name: 'Import ข้อมูล',
          function: 'callAPIWithAggregationPipeline',
          style: 'upload',
          class: 'primary-btn',
          type: 'button',
        }
      ]"
      @toggleStatus="toggleStatus"
      @callAPIWithAggregationPipeline="callAPIWithAggregationPipeline"
    />

    <div>

      <div v-if="isShowingOverlay" class="loading-overlay">
        <div class="loading-text">{{ loadingMessage }}</div>
        <div class="processing-count">{{ processingCount }}</div>
      </div>
    </div>
  
    <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t">
      <div class="mt-8">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">

          <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">



                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-100">
                      
                      <tr class="hidden md:table-row p-0 m-0 bg-gray-50 border-b border-gray-200">
                        <td colspan="4" class="p-3 m-0">
                          <div class="flex items-center">
                            <input
                              id="search"
                              type="text"
                              class="px-4 py-2 rounded-md border-gray-300 bg-white focus:outline-none"
                              placeholder="ค้นหา..."
                              v-model="searchQuery"
                            />
                            <div v-if="searchQuery.length > 0" class="">
                              <div v-if="searchQuery.length > 0" class="text-left ml-2 text-gray-500">
                                ผลการค้นหา <span class="text-black font-semibold">{{ totalItems }}</span> รายการ (s)
                              </div>
                              <div v-else class="text-left mt-2">
                                ไม่พบข้อมูล
                              </div>
                            </div>

                            <button v-if="searchQuery.length > 0"
                              @click="clearSearchQuery"
                              type="button"
                              class="ml-2 text-blue-500 hover:underline focus:outline-none"
                            >
                            Clear
                            </button>

                          </div>
                        </td>
                        <td colspan="3" class="p-3 m-0">
                          <div class="flex items-center justify-end">

                            <select v-model="limitItem" @change="handleLimitChange" class="block w-24 py-2 px-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                              <option v-for="option in limitOptions" :key="option" :value="option">{{ option }}</option>
                            </select>

                            <Pagination
                              :current-page="currentPage"
                              :total-items="totalItems"
                              :total-pages="totalPages"
                              :limit-items="limitItem"
                              :data-loading="loading"
                              :display-mode="'nav'"
                              @page-changed="handlePageChanged"
                              class="ml-2"
                            />
                            
                          </div>
                        </td>
                      </tr>

                      <tr class="table-row md:hidden p-0 m-0 border-b border-gray-200">
                        <td colspan="3" class="p-3 m-0 text-center">
                          <div class="mb-4 mx-auto max-w-full">
                            <input
                              id="search"
                              type="text"
                              class="w-full px-4 py-2 rounded-sm border-gray-300 bg-white focus:outline-none"
                              placeholder="ค้นหา..."
                              v-model="searchQuery"
                            />
                            <div v-if="searchQuery.length > 0" class="mt-2 text-gray-500">
                              ผลการค้นหา <span class="text-black font-semibold">{{ totalItems }}</span> รายการ (s)
                            </div>
                            <div v-else class="mt-2">
                              ไม่พบข้อมูล
                            </div>
                            <button v-if="searchQuery.length > 0"
                              @click="clearSearchQuery"
                              type="button"
                              class="ml-2 text-blue-500 hover:underline focus:outline-none"
                            >
                              Clear
                            </button>

                          </div>
                      
                          <div class="flex justify-center">
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
                        </td>
                      </tr>

                      <tr>
                        <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ชื่อ-นามสกุล</th>
                        <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Citizen ID</th>
                        <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">การติดต่อ</th>
                        <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ลงทะเบียน</th>
                        <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">วันที่ลงทะเบียน</th>
                        <th scope="col" class="w-20 px-3 py-3.5 text-center text-sm font-semibold text-gray-900">เครื่องมือ</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                      
                      <tr v-for="(user, index) in filteredListItems" :key="user._id">
                        <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ (currentPage - 1) * limitItem + index + 1 }}</td>
                        <td class="px-3 py-4 text-md text-gray-700 font-semibold">
                          <router-link :to="'/student/detail/'+user._id" class="text-gray-700 hover:text-indigo-600">
                            <span v-html="user.firstname + ' ' + user.lastname"></span><br><span class="text-sm font-normal text-gray-500" v-html="user.token"></span>
                          </router-link>
                        </td>
                        <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                            <font-awesome-icon :icon="['fas','id-card']" class="text-gray-500 mt-[3px] mr-1 text-md"/> <span v-html="user.citizen"></span>
                        </td>
                        <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500" >
                          <font-awesome-icon :icon="['fas','phone']" class="text-gray-500 mt-[3px] mr-2 text-md"/><span v-html="user.phone"></span><br>
                          <font-awesome-icon :icon="['fas','envelope']" class="text-gray-500 mt-[3px] mr-2 text-md"/><span v-html="user.email"></span>
                        </td>
                        <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                            <span class="font-semibold text-blue-500">{{ user.enroll ? (user.enroll.length > 0 ? user.enroll.length : '0') : '0' }}</span>
                            <font-awesome-icon :icon="['fas','book']" class="text-gray-500 mt-[3px] ml-2 text-md"/>
                        </td>
                        <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">{{ formatThaidate(user.info.regdate) }}</td>
                        <td class="relative py-4 pl-3 pr-4 text-right text-md font-medium sm:pr-6">
                          <div class="flex">
                            <button @click="$router.push('/lesson/edit/'+ user._id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                              <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                              <span>แก้ไข</span>
                            </button>
                        
                            <button @click="deleteData(user._id)" type="button" class="mr-2 hidden md:inline-flex inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                              <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                              <span>ลบ</span> 
                            </button>

                            <!-- <button @click="callAPI(user.old_id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                              <span>Call</span>
                            </button> -->

                            <button @click="createData(user.old_id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                              <font-awesome-icon :icon="['fas','link']" class="text-black mt-[3px] mr-2 text-md"/>
                              <span>Sync</span>
                            </button>

                          </div>
                        </td>                                              
                      </tr>

                      <tr class="p-0 m-0 bg-gray-50">
                        <td colspan="7" class="p-3 m-0">
                          <div class="text-center">
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
                        </td>
                      </tr>

                    </tbody>
                  </table>

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
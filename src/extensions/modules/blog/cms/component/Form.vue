<script>
import storageManager from '@/plugins/storage';
import Loader       from '@/interface/template/Loader.vue';

import Subhead from '@/interface/template/outline/Subhead.vue';
import Pagination from '@/utils/Paginated.vue';
import convertUtils from "@/plugins/convertUtils";
import ShortText from '@/utils/ShortText.vue';
import Address from '@/utils/Address.vue';
import Dataset from '@/utils/DataSet.vue';

import CustomConfirmation   from '@/utils/Confirmation.vue';

export default {
    data() {
      const session = storageManager.get('session')
      return {
        dataItem: this.$route.params.id,
        dataSub: this.$route.params.sub,
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
        debounceTimer: null,
        activeBlock: false,
        selectedStatus: '',
        lightboxVisible: false,
        selectedImage: '',
        confirmationMessage: '',
        confirmationHeader: '',
        showConfirmation: false,
        deletionData: null,
      }
    },
    components: {
      Loader,
      Subhead,
      Pagination,
      CustomConfirmation,
      ShortText,
      Address,
      Dataset
    },
    methods: {

      // Remove Function
      //
      removeItem(itemIndex) {
        this.confirmationMessage = 'คุณต้องการลบเนื้อหา (Form) นี้ ?';
        this.confirmationHeader = 'ยืนยันการทำรายการ';
        this.deletionData = {
          itemIndex
        };
        this.showConfirmation = true;
      },
      confirmRemoveItem() {
        const { itemIndex } = this.deletionData;
        console.log("Delete", itemIndex);
        this.deleteData(itemIndex);
        this.handleConfirmCancel();
      },
      handleConfirmation() {
        if (this.deletionData) {
          this.confirmRemoveItem(); // Corrected function name
        }
      },
      handleConfirmCancel() {
        this.deletionData = null;
        this.confirmationMessage = '';
        this.confirmationHeader = '';
        this.showConfirmation = false;
      },
      async deleteData(id) {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources = false;
            console.log("id",id);

            const { status } = await this.$Request.DELETE(`${this.postData.destination}/${id}`, null, this.configs.key);

            console.log(status);
            this.loading_sources = true;
            await this.getData();

          } catch (error) {
            console.log(error);
          }
        }
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
        async callAPI(token) {
            try {
            const url = `https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-3bf765c8-bb4f-4bac-ba41-9698000f7334/default/getstudentdata?id=${token}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            } catch (error) {
            console.log(error);
            }
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
        async getData() {
            try {
                if (this.login) {
                this.loading = true;
                this.activeBlock = true

                const andConditions = 
                [
                  { formID: this.dataItem }
                ];

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
                    $set: { courseID: { $toObjectId: "$courseID" } },
                },
                {
                  $lookup: {
                    from: 'course',
                    localField: 'courseID',
                    foreignField: '_id',
                    as: 'course'
                  }
                },
                {
                    $unwind: "$course"
                },
                {
                  $facet: {
                    post: [
                      {
                        $skip: (this.currentPage - 1) * this.limitItem,
                      },
                      {
                        $limit: this.limitItem,
                      },
                    ],
                    totalCount: [
                      {
                        $count: 'count',
                      },
                    ],
                  },
                },
              ];

              const requestBody = {
                pipeline: pipeline,
              };

              const { data } = await this.$Request.POST(`${this.postData.destination}/aggregate`, requestBody, this.configs.key);

              console.log(data);

              const postResults = data[0].post;
              const totalCount = data[0].totalCount[0].count;

              console.log('Post Results:', postResults);
              console.log('Total Count:', totalCount);

                if (data) {
                  const totalCount = data[0]?.totalCount?.[0]?.count || 0;

                  const formattedData = {
                    data: data[0].post,
                    total: totalCount,
                    paging: {
                      page: this.currentPage,
                      limit: this.limitItem,
                      totalPages: Math.ceil(totalCount / this.limitItem),
                    },
                  };

                  this.listItems = formattedData.data;
                  this.totalItems = formattedData.total;
                  this.totalPages = formattedData.paging.totalPages;

                  console.log("Master", formattedData.data[0].formData);

                  // Extract "name" properties from formData
                  const formDataNames = Object.keys(formattedData.data[0].formData).map(
                    (key) => formattedData.data[0].formData[key].name
                  );

                  // Extract keys from "setData" if it exists
                  const setData = formattedData.data[0].formData.setData;
                  let setDataKeys = [];
                  if (setData) {
                    setDataKeys = Object.keys(setData);
                  }

                  // Combine formDataNames and setDataKeys into this.formDataArray
                  this.formDataArray = [...formDataNames, ...setDataKeys];

                  //console.log("Header", this.formDataArray);
                  //console.log("listItems", this.listItems);

                  this.loading = false;
                  this.activeBlock = false;
                }

              }
            } catch (error) {
                console.log(error);
            }
        },
        toggleStatus(status) {
            console.log("Toggle Status", status);
            this.statusFilter = status;
            this.getData();
        },
        async checkMember(taxId, formItem) {
          try {
            const apiUrl = 'https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-e4e08b56-6cd5-4601-957e-956899e8efd6/default/fti-checkmember';
            const requestBody = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: taxId,
              }),
            };
            const response = await fetch(apiUrl, requestBody);
            const data = await response.json();
            console.log("checkMember", data);
            if (!data.message) {
              this.$swal({
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'ยังไม่ได้เป็นสมาชิก FTI Member',
                text: 'ดำเนินการส่งข้อมูลผู้ใช้งานไปยัง FTI Member',
              });
              await this.addMember(formItem);
            }
            else {
              this.$swal({
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'danger',
                title: 'เป็นสมาชิก FTI Member',
                text: 'ไม่สามารถเพิ่มข้อมูลไป FTI Member ได้',
              });
            }
          } catch (error) {
            console.log(error);
            return false;
          }
        },
        async addMember(data) {
          console.log("addMember",data.formData);
          const formDataArray = Object.values(data.formData); // Convert the formData object to an array
          const deliveryAddress = formDataArray.find(
            (field) => field.type === "address" && field.mode === "delivery"
          );
          const billingAddress = formDataArray.find(
            (field) => field.type === "address" && field.mode === "billing"
          );
          const taxAddress = formDataArray.find(
            (field) => field.type === "address" && field.mode === "tax"
          );

          const taxID = formDataArray.find(
            (field) => field.type === "taxID" && field.mode === "input"
          );

          const taxName = formDataArray.find(
            (field) => field.type === "taxName" && field.mode === "input"
          );

          console.log("taxAddress",taxAddress);
          const requestData = {
            taX_ID: taxID.value,
            owneR_NAME_TH: taxName.value,
            country: "Thailand",
            owneR_TYPE: "",
            owneR_BRANCH_CODE: "0",
            titlE_OWNER: "",
            owneR_NAME_EN: "",
            revenue: "0",
            investmenT_CAPITAL: "1000000",
            menufacturer: "0",
            distributor: "0",
            moderm: "0",
            trade: "0",
            exporter: "0",
            knoW_GS1_FROM: "0",
            knoW_GS1_FROM_DESC: "0",
            erP_REGIST_CODE: "0",
            tsiC_CODE: "0",
            membeR_TYPE: "11",
            // Contact/Billing Address
            officE_NO: deliveryAddress.value.NO,
            officE_MOO: deliveryAddress.value.MOO,
            officE_SOI_TH: deliveryAddress.value.SOI_TH,
            officE_SOI_EN: "",
            officE_BUILDING_TH: deliveryAddress.value.BUILDING_TH,
            officE_BUILDING_EN: "",
            officE_ROAD_TH: deliveryAddress.value.ROAD_TH,
            officE_ROAD_EN: "",
            officE_SUB_DISTRICT_TH: deliveryAddress.value.subdistrict,
            officE_DISTRICT_TH: deliveryAddress.value.district,
            officE_PROVINCE_TH: deliveryAddress.value.province,
            officE_SUB_DISTRICT_EN: "",
            officE_DISTRICT_EN: "",
            officE_PROVINCE_EN: "",
            officE_POST_CODE: deliveryAddress.value.zipcode.toString(),
            officE_TELEPHONE: data.formData.Mobile.value,
            officE_CODE_COUNTRY: "Thailand",
            officE_COUNTRY: "Thailand",
            officE_TELEPHONE_EXT: "",
            officE_EMAIL: [data.formData.Email.value],
            officE_WEBSITE: "www.fti.academy",
            // Tax Request Address
            taX_NO: taxAddress.value.NO,
            taX_PROVINCE_TH: taxAddress.value.province,
            taX_DISTRICT_TH: taxAddress.value.district,
            taX_SUB_DISTRICT_TH: taxAddress.value.subdistrict,
            taX_POST_CODE: taxAddress.value.zipcode.toString(),
            taX_TELEPHONE: data.formData.Mobile.value,
            taX_COUNTRY: "Thailand",
            taX_SUB_DISTRICT_EN: "",
            taX_DISTRICT_EN: "",
            taX_PROAddressVINCE_EN: "",
            taX_MOO: taxAddress.value.MOO,
            taX_SOI_TH: taxAddress.value.SOI_TH,
            taX_SOI_EN: "",
            taX_BUILDING_TH: taxAddress.value.BUILDING_TH,
            taX_BUILDING_EN: "",
            taX_ROAD_TH: taxAddress.value.ROAD_TH,
            taX_ROAD_EN: "",
            taX_CODE_COUNTRY: "Thailand",
            taX_TELEPHONE_EXT: "",
            taX_EMAIL: [data.formData.Email.value],
            taX_WERSITE: "",
            taX_BRANCH_CODE: "0",
            // Mailing 
            mailinG_NO: billingAddress.value.NO,
            mailinG_PROVINCE_TH: billingAddress.value.province,
            mailinG_DISTRICT_TH: billingAddress.value.district,
            mailinG_SUB_DISTRICT_TH: billingAddress.value.subdistrict,
            mailinG_POST_CODE: billingAddress.value.zipcode.toString(),
            mailinG_TELEPHONE: data.formData.Mobile.value,
            mailinG_COUNTRY: "Thailand",
            mailinG_MOO: billingAddress.value.MOO,
            mailinG_SOI_TH: billingAddress.value.SOI_TH,
            mailinG_SOI_EN: "",
            mailinG_BUILDING_TH: billingAddress.value.BUILDING_TH,
            mailinG_BUILDING_EN: "",
            mailinG_ROAD_TH: billingAddress.value.ROAD_TH,
            mailinG_ROAD_EN: "",
            mailinG_SUB_DISTRICT_EN: "",
            mailinG_DISTRICT_EN: "",
            mailinG_PROVINCE_EN: "",
            mailinG_CODE_COUNTRY: "Thailand",
            mailinG_TELEPHONE_EXT: "",
            mailinG_EMAIL: [data.formData.Email.value],
            mailinG_WERSITE: "",
            // Peerson Data
            authoriseD_PERSON: [
              {
                firsT_NAME_TH: data.formData.Firstname.value,
                lasT_NAME_TH: data.formData.Lastname.value,
                telephone: data.formData.Mobile.value,
                email: data.formData.Email.value,
                titlE_NAME_TH: "",
                titlE_NAME_EN: "",
                firsT_NAME_EN: "",
                lasT_NAME_EN: "",
                positioN_NAME: "",
                positioN_NAME_EN: "",
                telephonE_CODE_COUNTRY: "",
                telephonE_EXT: "",
                emailFlag: "",
              },
            ],
            barcode: {
              gcp: "1",
              gln: "1",
              barcaodE_TYPE: "128",
              barcaodE_STRUCTURE: "EAN",
              product: [
                {
                  mS_PRODUCT_CATEGORY: "",
                  mS_PRODUCT_TYPE: "",
                  totaL_PRODUCT: "",
                  mS_SALE_CHANNEL: "",
                  producT_NAME: "",
                  producT_BRAND: "",
                },
              ],
            },
          };

          console.log("requestData",requestData);
        try {
          const apiUrl = 'https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-e4e08b56-6cd5-4601-957e-956899e8efd6/default/fti-addmember';
          const requestBody = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
          };
          const response = await fetch(apiUrl, requestBody);
          const responseData = await response.json();
          console.log("addMember", responseData);
          if(responseData.message) {
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'เพิ่ม FTI Member แล้ว',
              text: responseData,
            });
          }
          else 
          {
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'danger',
              title: 'เกิดข้อผิดพลาด',
              text: responseData.error,
            });
          }
        } catch (error) {
          console.log(error);
          return false;
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
      }
    }
};
</script>

<template>

  <custom-confirmation
  v-if="showConfirmation"
  :message="confirmationMessage"
  :header="confirmationHeader"
  @confirm="handleConfirmation"
  @cancel="handleConfirmCancel"
  ></custom-confirmation>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>
  <div>

    <Subhead v-if="!this.dataSub"
      :navigation="
      [
        {
            name: 'Export CSV',
            function: 'exportToCSV',
            style: 'download',
            class: 'primary-btn',
            visible: true,
            type: 'button',
        },
        {
          name: 'ย้อนกลับ',
          link: '/cms/content',
          style: 'chevron-left',
          class: 'default-btn',
          visible: true,
          type: 'button',
        },
      ]"
      @exportToCSV="exportToCSV"
    />

    <Subhead v-else
      :navigation="
      [
        {
            name: 'Export CSV',
            function: 'exportToCSV',
            style: 'download',
            class: 'primary-btn',
            visible: true,
            type: 'button',
        },
        {
          name: 'หลักสูตร',
          link: '/lesson/detail/' + this.dataSub,
          style: 'chevron-left',
          class: 'default-btn',
          visible: true,
          type: 'button',
        },
      ]"
      @exportToCSV="exportToCSV"
    />
    <div>

      <div v-if="isShowingOverlay" class="loading-overlay">
        <div class="loading-text">{{ loadingMessage }}</div>
        <div class="processing-count">{{ processingCount }}</div>
      </div>
    </div>
  
    <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5">
      <div class="mt-8">
        <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
        <h1 class="text-2xl font-bold text-gray-900">แบบฟอร์ม : {{ postData.title }}</h1>

          <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                
                  <table class="min-w-full divide-y divide-gray-300 ">
                    <thead class="bg-gray-100">
                      
                      <tr class="hidden md:table-row p-0 m-0 bg-gray-50 border-b border-gray-200">
                        <td :colspan="formDataArray.length + 4" class="p-3 m-0">

                            <div class="flex">
                                <div class="w-1/2">
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
                                </div>
                                <div class="w-1/2">
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
                                    
                                </div>
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
                        <template v-if="!activeBlock">
                            <th scope="col" v-for="(key, index) in formDataArray" :key="index" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ key }}</th>
                        </template>
                        <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">วันที่ส่งข้อมูล</th>
                        <th scope="col" class="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">สถานะ</th>
                        <th scope="col" class="w-20 px-3 py-3.5 text-center text-sm font-semibold text-gray-900">เครื่องมือ</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">

                      <tr v-for="(item, index) in listItems" :key="item._id">
                        <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ (currentPage - 1) * limitItem + index + 1 }}</td>

                        <template v-for="(formItem, key) in item.formData" :key="key">
                          <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                            <template v-if="formItem.type === 'input' || formItem.type === 'text' || formItem.type === 'email'|| formItem.type === 'name' || formItem.type === 'mobile' || formItem.type === 'taxID' || formItem.type === 'taxName'">
                              {{ formItem.value }}
                            </template>
                            <template v-else-if="formItem.type === 'textarea'">
                              <ShortText :value="formItem.value"></ShortText>
                            </template>
                            <template v-else-if="formItem.type === 'datetime'">
                              {{ formatThaidate(formItem.value) }}
                            </template>
                            <template v-else-if="formItem.type === 'address'">
                              <Address :value="formItem.value"></Address>
                            </template>
                            <template v-else-if="formItem.type === 'checkbox'">
                              <ul>
                                <li v-for="option in formItem.value" :key="option">
                                  {{ option }}
                                </li>
                              </ul>
                            </template>
                            <template v-else-if="formItem.type === 'radiobox'">
                              {{ formItem.value }}
                            </template>
                            <template v-else-if="formItem.type === 'upload'">
                              <div class="relative cursor-pointer" @click="showLightbox(formItem.value[0])">
                                <img class="w-10 h-10 object-cover rounded-md" :src="formItem.value[0]" alt="Uploaded Image" v-if="formItem.value && formItem.value[0]">
                                <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 transition-opacity duration-300"></div>
                              </div>
                              <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50" v-if="lightboxVisible">
                                <div class="max-w-full">
                                  <img :src="selectedImage" alt="Lightbox Image" class="mx-auto max-h-full max-w-full">
                                  <button @click="closeLightbox" class="absolute top-0 right-0 m-4 text-white text-2xl">&times;</button>
                                </div>
                              </div>
                            </template>
                            
                          </td>
                        </template>   
                        
                        <!-- Loop through dynamic keys in "setData" -->
                        <template v-if="item.formData && item.formData.setData">
                          <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                            <div v-for="(contactItem, contactIndex) in item.formData.setData" :key="`contact_${contactIndex}`">
                              <!-- <pre>{{ contactItem }}</pre> -->
                              
                              <Dataset :value="contactItem"></Dataset>

                              <!-- <div v-for="(subItem, subItemKey) in contactItem" :key="`contact_${contactIndex}_sub_${subItemKey}`">
                                {{ subItemKey }}: {{ subItem.value }}
                                Count: {{ contactItem.length }}
                              </div> -->
                              
                            </div>
                          </td>
                        </template>

                        <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">{{ formatThaidate(item.createdAt) }}</td>
                        <td class="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                            <select v-model="item.status" @change="updateData(item, $event.target.value)" class="border border-gray-300 rounded-md">
                              <option value="submit" :selected="item.status === 'submit'">Submit</option>
                              <option value="pending" :selected="item.status === 'pending'">Pending</option>
                              <option value="fail" :selected="item.status === 'fail'">Fail</option>
                              <option value="confirm" :selected="item.status === 'confirm'">Confirm</option>
                              <option value="cancel" :selected="item.status === 'cancel'">Cancel</option>
                            </select>
                          </td>
                        
                        <td class="relative py-4 pl-3 pr-4 text-right text-md font-medium sm:pr-6">
                          <div class="flex">

                            <button @click="checkMember(item.formData['เลขประจำตัวผู้เสียภาษี / เลขบัตรประชาชน (กรณีออกในนามบุคคลธรรมดา)'].value,item)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                              <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                              <span>API</span>
                            </button>
                            
                            <button @click="deleteData(item._id)" type="button" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                              <font-awesome-icon :icon="['fas','square-pen']" class="text-black mt-[3px] mr-2 text-md"/>
                              <span>แก้ไข</span>
                            </button>
                          
                            <button @click="removeItem(item._id)" type="button" class="mr-2 hidden md:inline-flex inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                              <font-awesome-icon :icon="['fas','trash-can']" class="text-black mt-[3px] mr-2 text-md"/>
                              <span>ลบ</span> 
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      <tr class="p-0 m-0 bg-gray-50">
                        <td :colspan="formDataArray.length + 4" class="p-3 m-0">
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
<script>

import html2canvas from 'html2canvas';

//import {useTitle} 	from 'vue-page-title';
//import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
//import Review from '@/utils/Review.vue';
import deviceUtils from "@/plugins/DeviceUtils";

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

const statusArray = [
  { name: 'pending', label: 'รอเรียน', styleClass: 'bg-gray-300 text-gray-600', icon: 'hourglass-start' },
  { name: 'processing', label: 'กำลังเรียน', styleClass: 'bg-yellow-300 text-yellow-800', icon: 'spinner' },
  { name: 'complete', label: 'เรียนจบแล้ว', styleClass: 'bg-green-300 text-green-800', icon: 'check' },
];

export default {
	name: 'Lesson Detail',
	components: {
	},
	data() {
		return {
            defaultCoverUrl: 'https://vue-project.sgp1.digitaloceanspaces.com/default-coverjpg.jpg',

            uniqueVisitors: null,
            pageViewsPerDay: null,
            pageViewsPerWeek: null,
            pageViewsPerMonth: null,
            activeBlock: false,

            login: storageManager.get('session','login'),
            configs: storageManager.get('configs'),
            session: storageManager.get('session'),
            dataItem: this.$route.params.id,
            enroll:storageManager.get('session','enroll'),
            deviceType: deviceUtils.deviceDetect(),

            lesson:[],
            order:[],

            paymentMethods: [
                { code:'bill_payment', name: 'Bill Payment', description: 'ชำระผ่าน QR Code (อนุมัติ 1-2 วันทำการ)' },
                { code:'transfer', name: 'Bank Transfer', description: 'โอนเงินเข้าบัญชีธนาคาร (อนุมัติ 2-4 วันทำการ)' },
            ],
            selectedPaymentMethod: 'bill_payment',
            showCustomerData: false,

            firstname:'',
            lastname:'',
            phone:'',
            email:'',
            address:'',
            province:'',
            zipcode:'',

            limitItem:100,
            limitOptions: [1,10, 50, 100, 200, 500, 1000, 2000, 3000, 4000], // Define the available options
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            formattedData:[],
		}
	},
	methods: {
    async captureAndDownloadImage() {
        const targetElement = document.getElementById('payment_slip');
        if (!targetElement) {
          console.error('Target element not found.');
          return;
        }

        try {
          // Wait for the QR code to render by delaying for 1 second
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Capture the target element
          const canvas = await html2canvas(targetElement);
          const image = canvas.toDataURL('image/png');

          // Create a temporary anchor element to trigger the download
          const link = document.createElement('a');
          link.href = image;
          link.download = 'captured_image.png';
          link.click();
        } catch (error) {
          console.error('Error capturing or downloading image:', error);
        }
      },
        backCourse() {
            this.$router.push('/user/profile');
        },
        formatThaidate(date) {
            return convertUtils.toThaiDatetime(date,'short');
        },
        generateQRCodeUrl() {
            if (this.order && this.order.price !== undefined && this.order.price !== null) {
                const formattedPrice = String(this.order.price).padEnd(5, '0');
                return `https://qrcode.tec-it.com/API/QRCode?data=%7c099300013225402%0a${this.order.ref1}%0a${this.order.ref2}%0a${formattedPrice}&backcolor=%23ffffff`;
            } else {
                return "default_qr_code_url_here";
            }
        },
        selectPaymentMethod(index) {
            this.selectedPaymentMethod = this.paymentMethods[index].name;
        },
        handleLoginSuccess() {
            console.log("Login Success");
        },
        getStatus(status) {
            const statusObj = statusArray.find(item => item.name === status);
            if (statusObj) {
                return `<p class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 capitalize ${statusObj.styleClass}">
                <i class="fa fa-${statusObj.icon} mr-1 mt-1"></i>${statusObj.label}
                </p>`;
            }
            return '';
        },
        checkExam(type) {
            return this.exam.some(item => item.type === type);
        },
        formatSeconds(seconds) {
            return convertUtils.secondsToTime(seconds);
        },
        formatPrice(regular,sale) {
            return convertUtils.formatPrice(regular,sale);
        },
        finalPrice(regular, sale) {
            const finalPrice = sale || regular; // Use 'sale' if it has data, otherwise use 'regular'
            return finalPrice;
        },
        async getData() {
            try {
            this.loading_sources  = false;
            
            const resAPI      = await Request.GET(`order/${this.dataItem}`, this.configs.key);
            const RestReturn  = resAPI.data;

            if(resAPI.status===200) {
              this.order     = RestReturn;
              await this.getAllData();
            }
            } catch (error) {
              console.log(error)  
            }
        },
        async getAllData() {
        try {
            const andConditions = {
                _id: this.dataItem, // Replace 'xxx' with the actual _id value you want to search for
            };

            const pipeline = [
                {
                    $match: andConditions,
                },
                {
                  $set: {
                    userID: { $toObjectId: "$userID" },
                    courseID: { $toObjectId: "$courseID" },
                  },
                },
                {
                    $lookup: {
                    from: "user",
                    localField: "userID",
                    foreignField: "_id",
                    as: "user",
                    },
                },
                {
                  $unwind: "$user",
                },
                {
                    $lookup: {
                    from: "course",
                    localField: "courseID",
                    foreignField: "_id",
                    as: "course",
                    },
                },
                {
                  $unwind: "$course",
                },
              {
                $facet: {
                  paginatedData: [
                    { $skip: (1 - 1) * 1 },
                    { $limit: 1 },
                    {
                      $project: {
                        order: "$$ROOT",
                        user: "$user",
                        course: "$course",
                      },
                    },
                  ],
                  totalCount: [
                    { $count: "count" },
                  ],
                },
              },
            ];

            const resAPI = await Request.POST(`order/aggregate`, { pipeline }, this.configs.key);
            const restReturn = resAPI.data;

            if (restReturn) {
                const paginatedData = restReturn[0].paginatedData[0];
                const totalCount = restReturn[0].totalCount[0].count;

                this.formattedData = {
                    data: {
                    order: paginatedData.order,
                    course: paginatedData.course,
                    user: paginatedData.user,
                    },
                    total: totalCount,
                    paging: {
                    page: this.currentPage,
                    limit: this.limitItem,
                    totalPages: Math.ceil(totalCount / this.limitItem),
                    },
                };

                console.log("formattedData", this.formattedData);
            }

        } catch (error) {
          console.log(error);
        } finally {
          this.loading = false;
          this.activeBlock = false;
        }
      },
	},
    async mounted () {
      try {
        await this.getData();
      } catch (error) {
        console.log(Error);
      }
    },
    setup() {
    },
    computed: {
      loggedInComputed() {
        const login = storageManager.get('session', 'login');
        const enroll = storageManager.get('session', 'enroll');

        if (login) {
          return {
            enrollAccess(courseId) {
              if (!enroll || enroll.length === 0) {
                return false;
              }
              const course = enroll.find(item => item.courseID === courseId);
              return !!course;
            }
          };
        } else {
          return {
            enrollAccess() {
              return false;
            }
          };
        }
      },
  },
};
</script>

<template>

  <div class="bg-gray-100" v-if="formattedData && formattedData.data"   id="payment_slip">

      <div class="bg-gray-100 py-6">
        <div class="mx-auto sm:w-2/6 w-full p-3 grid grid-cols-2 gap-4">
            <div class="col-span-1">
              <img src="https://vue-project.sgp1.digitaloceanspaces.com/Logo/color-logopng.png" class="relative" style="width: 120px;">
            </div>
            <div class="col-span-1 pt-2 text-sm text-right">
                <strong>Code</strong> : {{order._id}}<br>
                <strong>Date</strong> : {{ formatThaidate(formattedData.data.order.createdAt) }}
            </div>
            <!-- Add content for the right column here -->
          </div>
                  
        <div class="mx-auto sm:w-2/6 w-full bg-white p-3 rounded-lg shadow-md relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">

            <div class="flex pt-2 pb-2 justify-content-between align-items-center">
                <h2 class="text-xl font-semibold text-gray-800 mb-3">
                  <font-awesome-icon :icon="['fas', 'shopping-bag']"/> ชำระเงิน
                </h2>
                <div v-if="formattedData.data.order" class="mb-0 ml-auto"><span class="p-1 pl-2 pr-2 text-sm rounded-md bg-indigo-600 text-white">{{ formattedData.data.order.status }}</span></div>
              </div>

            <div class="rounded-md border border-gray-200">
                <div class="mb-2 p-3 border-b border-gray-200">
                    <h2 class="text-md font-bold text-indigo-800">รายละเอียดการสั่งซื้อ</h2>
                    <div class="flex justify-between pt-2 text-gray-900">
                        <dt class="text-sm">
                            <p v-if="formattedData.data.course">{{ formattedData.data.course.name }}</p>
                            <p class="text-gray-500 mt-1" v-if="formattedData.data.order"> {{ formatThaidate(formattedData.data.order.createdAt) }}</p>
                            </dt>
                    </div>
                </div>

                <div class="mb-2 p-3 border-b border-gray-200">
                    <h2 class="text-md font-bold text-indigo-800">ผู้สั่งซื้อ</h2>
                    <div class="flex justify-between pt-2 text-gray-900">
                        <dt class="text-sm">
                            <p v-if="formattedData.data.user">{{ formattedData.data.user.firstname }} {{ formattedData.data.user.lastname }}</p>
                            <p v-if="formattedData.data.user">{{ formattedData.data.user.phone }} {{ formattedData.data.user.email }}</p>
                        </dt>
                    </div>
                </div>
                
                <div class="mb-2 p-3 border-b border-gray-200">
                    <h2 class="text-md font-bold text-indigo-800">ข้อมูลการชำระเงิน</h2>
                    <div class="flex justify-between pt-2 text-gray-600">
                        <dt class="text-sm">Ref1 : <span class="font-bold">{{order.ref1}}</span></dt>
                    </div>
                    <div class="flex justify-between text-gray-600">
                        <dt class="text-sm">Ref2 : <span class="font-bold">{{order.ref2}}</span></dt>
                    </div>
                </div>

                <div class="mb-2 p-3 pt-1 border-b border-gray-200">
                    <div class="">
                        <div class="flex justify-between text-gray-900">
                            <dt class="text-base">ยอดชำระรวม</dt>
                            <dd class="text-base font-bold">{{order.price}} ฿</dd>
                        </div>
                    </div>
                </div>

                <div class="mb-2 p-3 border-b border-gray-200">
                    <div class="flex items-center justify-center mb-4">
                        <img v-if="this.formattedData" :src="generateQRCodeUrl()" alt="QR Code" class="w-32 h-32">
                    </div>
                </div>

                <div class="mb-2 p-3">
                    <h2 class="text-md font-bold text-indigo-800">ช่องทางการชำระเงิน</h2>
                
                    <div class="space-y-2">
                        <span class="text-red-500 font-bold block">กรุณาส่งหลักฐานการชำระเงินมาที่ @doacer</span>
                        <span class="text-red-500 block pb-5">ห้ามนำ QR Code ของผู้อื่นมาชำระเงิน</span>
                        <span class="text-gray-600">
                        - ชำระเงินผ่านตู้ ATM,Mobile application ด้วยวิธีการสแกน QR Code จากใบแจ้งชำระเงิน ที่พิมพ์ออกมาหรือที่ปรากฏในจออุปกรณ์ที่ใช้งานเท่านั้น<br>
                        - กรุณาเก็บหลักฐานการชำระเงิน (Slip) เอาไว้สำหรับใช้อ้างอิง ในกรณีที่เกิดปัญหาในการตรวจสอบข้อมูล<br>
                        - ใช้เวลาในการตรวจสอบยอดการชำระประมาณ 2 วันทำการ ระบบจะแจ้งเตือนอีกครั้งเมื่อการชำระเงินได้รับการอนุมัติ<br>
                        </span>
                    </div>
                </div>

                <div class="mt-2 mb-2 pt-2 text-center border-t border-gray-200">
                  <!-- <button @click="captureAndDownloadImage" class="mr-2 bg-black hover:bg-gray-700 text-white py-3 px-6 rounded-md font-semibold focus:outline-none focus:ring focus:border-indigo-700"><font-awesome-icon :icon="['fas', 'download']"/>ดาวน์โหลดข้อมูลการชำระเงิน</button> -->
                    <button
                    @click="backCourse"
                    class="bg-black hover:bg-gray-700 text-white py-3 px-6 rounded-md font-semibold focus:outline-none focus:ring focus:border-indigo-700"
                    >
                    <font-awesome-icon :icon="['fas', 'check-circle']"/> ย้อนกลับ
                    </button>
                </div>
            
            </div>
          

        </div>
      </div>
    
    </div>
</template>

<style>
.title {
font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
display: block;
font-weight: 400;
font-size: 100px;
color: #2E495E;
letter-spacing: 1px;
font-size: 6em;
}
.green {
color: #00C48D;
}

.subtitle {
font-weight: 300;
font-size: 3em;
color: #2E495E;
word-spacing: 5px;
padding-bottom: 15px;
}

.links {
padding-top: 15px;
}

:root {
--plyr-color-main: #ff0000; /* use --color-btn-primary for NBC Theme */
}

.plyr--video {
border-radius: 10px;
}

a.block {
  position: relative;
}

a.block::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
}

a.block::before.not-available {
  content: "Not Available";
  font-size: 14px;
  text-align: center;
  background-color: #ccc;
  color: #fff;
  padding: 4px;
  border-radius: 4px;
}

a.block::before.play {
  content: "►";
  font-size: 20px;
  color: #000;
}

</style>
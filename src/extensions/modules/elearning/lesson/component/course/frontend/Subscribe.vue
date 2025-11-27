<script>
//import {useTitle} 	from 'vue-page-title';
//import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
//import Review from '@/utils/Review.vue';
import deviceUtils from "@/plugins/DeviceUtils";

const statusArray = [
  { name: 'pending', label: 'รอเรียน', styleClass: 'bg-gray-300 text-gray-600', icon: 'hourglass-start' },
  { name: 'processing', label: 'กำลังเรียน', styleClass: 'bg-yellow-300 text-yellow-800', icon: 'spinner' },
  { name: 'complete', label: 'เรียนจบแล้ว', styleClass: 'bg-green-300 text-green-800', icon: 'check' },
];

// Function to generate a random token with numbers, uppercase, and lowercase letters
function generateRandomToken(length) {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let token = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }
  return token;
}

function generateUniqueNumberByTimestamp(code) {
  const timestamp = new Date().getTime().toString(); // Get current timestamp as a string
  const uniqueNumber = code + timestamp.substr(-6); // Add '8819' to the timestamp

  return uniqueNumber;
}
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
            playOption:'step',
            certification:[],
            exam:[],
            lesson:[],
            players:[],
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
		}
	},
	methods: {
        backCourse()
        {
            this.$router.push('/lesson/detail/' + this.dataItem);
        },
        selectPaymentMethod(index) {
        // Handle the selection of the payment method
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
        formatThaidate(date) {
            return convertUtils.toThaiDatetime(date);
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
            
            const resAPI  = await fetch("https://gateway.cloudrestfulapi.com/api/course/" + this.dataItem, {
                method: 'GET',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            });
            const RestReturn   = await resAPI.json();

            if(resAPI.status===200) {
              this.lesson     = RestReturn;
              this.playOption = RestReturn.display

              // Load Certification
              const resCert = await fetch("https://gateway.cloudrestfulapi.com/api/certification/query", {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                  body: JSON.stringify({
                      method: 'find',
                      args: [
                      {
                        $and: [
                          { 
                            userID: this.session.userID,
                            courseID: this.dataItem
                          }
                        ]
                      }
                      ]
                  })
              });

              const certReturn   = await resCert.json();
              this.certification = certReturn
              //console.log("certReturn",certReturn);

              // Load Exam
              const resExam = await fetch("https://gateway.cloudrestfulapi.com/api/exam/query", {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                  body: JSON.stringify({
                      method: 'find',
                      args: [
                      {
                        $and: [
                          { 
                            courseId: RestReturn.master 
                          }
                        ]
                      }
                      ]
                  })
              });

              const examReturn   = await resExam.json();

              if(resExam.status===200) {

                const examsWithScore = await Promise.all(examReturn.map(async (exam) => {
                  const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/score/query", {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                    body: JSON.stringify({
                      method: 'find',
                      args: [
                        {
                          $and: [
                            { 
                              userID: this.session.userID,
                              examID: exam._id,
                              courseID: this.dataItem
                            }
                          ]
                        }
                      ]
                    })
                  });
                  const score = await resAPI.json();
                  return {...exam, score: score[0]};
                }));

                if(this.login) {
                  this.exam = examsWithScore;
                } else {
                  this.exam = examReturn;
                }
                
                // Load Player

                const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/player/query", {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                    body: JSON.stringify({
                        method: 'find',
                        hidden:  ['lecturer', 'updatedAt'],
                        args: [
                        {
                          $and: [
                            { 
                              courseId: RestReturn.master 
                            }
                          ]
                        }
                        ]
                    })
                });

                const playerReturn   = await resAPI.json();

                if(resAPI.status===200) {

                  if(this.login){
                    const { id } = this.$route.params;
                    const { userID } = this.session;
                    const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/progress/query", {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                        body: JSON.stringify({
                            method: 'find',
                            args: [
                            {
                              $and: [
                                { 
                                  courseID: id,
                                  userID: userID,
                                }
                              ]
                            }
                            ]
                        })
                    });

                    const progressReturn   = await resAPI.json();

                    //console.log("progressReturn",progressReturn,id);

                    if(resAPI.status===200) {

                        // Make Player Progress
                        this.progressArray  = progressReturn;

                        // Make Default Player
                        const playerID      = this.$route.params.pid;
                        const playerData    = playerReturn.find(item => item._id === playerID);

                        this.players        = playerReturn;
                        this.player         = playerData;

                        this.players = this.players.map((player) => {
                            const matchingProgress = this.progressArray.find(
                                (progressItem) => progressItem.playerID === player._id
                            );

                            if (matchingProgress) {
                                return { ...player, progress: matchingProgress };
                            }
                            return player;
                        });

                        this.$setPageTitle("Subscribe หลักสูตร " + this.lesson.name);
                        
                    }
                  }
                  else
                  {
                    this.players        = playerReturn;
                    // Set Page Title
                    this.$setPageTitle("Subscribe หลักสูตร " + this.lesson.name);
                  }
                }
              }
            }
            } catch (error) {
                console.log(error)
            }
        },
        async subscribeCourse() {
            this.activeBlock = true;

            // Check if showCustomerData is true
            if (this.showCustomerData) {
                // Validate customer information fields
                const firstName = this.firstname;
                const lastName = this.lastname;
                const phone = this.phone;
                const email = this.email;
                const address = this.address;
                const province = this.province;
                const zipCode = this.zipcode;

                // Check if any of the fields are blank
                if (
                firstName.trim() === "" ||
                lastName.trim() === "" ||
                phone.trim() === "" ||
                email.trim() === "" ||
                address.trim() === "" ||
                province.trim() === "" ||
                zipCode.trim() === ""
                ) {
                // Display an error message or handle the case where fields are blank
                // For example, you can show a validation error message to the user.
                alert("Please fill in all required fields.");
                this.activeBlock = false;
                return;
                }
            }

            // Generate random tokens
            const ref       = generateRandomToken(20); // Generate a 20-character random token
            const ref3      = generateUniqueNumberByTimestamp('88011'); // Generate a 20-character random token
            const ref_no    = generateRandomToken(32); // Generate a 32-character random ref_no
            const code      = generateRandomToken(10); // Generate a 10-character random code

            // Construct the order data
            const orderData = {
                unit: this.configs.siteID,
                courseID: this.lesson._id,
                userID: this.session.userID,
                price: this.finalPrice(this.lesson.regular_price, this.lesson.sale_price),
                payment: this.selectedPaymentMethod,
                ref: ref,
                ref1: "103-97-017",
                ref2: "3670200432621",
                ref3: ref3, // Replace with the actual ref3 if needed
                ref_no: ref_no,
                token: code,
                type: "lesson",
                code: code,
                approve: "manual",
                adddate: new Date().toISOString(),
                approve_date: null, // You may set this as needed
                confirmdate: null, // You may set this as needed
                status: "ลงทะเบียนคอร์ส",
                address: {
                delivery: {
                    address: this.address,
                    email: this.email,
                    name: this.firstName + " " + this.lastName,
                    phone: this.phone,
                    province: this.province,
                    zipcode: this.zipCode,
                },
                invoice: {
                    address: this.address,
                    email: this.email,
                    name: this.firstName + " " + this.lastName,
                    phone: this.phone,
                    province: this.province,
                    zipcode: this.zipCode,
                },
                tax: {
                    address: this.address,
                    email: this.email,
                    name: this.firstName + " " + this.lastName,
                    phone: this.phone,
                    province: this.province,
                    zipcode: this.zipCode,
                },
                },
                createdAt: new Date().toISOString(),
            };

            const requestData = {
                data: orderData, // Wrap orderData with a data object
            };

            try {
                // Send the order data to the server using a fetch request
                const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/order/", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                body: JSON.stringify(requestData),
                });

                const orderReturn   = await resAPI.json();

                if (resAPI.status === 200) {
                    this.activeBlock = false;
                    this.$router.push('/lesson/pay/' + orderReturn._id);
                } else {
                    this.activeBlock = false;
                    alert("Error: Course registration and payment failed.");
                }
            } catch (error) {
                this.activeBlock = false;
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
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

  <div class="bg-gray-100">

    
      <div class="bg-gray-100 py-6">
        <div class="mx-auto sm:w-2/6 w-full bg-white p-4 rounded-lg shadow-md relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
          <h2 class="text-2xl text-center font-semibold text-gray-800 mb-6"><font-awesome-icon :icon="['fas', 'shopping-bag']"/>  ชำระเงิน</h2>

          <h2 class="text-md p-1 pl-2 font-normal bg-indigo-800 text-white mb-4">รายละเอียดหลักสูตรที่สมัคร</h2>
      
          <!-- Product Card -->
          <div class="border rounded-lg p-2 mb-6 flex items-center">
            <!-- Product Image -->
            <img :src="lesson.cover || defaultCoverUrl" alt="Product Image" class="w-14 h-14 mr-4 rounded-md">
      
            <!-- Product Details -->
            <div>
              <p class="text-gray-600 font-medium mb-1">{{this.lesson.name}}</p>
              <p class="text-gray-600 font-medium text-sm mb-1">ราคา: {{this.finalPrice(this.lesson.regular_price, this.lesson.sale_price)}} ฿</p>
              <p class="text-gray-600 font-medium text-sm mb-1">จำนวน: 1</p>
            </div>
          </div>
      
          <!-- Order Summary -->
          <div class="mb-5">
            
            <dl class="space-y-3 text-sm font-medium text-gray-500">
              <div class="flex justify-between">
                <dt>ราคา</dt>
                <dd class="text-gray-900">{{this.finalPrice(this.lesson.regular_price, this.lesson.sale_price)}} ฿</dd>
              </div>
              <div class="flex justify-between">
                <dt>ส่วนลด</dt>
                <dd class="text-gray-900">0</dd>
              </div>
              <div class="flex justify-between border-t border-gray-200 pt-2 text-gray-900">
                <dt class="font-bold">ยอดชำระรวม</dt>
                <dd class="text-base">{{this.finalPrice(this.lesson.regular_price, this.lesson.sale_price)}} ฿</dd>
              </div>
            </dl>
          </div>

            <div class="flex items-center mb-4">
                <input type="checkbox" v-model="showCustomerData" class="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-200">
                <label for="show-customer-data" class="ml-3 text-gray-800 font-semibold">ต้องการใบเสร็จรับเงินตัวจริง</label>
            </div>
                
            <div v-if="showCustomerData">
                
                <h2 class="text-md p-1 pl-2 font-normal bg-indigo-800 text-white mb-4">ข้อมูลผู้อบรม</h2>
                
                <form class="mb-8">
                <div class="grid grid-cols-2 gap-2">
                    <div>
                    <input v-model="firstname" type="text" id="first-name" name="first-name" placeholder="ชื่อ" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-indigo-600">
                    </div>
                    <div>
                    <input v-model="lastname" type="text" id="last-name" name="last-name" placeholder="นามสกุล" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-indigo-600">
                    </div>
                    <div>
                    <input v-model="phone" type="text" id="phone" name="phone" placeholder="เบอร์โทรศัพท์" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-indigo-600">
                    </div>
                    <div>
                    <input v-model="email" type="email" id="email" name="email" placeholder="อีเมล" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-indigo-600">
                    </div>
                    <div class="col-span-2">
                    <textarea v-model="address" id="address" name="address" placeholder="ที่อยู่" class="w-full h-32 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-indigo-600"></textarea>
                    </div>
                    <div>
                    <input v-model="province" type="text" id="province" name="province" placeholder="จังหวัด" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-indigo-600">
                    </div>
                    <div>
                    <input v-model="zipcode" type="text" id="zip-code" name="zip-code" placeholder="รหัสไปรษณีย์" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-indigo-600">
                    </div>
                    
                </div>
                </form>
            </div>
            
          <!-- Payment Gateway Options -->
          <div>
            <h2 class="text-md p-1 pl-2 font-normal bg-indigo-800 text-white mb-4">ช่องทางการชำระเงิน</h2>
            <div class="space-y-2">
              <div
                v-for="(method, index) in paymentMethods"
                :key="index"
                :class="[
                  'flex', 'items-center', 'p-4', 'border', 'rounded-lg', 'hover:border-indigo-600',
                  { 'border-indigo-600': selectedPaymentMethod === method.code }
                ]"
                @click="selectPaymentMethod(method.code)"
              >
                <input
                  type="radio"
                  :id="'payment-method-' + method.code"
                  :name="'payment-method'"
                  :value="method.code"
                  v-model="selectedPaymentMethod"
                  class="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-200"
                />
                <label :for="'payment-method-' + method.code" class="ml-3 text-gray-800 font-semibold">{{ method.name }}</label>
                <p class="text-gray-500 text-sm ml-auto">{{ method.description }}</p>
              </div>
            </div>
          </div>
          
      
          <div class="mt-8 text-center">
            <button
            @click="subscribeCourse"
            class="bg-black hover:bg-gray-700 text-white py-3 px-6 rounded-md font-semibold focus:outline-none focus:ring focus:border-indigo-700"
            >
            <font-awesome-icon :icon="['fas', 'check-circle']"/> ยืนยันการลงทะเบียน
            </button>

            <button
            @click="backCourse"
            class="bg-white hover:bg-gray-100 text-black py-3 px-6 rounded-md focus:outline-none focus:ring focus:border-indigo-700 ml-2"
            >
            <font-awesome-icon :icon="['fas', 'home']"/> กลับหน้าหลักสูตร
            </button>
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
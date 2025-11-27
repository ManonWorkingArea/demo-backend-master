<script>
import {useRoute} 	from 'vue-router'
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
  const Request = new requestClient(false);
  import wallet from "@/plugins/Wallet.js";
import dialog from '@/plugins/Dialog.js';
import debug from '@/plugins/Logger.js';
import convertUtils from "@/plugins/convertUtils";
import toast from '@/plugins/ToastUI.js';

const userID = storageManager.get('session', 'userID')
export default {
	name: 'Product Index Backend',
  data() {
    const route = useRoute();
    return {
        login: storageManager.get('session', 'login'),
        session: storageManager.get('session'),
        configs: storageManager.get('configs'),
        hostname: storageManager.get('hostname'),
        dataItem: this.$route.params.code,
        PageName: route.meta.title,
        PageIcon: route.meta.icon,
        PagePath: route.meta.path,
        ParentName: route.meta.parent,
        ParentPage: route.meta.page,
        routeName:this.routeName,
        activeBlock: false,
        message: 'Wallet',
        credits: 0,
        amount: 0,
        walletMember: userID,
        walletMethod: 'deposit',
        transaction: [],
        coupon:[],
        showCompleteModal: false,
        selectedAddress: null, // To store the selected address for order summary
        showCompleteOrderModal: false,
        showModal: false,
        showProductModal: false,
        isCartOpen: false,
        showProductDetails: null,
        productList: [
          {
            name: 'King Collagen',
            image: 'https://doa-academy.sgp1.digitaloceanspaces.com/2024/02/1707894848374.jpg',
            price: 400,
            description: 'โควิก ซีซันนอล กิ๊ฟ (ผลิตภัณฑ์เสริมอาหาร) (เครื่องหมายการค้า คิง คอลลาเจน) <br/> Kovic Seasonal Gift (Dietary Supplement Product) (King Collagen®)',
            active: 'Fish Collagen Peptide (5g.)',
            age: '3 ปี  นับจากวันที่ผลิต',
            how: 'วันละ 1 หน่วย (5 กรัม) ต่อปริมาณของเหลว 150 กรัม',
          },
          {
            name: 'Cordynine',
            image: 'https://doa-academy.sgp1.digitaloceanspaces.com/2024/02/1707894845405.jpg',
            price: 300,
            description: 'โควิก ซีซันนอล กิ๊ฟ (ผลิตภัณฑ์เสริมอาหาร) (เครื่องหมายการค้า คอร์ดีนีน) <br/> Kovic Seasonal Gift (Dietary Supplement Product) (Cordynine™) ',
            active: 'Cordyceps Powder (160 mg.), L-Arginine (100 mg.), Zinc Oxide 25% (60 mg), Black Galingale Extract (40 mg.), Ginseng Extract (20 mg.), Black Pepper Powder (20 mg.)',
            age: '2 ปี  นับจากวันที่ผลิต',
            how: 'วันละ 1 แคปซูล ',
          },
          {
            name: 'Memoplexx',
            image: 'https://doa-academy.sgp1.digitaloceanspaces.com/2024/02/1707894849595.jpg',
            price: 450,
            description: 'โควิก ซีซันนอล กิ๊ฟ (ผลิตภัณฑ์เสริมอาหาร) (เครื่องหมายการค้า เมโนเพล็กซ์) <br/> Kovic Seasonal Gift (Dietary Supplement Product) (Menoplexx®) ',
            active: 'Dong Quai Extract	(80 mg), Sea Buckthorn Extract	(65 mg), Fish Collagen Peptide	(50 mg), Pomegranate Extract	(50 mg), Isolated Soy Protein	(50 mg), Cranberry Extract (40 mg), Pine Bark Extract	(30 mg), Refined Sunflowerseed Oil powder	(25 mg), Refined Flaxseed Oil Powder	(25 mg), Ginseng Extract	(20 mg), Acerola Cherry Extract	(15 mg)',
            age: '2 ปี  นับจากวันที่ผลิต',
            how: 'วันละ 1 แคปซูล',
          },
          {
            name: 'Munimax',
            image: 'https://doa-academy.sgp1.digitaloceanspaces.com/2024/02/1707894850492.jpg',
            price: 350,
            description: 'โควิก ซีซันนอล กิ๊ฟ (ผลิตภัณฑ์เสริมอาหาร) (เครื่องหมายการค้า มูนิแม็กซ์) <br/> Kovic Seasonal Gift (Dietary Supplement Product) (Munimaxx®) ',
            active: 'Acerola Cherry Extract	(300 mg),Camu-Camu Extract	(215 mg),Broccoli Powder	1(00 mg),Zinc Amino Acid Chelate 20%	(75 mg),Maitake Powder	(50 mg),Shitake Powder	(50 mg),Rose Hips Extract	(50 mg),Citrus Aurantium Extract	(50 mg),Vitamin D3 (105000IU/G)	(1.9 mg)',
            age: '2 ปี  นับจากวันที่ผลิต',
            how: 'วันละ 1 เม็ด',
          },
          {
            name: 'Fish Oil',
            image: 'https://doa-academy.sgp1.digitaloceanspaces.com/2024/02/1707894847557.jpg',
            price: 550,
            description: 'โควิก ซีซันนอล กิ๊ฟ (ผลิตภัณฑ์เสริมอาหารจากน้ำมันปลา) <br/> Kovic Seasonal Gift (Fish Oil Dietary Supplement Product) ',
            active: 'EPA and DHA 80% From Highly Concentrated Anchovy Oil	(350 mg),Wheat Germ Oli	(137.2 mg),Mixed Tocopherols (Provides Vitamin E 176 IU/G)	(12.8 mg)',
            age: '2 ปี  นับจากวันที่ผลิต',
            how: 'วันละ 2 แคปซูล',
          },
        ],
      quantity: 1,
      cart: [],
      step: 1,
      shippingData: {
        name: '',
        lastname: '',
        phone: '',
        email: '',
        address: '',
        subdistrict: '',
        district: '',
        province: '',
        postcode: ''
      },
      userAddresses: [], // To store user addresses
      headers: [],
      tableData: [],
      order:[],
      showProduct: []
    }
  },
	components: {},
	methods: {
    smoothScrollTo(targetY, duration = 500) {
      const initialY = window.scrollY;
      const yOffset = targetY - initialY;
      const startTime = performance.now();
      function scroll() {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
          window.scrollTo(0, initialY + easeInOutCubic(elapsedTime / duration) * yOffset);
          requestAnimationFrame(scroll);
        } else {
          window.scrollTo(0, targetY);
        }
      }
      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      }
      requestAnimationFrame(scroll);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('default', {dateStyle: 'short'}).format(date);
    },
    toggleProductVisibility(orderIndex) {
      this.showProduct[orderIndex] = !this.showProduct[orderIndex];
    },
    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    incrementQuantity() {
      this.quantity++;
    },
    formatPrice(number) {
      return convertUtils.formatNumber(number);
    },
    async callbackFunction() {
      try {
        console.log("callbackFunction");
      } catch (error) {
        console.error(error);
      }
    },
    // Depositing
    async deposit() {
        try {
          this.activeBlock = true
          const result = await wallet.deposit(this.walletMember, this.amount);
          if (result && result.status === 200) {
            this.balance();
            this.activeBlock = false
          }
        } catch (error) {
          console.error("Error", error);
        }
    },
    // Withdraw
    async withdraw() {
      try {
        this.activeBlock = true
        const result = await wallet.withdraw(this.walletMember, this.amount);
        if (result && result.status === 200) {
            this.balance();
            this.activeBlock = false
        }
      } catch (error) {
          console.error("Error", error);
      }
    },
    // Transferring
    async transfer() {
      try {
          dialog.confirm({
              title: 'คุณต้องการโอนคะแนน?',
              message: 'โอนยอด ' + this.amount + ' เข้าสู่บัญชีของสมาชิกอื่น !',
              confirm: async () => {
              try {
                  const result = await wallet.transfer(this.walletMember, this.targetMemberId, this.amount);
                  if (result && result.status === 200) {
                      this.balance();
                  }
              } catch (error) {
                  debug.log(error)
              }
              },
              cancel: () => {}
          });
      } catch (error) {
        console.error("Error", error);
      }
    },
    // Balance
    async balance() {
        try {
            await wallet.balance(this.walletMember);
            this.credits = wallet.credits
        } catch (error) {
            console.error("Error", error);
        }
    },
    // Balance
    async reset() {
        try {
            dialog.confirm({
                title: 'คุณต้องการรีเซ็ตคะแนน?',
                message: 'ลบยอด ' + this.credits + ' จากบัญชีของคุณ !',
                confirm: async () => {
                try {
                    await wallet.reset(this.walletMember);
                    this.credits = wallet.credits
                } catch (error) {
                    debug.log(error)
                }
                },
                cancel: () => {}
            });
        } catch (error) {
            console.error("Error", error);
        }
    },
    // Transaction
    async balanceTransactions() {
        try {
            const transaction = await wallet.transaction(this.walletMember, 5);
            this.transaction = transaction
            debug.log('Transaction logs:', transaction);
        } catch (error) {
            console.error("Error", error);
        }
    },
    // HandleSubmit
    async handleSubmit() {
        if (this.walletMethod === 'deposit') {
            this.deposit();
        } else if (this.walletMethod === 'transfer') {
            this.transfer();
        } else if (this.walletMethod === 'withdraw') {
            this.withdraw();
        } else if (this.walletMethod === 'balance') {
            this.balance();
        }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const csvData = e.target.result;
          this.processCSVData(csvData);
        };
        reader.readAsText(file);
      }
    },
    processCSVData(csvData) {
      // Split the CSV data by new line and filter out any empty lines
      const lines = csvData.split(/\r\n|\n/).filter(line => line);

      // Extract headers
      this.headers = lines[0].split(',').map(header => header.replace(/['"]+/g, '').trim());

      // Extract the rest of the rows
      this.tableData = lines.slice(1).map(line => {
        const columns = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!columns) return {};
        // Map the values to the headers
        const row = {};
        this.headers.forEach((header, index) => {
          row[header] = columns[index] && columns[index].replace(/['"]+/g, '').trim();
        });
        return row;
      });
    },
    async importDataToDB() {
      for (let row of this.tableData) {
        let modifiedRow = { ...row };
        if (modifiedRow['Coupon Code'] !== undefined) {
          modifiedRow['code'] = modifiedRow['Coupon Code'];
          delete modifiedRow['Coupon Code']; // Remove the old key
        }
        if (modifiedRow['Expire Date'] !== undefined) {
          modifiedRow['expire'] = modifiedRow['Expire Date'];
          delete modifiedRow['Expire Date']; // Remove the old key
        }

        const requestData = {
          data: {
            ...modifiedRow,
            unit: this.configs.siteID, // Assuming this is how you get the current session's ID
          },
        };

        try {
          const resAPILogin = await Request.POST('coupons', requestData, this.configs.key); // Use your actual API call method
          if (resAPILogin.status === 200) {
            console.log('Row imported successfully:', modifiedRow);
          } else {
            console.error('Failed to import row:', modifiedRow);
          }
        } catch (error) {
          console.error('Error importing row:', modifiedRow, error);
        }
      }
    },
    async checkCouponsExists(code) {
        try {
            const resAPICoupon = await Request.POST('coupons/query', {
                method: 'find',
                args: [{
                    $and: [
                      { code: code, unit: this.configs.siteID }
                    ]
                }]
            }, this.configs.key);
            const getCoupon = resAPICoupon.data[0];
            this.coupon = getCoupon;
            this.getUserData();
            console.log("checkCouponsExists");
        } catch (error) {
          console.error('Error checking user existence:', error);
          throw error;
        }
    },
    async getUserOrder() {
        try {
            const resAPICoupon = await Request.POST('orders/query', {
                method: 'find',
                args: [{
                    $and: [
                      { userId: this.walletMember, unit: this.configs.siteID }
                    ]
                }]
            }, this.configs.key);
            const getCoupon = resAPICoupon.data;
            this.order = getCoupon;
            console.log("getUserOrder");
        } catch (error) {
          console.error('Error checking user existence:', error);
          throw error;
        }
    },
    generateRandomString(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
    generateStateWithRedirect(redirectPath) {
      const stateData = { 
        random: this.generateRandomString(12),
        redirect: redirectPath,
        siteID: this.configs.siteID
      };
      return btoa(JSON.stringify(stateData)); 
    },
    loginWithLine() {
      const clientId        = this.configs.line?.client_id;
      const redirectUri     = encodeURIComponent(this.configs.line?.callback);
      const state           = this.generateStateWithRedirect('/redeem-coupon/' + this.dataItem);
      const scope           = 'profile openid';
      const botPrompt       = 'aggressive';
      window.location.href  = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}&bot_prompt=${botPrompt}`;
    },
    redeemCoupon() {
      this.showModal = true;
    },
    nextStep() {
      if (this.step < 3) {
        this.step++;
      }
    },
    prevStep() {
      if (this.step > 1) {
        this.step--;
      }
    },
    openAddress() {
      if(this.userAddresses.length > 0) {
        this.toast = toast({ type: 'error', message: 'ยังไม่สามารถเพิ่มที่อยู่เพิ่มได้ในขณะนี้', autohide: true });
      } else {
      this.showModal = true;
      }
    },
    closeModal() {
      this.showModal = false;
    },
    openProductModal() {
      //document.body.classList.add('body-scroll-lock');
      this.showProductModal = true;
      const panelElement = document.getElementById(`step3Container`);
      if (panelElement) {
        const scrollY = panelElement.getBoundingClientRect().top + window.scrollY - 10;
        this.smoothScrollTo(scrollY);
      }
    },
    closeProductModal() {
      //document.body.classList.remove('body-scroll-lock');
      this.showProductDetails = false;
      this.showProductModal = false;
    },
    async getUserData() {
      console.log("Login",this.login);
      if(this.login) {
        try {
          const { status, data } = await Request.GET(`user/${this.session.userID}`, this.configs.key);
          if (status === 200) {
            if (data && data.addresses && data.addresses.length > 0) {
              this.userAddresses = data.addresses;
            } else {
              this.userAddresses = [];
            }
            this.balance();
            this.getUserOrder()
            console.log("Balance");
          } else {
            console.error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    },
    addToCart(product, quantity) {
      const totalPrice = product.price * quantity;
      const cartTotalPrice = this.cart.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
      const newCartTotalPrice = cartTotalPrice + totalPrice;
      if (newCartTotalPrice <= this.credits) {
        const itemIndex = this.cart.findIndex(item => item.product === product);
        if (itemIndex !== -1) {
          this.toast = toast({ type: 'success', message: 'เพิ่มจำรนวนสินค้าให้ตะกร้าแล้ว', autohide: true });
          this.cart[itemIndex].quantity += quantity;
        } else {
          this.toast = toast({ type: 'success', message: 'เพิ่มสินค้าใหม่ในตะกร้าแล้ว', autohide: true });
          this.cart.push({ product, quantity });
        }
        this.quantity = 1
      } else {
        this.toast = toast({ type: 'error', message: 'มูลค่าสินค้ามากกว่าแต้มในระบบ', autohide: true });
        this.quantity = 1
      }
    },
    removeFromCart(index) {
      this.cart.splice(index, 1);
    },
    toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  },
  closeCart() {
    this.isCartOpen = false;
  },
   // Method to open the custom modal for order summary
   completeOrder() {
      // Check if an address is selected
      if (this.userAddresses.length > 0) {
        // Assuming the first address is selected here
        this.selectedAddress = this.userAddresses[0];
        // Open the modal
        this.showCompleteModal = true;
        const panelElement = document.getElementById(`step4Container`);
        if (panelElement) {
          const scrollY = panelElement.getBoundingClientRect().top + window.scrollY - 10;
          this.smoothScrollTo(scrollY);
        }
      } else {
        alert("Please select an address before completing the order.");
      }
    },
    // Method to close the order summary modal
    closeCompleteModal() {
      this.showCompleteModal = false;
      this.selectedAddress = null; // Reset selected address
    },
  async placeOrder() {
    this.activeBlock = true
    // Calculate total points used
    const totalPointsUsed = this.cartTotal;

    // Check if user has enough points
    if (totalPointsUsed > this.credits) {
      alert("Insufficient points to place this order.");
      return;
    }

    // Prepare data for the API request
    const requestData = {
      data: {
        address: {
          name: this.selectedAddress.name,
          lastname: this.selectedAddress.lastname,
          phone: this.selectedAddress.phone,
          address: this.selectedAddress.address,
          subdistrict: this.selectedAddress.subdistrict,
          district: this.selectedAddress.district,
          province: this.selectedAddress.province,
          postcode: this.selectedAddress.postcode
        },
        products: this.cart.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        unit: this.configs.siteID, 
        totalprice: this.cartTotal,
        userId: this.walletMember,
        process: 'pending',
        status: false
      }
    };

    try {
      // Make API call to place the order
      const res = await Request.POST('orders', requestData, this.configs.key);

      // Check if the API call was successful
      if (res.status === 200) {
        // Deduct points from user's total points
        //this.credits -= totalPointsUsed;
        this.toast = toast({ type: 'success', message: 'สั่งซื้อสินค้าสำเร็จ', autohide: true });
        this.amount = parseFloat(totalPointsUsed);
        this.withdraw();
        this.checkCouponsExists(this.dataItem);
        this.activeBlock = false

        // Clear the cart
        this.cart = [];

        // Show the complete order modal
        this.showCompleteModal = false;
        this.showCompleteOrderModal = true;
      } else {
        alert("Failed to place the order. Please try again later.");
      }
    } catch (error) {
      console.error("Error occurred while placing the order:", error);
      alert("An error occurred while placing the order. Please try again later.");
    }
  },
  // Method to close the complete order modal
  closeCompleteOrderModal() {
    this.showCompleteOrderModal = false;
  },
  async redeemCouponCode() {
      try {
        this.activeBlock = true

        if(this.coupon.status==='pending') {
          const requestBody = {
            data: {
              status: 'active',
              userID: this.walletMember,
            },
            options: {}
          };

          const { data, status } = await this.$Request.PUT(`coupons/${this.coupon._id}`, requestBody, this.configs.key);

          console.log(data);

          if (status === 200) {
            this.toast = toast({ type: 'success', message: 'Redeem โค๊ดสำเร็จ', autohide: true });
            this.amount = parseFloat(this.coupon.volume);
            this.deposit();
            this.checkCouponsExists(this.dataItem);
            this.activeBlock = false
          }
        } else {
          this.toast = toast({ type: 'error', message: 'ไม่สามารถ Redeem โค๊ดซ้ำได้', autohide: true });
          this.activeBlock = false
          console.log('Cant Redeem');
        }
      } catch (error) {
        console.log(error);
      }
    },
    async submitForm() {
        // Construct the new address item
        const newAddressItem = {
            name: this.shippingData.name,
            lastname: this.shippingData.lastname,
            phone: this.shippingData.phone,
            email: this.shippingData.email,
            address: this.shippingData.address,
            subdistrict: this.shippingData.subdistrict,
            district: this.shippingData.district,
            province: this.shippingData.province,
            postcode: this.shippingData.postcode
        };

        // Add the new address item to your existing addresses array or create a new array if it doesn't exist
        const updatedAddresses = this.userAddresses ? [...this.userAddresses, newAddressItem] : [newAddressItem];

        // Prepare the request data object
        const requestData = {
            data: {
              addresses: updatedAddresses
            }
        };

        try {
            this.activeBlock = true
            // Make the PUT request to update the form data
            const resAPIupdateForm = await Request.PUT(`user/${this.session.userID}`, requestData, this.configs.key);
            console.log('Form data updated successfully:', resAPIupdateForm);
            this.showModal = false; // Close the modal after successful update
            this.toast = toast({ type: 'success', message: 'เพิ่มที่อยู่สำเร็จ', autohide: true });
            this.getUserData();
            this.activeBlock = false
        } catch (error) {
            console.error('Error updating form data:', error);
            // Handle error if necessary
        }
    }
  },
  computed: {
    formattedActive() {
      const activeString = this.showProductDetails.active;
      const activeComponents = activeString.split(', ');
      return activeComponents.map(component => `<p class="bg-blue-500 text-white rounded-sm px-2 py-1 mr-2 mb-1 text-sm">${component}</p>`).join('');
    },
    // Computed property to calculate cart total
    cartTotal() {
      return this.cart.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
    }
  },
  mounted() {
    this.checkCouponsExists(this.dataItem);
    this.getUserData();
  },
  setup() {
  },
};
</script>

<template>
  <div class="bg-gray-50 relative"  :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
    
    <!-- <div>
      <input type="file" @change="handleFileUpload" accept=".csv" />
      <table v-if="tableData.length > 0">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.id">
            <td>{{ row['Coupon Code'] }}</td>
            <td>{{ row['Volume'] }}</td>
            <td>{{ row['Lot'] }}</td>
            <td>{{ row['Expire Date'] }}</td>
            <td>{{ row['Status'] }}</td>
          </tr>
        </tbody>
      </table>
      <button @click="importDataToDB">Import</button>
    </div> -->

    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div class="sm:mx-auto sm:w-full sm:max-w-lg">
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Redeem Card</h2>
        <p class="mt-2 text-center text-md text-gray-600">
          แลกแต้มของขวัญ
        </p>
        
      </div>
      
      <div class="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="px-2 py-4">
          <div v-if="coupon">
            <div v-if="coupon.status=='pending'" id="credit-card-container" class="h-56 w-86 mb-5 rounded-lg bg-gradient-to-tr from-indigo-900 to-blue-700 group shadow-xl text-blue-200 tracking-wide font-semibold transform transition duration-500 ease-in-out rotate-0 scale-100 hover:shadow-2xl">
              <div id="dots-texture" class="h-full w-full relative rounded-2xl">
                <div id="credit-card-body" class="absolute w-full h-full grid grid-flow-row grid-cols-3 grid-rows-7">
                  
                  <div class="row-span-1 col-span-3 flex flew-wrap content-center">
                      <span class="text-md pl-6 pt-6 w-full font-thin inline-block align-text-top text-blue-300">Kovic Privilege Health Card</span>
                      <span class="text-2xl font-bold italic text-right pr-6 pt-6 text-blue-300">{{formatPrice(coupon.volume)}}</span>
                  </div>
                  
                  <div id="credit-card-num" class="px-6 tracking-widest row-span-3 col-span-3 w-full flex flex-wrap content-center text-blue-200">
                      <div class="text-xl">{{coupon.code}}</div>
                  </div>
                  
                  <div id="" class="col-span-3 row-span-2 px-6 bg-gray-500 bg-opacity-20 rounded-b-2xl border-t-2 border-indigo-600 w-full grid grid-cols-3 grid-rows-2 w-full text-gray-50 text-opacity-70">
                      <div id="credit-card-name" class="tracking-widest col-span-2 self-end w-full">Premium</div>
                      <div id="credit-card-date" class="col-span-3 self-start text-sm">{{coupon.expire}}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="h-56 w-86 mb-5 rounded-lg bg-gray-500 group shadow-xl text-gray-200 tracking-wide font-semibold transform transition duration-500 ease-in-out rotate-0 scale-100 hover:shadow-2xl flex flex-col justify-center items-center">
            <div class="text-xl text-center">{{dataItem}}</div>
            <span class="text-center font-normal">ขออภัย ไม่พบคูปองนี้ ติดต่อทีมงานเพื่อตรวจสอบข้อมูล</span>
          </div>
      
          <div class="flex flex-col gap-4" v-if="this.login" >

            <div class="sm:mx-auto sm:w-full sm:max-w-lg flex justify-between mt-2 bg-white border border-gray-200 rounded-lg p-4 text-gray-600">
                <!-- Column for User Points (Wallet) -->
                <div class="flex items-center pl-3">
                    <font-awesome-icon :icon="['fas','wallet']" class="mr-2"/> <!-- Adjust the margin as needed -->
                    <span><strong>{{ formatPrice(credits) }}</strong> Point</span>
                </div>
                <!-- Column for Cart Total -->
                <div class="flex items-center pr-3">
                    <div class="cart-icon" @click="toggleCart">
                        <font-awesome-icon :icon="['fas','shopping-cart']"/> {{ formatPrice(cartTotal) }}
                    </div>
                </div>
            </div>
        
            <div :class="{ 'opacity-50': coupon.status === 'active' }" class="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm p-4">

              <div 
              :class="{
              'bg-green-500': coupon.status === 'active',
              'bg-gray-500': coupon.status === 'pending'
              }"
              class="flex items-center justify-center w-6 h-6 text-white rounded-full mr-2">

              <font-awesome-icon 
              :icon="[
              coupon.status === 'active' ? 'fas' : 'fas',
              coupon.status === 'active' ? 'check' : 'hourglass-half'
              ]" 
              class="text-white text-sm" />
              </div>
        
              <div class="flex-1">
                <p class="text-gray-900 text-lg font-semibold">ขั้นตอนที่ 1</p>
              </div>

              <div class="">
                <button @click="redeemCouponCode" class="flex px-3 py-2 w-full items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg focus:outline-none focus:shadow-outline transform transition-colors duration-150">
                  <font-awesome-icon :icon="['fas','exchange']" class="mr-2"/> แลกแต้ม
                </button>
              </div>

            </div>
        
            <div :class="{ 'opacity-50': coupon.status === 'pending' || userAddresses.length > 0 }" class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div class="flex items-center ">
                <div 
                :class="{
                  'bg-green-500': userAddresses.length > 0,
                  'bg-gray-500': userAddresses.length === 0
                  }"
                class="flex items-center justify-center w-6 h-6 text-white rounded-full mr-2">
                <font-awesome-icon 
                :icon="[
                coupon.status === 'active' ? 'fas' : 'fas',
                userAddresses.length > 0 ? 'check' : 'hourglass-half'
                ]" 
                class="text-white text-sm" />
                </div>
                <div class="flex-1">
                  <p class="text-gray-900 text-lg font-semibold">ขั้นตอนที่ 2</p>
                </div>
                <div class="">
                  <button @click="openAddress" class="flex px-3 py-2 w-full items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg focus:outline-none focus:shadow-outline transform transition-colors duration-150">
                    <font-awesome-icon :icon="['fas','map']" class="mr-2"/> เพิ่มที่อยู่
                  </button>
                </div>
              </div>

              <div v-if="userAddresses.length > 0" class="mt-2">
                <div v-for="(address, index) in userAddresses" :key="index" class="flex items-center">
                    <div class="col-auto">
                      <input type="radio" name="selectedAddress" class="mr-2" :checked="userAddresses.length === 1 && index === 0">
                    </div>
                    <div class="col flex-1 text-left ml-2 pl-3 border-l border-gray-200 text-sm">
                      <div><strong>ชื่อ: </strong>{{ address.name }} {{ address.lastname }}</div>
                      <div><strong>เบอร์โทร: </strong> {{ address.phone }}</div>
                      <div><strong>ที่อยู่: </strong> {{ address.address }} {{ address.province }},{{ address.postcode }}</div>
                    </div>
                    <div class="col-auto">
                        <button class="bg-blue-500 text-white px-2 py-1 rounded-md text-sm">แก้ไข</button>
                    </div>
                </div>
              </div>
            </div>
        
            <div :class="{ 'opacity-50': coupon.status === 'pending' }" id="step3Container" class="z-50 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
             
              <div class="flex items-center ">
                <div
                  :class="{
                    'bg-green-500': cart.length > 0,
                    'bg-gray-500': cart.length === 0
                  }"
                  class="flex items-center justify-center w-6 h-6 bg-gray-500 text-white rounded-full mr-2"
                >
                  <font-awesome-icon 
                    :icon="[
                      coupon.status === 'active' ? 'fas' : 'fas',
                      cart.length > 0 ? 'check' : 'hourglass-half'
                    ]" 
                    class="text-white text-sm"
                  />
                </div>
                <div class="flex-1">
                  <p class="text-gray-900 text-lg font-semibold">ขั้นตอนที่ 3</p>
                </div>
                <div class="">
                  <button @click="openProductModal" class="flex px-3 py-2 w-full items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg focus:outline-none focus:shadow-outline transform transition-colors duration-150">
                    <font-awesome-icon :icon="['fas','box']" class="mr-2"/> เลือกสินค้า
                  </button>
                </div>
              </div>
              <div v-if="cart.length > 0" class="bg-white border border-gray-200 p-2 mt-2">
                <h2 class="font-semibold">รายการสินค้า</h2>
                <div v-for="(item, index) in cart" :key="index" class="cart-item">
                  <div class="grid grid-cols-3 gap-4">
                    <p class="col-span-2">{{ item.product.name }}</p>
                    <div class="col-span-1 flex justify-between">
                      <p>x{{ item.quantity }}</p>
                      <p>{{ formatPrice(item.product.price * item.quantity) }}</p>
                      <button @click="removeFromCart(index)" class="text-red-500"><font-awesome-icon :icon="['fas','trash']" class="text-sm"/></button>
                    </div>
                  </div>
                </div>
                <p class="font-semibold mt-1">ยอดรวม : {{ formatPrice(cartTotal) }} Point</p>
              </div>

              <!-- Product list modal -->
              <div v-if="showProductModal" class="flex items-center justify-center pt-4 mt-4 text-center sm:block sm:p-0 border-t border-gray-200">
                <div class="modal-container">
                  <div class="bg-white rounded-md text-left transform transition-all max-w-lg w-full mx-auto">
                    <div class="modal-content">
                      <div v-if="!showProductDetails">
                        <div class="flex justify-between items-center mb-2">
                          <h3 class="text-lg font-semibold">เลือกสินค้า</h3>
                          <button @click="closeProductModal" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded focus:outline-none focus:shadow-outline transform transition-colors duration-150">ปิด</button>
                        </div> 
                        <div class="product-list mt-2">
                          <div v-for="(product, index) in productList" :key="index" class="product" @click="showProductDetails = product">
                            <img :src="product.image" alt="Product Image" class="mb-2">
                            <p>{{ product.name }}</p>
                            <p class="font-semibold">{{ product.price }} Point</p>
                          </div>
                        </div>
                      </div>
                      <div v-if="showProductDetails">
                        <div class="product-details">
                          <div class="flex justify-between items-center mb-2">
                            <h3 class="text-lg font-semibold">{{ showProductDetails.name }}</h3>
                            <div>
                              <button @click="showProductDetails = null" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded focus:outline-none focus:shadow-outline transform transition-colors duration-150">ย้อนกลับ</button>
                              <button @click="closeProductModal"  class="ml-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded focus:outline-none focus:shadow-outline transform transition-colors duration-150">ปิด</button>
                            </div>
                          </div>
                          <div class="relative">
                            <div class="ribbon ribbon-top-left"><span>สินค้าใหม่</span></div>     
                            <img :src="showProductDetails.image" alt="Product Image" class="mb-2">
                          </div>
                          <div class="flex items-center mt-4 mb-4">
                            <!-- Price Column -->
                            <div class="flex items-center mr-4">
                              <p class="font-semibold">ราคา {{ showProductDetails.price }} Point <small class="text-gray-500 font-normal text-xs">ราคารวมจัดส่ง</small></p>
                            </div>
                            <!-- Quantity Column -->
                            <div class="flex items-center">
                              <button @click="decrementQuantity" class="text-gray-500 px-3 py-2 border border-gray-300 rounded-l-md text-lg">-</button>
                              <input type="number" v-model="quantity" class="w-20 px-3 py-2 border border-gray-300 rounded-none text-center text-lg">
                              <button @click="incrementQuantity" class="text-gray-500 px-3 py-2 border border-gray-300 rounded-r-md text-lg">+</button>
                            </div>
                          </div>
                          <button @click="addToCart(showProductDetails, quantity)" class="w-full mb-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded focus:outline-none focus:shadow-outline transform transition-colors duration-150"><font-awesome-icon :icon="['fas','plus']" class="mr-2"/> เพิ่มสินค้า</button>
                          <p v-html="showProductDetails.description"></p>
                          <p class="font-bold">อายุการเก็บรักษา</p>
                          <p v-html="showProductDetails.age"></p>
                          <p class="font-bold">วิธีการรับประทาน</p>
                          <p v-html="showProductDetails.how"></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            <div :class="{ 'opacity-50': coupon.status === 'pending' }" id="step4Container" class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 ">
              <div class="flex items-center mb-3">
                <div class="flex items-center justify-center w-6 h-6 bg-gray-500 text-white rounded-full mr-2">
                  <i class="fas fa-hourglass-half text-sm"></i>
                </div>
                <div class="flex-1">
                  <p class="text-gray-900 text-lg font-semibold">ขั้นตอนที่ 4</p>
                </div>
                <div class="">
                  <button @click="completeOrder" class="flex px-3 py-2 w-full items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg focus:outline-none focus:shadow-outline transform transition-colors duration-150">
                    <font-awesome-icon :icon="['fas','check-circle']" class="mr-2"/> ยืนยันการสั่งซื้อ
                  </button>
                </div>
              </div>

              <div v-if="order.length>0">

                <h3 class="font-semibold w-full text-center text-gray-500 mt-2 mb-3 ">คำสั่งซื้อ</h3>

                <div v-for="(orderItem, orderIndex) in order" :key="orderIndex" class="pt-3 pb-2 border border-gray-200 rounded-sm mb-2">

                  <div class="grid grid-cols-3 gap-2 p-2 text-sm" @click="toggleProductVisibility(orderIndex)">
                    <div>
                      <p class="font-bold">{{ formatPrice(orderItem.totalprice) }} Point</p>
                    </div>
                    <div class="text-center">
                      <p>{{ formatDate(orderItem.createdAt) }}</p>
                    </div>
                    <div class="text-right">
                      <p><span class="bg-blue-500 text-white text-xs p-2">{{ orderItem.status ? 'Completed' : 'Pending' }}</span></p>
                    </div>
                  </div>
                  <div v-if="showProduct[orderIndex]">
                    <div class="text-sm pl-2 pr-2 pt-3">
                      <h3 class="font-semibold">สินค้า</h3>
                      <div v-for="(item, index) in orderItem.products" :key="index" class="cart-item">
                        <div class="grid grid-cols-3 gap-2 text-sm">
                          <p class="col-span-2 pl-2 pr-2">{{ item.name }}</p>
                          <div class="col-span-1  pl-2 pr-2 flex justify-between">
                            <p>x{{ item.quantity }}</p>
                            <p>{{ formatPrice(item.price * item.quantity) }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="text-sm pl-2 pr-2 pt-3">
                      <h3 class="font-semibold">ที่อยู่</h3>
                      <h3 class="font-semibold">{{ orderItem.address.name }} {{ orderItem.address.lastname }}</h3>
                      <p>{{ orderItem.address.address }}, {{ orderItem.address.subdistrict }}, {{ orderItem.address.district }}, {{ orderItem.address.province }} {{ orderItem.address.postcode }}</p>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Custom modal for order summary -->
              <div v-if="showCompleteModal" class="flex items-center justify-center mt-2 pt-2 border-t border-gray-200">
                <!-- Modal content -->
                <div class="bg-white w-full mx-2">
                  <div class="">
                    <div class="flex justify-between items-center mb-4">
                      <h3 class="text-lg font-medium leading-6 text-gray-900">สรุปยอดคำสั่งซื้อ</h3>
                      <button @click="closeCompleteModal" type="button" class="inline-block px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">ปิด</button>
                    </div>
                    
                    <!-- Display selected address -->
                    <div class="mb-6">
                      <h4 class="text-base font-semibold">ที่อยู่ในการจัดส่ง:</h4>
                      <p class="mt-2 text-sm">{{ selectedAddress.name }} {{ selectedAddress.lastname }}</p>
                      <p class="text-sm">{{ selectedAddress.phone }}</p>
                      <p class="text-sm">{{ selectedAddress.address }}, {{ selectedAddress.subdistrict }}, {{ selectedAddress.district }}, {{ selectedAddress.province }}, {{ selectedAddress.postcode }}</p>
                    </div>

                    <!-- Display cart items -->
                    <div class="mb-6">
                      <h4 class="text-base font-semibold">รายการสินค้า:</h4>

                      <div v-for="(item, index) in cart" :key="index" class="cart-item">
                        <div class="grid grid-cols-3 gap-4">
                          <p class="col-span-2">{{ item.product.name }}</p>
                          <div class="col-span-1 flex justify-between">
                            <p>x{{ item.quantity }}</p>
                            <p class="font-bold">{{ formatPrice(item.product.price * item.quantity) }}</p>
                          </div>
                        </div>
                      </div>

                    </div>

                    <!-- Display total price -->
                    <div class="mb-6 flex justify-between">
                      <h4 class="text-base font-semibold">ยอดรวม:</h4><span class="text-lg font-bold">{{ formatPrice(cartTotal) }} <small class="font-normal">Point</small></span>
                    </div>
                    <span class="text-gray-500">* ยอดรวมคำสั่งซื้อรวมค่าจัดส่งสินค้าแล้ว</span>
                  </div>
                  <div class="bg-gray-50 px-4 py-3 flex justify-end">
                    <!-- Add Place Order button -->
                    <button v-if="cart.length > 0" @click="placeOrder" class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-150"><font-awesome-icon :icon="['fas','check-circle']" class="mr-2"/> ยืนยันการสั่งซื้อ</button>
                  </div>
                </div>
              </div>
              
            </div>
            
          </div>

          <div v-if="!this.login" class="text-center">
            <div v-if="coupon.status === 'pending'">
              <button @click="loginWithLine" class="flex px-3 py-4 mt-2 w-full items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg focus:outline-none focus:shadow-outline transform transition-colors duration-150">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE logo" class="h-6 w-6 mr-2">
                Login with LINE
              </button>
            </div>
            <div v-else>
              <div class="h-56 w-86 mb-5 rounded-lg bg-gray-500 group shadow-xl text-gray-200 tracking-wide font-semibold transform transition duration-500 ease-in-out rotate-0 scale-100 hover:shadow-2xl flex flex-col justify-center items-center">
                <div class="text-xl text-center">{{dataItem}}</div>
                <span class="mt-2 text-center font-normal">ขออภัย คูปองนี้ถูกใช้งานแล้ว <br/>ติดต่อทีมงานเพื่อตรวจสอบข้อมูล</span>
              </div>
              <button @click="loginWithLine" class="flex px-3 py-4 mt-2 w-full items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg focus:outline-none focus:shadow-outline transform transition-colors duration-150">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE logo" class="h-6 w-6 mr-2">
                Login with LINE
              </button>
            </div>
          </div>

          <!-- <div v-else class="text-center">

            <div v-if="userAddresses.length > 0" class="mb-6">
              <h2 class="text-xl font-semibold mb-2">ที่อยู่</h2>
              <div v-for="(address, index) in userAddresses" :key="index" class="bg-white rounded-lg shadow-md p-4 flex items-center">
                  <div class="col-auto">
                      <input type="radio" name="selectedAddress" class="mr-2">
                  </div>
        
                  <div class="col flex-1 text-left ml-2 pl-3 border-l border-gray-200 text-sm">
                      <div><strong>ชื่อ: </strong>{{ address.name }} {{ address.lastname }}</div>
                      <div><strong>เบอร์โทร: </strong> {{ address.phone }}</div>
                      <div><strong>ที่อยู่: </strong> {{ address.address }} {{ address.province }},{{ address.postcode }}</div>
                  </div>
          
                  <div class="col-auto">
                      <button class="bg-blue-500 text-white px-2 py-1 rounded-md text-sm">แก้ไข</button>
                  </div>
              </div>
            </div>
          
            <div v-else>
              <button @click="redeemCoupon" class="flex px-3 py-4 mt-2 w-full items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg focus:outline-none focus:shadow-outline transform transition-colors duration-150">
                Redeem Coupon
              </button>
            </div>

          </div> -->
  
        </div>
      </div>
    </div>
  
  </div>

<!-- Complete Order Modal -->
<div v-if="showCompleteOrderModal" class="fixed z-10 inset-0 overflow-y-auto">
  <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
    <div class="modal-container">
      <div class="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full mx-auto text-center">
        <div class="modal-content">
          <h2 class="text-lg font-semibold mb-4">Order Summary</h2>
          <!-- Display order summary details here -->
          <p class="mb-4">Thank you for your order!</p>
          <button @click="closeCompleteOrderModal" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded mt-4 focus:outline-none focus:shadow-outline transform transition-colors duration-150">ปิด</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal -->
<div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

    <!-- Modal content -->
    <div class="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full mx-auto md:mt-10">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg font-medium leading-3 text-gray-900" id="modal-title">รายละเอียดในการจัดส่ง</h3>
            <div class="mt-2">
              <!-- Form fields -->
              <div class="bg-gray-50">
                <div v-if="step === 1" class="flex min-h-full flex-col justify-center py-6 sm:px-6 lg:px-8">
                  <div class="sm:mx-auto sm:w-full sm:max-w-lg">
                    <h2 class="mt-3 text-center text-lg font-bold tracking-tight text-gray-900">Step 1: ข้อมูลส่วนตัวผู้รับสินค้า</h2>
                  </div>
                  <div class="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="bg-white px-2 py-4 shadow sm:rounded-lg sm:px-10">
                      <form @submit.prevent="nextStep">
                        <div class="relative mb-4">
                          <span class="input-label">ชื่อจริง <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                          <input
                            v-model="shippingData.name"
                            type="text"
                            placeholder="ชื่อจริง"
                            class="w-full p-3 border border-gray-200 mb-1 text-sm"
                          />
                        </div>

                        <div class="relative mb-4">
                          <span class="input-label">นามสกุล <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                          <input
                            v-model="shippingData.lastname"
                            type="text"
                            placeholder="นามสกุล"
                            class="w-full p-3 border border-gray-200 mb-1 text-sm"
                          />
                        </div>

                        <div class="relative mb-4">
                          <span class="input-label">เบอร์โทร <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                          <input
                            v-model="shippingData.phone"
                            type="text"
                            placeholder="เบอร์โทร"
                            class="w-full p-3 border border-gray-200 mb-1 text-sm"
                          />
                        </div>

                        <div class="relative mb-4">
                          <span class="input-label">อีเมล์ <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                          <input
                            v-model="shippingData.email"
                            type="text"
                            placeholder="อีเมล์"
                            class="w-full p-3 border border-gray-200 mb-1 text-sm"
                          />
                        </div>
                        
                        <div class="text-center">
                          <button @click="nextStep" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded focus:outline-none focus:shadow-outline transform transition-colors duration-150">ที่อยู่ในการจัดส่ง</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
            
                <div v-if="step === 2" class="flex min-h-full flex-col justify-center py-6 sm:px-6 lg:px-8">
                  <div class="sm:mx-auto sm:w-full sm:max-w-lg">
                    <h2 class="mt-3 text-center text-lg font-bold tracking-tight text-gray-900">Step 2: ข้อมูลที่อยู่จัดส่งสินค้า</h2>
                  </div>
                  <div class="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="bg-white px-2 py-4 shadow sm:rounded-lg sm:px-10">
                      <form @submit.prevent="nextStep">
                        <div class="relative mb-4">
                          <span class="input-label">ที่อยู่ <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                          <textarea
                            v-model="shippingData.address"
                            placeholder="ที่อยู่"
                            class="w-full p-3 border border-gray-200 mb-1 text-sm"
                            style="height: 100px;"
                          ></textarea>
                        </div>

                        <div class="relative mb-4">
                          <span class="input-label">ตำบล <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                          <input
                            v-model="shippingData.subdistrict"
                            type="text"
                            placeholder="ตำบล"
                            class="w-full p-3 border border-gray-200 mb-1 text-sm"
                          />
                        </div>

                        <div class="relative mb-4">
                          <span class="input-label">อำเภอ <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                          <input
                            v-model="shippingData.district"
                            type="text"
                            placeholder="อำเภอ"
                            class="w-full p-3 border border-gray-200 mb-1 text-sm"
                          />
                        </div>

                        <div class="relative mb-4">
                          <span class="input-label">จังหวัด <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                          <input
                            v-model="shippingData.province"
                            type="text"
                            placeholder="จังหวัด"
                            class="w-full p-3 border border-gray-200 mb-1 text-sm"
                          />
                        </div>

                        <div class="relative mb-4">
                          <span class="input-label">รหัสไปรษณีย์ <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                          <input
                            v-model="shippingData.postcode"
                            type="text"
                            placeholder="รหัสไปรษณีย์"
                            class="w-full p-3 border border-gray-200 mb-1 text-sm"
                          />
                        </div>
                        
                        <div class="text-center">
                          <div class="flex justify-between">
                            <button @click="prevStep" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded focus:outline-none focus:shadow-outline transform transition-colors duration-150">ข้อมูลส่วนตัว</button>
                            <button @click="nextStep" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded focus:outline-none focus:shadow-outline transform transition-colors duration-150">สรุปข้อมูล</button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
            
                <div v-if="step === 3" class="flex min-h-full flex-col justify-center py-6 sm:px-6 lg:px-8">
                  <div class="sm:mx-auto sm:w-full sm:max-w-lg">
                    <h2 class="mt-3 text-center text-lg font-bold tracking-tight text-gray-900">สรุปข้อมูลการจัดส่ง</h2>
                  </div>
                  <div class="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="bg-white px-2 py-4 shadow sm:rounded-lg sm:px-10">
                      
                      <div class="relative border border-gray-300 rounded-lg p-2" style="position: relative; background-color: #fff; overflow: hidden;">

                        <div class="text-center">
                          <p class="text-md font-bold">Shipping Label</p>
                        </div>
                      
                        <div class="mt-4 text-sm">
                          <div class="flex justify-between">
                            <div class="w-1/2">
                              <div class="flex flex-col text-left">
                                <div class="font-bold">ชื่อ-นามสกุล:</div>
                                <div class="font-bold">เบอร์โทร:</div>
                                <div class="font-bold">อีเมล์:</div>
                                <div class="font-bold">ที่อยู่:</div>
                                <div class="font-bold">ตำบล:</div>
                                <div class="font-bold">อำเภอ:</div>
                                <div class="font-bold">จังหวัด:</div>
                                <div class="font-bold">รหัสไปรษณีย์:</div>
                              </div>
                            </div>
                            <div class="w-1/2">
                              <div class="flex flex-col text-left">
                                <div>{{ shippingData.name }} {{ shippingData.lastname }}</div>
                                <div>{{ shippingData.phone }}</div>
                                <div>{{ shippingData.email }}</div>
                                <div>{{ shippingData.address }}</div>
                                <div>{{ shippingData.subdistrict }}</div>
                                <div>{{ shippingData.district }}</div>
                                <div>{{ shippingData.province }}</div>
                                <div>{{ shippingData.postcode }}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="text-center mt-4">
                        <div class="flex justify-between">
                          <button @click="prevStep" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded focus:outline-none focus:shadow-outline transform transition-colors duration-150">ที่อยู่ในการจัดส่ง</button>
                          <button @click="submitForm" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded focus:outline-none focus:shadow-outline transform transition-colors duration-150">ยืนยันข้อมูล</button>
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
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button @click="closeModal" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>

</template>

<style scoped>
.input-label{
    font-size: 12px;
    background: #fff;
    position: absolute;
    left: 5px;
    top: -8px;
    padding-left: 2px;
    padding-right: 5px;
    color: #c2c2c2;
}

.modal-container {
  position:relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
}

.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.product {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
  cursor: pointer;
}

.product img {
  width: 100%;
  height: auto;
}

.cart {
  margin-top: 20px;
}

.cart-item {
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
}



/* common */
.ribbon {
  width: 150px;
  height: 150px;
  overflow: hidden;
  position: absolute;
}
.ribbon::before,
.ribbon::after {
  position: absolute;
  z-index: -1;
  content: '';
  display: block;
  border: 5px solid #2980b9;
}
.ribbon span {
  position: absolute;
  display: block;
  width: 225px;
  padding: 15px 0;
  background-color: #3498db;
  box-shadow: 0 5px 10px rgba(0,0,0,.1);
  color: #fff;
  font: 700 18px/1 Noto Sans Thai, Sans-serif;
  text-shadow: 0 1px 1px rgba(0,0,0,.2);
  text-transform: uppercase;
  text-align: center;
}

/* top left*/
.ribbon-top-left {
  top: -10px;
  left: -10px;
}
.ribbon-top-left::before,
.ribbon-top-left::after {
  border-top-color: transparent;
  border-left-color: transparent;
}
.ribbon-top-left::before {
  top: 0;
  right: 0;
}
.ribbon-top-left::after {
  bottom: 0;
  left: 0;
}
.ribbon-top-left span {
  right: -25px;
  top: 30px;
  transform: rotate(-45deg);
}

/* top right*/
.ribbon-top-right {
  top: -10px;
  right: -10px;
}
.ribbon-top-right::before,
.ribbon-top-right::after {
  border-top-color: transparent;
  border-right-color: transparent;
}
.ribbon-top-right::before {
  top: 0;
  left: 0;
}
.ribbon-top-right::after {
  bottom: 0;
  right: 0;
}
.ribbon-top-right span {
  left: -25px;
  top: 30px;
  transform: rotate(45deg);
}

/* bottom left*/
.ribbon-bottom-left {
  bottom: -10px;
  left: -10px;
}
.ribbon-bottom-left::before,
.ribbon-bottom-left::after {
  border-bottom-color: transparent;
  border-left-color: transparent;
}
.ribbon-bottom-left::before {
  bottom: 0;
  right: 0;
}
.ribbon-bottom-left::after {
  top: 0;
  left: 0;
}
.ribbon-bottom-left span {
  right: -25px;
  bottom: 30px;
  transform: rotate(225deg);
}

/* bottom right*/
.ribbon-bottom-right {
  bottom: -10px;
  right: -10px;
}
.ribbon-bottom-right::before,
.ribbon-bottom-right::after {
  border-bottom-color: transparent;
  border-right-color: transparent;
}
.ribbon-bottom-right::before {
  bottom: 0;
  left: 0;
}
.ribbon-bottom-right::after {
  top: 0;
  right: 0;
}
.ribbon-bottom-right span {
  left: -25px;
  bottom: 30px;
  transform: rotate(-225deg);
}

</style>


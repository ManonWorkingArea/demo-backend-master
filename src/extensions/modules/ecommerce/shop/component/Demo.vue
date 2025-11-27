<template>
  <div class="mx-auto max-w-7xl px-4 mt-5 mb-8 sm:px-6 bg-white p-4">
    <div class="flex">
      <div class="flex-1">
        <!-- Step 1: Select Package -->
        <div v-if="currentStep === 1">
          <h2 class="text-2xl mb-4">Step 1: เลือกแพ็คเกจเครดิต</h2>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="packageOption in packageOptions" :key="packageOption.value" class="flex items-center">
              <input type="radio" :id="packageOption.value" :value="packageOption.value" v-model="selectedPackage" class="mr-2">
              <label :for="packageOption.value" class="font-medium">{{ packageOption.label }} ({{ formatCurrency(packageOption.value) }})</label>
            </div>
          </div>
          <div class="mt-4">
            <button @click="updateWallet" class="btn btn-primary mr-2">อัพเดตเครดิต</button>
            <button @click="nextStep" class="btn">เลือกสินค้า</button>
          </div>
        </div>

        <!-- Step 2: Show Package Select -->
        <div v-if="currentStep === 2">
          <h2 class="text-2xl mb-4">Step 2: เลือกสินค้าที่ต้องการผลิต</h2>
          <h3 class="text-xl mb-4 mt-4">เลือกสินค้า:</h3>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="instantOption in instantOptions" :key="instantOption.value" class="flex items-center">
              <label class="font-medium">
                <input type="radio" :value="instantOption" v-model="selectedInstant" class="mr-2">
                <span class="font-bold">{{ instantOption.label }}</span> ( คงเหลือ {{ formatCurrency(instantOption.stock) }} เม็ด)
              </label>
            </div>
            
          </div>

          <h3 class="text-xl mb-4 mt-4">ปรับแต่งสินค้า</h3>
          <div class="flex items-center mb-2">
            <input type="radio" id="instant" value="instant" v-model="selection" @change="handleSelection" class="mr-2">
            <label for="instant" class="font-medium">ใช้สูตรสำเร็จ</label>
          </div>
          
          <div class="flex items-center">
            <input type="radio" id="customize" value="customize" v-model="selection" @change="handleSelection" class="mr-2">
            <label for="customize" class="font-medium">ปรับแต่ง</label>
          </div>

          <div v-if="selection === 'instant'">
            
            <table class="table w-full mt-4">
              <thead>
                <tr>
                  <th class="border px-4 py-2">ตัวเลือก</th>
                  <th class="border px-4 py-2">มูลค่า</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="option in selectedStandardOptions" :key="option.value">
                  <td class="border px-4 py-2">{{ option.label }}</td>
                  <td class="border px-4 py-2">{{ formatCurrency(option.price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="selection === 'customize'">

            <h3 class="text-xl mb-4 mt-4">ตัวเลือกในการปรับแต่ง</h3>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="option in selectedStandardOptions" :key="option.value" class="flex items-center">
                <input type="checkbox" :id="option.value" :value="option.value" v-model="customizeSelection" class="mr-2">
                <label :for="option.value" class="font-medium">{{ option.label }} - {{ formatCurrency(option.price) }}</label>
              </div>
            </div>
            <table class="table w-full mt-4">
              <thead>
                <tr>
                  <th class="border px-4 py-2">ตัวเลือก</th>
                  <th class="border px-4 py-2">มูลค่า</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="option in customizeOptions" :key="option.value">
                  <td class="border px-4 py-2">{{ option.label }}</td>
                  <td class="border px-4 py-2">{{ formatCurrency(option.price) }} (+{{ getCustomizeOptionValue(option) }})</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4">
            <label for="volume" class="font-medium w-full block">จำนวนการผลิต (ขวด):</label>
            <input type="number" id="volume" v-model="volume" class="input-text mt-2">
          </div>

          <div class="mt-4">
            <button @click="previousStep" class="btn btn-secondary mr-2">ย้อนกลับ</button>
            <button @click="nextStep" class="btn">สรุปยอดคำสั่งซื้อ</button>
          </div>
        </div>

          <!-- Step 3: Show Bill Detail -->
          <div v-if="currentStep === 3">
            <h2 class="text-2xl mb-4">Step 3: สรุปรายการคำสั่งซื้อ</h2>
            <div class="flex flex-col">
              <h3 class="text-xl mb-2">รายละเอียดสินค้า:</h3>
              <table class="table mt-4">
                <thead>
                  <tr>
                    <th class="border px-4 py-2">ตัวเลือก</th>
                    <th class="border px-4 py-2">มูลค่า</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="selectedInstant">
                    <td class="border px-4 py-2">สินค้า</td>
                    <td class="border px-4 py-2">{{ selectedInstant.label }}</td>
                  </tr>
                  <tr v-for="option in selectedStandardOptions" :key="option.value">
                    <td class="border px-4 py-2">{{ option.label }}</td>
                    <td class="border px-4 py-2">{{ formatCurrency(option.price) }}</td>
                  </tr>
                  <tr>
                    <td class="border px-4 py-2 font-bold bg-gray-50">ยอดสุทธิ</td>
                    <td class="border px-4 py-2 font-bold bg-gray-50">{{ formatCurrency(calculateTotalBill()) }}</td>
                  </tr>
                  <tr>
                    <td class="border px-4 py-2 font-bold bg-gray-50">ยอดเครดิต</td>
                    <td class="border px-4 py-2 font-bold bg-gray-50">{{ formatCurrency(wallet) }}</td>
                  </tr>
                  <tr>
                    <td class="border px-4 py-2 font-bold bg-gray-50">เครดิตคงเหลือ</td>
                    <td class="border px-4 py-2 font-bold bg-gray-50">{{ formatCurrency(wallet-calculateTotalBill()) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="flex flex-col mt-4">
              <ul class="mb-2">
                <li v-for="(value, key) in volumeDetails" :key="key">
                  <span class="font-bold">{{ key }}</span> : <span v-html="value"></span>
                </li>
              </ul>
              <div>
                <button @click="previousStep" class="btn btn-secondary mr-2">ย้อนกลับ</button>
                <button @click="confirmOrder" class="btn btn-primary mr-2">ยืนยันคำสั่งซื้อ</button>
              </div>
            </div>
          </div>



        <!-- Step 4: Show Summary Order -->
        <div v-if="currentStep === 4">
          <h2 class="text-2xl mb-4">Step 4: Show Summary Order</h2>
          <div>
            <h3 class="text-xl">Summary of Orders:</h3>
            <table class="table w-full mt-4">
              <thead>
                <tr>
                  <th class="border px-4 py-2">Product</th>
                  <th class="border px-4 py-2">Selected Options</th>
                  <th class="border px-4 py-2">Volume</th>
                  <th class="border px-4 py-2">Total Bill</th>
                  <th class="border px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(order, index) in existingOrders" :key="index">
                  <td class="border px-4 py-2">{{ order.products.label }}</td> <!-- Display the product label -->
                  <td class="border px-4 py-2">
                    <ul>
                      <li v-for="option in order.selectedOptions" :key="option.value">{{ option.label }}</li>
                    </ul>
                  </td>
                  <td class="border px-4 py-2">{{ order.volume }}</td>
                  <td class="border px-4 py-2">{{ formatCurrency(order.totalBill) }}</td>
                  <td class="border px-4 py-2">{{ order.status }}</td>
                </tr>
              </tbody>
            </table>
            
          </div>
          <div class="mt-4">
            <button @click="previousStep" class="btn btn-secondary mr-2">Back</button>
            <button @click="nextStep" class="btn">Next</button>
            <button @click="gotoStep(1)" class="btn">Home</button>
          </div>
        </div>



        <!-- Step 5: Show Order -->
        <div v-if="currentStep === 5">
          <h2 class="text-2xl mb-4">Step 5: Show Order</h2>
          <!-- Display final order details -->
          <div class="mt-4">
            <button @click="previousStep" class="btn btn-secondary mr-2">Back</button>
            <button @click="nextStep" class="btn">Next</button>
          </div>
        </div>

        <!-- Step 6: Show Shipping -->
        <div v-if="currentStep === 6">
          <h2 class="text-2xl mb-4">Step 6: Show Shipping</h2>
          <!-- Add your shipping form or components here -->
          <div class="mt-4">
            <button @click="previousStep" class="btn btn-secondary mr-2">Back</button>
            <button @click="nextStep" class="btn">Next</button>
          </div>
        </div>
      </div>

      <!-- Right Sidebar: Wallet and Summary -->
      <div class="flex-1 pl-8 border-l border-gray-100">
        <div class="mt-4">
          <h3 class="text-xl">เครดิตปัจจุบัน: <span class="font-bold">{{ formatCurrency(wallet) }}</span></h3>
        </div>


        <div class="mt-8" v-if="selection && selection.length">
          <h3 class="text-xl">สรุปยอดคำสั่งซื้อ</h3>
          <table class="table mt-4">
            <thead>
              <tr>
                <th class="border px-4 py-2">ตัวเลือก</th>
                <th class="border px-4 py-2">มูลค่า</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="selectedInstant">
                <td class="border px-4 py-2">สินค้า</td>
                <td class="border px-4 py-2">{{ selectedInstant.label }}</td>
              </tr>
              <tr v-for="option in selectedStandardOptions" :key="option.value">
                <td class="border px-4 py-2">{{ option.label }}</td>
                <td class="border px-4 py-2">{{ formatCurrency(option.price) }}</td>
              </tr>
              <tr>
                <td class="border px-4 py-2">จำนวนการผลิต: {{ volume }} ({{ calculateTotalBottoms() }} ขวด, {{ calculateTotalTablets() }} เม็ด)</td>
                <td class="border px-4 py-2">{{ formatCurrency(this.volume * this.customFormula.price) }}</td>
              </tr>
              <tr>
                <td class="border px-4 py-2">ยอดรวม</td>
                <td class="border px-4 py-2">{{ formatCurrency(calculateTotalBill()) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      currentStep: 1,
      selectedPackage: 100000,
      selectedInstant:{ value: 0, label: 'Product A', description: 'Description of Product 1' },
      volume: 0,
      wallet: 0,
      instantOptions: [
        { value: 0, label: 'Product A', description: 'Description of Product 1' , stock: 1000},
        { value: 0, label: 'Product B', description: 'Description of Product 2' , stock: 1000},
        { value: 0, label: 'Product C', description: 'Description of Product 3' , stock: 1000 },
      ],
      packageOptions: [
        { value: 50000, label: 'Package 0', description: 'Description of Package 1' },
        { value: 100000, label: 'Package 1', description: 'Description of Package 1' },
        { value: 200000, label: 'Package 2', description: 'Description of Package 2' },
        { value: 300000, label: 'Package 3', description: 'Description of Package 3' },
        { value: 400000, label: 'Package 4', description: 'Description of Package 4' }
      ],
      selection: null,
      customizeSelection: [],
      standardOptions: [
      { value: 'ra', label: 'ใบ อย.', price: 6000 },
      { value: 'label', label: 'ฉลากติดขวด', price: 3000 },
      { value: 'formular', label: 'สูตรของสินค้า', price: 10000 }
    ],
      customizeOptions: [
        { value: 'ra', label: 'ขออนุญาติใบ อย. ใหม่', price: 2000, days: 45 },
        { value: 'label', label: 'ออกแบบฉลากติดขวดใหม่', price: 5000, days: 15 },
        { value: 'formular', label: 'ปรับสูตรสินค้า', price: 10000, days: 45 }
      ],
      customFormula: {
        bottom: 1,
        tablet: 30,
        price: 250
      }
    };
  },
  computed: {
    selectedStandardOptions() {
      if (this.selection === 'customize') {
        const selectedOptions = [];
        for (const option of this.standardOptions) {
          const selectedCustomizeOption = this.customizeOptions.find(opt => opt.value === option.value);
          if (selectedCustomizeOption && this.customizeSelection.includes(option.value)) {
            const { value, label, price } = option;
            const totalPrice = price + selectedCustomizeOption.price;
            selectedOptions.push({ value, label, price: totalPrice });
          } else {
            selectedOptions.push(option);
          }
        }
        return selectedOptions;
      }
      return [...this.standardOptions]; // Use the spread operator to create a copy of the array
    },
    volumeDetails() {
      return {
        "จำนวนการผลิต (ขวด)": `${this.volume} <small>( ${this.customFormula.price} / หน่วย )</small>`,
        "จำนวนขวด": `${this.calculateTotalBottoms()} <small>( ${this.customFormula.tablet} เม็ด / ขวด )</small>`,
        "จำนวนเม็ด": this.calculateTotalTablets()
      };
    }

  },
  watch: {
    volume: function() {
      const totalTablets = this.calculateTotalTablets();
      const selectedProduct = this.instantOptions.find(option => option.value === this.selectedInstant.stock);
      if (selectedProduct && totalTablets > selectedProduct.stock) {
        alert("The volume exceeds the available stock for the selected product. Please adjust the volume.");
        this.volume = 0; // Reset the volume to 0
      }
    }
  },
  created() {
    const walletValue = localStorage.getItem('wallet');
    if (walletValue) {
      this.wallet = JSON.parse(walletValue);
    }
    const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
    this.existingOrders = existingOrders;
  },
  methods: {
    updateWallet() {
      if (this.selectedPackage) {
        const walletValue = localStorage.getItem('wallet');
        const wallet = walletValue ? JSON.parse(walletValue) : 0;
        const updatedWallet = wallet + this.selectedPackage;
        localStorage.setItem('wallet', JSON.stringify(updatedWallet));
        this.wallet = updatedWallet
      }
    },
    nextStep() {
      this.currentStep++;
    },
    previousStep() {
      this.currentStep--;
    },
    gotoStep(step) {
      this.currentStep = step;
    },
    handleSelection() {
      if (this.selection === 'instant') {
        this.customizeSelection = [];
      }
      if (this.selection === 'customize') {
        //this.selectedInstant = null;
      }
    },
    formatCurrency(value) {
      if (typeof value !== 'number') {
        return value;
      }
      return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    getCustomizeOptionPrice(option) {
      if (this.customizeSelection.includes(option.value)) {
        return option.price;
      }
      return option.price;
    },
    calculateTotalBottoms() {
      if (this.customFormula) {
        const bottomValue = this.customFormula.bottom;
        return Math.floor(this.volume / bottomValue);
      }
      return '';
    },
    calculateTotalTablets() {
      if (this.customFormula) {
        const tabletValue = this.customFormula.tablet;
        return this.calculateTotalBottoms() * tabletValue;
      }
      return '';
    },
    calculateTotalBill() {
      let total = 0;
      if (this.selection === 'customize') {
        for (const option of this.selectedStandardOptions) {
          total += option.price;
        }
      } else if (this.selection === 'instant') {
        for (const option of this.standardOptions) {
          total += option.price;
        }
      }
      // Add volume to the total bill
      total += this.volume * this.customFormula.price;
      return total;
    },
    getCustomizeOptionValue(option) {
      const selectedOption = this.selectedStandardOptions.find(opt => opt.value === option.value);
      if (selectedOption) {
        return selectedOption.price - option.price;
      }
      return '';
    },
    confirmOrder() {
      const totalBill = this.calculateTotalBill();
      const wallet = JSON.parse(localStorage.getItem('wallet')) || 0;

      if (wallet < totalBill) {
        alert("Insufficient wallet balance. Please update your wallet before confirming the order.");
        return;
      }

      // Add the order to local storage
      const order = {
        selectedOptions: this.selectedStandardOptions,
        products: this.selectedInstant,
        volume: this.volume,
        totalBill: totalBill,
        status: "pending"
      };

      // Get existing orders from local storage
      const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];

      // Add the new order
      existingOrders.push(order);

      // Update the orders in local storage
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      // Update the wallet value
      localStorage.setItem('wallet', JSON.stringify(wallet - totalBill));

      // Update this.wallet with the updated wallet value from localStorage
      this.wallet = JSON.parse(localStorage.getItem('wallet')) || 0;
      this.existingOrders = existingOrders;

      this.selectedPackage = null
      this.selectedInstant = null
      this.selection = null
      this.customizeSelection = null
      this.volume = 0

      // Move to the next step
      this.nextStep();
    }

  }
};
</script>

<style>
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.grid-item {
  margin-bottom: 10px;
}
</style>

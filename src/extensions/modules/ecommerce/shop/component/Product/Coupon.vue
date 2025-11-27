<template>
  <div>
    <h1>Coupon Manager</h1>
    <button @click="fetchCoupons">Load Coupons</button>
    <ul>
      <li v-for="(coupon, index) in couponList" :key="coupon._id">
        <span>
          {{ coupon.code }} - {{ coupon.mode }} - {{ coupon.type }} - {{ coupon.value }} - 
          Min Subtotal: {{ coupon.minSubtotal }} - Max Subtotal: {{ coupon.maxSubtotal }} - 
          Min Quantity: {{ coupon.minQuantity }} - Max Quantity: {{ coupon.maxQuantity }} - 
          Usage: {{ coupon.usage }} - Max Discount: {{ coupon.maxDiscount }} - 
          Start Date: {{ coupon.startDate }} - End Date: {{ coupon.endDate }} - 
          Auto Assign: {{ coupon.autoAssign ? 'Yes' : 'No' }}
        </span>
        <button @click="prepareEditCoupon(coupon)">Update</button>
        <button @click="removeCoupon(coupon._id, index)">Delete</button>
      </li>
    </ul>
    <div v-if="showCouponConfig">
      <h2>Edit Coupon</h2>
      <label for="couponCode">Code</label>
      <input id="couponCode" v-model="couponData.code" placeholder="Code" />
      
      <label for="couponMode">Mode</label>
      <select id="couponMode" v-model="couponData.mode">
        <option value="fix">Fix</option>
        <option value="percent">Percent</option>
      </select>
      
      <label for="couponType">Type</label>
      <select id="couponType" v-model="couponData.type">
        <option value="standard">Standard Discount</option>
        <option value="category">Discount by Category</option>
      </select>
      
      <label for="couponValue">Value</label>
      <input id="couponValue" v-model="couponData.value" type="number" placeholder="Value" />
      
      <label>
        <input type="checkbox" v-model="couponData.enableSubtotalLimit" />
        Enable Subtotal Limit
      </label>
      <div v-if="couponData.enableSubtotalLimit">
        <label for="couponMinSubtotal">Min Subtotal</label>
        <input id="couponMinSubtotal" v-model="couponData.minSubtotal" type="number" placeholder="Min Subtotal" />
        
        <label for="couponMaxSubtotal">Max Subtotal</label>
        <input id="couponMaxSubtotal" v-model="couponData.maxSubtotal" type="number" placeholder="Max Subtotal" />
      </div>
      
      <label>
        <input type="checkbox" v-model="couponData.enableQuantityLimit" />
        Enable Quantity Limit
      </label>
      <div v-if="couponData.enableQuantityLimit">
        <label for="couponMinQuantity">Min Quantity</label>
        <input id="couponMinQuantity" v-model="couponData.minQuantity" type="number" placeholder="Min Quantity" />
        
        <label for="couponMaxQuantity">Max Quantity</label>
        <input id="couponMaxQuantity" v-model="couponData.maxQuantity" type="number" placeholder="Max Quantity" />
      </div>
      
      <label>
        <input type="checkbox" v-model="couponData.enableDueDate" />
        Enable Due Date
      </label>
      <div v-if="couponData.enableDueDate">
        <label for="couponStartDate">Start Date</label>
        <input id="couponStartDate" v-model="couponData.startDate" type="date" placeholder="Start Date" />
        
        <label for="couponEndDate">End Date</label>
        <input id="couponEndDate" v-model="couponData.endDate" type="date" placeholder="End Date" />
      </div>
      
      <label for="couponUsage">Usage</label>
      <select id="couponUsage" v-model="couponData.usage">
        <option value="unlimited">Unlimited</option>
        <option value="single">Single Use</option>
      </select>
      
      <label for="couponMaxDiscount">Max Discount</label>
      <input id="couponMaxDiscount" v-model="couponData.maxDiscount" type="number" placeholder="Max Discount" />
      
      <label>
        <input type="checkbox" v-model="couponData.autoAssign" />
        Auto Assign When Conditions Met
      </label>
      
      <button @click="updateCoupon">Save Changes</button>
    </div>
    <div>
      <h2>Add Coupon</h2>
      <label for="newCouponCode">Code</label>
      <input id="newCouponCode" v-model="newCoupon.code" placeholder="Code" />
      
      <label for="newCouponMode">Mode</label>
      <select id="newCouponMode" v-model="newCoupon.mode">
        <option value="fix">Fix</option>
        <option value="percent">Percent</option>
      </select>
      
      <label for="newCouponType">Type</label>
      <select id="newCouponType" v-model="newCoupon.type">
        <option value="standard">Standard Discount</option>
        <option value="category">Discount by Category</option>
      </select>
      
      <label for="newCouponValue">Value</label>
      <input id="newCouponValue" v-model="newCoupon.value" type="number" placeholder="Value" />
      
      <label>
        <input type="checkbox" v-model="newCoupon.enableSubtotalLimit" />
        Enable Subtotal Limit
      </label>
      <div v-if="newCoupon.enableSubtotalLimit">
        <label for="newCouponMinSubtotal">Min Subtotal</label>
        <input id="newCouponMinSubtotal" v-model="newCoupon.minSubtotal" type="number" placeholder="Min Subtotal" />
        
        <label for="newCouponMaxSubtotal">Max Subtotal</label>
        <input id="newCouponMaxSubtotal" v-model="newCoupon.maxSubtotal" type="number" placeholder="Max Subtotal" />
      </div>
      
      <label>
        <input type="checkbox" v-model="newCoupon.enableQuantityLimit" />
        Enable Quantity Limit
      </label>
      <div v-if="newCoupon.enableQuantityLimit">
        <label for="newCouponMinQuantity">Min Quantity</label>
        <input id="newCouponMinQuantity" v-model="newCoupon.minQuantity" type="number" placeholder="Min Quantity" />
        
        <label for="newCouponMaxQuantity">Max Quantity</label>
        <input id="newCouponMaxQuantity" v-model="newCoupon.maxQuantity" type="number" placeholder="Max Quantity" />
      </div>
      
      <label>
        <input type="checkbox" v-model="newCoupon.enableDueDate" />
        Enable Due Date
      </label>
      <div v-if="newCoupon.enableDueDate">
        <label for="newCouponStartDate">Start Date</label>
        <input id="newCouponStartDate" v-model="newCoupon.startDate" type="date" placeholder="Start Date" />
        
        <label for="newCouponEndDate">End Date</label>
        <input id="newCouponEndDate" v-model="newCoupon.endDate" type="date" placeholder="End Date" />
      </div>
      
      <label for="newCouponUsage">Usage</label>
      <select id="newCouponUsage" v-model="newCoupon.usage">
        <option value="unlimited">Unlimited</option>
        <option value="single">Single Use</option>
      </select>
      
      <label for="newCouponMaxDiscount">Max Discount</label>
      <input id="newCouponMaxDiscount" v-model="newCoupon.maxDiscount" type="number" placeholder="Max Discount" />
      
      <label>
        <input type="checkbox" v-model="newCoupon.autoAssign" />
        Auto Assign When Conditions Met
      </label>
      
      <button @click="addCoupon">Add Coupon</button>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

export default {
  data() {
    return {
      couponList: [],
      couponData: { _id: '', code: '', mode: 'fix', type: 'standard', value: 0, minSubtotal: 0, maxSubtotal: 0, minQuantity: 0, maxQuantity: 0, usage: 'unlimited', maxDiscount: 0, autoAssign: false, enableSubtotalLimit: false, enableQuantityLimit: false, enableDueDate: false, startDate: '', endDate: '' },
      newCoupon: { code: '', mode: 'fix', type: 'standard', value: 0, minSubtotal: 0, maxSubtotal: 0, minQuantity: 0, maxQuantity: 0, usage: 'unlimited', maxDiscount: 0, autoAssign: false, enableSubtotalLimit: false, enableQuantityLimit: false, enableDueDate: false, startDate: '', endDate: '' },
      showCouponConfig: false,
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
    };
  },
  methods: {
    async fetchCoupons() {
      try {
        const response = await Request.POST('coupon/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
        if (response.status === 200) this.couponList = response.data;
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    },
    prepareEditCoupon(coupon) {
      this.couponData = { ...coupon };
      this.showCouponConfig = true;
    },
    async updateCoupon() {
      try {
        if (this.couponData.mode === 'percent') {
          this.couponData.value = Math.min(this.couponData.value, this.couponData.maxDiscount);
        }
        const response = await Request.PUT(`coupon/${this.couponData._id}`, { data: { ...this.couponData, _id: undefined } }, this.configs.key);
        if (response.status === 200) {
          await this.fetchCoupons();
          this.showCouponConfig = false;
          this.resetCouponData();
        }
      } catch (error) {
        console.error('Error updating coupon:', error);
      }
    },
    async removeCoupon(couponId, index) {
      try {
        const response = await Request.DELETE(`coupon/${couponId}`, '', this.configs.key);
        if (response.status === 200) this.couponList.splice(index, 1);
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    },
    async addCoupon() {
      try {
        if (this.newCoupon.mode === 'percent') {
          this.newCoupon.value = Math.min(this.newCoupon.value, this.newCoupon.maxDiscount);
        }
        const response = await Request.POST('coupon/', { data: { ...this.newCoupon, unit: this.session.current._id || this.configs.siteID } }, this.configs.key);
        if (response.status === 200) {
          this.couponList.push(response.data);
          this.resetNewCoupon();
        }
      } catch (error) {
        console.error('Error adding coupon:', error);
      }
    },
    resetCouponData() {
      this.couponData = { _id: '', code: '', mode: 'fix', type: 'standard', value: 0, minSubtotal: 0, maxSubtotal: 0, minQuantity: 0, maxQuantity: 0, usage: 'unlimited', maxDiscount: 100, autoAssign: false, enableSubtotalLimit: false, enableQuantityLimit: false, enableDueDate: false, startDate: '', endDate: '' };
    },
    resetNewCoupon() {
      this.newCoupon = { code: '', mode: 'fix', type: 'standard', value: 0, minSubtotal: 0, maxSubtotal: 0, minQuantity: 0, maxQuantity: 0, usage: 'unlimited', maxDiscount: 100, autoAssign: false, enableSubtotalLimit: false, enableQuantityLimit: false, enableDueDate: false, startDate: '', endDate: '' };
    },
  },
  async mounted() {
    await this.fetchCoupons();
  }
};
</script>

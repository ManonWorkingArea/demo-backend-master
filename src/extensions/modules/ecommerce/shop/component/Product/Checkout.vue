<template>
  <div class="checkout-form">
    <h2>Checkout</h2>
    <form @submit.prevent="completeOrder">
      <div class="section">
        <h3>Billing Address</h3>
        <input v-model="billingAddress.firstName" placeholder="First Name" required />
        <input v-model="billingAddress.lastName" placeholder="Last Name" required />
        <input v-model="billingAddress.email" placeholder="Email" required />
        <input v-model="billingAddress.phone" placeholder="Phone" required />
        <input v-model="billingAddress.address" placeholder="Address" required />
        <input v-model="billingAddress.city" placeholder="City" required />
        <input v-model="billingAddress.state" placeholder="State" required />
        <input v-model="billingAddress.zip" placeholder="Zip" required />
        <input v-model="billingAddress.taxId" placeholder="Tax ID" v-if="requestFullTaxBill" />
        <div>
          <input type="checkbox" id="requestTaxBill" v-model="requestFullTaxBill" />
          <label for="requestTaxBill">Request Full Tax Bill</label>
        </div>
      </div>

      <div class="section">
        <h3>Shipping Address</h3>
        <button type="button" @click="useBillingAddress">Use Billing Address</button>
        <input v-model="shippingAddress.firstName" placeholder="First Name" required />
        <input v-model="shippingAddress.lastName" placeholder="Last Name" required />
        <input v-model="shippingAddress.email" placeholder="Email" required />
        <input v-model="shippingAddress.phone" placeholder="Phone" required />
        <input v-model="shippingAddress.address" placeholder="Address" required />
        <input v-model="shippingAddress.city" placeholder="City" required />
        <input v-model="shippingAddress.state" placeholder="State" required />
        <input v-model="shippingAddress.zip" placeholder="Zip" required />
      </div>

      <div class="section">

        <div class="border border-gray-400 mb-2">
          <h3>Cart Details</h3>
          <ul>
            <li v-for="item in cart.items.products" :key="item.sku">
              {{ item.name }} ({{ item.sku }}) - {{ currency.symbol }}{{ item.salePrice }} x {{ item.quantity }}
            </li>
          </ul>
        </div>

        <div class="border border-gray-400 mb-2">
          <h4>Coupons</h4>
          <ul>
            <li v-for="coupon in couponDiscounts" :key="coupon.code">
              Coupon: {{ coupon.code }} : (-{{ currency.symbol }}{{ coupon.discount }})
            </li>
          </ul>
        </div>

        <div class="border border-gray-400 mb-2">
          <h4>Fees</h4>
          <ul>
            <li v-for="fee in cart.items.fees" :key="fee.code">
              Fee: {{ fee.code }} : {{ currency.symbol }}{{ fee.amount }}
            </li>
          </ul>
        </div>

        <p>Subtotal: {{ currency.symbol }}{{ localSubtotal }}</p>
        <p>Fees: {{ currency.symbol }}{{ localFeeTotal }}</p>
        <p>Discount: -{{ currency.symbol }}{{ localTotalDiscount }}</p>
        <p>Total: {{ currency.symbol }}{{ localCartTotal }}</p>
      </div>

      <div class="section">
        <h3>Payment Gateway</h3>
        <select v-model="paymentMethod" required>
          <option value="" disabled>Select Payment Gateway</option>
          <option v-for="gateway in paymentGateways" :key="gateway.code" :value="gateway.code">
            {{ gateway.name }}
          </option>
        </select>
      </div>

      <div class="section">
        <h3>Gift Options</h3>
        <div>
          <input type="checkbox" id="requestGiftWrap" v-model="requestGiftWrap" />
          <label for="requestGiftWrap">Request Gift Wrap</label>
        </div>
        <div v-if="requestGiftWrap">
          <textarea v-model="giftMessage" placeholder="Enter gift greeting message"></textarea>
        </div>
      </div>
      <div id="checkout-respond"></div>
      <button type="submit">Complete Order</button>
    </form>
  </div>
</template>

<script>
import { fetchPaymentGateways, calculateCartTotal, fetchDefaultOrderStatus, createOrderSummary, createOrder, getCurrencyConfig, do_flow } from './shop_front';

export default {
  props: {
    cart: {
      type: Object,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    totalDiscount: {
      type: Number,
      required: true
    },
    cartTotal: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      billingAddress: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        taxId: ''
      },
      shippingAddress: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      },
      paymentMethod: '',
      requestFullTaxBill: false,
      requestGiftWrap: false,
      giftMessage: '',
      paymentGateways: [],
      couponDiscounts: [],
      localSubtotal: this.subtotal,
      localTotalDiscount: this.totalDiscount,
      localFeeTotal: 0,
      localCartTotal: this.cartTotal,
      orderStatus: null,
      currency: { name: '', code: '', symbol: '' }, // Initialize with default values
    };
  },
  async mounted() {
    try {
      this.currency = await getCurrencyConfig();
      await this.fetchPaymentGateways();
      await this.calculateCartDetails();
    } catch (error) {
      console.error('Error fetching currency configuration:', error);
    }
  },
  watch: {
    paymentMethod(newMethod) {
      console.log("Selected payment method:", newMethod);
      const selectedGateway = this.paymentGateways.find(gateway => gateway.code === newMethod);
      console.log("Selected payment gateway data:", selectedGateway);
      if (selectedGateway) {
        this.updateDefaultOrderStatus(selectedGateway.defaultOrderStatus);
      }
    }
  },
  methods: {
    async fetchPaymentGateways() {
      try {
        this.paymentGateways = await fetchPaymentGateways();
      } catch (error) {
        console.error('Error fetching payment gateways:', error);
      }
    },
    useBillingAddress() {
      this.shippingAddress = { ...this.billingAddress };
      delete this.shippingAddress.taxId; // Remove taxId if it was copied
    },
    async calculateCartDetails() {
      const { subtotal, totalDiscount, cartTotal, couponDiscounts } = await calculateCartTotal(this.cart);
      this.localSubtotal = subtotal;
      this.localTotalDiscount = totalDiscount;
      this.localCartTotal = cartTotal;
      this.couponDiscounts = couponDiscounts;

      this.localFeeTotal = this.cart.items.fees.reduce((total, fee) => total + parseFloat(fee.amount), 0).toFixed(2);
    },
    async updateDefaultOrderStatus(statusId) {
      try {
        const defaultStatus = await fetchDefaultOrderStatus(statusId);
        if (defaultStatus && defaultStatus._id) {
          this.orderStatus = defaultStatus.code;
        }
      } catch (error) {
        console.error('Error fetching default order status:', error);
      }
    },
    async completeOrder() {
      try {
        const orderDetails = {
          billingAddress: this.billingAddress,
          shippingAddress: this.shippingAddress,
          cart: this.cart,
          paymentMethod: this.paymentMethod,
          requestFullTaxBill: this.requestFullTaxBill,
          requestGiftWrap: this.requestGiftWrap,
          giftMessage: this.giftMessage,
          status: this.orderStatus,

          discount: this.localTotalDiscount,
          fee: this.localFeeTotal,
          subtotal: this.localSubtotal,
          total: this.localCartTotal,
        };

        const order = await createOrder(orderDetails);
        await createOrderSummary(order, orderDetails);

        // Before Check Process : Flow
        await do_flow('before_checkout', orderDetails);
        
        // stock_out : Flow
        const products = orderDetails.cart.items.products;
        let mode = "out";
        for (const product of products) {
          const { sku, quantity } = product;
          try {
            await do_flow('stock_movement', { sku, quantity, mode });
          } catch (error) {
            console.error(`Error processing stock out for ${sku}:`, error);
          }
        }

        // After Check Process : Flow
        await do_flow('after_checkout', orderDetails);

      } catch (error) {
        console.error('Error completing order:', error);
        alert('Failed to complete order');
      }
    }
  }
};
</script>

<style scoped>
.checkout-form {
  max-width: 600px;
  margin: auto;
}
.section {
  margin-bottom: 20px;
}
</style>

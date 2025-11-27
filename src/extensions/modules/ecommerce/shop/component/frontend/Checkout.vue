<template>
    <main>
      <div class="bg-gray-100 border-b border-gray-200">
  
        <div v-if="this.deviceType==='desktop'" class="mx-auto max-w-2xl px-4 pt-3 pb-3 sm:px-18 sm:pt-3 sm:pb-3 d lg:max-w-7xl">
          <div class="flex items-center justify-between">
            <div class="relative inline-block text-left">
              <router-link :to="'/'" class="text-gray-400 hover:text-gray-500">
                <font-awesome-icon :icon="['fas', 'home']" />
                <span class="sr-only">หน้าหลัก</span>
              </router-link>
            </div>
  
            <div class="inline-block text-sm font-bold text-gray-700">ชำระเงิน</div>
  
            <div class="hidden sm:flex sm:items-baseline sm:space-x-8">
              <router-link :to="'/shop/products'" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 truncate">เลือกสินค้าต่อ</router-link>
            </div>
          </div>
        </div>
  
        <div v-if="this.deviceType==='mobile'" class="mx-auto max-w-2xl px-4 pt-3 pb-3 sm:px-18 sm:pt-3 sm:pb-3 d lg:max-w-7xl">
          <div class="grid grid-cols-2 gap-x-4">
            <router-link :to="'/'" class="text-sm font-medium text-gray-500 hover:text-gray-700 justify-self-start">
              <font-awesome-icon :icon="['fas', 'home']" />
              <span class="ml-1">หน้าหลัก</span>
            </router-link>
            <router-link :to="'/shop/products'" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 justify-self-end">
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
              <span class="ml-1">เลือกสินค้าต่อ</span>
            </router-link>
          </div>
        </div>
  
      </div>
  
      <div class="bg-gray-50">
        <div class="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 class="sr-only">Checkout</h2>

          <div class="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            <div>
              <div>
                <h2 class="text-lg font-bold text-gray-900">ข้อมูลผู้สั่งสินค้า</h2>

                <div class="mt-4">
                  <label for="email-address" class="block text-sm font-medium text-gray-700">Email address</label>
                  <div class="mt-1">
                    <input type="email" id="email-address" name="email-address" autocomplete="email" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                  </div>
                </div>
              </div>

              <div class="mt-10 border-t border-gray-200 pt-10">
                <h2 class="text-lg font-bold text-gray-900">ข้อมูลการจัดส่งสินค้า</h2>

                <div class="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label for="first-name" class="block text-sm font-medium text-gray-700">First name</label>
                    <div class="mt-1">
                      <input type="text" id="first-name" name="first-name" autocomplete="given-name" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <div>
                    <label for="last-name" class="block text-sm font-medium text-gray-700">Last name</label>
                    <div class="mt-1">
                      <input type="text" id="last-name" name="last-name" autocomplete="family-name" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <div class="sm:col-span-2">
                    <label for="company" class="block text-sm font-medium text-gray-700">Company</label>
                    <div class="mt-1">
                      <input type="text" name="company" id="company" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <div class="sm:col-span-2">
                    <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
                    <div class="mt-1">
                      <input type="text" name="address" id="address" autocomplete="street-address" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <div class="sm:col-span-2">
                    <label for="apartment" class="block text-sm font-medium text-gray-700">Apartment, suite, etc.</label>
                    <div class="mt-1">
                      <input type="text" name="apartment" id="apartment" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <div>
                    <label for="city" class="block text-sm font-medium text-gray-700">City</label>
                    <div class="mt-1">
                      <input type="text" name="city" id="city" autocomplete="address-level2" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <div>
                    <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
                    <div class="mt-1">
                      <select id="country" name="country" autocomplete="country-name" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option>United States</option>
                        <option>Canada</option>
                        <option>Mexico</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label for="region" class="block text-sm font-medium text-gray-700">State / Province</label>
                    <div class="mt-1">
                      <input type="text" name="region" id="region" autocomplete="address-level1" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <div>
                    <label for="postal-code" class="block text-sm font-medium text-gray-700">Postal code</label>
                    <div class="mt-1">
                      <input type="text" name="postal-code" id="postal-code" autocomplete="postal-code" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <div class="sm:col-span-2">
                    <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
                    <div class="mt-1">
                      <input type="text" name="phone" id="phone" autocomplete="tel" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-10 border-t border-gray-200 pt-10">
                <fieldset>
                  <legend class="text-lg font-bold text-gray-900">ช่องทางการจัดดส่ง</legend>

                  <div class="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <label class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                      <input type="radio" name="delivery-method" value="Standard" class="sr-only" aria-labelledby="delivery-method-0-label" aria-describedby="delivery-method-0-description-0 delivery-method-0-description-1">
                      <span class="flex flex-1">
                        <span class="flex flex-col">
                          <span id="delivery-method-0-label" class="block text-sm font-medium text-gray-900">Standard</span>
                          <span id="delivery-method-0-description-0" class="mt-1 flex items-center text-sm text-gray-500">4–10 business days</span>
                          <span id="delivery-method-0-description-1" class="mt-6 text-sm font-medium text-gray-900">$5.00</span>
                        </span>
                      </span>
                      <svg class="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                      </svg>
                      <span class="pointer-events-none absolute -inset-px rounded-lg border-2" aria-hidden="true"></span>
                    </label>
                    <label class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                      <input type="radio" name="delivery-method" value="Express" class="sr-only" aria-labelledby="delivery-method-1-label" aria-describedby="delivery-method-1-description-0 delivery-method-1-description-1">
                      <span class="flex flex-1">
                        <span class="flex flex-col">
                          <span id="delivery-method-1-label" class="block text-sm font-medium text-gray-900">Express</span>
                          <span id="delivery-method-1-description-0" class="mt-1 flex items-center text-sm text-gray-500">2–5 business days</span>
                          <span id="delivery-method-1-description-1" class="mt-6 text-sm font-medium text-gray-900">$16.00</span>
                        </span>
                      </span>
                      <svg class="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                      </svg>
                      <span class="pointer-events-none absolute -inset-px rounded-lg border-2" aria-hidden="true"></span>
                    </label>
                  </div>
                </fieldset>
              </div>

              <!-- Payment -->
              <div class="mt-10 border-t border-gray-200 pt-10">
                <h2 class="text-lg font-bold text-gray-900">ช่องทางการชำระเงิน</h2>

                <fieldset class="mt-4">
                  <legend class="sr-only">Payment type</legend>
                  <div class="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                    <div class="flex items-center">
                      <input id="credit-card" name="payment-type" type="radio" checked class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                      <label for="credit-card" class="ml-3 block text-sm font-medium text-gray-700">Credit card</label>
                    </div>
                    <div class="flex items-center">
                      <input id="paypal" name="payment-type" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                      <label for="paypal" class="ml-3 block text-sm font-medium text-gray-700">PayPal</label>
                    </div>
                    <div class="flex items-center">
                      <input id="etransfer" name="payment-type" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">
                      <label for="etransfer" class="ml-3 block text-sm font-medium text-gray-700">eTransfer</label>
                    </div>
                  </div>
                </fieldset>

                <div class="mt-6 grid grid-cols-4 gap-x-4 gap-y-6">
                  <div class="col-span-4">
                    <label for="card-number" class="block text-sm font-medium text-gray-700">Card number</label>
                    <div class="mt-1">
                      <input type="text" id="card-number" name="card-number" autocomplete="cc-number" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <div class="col-span-4">
                    <label for="name-on-card" class="block text-sm font-medium text-gray-700">Name on card</label>
                    <div class="mt-1">
                      <input type="text" id="name-on-card" name="name-on-card" autocomplete="cc-name" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <div class="col-span-3">
                    <label for="expiration-date" class="block text-sm font-medium text-gray-700">Expiration date (MM/YY)</label>
                    <div class="mt-1">
                      <input type="text" name="expiration-date" id="expiration-date" autocomplete="cc-exp" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <div>
                    <label for="cvc" class="block text-sm font-medium text-gray-700">CVC</label>
                    <div class="mt-1">
                      <input type="text" name="cvc" id="cvc" autocomplete="csc" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order summary -->
            <div class="mt-10 lg:mt-0">
              <h2 class="text-lg font-bold text-gray-900">สรุปคำสั่งซื้อ</h2>

              <div class="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <h3 class="sr-only">Items in your cart</h3>
                <ul role="list" class="divide-y divide-gray-200">
                  
                  <li v-for="product in cartProducts" :key="product.productId" class="flex px-4 py-6 sm:px-6">
                    <div class="flex-shrink-0">
                      <img src="https://tailwindui.com/img/ecommerce-images/product-page-01-featured-product-shot.jpg" alt="Front of men&#039;s Basic Tee in black." class="w-10 rounded-md">
                    </div>

                    <div class="ml-6 flex flex-1 flex-col">
                      <div class="flex">
                        <div class="min-w-0 flex-1">
                          <h4 class="text-sm">
                            <a href="#" class="font-medium text-gray-700 hover:text-gray-800">{{ product.name }}</a>
                          </h4>
                        </div>

                        <div class="ml-4 flow-root flex-shrink-0">
                          <button @click="removeFromCart(product)" type="button" class="-m-2.5 flex items-center justify-center bg-white p-2.5 text-gray-400 hover:text-gray-500">
                            <span class="sr-only">Remove</span>
                            <font-awesome-icon :icon="['fas','trash']" class="w-4 h-4"/>
                          </button>
                        </div>
                      </div>

                      <div class="flex flex-1 items-end justify-between pt-2">
                        <p class="mt-1 text-sm font-medium text-gray-900">{{ formatPrice(product.price) }}X{{product.quantity}} <span class="font-bold">({{ formatPrice(product.price*product.quantity) }})</span></p>

                        <div class="ml-4">
                          <div class="flex items-center mt-2">
                            <button @click="updateQuantity(product, -1)" class="w-6 h-6 border border-gray-400 hover:bg-gray-400 hover:text-white rounded-full">-</button>
                            <span class="px-2">{{ product.quantity }}</span>
                            <button @click="updateQuantity(product, 1)" class="w-6 h-6 border border-gray-400 hover:bg-gray-400 hover:text-white rounded-full">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  <!-- More products... -->
                </ul>
                <dl class="space-y-3 border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div class="flex items-center justify-between">
                    <dt class="text-sm">รวม</dt>
                    <dd class="text-sm font-medium text-gray-900">{{ formatPrice(cartTotal) }}</dd>
                  </div>
                  <div class="flex items-center justify-between">
                    <dt class="text-sm">ค่าจัดส่ง</dt>
                    <dd class="text-sm font-medium text-gray-900">0.00</dd>
                  </div>
                  <div class="flex items-center justify-between">
                    <dt class="text-sm">ภาษี</dt>
                    <dd class="text-sm font-medium text-gray-900">0.00</dd>
                  </div>
                  <div class="flex items-center justify-between border-t border-gray-200 pt-6">
                    <dt class="text-base font-bold">ยอดสุทธิ</dt>
                    <dd class="text-base font-bold text-indigo-600">{{ formatPrice(cartTotal) }}</dd>
                  </div>
                </dl>

                <div class="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <button type="button" class="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"><font-awesome-icon :icon="['fas', 'check-circle']" /> ยืนยันการสั่งซื้อ</button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      
    </main>
  
    </template>
    
    <script>
  
    import storageManager from '@/plugins/storage';
    //import convertUtils from "@/plugins/convertUtils";
    import deviceUtils from "@/plugins/DeviceUtils";
    import { fetchCart,removeFromCart, updateQuantity } from '@/plugins/cart.js';
  
    export default {
      inject: ['eventBus'],
      data() {
        return {
          configs: storageManager.get('configs'),
          deviceType: deviceUtils.deviceDetect(),
          sortMenuOpen: false,
          categoryMenuOpen: false,
          categories: [
            { id: 0, value: "tees", label: "Tees" },
            { id: 1, value: "crewnecks", label: "Crewnecks" },
            { id: 2, value: "hats", label: "Hats" },
            { id: 3, value: "bundles", label: "Bundles" },
            { id: 4, value: "carry", label: "Carry" },
            { id: 5, value: "objects", label: "Objects" }
          ],
          selectedCategories: [],
          products: [],
          cartCount: 0,
          items: [],
        };
      },
      created() {
        this.fetchCartCount();
      },
      async mounted() {
        try {
          await this.fetchCartCount();
        } catch (error) {
          console.log(error);
        }
      },
      computed: {
        cartProducts() {
          return this.items.products || []; // Assuming items is the fetched cart data
        }
      },
      methods: {
        toggleSortMenu() {
          this.sortMenuOpen = !this.sortMenuOpen;
        },
        toggleCategoryMenu() {
          this.categoryMenuOpen = !this.categoryMenuOpen;
        },
        toggleCategory(value) {
          const index = this.selectedCategories.indexOf(value);
          if (index > -1) {
            this.selectedCategories.splice(index, 1);
          } else {
            this.selectedCategories.push(value);
          }
        },
        formatPrice(price) {
          return price;
        },
        async fetchCartCount() {
          try {
            const items = await fetchCart();
            let cartCount = 0;
            let cartTotal = 0;

            if (items && items.products && Array.isArray(items.products)) {
              cartCount = items.products.reduce((total, product) => total + product.quantity, 0);
              cartTotal = items.products.reduce((total, product) => total + product.price * product.quantity, 0);
            }

            this.items = items;
            this.cartCount = cartCount;
            this.cartTotal = cartTotal;
          } catch (error) {
            console.error(error);
          }
        },
        async removeFromCart(product) {
          try {
            await removeFromCart(product); // Call the function from cart.js
            // Perform any additional actions, such as updating the cart display or triggering other logic
            this.fetchCartCount();
            this.eventBus.emit('cart-event', 'Event payload');
          } catch (error) {
            console.error(error);
          }
        },
        async updateQuantity(product, quantityChange) {
          try {
            await updateQuantity(product, quantityChange); // Call the function from cart.js
            // Perform any additional actions, such as updating the cart display or triggering other logic
            this.fetchCartCount();
            this.eventBus.emit('cart-event', 'Event payload');
          } catch (error) {
            console.error(error);
          }
        },
      }
    };
    </script>
    
    <style>
    .clamp-lines-2 {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  
    .align-top {
      display: flex;
      align-items: flex-start;
    }
    </style>
    
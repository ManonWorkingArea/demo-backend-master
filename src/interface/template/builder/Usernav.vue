<template>
  <template v-if="this.login">
    <div class="profile">
      <div class="ml-auto flex items-center profile-icon">
        <div class="lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6 profile">
          <div class="hidden md:block flex lg:ml-6 relative">
            <div class="relative">
              <font-awesome-icon
                :icon="['fas', 'envelope']"
                class="w-6 h-6 text-gray-500 hover:text-gray-400 cursor-pointer"
              />
              <div class="absolute -top-2 -right-2 rounded-full bg-red-500 text-white w-4 h-4 flex items-center justify-center text-xs">
                0
              </div>
            </div>
          </div>

          <div class="hidden md:block flex lg:ml-6 relative" v-if="config.plugins.includes('shop')">
            <div class="relative" @click="showCartPopup = !showCartPopup">
              <font-awesome-icon
                :icon="['fas', 'shopping-bag']"
                class="w-6 h-6 text-gray-500 hover:text-gray-400 cursor-pointer"
              />
              <p>{{ message }}</p>
              <div class="absolute -top-2 -right-2 rounded-full bg-red-500 text-white w-4 h-4 p-1 flex items-center justify-center text-[10px]">
                {{ cartCount }}
              </div>
            </div>
            <div v-if="showCartPopup" class="absolute z-10 w-[300px] bg-white shadow-md border border-gray-200 rounded-md py-2 px-2 mt-2 -ml-16">
              <ul>
                <li v-for="product in cartProducts" :key="product.productId" class="p-2 cursor-pointer border-b border-gray-200 hover:bg-gray-200 flex items-center">
                  <div class="flex-shrink-0">
                    <img src="https://tailwindui.com/img/ecommerce-images/product-page-01-featured-product-shot.jpg" alt="Front of men&#039;s Basic Tee in black." class="h-10 rounded-md">
                  </div>
                  <div class="flex-grow ml-4">
                    <div>
                      <span class="block overflow-hidden overflow-ellipsis whitespace-nowrap text-xs max-w-[200px]">{{ product.name }}</span>
                      <div class="text-gray-500 text-xs">ราคา: {{ product.price }}</div>
                    </div>
                    <div class="flex items-center mt-2">
                      <span class="mr-2 text-sm">จำนวน</span>
                      <button @click="updateQuantity(product, -1)" class="w-6 h-6 border border-gray-400 hover:bg-gray-400 hover:text-white rounded-full">-</button>
                      <span class="px-2">{{ product.quantity }}</span>
                      <button @click="updateQuantity(product, 1)" class="w-6 h-6 border border-gray-400 hover:bg-gray-400 hover:text-white rounded-full">+</button>
                      <button @click="removeFromCart(product)" class="ml-4 text-red-500 hover:text-red-700 text-xs">
                        <font-awesome-icon :icon="['fas','trash']" class="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
              
              <div class="mt-4 flex justify-between text-sm">
                <span>จำนวน : {{ cartCount }} ชิ้น</span>
                <span>ยอดรวม : {{ cartTotal }} บาท</span>
              </div>
              <div class="mt-4 flex">
                <button @click="showCartPopup = false" class="flex-grow px-4 py-2 mr-2 text-sm bg-gray-200 text-gray-600 hover:bg-gray-300 rounded">ปิด</button>
                <router-link :to="'/shop/checkout'" class="flex-grow px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-400 rounded checkout text-center">ชำระเงิน</router-link>
              </div>
            </div>
          </div>
          <router-link :to="session.mode === 'bypass' ? '/user/employee' : '/user/profile'" class="text-sm font-medium text-gray-700">
            <span class="relative inline-block mt-2 md:-mt-1">
              <avatar :data="{ name: profile.firstname + ' ' + profile.lastname, image: profile.avatar, size: 10 }" class="h-10 w-10" />
              <span class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
            </span>
          </router-link>

        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <template v-if="isDevice==='desktop'">
      <div :class="[getHeaderClasses(), styles.classes]" :style="getImageStyle()">
        <ul class="flex space-x-2 navigation-item">
          <li>
            <router-link :to="data.url ? '/' + data.url : '/' + this.config.layout.usermenuendpoint + '/login'" class="font-medium text-gray-500 hover:text-indigo-800">
              <template v-if="data.type==='icon'">
                <font-awesome-icon :icon="['fas','key']" class="w-3 h-3"/>
              </template>
              <template v-else>
                <font-awesome-icon :icon="['fas','key']" class="w-3 h-3"/> เข้าสู่ระบบ
              </template>
            </router-link>
          </li>
          <li class="h-6 w-px bg-gray-200" aria-hidden="true"></li>
          <li>
            <router-link :to="'/'+ this.config.layout.usermenuendpoint +'/register'" class="font-medium text-gray-500 hover:text-indigo-800">
              <template v-if="data.type==='icon'">
                <font-awesome-icon :icon="['fas','user-plus']" class="w-4 h-4"/>
              </template>
              <template v-else>
                <font-awesome-icon :icon="['fas','user-plus']" class="w-4 h-4"/> สมัครสมาชิก
              </template>
            </router-link>
          </li>
        </ul>
      </div>
    </template>

    <template v-if="isDevice==='mobile'">
      <router-link :to="data.url ? '/' + data.url : this.config.layout.usermenuendpoint + '/login'" class="px-4 py-2 font-medium text-gray-500 hover:text-indigo-800">
        <font-awesome-icon :icon="['fas','key']" class="w-4 h-4"/>
      </router-link>
      <router-link :to="'/'+ this.config.layout.usermenuendpoint +'/register'" class="px-4 py-2 font-medium text-gray-500 hover:text-indigo-800">
        <font-awesome-icon :icon="['fas','user-plus']" class="w-5 h-5"/>
      </router-link>
    </template>
  </template>
</template>

<script>
import storageManager from '@/plugins/storage';
import { generateStyles } from '@/plugins/builder.js';
import { fetchCart,removeFromCart, updateQuantity } from '@/plugins/cart.js';
import avatar from '@/utils/Avatar.vue';
import debug from '@/plugins/Logger.js';

export default {
  inject: ['eventBus'],
  data() {
    return {
      session: storageManager.get('session'),
      config: storageManager.get('configs'),
      login: storageManager.get('session', 'login'),
      profile: storageManager.get('session','user'),
      isDevice: window.innerWidth <= 768 ? 'mobile' : 'desktop',
      cartCount: 0,
      showCartPopup: false,
      items: [],
      message: '',
      avatarData: {
        image: this.profile ? this.profile.avatar || null : null,// Replace with the actual image path
        email: this.profile ? this.profile.email || null : null,
      },
    };
  },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  components: {
    avatar
    },
  created() {
    this.eventBus.on('cart-event', () => {
      this.fetchCartCount();
    });
  },
  methods: {
    getHeaderClasses() {
      return [
        'text-' + this.data.color,
        'text-' + this.data.fontSize,
        'font-' + this.data.fontWeight,
        'text-' + this.data.align
      ];
    },
    getImageStyle() {
      if (this.data.width) {
        return {
          width: this.data.width + 'px'
        };
      }
      return {};
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
      } catch (error) {
        console.error(error);
      }
    },
    async updateQuantity(product, quantityChange) {
      try {
        await updateQuantity(product, quantityChange); // Call the function from cart.js
        // Perform any additional actions, such as updating the cart display or triggering other logic
        this.fetchCartCount();
      } catch (error) {
        console.error(error);
      }
    },
  },
  computed: {
    styles() {
      return generateStyles(this.data);
    },
    cartProducts() {
      debug.log("cartProducts",this.items);
      return this.items.products || []; // Assuming items is the fetched cart data
    }
  },
  mounted() {
    this.eventBus.on('fetch-cart-count', this.fetchCartCount);
    if(this.login){
      this.fetchCartCount();
    }
  },
  beforeUnmount() {
    this.eventBus.off('fetch-cart-count', this.fetchCartCount);
  }
};
</script>

<template>
    <div>
      <hr>
      <br>
      <h1><strong>Store Front</strong></h1>
      <Store />

      <hr>
      <br>
      <h1><strong>ProductDetail</strong></h1>
      <ProductDetail />

      <hr>
      <br>
      <h1><strong>Product</strong></h1>
      <Product />
      
      <hr>
      <br>
      <h1><strong>Inventory</strong></h1>
      <Inventory />

      <hr>
      <br>
      <h1><strong>Category</strong></h1>
      <Category />

      <hr>
      <br>
      <h1><strong>Price</strong></h1>
      <Price />

      <hr>
      <br>
      <h1><strong>Test</strong></h1>
      <Test />

      <hr>
      <br>
      <h1><strong>Coupon</strong></h1>
      <Coupon />

      <hr>
      <br>
      <h1><strong>Fee</strong></h1>
      <Fee />

      <hr>
      <br>
      <h1><strong>Payment</strong></h1>
      <Payment />

      <hr>
      <br>
      <h1><strong>Status</strong></h1>
      <Status />

      
    </div>
  </template>
  
  <script>
  import Product from './Product/Product.vue';
  import Store from './Product/Storefront.vue';
  import Inventory from './Product/Inventory.vue';
  import Category from './Product/Category.vue';
  import Price from './Product/Price.vue';
  import Test from './Product/ShopTest.vue';
  import ProductDetail from './Product/ProductDetail.vue';
  import Coupon from './Product/Coupon.vue';
  import Fee from './Product/Fee.vue';
  import Payment from './Product/Payment.vue';
  import Status from './Product/OrderStatus.vue';

  export default {
    components: {
      Product,
      Inventory,
      Category,
      Price,
      Test,
      ProductDetail,
      Coupon,
      Store,
      Fee,
      Payment,
      Status
    },
  };
  </script>
  
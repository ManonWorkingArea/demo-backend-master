<template>
  <div>
    <h1><strong>OrderCode</strong></h1>
    <OrderCode />
  </div>
  <div>
    <h1><strong>Currency</strong></h1>
    <Currency />
  </div>
  <div>
    <h1><strong>Shop Actions</strong></h1>
    <ShopAction />
  </div>
  <div>
    <h1><strong>Shop Catalog Mode</strong></h1>
    <CatalogMode />
  </div>
</template>

<script>
import OrderCode from './Store/OrderCode.vue';
import Currency from './Store/Currency.vue';
import ShopAction from './Store/ShopAction.vue';
import CatalogMode from './Store/CatalogMode.vue';

export default {
  components: {
    OrderCode,
    Currency,
    ShopAction,
    CatalogMode
  },
};
</script>

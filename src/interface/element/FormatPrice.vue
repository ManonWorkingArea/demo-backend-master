<script>
export default {
    props: ['regular','sale'],
    components: {
    },
    data() {
      return {
        regular_price:this.regular,
        sale_price:this.sale||'0',
      }
    },
    methods: {
        formatPrice(value) {
        return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
      },
    }
};
</script>

<template>
<span>
{{formatPrice(this.regular_price)}} ฿ / {{formatPrice(this.sale_price)}} ฿
</span>
</template> 


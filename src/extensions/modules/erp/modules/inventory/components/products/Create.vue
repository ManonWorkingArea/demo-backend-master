<template>
  <ProductForm 
    mode="add"
    @save="onProductSaved"
    @cancel="onCancel"
  />
</template>

<script>
import { useRouter } from 'vue-router'
import ProductForm from './shared/Form.vue'

export default {
  name: 'ProductCreate',
  components: {
    ProductForm
  },
  setup() {
    const router = useRouter()

    const onProductSaved = (product) => {
      console.log('Product created:', product)
      // Navigate to the new product detail page or back to list
      if (product && product.id) {
        router.push(`/inventory/products/${product.id}`)
      } else {
        router.push('/inventory/products')
      }
    }

    const onCancel = () => {
      router.push('/inventory/products')
    }

    return {
      onProductSaved,
      onCancel
    }
  }
}
</script>

<style scoped>
/* Add any custom styles here */
</style>
<template>
    <div>
      <h2>Create New Product</h2>
      <form @submit.prevent="createProduct">
        <div>
          <label for="name">Product Name:</label>
          <input type="text" v-model="product.name" id="name" required />
        </div>
        <div>
          <label for="price">Price:</label>
          <input type="number" v-model="product.price" id="price" required />
        </div>
        <div>
          <label for="description">Description:</label>
          <textarea v-model="product.description" id="description"></textarea>
        </div>
        <div>
          <label for="image">Image URL:</label>
          <input type="text" v-model="product.image_url" id="image" required />
        </div>
        <button type="submit">Create Product</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        product: {
          name: '',
          price: '',
          description: '',
          image_url: '' // Add this field for the image URL
        }
      };
    },
    methods: {
      async createProduct() {
        const data = {
          name: this.product.name,
          regular_price: this.product.price.toString(),
          description: this.product.description,
          images: [
            {
              src: this.product.image_url
            }
          ]
        };
  
        const auth = btoa('ck_ed64b8d78cdee89d97aa1ac3dece0c715e95cd58:cs_0f46af30389dfb6a140847900b12567dc7dc5412'); // Replace with your actual consumer key and secret
  
        try {
          const response = await axios.post('https://espada-fashion.com/wp-json/wc/v2/products', data, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${auth}`
            }
          });
          console.log('Product created successfully:', response.data);
        } catch (error) {
          console.error('Error creating product:', error.response ? error.response.data : error.message);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  
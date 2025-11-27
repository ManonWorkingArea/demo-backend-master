<template>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <slot :data="data"></slot>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      url: {
        type: String,
        required: true,
      },
      method: {
        type: String,
        default: 'get',
        validator: value => ['get', 'post'].includes(value),
      },
      query: {
        type: String,
        default: '',
      },
      body: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        data: null,
        loading: false,
      };
    },
    async created() {
      this.loading = true;
      try {
        let response;
        if (this.method === 'get') {
          response = await fetch(`${this.url}${this.query}`);
        } else if (this.method === 'post') {
          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.body),
          };
          response = await fetch(this.url, requestOptions);
        }
        const data = await response.json();
        this.data = data;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
  };
  </script>
  
<template>
  <table class="table">
    <thead>
      <tr>
        <th v-for="key in Object.keys(items[0])" :key="key">{{ key }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in items" :key="index">
        <td v-for="key in Object.keys(items[0])" :key="key">{{ item[key] }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'TableTemplate',
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
};
</script>

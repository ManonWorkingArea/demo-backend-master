<template>
    <div>
      <div v-for="(item, index) in data" :key="index" :style="item.style">
        <div v-html="replacePlaceholders(item.template, item.placeholders)"></div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      data: {
        type: Array,
        required: true,
      },
      placeholders: {
        type: Object,
        default: () => {},
      },
    },
    methods: {
      replacePlaceholders(template, placeholders) {
        let replacedTemplate = template;
  
        for (const placeholder in placeholders) {
          const regex = new RegExp('\\[\\[' + placeholder + '\\]\\]', 'g');
          replacedTemplate = replacedTemplate.replace(regex, placeholders[placeholder]);
        }
  
        return replacedTemplate;
      },
    },
  };
  </script>
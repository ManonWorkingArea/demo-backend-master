<template>
    <div class="email-builder">
      <h2>Email Builder</h2>
      <button @click="$emit('backToList')">Back to List</button>
      <button @click="showPreview">Preview Template</button>
      <div>
        <label>Logo URL:</label>
        <input v-model="logoUrl" placeholder="Enter logo URL" />
      </div>
      <div>
        <label>Logo Alignment:</label>
        <select v-model="logoAlignment">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div>
        <label>Banner Image URL:</label>
        <input v-model="bannerImageUrl" placeholder="Enter banner image URL" />
      </div>
      <div>
        <label>Banner URL:</label>
        <input v-model="bannerUrl" placeholder="Enter banner URL" />
      </div>
      <div>
        <label>Subheader:</label>
        <input v-model="subheader" placeholder="Enter subheader text" />
      </div>
      <div>
        <label>Email Content:</label>
        <textarea v-model="content" placeholder="Enter content"></textarea>
      </div>
      <div>
        <label>Footer Text:</label>
        <input v-model="footerText" placeholder="Enter footer text" />
      </div>
      <div>
        <label>Footer Column 1:</label>
        <input v-model="footerColumn1" placeholder="Enter footer column 1 text" />
      </div>
      <div>
        <label>Footer Column 2:</label>
        <input v-model="footerColumn2" placeholder="Enter footer column 2 text" />
      </div>
      <div>
        <label>Footer Column 3:</label>
        <input v-model="footerColumn3" placeholder="Enter footer column 3 text" />
      </div>
      <div>
        <label>Heading Alignment:</label>
        <select v-model="headingAlignment">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div>
        <label>Heading Font Size:</label>
        <input type="number" v-model="headingFontSize" placeholder="Enter heading font size in px" />
      </div>
      <button @click="updateTemplate">Save Template</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      templateContent: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        logoUrl: this.templateContent.logoUrl || '',
        logoAlignment: this.templateContent.logoAlignment || 'left',
        bannerImageUrl: this.templateContent.bannerImageUrl || '',
        bannerUrl: this.templateContent.bannerUrl || '',
        subheader: this.templateContent.subheader || '',
        content: this.templateContent.content || '',
        footerText: this.templateContent.footerText || '',
        footerColumn1: this.templateContent.footerColumns?.[0] || '',
        footerColumn2: this.templateContent.footerColumns?.[1] || '',
        footerColumn3: this.templateContent.footerColumns?.[2] || '',
        headingAlignment: this.templateContent.headingAlignment || 'left',
        headingFontSize: this.templateContent.headingFontSize || 18
      };
    },
    watch: {
      templateContent: {
        handler(newContent) {
          this.logoUrl = newContent.logoUrl || '';
          this.logoAlignment = newContent.logoAlignment || 'left';
          this.bannerImageUrl = newContent.bannerImageUrl || '';
          this.bannerUrl = newContent.bannerUrl || '';
          this.subheader = newContent.subheader || '';
          this.content = newContent.content || '';
          this.footerText = newContent.footerText || '';
          this.footerColumn1 = newContent.footerColumns?.[0] || '';
          this.footerColumn2 = newContent.footerColumns?.[1] || '';
          this.footerColumn3 = newContent.footerColumns?.[2] || '';
          this.headingAlignment = newContent.headingAlignment || 'left';
          this.headingFontSize = newContent.headingFontSize || 18;
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
      updateTemplate() {
        const emailTemplate = {
          logoUrl: this.logoUrl,
          logoAlignment: this.logoAlignment,
          bannerImageUrl: this.bannerImageUrl,
          bannerUrl: this.bannerUrl,
          subheader: this.subheader,
          content: this.content,
          footerText: this.footerText,
          footerColumns: [
            this.footerColumn1,
            this.footerColumn2,
            this.footerColumn3
          ],
          headingAlignment: this.headingAlignment,
          headingFontSize: this.headingFontSize
        };
        this.$emit('updateTemplate', emailTemplate);
      },
      showPreview() {
        const emailTemplate = {
          logoUrl: this.logoUrl,
          logoAlignment: this.logoAlignment,
          bannerImageUrl: this.bannerImageUrl,
          bannerUrl: this.bannerUrl,
          subheader: this.subheader,
          content: this.content,
          footerText: this.footerText,
          footerColumns: [
            this.footerColumn1,
            this.footerColumn2,
            this.footerColumn3
          ],
          headingAlignment: this.headingAlignment,
          headingFontSize: this.headingFontSize
        };
        this.$emit('showPreview', emailTemplate);
      }
    }
  };
  </script>
  
  <style scoped>
  .email-builder {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-width: 600px;
    margin: 0 auto;
  }
  .email-builder label {
    margin-bottom: 5px;
  }
  .email-builder input,
  .email-builder textarea,
  .email-builder select {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  </style>
  
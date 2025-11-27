<template>
    <div class="email-template">

        <Product/>
      <h2>Email Template {{ configId }}</h2>
      <div v-if="showBuilder">
        <EmailBuilder
          :templateContent="templateContent"
          @saveTemplate="saveBuilderData"
          @updateTemplate="updateBuilderData"
          @backToList="navigateBackToList"
          @showPreview="triggerShowPreview"
        />
      </div>
      <div v-else-if="showPreview">
        <EmailPreview
          :config="templateContent"
          @backToBuilder="navigateBackToBuilder"
        />
      </div>
      <div v-else>
        <div>
          <label>Template Name:</label>
          <input v-model="templateName" placeholder="Enter template name" />
        </div>
        <div>
          <label>Template Code:</label>
          <input v-model="templateCode" placeholder="Enter template code" />
        </div>
        <div>
          <label>Email Content:</label>
          <textarea v-model="content" placeholder="Enter content"></textarea>
        </div>
        <button @click="saveTemplate">Save Template</button>
        <p>{{ message }}</p>
        <h3>Templates List</h3>
        <ul>
          <li v-for="item in templates" :key="item._id">
            <a @click.prevent="openBuilder(item._id)">{{ item.name }}</a>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
    import Product from './email/Product.vue';

  import EmailBuilder from './email/EmailBuilder.vue';
  import EmailPreview from './email/EmailPreview.vue';
  import requestClient from '@/plugins/requestClient';
  import storageManager from '@/plugins/storage';
  
  const Request = new requestClient(false);
  const configs = storageManager.get('configs');
  const session = storageManager.get('session');
  
  export default {
    components: {
      EmailBuilder,
      EmailPreview,
      Product
    },
    data() {
      return {
        templateName: '',
        templateCode: '',
        content: '',
        configId: null,
        message: '',
        showBuilder: false,
        showPreview: false,
        templates: [],
        templateContent: {}
      };
    },
    methods: {
      async addEmailTemplate() {
        try {
          const response = await Request.POST('email_template/', {
            data: {
              name: this.templateName,
              code: this.templateCode,
              content: this.content,
              unit: session.current._id || configs.siteID
            }
          }, configs.key);
          if (response.status === 200) {
            this.configId = response.data._id; // Save the ID of the new template
            this.message = 'Email template saved!';
            this.loadTemplates();
          }
        } catch (error) {
          console.error('Error adding email template:', error);
          this.message = 'Error saving template';
        }
      },
      async updateEmailTemplate(updatedContent) {
        try {
          const response = await Request.PUT(`email_template/${this.configId}`, {
            data: {
              name: this.templateName,
              code: this.templateCode,
              content: JSON.stringify(updatedContent),
              _id: undefined
            }
          }, configs.key);
          if (response.status === 200) {
            this.message = 'Email template updated!';
            this.loadTemplates();
          }
        } catch (error) {
          console.error('Error updating email template:', error);
          this.message = 'Error updating template';
        }
      },
      async loadEmailTemplate(id) {
        try {
          const response = await Request.GET(`email_template/${id}`, configs.key);
          if (response.status === 200) {
            const template = response.data;
            this.templateContent = JSON.parse(template.content) || {};
            this.templateName = template.name || '';
            this.templateCode = template.code || '';
            this.configId = template._id;
          }
        } catch (error) {
          console.error('Error loading email template:', error);
        }
      },
      async loadTemplates() {
        try {
          const response = await Request.POST('email_template/query', {
            method: 'find',
            args: [{ unit: session.current._id || configs.siteID }]
          }, configs.key);
          if (response.status === 200 && response.data.length > 0) {
            this.templates = response.data;
          }
        } catch (error) {
          console.error('Error loading templates:', error);
        }
      },
      async openBuilder(id) {
        await this.loadEmailTemplate(id);
        this.showBuilder = true;
        const url = new URL(window.location);
        url.searchParams.set('itemID', id);
        window.history.pushState({}, '', url);
      },
      saveTemplate() {
        if (this.configId) {
          this.updateEmailTemplate(this.templateContent);
        } else {
          this.addEmailTemplate();
        }
      },
      saveBuilderData(content) {
        this.content = JSON.stringify(content);
        this.saveTemplate();
        this.showBuilder = false;
        this.removeItemIdFromUrl();
      },
      updateBuilderData(content) {
        this.updateEmailTemplate(content);
        this.showBuilder = false;
        this.removeItemIdFromUrl();
      },
      triggerShowPreview(config) {
        this.templateContent = config;
        this.showPreview = true;
        this.showBuilder = false;
      },
      navigateBackToBuilder() {
        this.showPreview = false;
        this.showBuilder = true;
      },
      navigateBackToList() {
        this.showBuilder = false;
        this.clearTemplateSelection();
        this.removeItemIdFromUrl();
      },
      clearTemplateSelection() {
        this.templateName = '';
        this.templateCode = '';
        this.content = '';
        this.configId = null;
        this.templateContent = {};
      },
      removeItemIdFromUrl() {
        const url = new URL(window.location);
        url.searchParams.delete('itemID');
        window.history.pushState({}, '', url);
      }
    },
    created() {
      this.loadTemplates();
      const urlParams = new URLSearchParams(window.location.search);
      const itemId = urlParams.get('itemID');
      if (itemId) {
        this.openBuilder(itemId);
      }
    }
  };
  </script>
  
  <style scoped>
  .email-template {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-width: 600px;
    margin: 0 auto;
  }
  .email-template label {
    margin-bottom: 5px;
  }
  .email-template input,
  .email-template textarea {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  </style>
  
<template>
  <div>
    <div class="grid-container">
      <div class="field">
        <label class="label">Sender Name:</label>
        <div class="control">
          <input class="input" type="text" v-model="localLocalAction.request.senderName" @input="updateAction" />
        </div>
      </div>
      <div class="field">
        <label class="label">Sender Email:</label>
        <div class="control">
          <input class="input" type="email" v-model="localLocalAction.request.senderEmail" @input="updateAction" />
        </div>
      </div>
      <div class="field">
        <label class="label">Recipient Name:</label>
        <div class="control">
          <input class="input" type="text" v-model="localLocalAction.request.recipientName" @input="updateAction" />
        </div>
      </div>
      <div class="field">
        <label class="label">Recipient Email:</label>
        <div class="control">
          <input class="input" type="email" v-model="localLocalAction.request.recipientEmail" @input="updateAction" />
        </div>
      </div>
    </div>
    <div class="field">
      <label class="label">Subject:</label>
      <div class="control">
        <input class="input" type="text" v-model="localLocalAction.request.subject" @input="updateAction" />
      </div>
    </div>
    <div class="field">
      <label class="label">Email Template:</label>
      <div class="control">
        <select class="input" v-model="localLocalAction.request.emailTemplate" @change="updateAction">
          <option v-for="template in emailTemplates" :key="template._id" :value="template._id">
            {{ template.name }}
          </option>
        </select>
      </div>
    </div>
    <div class="field">
      <div>
        <label>Insert Shortcode:</label>
        <div class="shortcode-tags">
          <span class="shortcode-tag" @click="copyToClipboard('[sitename]')">[sitename]</span>
          <span class="shortcode-tag" @click="copyToClipboard('[customer_name]')">[customer_name]</span>
          <span class="shortcode-tag" @click="copyToClipboard('[customer_email]')">[customer_email]</span>
        </div>
      </div>
      <label class="label">Body:</label>
      <div class="control">
        <MiniMCE v-model="localLocalAction.request.body" :options="{ menubar: false , toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | forecolor | removeformat' }" @input="updateAction"/>
      </div>
    </div>
  </div>
</template>


<script>
import MiniMCE from 'minimce';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/themes/silver/theme';
import 'tinymce/icons/default/icons';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);
import storageManager from '@/plugins/storage';
const configs = storageManager.get('configs');
const session = storageManager.get('session');

export default {
  components: {
    MiniMCE
  },
  name: 'EmailComponent',
  props: {
    localAction: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localLocalAction: { ...this.localAction },
      emailTemplates: []
    };
  },
  methods: {
    updateAction() {
      this.$emit('update-action', { ...this.localLocalAction });
    },
    copyToClipboard(text) {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      console.log(`Copied to clipboard: ${text}`);
    },
    async fetchEmailTemplates() {
      try {
        const response = await Request.POST('email_template/query', {
          method: 'find',
          args: [{ unit: session.current._id || configs.siteID }]
        }, configs.key);
        if (response.status === 200) {
          this.emailTemplates = response.data;
        }
      } catch (error) {
        console.error('Error fetching email templates:', error);
      }
    }
  },
  created() {
    this.fetchEmailTemplates();
  }
};
</script>

<style scoped>
.field {
  margin-bottom: 15px;
}
.label {
  display: block;
  margin-bottom: 5px;
}
.input, .textarea, .select {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.shortcode-tags {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.shortcode-tag {
  padding: 5px 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.shortcode-tag:hover {
  background-color: #d0d0d0;
}

/* New grid container for 2-column layout */
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px; /* Space between columns */
}

</style>

<template>
    <div class="email-preview">
      <h2>Email Preview</h2>
      <button @click="$emit('backToBuilder')">Edit Template</button>
      <div class="preview-container">
        <iframe :srcdoc="previewContent" frameborder="0" class="preview-frame"></iframe>
      </div>
    </div>
  </template>
  
  <script>
  import { generateHtmlEmail } from './templateRender'; // Adjust the import path accordingly
  
  export default {
    props: {
      config: {
        type: Object,
        required: true
      }
    },
    computed: {
      previewContent() {
        const sampleContent = `
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in venenatis enim. Vivamus nec gravida velit</p>
          <p>Praesent auctor arcu eget turpis facilisis, nec facilisis libero convallis.</p>
        `;
        const sampleSubject = "Sample Email Subject";
        return generateHtmlEmail(this.config, { 
          subject: this.config.subject || sampleSubject, 
          content: this.config.content || sampleContent 
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .email-preview {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-width: 800px;
    margin: 0 auto;
  }
  .email-preview h2 {
    text-align: center;
  }
  .preview-container {
    padding: 20px;
    background-color: #f2f2f2;
    border-radius: 8px;
  }
  .preview-frame {
    width: 100%;
    height: 800px;
    border: 1px solid #ccc;
    background-color: #e5e5e5;
    padding: 0px 10px 10px 10px;
  }
  </style>
  
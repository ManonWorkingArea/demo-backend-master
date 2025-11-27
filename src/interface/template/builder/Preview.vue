<template>
    <PDFViewer
      :pdfSrc="data.fileurl"
      :fileName="data.filename"
      :previewSrc="data.url"
      :downloadable="data.canDownload"
      :watermarkText="data.watermark"
      :display="data.display"
    />
  </template>
  
  <script>
  import { generateStyles } from '@/plugins/builder.js';
  import PDFViewer from './PreviewPDF.vue';
  
  export default {
    components: {
        PDFViewer,
    },
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    methods: {
      getHeaderClasses() {
        return [
          'text-' + this.data.color,
          'text-' + this.data.fontSize,
          'font-' + this.data.fontWeight,
          'text-' + this.data.align,
        ];
      },
      getImageStyle() {
        const style = {};
        
        if (this.data.width) {
          style.width = this.data.width + 'px';
        }
        
        if (this.data.borderRadiusBottomLeft) {
          style.borderBottomLeftRadius = this.data.borderRadiusBottomLeft + 'px';
        }
  
        if (this.data.borderRadiusBottomRight) {
          style.borderBottomRightRadius = this.data.borderRadiusBottomRight + 'px';
        }
  
        if (this.data.borderRadiusTopLeft) {
          style.borderTopLeftRadius = this.data.borderRadiusTopLeft + 'px';
        }
  
        if (this.data.borderRadiusTopRight) {
          style.borderTopRightRadius = this.data.borderRadiusTopRight + 'px';
        }
  
        return style;
      },
      isExternalLink(link) {
        return /^(http|https):/.test(link);
      }
    },
    computed: {
      styles() {
        return generateStyles(this.data);
      },
    },
  };
  </script>
  
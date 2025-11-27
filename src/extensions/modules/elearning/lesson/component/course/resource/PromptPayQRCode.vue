<template>
    <div class="flex flex-col items-center p-6 bg-white rounded-md shadow-lg w-full max-w-sm">
      <!-- Header Section with Background Image -->
      <div class="mb-4 w-full flex flex-col items-center justify-center"
      >
        <h3 class="text-lg font-bold text-white">สร้าง QR Code สำหรับ PromptPay</h3>
      </div>
  
      <!-- QR Code Display Section -->
      <div ref="promptpayBadge" class="promptpay-badge mb-4 w-full flex flex-col items-center">

        <div class="promptpay-header mb-4 w-full flex flex-col items-center justify-center"></div>
        <!-- Display the QR code using the vue-qrcode component -->
        <vue-qrcode 
          v-if="qrCodeContent" 
          :value="qrCodeContent" 
          :options="{ width: 200, height: 200 }" 
        />
  
        <!-- Display Entered Data Below the QR Code -->
        <div class="promptpay-footer mt-2 w-full">
          <div v-if="promptPayId">
            <strong>PromptPay ID:</strong> {{ promptPayId }}
          </div>
          <div v-if="amount">
            <strong>จำนวนเงิน (บาท):</strong> {{ amount }} บาท
          </div>
          <div v-if="customText">
            <strong>ข้อความเพิ่มเติม:</strong> {{ customText }}
          </div>
        </div>
      </div>
  
      <!-- Form Fields Section -->
      <div class="w-full mb-4">
        <label class="block mb-2">PromptPay ID (หมายเลขโทรศัพท์/เลขบัตรประชาชน)</label>
        <input 
          type="text" 
          v-model="promptPayId" 
          class="p-2 border rounded w-full" 
          placeholder="0812345678 หรือ 1234567890123" 
          @input="generateQRCodeContent"
        />
      </div>
      <div class="w-full mb-4">
        <label class="block mb-2">จำนวนเงิน (บาท)</label>
        <input 
          type="number" 
          v-model="amount" 
          class="p-2 border rounded w-full" 
          placeholder="0.00" 
          @input="generateQRCodeContent"
        />
      </div>
      <div class="w-full mb-4">
        <label class="block mb-2">ข้อความเพิ่มเติม (Custom Note)</label>
        <input 
          type="text" 
          v-model="customText" 
          class="p-2 border rounded w-full" 
          placeholder="ใส่ข้อความที่ต้องการ" 
          @input="generateQRCodeContent"
        />
      </div>
      <button 
        @click="generateQRCodeContent" 
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        สร้าง QR Code
      </button>
      <button 
        @click="downloadImage" 
        class="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        ดาวน์โหลดรูปภาพ
      </button>
    </div>
  </template>
  
  <script>
  import VueQrcode from '@chenfengyuan/vue-qrcode';
  import html2canvas from 'html2canvas';
  
  export default {
    name: 'PromptPayQRCode',
    components: {
      VueQrcode,
    },
    data() {
      return {
        promptPayId: '0956528573', // PromptPay ID (Phone number or National ID)
        amount: '1', // Amount in THB
        customText: 'test', // Custom text to be included in the QR code
        qrCodeContent: '', // Generated PromptPay QR code content string
      };
    },
    methods: {
      generateQRCodeContent() {
        if (!this.promptPayId) {
          this.qrCodeContent = '';
          return;
        }
        this.qrCodeContent = this.generatePromptPayQR();
      },
      generatePromptPayQR() {
        const type = this.getProxyType();
        const target = this.formatTarget(type);
        const amount = parseFloat(this.amount);
  
        // Construct Tag 29 (Proxy Type and Target)
        const tag29 = [
          this.generateTLV("00", "A000000677010111"), // AID for PromptPay
          this.generateTLV(type, target),
        ];
  
        // Construct main payload
        const payload = [
          this.generateTLV("00", "01"), // Payload Format Indicator
          this.generateTLV("01", amount ? "11" : "12"), // Point of Initiation Method
          this.generateTLV("29", this.encodeTLV(tag29)), // Merchant Account Information
          this.generateTLV("53", "764"), // Currency Code (THB)
          this.generateTLV("58", "TH"), // Country Code (Thailand)
        ];
  
        if (amount) {
          payload.push(this.generateTLV("54", amount.toFixed(2))); // Transaction Amount
        }
  
        // Add custom text to Additional Data Field (Tag 62)
        if (this.customText) {
          const additionalData = [
            this.generateTLV("07", this.customText), // Custom Note with Tag 07
          ];
          payload.push(this.generateTLV("62", this.encodeTLV(additionalData)));
        }
  
        // Calculate CRC16
        const qrContent = this.encodeTLV(payload) + '6304';
        return qrContent + this.calculateCRC16(qrContent);
      },
      getProxyType() {
        // Determine the proxy type based on the ID format
        if (this.promptPayId.length === 10 && this.promptPayId.startsWith('0')) {
          return "01"; // MSISDN
        } else if (this.promptPayId.length === 13) {
          return "02"; // National ID
        }
        return "";
      },
      formatTarget(type) {
        // Format the target based on the proxy type
        if (type === "01") {
          // Convert phone number to international format (66xxxxxxxxx)
          return "0066" + this.promptPayId.slice(1);
        }
        return this.promptPayId; // National ID remains the same
      },
      generateTLV(tag, value) {
        const length = value.length.toString().padStart(2, '0');
        return tag + length + value;
      },
      encodeTLV(tlvArray) {
        return tlvArray.join('');
      },
      calculateCRC16(data) {
        // CRC16 calculation logic translated from Java
        let crc = 0xFFFF;
        const polynomial = 0x1021;
  
        for (let i = 0; i < data.length; i++) {
          let byte = data.charCodeAt(i);
          crc ^= byte << 8;
  
          for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
              crc = (crc << 1) ^ polynomial;
            } else {
              crc <<= 1;
            }
          }
        }
        crc &= 0xFFFF;
        return crc.toString(16).toUpperCase().padStart(4, '0');
      },
      downloadImage() {
  const element = this.$refs.promptpayBadge;
  html2canvas(element, {
    useCORS: true, // Enable cross-origin images
    allowTaint: true, // Allow tainted canvas
    backgroundColor: null // Set background to null if you need transparent background
  }).then((canvas) => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'promptpay-qrcode.png';
    link.click();
  });
}

    },
  };
  </script>
  
  <style scoped>
  /* Add any specific styles here */
  .promptpay-header {
    background-image: url('https://www.punboon.org/_next/static/images/qr2-506d233a6277b23b5ca9ed397c3bf391.png');
    background-size: cover;
    background-position: center;
    height: 120px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    /* Ensure the image supports CORS */
    background-repeat: no-repeat;
    background-origin: border-box;
  }
  
  
  .promptpay-badge {
    border: 2px solid #0e3e68;
    padding: 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
  }
  
  .promptpay-footer {
    background: #0e3e68;
    text-align: left;
    color: #fff;
    padding: 5px;
    font-size: 14px;
  }
  </style>
  
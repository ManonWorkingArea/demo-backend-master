<template>
    <div class="flex flex-col md:flex-row items-start p-6 bg-white rounded-md shadow-lg w-full max-w-4xl mx-auto">
      <!-- Left Column: Upload and Preview -->
      <div class="flex flex-col items-center w-full md:w-1/2 p-4 border-r border-gray-300">
        <h3 class="text-lg font-bold mb-4">Upload Slip to Extract Data</h3>
        <input type="file" @change="onFileChange" accept="image/*" class="mb-4 p-2 border rounded w-full" />
    
        <!-- Display Image Preview -->
        <div v-if="previewImage" class="mb-4 w-full flex justify-center">
          <img :src="previewImage" alt="Slip Preview" class="w-full max-w-xs rounded" />
        </div>
    
        <div v-if="processing" class="mb-4">Processing Image, please wait...</div>
      </div>
  
      <!-- Right Column: Extracted Data -->
      <div class="flex flex-col items-start w-full md:w-1/2 p-4">
        <div v-if="detectedSource" class="mb-4 p-2 border rounded bg-gray-100 w-full">
          <h4 class="font-bold">Detected Source:</h4>
          <p>{{ detectedSource }}</p>
        </div>
    
        <div v-if="qrCodeData" class="mb-4 p-2 border rounded bg-gray-100 w-full">
          <h4 class="font-bold">QR Code Data:</h4>
          <pre>{{ qrCodeData }}</pre>
          <button @click="verifySlip" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Verify Slip</button>
        </div>
    
        <div v-if="apiResponse" class="mb-4 p-2 border rounded bg-gray-100 w-full">
          <h4 class="font-bold">API Response:</h4>
          <pre>{{ apiResponse }}</pre>
        </div>
    
        <div v-if="extractedText" class="mb-4 p-2 border rounded bg-gray-100 w-full">
          <h4 class="font-bold">Extracted Text:</h4>
          <pre>{{ extractedText }}</pre>
        </div>
    
        <div v-if="extractedData" class="mb-4 p-2 border rounded bg-gray-100 w-full">
          <h4 class="font-bold">Extracted Data:</h4>
          <p>Transaction Reference: {{ extractedData.reference }}</p>
          <p>Date: {{ extractedData.date }}</p>
          <p>Amount: {{ extractedData.amount }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Tesseract from 'tesseract.js';
  import jsQR from 'jsqr'; // Import the jsQR library for QR code reading
  import { detectSlipSource } from './custom.js'; // Import the custom.js file
  
  export default {
    name: 'SlipImageReader',
    data() {
      return {
        processing: false, // Indicates if the image is being processed
        extractedText: '', // Store the extracted text from the image
        extractedData: null, // Store the extracted data like reference, date, amount
        detectedSource: '', // Store the detected source of the slip
        qrCodeData: '', // Store the extracted QR code data
        apiResponse: null, // Store the API response data
        previewImage: '', // Store the preview image data URL
      };
    },
    methods: {
      onFileChange(event) {
        const file = event.target.files[0];
        if (file) {
          this.processing = true;
          this.extractedText = '';
          this.extractedData = null;
          this.detectedSource = '';
          this.qrCodeData = '';
          this.apiResponse = null;
          this.previewImage = ''; // Reset preview image
  
          const reader = new FileReader();
          reader.onload = (e) => {
            this.previewImage = e.target.result; // Set preview image data URL
  
            const image = new Image();
            image.onload = () => {
              this.extractTextFromImage(image);
            };
            image.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      },
      extractTextFromImage(image) {
        // First, read the QR code from the image
        this.readQRCode(image).then((qrCodeText) => {
          this.qrCodeData = qrCodeText; // Store the extracted QR code data
          console.log('QR Code Data:', qrCodeText);
        }).catch((error) => {
          console.error('QR Code Reading Error:', error);
        });
  
        // Then, process the image for OCR
        Tesseract.recognize(
          image,
          'eng+tha', // Use English and Thai languages
          {
            langPath: './src/assets/', // Relative path to the folder containing traineddata files
            logger: (m) => console.log(m), // Logs progress in the console
          }
        ).then(({ data: { text } }) => {
          console.log('Extracted Text:', text);
          this.extractedText = text;
          this.detectSlipSource(text); // Detect the source of the slip
          this.extractData(text); // Extract data based on the detected source
          this.processing = false;
        }).catch((error) => {
          console.error(error);
          this.processing = false;
        });
      },
      async readQRCode(image) {
        // Read the QR code from the image using jsQR
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
  
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
  
          if (qrCode) {
            resolve(qrCode.data); // Return the QR code data
          } else {
            reject('No QR code found in the image.');
          }
        });
      },
      detectSlipSource(text) {
        // Detect the source of the slip
        this.detectedSource = detectSlipSource(text);
      },
      extractData(text) {
        // Detect the source of the slip
        const source = this.detectedSource;
  
        if (!source || source === 'unknown') {
          console.log('Unknown Source: Cannot extract data');
          return; // Exit if the source is unknown
        }
  
        // Define patterns for extracting data based on the detected source
        let referencePatterns = [];
        let datePatterns = [];
        let amountPatterns = [];
  
        switch (source) {
          case 'ktb':
            // Updated pattern to match the unique KTB reference format
            referencePatterns = [/ร ห ั ส อ (?:ฮ้)?า ง อ ิ ง[:\s]*([A-Za-z0-9]+)/];
            // Updated pattern to match the date format in KTB slips
            datePatterns = [/ว ั น ท ี ่ ท ํ า ร า ย ก า ร\s*(\d{1,2}\s[ก-ฮ]+\.\s\d{4}\s-\s\d{2}:\d{2})/];
            // Updated pattern to match the amount format in KTB slips
            amountPatterns = [/จ ํ า น ว น เง ิ น\s*([\d,.]+)\s*บ า ท/];
            break;
  
          case 'bay':
            // Updated pattern to match the unique BAY reference format
            referencePatterns = [/ห ม า ย เล ขอ ้ า ง อ ิ ง[:\s]*([A-Za-z0-9]+)/];
  
            // Updated pattern to match the date format in BAY slips
            datePatterns = [/ร ร\s*(\d{1,2}\s[ก-ฮ]+\s\d{4}\s\d{2}:\d{2}:\d{2})/];
  
            // Updated pattern to match the amount format in BAY slips
            amountPatterns = [/จ ํ า น ว น เง ิ น\s*([\d,.]+)\s*THB/];
            break;
  
          case 'ttb':
            referencePatterns = [/รหัสอ้างอิง[:\s]*([A-Za-z0-9]+)/];
            datePatterns = [/\d{1,2}\s[ก-ฮ]+\s\d{2}\s-\s\d{2}:\d{2}/];
            amountPatterns = [/จำนวนเงิน\s*([\d,.]+)/];
            break;
          case 'gsb':
            referencePatterns = [/รหัสอ้างอิง[:\s]*([A-Za-z0-9]+)/];
            datePatterns = [/\d{1,2}\s[ก-ฮ]+\s\d{4}\s\d{2}:\d{2}/];
            amountPatterns = [/จำนวนเงิน\s*([\d,.]+)/];
            break;
          case 'bb':
            referencePatterns = [/เล ข ท ี ่ อ ้ า ง อ ิ ง [:]*([A-Za-z0-9]+)/];
            datePatterns = [/\d{1,2}\s[ก-ฮ]+\s\d{2},\s\d{2}:\d{2}/];
            amountPatterns = [/จำนวนเงิน\s*([\d,.]+)/];
            break;
          case 'kb':
            referencePatterns = [/เล ข ท ี ่ ร า ย ก า ร [:]*([A-Za-z0-9]+)/];
            datePatterns = [/\d{1,2}\s[ก-ฮ]+\s\d{2}\s\d{2}:\d{2}/];
            amountPatterns = [/จ ํ า น ว น :\s*([\d,.]+)/];
            break;
          case 'scb':
            referencePatterns = [/ร ห ั ส อ ้ า ง อ ิ ง :\s*([A-Za-z0-9]+)/];
            datePatterns = [/\d{1,2}\s[ก-ฮ]+\s\d{4}\s-\s\d{2}:\d{2}/];
            amountPatterns = [/จ ํ า น ว น เง ิ น\s*([\d,.]+)/];
            break;
          default:
            console.log('Unknown Source: Cannot extract data');
            return; // Exit if the source is unknown
        }
  
        // Function to match patterns sequentially
        const matchPattern = (patterns, text) => {
          for (let pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
              return match[1].trim();
            }
          }
          return 'Not Found';
        };
  
        // Extract data using defined patterns
        const reference = matchPattern(referencePatterns, text);
        const date = matchPattern(datePatterns, text);
        const amount = matchPattern(amountPatterns, text);
  
        this.extractedData = {
          reference,
          date,
          amount,
        };
      },
      async verifySlip() {
        const apiUrl = 'https://api.slipok.com/api/line/apikey/30155';
        const authorizationKey = 'SLIPOKU15TREP'; // Your API key for authorization
  
        // Use qrCodeData for the request
        const requestBody = {
          data: this.qrCodeData,
          log: true
        };
  
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'x-authorization': authorizationKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
  
          const data = await response.json();
          this.apiResponse = data; // Store the API response in apiResponse
          console.log('API Response:', data);
        } catch (error) {
          console.error('Error in API call:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add any specific styles here */
  </style>
  
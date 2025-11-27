<template>

  <div v-if="isGeneratingPDF" class="overlay">
    <div class="overlay-content">
      <span class="loader"></span>
      <p>กำลังสร้างใบรับรอง ...</p>
    </div>
  </div>

  <!-- Check if mobile view and either show the result or the captured image -->
  <div class="result" ref="captureDiv">
      <div ref="canvasContainer"></div>
      <pre v-if="debug" class="absolute z-50"> 
      {{ pages }}
      {{ certData }}
      </pre>
      <div v-for="(page, pageIndex) in pages" :key="pageIndex" class="page" :class="{ landscape: page.landscapeMode }" :style="{
        'padding': page.padding,
        'background-image': 'url(' + page.backgroundImage + ')',
        'background-size': 'cover',
        'background-repeat': 'no-repeat'
      }">
      <div >
        
        <div v-for="(element) in page.elements"
          :key="element.id"
          :ref="`page_${index}`"
          class="page-element"
          :style="{
          'margin-top': element.marginTop + 'cm',
          'margin-bottom': element.marginBottom + 'cm',
          'font-size': element.fontSize,
          'font-weight': element.bold ? 'bold' : 'normal',
          'font-style': element.italic ? 'italic' : 'normal',
          'text-decoration': element.underline ? 'underline' : 'none',
          'width': element.type === 'image' ? element.width : 'auto',
          'height': element.type === 'image' ? element.height : 'auto',
          'position': element.type === 'image' ? 'absolute' : 'static',
          'top': element.type === 'image' && element.cornerPosition.includes('top') ? '0' : 'auto',
          'bottom': element.type === 'image' && element.cornerPosition.includes('bottom') ? '0' : 'auto',
          'left': element.type === 'image' && element.cornerPosition.includes('left') ? '0' : 'auto',
          'right': element.type === 'image' && element.cornerPosition.includes('right') ? '0' : 'auto',
          'margin-left': element.marginLeft + 'cm',
          'margin-right': element.marginRight + 'cm',
          }"
          >

          <template v-if="element.type === 'text'">
            <div>{{ element.value }}</div>
          </template>

          <template v-else-if="element.type === 'image'">
            <template v-if="element.use === 'qrcode'">
              <img ref="qrCode" :src="qrCodeUrl" />
            </template>
            <template v-else-if="element.use === 'avatar'">
              <img v-if="element.value !== null && element.value !== undefined" ref="avatar" :src="element.value" />
            </template>
          </template>

          <template v-if="element.type === 'image' && element.caption">
            <template v-if="element.use === 'qrcode'">
              <p class="text-xs text-gray-500 text-right">{{ element.value }}</p>
            </template>
            <template v-else-if="element.use === 'avatar'">
              <p class="text-xs text-gray-500">{{ element.value }}</p>
            </template>
          </template>

        </div>
      </div>
    </div>
  </div>
  <!-- Show captured image if on mobile and it's ready -->
  <div class="cert-display" ref="mobileRef">
    <img 
      v-if="capturedImageUrl" 
      :src="capturedImageUrl || ''" 
      alt="Certification Loading..." 
      @error="handleImageError($event)" 
    />
    <div v-else class="cert-display-preview flex flex-col items-center justify-center h-screen text-center">
      <div class="cert-loader-div">
        <div class="cert-loader mb-4"></div>
        <span class="text-gray-400 text-bas text-sm">Loader...</span>
      </div>
    </div>
  </div>
</template>

<script>
import convertUtils from "@/plugins/convertUtils";
import debug from '@/plugins/Logger.js';
import QRCode from "qrcode";
import storageManager from '@/plugins/storage';
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";


export default {
  name: 'ResultComponent',
  props: {
    pages: {
      type: Array,
      required: true, // Or set a default if it is not required
      default: () => []
    },
    certData: Array,
    certMode: String,
    certId: String,
    debug: Boolean,
  },
  data() {
      return {
        isGeneratingPDF: false,
        qrCodeUrl: null,
        isRendered: false,
        capturedImageUrl: null, // Store the captured image URL
        isCaptureComplete: false,
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
      };
    },
  methods: {
    handleImageError(event) {
      // You can hide the broken image or set a fallback image
      event.target.style.display = 'none'; // Hide the image if it fails to load
      // Optionally, you can also set a fallback image URL
      // event.target.src = 'path_to_fallback_image';
    },
    async captureDivAsCanvasMobile() {
      await this.$nextTick(); // Ensure DOM updates are completed before capturing

      const captureDiv = this.$refs.captureDiv;
      const mobileDiv = this.$refs.mobileRef;

      if (!captureDiv) {
        console.error("Element not found for capture");
        return;
      }

      const scale = 6; // Higher value for resolution
      const options = {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        dpi: 600,
        imageSmoothingEnabled: true,
        backgroundColor: null,
        width: captureDiv.offsetWidth,
        height: captureDiv.offsetHeight,
      };

      try {
        // Await the canvas capture
        const canvas = await html2canvas(captureDiv, options);
        const pngUrl = canvas.toDataURL("image/png");

        // Create an image element to ensure the image is fully loaded before proceeding
        const img = new Image();
        img.src = pngUrl;
        
        // Wait for the image to fully load
        img.onload = () => {

          setTimeout(() => {
            
            // Once the image is fully loaded, update the mobile div's style
            if (captureDiv) {
              captureDiv.style.position = 'absolute';
              captureDiv.style.top = '-1000px';
              captureDiv.style.left = '-2000px';
              mobileDiv.style.display = 'block'; // Show mobile version after image is loaded
              this.capturedImageUrl = pngUrl;
              console.log("capturedImageUrl",pngUrl);
            }
          }, 100);  // Adds a slight delay before setting the image URL
        };

        // Handle image loading error
        img.onerror = (error) => {
          console.error("Error loading image:", error);
        };
        
      } catch (error) {
        console.error("Error capturing canvas:", error);
      }
    },
    checkRenderCompletion() {
      if (Array.isArray(this.pages) && this.pages.length > 0 && this.certData && !this.isRendered) {
        this.$nextTick(() => {
          this.isRendered = true;

          this.captureDivAsCanvasMobile();

            // Hide the captureDiv after rendering and move it off-screen
            const captureDiv = this.$refs.captureDiv;

            if (captureDiv) {
              captureDiv.style.position = 'absolute';
              captureDiv.style.top = '-1000px';
              captureDiv.style.left = '-2000px';
            }
        });
      }
    },
    captureDivAsCanvas() {
      this.$nextTick(() => {
        // Show overlay when PDF generation starts
        this.isGeneratingPDF = true;
        const captureDiv = this.$refs.captureDiv;
        if (!captureDiv) {
          console.error("Element not found for capture");
          this.isGeneratingPDF = false; // Hide overlay if there's an error
          return;
        }
        // Select the single page element with the class 'page'
        const pageElement = captureDiv.querySelector('.page');
        // Temporarily remove the background image and color from the page element
        const originalBackgroundImage = pageElement.style.backgroundImage;
        const originalBackgroundColor = pageElement.style.backgroundColor;
        pageElement.style.backgroundImage = 'none'; // Remove background image
        pageElement.style.backgroundColor = 'transparent'; // Remove background color
        // Extract the background image URL
        const backgroundImageUrl = originalBackgroundImage.replace(/^url\(['"](.+)['"]\)$/i, '$1');
        // Adjust scale based on device pixel ratio for higher resolution
        const scale = 2; // Higher value improves resolution
        const options = {
          scale: scale, // This improves the overall resolution
          useCORS: true, // To allow external resources (like images) to be rendered
          allowTaint: true, // Prevents tainting of the canvas
          logging: false,
          dpi: 150,
          imageSmoothingEnabled: true,
          backgroundColor: null, // Set background to transparent for the canvas
          width: captureDiv.offsetWidth, // Ensure the canvas captures the full width
          height: captureDiv.offsetHeight, // Ensure the canvas captures the full height
        };
        html2canvas(captureDiv, options)
          .then((canvas) => {
            // Restore the original background image and color
            pageElement.style.backgroundImage = originalBackgroundImage;
            pageElement.style.backgroundColor = originalBackgroundColor;
            // Convert canvas to PNG
            const pngUrl = canvas.toDataURL("image/png");
            // Initialize jsPDF in landscape A4 format
            const pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'cm',
              format: 'a4'
            });
            // Add the background image first
            if (backgroundImageUrl) {
              // Add the background image to the PDF (adjust dimensions as needed)
              pdf.addImage(backgroundImageUrl, 'JPEG', 0, 0, 29.7, 21); // A4 landscape size in cm
            }
            // Add the captured content (PNG) on top
            pdf.addImage(pngUrl, 'PNG', 0, 0, 29.7, 21); // A4 landscape size in cm
            // Add footer text with the current date
            const now = new Date();
            const date = now.toISOString().split('T')[0]; // Get current date in yyyy-mm-dd format
            const time = now.toTimeString().split(' ')[0]; // Get time in hh:mm:ss format
            const footerText = `E-Certification Generated on ${date} ${time}`;

            // Set font size and color
            pdf.setFontSize(9);
            pdf.setTextColor(233, 233, 233); // Set text color to gray

            // Calculate the center position
            const pageWidth = pdf.internal.pageSize.getWidth();
            const textWidth = pdf.getTextWidth(footerText);
            const xPosition = (pageWidth - textWidth) / 2;

            // Add the centered footer text at the bottom of the page
            pdf.text(footerText, xPosition, 20.5); // 20.5 cm from the top for the footer

            // Hide overlay before downloading the PDF
            this.isGeneratingPDF = false;
            // Download the PDF
            pdf.save("Certification_" + this.certData.user._id + ".pdf");
          })
          .catch((error) => {
            console.error("Error capturing canvas:", error);
            // Hide overlay if an error occurs
            this.isGeneratingPDF = false;
          });
      });
    },
    formatDateWithAge(date, age) {
      const newDate = new Date(date);
      const ageNumber = parseInt(age, 10); // Convert age to a number
      newDate.setFullYear(newDate.getFullYear() + ageNumber);
      debug.log("date",date);
      debug.log("newDate",newDate);
      return this.formatThaidate(newDate,'date'); // Assuming you have a custom formatThaidate function
    },
    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date,'datefull');
    },
    async generateQRCode(code) {
      try {
        debug.slack("Qrcode", this.certMode);
        let url;

        if (this.certMode === 'old') {
          url = "https://" + this.configs.hostname + "/lesson/certification/" + code;
        } else {
          url = "https://" + this.configs.hostname + "/lesson/certification/" + this.certData.course._id + "/" + this.certData.user._id;
        }
        const qrCodeUrl = await QRCode.toDataURL(url);
        this.qrCodeUrl = qrCodeUrl;
        debug.slack("Qrcode", url);
      } catch (error) {
        console.error(error);
      }
    },
    async checkImage(url) {
      const defaultAvatar = 'https://doa-academy.sgp1.digitaloceanspaces.com/2023/12/1701849647875.png';
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok && response.headers.get('Content-Length') > 0) {
          return url;
        } else {
          return defaultAvatar;
        }
      } catch (error) {
        return defaultAvatar;
      }
    },
    async mapping() {
      debug.log("Mapping method called");
      console.log("pages", this.pages);
      debug.log("certData", this.certData);

      if (this.pages && this.pages.length > 0) {
        const page = this.pages[0];
        for (const element of page.elements) {
          // Mapping Cert Name
          if (element.use === "name" && this.certData && this.certData.user) {
            // Check if owner_type is 'corporate' and owner_data exists
            if (this.certData.owner_type === 'corporate' && this.certData.owner_data && this.certData.owner_data.corpName) {
              // Use corpName from owner_data for corporate certificates
              element.value = this.certData.owner_data.corpName.trim();
              debug.slack("Corporate Name", element.value);
            } else if (this.certData.user) {
              // Fallback to personal name data
              const firstName = this.certData.user.firstname;
              const lastName = this.certData.user.lastname;

              const personalInfo = this.certData?.forms[0]?.formData?.setData['ข้อมูลส่วนตัว'];
              const prefixObj = personalInfo ? personalInfo[0].find(item => item.name === 'คำนำหน้า') : null;
              const prefixFromForm = prefixObj ? prefixObj.value.label : null;

              const prefixFromUser = this.certData.user.prefix;
              let finalPrefix = prefixFromUser || prefixFromForm || '';

              if (firstName.startsWith(finalPrefix)) {
                finalPrefix = '';
              }

              const fullName = `${finalPrefix} ${firstName} ${lastName}`.trim();

              debug.slack("Full Name", fullName);
              element.value = fullName;
            }
            // apping Cert Lesson
          } else if (element.use === "lesson" && this.certData && this.certData.course) {
            element.value = element.start + "" + this.certData.course.name + "" + element.end;
          } else if (element.use === "school" && this.certData && this.certData.asset) {
            element.value = element.start + "" + this.certData.asset + "" + element.end;
          } else if (element.use === "date" && this.certData) {
            let dateToUse = '';
            if (element.useMultipleDates) {
              const formData = this.certData?.forms[0]?.formData;

              if (!formData) {
                return null;
              }

              let selectedDate = null;

              Object.values(formData).forEach(input => {
                const dateData = element.dateItems.find(dateItem => {
                  const inputValue = typeof input.value === 'object' && input.value !== null && 'value' in input.value ? input.value.value : input.value;
                  return input.name === dateItem.mapping && dateItem.keyword === inputValue;
                });

                if (dateData) {
                  selectedDate = dateData.date;
                }
              });
              dateToUse = selectedDate;
            } else {
              dateToUse = element.custom_cert_date || this.certData.createdAt;
            }

            let ageString = "";
            if (element.expire && dateToUse) {
              const certDate = new Date(dateToUse);
              const yearToAdd = parseInt(element.year, 10);
              certDate.setFullYear(certDate.getFullYear() + yearToAdd);
              certDate.setTime(certDate.getTime() - 86400000);

              if (element.show_year) {
                ageString = " (มีอายุ " + element.year + " ปี)";
              }

              element.expireAt = this.formatThaidate(certDate.toISOString()) + ageString;
            } else {
              element.expireAt = '';
            }

            element.value = element.start + "" + this.formatThaidate(dateToUse) + "" + element.end + element.expireAt;
          } else if (element.use === "qrcode" && this.certData) {
            element.value = this.certData._id;
            this.generateQRCode(this.certData._id);
          } else if (element.use === "avatar" && this.certData && this.certData.user) {
            const defaultAvatar = 'https://doa-academy.sgp1.digitaloceanspaces.com/2023/12/1701849647875.png';
            
            let avatarUrl = this.certData.user.avatar_img ?? 
                            this.certData?.forms[0]?.formData['upload-33-13-13']?.value[0] ?? 
                            defaultAvatar;

            const validUrl = await this.checkImage(avatarUrl);
            element.value = validUrl;
          }
          this.$emit('backgroundImageChange', page.backgroundImage);
        }
      }
      if (!this.isRendered) {
        this.$nextTick(() => {
          console.log('Certification rendering complete');
          this.isRendered = true; // Set the flag to prevent multiple logs
        });
      }
      this.checkRenderCompletion();
    }
  },
  mounted() {
    this.mapping();
    this.checkRenderCompletion(); // Ensure the render completion check is invoked
  },
  watch: {
    certData: {
      handler(newCertData) {
        if (newCertData) {
          this.isRendered = false; // Reset the flag when data changes
          this.mapping();
        }
      },
      deep: true,
      immediate: true,
    },
    pages: {
    handler(newPages) {
      if (Array.isArray(newPages)) {
        this.isRendered = false; // Reset the flag when pages change
        newPages.forEach((page, pageIndex) => {
          const pageElement = this.$refs[`page_${pageIndex}`];
          if (pageElement) {
            pageElement[0].classList.toggle('landscape', page.landscapeMode);
          }
        });
        this.mapping();
      }
    },
    deep: true,
  }
  },
};
</script>

<style scoped>

.result-mobile img {
  width: 100%; /* Ensure the mobile image fills the width of the container */
}

.result, .page, .page-element {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

.result {
  user-select: none; /* Disable text selection */
  pointer-events: none; /* Disable pointer events (drag selection/highlight) */
}

.page {
  position: relative;
  width: 21cm;
  height: 29.7cm;
  background-color: white;
  border: 1px solid #ccc;
  font-family: Arial, sans-serif;
  transition: width 0.5s, height 0.5s;
}

.page.landscape {
  width: 29.7cm;
  height: 21cm;
}

.page-element {
  padding: 0;
  margin: 0;
  text-align: center;
}

.page-element img {
  max-width: 100%;
  max-height: 100%;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8); /* Dim the screen */
  z-index: 9999; /* Make sure it's on top of everything */
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-content {
  color: white;
  font-size: 18px;
  font-weight: normal;
  text-align: center;
}

.loader {
  width: 175px;
  height: 80px;
  display: block;
  margin:auto;
  background-image: radial-gradient(circle 25px at 25px 25px, #FFF 100%, transparent 0), radial-gradient(circle 50px at 50px 50px, #FFF 100%, transparent 0), radial-gradient(circle 25px at 25px 25px, #FFF 100%, transparent 0), linear-gradient(#FFF 50px, transparent 0);
  background-size: 50px 50px, 100px 76px, 50px 50px, 120px 40px;
  background-position: 0px 30px, 37px 0px, 122px 30px, 25px 40px;
  background-repeat: no-repeat;
  position: relative;
  box-sizing: border-box;
  scale: 0.5;
}
.loader::before {
  content: '';  
  left: 60px;
  bottom: 18px;
  position: absolute;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #FF3D00;
  background-image: radial-gradient(circle 8px at 18px 18px, #FFF 100%, transparent 0), radial-gradient(circle 4px at 18px 0px, #FFF 100%, transparent 0), radial-gradient(circle 4px at 0px 18px, #FFF 100%, transparent 0), radial-gradient(circle 4px at 36px 18px, #FFF 100%, transparent 0), radial-gradient(circle 4px at 18px 36px, #FFF 100%, transparent 0), radial-gradient(circle 4px at 30px 5px, #FFF 100%, transparent 0), radial-gradient(circle 4px at 30px 5px, #FFF 100%, transparent 0), radial-gradient(circle 4px at 30px 30px, #FFF 100%, transparent 0), radial-gradient(circle 4px at 5px 30px, #FFF 100%, transparent 0), radial-gradient(circle 4px at 5px 5px, #FFF 100%, transparent 0);
  background-repeat: no-repeat;
  box-sizing: border-box;
  animation: rotationBack 3s linear infinite;
}
.loader::after {
  content: '';  
  left: 94px;
  bottom: 15px;
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #FF3D00;
  background-image: radial-gradient(circle 5px at 12px 12px, #FFF 100%, transparent 0), radial-gradient(circle 2.5px at 12px 0px, #FFF 100%, transparent 0), radial-gradient(circle 2.5px at 0px 12px, #FFF 100%, transparent 0), radial-gradient(circle 2.5px at 24px 12px, #FFF 100%, transparent 0), radial-gradient(circle 2.5px at 12px 24px, #FFF 100%, transparent 0), radial-gradient(circle 2.5px at 20px 3px, #FFF 100%, transparent 0), radial-gradient(circle 2.5px at 20px 3px, #FFF 100%, transparent 0), radial-gradient(circle 2.5px at 20px 20px, #FFF 100%, transparent 0), radial-gradient(circle 2.5px at 3px 20px, #FFF 100%, transparent 0), radial-gradient(circle 2.5px at 3px 3px, #FFF 100%, transparent 0);
  background-repeat: no-repeat;
  box-sizing: border-box;
  animation: rotationBack 4s linear infinite reverse;
}

@keyframes rotationBack {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

.cert-display-preview{
  position: relative;
  width: 29.7cm;
  height: 21cm;
  background-color: white;
  font-family: Arial, sans-serif;
  transition: width 0.5s, height 0.5s;
}
.cert-display{
  position: relative;
  width: 29.7cm;
  height: auto;
  background-color: white;
  font-family: Arial, sans-serif;
  transition: width 0.5s, height 0.5s;
}

.cert-display img{
  width: 100%;
  height: 100%;
  float: left;
}
/* Responsive scaling for mobile */
@media (max-width: 768px) {
  .cert-loader-div {
    scale: 0.7;
  }
  .cert-display{
    width: 29.7cm;
    height: unset;
  }
  .cert-display-preview{
    width: 100%;
    height: 100%;
    min-height: 250px;
  }
}

.cert-loader {
  width: 64px;
  height: 64px;
  position: relative;
  background: #f3f3f3;
  border-radius: 4px;
  overflow: hidden;
  border: solid #e9e9e9 1px;
}

.cert-loader:before {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 40px;
  transform: rotate(45deg) translate(30%, 40%);
  background: #2563eb;
  box-shadow: 32px -34px 0 5px #007bff;
  animation: slide 2s infinite ease-in-out alternate;
}

.cert-loader:after {
  content: "";
  position: absolute;
  left: 10px;
  top: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #799dee;
  transform: rotate(0deg);
  transform-origin: 35px 145px;
  animation: rotate 2s infinite ease-in-out;
}

@keyframes slide {
  0% , 100% {
    bottom: -35px
  }

  25% , 75% {
    bottom: -2px
  }

  20% , 80% {
    bottom: 2px
  }
}

@keyframes rotate {
  0% {
    transform: rotate(-15deg)
  }

  25% , 75% {
    transform: rotate(0deg)
  }

  100% {
    transform: rotate(25deg)
  }
}

img {
  -webkit-backface-visibility: hidden;
  -webkit-transform: translate3d(0, 0, 0);
}
</style>

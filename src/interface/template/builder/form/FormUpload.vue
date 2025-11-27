<template>
<div>
  <div class="flex">
    <div class="w-1/2 pr-4">
      <label :for="data.uid" class="block font-bold mb-1">
        {{ data.name }}
      </label>
    </div>
  </div>

<div class="border border-gray-200 p-3 mb-3 bg-white">
    <label class="block font-bold mb-1">
      <font-awesome-icon :icon="['fas', 'upload']" class="h-4 w-4"/>
      {{ data.name }}
    </label>
    <div v-if="data.itemLimit === 1 && uploadedFileUrl">
      <img v-if="isImageFile({type: 'image/'})" :src="uploadedFileUrl" alt="Uploaded File Preview" class="mt-2 w-full object-cover">
      <!-- For non-image files, adjust accordingly -->
    </div>
    <div class="flex items-center mb-2 bg-gray-100 rounded-sm p-3">
      <input
        class="hidden"
        type="file"
        :accept="data.fileTypeLimit"
        :multiple="data.multipleFiles"
        ref="fileInput"
        @change="handleFileInputChange"
      >
      <button
        type="button"
        class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        @click="openFileInput"
      >
        <font-awesome-icon :icon="['fas', 'folder']" class="h-4 w-4"/>
        เลือกไฟล์
      </button>
      <button
        v-if="uploadedFiles.length > 0"
        type="button"
        class="px-4 py-2 ml-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        @click="uploadFile"
      >
        <font-awesome-icon :icon="['fas', 'cloud-upload']" class="h-4 w-4"/>
        อัพโหลดไฟล์
      </button>
    </div>
    <p class="block text-gray-500">
      อนุญาต: <span class="font-semibold">{{ data.fileTypeLimit }}</span>,
      ขนาดสูงสุด: <span class="font-semibold">{{ data.fileSizeLimit }}</span> เมกะไบต์,
      จำกัดไฟล์: <span class="font-semibold">{{ data.itemLimit }}</span> ไฟล์
    </p>
    <div v-if="uploadedFiles.length > 0">
      <div v-for="(file, index) in uploadedFiles" :key="file.name">
        <div v-if="file.status === true">
          <span>{{ file.name }} - Uploaded: {{ file.outputLink }}</span>
        </div>
        <div v-else>
          <div class="mt-2 sm:flex">
            <template v-if="isImageFile(file.file)">
              <div class="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <img :src="previewImages[index]" alt="Preview" class="object-contain rounded-sm w-16 h-full">
              </div>
            </template>
            <div>
              <h4 class="text-md font-bold">{{ file.name }} - Uploading: {{ file.uploadProgress }}%</h4>
              <p class="mt-1">
                <button class="px-2 py-1 mr-2 bg-red-500 text-white text-sm rounded hover:bg-red-600" type="button" @click="removePreUploadedFile(index)">ลบ</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="text-red-500" v-if="errorText">{{ errorText }}</div>
    <div v-if="outputfile.length > 0" class="mt-2">
      <p class="mb-2 font-semibold text-gray-600">รายชื่อไฟล์ที่อัพโหลดทั้งหมด</p>
      <div v-for="(file, index) in outputfile" :key="file">
        
        <div class="mb-2">
          <button
            type="button"
            class="px-2 py-1 mr-2 bg-red-500 text-white rounded hover:bg-red-600"
            @click="removeFile(index)"
          >
            ลบ
          </button>
          <span>{{ extractFilename(file) }}</span>
          <span class="ml-2 text-green-500"><font-awesome-icon :icon="['fas', 'check']" class="h-4 w-4"/> Upload Success</span>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { S3 } from "@aws-sdk/client-s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import storageManager from "@/plugins/storage";
import debug from '@/plugins/Logger.js';

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    item: {
      type: String,
    },
    resetFlag: {
      type: Boolean,
      default: false // Default value is false
    }
  },
  watch: {
    resetFlag(newVal) {
      if (newVal) {
        this.reset();
      }
    }
  },
  data() {
    const session = storageManager.get("configs");
    const schoolSession = session;
    const s3Client = new S3({
      forcePathStyle: false,
      endpoint: schoolSession.s3EndpointDefault,
      region: schoolSession.s3Region,
      ResponseContentEncoding: "utf-8",
      credentials: {
        accessKeyId: schoolSession.s3Key,
        secretAccessKey: schoolSession.s3Secret,
      },
    });

    return {
      uploadedFiles: [],
      S3: s3Client,
      schoolSession: schoolSession,
      outputfile: [],
      errorText: "",
      successText: "",
      previewImages: [],
      uploadedFileUrl: '',
    };
  },
  methods: {
    reset() {
      console.log("Reset");
      this.uploadedFile= []
      this.outputfile=[]
      this.errorText=""
      this.successText=""
      this.previewImages=[]
      this.uploadedFileUrl=''
    },
    isImageFile(file) {
      return file.type.startsWith('image/');
    },
    extractFilename(filepath) {
      const parts = filepath.split("/");
      return parts[parts.length - 1];
    },
    slugify(str) {
      str = str.replace(/^\s+|\s+$/g, ""); // trim
      str = str.toLowerCase();

      // remove accents, swap ñ for n, etc
      var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
      var to = "aaaaaeeeeiiiioooouuuunc------";
      for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
      }

      str = str
        .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
        .replace(/\s+/g, "-") // collapse whitespace and replace by -
        .replace(/-+/g, "-"); // collapse dashes

      // Check if the string contains a file extension
      var lastDotIndex = str.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        str = str.substring(0, lastDotIndex); // Remove the file extension
      }

      return str;
    },
    getFilePreviewURL(file) {
      return URL.createObjectURL(file);
    },
    openFileInput() {
      this.$refs.fileInput.click();
      if (this.data.itemLimit === 1) {
        this.$refs.fileInput.setAttribute('multiple', false);
      } else {
        this.$refs.fileInput.setAttribute('multiple', true);
      }
    },
    async uploadFile() {
      const count = this.uploadedFiles.length;
      const itemLimit = this.data.itemLimit;
      const fileSizeLimit = this.data.fileSizeLimit;
      let successCount = 0; // Track the number of successfully uploaded files
      let uploadedFilenames = []; // Array to store uploaded filenames

      if (count > itemLimit) {
        this.errorText = "The number of files exceeds the limit."; // Show error message
        return;
      }

      try {
        for (let i = 0; i < count; i++) {
          const file = this.uploadedFiles[i];
          const file_name_array = file.name.split(".");
          const file_extension = file_name_array[file_name_array.length - 1];
          const uniqueId = Date.now() + '-' + Math.floor(Math.random() * 10000000000); // Generate unique identifier

          const newFileName = `${uniqueId}`; // New unique filename

          if (file.size > fileSizeLimit * 1024 * 1024) {
            this.errorText = "File size exceeds the limit.";
            console.error("File size exceeds the limit");
            return;
          }

          const uploadParams = {
            Bucket: this.schoolSession.s3Bucket,
            Key: "upload/" + newFileName + "." + file_extension,
            Body: file.file, // Use file.file to access the file content
            ACL: "public-read",
          };

          const data = await this.S3.send(new PutObjectCommand(uploadParams));

          file.status = true;
          file.outputLink =
            this.schoolSession.s3Endpoint +
            "upload/" +
            newFileName +
            "." +
            file_extension;

          successCount++; // Increment the success count
          uploadedFilenames.push(file.name); // Add the filename to the uploadedFilenames array
          this.uploadedFileUrl = file.outputLink; // Add this line

          if (successCount === count) {
            const outputLinks = this.uploadedFiles.map((file) => file.outputLink); // Create an array of output links
            this.uploadedFiles = []; // Clear the uploadedFiles array
            this.outputfile = [...this.outputfile, ...outputLinks]; // Add the new output links to the existing outputfile array
            debug.log("Success", data);
            this.$emit("update:modelValue", this.outputfile, this.item);
            this.successText =
              "Files uploaded successfully: " + uploadedFilenames.join(", ");
            this.errorText = "";
          }
        }
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    },
    handleFileInputChange(event) {
      const files = Array.from(event.target.files);

      // Convert fileTypeLimit string to an array
      const allowedFileTypes = this.data.fileTypeLimit.split(",");

      // Filter files based on file extension
      const filteredFiles = files.filter((file) => {
        const fileName = file.name;
        const fileExtension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
        return allowedFileTypes.includes(fileExtension);
      });

      if (filteredFiles.length === 0) {
        this.errorText =
          "Invalid file type. Please select a file with the allowed file types: " +
          allowedFileTypes.join(", ");
      } else {
        const remainingSlots = this.data.itemLimit - this.uploadedFiles.length;
        const filesToAdd = filteredFiles.slice(0, remainingSlots);
        const previewImages = [];

        const newFiles = filesToAdd.map((file) => ({
          name: file.name,
          status: false,
          uploadProgress: 0,
          file: file,
        }));

        this.uploadedFiles = [...this.uploadedFiles, ...newFiles];

        this.uploadedFiles.forEach((file) => {
          if (this.isImageFile(file.file)) {
            previewImages.push(this.getFilePreviewURL(file.file));
          } else {
            previewImages.push(null);
          }
        });

        this.previewImages = previewImages;
        this.errorText = ""; // Clear the error message if there are valid files

        if (filteredFiles.length > remainingSlots) {
          const excessFilesCount = filteredFiles.length - remainingSlots;
          this.errorText = `Only ${remainingSlots} file(s) can be added. ${excessFilesCount} file(s) were not added.`;
        }

        // Auto-upload if item limit is 1
        if (this.data.itemLimit === 1) {
          this.uploadFile();
        }
      }
    },
    removePreUploadedFile(index) {
      this.uploadedFiles.splice(index, 1);
      this.previewImages.splice(index, 1);
    },
    async removeFile(index) {
      try {
        const fileUrl = this.outputfile[index];
        // Parse the file key from the URL
        const fileKey = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        
        const deleteParams = {
          Bucket: this.schoolSession.s3Bucket,
          Key: fileKey,
        };

        await this.S3.send(new DeleteObjectCommand(deleteParams));

        // Remove the file from the outputfile array
        this.outputfile.splice(index, 1);

        // Check if all files are removed
        if (this.outputfile.length === 0) {
          // Clear the outputfile array
          this.outputfile = [];
        }
      } catch (error) {
        console.error('Error removing file:', error);
        // Handle error scenarios here
      }

      // Emit the updated outputfile array to the parent component
      this.$emit('update:modelValue', this.outputfile, this.item);
      this.errorText = "";
      this.successText = "";
    },
  },
};
</script>

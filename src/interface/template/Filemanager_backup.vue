<script>

// Plugin
import CreateFolder   from '@/interface/modal/CreateFolder.vue';
import RenameFolder   from '@/interface/modal/RenameFolder.vue';
import {useRoute} 	  from 'vue-router'
import { S3 }         from "@aws-sdk/client-s3";
import Plyr           from "plyr";
import { ListObjectsCommand,PutObjectCommand,DeleteObjectCommand,CopyObjectCommand } from "@aws-sdk/client-s3";

import storageManager from '@/plugins/storage';

import { Image } from 'image-js';
import { reactive } from 'vue';

export default {
    emits: ["select-file-trigger"],
    props: { Mode: String, AllowFile: Array , CallbackFunc: String,},
    data() {
      const session 		    = storageManager.get('session');
      const schoolSession   = session.current;
      const route           = useRoute();
      const s3Client        = new S3({
          forcePathStyle:false,
          endpoint : schoolSession.s3EndpointDefault,
          region : schoolSession.s3Region,
          ResponseContentEncoding:"utf-8",
          credentials: {
            accessKeyId : schoolSession.s3Key,
            secretAccessKey : schoolSession.s3Secret
          }
      });

      return {
        searchQuery: '',
        files: reactive([]),
        fileList:[],
        folderPath:"",
        prefix:"",
        objCount:"",
        S3:s3Client,
        PageName:route.meta.title,
        PageIcon:route.meta.icon,
        showModal:false,
        activeBlock:false,
        createFolderModal:false,
        RenameFolderModal:false,
        showFileDetail:false,
        showFilePreview:false,
        uploadPanel:false,
        renameTriggerObj:"",
        oldname:"",
        viewFilename:"",
        viewFilesize:"",
        viewFilecover:"",
        viewFilecreate:"",
        viewFileurl:"",
        modalContent: "",
        selectFile:undefined,
        schoolSession:schoolSession,
      }
    },
    components: {
      CreateFolder,
      RenameFolder,
    },
    methods: {
      async resizeImageAndReplace(originalPath) {
        try {
          const imageUrl = this.schoolSession.s3Endpoint + originalPath;

          // Load the original image using image-js
          const originalImage = await Image.load(imageUrl);

          // Create a new key for the original image in the "folder_original" path
          const originalPathArray = originalPath.split("/");
          const originalFileName = originalPathArray.pop();
          const folderOriginalKey = originalPathArray.join("/") + "/folder_original/" + originalFileName;

          // Move the original image to "folder_original"
          const copyData = await this.S3.send(new CopyObjectCommand({
            Bucket: this.schoolSession.s3Bucket,
            CopySource: this.schoolSession.s3Bucket + "/" + originalPath,
            Key: folderOriginalKey,
            ACL: 'public-read', // Set the appropriate ACL
          }));

          console.log("Moved original image to folder_original:", copyData);

          // Resize the original image
          const resizedImage = originalImage.resize({
            width: 1024, // Set the desired width for the resized image
          });

          // Convert the resized image to Blob format
          const resizedImageBlob = await resizedImage.toBlob('image/jpeg', 0.8); // Set the desired image quality

          // Upload the resized image to replace the original image's place
          const resizedImageKey = originalPath;
          const resizeData = await this.S3.send(new PutObjectCommand({
            Bucket: this.schoolSession.s3Bucket,
            Key: resizedImageKey,
            Body: resizedImageBlob,
            ACL: 'public-read', // Set the appropriate ACL
          }));

          console.log("Resized and replaced image:", resizeData);

          // Refresh the file browser after updating the image
          this.renderFileBrowser();
        } catch (error) {
          console.log("Error resizing and replacing image:", error);
        }
      },
      async restoreOriginalImage(resizedImageUrl) {
        try {
          // Extract the original image path from the resized image URL
          const originalPath = resizedImageUrl.replace(this.schoolSession.s3Endpoint, '');

          // Create the key for the original image in the "folder_original" path
          const originalPathArray = originalPath.split('/');
          const originalFileName = originalPathArray.pop();
          const originalKey = originalPathArray.join('/') + '/folder_original/' + originalFileName;

          // Copy the original image from "folder_original" to its original location
          const copyData = await this.S3.send(new CopyObjectCommand({
            Bucket: this.schoolSession.s3Bucket,
            CopySource: this.schoolSession.s3Bucket + '/' + originalKey,
            Key: originalPath,
            ACL: 'public-read', // Set the appropriate ACL
          }));

          console.log('Restored original image:', copyData);

          // Delete the original image from "folder_original"
          const deleteData = await this.S3.send(new DeleteObjectCommand({
            Bucket: this.schoolSession.s3Bucket,
            Key: originalKey,
          }));

          console.log('Deleted original image from folder_original:', deleteData);

          // Refresh the file browser after restoring the original image
          this.renderFileBrowser();
        } catch (error) {
          console.log('Error restoring original image:', error);
        }
      },
      isAllowedFile(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        return this.AllowFile.includes(ext);
      },
      videoStreaming() {
        const _self     = this
        var url         = _self.videoContent;
        const video     = this.$refs.videoStreaming;

        let extension   = url.split(".").pop();
        console.log("tage url", url);
        console.log("tage video", video);
        console.log("extension video", extension);
        const defaultOptions = {};

          const player = new Plyr(video, defaultOptions);
          player.on('timeupdate', (event) => {
            const instance = event.detail.plyr;
            console.log(instance);
          });
      },
      formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('default', {dateStyle: 'long'}).format(date);
      },
      onDoubleClick(filename) {
        var index = this.fileList.findIndex(p => p.title == filename);
        console.log("filename",filename + "/" + index);
        console.log(this.fileList[index]);

        let filetype = this.fileList[index]['title'].replace("/", '').substring(this.fileList[index]['title'].replace("/", '').lastIndexOf(".")+1);
        this.viewFilesize       = this.fileList[index]['size']
        this.viewFilename       = this.fileList[index]['title']
        this.viewFilecover      = this.fileList[index]['cover']
        this.viewFilecreate     = this.fileList[index]['create']
        this.viewFileurl        = this.fileList[index]['prefix']
        this.viewFileextension  = filetype
        console.log("filetype",filetype);

        console.log("filename",this.schoolSession.s3Endpoint + this.viewFileurl);
        const fileExtension = this.viewFileurl.split('.').pop();
        console.log("fileExtension",fileExtension);
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          this.selectedFile = this.schoolSession.s3Endpoint + this.viewFileurl;
          this.modalContent = "image";
          this.showModal = true;
        } else if (['mp4', 'ogg', 'webm'].includes(fileExtension)) {
          this.selectedFile = this.schoolSession.s3Endpoint + this.viewFileurl;
          this.modalContent = "video";
          this.showModal = true;
        }
      },
      isImage(src) {
        return src.match(/\.(jpeg|jpg|gif|png)$/) != null;
      },
      async renderFileBrowser() {
            if(storageManager.get('session','login')) {
              try {
                const session 		  = storageManager.get('session');
                let rawFile         = [];
                this.rawfileList    = "";
                this.fileList       = [];
                this.prefix         = session.prefix;
                this.activeBlock    = true;

                const data = await this.S3.send(new ListObjectsCommand({Bucket: this.schoolSession.s3Bucket, Prefix:this.prefix}));
                console.log("Success", data.Contents);
                if(data.Contents!=undefined && data.Contents!=null && data.Contents!="")
                {
                  for (let i = 0; i < data.Contents.length; i++) {
                    rawFile.push(data.Contents[i].Key);
                  }

                  this.rawfileList  = rawFile.join();
                  this.objCount     = data.Contents.length;

                  //console.log("RAW",this.rawfileList);
                  for (let i = 0; i < data.Contents.length; i++) {
                    let contentObj;
                    let contentSize;
                    let contentCreate
                    if(this.prefix!="" && this.prefix!=undefined) {
                      contentObj    = data.Contents[i].Key.replace(this.prefix + "/", '');
                    } else {
                      contentObj    = data.Contents[i].Key;
                    }

                    contentSize     = data.Contents[i].Size;
                    contentCreate   = data.Contents[i].LastModified;

                    //console.log("contentObj",contentObj);
                    if(contentObj.includes('/')) {
                      var res = contentObj.split("/");
                      const arrFiltered = res.filter(el => {
                        return el != null && el != '';
                      });
                      //console.log("length",arrFiltered.length);
                      //console.log("contentObj",contentObj);
                      if(arrFiltered.length==1)
                      {
                        if(this.prefix!="" && this.prefix!=undefined) {
                          this.fileList.push({
                            title: contentObj.replace("/", ''),
                            prefix:this.prefix+'/'+contentObj.replace("/", ''),
                            count:this.countInnerObj(this.rawfileList,contentObj),
                            size:contentSize,
                            create:contentCreate,
                            isFolder:  true
                          });
                        } else {
                          this.fileList.push({
                            title: contentObj.replace("/", ''),
                            prefix: contentObj.replace("/", ''),
                            count:this.countInnerObj(this.rawfileList,contentObj),
                            size:contentSize,
                            create:contentCreate,
                            isFolder:  true
                          });
                        }
                      }
                    } else {
                      if(contentObj.trim().length)
                      {
                        let fileGroup;
                        let fileCover;
                        let fileIcon;
                        let filetype = contentObj.replace("/", '').substring(contentObj.replace("/", '').lastIndexOf(".")+1);
                        if(
                        filetype  == "jpg" || 
                        filetype  == "jpeg" || 
                        filetype  == "JPG" || 
                        filetype  == "JPEG" ||
                        filetype  == "png" || 
                        filetype  == "PNG" || 
                        filetype  == "gif" || 
                        filetype  == "GIF"
                        ) {
                          fileGroup = "image";
                          fileIcon = "";
                          if(this.prefix!="" && this.prefix!=undefined) {
                            fileCover = this.schoolSession.s3Endpoint + this.prefix + "/" + contentObj.replace("/", '');
                          }
                          else {
                            fileCover = this.schoolSession.s3Endpoint + contentObj.replace("/", '');
                          }
                        } else if(
                        filetype  == "mp4" || 
                        filetype  == "doc" || 
                        filetype  == "xls" ||
                        filetype  == "pdf"
                        ) {
                          if(filetype  == "doc") {
                            fileIcon = "file-word";
                          }
                          if(filetype  == "xls") {
                            fileIcon = "file-spreadsheet";
                          }
                          if(filetype  == "pdf") {
                            fileIcon = "file-pdf";
                          }
                          if(filetype  == "mp4") {
                            fileIcon = "file-video";
                          }
                          fileGroup = "document";
                          fileCover = "";
                        }
                        else
                        {
                          fileGroup = "document";
                          fileCover = "";
                          fileIcon = "file";
                        }

                        if(this.prefix!="" && this.prefix!=undefined) {
                          this.fileList.push({
                            title: contentObj.replace("/", ''),
                            prefix:this.prefix+'/'+contentObj.replace("/", ''),
                            size:contentSize,
                            type:fileGroup,
                            cover:fileCover,
                            icon:fileIcon,
                            create:contentCreate,
                            isFolder:  false
                          });
                        } else {
                          this.fileList.push({
                            title: contentObj.replace("/", ''),
                            prefix: contentObj.replace("/", ''),
                            type:fileGroup,
                            icon:fileIcon,
                            cover:fileCover,
                            size:contentSize,
                            create:contentCreate,
                            isFolder:  false
                          });
                        }
                      }
                    }
                  }

                  this.fileList.sort(function(a,b){
                    const titleA = parseInt(a.title, 10);
                    const titleB = parseInt(b.title, 10);
                    return (b.isFolder - a.isFolder) || (titleA - titleB);
                  });
                  
                  this.folderPath = this.prefix;

                  if(this.folderPath!="" && this.folderPath!=undefined) {
                    this.folderPath = this.folderPath.split("/");
                  } else {
                    this.folderPath = "";
                  }

                  console.log("File List",this.fileList);
                  console.log("Folder Path",this.folderPath);
                  console.log("Object Count",this.objCount);

                  this.activeBlock = false;
                } else {
                  this.activeBlock = false;
                }
              } catch (err) {
                console.log("Error", err);
              }
            }
      },
      
      openViewFile(item) {
        var index = this.fileList.findIndex(p => p.title == item);
        console.log("item",item + "/" + index);
        console.log(this.fileList[index]);

        /*

        let filetype = this.fileList[index]['title'].replace("/", '').substring(this.fileList[index]['title'].replace("/", '').lastIndexOf(".")+1);
        this.viewFilesize       = this.fileList[index]['size']
        this.viewFilename       = this.fileList[index]['title']
        this.viewFilecover      = this.fileList[index]['cover']
        this.viewFilecreate     = this.fileList[index]['create']
        this.viewFileurl        = this.fileList[index]['prefix']
        this.viewFileextension  = filetype
        console.log("filetype",filetype);
        this.showFileDetail     = true;
        
        if(filetype==='mp4') {
          this.showFilePreview = false;
        }else { 
          this.showFilePreview = true;
        }

        */
      },
      openFolder(folder) {
        const new_prefix = folder && folder.trim() !== '' ? folder.trim() : '';
        const session = {
            prefix: new_prefix,
        };
        storageManager.update('session',session)
        this.renderFileBrowser();
      },
      closeViewFile() {
        this.showFileDetail = false;
      },
      countInnerObj(string, word) {
        return string.split(word).length - 1;
      },
      formatBytes(bytes) {
          var marker = 1024; // Change to 1000 if required
          var decimal = 3; // Change as required
          var kiloBytes = marker; // One Kilobyte is 1024 bytes
          var megaBytes = marker * marker; // One MB is 1024 KB
          var gigaBytes = marker * marker * marker; // One GB is 1024 MB
          if(bytes < kiloBytes) return bytes + " Bytes";
          else if(bytes < megaBytes) return(bytes / kiloBytes).toFixed(decimal) + " KB";
          else if(bytes < gigaBytes) return(bytes / megaBytes).toFixed(decimal) + " MB";
          else return(bytes / gigaBytes).toFixed(decimal) + " GB";
      },
      // Create Folder Function
      //
      openCreateFolder() {
        this.createFolderModal = true;
      },
      createFolderTrigger(payload) {
        this.createFolderModal = payload;
      },
      async createFolder(payload) {
        console.log("payload",this.prefix + "/" + payload.foldername + "/");
        let filename;
        if(this.folderPath!="" && this.folderPath!=undefined) {
          filename = this.prefix + "/" + payload.foldername + "/";
        } else {
          filename = payload.foldername + "/";
        }
        const data = await this.S3.send(new PutObjectCommand({Bucket: this.schoolSession.s3Bucket, Key:filename}));
        console.log("Success", data);
        this.createFolderModal = false;
        this.renderFileBrowser()
      },
      async countFolder(payload) {
        try {
          const data = await this.S3.send(new ListObjectsCommand({Bucket: this.schoolSession.s3Bucket, Prefix:payload}));
          console.log("Success", data);
          return data.Contents.length;
        } catch (error) {
          console.log(Error);
        }
      },
      // Rename Folder Function
      //
      openRenameFolder(item,old) {
        this.renameTriggerObj = item;
        this.oldname = old;
        let oldNameArray = old.split(".");
        if (oldNameArray.length > 1) {
          oldNameArray.pop();
        }
        this.oldname = oldNameArray.join("");
        this.RenameFolderModal = true;
      },
      RenameFolderTrigger(payload) {
        this.RenameFolderModal = payload;
      },
      async RenameFolder(payload) {

        let newName;
        let original;
        let originalSource;
        let newPath;

        let originalNameArray = payload.originalname.split(".");

        let checkContent;
        if (originalNameArray.length > 1) {
          checkContent = "file";
        } else {
          checkContent = "folder";
        }

        if (this.prefix !== "" && this.prefix !== undefined) {
          newName = this.prefix + "/" + (checkContent === "file" ? payload.foldername + "." + originalNameArray[originalNameArray.length - 1] : payload.foldername + "/");
          newPath = this.prefix + "/" + (checkContent === "file" ? payload.foldername + "." + originalNameArray[originalNameArray.length - 1] : payload.foldername + "/");
        } else {
          newName = (checkContent === "file" ? payload.foldername + "." + originalNameArray[originalNameArray.length - 1] : payload.foldername + "/");
          newPath = (checkContent === "file" ? payload.foldername + "." + originalNameArray[originalNameArray.length - 1] : payload.foldername + "/");
        }

        if (checkContent === "file") {
          original        = this.schoolSession.s3Bucket + "/" + payload.originalname;
          originalSource  = payload.originalname;
        } else {
          original        = this.schoolSession.s3Bucket + "/" + payload.originalname + "/";
          originalSource  = payload.originalname + "/";
        }

        const data2 = await this.S3.send(new ListObjectsCommand({Bucket: this.schoolSession.s3Bucket, Prefix:originalSource}));
        const data  = await this.S3.send(new CopyObjectCommand({Bucket: this.schoolSession.s3Bucket, Key: newName, CopySource: original, ACL: 'public-read'}));
        console.log("Success", data);

        if (checkContent === "folder") {
          const originalCountObj = data2.Contents.length
          console.log("Count",originalCountObj);

          if(originalCountObj>1) {
            console.log("Just Delete");
            for (let i = 0; i < data2.Contents.length; i++) {
              if(data2.Contents[i].Key!=originalSource){
                  let original    = newPath + data2.Contents[i].Key.replace(originalSource, '');
                  let source      = this.schoolSession.s3Bucket + "/" + data2.Contents[i].Key;
                  const data3     = await this.S3.send(new CopyObjectCommand({Bucket: this.schoolSession.s3Bucket, Key:original, CopySource:source, ACL:'public-read', ContentType:"text/html;charset=utf-8"}));
                  console.error("Move", data3);
                  const data4 = await this.S3.send(new DeleteObjectCommand({Bucket: this.schoolSession.s3Bucket, Key:data2.Contents[i].Key}));
                  console.error("Delete", data4);
              }
            }
          }
          else {
            console.log("Non Delete");
          }
        }
        
        const data4 = await this.S3.send(new DeleteObjectCommand({Bucket: this.schoolSession.s3Bucket, Key:originalSource}));
        console.log("Success", data4);

        this.RenameFolderModal = false;
        this.renderFileBrowser();
      },
      stringToBytes(text) {
        const length = text.length;
        const result = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
          const code = text.charCodeAt(i);
          const byte = code > 255 ? 32 : code;
          result[i] = byte;
        }
        return result;
      },
      async deleteFolder(payload) {
        try {
          const data = await this.S3.send(new DeleteObjectCommand({Bucket: this.schoolSession.s3Bucket, Key:payload+"/"}));
          console.log("Success", data);
          this.renderFileBrowser();
        } catch (error) {
          console.log(Error);
        }
      },
      async deleteFile(payload) {
        try {
          const data = await this.S3.send(new DeleteObjectCommand({Bucket: this.schoolSession.s3Bucket, Key:payload}));
          console.log("Success", data);
          this.renderFileBrowser();
          this.closeViewFile();
          this.showModal = false;
        } catch (error) {
          console.log(Error);
        }
      },
      getFullPath(find) {
        var index = this.folderPath.indexOf(find);
        if(index=="0") {
          return find;
        } else {
          return this.folderPath.slice(0, index).join('/') + "/" + find;
        }
      },
      // Upload File
      //
      openUploadBox() {
        this.uploadPanel = true;
      },
      closeUploadBox() {
        this.uploadPanel = false;
        this.files = [];
      },
      addFiles() {
        this.$refs.files.click();
      },
      slugify(str) {
          str = str.replace(/^\s+|\s+$/g, ''); // trim
          str = str.toLowerCase();
          // remove accents, swap ñ for n, etc
          var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
          var to   = "aaaaaeeeeiiiioooouuuunc------";
          for (var i=0, l=from.length ; i<l ; i++) {
              str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
          }
          str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
              .replace(/\s+/g, '-') // collapse whitespace and replace by -
              .replace(/-+/g, '-'); // collapse dashes
          return str;
      },
      async submitFiles() {
        let path;
        let count = this.files.length;
        if (this.prefix !== "" && this.prefix !== undefined) {
          path = this.prefix + "/";
        } else {
          path = "";
        }
        
        for (var i = 0; i < count; i++) {
          let file = this.files[i];
          let file_name_array = file.name.split(".");
          let file_extension = file_name_array[file_name_array.length - 1];
          let file_name = this.slugify(file.name);

          file.status = 'uploading'; // Update the file status directly
          this.$forceUpdate(); // Trigger a component update

          try {
            const data = await this.S3.send(new PutObjectCommand({
              Bucket: this.schoolSession.s3Bucket,
              Key: path + file_name + "." + file_extension,
              Body: file,
              ACL: 'public-read'
            }));

            // Update the file status to 'success'
            file.status = 'success'; // Update the file status directly
            console.log("Success", data);
            console.log("file", file);
            this.$forceUpdate(); // Trigger a component update
          } catch (error) {
            console.error(error);

            // Update the file status to 'error'
            file.status = 'error'; // Update the file status directly
          }

          console.log(i + ":" + count);

          if (i === (count - 1)) {
            this.renderFileBrowser();
            //this.uploadPanel = false;
          }
        }
      },



      handleFilesUpload() {
        let uploadedFiles = this.$refs.files.files;
        for (var i = 0; i < uploadedFiles.length; i++) {
          uploadedFiles[i].status = 'pending';
          this.files.push(uploadedFiles[i]);
          console.log('Uploaded file name:', uploadedFiles[i].name);
        }
        console.log(this.files);
      },

      removeFile( key ) {
        this.files.splice( key, 1 );
      },
      selectFileFunc (obj) {
        const endpoint      = this.schoolSession.s3Endpoint;
        let filePath        = endpoint + obj;
        let extension       = filePath.split(".").pop();
        let fileArray       = this.AllowFile;
        let callbackValue   = this.CallbackFunc;
        let found           = fileArray.find(element => element == extension);
        if(found!=undefined) {
          console.log("callbackValue",callbackValue);
          const triggerData = {
            file:endpoint + obj,
            callback:callbackValue,
          }
          this.$emit('select-file-trigger',  triggerData)
        } else {
          console.log("found",found);
          console.log("obj",obj)
          console.log("extension",extension)
          console.log("AllowFile",this.AllowFile)
          console.log("Callback",callbackValue)
        }
      },
      onContextMenu(e,item,old) {
        e.preventDefault();
        this.$contextmenu({
        zIndex: 99999,
        x: e.x,
        y: e.y,
        items: [
        { 
          label: "ลบโฟลเดอร์", 
          icon: "fa fa-trash",
          onClick: () => {
            console.log("Delete",item);
            return this.deleteFolder(item);
          }
        },
        { 
          label: "เปลี่ยนชื่อโฟลเดอร์", 
          icon: "fa fa-pencil",
          onClick: () => {
            console.log("Rename",item);
            return this.openRenameFolder(item,old);
          }
        },
        ]
        });
    },
    onFileContextMenu(e, item, old) {
      e.preventDefault();
      const contextMenuItems = [
        {
          label: item,
          icon: "fa fa-file",
          divided: true,
        },
        {
          label: "เปลี่ยนชื่อ",
          icon: "fa fa-pencil",
          onClick: () => {
            console.log("Rename", item);
            this.openRenameFolder(item, old);
          },
        },
      ];

      if (this.Mode === "popup") {
        contextMenuItems.push({
          label: "เลือกไฟล์",
          icon: "fa fa-check",
          onClick: () => {
            console.log("Select", item);
            this.selectFileFunc(item);
          },
        });
      }

      contextMenuItems.push({
        label: "ปรับขนาดรูป",
        icon: "fa fa-crop",
        onClick: () => {
          console.log("Select", item);
          this.resizeImageAndReplace(item);
        },
      });
      contextMenuItems.push({
        label: "restore",
        icon: "fa fa-refresh",
        onClick: () => {
          console.log("Select", item);
          this.restoreOriginalImage(item);
        },
      });

      contextMenuItems.push({
        label: "ลบไฟล์",
        icon: "fa fa-trash",
        onClick: () => {
          console.log("Delete", item);
          this.deleteFile(item);
        },
      });

      this.$contextmenu({
        zIndex: 99999,
        x: e.x,
        y: e.y,
        items: contextMenuItems,
      });
    },
	},
  computed: {
    imageSource() {
      const endpoint = this.schoolSession.s3Endpoint;
      let filePath = endpoint + this.selectFile;
      console.log(filePath);
      return filePath;
    },
    sectionHeight() {
      // Calculate section height based on screen size
      const windowHeight = window.innerHeight;
      // You can adjust the ratio as needed
      const sectionRatio = 0.7; // 80% of the window height
      const calculatedHeight = `${windowHeight * sectionRatio}px`;
      return calculatedHeight;
    },
    filteredFileList() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) {
        return this.fileList; // No search query, return original fileList
      }
      return this.fileList.filter((file) => file.title.toLowerCase().includes(query));
    },
    computedDimensions() {
      return this.viewFileDimensions;
    },
  },
  async mounted () {
    try {
      await this.renderFileBrowser()
    } catch (error) {
      console.log(Error);
    }
  }
};
</script>


<template>

    <CreateFolder class="z-[99999]"
    v-if="createFolderModal" 
    :isWindowsOpen="true" 
    @create-folder-trigger="createFolderTrigger" 
    @create-folder-event="createFolder"/>

    <RenameFolder class="z-[99999]"
    v-if="RenameFolderModal" 
    :isWindowsOpen="true" 
    :renameTriggerObj="this.renameTriggerObj" 
    :oldname="this.oldname" 
    @rename-folder-trigger="RenameFolderTrigger" 
    @rename-folder-event="RenameFolder"/>
<!-- 
    <div 
      id="defaultModal" 
      tabindex="-1" 
      class="fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto flex items-center justify-center md:inset-0 h-modal md:h-full" 
      v-if="showModal"
    >
      <div class="bg-black opacity-75 w-full h-full"></div>
      <div class="relative w-full max-w-2xl md:h-auto">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Preview
            </h3>
            <button 
              @click="showModal = false" 
              type="button" 
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" 
              data-modal-hide="defaultModal"
            >
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <div class="p-6 space-y-6">
            <img :src="viewFilecover" alt="" class="object-cover">
          </div>
        </div>
      </div>
    </div> -->

    <!-- <div v-if="showModal" class="z-[999] fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 overflow-auto" @click="showModal = false">
      <div class="fixed max-h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-white rounded shadow-md min-w-[20%] ml-[100px] mr-[100px]" @click.stop="">
        <slot>
          
            <div class="z-20 w-full max-h-full bg-white m-auto flex flex-col">
              <div class="fixed top-0 bg-black bg-opacity-50 absolute w-full h-auto bottom z-[999]">
                <div class="p-[10px] h-full text-white text-left text-sm">
                  <strong>File Name : </strong>{{this.viewFilename}} <br>
                  <strong>Upload Date : </strong>{{ formatDate(viewFilecreate) }} <br>
                  <strong>File Size : </strong>{{this.formatBytes(viewFilesize)}} <br>
                </div>
              </div>
              
              <template v-if="modalContent === 'image'">
                <main class="overflow-auto">
                <img :src="selectedFile" alt="" class="w-100 h-full">
              </main>
              </template>
              <template v-else>
                <vue-plyr class="relative">
                  <video ref="videoStreaming" controls crossorigin playsinline class="w-full">
                    <source :src="selectedFile">
                  </video>
                </vue-plyr>
              </template>

            </div>
        </slot>
        <button @click="showModal = false" class="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          Close
        </button>
      </div>
    </div> -->

    <div v-if="showModal" class="fixed top-0 left-0 pt-5 w-full h-full z-10 flex bg-black bg-opacity-75">
      <div class="relative flex flex-col justify-center items-center max-w-[50rem] m-auto shadow-2xl bg-white">

        <button @click="showModal = false" type="button" class="z-50 absolute top-2 right-2">
          <div class="bg-black w-8 h-8 right-2 top-2 leading-8 hover:bg-gray-500">
            <font-awesome-icon :icon="['fas','times']" class="text-white mt-[7px] font-sm"/>
          </div>
        </button>
        
        <div class="w-full md:min-w-[800px] sm:min-w-[300px] min-h-[400px] bg-cover relative flex justify-center items-center bg-gradient-to-t from-stone-900 via-stone-800 to-stone-900">
          <slot>
            <template v-if="modalContent === 'image'">
              <img :src="selectedFile" class="bg-white shadow-lg">
            </template>
            <template v-else>
              <div class="relative">
                <video ref="videoStreaming" controls crossorigin playsinline>
                  <source :src="selectedFile">
                </video>
              </div>
            </template>
          </slot>
        </div>
        
<!-- Overlay for file details and button -->
<div class="relative bottom-0 left-0 p-4 bg-white text-white w-full flex flex-col md:flex-row">
  <!-- Left Column for Details -->
  <div class="flex-1 pr-2">
    <div class="text-xs bg-black inline-block p-1 pl-2 pr-2 rounded-sm inline">{{ viewFileurl }}</div>
    <div class="text-xs bg-black block p-1 pl-2 pr-2 rounded-sm hidden md:inline ml-1">{{ formatBytes(viewFilesize) }}</div>
  </div>

  <!-- Right Column for Buttons (aligned right) -->
  <div class="flex-1 md:text-right md:pl-2">
    <button v-if="Mode=='popup'" 
      @click="selectFileFunc(viewFileurl)" 
      type="button" 
      class="px-2 py-1 text-white bg-blue-500 rounded shadow-lg hover:bg-blue-600">
      <font-awesome-icon :icon="['fas','check']" class="text-white"/> 
      เลือกไฟล์
    </button>
    <button v-if="Mode=='static'" 
      @click="deleteFile(viewFileurl)" 
      type="button" 
      class="px-2 py-1 text-white bg-red-500 rounded shadow-lg hover:bg-red-600">
      <font-awesome-icon :icon="['fas','trash']" class="text-white"/> 
      ลบไฟล์
    </button>
  </div>
</div>


        
        
      </div>
    </div>

    <!-- <div class="fixed top-0 left-0 bottom-0 right-0 z-10" v-if="showModal">
      <div class="bg-black opacity-75 w-full h-full"></div>
      <div class="z-20 w-11/12 max-h-full bg-white p-20 m-auto flex flex-col shadow-lg">
        <header class="flex justify-between items-center pb-4">
          <h2 class="text-lg font-bold">Modal Title</h2>
          <button @click="showModal = false" class="text-sm font-medium">Close</button>
        </header>
        <main class="overflow-auto">
          <img :src="selectedFile" class="h-full w-full object-cover"/>
        </main>
        <footer class="flex justify-between items-center mt-4">
          <p>Footer Content</p>
          <button @click="showModal = false" class="text-sm font-medium">Close</button>
        </footer>
      </div>
    </div> -->
  
    <header class="py-2 border-gray-800">
      <div class="mx-auto max-w-7xl px-2 sm:px-3 lg:px-4 xl:flex xl:items-center xl:justify-between">
        <div class="min-w-0 flex-1">
            <h3 class="text-[18px] font-bold leading-7 text-gray-700 sm:truncate sm:text-[18px] sm:tracking-tight"><font-awesome-icon :icon="['fas',PageIcon]" class="text-gray-500 text-[18px]"/> {{ PageName }}</h3>
        </div>
        <div class="mt-5 flex xl:mt-0 xl:ml-4">
            <span class="hidden sm:block">
              <button @click="renderFileBrowser" type="button" class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                <font-awesome-icon :icon="['fas','refresh']" class="text-black text-[12px] mr-2"/> 
                รีเฟรซ
              </button>
            </span>
            <span class="ml-3 hidden sm:block">
              <button @click="openCreateFolder" type="button" class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                <font-awesome-icon :icon="['fas','folder-plus']" class="text-black text-[12px] mr-2"/> 
                สร้างโฟลเดอร์
              </button>
            </span>
            <span class="ml-3 hidden sm:block">
              <button @click="openUploadBox" type="button" class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                <font-awesome-icon :icon="['fas','upload']" class="text-black text-[12px] mr-2"/> 
                อัพโหลดไฟล์
              </button>
            </span>

            <span class="ml-3 hidden sm:block" v-if="Mode=='static'">
              <button @click="$router.push('/setup/index')" type="button" class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                <font-awesome-icon :icon="['fas','home']" class="text-black text-[12px] mr-2"/> 
                ย้อนกลับ
              </button>
            </span>
        </div>
      </div>
    </header>

    <div v-if="uploadPanel" class="flex-1 pb-8 bg-gray-100 pt-2 pb-5">
      <div class="mx-auto max-w-7xl px-3 sm:px-3 lg:px-3">
        <div class="overflow-hidden bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900">อัพโหลดไฟล์</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">เลือกไฟล์ที่ต้องการอัพโหลด ห้ามตั้งชื่อไฟล์เป็นภาษาไทย</p>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">ไฟล์ที่เลือกไว้</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <input type="file" id="files" ref="files" multiple v-on:change="handleFilesUpload()"/>

                  <ul role="list" class="divide-y divide-gray-200 rounded-md border border-gray-200">

                    <li v-for="(file, key) in files" :key="key" class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                      <div class="flex w-0 flex-1 items-center">
                        <font-awesome-icon :icon="['fas','paperclip']" class="text-gray-200 text-[18px] mr-2"/>
                        <span class="ml-2 w-0 flex-1 truncate">{{ file.name }}</span>
                      </div>
                      <div class="ml-4 flex-shrink-0">
                        <template v-if="file.status === 'uploading'">
                          <font-awesome-icon :icon="['fas', 'upload']" class="ml-1 text-blue-500"/> กำลังอัพโหลด...
                        </template>
                        <template v-else-if="file.status === 'pending'">
                          <font-awesome-icon :icon="['fas', 'clock']" class="ml-1 text-gray-500"/> รออัพโหลด
                        </template>
                        <template v-else-if="file.status === 'success'">
                          <font-awesome-icon :icon="['fas', 'check']" class="ml-1 text-green-500"/> อัพโหลดแล้ว
                        </template>
                        <template v-else-if="file.status === 'error'">
                          เกิดข้อผิดพลาด!
                        </template>
                        <template v-else>
                          <a v-on:click="submitFiles()" class="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500">Upload All</a>
                        </template>
                        <a v-on:click="removeFile(key)" class="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500 ml-2"> <font-awesome-icon :icon="['fas', 'trash']" class="ml-1 text-red-500"/></a>
                      </div>
                    </li>
                    
                    
                  </ul>
                </dd>
              </div>
            </dl>
          </div>

          <div class="bg-gray-50 px-4 py-3 text-left sm:px-6 border-t">
            <button v-on:click="addFiles()" type="button" class="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
            เลือกไฟล์
            </button>
            <button v-on:click="submitFiles()" type="button" class="ml-5 inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
            อัพโหลดไฟล์
            </button>
            <button v-on:click="closeUploadBox()" type="button" class="ml-5 inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
            ปิด
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 pb-4 bg-gray-100 pt-1 pb-5 border-t">

        <div class="mx-auto max-w-7xl px-3 sm:px-3 lg:px-3">

          <nav class="flex mb-1 mt-1" aria-label="Breadcrumb">
            <ol role="list" class="flex items-center space-x-1 w-full">
              <li>
                <div>
                  <a @click="openFolder()" class="text-sm text-gray-400 hover:text-gray-500 cursor-pointer">
                    <font-awesome-icon :icon="['fas','home']" class="text-gray-400 mr-1 w-5"/>
                    Home
                  </a>
                </div>
              </li>
          
              <li v-for="(Path,index) in folderPath" :key="index" class="hidden md:block">
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas','chevron-right']" class="text-gray-400 w-2"/>
                  <a 
                    v-if="(index+1)==folderPath.length" 
                    :href="'javascript:void(0)'" 
                    class="ml-2 text-sm font-medium text-gray-300 cursor-pointer">
                    <font-awesome-icon :icon="['fas','folder-open']" 
                    class="text-gray-300 mr-1 w-5"/> 
                    {{Path}}
                  </a>
                  <a 
                    v-if="(index+1)!=folderPath.length" 
                    @click="openFolder(getFullPath(Path))"
                    class="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer">
                    <font-awesome-icon :icon="['fas','folder-open']" 
                    class="text-yellow-500 mr-1 w-5"/> 
                    {{Path}}
                  </a>
                </div>
              </li>
            </ol>

            <div class="ml-auto">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาไฟล์..."
                class="px-4 py-2 border border-gray-300 rounded w-46"
              />
            </div>
          </nav>

            <div class="mt-2 flex flex-col">

              <div class="bg-black text-white p-5" v-if="selectFile !== undefined">
                <div class="flex items-center">
                  <div>
                    <img :src="imageSource" alt="Thumbnail" class="h-20 w-20 mr-3 rounded-md" />
                  </div>
                  <div class="block">
                    <div><span class="text-indigo-600 font-semibold">ไฟล์ที่เลือก : </span> {{ selectFile }}</div>
                    <div class="mt-3">
                      <button @click="selectFileFunc(selectFile)" type="button" class="mr-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                        <font-awesome-icon :icon="['fas','check']" class="text-black text-[12px] mr-2"/>
                        เลือก
                      </button>
                      <button @click="selectFile = undefined" type="button" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                        <font-awesome-icon :icon="['fas','times']" class="text-black text-[12px] mr-2"/>
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 shadow-inner">
                    <div class="flex flex-1 items-stretch overflow-hidden bg-white">
                      <main class="flex-1 overflow-y-auto">

                        <div class="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 blocking relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">

                          <section :style="{ height: sectionHeight }" class="flex flex-col" aria-labelledby="gallery-heading">

                            <h2 id="gallery-heading" class="sr-only">Recently viewed</h2>
                            <form>
                              <ul role="list" id="fileList" class="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8" :class="[(showFileDetail?'md:grid-cols-5 xl:grid-cols-5' : 'md:grid-cols-5 xl:grid-cols-5')]">
                                
                                <li v-for="(file) in filteredFileList" :key="file.title" class="relative">

                                  <div v-if="file.isFolder">
                                    <!-- <a :href="'/setup/file?prefix='+file.prefix" @click="openFolder(file.prefix)" class="group block w-full hover:opacity-80" @contextmenu="onContextMenu($event,file.prefix)">
                                      <font-awesome-icon :icon="['fas','folder']" class="text-yellow-500 text-[120px]"/>
                                      <button type="button" class="absolute inset-0 focus:outline-none">
                                        <span class="sr-only">View details for {{file.title}}</span>
                                      </button>
                                    </a> -->
                                    <div class="group block w-full hover:opacity-80" @contextmenu="onContextMenu($event,file.prefix,file.title)" @click="openFolder(file.prefix)" >
                                      <font-awesome-icon :icon="['fas','folder']" class="text-yellow-500 text-[120px]"/>
                                      <button type="button" class="absolute inset-0 focus:outline-none">
                                        <span class="sr-only">View details for {{file.title}}</span>
                                      </button>
                                    </div>
                                    <p class="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">{{file.title}}</p>
                                    <p class="pointer-events-none block text-sm font-medium text-gray-500">จำนวน {{file.count-1}} ไฟล์</p>
                                  </div>

                                  <div v-if="!file.isFolder">
                                    <div v-if="file.type=='image'" @contextmenu="onFileContextMenu($event,file.prefix,file.title)" @dblclick="onDoubleClick(file.title)" @click="openViewFile(file.title)" class="h-[120px] ring-offset-2 group block w-full aspect-w-10 aspect-h-7 rounded-sm bg-gray-100 overflow-hidden hover:ring-2 hover:opacity-80 active:ring-indigo-500">
                                      <img :src="file.cover" alt="" class="object-cover pointer-events-none">
                                      <button type="button" class="absolute inset-0 focus:outline-none">
                                        <span class="sr-only">View details for {{file.title}}</span>
                                      </button>
                                    </div>

                                    <div v-if="file.type=='document'" @contextmenu="onFileContextMenu($event,file.prefix,file.title)" @dblclick="onDoubleClick(file.title)"  @click="openViewFile(file.title)" class="h-[120px] ring-offset-2 group block w-full aspect-w-10 aspect-h-7 rounded-sm bg-white overflow-hidden hover:ring-2 hover:opacity-80 active:ring-indigo-500">
                                      <font-awesome-icon :icon="['fas',file.icon]" class="text-gray-300 text-[120px]"/>
                                      <button type="button" class="absolute inset-0 focus:outline-none">
                                        <span class="sr-only">View details for {{file.title}}</span>
                                      </button>
                                    </div>
                                  
                                    <div v-if="Mode === 'popup' && isAllowedFile(file.title)">
                                      <div class="mt-2 block truncate text-sm font-medium text-gray-900">
                                        <label class="block pl-1 pt-2 pb-2 pr-2">
                                          <input type="radio" :value="file.prefix" v-model="selectFile" class="radio-input border-2 border-black" /> {{ file.title }}
                                        </label>
                                      </div>
                                      <p class="ml-1 pointer-events-none block text-sm font-medium text-gray-500">{{ this.formatBytes(file.size) }}</p>
                                    </div>

                                    <div v-else>
                                      <p class="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">{{file.title}}</p>
                                      <p class="pointer-events-none block text-sm font-medium text-gray-500">{{this.formatBytes(file.size)}}</p>
                                    </div>

                                  </div>

                                </li>

                              </ul>
                            </form>
                          </section>
                        </div>
                        
                      </main>

                      <aside v-if="showFileDetail" class="hidden w-96 overflow-y-auto border-l border-gray-200 bg-white p-8 lg:block">

                        <div class="space-y-6 pb-16">
                          
                          <div class="relative"> 
                            <!-- <button @click="closeViewFile" type="button" class="absolute focus:outline-none right-[-20px] top-[-20px]">
                              <div class="z-50 absolute bg-black w-8 h-8 right-2 top-2 rounded-full leading-8  hover:bg-gray-500">
                                <font-awesome-icon :icon="['fas','times']" class="text-gray-300 font-sm"/>
                              </div>
                            </button> -->
                            <div v-if="showFilePreview" class="aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg">
                              <img :src="viewFilecover" alt="" class="object-cover">
                            </div>

                            <!-- <div class="mt-4 flex items-start justify-between">
                              <div>
                                <h2 class="text-lg font-medium text-gray-900"><span class="sr-only">Details for </span>{{viewFilename}}</h2>
                                <p class="text-sm font-medium text-gray-500">{{this.formatBytes(viewFilesize)}}</p>
                              </div>
                              <button type="button" class="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                </svg>
                                <span class="sr-only">Favorite</span>
                              </button>
                            </div> -->

                          </div>
                          <div>
                            <dl class="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                              <div class="flex justify-between py-3 text-sm font-medium">
                                <dt class="text-gray-500 truncate">{{viewFilename}}</dt>
                              </div>

                              <div class="flex justify-between py-3 text-sm font-medium">
                                <dt class="text-gray-500">อัพโหลดโดย</dt>
                                <dd class="whitespace-nowrap text-gray-900">Marie Culver</dd>
                              </div>

                              <div class="flex justify-between py-3 text-sm font-medium">
                                <dt class="text-gray-500">วันที่อัพโหลด</dt>
                                <dd class="whitespace-nowrap text-gray-900">{{ formatDate(viewFilecreate) }}</dd>
                              </div>

                              <div class="flex justify-between py-3 text-sm font-medium">
                                <dt class="text-gray-500">ขนาดไฟล์</dt>
                                <dd class="whitespace-nowrap text-gray-900">{{this.formatBytes(viewFilesize)}}</dd>
                              </div>
                            </dl>
                          </div>
                          <div class="flex">
                            <button v-if="Mode=='popup'" 
                            @click="selectFileFunc(viewFileurl)" 
                            type="button" 
                            class="flex-1 rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            <font-awesome-icon :icon="['fas','check']" class="text-white"/> 
                            เลือกไฟล์
                            </button>

                            <button 
                            @click="closeViewFile" 
                            type="button" 
                            class="ml-3 flex-1 rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            ปิด
                            </button>
                            <button 
                            @click="deleteFile(viewFileurl)" 
                            type="button" 
                            class="ml-3 flex-1 rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            <font-awesome-icon :icon="['fas','trash']" class="text-gray-500"/> </button>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
  input[type="file"]{
    position: absolute;
    top: -500px;
  }

  div.file-listing{
    width: 200px;
  }

  span.remove-file{
    color: red;
    cursor: pointer;
    float: right;
  }

  .overflow-auto {
    max-height: calc(100% - 140px);
  }

</style>
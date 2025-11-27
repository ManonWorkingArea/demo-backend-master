import { ref, reactive } from 'vue'
import { Upload } from "@aws-sdk/lib-storage"
import toast from '@/plugins/ToastUI.js'
import debug from '@/plugins/Logger.js'

export function useFileUpload() {
  const uploadPanel = ref(false)
  const files = reactive([])
  const uploadControllers = new Map()

  const openUploadBox = () => {
    uploadPanel.value = true
  }

  const closeUploadBox = () => {
    uploadPanel.value = false
    files.splice(0, files.length)
  }

  const addFiles = (fileInputRef) => {
    fileInputRef.click()
  }

  const handleFilesUpload = (uploadedFiles) => {
    for (let i = 0; i < uploadedFiles.length; i++) {
      uploadedFiles[i].status = 'pending'
      files.push(uploadedFiles[i])
      debug.log('Uploaded file name:', uploadedFiles[i].name)
    }
  }

  const removeFile = (key) => {
    files.splice(key, 1)
  }

  const cancelUpload = async (fileName) => {
    const upload = uploadControllers.get(fileName)
    if (upload) {
      try {
        await upload.abort()
        uploadControllers.delete(fileName)
        
        const file = files.find(f => f.name === fileName)
        if (file) {
          file.status = 'cancelled'
          file.progress = 0
        }
      } catch (error) {
        debug.log(`Error cancelling upload for ${fileName}:`, error)
      }
    }
  }

  const submitFiles = async (s3Client, schoolSession, session, configs, prefix, addFileCallback, listFileCallback, createThumbnailCallback, captureThumbnailCallback) => {
    try {
      if (!files.length) {
        throw new Error('กรุณาเลือกไฟล์ที่ต้องการอัพโหลด')
      }

      const currentDate = new Date()
      const year = currentDate.getFullYear().toString()
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        if (!file || file.size === 0) {
          console.error(`Error: File is unreadable or empty - ${file?.name || "Unknown file"}`)
          file.status = 'error'
          continue
        }

        try {
          const file_name_array = file.name.split('.')
          const file_extension = file_name_array.pop()
          const timestamp = new Date().getTime()
          const new_file_name = String(timestamp)
          const path = `${year}/${month}/`
          
          file.status = 'uploading'
          file.progress = 0

          const parallelUploads3 = new Upload({
            client: s3Client,
            params: {
              Bucket: schoolSession.s3Bucket,
              Key: `${path}${new_file_name}.${file_extension}`,
              Body: file,
              ACL: 'public-read',
              ContentType: file.type
            },
            queueSize: 4,
            partSize: 1024 * 1024 * 5,
            leavePartsOnError: false,
          })

          uploadControllers.set(file.name, parallelUploads3)

          parallelUploads3.on("httpUploadProgress", (progress) => {
            if (file.status === 'cancelled') {
              return
            }

            const loaded = progress.loaded || 0
            const total = progress.total || file.size
            const percentLoaded = Math.round((loaded * 100) / total)
            
            file.progress = percentLoaded
            debug.log(`Upload Progress for ${file.name}: ${percentLoaded}%`)
          })

          await parallelUploads3.done()
          uploadControllers.delete(file.name)

          if (file.status === 'cancelled') {
            continue
          }

          file.status = 'success'
          file.progress = 100
          file.original = `${path}${new_file_name}.${file_extension}`

          const payload = {
            data: {
              owner: session.current._id || configs.siteID,
              original: file.original,
              path: schoolSession.s3Endpoint + file.original,
              parent: prefix,
              name: file.name,
              size: file.size,
              type: getFileType(file.type),
              mimetype: file.type,
              spaceId: session.current.spaceId || configs.spaceId,
            },
            options: {}
          }

          const response = await addFileCallback(payload)

          // Create thumbnails
          if (file.type.startsWith('image/')) {
            await createThumbnailCallback(schoolSession.s3Endpoint + file.original, response.data._id)
          } else if (file.type.startsWith('video/')) {
            await captureThumbnailCallback(schoolSession.s3Endpoint + file.original, response.data._id)
          }

        } catch (error) {
          if (error.name === 'AbortError') {
            file.status = 'cancelled'
            debug.log(`Upload cancelled for file: ${file.name}`)
          } else {
            console.error(`Upload Failed for file: ${file.name}`, error)
            file.status = 'error'
            file.progress = 0
          }
          
          uploadControllers.delete(file.name)
        }
      }

      const successFiles = files.filter(f => f.status === 'success')
      if (successFiles.length > 0) {
        await listFileCallback()
      }

      // Clear completed files
      const completedFiles = files.filter(f => ['success', 'error', 'cancelled'].includes(f.status))
      completedFiles.forEach(file => {
        const index = files.indexOf(file)
        if (index > -1) {
          files.splice(index, 1)
        }
      })
      
      if (files.length === 0) {
        uploadPanel.value = false
      }

    } catch (error) {
      console.error('Submit Files Error:', error)
      toast({ type: 'error', message: error.message })
    }
  }

  const getFileType = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image'
    if (mimetype.startsWith('video/')) return 'media'
    return 'document'
  }

  return {
    // State
    uploadPanel,
    files,
    uploadControllers,
    
    // Methods
    openUploadBox,
    closeUploadBox,
    addFiles,
    handleFilesUpload,
    removeFile,
    cancelUpload,
    submitFiles
  }
} 
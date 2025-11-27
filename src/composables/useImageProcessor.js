import { ref } from 'vue'
import { Upload } from "@aws-sdk/lib-storage"
import { Image } from 'image-js'
import toast from '@/plugins/ToastUI.js'
import debug from '@/plugins/Logger.js'

export function useImageProcessor() {
  const isResizeModalOpen = ref(false)
  const selectedImageQuality = ref(0.8)
  const fileToResize = ref(null)
  const isBatchResizing = ref(false)
  const batchProgress = ref(0)
  const totalBatchFiles = ref(0)
  const processedFiles = ref(0)

  const resizeOption = (path, id) => {
    fileToResize.value = {
      path: path,
      id: id
    }
    isResizeModalOpen.value = true
  }

  const createThumbnail = async (originalPath, id, updateFileCallback) => {
    try {
      const imageUrl = originalPath
      const originalImage = await Image.load(imageUrl)
      
      debug.log(`Original image size: ${originalImage.width}x${originalImage.height}`)
      
      // คำนวณขนาดใหม่ให้เหมาะสม โดยไม่ให้เล็กเกินไป
      let newWidth = 600  // เพิ่มจาก 400 เป็น 600 pixels
      let newHeight
      
      // ถ้ารูปต้นฉบับเล็กกว่า 600px ให้ใช้ขนาดต้นฉบับ
      if (originalImage.width < 600) {
        newWidth = originalImage.width
      }
      
      // คำนวณความสูงตามอัตราส่วน
      newHeight = Math.round((newWidth / originalImage.width) * originalImage.height)
      
      debug.log(`Thumbnail size: ${newWidth}x${newHeight}`)
      
      const resizedImage = originalImage.resize({
        width: newWidth,
        height: newHeight
      })
      
      // ใช้ PNG สำหรับรูปที่มีตัวอักษรหรือกราฟิก เพื่อความคมชัด
      // และใช้คุณภาพสูงสุด
      const resizedImageBlob = await resizedImage.toBlob('image/png', 1.0)  // PNG คุณภาพ 100%
      
      const resizedImageBase64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result)
        }
        reader.readAsDataURL(resizedImageBlob)
      })
      
      debug.log(`Thumbnail created: ${Math.round(resizedImageBase64.length / 1024)}KB`)
      
      await updateFileCallback(id, { thumbnail: resizedImageBase64 })
      return resizedImageBase64
    } catch (error) {
      debug.log("Error resizing image:", error)
      return null
    }
  }

  const processImage = async (options, s3Client, schoolSession, updateFileCallback) => {
    try {
      const toastInstance = toast({ type: 'pending', message: 'กำลังปรับขนาดรูปภาพ...' })
      const timestamp = new Date().getTime()
      let processedImageUrl = schoolSession.s3Endpoint + fileToResize.value.path
      
      // Get image metadata
      const metadataResponse = await fetch('https://api.apyhub.com/processor/image/metadata/file-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apy-token': 'APY02grbaFd83fKSDc8QtNTdld6dgFG4YDna2AIZYh4QGsE1jPsLQDBwuyM77R21Fq7BsSMHAH'
        },
        body: JSON.stringify({
          url: processedImageUrl
        })
      })

      const metadata = await metadataResponse.json()
      if (!metadata.data) {
        throw new Error('Failed to get image metadata')
      }

      const originalWidth = metadata.data.ImageWidth
      const originalHeight = metadata.data.ImageHeight
      const maxWidth = options.resize.maxWidth
      let newWidth = originalWidth
      let newHeight = originalHeight

      if (originalWidth > maxWidth) {
        const ratio = maxWidth / originalWidth
        newWidth = maxWidth
        newHeight = Math.round(originalHeight * ratio)
      }

      // Resize if needed
      if (originalWidth > maxWidth && options.resize.enabled) {
        const resizeResponse = await fetch(
          `https://api.apyhub.com/processor/image/resize/file-urls?output=resized-${timestamp}&width=${newWidth}&height=${newHeight}&auto_orientation=false&preserve_format=true`, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apy-token': 'APY02grbaFd83fKSDc8QtNTdld6dgFG4YDna2AIZYh4QGsE1jPsLQDBwuyM77R21Fq7BsSMHAH'
            },
            body: JSON.stringify({
              url: processedImageUrl
            })
          }
        )

        const resizeResult = await resizeResponse.json()
        if (!resizeResult.data) {
          throw new Error('Resize API did not return expected data')
        }
        processedImageUrl = resizeResult.data
      }

      // Compress if needed
      if (options.compress?.enabled) {
        const compressionPercent = Math.round(options.compress.quality * 100)
        
        const imageResponse = await fetch(processedImageUrl)
        const imageBlob = await imageResponse.blob()

        const formData = new FormData()
        formData.append('image', imageBlob, 'image.jpg')

        const compressResponse = await fetch(
          `https://api.apyhub.com/processor/image/compress/file/url?output=final-${timestamp}&compression_percentage=${compressionPercent}&preserve_format=true`, 
          {
            method: 'POST',
            headers: {
              'apy-token': 'APY02grbaFd83fKSDc8QtNTdld6dgFG4YDna2AIZYh4QGsE1jPsLQDBwuyM77R21Fq7BsSMHAH'
            },
            body: formData
          }
        )

        const compressResult = await compressResponse.json()
        if (!compressResult.data) {
          throw new Error('Compress API did not return expected data')
        }
        processedImageUrl = compressResult.data
      }

      // Upload final image
      if (options.resize.enabled || options.compress?.enabled) {
        const finalImageResponse = await fetch(processedImageUrl)
        const finalBlob = await finalImageResponse.blob()

        const parallelUploads3 = new Upload({
          client: s3Client,
          params: {
            Bucket: schoolSession.s3Bucket,
            Key: fileToResize.value.path,
            Body: finalBlob,
            ACL: 'public-read',
            ContentType: finalBlob.type
          }
        })

        await parallelUploads3.done()
        await updateFileCallback(fileToResize.value.id, { size: finalBlob.size })
      }

      const resizeInfo = originalWidth > maxWidth && options.resize.enabled ? 
        `(${originalWidth}x${originalHeight} -> ${newWidth}x${newHeight})` : 
        '(ขนาดคงเดิม)'

      const qualityInfo = options.compress?.enabled ? 
        `คุณภาพ: ${Math.round(options.compress.quality * 100)}%` : ''
      
      const operationsInfo = [
        options.resize.enabled ? 'ปรับขนาด' : '',
        options.compress?.enabled ? 'บีบอัด' : ''
      ].filter(Boolean).join('และ')

      toastInstance.hide(`${operationsInfo}รูปภาพเสร็จแล้ว ${resizeInfo} ${qualityInfo}`, 'success')
      isResizeModalOpen.value = false

    } catch (error) {
      console.error('Error processing image:', error)
      toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ' })
    }
  }

  return {
    // State
    isResizeModalOpen,
    selectedImageQuality,
    fileToResize,
    isBatchResizing,
    batchProgress,
    totalBatchFiles,
    processedFiles,
    
    // Methods
    resizeOption,
    createThumbnail,
    processImage
  }
} 
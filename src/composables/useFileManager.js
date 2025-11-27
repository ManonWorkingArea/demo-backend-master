import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { S3 } from "@aws-sdk/client-s3"
import storageManager from '@/plugins/storage'
import toast from '@/plugins/ToastUI.js'
import debug from '@/plugins/Logger.js'

export function useFileManager() {
  // Reactive state
  const files = reactive([])
  const fileListing = reactive([])
  const folderPath = ref("")
  const prefix = ref("")
  const selectItem = ref('')
  const selectItemData = ref('')
  const hasSelected = ref(false)
  const summaryFileSize = ref(0)
  const searchQuery = ref('')
  const uploadControllers = new Map()

  // Session data
  const session = storageManager.get('session')
  const schoolSession = session.current
  const configs = storageManager.get('configs')

  // S3 Client
  const s3Client = new S3({
    forcePathStyle: false,
    endpoint: schoolSession.s3EndpointDefault,
    region: schoolSession.s3Region,
    ResponseContentEncoding: "utf-8",
    credentials: {
      accessKeyId: schoolSession.s3Key,
      secretAccessKey: schoolSession.s3Secret
    }
  })

  // Computed properties
  const filteredFileList = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) {
      return fileListing
    }
    return fileListing.filter((file) => file.name.toLowerCase().includes(query))
  })

  // File operations
  const listFile = async () => {
    try {
      console.log('=== listFile Debug ===')
      const session = storageManager.get('session')
      console.log('Session from storage:', session)
      
      if (!session || !session.current) {
        console.error('No session found or session.current is missing')
        console.log('Available session keys:', session ? Object.keys(session) : 'session is null/undefined')
        return
      }
      
      console.log('Session.current:', session.current)
      console.log('Configs:', configs)
      
      prefix.value = session.prefix || ""
      console.log('Prefix set to:', prefix.value)
      
      let andConditions = [
        session.current._id 
          ? { owner: session.current._id, parent: prefix.value } 
          : { owner: configs.siteID, parent: prefix.value }
      ]

      console.log('And conditions:', andConditions)

      const pipeline = [
        {
          $match: {
            $and: andConditions,
          },
        },
        {
          $facet: {
            totalCount: [
              { $count: "count" },
            ],
            folders: [
              {
                $match: {
                  mimetype: "folder",
                },
              },
              {
                $lookup: {
                  from: "storage",
                  let: { folder_path: "$path", owner_id: "$owner" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$parent", "$$folder_path"] },
                            { $eq: ["$owner", "$$owner_id"] },
                            { $ne: ["$mimetype", "folder"] }
                          ]
                        }
                      }
                    },
                    {
                      $group: {
                        _id: "$parent",
                        totalSize: { $sum: { $ifNull: ["$size", 0] } },
                        fileCount: { $sum: 1 }
                      }
                    },
                    {
                      $project: {
                        _id: 0,
                        size: "$totalSize",
                        count: "$fileCount"
                      }
                    }
                  ],
                  as: "folderStats"
                }
              },
              {
                $project: {
                  _id: 1,
                  original: 1,
                  path: 1,
                  name: 1,
                  type: 1,
                  duration: 1,
                  mimetype: 1,
                  spaceId: 1,
                  createdAt: 1,
                  stream: 1,
                  transcode: 1,
                  size: { $ifNull: [ { $arrayElemAt: ["$folderStats.size", 0] }, 0 ] },
                  count: { $ifNull: [ { $arrayElemAt: ["$folderStats.count", 0] }, 0 ] }
                },
              },
            ],
            files: [
              {
                $match: {
                  mimetype: { $ne: "folder" },
                },
              },
              {
                $project: {
                  _id: 1,
                  original: 1,
                  path: 1,
                  name: 1,
                  type: 1,
                  duration: 1,
                  mimetype: 1,
                  spaceId: 1,
                  createdAt: 1,
                  stream: 1,
                  transcode: 1,
                  thumbnail: 1,
                  size: { $ifNull: ["$size", 0] },
                },
              },
            ],
          },
        },
      ]

      const payload = { pipeline }
      console.log('Payload:', JSON.stringify(payload, null, 2))
      
      // ใช้ getCurrentInstance เพื่อเข้าถึง Vue instance
      const instance = getCurrentInstance()
      if (instance && instance.appContext.app.config.globalProperties.$Request) {
        console.log('Using Vue instance API functions...')
        const $Request = instance.appContext.app.config.globalProperties.$Request
        const $Key = instance.appContext.app.config.globalProperties.$Key
        
        const { data } = await $Request.POST('storage/aggregate', payload, $Key)
        console.log('API Response:', data)
        
        const folders = data[0].folders || []
        const files = data[0].files || []

        console.log('Folders count:', folders.length)
        console.log('Files count:', files.length)

        folders.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
        files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))

        // ใช้วิธีเดียวกับโค้ดต้นฉบับ
        const allFiles = folders.concat(files)
        console.log('Total files to add:', allFiles.length)
        
        // Clear และ assign ใหม่แบบเดียวกับโค้ดต้นฉบับ
        fileListing.length = 0
        fileListing.push(...allFiles)
        console.log('FileListing after update:', fileListing.length, fileListing)
        
        folderPath.value = prefix.value
        if (folderPath.value && folderPath.value !== "") {
          folderPath.value = folderPath.value.split("/")
        } else {
          folderPath.value = ""
        }

        const size = await usageSpace()
        summaryFileSize.value = size
        unselectItem()
        
        console.log('listFile completed successfully')
      } else {
        console.warn('Vue instance API functions not available')
        console.log('Instance:', instance)
      }
    } catch (error) {
      console.error('Error in listFile:', error)
      debug.log(error)
    }
  }

  const usageSpace = async () => {
    try {
      const pipeline = [
        {
          $match: {
            owner: session.current._id || configs.siteID,
          },
        },
        {
          $group: {
            _id: null,
            totalSize: { $sum: "$size" },
          },
        },
      ]

      const payload = { pipeline }
      
      const instance = getCurrentInstance()
      if (instance && instance.appContext.app.config.globalProperties.$Request) {
        const $Request = instance.appContext.app.config.globalProperties.$Request
        const $Key = instance.appContext.app.config.globalProperties.$Key
        const { data } = await $Request.POST('storage/aggregate', payload, $Key)
        return data[0].totalSize
      }
    } catch (error) {
      debug.log(error)
    }
  }

  const addFile = async (file) => {
    try {
      const payload = {
        data: {
          owner: session.current._id || configs.siteID,
          original: file.original,
          path: file.path,
          parent: prefix.value,
          name: file.name,
          size: file.size,
          type: file.mimetype,
          mimetype: file.type,
          spaceId: session.current.spaceId || configs.spaceId,
        },
        options: {}
      }
      
      const instance = getCurrentInstance()
      if (instance && instance.appContext.app.config.globalProperties.$Request) {
        const $Request = instance.appContext.app.config.globalProperties.$Request
        const $Key = instance.appContext.app.config.globalProperties.$Key
        const { data } = await $Request.POST('storage/', payload, $Key)
        return data
      }
    } catch (error) {
      debug.log(error)
    }
  }

  const deleteDocument = async (id) => {
    try {
      const toastInstance = toast({ type: 'pending', message: 'กำลังลบ..' })
      
      const instance = getCurrentInstance()
      if (instance && instance.appContext.app.config.globalProperties.$Request) {
        const $Request = instance.appContext.app.config.globalProperties.$Request
        const $Key = instance.appContext.app.config.globalProperties.$Key
        const { status } = await $Request.DELETE(`storage/${id}`, null, $Key)
        if (status === 200) {
          toastInstance.hide('ลบเสร็จแล้ว.', 'success', 300, async () => {
            await listFile()
          })
        }
      }
    } catch (error) {
      debug.log(error)
    }
  }

  const unselectItem = () => {
    selectItem.value = ''
    selectItemData.value = ''
    hasSelected.value = false
  }

  const openFolder = (folder) => {
    const new_prefix = folder && folder.trim() !== '' ? folder.trim() : ''
    const sessionUpdate = { prefix: new_prefix }
    storageManager.update('session', sessionUpdate)
    listFile()
  }

  // Utility functions
  const formatBytes = (bytes) => {
    const marker = 1024
    const decimal = 3
    const kiloBytes = marker
    const megaBytes = marker * marker
    const gigaBytes = marker * marker * marker
    
    if (bytes < kiloBytes) return bytes + " Bytes"
    else if (bytes < megaBytes) return (bytes / kiloBytes).toFixed(decimal) + " KB"
    else if (bytes < gigaBytes) return (bytes / megaBytes).toFixed(decimal) + " MB"
    else return (bytes / gigaBytes).toFixed(decimal) + " GB"
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('default', { dateStyle: 'long' }).format(date)
  }

  const getFileName = (fileName) => {
    const lastDotIndex = fileName.lastIndexOf('.')
    return lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex)
  }

  const getFileExtension = (fileName) => {
    const lastDotIndex = fileName.lastIndexOf('.')
    return lastDotIndex === -1 ? '' : fileName.substring(lastDotIndex)
  }

  return {
    // State
    files,
    fileListing,
    folderPath,
    prefix,
    selectItem,
    selectItemData,
    hasSelected,
    summaryFileSize,
    searchQuery,
    uploadControllers,
    s3Client,
    schoolSession,
    session,
    configs,
    
    // Computed
    filteredFileList,
    
    // Methods
    listFile,
    usageSpace,
    addFile,
    deleteDocument,
    unselectItem,
    openFolder,
    formatBytes,
    formatDate,
    getFileName,
    getFileExtension
  }
} 
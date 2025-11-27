// Import FileManager composable สำหรับจัดการไฟล์
import { useFileManager } from '@/composables/useFileManager.js';

/**
 * VideoSegmentManager - จัดการ segment-based video recording
 * สร้างไฟล์ MP4 สมบูรณ์เป็นชิ้นเล็กๆ แต่ใช้ endpoint /chunk เดิม
 * ใช้ FileManager functions เพื่อความสอดคล้องกับระบบ
 */
class VideoSegmentManager {
  constructor(options = {}) {
    // ตั้งค่าพื้นฐาน
    this.mediaServerUrl = options.mediaServerUrl || 'https://media.cloudrestfulapi.com/api/media';
    this.segmentDurationMs = options.segmentDurationMs || 5000; // 5 seconds per segment
    this.maxRetries = options.maxRetries || 3;
    this.useDummyServer = options.useDummyServer || false;
    this.simulateRealRequests = options.simulateRealRequests || false;
    
    // Session management
    this.sessionId = null;
    this.isRecording = false;
    this.currentSegmentIndex = 0;
    this.failedSegments = [];
    this.uploadedSegments = [];
    this.totalUploadedSize = 0;
    
    // Pre-created video file info
    this.preVideoFile = null;
    
    // Segment upload tracking
    this.pendingUploads = new Set();
    this.totalExpectedSegments = 0;
    
    // MediaRecorder related
    this.mediaRecorder = null;
    this.recordingStream = null;
    this.segmentRecordedData = [];
    this.segmentStartTime = null;
    this.recordingInterval = null;
    
    // Event handlers
    this.onSegmentUploaded = options.onSegmentUploaded || (() => {});
    this.onUploadError = options.onUploadError || (() => {});
    this.onSessionComplete = options.onSessionComplete || (() => {});
    this.onProgressUpdate = options.onProgressUpdate || (() => {});
    
    // Initialize FileManager composable
    this.fileManager = useFileManager();
    
    console.log('🎬 VideoSegmentManager initialized:', {
      mediaServerUrl: this.mediaServerUrl,
      segmentDuration: this.segmentDurationMs + 'ms',
      maxRetries: this.maxRetries,
      useDummyServer: this.useDummyServer,
      simulateRealRequests: this.simulateRealRequests,
      recordingMode: 'complete-mp4-segments-with-chunk-endpoint',
      fileManagerIntegrated: true
    });
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Initialize a new recording session with automatic session creation
   */
  async initializeNewSession(recordingSettings = {}) {
    this.sessionId = this.generateSessionId();
    console.log('🆔 Created new session ID:', this.sessionId);
    
    try {
      // Create pre-video file in database first
      await this.createPreVideoFile(recordingSettings);
      
      // Then create recording session
      await this.createSession();
      
      console.log('✅ Session initialized with pre-video file:', {
        sessionId: this.sessionId,
        fileId: this.preVideoFile?.fileId,
        filename: this.preVideoFile?.filename
      });
      
      return {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        chunkFormat: 'mp4',
        outputFormat: 'mp4',
        recordingMode: 'complete-chunks',
        recordingSettings: {
          videoBitrate: 8000000,
          audioBitrate: 128000
        },
        // ข้อมูลไฟล์จาก FileManager
        fileId: this.preVideoFile?.fileId || null,
        filename: this.preVideoFile?.filename || null,
        currentFolder: this.preVideoFile?.currentFolder || '',
        // ข้อมูล site, space, storage จาก FileManager
        site: this.fileManager?.configs?.hostname || this.fileManager?.configs?.siteID || 'default',
        space: this.fileManager?.session?.current?.spaceId || this.fileManager?.configs?.spaceId || 'default',
        storage: this.fileManager?.session?.current?.storageId || this.fileManager?.configs?.storageId || null,
        owner: this.fileManager?.session?.current?._id || this.fileManager?.configs?.siteID || 'system'
      };
    } catch (error) {
      console.error('❌ Failed to initialize session:', error);
      throw error;
    }
  }

  /**
   * Check if Screen Recording folder exists in the current site
   */
  async checkScreenRecordingFolderExists(session, configs, currentPrefix = '') {
    console.log('� Checking if Screen Recording folder exists...');
    
    const folderName = 'Screen Recording';
    let existingFolder = null;
    
    try {
      // Method 1: Check via FileManager instance (preferred)
      if (typeof window !== 'undefined' && window.fileManagerInstance) {
        console.log('📡 Checking folder via FileManager API...');
        
        const andConditions = [
          { owner: session?.current?._id || configs?.siteID },
          { spaceId: session?.current?.spaceId || configs?.spaceId },
          { parent: currentPrefix },
          { name: folderName },
          { mimetype: 'folder' }
        ];
        
        const pipeline = [
          {
            $match: {
              $and: andConditions,
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              path: 1,
              parent: 1,
              owner: 1,
              spaceId: 1,
              createdAt: 1,
              updatedAt: 1
            }
          },
          {
            $limit: 1
          }
        ];
        
        const result = await window.fileManagerInstance.$Request.POST(
          'storage/aggregate', 
          { pipeline }, 
          window.fileManagerInstance.hostkey
        );
        
        if (result.status === 200 && result.data && result.data.length > 0) {
          existingFolder = result.data[0];
          console.log('✅ Found existing Screen Recording folder:', existingFolder);
          return {
            exists: true,
            folder: existingFolder,
            method: 'filemanager-api'
          };
        }
      }
      
      // Method 2: Direct API fallback
      console.log('📡 Checking folder via direct API...');
      
      const directPipeline = [
        {
          $match: {
            $and: [
              { owner: session?.current?._id || configs?.siteID },
              { spaceId: session?.current?.spaceId || configs?.spaceId },
              { parent: currentPrefix },
              { name: folderName },
              { mimetype: 'folder' }
            ]
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            path: 1,
            parent: 1,
            owner: 1,
            spaceId: 1,
            createdAt: 1
          }
        },
        {
          $limit: 1
        }
      ];
      
      const response = await fetch('https://gateway.cloudrestfulapi.com/api/storage/aggregate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client-token-key': configs?.key || ''
        },
        body: JSON.stringify({ pipeline: directPipeline })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result && result.length > 0) {
          existingFolder = result[0];
          console.log('✅ Found existing Screen Recording folder via direct API:', existingFolder);
          return {
            exists: true,
            folder: existingFolder,
            method: 'direct-api'
          };
        }
      }
      
      console.log('❌ Screen Recording folder not found');
      return {
        exists: false,
        folder: null,
        method: 'not-found'
      };
      
    } catch (error) {
      console.error('❌ Error checking folder existence:', error);
      return {
        exists: false,
        folder: null,
        method: 'error',
        error: error.message
      };
    }
  }

  /**
   * Create Screen Recording folder
   */
  async createScreenRecordingFolder(session, configs, folderPath, currentPrefix = '') {
    console.log('📁 Creating Screen Recording folder...');
    
    const folderName = 'Screen Recording';
    
    const folderPayload = {
      data: {
        owner: session?.current?._id || configs?.siteID || 'system',
        name: folderName,
        path: folderPath,
        parent: currentPrefix,
        size: null,
        type: 'folder',
        mimetype: 'folder',
        spaceId: session?.current?.spaceId || configs?.spaceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // เพิ่มข้อมูลเฉพาะสำหรับโฟลเดอร์ Screen Recording
        description: 'โฟลเดอร์สำหรับเก็บไฟล์วีดีโอที่บันทึกหน้าจอ',
        folderType: 'screen-recording',
        autoCreated: true
      },
      options: {}
    };
    
    console.log('📝 Creating folder with payload:', {
      name: folderPayload.data.name,
      path: folderPayload.data.path,
      parent: folderPayload.data.parent,
      owner: folderPayload.data.owner,
      spaceId: folderPayload.data.spaceId
    });
    
    // Method 1: Try FileManager instance first
    if (typeof window !== 'undefined' && window.fileManagerInstance) {
      try {
        console.log('📡 Creating folder via FileManager API...');
        const result = await window.fileManagerInstance.$Request.POST(
          'storage/', 
          folderPayload, 
          window.fileManagerInstance.hostkey
        );
        
        if (result.status === 200 && result.data) {
          console.log('✅ Screen Recording folder created via FileManager API:', result.data);
          return {
            success: true,
            folder: result.data,
            method: 'filemanager-api'
          };
        }
      } catch (apiError) {
        console.warn('⚠️ Failed to create folder via FileManager API:', apiError);
      }
    }
    
    // Method 2: Direct API fallback
    try {
      console.log('📡 Creating folder via direct API...');
      const response = await fetch('https://gateway.cloudrestfulapi.com/api/storage/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client-token-key': configs?.key || ''
        },
        body: JSON.stringify(folderPayload)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Screen Recording folder created via direct API:', result);
        return {
          success: true,
          folder: result,
          method: 'direct-api'
        };
      } else {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
    } catch (fetchError) {
      console.error('❌ Direct API folder creation failed:', fetchError);
      return {
        success: false,
        folder: null,
        method: 'failed',
        error: fetchError.message
      };
    }
  }

  /**
   * Ensure "Screen Recording" folder exists and return its path
   */
  async ensureScreenRecordingFolder() {
    console.log('📁 Ensuring Screen Recording folder exists...');
    
    try {
      const folderName = 'Screen Recording';
      
      // Get current session data
      const session = (typeof window !== 'undefined' && window.storageManager) 
        ? window.storageManager.get('session') 
        : null;
      const configs = (typeof window !== 'undefined' && window.storageManager) 
        ? window.storageManager.get('configs') 
        : null;
      
      if (!session && !configs) {
        console.warn('⚠️ No session or configs available');
      }
      
      // Get current prefix (current folder path)
      const currentPrefix = session?.prefix || '';
      let folderPath = folderName;
      if (currentPrefix) {
        folderPath = `${currentPrefix}/${folderName}`;
      }
      
      console.log('🔍 Folder details:', {
        folderName,
        folderPath,
        currentPrefix,
        siteID: configs?.siteID,
        spaceId: session?.current?.spaceId || configs?.spaceId,
        owner: session?.current?._id
      });
      
      // Step 1: Check if folder already exists
      const existenceCheck = await this.checkScreenRecordingFolderExists(session, configs, currentPrefix);
      
      if (existenceCheck.exists) {
        console.log('✅ Screen Recording folder exists, using existing folder');
        return {
          folderName: folderName,
          folderPath: existenceCheck.folder.path || folderPath,
          folderId: existenceCheck.folder._id,
          exists: true,
          created: false,
          method: existenceCheck.method
        };
      }
      
      // Step 2: Create folder if it doesn't exist
      console.log('📁 Screen Recording folder not found, creating new one...');
      const creationResult = await this.createScreenRecordingFolder(session, configs, folderPath, currentPrefix);
      
      if (creationResult.success) {
        console.log('✅ Screen Recording folder created successfully');
        
        // Refresh FileManager if possible
        if (typeof window !== 'undefined' && window.fileManagerInstance && 
            typeof window.fileManagerInstance.listFile === 'function') {
          try {
            await window.fileManagerInstance.listFile(currentPrefix);
            console.log('🔄 FileManager refreshed');
          } catch (refreshError) {
            console.warn('⚠️ Failed to refresh FileManager:', refreshError);
          }
        }
        
        return {
          folderName: folderName,
          folderPath: creationResult.folder.path || folderPath,
          folderId: creationResult.folder._id,
          exists: true,
          created: true,
          method: creationResult.method
        };
      } else {
        console.error('❌ Failed to create Screen Recording folder');
        return {
          folderName: folderName,
          folderPath: folderPath,
          folderId: null,
          exists: false,
          created: false,
          method: 'failed',
          error: creationResult.error
        };
      }
      
    } catch (error) {
      console.error('❌ Error in ensureScreenRecordingFolder:', error);
      return {
        folderName: 'Screen Recording',
        folderPath: 'Screen Recording',
        folderId: null,
        exists: false,
        created: false,
        method: 'error',
        error: error.message
      };
    }
  }

  /**
   * Create pre-video file in database for screen recording
   * ใช้วิธีเดียวกับระบบ upload ปกติ - สร้างไฟล์เปล่าๆ ไม่ต้องมี path
   */
  async createPreVideoFile() {
    console.log('📁 Creating empty video file using FileManager...');
    
    try {
      // Generate video filename using timestamp (like upload system)
      const timestamp = new Date().getTime();
      const videoFilename = `screen_recording_${timestamp}.mp4`;
      
      // Get current folder from FileManager
      const currentFolder = this.fileManager.prefix.value || '';
      
      console.log('📂 Using current folder:', currentFolder);
      console.log('📝 Creating file:', videoFilename);
      
      // Create file object with structure matching example data
      const fileData = {
        original: '', // Empty - will be filled after S3 upload
        path: '',     // Empty - will be filled after S3 upload  
        name: videoFilename,
        size: 0,      // Start with 0, will be updated after recording
        type: 'media', // Changed to 'media' as requested
        mimetype: 'video/mp4', // MIME type
        // Additional fields from example data structure
        duration: 0,  // Will be updated after recording (like 1232.36)
        thumbnail: '', // Will be updated after processing
        recordingStatus: 'preparing'
      };
      
      console.log('📝 Using FileManager to create file:', {
        name: videoFilename,
        currentFolder: currentFolder,
        sessionId: this.sessionId
      });
      
      // Use FileManager's addFile function
      const dbRecord = await this.fileManager.addFile(fileData);
      
      if (dbRecord && dbRecord._id) {
        this.preVideoFile = {
          fileId: dbRecord._id,
          filename: videoFilename,
          currentFolder: currentFolder,
          dbRecord: dbRecord
        };
        
        console.log('✅ Pre-video file created using FileManager:', {
          fileId: this.preVideoFile.fileId,
          filename: this.preVideoFile.filename,
          folder: this.preVideoFile.currentFolder
        });
        
        return this.preVideoFile;
      } else {
        throw new Error('Failed to create empty video file via FileManager');
      }
      
    } catch (error) {
      console.error('❌ Failed to create pre-video file:', error);
      // Create fallback file info
      const fallbackFilename = `screen_recording_${Date.now()}.mp4`;
      this.preVideoFile = {
        storageId: `temp_${this.sessionId}`,
        filename: fallbackFilename,
        fullPath: `Screen Recording/${fallbackFilename}`,
        parentFolder: 'Screen Recording',
        folderInfo: { folderName: 'Screen Recording', folderPath: 'Screen Recording', exists: false },
        site: 'fallback',
        space: 'default',
        estimatedSize: 1024 * 1024 * 100, // 100MB estimate
        recordingSettings: {}
      };
      return this.preVideoFile;
    }
  }
  
  /**
   * Calculate estimated file size based on recording settings
   */
  calculateEstimatedFileSize(settings) {
    // Base calculation: bitrate * estimated duration
    const videoBitrate = settings.videoBitsPerSecond || 8000000; // 8 Mbps
    const audioBitrate = settings.audioBitsPerSecond || 128000;  // 128 kbps
    const estimatedDurationMinutes = 5; // Assume 5 minutes average
    
    const totalBitrate = videoBitrate + audioBitrate;
    const estimatedSizeBytes = (totalBitrate / 8) * 60 * estimatedDurationMinutes;
    
    return Math.round(estimatedSizeBytes);
  }

  /**
   * Create recording session on server
   */
  async createSession() {
    console.log('📡 Creating recording session...');

    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
    }

    try {
      // Simulate real requests but handle server unavailability gracefully
      if (this.simulateRealRequests) {
        try {
          console.log('📡 Attempting real HTTP request to media server...');
          const response = await fetch(`${this.mediaServerUrl}/recording/init`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: this.sessionId,
              timestamp: new Date().toISOString(),
              // ส่งข้อมูลให้ server รู้ว่าจะได้ MP4 chunks สมบูรณ์
              chunkFormat: 'mp4',
              outputFormat: 'mp4',
              recordingMode: 'complete-chunks',
              recordingSettings: {
                videoBitrate: 8000000,
                audioBitrate: 128000
              },
              // ข้อมูลไฟล์จาก FileManager
              fileId: this.preVideoFile?.fileId || null,
              filename: this.preVideoFile?.filename || null,
              currentFolder: this.preVideoFile?.currentFolder || '',
              // ข้อมูล site, space, storage จาก FileManager
              site: this.fileManager?.configs?.hostname || this.fileManager?.configs?.siteID || 'default',
              space: this.fileManager?.session?.current?.spaceId || this.fileManager?.configs?.spaceId || 'default',
              storage: this.fileManager?.session?.current?.storageId || this.fileManager?.configs?.storageId || null,
              owner: this.fileManager?.session?.current?._id || this.fileManager?.configs?.siteID || 'system'
            })
          });

          const result = await response.json();
          this.saveSessionToStorage();
          return result;

        } catch (fetchError) {
          console.log('📡 Real request failed as expected (no server):', fetchError.message);

          // Fallback to dummy response
          const response = await this.createDummyResponse({
            sessionId: this.sessionId,
            status: 'initialized',
            message: 'Session created (real HTTP request attempted)',
            note: 'Real HTTP request attempted but server not available'
          });

          this.saveSessionToStorage();
          return response;
        }
      }

      if (this.useDummyServer && !this.simulateRealRequests) {
        console.log('📡 Creating dummy recording session:', this.sessionId);
        const response = await this.createDummyResponse({
          sessionId: this.sessionId,
          status: 'initialized'
        });

        this.saveSessionToStorage();
        return response;
      }

      const response = await fetch(`${this.mediaServerUrl}/recording/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
          chunkFormat: 'mp4',
          outputFormat: 'mp4',
          recordingMode: 'complete-chunks',
          recordingSettings: {
            videoBitrate: 8000000,
            audioBitrate: 128000
          },
          // ข้อมูลไฟล์จาก FileManager
          fileId: this.preVideoFile?.fileId || null,
          filename: this.preVideoFile?.filename || null,
          currentFolder: this.preVideoFile?.currentFolder || '',
          // ข้อมูล site, space, storage จาก FileManager
          site: this.fileManager?.configs?.hostname || this.fileManager?.configs?.siteID || 'default',
          space: this.fileManager?.session?.current?.spaceId || this.fileManager?.configs?.spaceId || 'default',
          storage: this.fileManager?.session?.current?.storageId || this.fileManager?.configs?.storageId || null,
          owner: this.fileManager?.session?.current?._id || this.fileManager?.configs?.siteID || 'system'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }

      const result = await response.json();
      this.saveSessionToStorage();
      return result;

    } catch (error) {
      console.error('❌ Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Create high-quality recording options for complete MP4 segments
   */
  getHighQualityRecordingOptions() {
    const supportedMimeTypes = [
      'video/mp4;codecs=h264,aac',      // MP4 H.264 - best for complete files
      'video/mp4',                      // MP4 basic
      'video/webm;codecs=vp9,opus',     // VP9 fallback
      'video/webm;codecs=vp8,opus',     // VP8 fallback
      'video/webm;codecs=h264,opus',    // H.264 in WebM
      'video/webm'                      // WebM fallback
    ];

    let selectedMimeType = 'video/mp4';
    for (const mimeType of supportedMimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType;
        break;
      }
    }

    console.log('🎥 Selected MIME type for complete chunks:', selectedMimeType);

    const options = {
      mimeType: selectedMimeType,
      videoBitsPerSecond: 8000000,     // 8 Mbps - very high quality
      audioBitsPerSecond: 128000,      // 128 kbps audio
    };

    try {
      if (selectedMimeType.includes('h264')) {
        options.videoBitsPerSecond = 10000000; // 10 Mbps for H.264
      } else if (selectedMimeType.includes('vp9')) {
        options.videoBitsPerSecond = 10000000; // 10 Mbps for VP9
      }
    } catch (error) {
      console.warn('Advanced codec options not supported:', error);
    }

    return options;
  }

  /**
   * Get high-resolution constraints for screen recording (compatible with getDisplayMedia)
   */
  getHighResolutionConstraints() {
    return {
      video: {
        width: { ideal: 1920 },      // 1080p ideal
        height: { ideal: 1080 },     // 1080p ideal  
        frameRate: { ideal: 30 },    // 30fps ideal
        aspectRatio: { ideal: 16/9 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
  }

  /**
   * Get file extension based on MIME type
   */
  getVideoFileExtension(mimeType = this.mediaRecorder?.mimeType) {
    if (!mimeType) return 'mp4';
    
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('ogg')) return 'ogg';
    
    return 'mp4';
  }

  /**
   * Start segment-based recording
   */
  async startRecording(stream, recordingOptions = {}) {
    if (!stream) {
      throw new Error('Recording stream is required');
    }
    
    if (!this.sessionId) {
      await this.createSession();
    }
    
    try {
      console.log('🔴 Starting segment-based recording with complete MP4 files...');
      
      this.recordingStream = stream;
      this.isRecording = true;
      this.currentSegmentIndex = 0;
      this.failedSegments = [];
      this.uploadedSegments = [];
      this.totalUploadedSize = 0;
      this.segmentRecordedData = [];
      
      this.updateSessionStatus('recording');
      
      const finalRecordingOptions = {
        ...this.getHighQualityRecordingOptions(),
        ...recordingOptions
      };
      
      console.log('🎥 Recording with high-quality settings:', finalRecordingOptions);
      
      this.startNewSegment(stream, finalRecordingOptions);
      
      const extension = this.getVideoFileExtension(finalRecordingOptions.mimeType);
      console.log(`📹 Chunk format: ${finalRecordingOptions.mimeType} → .${extension} complete files`);
      console.log('🎬 Output format: Complete MP4 chunks (no server conversion needed)');
      
      console.log('✅ Segment recording started:', {
        sessionId: this.sessionId,
        segmentDuration: this.segmentDurationMs + 'ms',
        recordingOptions: finalRecordingOptions
      });
      
      return this.sessionId;
      
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Start a new complete MP4 segment
   */
  startNewSegment(stream, recordingOptions) {
    this.mediaRecorder = new MediaRecorder(stream, recordingOptions);
    this.segmentRecordedData = [];
    this.segmentStartTime = Date.now();
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.segmentRecordedData.push(event.data);
      }
    };
    
    this.mediaRecorder.onstop = async () => {
      await this.finishCurrentSegment();
    };
    
    this.mediaRecorder.onerror = (event) => {
      console.error('❌ MediaRecorder error:', event.error);
      this.onUploadError(event.error);
    };
    
    this.mediaRecorder.start();
    this.scheduleNextSegment();
    
    console.log(`🎬 Started chunk ${this.currentSegmentIndex + 1}`);
  }

  /**
   * Schedule the next segment creation
   */
  scheduleNextSegment() {
    if (this.recordingInterval) {
      clearTimeout(this.recordingInterval);
    }
    
    this.recordingInterval = setTimeout(() => {
      if (this.isRecording) {
        this.mediaRecorder.stop();
      }
    }, this.segmentDurationMs);
  }

  /**
   * Finish current segment and start next one
   */
  async finishCurrentSegment() {
    if (this.segmentRecordedData.length === 0) {
      console.warn('⚠️ No data recorded for this chunk');
      return;
    }
    
    const segmentBlob = new Blob(this.segmentRecordedData, { 
      type: this.mediaRecorder.mimeType 
    });
    
    const segmentIndex = this.currentSegmentIndex;
    this.currentSegmentIndex++;
    
    console.log(`📁 Chunk ${segmentIndex + 1} completed: ${(segmentBlob.size / 1024 / 1024).toFixed(2)} MB`);
    
    this.uploadCompleteSegment(segmentBlob, segmentIndex);
    
    if (this.isRecording && this.recordingStream) {
      const finalRecordingOptions = {
        ...this.getHighQualityRecordingOptions()
      };
      this.startNewSegment(this.recordingStream, finalRecordingOptions);
    }
  }

  /**
   * Upload complete MP4 segment
   */
  async uploadCompleteSegment(segmentBlob, segmentIndex) {
    console.log(`📤 Uploading chunk ${segmentIndex + 1} (${Math.round(segmentBlob.size / 1024)}KB)...`);
    
    this.pendingUploads.add(segmentIndex);
    
    try {
      const result = await this.uploadSegmentToServer(segmentBlob, segmentIndex);
      
      this.pendingUploads.delete(segmentIndex);
      
      this.uploadedSegments.push({
        index: segmentIndex,
        size: segmentBlob.size,
        timestamp: Date.now(),
        result: result
      });
      
      this.totalUploadedSize += segmentBlob.size;
      
      this.onSegmentUploaded({
        index: segmentIndex,
        size: segmentBlob.size,
        totalUploaded: this.uploadedSegments.length,
        totalSize: this.totalUploadedSize
      });
      
      this.onProgressUpdate({
        uploaded: this.uploadedSegments.length,
        totalSize: this.totalUploadedSize
      });
      
      console.log(`✅ Chunk ${segmentIndex + 1} uploaded successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to upload chunk ${segmentIndex + 1}:`, error);
      
      this.pendingUploads.delete(segmentIndex);
      
      this.failedSegments.push({
        data: segmentBlob,
        index: segmentIndex,
        error: error.message,
        timestamp: Date.now()
      });
      
      this.onUploadError(error, segmentIndex);
    }
  }

  /**
   * Upload segment to server (using /chunk endpoint)
   */
  async uploadSegmentToServer(segmentBlob, segmentIndex) {
    const segmentData = {
      index: segmentIndex,
      size: segmentBlob.size,
      timestamp: Date.now(),
      duration: this.segmentDurationMs
    };

    if (this.simulateRealRequests) {
      try {
        const formData = new FormData();
        const extension = this.getVideoFileExtension();
        formData.append('chunk', segmentBlob, `chunk_${this.sessionId}_${segmentIndex}.${extension}`);
        formData.append('sessionId', this.sessionId);
        formData.append('chunkIndex', segmentIndex);
        formData.append('metadata', JSON.stringify(segmentData));
        formData.append('dummyMode', 'true');
        
        // เพิ่มข้อมูล site, space, storage
        if (this.preVideoFile) {
          formData.append('site', this.preVideoFile.site || 'default');
          formData.append('space', this.preVideoFile.space || 'default');
          formData.append('storage', this.preVideoFile.storageId || '');
          formData.append('filename', this.preVideoFile.filename || '');
        }
        
        console.log('📡 Sending real FormData request to:', `${this.mediaServerUrl}/recording/chunk`);
        
        const response = await fetch(`${this.mediaServerUrl}/recording/chunk`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        return result;

      } catch (fetchError) {
        console.log(`📡 Real chunk upload failed as expected (no server): ${fetchError.message}`);

        const extension = this.getVideoFileExtension();
        const result = await this.createDummyResponse({
          chunkIndex: segmentIndex,
          sessionId: this.sessionId,
          path: `/dummy/chunks/${this.sessionId}/chunk_${segmentIndex}.${extension}`,
          uploadedSize: segmentBlob.size,
          status: 'uploaded',
          note: 'Real HTTP request attempted but server not available'
        });
        
        return result;
      }
    }

    if (this.useDummyServer && !this.simulateRealRequests) {
      console.log(`📡 Uploading to dummy server: chunk ${segmentIndex}`);
      
      const extension = this.getVideoFileExtension();
      const result = await this.createDummyResponse({
        chunkIndex: segmentIndex,
        sessionId: this.sessionId,
        path: `/dummy/chunks/${this.sessionId}/chunk_${segmentIndex}.${extension}`,
        uploadedSize: segmentBlob.size,
        status: 'uploaded'
      });
      
      return result;
    }

    const formData = new FormData();
    const extension = this.getVideoFileExtension();
    formData.append('chunk', segmentBlob, `chunk_${this.sessionId}_${segmentIndex}.${extension}`);
    formData.append('sessionId', this.sessionId);
    formData.append('chunkIndex', segmentIndex);
    formData.append('metadata', JSON.stringify(segmentData));
    
    // เพิ่มข้อมูล site, space, storage
    if (this.preVideoFile) {
      formData.append('site', this.preVideoFile.site || 'default');
      formData.append('space', this.preVideoFile.space || 'default');
      formData.append('storage', this.preVideoFile.storageId || '');
      formData.append('filename', this.preVideoFile.filename || '');
    }
    
    const response = await fetch(`${this.mediaServerUrl}/recording/chunk`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Stop recording
   */
  async stopRecording() {
    if (!this.isRecording) {
      console.warn('⚠️ Recording is not active');
      return null;
    }

    console.log('⏹️ Stopping chunk recording...');
    this.isRecording = false;
    this.totalExpectedSegments = this.currentSegmentIndex;

    if (this.recordingInterval) {
      clearTimeout(this.recordingInterval);
      this.recordingInterval = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    try {
      await this.waitForAllUploads();
      const result = await this.finalizeSession();
      
      this.updateSessionStatus('completed');
      return result;
    } catch (error) {
      console.error('❌ Error during recording stop:', error);
      throw error;
    }
  }

  /**
   * Wait for all uploads to complete
   */
  async waitForAllUploads(maxWaitTime = 30000) {
    const startTime = Date.now();
    
    while (this.pendingUploads.size > 0) {
      if (Date.now() - startTime > maxWaitTime) {
        console.warn(`⚠️ Timeout waiting for uploads. Pending: ${this.pendingUploads.size}`);
        break;
      }
      
      console.log(`⏳ Waiting for ${this.pendingUploads.size} uploads to complete...`);
      await this.delay(500);
    }
    
    if (this.pendingUploads.size === 0) {
      console.log('✅ All uploads completed');
    }
  }

  /**
   * Finalize recording session
   */
  async finalizeSession() {
    const sessionData = {
      sessionId: this.sessionId,
      totalChunks: this.uploadedSegments.length,
      totalSize: this.totalUploadedSize,
      failedChunks: this.failedSegments.length,
      chunks: this.uploadedSegments.map(s => ({
        index: s.index,
        size: s.size,
        timestamp: s.timestamp
      })),
      timestamp: new Date().toISOString()
    };

    if (this.simulateRealRequests) {
      try {
        const response = await fetch(`${this.mediaServerUrl}/recording/finalize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...sessionData,
            outputFormat: 'mp4',
            dummyMode: true,
            // ข้อมูลไฟล์สำหรับอัปเดตในฐานข้อมูล
            site: this.preVideoFile?.site || 'default',
            space: this.preVideoFile?.space || 'default',
            storage: this.preVideoFile?.storageId || null,
            filename: this.preVideoFile?.filename || null
          })
        });
        
        console.log('📡 Real finalize request sent, response status:', response.status);
        console.log('🎬 Chunks are already complete MP4 files');
        
        if (!response.ok) {
          throw new Error(`Finalization failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        // อัปเดตไฟล์ในฐานข้อมูลหลังจาก finalize สำเร็จ
        if (result.finalVideoUrl) {
          await this.updateVideoFileInDatabase(
            result.finalVideoUrl, 
            sessionData.totalSize, 
            result.duration
          );
        }
        
        this.onSessionComplete(result);
        return result;
        
      } catch (fetchError) {
        console.log('📡 Real finalize request failed as expected (no server):', fetchError.message);
        
        const result = await this.createDummyResponse({
          sessionId: this.sessionId,
          status: 'completed',
          finalVideoUrl: `/dummy/final/${this.sessionId}_final.mp4`,
          totalChunks: sessionData.totalChunks,
          totalSizeMB: Math.round(sessionData.totalSize / 1024 / 1024 * 100) / 100,
          processingStatus: 'ready_for_download',
          message: 'Session completed - MP4 chunks ready',
          note: 'Real HTTP request attempted but server not available',
          chunkFormat: 'mp4',
          outputFormat: 'mp4',
          conversionNote: 'No conversion needed - chunks are already complete MP4 files'
        });
        
        // อัปเดตไฟล์ในฐานข้อมูลหลังจาก finalize สำเร็จ
        if (result.finalVideoUrl) {
          await this.updateVideoFileInDatabase(
            result.finalVideoUrl, 
            sessionData.totalSize, 
            result.duration
          );
        }
        
        this.onSessionComplete(result);
        return result;
      }
    }

    if (this.useDummyServer && !this.simulateRealRequests) {
      console.log('📡 Finalizing with dummy server:', sessionData);
      
      const result = await this.createDummyResponse({
        sessionId: this.sessionId,
        status: 'completed',
        finalVideoUrl: `/dummy/final/${this.sessionId}_final.mp4`,
        totalChunks: sessionData.totalChunks,
        totalSizeMB: Math.round(sessionData.totalSize / 1024 / 1024 * 100) / 100,
        processingStatus: 'ready_for_download',
        message: 'Session completed - MP4 chunks ready',
        chunkFormat: 'mp4',
        outputFormat: 'mp4'
      });
      
      this.onSessionComplete(result);
      return result;
    }
    
    const response = await fetch(`${this.mediaServerUrl}/recording/finalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...sessionData,
        outputFormat: 'mp4',
        // ข้อมูลไฟล์สำหรับอัปเดตในฐานข้อมูล
        site: this.preVideoFile?.site || 'default',
        space: this.preVideoFile?.space || 'default',
        storage: this.preVideoFile?.storageId || null,
        filename: this.preVideoFile?.filename || null
      })
    });
    
    if (!response.ok) {
      throw new Error(`Finalization failed: ${response.status}`);
    }
    
    const result = await response.json();
    this.onSessionComplete(result);
    return result;
  }

  /**
   * Update video file in database after recording completion
   */
  async updateVideoFileInDatabase(finalVideoUrl, actualSize, duration) {
    if (!this.preVideoFile || !this.preVideoFile.storageId) {
      console.warn('⚠️ No pre-video file info available for database update');
      return;
    }
    
    try {
      console.log('📝 Updating video file in database:', {
        storageId: this.preVideoFile.storageId,
        finalUrl: finalVideoUrl,
        actualSize: actualSize,
        duration: duration
      });
      
      const updatePayload = {
        data: {
          // อัปเดต path และ URL จริง
          path: finalVideoUrl,
          original: finalVideoUrl,
          url: finalVideoUrl,
          
          // อัปเดตขนาดจริงและข้อมูลเพิ่มเติม
          size: actualSize || this.totalUploadedSize,
          duration: duration,
          
          // อัปเดตสถานะการบันทึก
          recordingStatus: 'completed',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          
          // เพิ่มข้อมูลเทคนิค
          totalChunks: this.uploadedSegments.length,
          failedChunks: this.failedSegments.length,
          recordingDuration: duration,
          fileFormat: 'mp4',
          
          // ข้อมูล session
          sessionMetadata: {
            sessionId: this.sessionId,
            totalSegments: this.uploadedSegments.length,
            totalUploadedSize: this.totalUploadedSize,
            recordingStarted: this.recordingStartTime,
            recordingCompleted: new Date().toISOString()
          }
        },
        options: {}
      };
      
      let updateSuccess = false;
      
      // ลองอัปเดตผ่าน FileManager instance ก่อน
      if (typeof window !== 'undefined' && window.fileManagerInstance) {
        try {
          const result = await window.fileManagerInstance.$Request.PUT(
            `storage/${this.preVideoFile.storageId}`, 
            updatePayload, 
            window.fileManagerInstance.hostkey
          );
          
          if (result.status === 200) {
            updateSuccess = true;
            console.log('✅ Video file updated via FileManager API');
          }
        } catch (apiError) {
          console.warn('⚠️ Failed to update via FileManager API:', apiError);
        }
      }
      
      // Fallback: direct API call
      if (!updateSuccess) {
        try {
          const configs = (typeof window !== 'undefined' && window.storageManager) 
            ? window.storageManager.get('configs') 
            : null;
            
          const response = await fetch(`https://gateway.cloudrestfulapi.com/api/storage/${this.preVideoFile.storageId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': configs?.key || ''
            },
            body: JSON.stringify(updatePayload)
          });
          
          if (response.ok) {
            updateSuccess = true;
            console.log('✅ Video file updated via direct API');
          } else {
            console.warn('⚠️ Direct API update failed:', response.status);
          }
        } catch (fetchError) {
          console.warn('⚠️ Direct API call failed:', fetchError);
        }
      }
      
      if (updateSuccess) {
        // Refresh FileManager list ถ้าเป็นไปได้
        if (typeof window !== 'undefined' && window.fileManagerInstance && 
            typeof window.fileManagerInstance.refreshFiles === 'function') {
          try {
            await window.fileManagerInstance.refreshFiles();
            console.log('🔄 FileManager list refreshed');
          } catch (refreshError) {
            console.warn('⚠️ Failed to refresh FileManager:', refreshError);
          }
        }
        
        console.log('✅ Video file database update completed');
      } else {
        console.warn('⚠️ Failed to update video file in database');
      }
      
    } catch (error) {
      console.error('❌ Error updating video file in database:', error);
    }
  }

  /**
   * Create dummy response for testing
   */
  async createDummyResponse(data) {
    await this.delay(100); // Simulate network delay
    return {
      success: true,
      timestamp: new Date().toISOString(),
      ...data
    };
  }

  /**
   * Download dummy video for testing
   */
  downloadDummyVideo(filename) {
    console.log('📥 Downloading dummy video:', filename);
    
    // Create a dummy video blob (1 second of black video)
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    // Fill with black color
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some text
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Dummy MP4 Video', canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText(`Session: ${this.sessionId}`, canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText(`Chunks: ${this.uploadedSegments.length}`, canvas.width / 2, canvas.height / 2 + 150);
    
    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `dummy_recording_${this.sessionId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Dummy video downloaded:', a.download);
    });
  }

  /**
   * Utility methods
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  saveSessionToStorage() {
    try {
      const sessionData = {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        uploadedChunks: this.uploadedSegments.length,
        totalSize: this.totalUploadedSize
      };
      localStorage.setItem('videoRecordingSession', JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Failed to save session to storage:', error);
    }
  }

  updateSessionStatus(status) {
    try {
      const existingData = localStorage.getItem('videoRecordingSession');
      if (existingData) {
        const sessionData = JSON.parse(existingData);
        sessionData.status = status;
        sessionData.lastUpdated = Date.now();
        localStorage.setItem('videoRecordingSession', JSON.stringify(sessionData));
      }
    } catch (error) {
      console.warn('Failed to update session status:', error);
    }
  }

  static getStoredSession() {
    try {
      const sessionData = localStorage.getItem('videoRecordingSession');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.warn('Failed to get stored session:', error);
      return null;
    }
  }

  cleanup() {
    if (this.recordingInterval) {
      clearTimeout(this.recordingInterval);
    }
    
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
    
    if (this.recordingStream) {
      this.recordingStream.getTracks().forEach(track => track.stop());
      this.recordingStream = null;
    }
    
    this.isRecording = false;
    console.log('🧹 VideoSegmentManager cleaned up');
  }

  // Getter methods for status
  getStatus() {
    return {
      isRecording: this.isRecording,
      sessionId: this.sessionId,
      currentChunk: this.currentSegmentIndex,
      uploadedChunks: this.uploadedSegments.length,
      failedChunks: this.failedSegments.length,
      pendingUploads: this.pendingUploads.size,
      totalSize: this.totalUploadedSize
    };
  }
}

export default VideoSegmentManager;
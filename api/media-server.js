/**
 * FFmpeg Media Server API
 * จัดการ chunk-based video recording และ concatenation
 */

const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configuration
const CHUNKS_DIR = path.join(process.cwd(), 'temp/recording-chunks');
const OUTPUT_DIR = path.join(process.cwd(), 'temp/final-videos');
const MAX_CHUNK_SIZE = 100 * 1024 * 1024; // 100MB per chunk

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(CHUNKS_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log('📁 Media server directories ready');
  } catch (error) {
    console.error('❌ Failed to create directories:', error);
  }
}

ensureDirectories();

// Multer configuration for chunk uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const sessionId = req.body.sessionId;
    const sessionDir = path.join(CHUNKS_DIR, sessionId);
    
    // Create session directory
    fs.mkdir(sessionDir, { recursive: true })
      .then(() => cb(null, sessionDir))
      .catch(cb);
  },
  filename: function (req, file, cb) {
    const chunkIndex = req.body.chunkIndex;
    const sessionId = req.body.sessionId;
    cb(null, `chunk_${sessionId}_${chunkIndex}.webm`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: MAX_CHUNK_SIZE },
  fileFilter: function (req, file, cb) {
    // Accept video chunks only
    if (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only video chunks are allowed'));
    }
  }
});

// In-memory session storage (ใน production ควรใช้ database)
const activeSessions = new Map();

/**
 * Initialize new recording session
 */
router.post('/recording/init', async (req, res) => {
  try {
    const { sessionId, timestamp, userAgent } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    
    console.log('🆕 Initializing recording session:', sessionId);
    
    // Create session directory
    const sessionDir = path.join(CHUNKS_DIR, sessionId);
    await fs.mkdir(sessionDir, { recursive: true });
    
    // Store session info
    activeSessions.set(sessionId, {
      sessionId,
      createdAt: Date.now(),
      timestamp,
      userAgent,
      status: 'initialized',
      chunks: [],
      sessionDir
    });
    
    res.json({
      success: true,
      sessionId,
      message: 'Recording session initialized',
      serverTime: Date.now()
    });
    
  } catch (error) {
    console.error('❌ Session initialization error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Upload video chunk
 */
router.post('/recording/chunk', upload.single('chunk'), async (req, res) => {
  try {
    const { sessionId, chunkIndex, metadata } = req.body;
    const uploadedFile = req.file;
    
    if (!uploadedFile || !sessionId || chunkIndex === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`📦 Received chunk ${chunkIndex} for session ${sessionId}:`, {
      filename: uploadedFile.filename,
      size: uploadedFile.size,
      path: uploadedFile.path
    });
    
    // Get session
    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Parse metadata
    let chunkMetadata = {};
    try {
      chunkMetadata = metadata ? JSON.parse(metadata) : {};
    } catch (e) {
      console.warn('Failed to parse chunk metadata:', e);
    }
    
    // Add chunk info to session
    session.chunks.push({
      index: parseInt(chunkIndex),
      filename: uploadedFile.filename,
      path: uploadedFile.path,
      size: uploadedFile.size,
      uploadedAt: Date.now(),
      metadata: chunkMetadata
    });
    
    // Sort chunks by index
    session.chunks.sort((a, b) => a.index - b.index);
    
    // Update session status
    session.status = 'receiving_chunks';
    session.lastChunkAt = Date.now();
    
    res.json({
      success: true,
      chunkIndex: parseInt(chunkIndex),
      sessionId,
      path: uploadedFile.path,
      size: uploadedFile.size,
      totalChunks: session.chunks.length,
      message: `Chunk ${chunkIndex} uploaded successfully`
    });
    
  } catch (error) {
    console.error('❌ Chunk upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.warn('Failed to clean up file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * Finalize recording session and create final video
 */
router.post('/recording/finalize', async (req, res) => {
  try {
    const { sessionId, totalChunks, totalSize, chunks } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    
    console.log('🏁 Finalizing recording session:', sessionId);
    
    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Update session
    session.status = 'finalizing';
    session.totalChunks = totalChunks;
    session.totalSize = totalSize;
    session.finalizedAt = Date.now();
    
    // Start concatenation process
    const finalVideo = await concatenateChunks(session);
    
    // Update session with result
    session.status = 'completed';
    session.finalVideo = finalVideo;
    
    res.json({
      success: true,
      sessionId,
      finalVideo,
      totalChunks: session.chunks.length,
      message: 'Recording finalized and video created successfully'
    });
    
  } catch (error) {
    console.error('❌ Session finalization error:', error);
    
    // Update session status
    const session = activeSessions.get(req.body.sessionId);
    if (session) {
      session.status = 'error';
      session.error = error.message;
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * Concatenate chunks using FFmpeg
 */
async function concatenateChunks(session) {
  return new Promise(async (resolve, reject) => {
    try {
      const { sessionId, chunks } = session;
      
      console.log(`🎬 Starting FFmpeg concatenation for ${chunks.length} chunks...`);
      
      if (chunks.length === 0) {
        throw new Error('No chunks to concatenate');
      }
      
      // Sort chunks by index to ensure correct order
      const sortedChunks = chunks.sort((a, b) => a.index - b.index);
      
      // Create file list for FFmpeg concat
      const fileListPath = path.join(session.sessionDir, 'concat_list.txt');
      const fileListContent = sortedChunks
        .map(chunk => `file '${path.resolve(chunk.path)}'`)
        .join('\n');
      
      await fs.writeFile(fileListPath, fileListContent, 'utf8');
      
      // Output file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFilename = `recording_${sessionId}_${timestamp}.mp4`;
      const outputPath = path.join(OUTPUT_DIR, outputFilename);
      
      console.log('📝 FFmpeg concat list created:', fileListPath);
      console.log('🎯 Output path:', outputPath);
      
      // Run FFmpeg concatenation
      ffmpeg()
        .input(fileListPath)
        .inputOptions('-f', 'concat')
        .inputOptions('-safe', '0')
        .outputOptions('-c', 'copy') // Copy without re-encoding for speed
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('🚀 FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`⏳ FFmpeg progress: ${progress.percent?.toFixed(1) || 'N/A'}%`);
        })
        .on('end', async () => {
          try {
            console.log('✅ FFmpeg concatenation completed');
            
            // Get output file stats
            const stats = await fs.stat(outputPath);
            
            const result = {
              filename: outputFilename,
              path: outputPath,
              size: stats.size,
              sizeMB: Math.round(stats.size / 1024 / 1024 * 100) / 100,
              createdAt: Date.now(),
              totalChunks: sortedChunks.length,
              duration: await getVideoDuration(outputPath)
            };
            
            console.log('🎉 Final video created:', result);
            
            // Clean up chunk files (optional)
            try {
              await cleanupChunks(session);
            } catch (cleanupError) {
              console.warn('⚠️ Cleanup warning:', cleanupError.message);
            }
            
            resolve(result);
            
          } catch (error) {
            console.error('❌ Post-processing error:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('❌ FFmpeg error:', error);
          reject(error);
        })
        .run();
        
    } catch (error) {
      console.error('❌ Concatenation setup error:', error);
      reject(error);
    }
  });
}

/**
 * Get video duration using FFprobe
 */
function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.warn('⚠️ Failed to get video duration:', err.message);
        resolve('Unknown');
      } else {
        const duration = metadata.format.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    });
  });
}

/**
 * Clean up chunk files after successful concatenation
 */
async function cleanupChunks(session) {
  console.log('🧹 Cleaning up chunk files...');
  
  const cleanupPromises = session.chunks.map(async (chunk) => {
    try {
      await fs.unlink(chunk.path);
      console.log(`🗑️ Deleted chunk: ${chunk.filename}`);
    } catch (error) {
      console.warn(`⚠️ Failed to delete ${chunk.filename}:`, error.message);
    }
  });
  
  await Promise.allSettled(cleanupPromises);
  
  // Clean up session directory if empty
  try {
    const files = await fs.readdir(session.sessionDir);
    if (files.length <= 1) { // Only concat_list.txt might remain
      await fs.rmdir(session.sessionDir, { recursive: true });
      console.log(`🗑️ Deleted session directory: ${session.sessionDir}`);
    }
  } catch (error) {
    console.warn('⚠️ Failed to clean session directory:', error.message);
  }
}

/**
 * Get session status
 */
router.get('/recording/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    success: true,
    session: {
      sessionId: session.sessionId,
      status: session.status,
      chunks: session.chunks.length,
      createdAt: session.createdAt,
      lastChunkAt: session.lastChunkAt,
      finalizedAt: session.finalizedAt,
      finalVideo: session.finalVideo,
      error: session.error
    }
  });
});

/**
 * Download final video
 */
router.get('/recording/download/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);
    
    if (!session || !session.finalVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const videoPath = session.finalVideo.path;
    
    // Check if file exists
    try {
      await fs.access(videoPath);
    } catch (error) {
      return res.status(404).json({ error: 'Video file not found' });
    }
    
    // Set headers for download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${session.finalVideo.filename}"`);
    res.setHeader('Content-Length', session.finalVideo.size);
    
    // Stream file
    const fileStream = require('fs').createReadStream(videoPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * List all sessions (for debugging)
 */
router.get('/recording/sessions', (req, res) => {
  const sessions = Array.from(activeSessions.values()).map(session => ({
    sessionId: session.sessionId,
    status: session.status,
    chunks: session.chunks.length,
    createdAt: session.createdAt,
    finalVideo: session.finalVideo ? {
      filename: session.finalVideo.filename,
      sizeMB: session.finalVideo.sizeMB
    } : null
  }));
  
  res.json({
    success: true,
    sessions,
    total: sessions.length
  });
});

module.exports = router;
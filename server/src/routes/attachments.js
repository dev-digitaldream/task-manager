const express = require('express')
const multer = require('multer')
const cloudinaryService = require('../services/cloudinary')

const router = express.Router()

// Configure multer for temporary file storage
const upload = multer({
  dest: '/tmp/uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
})

// POST /api/attachments/:taskId - Upload attachment
router.post('/:taskId', upload.single('file'), async (req, res) => {
  try {
    const { taskId } = req.params
    const { uploaderId } = req.body

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    if (!uploaderId) {
      return res.status(400).json({ error: 'Uploader ID is required' })
    }

    // Upload to Cloudinary
    const cloudinaryResult = await cloudinaryService.uploadFile(req.file)

    // Save to database
    const attachment = await cloudinaryService.createAttachment(
      taskId,
      uploaderId,
      req.file,
      cloudinaryResult
    )

    // Emit socket event
    const io = req.app.get('io')
    io.emit('attachment:created', { taskId, attachment })

    res.status(201).json(attachment)
  } catch (error) {
    console.error('Error uploading attachment:', error)
    res.status(500).json({ error: 'Failed to upload attachment' })
  }
})

// GET /api/attachments/:taskId - Get task attachments
router.get('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params
    const attachments = await cloudinaryService.getTaskAttachments(taskId)
    res.json(attachments)
  } catch (error) {
    console.error('Error fetching attachments:', error)
    res.status(500).json({ error: 'Failed to fetch attachments' })
  }
})

// DELETE /api/attachments/file/:id - Delete attachment
router.delete('/file/:id', async (req, res) => {
  try {
    const { id } = req.params
    await cloudinaryService.deleteAttachment(id)

    // Emit socket event
    const io = req.app.get('io')
    io.emit('attachment:deleted', { attachmentId: id })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting attachment:', error)
    res.status(500).json({ error: 'Failed to delete attachment' })
  }
})

module.exports = router

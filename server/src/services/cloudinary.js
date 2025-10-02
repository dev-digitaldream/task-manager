const cloudinary = require('cloudinary').v2
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

class CloudinaryService {
  /**
   * Upload file to Cloudinary
   */
  async uploadFile(file, folder = 'todo-attachments') {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'auto', // auto-detect file type
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip']
      })

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw new Error('Failed to upload file to Cloudinary')
    }
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
      console.log(`Deleted file from Cloudinary: ${publicId}`)
    } catch (error) {
      console.error('Cloudinary deletion error:', error)
    }
  }

  /**
   * Create attachment record in database
   */
  async createAttachment(taskId, uploaderId, file, cloudinaryResult) {
    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        uploaderId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: cloudinaryResult.bytes,
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId
      },
      include: {
        uploader: {
          select: { id: true, name: true, avatar: true }
        }
      }
    })

    return attachment
  }

  /**
   * Delete attachment (both DB and Cloudinary)
   */
  async deleteAttachment(attachmentId) {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId }
    })

    if (!attachment) {
      throw new Error('Attachment not found')
    }

    // Delete from Cloudinary
    await this.deleteFile(attachment.publicId)

    // Delete from database
    await prisma.attachment.delete({
      where: { id: attachmentId }
    })

    return { success: true }
  }

  /**
   * Get attachments for a task
   */
  async getTaskAttachments(taskId) {
    return await prisma.attachment.findMany({
      where: { taskId },
      include: {
        uploader: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}

module.exports = new CloudinaryService()

import React, { useState, useCallback } from 'react'
import { Upload, File, X, Download, Trash2 } from 'lucide-react'

const FileUpload = ({ taskId, currentUserId, attachments = [], onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await uploadFile(files[0])
    }
  }, [taskId, currentUserId])

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      await uploadFile(files[0])
    }
  }

  const uploadFile = async (file) => {
    if (!file) return

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 10MB)')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('uploaderId', currentUserId)

    try {
      const response = await fetch(`/api/attachments/${taskId}`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const attachment = await response.json()
        onUploadComplete?.(attachment)
        setUploadProgress(100)
      } else {
        alert('Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (attachmentId) => {
    if (!confirm('Supprimer ce fichier ?')) return

    try {
      const response = await fetch(`/api/attachments/file/${attachmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onUploadComplete?.()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
        }`}
      >
        {uploading ? (
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Upload en cours... {uploadProgress}%
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Glissez un fichier ici ou{' '}
              <label className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                parcourez
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </label>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Maximum 10MB
            </p>
          </>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Fichiers joints ({attachments.length})
          </h4>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="h-5 w-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                    {attachment.fileName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatFileSize(attachment.fileSize)}</span>
                    <span>•</span>
                    <span>{attachment.uploader.avatar} {attachment.uploader.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Télécharger"
                >
                  <Download className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </a>
                {attachment.uploaderId === currentUserId && (
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-950 rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload

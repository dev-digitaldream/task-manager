import React, { useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

const CommentSection = ({ taskId, comments, currentUser, onAddComment }) => {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!newComment.trim()) return

    setIsSubmitting(true)
    
    try {
      await onAddComment(taskId, newComment.trim(), currentUser.id)
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
      {comments.length > 0 && (
        <div className="mb-4 space-y-3 max-h-40 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <span className="text-lg flex-shrink-0">{comment.author.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(parseISO(comment.createdAt), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-shrink-0">
          <span className="text-lg">{currentUser.avatar}</span>
        </div>
        
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isSubmitting}
          />
          
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-1"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
      
      {comments.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          <MessageCircle size={20} className="mx-auto mb-2 opacity-50" />
          <p>Aucun commentaire</p>
        </div>
      )}
    </div>
  )
}

export default CommentSection
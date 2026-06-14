import { useEffect, useRef, useState } from 'react'
import { X, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchConversationMessages,
  sendConversationMessage,
  markConversationRead
} from '../services/chatApi'

const ChatModal = ({
  isOpen,
  onClose,
  conversation,
  userType,
  authToken,
  onConversationUpdated
}) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  const counterpart =
    userType === 'student'
      ? conversation?.consultant
      : conversation?.student

  const loadMessages = async (silent = false) => {
    if (!conversation?.id || !authToken) return
    setLoading(true)
    try {
      const data = await fetchConversationMessages(authToken, conversation.id)
      setMessages(data.messages || [])
      await markConversationRead(authToken, conversation.id)
      onConversationUpdated?.()
    } catch (error) {
      console.error('Failed to load messages', error)
      if (error.status === 429) {
        !silent && toast.error('Too many chat requests. Please wait a moment.')
      } else if (!silent) {
        toast.error(error.message || 'Failed to load messages')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setMessages([])
      setInputValue('')
      return
    }

    loadMessages()
    const interval = setInterval(() => loadMessages(true), 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, conversation?.id, authToken])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !conversation?.id) return

    setSending(true)
    try {
      const data = await sendConversationMessage(
        authToken,
        conversation.id,
        inputValue.trim()
      )
      setMessages((prev) => [...prev, data.message])
      setInputValue('')
      onConversationUpdated?.()
    } catch (error) {
      console.error('Failed to send message', error)
      toast.error(error.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen || !conversation) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Chatting with</p>
            <h2 className="text-lg font-semibold text-gray-900">
              {userType === 'student'
                ? (counterpart?.agency_name || counterpart?.contact_person)
                : `${counterpart?.first_name || ''} ${counterpart?.last_name || ''}`.trim()}
            </h2>
            <p className="text-sm text-gray-500">
              {userType === 'student'
                ? counterpart?.contact_person
                : counterpart?.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_type === userType
              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMine
                        ? 'bg-primary-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">
                      {message.content}
                    </p>
                    <p
                      className={`text-[11px] mt-1 ${
                        isMine ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="border-t px-6 py-4">
          <div className="flex items-center space-x-3">
            <textarea
              rows={1}
              className="flex-1 border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending || !inputValue.trim()}
              className="inline-flex items-center justify-center bg-primary-500 text-white rounded-full h-12 w-12 hover:bg-primary-600 disabled:opacity-50"
            >
              {sending ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatModal



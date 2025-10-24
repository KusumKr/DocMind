"use client"

import React, { useState, useRef, useEffect, createContext, useContext } from "react"
import { Document, Page, pdfjs } from "react-pdf";
import { motion, AnimatePresence } from "framer-motion";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}

// Types
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: Citation[]
}

interface Citation {
  page: number
  text: string
}

interface PDFViewerRef {
  scrollToPage: (pageNumber: number) => void
}

// PDF Viewer Component
const PDFViewer = React.forwardRef<PDFViewerRef, { pdfFile: File | null }>(({ pdfFile }, ref) => {
  const { theme } = useTheme()
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setCurrentPage(1)
  }

  const scrollToPage = (pageNumber: number) => {
    const validPage = Math.max(1, Math.min(pageNumber, numPages))
    setCurrentPage(validPage)
  }

  React.useImperativeHandle(ref, () => ({
    scrollToPage,
  }))

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(numPages, prev + 1))
  }

  if (!pdfFile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center justify-center h-full ${
          theme === "light"
            ? "bg-gradient-to-br from-white via-gray-50 to-blue-50"
            : "bg-gradient-to-br from-[#0B0E14] via-[#0F1623] to-[#141A29]"
        }`}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          className="text-center"
        >
          <p className={`text-lg font-medium ${theme === "light" ? "text-gray-400" : "text-cyan-400/60"}`}>
            Upload a PDF to get started
          </p>
          <p className={`text-sm mt-2 ${theme === "light" ? "text-gray-300" : "text-purple-400/40"}`}>
            Your research companion awaits
          </p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div
      className={`flex flex-col h-full ${
        theme === "light"
          ? "bg-gradient-to-br from-white via-gray-50 to-blue-50"
          : "bg-gradient-to-br from-[#0B0E14] via-[#0F1623] to-[#141A29]"
      }`}
    >
      {/* PDF Navigation - Glass Effect */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex items-center justify-between px-4 py-3 border-b ${
          theme === "light"
            ? "border-white/20 bg-white/10 backdrop-blur-md"
            : "border-white/10 bg-white/5 backdrop-blur-xl"
        }`}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-3 py-1 text-sm font-medium rounded-lg transition ${
            theme === "light"
              ? "text-slate-700 bg-white/30 backdrop-blur-sm hover:bg-white/50 disabled:opacity-50"
              : "text-cyan-300 bg-white/5 border border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/50 disabled:opacity-30"
          }`}
        >
          ← Prev
        </motion.button>
        <span className={`text-sm font-medium ${theme === "light" ? "text-slate-600" : "text-cyan-300/70"}`}>
          Page {currentPage} of {numPages}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={currentPage === numPages}
          className={`px-3 py-1 text-sm font-medium rounded-lg transition ${
            theme === "light"
              ? "text-slate-700 bg-white/30 backdrop-blur-sm hover:bg-white/50 disabled:opacity-50"
              : "text-cyan-300 bg-white/5 border border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/50 disabled:opacity-30"
          }`}
        >
          Next →
        </motion.button>
      </motion.div>

      {/* PDF Display */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-auto flex items-center justify-center p-4 ${
          theme === "light"
            ? "bg-gradient-to-br from-white via-gray-50 to-blue-50"
            : "bg-gradient-to-br from-[#0B0E14] via-[#0F1623] to-[#141A29]"
        }`}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-2xl shadow-2xl ${
            theme === "light" ? "bg-white" : "bg-white/5 border border-white/10 backdrop-blur-lg"
          }`}
        >
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <p className={`p-8 ${theme === "light" ? "text-slate-500" : "text-cyan-300/50"}`}>Loading PDF...</p>
            }
            error={
              <p className={`p-8 ${theme === "light" ? "text-red-500" : "text-red-400/70"}`}>Failed to load PDF</p>
            }
          >
            <Page pageNumber={currentPage} width={400} renderTextLayer={true} renderAnnotationLayer={true} />
          </Document>
        </motion.div>
      </div>
    </div>
  )
})

PDFViewer.displayName = "PDFViewer"

// Chat Component
const ChatInterface: React.FC<{
  messages: Message[]
  onSendMessage: (message: string) => Promise<void>
  onCitationClick: (page: number) => void
  isLoading: boolean
  fileId: string | null
}> = ({ messages, onSendMessage, onCitationClick, isLoading, fileId }) => {
  const { theme } = useTheme()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !fileId || isLoading) return

    const message = input
    setInput("")
    await onSendMessage(message)
  }

  return (
    <div
      className={`flex flex-col h-full ${
        theme === "light"
          ? "bg-gradient-to-br from-white via-gray-50 to-blue-50"
          : "bg-gradient-to-br from-[#0F1623] via-[#141A29] to-[#0F1623]"
      }`}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center justify-center h-full ${
              theme === "light" ? "text-slate-400" : "text-cyan-400/40"
            }`}
          >
            <p className="text-center text-sm">Start a conversation about your document</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`max-w-xs px-4 py-3 rounded-2xl transition-all ${
                    msg.role === "user"
                      ? theme === "light"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl"
                        : "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-cyan-500/50"
                      : theme === "light"
                        ? "bg-white text-slate-900 shadow-md hover:shadow-lg border border-slate-100"
                        : "bg-white/5 text-cyan-100 border border-cyan-400/30 shadow-lg hover:shadow-cyan-500/30 backdrop-blur-lg"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.citations.map((citation, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onCitationClick(citation.page)}
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full transition ${
                            msg.role === "user"
                              ? theme === "light"
                                ? "bg-white/20 text-white hover:bg-white/30"
                                : "bg-white/10 text-white border border-white/30 hover:bg-white/20"
                              : theme === "light"
                                ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200"
                                : "bg-cyan-400/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-400/30 glow-citation"
                          }`}
                        >
                          Page {citation.page}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div
              className={`px-4 py-3 rounded-2xl ${
                theme === "light"
                  ? "bg-white text-slate-900 shadow-md border border-slate-100"
                  : "bg-white/5 text-cyan-100 border border-cyan-400/30 shadow-lg backdrop-blur-lg"
              }`}
            >
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                className="text-sm"
              >
                Thinking...
              </motion.p>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar - Sticky */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`border-t p-4 sticky bottom-0 ${
          theme === "light"
            ? "border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-lg"
            : "border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-cyan-500/10"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your document..."
            disabled={!fileId || isLoading}
            className={`flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition ${
              theme === "light"
                ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100"
                : "border-cyan-400/30 bg-white/5 text-cyan-100 placeholder-cyan-400/40 focus:ring-cyan-400/50 focus:border-cyan-400/50 disabled:bg-white/5 backdrop-blur-lg"
            }`}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!fileId || isLoading || !input.trim()}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition ${
              theme === "light"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-300 shadow-md hover:shadow-lg"
                : "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 shadow-lg hover:shadow-cyan-500/50 glow-button"
            }`}
          >
            Ask
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

// Main Component
export default function DocMind() {
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [fileId, setFileId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const pdfViewerRef = useRef<PDFViewerRef>(null)

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "light"
    setTheme(savedTheme)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  setPdfFile(file)

  const formData = new FormData()
  formData.append("pdf", file) // ← Changed from "file" to "pdf"

  try {
    // ← Changed endpoint to match backend
    const response = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      const data = await response.json()
      setFileId(data.documentId) // ← Changed from fileId to documentId
      setMessages([])
      alert(`PDF uploaded successfully! ${data.numPages} pages processed.`)
    } else {
      const error = await response.json()
      alert(`Failed to upload PDF: ${error.error}`)
    }
  } catch (error) {
    console.error("Upload error:", error)
    alert("Error uploading PDF. Make sure backend is running on port 5000")
  }
}

 const handleSendMessage = async (question: string) => {
  if (!fileId) return

  const userMessage: Message = {
    id: Date.now().toString(),
    role: "user",
    content: question,
  }
  setMessages((prev) => [...prev, userMessage])

  setIsLoading(true)

  try {
    // ← Changed endpoint to match backend
    const response = await fetch("http://localhost:5000/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        question, 
        documentId: fileId // ← Changed from fileId to documentId
      }),
    })

    if (response.ok) {
      const data = await response.json()

      // Parse citations from backend response
      const citations: Citation[] = (data.citations || []).map((c: any) => ({
        page: c.page,
        text: c.snippet || c.text || ""
      }))

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        citations,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } else {
      const error = await response.json()
      alert(`Failed to get response: ${error.error}`)
    }
  } catch (error) {
    console.error("Query error:", error)
    alert("Error querying PDF. Make sure backend is running.")
  } finally {
    setIsLoading(false)
  }
}

  const handleCitationClick = (page: number) => {
    pdfViewerRef.current?.scrollToPage(page)
  }

  if (!mounted) return null

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        className={`flex flex-col h-screen ${
          theme === "light"
            ? "bg-gradient-to-br from-white via-gray-50 to-blue-50"
            : "bg-gradient-to-br from-[#0B0E14] to-[#141A29]"
        }`}
      >
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`px-6 py-4 flex items-center justify-between sticky top-0 z-10 ${
            theme === "light"
              ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-lg"
              : "bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-cyan-500/10"
          }`}
        >
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <h1
              className={`text-4xl font-bold ${
                theme === "light"
                  ? "text-white drop-shadow-lg"
                  : "bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
              }`}
            >
              DocMind - 
            </h1>
            <p className={`text-2xl font-bold ${theme === "dark" ? "text-white/70" : "text-cyan-300/60"}`}>
              Intelligent Document Analysis
            </p>
          </motion.div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition ${
                theme === "light"
                  ? "bg-white/20 hover:bg-white/30 text-white"
                  : "bg-white/5 border border-cyan-400/30 hover:bg-cyan-400/10 text-cyan-300"
              }`}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </motion.button>

            {/* Upload Button */}
            <motion.label
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 rounded-full cursor-pointer transition font-semibold text-sm ${
                theme === "light"
                  ? "bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg hover:shadow-xl"
                  : "bg-gradient-to-r from-cyan-500 to-purple-600 text-white border border-cyan-400/50 hover:border-cyan-400 shadow-lg hover:shadow-cyan-500/50 glow-button"
              }`}
            >
              Upload PDF
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
            </motion.label>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: PDF Viewer (60%) */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`w-3/5 border-r ${theme === "light" ? "border-slate-200/50" : "border-white/10"}`}
          >
            <PDFViewer ref={pdfViewerRef} pdfFile={pdfFile} />
          </motion.div>

          {/* Right: Chat (40%) */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-2/5">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onCitationClick={handleCitationClick}
              isLoading={isLoading}
              fileId={fileId}
            />
          </motion.div>
        </div>
      </div>
    </ThemeContext.Provider>
  )
}

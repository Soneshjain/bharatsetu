"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Building2, Bot, User, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { getOrCreateSessionId } from "@/lib/utils"
import { BusinessProfile } from "./BusinessProfileForm"
import LeadCollectionForm from "./LeadCollectionForm"
import { posthog } from "@/lib/posthog"
// Use environment variables for configuration

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface ChatPageProps {
  businessProfile?: BusinessProfile
  onBack?: () => void
}

export default function ChatPage({ businessProfile, onBack }: ChatPageProps = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadFormShown, setLeadFormShown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sessionId = getOrCreateSessionId()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
    // Auto-focus input after messages update (especially after AI response)
    if (!isLoading && !showLeadForm) {
      inputRef.current?.focus()
    }
  }, [messages, isLoading, showLeadForm])

  useEffect(() => {
    // Add welcome message immediately
    const welcomeMessage: Message = {
      id: "welcome",
      content: `👋 **Hi! I'm your GrantSetu AI**

I help MSMEs discover government schemes & subsidies. What can I help you with today?`,
      isUser: false,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [])

  const shouldShowLeadForm = () => {
    const userMessages = messages.filter(msg => msg.isUser)
    const aiMessages = messages.filter(msg => !msg.isUser)
    
    // Only show after meaningful conversation about schemes
    const hasSchemeInfo = aiMessages.some(msg => 
      msg.content.toLowerCase().includes('scheme') && 
      msg.content.length > 200 && // Substantial response
      (msg.content.toLowerCase().includes('benefit') || 
       msg.content.toLowerCase().includes('incentive') ||
       msg.content.toLowerCase().includes('subsidy'))
    )
    
    return userMessages.length >= 5 && hasSchemeInfo && !leadFormShown
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Track user message sent
    posthog?.capture('chat_message_sent', {
      message_length: inputMessage.length,
      session_id: sessionId,
      message_count: messages.filter(m => m.isUser).length + 1,
    })

    try {
      const startTime = Date.now()
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId,
        },
        body: JSON.stringify({ query: inputMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        const responseTime = Date.now() - startTime
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])

        // Track AI response received
        posthog?.capture('chat_response_received', {
          response_length: data.response.length,
          response_time_ms: responseTime,
          session_id: sessionId,
        })
      } else {
        throw new Error("Failed to get response")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Track error
      posthog?.capture('chat_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        session_id: sessionId,
      })
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      
      // Check if we should show lead form after AI response
      setTimeout(() => {
        if (shouldShowLeadForm()) {
          setShowLeadForm(true)
          
          // Track lead form shown
          posthog?.capture('lead_form_shown', {
            session_id: sessionId,
            message_count: messages.length,
          })
        }
      }, 2000) // Show after 2 seconds delay
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleLeadSubmit = async (data: any) => {
    console.log("Lead data:", data)
    setShowLeadForm(false)
    setLeadFormShown(true)
    
    // Track lead submission
    posthog?.capture('lead_submitted', {
      session_id: sessionId,
      state: data.state,
      company_turnover: data.companyTurnover,
      message_count: messages.length,
      conversation_length: messages.map(m => m.content).join(' ').length,
    })
    
    // Identify user in PostHog
    posthog?.identify(sessionId, {
      name: data.name,
      phone: data.phone,
      state: data.state,
      company_turnover: data.companyTurnover,
    })
    
    // Send data to SheetDB API
    try {
      const leadData = {
        timestamp: new Date().toISOString(),
        name: data.name,
        phone: data.phone,
        state: data.state,
        company_turnover: data.companyTurnover,
        question: data.question,
        msme_registered: '', // Will be extracted from conversation
        sector: '', // Will be extracted from conversation
        business_type: '', // Will be extracted from conversation
        conversation_context: messages.map(m => `${m.isUser ? 'User' : 'AI'}: ${m.content}`).join(' | ')
      }

      // Get SheetDB URL from environment variable
      const SHEETDB_URL = process.env.NEXT_PUBLIC_SHEETDB_URL || 'https://sheetdb.io/api/v1/g3zex9jzcawob'
      
      const response = await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      })

      if (response.ok) {
        console.log('Lead data sent to SheetDB successfully')
        
        // Track successful lead save
        posthog?.capture('lead_saved_to_sheet', {
          session_id: sessionId,
        })
      } else {
        console.error('Failed to send lead data to SheetDB')
        
        // Track failed lead save
        posthog?.capture('lead_save_failed', {
          session_id: sessionId,
          error: 'SheetDB API error',
        })
      }
    } catch (error) {
      console.error('Error sending lead data:', error)
      
      // Track error
      posthog?.capture('lead_save_error', {
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
    
    // Add a thank you message
    const thankYouMessage: Message = {
      id: Date.now().toString(),
      content: "🙏 Thank you! I've received your details. Our team will contact you within 24 hours to discuss your personalized MSME roadmap. \n\nIs there anything else I can help you with regarding government schemes?",
      isUser: false,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, thankYouMessage])
  }

  const handleRequestCallBack = () => {
    setShowLeadForm(true)
  }

  const handleLeadSkip = () => {
    setShowLeadForm(false)
    setLeadFormShown(true)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: 'linear-gradient(135deg, #365314 0%, #166534 30%, #65a30d 70%, #4ade80 100%)',
      fontFamily: 'var(--ff-body)'
    }}>
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-green-200 shadow-lg" style={{ borderColor: 'rgba(101, 163, 13, 0.2)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="circular-avatar border-2" style={{ borderColor: '#65a30d' }}>
              <div className="flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #365314 0%, #166534 100%)' }}>
                <Bot className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="font-bold" style={{ 
                fontFamily: 'var(--ff-heading)', 
                fontSize: 'var(--fs-600)', 
                color: '#365314' 
              }}>GrantSetu AI</h1>
              <div style={{ 
                fontSize: 'var(--fs-300)', 
                color: '#6b7280',
                fontFamily: 'var(--ff-body)'
              }}>
                Your MSME Scheme Discovery Assistant
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start gap-3 ${
                  message.isUser ? "flex-row-reverse justify-start" : "flex-row justify-start"
                }`}
                style={{
                  maxWidth: message.isUser ? '85%' : '90%',
                  marginLeft: message.isUser ? 'auto' : '0',
                  marginRight: message.isUser ? '0' : 'auto'
                }}
              >
                <div
                  className={`circular-avatar small flex items-center justify-center ${
                    message.isUser
                      ? ""
                      : "border-2"
                  }`}
                  style={{
                    background: message.isUser 
                      ? 'linear-gradient(135deg, var(--clr-primary-light) 0%, var(--clr-primary) 100%)'
                      : 'var(--clr-white)',
                    borderColor: message.isUser ? 'transparent' : 'var(--clr-primary-light)'
                  }}
                >
                  {message.isUser ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div
                  className="chat-bubble"
                  style={{
                    backgroundColor: message.isUser 
                      ? 'linear-gradient(135deg, #365314 0%, #166534 100%)' 
                      : 'var(--clr-white)',
                    color: message.isUser 
                      ? 'white' 
                      : 'var(--clr-text-dark)',
                    padding: '12px 16px',
                    borderRadius: message.isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: message.isUser ? 'none' : '1px solid rgba(101, 163, 13, 0.2)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    maxWidth: '100%',
                    wordBreak: 'break-word'
                  }}
                >
                  <div style={{ fontFamily: 'var(--ff-body)', fontSize: '14px', lineHeight: '1.5' }}>
                    <ReactMarkdown
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => {
                          const text = String(children)
                          // Check if this paragraph contains the call back button text
                          if (text.includes("Request a Call Back") || text.includes("Yes, Request a Call Back")) {
                            const parts = text.split(/(\<button[^>]*\>.*?\<\/button\>)/g)
                            return (
                              <div style={{ margin: 0 }}>
                                {parts.map((part, index) => {
                                  if (part.includes("Request a Call Back")) {
                                    return (
                                      <button
                                        key={index}
                                        onClick={handleRequestCallBack}
                                        className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium mx-2 mt-2"
                                        style={{
                                          background: 'linear-gradient(135deg, var(--clr-secondary) 0%, #FF1744 100%)'
                                        }}
                                      >
                                        📞 Yes, Request a Call Back
                                      </button>
                                    )
                                  }
                                  return part
                                })}
                              </div>
                            )
                          }
                          return <div style={{ margin: 0 }}>{children}</div>
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    opacity: 0.6, 
                    marginTop: '8px',
                    color: message.isUser ? 'rgba(255,255,255,0.7)' : 'var(--clr-text-light)',
                    fontStyle: 'italic',
                    fontWeight: '300',
                    fontFamily: 'var(--ff-body)'
                  }}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="circular-avatar small border-2" style={{ borderColor: '#65a30d' }}>
                  <div className="flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #365314 0%, #166534 100%)' }}>
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div
                  className="chat-bubble"
                  style={{
                    backgroundColor: 'var(--clr-white)',
                    color: 'var(--clr-text-dark)',
                    padding: '12px 16px',
                    borderRadius: '18px 18px 18px 4px',
                    border: '1px solid rgba(101, 163, 13, 0.2)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    maxWidth: '100%'
                  }}
                >
                  <div className="flex items-center gap-2" style={{ fontFamily: 'var(--ff-body)', fontSize: '14px' }}>
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#365314' }} />
                    <span style={{ color: 'var(--clr-text-light)' }}>Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Minimal Chat Input */}
      <div className="relative">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Suggestion Pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              "Electricity Duty Reimbursement",
              "Stamp Duty Refund", 
              "Patent Filing Support",
              "Power Tariff Subsidy",
              "Quality Certifications",
              "PMEGP Scheme",
              "MUDRA Loan"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(suggestion)}
                className="px-3 py-1 text-sm rounded-full border transition-all hover:scale-105"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: '#65a30d',
                  color: '#365314',
                  fontFamily: 'var(--ff-body)',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Chat with GrantSetu AI about MSME schemes, loans, or your business..."
              className="w-full h-12 pr-14 border-2 shadow-lg"
              style={{
                backgroundColor: 'var(--clr-white)',
                borderColor: '#65a30d',
                color: 'var(--clr-text-dark)',
                fontFamily: 'var(--ff-body)',
                borderRadius: '24px',
                paddingLeft: '20px',
                paddingRight: '56px'
              }}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full text-white"
              style={{
                background: 'linear-gradient(135deg, #365314 0%, #166534 100%)',
                minWidth: '32px',
                minHeight: '32px'
              }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lead Collection Form */}
      {showLeadForm && (
        <LeadCollectionForm
          onSubmit={handleLeadSubmit}
          onSkip={handleLeadSkip}
        />
      )}
    </div>
  )
}

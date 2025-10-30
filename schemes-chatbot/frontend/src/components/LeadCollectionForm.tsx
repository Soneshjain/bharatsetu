"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X } from "lucide-react"

export interface LeadData {
  name: string
  phone: string
  state: string
  companyTurnover: string
  question: string
}

interface LeadCollectionFormProps {
  onSubmit: (data: LeadData) => void
  onSkip: () => void
}

export default function LeadCollectionForm({ onSubmit, onSkip }: LeadCollectionFormProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [state, setState] = useState("")
  const [companyTurnover, setCompanyTurnover] = useState("")
  const [question, setQuestion] = useState("")
  const [phoneError, setPhoneError] = useState("")

  // Indian phone number validation
  const validatePhone = (value: string): boolean => {
    // Remove all spaces and special characters except +
    const cleanPhone = value.replace(/[\s()-]/g, '')
    
    // Indian phone number patterns:
    // +919876543210 or 919876543210 or 9876543210
    const phonePattern = /^(\+91|91)?[6-9]\d{9}$/
    
    return phonePattern.test(cleanPhone)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhone(value)
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError("")
    }
  }

  const handlePhoneBlur = () => {
    if (phone && !validatePhone(phone)) {
      setPhoneError("Please enter a valid Indian phone number (10 digits starting with 6-9)")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate phone before submitting
    if (!validatePhone(phone)) {
      setPhoneError("Please enter a valid Indian phone number (10 digits starting with 6-9)")
      return
    }
    
    // Format phone with +91 if not already present
    let formattedPhone = phone.replace(/[\s()-]/g, '')
    if (!formattedPhone.startsWith('+91') && !formattedPhone.startsWith('91')) {
      formattedPhone = '+91' + formattedPhone
    } else if (formattedPhone.startsWith('91') && !formattedPhone.startsWith('+91')) {
      formattedPhone = '+' + formattedPhone
    }
    
    onSubmit({ name, phone: formattedPhone, state, companyTurnover, question })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white text-gray-900 shadow-lg border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold text-blue-700">🏛️ Get Personalized Guidance</CardTitle>
          <Button variant="ghost" size="icon" onClick={onSkip}>
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm text-gray-600 mb-4">
            Let's connect you with the right MSME schemes! Share your details for personalized recommendations.
          </CardDescription>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs font-medium text-gray-700">Your Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9 w-full bg-white border-gray-300 text-gray-900 text-xs placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            
            <div>
              <Label htmlFor="phone" className="text-xs font-medium text-gray-700">WhatsApp Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                required
                className={`h-9 w-full bg-white text-gray-900 text-xs placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400 ${
                  phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-400' : 'border-gray-300'
                }`}
              />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1">{phoneError}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="state" className="text-xs font-medium text-gray-700">State *</Label>
              <Input
                id="state"
                type="text"
                placeholder="e.g., Maharashtra, Delhi, Gujarat"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="h-9 w-full bg-white border-gray-300 text-gray-900 text-xs placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div>
              <Label htmlFor="turnover" className="text-xs font-medium text-gray-700">Company Annual Turnover *</Label>
              <RadioGroup value={companyTurnover} onValueChange={setCompanyTurnover} className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="under-50L" id="under-50L" />
                  <Label htmlFor="under-50L" className="text-xs">Under ₹50L</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50L-2Cr" id="50L-2Cr" />
                  <Label htmlFor="50L-2Cr" className="text-xs">₹50L - ₹2Cr</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2Cr-10Cr" id="2Cr-10Cr" />
                  <Label htmlFor="2Cr-10Cr" className="text-xs">₹2Cr - ₹10Cr</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="above-10Cr" id="above-10Cr" />
                  <Label htmlFor="above-10Cr" className="text-xs">Above ₹10Cr</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="question" className="text-xs font-medium text-gray-700">Your Question / Requirement *</Label>
              <Textarea
                id="question"
                placeholder="e.g., Need PMEGP loan for manufacturing, Export incentives for textiles, Working capital schemes..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                required
                className="w-full bg-white border-gray-300 text-gray-900 text-xs placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="flex justify-between gap-2">
              <Button type="button" variant="outline" onClick={onSkip} className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100">
                Maybe Later
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Get Guidance
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, MapPin, Users, TrendingUp, FileText } from "lucide-react"

export interface BusinessProfile {
  business_name: string
  business_type: string
  business_stage: string
  sector: string
  location: string
  annual_turnover: number
  employee_count: number
  age: number
  category: string
  export_potential: boolean
  business_description: string
}

interface BusinessProfileFormProps {
  onSubmit: (profile: BusinessProfile) => void
}

export default function BusinessProfileForm({ onSubmit }: BusinessProfileFormProps) {
  const [formData, setFormData] = useState<BusinessProfile>({
    business_name: "",
    business_type: "",
    business_stage: "",
    sector: "",
    location: "",
    annual_turnover: 0,
    employee_count: 0,
    age: 0,
    category: "",
    export_potential: false,
    business_description: ""
  })

  const handleInputChange = (field: keyof BusinessProfile, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border border-gray-200 bg-white/90">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-blue-700 flex items-center justify-center gap-2">
            <Building2 className="h-6 w-6" />
            Business Profile Setup
          </CardTitle>
          <CardDescription className="text-gray-600">
            Tell us about your business to get personalized government scheme recommendations
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name" className="text-sm font-medium text-gray-700">
                    Business Name
                  </Label>
                  <Input
                    id="business_name"
                    type="text"
                    placeholder="Enter your business name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange("business_name", e.target.value)}
                    required
                    className="h-9 w-full bg-white border-gray-300 text-gray-900 text-sm placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <Label htmlFor="business_type" className="text-sm font-medium text-gray-700">
                    Business Type
                  </Label>
                  <Select value={formData.business_type} onValueChange={(value) => handleInputChange("business_type", value)}>
                    <SelectTrigger className="h-9 w-full bg-white border-gray-300 text-gray-900 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="trading">Trading</SelectItem>
                      <SelectItem value="food_processing">Food Processing</SelectItem>
                      <SelectItem value="textiles">Textiles</SelectItem>
                      <SelectItem value="handicrafts">Handicrafts</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="business_stage" className="text-sm font-medium text-gray-700">
                    Business Stage
                  </Label>
                  <Select value={formData.business_stage} onValueChange={(value) => handleInputChange("business_stage", value)}>
                    <SelectTrigger className="h-9 w-full bg-white border-gray-300 text-gray-900 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Select business stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (0-2 years)</SelectItem>
                      <SelectItem value="new">New (2-5 years)</SelectItem>
                      <SelectItem value="early">Early Stage (5-10 years)</SelectItem>
                      <SelectItem value="established">Established (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sector" className="text-sm font-medium text-gray-700">
                    Sector
                  </Label>
                  <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                    <SelectTrigger className="h-9 w-full bg-white border-gray-300 text-gray-900 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="msme">MSME</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                      <SelectItem value="rural">Rural Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location and Scale */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Scale
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Business Location
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    required
                    className="h-9 w-full bg-white border-gray-300 text-gray-900 text-sm placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <Label htmlFor="annual_turnover" className="text-sm font-medium text-gray-700">
                    Annual Turnover (₹)
                  </Label>
                  <Input
                    id="annual_turnover"
                    type="number"
                    placeholder="Enter annual turnover"
                    value={formData.annual_turnover || ""}
                    onChange={(e) => handleInputChange("annual_turnover", parseInt(e.target.value) || 0)}
                    required
                    className="h-9 w-full bg-white border-gray-300 text-gray-900 text-sm placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <Label htmlFor="employee_count" className="text-sm font-medium text-gray-700">
                    Number of Employees
                  </Label>
                  <Input
                    id="employee_count"
                    type="number"
                    placeholder="Enter employee count"
                    value={formData.employee_count || ""}
                    onChange={(e) => handleInputChange("employee_count", parseInt(e.target.value) || 0)}
                    required
                    className="h-9 w-full bg-white border-gray-300 text-gray-900 text-sm placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                    Your Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age || ""}
                    onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)}
                    required
                    min="18"
                    max="65"
                    className="h-9 w-full bg-white border-gray-300 text-gray-900 text-sm placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Category and Export Potential */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Category & Opportunities
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Category
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="h-9 w-full bg-white border-gray-300 text-gray-900 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="sc">SC (Scheduled Caste)</SelectItem>
                      <SelectItem value="st">ST (Scheduled Tribe)</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="minority">Minority</SelectItem>
                      <SelectItem value="disabled">Persons with Disability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="export_potential" className="text-sm font-medium text-gray-700">
                    Export Potential
                  </Label>
                  <Select value={formData.export_potential.toString()} onValueChange={(value) => handleInputChange("export_potential", value === "true")}>
                    <SelectTrigger className="h-9 w-full bg-white border-gray-300 text-gray-900 focus:border-blue-400 focus:ring-blue-400">
                      <SelectValue placeholder="Do you have export potential?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes, I have export potential</SelectItem>
                      <SelectItem value="false">No, domestic market only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Business Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Business Description
              </h3>
              
              <div>
                <Label htmlFor="business_description" className="text-sm font-medium text-gray-700">
                  Describe your business and goals
                </Label>
                <Textarea
                  id="business_description"
                  placeholder="Tell us about your business, products/services, and what you hope to achieve..."
                  value={formData.business_description}
                  onChange={(e) => handleInputChange("business_description", e.target.value)}
                  rows={4}
                  className="w-full bg-white border-gray-300 text-gray-900 text-sm placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Get Scheme Recommendations
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center">
              Your information is secure and will only be used to provide relevant scheme recommendations.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

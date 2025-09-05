'use client'

import { useEffect } from 'react'

interface SEOData {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
}

export function useSEO(seoData: SEOData) {
  useEffect(() => {
    const updateMetaTag = (selector: string, attribute: string, value: string) => {
      const element = document.querySelector(selector) as HTMLMetaElement
      if (element) {
        element.setAttribute(attribute, value)
      }
    }

    const updateLinkTag = (selector: string, attribute: string, value: string) => {
      const element = document.querySelector(selector) as HTMLLinkElement
      if (element) {
        element.setAttribute(attribute, value)
      }
    }

    // Update document title
    if (seoData.title) {
      document.title = seoData.title
    }

    // Update meta tags
    if (seoData.description) {
      updateMetaTag('meta[name="description"]', 'content', seoData.description)
      updateMetaTag('meta[property="og:description"]', 'content', seoData.description)
      updateMetaTag('meta[name="twitter:description"]', 'content', seoData.description)
    }

    if (seoData.title) {
      updateMetaTag('meta[property="og:title"]', 'content', seoData.title)
      updateMetaTag('meta[name="twitter:title"]', 'content', seoData.title)
    }

    if (seoData.image) {
      updateMetaTag('meta[property="og:image"]', 'content', seoData.image)
      updateMetaTag('meta[name="twitter:image"]', 'content', seoData.image)
    }

    if (seoData.url) {
      updateMetaTag('meta[property="og:url"]', 'content', seoData.url)
      updateLinkTag('link[rel="canonical"]', 'href', seoData.url)
    }

    if (seoData.type) {
      updateMetaTag('meta[property="og:type"]', 'content', seoData.type)
    }

    if (seoData.keywords && seoData.keywords.length > 0) {
      updateMetaTag('meta[name="keywords"]', 'content', seoData.keywords.join(', '))
    }
  }, [seoData])
}

// Utility function to generate SEO-friendly URLs
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+/g, '') // Remove leading hyphens
    .replace(/-+$/g, '') // Remove trailing hyphens
}

// Utility function to truncate text for meta descriptions
export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

// Utility function to extract keywords from text
export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  // Remove common stop words and extract meaningful keywords
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))

  // Count word frequency
  const wordCount: Record<string, number> = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word)
}

// Utility function to generate alt text for images
export function generateAltText(imageName: string, context?: string): string {
  const baseName = imageName
    .replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
    .replace(/[-_]/g, ' ')
    .trim()

  if (context) {
    return `${baseName} - ${context}`
  }

  return baseName
}

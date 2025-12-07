import { Metadata } from 'next'
import JSONLD from './JSONLD'
import { generateMetadata, generateBreadcrumbSchema, generateOrganizationSchema } from '@/lib/seo-utils'

interface SEOPageProps {
  readonly title: string
  readonly description: string
  readonly keywords?: string[]
  readonly image?: string
  readonly url: string
  readonly type?: 'website' | 'article'
  readonly publishedTime?: Date
  readonly modifiedTime?: Date
  readonly section?: string
  readonly breadcrumbs?: { name: string; url: string }[]
  readonly jsonLD?: Record<string, unknown> | Record<string, unknown>[]
  readonly children?: React.ReactNode
}

export function SEOPage({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  section,
  breadcrumbs,
  jsonLD,
  children
}: SEOPageProps) {
  const schemas: Record<string, unknown>[] = [generateOrganizationSchema()]
  
  if (breadcrumbs && breadcrumbs.length > 1) {
    schemas.push(generateBreadcrumbSchema(breadcrumbs))
  }
  
  if (jsonLD) {
    if (Array.isArray(jsonLD)) {
      schemas.push(...jsonLD)
    } else {
      schemas.push(jsonLD)
    }
  }

  return (
    <>
      <JSONLD data={schemas} />
      {children}
    </>
  )
}

export function generateSEOMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  section
}: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url: string
  type?: 'website' | 'article'
  publishedTime?: Date
  modifiedTime?: Date
  section?: string
}): Metadata {
  return generateMetadata({
    title,
    description,
    keywords,
    image,
    url,
    type,
    publishedTime,
    modifiedTime,
    section
  })
}

export default SEOPage

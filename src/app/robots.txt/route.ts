import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://destinationkolkata.com'
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for polite crawling
Crawl-delay: 1

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /auth/
Disallow: /customer/

# Allow important static files
Allow: /images/
Allow: /logo*
Allow: /favicon*
Allow: /robots.txt
Allow: /sitemap.xml
Allow: /manifest.json

# SEO optimizations
Host: ${baseUrl.replace('https://', '').replace('http://', '')}
`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  })
}

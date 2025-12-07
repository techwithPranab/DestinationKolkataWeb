import Script from 'next/script'

interface JSONLDProps {
  readonly data: Record<string, unknown> | Record<string, unknown>[]
}

export default function JSONLD({ data }: JSONLDProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  )
}

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Jayakrishna Konda portfolio preview'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: 'linear-gradient(135deg, #07111f 0%, #111827 52%, #172554 100%)',
          color: '#f8fafc',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              color: '#fbbf24',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: '#f59e0b',
              }}
            />
            Portfolio
          </div>
          <div
            style={{
              color: '#93c5fd',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            jay739.dev
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              color: '#fbbf24',
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            ML/AI Engineer
          </div>
          <div
            style={{
              maxWidth: 920,
              fontSize: 82,
              lineHeight: 0.96,
              fontWeight: 900,
            }}
          >
            Jayakrishna Konda
          </div>
          <div
            style={{
              maxWidth: 980,
              color: '#cbd5e1',
              fontSize: 34,
              lineHeight: 1.25,
              fontWeight: 500,
            }}
          >
            Building production RAG pipelines, LLM systems, MLOps workflows,
            and self-hosted AI infrastructure.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18 }}>
          {['Production RAG', 'LLM Systems', 'MLOps and DevOps', 'Self-Hosted AI'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid rgba(251, 191, 36, 0.42)',
                borderRadius: 999,
                padding: '14px 22px',
                background: 'rgba(15, 23, 42, 0.72)',
                color: '#e5e7eb',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}

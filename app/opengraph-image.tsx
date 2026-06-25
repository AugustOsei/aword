import { ImageResponse } from 'next/og';

export const alt = 'Aword — five words a day, and what they mean.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TILES: { ch: string; bg: string; fg: string }[] = [
  { ch: 'A', bg: '#2fa86a', fg: '#ffffff' },
  { ch: 'W', bg: '#f5b72e', fg: '#5a3d00' },
  { ch: 'O', bg: '#2fa86a', fg: '#ffffff' },
  { ch: 'R', bg: '#2fa86a', fg: '#ffffff' },
  { ch: 'D', bg: '#d7d2c4', fg: '#20251f' },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FBFAF6',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', gap: 18 }}>
          {TILES.map((t, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 132,
                height: 132,
                borderRadius: 28,
                background: t.bg,
                color: t.fg,
                fontSize: 84,
                fontWeight: 800,
              }}
            >
              {t.ch}
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 56,
            fontSize: 46,
            fontWeight: 700,
            color: '#20251f',
          }}
        >
          Five words a day — and what they mean.
        </div>
        <div style={{ display: 'flex', marginTop: 18, fontSize: 28, color: '#6f6a5a' }}>
          A daily word game that teaches you something every day.
        </div>
      </div>
    ),
    { ...size }
  );
}

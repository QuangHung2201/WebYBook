import { useMemo } from 'react';
import { cn } from '../../../shared/utils/cn';
import './BookCover.css';

const PALETTES = [
  ['#f97316', '#9a3412'],
  ['#0f766e', '#134e4a'],
  ['#7c3aed', '#4c1d95'],
  ['#be123c', '#881337'],
  ['#0369a1', '#0c4a6e'],
  ['#b45309', '#78350f'],
  ['#15803d', '#14532d'],
  ['#4338ca', '#312e81'],
  ['#c026d3', '#701a75'],
  ['#475569', '#1e293b'],
];

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function wrapTitle(title, maxChars = 14, maxLines = 4) {
  const words = String(title || 'Sách hay').split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default function BookCover({ title = '', author = '', coverImage = '', className = '', eager = false }) {
  const src = useMemo(() => {
    if (coverImage) return coverImage;

    const [from, to] = PALETTES[hashString(title) % PALETTES.length];
    const lines = wrapTitle(title);
    const authorName = String(author || '').slice(0, 26);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#bg)"/>
      <circle cx="252" cy="58" r="74" fill="#ffffff" opacity="0.12"/>
      <circle cx="34" cy="346" r="96" fill="#ffffff" opacity="0.08"/>
      <rect x="22" y="22" width="256" height="356" rx="7" fill="none" stroke="#ffffff" stroke-opacity="0.34"/>
      <text x="150" y="82" text-anchor="middle" fill="#ffffff" opacity="0.8" font-family="Georgia, serif" font-size="12" letter-spacing="3">WEByBOOK</text>
      ${lines
        .map(
          (line, index) =>
            `<text x="150" y="${142 + index * 33}" text-anchor="middle" fill="#ffffff" font-family="Georgia, serif" font-size="24" font-weight="bold">${escapeXml(line)}</text>`,
        )
        .join('')}
      <line x1="96" y1="306" x2="204" y2="306" stroke="#ffffff" stroke-opacity="0.5"/>
      <text x="150" y="332" text-anchor="middle" fill="#ffffff" opacity="0.92" font-family="Arial, sans-serif" font-size="13">${escapeXml(authorName)}</text>
    </svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, [title, author, coverImage]);

  return (
    <img
      className={cn('book-cover', className)}
      src={src}
      alt={title ? `Bìa sách ${title}` : 'Bìa sách'}
      loading={eager ? 'eager' : 'lazy'}
    />
  );
}

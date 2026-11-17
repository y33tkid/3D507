/** Inline stroke icons (24×24 grid, 1.75 stroke, currentColor). */
import type { SVGProps } from 'react';

const paths = {
  play: 'M7 5v14l12-7z',
  pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  reverse: 'M9 7L4 12l5 5M4 12h11a5 5 0 0 0 0-10h-2',
  stepBack: 'M18 6v12L9 12zM6 6v12',
  stepFwd: 'M6 6v12l9-6zM18 6v12',
  reset: 'M4 12a8 8 0 1 0 2.3-5.6M4 4v5h5',
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
  panel: 'M4 5h16v14H4zM14 5v14',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5H5V6h5',
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const filled = name === 'play' || name === 'pause' || name === 'stepBack' || name === 'stepFwd';
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d={paths[name]} />
      {(name === 'stepBack' || name === 'stepFwd') && (
        <path
          d={name === 'stepBack' ? 'M6 6v12' : 'M18 6v12'}
          stroke="currentColor"
          strokeWidth={2}
        />
      )}
    </svg>
  );
}

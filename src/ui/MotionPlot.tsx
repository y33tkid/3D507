import { useEffect, useMemo, useRef } from 'react';
import { cycleFraction, getTheta, TAU } from '@/core/phase';
import type { MotionPlot as Plot } from '@/core/types';

const W = 300;
const H = 90;
const PAD = 6;
const SAMPLES = 240;

/** Output quantity over one driver cycle, with a live cursor driven by the clock. */
export function MotionPlot({ plot }: { plot: Plot }) {
  const cursor = useRef<SVGGElement>(null);

  const { path, min, max, yOf } = useMemo(() => {
    const vals = Array.from({ length: SAMPLES + 1 }, (_, i) => plot.sample((TAU * i) / SAMPLES));
    let lo = Math.min(...vals);
    let hi = Math.max(...vals);
    if (hi - lo < 1e-9) {
      lo -= 1;
      hi += 1;
    }
    const y = (v: number) => H - PAD - ((v - lo) / (hi - lo)) * (H - 2 * PAD);
    const d = vals
      .map((v, i) => `${i ? 'L' : 'M'}${((i / SAMPLES) * W).toFixed(1)},${y(v).toFixed(1)}`)
      .join('');
    return { path: d, min: lo, max: hi, yOf: y };
  }, [plot]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const theta = getTheta();
      const f = cycleFraction(theta);
      const x = f * W;
      // sample at the in-cycle angle so the cursor sits on the plotted curve
      const y = yOf(plot.sample(f * TAU));
      cursor.current?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [plot, yOf]);

  const digits = max - min >= 10 ? 0 : 2;
  const fmt = (v: number) => (Object.is(Math.round(v * 100) / 100, -0) ? 0 : v).toFixed(digits);

  return (
    <figure className="plot">
      <figcaption>
        {plot.label} <span className="muted">vs. input angle (one cycle)</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${plot.label} plotted over one cycle`}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={f * W} x2={f * W} y1={0} y2={H} className="plot-grid" />
        ))}
        <path d={path} className="plot-line" />
        <g ref={cursor}>
          <circle r={4} className="plot-dot" />
        </g>
      </svg>
      <div className="plot-axis">
        <span>0°</span>
        <span>
          {fmt(min)} … {fmt(max)} {plot.unit}
        </span>
        <span>360°</span>
      </div>
    </figure>
  );
}

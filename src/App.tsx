/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 20, 40);
  }, []);

  return (
    <main
      id="bannerstation-screen"
      className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 sm:p-6 gap-3 sm:gap-4"
    >
      <h1
        id="bannerstation-title"
        className="font-condensed text-center text-4xl font-extrabold uppercase tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-none"
      >
        BANNERSTATION
      </h1>

      <div
        id="bannerstation-square"
        className="aspect-square w-[min(88vw,calc(88vh-5rem))] bg-[#171717] rounded-none shrink-0 flex items-center justify-center"
      >
        <canvas
          id="pixel-canvas"
          ref={canvasRef}
          width={20}
          height={40}
          className="pixelated h-[82%] max-h-[82%] aspect-[20/40] bg-white rounded-none select-none"
        />
      </div>
    </main>
  );
}


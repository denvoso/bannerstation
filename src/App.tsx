/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

interface ColorOption {
  name: string;
  hex: string;
}

const COLORS: ColorOption[] = [
  { name: 'White', hex: '#F9FFFE' },
  { name: 'Orange', hex: '#F9801D' },
  { name: 'Magenta', hex: '#C74EBD' },
  { name: 'Light Blue', hex: '#3AB3DA' },
  { name: 'Yellow', hex: '#FED83D' },
  { name: 'Lime', hex: '#80C71F' },
  { name: 'Pink', hex: '#F38BAA' },
  { name: 'Gray', hex: '#474F52' },
  { name: 'Light Gray', hex: '#9D9D97' },
  { name: 'Cyan', hex: '#169C9C' },
  { name: 'Purple', hex: '#8932B8' },
  { name: 'Blue', hex: '#3C44AA' },
  { name: 'Brown', hex: '#835432' },
  { name: 'Green', hex: '#5E7C16' },
  { name: 'Red', hex: '#B02E26' },
  { name: 'Black', hex: '#1D1D21' },
];

export default function App() {
  const [currentColor, setCurrentColor] = useState<ColorOption>(COLORS[0]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Re-draw banner preview canvas when currentColor changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = currentColor.hex;
    ctx.fillRect(0, 0, 20, 40);
  }, [currentColor]);

  return (
    <main
      id="bannerstation-screen"
      className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 sm:p-6 gap-3 sm:gap-4 overflow-y-auto"
    >
      <h1
        id="bannerstation-title"
        className="font-condensed text-center text-4xl font-extrabold uppercase tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-none"
      >
        BANNERSTATION
      </h1>

      {/* Banner Preview Square */}
      <div
        id="bannerstation-square"
        className="aspect-square w-[min(88vw,calc(72vh-5rem))] max-w-[500px] bg-[#171717] rounded-none shrink-0 flex items-center justify-center"
      >
        <canvas
          id="pixel-canvas"
          ref={canvasRef}
          width={20}
          height={40}
          className="pixelated h-[82%] max-h-[82%] aspect-[20/40] rounded-none select-none"
        />
      </div>

      {/* Layers Panel (Outline Container) */}
      <section
        id="layers-panel"
        aria-label="Layers Panel"
        className="w-[min(88vw,calc(72vh-5rem))] max-w-[500px] h-auto border border-neutral-700 bg-transparent rounded-none p-2.5 sm:p-3 flex flex-col gap-2 shrink-0 transition-all"
      >
        {/* Base Color Layer Element (Filled) */}
        <div
          id="layer-base-color"
          className="h-12 sm:h-14 w-full bg-[#202020] rounded-none px-3 flex items-center gap-3 select-none"
        >
          {/* Color Square (toggles integrated dropdown choices) */}
          <button
            id="base-color-swatch"
            type="button"
            onClick={() => setIsSelectorOpen((prev) => !prev)}
            className="relative h-8 w-8 aspect-square rounded-none shrink-0 cursor-pointer border border-white/20 transition-transform active:scale-95"
            style={{ backgroundColor: currentColor.hex }}
            aria-label={`Current color: ${currentColor.name}. Click to toggle color choices.`}
            aria-expanded={isSelectorOpen}
          />

          {/* Layer Label with only current color name */}
          <div className="flex items-center gap-2">
            <span
              id="base-color-label"
              className="font-condensed font-bold tracking-wider text-sm sm:text-base text-white uppercase"
            >
              BASE COLOR
            </span>
            <span
              id="current-color-name"
              className="font-condensed font-bold tracking-wider text-sm sm:text-base text-neutral-400 uppercase"
            >
              &mdash; {currentColor.name}
            </span>
          </div>
        </div>

        {/* Integrated Dropdown Choices */}
        {isSelectorOpen && (
          <div
            id="color-selector-dropdown"
            className="w-full bg-[#181818] border border-neutral-800 rounded-none p-2.5 grid grid-cols-8 gap-2 select-none"
          >
            {COLORS.map((color) => (
              <button
                key={color.name}
                id={`color-choice-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => {
                  setCurrentColor(color);
                  setIsSelectorOpen(false);
                }}
                className={`aspect-square w-full rounded-none border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  currentColor.hex === color.hex
                    ? 'border-white ring-1 ring-white'
                    : 'border-transparent hover:border-white/40'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={color.name}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}




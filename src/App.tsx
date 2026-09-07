/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, type DragEvent, type TouchEvent } from 'react';
import { Download, Undo2, Redo2, Plus, Minus, GripVertical } from 'lucide-react';

interface ColorOption {
  name: string;
  hex: string;
}

interface PatternLayer {
  id: string;
  pattern: 'border';
  color: ColorOption;
}

interface BannerSnapshot {
  baseColor: ColorOption;
  layers: PatternLayer[];
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

const BLACK_COLOR = COLORS[15]; // #1D1D21

function renderBanner(canvas: HTMLCanvasElement, snapshot: BannerSnapshot) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Draw base color
  ctx.fillStyle = snapshot.baseColor.hex;
  ctx.fillRect(0, 0, 20, 40);

  // 2. Draw pattern layers sequentially
  for (const layer of snapshot.layers) {
    if (layer.pattern === 'border') {
      ctx.fillStyle = layer.color.hex;
      // 2px border on all 4 edges (exact Minecraft bordure)
      ctx.fillRect(0, 0, 20, 2); // Top
      ctx.fillRect(0, 38, 20, 2); // Bottom
      ctx.fillRect(0, 2, 2, 36); // Left
      ctx.fillRect(18, 2, 2, 36); // Right
    }
  }
}

export default function App() {
  const [history, setHistory] = useState<BannerSnapshot[]>([
    { baseColor: COLORS[0], layers: [] },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Active color dropdown: 'base' | layer.id | null
  const [activeColorDropdown, setActiveColorDropdown] = useState<string | null>(null);

  // Drag & drop state for reordering
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const touchDragRef = useRef<{ startIndex: number; currentIndex: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentSnapshot = history[historyIndex] || { baseColor: COLORS[0], layers: [] };
  const { baseColor, layers } = currentSnapshot;

  // Commit changes to undo/redo history
  const commitState = (nextSnapshot: BannerSnapshot) => {
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, nextSnapshot];
    });
    setHistoryIndex((prev) => prev + 1);
    setActiveColorDropdown(null);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setActiveColorDropdown(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setActiveColorDropdown(null);
    }
  };

  // Keyboard shortcut listener for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history.length]);

  // Re-render canvas preview on banner state changes
  useEffect(() => {
    if (!canvasRef.current) return;
    renderBanner(canvasRef.current, currentSnapshot);
  }, [currentSnapshot]);

  // Add layer handler (default border, black)
  const handleAddLayer = () => {
    if (layers.length >= 6) return;
    const newLayer: PatternLayer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      pattern: 'border',
      color: BLACK_COLOR,
    };
    commitState({
      baseColor,
      layers: [...layers, newLayer],
    });
  };

  // Delete layer handler
  const handleDeleteLayer = (id: string) => {
    commitState({
      baseColor,
      layers: layers.filter((l) => l.id !== id),
    });
  };

  // Change base color
  const handleSelectBaseColor = (color: ColorOption) => {
    commitState({
      baseColor: color,
      layers,
    });
  };

  // Change layer color
  const handleSelectLayerColor = (layerId: string, color: ColorOption) => {
    commitState({
      baseColor,
      layers: layers.map((l) => (l.id === layerId ? { ...l, color } : l)),
    });
  };

  // Desktop Drag & Drop
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (targetIdx: number) => {
    if (draggingIndex !== null && draggingIndex !== targetIdx) {
      const updated = [...layers];
      const [removed] = updated.splice(draggingIndex, 1);
      updated.splice(targetIdx, 0, removed);
      commitState({ baseColor, layers: updated });
    }
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  // Mobile Touch Drag
  const handleTouchStart = (index: number) => {
    touchDragRef.current = { startIndex: index, currentIndex: index };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchDragRef.current) return;
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const layerElem = elem?.closest('[data-layer-index]');
    if (layerElem) {
      const targetIndex = Number(layerElem.getAttribute('data-layer-index'));
      if (!isNaN(targetIndex)) {
        touchDragRef.current.currentIndex = targetIndex;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchDragRef.current) return;
    const { startIndex, currentIndex } = touchDragRef.current;
    touchDragRef.current = null;
    if (startIndex !== currentIndex) {
      const updated = [...layers];
      const [removed] = updated.splice(startIndex, 1);
      updated.splice(currentIndex, 0, removed);
      commitState({ baseColor, layers: updated });
    }
  };

  // Download exact 20x40 PNG
  const handleDownloadPng = () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 20;
    exportCanvas.height = 40;
    renderBanner(exportCanvas, currentSnapshot);

    const link = document.createElement('a');
    link.download = `banner_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const isMaxLayers = layers.length >= 6;

  return (
    <main
      id="bannerstation-screen"
      className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 sm:p-6 gap-3 sm:gap-4 overflow-y-auto"
    >
      {/* Header with Title and Undo / Redo / PNG controls */}
      <header
        id="bannerstation-header"
        className="w-[min(88vw,calc(72vh-5rem))] max-w-[500px] flex items-center justify-between gap-3"
      >
        <h1
          id="bannerstation-title"
          className="font-condensed text-left text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white leading-none"
        >
          BANNERSTATION
        </h1>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo Button */}
          <button
            id="undo-button"
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className="font-condensed font-bold tracking-wider text-xs sm:text-sm uppercase border border-neutral-700 hover:border-white text-white bg-[#171717] hover:bg-[#222222] transition-colors p-1.5 sm:px-2.5 sm:py-2 rounded-none flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:border-neutral-800"
            title="Undo"
            aria-label="Undo action"
          >
            <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Redo Button */}
          <button
            id="redo-button"
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            className="font-condensed font-bold tracking-wider text-xs sm:text-sm uppercase border border-neutral-700 hover:border-white text-white bg-[#171717] hover:bg-[#222222] transition-colors p-1.5 sm:px-2.5 sm:py-2 rounded-none flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:border-neutral-800"
            title="Redo"
            aria-label="Redo action"
          >
            <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* PNG Download Button */}
          <button
            id="download-png-button"
            type="button"
            onClick={handleDownloadPng}
            className="font-condensed font-bold tracking-wider text-xs sm:text-sm uppercase border border-neutral-700 hover:border-white text-white bg-[#171717] hover:bg-[#222222] transition-colors px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-none flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
            title="Download 20x40 PNG"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>PNG</span>
          </button>
        </div>
      </header>

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
        {/* Layer 0: Base Color Layer Element (Filled) */}
        <div className="flex flex-col gap-2">
          <div
            id="layer-base-color"
            className="h-12 sm:h-14 w-full bg-[#202020] rounded-none px-3 flex items-center gap-3 select-none"
          >
            {/* Color Square */}
            <button
              id="base-color-swatch"
              type="button"
              onClick={() =>
                setActiveColorDropdown((prev) => (prev === 'base' ? null : 'base'))
              }
              className="relative h-8 w-8 aspect-square rounded-none shrink-0 cursor-pointer border border-white/20 transition-transform active:scale-95"
              style={{ backgroundColor: baseColor.hex }}
              aria-label={`Base color: ${baseColor.name}. Toggle palette.`}
              aria-expanded={activeColorDropdown === 'base'}
            />

            {/* Label with only current color name */}
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
                &mdash; {baseColor.name}
              </span>
            </div>
          </div>

          {/* Integrated Dropdown for Base Color */}
          {activeColorDropdown === 'base' && (
            <div
              id="color-selector-dropdown-base"
              className="w-full bg-[#181818] border border-neutral-800 rounded-none p-2.5 grid grid-cols-8 gap-2 select-none"
            >
              {COLORS.map((color) => (
                <button
                  key={`base-${color.name}`}
                  id={`base-choice-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => handleSelectBaseColor(color)}
                  className={`aspect-square w-full rounded-none border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    baseColor.hex === color.hex
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
        </div>

        {/* Added Pattern Layers */}
        {layers.map((layer, index) => {
          const isDraggingThis = draggingIndex === index;
          const isOverThis = dragOverIndex === index;

          return (
            <div
              key={layer.id}
              data-layer-index={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                setDraggingIndex(null);
                setDragOverIndex(null);
              }}
              className={`flex flex-col gap-2 transition-all ${
                isDraggingThis ? 'opacity-40' : 'opacity-100'
              } ${isOverThis ? 'border-t-2 border-white' : ''}`}
            >
              <div
                id={`layer-${layer.id}`}
                className="h-12 sm:h-14 w-full bg-[#202020] rounded-none px-3 flex items-center justify-between gap-2 select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Square 1: Color Square */}
                  <button
                    id={`layer-color-${layer.id}`}
                    type="button"
                    onClick={() =>
                      setActiveColorDropdown((prev) =>
                        prev === layer.id ? null : layer.id
                      )
                    }
                    className="relative h-8 w-8 aspect-square rounded-none shrink-0 cursor-pointer border border-white/20 transition-transform active:scale-95"
                    style={{ backgroundColor: layer.color.hex }}
                    aria-label={`Layer color: ${layer.color.name}. Toggle palette.`}
                    aria-expanded={activeColorDropdown === layer.id}
                  />

                  {/* Square 2: Pattern Square (Border) */}
                  <div
                    id={`layer-pattern-${layer.id}`}
                    className="relative h-8 w-8 aspect-square rounded-none shrink-0 border border-white/20 bg-[#121212] flex items-center justify-center p-1 select-none"
                    title="Pattern: Border"
                  >
                    <div className="h-full aspect-[20/40] border-[2px] border-white bg-neutral-800 rounded-none" />
                  </div>

                  {/* Layer Label with only current color name */}
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="font-condensed font-bold tracking-wider text-sm sm:text-base text-white uppercase shrink-0">
                      BORDER
                    </span>
                    <span className="font-condensed font-bold tracking-wider text-sm sm:text-base text-neutral-400 uppercase truncate">
                      &mdash; {layer.color.name}
                    </span>
                  </div>
                </div>

                {/* Right controls: Order (drag) icon and Minus (delete) icon */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Order / Drag Icon */}
                  <div
                    id={`drag-handle-${layer.id}`}
                    onTouchStart={() => handleTouchStart(index)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="p-1.5 text-neutral-400 hover:text-white cursor-grab active:cursor-grabbing touch-none select-none transition-colors"
                    title="Drag to reorder"
                    aria-label="Drag layer to reorder"
                  >
                    <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  {/* Minus / Delete Icon */}
                  <button
                    id={`delete-layer-${layer.id}`}
                    type="button"
                    onClick={() => handleDeleteLayer(layer.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 cursor-pointer select-none transition-colors active:scale-90"
                    title="Delete layer"
                    aria-label="Delete layer"
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Integrated Dropdown for this Layer */}
              {activeColorDropdown === layer.id && (
                <div
                  id={`color-selector-dropdown-${layer.id}`}
                  className="w-full bg-[#181818] border border-neutral-800 rounded-none p-2.5 grid grid-cols-8 gap-2 select-none"
                >
                  {COLORS.map((color) => (
                    <button
                      key={`${layer.id}-${color.name}`}
                      id={`choice-${layer.id}-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                      type="button"
                      onClick={() => handleSelectLayerColor(layer.id, color)}
                      className={`aspect-square w-full rounded-none border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                        layer.color.hex === color.hex
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
            </div>
          );
        })}

        {/* ADD LAYER Button-Layer */}
        <button
          id="add-layer-button"
          type="button"
          onClick={handleAddLayer}
          disabled={isMaxLayers}
          className={`h-12 sm:h-14 w-full rounded-none px-4 flex items-center justify-center gap-2 font-condensed font-bold tracking-wider text-sm sm:text-base uppercase transition-all select-none ${
            isMaxLayers
              ? 'opacity-30 cursor-not-allowed bg-[#181818] border border-neutral-800 text-neutral-500'
              : 'bg-[#202020] hover:bg-[#282828] text-white border border-dashed border-neutral-700 hover:border-neutral-500 cursor-pointer active:scale-98'
          }`}
          title={isMaxLayers ? 'Maximum 6 added layers reached' : 'Add layer'}
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>ADD LAYER</span>
        </button>
      </section>
    </main>
  );
}





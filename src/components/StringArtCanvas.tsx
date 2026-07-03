/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { ShapeType, DivisionLineType, RuleConfig, Point, Line } from '../types';
import { generatePoints, evaluateRule } from './ShapeUtils';
import { Play, Pause, RotateCcw, Download } from 'lucide-react';

interface StringArtCanvasProps {
  shape: ShapeType;
  N: number;
  divisionLine: DivisionLineType;
  rule1: RuleConfig;
  rule2: RuleConfig;
  manualLines: Line[];
  setManualLines: (lines: Line[] | ((prev: Line[]) => Line[])) => void;
  showNumbers: boolean;
  isManualMode: boolean;
  activeManualColor: string;
  activeManualThickness: number;
  studentName: string;
  schoolInfo: string;
}

export default function StringArtCanvas({
  shape,
  N,
  divisionLine,
  rule1,
  rule2,
  manualLines,
  setManualLines,
  showNumbers,
  isManualMode,
  activeManualColor,
  activeManualThickness,
  studentName,
  schoolInfo
}: StringArtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas size state
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  const [points, setPoints] = useState<Point[]>([]);
  
  // Selection state for manual mode
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Simulation / Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0); // 0 to N-1
  const [simulationSpeed, setSimulationSpeed] = useState<number>(30); // ms per line (10, 30, 100, 300)
  const [exportBg, setExportBg] = useState<'dark' | 'light' | 'navy' | 'black'>('light');

  // Sync points when shape or N or divisionLine or dimensions change
  useEffect(() => {
    const pts = generatePoints(shape, N, divisionLine, dimensions.width, dimensions.height);
    setPoints(pts);
    // Reset manual mode selection if points count changed
    setSelectedPointIndex(null);
  }, [shape, N, divisionLine, dimensions]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const size = Math.min(containerRef.current.clientWidth, 600);
        setDimensions({ width: size, height: size });
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Animation effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isPlaying) {
      intervalId = setInterval(() => {
        setSimulationProgress((prev) => {
          if (prev >= N - 1) {
            setIsPlaying(false);
            return N - 1;
          }
          return prev + 1;
        });
      }, simulationSpeed);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, N, simulationSpeed]);

  // Main canvas drawing function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Set background based on current mode
    let bgColor = '#0f172a';
    let isLight = exportBg === 'light';
    if (exportBg === 'light') bgColor = '#ffffff';
    else if (exportBg === 'navy') bgColor = '#0b1329';
    else if (exportBg === 'black') bgColor = '#000000';
    else bgColor = '#0f172a';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    // Draw grid coordinate system underneath if division lines are present
    if (divisionLine !== 'none') {
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(cx, cy) * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(dimensions.width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, dimensions.height);
      ctx.stroke();
    }

    // Draw shape guide border (faintly)
    ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(cx, cy, Math.min(cx, cy) * 0.8, 0, Math.PI * 2);
    } else {
      let sides = 3;
      if (shape === 'square') sides = 4;
      else if (shape === 'triangle') sides = 3;
      else if (shape === 'pentagon') sides = 5;
      else if (shape === 'hexagon') sides = 6;

      for (let i = 0; i <= sides; i++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / sides;
        const radius = Math.min(cx, cy) * 0.8;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // 1. Draw Rule 1 Pattern (Auto Simulation limits lines to simulationProgress if playing)
    if (rule1.enabled) {
      const limit = isPlaying ? simulationProgress : N - 1;
      ctx.strokeStyle = rule1.color;
      ctx.lineWidth = rule1.thickness;
      
      for (let i = 0; i <= limit; i++) {
        const target = evaluateRule(i, N, rule1);
        if (target !== null && target < points.length && i < points.length) {
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[target].x, points[target].y);
          ctx.stroke();
        }
      }
    }

    // 2. Draw Rule 2 Pattern (Auto Simulation limits lines to simulationProgress if playing)
    if (rule2.enabled) {
      const limit = isPlaying ? simulationProgress : N - 1;
      ctx.strokeStyle = rule2.color;
      ctx.lineWidth = rule2.thickness;
      
      for (let i = 0; i <= limit; i++) {
        const target = evaluateRule(i, N, rule2);
        if (target !== null && target < points.length && i < points.length) {
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[target].x, points[target].y);
          ctx.stroke();
        }
      }
    }

    // 3. Draw Manual lines
    manualLines.forEach((line) => {
      if (line.from < points.length && line.to < points.length) {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.thickness;
        ctx.beginPath();
        ctx.moveTo(points[line.from].x, points[line.from].y);
        ctx.lineTo(points[line.to].x, points[line.to].y);
        ctx.stroke();
      }
    });

    // 4. Draw Rubber-band line in Manual mode
    if (isManualMode && selectedPointIndex !== null && selectedPointIndex < points.length) {
      ctx.strokeStyle = activeManualColor;
      ctx.lineWidth = activeManualThickness;
      ctx.setLineDash([4, 4]); // Dashed guide
      ctx.beginPath();
      ctx.moveTo(points[selectedPointIndex].x, points[selectedPointIndex].y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash
    }

    // 5. Draw Points and Labels
    points.forEach((point, idx) => {
      const isSelected = isManualMode && selectedPointIndex === idx;
      const isHovered = isManualMode && hoveredPointIndex === idx;
      
      // Determine point style
      if (point.type === 'boundary') {
        ctx.fillStyle = isSelected 
          ? '#f43f5e' // glowing pink rose-500
          : isHovered 
            ? '#10b981' // emerald-500
            : '#38bdf8'; // sky-400
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, isSelected || isHovered ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow around point
        if (isSelected || isHovered) {
          ctx.fillStyle = isSelected ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Internal division points
        ctx.fillStyle = isSelected 
          ? '#f43f5e'
          : isHovered 
            ? '#10b981'
            : '#a78bfa'; // violet-400 for internal points
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, isSelected || isHovered ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Number / Index labels
      if (showNumbers) {
        // Find angle outwards from center to place text nicely
        const dx = point.x - cx;
        const dy = point.y - cy;
        const dist = Math.hypot(dx, dy);
        
        let textX = point.x;
        let textY = point.y;

        if (dist > 5) {
          // Push text outwards relative to the boundary
          const offset = point.type === 'boundary' ? 16 : 12;
          textX = point.x + (dx / dist) * offset;
          textY = point.y + (dy / dist) * offset;
        } else {
          // If at the center, place slightly above
          textY = point.y - 12;
        }

        ctx.fillStyle = isLight 
          ? (point.type === 'boundary' ? '#334155' : '#4f46e5')
          : (point.type === 'boundary' ? '#cbd5e1' : '#a78bfa'); // slate-700/indigo-600 vs slate-300/purple-400
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(point.label, textX, textY);
      }
    });

  }, [
    dimensions,
    points,
    shape,
    N,
    divisionLine,
    rule1,
    rule2,
    manualLines,
    isManualMode,
    selectedPointIndex,
    hoveredPointIndex,
    mousePos,
    showNumbers,
    isPlaying,
    simulationProgress,
    activeManualColor,
    activeManualThickness
  ]);

  // Canvas Mouse interaction handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (!isManualMode) {
      setHoveredPointIndex(null);
      return;
    }

    // Find closest point within threshold (15 pixels)
    let closestIdx: number | null = null;
    let minDist = 15;

    points.forEach((point, idx) => {
      const dist = Math.hypot(point.x - x, point.y - y);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    setHoveredPointIndex(closestIdx);
  };

  const handleMouseClick = () => {
    if (!isManualMode || hoveredPointIndex === null) return;

    if (selectedPointIndex === null) {
      // Step 1: Select start point
      setSelectedPointIndex(hoveredPointIndex);
    } else {
      // Step 2: Connect to end point
      if (selectedPointIndex !== hoveredPointIndex) {
        const newLine: Line = {
          from: selectedPointIndex,
          to: hoveredPointIndex,
          color: activeManualColor,
          thickness: activeManualThickness,
          isManual: true
        };
        setManualLines((prev) => [...prev, newLine]);
        
        // Continuous wrapping: make the selected destination point the new starting point!
        setSelectedPointIndex(hoveredPointIndex);
      } else {
        // Clicked same point: cancel start point selection
        setSelectedPointIndex(null);
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredPointIndex(null);
  };

  // Reset simulation or manual strings
  const handleResetSimulation = () => {
    setIsPlaying(false);
    setSimulationProgress(0);
  };

  const handleResetManual = () => {
    setManualLines([]);
    setSelectedPointIndex(null);
  };

  // Export beautiful High-Resolution Image (PNG) with customizable backgrounds!
  const handleExportImage = () => {
    const originalCanvas = canvasRef.current;
    if (!originalCanvas) return;

    // Create high-res offscreen canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 1600;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const scale = 1600 / dimensions.width;
    const cx = exportCanvas.width / 2;
    const cy = exportCanvas.height / 2;

    // Background color mapping
    let bgFill = '#0f172a'; // Deep slate
    if (exportBg === 'black') bgFill = '#000000';
    else if (exportBg === 'navy') bgFill = '#070f2b'; // Dark deep blue
    else if (exportBg === 'light') bgFill = '#fafafa'; // Warm light grey

    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Grid coordinates
    if (divisionLine !== 'none') {
      ctx.strokeStyle = exportBg === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(cx, cy) * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(exportCanvas.width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, exportCanvas.height);
      ctx.stroke();
    }

    // Shape guide border
    ctx.strokeStyle = exportBg === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(cx, cy, Math.min(cx, cy) * 0.8, 0, Math.PI * 2);
    } else {
      let sides = 4;
      if (shape === 'square') sides = 4;
      else if (shape === 'triangle') sides = 3;
      else if (shape === 'pentagon') sides = 5;
      else if (shape === 'hexagon') sides = 6;

      for (let i = 0; i <= sides; i++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / sides;
        const radius = Math.min(cx, cy) * 0.8;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // High-res draw of points
    const highResPoints = generatePoints(shape, N, divisionLine, exportCanvas.width, exportCanvas.height);

    // Draw lines
    if (rule1.enabled) {
      ctx.strokeStyle = rule1.color;
      ctx.lineWidth = rule1.thickness * scale * 0.8;
      for (let i = 0; i < N; i++) {
        const target = evaluateRule(i, N, rule1);
        if (target !== null && target < highResPoints.length) {
          ctx.beginPath();
          ctx.moveTo(highResPoints[i].x, highResPoints[i].y);
          ctx.lineTo(highResPoints[target].x, highResPoints[target].y);
          ctx.stroke();
        }
      }
    }

    if (rule2.enabled) {
      ctx.strokeStyle = rule2.color;
      ctx.lineWidth = rule2.thickness * scale * 0.8;
      for (let i = 0; i < N; i++) {
        const target = evaluateRule(i, N, rule2);
        if (target !== null && target < highResPoints.length) {
          ctx.beginPath();
          ctx.moveTo(highResPoints[i].x, highResPoints[i].y);
          ctx.lineTo(highResPoints[target].x, highResPoints[target].y);
          ctx.stroke();
        }
      }
    }

    manualLines.forEach((line) => {
      if (line.from < highResPoints.length && line.to < highResPoints.length) {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.thickness * scale * 0.8;
        ctx.beginPath();
        ctx.moveTo(highResPoints[line.from].x, highResPoints[line.from].y);
        ctx.lineTo(highResPoints[line.to].x, highResPoints[line.to].y);
        ctx.stroke();
      }
    });

    // Draw glowing points
    highResPoints.forEach((point) => {
      if (point.type === 'boundary') {
        ctx.fillStyle = exportBg === 'light' ? '#0ea5e9' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = exportBg === 'light' ? '#7c3aed' : '#a78bfa';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      if (showNumbers) {
        const dx = point.x - cx;
        const dy = point.y - cy;
        const dist = Math.hypot(dx, dy);
        let textX = point.x;
        let textY = point.y;

        if (dist > 5) {
          const offset = point.type === 'boundary' ? 16 * scale : 12 * scale;
          textX = point.x + (dx / dist) * offset;
          textY = point.y + (dy / dist) * offset;
        } else {
          textY = point.y - 12 * scale;
        }

        ctx.fillStyle = exportBg === 'light' ? '#4b5563' : '#e2e8f0';
        ctx.font = `bold ${10 * scale}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(point.label, textX, textY);
      }
    });

    // Elegant Watermark banner at the bottom
    ctx.fillStyle = exportBg === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)';
    ctx.fillRect(0, 1480, 1600, 120);

    ctx.fillStyle = exportBg === 'light' ? '#1f2937' : '#f8fafc';
    ctx.font = 'bold 32px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('📐 스트링아트 수학 실험실 (String Art Math Lab)', 60, 1540);

    // Author info
    const authorText = `작성자: ${studentName || '나의 스트링아트'} ${schoolInfo ? `(${schoolInfo})` : ''}`;
    ctx.fillStyle = exportBg === 'light' ? '#6b7280' : '#94a3b8';
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(authorText, 1540, 1540);

    // Save
    const dataURL = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${studentName || 'string-art'}-${shape}-${N}등분.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-3xl p-6 border border-slate-200 shadow-md w-full">
      <div className="flex justify-between items-center w-full mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-slate-800 font-extrabold text-sm">
            {isManualMode ? '🎨 수동 실 감기 모드' : '📐 자동 규칙 모드'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isManualMode && selectedPointIndex !== null && (
            <button
              onClick={() => setSelectedPointIndex(null)}
              className="text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-200 hover:bg-rose-100 transition-colors font-bold"
            >
              실 감기 시작점 끊기
            </button>
          )}
          <span className="text-slate-500 text-xs font-mono font-semibold">
            {isManualMode 
              ? `연결점: ${selectedPointIndex !== null ? points[selectedPointIndex]?.label : '없음'}`
              : `시뮬레이션 진행: ${simulationProgress + 1}/${N}`}
          </span>
        </div>
      </div>

      {/* Main Canvas view */}
      <div 
        ref={containerRef} 
        className="relative flex items-center justify-center w-full aspect-square max-w-[500px] border-4 border-slate-100 bg-slate-50 shadow-inner rounded-3xl overflow-hidden cursor-crosshair"
      >
        <canvas
          id="string-art-canvas"
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onClick={handleMouseClick}
          onMouseLeave={handleMouseLeave}
          className="rounded-xl transition-all duration-300"
        />

        {/* Hover label for point numbers in Manual mode to guide kids */}
        {isManualMode && hoveredPointIndex !== null && points[hoveredPointIndex] && (
          <div 
            className="absolute bg-indigo-900/95 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-700 shadow-lg flex items-center gap-1.5 pointer-events-none"
            style={{
              left: `${points[hoveredPointIndex].x + 12}px`,
              top: `${points[hoveredPointIndex].y - 32}px`,
            }}
          >
            <span className="bg-indigo-800 px-1 py-0.5 rounded text-[10px] text-indigo-200">Point</span>
            <span>{points[hoveredPointIndex].label}번 점</span>
          </div>
        )}
      </div>

      {/* Controller Area */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
        {/* Playback Controls (Visible in Auto Mode) */}
        {!isManualMode && (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {!isPlaying ? (
              <button
                id="btn-play"
                onClick={() => {
                  if (simulationProgress >= N - 1) {
                    setSimulationProgress(0);
                  }
                  setIsPlaying(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all text-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>패턴 그리기</span>
              </button>
            ) : (
              <button
                id="btn-pause"
                onClick={() => setIsPlaying(false)}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-sm"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>일시정지</span>
              </button>
            )}

            <button
              id="btn-reset-sim"
              onClick={handleResetSimulation}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 py-2.5 px-3.5 rounded-xl border border-slate-200 shadow-sm transition-all text-sm"
              title="처음부터 다시 보기"
            >
              <RotateCcw className="w-4 h-4" />
              <span>다시보기</span>
            </button>

            {/* Speed Controller */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
              <span className="text-slate-500 px-2 font-bold">속도:</span>
              <button
                onClick={() => setSimulationSpeed(300)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  simulationSpeed === 300 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                느림
              </button>
              <button
                onClick={() => setSimulationSpeed(100)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  simulationSpeed === 100 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                보통
              </button>
              <button
                onClick={() => setSimulationSpeed(30)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  simulationSpeed === 30 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                빠름
              </button>
              <button
                onClick={() => setSimulationSpeed(10)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  simulationSpeed === 10 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                매우빠름
              </button>
            </div>
          </div>
        )}

        {/* Manual wrapping reset */}
        {isManualMode && (
          <button
            id="btn-reset-manual"
            onClick={handleResetManual}
            disabled={manualLines.length === 0}
            className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 disabled:hover:bg-rose-50 py-2.5 px-4 rounded-xl font-bold transition-all text-sm shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>실 풀기 (전체 삭제)</span>
          </button>
        )}

        {/* Export / Download panel */}
        <div className="flex flex-wrap items-center gap-2 ml-auto w-full md:w-auto justify-end">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-slate-500 px-2 font-bold">배경:</span>
            {(['dark', 'black', 'navy', 'light'] as const).map((bg) => (
              <button
                key={bg}
                onClick={() => setExportBg(bg)}
                className={`px-2 py-1 rounded-lg uppercase font-sans text-[10px] font-extrabold transition-all ${
                  exportBg === bg ? 'bg-white text-indigo-650 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {bg === 'dark' ? '어둠' : bg === 'black' ? '칠흑' : bg === 'navy' ? '네이비' : '밝음'}
              </button>
            ))}
          </div>

          <button
            id="btn-download"
            onClick={handleExportImage}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            <span>그림 다운로드</span>
          </button>
        </div>
      </div>
    </div>
  );
}

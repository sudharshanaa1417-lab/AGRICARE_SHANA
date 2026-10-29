import React, { useEffect, useRef } from 'react';
import { RobotState } from '../types';

interface RobotCanvasProps {
  state: RobotState;
}

export const RobotCanvas: React.FC<RobotCanvasProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background: earthy farm field soil
    ctx.fillStyle = '#f4ede4';
    ctx.fillRect(0, 0, width, height);

    // Draw agricultural crop rows (horizontal furrows)
    const rowSpacing = 38;
    const numRows = Math.floor(height / rowSpacing);

    for (let i = 1; i < numRows; i++) {
      const y = i * rowSpacing;

      // Furrow path
      ctx.strokeStyle = '#e6dacf';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(25, y);
      ctx.lineTo(width - 25, y);
      ctx.stroke();

      // Crop plants (small green circles with leaves)
      for (let x = 40; x < width - 30; x += 32) {
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(x, y - 4, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(x + 2, y - 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Scale real-world coordinates (feet) to canvas pixels
    // Let 1 foot = 14 pixels
    const originX = 50;
    const originY = height / 2;
    const scale = 14;

    const currentCanvasX = originX + state.x_pos * scale;
    const currentCanvasY = originY - (state.y_pos - 10.0) * scale;

    // Draw breadcrumb path
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(currentCanvasX, currentCanvasY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Draw Start Marker
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(originX, originY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('START', originX - 14, originY + 16);

    // Draw Target 20ft Marker
    const targetCanvasX = originX + state.distance_target_ft * scale;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(targetCanvasX, originY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#991b1b';
    ctx.fillText(`${state.distance_target_ft}ft Goal`, targetCanvasX - 18, originY - 12);

    // Draw Robot Rover
    ctx.save();
    ctx.translate(currentCanvasX, currentCanvasY);
    // Heading in radians (0 deg = North, 90 deg = East)
    ctx.rotate((state.heading_deg - 90) * (Math.PI / 180));

    // Rover chassis body (Forest Green)
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.roundRect(-16, -20, 32, 40, 8);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#14532d';
    ctx.stroke();

    // Solar Panel on top
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(-11, -12, 22, 24, 4);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Solar Grid Lines
    ctx.strokeStyle = '#93c5fd';
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(11, 0);
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 12);
    ctx.stroke();

    // Wheel tracks (left & right)
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-20, -16, 4, 32);
    ctx.fillRect(16, -16, 4, 32);

    // Direction arrow / nose headlight
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(-5, 14);
    ctx.lineTo(5, 14);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Pulse radar ring around robot if moving
    if (state.status.includes('RUNNING') || state.status === 'MOVING') {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(currentCanvasX, currentCanvasY, 28, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [state]);

  return (
    <div className="w-full relative rounded-3xl overflow-hidden border border-forest-200/80 bg-[#f4ede4] shadow-inner">
      <canvas
        ref={canvasRef}
        width={720}
        height={320}
        className="w-full h-auto block"
      />
      {/* Overlay Status Pill */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-forest-200 shadow-xs flex items-center gap-2 text-xs font-bold text-forest-950">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            state.status.includes('RUNNING')
              ? 'bg-emerald-500 animate-ping'
              : state.status === 'EMERGENCY_STOP'
              ? 'bg-rose-500'
              : 'bg-amber-500'
          }`}
        />
        <span>State: {state.status.replace('_', ' ')}</span>
        <span className="text-gray-400">|</span>
        <span className="text-forest-700">Mode: {state.mode}</span>
      </div>

      {/* Distance Telemetry Pill */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl border border-forest-200 shadow-xs text-xs font-bold text-forest-950 flex items-center gap-3">
        <div>
          <span className="text-[10px] text-gray-500 block leading-tight">Distance Covered</span>
          <span className="text-sm font-mono text-forest-800">{state.distance_travelled_ft.toFixed(1)} ft</span>
        </div>
        <div className="border-l border-gray-200 pl-3">
          <span className="text-[10px] text-gray-500 block leading-tight">Heading</span>
          <span className="text-sm font-mono text-forest-800">{Math.round(state.heading_deg)}°</span>
        </div>
      </div>
    </div>
  );
};

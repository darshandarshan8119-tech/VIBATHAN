import React, { useEffect, useRef } from 'react';

export default function MerchantTrendGraph({ historicalPoints = [], forecastPoints = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || historicalPoints.length < 2 || forecastPoints.length < 1) return;
    const context = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = 150;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);
    context.clearRect(0, 0, width, height);

    const values = [...historicalPoints, ...forecastPoints].map((point) => Number(point.price));
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const padding = 16;
    const range = maximum - minimum || 1;
    const toPoint = (index, value, count) => ({
      x: padding + (index / (count - 1)) * (width - padding * 2),
      y: height - padding - ((value - minimum) / range) * (height - padding * 2),
    });
    const all = [...historicalPoints, ...forecastPoints];
    const split = historicalPoints.length - 1;
    context.strokeStyle = '#e2e8f0';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(padding, height / 2);
    context.lineTo(width - padding, height / 2);
    context.stroke();

    const drawSegment = (from, to, color, dashed = false) => {
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.setLineDash(dashed ? [5, 4] : []);
      context.beginPath();
      for (let index = from; index <= to; index += 1) {
        const point = toPoint(index, Number(all[index].price), all.length);
        if (index === from) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.stroke();
      context.setLineDash([]);
    };
    drawSegment(0, split, '#0f766e');
    drawSegment(split, all.length - 1, '#7c3aed', true);
  }, [historicalPoints, forecastPoints]);

  return <canvas ref={canvasRef} className="w-full h-[150px]" aria-label="Historical and forecast price trend chart" />;
}

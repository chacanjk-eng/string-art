/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShapeType, DivisionLineType, Point, RuleConfig } from '../types';

/**
 * Generates the division points for a given shape and division line type.
 * @param shape Shape category
 * @param N Number of division points on the perimeter
 * @param divisionLine Optional internal division line style
 * @param width Canvas width
 * @param height Canvas height
 */
export function generatePoints(
  shape: ShapeType,
  N: number,
  divisionLine: DivisionLineType,
  width: number,
  height: number
): Point[] {
  if (shape === 'none') {
    return [];
  }
  const points: Point[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.4; // 80% of half container

  // Helper to interpolate between two 2D points
  const interpolate = (p1: { x: number; y: number }, p2: { x: number; y: number }, t: number) => {
    return {
      x: p1.x * (1 - t) + p2.x * t,
      y: p1.y * (1 - t) + p2.y * t
    };
  };

  // 1. Boundary Points Generation
  if (shape === 'circle') {
    for (let i = 0; i < N; i++) {
      // Rotate 90 degrees counter-clockwise to start from 12 o'clock
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
      points.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        label: `${i + 1}`,
        index: i,
        type: 'boundary'
      });
    }
  } else {
    // Regular Polygons
    let sides = 3;
    if (shape === 'square') sides = 4;
    else if (shape === 'triangle') sides = 3;
    else if (shape === 'pentagon') sides = 5;
    else if (shape === 'hexagon') sides = 6;

    // Calculate vertex positions
    const vertices: { x: number; y: number }[] = [];
    for (let j = 0; j < sides; j++) {
      const angle = -Math.PI / 2 + (2 * Math.PI * j) / sides;
      vertices.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      });
    }

    // Distribute N points along the perimeter
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const totalVal = t * sides;
      const edgeIndex = Math.floor(totalVal) % sides;
      const u = totalVal - Math.floor(totalVal);
      const p1 = vertices[edgeIndex];
      const p2 = vertices[(edgeIndex + 1) % sides];
      const pos = interpolate(p1, p2, u);
      
      points.push({
        x: pos.x,
        y: pos.y,
        label: `${i + 1}`,
        index: i,
        type: 'boundary'
      });
    }
  }

  // 2. Internal Division Points Generation
  // These points will be indexed from N onwards
  let nextIndex = N;

  const addInternalLineOfPoints = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    count: number,
    prefix: string
  ) => {
    // Exclude the end points to avoid duplicating boundary points
    for (let s = 1; s < count; s++) {
      const t = s / count;
      const pos = interpolate(p1, p2, t);
      // We don't want internal points that are basically at the center if we add multiple lines that intersect at the center.
      // Let's filter near-center duplicates slightly or just let them exist.
      const isNearCenter = Math.hypot(pos.x - cx, pos.y - cy) < 1.0;
      
      // Let's label them nicely, e.g. "A1", "A2", or just a sequential label
      const label = isNearCenter ? 'C' : `${prefix}${s}`;
      points.push({
        x: pos.x,
        y: pos.y,
        label: label,
        index: nextIndex++,
        type: 'internal'
      });
    }
  };

  const centerPt = { x: cx, y: cy };

  if (divisionLine === 'cross') {
    // Add vertical and horizontal bisector points
    // We'll interpolate from top-mid to bottom-mid and left-mid to right-mid
    if (shape === 'circle' || shape === 'square' || shape === 'hexagon') {
      const topPt = { x: cx, y: cy - radius };
      const bottomPt = { x: cx, y: cy + radius };
      const leftPt = { x: cx - radius, y: cy };
      const rightPt = { x: cx + radius, y: cy };

      // Number of points along the bisector is proportional to N (e.g. 8 points)
      const internalPointsCount = Math.max(4, Math.floor(N / 4));
      
      addInternalLineOfPoints(topPt, centerPt, internalPointsCount, '수직');
      addInternalLineOfPoints(bottomPt, centerPt, internalPointsCount, '수직');
      addInternalLineOfPoints(leftPt, centerPt, internalPointsCount, '수평');
      addInternalLineOfPoints(rightPt, centerPt, internalPointsCount, '수평');
      
      // Add center point explicitly if not added
      points.push({
        x: cx,
        y: cy,
        label: '중심',
        index: nextIndex++,
        type: 'internal'
      });
    } else if (shape === 'triangle') {
      // For triangle, a cross doesn't align symmetrically. Instead, do 3 altitude bisectors.
      const vertices: { x: number; y: number }[] = [];
      for (let j = 0; j < 3; j++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * j) / 3;
        vertices.push({
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle)
        });
      }

      const internalPointsCount = Math.max(4, Math.floor(N / 4));
      vertices.forEach((v, idx) => {
        addInternalLineOfPoints(v, centerPt, internalPointsCount, `높이${idx + 1}-`);
      });

      // Add center point explicitly
      points.push({
        x: cx,
        y: cy,
        label: '중심',
        index: nextIndex++,
        type: 'internal'
      });
    } else {
      // General polygon center lines
      const internalPointsCount = Math.max(4, Math.floor(N / 4));
      addInternalLineOfPoints({ x: cx, y: cy - radius }, centerPt, internalPointsCount, 'V');
      addInternalLineOfPoints({ x: cx, y: cy + radius }, centerPt, internalPointsCount, 'V');
      points.push({
        x: cx,
        y: cy,
        label: '중심',
        index: nextIndex++,
        type: 'internal'
      });
    }
  } else if (divisionLine === 'diagonal') {
    // Add diagonal lines of points
    if (shape === 'square') {
      const tl = { x: cx - radius, y: cy - radius };
      const br = { x: cx + radius, y: cy + radius };
      const tr = { x: cx + radius, y: cy - radius };
      const bl = { x: cx - radius, y: cy + radius };

      const internalPointsCount = Math.max(4, Math.floor(N / 4));
      addInternalLineOfPoints(tl, br, internalPointsCount * 2, '대각선1-');
      addInternalLineOfPoints(tr, bl, internalPointsCount * 2, '대각선2-');
    } else if (shape === 'circle' || shape === 'hexagon' || shape === 'pentagon') {
      // Let's add lines connecting opposite points through center
      // Rotate 45 deg for diagonals
      const internalPointsCount = Math.max(4, Math.floor(N / 4));
      for (let angleOff = 0; angleOff < Math.PI; angleOff += Math.PI / 4) {
        if (angleOff === 0 || Math.abs(angleOff - Math.PI/2) < 0.1) continue; // skip cross lines
        const p1 = {
          x: cx + radius * Math.cos(angleOff - Math.PI / 2),
          y: cy + radius * Math.sin(angleOff - Math.PI / 2)
        };
        const p2 = {
          x: cx + radius * Math.cos(angleOff + Math.PI / 2),
          y: cy + radius * Math.sin(angleOff + Math.PI / 2)
        };
        addInternalLineOfPoints(p1, p2, internalPointsCount * 2, `대각-${Math.round(angleOff * 180 / Math.PI)}도-`);
      }
    } else if (shape === 'triangle') {
      // Connecting vertices to opposite midpoints
      const vertices: { x: number; y: number }[] = [];
      for (let j = 0; j < 3; j++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * j) / 3;
        vertices.push({
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle)
        });
      }
      const mid01 = interpolate(vertices[0], vertices[1], 0.5);
      const mid12 = interpolate(vertices[1], vertices[2], 0.5);
      const mid20 = interpolate(vertices[2], vertices[0], 0.5);

      const internalPointsCount = Math.max(4, Math.floor(N / 4));
      addInternalLineOfPoints(vertices[0], mid12, internalPointsCount * 2, '중선1-');
      addInternalLineOfPoints(vertices[1], mid20, internalPointsCount * 2, '중선2-');
      addInternalLineOfPoints(vertices[2], mid01, internalPointsCount * 2, '중선3-');
    }
  } else if (divisionLine === 'center') {
    // Just a center point and radial spokes to perimeter vertices!
    // This is super cool! Let's add lines from the center to some vertices.
    const internalPointsCount = Math.max(4, Math.floor(N / 4));
    let spokes = 4;
    if (shape === 'triangle') spokes = 3;
    if (shape === 'pentagon') spokes = 5;
    if (shape === 'hexagon') spokes = 6;
    
    for (let j = 0; j < spokes; j++) {
      const angle = -Math.PI / 2 + (2 * Math.PI * j) / spokes;
      const target = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
      addInternalLineOfPoints(centerPt, target, internalPointsCount, `살-${j + 1}-`);
    }

    points.push({
      x: cx,
      y: cy,
      label: '중심',
      index: nextIndex++,
      type: 'internal'
    });
  }

  return points;
}

/**
 * Calculates a rule mapping for a given point index.
 * Supports addition, multiplication, powers, and custom algebraic formulas.
 * @param index Current point index
 * @param N Total boundary points count
 * @param config The rule configuration
 */
export function evaluateRule(index: number, N: number, config: RuleConfig): number | null {
  if (!config.enabled) return null;
  
  let target = 0;
  
  // Standard modulo wrapping for 1-based indices (1 to N)
  const wrap1 = (val: number) => {
    return ((Math.round(val) - 1) % N + N) % N + 1;
  };

  switch (config.type) {
    case 'addition':
      target = wrap1(index + config.constant);
      break;
    case 'multiplication':
      target = wrap1(index * config.constant);
      break;
    case 'power':
      target = wrap1(Math.pow(index, config.power));
      break;
    case 'custom':
      try {
        // Safe evaluation of custom formula using a basic sandbox
        // We replace "i" or "x" with the 1-based index value, then evaluate.
        const formula = config.customFormula
          .toLowerCase()
          .replace(/i/g, `${index}`)
          .replace(/x/g, `${index}`);
        
        // Basic sanitization: only allow digits, arithmetic symbols, spaces, parenthesis, and modulo
        if (/^[0-9+\-*/%() \t\n.]+$/.test(formula)) {
          // eslint-disable-next-line no-eval
          const result = eval(formula);
          target = wrap1(result);
        } else {
          return null; // Invalid characters
        }
      } catch (err) {
        return null; // Evaluation error
      }
      break;
    default:
      return null;
  }
  
  // Make sure target is positive and within range
  if (isNaN(target)) return null;
  return target;
}

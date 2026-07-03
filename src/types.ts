/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ShapeType = 'circle' | 'square' | 'triangle' | 'pentagon' | 'hexagon';

export type DivisionLineType = 'none' | 'diagonal' | 'cross' | 'center';

export type RuleType = 'addition' | 'multiplication' | 'power' | 'custom';

export interface RuleConfig {
  enabled: boolean;
  type: RuleType;
  constant: number; // k in addition or multiplication
  power: number; // p in power
  customFormula: string; // e.g. "i * 2 + 3"
  color: string;
  thickness: number;
}

export interface Point {
  x: number;
  y: number;
  label: string;
  index: number;
  type: 'boundary' | 'internal';
}

export interface Line {
  from: number;
  to: number;
  color: string;
  thickness: number;
  isManual?: boolean;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: number;
}

export interface GalleryPost {
  id: string;
  title: string;
  author: string;
  schoolInfo?: string;
  createdAt: number;
  shape: ShapeType;
  pointsCount: number;
  divisionLine: DivisionLineType;
  rule1: RuleConfig;
  rule2: RuleConfig;
  manualLines: { from: number; to: number; color: string; thickness: number }[];
  likes: number;
  likedBy: string[]; // List of user UUIDs who liked it
}

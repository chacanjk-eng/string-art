/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RuleConfig, RuleType } from '../types';
import { Sparkles, HelpCircle, Plus, Eye, EyeOff } from 'lucide-react';

interface SimulationPanelProps {
  N: number;
  rule1: RuleConfig;
  setRule1: (config: RuleConfig | ((prev: RuleConfig) => RuleConfig)) => void;
  rule2: RuleConfig;
  setRule2: (config: RuleConfig | ((prev: RuleConfig) => RuleConfig)) => void;
  setShape: (shape: any) => void;
  setN: (n: number) => void;
  setDivisionLine: (line: any) => void;
  setIsManualMode: (manual: boolean) => void;
  setManualLines: (lines: any[]) => void;
}

export default function SimulationPanel({
  N,
  rule1,
  setRule1,
  rule2,
  setRule2,
  setShape,
  setN,
  setDivisionLine,
  setIsManualMode,
  setManualLines
}: SimulationPanelProps) {

  const handleRuleTypeChange = (ruleNum: 1 | 2, type: RuleType) => {
    const update = (prev: RuleConfig) => ({
      ...prev,
      type,
      // Provide healthy defaults depending on selected type
      constant: type === 'multiplication' ? 2 : type === 'addition' ? 5 : prev.constant,
      power: type === 'power' ? 2 : prev.power,
      customFormula: type === 'custom' ? 'i * 2' : prev.customFormula
    });

    if (ruleNum === 1) setRule1(update);
    else setRule2(update);
  };

  const handleToggleRule = (ruleNum: 1 | 2) => {
    const update = (prev: RuleConfig) => ({ ...prev, enabled: !prev.enabled });
    if (ruleNum === 1) setRule1(update);
    else setRule2(update);
  };

  // Math Presets that load full geometries instantly!
  const presets = [
    {
      name: '❤️ 사랑의 하트 (Cardioid)',
      desc: '원 위에서 i와 2 * i를 연결하여 나타나는 하트 모양 곡선',
      action: () => {
        setShape('circle');
        setN(36);
        setDivisionLine('none');
        setIsManualMode(false);
        setManualLines([]);
        setRule1({
          enabled: true,
          type: 'multiplication',
          constant: 2,
          power: 2,
          customFormula: 'i * 2',
          color: '#f43f5e', // Pink
          thickness: 1.5
        });
        setRule2({ enabled: false, type: 'multiplication', constant: 3, power: 2, customFormula: 'i * 3', color: '#0ea5e9', thickness: 1 });
      }
    },
    {
      name: '🦋 황금 신장형 (Nephroid)',
      desc: '원 위에서 i와 3 * i를 연결하여 신장 모양이 되는 신비한 곡선',
      action: () => {
        setShape('circle');
        setN(36);
        setDivisionLine('none');
        setIsManualMode(false);
        setManualLines([]);
        setRule1({
          enabled: true,
          type: 'multiplication',
          constant: 3,
          power: 2,
          customFormula: 'i * 3',
          color: '#eab308', // Gold
          thickness: 1.5
        });
        setRule2({ enabled: false, type: 'multiplication', constant: 2, power: 2, customFormula: 'i * 2', color: '#f43f5e', thickness: 1 });
      }
    },
    {
      name: '🌌 2중 우주꽃 (Double Cardioid)',
      desc: '두 가지 곱셈 규칙을 겹쳐서 우주의 꽃 무늬를 만들어요',
      action: () => {
        setShape('circle');
        setN(48);
        setDivisionLine('none');
        setIsManualMode(false);
        setManualLines([]);
        setRule1({
          enabled: true,
          type: 'multiplication',
          constant: 2,
          power: 2,
          customFormula: 'i * 2',
          color: '#0ea5e9', // Sky Blue
          thickness: 1.5
        });
        setRule2({
          enabled: true,
          type: 'multiplication',
          constant: 46, // N - 2
          power: 2,
          customFormula: 'i * 46',
          color: '#a855f7', // Violet Purple
          thickness: 1.2
        });
      }
    },
    {
      name: '⭐ 대칭 스타 (Symmetric Star)',
      desc: '덧셈 규칙을 이용해서 다각형 별 모양 스트링아트를 만들어요',
      action: () => {
        setShape('circle');
        setN(32);
        setDivisionLine('none');
        setIsManualMode(false);
        setManualLines([]);
        setRule1({
          enabled: true,
          type: 'addition',
          constant: 15, // N/2 - 1
          power: 2,
          customFormula: 'i + 15',
          color: '#10b981', // Emerald
          thickness: 1.5
        });
        setRule2({
          enabled: true,
          type: 'addition',
          constant: 17, // N/2 + 1
          power: 2,
          customFormula: 'i + 17',
          color: '#f97316', // Orange
          thickness: 1.2
        });
      }
    },
    {
      name: '📐 사각 곡선바느질 (Curve Stitch)',
      desc: '정사각형 안에서 보조 십자선들과의 대칭 덧셈 연결',
      action: () => {
        setShape('square');
        setN(32);
        setDivisionLine('cross');
        setIsManualMode(false);
        setManualLines([]);
        setRule1({
          enabled: true,
          type: 'custom',
          constant: 2,
          power: 2,
          customFormula: '(32 - i)', // Sym linear
          color: '#0ea5e9',
          thickness: 1.5
        });
        setRule2({
          enabled: true,
          type: 'addition',
          constant: 16, // Half points
          power: 2,
          customFormula: 'i + 16',
          color: '#f43f5e',
          thickness: 1
        });
      }
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/10" />
        <h2 className="text-lg font-black text-slate-900">수학 규칙 시뮬레이터</h2>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <span className="text-xs text-indigo-650 font-black flex items-center gap-1">
          💡 추천 수학 스트링아트 불러오기:
        </span>
        <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={p.action}
              className="w-full text-left bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 p-2.5 rounded-xl transition-all duration-200 shadow-sm"
            >
              <div className="font-extrabold text-xs text-slate-800 flex items-center gap-1">
                <span>{p.name}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Rule 1 Settings */}
      <div className={`p-4 rounded-2xl border transition-all ${
        rule1.enabled ? 'bg-indigo-50/40 border-indigo-100 shadow-sm' : 'bg-slate-50/50 border-slate-100 opacity-60'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rule1.color }} />
            <h3 className="text-xs font-black text-slate-800">규칙 1 (첫 번째 실)</h3>
          </div>
          <button
            onClick={() => handleToggleRule(1)}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
              rule1.enabled ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-650'
            }`}
          >
            {rule1.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>{rule1.enabled ? '켜짐' : '꺼짐'}</span>
          </button>
        </div>

        {rule1.enabled && (
          <div className="space-y-3">
            {/* Rule Selector */}
            <div className="grid grid-cols-4 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
              {(['addition', 'multiplication', 'power', 'custom'] as RuleType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleRuleTypeChange(1, type)}
                  className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                    rule1.type === type ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type === 'addition' ? '덧셈' : type === 'multiplication' ? '곱셈' : type === 'power' ? '제곱' : '수식'}
                </button>
              ))}
            </div>

            {/* Parameter Fields */}
            {rule1.type === 'addition' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                  <span>더하는 수 (k):</span>
                  <span className="text-indigo-650 font-black">{rule1.constant}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={Math.max(10, N - 1)}
                  value={rule1.constant}
                  onChange={(e) => setRule1(prev => ({ ...prev, constant: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <p className="text-[9px] text-slate-500 font-medium">매 점마다 {rule1.constant}칸씩 뛰어서 연결합니다: i → (i + {rule1.constant})</p>
              </div>
            )}

            {rule1.type === 'multiplication' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                  <span>곱하는 수 (k 배수):</span>
                  <span className="text-indigo-650 font-black">× {rule1.constant}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={rule1.constant}
                  onChange={(e) => setRule1(prev => ({ ...prev, constant: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <p className="text-[9px] text-slate-500 font-medium">시작 번호에 {rule1.constant}배를 한 번호에 연결합니다: i → (i × {rule1.constant}) % {N}</p>
              </div>
            )}

            {rule1.type === 'power' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                  <span>거듭제곱 지수 (p제곱):</span>
                  <span className="text-indigo-650 font-black">{rule1.power} 제곱</span>
                </div>
                <div className="flex gap-2">
                  {[2, 3, 4].map((pow) => (
                    <button
                      key={pow}
                      onClick={() => setRule1(prev => ({ ...prev, power: pow }))}
                      className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all ${
                        rule1.power === pow ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pow}제곱
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-500 font-medium">자기 자신을 {rule1.power}번 곱한 번호로 연결합니다: i → i^{rule1.power} % {N}</p>
              </div>
            )}

            {rule1.type === 'custom' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                  <span>나만의 수식 입력 (문자 i 또는 x 사용):</span>
                </div>
                <input
                  type="text"
                  value={rule1.customFormula}
                  onChange={(e) => setRule1(prev => ({ ...prev, customFormula: e.target.value }))}
                  placeholder="예: i * 2 + 1"
                  className="w-full bg-white text-slate-800 text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
                <p className="text-[9px] text-slate-500 font-medium">사칙연산(+, -, *, /)과 괄호()를 쓸 수 있어요. 예: (i + 2) * 3</p>
              </div>
            )}

            {/* Color & Thickness sub-controls */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-bold">실 색상:</span>
                <input 
                  type="color" 
                  value={rule1.color} 
                  onChange={(e) => setRule1(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-7 rounded cursor-pointer border border-slate-200 bg-white p-0"
                />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-bold">실 굵기:</span>
                <select 
                  value={rule1.thickness} 
                  onChange={(e) => setRule1(prev => ({ ...prev, thickness: parseFloat(e.target.value) }))}
                  className="w-full h-7 text-xs bg-white border border-slate-200 text-slate-700 rounded px-1.5"
                >
                  <option value="1">1.0px (얇음)</option>
                  <option value="1.5">1.5px (보통)</option>
                  <option value="2.5">2.5px (굵음)</option>
                  <option value="4">4.0px (매우굵음)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rule 2 Settings (Combined layer) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        rule2.enabled ? 'bg-purple-50/40 border-purple-100 shadow-sm' : 'bg-slate-50/50 border-slate-100 opacity-60'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rule2.color }} />
            <h3 className="text-xs font-black text-slate-800">규칙 2 (두 번째 실 - 겹치기)</h3>
          </div>
          <button
            onClick={() => handleToggleRule(2)}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
              rule2.enabled ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-200 text-slate-650'
            }`}
          >
            {rule2.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>{rule2.enabled ? '켜짐' : '꺼짐'}</span>
          </button>
        </div>

        {rule2.enabled && (
          <div className="space-y-3">
            {/* Rule Selector */}
            <div className="grid grid-cols-4 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
              {(['addition', 'multiplication', 'power', 'custom'] as RuleType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleRuleTypeChange(2, type)}
                  className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                    rule2.type === type ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type === 'addition' ? '덧셈' : type === 'multiplication' ? '곱셈' : type === 'power' ? '제곱' : '수식'}
                </button>
              ))}
            </div>

            {/* Parameter Fields */}
            {rule2.type === 'addition' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                  <span>더하는 수 (k):</span>
                  <span className="text-purple-700 font-black">{rule2.constant}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={Math.max(10, N - 1)}
                  value={rule2.constant}
                  onChange={(e) => setRule2(prev => ({ ...prev, constant: parseInt(e.target.value) }))}
                  className="w-full accent-purple-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {rule2.type === 'multiplication' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                  <span>곱하는 수 (k 배수):</span>
                  <span className="text-purple-700 font-black">× {rule2.constant}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={rule2.constant}
                  onChange={(e) => setRule2(prev => ({ ...prev, constant: parseInt(e.target.value) }))}
                  className="w-full accent-purple-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {rule2.type === 'power' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                  <span>거듭제곱 지수 (p제곱):</span>
                  <span className="text-purple-700 font-black">{rule2.power} 제곱</span>
                </div>
                <div className="flex gap-2">
                  {[2, 3, 4].map((pow) => (
                    <button
                      key={pow}
                      onClick={() => setRule2(prev => ({ ...prev, power: pow }))}
                      className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all ${
                        rule2.power === pow ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pow}제곱
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rule2.type === 'custom' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                  <span>나만의 수식 입력 (문자 i 또는 x 사용):</span>
                </div>
                <input
                  type="text"
                  value={rule2.customFormula}
                  onChange={(e) => setRule2(prev => ({ ...prev, customFormula: e.target.value }))}
                  placeholder="예: i * 3"
                  className="w-full bg-white text-slate-800 text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>
            )}

            {/* Color & Thickness sub-controls */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-bold">실 색상:</span>
                <input 
                  type="color" 
                  value={rule2.color} 
                  onChange={(e) => setRule2(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-7 rounded cursor-pointer border border-slate-200 bg-white p-0"
                />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-bold">실 굵기:</span>
                <select 
                  value={rule2.thickness} 
                  onChange={(e) => setRule2(prev => ({ ...prev, thickness: parseFloat(e.target.value) }))}
                  className="w-full h-7 text-xs bg-white border border-slate-200 text-slate-700 rounded px-1.5"
                >
                  <option value="1">1.0px (얇음)</option>
                  <option value="1.5">1.5px (보통)</option>
                  <option value="2.5">2.5px (굵음)</option>
                  <option value="4">4.0px (매우굵음)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

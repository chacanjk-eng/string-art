/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShapeType, DivisionLineType } from '../types';
import { 
  Circle, 
  Square, 
  Triangle, 
  Hexagon, 
  Sparkles, 
  Layers, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Hash,
  Palette
} from 'lucide-react';

interface ManualStepGuideProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  shape: ShapeType;
  setShape: (shape: ShapeType) => void;
  N: number;
  setN: (n: number) => void;
  divisionLine: DivisionLineType;
  setDivisionLine: (line: DivisionLineType) => void;
  showNumbers: boolean;
  setShowNumbers: (show: boolean) => void;
  isManualMode: boolean;
  setIsManualMode: (manual: boolean) => void;
  activeManualColor: string;
  setActiveManualColor: (color: string) => void;
  activeManualThickness: number;
  setActiveManualThickness: (thickness: number) => void;
  isIntegerOnlyMode: boolean;
  setIsIntegerOnlyMode: (val: boolean) => void;
}

export default function ManualStepGuide({
  currentStep,
  setCurrentStep,
  shape,
  setShape,
  N,
  setN,
  divisionLine,
  setDivisionLine,
  showNumbers,
  setShowNumbers,
  isManualMode,
  setIsManualMode,
  activeManualColor,
  setActiveManualColor,
  activeManualThickness,
  setActiveManualThickness,
  isIntegerOnlyMode,
  setIsIntegerOnlyMode
}: ManualStepGuideProps) {

  const steps = [
    { title: '도형 고르기', desc: '스트링아트의 기본 뼈대가 될 도형을 선택해요.' },
    { title: '등분점 찍기', desc: '테두리를 고르게 나눌 점의 개수를 정해요.' },
    { title: '도형 분할하기', desc: '도형 안에 대각선이나 중심선 등 보조 뼈대를 세워요.' },
    { title: '실 감고 꾸미기', desc: '원하는 색의 실로 나만의 실 예술을 꾸며봐요.' }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      if (currentStep + 1 === 3) {
        setIsManualMode(true); // Automatically enable manual mode at the wrapping step
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const shapesList: { type: ShapeType; name: string; icon: React.ReactNode }[] = [
    { type: 'circle', name: '원형 (Circle)', icon: <Circle className="w-5 h-5 text-sky-400" /> },
    { type: 'square', name: '정사각형 (Square)', icon: <Square className="w-5 h-5 text-emerald-400" /> },
    { type: 'triangle', name: '정삼각형 (Triangle)', icon: <Triangle className="w-5 h-5 text-amber-400" /> },
    { type: 'pentagon', name: '정오각형 (Pentagon)', icon: <Hexagon className="w-5 h-5 text-fuchsia-400 Rotate-18" /> }, // Pentagons are hexagon-like shape
    { type: 'hexagon', name: '정육각형 (Hexagon)', icon: <Hexagon className="w-5 h-5 text-indigo-400" /> }
  ];

  const pointsCounts = [12, 16, 24, 32, 36, 48, 60];

  const divisionOptions: { type: DivisionLineType; name: string; desc: string }[] = [
    { type: 'none', name: '분할 없음', desc: '도형 테두리에만 점을 배치합니다.' },
    { type: 'cross', name: '십자 분할 (수직/수평 이등분선)', desc: '중심을 지나는 수직과 수평선을 따라 점을 추가합니다.' },
    { type: 'diagonal', name: '대각선 분할 (X자/중선)', desc: '도형의 대각선(또는 각 꼭짓점의 중선)에 점을 추가합니다.' },
    { type: 'center', name: '바퀴살 분할 (중심 방사선)', desc: '각 꼭짓점에서 중심까지 이어지는 뼈대에 점을 배치합니다.' }
  ];

  const colorPalette = [
    { name: '로즈 핑크', value: '#f43f5e' },
    { name: '일렉트릭 옐로우', value: '#eab308' },
    { name: '네온 그린', value: '#10b981' },
    { name: '스카이 블루', value: '#0ea5e9' },
    { name: '퍼플 헤이즈', value: '#a855f7' },
    { name: '핫 오렌지', value: '#f97316' },
    { name: '엔젤 화이트', value: '#ffffff' }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex flex-col h-full justify-between">
      <div>
        {/* Step Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-slate-900">수동 스트링아트 길잡이</h2>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
            단계 {currentStep + 1} / 4
          </span>
        </div>

        {/* Step Progress Tracker (Interactive & Clickable!) */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {steps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentStep(idx);
                if (idx === 3) {
                  setIsManualMode(true);
                }
              }}
              className="flex flex-col gap-1.5 text-left group focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-lg p-1 transition-all"
            >
              <div 
                className={`h-2 w-full rounded-full transition-all duration-300 ${
                  idx <= currentStep 
                    ? 'bg-indigo-600 group-hover:bg-indigo-700' 
                    : 'bg-slate-200 group-hover:bg-slate-300'
                }`}
              />
              <span className={`text-[10px] text-center w-full block transition-all ${
                idx === currentStep 
                  ? 'text-indigo-600 font-black scale-105' 
                  : 'text-slate-400 group-hover:text-slate-600 font-bold'
              }`}>
                {idx + 1}. {s.title.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic Instructional Description */}
        <div className="mb-5 bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            {steps[currentStep].title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {steps[currentStep].desc}
          </p>
        </div>

        {/* STEP CONTENT 1: Shape Selection */}
        {currentStep === 0 && (
          <div className="space-y-2">
            <label className="text-xs text-slate-500 font-bold">기본 도형을 선택하세요:</label>
            <div className="grid grid-cols-1 gap-2">
              {shapesList.map((item) => (
                <button
                  key={item.type}
                  onClick={() => setShape(item.type)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    shape === item.type
                      ? 'bg-indigo-50 text-indigo-750 border-indigo-200 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-xs font-bold">{item.name}</span>
                  </div>
                  {shape === item.type && (
                    <span className="text-[10px] bg-indigo-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">선택됨</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP CONTENT 2: Division Points */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-500 font-bold">등분점 수 선택 (테두리의 총 칸수):</label>
              <div className="grid grid-cols-4 gap-2">
                {pointsCounts.map((count) => (
                  <button
                    key={count}
                    onClick={() => setN(count)}
                    className={`py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                      N === count
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm font-extrabold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Input & Slider */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-bold block">원하는 칸수(등분점) 슬라이더 또는 직접 입력:</span>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min="4"
                  max="120"
                  step="1"
                  value={N}
                  onChange={(e) => setN(parseInt(e.target.value) || 12)}
                  className="flex-1 accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
                <input
                  type={isIntegerOnlyMode ? "number" : "text"}
                  value={N}
                  onChange={(e) => {
                    const valStr = e.target.value;
                    if (valStr === '') return;
                    if (isIntegerOnlyMode) {
                      let val = parseInt(valStr);
                      if (isNaN(val)) return;
                      if (val < 4) val = 4;
                      if (val > 120) val = 120;
                      setN(val);
                    } else {
                      let val = Math.round(parseFloat(valStr));
                      if (isNaN(val)) return;
                      if (val < 4) val = 4;
                      if (val > 120) val = 120;
                      setN(val);
                    }
                  }}
                  className="w-16 text-center text-xs font-mono font-bold bg-white border border-slate-250 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="36"
                />
              </div>

              {/* Integer Only Mode Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-500 font-bold">정수 전용 모드 (소수점 입력 제한)</span>
                <button
                  type="button"
                  onClick={() => setIsIntegerOnlyMode(!isIntegerOnlyMode)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-all ${
                    isIntegerOnlyMode ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <div 
                    className={`bg-white w-4 h-4 rounded-full shadow transition-all ${
                      isIntegerOnlyMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100 text-[11px] text-slate-600 space-y-1">
              <p className="font-extrabold text-indigo-700">💡 5-6학년 수학 상식!</p>
              <p className="leading-relaxed">점이 많을수록 원에 더 가깝게 보여요. 나눗셈 규칙(12등분은 2, 3, 4, 6의 배수)을 생각하며 숫자를 골라보세요!</p>
            </div>
          </div>
        )}

        {/* STEP CONTENT 3: Shape Division */}
        {currentStep === 2 && (
          <div className="space-y-2.5">
            <label className="text-xs text-slate-500 font-bold">도형 내부에 보조 분할선 추가하기:</label>
            <div className="space-y-2">
              {divisionOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setDivisionLine(opt.type)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    divisionLine === opt.type
                      ? 'bg-violet-50 text-violet-750 border-violet-200 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="font-extrabold text-xs flex items-center gap-2 mb-1 text-slate-800">
                    <Layers className="w-3.5 h-3.5 text-violet-600" />
                    <span>{opt.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP CONTENT 4: Manual Wrapping & Styling */}
        {currentStep === 3 && (
          <div className="space-y-4">
            {/* Number Guide */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-slate-700 font-bold">각 점에 숫자(이름) 보이기</span>
              </div>
              <button
                onClick={() => setShowNumbers(!showNumbers)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${
                  showNumbers ? 'bg-indigo-650' : 'bg-slate-200'
                }`}
              >
                <div 
                  className={`bg-white w-4 h-4 rounded-full shadow transition-all ${
                    showNumbers ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Manual wrapping trigger */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-slate-700 font-bold">마우스 수동 실감기 사용</span>
              </div>
              <button
                onClick={() => setIsManualMode(!isManualMode)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${
                  isManualMode ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              >
                <div 
                  className={`bg-white w-4 h-4 rounded-full shadow transition-all ${
                    isManualMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* String Customizer */}
            {isManualMode && (
              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {/* Thread Color */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-bold">실 색상 선택:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPalette.map((col) => (
                      <button
                        key={col.value}
                        onClick={() => setActiveManualColor(col.value)}
                        className={`w-6 h-6 rounded-full border transition-all relative ${
                          activeManualColor === col.value ? 'border-indigo-600 scale-110 shadow-sm ring-2 ring-indigo-100' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: col.value }}
                        title={col.name}
                      >
                        {activeManualColor === col.value && (
                          <span className="absolute inset-0 m-auto w-1.5 h-1.5 bg-white rounded-full mix-blend-difference" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thread Thickness */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-bold">실 두께 조절:</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((thickness) => (
                      <button
                        key={thickness}
                        onClick={() => setActiveManualThickness(thickness)}
                        className={`flex-1 py-1.5 text-xs rounded-lg border font-mono font-bold transition-all ${
                          activeManualThickness === thickness
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-55'
                        }`}
                      >
                        {thickness}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 py-2.5 px-4 rounded-xl font-bold transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전 단계</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === 3}
          className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 py-2.5 px-4 rounded-xl transition-all font-bold shadow-md shadow-indigo-100"
        >
          <span>다음 단계</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

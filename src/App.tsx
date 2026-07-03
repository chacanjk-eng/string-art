/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShapeType, DivisionLineType, RuleConfig, Line } from './types';
import StringArtCanvas from './components/StringArtCanvas';
import ManualStepGuide from './components/ManualStepGuide';
import SimulationPanel from './components/SimulationPanel';
import GalleryBoard from './components/GalleryBoard';
import { 
  Sparkles, 
  HelpCircle, 
  Layers, 
  Compass, 
  BookOpen, 
  MessageSquare, 
  ChevronRight,
  Calculator,
  PenTool,
  Image as ImageIcon
} from 'lucide-react';

export default function App() {
  // Tabs: 'lab' (Main Editor), 'gallery' (Board), 'info' (Math Learning guide)
  const [activeTab, setActiveTab] = useState<'lab' | 'gallery' | 'info'>('lab');

  // Primary State
  const [shape, setShape] = useState<ShapeType>('circle');
  const [N, setN] = useState<number>(36);
  const [divisionLine, setDivisionLine] = useState<DivisionLineType>('none');
  
  // Rule 1 Config
  const [rule1, setRule1] = useState<RuleConfig>({
    enabled: true,
    type: 'multiplication',
    constant: 2,
    power: 2,
    customFormula: 'i * 2',
    color: '#38bdf8', // sky-400
    thickness: 1.5
  });

  // Rule 2 Config (combined/overlaid)
  const [rule2, setRule2] = useState<RuleConfig>({
    enabled: false,
    type: 'addition',
    constant: 5,
    power: 2,
    customFormula: 'i * 3',
    color: '#a78bfa', // violet-400
    thickness: 1
  });

  // Manual Lines list
  const [manualLines, setManualLines] = useState<Line[]>([]);

  // Toggles & Helpers
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [activeManualColor, setActiveManualColor] = useState<string>('#f43f5e'); // neon rose
  const [activeManualThickness, setActiveManualThickness] = useState<number>(2);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Student Profile Persistence
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('string_art_student_name') || '';
  });
  const [schoolInfo, setSchoolInfo] = useState<string>(() => {
    return localStorage.getItem('string_art_school_info') || '';
  });

  // Persist profile when changed
  useEffect(() => {
    localStorage.setItem('string_art_student_name', studentName);
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem('string_art_school_info', schoolInfo);
  }, [schoolInfo]);

  // Loader function from Gallery templates
  const handleLoadTemplate = (template: {
    shape: ShapeType;
    N: number;
    divisionLine: DivisionLineType;
    rule1: RuleConfig;
    rule2: RuleConfig;
    manualLines: Line[];
  }) => {
    setShape(template.shape);
    setN(template.N);
    setDivisionLine(template.divisionLine);
    setRule1(template.rule1);
    setRule2(template.rule2);
    setManualLines(template.manualLines || []);
    
    // Automatically configure editor based on loaded contents
    if (template.manualLines && template.manualLines.length > 0) {
      setIsManualMode(true);
      setCurrentStep(3); // Go to manual wrap step
    } else {
      setIsManualMode(false);
    }

    // Toggle back to lab tab and show success
    setActiveTab('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 flex flex-col font-sans selection:bg-indigo-500/10 selection:text-indigo-900">
      
      {/* 🚀 Top Announcement Banner */}
      <div className="bg-indigo-600 px-4 py-2 text-center text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 fill-white animate-bounce" />
        <span>초등 수학과 실의 신비한 미술! 규칙을 입력하여 나만의 기하학 예술 작품을 그려보세요!</span>
      </div>

      {/* 🧭 Elegant Navigation Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-md shadow-indigo-100">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>스트링아트 수학 실험실</span>
                <span className="text-xs bg-indigo-500 text-white font-extrabold px-1.5 py-0.5 rounded-full">LAB</span>
              </h1>
              <p className="text-[10px] text-slate-500">초등학교 5-6학년 합동, 규칙, 배수, 나눗셈 수학 융합 체험 교실</p>
            </div>
          </div>

          {/* Quick Tab Selector */}
          <nav className="flex bg-slate-100 border border-slate-200 p-1 rounded-2xl w-full sm:w-auto">
            <button
              id="tab-lab"
              onClick={() => setActiveTab('lab')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'lab' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>🎨 스트링아트 제작소</span>
            </button>
            
            <button
              id="tab-gallery"
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold transition-all relative ${
                activeTab === 'gallery' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>🏛️ 실시간 미술관 게시판</span>
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </button>

            <button
              id="tab-info"
              onClick={() => setActiveTab('info')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'info' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>📚 수학 상식 배움터</span>
            </button>
          </nav>

        </div>
      </header>

      {/* 📦 Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        
        {/* TAB 1: THE LAB */}
        {activeTab === 'lab' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Interactive Canvas Visualizer (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <StringArtCanvas
                shape={shape}
                N={N}
                divisionLine={divisionLine}
                rule1={rule1}
                rule2={rule2}
                manualLines={manualLines}
                setManualLines={setManualLines}
                showNumbers={showNumbers}
                isManualMode={isManualMode}
                activeManualColor={activeManualColor}
                activeManualThickness={activeManualThickness}
                studentName={studentName}
                schoolInfo={schoolInfo}
              />

              {/* Mode switching panel underneath canvas */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span>💡 모드 선택 도움말</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    수동 가이드 단계를 밟아가거나, 자동으로 복잡하고 멋진 무늬를 보여주는 수학 규칙 시뮬레이터를 켜보세요!
                  </p>
                </div>

                <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-2xl w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setIsManualMode(true);
                      setCurrentStep(3); // jump to manual wrap styling step
                    }}
                    className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      isManualMode 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🎨 수동 실 감기
                  </button>
                  <button
                    onClick={() => {
                      setIsManualMode(false);
                    }}
                    className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      !isManualMode 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📐 수학 규칙 시뮬레이션
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Steps Guide & Math Simulator Panel (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6 h-full">
              {isManualMode ? (
                <ManualStepGuide
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  shape={shape}
                  setShape={setShape}
                  N={N}
                  setN={setN}
                  divisionLine={divisionLine}
                  setDivisionLine={setDivisionLine}
                  showNumbers={showNumbers}
                  setShowNumbers={setShowNumbers}
                  isManualMode={isManualMode}
                  setIsManualMode={setIsManualMode}
                  activeManualColor={activeManualColor}
                  setActiveManualColor={setActiveManualColor}
                  activeManualThickness={activeManualThickness}
                  setActiveManualThickness={setActiveManualThickness}
                />
              ) : (
                <SimulationPanel
                  N={N}
                  rule1={rule1}
                  setRule1={setRule1}
                  rule2={rule2}
                  setRule2={setRule2}
                  setShape={setShape}
                  setN={setN}
                  setDivisionLine={setDivisionLine}
                  setIsManualMode={setIsManualMode}
                  setManualLines={setManualLines}
                />
              )}
            </div>

          </div>
        )}

        {/* TAB 2: MUSEUM GALLERY BOARD */}
        {activeTab === 'gallery' && (
          <GalleryBoard
            currentShape={shape}
            currentN={N}
            currentDivisionLine={divisionLine}
            rule1={rule1}
            rule2={rule2}
            manualLines={manualLines}
            onLoadTemplate={handleLoadTemplate}
            studentName={studentName}
            setStudentName={setStudentName}
            schoolInfo={schoolInfo}
            setSchoolInfo={setSchoolInfo}
          />
        )}

        {/* TAB 3: MATHEMATICAL PRINCIPLES */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl flex flex-col gap-6 max-w-4xl mx-auto text-slate-750">
            
            {/* Header */}
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600" />
                <span>스트링아트 속 숨겨진 5-6학년 수학 상식</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                실을 고르게 연결했을 뿐인데, 왜 규칙적인 곡선들이 생겨날까요? 스트링아트의 비밀을 배워봅시다!
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
              
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                  <span>1. 곱셈 규칙과 하트 곡선 (Cardioid)</span>
                </h3>
                <p>
                  시뮬레이터에서 <strong>곱셈 규칙 2배수(i → 2 * i)</strong>를 켜면 신비하게도 <strong>하트 모양(카디오이드)</strong> 곡선이 서서히 나타나요. 
                  각 점에 2를 곱해 그 나온 자리로 실을 팽팽하게 당기는 행동을 모든 점에 적용하면, 선들이 수없이 겹쳐지면서 하나의 둥근 봉우리를 가진 하트 형태의 외곽선(포락선)을 그립니다.
                </p>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 font-mono text-xs text-slate-500 space-y-1">
                  <p>• 1번 점은 1 × 2 = 2번 점으로 연결!</p>
                  <p>• 2번 점은 2 × 2 = 4번 점으로 연결!</p>
                  <p>• 19번 점은 19 × 2 = 38번 점인데, 만약 36등분이라면? 한 바퀴 돌고 남은 <strong>38 - 36 = 2번 점</strong>으로 쏙 연결되어요! (이것이 6학년 비와 비율, 그리고 중학교 정수론의 나눗셈 나머지 원리입니다!)</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                  <span>2. 3배수 규칙과 더블 하트 (Nephroid)</span>
                </h3>
                <p>
                  곱셈 규칙에 <strong>3배수(i → 3 * i)</strong>를 대입하면 어떤 무늬가 보이나요? 하트 구멍이 양쪽으로 두 개 뚫린 <strong>신장형(네프로이드)</strong> 패턴이 완성됩니다! 
                  4배수, 5배수로 늘어날수록 꽃잎의 개수가 늘어나며 기하학의 한계를 시험하게 됩니다.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                  <span>3. 도형 분할과 곡선바느질 (Curve Stitching)</span>
                </h3>
                <p>
                  정사각형을 대각선이나 가로세로 십자선으로 쪼개서, 한 선의 점들과 다른 수직 선의 점들을 역순(예: 점 0은 반대선 점 10, 점 1은 점 9, 점 2는 점 8...)으로 감아가면, 
                  직선만 사용했음에도 불구하고 모퉁이마다 아주 매끄러운 <strong>포물선(부드러운 곡선)</strong>이 생겨납니다. 이것을 수학에서는 <strong>곡선 바느질</strong>이라고 합니다.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                  <span>4. 5-6학년 수학 교과과정과의 연계</span>
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-500 text-xs">
                  <li><strong>5학년 1학기 [약수와 배수]</strong>: 등분점 개수(예: 24, 36)와 선을 띄워 감는 일정한 규칙적인 간격 사이의 관계를 보며 최소공배수와 배수 원리를 눈으로 관찰합니다.</li>
                  <li><strong>5학년 2학기 [합동과 대칭]</strong>: 정다각형 내부를 대각선이나 수직이등분선으로 분할하여 실을 감을 때 생겨나는 아름다운 선대칭 및 점대칭 무늬의 균형미를 감상합니다.</li>
                  <li><strong>6학년 1학기 [비와 비율]</strong>: 도형 크기를 축소하거나 확대해도 각 칸의 일정한 등분 비율은 변하지 않고 형태가 유지됨을 직접 조작하며 체득합니다.</li>
                </ul>
              </div>

            </div>

            {/* CTA to get drawing */}
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 text-center">
              <p className="text-xs text-indigo-700 font-bold mb-3">
                수학 원리를 알면 더 재미있는 나만의 패턴을 발명할 수 있습니다. 
              </p>
              <button
                onClick={() => setActiveTab('lab')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-indigo-100"
              >
                지금 규칙 실험실로 이동해서 무늬 만들기
              </button>
            </div>

          </div>
        )}

      </main>

      {/* 🔮 Aesthetic Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-slate-500 text-xs mt-auto font-sans">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">📐 스트링아트 수학 실험실 - String Art Mathematical Laboratory</p>
          <p className="text-[10px]">본 프로그램은 초등학교 5-6학년 수학 융합 교육용 웹 어플리케이션입니다. 학생들의 창의력과 기하학적 사고를 키웁니다.</p>
          <p className="text-[9px] text-slate-400">Copyright © 2026. Made with Google AI Studio. Powered by Firebase Firestore.</p>
        </div>
      </footer>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GalleryPost, Comment, ShapeType, DivisionLineType, RuleConfig, Line } from '../types';
import { savePost, subscribeToPosts, toggleLikePost, addCommentToPost, subscribeToComments } from '../firebase';
import { generatePoints, evaluateRule } from './ShapeUtils';
import { 
  Heart, 
  MessageCircle, 
  Download, 
  Share2, 
  FolderOpen, 
  ChevronRight, 
  User, 
  Send, 
  X,
  School,
  Sparkles
} from 'lucide-react';

// Unique anonymous user ID for liking functionality without authentication
function getOrCreateUserId() {
  let userId = localStorage.getItem('string_art_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('string_art_user_id', userId);
  }
  return userId;
}

// -------------------------------------------------------------
// Mini Canvas Thumbnail Component for real-time light drawing!
// -------------------------------------------------------------
function PostThumbnail({ post }: { post: GalleryPost }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 150;
    ctx.clearRect(0, 0, size, size);

    // Deep slate background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.4;

    // Generate scaled points
    const pts = generatePoints(post.shape, post.pointsCount, post.divisionLine, size, size);

    // Draw lines for Rule 1
    if (post.rule1 && post.rule1.enabled) {
      ctx.strokeStyle = post.rule1.color;
      ctx.lineWidth = Math.max(0.6, (post.rule1.thickness || 1) * 0.4);
      for (let i = 0; i < post.pointsCount; i++) {
        const target1 = evaluateRule(i + 1, post.pointsCount, post.rule1);
        if (target1 !== null) {
          const target = target1 - 1;
          if (target < pts.length && i < pts.length) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[target].x, pts[target].y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw lines for Rule 2
    if (post.rule2 && post.rule2.enabled) {
      ctx.strokeStyle = post.rule2.color;
      ctx.lineWidth = Math.max(0.6, (post.rule2.thickness || 1) * 0.4);
      for (let i = 0; i < post.pointsCount; i++) {
        const target1 = evaluateRule(i + 1, post.pointsCount, post.rule2);
        if (target1 !== null) {
          const target = target1 - 1;
          if (target < pts.length && i < pts.length) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[target].x, pts[target].y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw manual lines
    if (post.manualLines) {
      post.manualLines.forEach((line) => {
        if (line.from < pts.length && line.to < pts.length) {
          ctx.strokeStyle = line.color;
          ctx.lineWidth = Math.max(0.6, line.thickness * 0.4);
          ctx.beginPath();
          ctx.moveTo(pts[line.from].x, pts[line.from].y);
          ctx.lineTo(pts[line.to].x, pts[line.to].y);
          ctx.stroke();
        }
      });
    }

    // Draw tiny points
    pts.forEach((p) => {
      ctx.fillStyle = p.type === 'boundary' ? '#38bdf8' : '#a78bfa';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [post]);

  return (
    <canvas 
      ref={canvasRef} 
      width={150} 
      height={150} 
      className="rounded-xl border border-slate-700 shadow-inner"
    />
  );
}

// -------------------------------------------------------------
// Main Gallery Board Component
// -------------------------------------------------------------
interface GalleryBoardProps {
  currentShape: ShapeType;
  currentN: number;
  currentDivisionLine: DivisionLineType;
  rule1: RuleConfig;
  rule2: RuleConfig;
  manualLines: Line[];
  onLoadTemplate: (template: {
    shape: ShapeType;
    N: number;
    divisionLine: DivisionLineType;
    rule1: RuleConfig;
    rule2: RuleConfig;
    manualLines: Line[];
  }) => void;
  studentName: string;
  setStudentName: (name: string) => void;
  schoolInfo: string;
  setSchoolInfo: (info: string) => void;
}

export default function GalleryBoard({
  currentShape,
  currentN,
  currentDivisionLine,
  rule1,
  rule2,
  manualLines,
  onLoadTemplate,
  studentName,
  setStudentName,
  schoolInfo,
  setSchoolInfo
}: GalleryBoardProps) {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [userId] = useState(getOrCreateUserId());
  const [shareTitle, setShareTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState<GalleryPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Subscribe to real-time posts from firestore
  useEffect(() => {
    const unsubscribe = subscribeToPosts((retrievedPosts) => {
      setPosts(retrievedPosts);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to comments dynamically when active comments popup is open
  useEffect(() => {
    if (!activeCommentsPost) {
      setComments([]);
      return;
    }
    const unsubscribe = subscribeToComments(activeCommentsPost.id, (retrievedComments) => {
      setComments(retrievedComments);
    });
    return () => unsubscribe();
  }, [activeCommentsPost]);

  // Save current masterpiece to Firestore
  const handleShareMasterpiece = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareTitle.trim()) {
      alert('작품 제목을 적어주세요!');
      return;
    }
    if (!studentName.trim()) {
      alert('공유하려면 이름을 꼭 적어주세요! (예: 김철수 또는 5학년1반 철수)');
      return;
    }

    setIsSubmitting(true);
    try {
      await savePost({
        title: shareTitle,
        author: studentName,
        schoolInfo: schoolInfo,
        shape: currentShape,
        pointsCount: currentN,
        divisionLine: currentDivisionLine,
        rule1,
        rule2,
        manualLines
      });
      setShareTitle('');
      alert('🎉 나의 작품이 미술관 게시판에 자랑스럽게 등록되었습니다!');
    } catch (error) {
      alert('공유 중에 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Like with Firestore array union/remove tracking
  const handleLike = async (post: GalleryPost) => {
    const hasLiked = post.likedBy.includes(userId);
    try {
      await toggleLikePost(post.id, userId, hasLiked);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  // Submit comment to Firestore
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCommentsPost) return;
    if (!studentName.trim()) {
      alert('댓글을 달려면 상단의 내 이름을 먼저 등록해주세요!');
      return;
    }

    const commentAuthor = `${studentName} ${schoolInfo ? `(${schoolInfo})` : ''}`;
    try {
      await addCommentToPost(activeCommentsPost.id, commentAuthor, newCommentText);
      setNewCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex flex-col gap-6">
      
      {/* 1. Header & Quick profile setter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5">
          <Share2 className="w-6 h-6 text-indigo-600 animate-pulse" />
          <div>
            <h2 className="text-lg font-black text-slate-900">💻 실시간 스트링아트 미술관</h2>
            <p className="text-xs text-slate-500 font-medium">30~40명의 친구들과 동시에 접속해 각자의 멋진 작품을 공유하고 감상해보세요!</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-extrabold">
            <School className="w-4 h-4" />
            <span>내 정보 등록:</span>
          </div>
          <div className="flex gap-2 flex-1 md:flex-none">
            <input
              type="text"
              placeholder="예) 서울초 5-2"
              value={schoolInfo}
              onChange={(e) => setSchoolInfo(e.target.value)}
              className="bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner w-28 font-semibold"
            />
            <input
              type="text"
              placeholder="이름 (필수)"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner w-24 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* 2. Share My Canvas form */}
      <div className="bg-indigo-50/55 rounded-2xl p-4 border border-indigo-100">
        <form onSubmit={handleShareMasterpiece} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          <div className="flex-1 space-y-1 w-full">
            <span className="text-[11px] text-indigo-700 font-black flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              지금 내 화면의 스트링아트를 미술관에 전시하기:
            </span>
            <input
              type="text"
              placeholder="멋진 내 작품의 이름을 지어주세요! (예: 보라빛 장미꽃, 기하학 비밀번호)"
              value={shareTitle}
              onChange={(e) => setShareTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-semibold shadow-sm"
            />
          </div>
          <button
            type="submit"
            id="btn-share-post"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
          >
            <span>전시관에 올리기</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 3. Real-time Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            아직 올라온 작품이 없습니다. 첫 번째 영광의 스트링아트를 전시해보세요!
          </div>
        ) : (
          posts.map((post) => {
            const hasLiked = post.likedBy.includes(userId);
            const formattedDate = new Date(post.createdAt).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={post.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-300 transition-all flex flex-col gap-3 group relative hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                {/* Thumbnail Display with Canvas */}
                <div className="flex justify-center bg-slate-900 rounded-xl p-2 relative overflow-hidden">
                  <PostThumbnail post={post} />
                  
                  {/* Load Template overlay on hover */}
                  <div className="absolute inset-0 bg-slate-900/85 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 p-3">
                    <button
                      onClick={() => onLoadTemplate({
                        shape: post.shape,
                        N: post.pointsCount,
                        divisionLine: post.divisionLine,
                        rule1: post.rule1,
                        rule2: post.rule2,
                        manualLines: post.manualLines
                      })}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] py-2 px-3 rounded-lg shadow-md flex items-center gap-1 transition-all"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>내 캔버스로 불러오기</span>
                    </button>
                  </div>
                </div>

                {/* Meta details */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-black text-slate-800 truncate flex-1" title={post.title}>
                      {post.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono pl-2">{formattedDate}</span>
                  </div>
                  
                  {/* Author information */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-slate-700 truncate max-w-[100px]">{post.author}</span>
                    {post.schoolInfo && (
                      <span className="text-[9px] text-slate-400 truncate max-w-[80px]">({post.schoolInfo})</span>
                    )}
                  </div>
                </div>

                {/* Spec Indicators */}
                <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-2 text-[9px]">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold uppercase">
                    {post.shape === 'circle' ? '원' : post.shape === 'square' ? '사각' : post.shape === 'triangle' ? '삼각' : post.shape === 'pentagon' ? '오각' : '육각'}
                  </span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-extrabold font-mono">
                    {post.pointsCount}등분
                  </span>
                  {(post.rule1?.enabled || post.rule2?.enabled) && (
                    <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-extrabold">
                      규칙있음
                    </span>
                  )}
                  {post.manualLines?.length > 0 && (
                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-extrabold">
                      수동실감기
                    </span>
                  )}
                </div>

                {/* Like & Comment interactivity bar */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  {/* Hearts */}
                  <button
                    onClick={() => handleLike(post)}
                    className={`flex items-center gap-1.5 text-[11px] font-bold py-1 px-2 rounded-lg transition-all ${
                      hasLiked 
                        ? 'text-rose-600 bg-rose-50' 
                        : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-600' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  {/* Comments button */}
                  <button
                    onClick={() => setActiveCommentsPost(post)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-indigo-650 py-1 px-2 rounded-lg hover:bg-indigo-50 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>댓글 토론</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 4. Real-time Comment Drawer/Modal popups */}
      {activeCommentsPost && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-slate-50 border-b border-slate-150">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>&quot;{activeCommentsPost.title}&quot; 댓글 토론방</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">만든이: {activeCommentsPost.author}</p>
              </div>
              <button
                onClick={() => setActiveCommentsPost(null)}
                className="text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of comments (scroller) */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 min-h-[250px]">
              {comments.length === 0 ? (
                <div className="text-center text-slate-400 py-12 text-xs font-semibold">
                  아직 댓글이 없습니다. 수학 질문이나 감상평을 가장 먼저 써보세요!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span className="text-indigo-650 font-black">{comment.author}</span>
                      <span>{new Date(comment.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed break-words">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form input */}
            <form onSubmit={handleAddComment} className="p-4 bg-slate-50 border-t border-slate-150 flex gap-2">
              <input
                type="text"
                placeholder={studentName ? '수학 규칙 질문이나 칭찬을 써보세요!' : '댓글을 달려면 우측 상단 프로필 이름을 등록해 주세요.'}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                disabled={!studentName}
                className="flex-1 bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 shadow-inner font-semibold"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim() || !studentName}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center shadow-md shadow-indigo-100"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

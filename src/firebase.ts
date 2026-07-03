/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  arrayUnion, 
  arrayRemove, 
  increment, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { GalleryPost, Comment } from './types';
import config from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
});

// Initialize Firestore with specific database ID if provided
const db = initializeFirestore(app, {}, config.firestoreDatabaseId || '(default)');

// Collections
const POSTS_COLLECTION = 'string_art_posts';

/**
 * Saves a new string art creation to the gallery board
 */
export async function savePost(post: Omit<GalleryPost, 'id' | 'likes' | 'likedBy' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
      ...post,
      createdAt: Date.now(), // timestamp
      likes: 0,
      likedBy: []
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
}

/**
 * Subscribes to recent gallery posts in real-time
 */
export function subscribeToPosts(callback: (posts: GalleryPost[]) => void, maxCount = 50): () => void {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(maxCount)
  );

  return onSnapshot(q, (snapshot) => {
    const posts: GalleryPost[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        title: data.title || '무제 스트링아트',
        author: data.author || '익명',
        schoolInfo: data.schoolInfo || '',
        createdAt: data.createdAt || Date.now(),
        shape: data.shape || 'circle',
        pointsCount: data.pointsCount || 36,
        divisionLine: data.divisionLine || 'none',
        rule1: data.rule1 || { enabled: false },
        rule2: data.rule2 || { enabled: false },
        manualLines: data.manualLines || [],
        likes: data.likes || 0,
        likedBy: data.likedBy || []
      } as GalleryPost);
    });
    callback(posts);
  }, (error) => {
    console.error('Error listening to posts:', error);
  });
}

/**
 * Likes or unlikes a post
 */
export async function toggleLikePost(postId: string, userId: string, hasLiked: boolean): Promise<void> {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  try {
    await updateDoc(postRef, {
      likedBy: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
      likes: increment(hasLiked ? -1 : 1)
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

/**
 * Add a comment to a post
 */
export async function addCommentToPost(postId: string, author: string, text: string): Promise<string> {
  try {
    const commentsCol = collection(db, POSTS_COLLECTION, postId, 'comments');
    const docRef = await addDoc(commentsCol, {
      author,
      text,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Subscribe to comments for a specific post
 */
export function subscribeToComments(postId: string, callback: (comments: Comment[]) => void): () => void {
  const commentsCol = collection(db, POSTS_COLLECTION, postId, 'comments');
  const q = query(commentsCol, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const comments: Comment[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        author: data.author || '익명',
        text: data.text || '',
        createdAt: data.createdAt || Date.now()
      });
    });
    callback(comments);
  }, (error) => {
    console.error('Error listening to comments:', error);
  });
}

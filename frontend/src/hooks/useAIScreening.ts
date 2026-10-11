// ═══════════════════════════════════════════════════════════════════════════════
//  USE AI SCREENING HOOK
//  Manages the AI screening lifecycle for posts
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { Post, ScreeningStage } from "@/types";
import { AI_SCREENING_CONFIG } from "@/lib/constants";
import { runAIScreening, checkSLAExpiry } from "@/lib/ai-screening";

interface ScreeningProgress {
  postId: string;
  progress: number; // 0-100
  stage: ScreeningStage;
  message: string;
}

export function useAIScreening(posts: Post[], setPosts: React.Dispatch<React.SetStateAction<Post[]>>) {
  const [screeningProgress, setScreeningProgress] = useState<Record<string, ScreeningProgress>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start AI screening for a new post
  const startScreening = useCallback(async (post: Post) => {
    setScreeningProgress(prev => ({
      ...prev,
      [post.id]: { postId: post.id, progress: 0, stage: "ai_screening", message: "AI analyzing content..." }
    }));

    try {
      const screenedPost = await runAIScreening(post, (progress) => {
        setScreeningProgress(prev => ({
          ...prev,
          [post.id]: { ...prev[post.id], progress, message: `Analyzing... ${progress}%` }
        }));
      });

      setPosts(prev => prev.map(p => p.id === post.id ? screenedPost : p));

      setScreeningProgress(prev => ({
        ...prev,
        [post.id]: { 
          postId: post.id, 
          progress: 100, 
          stage: screenedPost.screeningStage || "completed", 
          message: getStageMessage(screenedPost.screeningStage || "completed") 
        }
      }));

      // Clean up progress after a delay
      setTimeout(() => {
        setScreeningProgress(prev => {
          const next = { ...prev };
          delete next[post.id];
          return next;
        });
      }, 5000);

    } catch (error) {
      console.error("AI screening failed:", error);
      setScreeningProgress(prev => ({
        ...prev,
        [post.id]: { postId: post.id, progress: 0, stage: "ai_screening", message: "Screening failed. Retrying..." }
      }));
    }
  }, [setPosts]);

  // Check SLA expiry periodically
  useEffect(() => {
    const checkInterval = setInterval(() => {
      setPosts(prev => {
        let changed = false;
        const updated = prev.map(post => {
          if (post.screeningStage === "expert_review" && post.expertReviewDeadline) {
            const updatedPost = checkSLAExpiry(post);
            if (updatedPost) {
              changed = true;
              return updatedPost;
            }
          }
          return post;
        });
        return changed ? updated : prev;
      });
    }, AI_SCREENING_CONFIG.CHECK_INTERVAL);

    intervalRef.current = checkInterval;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setPosts]);

  // Get remaining time for expert review
  const getExpertReviewTimeRemaining = useCallback((post: Post): string => {
    if (!post.expertReviewDeadline || post.screeningStage !== "expert_review") {
      return "";
    }
    const remaining = post.expertReviewDeadline - Date.now();
    if (remaining <= 0) return "Expired";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  }, []);

  // Get screening status for display
  const getScreeningStatus = useCallback((post: Post) => {
    const progress = screeningProgress[post.id];

    if (progress) {
      return {
        isActive: true,
        progress: progress.progress,
        stage: progress.stage,
        message: progress.message,
      };
    }

    if (post.screeningStage === "ai_screening") {
      return {
        isActive: true,
        progress: 50,
        stage: "ai_screening" as ScreeningStage,
        message: "AI screening in progress...",
      };
    }

    if (post.screeningStage === "expert_review") {
      return {
        isActive: true,
        progress: 100,
        stage: "expert_review" as ScreeningStage,
        message: `Expert review: ${getExpertReviewTimeRemaining(post)}`,
      };
    }

    return {
      isActive: false,
      progress: 100,
      stage: post.screeningStage || "completed",
      message: getStageMessage(post.screeningStage || "completed"),
    };
  }, [screeningProgress, getExpertReviewTimeRemaining]);

  return {
    startScreening,
    getScreeningStatus,
    getExpertReviewTimeRemaining,
    screeningProgress,
  };
}

function getStageMessage(stage: ScreeningStage): string {
  switch (stage) {
    case "ai_screening": return "AI analyzing content...";
    case "expert_review": return "Under expert review (48h SLA)";
    case "auto_unlock": return "Auto-unlocked after SLA expiry";
    case "completed": return "Screening complete";
    default: return "Processing...";
  }
}

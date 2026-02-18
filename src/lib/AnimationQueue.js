/**
 * AnimationQueue - Manages sequential display of welcome animations
 * Ensures animations don't overlap and are displayed in order
 */
export class AnimationQueue {
    constructor(maxQueueSize = 10) {
        this.queue = [];
        this.isPlaying = false;
        this.maxQueueSize = maxQueueSize;
        this.currentAnimation = null;
    }

    /**
     * Add a team to the animation queue
     * @param {Object} team - Team object to animate
     */
    enqueue(team) {
        if (this.queue.length >= this.maxQueueSize) {
            console.warn('Animation queue is full, dropping oldest animation');
            this.queue.shift();
        }
        
        this.queue.push(team);
        
        if (!this.isPlaying) {
            this.playNext();
        }
    }

    /**
     * Play the next animation in the queue
     */
    playNext() {
        if (this.queue.length === 0) {
            this.isPlaying = false;
            this.currentAnimation = null;
            return;
        }

        this.isPlaying = true;
        this.currentAnimation = this.queue.shift();
        
        // Notify listeners that a new animation should be displayed
        if (this.onAnimationStart) {
            this.onAnimationStart(this.currentAnimation);
        }
    }

    /**
     * Called when current animation finishes
     */
    onAnimationComplete() {
        this.playNext();
    }

    /**
     * Manually dismiss current animation and play next
     */
    skipCurrent() {
        this.onAnimationComplete();
    }

    /**
     * Clear all queued animations
     */
    clear() {
        this.queue = [];
        this.isPlaying = false;
        this.currentAnimation = null;
    }

    /**
     * Get current queue size
     */
    getQueueSize() {
        return this.queue.length;
    }

    /**
     * Check if an animation is currently playing
     */
    isAnimationPlaying() {
        return this.isPlaying;
    }

    /**
     * Get the current animation
     */
    getCurrentAnimation() {
        return this.currentAnimation;
    }
}

// React hook for using AnimationQueue
import { useState, useEffect, useRef } from 'react';

export function useAnimationQueue(maxQueueSize = 10) {
    const queueRef = useRef(null);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [queueSize, setQueueSize] = useState(0);

    useEffect(() => {
        queueRef.current = new AnimationQueue(maxQueueSize);
        
        queueRef.current.onAnimationStart = (team) => {
            setCurrentTeam(team);
            setQueueSize(queueRef.current.getQueueSize());
        };

        return () => {
            if (queueRef.current) {
                queueRef.current.clear();
            }
        };
    }, [maxQueueSize]);

    const addToQueue = (team) => {
        if (queueRef.current) {
            queueRef.current.enqueue(team);
            setQueueSize(queueRef.current.getQueueSize());
        }
    };

    const onAnimationComplete = () => {
        if (queueRef.current) {
            queueRef.current.onAnimationComplete();
            setQueueSize(queueRef.current.getQueueSize());
        }
    };

    const skipCurrent = () => {
        if (queueRef.current) {
            queueRef.current.skipCurrent();
            setQueueSize(queueRef.current.getQueueSize());
        }
    };

    const clearQueue = () => {
        if (queueRef.current) {
            queueRef.current.clear();
            setCurrentTeam(null);
            setQueueSize(0);
        }
    };

    return {
        currentTeam,
        queueSize,
        addToQueue,
        onAnimationComplete,
        skipCurrent,
        clearQueue,
    };
}

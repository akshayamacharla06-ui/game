/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../types';

interface MusicPlayerProps {
  songs: Song[];
  activeSong: Song;
  onSongChange: (song: Song) => void;
}

export default function MusicPlayer({ songs, activeSong, onSongChange }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeSong]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(isNaN(p) ? 0 : p);
      }
    };

    const handleEnded = () => {
      handleNext();
    };

    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
    }

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const currentIndex = songs.findIndex(s => s.id === activeSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    onSongChange(songs[nextIndex]);
    setProgress(0);
  };

  const handlePrev = () => {
    const currentIndex = songs.findIndex(s => s.id === activeSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    onSongChange(songs[prevIndex]);
    setProgress(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
      setProgress(newProgress);
    }
  };

  return (
    <footer className="h-24 border-t border-[#00f3ff]/20 bg-[#0a0a0a] px-8 flex items-center justify-between z-50">
      <audio
        ref={audioRef}
        src={`https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`}
      />
      
      {/* Left: Song Info */}
      <div className="flex items-center gap-4 w-1/4">
        <motion.div 
          animate={{ rotate: isPlaying ? [0, 360] : 0 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 bg-white/5 rounded border border-[#00f3ff]/20 flex items-center justify-center overflow-hidden"
        >
           <div className="w-full h-full bg-gradient-to-tr from-cyan-900 to-pink-900 animate-pulse flex items-center justify-center">
              <Music2 className="w-6 h-6 text-white/20" />
           </div>
        </motion.div>
        <div className="flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            <motion.span 
              key={activeSong.title}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-bold truncate tracking-tight text-white/90"
            >
              {activeSong.title}
            </motion.span>
          </AnimatePresence>
          <span className="text-[10px] text-white/40 uppercase tracking-tighter truncate font-medium">
            {activeSong.artist}
          </span>
        </div>
      </div>

      {/* Center: Controls & Progress */}
      <div className="flex flex-col items-center gap-3 flex-1 max-w-xl">
        <div className="flex items-center gap-8">
          <button 
            onClick={handlePrev}
            className="text-white/40 hover:text-[#00f3ff] transition-all transform hover:scale-110 active:scale-95"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button 
            onClick={handleTogglePlay}
            className="w-11 h-11 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
          </button>

          <button 
            onClick={handleNext}
            className="text-white/40 hover:text-[#00f3ff] transition-all transform hover:scale-110 active:scale-95"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        <div className="w-full flex items-center gap-3">
          <span className="text-[10px] font-mono text-white/30 w-8">0:00</span>
          <div className="flex-1 relative h-4 flex items-center group">
            <div className="absolute w-full h-1 bg-white/10 rounded-full" />
            <div 
              className="absolute h-1 bg-gradient-to-r from-[#00f3ff] to-pink-500 rounded-full shadow-[0_0_8px_#00f3ff]" 
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
          <span className="text-[10px] font-mono text-white/30 w-8">3:55</span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="flex items-center justify-end gap-4 w-1/4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-white/30" />
          <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden group">
            <div className="h-full bg-white/40 w-[70%] group-hover:bg-[#00f3ff]/50 transition-colors"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}

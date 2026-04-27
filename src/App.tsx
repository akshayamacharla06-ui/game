/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Song } from './types';
import { Music, Gamepad2, Github } from 'lucide-react';
import { motion } from 'motion/react';

const DUMMY_SONGS: Song[] = [
  { id: '1', title: 'Electric Dreams', artist: 'Synthia', duration: 180, color: '#06b6d4' },
  { id: '2', title: 'Neon Pulse', artist: 'GlitchWave', duration: 210, color: '#ec4899' },
  { id: '3', title: 'Cyber City Horizon', artist: 'Flux', duration: 240, color: '#84cc16' }
];

export default function App() {
  const [activeSong, setActiveSong] = useState<Song>(DUMMY_SONGS[0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  return (
    <div className="h-screen bg-[#050505] text-white font-sans flex flex-col overflow-hidden border-[12px] border-[#111]">
      {/* Top Navigation / Status Bar */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-[#00f3ff]/20 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-[#00f3ff] rounded-full animate-pulse shadow-[0_0_10px_#00f3ff]"></div>
          <h1 className="text-2xl font-black tracking-tighter italic uppercase underline decoration-[#00f3ff]/40">Neon Synth-Snake</h1>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#00f3ff]/60 font-medium">Session Score</span>
            <span className="text-3xl font-mono font-bold leading-none tabular-nums tracking-tighter">{score.toString().padStart(6, '0')}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-pink-500/60 font-medium">Record</span>
            <span className="text-3xl font-mono font-bold leading-none text-pink-500 tabular-nums tracking-tighter">{highScore.toString().padStart(6, '0')}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar: Playlist */}
        <aside className="w-72 border-r border-[#00f3ff]/20 p-6 flex flex-col gap-6 bg-[#080808]">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#00f3ff]">Neural Playlist</h2>
          <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar">
            {DUMMY_SONGS.map((song) => (
              <div 
                key={song.id}
                onClick={() => setActiveSong(song)}
                className={`p-4 rounded transition-all cursor-pointer flex flex-col gap-1 border ${
                  activeSong.id === song.id 
                  ? 'bg-[#00f3ff]/10 border-[#00f3ff]/30' 
                  : 'border-white/5 hover:bg-white/5 opacity-70'
                }`}
              >
                <span className={`text-[10px] font-mono ${activeSong.id === song.id ? 'text-[#00f3ff]' : 'text-white/30'}`}>
                  {activeSong.id === song.id ? '● ACTIVE' : '○ QUEUED'}
                </span>
                <span className="font-bold text-sm tracking-tight">{song.title}</span>
                <span className="text-[10px] opacity-50 uppercase tracking-tighter">{song.artist}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto p-4 border border-pink-500/20 rounded-lg bg-pink-500/5">
            <p className="text-[10px] uppercase tracking-widest leading-relaxed text-pink-200/50">
              Snake speed synced to BPM: <span className="text-pink-500 font-bold">128</span>
            </p>
          </div>
        </aside>

        {/* Central: Game Window */}
        <section className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00f3ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="relative transform scale-110 lg:scale-125">
             <SnakeGame onScoreChange={setScore} onHighScoreChange={setHighScore} />
          </div>
        </section>

        {/* Sidebar: Stats */}
        <aside className="w-48 border-l border-[#00f3ff]/20 p-6 flex flex-col items-center gap-8 bg-[#080808]">
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 border border-[#00f3ff]/40 rounded-full flex items-center justify-center group-hover:border-[#00f3ff] transition-colors shadow-[0_0_10px_rgba(0,243,255,0.1)]">
              <span className="text-[#00f3ff] text-[10px] font-black italic tracking-tighter uppercase">BPM</span>
            </div>
            <span className="text-2xl font-mono font-bold">128</span>
          </div>
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 border border-pink-500/40 rounded-full flex items-center justify-center group-hover:border-pink-500 transition-colors shadow-[0_0_10px_rgba(236,72,153,0.1)]">
              <span className="text-pink-500 text-[10px] font-black italic tracking-tighter uppercase">LEN</span>
            </div>
            <span className="text-2xl font-mono font-bold">012</span>
          </div>
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 border border-yellow-500/40 rounded-full flex items-center justify-center group-hover:border-yellow-500 transition-colors">
              <span className="text-yellow-500 text-[10px] font-black italic tracking-tighter uppercase">LVL</span>
            </div>
            <span className="text-2xl font-mono font-bold">04</span>
          </div>
        </aside>
      </main>

      {/* Bottom: Music Controls */}
      <MusicPlayer songs={DUMMY_SONGS} activeSong={activeSong} onSongChange={setActiveSong} />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Point, GameStatus } from '../types';
import { Trophy, RefreshCw, Play, Pause } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 150;

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  onHighScoreChange: (highScore: number) => void;
}

export default function SnakeGame({ onScoreChange, onHighScoreChange }: SnakeGameProps) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const directionRef = useRef<Point>(INITIAL_DIRECTION);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    onScoreChange(0);
    setStatus('PLAYING');
  };

  const gameOver = () => {
    setStatus('GAME_OVER');
    if (score > highScore) {
      setHighScore(score);
      onHighScoreChange(score);
    }
  };

  const moveSnake = useCallback(() => {
    if (status !== 'PLAYING') return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + directionRef.current.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + directionRef.current.y + GRID_SIZE) % GRID_SIZE,
      };

      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        onScoreChange(newScore);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood, status, score, highScore, onScoreChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current.y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (directionRef.current.y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (directionRef.current.x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (directionRef.current.x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
        case ' ':
          if (status === 'PLAYING') setStatus('PAUSED');
          else if (status === 'PAUSED') setStatus('PLAYING');
          else if (status === 'IDLE' || status === 'GAME_OVER') resetGame();
          break;
      }
      setDirection({ ...directionRef.current });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  useEffect(() => {
    const interval = setInterval(moveSnake, Math.max(50, BASE_SPEED - Math.floor(score / 50) * 10));
    return () => clearInterval(interval);
  }, [moveSnake, score]);

  return (
    <div className="flex flex-col items-center">
      {/* Game Window Backdrop */}
      <div className="relative w-[380px] h-[380px] lg:w-[480px] lg:h-[480px] border-2 border-[#00f3ff]/40 shadow-[0_0_50px_rgba(0,243,255,0.15)] bg-[#050505] p-1 overflow-hidden">
        {/* Dynamic Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>
        
        {/* The Grid */}
        <div 
          className="relative h-full w-full grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
          }}
        >
          {/* Static Grid Decor */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] grid grid-cols-20 grid-rows-20">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-white/40" />
            ))}
          </div>

          {/* Food */}
          <motion.div
            className="absolute rounded-full shadow-[0_0_15px_#ec4899] z-20"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(food.x / GRID_SIZE) * 100}%`,
              top: `${(food.y / GRID_SIZE) * 100}%`,
              background: '#ec4899',
            }}
            animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />

          {/* Snake */}
          {snake.map((segment, i) => (
            <div
              key={`${i}-${segment.x}-${segment.y}`}
              className="absolute z-20 transition-all duration-200"
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(segment.x / GRID_SIZE) * 100}%`,
                top: `${(segment.y / GRID_SIZE) * 100}%`,
              }}
            >
              <div 
                className={`w-full h-full rounded-sm shadow-sm ${
                  i === 0 
                  ? 'bg-[#00f3ff] shadow-[0_0_20px_#00f3ff]' 
                  : 'bg-[#00f3ff]/70'
                }`}
                style={{
                  opacity: 1 - (i / snake.length) * 0.4
                }}
              />
            </div>
          ))}

          {/* Game Over / Pause Overlays */}
          <AnimatePresence>
            {(status === 'IDLE' || status === 'GAME_OVER' || status === 'PAUSED') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-[#0a0a0a]/90 flex flex-col items-center justify-center p-6 backdrop-blur-md"
              >
                {status === 'GAME_OVER' && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8 text-center"
                  >
                    <h2 className="text-6xl font-black italic uppercase tracking-tighter text-pink-500 mb-2 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">Crit Failed</h2>
                    <p className="text-[#00f3ff] font-mono text-sm tracking-[0.3em] uppercase">Score Recorded: {score}</p>
                  </motion.div>
                )}

                {status === 'IDLE' && (
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="mb-10 text-center"
                  >
                    <h2 className="text-4xl font-bold uppercase tracking-widest text-[#00f3ff] italic">Ready_System</h2>
                    <p className="text-white/30 text-xs mt-2 uppercase tracking-[0.2em]">Press SPACE to initialize</p>
                  </motion.div>
                )}

                <div className="flex flex-col gap-4 w-full max-w-[220px]">
                  <button
                    onClick={resetGame}
                    className="group px-8 py-3 bg-[#00f3ff] text-black font-black uppercase italic tracking-tighter hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                  >
                    {status === 'GAME_OVER' ? 'Re-Initialize' : 'Run Protocol'}
                  </button>
                  
                  {status === 'PAUSED' && (
                    <button
                      onClick={() => setStatus('PLAYING')}
                      className="px-8 py-3 border border-[#00f3ff]/30 text-[#00f3ff] font-bold uppercase tracking-widest hover:bg-[#00f3ff]/10 transition-all"
                    >
                      Resume
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

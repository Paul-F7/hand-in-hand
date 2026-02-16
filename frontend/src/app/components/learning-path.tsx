import { useMemo } from "react";
import { LessonNode } from "./lesson-node";
import { PixelCharacter } from "./pixel-character";
import type { LessonStatus } from "./lesson-node";

export interface PathLesson {
  id: number;
  title: string;
  description: string;
  type: "lesson" | "checkpoint" | "achievement";
  xp: number;
  unit: number;
  status: LessonStatus;
  position: { x: number; y: number };
}

interface LearningPathProps {
  lessons: PathLesson[];
  onLessonClick: (id: number) => void;
  onSkipToTest?: (unitNumber: number) => void;
}

// Seeded random for deterministic decoration placement
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Check if a point is too close to any lesson node
function isTooCloseToLesson(x: number, y: number, lessons: PathLesson[], minDist = 120): boolean {
  return lessons.some((l) => {
    const dx = x - l.position.x;
    const dy = y - l.position.y;
    return Math.sqrt(dx * dx + dy * dy) < minDist;
  });
}

export function LearningPath({ lessons, onLessonClick, onSkipToTest }: LearningPathProps) {
  // Create path segments with status for coloring
  const pathSegments = useMemo(() => {
    if (lessons.length === 0) return [];
    const segments: { path: string; isCompleted: boolean }[] = [];

    for (let i = 1; i < lessons.length; i++) {
      const curr = lessons[i].position;
      const prev = lessons[i - 1].position;
      const cpX1 = prev.x;
      const cpY1 = prev.y + (curr.y - prev.y) * 0.5;
      const cpX2 = curr.x;
      const cpY2 = prev.y + (curr.y - prev.y) * 0.5;
      const pathData = `M ${prev.x} ${prev.y} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;

      // Segment is colored if the destination lesson is not locked
      const isColored = lessons[i].status !== "locked";
      segments.push({ path: pathData, isCompleted: isColored });
    }

    return segments;
  }, [lessons]);

  // Unit headers - placed above the first lesson of each unit
  const unitNames = ['Greetings & Basics', 'Family', 'Daily Life', 'Out & About'];
  const unitHeaders = useMemo(() => {
    const headers: { unit: number; name: string; x: number; y: number; isUnlocked: boolean }[] = [];
    const seenUnits = new Set<number>();
    for (const lesson of lessons) {
      if (!seenUnits.has(lesson.unit)) {
        seenUnits.add(lesson.unit);
        // Check if any lesson in this unit is unlocked (not locked)
        const unitLessons = lessons.filter(l => l.unit === lesson.unit);
        const hasUnlockedLesson = unitLessons.some(l => l.status !== 'locked');
        headers.push({
          unit: lesson.unit,
          name: unitNames[lesson.unit - 1] ?? '',
          x: lesson.position.x,
          y: lesson.position.y,
          isUnlocked: hasUnlockedLesson,
        });
      }
    }
    return headers;
  }, [lessons]);

  // Generate floating space particles scattered across the background
  const spaceParticles = useMemo(() => {
    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        id: i,
        x: seededRandom(i * 7 + 1) * 540,
        y: seededRandom(i * 7 + 2) * 5700,
        variant: Math.floor(seededRandom(i * 7 + 3) * 3),
        scale: 0.8 + seededRandom(i * 7 + 4) * 0.6,
      });
    }
    return particles;
  }, []);

  // Near-zone decorations: crystals, asteroids, space flora
  const nearDecorations = useMemo(() => {
    const decorations: { id: string; x: number; y: number; type: string }[] = [];
    for (let i = 0; i < lessons.length - 1; i++) {
      const prev = lessons[i].position;
      const curr = lessons[i + 1].position;

      const count = 2 + Math.floor(seededRandom(i * 11 + 50) * 2);
      for (let j = 0; j < count; j++) {
        const t = (j + 1) / (count + 1);
        const baseX = prev.x + (curr.x - prev.x) * t;
        const baseY = prev.y + (curr.y - prev.y) * t;
        const side = j % 2 === 0 ? 1 : -1;
        const dist = 120 + seededRandom(i * 11 + j * 3 + 51) * 120;
        const types = ["crystal_purple", "crystal_blue", "crystal_cyan", "asteroid", "space_rock", "alien_plant"];
        const dx = Math.max(10, Math.min(540, baseX + side * dist));
        const dy = baseY + (seededRandom(i * 11 + j * 3 + 52) - 0.5) * 40;
        if (isTooCloseToLesson(dx, dy, lessons, 150)) continue;
        decorations.push({
          id: `near-${i}-${j}`,
          x: dx,
          y: dy,
          type: types[Math.floor(seededRandom(i * 11 + j * 3 + 53) * types.length)],
        });
      }
    }
    return decorations;
  }, [lessons]);

  // Far-zone: space stations and alien structures
  const farDecorations = useMemo(() => {
    const items: { id: string; x: number; y: number; type: string }[] = [];

    for (let i = 0; i < lessons.length; i++) {
      const pos = lessons[i].position;

      if (i % 2 === 0) {
        const structX = pos.x > 300 ? 30 + seededRandom(i * 13 + 100) * 50 : 480 + seededRandom(i * 13 + 100) * 50;
        const offsetY = 140 + seededRandom(i * 13 + 101) * 80;
        const sy = pos.y + offsetY;
        if (!isTooCloseToLesson(structX, sy, lessons, 200)) {
          items.push({
            id: `struct-${i}`,
            x: structX,
            y: sy,
            type: "satellite",
          });
        }
      }

      if (i % 2 === 1) {
        const alienX = pos.x > 300 ? 20 + seededRandom(i * 17 + 200) * 50 : 490 + seededRandom(i * 17 + 200) * 50;
        const alienY = pos.y + 80 + seededRandom(i * 17 + 201) * 80;
        if (!isTooCloseToLesson(alienX, alienY, lessons, 200)) {
          items.push({
            id: `alien-${i}`,
            x: alienX,
            y: alienY,
            type: "alien_tower",
          });
        }
      }
    }
    return items;
  }, [lessons]);

  // Characters evenly distributed across the entire path height
  const characters = useMemo(() => {
    const chars: { id: string; x: number; y: number; type: string; scale: number; flip: boolean }[] = [];
    const characterTypes = ["knight", "wizard", "archer", "healer", "rogue", "cat", "slime", "chest"];

    if (lessons.length === 0) return chars;

    const minY = lessons[0].position.y;
    const maxY = lessons[lessons.length - 1].position.y;
    const totalHeight = maxY - minY;
    const charCount = 10;
    const spacing = totalHeight / (charCount + 1);

    for (let i = 0; i < charCount; i++) {
      // Strict even spacing with only tiny jitter to avoid stacking
      const targetY = minY + spacing * (i + 1) + (seededRandom(i * 19 + 301) - 0.5) * 40;
      // Place characters far from the path on alternating sides with wide spread
      const side = i % 2 === 0 ? -1 : 1;
      const finalX = side === -1
        ? 15 + seededRandom(i * 19 + 302) * 60    // far left: x 15-75
        : 560 + seededRandom(i * 19 + 302) * 60;  // far right: x 560-620

      // Check distance to lessons and to already-placed characters
      if (isTooCloseToLesson(finalX, targetY, lessons, 140)) continue;
      const tooCloseToOther = chars.some(c => Math.abs(c.y - targetY) < 200);
      if (tooCloseToOther) continue;

      chars.push({
        id: `char-${i}`,
        x: finalX,
        y: targetY,
        type: characterTypes[i % characterTypes.length],
        scale: 1.0 + seededRandom(i * 19 + 304) * 0.3,
        flip: seededRandom(i * 19 + 305) > 0.5,
      });
    }
    return chars;
  }, [lessons]);

  // Stardust along the path edges
  const pathStardust = useMemo(() => {
    const dust: { id: string; x: number; y: number; size: number; color: string }[] = [];
    const colors = ["#a5b4fc", "#c4b5fd", "#818cf8", "#93c5fd", "#7c3aed"];

    for (let i = 0; i < lessons.length - 1; i++) {
      const prev = lessons[i].position;
      const curr = lessons[i + 1].position;

      for (let j = 0; j < 8; j++) {
        const t = j / 8;
        const baseX = prev.x + (curr.x - prev.x) * t;
        const baseY = prev.y + (curr.y - prev.y) * t;
        const side = seededRandom(i * 23 + j * 3 + 400) > 0.5 ? 1 : -1;
        const offset = 28 + seededRandom(i * 23 + j * 3 + 401) * 15;

        dust.push({
          id: `dust-${i}-${j}`,
          x: baseX + side * offset,
          y: baseY + (seededRandom(i * 23 + j * 3 + 402) - 0.5) * 20,
          size: 2 + Math.floor(seededRandom(i * 23 + j * 3 + 403) * 3),
          color: colors[Math.floor(seededRandom(i * 23 + j * 3 + 404) * colors.length)],
        });
      }
    }
    return dust;
  }, [lessons]);

  return (
    <div className="relative w-full h-full">
      {/* Background space particles */}
      {spaceParticles.map((particle) => (
        <svg
          key={particle.id}
          className="absolute pointer-events-none pixelated"
          style={{ left: `${particle.x}px`, top: `${particle.y}px`, imageRendering: 'pixelated' }}
          width={16 * particle.scale}
          height={12 * particle.scale}
          viewBox="0 0 16 12"
        >
          {particle.variant === 0 && <>
            <rect x="4" y="2" width="2" height="2" fill="#a5b4fc" opacity="0.4" />
            <rect x="10" y="6" width="2" height="2" fill="#c4b5fd" opacity="0.3" />
            <rect x="7" y="8" width="1" height="1" fill="white" opacity="0.2" />
          </>}
          {particle.variant === 1 && <>
            <rect x="2" y="4" width="2" height="1" fill="#818cf8" opacity="0.25" />
            <rect x="8" y="2" width="3" height="1" fill="#6366f1" opacity="0.2" />
            <rect x="6" y="8" width="2" height="1" fill="#a5b4fc" opacity="0.15" />
          </>}
          {particle.variant === 2 && <>
            <rect x="3" y="3" width="4" height="2" fill="#7c3aed" opacity="0.1" />
            <rect x="8" y="6" width="3" height="2" fill="#6366f1" opacity="0.08" />
          </>}
        </svg>
      ))}

      {/* SVG Path Layer - cosmic trail */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '100%', height: '5800px' }}>
        <defs>
          <pattern id="cosmicPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#1e1b4b" />
            <rect x="0" y="0" width="4" height="4" fill="#312e81" opacity="0.6" />
            <rect x="8" y="4" width="4" height="4" fill="#1e1b4b" opacity="0.5" />
            <rect x="4" y="8" width="4" height="4" fill="#2e1065" opacity="0.4" />
            <rect x="12" y="12" width="4" height="4" fill="#1e1b4b" opacity="0.3" />
            <rect x="2" y="12" width="3" height="3" fill="#312e81" opacity="0.5" />
            <rect x="10" y="2" width="3" height="3" fill="#2e1065" opacity="0.4" />
          </pattern>

          <pattern id="greyPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#1f2937" />
            <rect x="0" y="0" width="4" height="4" fill="#374151" opacity="0.5" />
            <rect x="8" y="4" width="4" height="4" fill="#1f2937" opacity="0.4" />
            <rect x="4" y="8" width="4" height="4" fill="#111827" opacity="0.3" />
            <rect x="12" y="12" width="4" height="4" fill="#1f2937" opacity="0.2" />
          </pattern>

          <pattern id="glowEdge" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#312e81" />
            <rect x="0" y="0" width="4" height="4" fill="#4338ca" opacity="0.7" />
            <rect x="4" y="4" width="4" height="4" fill="#3730a3" opacity="0.5" />
          </pattern>

          <pattern id="greyEdge" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#374151" />
            <rect x="0" y="0" width="4" height="4" fill="#4b5563" opacity="0.5" />
            <rect x="4" y="4" width="4" height="4" fill="#1f2937" opacity="0.4" />
          </pattern>
        </defs>

        {pathSegments.map((segment, index) => (
          <g key={`segment-${index}`}>
            <path
              d={segment.path}
              fill="none"
              stroke={segment.isCompleted ? "#6366f1" : "#374151"}
              strokeWidth="62"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={segment.isCompleted ? 0.08 : 0.05}
            />
            <path
              d={segment.path}
              fill="none"
              stroke="#0a0a1a"
              strokeWidth="58"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
              transform="translate(2, 3)"
            />
            <path
              d={segment.path}
              fill="none"
              stroke={segment.isCompleted ? "url(#glowEdge)" : "url(#greyEdge)"}
              strokeWidth="56"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={segment.path}
              fill="none"
              stroke={segment.isCompleted ? "url(#cosmicPattern)" : "url(#greyPattern)"}
              strokeWidth="48"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={segment.path}
              fill="none"
              stroke={segment.isCompleted ? "#818cf8" : "#4b5563"}
              strokeWidth="38"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={segment.isCompleted ? 0.12 : 0.08}
            />
            <path
              d={segment.path}
              fill="none"
              stroke={segment.isCompleted ? "#a5b4fc" : "#6b7280"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={segment.isCompleted ? 0.2 : 0.1}
              strokeDasharray="8 16"
            />
          </g>
        ))}

        {pathStardust.map((p) => (
          <rect
            key={p.id}
            x={p.x}
            y={p.y}
            width={p.size}
            height={p.size}
            fill={p.color}
            opacity="0.5"
            rx="0"
          />
        ))}
      </svg>

      {/* Near-zone decorations */}
      {nearDecorations.map((dec) => (
        <NearDecoration key={dec.id} x={dec.x} y={dec.y} type={dec.type} />
      ))}

      {/* Far-zone: satellites and alien structures */}
      {farDecorations.map((item) => {
        if (item.type === "satellite") {
          return (
            <div key={item.id} style={{ position: 'absolute', left: 0, top: 0, zIndex: 3 }}>
              <PixelSatellite x={item.x} y={item.y} />
            </div>
          );
        }
        if (item.type === "alien_tower") {
          return (
            <div key={item.id} style={{ position: 'absolute', left: 0, top: 0, zIndex: 3 }}>
              <AlienTower x={item.x} y={item.y} />
            </div>
          );
        }
        return null;
      })}

      {/* Characters */}
      {characters.map((char) => (
        <div key={char.id} style={{ position: 'absolute', left: 0, top: 0, zIndex: 5 }}>
          <PixelCharacter
            type={char.type}
            position={{ x: char.x, y: char.y }}
            scale={char.scale}
            flip={char.flip}
          />
        </div>
      ))}

      {/* Unit Header Banners */}
      {unitHeaders.map((header) => (
        <div
          key={`unit-${header.unit}`}
          className="absolute pixelated flex flex-col items-center"
          style={{
            left: `${header.x}px`,
            top: `${header.y - 210}px`,
            transform: 'translate(-50%, 0)',
            zIndex: 15,
            imageRendering: 'pixelated',
          }}
        >
          <svg width="320" height="72" viewBox="0 0 320 72" className="pixelated">
            <rect x="4" y="4" width="312" height="64" fill="#0f0a2e" />
            <rect x="0" y="0" width="320" height="4" fill="#818cf8" />
            <rect x="0" y="68" width="320" height="4" fill="#818cf8" />
            <rect x="0" y="0" width="4" height="72" fill="#818cf8" />
            <rect x="316" y="0" width="4" height="72" fill="#818cf8" />
            <rect x="10" y="10" width="6" height="6" fill="#6366f1" />
            <rect x="304" y="10" width="6" height="6" fill="#6366f1" />
            <rect x="10" y="56" width="6" height="6" fill="#6366f1" />
            <rect x="304" y="56" width="6" height="6" fill="#6366f1" />
            <rect x="28" y="30" width="8" height="8" fill="#c4b5fd" />
            <rect x="284" y="30" width="8" height="8" fill="#c4b5fd" />
            <text
              x="160"
              y="28"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#c4b5fd"
              fontSize="16"
              fontFamily="var(--font-pixel)"
            >
              Unit {header.unit}
            </text>
            <text
              x="160"
              y="52"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#a5b4fc"
              fontSize="9"
              fontFamily="var(--font-pixel)"
            >
              {header.name}
            </text>
          </svg>
          {onSkipToTest && header.isUnlocked && (
            <button
              onClick={() => onSkipToTest(header.unit)}
              className="mt-2 flex items-center gap-2 px-4 py-1.5 cursor-pointer hover:brightness-125 transition"
              style={{
                background: '#1a0a2e',
                border: '2px solid #fbbf24',
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: '#fbbf24',
                letterSpacing: '0.5px',
              }}
            >
              <svg width="10" height="12" viewBox="0 0 10 12" style={{ imageRendering: 'pixelated' }}>
                <rect x="2" y="0" width="6" height="2" fill="#fbbf24" />
                <rect x="0" y="2" width="10" height="2" fill="#fbbf24" />
                <rect x="0" y="4" width="10" height="4" fill="#f59e0b" />
                <rect x="2" y="8" width="6" height="2" fill="#d97706" />
                <rect x="4" y="10" width="2" height="2" fill="#b45309" />
              </svg>
              Jump to Unit Test
            </button>
          )}
        </div>
      ))}

      {/* Lesson Nodes */}
      {lessons.map((lesson) => (
        <LessonNode
          key={lesson.id}
          title={lesson.title}
          description={lesson.description}
          type={lesson.type}
          xp={lesson.xp}
          status={lesson.status}
          position={lesson.position}
          onClick={() => onLessonClick(lesson.id)}
        />
      ))}
    </div>
  );
}

// Near-zone decoration component
function NearDecoration({ x, y, type }: { x: number; y: number; type: string }) {
  const getDecoration = () => {
    switch (type) {
      case "crystal_purple":
        return (
          <svg width="12" height="20" viewBox="0 0 12 20">
            <rect x="4" y="0" width="4" height="4" fill="#a855f7" />
            <rect x="2" y="4" width="8" height="4" fill="#9333ea" />
            <rect x="2" y="8" width="8" height="4" fill="#7e22ce" />
            <rect x="4" y="12" width="4" height="4" fill="#6b21a8" />
            <rect x="4" y="16" width="4" height="4" fill="#581c87" />
            <rect x="4" y="2" width="2" height="4" fill="#c084fc" opacity="0.6" />
          </svg>
        );
      case "crystal_blue":
        return (
          <svg width="12" height="20" viewBox="0 0 12 20">
            <rect x="4" y="0" width="4" height="4" fill="#60a5fa" />
            <rect x="2" y="4" width="8" height="4" fill="#3b82f6" />
            <rect x="2" y="8" width="8" height="4" fill="#2563eb" />
            <rect x="4" y="12" width="4" height="4" fill="#1d4ed8" />
            <rect x="4" y="16" width="4" height="4" fill="#1e3a5f" />
            <rect x="4" y="2" width="2" height="4" fill="#93c5fd" opacity="0.6" />
          </svg>
        );
      case "crystal_cyan":
        return (
          <svg width="10" height="16" viewBox="0 0 10 16">
            <rect x="3" y="0" width="4" height="4" fill="#22d3ee" />
            <rect x="2" y="4" width="6" height="4" fill="#06b6d4" />
            <rect x="2" y="8" width="6" height="4" fill="#0891b2" />
            <rect x="3" y="12" width="4" height="4" fill="#155e75" />
            <rect x="3" y="2" width="2" height="3" fill="#67e8f9" opacity="0.5" />
          </svg>
        );
      case "asteroid":
        return (
          <svg width="18" height="14" viewBox="0 0 18 14">
            <rect x="4" y="0" width="10" height="2" fill="#44403c" />
            <rect x="2" y="2" width="14" height="4" fill="#57534e" />
            <rect x="0" y="6" width="18" height="4" fill="#44403c" />
            <rect x="4" y="10" width="10" height="2" fill="#3f3f46" />
            <rect x="6" y="12" width="6" height="2" fill="#27272a" />
            <rect x="4" y="4" width="4" height="2" fill="#3f3f46" opacity="0.7" />
            <rect x="10" y="6" width="3" height="2" fill="#3f3f46" opacity="0.5" />
          </svg>
        );
      case "space_rock":
        return (
          <svg width="14" height="10" viewBox="0 0 14 10">
            <rect x="2" y="2" width="10" height="6" fill="#3f3f46" />
            <rect x="4" y="0" width="6" height="2" fill="#52525b" />
            <rect x="0" y="4" width="2" height="4" fill="#27272a" />
            <rect x="12" y="4" width="2" height="4" fill="#27272a" />
            <rect x="2" y="8" width="10" height="2" fill="#18181b" />
            <rect x="5" y="2" width="4" height="2" fill="#71717a" opacity="0.4" />
          </svg>
        );
      case "alien_plant":
        return (
          <svg width="16" height="20" viewBox="0 0 16 20">
            <rect x="7" y="8" width="2" height="12" fill="#4ade80" opacity="0.6" />
            <rect x="5" y="2" width="6" height="6" fill="#22d3ee" opacity="0.5" />
            <rect x="6" y="3" width="4" height="4" fill="#67e8f9" opacity="0.7" />
            <rect x="7" y="4" width="2" height="2" fill="white" opacity="0.4" />
            <rect x="2" y="10" width="4" height="2" fill="#4ade80" opacity="0.4" />
            <rect x="10" y="12" width="4" height="2" fill="#4ade80" opacity="0.4" />
            <rect x="1" y="8" width="2" height="2" fill="#22d3ee" opacity="0.3" />
            <rect x="13" y="10" width="2" height="2" fill="#22d3ee" opacity="0.3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="absolute pointer-events-none pixelated"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%) scale(1.5)',
        imageRendering: 'pixelated',
        zIndex: 2,
      }}
    >
      {getDecoration()}
    </div>
  );
}

// Pixel satellite for the far zone
function PixelSatellite({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none pixelated"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        imageRendering: 'pixelated',
      }}
    >
      <svg width="56" height="40" viewBox="0 0 56 40">
        <rect x="0" y="14" width="16" height="12" fill="#1e40af" />
        <rect x="2" y="16" width="4" height="4" fill="#3b82f6" opacity="0.6" />
        <rect x="8" y="16" width="4" height="4" fill="#3b82f6" opacity="0.6" />
        <rect x="2" y="22" width="4" height="2" fill="#3b82f6" opacity="0.4" />
        <rect x="8" y="22" width="4" height="2" fill="#3b82f6" opacity="0.4" />
        <rect x="16" y="10" width="24" height="20" fill="#6b7280" />
        <rect x="18" y="12" width="20" height="16" fill="#9ca3af" />
        <rect x="20" y="14" width="6" height="4" fill="#22d3ee" opacity="0.5" />
        <rect x="28" y="14" width="6" height="4" fill="#22d3ee" opacity="0.3" />
        <rect x="26" y="2" width="2" height="8" fill="#d4d4d8" />
        <rect x="24" y="0" width="6" height="4" fill="#ef4444" />
        <rect x="40" y="14" width="16" height="12" fill="#1e40af" />
        <rect x="42" y="16" width="4" height="4" fill="#3b82f6" opacity="0.6" />
        <rect x="48" y="16" width="4" height="4" fill="#3b82f6" opacity="0.6" />
      </svg>
    </div>
  );
}

// Alien tower for the far zone
function AlienTower({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none pixelated"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        imageRendering: 'pixelated',
      }}
    >
      <svg width="48" height="72" viewBox="0 0 48 72">
        <rect x="8" y="56" width="32" height="8" fill="#312e81" />
        <rect x="4" y="64" width="40" height="8" fill="#1e1b4b" />
        <rect x="16" y="20" width="16" height="36" fill="#312e81" />
        <rect x="18" y="22" width="4" height="34" fill="#4338ca" opacity="0.3" />
        <rect x="20" y="4" width="8" height="4" fill="#a855f7" />
        <rect x="18" y="8" width="12" height="4" fill="#9333ea" />
        <rect x="16" y="12" width="16" height="8" fill="#7e22ce" />
        <rect x="20" y="28" width="8" height="4" fill="#c084fc" opacity="0.6" />
        <rect x="20" y="38" width="8" height="4" fill="#a855f7" opacity="0.4" />
        <rect x="20" y="48" width="8" height="4" fill="#c084fc" opacity="0.5" />
        <rect x="22" y="6" width="4" height="2" fill="#e9d5ff" opacity="0.7" />
      </svg>
    </div>
  );
}

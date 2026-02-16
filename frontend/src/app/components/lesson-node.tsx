import { motion } from "motion/react";

export type LessonStatus = "locked" | "available" | "current" | "completed";

interface LessonNodeProps {
  title: string;
  description: string;
  type: "lesson" | "checkpoint" | "achievement";
  xp: number;
  status: LessonStatus;
  position: { x: number; y: number };
  onClick: () => void;
}

export function LessonNode({ title, description, type, xp, status, position, onClick }: LessonNodeProps) {
  const isClickable = status !== "locked";
  const isCheckpoint = type === "checkpoint";
  const isAchievement = type === "achievement";

  const lessonNumber = parseInt(title.match(/\d+/)?.[0] || "1");
  const planetVariant = lessonNumber % 5;

  const getColors = () => {
    if (isCheckpoint) {
      switch (status) {
        case "completed":
          return { wall: "#042f2e", wallLight: "#134e4a", roof: "#14b8a6", roofDark: "#0d9488", accent: "#5eead4", glow: "#5eead4" };
        case "available":
        case "current":
          return { wall: "#1e1b4b", wallLight: "#312e81", roof: "#6366f1", roofDark: "#4f46e5", accent: "#a5b4fc", glow: "#a5b4fc" };
        default:
          return { wall: "#1f2937", wallLight: "#374151", roof: "#111827", roofDark: "#0f172a", accent: "#374151", glow: "none" };
      }
    }
    switch (status) {
      case "completed":
        return { wall: "#042f2e", wallLight: "#134e4a", roof: "#14b8a6", roofDark: "#0d9488", accent: "#5eead4", glow: "#5eead4" };
      case "available":
      case "current":
        return { wall: "#1e1b4b", wallLight: "#312e81", roof: "#6366f1", roofDark: "#4f46e5", accent: "#a5b4fc", glow: "#a5b4fc" };
      default:
        return { wall: "#1f2937", wallLight: "#374151", roof: "#111827", roofDark: "#0f172a", accent: "#374151", glow: "none" };
    }
  };

  const c = getColors();

  return (
    <motion.div
      className="absolute pixelated"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        x: "-50%",
        y: "-50%",
        imageRendering: 'pixelated',
        zIndex: 10,
      }}
      whileHover={isClickable ? { scale: 1.1 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
    >
      <button
        onClick={isClickable ? onClick : undefined}
        disabled={!isClickable}
        className="relative group"
        style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
      >
        {/* Glow effect for current/available */}
        {(status === "current" || status === "available") && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${c.glow}40 0%, transparent 70%)`,
              width: '160px',
              height: '180px',
              left: '-16px',
              top: '-16px',
            }}
            animate={status === "current" ? { opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.1, 0.95] } : {}}
            transition={status === "current" ? { duration: 2, repeat: Infinity } : {}}
          />
        )}

        <svg width="128" height="148" viewBox="0 0 128 148" className="pixelated">
          <ellipse cx="64" cy="140" rx="32" ry="6" fill="#000" opacity="0.3" />

          {isCheckpoint ? (
            <>
              <ellipse cx="64" cy="64" rx="60" ry="18" fill={c.wallLight} opacity="0.15" />
              <ellipse cx="64" cy="64" rx="54" ry="15" fill={c.roof} opacity="0.25" />
              <ellipse cx="64" cy="64" rx="48" ry="12" fill={c.wallLight} opacity="0.3" />
              <ellipse cx="64" cy="64" rx="38" ry="38" fill={c.wall} />
              <ellipse cx="64" cy="52" rx="38" ry="6" fill={c.wallLight} opacity="0.4" />
              <ellipse cx="64" cy="60" rx="36" ry="4" fill={c.roofDark} opacity="0.35" />
              <ellipse cx="64" cy="68" rx="37" ry="5" fill={c.wallLight} opacity="0.3" />
              <ellipse cx="64" cy="76" rx="35" ry="4" fill={c.roof} opacity="0.25" />
              <ellipse cx="48" cy="64" rx="10" ry="8" fill={c.roofDark} opacity="0.5" />
              <ellipse cx="46" cy="62" rx="6" ry="5" fill={c.accent} opacity="0.3" />
              <ellipse cx="52" cy="50" rx="14" ry="12" fill="white" opacity="0.25" />
              <ellipse cx="50" cy="48" rx="8" ry="7" fill="white" opacity="0.35" />
              <ellipse cx="64" cy="64" rx="60" ry="18" fill="none" stroke={c.roof} strokeWidth="3" opacity="0.4" />
              <ellipse cx="64" cy="64" rx="54" ry="15" fill="none" stroke={c.accent} strokeWidth="2" opacity="0.3" />
              <rect x="58" y="60" width="2" height="10" fill={c.accent} />
              <rect x="68" y="60" width="2" height="10" fill={c.accent} />
              <rect x="56" y="64" width="16" height="2" fill={c.accent} />
            </>
          ) : isAchievement ? (
            <>
              <ellipse cx="64" cy="64" rx="50" ry="50" fill={c.roof} opacity="0.05" />
              <ellipse cx="64" cy="64" rx="42" ry="42" fill={c.accent} opacity="0.08" />
              <rect x="60" y="16" width="8" height="96" fill={c.wall} opacity="0.9" />
              <rect x="62" y="14" width="4" height="100" fill={c.wallLight} />
              <rect x="16" y="60" width="96" height="8" fill={c.wall} opacity="0.9" />
              <rect x="14" y="62" width="100" height="4" fill={c.wallLight} />
              <g transform="rotate(45 64 64)">
                <rect x="60" y="16" width="8" height="96" fill={c.wall} opacity="0.8" />
                <rect x="62" y="18" width="4" height="92" fill={c.wallLight} opacity="0.9" />
                <rect x="16" y="60" width="96" height="8" fill={c.wall} opacity="0.8" />
                <rect x="18" y="62" width="92" height="4" fill={c.wallLight} opacity="0.9" />
              </g>
              <ellipse cx="64" cy="64" rx="24" ry="24" fill={c.roof} />
              <ellipse cx="64" cy="64" rx="20" ry="20" fill={c.roofDark} />
              <ellipse cx="64" cy="64" rx="16" ry="16" fill={c.accent} opacity="0.9" />
              <ellipse cx="60" cy="60" rx="10" ry="10" fill="white" opacity="0.7" />
              <ellipse cx="58" cy="58" rx="5" ry="5" fill="white" opacity="0.9" />
            </>
          ) : planetVariant === 0 ? (
            <>
              <ellipse cx="64" cy="64" rx="40" ry="40" fill={c.wall} />
              <ellipse cx="64" cy="64" rx="38" ry="38" fill={c.wallLight} opacity="0.2" />
              <path d="M 40 50 Q 35 55, 38 60 Q 42 64, 48 62 Q 54 60, 56 54 Q 54 48, 48 48 Q 42 48, 40 50 Z" fill={c.roofDark} opacity="0.4" />
              <path d="M 68 58 Q 72 62, 78 60 Q 82 56, 80 52 Q 76 50, 72 52 Q 68 54, 68 58 Z" fill={c.roofDark} opacity="0.35" />
              <path d="M 50 72 Q 54 76, 60 75 Q 64 72, 62 68 Q 58 66, 54 68 Q 50 70, 50 72 Z" fill={c.roofDark} opacity="0.38" />
              <ellipse cx="46" cy="56" rx="8" ry="4" fill="white" opacity="0.25" />
              <ellipse cx="74" cy="68" rx="10" ry="5" fill="white" opacity="0.2" />
              <ellipse cx="64" cy="64" rx="42" ry="42" fill="none" stroke={c.accent} strokeWidth="2" opacity="0.2" />
              <ellipse cx="50" cy="50" rx="16" ry="14" fill="white" opacity="0.3" />
              <ellipse cx="48" cy="48" rx="10" ry="9" fill="white" opacity="0.4" />
            </>
          ) : planetVariant === 1 ? (
            <>
              <ellipse cx="64" cy="64" rx="40" ry="40" fill={c.wall} />
              <ellipse cx="64" cy="48" rx="40" ry="8" fill={c.wallLight} opacity="0.35" />
              <ellipse cx="64" cy="56" rx="38" ry="6" fill={c.roofDark} opacity="0.3" />
              <ellipse cx="64" cy="64" rx="40" ry="7" fill={c.wallLight} opacity="0.4" />
              <ellipse cx="64" cy="72" rx="38" ry="6" fill={c.roofDark} opacity="0.35" />
              <ellipse cx="64" cy="80" rx="36" ry="7" fill={c.wallLight} opacity="0.3" />
              <ellipse cx="78" cy="64" rx="12" ry="10" fill={c.accent} opacity="0.4" />
              <ellipse cx="76" cy="62" rx="8" ry="7" fill={c.roofDark} opacity="0.5" />
              <ellipse cx="74" cy="60" rx="4" ry="4" fill={c.accent} opacity="0.3" />
              <ellipse cx="48" cy="56" rx="6" ry="5" fill={c.roofDark} opacity="0.35" />
              <ellipse cx="52" cy="76" rx="5" ry="4" fill={c.roofDark} opacity="0.3" />
              <ellipse cx="52" cy="52" rx="14" ry="12" fill="white" opacity="0.25" />
              <ellipse cx="50" cy="50" rx="8" ry="7" fill="white" opacity="0.35" />
            </>
          ) : planetVariant === 2 ? (
            <>
              <ellipse cx="64" cy="64" rx="40" ry="40" fill={c.wall} />
              <ellipse cx="64" cy="38" rx="30" ry="18" fill="white" opacity="0.3" />
              <ellipse cx="64" cy="34" rx="24" ry="14" fill="white" opacity="0.4" />
              <ellipse cx="64" cy="90" rx="32" ry="16" fill="white" opacity="0.25" />
              <rect x="44" y="54" width="2" height="20" fill={c.wallLight} opacity="0.4" transform="rotate(12 64 64)" />
              <rect x="74" y="58" width="2" height="16" fill={c.wallLight} opacity="0.35" transform="rotate(-8 64 64)" />
              <rect x="58" y="68" width="2" height="14" fill={c.wallLight} opacity="0.3" transform="rotate(5 64 64)" />
              <ellipse cx="50" cy="64" rx="12" ry="8" fill={c.wallLight} opacity="0.25" />
              <ellipse cx="76" cy="70" rx="10" ry="7" fill={c.wallLight} opacity="0.2" />
              <ellipse cx="52" cy="50" rx="16" ry="14" fill="white" opacity="0.35" />
              <ellipse cx="50" cy="48" rx="10" ry="9" fill="white" opacity="0.5" />
              <ellipse cx="64" cy="64" rx="42" ry="42" fill="none" stroke="white" strokeWidth="2" opacity="0.15" />
            </>
          ) : planetVariant === 3 ? (
            <>
              <ellipse cx="64" cy="64" rx="40" ry="40" fill={c.wall} />
              <path d="M 44 44 Q 48 52, 46 60 Q 44 68, 48 76" fill="none" stroke={c.accent} strokeWidth="3" opacity="0.5" />
              <path d="M 74 50 Q 70 58, 72 66 Q 76 74, 72 82" fill="none" stroke={c.accent} strokeWidth="2.5" opacity="0.45" />
              <path d="M 56 38 Q 60 46, 58 54" fill="none" stroke={c.accent} strokeWidth="2" opacity="0.4" />
              <ellipse cx="46" cy="60" rx="6" ry="8" fill={c.accent} opacity="0.4" />
              <ellipse cx="72" cy="66" rx="5" ry="7" fill={c.accent} opacity="0.35" />
              <ellipse cx="58" cy="46" rx="4" ry="5" fill={c.accent} opacity="0.3" />
              <ellipse cx="52" cy="72" rx="8" ry="7" fill={c.roofDark} opacity="0.5" />
              <ellipse cx="50" cy="70" rx="4" ry="4" fill="black" opacity="0.4" />
              <ellipse cx="78" cy="54" rx="7" ry="6" fill={c.roofDark} opacity="0.45" />
              <ellipse cx="50" cy="50" rx="14" ry="12" fill={c.accent} opacity="0.15" />
              <ellipse cx="64" cy="64" rx="42" ry="42" fill="none" stroke={c.accent} strokeWidth="2" opacity="0.25" />
            </>
          ) : (
            <>
              <ellipse cx="64" cy="64" rx="40" ry="40" fill={c.wall} />
              <path d="M 38 52 L 48 58 L 44 66 L 52 72" fill="none" stroke={c.roofDark} strokeWidth="2.5" opacity="0.4" />
              <path d="M 72 48 L 78 56 L 74 64 L 80 70" fill="none" stroke={c.roofDark} strokeWidth="2" opacity="0.35" />
              <ellipse cx="50" cy="58" rx="10" ry="9" fill={c.roofDark} opacity="0.4" />
              <ellipse cx="48" cy="56" rx="6" ry="5" fill="black" opacity="0.2" />
              <ellipse cx="76" cy="68" rx="8" ry="7" fill={c.roofDark} opacity="0.35" />
              <ellipse cx="74" cy="66" rx="4" ry="4" fill="black" opacity="0.15" />
              <ellipse cx="58" cy="78" rx="6" ry="6" fill={c.roofDark} opacity="0.3" />
              <ellipse cx="82" cy="52" rx="5" ry="5" fill={c.roofDark} opacity="0.3" />
              <ellipse cx="42" cy="70" rx="8" ry="6" fill={c.wallLight} opacity="0.25" />
              <ellipse cx="88" cy="58" rx="6" ry="5" fill={c.wallLight} opacity="0.2" />
              <ellipse cx="64" cy="64" rx="42" ry="42" fill="none" stroke={c.wallLight} strokeWidth="2" opacity="0.15" />
              <ellipse cx="52" cy="52" rx="14" ry="12" fill="white" opacity="0.25" />
              <ellipse cx="50" cy="50" rx="8" ry="7" fill="white" opacity="0.3" />
            </>
          )}

          {status !== "locked" && (
            <>
              <ellipse cx="20" cy="40" rx="6" ry="6" fill={c.accent} opacity="0.6" />
              <ellipse cx="18" cy="38" rx="2" ry="2" fill="white" opacity="0.5" />
              <ellipse cx="108" cy="70" rx="5" ry="5" fill={c.accent} opacity="0.5" />
              <ellipse cx="107" cy="69" rx="2" ry="2" fill="white" opacity="0.4" />
              {status === "completed" && (
                <>
                  <rect x="32" y="24" width="3" height="3" fill="#5eead4" />
                  <rect x="94" y="28" width="3" height="3" fill="#5eead4" />
                  <rect x="28" y="90" width="3" height="3" fill="#5eead4" />
                  <rect x="96" y="94" width="3" height="3" fill="#5eead4" />
                  <rect x="18" y="84" width="4" height="4" fill="white" />
                  <rect x="22" y="80" width="4" height="4" fill="white" />
                  <rect x="26" y="76" width="4" height="4" fill="white" />
                  <rect x="30" y="72" width="4" height="4" fill="white" />
                </>
              )}
            </>
          )}

          {status === "locked" && (
            <>
              <rect x="56" y="58" width="16" height="16" fill="#374151" opacity="0.8" />
              <rect x="58" y="52" width="12" height="8" fill="none" stroke="#374151" strokeWidth="3" rx="6" />
              <rect x="62" y="64" width="4" height="6" fill="#1f2937" />
            </>
          )}
        </svg>

        {status !== "locked" && (
          <div
            className="absolute -top-1 -right-1 pixelated"
            style={{
              background: '#0a0a1a',
              border: '2px solid #818cf8',
              padding: '2px 6px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: '#a5b4fc',
              zIndex: 11,
            }}
          >
            {xp}XP
          </div>
        )}
      </button>

      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
        <span
          className="block text-[10px] font-bold drop-shadow-[0_2px_0px_rgba(0,0,0,0.8)] pixelated"
          style={{
            fontFamily: 'var(--font-pixel)',
            color: status === "locked" ? "#4b5563" : isCheckpoint ? "#c084fc" : "#e0e7ff",
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </span>
        {description && (
          <span
            className="block text-[7px] drop-shadow-[0_1px_0px_rgba(0,0,0,0.8)] pixelated"
            style={{
              fontFamily: 'var(--font-pixel)',
              color: status === "locked" ? "#374151" : "#818cf8",
              letterSpacing: '0.3px',
            }}
          >
            {description}
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface PixelCharacterProps {
  type: string;
  position: { x: number; y: number };
  scale?: number;
  flip?: boolean;
}

export function PixelCharacter({ type, position, scale = 1, flip = false }: PixelCharacterProps) {
  const getCharacter = () => {
    switch (type) {
      case "knight":
        return (
          <svg width="32" height="40" viewBox="0 0 32 40">
            {/* Helmet */}
            <rect x="10" y="0" width="12" height="4" fill="#c0c0c0" />
            <rect x="8" y="4" width="16" height="4" fill="#a0a0a0" />
            <rect x="14" y="2" width="4" height="2" fill="#ffd700" />
            {/* Face */}
            <rect x="10" y="8" width="12" height="4" fill="#fdbcb4" />
            <rect x="12" y="8" width="2" height="2" fill="#2d1b0e" />
            <rect x="18" y="8" width="2" height="2" fill="#2d1b0e" />
            <rect x="14" y="10" width="4" height="2" fill="#e8a598" />
            {/* Armor body */}
            <rect x="8" y="12" width="16" height="4" fill="#6082b6" />
            <rect x="6" y="16" width="20" height="8" fill="#4a6fa5" />
            <rect x="14" y="14" width="4" height="2" fill="#c0c0c0" />
            {/* Shield arm */}
            <rect x="2" y="16" width="6" height="8" fill="#4a6fa5" />
            <rect x="0" y="18" width="6" height="6" fill="#b22222" />
            <rect x="2" y="20" width="2" height="2" fill="#ffd700" />
            {/* Sword arm */}
            <rect x="24" y="16" width="6" height="8" fill="#4a6fa5" />
            <rect x="28" y="10" width="2" height="12" fill="#c0c0c0" />
            <rect x="28" y="8" width="2" height="4" fill="#ffd700" />
            {/* Legs */}
            <rect x="10" y="24" width="4" height="8" fill="#4a6fa5" />
            <rect x="18" y="24" width="4" height="8" fill="#4a6fa5" />
            {/* Boots */}
            <rect x="8" y="32" width="6" height="4" fill="#8B4513" />
            <rect x="18" y="32" width="6" height="4" fill="#8B4513" />
            {/* Belt */}
            <rect x="8" y="22" width="16" height="2" fill="#8B4513" />
            <rect x="14" y="22" width="4" height="2" fill="#ffd700" />
          </svg>
        );
      case "wizard":
        return (
          <svg width="32" height="44" viewBox="0 0 32 44">
            {/* Hat point */}
            <rect x="14" y="0" width="4" height="4" fill="#6b21a8" />
            <rect x="12" y="4" width="8" height="4" fill="#7c3aed" />
            <rect x="10" y="8" width="12" height="4" fill="#7c3aed" />
            {/* Hat brim */}
            <rect x="6" y="12" width="20" height="2" fill="#6b21a8" />
            {/* Star on hat */}
            <rect x="15" y="6" width="2" height="2" fill="#ffd700" />
            {/* Face */}
            <rect x="10" y="14" width="12" height="6" fill="#fdbcb4" />
            <rect x="12" y="14" width="2" height="2" fill="#2d1b0e" />
            <rect x="18" y="14" width="2" height="2" fill="#2d1b0e" />
            {/* Beard */}
            <rect x="12" y="18" width="8" height="4" fill="#e8e8e8" />
            <rect x="14" y="22" width="4" height="2" fill="#d0d0d0" />
            {/* Robe */}
            <rect x="8" y="22" width="16" height="10" fill="#7c3aed" />
            <rect x="6" y="24" width="4" height="8" fill="#6b21a8" />
            <rect x="22" y="24" width="4" height="8" fill="#6b21a8" />
            {/* Staff */}
            <rect x="26" y="8" width="2" height="28" fill="#8B4513" />
            <rect x="24" y="4" width="6" height="6" fill="#60a5fa" />
            <rect x="26" y="6" width="2" height="2" fill="white" opacity="0.6" />
            {/* Robe bottom */}
            <rect x="8" y="32" width="6" height="6" fill="#6b21a8" />
            <rect x="18" y="32" width="6" height="6" fill="#6b21a8" />
            {/* Feet */}
            <rect x="8" y="38" width="6" height="4" fill="#92400e" />
            <rect x="18" y="38" width="6" height="4" fill="#92400e" />
            {/* Magic sparkles */}
            <rect x="4" y="12" width="2" height="2" fill="#ffd700" opacity="0.6" />
            <rect x="28" y="16" width="2" height="2" fill="#c084fc" opacity="0.6" />
          </svg>
        );
      case "archer":
        return (
          <svg width="32" height="40" viewBox="0 0 32 40">
            {/* Hood */}
            <rect x="10" y="0" width="12" height="4" fill="#166534" />
            <rect x="8" y="4" width="16" height="4" fill="#15803d" />
            {/* Face */}
            <rect x="10" y="8" width="12" height="4" fill="#fdbcb4" />
            <rect x="12" y="8" width="2" height="2" fill="#2d1b0e" />
            <rect x="18" y="8" width="2" height="2" fill="#2d1b0e" />
            {/* Tunic */}
            <rect x="8" y="12" width="16" height="4" fill="#15803d" />
            <rect x="6" y="16" width="20" height="8" fill="#166534" />
            {/* Belt + quiver strap */}
            <rect x="6" y="22" width="20" height="2" fill="#92400e" />
            <rect x="20" y="12" width="2" height="12" fill="#92400e" />
            {/* Bow */}
            <rect x="2" y="8" width="2" height="20" fill="#92400e" />
            <rect x="0" y="8" width="2" height="2" fill="#fbbf24" />
            <rect x="0" y="26" width="2" height="2" fill="#fbbf24" />
            <rect x="4" y="12" width="1" height="14" fill="#d4d4d8" opacity="0.6" />
            {/* Quiver */}
            <rect x="22" y="8" width="4" height="12" fill="#92400e" />
            <rect x="23" y="6" width="1" height="4" fill="#a0a0a0" />
            <rect x="24" y="5" width="1" height="4" fill="#a0a0a0" />
            {/* Legs */}
            <rect x="10" y="24" width="4" height="8" fill="#166534" />
            <rect x="18" y="24" width="4" height="8" fill="#166534" />
            {/* Boots */}
            <rect x="8" y="32" width="6" height="4" fill="#92400e" />
            <rect x="18" y="32" width="6" height="4" fill="#92400e" />
          </svg>
        );
      case "healer":
        return (
          <svg width="32" height="40" viewBox="0 0 32 40">
            {/* Hair/crown */}
            <rect x="10" y="0" width="12" height="4" fill="#fbbf24" />
            <rect x="14" y="0" width="4" height="2" fill="#f59e0b" />
            {/* Face */}
            <rect x="10" y="4" width="12" height="6" fill="#fdbcb4" />
            <rect x="12" y="4" width="2" height="2" fill="#60a5fa" />
            <rect x="18" y="4" width="2" height="2" fill="#60a5fa" />
            <rect x="14" y="8" width="4" height="2" fill="#f9a8d4" />
            {/* Robe */}
            <rect x="8" y="10" width="16" height="4" fill="#fce7f3" />
            <rect x="6" y="14" width="20" height="10" fill="#f9a8d4" />
            {/* Cross symbol */}
            <rect x="14" y="14" width="4" height="8" fill="#ef4444" />
            <rect x="12" y="16" width="8" height="4" fill="#ef4444" />
            {/* Arms */}
            <rect x="2" y="14" width="6" height="6" fill="#fce7f3" />
            <rect x="24" y="14" width="6" height="6" fill="#fce7f3" />
            {/* Healing aura */}
            <rect x="0" y="16" width="4" height="4" fill="#86efac" opacity="0.4" />
            <rect x="28" y="14" width="4" height="4" fill="#86efac" opacity="0.4" />
            {/* Skirt */}
            <rect x="6" y="24" width="20" height="4" fill="#f472b6" />
            {/* Legs */}
            <rect x="10" y="28" width="4" height="6" fill="#fce7f3" />
            <rect x="18" y="28" width="4" height="6" fill="#fce7f3" />
            {/* Shoes */}
            <rect x="8" y="34" width="6" height="4" fill="#fbbf24" />
            <rect x="18" y="34" width="6" height="4" fill="#fbbf24" />
          </svg>
        );
      case "rogue":
        return (
          <svg width="32" height="40" viewBox="0 0 32 40">
            {/* Hood */}
            <rect x="10" y="0" width="12" height="4" fill="#1f2937" />
            <rect x="8" y="4" width="16" height="4" fill="#111827" />
            {/* Mask + eyes */}
            <rect x="8" y="6" width="16" height="4" fill="#1f2937" />
            <rect x="12" y="6" width="3" height="2" fill="#ef4444" />
            <rect x="18" y="6" width="3" height="2" fill="#ef4444" />
            {/* Face */}
            <rect x="10" y="8" width="12" height="4" fill="#d4a574" />
            {/* Body */}
            <rect x="8" y="12" width="16" height="4" fill="#374151" />
            <rect x="6" y="16" width="20" height="8" fill="#1f2937" />
            {/* Daggers */}
            <rect x="2" y="18" width="4" height="2" fill="#c0c0c0" />
            <rect x="0" y="18" width="2" height="2" fill="#ffd700" />
            <rect x="26" y="18" width="4" height="2" fill="#c0c0c0" />
            <rect x="30" y="18" width="2" height="2" fill="#ffd700" />
            {/* Belt */}
            <rect x="6" y="22" width="20" height="2" fill="#4b5563" />
            <rect x="14" y="22" width="4" height="2" fill="#d4d4d8" />
            {/* Legs */}
            <rect x="10" y="24" width="4" height="8" fill="#1f2937" />
            <rect x="18" y="24" width="4" height="8" fill="#1f2937" />
            {/* Boots */}
            <rect x="8" y="32" width="6" height="4" fill="#374151" />
            <rect x="18" y="32" width="6" height="4" fill="#374151" />
          </svg>
        );
      case "cat":
        return (
          <svg width="28" height="24" viewBox="0 0 28 24">
            {/* Ears */}
            <rect x="4" y="0" width="4" height="4" fill="#f97316" />
            <rect x="18" y="0" width="4" height="4" fill="#f97316" />
            <rect x="6" y="2" width="2" height="2" fill="#fbbf24" />
            <rect x="18" y="2" width="2" height="2" fill="#fbbf24" />
            {/* Head */}
            <rect x="4" y="4" width="18" height="8" fill="#fb923c" />
            {/* Eyes */}
            <rect x="8" y="6" width="3" height="3" fill="#22c55e" />
            <rect x="15" y="6" width="3" height="3" fill="#22c55e" />
            <rect x="9" y="7" width="1" height="1" fill="black" />
            <rect x="16" y="7" width="1" height="1" fill="black" />
            {/* Nose */}
            <rect x="12" y="8" width="2" height="2" fill="#f472b6" />
            {/* Whiskers */}
            <rect x="2" y="8" width="4" height="1" fill="#d4d4d8" opacity="0.6" />
            <rect x="20" y="8" width="4" height="1" fill="#d4d4d8" opacity="0.6" />
            <rect x="2" y="10" width="4" height="1" fill="#d4d4d8" opacity="0.6" />
            <rect x="20" y="10" width="4" height="1" fill="#d4d4d8" opacity="0.6" />
            {/* Body */}
            <rect x="6" y="12" width="14" height="6" fill="#fb923c" />
            <rect x="8" y="12" width="4" height="2" fill="#fbbf24" opacity="0.4" />
            {/* Paws */}
            <rect x="6" y="18" width="4" height="4" fill="#f97316" />
            <rect x="16" y="18" width="4" height="4" fill="#f97316" />
            {/* Tail */}
            <rect x="20" y="14" width="6" height="2" fill="#f97316" />
            <rect x="24" y="12" width="4" height="2" fill="#f97316" />
          </svg>
        );
      case "slime":
        return (
          <svg width="28" height="24" viewBox="0 0 28 24">
            {/* Slime body */}
            <rect x="8" y="4" width="12" height="4" fill="#86efac" />
            <rect x="4" y="8" width="20" height="4" fill="#4ade80" />
            <rect x="2" y="12" width="24" height="4" fill="#22c55e" />
            <rect x="4" y="16" width="20" height="4" fill="#16a34a" />
            <rect x="8" y="20" width="12" height="4" fill="#15803d" />
            {/* Eyes */}
            <rect x="8" y="10" width="4" height="4" fill="white" />
            <rect x="16" y="10" width="4" height="4" fill="white" />
            <rect x="10" y="11" width="2" height="2" fill="black" />
            <rect x="17" y="11" width="2" height="2" fill="black" />
            {/* Shine */}
            <rect x="10" y="6" width="4" height="2" fill="#bbf7d0" opacity="0.6" />
            {/* Mouth */}
            <rect x="12" y="16" width="4" height="2" fill="#15803d" />
            {/* Drip */}
            <rect x="6" y="20" width="2" height="2" fill="#22c55e" opacity="0.5" />
            <rect x="20" y="20" width="2" height="2" fill="#22c55e" opacity="0.5" />
          </svg>
        );
      case "chest":
        return (
          <svg width="32" height="28" viewBox="0 0 32 28">
            {/* Chest body */}
            <rect x="2" y="8" width="28" height="16" fill="#92400e" />
            <rect x="4" y="6" width="24" height="4" fill="#b45309" />
            {/* Lid */}
            <rect x="2" y="4" width="28" height="4" fill="#d97706" />
            <rect x="6" y="2" width="20" height="2" fill="#f59e0b" />
            {/* Metal bands */}
            <rect x="2" y="8" width="28" height="2" fill="#ffd700" />
            <rect x="2" y="16" width="28" height="2" fill="#ffd700" />
            {/* Lock */}
            <rect x="13" y="10" width="6" height="6" fill="#ffd700" />
            <rect x="15" y="12" width="2" height="2" fill="#92400e" />
            {/* Corner rivets */}
            <rect x="4" y="10" width="2" height="2" fill="#ffd700" opacity="0.7" />
            <rect x="26" y="10" width="2" height="2" fill="#ffd700" opacity="0.7" />
            <rect x="4" y="18" width="2" height="2" fill="#ffd700" opacity="0.7" />
            <rect x="26" y="18" width="2" height="2" fill="#ffd700" opacity="0.7" />
            {/* Sparkle */}
            <rect x="8" y="0" width="2" height="2" fill="#ffd700" opacity="0.5" />
            <rect x="22" y="0" width="2" height="2" fill="#ffd700" opacity="0.5" />
            {/* Shadow */}
            <rect x="2" y="24" width="28" height="4" fill="#000" opacity="0.15" />
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
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) scale(${scale * 1.5}) ${flip ? 'scaleX(-1)' : ''}`,
        imageRendering: 'pixelated',
      }}
    >
      {getCharacter()}
    </div>
  );
}

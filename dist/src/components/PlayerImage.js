"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlayerImage;
const react_1 = require("react");
function PlayerImage({ playerId, playerName, positionShort, size = 'medium', className = '' }) {
    const [imageError, setImageError] = (0, react_1.useState)(false);
    // Determine dimensions based on size
    const dimensions = {
        small: { width: 40, height: 40 },
        medium: { width: 80, height: 80 },
        large: { width: 120, height: 120 }
    };
    const { width, height } = dimensions[size];
    // Determine fallback text size
    const textSizeClass = {
        small: 'text-xs',
        medium: 'text-xl',
        large: 'text-3xl'
    }[size];
    // Use a position-based color scheme
    const colorByPosition = {
        GK: 'bg-yellow-600',
        DEF: 'bg-blue-600',
        MID: 'bg-green-600',
        FWD: 'bg-red-600',
        '?': 'bg-gray-600'
    };
    // Get background color based on position
    const positionColor = colorByPosition[positionShort] || colorByPosition['?'];
    // Get the first letter of the player's name for the fallback
    const nameParts = (playerName === null || playerName === void 0 ? void 0 : playerName.split(' ')) || ['?'];
    const initials = nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        : (playerName === null || playerName === void 0 ? void 0 : playerName.substring(0, 2)) || '?';
    const fallbackText = positionShort || initials;
    return (<div className={`relative overflow-hidden rounded-lg ${className}`} style={{ width, height }}>
      <div className={`absolute inset-0 flex items-center justify-center font-bold text-white ${positionColor}`} style={{ width, height }}>
        <span className={textSizeClass}>{fallbackText}</span>
      </div>
    </div>);
}

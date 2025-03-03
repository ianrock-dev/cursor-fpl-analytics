"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlayersPage;
const PlayerList_1 = __importDefault(require("@/components/PlayerList"));
function PlayersPage() {
    return (<div className="min-h-screen bg-dark">
      <PlayerList_1.default />
    </div>);
}

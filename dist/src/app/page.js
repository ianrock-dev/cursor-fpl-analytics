"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const react_1 = require("react");
const fa_1 = require("react-icons/fa");
const Overview_1 = __importDefault(require("@/components/Overview"));
const ManagerSearch_1 = __importDefault(require("@/components/ManagerSearch"));
const ApiTester_1 = __importDefault(require("@/components/ApiTester"));
const PlayerList_1 = __importDefault(require("@/components/PlayerList"));
function Home() {
    const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
    const [showApiTester, setShowApiTester] = (0, react_1.useState)(false);
    return (<main className="min-h-screen dark:bg-dark">
      <header className="bg-fpl-dark p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <fa_1.FaFootballBall className="text-fpl-green text-2xl mr-2"/>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-fpl-green">FPL</span> Analytics
            </h1>
          </div>
          <button onClick={() => setShowApiTester(!showApiTester)} className="text-gray-300 hover:text-white flex items-center">
            <fa_1.FaWrench className="mr-1"/>
            {showApiTester ? 'Hide API Tester' : 'Show API Tester'}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex border-b border-gray-700 mb-6">
          <button className={`flex items-center mr-6 py-2 border-b-2 ${activeTab === 'overview'
            ? 'border-fpl-green text-fpl-green'
            : 'border-transparent text-gray-400 hover:text-white'}`} onClick={() => setActiveTab('overview')}>
            <fa_1.FaHome className="mr-2"/>
            Overview
          </button>
          <button className={`flex items-center mr-6 py-2 border-b-2 ${activeTab === 'manager'
            ? 'border-fpl-green text-fpl-green'
            : 'border-transparent text-gray-400 hover:text-white'}`} onClick={() => setActiveTab('manager')}>
            <fa_1.FaSearch className="mr-2"/>
            Manager Search
          </button>
          <button className={`flex items-center py-2 border-b-2 ${activeTab === 'players'
            ? 'border-fpl-green text-fpl-green'
            : 'border-transparent text-gray-400 hover:text-white'}`} onClick={() => setActiveTab('players')}>
            <fa_1.FaUserAlt className="mr-2"/>
            Player Stats
          </button>
        </div>

        <div className="py-4">
          {activeTab === 'overview' ? <Overview_1.default /> :
            activeTab === 'manager' ? <ManagerSearch_1.default /> :
                <PlayerList_1.default />}
        </div>
        
        {showApiTester && <ApiTester_1.default />}
      </div>
    </main>);
}

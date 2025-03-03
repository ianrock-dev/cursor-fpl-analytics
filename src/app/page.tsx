'use client';

import { useState } from 'react';
import { FaHome, FaSearch, FaFootballBall, FaWrench, FaUserAlt } from 'react-icons/fa';
import Overview from '@/components/Overview';
import ManagerSearch from '@/components/ManagerSearch';
import ApiTester from '@/components/ApiTester';
import PlayerList from '@/components/PlayerList';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiTester, setShowApiTester] = useState(false);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <PlayerList />
    </main>
  );
} 
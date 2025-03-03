'use client';

import React from 'react';
import { usePlayerBio } from '@/hooks/usePlayerBio';
import { FaSpinner } from 'react-icons/fa';

interface PlayerProfileProps {
    playerName: string;
}

function calculateAge(birthDate: string | undefined): string {
    if (!birthDate) return '--';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age.toString();
}

function formatHeight(height: string | undefined): string {
    if (!height) return '--';
    // Extract numbers from the height string (assuming it's in the format "1.80m" or similar)
    const match = height.match(/\d+\.?\d*/);
    if (!match) return '--';
    // Convert to centimeters
    const meters = parseFloat(match[0]);
    return Math.round(meters * 100).toString();
}

export default function PlayerProfile({ playerName }: PlayerProfileProps) {
    const { bio, loading, error } = usePlayerBio(playerName);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <FaSpinner className="animate-spin text-2xl text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 p-4">
                Error loading player bio: {error}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Player Bio</h3>
            <div className="grid grid-cols-2 gap-y-4">
                <div>
                    <div className="text-gray-600">NATIONALITY</div>
                    <div className="font-medium">{bio?.nationality || '--'}</div>
                </div>
                <div>
                    <div className="text-gray-600">AGE</div>
                    <div className="font-medium">{calculateAge(bio?.birth_date)} YRS</div>
                </div>
                <div>
                    <div className="text-gray-600">HEIGHT</div>
                    <div className="font-medium">{formatHeight(bio?.height)} cm</div>
                </div>
                <div>
                    <div className="text-gray-600">PREFERRED FOOT</div>
                    <div className="font-medium">{bio?.foot || '--'}</div>
                </div>
                <div>
                    <div className="text-gray-600">POSITION</div>
                    <div className="font-medium">{bio?.position || '--'}</div>
                </div>
                <div>
                    <div className="text-gray-600">CURRENT CLUB</div>
                    <div className="font-medium">{bio?.current_club || '--'}</div>
                </div>
            </div>
        </div>
    );
} 
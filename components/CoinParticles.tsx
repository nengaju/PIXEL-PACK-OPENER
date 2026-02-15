import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { IconCoin } from './PixelIcons';

const CoinParticles: React.FC = () => {
    const { coinAnimTrigger } = useGame();
    const [coins, setCoins] = useState<{id: number, left: number, top: number, delay: number}[]>([]);

    useEffect(() => {
        if (coinAnimTrigger === 0) return;

        // Spawn a burst of coins
        const count = 10;
        const now = Date.now();
        const newCoins = [];
        
        for (let i = 0; i < count; i++) {
            newCoins.push({
                id: now + i + Math.random(),
                left: 50 + (Math.random() * 20 - 10), // Start near center
                top: 60 + (Math.random() * 20 - 10),  // Start near center-bottom
                delay: Math.random() * 0.5
            });
        }
        
        setCoins(prev => [...prev, ...newCoins]);

        // Cleanup this specific batch
        const timer = setTimeout(() => {
            setCoins(prev => prev.filter(c => !newCoins.find(nc => nc.id === c.id)));
        }, 2000);

        return () => clearTimeout(timer);

    }, [coinAnimTrigger]);

    if (coins.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {coins.map(coin => (
                <div 
                    key={coin.id}
                    className="absolute w-6 h-6 text-yellow-400 drop-shadow-md"
                    style={{
                        left: `${coin.left}%`,
                        top: `${coin.top}%`,
                        animation: `flyToGold 1s ease-in forwards`,
                        animationDelay: `${coin.delay}s`
                    }}
                >
                    <IconCoin className="w-full h-full" />
                </div>
            ))}
            <style>{`
                @keyframes flyToGold {
                    0% { transform: translate(0, 0) scale(1); opacity: 1; }
                    80% { opacity: 1; }
                    100% { 
                        /* Approximate position of the gold counter in top right */
                        top: 20px; 
                        left: 90%; 
                        transform: scale(0.5); 
                        opacity: 0; 
                    }
                }
            `}</style>
        </div>
    );
};

export default CoinParticles;

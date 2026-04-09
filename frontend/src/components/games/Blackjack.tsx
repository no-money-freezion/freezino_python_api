import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../store/authStore';
import type { BlackjackGameState, Card } from '../../types';


// Determine WebSocket URL based on current location
const getWsUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return import.meta.env.VITE_WS_URL || `${protocol}//${host}`;
};
const WS_URL = getWsUrl();

// Card suits symbols
const SUIT_SYMBOLS: { [key: string]: string } = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

// Card suit colors
const SUIT_COLORS: { [key: string]: string } = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

interface WebSocketMessage {
  type: string;
  payload?: Record<string, unknown>;
}

const Blackjack = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [gameState, setGameState] = useState<BlackjackGameState | null>(null);
  const [bet, setBet] = useState<number>(10);
  const [error, setError] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/blackjack`);

    ws.onopen = () => {
      console.error('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'game_state':
            setGameState((message.payload as unknown as BlackjackGameState) || null);
            setError('');
            break;
          case 'balance_update':
            // Update user balance
            if (user && message.payload?.balance !== undefined) {
              setUser({ ...user, balance: message.payload.balance as number });
            }
            break;
          case 'error':
            setError((message.payload?.message as string) || 'An error occurred');
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
    };

    ws.onclose = () => {
      console.error('WebSocket disconnected');
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [user, setUser]);

  // Send message to WebSocket
  const sendMessage = (type: string, payload?: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  };

  // Start new game
  const startNewGame = () => {
    if (!user) return;
    if (bet <= 0) {
      setError('Bet must be greater than 0');
      return;
    }
    if (bet > user.balance) {
      setError('Insufficient balance');
      return;
    }

    sendMessage('new_game', { bet, user_id: parseInt(user.id) });
  };

  // Hit action
  const hit = () => {
    sendMessage('hit');
  };

  // Stand action
  const stand = () => {
    sendMessage('stand');
  };

  // Double action
  const double = () => {
    if (!user) return;
    if (gameState && gameState.bet > user.balance) {
      setError('Insufficient balance to double');
      return;
    }
    sendMessage('double');
  };

  // Split action (not fully implemented on backend)
  const split = () => {
    sendMessage('split');
  };

  // Render card
  const renderCard = (card: Card, index: number, isHidden = false) => (
    <motion.div
      key={`${card.suit}-${card.rank}-${index}`}
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative w-20 h-28 bg-white rounded-lg shadow-lg border-2 border-gray-300 ${
        isHidden ? 'bg-gradient-to-br from-red-600 to-red-800' : ''
      }`}
    >
      {isHidden ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-4xl text-white">🂠</div>
        </div>
      ) : (
        <div className="p-2 flex flex-col justify-between h-full">
          <div className={`text-xl font-bold ${SUIT_COLORS[card.suit]}`}>
            {card.rank}
            <div className="text-2xl">{SUIT_SYMBOLS[card.suit]}</div>
          </div>
          <div className={`text-3xl text-center ${SUIT_COLORS[card.suit]}`}>
            {SUIT_SYMBOLS[card.suit]}
          </div>
          <div className={`text-xl font-bold text-right ${SUIT_COLORS[card.suit]}`}>
            {card.rank}
          </div>
        </div>
      )}
    </motion.div>
  );

  // Get result message and color
  const getResultDisplay = () => {
    if (!gameState || !gameState.game_over) return null;

    let message = '';
    let color = '';

    switch (gameState.result) {
      case 'blackjack':
        message = t('games.blackjack.blackjack') || 'Blackjack!';
        color = 'text-yellow-400';
        break;
      case 'player_win':
        message = t('games.blackjack.you_win') || 'You Win!';
        color = 'text-green-400';
        break;
      case 'dealer_win':
        message = t('games.blackjack.dealer_wins') || 'Dealer Wins';
        color = 'text-red-400';
        break;
      case 'push':
        message = t('games.blackjack.push') || 'Push (Tie)';
        color = 'text-blue-400';
        break;
    }

    return { message, color };
  };

  const resultDisplay = getResultDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('games.blackjack.title') || 'Blackjack'}
          </h1>
          <div className="text-2xl text-yellow-400 font-semibold">
            {t('common.balance') || 'Balance'}: ${user?.balance.toFixed(2) || '0.00'}
          </div>
          {!isConnected && (
            <div className="mt-2 text-yellow-300">
              {t('common.connecting') || 'Connecting...'}
            </div>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500 text-white px-6 py-3 rounded-lg mb-4 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Area */}
        <div className="bg-green-700 rounded-2xl p-8 shadow-2xl">
          {!gameState ? (
            // Betting Screen
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {t('games.blackjack.place_bet') || 'Place Your Bet'}
              </h2>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setBet(Math.max(1, bet - 10))}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
                >
                  -10
                </button>
                <input
                  type="number"
                  value={bet}
                  onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 px-4 py-2 text-center text-2xl font-bold rounded-lg"
                  min="1"
                  max={user?.balance || 1000}
                />
                <button
                  onClick={() => setBet(Math.min((user?.balance || 1000), bet + 10))}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold"
                >
                  +10
                </button>
              </div>
              <div className="flex justify-center space-x-4">
                {[10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBet(Math.min((user?.balance || 1000), amount))}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-bold"
                    disabled={amount > (user?.balance || 0)}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <button
                onClick={startNewGame}
                disabled={!isConnected}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white px-12 py-4 rounded-lg text-xl font-bold transition-colors"
              >
                {t('games.blackjack.deal') || 'Deal'}
              </button>
            </div>
          ) : (
            // Game Screen
            <div className="space-y-8">
              {/* Dealer Section */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">
                  {t('games.blackjack.dealer') || 'Dealer'}
                  {gameState.dealer_hand && (
                    <span className="ml-4 text-yellow-300">
                      ({gameState.dealer_hand.value})
                    </span>
                  )}
                </h3>
                <div className="flex justify-center space-x-2">
                  {gameState.dealer_hand
                    ? gameState.dealer_hand.cards.map((card, i) =>
                        renderCard(card, i)
                      )
                    : gameState.dealer_visible_card && (
                        <>
                          {renderCard(gameState.dealer_visible_card, 0)}
                          {renderCard(
                            { suit: 'spades', rank: '?', value: 0 },
                            1,
                            true
                          )}
                        </>
                      )}
                </div>
              </div>

              {/* Player Section */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">
                  {t('games.blackjack.player') || 'Player'}
                  <span className="ml-4 text-yellow-300">
                    ({gameState.player_hand.value})
                  </span>
                </h3>
                <div className="flex justify-center space-x-2">
                  {gameState.player_hand.cards.map((card, i) =>
                    renderCard(card, i)
                  )}
                </div>
              </div>

              {/* Result */}
              {resultDisplay && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-center text-4xl font-bold ${resultDisplay.color}`}
                >
                  {resultDisplay.message}
                  <div className="text-2xl mt-2">
                    {t('games.blackjack.payout') || 'Payout'}: ${gameState.payout.toFixed(2)}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                {!gameState.game_over ? (
                  <>
                    <button
                      onClick={hit}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-bold"
                    >
                      {t('games.blackjack.hit') || 'Hit'}
                    </button>
                    <button
                      onClick={stand}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg text-lg font-bold"
                    >
                      {t('games.blackjack.stand') || 'Stand'}
                    </button>
                    {gameState.can_double && (
                      <button
                        onClick={double}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-bold"
                      >
                        {t('games.blackjack.double') || 'Double'}
                      </button>
                    )}
                    {gameState.can_split && (
                      <button
                        onClick={split}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-bold opacity-50 cursor-not-allowed"
                        disabled
                        title="Coming soon"
                      >
                        {t('games.blackjack.split') || 'Split'}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setGameState(null);
                      setError('');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-lg text-xl font-bold"
                  >
                    {t('games.blackjack.new_game') || 'New Game'}
                  </button>
                )}
              </div>

              {/* Bet Display */}
              <div className="text-center text-white text-lg">
                {t('games.blackjack.current_bet') || 'Current Bet'}: ${gameState.bet.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="mt-8 bg-gray-800 bg-opacity-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {t('games.blackjack.rules') || 'Rules'}
          </h3>
          <ul className="text-gray-300 space-y-2">
            <li>• {t('games.blackjack.rule1') || 'Get as close to 21 without going over'}</li>
            <li>• {t('games.blackjack.rule2') || 'Face cards are worth 10, Aces are 1 or 11'}</li>
            <li>• {t('games.blackjack.rule3') || 'Dealer must hit on 16 or less, stand on 17 or more'}</li>
            <li>• {t('games.blackjack.rule4') || 'Blackjack (21 with first 2 cards) pays 3:2'}</li>
            <li>• {t('games.blackjack.rule5') || 'Double: Double your bet and get one more card'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Blackjack;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Slots from '../components/games/Slots';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthStore } from '../store/authStore';

const SlotsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, setUser } = useAuthStore();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Check if user exists and has all required fields
  if (!user || !user.id || user.balance === undefined) {
    console.error('Invalid user data:', user);
    // Redirect to login if user data is invalid
    navigate('/login', { replace: true });
    return <LoadingSpinner />;
  }

  // Debug: log user balance
  console.log('[SlotsPage] User balance:', user.balance, 'User:', user);

  const handleBalanceChange = (newBalance: number) => {
    setUser({ ...user, balance: newBalance });
  };

  // Convert string ID to number
  const userId = Number(user.id);
  if (isNaN(userId) || userId <= 0) {
    console.error('Invalid user ID:', user.id);
    navigate('/login', { replace: true });
    return <LoadingSpinner />;
  }

  return (
    <Slots
      userId={userId}
      userBalance={user.balance}
      onBalanceChange={handleBalanceChange}
    />
  );
};

export default SlotsPage;

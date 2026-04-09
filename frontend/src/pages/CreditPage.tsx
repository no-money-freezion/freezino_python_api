import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PageTransition } from '../components/animations';
import { useAuthStore } from '../store/authStore';
import { useLoanStore } from '../store/loanStore';
import { useShopStore } from '../store/shopStore';

export default function CreditPage() {
  const { t } = useTranslation();
  const { loans, summary, isLoading, fetchLoans, fetchSummary, takeLoan, repayLoan, error, clearError } = useLoanStore();
  const { myItems, fetchMyItems } = useShopStore();

  const [selectedLoanType, setSelectedLoanType] = useState<'friends' | 'bank' | 'microcredit' | null>(null);
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [selectedCollateral, setSelectedCollateral] = useState<number | null>(null);
  const [repayLoanId, setRepayLoanId] = useState<number | null>(null);
  const [repayAmount, setRepayAmount] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    fetchLoans();
    fetchSummary();
    fetchMyItems();
  }, [fetchLoans, fetchSummary, fetchMyItems]);

  // Filter items that can be used as collateral (cars and houses)
  const collateralItems = myItems.filter(
    (userItem) =>
      (userItem.item.type === 'car' || userItem.item.type === 'house') &&
      !userItem.is_collateral
  );

  const handleTakeLoan = async () => {
    if (!selectedLoanType || !loanAmount) return;

    clearError();
    setSuccessMessage('');

    try {
      const amount = parseFloat(loanAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error(t('credit.errors.invalid_amount'));
      }

      const request: any = {
        type: selectedLoanType,
        amount,
      };

      if (selectedLoanType === 'bank') {
        if (!selectedCollateral) {
          throw new Error(t('credit.errors.select_collateral'));
        }
        request.collateral_item_id = selectedCollateral;
      }

      const response = await takeLoan(request);
      setSuccessMessage(response.message);
      setLoanAmount('');
      setSelectedLoanType(null);
      setSelectedCollateral(null);

      // Refresh user data
      await useAuthStore.getState().checkAuth();
    } catch (err: any) {
      console.error('Failed to take loan:', err);
    }
  };

  const handleRepayLoan = async () => {
    if (!repayLoanId || !repayAmount) return;

    clearError();
    setSuccessMessage('');

    try {
      const amount = parseFloat(repayAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error(t('credit.errors.invalid_amount'));
      }

      await repayLoan(repayLoanId, amount);
      setSuccessMessage(t('credit.repay_success'));
      setRepayAmount('');
      setRepayLoanId(null);

      // Refresh user data
      await useAuthStore.getState().checkAuth();
    } catch (err: any) {
      console.error('Failed to repay loan:', err);
    }
  };

  const getLoanTypeColor = (type: string) => {
    switch (type) {
      case 'friends':
        return 'from-green-600 to-green-500';
      case 'bank':
        return 'from-blue-600 to-blue-500';
      case 'microcredit':
        return 'from-red-600 to-red-500';
      default:
        return 'from-gray-600 to-gray-500';
    }
  };

  const getLoanTypeIcon = (type: string) => {
    switch (type) {
      case 'friends':
        return '👥';
      case 'bank':
        return '🏦';
      case 'microcredit':
        return '💸';
      default:
        return '💰';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <span>💳</span>
              {t('credit.title')}
            </h1>
            <p className="text-gray-400 text-lg">{t('credit.subtitle')}</p>

            {/* Debt Summary */}
            {summary && summary.total_debt > 0 && (
              <div className="mt-4 bg-gradient-to-r from-red-900/50 to-red-800/50 rounded-lg px-6 py-4 border border-red-700">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="text-red-300 text-sm mb-1">{t('credit.total_debt')}</div>
                    <div className="text-white text-3xl font-bold">
                      ${summary.total_debt.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-red-300 text-sm mb-1">{t('credit.losing_per_second')}</div>
                    <div className="text-red-400 text-2xl font-bold">
                      -${summary.interest_per_second.toFixed(4)}/s
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-red-300 text-sm mb-1">{t('credit.active_loans')}</div>
                    <div className="text-white text-2xl font-bold">{summary.active_loans}</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Error and Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg"
            >
              {t(`credit.errors.${error}`, { defaultValue: error })}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg"
            >
              {successMessage}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Friends Loan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all"
            >
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('credit.friends.title')}</h2>
              <p className="text-gray-400 mb-4">{t('credit.friends.description')}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('credit.interest_rate')}:</span>
                  <span className="text-green-400 font-bold">0%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('credit.max_amount')}:</span>
                  <span className="text-white">$1,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('credit.max_loans')}:</span>
                  <span className="text-white">5 {t('credit.loans')}</span>
                </div>
                {summary && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{t('credit.used')}:</span>
                    <span className="text-yellow-400">
                      ${summary.total_friends_loaned.toFixed(0)} / {summary.friends_loan_count} {t('credit.loans')}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedLoanType('friends')}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-2 rounded-lg font-semibold hover:from-green-500 hover:to-green-400 transition-all"
              >
                {t('credit.apply')}
              </button>
            </motion.div>

            {/* Bank Loan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all"
            >
              <div className="text-6xl mb-4">🏦</div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('credit.bank.title')}</h2>
              <p className="text-gray-400 mb-4">{t('credit.bank.description')}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('credit.interest_rate')}:</span>
                  <span className="text-yellow-400 font-bold">10%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('credit.collateral')}:</span>
                  <span className="text-white">{t('credit.bank.car_or_house')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('credit.available_collateral')}:</span>
                  <span className="text-white">{collateralItems.length}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedLoanType('bank')}
                disabled={collateralItems.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('credit.apply')}
              </button>
            </motion.div>

            {/* Microcredit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-red-500 transition-all"
            >
              <div className="text-6xl mb-4">💸</div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('credit.microcredit.title')}</h2>
              <p className="text-gray-400 mb-4">{t('credit.microcredit.description')}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('credit.interest_rate')}:</span>
                  <span className="text-red-400 font-bold">200%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('credit.collateral')}:</span>
                  <span className="text-green-400">{t('credit.not_required')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('credit.approval')}:</span>
                  <span className="text-green-400">{t('credit.instant')}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedLoanType('microcredit')}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-2 rounded-lg font-semibold hover:from-red-500 hover:to-red-400 transition-all"
              >
                {t('credit.apply')}
              </button>
            </motion.div>
          </div>

          {/* Loan Application Form */}
          {selectedLoanType && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 mb-8"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                {getLoanTypeIcon(selectedLoanType)}
                {t(`credit.${selectedLoanType}.title`)} {t('credit.application')}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2">{t('credit.loan_amount')}</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {selectedLoanType === 'bank' && (
                  <div>
                    <label className="block text-gray-400 mb-2">{t('credit.select_collateral')}</label>
                    <select
                      value={selectedCollateral || ''}
                      onChange={(e) => setSelectedCollateral(Number(e.target.value))}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">{t('credit.choose_item')}</option>
                      {collateralItems.map((userItem) => (
                        <option key={userItem.id} value={userItem.id}>
                          {userItem.item.name} - ${(userItem.item.price * 0.5).toFixed(0)} {t('credit.collateral_value')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleTakeLoan}
                    disabled={isLoading}
                    className={`flex-1 bg-gradient-to-r ${getLoanTypeColor(selectedLoanType)} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50`}
                  >
                    {isLoading ? t('credit.processing') : t('credit.confirm')}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLoanType(null);
                      setLoanAmount('');
                      setSelectedCollateral(null);
                    }}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                  >
                    {t('credit.cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Loans */}
          {loans.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-2xl font-bold text-white mb-4">{t('credit.active_loans')}</h3>

              <div className="space-y-4">
                {loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getLoanTypeIcon(loan.type)}</span>
                          <span className="text-white font-semibold">
                            {t(`credit.${loan.type}.title`)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">{t('credit.borrowed')}:</span>
                            <span className="text-white ml-2">${loan.principal_amount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">{t('credit.remaining')}:</span>
                            <span className="text-red-400 ml-2 font-bold">
                              ${loan.remaining_amount.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">{t('credit.interest')}:</span>
                            <span className="text-yellow-400 ml-2">
                              {(loan.interest_rate * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">{t('credit.per_second')}:</span>
                            <span className="text-red-400 ml-2">
                              -${loan.interest_per_second.toFixed(4)}/s
                            </span>
                          </div>
                        </div>
                        {loan.collateral_item && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-400">{t('credit.collateral')}:</span>
                            <span className="text-blue-400 ml-2">
                              {loan.collateral_item.item.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 md:w-48">
                        {repayLoanId === loan.id ? (
                          <>
                            <input
                              type="number"
                              value={repayAmount}
                              onChange={(e) => setRepayAmount(e.target.value)}
                              placeholder={t('credit.amount')}
                              className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleRepayLoan}
                                className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-semibold hover:bg-green-500"
                              >
                                {t('credit.pay')}
                              </button>
                              <button
                                onClick={() => {
                                  setRepayLoanId(null);
                                  setRepayAmount('');
                                }}
                                className="flex-1 bg-gray-600 text-white py-2 rounded text-sm hover:bg-gray-500"
                              >
                                {t('credit.cancel')}
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={() => setRepayLoanId(loan.id)}
                            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-500"
                          >
                            {t('credit.repay')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

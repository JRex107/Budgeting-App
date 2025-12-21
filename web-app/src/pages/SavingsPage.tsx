import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { formatMoney, parseMoneyInput } from '../domain/money';
import { formatDateISO } from '../domain/monthCalculations';
import { getSettings } from '../db/repositories/settingsRepository';
import {
  getAllSavingsPots,
  getPotTransactions,
  createPotTransaction,
  getTotalSavings,
} from '../db/repositories/savingsPotsRepository';
import type { SavingsPot, PotTransaction } from '../db/database';

export function SavingsPage() {
  const toast = useToast();
  const [pots, setPots] = useState<SavingsPot[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [totalSavings, setTotalSavings] = useState(0);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isWithdrawMoneyOpen, setIsWithdrawMoneyOpen] = useState(false);
  const [isViewHistoryOpen, setIsViewHistoryOpen] = useState(false);
  const [selectedPot, setSelectedPot] = useState<SavingsPot | null>(null);
  const [potHistory, setPotHistory] = useState<PotTransaction[]>([]);

  // Form state
  const [formAmount, setFormAmount] = useState('');
  const [formNote, setFormNote] = useState('');

  useEffect(() => {
    loadData();

    // Reload data when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadData = async () => {
    const settings = await getSettings();
    if (settings) setCurrency(settings.currency);

    const allPots = await getAllSavingsPots();
    setPots(allPots);

    const total = await getTotalSavings();
    setTotalSavings(total);
  };

  const handleOpenAddMoney = (pot: SavingsPot) => {
    setSelectedPot(pot);
    setFormAmount('');
    setFormNote('');
    setIsAddMoneyOpen(true);
  };

  const handleOpenWithdrawMoney = (pot: SavingsPot) => {
    setSelectedPot(pot);
    setFormAmount('');
    setFormNote('');
    setIsWithdrawMoneyOpen(true);
  };

  const handleOpenHistory = async (pot: SavingsPot) => {
    setSelectedPot(pot);
    const history = await getPotTransactions(pot.id!);
    setPotHistory(history);
    setIsViewHistoryOpen(true);
  };

  const handleAddMoney = async () => {
    if (!selectedPot || !selectedPot.id) return;

    const amountMinor = parseMoneyInput(formAmount);
    if (amountMinor <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    await createPotTransaction({
      potId: selectedPot.id,
      amountMinor: amountMinor,
      dateISO: formatDateISO(new Date()),
      note: formNote || 'Deposit',
    });

    setIsAddMoneyOpen(false);
    await loadData();
  };

  const handleWithdrawMoney = async () => {
    if (!selectedPot || !selectedPot.id) return;

    const amountMinor = parseMoneyInput(formAmount);
    if (amountMinor <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountMinor > selectedPot.currentAmountMinor) {
      toast.error('Insufficient funds in this pot');
      return;
    }

    await createPotTransaction({
      potId: selectedPot.id,
      amountMinor: -amountMinor, // Negative for withdrawal
      dateISO: formatDateISO(new Date()),
      note: formNote || 'Withdrawal',
    });

    setIsWithdrawMoneyOpen(false);
    await loadData();
  };

  const getProgressPercentage = (pot: SavingsPot): number => {
    if (pot.targetAmountMinor === 0) return 0;
    return Math.min((pot.currentAmountMinor / pot.targetAmountMinor) * 100, 100);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Savings Pots</h1>
      </div>
      <div className="page-content">
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#8E8E93', marginBottom: '4px' }}>
              Total Savings
            </div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: '#007AFF' }}>
              {formatMoney(totalSavings, currency)}
            </div>
          </div>
        </Card>

        {pots.length === 0 ? (
          <Card>
            <p style={{ fontSize: '14px', color: '#8E8E93', textAlign: 'center' }}>
              No savings pots yet. Create one in Settings to get started!
            </p>
          </Card>
        ) : (
          pots.map((pot) => (
            <Card key={pot.id}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: pot.colorHex,
                      }}
                    />
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{pot.name}</h3>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600' }}>
                    {formatMoney(pot.currentAmountMinor, currency)}
                  </div>
                </div>

                {pot.targetAmountMinor > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8E8E93', marginBottom: '4px' }}>
                      <span>{Math.round(getProgressPercentage(pot))}% of goal</span>
                      <span>{formatMoney(pot.targetAmountMinor, currency)}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#F2F2F7', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${getProgressPercentage(pot)}%`,
                          height: '100%',
                          backgroundColor: pot.colorHex,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={() => handleOpenAddMoney(pot)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: pot.colorHex,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Add Money
                </button>
                <button
                  onClick={() => handleOpenWithdrawMoney(pot)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#F2F2F7',
                    color: '#1C1C1E',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Withdraw
                </button>
                <button
                  onClick={() => handleOpenHistory(pot)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#F2F2F7',
                    color: '#1C1C1E',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  History
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        title={`Add to ${selectedPot?.name}`}
      >
        <Input
          label="Amount"
          type="number"
          step="0.01"
          value={formAmount}
          onChange={(e) => setFormAmount(e.target.value)}
          placeholder="0.00"
        />

        <Input
          label="Note (optional)"
          value={formNote}
          onChange={(e) => setFormNote(e.target.value)}
          placeholder="e.g., Monthly savings"
        />

        <Button title="Add Money" onPress={handleAddMoney} />
      </Modal>

      <Modal
        isOpen={isWithdrawMoneyOpen}
        onClose={() => setIsWithdrawMoneyOpen(false)}
        title={`Withdraw from ${selectedPot?.name}`}
      >
        {selectedPot && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#F2F2F7', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#8E8E93' }}>Available</div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>
              {formatMoney(selectedPot.currentAmountMinor, currency)}
            </div>
          </div>
        )}

        <Input
          label="Amount"
          type="number"
          step="0.01"
          value={formAmount}
          onChange={(e) => setFormAmount(e.target.value)}
          placeholder="0.00"
        />

        <Input
          label="Note (optional)"
          value={formNote}
          onChange={(e) => setFormNote(e.target.value)}
          placeholder="e.g., Emergency expense"
        />

        <Button title="Withdraw Money" onPress={handleWithdrawMoney} />
      </Modal>

      <Modal
        isOpen={isViewHistoryOpen}
        onClose={() => setIsViewHistoryOpen(false)}
        title={`${selectedPot?.name} History`}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {potHistory.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#8E8E93', textAlign: 'center' }}>
              No transactions yet
            </p>
          ) : (
            potHistory.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #F2F2F7',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    {tx.note}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8E8E93' }}>
                    {tx.dateISO}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: tx.amountMinor > 0 ? '#34C759' : '#FF3B30',
                  }}
                >
                  {tx.amountMinor > 0 ? '+' : ''}
                  {formatMoney(tx.amountMinor, currency)}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}

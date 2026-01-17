import { useEffect, useState } from "react";
import { useRustWallet } from "../hooks/useRustWallet";

export const WalletStats: React.FC = () => {
  const { getStats } = useRustWallet();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getStats();
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, [getStats]);

  if (loading) {
    return <div className="text-gray-400 text-sm">Chargement...</div>;
  }

  if (!stats) {
    return <div className="text-gray-400 text-sm">Erreur</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="glass-card p-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Transactions</p>
        <p className="text-2xl font-grotesk text-gold-royal">{stats.total_transactions}</p>
        <p className="text-xs text-gray-500 mt-1">{stats.confirmed_transactions} confirmées</p>
      </div>
      <div className="glass-card p-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Volume Total</p>
        <p className="text-2xl font-grotesk text-neon-green">{stats.total_volume.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-1">FCFA</p>
      </div>
    </div>
  );
};

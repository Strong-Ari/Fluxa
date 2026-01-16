import { useRustWallet } from "../hooks/useRustWallet";

export const TransactionHistory: React.FC = () => {
  const { transactions } = useRustWallet();

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Aucune transaction</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div key={tx.id} className="glass-card p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-grotesk text-white">{tx.merchant_name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-grotesk text-neon-green">{tx.amount.toLocaleString()} FCFA</p>
              <p className={`text-xs mt-1 ${
                tx.status === "confirmed" ? "text-neon-green" :
                tx.status === "pending" ? "text-gold-royal" :
                "text-red-500"
              }`}>
                {tx.status === "confirmed" ? "✓ Confirmée" :
                 tx.status === "pending" ? "⏳ En attente" :
                 "✗ Annulée"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-block px-2 py-1 rounded text-xs ${
              tx.tx_type === "online" ? "bg-blue-900/50 text-blue-300" :
              tx.tx_type === "offline" ? "bg-green-900/50 text-green-300" :
              "bg-gray-900/50 text-gray-300"
            }`}>
              {tx.tx_type === "online" ? "🌐 En ligne" :
               tx.tx_type === "offline" ? "📱 P2P" :
               "↔️ Transfert"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

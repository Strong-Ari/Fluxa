import React from "react";

interface ScreenLayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
  title: string;
  subtitle?: string;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  onBack,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-8 left-8 text-gray-400 hover:text-gold-royal transition-colors font-grotesk"
        >
          ← Retour
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-4xl font-grotesk font-bold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "alt";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  variant = "default",
}) => {
  const baseClass = variant === "alt" ? "glass-card-alt" : "glass-card";
  return (
    <div className={`${baseClass} p-6 ${className}`}>
      {children}
    </div>
  );
};

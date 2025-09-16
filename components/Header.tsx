import React from 'react';

export const Header: React.FC = () => {
  return (
    <header 
      className="nav-glass text-center flex justify-between items-center z-30"
      style={{ padding: 'var(--bitebase-spacing-md)' }}
    >
      <div className="text-left">
        <h1 className="text-xl font-bold" style={{color: 'var(--bitebase-primary)'}}>
          BiteBase
        </h1>
        <p className="text-xs tracking-wider" style={{color: 'var(--bitebase-text-secondary)'}}>
            AI MARKET INTELLIGENCE
        </p>
      </div>
      <div 
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2"
        style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)'}}
      >
        U
      </div>
    </header>
  );
};
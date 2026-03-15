import React from 'react';
import { Zap } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 font-bold text-xl tracking-tighter text-foreground">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-primary-foreground" fill="currentColor" />
          </div>
          AURA AI
        </a>
        <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#dashboard" className="hover:text-accent transition-colors">Dashboard</a>
          <a href="#upload" className="hover:text-accent transition-colors">Upload Resume</a>
          <a href="#roadmap" className="hover:text-accent transition-colors">Skill Recommendations</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

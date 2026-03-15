import React from 'react';

interface JobDescInputProps {
  jobDesc: string;
  onJobDescChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  disabled: boolean;
}

const JobDescInput: React.FC<JobDescInputProps> = ({ jobDesc, onJobDescChange, onAnalyze, isAnalyzing, disabled }) => {
  return (
    <div className="space-y-3">
      <label className="section-label">Step 2: Target Role</label>
      <div className="glass-card p-8 min-h-[320px] flex flex-col">
        <textarea
          className="w-full flex-grow bg-secondary/50 border border-border rounded-xl p-4 text-sm focus:ring-1 ring-primary outline-none resize-none text-foreground placeholder:text-muted-foreground"
          placeholder="Paste the Job Description here...&#10;&#10;Example:&#10;We are looking for a Senior Frontend Engineer with experience in React, TypeScript, AWS..."
          value={jobDesc}
          onChange={(e) => onJobDescChange(e.target.value)}
        />
        <button
          onClick={onAnalyze}
          disabled={disabled || isAnalyzing}
          className="mt-6 w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            'Analyze Resume'
          )}
        </button>
      </div>
    </div>
  );
};

export default JobDescInput;

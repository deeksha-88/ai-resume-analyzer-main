import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js';
import { Radar, Bar, Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale, ArcElement
);

export interface AnalysisResults {
  score: number;
  summary: string;
  matchedSkills: { labels: string[]; values: number[] };
  missingSkills: { labels: string[]; values: number[] };
  roadmap: { skill: string; why: string; links: { name: string; url: string }[] }[];
  modifiedResume: string;
}

const chartColors = {
  cyan: 'rgba(6, 182, 212, 0.8)',
  cyanBg: 'rgba(6, 182, 212, 0.15)',
  violet: 'rgba(139, 92, 246, 0.8)',
  violetBg: 'rgba(139, 92, 246, 0.15)',
  rose: 'rgba(244, 63, 94, 0.8)',
  roseBg: 'rgba(244, 63, 94, 0.2)',
  emerald: 'rgba(16, 185, 129, 0.8)',
  emeraldBg: 'rgba(16, 185, 129, 0.15)',
  amber: 'rgba(245, 158, 11, 0.8)',
  amberBg: 'rgba(245, 158, 11, 0.15)',
};

const pieColors = [
  'rgba(139, 92, 246, 0.85)',
  'rgba(6, 182, 212, 0.85)',
  'rgba(244, 63, 94, 0.85)',
  'rgba(245, 158, 11, 0.85)',
  'rgba(16, 185, 129, 0.85)',
  'rgba(99, 102, 241, 0.85)',
  'rgba(236, 72, 153, 0.85)',
];

const darkGridColor = 'rgba(255,255,255,0.06)';

interface ResultsDashboardProps {
  results: AnalysisResults;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results }) => {
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (circumference * results.score) / 100;

  return (
    <motion.section
      id="dashboard"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <h2 className="text-3xl font-bold text-foreground">Analysis Results</h2>

      {/* Score + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 flex flex-col items-center justify-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
          <h3 className="text-muted-foreground font-bold text-xs uppercase tracking-[0.15em] mb-6">Match Score</h3>
          <div className="relative">
            <svg className="w-40 h-40" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="80" cy="80" r="70" fill="none"
                stroke="url(#scoreGradient)" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-foreground font-mono-data">{results.score}%</span>
          </div>
        </div>

        <div className="md:col-span-2 glass-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={20} className="text-primary" fill="currentColor" />
            <span className="text-primary font-bold text-xs uppercase tracking-[0.15em]">AI Insight</span>
          </div>
          <p className="text-lg text-foreground/90 leading-relaxed font-medium">
            "{results.summary}"
          </p>
        </div>
      </div>

      {/* Matched Skills Bar */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-8">
          <h3 className="text-foreground font-bold mb-6 flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald" /> Top Skills Matched
          </h3>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: results.matchedSkills.labels,
                datasets: [{
                  label: 'Match %',
                  data: results.matchedSkills.values,
                  backgroundColor: results.matchedSkills.labels.map((_, i) =>
                    i % 2 === 0 ? chartColors.cyan : chartColors.emerald
                  ),
                  borderRadius: 6,
                  borderSkipped: false,
                }]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, max: 100, grid: { color: darkGridColor }, ticks: { color: 'rgba(255,255,255,0.4)' } },
                  x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'JetBrains Mono', size: 10 } } }
                }
              }}
            />
          </div>
        </div>

        {/* Missing Skills Radar */}
        <div className="glass-card p-8">
          <h3 className="text-foreground font-bold mb-6 flex items-center gap-2">
            <AlertCircle size={18} className="text-rose" /> Skill Gap Radar
          </h3>
          <div className="h-[300px] flex justify-center">
            <Radar
              data={{
                labels: results.missingSkills.labels,
                datasets: [{
                  label: 'Gap Intensity',
                  data: results.missingSkills.values,
                  backgroundColor: chartColors.roseBg,
                  borderColor: chartColors.rose,
                  pointBackgroundColor: chartColors.rose,
                  pointBorderColor: chartColors.rose,
                  borderWidth: 2,
                }]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: darkGridColor },
                    angleLines: { color: darkGridColor },
                    pointLabels: { color: 'rgba(255,255,255,0.6)', font: { family: 'JetBrains Mono', size: 10 } },
                    ticks: { display: false },
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Missing Skills Bar + Pie */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-8">
          <h3 className="text-foreground font-bold mb-6 flex items-center gap-2">
            <AlertCircle size={18} className="text-amber" /> Missing Skills Breakdown
          </h3>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: results.missingSkills.labels,
                datasets: [{
                  label: 'Gap %',
                  data: results.missingSkills.values,
                  backgroundColor: results.missingSkills.labels.map((_, i) => pieColors[i % pieColors.length]),
                  borderRadius: 6,
                  borderSkipped: false,
                }]
              }}
              options={{
                indexAxis: 'y' as const,
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { beginAtZero: true, max: 100, grid: { color: darkGridColor }, ticks: { color: 'rgba(255,255,255,0.4)' } },
                  y: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'JetBrains Mono', size: 11 } } }
                }
              }}
            />
          </div>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-foreground font-bold mb-6 flex items-center gap-2">
            <AlertCircle size={18} className="text-violet" /> Gap Distribution
          </h3>
          <div className="h-[300px] flex justify-center">
            <Pie
              data={{
                labels: results.missingSkills.labels,
                datasets: [{
                  data: results.missingSkills.values,
                  backgroundColor: results.missingSkills.labels.map((_, i) => pieColors[i % pieColors.length]),
                  borderColor: 'hsl(222 47% 7%)',
                  borderWidth: 3,
                }]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: 'rgba(255,255,255,0.6)', font: { family: 'JetBrains Mono', size: 10 }, padding: 12, usePointStyle: true, pointStyle: 'circle' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ResultsDashboard;

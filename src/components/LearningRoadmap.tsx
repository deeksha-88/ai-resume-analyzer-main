import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, BookOpen } from 'lucide-react';

interface RoadmapItem {
  skill: string;
  why: string;
  links: { name: string; url: string }[];
}

interface LearningRoadmapProps {
  roadmap: RoadmapItem[];
}

const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ roadmap }) => {
  return (
    <section id="roadmap" className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="text-accent" size={28} />
        <h2 className="text-3xl font-bold text-foreground">Personalized Learning Roadmap</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {roadmap.map((item, i) => (
          <motion.div
            key={item.skill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="glass-card p-6 hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1.5 bg-primary/15 text-primary rounded-lg text-xs font-bold uppercase tracking-[0.15em] font-mono-data">
                {item.skill}
              </span>
              <span className="text-xs text-muted-foreground font-mono-data">#{i + 1}</span>
            </div>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{item.why}</p>
            <div className="space-y-2">
              {item.links.map((link, li) => (
                <a
                  key={li}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-secondary/60 rounded-lg text-sm hover:bg-secondary transition-colors group/link"
                >
                  <span className="text-foreground/80 group-hover/link:text-foreground transition-colors">{link.name}</span>
                  <ExternalLink size={14} className="text-muted-foreground group-hover/link:text-accent transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LearningRoadmap;

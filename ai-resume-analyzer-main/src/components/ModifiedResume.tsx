import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

interface ModifiedResumeProps {
  resumeText: string;
  missingSkills: string[];
}

const ModifiedResume: React.FC<ModifiedResumeProps> = ({ resumeText, missingSkills }) => {
  const handleDownload = useCallback(() => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(resumeText, 180);
    let y = 15;
    const lineHeight = 6;
    
    doc.setFontSize(10);
    for (const line of lines) {
      if (y > 280) {
        doc.addPage();
        y = 15;
      }
      doc.text(line, 15, y);
      y += lineHeight;
    }
    doc.save('optimized-resume.pdf');
  }, [resumeText]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <FileText className="text-primary" size={28} />
        <h2 className="text-3xl font-bold text-foreground">Optimized Resume Preview</h2>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Enhanced with AI-suggested keywords and formatting</p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>

        {/* Resume body */}
        <div className="bg-card p-6 md:p-10">
          {/* Highlighted missing skills */}
          {missingSkills.length > 0 && (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3">AI-Added Skills</p>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-primary/15 text-primary rounded-lg text-xs font-mono-data font-semibold border border-primary/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resume text */}
          <pre className="whitespace-pre-wrap text-sm text-foreground/85 leading-relaxed font-mono-data overflow-x-auto">
            {resumeText}
          </pre>
        </div>
      </div>
    </motion.section>
  );
};

export default ModifiedResume;

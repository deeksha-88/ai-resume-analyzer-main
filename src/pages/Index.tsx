import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import ResumeUpload from '@/components/ResumeUpload';
import JobDescInput from '@/components/JobDescInput';
import ResultsDashboard, { type AnalysisResults } from '@/components/ResultsDashboard';
import LearningRoadmap from '@/components/LearningRoadmap';
import ModifiedResume from '@/components/ModifiedResume';
import { useToast } from '@/hooks/use-toast';

const RESUME_SECTIONS = ['skills', 'experience', 'education', 'projects', 'work', 'summary', 'objective', 'certifications', 'achievements', 'professional'];

const validateResume = (text: string): boolean => {
  const lower = text.toLowerCase();
  const found = RESUME_SECTIONS.filter(s => lower.includes(s));
  return found.length >= 2;
};

const Index = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim() || !jobDesc.trim()) return;

    if (!validateResume(resumeText)) {
      setError("This file does not appear to be a valid resume. Please upload a proper resume with sections like Skills, Experience, or Education.");
      setResults(null);
      return;
    }

    setError('');
    setIsAnalyzing(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeText, jobDescription: jobDesc },
      });

      if (fnError) throw fnError;
      
      if (data?.error) {
        if (data.error.includes('Rate limit') || data.error.includes('429')) {
          toast({ title: 'Rate Limited', description: 'Too many requests. Please try again in a moment.', variant: 'destructive' });
        } else if (data.error.includes('402') || data.error.includes('Payment')) {
          toast({ title: 'Credits Exhausted', description: 'Please add credits to continue using AI features.', variant: 'destructive' });
        } else {
          throw new Error(data.error);
        }
        setIsAnalyzing(false);
        return;
      }

      setResults(data as AnalysisResults);
      setTimeout(() => {
        document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e: any) {
      console.error('Analysis error:', e);
      setError('Failed to analyze resume. Please try again.');
      toast({ title: 'Error', description: e.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeText, jobDesc, toast]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <header className="mb-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black text-foreground mb-6 tracking-tight leading-[1.1]"
          >
            AI Resume Analyzer
            <br />
            <span className="gradient-text">& Job Recommender</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            Upload your resume and paste your target job description to get instant AI-powered match analysis, skill gap detection, and a personalized learning roadmap.
          </motion.p>
        </header>

        {/* Input Section */}
        <section id="upload" className="grid lg:grid-cols-2 gap-8 mb-16">
          <ResumeUpload
            resumeText={resumeText}
            onResumeTextChange={setResumeText}
            onFileNameChange={setFileName}
          />
          <JobDescInput
            jobDesc={jobDesc}
            onJobDescChange={setJobDesc}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            disabled={!resumeText.trim() || !jobDesc.trim()}
          />
        </section>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-10 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive"
            >
              <AlertCircle size={20} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <div className="space-y-16">
              <ResultsDashboard results={results} />
              <LearningRoadmap roadmap={results.roadmap} />
              <ModifiedResume
                resumeText={results.modifiedResume}
                missingSkills={results.missingSkills.labels}
              />
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-border py-10 text-center text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} Aura AI Intelligence. Built for high-performance career growth.
      </footer>
    </div>
  );
};

export default Index;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, CheckCircle2, HelpCircle } from 'lucide-react';
import Button from './Button';
import { userService, type UserProfile } from '../api/users';

export interface TutorialStep {
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting (optional for now)
}

interface TutorialGuideProps {
  user: UserProfile;
  tutorialId: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  onUserUpdate?: (user: UserProfile) => void;
}

const TutorialGuide: React.FC<TutorialGuideProps> = ({ 
  user, 
  tutorialId, 
  steps, 
  onComplete,
  onUserUpdate 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isSkippingAll, setIsSkippingAll] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const completedTutorialsStr = JSON.stringify(user.completedTutorials || []);

  useEffect(() => {
    // If user has dismissed this tutorial in the current session/tab, don't show it again
    if (isDismissed) return;

    // Check if user has already seen this tutorial or skipped all
    const completedTutorials = user.completedTutorials || [];
    const hasSeen = completedTutorials.includes(tutorialId);
    const hasSkippedAll = completedTutorials.includes('ALL') || completedTutorials.includes('skip-all');

    if (hasSeen || hasSkippedAll) {
      if (isVisible) setIsVisible(false);
      return;
    }

    if (!isVisible) {
      // Delay visibility slightly for a better UX
      const timer = setTimeout(() => {
        // Re-check just in case state changed during the timeout
        const currentCompleted = user.completedTutorials || [];
        if (!currentCompleted.includes(tutorialId) && 
            !currentCompleted.includes('ALL') && 
            !currentCompleted.includes('skip-all') && 
            !isDismissed) {
          setIsVisible(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [completedTutorialsStr, tutorialId, isDismissed, isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsVisible(false);
    setIsDismissed(true);
    try {
      const response = await userService.completeTutorial(tutorialId);
      if (onUserUpdate) onUserUpdate(response.data);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Failed to mark tutorial as complete', err);
    }
  };

  const handleSkipAll = async () => {
    setIsSkippingAll(true);
    try {
      const response = await userService.skipAllTutorials();
      console.log('Skip all response user:', response.data);
      if (onUserUpdate) onUserUpdate(response.data);
      setIsVisible(false);
      setIsDismissed(true);
    } catch (err) {
      console.error('Failed to skip all tutorials', err);
      // Even if it fails, hide it for the current session to avoid annoying the user
      setIsVisible(false);
      setIsDismissed(true);
    } finally {
      setIsSkippingAll(false);
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="card"
          style={{
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary)' }}>
              <HelpCircle size={24} />
              <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Feature Tutorial
              </span>
            </div>
            <button 
              onClick={() => {
                setIsVisible(false);
                setIsDismissed(true);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--color-bg)', borderRadius: '2px', marginBottom: '2rem' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              style={{ height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }}
            />
          </div>

          {/* Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text)' }}>
              {steps[currentStep].title}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '1rem' }}>
              {steps[currentStep].description}
            </p>
          </motion.div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkipAll}
              isLoading={isSkippingAll}
              style={{ color: 'var(--color-error)' }}
            >
              Skip All Tutorials
            </Button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handleBack} leftIcon={<ChevronLeft size={18} />}>
                  Back
                </Button>
              )}
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleNext}
                rightIcon={currentStep === steps.length - 1 ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>

          {/* Step Indicator dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            {steps.map((_, i) => (
              <div 
                key={i}
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: i === currentStep ? 'var(--color-primary)' : 'var(--color-border)',
                  transition: 'background-color 0.2s'
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialGuide;
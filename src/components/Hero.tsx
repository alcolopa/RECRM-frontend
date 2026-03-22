import { useState, lazy, Suspense } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
const ForgotPasswordForm = lazy(() => import('./ForgotPasswordForm'));
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';

interface HeroProps {
    onSignupSuccess?: (token: string, user: any) => void;
}

const Hero: React.FC<HeroProps> = ({ onSignupSuccess }) => {
    const [formType, setFormType] = useState<'login' | 'signup' | 'forgot-password'>('login');

    return (
        <section style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'radial-gradient(circle at top right, rgba(5, 150, 105, 0.1), transparent 40%), radial-gradient(circle at bottom left, var(--hero-blob), transparent 40%)',
            minHeight: 'calc(100vh - 4rem)',
            display: 'flex',
            alignItems: 'center',
            padding: '2rem 0'
        }}>
            <div className="container">
                <div className="grid grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'left' }}
                    >
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(5, 150, 105, 0.1)',
                            color: 'var(--color-primary)',
                            borderRadius: '2rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '1.5rem'
                        }}>
                            <Zap size={16} />
                            <span>The Next-Gen Real Estate CRM</span>
                        </div>

                        <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                            Close More Deals with <span style={{ color: 'var(--color-primary)' }}>Intelligence.</span>
                        </h1>

                        <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: 'var(--color-text-muted)', marginBottom: '2.5rem', maxWidth: '540px' }}>
                            Streamline your workflow, manage leads effortlessly, and scale your real estate business with our premium all-in-one platform.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                "AI-Powered lead scoring",
                                "Automated follow-ups",
                                "Real-time analytics dashboard"
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <CheckCircle size={20} color="var(--color-primary)" />
                                    <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', width: '100%' }}>
                        {/* Background elements for depth */}
                        <div style={{
                            position: 'absolute',
                            width: '250px',
                            height: '250px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            filter: 'blur(80px)',
                            opacity: 0.1,
                            zIndex: 0
                        }} />

                        <div style={{ zIndex: 1, width: '100%', maxWidth: '450px' }}>
                            <AnimatePresence mode="wait">
                                {formType === 'login' ? (
                                    <motion.div
                                        key="login"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <LoginForm 
                                            onSwitchToSignup={() => setFormType('signup')} 
                                            onForgotPassword={() => setFormType('forgot-password')}
                                        />
                                    </motion.div>
                                ) : formType === 'signup' ? (
                                    <motion.div
                                        key="signup"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <SignupForm 
                                            onSwitchToLogin={() => setFormType('login')} 
                                            onSignupSuccess={onSignupSuccess}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="forgot"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Suspense fallback={null}>
                                            <ForgotPasswordForm onBackToLogin={() => setFormType('login')} />
                                        </Suspense>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;

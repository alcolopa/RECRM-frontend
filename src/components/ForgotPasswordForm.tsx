import { useState, useEffect } from 'react';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, ChevronLeft, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { Input } from './Input';
import Button from './Button';
import { getErrorMessage } from '../utils/errors';

interface ForgotPasswordFormProps {
    onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        let timer: any;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (cooldown > 0) return;

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);
        setError(null);
        setShowToast(false);

        try {
            await api.post('/auth/forgot-password', { email });
            setShowToast(true);
            setCooldown(60);
        } catch (err: any) {
            console.error('Forgot password request failed', err);
            
            // Check if it's a throttle error (429)
            if (err?.response?.status === 429) {
                setError('Too many requests. Please wait a minute.');
                setCooldown(60);
            } else {
                setError(getErrorMessage(err, 'Failed to send reset email. Please try again later.'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card glass"
            style={{ width: '100%', maxWidth: '400px', position: 'relative' }}
        >
            {/* Success Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'absolute',
                            top: '-4rem',
                            left: 0,
                            right: 0,
                            backgroundColor: 'var(--color-success)',
                            color: 'white',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: 'var(--shadow-lg)',
                            zIndex: 100
                        }}
                    >
                        <CheckCircle2 size={18} />
                        <span>Reset link sent to your email!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Reset Password</h2>
                <p style={{ color: 'var(--muted-foreground)' }}>Enter your email to receive a reset link</p>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            background: 'rgba(220, 38, 38, 0.1)',
                            color: 'var(--color-error)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1.25rem',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid rgba(220, 38, 38, 0.2)'
                        }}
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Input
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                    }}
                    disabled={isLoading}
                    icon={Mail}
                />

                <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    disabled={cooldown > 0}
                    leftIcon={cooldown > 0 ? <Clock size={18} /> : undefined}
                    rightIcon={!isLoading && cooldown === 0 && <ArrowRight size={18} />}
                >
                    {cooldown > 0 ? `Wait ${cooldown}s` : 'Send Reset Link'}
                </Button>

                <button
                    type="button"
                    onClick={onBackToLogin}
                    disabled={isLoading}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted-foreground)',
                        fontSize: '0.875rem',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        opacity: isLoading ? 0.5 : 1
                    }}
                >
                    <ChevronLeft size={16} />
                    Back to Login
                </button>
            </form>
        </motion.div>
    );
};

export default ForgotPasswordForm;

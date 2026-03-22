import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { Input } from './Input';
import Button from './Button';
import { mapBackendErrors, getErrorMessage } from '../utils/errors';

interface LoginFormProps {
    onSwitchToSignup?: () => void;
    onForgotPassword?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onForgotPassword }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user } = response.data;

            // Handle both top-level and nested access_token (per user report)
            const token = access_token || user?.access_token || user?.token;

            if (token) {
                localStorage.setItem('token', token);
                setSuccess(true);
                window.location.href = '/';
            } else {
                setError('Authentication failed. No token received.');
            }
        } catch (err: unknown) {
            console.error('Login failed', err);
            setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
            const backendErrors = mapBackendErrors(err);
            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card glass"
            style={{ width: '100%', maxWidth: '400px' }}
        >
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
                <p style={{ color: 'var(--muted-foreground)' }}>Enter your credentials to access your CRM</p>
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
                {success && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            background: 'rgba(22, 163, 74, 0.1)',
                            color: 'var(--color-success)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1.25rem',
                            fontSize: '0.875rem',
                            textAlign: 'center',
                            border: '1px solid rgba(22, 163, 74, 0.2)'
                        }}
                    >
                        Login successful! Redirecting...
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    icon={Mail}
                    error={errors.email}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <Input
                        label="Password"
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                        }}
                        disabled={isLoading}
                        icon={Lock}
                        error={errors.password}
                        rightElement={
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px'
                                }}
                                leftIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            />
                        }
                    />
                    <div style={{ textAlign: 'right' }}>
                        <button 
                            type="button" 
                            onClick={onForgotPassword}
                            disabled={isLoading}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                fontSize: '0.875rem', 
                                color: 'var(--color-primary)', 
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                padding: 0,
                                opacity: isLoading ? 0.5 : 1
                            }}
                        >
                            Forgot?
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    fullWidth
                    style={{ marginTop: '0.5rem' }}
                    isLoading={isLoading}
                    rightIcon={!isLoading && <ArrowRight size={18} />}
                >
                    Sign In
                </Button>

                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                    Don't have an account? <Button type="button" variant="ghost" onClick={onSwitchToSignup} disabled={isLoading} style={{ padding: 0, height: 'auto', fontWeight: 600, color: 'var(--color-primary)' }}>Get Started</Button>
                </p>
            </form>
        </motion.div>
    );
};

export default LoginForm;

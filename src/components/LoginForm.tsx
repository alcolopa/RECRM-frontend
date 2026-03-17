import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import api from '../api/client';
import { Input } from './Input';
import Button from './Button';

interface LoginFormProps {
    onSwitchToSignup?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
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
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email address';
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
            const { access_token } = response.data;

            localStorage.setItem('token', access_token);
            setSuccess(true);

            window.location.href = '/';
        } catch (err: unknown) {
            console.error('Login failed', err);
            let message = 'Login failed. Please check your credentials.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }
            setError(message);
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>Password</label>
                        {errors.password && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 500 }}>{errors.password}</span>
                        )}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Input
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
                            icon={Lock}
                            style={{ 
                                paddingRight: '2.5rem',
                                borderColor: errors.password ? 'var(--color-error)' : undefined,
                                boxShadow: errors.password ? '0 0 0 1px var(--color-error)' : undefined
                            }}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '0.25rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 1,
                                padding: '0.5rem',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px'
                            }}
                            leftIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <a href="#" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none' }}>Forgot?</a>
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
                    Don't have an account? <Button type="button" variant="ghost" onClick={onSwitchToSignup} style={{ padding: 0, height: 'auto', fontWeight: 600, color: 'var(--color-primary)' }}>Get Started</Button>
                </p>
            </form>
        </motion.div>
    );
};

export default LoginForm;

import { useState, useEffect } from 'react';
import { Mail, Lock, User, Building, Globe, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { Input } from './Input';
import Button from './Button';
import PasswordStrength from './PasswordStrength';
import { isPasswordStrong } from '../utils/validation';
import { mapBackendErrors, getErrorMessage } from '../utils/errors';

interface SignupFormProps {
    onSwitchToLogin?: () => void;
    onSignupSuccess?: (token: string, user: any) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        organizationName: '',
        organizationSlug: ''
    });

    const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

    // Auto-generate slug from organization name
    useEffect(() => {
        const slug = formData.organizationName
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setFormData(prev => ({ ...prev, organizationSlug: slug }));
        
        // Clear slug error if name is typed
        if (formData.organizationName && errors.organizationName) {
            setErrors(prev => {
                const next = { ...prev };
                delete next.organizationName;
                return next;
            });
        }
    }, [formData.organizationName]);

    // Check slug availability with debounce
    useEffect(() => {
        if (!formData.organizationSlug || formData.organizationSlug.length < 3) {
            setSlugStatus('idle');
            return;
        }

        if (!/^[a-z0-9-]+$/.test(formData.organizationSlug)) {
            setSlugStatus('invalid');
            return;
        }

        setSlugStatus('checking');
        const timer = setTimeout(async () => {
            try {
                const response = await api.get(`/auth/check-slug/${formData.organizationSlug}`);
                setSlugStatus(response.data.available ? 'available' : 'taken');
            } catch (err) {
                console.error('Failed to check slug availability', err);
                setSlugStatus('idle');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.organizationSlug]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        
        // Clear error when user types
        if (errors[id]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!isPasswordStrong(formData.password)) {
            newErrors.password = 'Password must meet all requirements';
        }
        
        if (!formData.organizationName.trim()) {
            newErrors.organizationName = 'Organization name is required';
        }
        
        if (!formData.organizationSlug.trim()) {
            newErrors.organizationSlug = 'Workspace URL is required';
        } else if (formData.organizationSlug.length < 3) {
            newErrors.organizationSlug = 'URL must be at least 3 characters';
        } else if (!/^[a-z0-9-]+$/.test(formData.organizationSlug)) {
            newErrors.organizationSlug = 'Only lowercase letters, numbers, and hyphens allowed';
        } else if (slugStatus === 'taken') {
            newErrors.organizationSlug = 'This URL is already taken';
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
            const response = await api.post('/auth/register', formData);
            const { access_token, user } = response.data;
            
            // Handle both top-level and nested access_token (per user report)
            const token = access_token || user?.access_token || user?.token;
            
            if (token) {
                // Store token and notify parent for auto-login
                localStorage.setItem('token', token);
                
                if (onSignupSuccess) {
                    onSignupSuccess(token, user);
                }
                
                // Redirect to dashboard to ensure fresh state (same as LoginForm)
                window.location.href = '/dashboard';
                return;
            }
            
            // Fallback for when no token is returned
            setSuccess(true);
            setTimeout(() => {
                if (onSwitchToLogin) {
                    onSwitchToLogin();
                } else {
                    window.location.href = '/login';
                }
            }, 2000);
        } catch (err: unknown) {
            console.error('Registration failed', err);
            setError(getErrorMessage(err, 'Registration failed. Please try again.'));
            const backendErrors = mapBackendErrors(err);
            if (Object.keys(backendErrors).length > 0) {
                setErrors(backendErrors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card glass"
                style={{ width: '100%', maxWidth: '450px', textAlign: 'center', padding: '3rem 2rem' }}
            >
                <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    background: 'rgba(5, 150, 105, 0.1)', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: 'var(--color-primary)'
                }}>
                    <CheckCircle2 size={32} />
                </div>
                <h2 style={{ fontSize: '1.875rem', marginBottom: '1rem' }}>Registration Successful!</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                    Welcome to EstateHub! Your account has been successfully created. You can now log in to your workspace.
                </p>
                <Button 
                    variant="outline" 
                    fullWidth 
                    onClick={onSwitchToLogin}
                >
                    Back to Login
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card glass"
            style={{ width: '100%', maxWidth: '450px' }}
        >
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Create Account</h2>
                <p style={{ color: 'var(--muted-foreground)' }}>Join the future of real estate management</p>
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        label="First Name"
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={isLoading}
                        icon={User}
                        error={errors.firstName}
                    />
                    <Input
                        label="Last Name"
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={isLoading}
                        icon={User}
                        error={errors.lastName}
                    />
                </div>

                <Input
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    icon={Mail}
                    error={errors.email}
                />

                <Input
                    label="Password"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
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
                            leftIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        />
                    }
                />
                <PasswordStrength password={formData.password} />

                <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius)', border: '1px dashed var(--color-primary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <Input
                            label="Organization Name"
                            id="organizationName"
                            name="organizationName"
                            placeholder="Acme Realty"
                            required
                            value={formData.organizationName}
                            onChange={handleChange}
                            disabled={isLoading}
                            icon={Building}
                            error={errors.organizationName}
                        />
                        <div style={{ position: 'relative' }}>
                            <Input
                                label="Workspace URL"
                                id="organizationSlug"
                                name="organizationSlug"
                                placeholder="acme-realty"
                                required
                                value={formData.organizationSlug}
                                onChange={handleChange}
                                disabled={isLoading}
                                icon={Globe}
                                style={{ paddingRight: '10rem' }}
                                error={errors.organizationSlug}
                                rightElement={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '0.5rem' }}>
                                        <span style={{ 
                                            fontSize: '0.8125rem', 
                                            color: 'var(--color-text)', 
                                            opacity: 0.5,
                                            fontWeight: 500,
                                            pointerEvents: 'none'
                                        }}>
                                            {import.meta.env.VITE_WORKSPACE_SUFFIX || '.estatehub.com'}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', width: '1.25rem', justifyContent: 'center' }}>
                                            {slugStatus === 'checking' && <Loader2 size={16} className="animate-spin" color="var(--color-primary)" />}
                                            {slugStatus === 'available' && <CheckCircle2 size={16} color="var(--color-success)" />}
                                            {(slugStatus === 'taken' || slugStatus === 'invalid') && <XCircle size={16} color="var(--color-error)" />}
                                        </div>
                                    </div>
                                }
                            />
                            <div style={{ marginTop: '0.25rem', height: '1rem' }}>
                                {slugStatus === 'available' && (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 600 }}>URL is available!</span>
                                )}
                                {slugStatus === 'taken' && (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-error)', fontWeight: 600 }}>This URL is already taken.</span>
                                )}
                                {slugStatus === 'invalid' && (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-error)', fontWeight: 600 }}>Use only lowercase, numbers, and hyphens.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    fullWidth 
                    style={{ marginTop: '0.5rem' }}
                    isLoading={isLoading}
                    disabled={slugStatus === 'taken' || slugStatus === 'checking'}
                    rightIcon={!isLoading && <ArrowRight size={18} />}
                >
                    Create Account
                </Button>

                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                    Already have an account? <Button type="button" variant="ghost" onClick={onSwitchToLogin} disabled={isLoading} style={{ padding: 0, height: 'auto', fontWeight: 600, color: 'var(--color-primary)' }}>Sign In</Button>
                </p>
            </form>
        </motion.div>
    );
};

export default SignupForm;

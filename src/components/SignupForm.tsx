import { useState, useEffect } from 'react';
import { Mail, Lock, User, Building, Globe, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import api from '../api/client';

interface SignupFormProps {
    onSwitchToLogin?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        organizationName: '',
        organizationSlug: ''
    });

    // Auto-generate slug from organization name
    useEffect(() => {
        const slug = formData.organizationName
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setFormData(prev => ({ ...prev, organizationSlug: slug }));
    }, [formData.organizationName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await api.post('/auth/register', formData);
            setSuccess(true);
            
            // Redirect after success
            setTimeout(() => {
                if (onSwitchToLogin) {
                    onSwitchToLogin();
                } else {
                    window.location.href = '/login';
                }
            }, 2000);
        } catch (err: unknown) {
            console.error('Registration failed', err);
            let message = 'Registration failed. Please try again.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }
            setError(message);
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
                    background: '#dcfce7', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: '#15803d'
                }}>
                    <CheckCircle2 size={32} />
                </div>
                <h2 style={{ fontSize: '1.875rem', marginBottom: '1rem' }}>Account Created!</h2>
                <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
                    Welcome to EstateHub. Your organization <strong>{formData.organizationName}</strong> has been set up successfully.
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                    Redirecting you to login...
                </p>
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
                            background: '#fee2e2', 
                            color: '#b91c1c', 
                            padding: '0.75rem', 
                            borderRadius: 'var(--radius)',
                            marginBottom: '1.25rem',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid #fecaca'
                        }}
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label htmlFor="firstName" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--secondary)' }}>First Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} color="var(--secondary)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input id="firstName" name="firstName" type="text" placeholder="John" required value={formData.firstName} onChange={handleChange}
                                style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label htmlFor="lastName" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--secondary)' }}>Last Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} color="var(--secondary)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input id="lastName" name="lastName" type="text" placeholder="Doe" required value={formData.lastName} onChange={handleChange}
                                style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label htmlFor="email" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--secondary)' }}>Email</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} color="var(--secondary)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input id="email" name="email" type="email" placeholder="john@example.com" required value={formData.email} onChange={handleChange}
                            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label htmlFor="password" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--secondary)' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} color="var(--secondary)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={formData.password} onChange={handleChange}
                            style={{ width: '100%', padding: '0.6rem 2.5rem 0.6rem 2.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none' }}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: 'var(--radius)', border: '1px dashed var(--primary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label htmlFor="organizationName" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--primary)' }}>Organization Name</label>
                            <div style={{ position: 'relative' }}>
                                <Building size={16} color="var(--primary)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input id="organizationName" name="organizationName" type="text" placeholder="Acme Realty" required value={formData.organizationName} onChange={handleChange}
                                    style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--primary)', fontSize: '0.9rem', outline: 'none', background: 'white' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label htmlFor="organizationSlug" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--primary)' }}>Workspace URL</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={16} color="var(--primary)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input id="organizationSlug" name="organizationSlug" type="text" placeholder="acme-realty" required value={formData.organizationSlug} onChange={handleChange}
                                    style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--primary)', fontSize: '0.9rem', outline: 'none', background: 'white' }}
                                />
                                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.7 }}>.estatehub.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} /></>}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                    Already have an account? <button type="button" onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', font: 'inherit' }}>Sign In</button>
                </p>
            </form>
        </motion.div>
    );
};

export default SignupForm;

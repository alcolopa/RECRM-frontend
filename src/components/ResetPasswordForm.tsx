import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { Input } from './Input';
import Button from './Button';
import PasswordStrength from './PasswordStrength';
import { getErrorMessage } from '../utils/errors';

interface ResetPasswordFormProps {
    onBackToLogin: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToLogin }) => {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setError('Missing reset token. Please request a new link.');
        }
    }, []);

    const isPasswordStrong = (pass: string) => {
        return (
            pass.length >= 8 &&
            /[A-Z]/.test(pass) &&
            /[a-z]/.test(pass) &&
            /[0-9]/.test(pass) &&
            /[^A-Za-z0-9]/.test(pass)
        );
    };

    const validate = () => {
        if (!isPasswordStrong(newPassword)) {
            setError('Password does not meet strength requirements');
            return false;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        setError(null);

        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setSuccess(true);
        } catch (err: unknown) {
            console.error('Password reset failed', err);
            setError(getErrorMessage(err, 'Failed to reset password. The link may have expired.'));
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
                style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }}
            >
                <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    color: 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <CheckCircle2 size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Success!</h2>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
                    Your password has been successfully reset. You can now log in with your new password.
                </p>
                <Button fullWidth onClick={onBackToLogin}>
                    Proceed to Login
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card glass"
            style={{ width: '100%', maxWidth: '400px' }}
        >
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>New Password</h2>
                <p style={{ color: 'var(--muted-foreground)' }}>Choose a secure password for your account</p>
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Input
                    label="New Password"
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={newPassword}
                    onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError(null);
                    }}
                    disabled={isLoading}
                    icon={Lock}
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
                <PasswordStrength password={newPassword} />

                <Input
                    label="Confirm New Password"
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError(null);
                    }}
                    disabled={isLoading}
                    icon={Lock}
                />

                <Button
                    type="submit"
                    fullWidth
                    style={{ marginTop: '0.5rem' }}
                    isLoading={isLoading}
                    disabled={!token || isLoading}
                    rightIcon={!isLoading && <ArrowRight size={18} />}
                >
                    Update Password
                </Button>
            </form>
        </motion.div>
    );
};

export default ResetPasswordForm;

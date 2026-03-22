import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
    {
        name: "Starter",
        price: "49",
        description: "Perfect for individual agents starting their digital journey.",
        features: ["Up to 500 leads", "Basic property tracking", "Email support", "Mobile app access"]
    },
    {
        name: "Professional",
        price: "99",
        description: "Built for top-performing agents who need more power.",
        features: ["Unlimited leads", "Advanced automation", "Priority support", "AI lead scoring", "Custom branding"],
        popular: true
    },
    {
        name: "Team",
        price: "249",
        description: "Maximum efficiency for real estate teams and small offices.",
        features: ["Up to 10 users", "Team collaboration tools", "Detailed analytics", "Dedicated account manager", "API access"]
    }
];

const Pricing = () => {
    return (
        <section id="pricing">
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1rem' }}>Simple, transparent pricing</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem', maxWidth: '700px', margin: '0 auto' }}>
                        Choose the plan that fits your business stage. No hidden fees, cancel anytime.
                    </p>
                </div>

                <div className="grid grid-3">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`card ${plan.popular ? 'glass' : ''}`}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem',
                                position: 'relative',
                                border: plan.popular ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                transform: plan.popular ? 'scale(1.05)' : 'none',
                                zIndex: plan.popular ? 1 : 0
                            }}
                        >
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    padding: '2px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    Most Popular
                                </div>
                            )}

                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{plan.description}</p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>${plan.price}</span>
                                <span style={{ color: 'var(--color-text-muted)' }}>/month</span>
                            </div>

                            <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>
                                Get Started
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                {plan.features.map((feature, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                                        <Check size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;

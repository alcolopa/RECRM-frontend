import { motion } from 'framer-motion';
import { Users, Home, BarChart3, MessageSquare, Calendar, FolderCheck } from 'lucide-react';

const features = [
    {
        icon: <Users size={24} color="var(--color-primary)" />,
        title: "Lead Management",
        description: "Track and nurture your leads from first contact to closing with automated workflows."
    },
    {
        icon: <Home size={24} color="var(--color-primary)" />,
        title: "Property Tracking",
        description: "Keep a detailed database of your listings with high-res photos and virtual tours."
    },
    {
        icon: <BarChart3 size={24} color="var(--color-primary)" />,
        title: "Insightful Analytics",
        description: "Deep dive into your performance data with visual charts and custom reports."
    },
    {
        icon: <MessageSquare size={24} color="var(--color-primary)" />,
        title: "Smart Communication",
        description: "Built-in SMS and email integration to stay connected with your clients."
    },
    {
        icon: <Calendar size={24} color="var(--color-primary)" />,
        title: "Task Automation",
        description: "Sync your calendar and automate repetitive tasks to focus on what matters."
    },
    {
        icon: <FolderCheck size={24} color="var(--color-primary)" />,
        title: "Transaction Room",
        description: "Securely manage all your documents and closings in one central location."
    }
];

const Features = () => {
    return (
        <section id="features" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1rem' }}>Everything you need to succeed</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'clamp(1rem, 3vw, 1.125rem)', maxWidth: '700px', margin: '0 auto' }}>
                        Powerful features designed specifically for real estate professionals to thrive in a competitive market.
                    </p>
                </div>

                <div className="grid grid-2 grid-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="card"
                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}
                        >
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                borderRadius: '0.5rem',
                                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                                color: 'var(--color-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;

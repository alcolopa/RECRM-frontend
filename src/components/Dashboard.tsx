import { 
  TrendingUp, 
  Users, 
  Building2, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Leads', value: '1,284', change: '+12.5%', icon: Users, color: '#3b82f6', trend: 'up' },
    { label: 'Properties', value: '452', change: '+3.2%', icon: Building2, color: '#10b981', trend: 'up' },
    { label: 'Active Deals', value: '84', change: '-2.4%', icon: Briefcase, color: '#f59e0b', trend: 'down' },
    { label: 'Revenue', value: '$2.4M', change: '+18.7%', icon: TrendingUp, color: '#8b5cf6', trend: 'up' },
  ];

  const recentLeads = [
    { name: 'Alice Thompson', email: 'alice@example.com', status: 'New', time: '2h ago' },
    { name: 'Robert Wilson', email: 'robert@wilson.com', status: 'Contacted', time: '5h ago' },
    { name: 'Sarah Miller', email: 'sarah.m@gmail.com', status: 'Qualified', time: '1d ago' },
    { name: 'David Lee', email: 'david.lee@outlook.com', status: 'New', time: '2d ago' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--secondary)' }}>Welcome back, here is what's happening with your properties today.</p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ 
                width: '3rem', 
                height: '3rem', 
                borderRadius: '0.75rem', 
                backgroundColor: `${stat.color}15`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: stat.color
              }}>
                <stat.icon size={24} />
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', fontWeight: 500 }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', 
        gap: '1.5rem' 
      }}>
        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
          style={{ padding: '1.25rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Recent Leads</h3>
            <button style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentLeads.map((lead, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.5rem 0',
                flexWrap: 'wrap'
              }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: 'var(--secondary)',
                  flexShrink: 0
                }}>
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.email}</p>
                </div>
                <div style={{ 
                  textAlign: 'right',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end'
                }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '1rem', 
                    backgroundColor: lead.status === 'New' ? 'var(--primary-light)' : '#f3f4f6',
                    color: lead.status === 'New' ? 'var(--primary)' : 'var(--secondary)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    {lead.status}
                  </span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>{lead.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
          style={{ padding: '1.25rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Upcoming Tasks</h3>
            <button style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Add Task</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '32px' }}>
                <Calendar size={18} color="var(--primary)" />
                <div style={{ width: '2px', flex: 1, background: 'var(--border)', margin: '0.5rem 0' }}></div>
              </div>
              <div style={{ paddingBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Property showing with Alice</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <Clock size={12} /> Today, 2:30 PM
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '32px' }}>
                <Calendar size={18} color="var(--secondary)" />
                <div style={{ width: '2px', flex: 1, background: 'var(--border)', margin: '0.5rem 0' }}></div>
              </div>
              <div style={{ paddingBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Contract signing - Sunset Apt</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <Clock size={12} /> Tomorrow, 10:00 AM
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '32px' }}>
                <Calendar size={18} color="var(--secondary)" />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Follow up call with Robert</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <Clock size={12} /> Thursday, 4:00 PM
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

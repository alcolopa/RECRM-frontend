import React, { useState, useEffect } from 'react';
import { Search, User, X, Loader2 } from 'lucide-react';
import { type UserProfile, userService } from '../api/users';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface UserSelectorProps {
  organizationId: string;
  selectedUserId?: string;
  onSelect: (userId: string) => void;
  label?: string;
}

const UserSelector: React.FC<UserSelectorProps> = ({ 
  organizationId, 
  selectedUserId, 
  onSelect,
  label = "Assigned Agent"
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!organizationId) return;
      try {
        setIsLoading(true);
        const response = await userService.getAll(organizationId);
        setUsers(response.data);
        
        if (selectedUserId) {
          const found = response.data.find(u => u.id === selectedUserId);
          if (found) setSelectedUser(found);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [organizationId, selectedUserId]);

  const filteredUsers = users.filter(user => {
    const fullSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();
    return fullSearch.includes(searchTerm.toLowerCase());
  });

  const handleSelect = (user: UserProfile) => {
    setSelectedUser(user);
    onSelect(user.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</label>
      
      {selectedUser ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-primary)',
          background: 'rgba(5, 150, 105, 0.05)',
        }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(5, 150, 105, 0.1)',
            backgroundImage: selectedUser.avatar ? `url(${selectedUser.avatar})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            fontWeight: 600,
            flexShrink: 0
          }}>
            {!selectedUser.avatar && `${selectedUser.firstName?.[0] || ''}${selectedUser.lastName?.[0] || ''}`}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{selectedUser.firstName} {selectedUser.lastName}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedUser.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedUser(null);
              onSelect('');
            }}
            aria-label="Clear selection"
            style={{ padding: '0.25rem', flexShrink: 0 }}
          >
            <X size={18} />
          </Button>
        </div>
      ) : (
        <div 
          onClick={() => setIsOpen(true)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <User size={18} />
          <span style={{ fontSize: '0.875rem' }}>Select an agent...</span>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <div 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              zIndex: 100, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '1rem',
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '450px',
                maxHeight: '80vh',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '1rem',
                boxShadow: 'var(--shadow-2xl)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid var(--color-border)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Select Agent</h3>
                  <button 
                    onClick={() => setIsOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Search 
                    size={18} 
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} 
                  />
                  <input
                    id="userSearch"
                    name="userSearch"
                    autoFocus
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg)',
                      outline: 'none',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {isLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <Loader2 size={24} className="animate-spin" color="var(--color-primary)" />
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelect(user)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          background: selectedUserId === user.id ? 'rgba(5, 150, 105, 0.1)' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                        className="user-option"
                      >
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(5, 150, 105, 0.1)',
                          backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-primary)',
                          fontWeight: 600,
                          flexShrink: 0
                        }}>
                          {!user.avatar && `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>
                            {user.firstName} {user.lastName}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.email}
                          </p>
                        </div>
                        <div style={{ 
                          fontSize: '0.625rem', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '1rem',
                          backgroundColor: 'var(--color-bg)',
                          color: 'var(--color-text-muted)'
                        }}>
                          {user.role}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No users found matching your search.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSelector;

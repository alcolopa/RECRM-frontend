import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, Loader2, ChevronDown } from 'lucide-react';
import { type UserProfile, userService } from '../api/users';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../utils/url';

interface UserSelectorProps {
  organizationId: string;
  selectedUserId?: string;
  onSelect: (userId: string) => void;
  label?: string;
  error?: string;
}

const UserSelector: React.FC<UserSelectorProps> = ({ 
  organizationId, 
  selectedUserId, 
  onSelect,
  label = "Assigned Agent",
  error
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        } else {
          setSelectedUser(null);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [organizationId, selectedUserId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUser(null);
    onSelect('');
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', position: 'relative' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ 
            fontSize: '0.8125rem', 
            fontWeight: 700, 
            color: 'var(--color-text-muted)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.025em',
            display: 'block'
          }}>
            {label}
          </label>
        </div>
      )}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 0.875rem',
          borderRadius: 'var(--radius)',
          border: `1px solid ${error ? 'var(--color-error)' : (isOpen ? 'var(--color-primary)' : 'var(--color-border)')}`,
          background: 'var(--color-surface)',
          cursor: 'pointer',
          minHeight: '2.75rem',
          transition: 'all 0.2s ease',
          boxShadow: error ? '0 0 0 1px var(--color-error), 0 0 0 4px rgba(220, 38, 38, 0.1)' : (isOpen ? '0 0 0 1px var(--color-primary), 0 0 0 4px rgba(var(--color-primary-rgb), 0.1)' : 'none')
        }}
      >
        <div style={{
          width: '1.75rem',
          height: '1.75rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
          backgroundImage: selectedUser?.avatar ? `url(${getImageUrl(selectedUser.avatar)})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)',
          fontSize: '0.75rem',
          fontWeight: 700,
          flexShrink: 0
        }}>
          {!selectedUser?.avatar && (selectedUser ? `${selectedUser.firstName?.[0] || ''}${selectedUser.lastName?.[0] || ''}` : <User size={14} />)}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedUser ? (
            <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-text)' }}>
              {selectedUser.firstName} {selectedUser.lastName}
            </span>
          ) : (
            <span style={{ fontSize: '0.9375rem', color: 'var(--muted-foreground)' }}>Select an agent...</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
          {selectedUser && (
            <X 
              size={16} 
              onClick={handleClear}
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
            />
          )}
          <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.5rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              <div style={{ position: 'relative' }}>
                <Search 
                  size={14} 
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} 
                />
                <input
                  autoFocus
                  type="text"
                  placeholder="Filter agents..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    outline: 'none',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
            </div>

            <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '0.25rem' }}>
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                  <Loader2 size={20} className="animate-spin" color="var(--color-primary)" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(user);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem 0.75rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        background: selectedUserId === user.id ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(var(--color-primary-rgb), 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = selectedUserId === user.id ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent')}
                    >
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                        backgroundImage: user.avatar ? `url(${getImageUrl(user.avatar)})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        flexShrink: 0
                      }}>
                        {!user.avatar && `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{user.firstName} {user.lastName}</span>
                          {selectedUserId === user.id && (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                          )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.8125rem' }}>
                  No agents found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.125rem' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default UserSelector;

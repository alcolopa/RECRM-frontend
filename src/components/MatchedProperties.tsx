import React, { useState, useEffect } from 'react';
import { getMatchedPropertiesForClient, type MatchedPropertyResult } from '../api/matching';
import PropertyCard from './PropertyCard';
import { Loader2, Target, HandCoins } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import Button from './Button';

interface MatchedPropertiesProps {
  organizationId: string;
  type: 'contact' | 'lead';
  id: string;
}

const MatchedProperties: React.FC<MatchedPropertiesProps> = ({ organizationId, type, id }) => {
  const [matches, setMatches] = useState<MatchedPropertyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigate } = useNavigation();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMatchedPropertiesForClient(organizationId, type, id);
        setMatches(data);
      } catch (err) {
        console.error('Error fetching matched properties', err);
      } finally {
        setLoading(false);
      }
    };
    if (organizationId && id) fetchMatches();
  }, [organizationId, type, id]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No matching properties found for this client.
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
        <Target size={20} color="var(--color-primary)" /> AI Matched Properties
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {matches.map((match) => (
          <div key={match.propertyId} style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <PropertyCard 
                property={match.property as any} 
                onEdit={() => {}}
                onDelete={() => {}}
                onClick={() => navigate('properties', { context: 'view-property', prefillData: { property: match.property } })}
                canEdit={false}
                canDelete={false}
              />
            </div>
            <div style={{ 
              marginTop: '0.75rem', 
              background: 'rgba(5, 150, 105, 0.05)', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius)',
              border: '1px solid rgba(5, 150, 105, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong style={{ color: 'var(--color-primary)', fontSize: '0.8125rem' }}>AI Match Analysis</strong>
                <span style={{ background: 'var(--color-success)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 800 }}>{match.score}% Score</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text)' }}>
                {match.matchReasons.join(', ')}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              style={{ marginTop: '0.5rem', width: '100%', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              leftIcon={<HandCoins size={16} />}
              onClick={() => navigate('offers', { 
                 prefillData: { 
                    propertyId: match.propertyId, 
                    contactId: type === 'contact' ? id : undefined, 
                    leadId: type === 'lead' ? id : undefined 
                 } 
              })}
            >
              Start Deal / Offer
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchedProperties;

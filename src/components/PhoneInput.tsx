import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { countries, type Country } from '../utils/countries';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
  error?: string | null;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, id, error: externalError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse the current value to find the matching country (find longest matching code)
  const sortedCountries = [...countries].sort((a, b) => b.code.length - a.code.length);
  const selectedCountry = sortedCountries.find(c => value.startsWith(c.code)) || countries[0];
  const rawNumber = value.substring(selectedCountry.code.length).replace(/\D/g, '');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format helper
  const formatPhoneNumber = (digits: string, country: Country) => {
    if (!country.format) return digits;

    let formatted = '';
    let digitIndex = 0;
    const template = country.format;

    for (let i = 0; i < template.length && digitIndex < digits.length; i++) {
      if (template[i] === '#') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += template[i];
      }
    }

    return formatted;
  };

  // Validation logic
  useEffect(() => {
    if (!rawNumber) {
      setIsValid(null);
      return;
    }

    if (selectedCountry.pattern) {
      const regex = new RegExp(selectedCountry.pattern);
      setIsValid(regex.test(rawNumber));
    } else {
      setIsValid(rawNumber.length >= 7);
    }
  }, [rawNumber, selectedCountry]);

  const handleCountrySelect = (country: Country) => {
    onChange(`${country.code} ${rawNumber}`);
    setIsOpen(false);
    setSearch('');
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    // Limit digits to what the format allows or a reasonable max
    const maxDigits = selectedCountry.format ? (selectedCountry.format.match(/#/g) || []).length : 15;
    const limitedDigits = digits.substring(0, maxDigits);
    onChange(`${selectedCountry.code} ${limitedDigits}`);
  };

  const filteredCountries = countries.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.includes(search)
  );

  const formattedDisplay = formatPhoneNumber(rawNumber, selectedCountry);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    borderRadius: 'var(--radius)',
    border: `1px solid ${externalError ? '#ef4444' : (isOpen ? 'var(--primary)' : 'var(--border)')}`,
    background: 'var(--input-bg)',
    transition: 'all 0.2s ease',
    boxShadow: isOpen ? '0 0 0 2px rgba(37, 99, 235, 0.1)' : 'none',
    overflow: 'hidden',
    height: '2.75rem'
  };

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <div style={containerStyle}>
        {/* Unified Country Selector */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0 0.75rem',
            border: 'none',
            background: 'var(--muted)',
            cursor: 'pointer',
            height: '100%',
            fontSize: '0.9rem',
            borderRight: '1px solid var(--border)',
            minWidth: '95px'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{selectedCountry.flag}</span>
          <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{selectedCountry.code}</span>
          <ChevronDown size={14} color="var(--secondary)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* Input Field */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
          <input
            id={id}
            name={id}
            type="tel"
            value={formattedDisplay}
            onChange={handleNumberChange}
            placeholder={selectedCountry.format?.replace(/#/g, '0') || '000 000 0000'}
            style={{
              width: '100%',
              padding: '0 2.5rem 0 0.75rem',
              border: 'none',
              fontSize: '0.95rem',
              outline: 'none',
              background: 'transparent',
              height: '100%',
              fontFamily: 'inherit'
            }}
          />
          <div style={{ position: 'absolute', right: '0.75rem', display: 'flex', alignItems: 'center' }}>
            {isValid === true && <CheckCircle2 size={16} color="#10b981" />}
            {isValid === false && <AlertCircle size={16} color="#ef4444" />}
          </div>
        </div>
      </div>

      {/* Validation Message */}
      <AnimatePresence>
        {(isValid === false || externalError) && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', fontWeight: 500 }}
          >
            {externalError || `Format should be: ${selectedCountry.format}`}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              width: '280px',
              backgroundColor: 'var(--card-bg)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border)',
              zIndex: 100,
              overflow: 'hidden',
              padding: '0.5rem'
            }}
          >
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <Search size={14} color="var(--secondary)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="countrySearch"
                name="countrySearch"
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {filteredCountries.map(country => (
                <button
                  key={`${country.iso}-${country.code}`}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    border: 'none',
                    background: selectedCountry.iso === country.iso && selectedCountry.code === country.code ? 'var(--primary-light)' : 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: selectedCountry.iso === country.iso && selectedCountry.code === country.code ? 'var(--primary)' : 'var(--foreground)'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{country.flag}</span>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{country.name}</span>
                  <span style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 600 }}>{country.code}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhoneInput;

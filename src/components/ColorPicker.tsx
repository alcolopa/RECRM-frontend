import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pipette, Check, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACCENTS } from '../contexts/ThemeContext';

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  disabled?: boolean;
}

// Helper: Convert Hex to HSV
const hexToHSV = (hex: string) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

// Helper: Convert HSV to Hex
const hsvToHex = (h: number, s: number, v: number) => {
  s /= 100; v /= 100;
  let i = Math.floor(h / 60) % 6;
  let f = h / 60 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label, disabled }) => {
  const [hsv, setHsv] = useState(() => hexToHSV(value.startsWith('#') ? value : '#059669'));
  const [isExpanded, setIsExpanded] = useState(false);
  const [hexInput, setHexInput] = useState(value.toUpperCase());
  
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.toUpperCase() !== hsvToHex(hsv.h, hsv.s, hsv.v)) {
      setHsv(hexToHSV(value));
      setHexInput(value.toUpperCase());
    }
  }, [value]);

  const handleSVMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!svRef.current || disabled) return;
    const rect = svRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let s = ((clientX - rect.left) / rect.width) * 100;
    let v = (1 - (clientY - rect.top) / rect.height) * 100;
    
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    
    setHsv(prev => {
      const newHex = hsvToHex(prev.h, s, v);
      onChange(newHex);
      return { ...prev, s, v };
    });
  }, [hsv.h, onChange, disabled]);

  const handleHueMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!hueRef.current || disabled) return;
    const rect = hueRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    let h = ((clientX - rect.left) / rect.width) * 360;
    h = Math.max(0, Math.min(360, h));
    
    setHsv(prev => {
      const newHex = hsvToHex(h, prev.s, prev.v);
      onChange(newHex);
      return { ...prev, h };
    });
  }, [hsv.s, hsv.v, onChange, disabled]);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setHexInput(val.toUpperCase());
    
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val)) {
      onChange(val.toUpperCase());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {label && (
        <label style={{ 
          fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', 
          textTransform: 'uppercase', letterSpacing: '0.05em' 
        }}>
          {label}
        </label>
      )}

      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        {/* Main Header / Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div 
            onClick={() => !disabled && setIsExpanded(!isExpanded)}
            style={{ 
              width: '3rem', height: '3rem', borderRadius: '0.75rem', 
              backgroundColor: value, cursor: 'pointer', border: '2px solid var(--color-bg)',
              boxShadow: '0 0 0 1px var(--color-border)', flexShrink: 0
            }} 
          />
          
          <div style={{ flex: 1, position: 'relative' }}>
            <Hash size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              value={hexInput.replace('#', '')}
              onChange={handleHexInputChange}
              disabled={disabled}
              style={{
                width: '100%', padding: '0.5rem 1rem 0.5rem 2rem', borderRadius: '0.5rem',
                border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)',
                fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'monospace', outline: 'none'
              }}
            />
          </div>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.5rem' }}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Interative Picker Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* SV Canvas */}
                  <div 
                    ref={svRef}
                    onMouseDown={(e) => {
                      handleSVMove(e);
                      const move = (ev: MouseEvent) => handleSVMove(ev as any);
                      const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                      window.addEventListener('mousemove', move);
                      window.addEventListener('mouseup', up);
                    }}
                    style={{
                      height: '180px', borderRadius: '0.75rem', position: 'relative', cursor: 'crosshair',
                      backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                      backgroundImage: 'linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)'
                    }}
                  >
                    <div style={{
                      position: 'absolute', left: `${hsv.s}%`, bottom: `${hsv.v}%`,
                      width: '16px', height: '16px', borderRadius: '50%', border: '2px solid white',
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.2), var(--shadow)', transform: 'translate(-50%, 50%)',
                      pointerEvents: 'none', backgroundColor: value
                    }} />
                  </div>

                  {/* Hue Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div 
                      ref={hueRef}
                      onMouseDown={(e) => {
                        handleHueMove(e);
                        const move = (ev: MouseEvent) => handleHueMove(ev as any);
                        const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                        window.addEventListener('mousemove', move);
                        window.addEventListener('mouseup', up);
                      }}
                      style={{
                        height: '12px', flex: 1, borderRadius: '6px', position: 'relative', cursor: 'pointer',
                        background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                      }}
                    >
                      <div style={{
                        position: 'absolute', left: `${(hsv.h / 360) * 100}%`, top: '50%',
                        width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white',
                        border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        transform: 'translate(-50%, -50%)', pointerEvents: 'none'
                      }} />
                    </div>
                    
                    <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                      <input 
                        type="color" 
                        value={value} 
                        onChange={(e) => onChange(e.target.value.toUpperCase())}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }}
                      />
                      <div style={{ 
                        width: '100%', height: '100%', borderRadius: '50%', border: '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)'
                      }}>
                        <Pipette size={14} color="var(--color-text-muted)" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Presets Grid */}
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Brand Presets</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))', gap: '0.5rem' }}>
                    {Object.entries(ACCENTS).map(([name, hex]) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => onChange(hex)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%', backgroundColor: hex,
                          border: value.toUpperCase() === hex.toUpperCase() ? '2px solid white' : '1px solid transparent',
                          boxShadow: value.toUpperCase() === hex.toUpperCase() ? `0 0 0 2px ${hex}` : 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                        }}
                      >
                        {value.toUpperCase() === hex.toUpperCase() && <Check size={14} color="white" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ColorPicker;

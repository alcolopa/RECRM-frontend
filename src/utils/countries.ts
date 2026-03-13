export interface Country {
  name: string;
  code: string;
  iso: string;
  flag: string;
  pattern?: string;
  format?: string; // Formatting template using '#' for digits
}

export const countries: Country[] = [
  { name: 'United States', code: '+1', iso: 'US', flag: '🇺🇸', pattern: '^\\d{10}$', format: '(###) ###-####' },
  { name: 'United Kingdom', code: '+44', iso: 'GB', flag: '🇬🇧', pattern: '^\\d{10}$', format: '#### ### ####' },
  { name: 'Canada', code: '+1', iso: 'CA', flag: '🇨🇦', pattern: '^\\d{10}$', format: '(###) ###-####' },
  { name: 'Australia', code: '+61', iso: 'AU', flag: '🇦🇺', pattern: '^\\d{9}$', format: '### ### ###' },
  { name: 'Germany', code: '+49', iso: 'DE', flag: '🇩🇪', pattern: '^\\d{10,11}$', format: '#### #######' },
  { name: 'France', code: '+33', iso: 'FR', flag: '🇫🇷', pattern: '^\\d{9}$', format: '# ## ## ## ##' },
  { name: 'Italy', code: '+39', iso: 'IT', flag: '🇮🇹', pattern: '^\\d{10}$', format: '### ### ####' },
  { name: 'Spain', code: '+34', iso: 'ES', flag: '🇪🇸', pattern: '^\\d{9}$', format: '### ### ###' },
  { name: 'Brazil', code: '+55', iso: 'BR', flag: '🇧🇷', pattern: '^\\d{10,11}$', format: '## #####-####' },
  { name: 'India', code: '+91', iso: 'IN', flag: '🇮🇳', pattern: '^\\d{10}$', format: '#####-#####' },
  { name: 'China', code: '+86', iso: 'CN', flag: '🇨🇳', pattern: '^\\d{11}$', format: '### #### ####' },
  { name: 'Japan', code: '+81', iso: 'JP', flag: '🇯🇵', pattern: '^\\d{10}$', format: '## #### ####' },
  { name: 'Mexico', code: '+52', iso: 'MX', flag: '🇲🇽', pattern: '^\\d{10}$', format: '## #### ####' },
  { name: 'Lebanon', code: '+961', iso: 'LB', flag: '🇱🇧', pattern: '^\\d{7,8}$', format: '## ### ###' },
  { name: 'Singapore', code: '+65', iso: 'SG', flag: '🇸🇬', pattern: '^\\d{8}$', format: '#### ####' },
  { name: 'Switzerland', code: '+41', iso: 'CH', flag: '🇨🇭', pattern: '^\\d{9}$', format: '## ### ## ##' },
  { name: 'Netherlands', code: '+31', iso: 'NL', flag: '🇳🇱', pattern: '^\\d{9}$', format: '## ########' },
  { name: 'Belgium', code: '+32', iso: 'BE', flag: '🇧🇪', pattern: '^\\d{9}$', format: '### ## ## ##' },
  { name: 'Sweden', code: '+46', iso: 'SE', flag: '🇸🇪', pattern: '^\\d{7,10}$', format: '###-### ## ##' },
  { name: 'Norway', code: '+47', iso: 'NO', flag: '🇳🇴', pattern: '^\\d{8}$', format: '### ## ###' },
  { name: 'Denmark', code: '+45', iso: 'DK', flag: '🇩🇰', pattern: '^\\d{8}$', format: '## ## ## ##' },
  { name: 'Portugal', code: '+351', iso: 'PT', flag: '🇵🇹', pattern: '^\\d{9}$', format: '### ### ###' },
  { name: 'Greece', code: '+30', iso: 'GR', flag: '🇬🇷', pattern: '^\\d{10}$', format: '### ### ####' },
  { name: 'Turkey', code: '+90', iso: 'TR', flag: '🇹🇷', pattern: '^\\d{10}$', format: '### ### ####' },
  { name: 'Egypt', code: '+20', iso: 'EG', flag: '🇪🇬', pattern: '^\\d{10}$', format: '## ########' },
  { name: 'Argentina', code: '+54', iso: 'AR', flag: '🇦🇷', pattern: '^\\d{10}$', format: '## # ####-####' },
  { name: 'Colombia', code: '+57', iso: 'CO', flag: '🇨🇴', pattern: '^\\d{10}$', format: '### #######' },
  { name: 'Chile', code: '+56', iso: 'CL', flag: '🇨🇱', pattern: '^\\d{9}$', format: '# #### ####' },
  { name: 'Malaysia', code: '+60', iso: 'MY', flag: '🇲🇾', pattern: '^\\d{7,9}$', format: '##-### ####' },
  { name: 'Thailand', code: '+66', iso: 'TH', flag: '🇹🇭', pattern: '^\\d{9}$', format: '## ### ####' },
  { name: 'Vietnam', code: '+84', iso: 'VN', flag: '🇻🇳', pattern: '^\\d{9,10}$', format: '## #### ####' },
  { name: 'Ireland', code: '+353', iso: 'IE', flag: '🇮🇪', pattern: '^\\d{7,9}$', format: '## ### ####' },
  { name: 'Austria', code: '+43', iso: 'AT', flag: '🇦🇹', pattern: '^\\d{10}$', format: '### #######' },
  { name: 'Poland', code: '+48', iso: 'PL', flag: '🇵🇱', pattern: '^\\d{9}$', format: '### ### ###' },
];

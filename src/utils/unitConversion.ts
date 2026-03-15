/**
 * Conversion utility for area units
 */

export const SQM_TO_SQFT = 10.7639;

/**
 * Converts area from Square Meters (Metric) to Square Feet (Imperial)
 */
export const sqmToSqft = (sqm: number): number => {
  return sqm * SQM_TO_SQFT;
};

/**
 * Converts area from Square Feet (Imperial) to Square Meters (Metric)
 */
export const sqftToSqm = (sqft: number): number => {
  return sqft / SQM_TO_SQFT;
};

/**
 * Formats an area value based on the unit preference
 */
export const formatArea = (value: number, unit: 'METRIC' | 'IMPERIAL'): string => {
  const roundedValue = Math.round(value * 100) / 100;
  return `${roundedValue} ${unit === 'METRIC' ? 'sqm' : 'sqft'}`;
};

/**
 * IANA timezone identifiers with display labels and UTC offsets
 * Used for timezone selection in profile settings
 */

export interface Timezone {
  value: string;
  label: string;
  offset: string;
}

export const TIMEZONES: Timezone[] = [
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 'UTC+0' },

  // Africa
  { value: 'Africa/Cairo', label: 'Cairo', offset: 'UTC+2' },
  { value: 'Africa/Casablanca', label: 'Casablanca', offset: 'UTC+1' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', offset: 'UTC+2' },
  { value: 'Africa/Lagos', label: 'Lagos', offset: 'UTC+1' },
  { value: 'Africa/Nairobi', label: 'Nairobi', offset: 'UTC+3' },

  // America - North
  { value: 'America/Anchorage', label: 'Anchorage', offset: 'UTC-9' },
  { value: 'America/Chicago', label: 'Chicago (Central Time)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Denver (Mountain Time)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time)', offset: 'UTC-8' },
  { value: 'America/Mexico_City', label: 'Mexico City', offset: 'UTC-6' },
  { value: 'America/New_York', label: 'New York (Eastern Time)', offset: 'UTC-5' },
  { value: 'America/Phoenix', label: 'Phoenix', offset: 'UTC-7' },
  { value: 'America/Toronto', label: 'Toronto', offset: 'UTC-5' },
  { value: 'America/Vancouver', label: 'Vancouver', offset: 'UTC-8' },

  // America - Central
  { value: 'America/Costa_Rica', label: 'Costa Rica', offset: 'UTC-6' },
  { value: 'America/Guatemala', label: 'Guatemala', offset: 'UTC-6' },
  { value: 'America/Havana', label: 'Havana', offset: 'UTC-5' },
  { value: 'America/Jamaica', label: 'Jamaica', offset: 'UTC-5' },
  { value: 'America/Panama', label: 'Panama', offset: 'UTC-5' },

  // America - South
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires', offset: 'UTC-3' },
  { value: 'America/Bogota', label: 'Bogota', offset: 'UTC-5' },
  { value: 'America/Caracas', label: 'Caracas', offset: 'UTC-4' },
  { value: 'America/Lima', label: 'Lima', offset: 'UTC-5' },
  { value: 'America/Santiago', label: 'Santiago', offset: 'UTC-3' },
  { value: 'America/Sao_Paulo', label: 'São Paulo', offset: 'UTC-3' },

  // Asia - East
  { value: 'Asia/Bangkok', label: 'Bangkok', offset: 'UTC+7' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', offset: 'UTC+8' },
  { value: 'Asia/Jakarta', label: 'Jakarta', offset: 'UTC+7' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur', offset: 'UTC+8' },
  { value: 'Asia/Manila', label: 'Manila', offset: 'UTC+8' },
  { value: 'Asia/Seoul', label: 'Seoul', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'Shanghai', offset: 'UTC+8' },
  { value: 'Asia/Singapore', label: 'Singapore', offset: 'UTC+8' },
  { value: 'Asia/Taipei', label: 'Taipei', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+9' },

  // Asia - South
  { value: 'Asia/Colombo', label: 'Colombo', offset: 'UTC+5:30' },
  { value: 'Asia/Dhaka', label: 'Dhaka', offset: 'UTC+6' },
  { value: 'Asia/Karachi', label: 'Karachi', offset: 'UTC+5' },
  { value: 'Asia/Kathmandu', label: 'Kathmandu', offset: 'UTC+5:45' },
  { value: 'Asia/Kolkata', label: 'Kolkata', offset: 'UTC+5:30' },

  // Asia - Middle East
  { value: 'Asia/Dubai', label: 'Dubai', offset: 'UTC+4' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem', offset: 'UTC+2' },
  { value: 'Asia/Kuwait', label: 'Kuwait', offset: 'UTC+3' },
  { value: 'Asia/Riyadh', label: 'Riyadh', offset: 'UTC+3' },
  { value: 'Asia/Tehran', label: 'Tehran', offset: 'UTC+3:30' },

  // Asia - Central
  { value: 'Asia/Almaty', label: 'Almaty', offset: 'UTC+6' },
  { value: 'Asia/Baku', label: 'Baku', offset: 'UTC+4' },
  { value: 'Asia/Tashkent', label: 'Tashkent', offset: 'UTC+5' },
  { value: 'Asia/Tbilisi', label: 'Tbilisi', offset: 'UTC+4' },
  { value: 'Asia/Yerevan', label: 'Yerevan', offset: 'UTC+4' },

  // Atlantic
  { value: 'Atlantic/Azores', label: 'Azores', offset: 'UTC-1' },
  { value: 'Atlantic/Bermuda', label: 'Bermuda', offset: 'UTC-4' },
  { value: 'Atlantic/Cape_Verde', label: 'Cape Verde', offset: 'UTC-1' },
  { value: 'Atlantic/Reykjavik', label: 'Reykjavik', offset: 'UTC+0' },

  // Australia
  { value: 'Australia/Adelaide', label: 'Adelaide', offset: 'UTC+9:30' },
  { value: 'Australia/Brisbane', label: 'Brisbane', offset: 'UTC+10' },
  { value: 'Australia/Darwin', label: 'Darwin', offset: 'UTC+9:30' },
  { value: 'Australia/Melbourne', label: 'Melbourne', offset: 'UTC+10' },
  { value: 'Australia/Perth', label: 'Perth', offset: 'UTC+8' },
  { value: 'Australia/Sydney', label: 'Sydney', offset: 'UTC+10' },

  // Europe - West
  { value: 'Europe/Dublin', label: 'Dublin', offset: 'UTC+0' },
  { value: 'Europe/Lisbon', label: 'Lisbon', offset: 'UTC+0' },
  { value: 'Europe/London', label: 'London', offset: 'UTC+0' },

  // Europe - Central
  { value: 'Europe/Amsterdam', label: 'Amsterdam', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin', offset: 'UTC+1' },
  { value: 'Europe/Brussels', label: 'Brussels', offset: 'UTC+1' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen', offset: 'UTC+1' },
  { value: 'Europe/Madrid', label: 'Madrid', offset: 'UTC+1' },
  { value: 'Europe/Oslo', label: 'Oslo', offset: 'UTC+1' },
  { value: 'Europe/Paris', label: 'Paris', offset: 'UTC+1' },
  { value: 'Europe/Prague', label: 'Prague', offset: 'UTC+1' },
  { value: 'Europe/Rome', label: 'Rome', offset: 'UTC+1' },
  { value: 'Europe/Stockholm', label: 'Stockholm', offset: 'UTC+1' },
  { value: 'Europe/Vienna', label: 'Vienna', offset: 'UTC+1' },
  { value: 'Europe/Warsaw', label: 'Warsaw', offset: 'UTC+1' },
  { value: 'Europe/Zurich', label: 'Zurich', offset: 'UTC+1' },

  // Europe - East
  { value: 'Europe/Athens', label: 'Athens', offset: 'UTC+2' },
  { value: 'Europe/Bucharest', label: 'Bucharest', offset: 'UTC+2' },
  { value: 'Europe/Helsinki', label: 'Helsinki', offset: 'UTC+2' },
  { value: 'Europe/Istanbul', label: 'Istanbul', offset: 'UTC+3' },
  { value: 'Europe/Kyiv', label: 'Kyiv', offset: 'UTC+2' },
  { value: 'Europe/Moscow', label: 'Moscow', offset: 'UTC+3' },
  { value: 'Europe/Sofia', label: 'Sofia', offset: 'UTC+2' },

  // Pacific
  { value: 'Pacific/Auckland', label: 'Auckland', offset: 'UTC+12' },
  { value: 'Pacific/Fiji', label: 'Fiji', offset: 'UTC+12' },
  { value: 'Pacific/Guam', label: 'Guam', offset: 'UTC+10' },
  { value: 'Pacific/Honolulu', label: 'Honolulu', offset: 'UTC-10' },
  { value: 'Pacific/Pago_Pago', label: 'Pago Pago', offset: 'UTC-11' },
  { value: 'Pacific/Port_Moresby', label: 'Port Moresby', offset: 'UTC+10' },
  { value: 'Pacific/Tongatapu', label: 'Tongatapu', offset: 'UTC+13' },
];

/**
 * Get the display label for a timezone value
 * @param value IANA timezone identifier
 * @returns Display label or the value if not found
 */
export const getTimezoneName = (value: string): string => {
  const timezone = TIMEZONES.find((tz) => tz.value === value);
  return timezone ? timezone.label : value;
};

/**
 * Get all timezone values
 * @returns Array of timezone values
 */
export const getTimezoneValues = (): string[] => {
  return TIMEZONES.map((tz) => tz.value);
};

export type Booleanish =
  | boolean
  | 'true'
  | 'false'
  | '1'
  | '0'
  | 'yes'
  | 'no'
  | 'on'
  | 'off'
  | undefined;

export function parseBooleanish(value: Booleanish): boolean {
  if (value === true) return true;
  if (value === false) return false;
  if (value === undefined) return false;

  switch (String(value).trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'on':
      return true;
    default:
      return false;
  }
}

/**
 * Client-safe feature flag for offline testing.
 *
 * NOTE: This must be prefixed with NEXT_PUBLIC_ because it is used in the browser.
 */
export const MOCK_DATA_MODE = parseBooleanish(process.env.NEXT_PUBLIC_MOCK_DATA_MODE as Booleanish);

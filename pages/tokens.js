import { useEffect } from 'react';

export default function TokensRedirect() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace('/'); // Home has a toggle now
    }
  }, []);
  return null;
}

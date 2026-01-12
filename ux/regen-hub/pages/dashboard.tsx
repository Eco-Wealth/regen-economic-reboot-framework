import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Back-compat route.
 * The primary dashboard lives at `/`.
 */
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    void router.replace('/');
  }, [router]);

  return null;
}

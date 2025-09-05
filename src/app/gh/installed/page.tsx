'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Installed() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const id = params.get('installation_id');
    if (id) localStorage.setItem('gh_installation_id', id);
    // رجّع المستخدم على المكان اللي فيه CodeView
    router.replace('/');
  }, [params, router]);

  return <p>Finishing GitHub install…</p>;
}

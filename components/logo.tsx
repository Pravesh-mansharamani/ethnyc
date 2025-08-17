'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';

export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  const [shouldShowImage, setShouldShowImage] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    // Probe the asset. If it exists and is an image, render it; otherwise use placeholder.
    fetch('/pepe.png', { method: 'HEAD' })
      .then((res) => {
        const contentType = res.headers.get('content-type') ?? '';
        if (!isMounted) return;
        setShouldShowImage(res.ok && contentType.startsWith('image'));
      })
      .catch(() => {
        if (!isMounted) return;
        setShouldShowImage(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (shouldShowImage === false) {
    return (
      <div
        className={clsx(
          'inline-flex items-center justify-center rounded-md bg-muted text-foreground/70',
          className,
        )}
        style={{ width: size, height: size }}
        aria-label="smartinvest logo placeholder"
      >
        <span className="text-[60%] font-semibold">SI</span>
      </div>
    );
  }

  // While we probe the asset, render nothing to avoid layout shift; parent has flex alignment.
  if (shouldShowImage === null) return null;

  return <Image src="/pepe.png" alt="smartinvest logo" width={size} height={size} className={className} priority />;
} 
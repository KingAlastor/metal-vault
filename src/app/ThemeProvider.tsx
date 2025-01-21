'use client';

import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';

import { ReactNode } from 'react';

function ThemeWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

export default ThemeWrapper;
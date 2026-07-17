import { useEffect, useState } from "react";

export function NotFound() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? "" : d + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-8xl font-serif font-extrabold text-muted-foreground/20 mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground max-w-sm mx-auto mb-8">
        The exam notification or resource you're looking for might have been moved or doesn't exist.
      </p>
      <div className="font-mono text-sm text-primary animate-pulse">
        redirecting back to home{dots}
      </div>
    </div>
  );
}

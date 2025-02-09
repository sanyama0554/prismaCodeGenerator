import React from 'react';
import { createRoot } from 'react-dom/client';
import { cn } from '../lib/utils';

function App() {
  return (
    <div className={cn("container mx-auto p-4")}>
      <h1 className="text-2xl font-bold text-primary">Hello from React + Tailwind + Shadcn/UI!</h1>
      <p className="mt-4 text-muted-foreground">
        If you can see this message with styling, everything is working correctly!
      </p>
      <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
        Test Button
      </button>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 
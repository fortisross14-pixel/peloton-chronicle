import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function PelotonChronicleApp() {
  useEffect(() => {
    import('./app.js');
  }, []);

  return <div id="imperative-app"><div className="loading">Opening the cycling archive…</div></div>;
}

createRoot(document.getElementById('app')).render(<PelotonChronicleApp />);

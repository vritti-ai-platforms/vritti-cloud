import { configureQuantumUI } from '@vritti/quantum-ui';
import '@vritti/quantum-ui/index.css';
import ReactDOM from 'react-dom/client';
import quantumUIConfig from '../quantum-ui.config';
import App from './App';
import './index.css';

// Configure quantum-ui before rendering (must happen before any axios calls)
configureQuantumUI(quantumUIConfig);

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}

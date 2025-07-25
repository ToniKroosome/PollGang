import React from 'react';
import { createRoot } from 'react-dom/client';
import THEAvailabilityVote from '../Film05Vote.jsx';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<THEAvailabilityVote />);
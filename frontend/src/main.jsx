import React from 'react'
import ReactDOM from 'react-dom/client'
// import { MantineProvider } from '@mantine/core';
import App from './App.jsx'
import './index.css'

// const theme = {
//   colorScheme: 'dark',
//   colors: {
//     pink: ['#FF5EC7'],
//     purple: ['#E359FF'],
//     blue: ['#52C5FF'],
//     green: ['#ACF39D'],
//     yellow: ['#FFCE52'],
//   },
//   primaryColor: 'blue',
// };

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode >
    <App />
  </React.StrictMode>,
)

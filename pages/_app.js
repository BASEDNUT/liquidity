import React from 'react';
import Header from '../components/Header';
import '../pages/chat.css'; // Import global CSS here

function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

export default MyApp;

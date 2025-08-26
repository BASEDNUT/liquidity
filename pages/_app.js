import React from 'react';
import Head from 'next/head';
import ErrorBoundary from '../components/ErrorBoundary';

function MyApp({ Component, pageProps }) {
    return (
        <ErrorBoundary>
            <Head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#D1B48C" />
                <title>Liquidity App</title>
            </Head>
            <Component {...pageProps} />
        </ErrorBoundary>
    );
}

export default MyApp;

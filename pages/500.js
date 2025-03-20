export default function Custom500() {
    return (
        <div style={{
            padding: '20px',
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#F9F3E6'
        }}>
            <h1>500 - Server-side error occurred</h1>
            <p>We're working on fixing this issue.</p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '10px 20px',
                    margin: '20px auto',
                    backgroundColor: '#8b572a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                Try Again
            </button>
        </div>
    );
}

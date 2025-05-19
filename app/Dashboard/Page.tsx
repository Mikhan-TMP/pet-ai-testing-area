import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Dashboard</h1>
            <div style={{ marginTop: '20px' }}>
                <p>Welcome to your dashboard!</p>
                <ul>
                    <li>View your profile</li>
                    <li>Manage settings</li>
                    <li>Check notifications</li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username, isSpeaking }) => {
    return (
        <div className={`client ${isSpeaking ? 'speaking' : ''}`}>
            <Avatar name={username} size={50} round="14px" />
            {isSpeaking && <span className="micBadge">🎙️</span>}
            <span className="userName">{username}</span>
        </div>
    );
};

export default Client;

// components/VoiceChat.jsx
import React, { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';

const VoiceChat = ({ roomId, userId, socket }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVoiceConnected, setIsVoiceConnected] = useState(false);
    const localStreamRef = useRef(null);
    const peerRef = useRef(null);
    const audioContainerRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        let peer;

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then((stream) => {
                localStreamRef.current = stream;


                peer = new Peer();
                peerRef.current = peer;

                peer.on('open', (peerId) => {
                    setIsVoiceConnected(true);
                    socket.emit('join-voice', { roomId, peerId, userId });
                });

                peer.on('call', (call) => {
                    call.answer(stream);
                    call.on('stream', (userAudioStream) => {
                        addAudioStream(call.peer, userAudioStream);
                    });
                });

                socket.on('user-connected-voice', ({ peerId }) => {
                    const call = peer.call(peerId, stream);
                    call.on('stream', (userAudioStream) => {
                        addAudioStream(peerId, userAudioStream);
                    });
                });
            })
            .catch((err) => {
                console.error('Failed to access microphone:', err);
            });

        return () => {
            localStreamRef.current?.getTracks().forEach((track) => track.stop());
            peerRef.current?.destroy();
            socket.off('user-connected-voice');
        };
    }, [roomId, socket]);

    useEffect(() => {
        if (!localStreamRef.current || !socket) return;

        const stream = localStreamRef.current;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        analyser.fftSize = 512;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let isSpeaking = false;

        const checkVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Threshold value (adjust 20 if needed based on mic sensitivity)
            const speakingNow = average > 20 && !isMuted;

            if (speakingNow !== isSpeaking) {
                isSpeaking = speakingNow;
                socket.emit('speaking-change', { roomId, isSpeaking });
            }

            requestAnimationFrame(checkVolume);
        };

        checkVolume();

        return () => {
            audioContext.close();
        };
    }, [isVoiceConnected, isMuted, socket, roomId]);

    // Helper to play incoming peer audio streams
    const addAudioStream = (peerId, stream) => {
        if (document.getElementById(`audio-${peerId}`)) return;

        const audio = document.createElement('audio');
        audio.id = `audio-${peerId}`;
        audio.srcObject = stream;
        audio.autoplay = true;
        audioContainerRef.current?.appendChild(audio);
    };

    // Toggle Microphone Mute State
    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    return (
        <div className="voiceChatControls">
            <button 
                className={`btn ${isMuted ? 'btn-danger' : 'btn-success'}`}
                onClick={toggleMute}
                disabled={!isVoiceConnected}
            >
                {isMuted ? '🎙️ Unmute' : '🎙️ Mute'}
            </button>
            {/* Hidden container for remote audio elements */}
            <div ref={audioContainerRef} style={{ display: 'none' }} />
        </div>
    );
};

export default VoiceChat;
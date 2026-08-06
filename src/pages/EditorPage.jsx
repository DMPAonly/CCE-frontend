import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import VoiceChat from '../Components/VoiceChat';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';
import STARTER_TEMPLATES from '../StartTemplate';
import ChatPanel from '../components/Chat/ChatPanel';
import { api2 } from '../api/authApi';
import { useAuth } from "../context/AuthContext";

const EditorPage = () => {
    const languagesId = {'javascript': 63, 'typescript': 74, 'python': 71, 'clike': 50, 'clike-cpp':54, 'clike-java':62, 'clike-csharp':51}
    const socketRef = useRef(null);
    const codeRef = useRef(STARTER_TEMPLATES['javascript'] || '');
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [output, setOutput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [language, setLanguage] = useState('javascript');
    const [socket, setSocket] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [sidebarOpen,setSidebarOpen] = useState(true);
    const [outputWidth,setOutputWidth] = useState(360);
    const isResizing = useRef(false);
    const [file, setFile] = useState(null);
    const { user } = useAuth();
    const { roomId, fileId } = useParams();
    const languageRef = useRef(language);
    languageRef.current = language;
    const isOwner = true;
    const [isSaving, setIsSaving] = useState(false);
    const [speakingUsers, setSpeakingUsers] = useState({});

    const startResize = () => {
        isResizing.current = true;
    }

    useEffect(() => {
        let isMounted = true;

        const resize = (e) => {
            if (!isResizing.current) return;
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth >= 250 && newWidth <= 700) {
                setOutputWidth(newWidth);
            }
        };

        const stopResize = () => {
            isResizing.current = false;
        };

        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResize);

        const init = async () => {
    
            try {
                const response = await api2.get(`/${fileId}`);
                if (isMounted && response.data?.file) {
                    setFile(response.data.file);
                    setLanguage(response.data.file.language || 'javascript');
                    codeRef.current = response.data.file.content || '';
                    console.log(response.data.file);
                }
            } catch (error) {
                console.error('Failed to fetch initial file:', error);
            }

            const socket = await initSocket();

            if (!isMounted) {
                socket.disconnect();
                return;
            }

            socketRef.current = socket;
            setSocket(socket);

            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: user.name,
            });

            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    setClients(clients);

                    if (username !== user.name) {
                        toast.success(`${username} joined the room.`);

                        socketRef.current?.emit(ACTIONS.SYNC_CODE, {
                            code: codeRef.current,
                            socketId,
                            language: languageRef.current,
                        });
                    }
                }
            );

            socketRef.current.on(ACTIONS.OUTPUT_CHANGE, ({ output }) => {
                setOutput(output);
            });

            socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language: remoteLang }) => {
                if (remoteLang) {
                    setLanguage(remoteLang);
                }
            });

            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => prev.filter((client) => client.socketId !== socketId));
            });
        };

        init();

        return () => {
            isMounted = false;
            socketRef.current?.disconnect();
            socketRef.current?.off(ACTIONS.JOINED);
            socketRef.current?.off(ACTIONS.OUTPUT_CHANGE);
            socketRef.current?.off(ACTIONS.LANGUAGE_CHANGE);
            socketRef.current?.off(ACTIONS.DISCONNECTED);
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResize);
        };
    }, [roomId, fileId, user]);

    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on('speaking-change', ({ socketId, isSpeaking }) => {
            setSpeakingUsers((prev) => ({
                ...prev,
                [socketId]: isSpeaking,
            }));
        });

        return () => {
            socketRef.current?.off('speaking-change');
        };
    }, [socket]);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(`${roomId}/${fileId}`);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/dashboard');
    }

    async function runCode() {
        const code = codeRef.current;

        if (!code || code.trim() === '') {
            toast.error('Code cannot be empty!');
            return;
        }

        setIsExecuting(true);
        
        const loadingMessage = 'Executing code, please wait...';
        setOutput(loadingMessage);

        // Broadcast "Executing..." state to everyone in the room
        socketRef.current?.emit(ACTIONS.OUTPUT_CHANGE, {
            roomId,
            output: loadingMessage,
        });

        try {
            const response = await fetch(`${import.meta.env.VITE_API_EXE_URL ?? 'https://execution-service-9l8e.onrender.com/api/execution/submit'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sourceCode: code,
                    languageId: languagesId[language], // 63 = JavaScript (or 71 for Python)
                    roomId: roomId,
                }),
            });

            if (!response.ok) {
                throw new Error(`Server returned status: ${response.status}`);
            }

            const data = await response.json();

            let finalOutput = '';
            if (data.error && data.error.trim() !== '') {
                finalOutput = `Error:\n${data.error}`;
            } else if (data.output) {
                finalOutput = data.output;
            } else {
                finalOutput = 'Program executed with no output.';
            }

            // Set local state
            setOutput(finalOutput);

            socketRef.current?.emit(ACTIONS.OUTPUT_CHANGE, {
                roomId,
                output: finalOutput,
            });

            toast.success('Execution completed!');
        } catch (err) {
            console.error('Execution Error:', err);
            const errorMsg = `Failed to execute code: ${err.message}`;
            
            setOutput(errorMsg);
            
            socketRef.current?.emit(ACTIONS.OUTPUT_CHANGE, {
                roomId,
                output: errorMsg,
            });

            toast.error('Execution failed.');
        } finally {
            setIsExecuting(false);
        }
    }

    // Handle language change
    const handleLanguageChange = (e) => {
        const selectedLang = e.target.value;
        setLanguage(selectedLang);
        
        // Optional: Reset starter template when switching languages
        socketRef.current?.emit(ACTIONS.LANGUAGE_CHANGE, {
            roomId,
            language: selectedLang,
        });
    };

    const fetchFile = async () => {
        try {
          const response = await api2.get(`/${fileId}`);
          setFile(response.data.file);
          setLanguage(response.data.file.language);
          codeRef.current = response.data.file.content;
        } catch (error) {
          console.error(error);
        }
    };

    const handleSave = async () => {
        if (!isOwner || !fileId) return;

        setIsSaving(true);
        try {
            await api2.put(`/${fileId}`, {
                content: codeRef.current,
                language: language,
            });
            
            toast.success('File saved successfully!');
        } catch (err) {
            console.error('Save Error:', err);
            toast.error('Failed to save file.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mainWrap">
            <button
                className="menuBtn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                ☰
            </button>
            <div className={`aside ${sidebarOpen ? "open" : "collapsed"}`}>
                <div className="asideInner">
                    <div className="logo">
                        <span style={styles.logoIcon}>{'</>'}</span>
                        <span style={styles.logoText}>CollabCode</span>
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                                isSpeaking={speakingUsers[client.socketId] || false}
                            />
                        ))}
                    </div>
                    <VoiceChat roomId={roomId} userId={user.name} socket={socket} />
                    {/* Language Dropdown Selector */}
                    <div className="languageSelectGroup">
                        <label htmlFor="languageSelect">Language
                            {!isOwner && <span style={{ fontSize: '11px', opacity: 0.7 }}>(Owner only)</span>}
                        </label>
                        <select
                            id="languageSelect"
                            className="languageSelect"
                            value={language}
                            disabled={!isOwner}
                            onChange={handleLanguageChange}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="python">Python</option>
                            <option value="clike">C</option>
                            <option value="clike-cpp">C++</option>
                            <option value="clike-java">Java</option>
                            <option value="clike-csharp">C#</option>
                        </select>
                    </div>
                </div>
                {isOwner && (
                    <button className="btn saveBtn" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : '💾 Save'}
                    </button>
                )}
                <button className="btn runBtn" onClick={runCode} disabled={isExecuting}>
                    {isExecuting ? 'Running...' : '▶ Run'}
                </button>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    📋 Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    🚪 Leave
                </button>
            </div>
            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    language={language}
                    initialCode={file ? file.content : ''}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
            {/* Blank Output Screen Beside Editor */}
            <div className="outputScreen" 
                style={{width: `${outputWidth}px`}}
            >
                <div 
                    className="resizeHandle"
                    onMouseDown={startResize} 
                ></div>
                <div className="outputHeader">
                    <span>⚡ Output / Terminal</span>
                    <button onClick={() => setOutput('')} className="clearBtn">Clear</button>
                </div>
                <pre>{output || 'Click "Run" to execute code output...'}</pre>
                <div className={`floatingChatContainer ${isChatOpen ? 'expanded' : 'minimized'}`}>
                    <div className="chatHeader" onClick={() => setIsChatOpen((prev) => !prev)}>
                        <span className="chatTitle">💬 Project Chat</span>
                        <button className="toggleBtn">{isChatOpen ? '▼' : '▲'}</button>
                    </div>

                        <div className="chatBody">
                            <ChatPanel socket={socket} roomId={roomId} userId={user.name} />
                        </div>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;

const styles = {
    logoIcon: { fontSize: '22px', color: '#818cf8', fontWeight: 700, fontFamily: 'monospace' },
    logoText: {
        fontSize: '18px',
        fontWeight: 700,
        background: 'linear-gradient(90deg, #818cf8, #c084fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
};

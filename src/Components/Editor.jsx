import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike'; 
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

    const MODE_MAP = {
        javascript: 'javascript',
        typescript: "text/typescript",
        python: 'python',
        clike: 'text/x-csrc',        // C
        'clike-cpp': 'text/x-c++src', // C++
        'clike-java': 'text/x-java',  // Java
        'clike-csharp': 'text/x-csharp', // C#
    };

const Editor = ({ socketRef, roomId, onCodeChange, language = 'javascript', initialCode = '' }) => {

    const editorRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        async function init() {
            if (!editorRef.current && textareaRef.current) {
            editorRef.current = Codemirror.fromTextArea(textareaRef.current, {
                mode: MODE_MAP[language] || 'javascript',
                theme: 'dracula',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true,
            });

            if (initialCode) {
                editorRef.current.setValue(initialCode);
            }

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }
        }
        init();
    }, []);

    useEffect(() => {
        if (!editorRef.current) return;

        editorRef.current.setOption(
            "mode",
            MODE_MAP[language] || "javascript"
        );
    }, [language]);

    const hasAppliedInitialCode = useRef(false);

    useEffect(() => {
        if (!editorRef.current) return;

        if (initialCode && !hasAppliedInitialCode.current) {
            editorRef.current.setValue(initialCode);
            hasAppliedInitialCode.current = true; 
        }
    }, [initialCode]);

    useEffect(() => {
        if (!socketRef.current) return;

        const handleCodeChange = ({ code }) => {
            if (code !== null && editorRef.current) {
                if (editorRef.current.getValue() !== code) {
                    editorRef.current.setValue(code);
                    onCodeChange(code);
                }
            }
        };

        const handleSyncCode = ({ code }) => {
            if (code !== null && editorRef.current) {
                editorRef.current.setValue(code);
                onCodeChange(code);
            }
        };

        socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
        socketRef.current.on(ACTIONS.SYNC_CODE, handleSyncCode);

        return () => {
            socketRef.current?.off(ACTIONS.CODE_CHANGE, handleCodeChange);
            socketRef.current?.off(ACTIONS.SYNC_CODE, handleSyncCode);
        };
    }, [socketRef.current]);

    return <textarea ref={textareaRef} id="realtimeEditor"></textarea>;
};

export default Editor;

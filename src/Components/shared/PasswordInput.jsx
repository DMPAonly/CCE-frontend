import { useState, useCallback } from 'react';
import { PASSWORD_RULES } from '../../utils/passwordValidation';

/**
 * Reusable password input with:
 *   - Eye toggle (show / hide password)
 *   - Optional live password-strength checklist
 *
 * Props:
 *   id            {string}   - input id (required for label association)
 *   name          {string}   - input name attribute
 *   value         {string}   - controlled value
 *   onChange      {function} - change handler
 *   placeholder   {string}   - input placeholder
 *   autoComplete  {string}   - autocomplete hint
 *   showChecklist {boolean}  - when true, show live rule checklist on focus
 *   label         {string}   - optional label text (rendered above the input)
 *   style         {object}   - extra styles merged onto the wrapper div
 */
export default function PasswordInput({
  id,
  name = 'password',
  value = '',
  onChange,
  placeholder = 'Password',
  autoComplete = 'current-password',
  showChecklist = false,
  label,
  style = {},
}) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const toggleVisibility = useCallback(() => {
    setVisible((v) => !v);
  }, []);

  const showRules = showChecklist && (focused || value.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, ...style }}>
      {label && (
        <label htmlFor={id} style={styles.label}>
          {label}
        </label>
      )}

      {/* Input row */}
      <div style={styles.inputWrapper}>
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          style={styles.input}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          style={styles.eyeBtn}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? (
            /* Eye-off icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            /* Eye icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {/* Live checklist */}
      {showRules && (
        <ul style={styles.ruleList}>
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(value);
            return (
              <li key={rule.id} style={{ ...styles.ruleItem, color: ok ? '#86efac' : '#94a3b8' }}>
                <span style={styles.ruleIcon}>{ok ? '✓' : '○'}</span>
                {rule.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const styles = {
  label: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '10px',
    marginBottom: '4px',
    display: 'block',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '12px 44px 12px 14px',
    fontSize: '14px',
    color: '#f1f5f9',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
    lineHeight: 0,
  },
  ruleList: {
    listStyle: 'none',
    padding: '10px 14px',
    margin: '4px 0 0',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '8px',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.2s',
  },
  ruleIcon: {
    fontFamily: 'monospace',
    fontSize: '11px',
    width: '12px',
    flexShrink: 0,
  },
};

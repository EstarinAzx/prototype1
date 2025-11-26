import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            {/* Selected Value Display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    background: '#0a0a0a',
                    color: '#4ade80',
                    border: '1px solid #333',
                    padding: '8px 30px 8px 10px',
                    fontFamily: 'Orbitron',
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    transition: 'all 0.2s'
                }}
            >
                <span>{selectedOption?.label || placeholder}</span>
                <ChevronDown
                    size={16}
                    style={{
                        transition: 'transform 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                />
            </div>

            {/* Dropdown Options */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 2px)',
                    left: 0,
                    right: 0,
                    background: '#0a0a0a',
                    border: '1px solid #4ade80',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 5px 20px rgba(0, 243, 255, 0.2)'
                }}>
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            style={{
                                padding: '10px',
                                fontFamily: 'Orbitron',
                                fontSize: '0.85rem',
                                color: option.value === value ? '#4ade80' : '#e0e0e0',
                                background: option.value === value
                                    ? 'rgba(0, 243, 255, 0.2)'
                                    : 'transparent',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (option.value !== value) {
                                    e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)';
                                    e.currentTarget.style.color = '#4ade80';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (option.value !== value) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#e0e0e0';
                                }
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * @fileoverview Tabs component for navigation
 */

import './Tabs.css';

/**
 * @param {Object} props
 * @param {Array<{id: string, label: string}>} props.tabs - Tab configuration
 * @param {string} props.activeTab - Currently active tab ID
 * @param {Function} props.onTabChange - Tab change handler
 */
export default function Tabs({ tabs, activeTab, onTabChange }) {
    return (
        <div className="tabs-container">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

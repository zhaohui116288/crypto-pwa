import React from 'react'

const Navigation = ({ activeModule, modules, onModuleChange }) => {
  return (
    <nav className="navigation">
      {modules.map(module => (
        <button
          key={module.id}
          className={`nav-item ${activeModule === module.id ? 'active' : ''}`}
          onClick={() => onModuleChange(module.id)}
        >
          <span className="nav-icon">{module.icon}</span>
          <span className="nav-label">{module.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default Navigation
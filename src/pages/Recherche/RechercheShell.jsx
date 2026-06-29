import React from 'react'
import './recherche.css'

/** Wrapper scoping CSS variables for search modules (ported from dev/rihla). */
export const RechercheShell = ({ children }) => (
  <div className="recherche-panel animate-fade-in min-h-full">
    {children}
  </div>
)

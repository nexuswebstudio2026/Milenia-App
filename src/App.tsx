import React, { useState, useEffect } from 'react';
import { MileniaLanding } from './components/landing/MileniaLanding';
import { OperationalPanelManager } from './components/auth/OperationalPanelManager';
import { Empleado } from './types/empleado';
import { WorkstationOption } from './services/empleadosService';

/**
 * Calculates whether it is night or day based on user device local time:
 * - Daytime: 06:00 to 18:59 (6 AM to 6:59 PM) -> Light theme
 * - Nighttime: 19:00 to 05:59 (7 PM to 5:59 AM) -> Dark theme
 */
function getDeviceTimeTheme() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const isNight = hours < 6 || hours >= 19;
  return { isNight, timeString };
}

export function App() {
  // Device time and mode state
  const [deviceInfo, setDeviceInfo] = useState(getDeviceTimeTheme);
  const [isDarkMode, setIsDarkMode] = useState(() => getDeviceTimeTheme().isNight);
  const [isAutoTimeMode, setIsAutoTimeMode] = useState(true);

  // Authenticated Employee Session State verified against Firestore
  const [activeEmployeeSession, setActiveEmployeeSession] = useState<{
    empleado: Empleado;
    station: WorkstationOption;
  } | null>(null);

  // Periodically update device local time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const updated = getDeviceTimeTheme();
      setDeviceInfo(updated);

      // If in automatic time mode, sync dark mode to current hour
      if (isAutoTimeMode) {
        setIsDarkMode(updated.isNight);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoTimeMode]);

  // Synchronize HTML element class for Tailwind dark: variants
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle manual theme toggle
  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
    // When user manually toggles, keep their manual preference active
    setIsAutoTimeMode(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-amber-500 selection:text-slate-950 antialiased ${
      isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <main className="w-full">
        {activeEmployeeSession ? (
          <OperationalPanelManager
            authenticatedEmpleado={activeEmployeeSession.empleado}
            station={activeEmployeeSession.station}
            onLogout={() => setActiveEmployeeSession(null)}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            deviceTimeStr={deviceInfo.timeString}
          />
        ) : (
          <MileniaLanding
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            deviceTimeStr={deviceInfo.timeString}
            isAutoTimeMode={isAutoTimeMode}
            onLoginSuccess={(empleado, station) => {
              setActiveEmployeeSession({ empleado, station });
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;

// src/hooks/emg/useEmgStream.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { emgSerialService } from '@/lib/emg/emg-serial';
import { EMGProcessor, type ProcessedEMG, type FatigueLevel } from '@/lib/emg/emg-processing';

export type EMGMode = 'serial' | 'simulation';

export function useEmgStream() {
  const [mode, setMode] = useState<EMGMode>('simulation');
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const [history, setHistory] = useState<ProcessedEMG[]>([]);
  const [currentSignal, setCurrentSignal] = useState(0);
  const [fatigueLevel, setFatigueLevel] = useState<FatigueLevel>('low');
  const [fatigueIndex, setFatigueIndex] = useState(0);
  const [strainDetected, setStrainDetected] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [activityType, setActivityType] = useState('general');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const processorRef = useRef(new EMGProcessor());
  const bufferRef = useRef<ProcessedEMG[]>([]);
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_HISTORY = 200;

  const handleReading = useCallback((raw: number, timestamp: number) => {
    const processed = processorRef.current.processReading(raw, timestamp);
    
    setCurrentSignal(Math.round(processed.normalized * 100));
    setFatigueLevel(processed.fatigueLevel);
    setFatigueIndex(processed.fatigueIndex);
    setStrainDetected(processed.strainDetected);
    
    bufferRef.current.push(processed);
    if (bufferRef.current.length > MAX_HISTORY) {
      bufferRef.current.shift();
    }
    setHistory([...bufferRef.current]);
  }, []);

  const connect = async () => {
    setConnectionError(null);
    if (mode === 'simulation') {
      setIsConnected(true);
      return;
    }
    
    try {
      const connected = await emgSerialService.connect();
      if (connected) {
        setIsConnected(true);
        emgSerialService.startReading((reading) => {
          handleReading(reading.signal, reading.timestamp);
        });
      }
    } catch (error: any) {
      const msg = error?.message || 'Failed to connect. Ensure your device is plugged in.';
      setConnectionError(msg);
      setIsConnected(false);
    }
  };

  const disconnect = async () => {
    if (isSessionActive) stopSession();
    if (mode === 'serial') {
      await emgSerialService.disconnect();
    } else if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsConnected(false);
    processorRef.current.reset();
    bufferRef.current = [];
    setHistory([]);
    setCurrentSignal(0);
    setFatigueLevel('low');
    setFatigueIndex(0);
    setStrainDetected(false);
    setDurationSeconds(0);
    setSessionId(null);
  };

  const startSession = async (patientId?: string, actType?: string) => {
    if (!isConnected) {
      await connect();
    }
    if (actType) {
      setActivityType(actType);
    }
    setSessionId(`emg-session-${Date.now()}`);
    processorRef.current.reset();
    bufferRef.current = [];
    setHistory([]);
    setDurationSeconds(0);
    setIsSessionActive(true);

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    durationIntervalRef.current = setInterval(() => {
      setDurationSeconds(prev => prev + 1);
    }, 1000);

    if (mode === 'simulation') {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      let t = 0;
      let base = 200;
      simulationIntervalRef.current = setInterval(() => {
        const burst = Math.random() > 0.95 ? 600 + Math.random() * 300 : 0;
        const noise = Math.random() * 50;
        const raw = Math.max(0, Math.min(1023, base + noise + burst));
        handleReading(raw, Date.now());
        t++;
        if (t % 100 === 0) base = Math.min(base + 10, 400); 
      }, 50);
    }
  };

  const stopSession = () => {
    setIsSessionActive(false);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (mode === 'simulation' && simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    return {
      history: [...bufferRef.current],
      durationSeconds,
      activityType,
    };
  };

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (mode === 'serial' && isConnected) emgSerialService.disconnect();
    };
  }, [mode, isConnected]);

  return {
    mode,
    setMode,
    isConnected,
    isSessionActive,
    currentSignal,
    signal: currentSignal,                 // compatibility alias
    normalized: currentSignal / 100,        // compatibility alias (0 to 1)
    fatigueLevel,
    fatigueIndex,
    strainDetected,
    history,
    sessionHistory: history,               // compatibility alias
    durationSeconds,
    connectionError,
    error: connectionError,                // compatibility alias
    activityType,
    sessionId,
    totalReadingsWritten: history.length,  // compatibility alias
    connect,
    disconnect,
    startSession,
    stopSession,
  };
}

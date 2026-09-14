// src/lib/emg/emg-serial.ts
export interface EMGReading {
  signal: number;
  timestamp: number;
}

export type EMGSerialReading = EMGReading;

export class EMGSerialService {
  private port: any | null = null;
  private reader: any | null = null;
  private isConnected = false;
  private readingTask: Promise<void> | null = null;
  private keepReading = true;

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  async connect(): Promise<boolean> {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
    }
    try {
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 115200 });
      this.isConnected = true;
      return true;
    } catch (error: any) {
      if (error?.name === 'NotFoundError') {
        throw new Error('No serial device was selected.');
      }
      if (error?.name === 'SecurityError') {
        throw new Error('Permission to access serial port was denied.');
      }
      console.error('Failed to connect to serial port:', error);
      throw error;
    }
  }

  async startReading(onData: (reading: EMGReading) => void): Promise<void> {
    if (!this.port || !this.isConnected) {
      throw new Error('Not connected to serial port.');
    }
    this.keepReading = true;
    this.readingTask = this.readLoop(onData);
  }

  private async readLoop(onData: (reading: EMGReading) => void) {
    if (!this.port) return;
    const textDecoder = new TextDecoderStream();
    this.port.readable!.pipeTo(textDecoder.writable).catch(() => {});
    this.reader = textDecoder.readable.getReader();
    let buffer = '';

    try {
      while (this.keepReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
              try {
                const parsed = JSON.parse(trimmed) as EMGReading;
                if (typeof parsed.signal === 'number' && typeof parsed.timestamp === 'number') {
                  onData(parsed);
                }
              } catch {
                // Ignore split or non-JSON serial chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Serial stream error:', error);
    } finally {
      if (this.reader) {
        try {
          await this.reader.cancel();
          this.reader.releaseLock();
        } catch {
          // ignore release errors
        }
        this.reader = null;
      }
    }
  }

  async disconnect(): Promise<void> {
    this.keepReading = false;
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {
        // ignore
      }
    }
    if (this.readingTask) {
      try {
        await this.readingTask;
      } catch {
        // ignore
      }
      this.readingTask = null;
    }
    if (this.port) {
      try {
        await this.port.close();
      } catch {
        // ignore
      }
      this.port = null;
    }
    this.isConnected = false;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const emgSerialService = new EMGSerialService();

import React, { useState, useRef } from 'react';
import { Buffer } from 'buffer';

// --- Web Bluetooth API Type Definitions ---
// This section provides the necessary type definitions for the Web Bluetooth API,
// as they are not included in the default TypeScript library.

interface BluetoothLEScan extends EventTarget {
  active: boolean;
  stop: () => void;
}

interface BluetoothAdvertisingEvent extends Event {
  readonly device: BluetoothDevice;
  readonly manufacturerData: Map<number, DataView>;
  readonly serviceData: Map<string, DataView>;
  readonly name?: string;
  readonly rssi?: number;
  readonly txPower?: number;
}

interface BluetoothDevice extends EventTarget {
  readonly id: string;
  readonly name?: string | undefined;
}

interface Bluetooth {
  requestLEScan(options?: { acceptAllAdvertisements?: boolean, filters?: any[] }): Promise<BluetoothLEScan>;
  addEventListener(
    type: 'advertisementreceived',
    listener: (this: this, ev: BluetoothAdvertisingEvent) => any,
    useCapture?: boolean
  ): void;
}


// --- Type Definitions ---
interface PublicKeyMap {
  [key: string]: string;
}

interface VerifiedInfo {
  deviceId: string;
  room: string;
  timestamp: number;
}

// This code is designed for a web environment and uses the Web Bluetooth API.
// It is not compatible with React Native.
declare global {
    interface Navigator {
        bluetooth: Bluetooth;
    }
}

// --- Configuration ---
const PUBLIC_KEYS: PublicKeyMap = {
  "LR001": "04b1...REPLACE_WITH_REAL_PUBLIC_KEY_HEX...",
};

// --- BLE Verification Logic ---

/**
 * Converts a DER-encoded signature in hex format to a raw (r,s) format.
 */
function derSignatureHexToRaw(derHex: string): Buffer {
    const der = Buffer.from(derHex, 'hex');
    if (der[0] !== 0x30) throw new Error('Not a DER sequence.');
    let offset = 4;
    let rLength = der[3];
    let rStart = offset;
    if (der[rStart] === 0x00 && (der[rStart + 1] & 0x80) !== 0) {
        rLength--;
        rStart++;
    }
    offset += rLength + 2;
    let sLength = der[offset - 1];
    let sStart = offset;
    if (der[sStart] === 0x00 && (der[sStart + 1] & 0x80) !== 0) {
        sLength--;
        sStart++;
    }
    const r = der.slice(rStart, rStart + rLength);
    const s = der.slice(sStart, sStart + sLength);
    const rawR = Buffer.alloc(32);
    r.copy(rawR, 32 - r.length);
    const rawS = Buffer.alloc(32);
    s.copy(rawS, 32 - s.length);
    return Buffer.concat([rawR, rawS]);
}

/**
 * Verifies the signature from the BLE advertisement using the Web Crypto API.
 */
async function verifySignature(publicKeyHex: string, room: string, ts: number, sigHex: string): Promise<boolean> {
  try {
    const pubKeyBuffer = Buffer.from(publicKeyHex.slice(2), 'hex');
    const jwk = {
        kty: 'EC',
        crv: 'P-256',
        x: pubKeyBuffer.slice(0, 32).toString('base64url'),
        y: pubKeyBuffer.slice(32, 64).toString('base64url'),
    };
    const key = await crypto.subtle.importKey(
        'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']
    );
    const msg = `${room}|${ts}`;
    const data = new TextEncoder().encode(msg);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const rawSignature = derSignatureHexToRaw(sigHex);
    return await crypto.subtle.verify(
        { name: 'ECDSA', hash: { name: 'SHA-256' } }, key, rawSignature, hashBuffer
    );
  } catch (e) {
    console.error("Signature verification error:", e);
    return false;
  }
}

// --- React App Component ---
type AppState = 'IDLE' | 'SCANNING' | 'VERIFYING' | 'VERIFIED' | 'ERROR';

const BLEReceiver = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [verifiedInfo, setVerifiedInfo] = useState<VerifiedInfo | null>(null);
  const scanController = useRef<BluetoothLEScan | null>(null);

  const addLog = (message: string) => {
    console.log(message);
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs].slice(0, 100));
  };

  const stopScan = () => {
    if (scanController.current?.active) {
        scanController.current.stop();
        addLog('Scan stopped.');
    }
    setAppState('IDLE');
  };
  
  const startVerificationFlow = async () => {
    setAppState('SCANNING');
    setLogs([]);
    setVerifiedInfo(null);
    addLog('QR code scanned. Starting verification...');

    if (!navigator.bluetooth) {
      addLog("Error: Web Bluetooth API is not available in this browser.");
      setAppState('ERROR');
      return;
    }
    
    try {
        addLog("Requesting BLE scan...");
        const scan = await navigator.bluetooth.requestLEScan({ acceptAllAdvertisements: true });
        scanController.current = scan;
        addLog("Scan permitted. Listening for 'ESP32_ATTEND'...");

        const scanTimeout = setTimeout(() => {
            if(scan.active) {
                scan.stop();
                addLog("Scan timed out after 30 seconds.");
                setAppState('IDLE');
            }
        }, 30000);

        navigator.bluetooth.addEventListener('advertisementreceived', async (event: BluetoothAdvertisingEvent) => {
            if (event.device.name !== 'ESP32_ATTEND') return;
            
            clearTimeout(scanTimeout);
            if (scan.active) scan.stop();
            setAppState('VERIFYING');
            addLog(`Found device: ${event.device.name}.`);

            if (!event.manufacturerData || event.manufacturerData.size === 0) {
              addLog("Error: No manufacturer data found.");
              setAppState('ERROR');
              return;
            }

            const dataView = event.manufacturerData.values().next().value;
            const advString = new TextDecoder('utf-8').decode(dataView);
            addLog(`Received data: ${advString}`);

            const parts = advString.split('|');
            if (parts.length !== 3) {
              addLog(`Error: Invalid data format.`);
              setAppState('ERROR');
              return;
            }

            const [room, tsStr, sigHex] = parts;
            const ts = parseInt(tsStr, 10);
            const pub = PUBLIC_KEYS[room];

            if (!pub) {
              addLog(`Error: No public key for room "${room}".`);
              setAppState('ERROR');
              return;
            }
            
            addLog(`Verifying signature for room: ${room}...`);
            const ok = await verifySignature(pub, room, ts, sigHex);

            if (ok) {
                addLog('Signature VERIFIED!');
                const now = Math.floor(Date.now() / 1000);
                if (Math.abs(now - ts) <= 120) {
                    addLog('Timestamp is fresh.');
                    setVerifiedInfo({ deviceId: event.device.id, room, timestamp: ts });
                    setAppState('VERIFIED');
                } else {
                    addLog(`Stale timestamp detected.`);
                    setAppState('ERROR');
                }
            } else {
                addLog('Signature verification FAILED!');
                setAppState('ERROR');
            }
        });
    } catch (error) {
        if(error instanceof Error) addLog(`Error: ${error.message}`);
        setAppState('ERROR');
    }
  };

  const resetApp = () => {
    stopScan();
    setLogs([]);
    setVerifiedInfo(null);
    setAppState('IDLE');
  };

  const renderContent = () => {
    switch(appState) {
        case 'SCANNING':
            return (
                <>
                    <p className="text-lg text-slate-600">Searching for ESP32 device...</p>
                    <button onClick={stopScan} className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg">
                        Cancel
                    </button>
                </>
            );
        case 'VERIFYING':
             return <p className="text-lg text-slate-600 animate-pulse">Found device, verifying signature...</p>;
        case 'VERIFIED':
            return (
                 verifiedInfo && <>
                    <p className="text-2xl font-bold text-green-600 mb-4">Verification Successful!</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full text-left">
                        <p><span className="font-semibold">Room:</span> {verifiedInfo.room}</p>
                        <p><span className="font-semibold">Device ID:</span> {verifiedInfo.deviceId}</p>
                        <p><span className="font-semibold">Timestamp:</span> {new Date(verifiedInfo.timestamp * 1000).toLocaleString()}</p>
                    </div>
                    <button onClick={resetApp} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg">
                        Verify Another
                    </button>
                 </>
            );
        case 'ERROR':
            return (
                <>
                    <p className="text-2xl font-bold text-red-600 mb-4">Verification Failed</p>
                    <button onClick={resetApp} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg">
                        Try Again
                    </button>
                </>
            );
        default:
             return (
                <button onClick={startVerificationFlow} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg">
                    Scan QR Code & Verify
                </button>
            );
    }
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans flex flex-col items-center">
      <header className="w-full bg-white shadow-md p-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-800 text-center">BLE Attendance Verifier</h1>
        <p className="text-center text-slate-500">Status: {appState}</p>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          {renderContent()}
      </main>
      
      <div className="h-64 w-full max-w-4xl bg-white m-4 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-lg font-bold p-3 border-b text-slate-700">Logs</h2>
          <pre className="flex-grow p-3 overflow-y-auto text-xs text-slate-600 bg-slate-50 rounded-b-lg">
              {logs.join('\n')}
          </pre>
      </div>
    </div>
  );
};

export default BLEReceiver;


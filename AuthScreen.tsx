import React, { useState, useEffect, useRef } from 'react';
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
  // Add other properties and methods as needed, e.g., gatt
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

// Define a type for the public keys object to allow string indexing.
interface PublicKeyMap {
  [key: string]: string;
}

// Define the shape of the verified device information.
interface VerifiedInfo {
  deviceId: string;
  room: string;
  timestamp: number;
}

// Extend the global Navigator interface to include the Web Bluetooth API.
// This informs TypeScript about the existence of `navigator.bluetooth`.
declare global {
    interface Navigator {
        bluetooth: Bluetooth;
    }
}


// --- Configuration ---
// NOTE: The key is now mapped by ROOM_NAME, because the deviceId is not broadcast by the ESP32.
// This assumes each room has a unique, provisioned device/key.
const PUBLIC_KEYS: PublicKeyMap = {
  // IMPORTANT: Replace with the actual public key from your ESP32 device.
  // This must be the uncompressed hex string (0x04 + X + Y).
  "LR001": "04b1...REPLACE_WITH_REAL_PUBLIC_KEY_HEX...",
};

// --- BLE Verification Logic ---

/**
 * Converts a DER-encoded signature in hex format to a raw (r,s) format.
 * This is necessary for the Web Crypto API's verify function.
 * @param {string} derHex - The DER-encoded signature as a hex string.
 * @returns {Buffer} - A 64-byte buffer containing the raw signature (r followed by s).
 */
function derSignatureHexToRaw(derHex: string): Buffer {
    const der = Buffer.from(derHex, 'hex');
    // Basic DER format check: SEQUENCE marker and length
    if (der[0] !== 0x30) throw new Error('Not a DER sequence.');

    // Find R: The first INTEGER in the sequence
    let offset = 4; // Skips 0x30, total length, 0x02, r_length
    let rLength = der[3];
    let rStart = offset;
    // Handle the leading zero byte for positive integers if the MSB is 1
    if (der[rStart] === 0x00 && (der[rStart + 1] & 0x80) !== 0) {
        rLength--;
        rStart++;
    }

    // Find S: The second INTEGER in the sequence
    offset += rLength + 2; // Move past R's value and the next INTEGER marker + s_length
    let sLength = der[offset - 1];
    let sStart = offset;
    // Handle the leading zero byte
    if (der[sStart] === 0x00 && (der[sStart + 1] & 0x80) !== 0) {
        sLength--;
        sStart++;
    }
    
    // Extract R and S values
    const r = der.slice(rStart, rStart + rLength);
    const s = der.slice(sStart, sStart + sLength);

    // Pad R and S to 32 bytes each to create the 64-byte raw signature
    const rawR = Buffer.alloc(32);
    r.copy(rawR, 32 - r.length);

    const rawS = Buffer.alloc(32);
    s.copy(rawS, 32 - s.length);

    return Buffer.concat([rawR, rawS]);
}


/**
 * Verifies the signature from the BLE advertisement using the Web Crypto API.
 * The ESP32 signs the message: `ROOM_NAME|timestamp`.
 * @param {string} publicKeyHex - The uncompressed public key in hex format.
 * @param {string} room - The room name received from the advertisement.
 * @param {number} ts - The timestamp received from the advertisement.
 * @param {string} sigHex - The DER-encoded signature in hex format.
 * @returns {Promise<boolean>} - True if the signature is valid.
 */
async function verifySignature(publicKeyHex: string, room: string, ts: number, sigHex: string): Promise<boolean> {
  try {
    // 1. Import the public key in JWK (JSON Web Key) format.
    const pubKeyBuffer = Buffer.from(publicKeyHex.slice(2), 'hex'); // remove 04 prefix
    const jwk = {
        kty: 'EC',
        crv: 'P-256',
        x: pubKeyBuffer.slice(0, 32).toString('base64url'),
        y: pubKeyBuffer.slice(32, 64).toString('base64url'),
    };
    const key = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['verify']
    );

    // 2. Prepare the message and hash it.
    const msg = `${room}|${ts}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(msg);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // 3. Convert signature from DER hex to raw format.
    const rawSignature = derSignatureHexToRaw(sigHex);

    // 4. Verify the signature.
    return await crypto.subtle.verify(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        key,
        rawSignature,
        hashBuffer
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
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs].slice(0, 100)); // Keep last 100 logs
  };

  const stopScan = () => {
    if (scanController.current) {
        try {
            // Property 'stop' is available on BluetoothLEScan
            scanController.current.stop();
            addLog('Scan stopped by user.');
        } catch(e) {
            addLog('Could not stop scan, it may have already stopped.');
        }
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
        const scan = await navigator.bluetooth.requestLEScan({
            acceptAllAdvertisements: true,
        });

        scanController.current = scan;
        addLog("Scan permitted. Listening for 'ESP32_ATTEND'...");

        const scanTimeout = setTimeout(() => {
            if(scan.active) {
                scan.stop();
                addLog("Scan timed out after 30 seconds. No device found.");
                setAppState('IDLE');
            }
        }, 30000); // 30-second timeout for the scan

        navigator.bluetooth.addEventListener('advertisementreceived', async (event: BluetoothAdvertisingEvent) => {
            const { device, manufacturerData } = event;

            if (!device || device.name !== 'ESP32_ATTEND') {
              return;
            }
            
            clearTimeout(scanTimeout);
            if (scan.active) {
                scan.stop();
            }
            setAppState('VERIFYING');
            addLog(`Found device: ${device.name}. Stopped scanning.`);

            if (!manufacturerData || manufacturerData.size === 0) {
              addLog("Error: Device found, but it provided no manufacturer data.");
              setAppState('ERROR');
              return;
            }

            const dataView = manufacturerData.values().next().value;
            const decoder = new TextDecoder('utf-8');
            const advString = decoder.decode(dataView);
            addLog(`Received data: ${advString}`);

            const parts = advString.split('|');
            if (parts.length !== 3) {
              addLog(`Error: Invalid data format. Expected "room|ts|sig", got "${advString}"`);
              setAppState('ERROR');
              return;
            }

            const [room, tsStr, sigHex] = parts;
            const ts = parseInt(tsStr, 10);
            const pub = PUBLIC_KEYS[room];

            if (!pub) {
              addLog(`Error: No public key found for room "${room}".`);
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
                    setVerifiedInfo({ deviceId: device.id, room, timestamp: ts });
                    setAppState('VERIFIED');
                } else {
                    addLog(`Stale timestamp detected. Device: ${ts}, App: ${now}`);
                    setAppState('ERROR');
                }
            } else {
                addLog('Signature verification FAILED!');
                setAppState('ERROR');
            }
        });

    } catch (error) {
        if(error instanceof Error) {
            addLog(`Error: ${error.message}`);
        } else {
            addLog('An unknown error occurred during verification setup.');
        }
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
                    <p className="text-sm text-slate-500 mt-2">Please ensure the device is advertising.</p>
                    <button onClick={stopScan} className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all">
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
                        <p className="text-green-800"><span className="font-semibold">Room:</span> {verifiedInfo.room}</p>
                        <p className="text-green-800"><span className="font-semibold">Device ID:</span> {verifiedInfo.deviceId}</p>
                        <p className="text-green-800"><span className="font-semibold">Timestamp:</span> {new Date(verifiedInfo.timestamp * 1000).toLocaleString()}</p>
                    </div>
                    <button onClick={resetApp} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all">
                        Verify Another
                    </button>
                 </>
            );
        case 'ERROR':
            return (
                <>
                    <p className="text-2xl font-bold text-red-600 mb-4">Verification Failed</p>
                    <p className="text-slate-600 mb-6">Check the logs below for details.</p>
                     <button onClick={resetApp} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all">
                        Try Again
                    </button>
                </>
            );
        case 'IDLE':
        default:
             return (
                <>
                    <button onClick={startVerificationFlow} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all">
                        Scan QR Code & Verify
                    </button>
                    <p className="text-slate-600 mt-4 text-center">
                        Press to simulate scanning and start BLE verification.
                    </p>
                </>
            );
    }
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans flex flex-col">
      <header className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-slate-800 text-center">BLE Attendance Verifier</h1>
        <p className="text-center text-slate-500">Status: {appState}</p>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          {renderContent()}
      </main>
      
      <div className="h-64 bg-white m-4 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-lg font-bold p-3 border-b border-slate-200 text-slate-700">Logs</h2>
          <pre className="flex-grow p-3 overflow-y-auto text-xs text-slate-600 bg-slate-50 rounded-b-lg">
              {logs.join('\n')}
          </pre>
      </div>
    </div>
  );
};

export default BLEReceiver;


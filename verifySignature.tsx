import crypto from 'react-native-quick-crypto';
import { Buffer } from 'buffer';

export async function verifySignature(
  publicKeyHex: string,
  room: string,
  ts: number,
  sigHex: string
): Promise<boolean> {
  try {
    const spkiPrefix = '3059301306072a8648ce3d020106082a8648ce3d030107034200';
    const publicKeyDer = Buffer.from(spkiPrefix + publicKeyHex, 'hex');
    const pemKey = `-----BEGIN PUBLIC KEY-----\n${publicKeyDer.toString('base64')}\n-----END PUBLIC KEY-----`;

    const message = `${room}|${ts}`;
    const verify = crypto.createVerify('sha256');
    verify.update(Buffer.from(message, 'utf8'));

    const signature = Buffer.from(sigHex, 'hex');
    return verify.verify({ key: pemKey, format: 'pem', type: 'spki' }, signature);
  } catch (e) {
    console.error('Signature verification error:', e);
    return false;
  }
}

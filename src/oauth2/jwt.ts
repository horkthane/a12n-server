import { User, App, OAuth2Client } from '../types';
import { generateSecretToken } from '../crypto';
import { getSetting } from '../server-settings';
import { createPrivateKey, KeyObject, createPublicKey } from 'crypto';
import { SignJWT } from 'jose';
import { getGlobalOrigin } from '@curveball/kernel';

type AccessTokenOptions = {
  principal: User|App;
  client: OAuth2Client;
  expiry: number;
  scope: string[];
  audience: string;
}

export async function generateJWTAccessToken(options: AccessTokenOptions): Promise<string> {

  const jti = await generateSecretToken();

  const privateKey = getPrivateKey();

  const jwt = await new SignJWT({
    scope: options.scope.join(' '),
    client_id: options.client.clientId,
  })
    .setProtectedHeader({
      alg: 'RS256',
      typ: 'at+jwt',
    })
    .setIssuedAt()
    .setIssuer(getGlobalOrigin())
    .setAudience(options.audience)
    .setSubject(options.principal.href)
    .setExpirationTime(Math.floor(Date.now() / 1000) + options.expiry)
    .setJti(jti)
    .sign(privateKey);

  return jwt;

}

type IDTokenOptions = {
  principal: User|App;
  client: OAuth2Client;
  nonce: null | string;
}

export async function generateJWTIDToken(options: IDTokenOptions) {

  const privateKey = getPrivateKey();

  const jwt = await new SignJWT({
    nonce: options.nonce,

  })
    .setProtectedHeader({
      alg: 'RS256',
    })
    .setIssuedAt()
    .setIssuer(getGlobalOrigin())
    .setAudience(options.client.clientId)
    .setSubject(options.principal.href)
    .setExpirationTime(Math.floor(Date.now() / 1000) + getSetting('oidc.idToken.expiry'))
    .sign(privateKey);

  return jwt;


}


let privateKey: KeyObject|null;

function getPrivateKey(): KeyObject {

  if (privateKey) {
    return privateKey;
  }

  privateKey = createPrivateKey(getRawPrivateKey());
  return privateKey;

}

let publicKey: KeyObject|null;

export function getPublicKey(): KeyObject {

  if (publicKey) return publicKey;

  publicKey = createPublicKey({
    key: getRawPrivateKey()
  });

  return publicKey;

}


function getRawPrivateKey(): Buffer {

  const key = getSetting('jwt.privateKey');
  if (!key) {
    throw new Error('The JWT_PRIVATE_KEY environment variable must be set, and must be a RSA private key file (typically a .pem file)');
  }

  // Some environment variable systems will convert the newline to a literal '\n'.
  // this is a safe operation, because the file should not contain any literal
  // backslashes.
  
  // IISNODE sometimes adds double quotes to either end of this string, need to trim them off.
  return Buffer.from(key.replace(/\"+/, '').replace(/\"+$/, '').replace(/\\n/gm, '\n'));

}

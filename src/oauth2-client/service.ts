import * as bcrypt from 'bcrypt';
import * as jose from 'jose'
import { Context } from '@curveball/core';
import { NotFound, Unauthorized, Conflict } from '@curveball/http-errors';
import { Oauth2ClientsRecord } from 'knex/types/tables';
import { wrapError, UniqueViolationError } from 'db-errors';

import { PrincipalService } from '../principal/service';
import db, { insertAndGetId } from '../database';
import { InvalidRequest } from '../oauth2/errors';
import parseBasicAuth from './parse-basic-auth';
import { App, GrantType, OAuth2Client } from '../types';
import { X509Certificate } from 'crypto';

export async function findByClientId(clientId: string): Promise<OAuth2Client> {

  const result = await db('oauth2_clients')
    .select('*')
    .where('client_id', clientId);

  if (!result.length) {
    throw new NotFound('OAuth2 client_id not recognized');
  }

  const record: Oauth2ClientsRecord = result[0];

  const principalService = new PrincipalService('insecure');
  const app = await principalService.findById(record.user_id, 'app');
  if (!app.active) {
    throw new Error(`App ${app.nickname} is not active`);
  }
  return mapRecordToModel(record, app);

}

export async function findById(id: number): Promise<OAuth2Client> {

  const result = await db('oauth2_clients')
    .select('*')
    .where('id', id);

  if (!result.length) {
    throw new NotFound('OAuth2 id not recognized');
  }

  const record: Oauth2ClientsRecord = result[0];

  const principalService = new PrincipalService('insecure');
  const app = await principalService.findById(record.user_id, 'app');
  if (!app.active) {
    throw new Error(`App ${app.nickname} is not active`);
  }
  return mapRecordToModel(record, app);

}

export async function findByApp(app: App): Promise<OAuth2Client[]> {

  const result = await db('oauth2_clients')
    .select('*')
    .where('user_id', app.id);

  return result.map( (record: Oauth2ClientsRecord) => mapRecordToModel(record, app));

}

function mapRecordToModel(record: Oauth2ClientsRecord, app: App): OAuth2Client {

  return {
    id: record.id,
    href: `${app.href}/client/${record.client_id}`,
    clientId: record.client_id,
    clientSecret: record.client_secret,
    app,
    allowedGrantTypes: record.allowed_grant_types.split(' ') as GrantType[],
    requirePkce: !!record.require_pkce,
    scopes: record.scopes.split(' '),
  };

}

export async function getOAuth2ClientFromSignature(ctx: Context): Promise<OAuth2Client> {
  
  let oauth2Client: OAuth2Client;
  var sig: string | null;
  var body: string;
  body = ctx.state['rawBody'];
  sig = ctx.request.headers.get('x-utm-message-signature');

  if (!ctx.request.body.client_id) {
    throw new InvalidRequest('The "client_id" property is required');
  }

  try {
    oauth2Client = await findByClientId(ctx.request.body.client_id);
  } catch (e) {
    if (e instanceof NotFound) {
      throw new Unauthorized('Client id or signature incorrect', 'Basic');
    } else {
      // Rethrow
      throw e;
    }
  }

  if(sig == null){
    throw new Unauthorized('x-utm-message-signature header is required');
  }
  if (!await validateSignature(oauth2Client, body, sig)) {
    throw new Unauthorized('Client id or signature incorrect', 'Basic');
  }

  return oauth2Client;

}

export async function getOAuth2ClientFromBasicAuth(ctx: Context): Promise<OAuth2Client> {

  let oauth2Client: OAuth2Client;

  const basicAuth = parseBasicAuth(ctx);
  if (!basicAuth) {
    throw new Unauthorized('Invalid Basic Auth header');
  }

  try {
    oauth2Client = await findByClientId(basicAuth[0]);
  } catch (e) {
    if (e instanceof NotFound) {
      throw new Unauthorized('Client id or secret incorrect', 'Basic');
    } else {
      // Rethrow
      throw e;
    }
  }
  if (!await validateSecret(oauth2Client, basicAuth[1])) {
    throw new Unauthorized('Client id or secret incorrect', 'Basic');
  }

  return oauth2Client;

}

export async function getOAuth2ClientFromBody(ctx: Context<any>): Promise<OAuth2Client> {

  if (!ctx.request.body.client_id) {
    throw new InvalidRequest('The "client_id" property is required');
  }

  try {
    return await findByClientId(ctx.request.body.client_id);
  } catch (e) {
    if (e instanceof NotFound) {
      throw new Unauthorized('Client id unknown', 'Basic');
    } else {
      // Rethrow
      throw e;
    }
  }

}

export async function create(client: Omit<OAuth2Client, 'id'|'href'>, redirectUris: string[]): Promise<OAuth2Client> {

  const params: Partial<Oauth2ClientsRecord> = {
    client_id: client.clientId,
    client_secret: client.clientSecret,
    user_id: client.app.id,
    allowed_grant_types: client.allowedGrantTypes.join(' '),
    require_pkce: client.requirePkce?1:0,
    scopes: client.scopes.join(' '),
  };

  let result;

  try {
    result = await insertAndGetId('oauth2_clients', params);
    for(const uri of redirectUris) {

      await db('oauth2_redirect_uris').insert({oauth2_client_id: result, uri});

    }

  } catch (err: any) {
    const error =  wrapError(err);

    if (error instanceof UniqueViolationError) {
      throw new Conflict('Client ID already exists');
    } else {
      throw error;
    }
  }


  return {
    id: result,
    href: `${client.app.href}/client/${client.clientId}`,
    ...client,
  };

}

export async function edit(client: OAuth2Client, redirectUris: string[]): Promise<void> {

  const params: Partial<Oauth2ClientsRecord> = {
    allowed_grant_types: client.allowedGrantTypes.join(' '),
    scopes: client.scopes.join(' '),
    require_pkce: client.requirePkce?1:0,

  };

  await db.transaction(async trx => {

    await trx('oauth2_clients').update(params).where({id: client.id});
    await trx('oauth2_redirect_uris').delete().where({oauth2_client_id: client.id});

    for(const uri of redirectUris) {

      await trx('oauth2_redirect_uris').insert({oauth2_client_id: client.id, uri});

    }
  });  
}

export async function validateSecret(oauth2Client: OAuth2Client, secret: string): Promise<boolean> {

  return await bcrypt.compare(secret, oauth2Client.clientSecret);

}

export async function validateSignature(oauth2Client: OAuth2Client, body: string, sig: string): Promise<boolean> {
  try{
    var sig_split: string[] = sig.split('.');
    var body_encode: string = jose.base64url.encode(body);
    var complete_sig: string = sig_split[0] + '.' + body_encode + '.' + sig_split[2];
    console.log(complete_sig);
    const jwt_headers: jose.ProtectedHeaderParameters = jose.decodeProtectedHeader(complete_sig);
    if(jwt_headers.x5u == null)
      return false;

    var key_ext = jwt_headers.x5u.substring(jwt_headers.x5u.length - 3);
    var pemText: string;
    console.log(key_ext);
    if(key_ext == 'der'){
      var response: Response = await fetch(jwt_headers.x5u);
      var derBuffer: Buffer = Buffer.from(await response.arrayBuffer());
      const prefix = '-----BEGIN CERTIFICATE-----\n';
      const postfix = '-----END CERTIFICATE-----';
      const derString: string = derBuffer.toString('base64');
      if(derString == null)
        return false;
      const derStringSplit = derString.match(/.{0,64}/g);
      if(derStringSplit == null)
        return false;
      pemText = prefix + derStringSplit.join('\n') + postfix;
    }
    else if(key_ext == 'pem'){
      var response: Response = await fetch(jwt_headers.x5u);
      pemText = await response.text();
    } else {
      return false;
    }

    console.log(pemText);
    var x509: X509Certificate = new X509Certificate(pemText);
    var key: jose.KeyLike = await jose.importX509(pemText, 'RS256');
    
    if(!x509.checkHost(oauth2Client.clientId)){
      console.error("hostname does not match x509 cert");
      return false;
    }
    
    //var verify: jose.JWTVerifyResult = await jose.jwtVerify(complete_sig, key);    
    await jose.compactVerify(complete_sig, key);
    return true;

  } catch (err: any) {

    console.error(err);
    throw new Unauthorized('Client id or signature incorrect', 'Basic');

  }
  return false;
}


export async function setSecret(client: OAuth2Client, secret: string): Promise<void> {
  const params: Partial<Oauth2ClientsRecord> = {
    client_secret: await bcrypt.hash(secret, 12),
  };

  await db.transaction(async trx => {

    await trx('oauth2_clients').update(params).where({id: client.id});        
  }); 
}
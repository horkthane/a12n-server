import { Middleware } from '@curveball/core';
import { NotFound, Unauthorized } from '@curveball/http-errors';
import * as oauth2Service from './../oauth2/service';
import { App, User, Principal } from '../types';
import * as privilegeService from '../privilege/service';

var app_path = process.env.APP_PATH ? process.env.APP_PATH : "";

const whitelistPath = [
  app_path + '/login',
  app_path + '/assets',
  app_path + '/health',
  app_path + '/register',
  app_path + '/authorize',
  app_path + '/reset-password',
  app_path + '/token',
  app_path + '/introspect',
  app_path + '/revoke',
  app_path + '/.well-known/jwks.json',
  app_path + '/.well-known/oauth-authorization-server',
];

declare module '@curveball/kernel' {

  interface Context {

    /**
     * Authentication info
     */
    auth: AuthHelper;

    privileges: privilegeService.LazyPrivilegeBox;

  }

}

class AuthHelper {

  /**
   * Currently logged in user
   */
  public principal: App | User | null;

  constructor(principal: App | User | null) {
    this.principal = principal;
  }

  /**
   * Returns true if there's a logged in user (or app)
   */
  isLoggedIn(): this is { principal: App|User } {

    return this.principal !== null;

  }

  /**
   * Returns true if the logged in user matches the passsed-in principal
   */
  equals(principal: Principal): boolean {

    return this.principal?.id === principal.id;

  }

}


/**
 * The login middleware ensures that the current HTTP request is authenticated
 */
export default function(): Middleware {

  return async (ctx, next): Promise<void> => {

    let inWhitelist = false;
    for (const path of whitelistPath) {

      if (ctx.path === path || ctx.path.startsWith(path + '/')) {
        inWhitelist = true;
        break;
      }
    }


    if (!inWhitelist && ctx.request.headers.has('Authorization')) {
      // We had an authorization header, lets validate it
      const authHeader = ctx.request.headers.get('Authorization')!;

      const [authType, accessToken] = authHeader.split(' ');
      if (authType.toLowerCase() !== 'bearer') {
        throw new Unauthorized('Only Bearer authentication is currently supported', 'Bearer');
      }

      let token;
      try {
        token = await oauth2Service.getTokenByAccessToken(accessToken);
      } catch (e) {
        if (e instanceof NotFound) {
          throw new Unauthorized('Bearer token not recognized');
        } else {
          throw e;
        }
      }
      // We are logged in!
      ctx.auth = new AuthHelper(token.principal);
      ctx.privileges = await privilegeService.get(ctx.auth.principal!);

      return next();

    }

    ctx.auth = new AuthHelper(
      ctx.session.user || null
    );
    if (ctx.auth.principal) {
      ctx.privileges = await privilegeService.get(ctx.auth.principal);
    }
    if (ctx.session.user) {
      // The user was logged in via a session cookie.
      return next();

    }

    if (inWhitelist) {
      return next();
    }

    // Not logged in.
    const app_path = process.env.APP_PATH ? process.env.APP_PATH : "";
    ctx.status = 303;
    ctx.response.headers.set('Location', app_path + '/login?continue=' + encodeURIComponent(ctx.request.requestTarget));

  };

}

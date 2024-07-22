import { HalResource } from 'hal-types';
import { getSetting } from '../../server-settings';
import { Principal, ServerStats } from '../../types';

export default (version: string, authenticatedUser: Principal, isAdmin: boolean, stats: ServerStats) => {
  var app_path = process.env.APP_PATH ? process.env.APP_PATH : "";

  const result: HalResource = {
    _links: {
      'self': { href: app_path + '/', title: 'Home' },
      'authenticated-as': { href: app_path + authenticatedUser.href, title: authenticatedUser.nickname },
      'change-password': { href: app_path + '/change-password', title: 'Change password' },

      'app-collection': { href: app_path + '/app', title: 'List of apps'},
      'user-collection': { href: app_path + '/user', title: 'List of users'},
      'group-collection': { href: app_path + '/group', title: 'List of groups'},
      'logout': {
        href: app_path + '/logout',
        title: 'Log out',
      },
      'privilege-collection': {
        href: app_path + '/privilege',
        title: 'List of available privileges',
      },


      'authorize' : { href: app_path + '/authorize', title: 'OAuth2 authorize endpoint', type: 'text/html' },
      'token': {
        href: app_path + '/token',
        title: 'OAuth2 Token Endpoint',
        hints: {
          allow: ['POST'],
        }
      },
      'introspect' : {
        href: app_path + '/introspect',
        title: 'OAuth2 Introspection Endpoint',
        hints: {
          allow: ['POST'],
        }
      },

      'schema-collection': {
        href: app_path + '/schema',
        title: 'List of JSON schemas for this API'
      },

      'oauth_server_metadata_uri' : {
        href: app_path + '/.well-known/oauth-authorization-server',
        title: 'OAuth 2.0 Authorization Server Metadata'
      },

      'jwks': {
        href: app_path + '/.well-known/jwks.json',
        title: 'JSON Web Key Set (JWKS)',
      }
    },
    version: version,
    stats
  };

  if (getSetting('registration.enabled')) {
    result._links.registration = {
      href: app_path + '/register',
      title: 'Create a new user account',
      type: 'text/html'
    };
  }

  if (isAdmin) {
    result._links['exchange-one-time-token'] = {
      href: app_path + '/exchange-one-time-token',
      title: 'Exchange a one-time token for a Access and Refresh token',
    };
    result._links['settings'] = {
      href: app_path + '/settings',
      title: 'Server settings',
    };
  }

  return result;

};

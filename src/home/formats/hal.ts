import { HalResource } from 'hal-types';
import { getSetting } from '../../server-settings';
import { Principal, ServerStats } from '../../types';

export default (version: string, authenticatedUser: Principal, isAdmin: boolean, stats: ServerStats) => {
  
  const result: HalResource = {
    _links: {
      'self': { href: getSetting("app.path") + '/', title: 'Home' },
      'authenticated-as': { href: getSetting("app.path") + authenticatedUser.href, title: authenticatedUser.nickname },
      'change-password': { href: getSetting("app.path") + '/change-password', title: 'Change password' },

      'app-collection': { href: getSetting("app.path") + '/app', title: 'List of apps'},
      'user-collection': { href: getSetting("app.path") + '/user', title: 'List of users'},
      'group-collection': { href: getSetting("app.path") + '/group', title: 'List of groups'},
      'logout': {
        href: getSetting("app.path") + '/logout',
        title: 'Log out',
      },
      'privilege-collection': {
        href: getSetting("app.path") + '/privilege',
        title: 'List of available privileges',
      },


      'authorize' : { href: getSetting("app.path") + '/authorize', title: 'OAuth2 authorize endpoint', type: 'text/html' },
      'token': {
        href: getSetting("app.path") + '/token',
        title: 'OAuth2 Token Endpoint',
        hints: {
          allow: ['POST'],
        }
      },
      'introspect' : {
        href: getSetting("app.path") + '/introspect',
        title: 'OAuth2 Introspection Endpoint',
        hints: {
          allow: ['POST'],
        }
      },

      'schema-collection': {
        href: getSetting("app.path") + '/schema',
        title: 'List of JSON schemas for this API'
      },

      'oauth_server_metadata_uri' : {
        href: getSetting("app.path") + '/.well-known/oauth-authorization-server',
        title: 'OAuth 2.0 Authorization Server Metadata'
      },

      'jwks': {
        href: getSetting("app.path") + '/.well-known/jwks.json',
        title: 'JSON Web Key Set (JWKS)',
      }
    },
    version: version,
    stats
  };

  if (getSetting('registration.enabled')) {
    result._links.registration = {
      href: getSetting("app.path") + '/register',
      title: 'Create a new user account',
      type: 'text/html'
    };
  }

  if (isAdmin) {
    result._links['exchange-one-time-token'] = {
      href: getSetting("app.path") + '/exchange-one-time-token',
      title: 'Exchange a one-time token for a Access and Refresh token',
    };
    result._links['settings'] = {
      href: getSetting("app.path") + '/settings',
      title: 'Server settings',
    };
  }

  return result;

};

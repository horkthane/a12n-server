import router from '@curveball/router';

import app from './app/controller/item';
import appNew from './app/controller/new';
import apps from './app/controller/collection';
import blob from './blob/controller';
import changePassword from './changepassword/controller';
import changePasswordRedirect from './well-known/controller/change-password';
import client from './oauth2-client/controller/item';
import clientNew from './oauth2-client/controller/new';
import clientEdit from './oauth2-client/controller/edit';
import clients from './oauth2-client/controller/collection';
import group from './group/controller/item';
import groupNew from './group/controller/new';
import groups from './group/controller/collection';
import health from './health/controller';
import home from './home/controller';
import introspect from './introspect/controller';
import jwks from './jwks/controller';
import login from './login/controller/login';
import loginMfa from './login/controller/mfa';
import loginWebAuthn from './mfa/webauthn/controller/login';
import logout from './logout/controller';
import oauth2Authorize from './oauth2/controller/authorize';
import oauth2ErrorHandler from './oauth2/oauth2-error-handler';
import oauth2Metadata from './well-known/controller/oauth2-metadata';
import oauth2Revoke from './oauth2/controller/revoke';
import oauth2Token from './oauth2/controller/token';
import oneTimeToken from './one-time-token/controller/generate';
import oneTimeTokenExchange from './one-time-token/controller/exchange';
import passwordToken from './reset-password/controller/token';
import privilegeCollection from './privilege/controller/collection';
import privilegeItem from './privilege/controller/item';
import privilegeSearch from './privilege/controller/search';
import register from './register/controller/user';
import registerMfa from './register/controller/mfa';
import registerTotp from './mfa/totp/controller/register';
import registerWebAuthn from './mfa/webauthn/controller/register';
import resetPassword from './reset-password/controller/request';
import resetPasswordRedirect from './reset-password/controller/reset-password';
import settings from './settings/controller';
import user from './user/controller/item';
import userAccessToken from './oauth2/controller/user-access-token';
import userActiveSessions from './oauth2/controller/active-sessions';
import userAppPermissionItem from './user-app-permissions/controller/user-item';
import userAppPermissionCollection from './user-app-permissions/controller/user-collection';
import userByHref from './user/controller/by-href';
import userEdit from './user/controller/edit';
import userEditPrivileges from './user/controller/privileges';
import userLog from './log/controller/user';
import userPassword from './user/controller/password';
import userNew from './user/controller/new';
import users from './user/controller/collection';
import webAuthnRegistration from './mfa/webauthn/controller/registration';

var app_path = process.env.APP_PATH ? process.env.APP_PATH : "";

const routes = [
  router(app_path + '/', home),
  router(app_path + '/assets/:filename', blob),

  router(app_path + '/app', apps),
  router(app_path + '/app/new', appNew),
  router(app_path + '/app/:id', app),
  router(app_path + '/app/:id/edit', userEdit),
  router(app_path + '/app/:id/edit/privileges', userEditPrivileges),
  router(app_path + '/app/:id/client', clients),
  router(app_path + '/app/:id/client/new', clientNew),
  router(app_path + '/app/:id/client/:clientId', client),
  router(app_path + '/app/:id/client/:clientId/edit', clientEdit),

  router(app_path + '/authorize', oauth2ErrorHandler, oauth2Authorize),
  router(app_path + '/exchange-one-time-token', oneTimeTokenExchange),
  router(app_path + '/token', oauth2ErrorHandler, oauth2Token),
  router(app_path + '/revoke', oauth2Revoke),

  router(app_path + '/login', login),
  router(app_path + '/login/mfa', loginMfa),
  router(app_path + '/login/mfa/webauthn', loginWebAuthn),
  router(app_path + '/logout', logout),

  router(app_path + '/health', health),
  router(app_path + '/introspect', introspect),

  router(app_path + '/group', groups),
  router(app_path + '/group/new', groupNew),
  router(app_path + '/group/:id', group),
  router(app_path + '/group/:id/edit', userEdit),
  router(app_path + '/group/:id/edit/privileges', userEditPrivileges),

  router(app_path + '/privilege', privilegeCollection),
  router(app_path + '/privilege/:id', privilegeItem),
  router(app_path + '/privilege-search', privilegeSearch),

  router(app_path + '/register', register),
  router(app_path + '/register/mfa', registerMfa),
  router(app_path + '/register/mfa/totp', registerTotp),
  router(app_path + '/register/mfa/webauthn', registerWebAuthn),
  router(app_path + '/register/mfa/webauthn/registration', webAuthnRegistration),

  router(app_path + '/settings', settings),

  router(app_path + '/user', users),
  router(app_path + '/user/byhref/:href', userByHref),
  router(app_path + '/user/new', userNew),
  router(app_path + '/user/:id', user),
  router(app_path + '/user/:id/edit', userEdit),
  router(app_path + '/user/:id/edit/privileges', userEditPrivileges),
  router(app_path + '/user/:id/log', userLog),
  router(app_path + '/user/:id/password', userPassword),
  router(app_path + '/user/:id/one-time-token', oneTimeToken),
  router(app_path + '/user/:id/access-token', userAccessToken),
  router(app_path + '/user/:id/sessions', userActiveSessions),
  router(app_path + '/user/:id/app-permission', userAppPermissionCollection),
  router(app_path + '/user/:id/app-permission/:appId', userAppPermissionItem),

  router(app_path + '/change-password', changePassword),
  router(app_path + '/reset-password', resetPassword),
  router(app_path + '/reset-password/token/:token', passwordToken),
  router(app_path + '/reset-password/change-password', resetPasswordRedirect),

  router(app_path + '/.well-known/jwks.json', jwks),
  router(app_path + '/.well-known/oauth-authorization-server', oauth2Metadata),
  router(app_path + '/.well-known/change-password', changePasswordRedirect),
];

export default routes;

import { render } from '../../templates';

const app_path = process.env.APP_PATH ? process.env.APP_PATH : "";

type Options = {
  csrfToken: string;
  msg: string|undefined;
  error: string|undefined;
  nickname: string|undefined;
  url: string|undefined;
  clientId: string|undefined;
  allowedGrantTypes: string|undefined;
  redirectUris: string|undefined;
  requirePkce: string|undefined;
}

export function createAppForm(options: Options) {

  const hiddenFields: Record<string, string> = {
    'csrf-token': options.csrfToken,
  };

  if (options.clientId) {
    hiddenFields['clientId'] = options.clientId;
  }

  if (options.allowedGrantTypes) {
    hiddenFields['allowedGrantTypes'] = options.allowedGrantTypes;
  }

  if (options.redirectUris) {
    hiddenFields['redirectUris'] = options.redirectUris;
  }

  if (options.requirePkce) {
    hiddenFields['requirePkce'] = options.requirePkce;
  }

  return render('create-app', {
    title: 'Create App',
    msg: options.msg,
    error: options.error,
    action: app_path + '/app/new',
    nickname: options.nickname,
    url: options.url,
    hiddenFields
  });
}

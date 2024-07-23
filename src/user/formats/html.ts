import { getSetting } from '../../server-settings';
import { render } from '../../templates';

type Options = {
  csrfToken: string;
  msg: string|undefined;
  error: string|undefined;
}

export function createUserForm(options: Options) {

  const hiddenFields: Record<string, string> = {
    'csrf-token': options.csrfToken,
  };

  return render('create-user', {
    title: 'Create User',
    msg: options.msg,
    error: options.error,
    action: getSetting("app.path") + '/user/new',
    hiddenFields,
  });
}

import { getSetting } from '../../server-settings';
import { render } from '../../templates';

export function logoutForm(msg: string, error: string, continueUri?: string) {

  const hiddenFields: Record<string, string> = {};
  if (continueUri) {
    hiddenFields['continue'] = continueUri;
  }

  return render('logout', {
    title: 'Logout',
    msg: msg,
    error: error,
    action: getSetting("app.path") + '/logout',
    hiddenFields,
  });

}

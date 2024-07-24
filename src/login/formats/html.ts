import { getSetting } from '../../server-settings';
import { render } from '../../templates';
type KeyValue = { [key: string]: string };

export function loginForm(msg: string, error: string, hiddenFields: KeyValue, registrationEnabled: boolean, registrationUri: string, resetPasswordUri: string): string {
  return render('login', {
    title: 'Login',
    msg: msg,
    error: error,
    hiddenFields: hiddenFields,
    action: `${getSetting("app.path")}/login`,
    registrationEnabled,
    registrationUri,
    resetPasswordUri,
  });

}

export function mfaForm(
  msg: string,
  error: string,
  useTotp: boolean,
  useWebAuthn: boolean,
  hiddenFields: KeyValue,
): string {
  return render('login-mfa', {
    title: 'MFA',
    msg: msg,
    error: error,
    useTotp,
    useWebAuthn,
    hiddenFields: hiddenFields,
    action: `${getSetting("app.path")}/login/mfa`,
  });

}

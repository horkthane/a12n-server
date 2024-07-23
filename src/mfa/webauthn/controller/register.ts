import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

import { registrationForm } from '../formats/html';
import { User } from '../../../types';


class WebAuthnRegisterController extends Controller {
  async get(ctx: Context) {
    const user: User = ctx.session.registerUser;
    const app_path = process.env.APP_PATH ? process.env.APP_PATH : "";

    if (!user) {
      return ctx.redirect(303, app_path + '/login');
    }

    ctx.response.type = 'text/html';
    ctx.response.body = registrationForm(
      ctx.query.msg,
      ctx.query.error,
    );
  }
}

export default new WebAuthnRegisterController();

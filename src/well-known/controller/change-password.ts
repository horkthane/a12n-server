import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

/**
 * WellKnownChangePassword implements support for well-known URIs as
 * defined in RFC 8615.
 */
class WellKnownChangePassword extends Controller {
  /**
     * get responds to requests with a 301 Moved Permanently status code
     * redirecting the user to the /changepassword route via the Location
     * header.
     *
     * @param ctx Context object representing encapsulating the HTTP request.
     */
  async get(ctx: Context) {
    const app_path = process.env.APP_PATH ? process.env.APP_PATH : "";
    ctx.status = 301;
    ctx.response.headers.set('Location', app_path + '/change-password');
  }
}

export default new WellKnownChangePassword();

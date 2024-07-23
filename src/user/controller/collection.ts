import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest, Conflict, NotFound } from '@curveball/http-errors';
import * as hal from '../formats/hal';
import { PrincipalService } from '../../principal/service';
import { getSetting } from '../../server-settings';

type NewPrincipalBody = {
  nickname: string;
  active: boolean;
  type: 'user' | 'app' | 'group';
}

class UserCollectionController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const users = await principalService.findAll('user');
    ctx.response.body = hal.collection(users);

  }

  async post(ctx: Context) {

    ctx.request.validate<NewPrincipalBody>(
      'https://curveballjs.org/schemas/a12nserver/principal-new.json'
    );

    const identity = ctx.request.links.get('me')?.href;
    if (!identity) {
      throw new BadRequest('You must specify a link with rel "me", either via a HAL link or HTTP Link header');
    }

    const principalService = new PrincipalService(ctx.privileges);

    try {
      await principalService.findByIdentity(identity);
      throw new Conflict('User already exists');
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    const user = await principalService.save({
      identity,
      nickname: ctx.request.body.nickname,
      type: ctx.request.body.type,
      active: ctx.request.body.active,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    ctx.response.status = 201;
    ctx.response.headers.set('Location', getSetting("app.path") + user.href);
  }

}

export default new UserCollectionController();

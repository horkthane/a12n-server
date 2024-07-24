import { getSetting } from '../../server-settings';
import { Privilege, PrivilegeEntry } from '../types';
import { HalResource } from 'hal-types';

export function collection(privileges: Privilege[]): HalResource {

  return {
    _links: {
      self: { href: `${getSetting("app.path")}/privilege` },
      item: privileges.map(privilege => ({
        href: getSetting("app.path") + '/privilege/' + privilege.privilege,
        title: privilege.description
      })),
      'search-resource-privileges': {
        href: getSetting("app.path") + '/privilege-search{?resource}',
        title: 'Search privileges by resource',
        templated: true,
      }
    },
    total: privileges.length,
  };

}

export function item(privilege: Privilege): HalResource {
  return {
    _links: {
      self: {
        href: getSetting("app.path") + '/privilege/' + privilege.privilege
      },
      collection: {
        href: getSetting("app.path") + '/privilege',
        title: 'Privilege Collection'
      }
    },
    privilege: privilege.privilege,
    description: privilege.description
  };
}

export function search(resource: string, privileges: PrivilegeEntry[]): HalResource {

  return {
    _links: {
      self: {
        href: `${getSetting("app.path")}/privilege-search?resource=${encodeURIComponent(resource)}`,
        title: 'Privilege Search Results',
      },
      about: {
        href: resource,
      },
    },
    privileges: privileges.map( privilege => ({
      principal: privilege.principal.href,
      privilege: privilege.privilege,
      resource: privilege.resource,
    })),

  };

}

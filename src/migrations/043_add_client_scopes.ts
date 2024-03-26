import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	
    const result = await knex('changelog').select('id').where({ id: 43 });
	
    if (result.length) {
        // Migration has been applied using the old patch system
        return;
    }
    await knex('changelog').insert({
        id: 43,
        timestamp: Math.floor(Date.now() / 1000)
    });
	
    await knex.schema.alterTable('oauth2_clients', table => {
        table.string('scopes');
    });	
	await knex.raw('UPDATE oauth2_clients SET scopes = ?', '');	
	await knex.schema.alterTable('oauth2_clients', table => {
        table.string('scopes').notNullable().alter();
    });
}

export async function down(knex: Knex): Promise<void> {
    throw new Error('This migration doesn\'t have a "down" script');
}

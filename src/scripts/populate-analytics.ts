/**
 * Manual script to populate analytics data for all tenants
 * Run with: npm run build && node lib/scripts/populate-analytics.js
 */

import { create as createContext } from '../context';
import type { Context } from '../types';

async function populateAnalytics() {
    const context: Context = await createContext();

    try {
        console.log('Starting analytics population...');

        // Get all active tenants
        const tenants = await context.models.Tenant.findAll({
            where: { status: 'active' },
            attributes: ['id', 'name']
        });

        console.log(`Found ${tenants.length} active tenants`);

        // Get a system user for each tenant (or use the first admin user)
        for (const tenant of tenants) {
            try {
                const adminUser = await context.models.User.findOne({
                    where: {
                        tenantId: tenant.id,
                        status: 'active'
                    },
                    attributes: ['id'],
                    order: [['id', 'ASC']]
                });

                if (!adminUser) {
                    console.log(`No active user found for tenant ${tenant.name} (ID: ${tenant.id}), skipping...`);
                    continue;
                }

                console.log(`Updating analytics for tenant: ${tenant.name} (ID: ${tenant.id})`);
                await context.services.statistics.triggerAnalyticsUpdate(context, tenant.id, adminUser.id);
                console.log(`✓ Analytics updated for tenant: ${tenant.name}`);
            } catch (error) {
                console.error(`✗ Failed to update analytics for tenant ${tenant.name}:`, error);
            }
        }

        console.log('\n✓ Analytics population completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('✗ Failed to populate analytics:', error);
        process.exit(1);
    }
}

populateAnalytics();

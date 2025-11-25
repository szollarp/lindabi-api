'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        console.log('Starting analytics data population...');

        // Get all active tenants
        const tenants = await queryInterface.sequelize.query(
            `SELECT id, name FROM tenants WHERE status = 'active'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        console.log(`Found ${tenants.length} active tenants`);

        for (const tenant of tenants) {
            try {
                console.log(`Calculating analytics for tenant: ${tenant.name} (ID: ${tenant.id})`);

                // Calculate Basket Values
                const [orderedQuotesStats] = await queryInterface.sequelize.query(
                    `SELECT 
                        COUNT(*) as count,
                        COALESCE(AVG(fee), 0) as average_value,
                        COALESCE(SUM(fee), 0) as total_value
                    FROM tenders 
                    WHERE tenant_id = :tenantId AND status = 'ordered'`,
                    {
                        replacements: { tenantId: tenant.id },
                        type: Sequelize.QueryTypes.SELECT
                    }
                );

                const [orderedJobsStats] = await queryInterface.sequelize.query(
                    `SELECT 
                        COUNT(*) as count,
                        COALESCE(AVG(net_amount + vat_amount), 0) as average_value,
                        COALESCE(SUM(net_amount + vat_amount), 0) as total_value
                    FROM projects 
                    WHERE tenant_id = :tenantId AND status = 'ordered'`,
                    {
                        replacements: { tenantId: tenant.id },
                        type: Sequelize.QueryTypes.SELECT
                    }
                );

                const basketValues = {
                    orderedQuotes: {
                        count: parseInt(orderedQuotesStats.count),
                        averageValue: Math.round(parseFloat(orderedQuotesStats.average_value) * 100) / 100,
                        totalValue: Math.round(parseFloat(orderedQuotesStats.total_value) * 100) / 100
                    },
                    orderedJobs: {
                        count: parseInt(orderedJobsStats.count),
                        averageValue: Math.round(parseFloat(orderedJobsStats.average_value) * 100) / 100,
                        totalValue: Math.round(parseFloat(orderedJobsStats.total_value) * 100) / 100
                    }
                };

                // Calculate Success Rate
                const [successRateStats] = await queryInterface.sequelize.query(
                    `SELECT 
                        COUNT(*) FILTER (WHERE status IN ('sent', 'ordered', 'invalid')) as total_sent,
                        COUNT(*) FILTER (WHERE status = 'ordered') as total_accepted,
                        COUNT(*) FILTER (WHERE status IN ('inquiry', 'awaiting_offer', 'awaiting_approval', 'finalized')) as pending_quotes
                    FROM tenders 
                    WHERE tenant_id = :tenantId`,
                    {
                        replacements: { tenantId: tenant.id },
                        type: Sequelize.QueryTypes.SELECT
                    }
                );

                const totalSent = parseInt(successRateStats.total_sent);
                const totalAccepted = parseInt(successRateStats.total_accepted);
                const successRate = totalSent > 0 ? (totalAccepted / totalSent) * 100 : 0;

                const quoteSuccessRate = {
                    totalSent,
                    totalAccepted,
                    pendingQuotes: parseInt(successRateStats.pending_quotes),
                    successRate: Math.round(successRate * 100) / 100
                };

                // Calculate Job Profitability
                const [profitabilityStats] = await queryInterface.sequelize.query(
                    `SELECT 
                        COUNT(DISTINCT p.id) as total_jobs,
                        COALESCE(SUM(p.net_amount + p.vat_amount), 0) as total_revenue,
                        COALESCE(SUM(pi.material_net_amount + pi.fee_net_amount), 0) as total_costs
                    FROM projects p
                    LEFT JOIN project_items pi ON p.id = pi.project_id
                    WHERE p.tenant_id = :tenantId AND p.status IN ('completed', 'paid', 'closed')`,
                    {
                        replacements: { tenantId: tenant.id },
                        type: Sequelize.QueryTypes.SELECT
                    }
                );

                const totalRevenue = parseFloat(profitabilityStats.total_revenue);
                const totalCosts = parseFloat(profitabilityStats.total_costs);
                const netProfit = totalRevenue - totalCosts;
                const averageProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

                // Count profitable vs unprofitable jobs
                const profitableJobs = await queryInterface.sequelize.query(
                    `SELECT COUNT(*) as count
                    FROM projects p
                    WHERE p.tenant_id = :tenantId 
                    AND p.status IN ('completed', 'paid', 'closed')
                    AND (p.net_amount + p.vat_amount) > (
                        SELECT COALESCE(SUM(pi.material_net_amount + pi.fee_net_amount), 0)
                        FROM project_items pi
                        WHERE pi.project_id = p.id
                    )`,
                    {
                        replacements: { tenantId: tenant.id },
                        type: Sequelize.QueryTypes.SELECT
                    }
                );

                const unprofitableJobs = await queryInterface.sequelize.query(
                    `SELECT COUNT(*) as count
                    FROM projects p
                    WHERE p.tenant_id = :tenantId 
                    AND p.status IN ('completed', 'paid', 'closed')
                    AND (p.net_amount + p.vat_amount) <= (
                        SELECT COALESCE(SUM(pi.material_net_amount + pi.fee_net_amount), 0)
                        FROM project_items pi
                        WHERE pi.project_id = p.id
                    )`,
                    {
                        replacements: { tenantId: tenant.id },
                        type: Sequelize.QueryTypes.SELECT
                    }
                );

                const jobProfitability = {
                    totalJobs: parseInt(profitabilityStats.total_jobs),
                    profitableJobs: parseInt(profitableJobs[0].count),
                    unprofitableJobs: parseInt(unprofitableJobs[0].count),
                    totalRevenue: Math.round(totalRevenue * 100) / 100,
                    totalCosts: Math.round(totalCosts * 100) / 100,
                    netProfit: Math.round(netProfit * 100) / 100,
                    averageProfitMargin: Math.round(averageProfitMargin * 100) / 100
                };

                // Calculate Quote Date Analytics (monthly breakdown)
                const dateAnalytics = await queryInterface.sequelize.query(
                    `SELECT 
                        DATE_TRUNC('month', created_on) as month,
                        COUNT(*) as total_quotes,
                        COUNT(*) FILTER (WHERE status = 'ordered') as accepted_quotes,
                        COALESCE(AVG(fee), 0) as average_value
                    FROM tenders 
                    WHERE tenant_id = :tenantId
                    GROUP BY DATE_TRUNC('month', created_on)
                    ORDER BY month DESC
                    LIMIT 12`,
                    {
                        replacements: { tenantId: tenant.id },
                        type: Sequelize.QueryTypes.SELECT
                    }
                );

                const quoteDateAnalytics = {
                    monthlyData: dateAnalytics.map(row => ({
                        month: row.month,
                        totalQuotes: parseInt(row.total_quotes),
                        acceptedQuotes: parseInt(row.accepted_quotes),
                        averageValue: Math.round(parseFloat(row.average_value) * 100) / 100
                    }))
                };

                const now = new Date();
                const periodStart = new Date(0);
                const periodEnd = now;

                // Get first admin user for this tenant as creator
                const [adminUser] = await queryInterface.sequelize.query(
                    `SELECT id FROM users WHERE tenant_id = :tenantId AND status = 'active' ORDER BY id ASC LIMIT 1`,
                    {
                        replacements: { tenantId: tenant.id },
                        type: Sequelize.QueryTypes.SELECT
                    }
                );

                const userId = adminUser?.id || 1;

                // Insert analytics data
                const analyticsRecords = [
                    {
                        type: 'basket_values',
                        data: JSON.stringify(basketValues),
                        period: 'all_time',
                        period_start: periodStart,
                        period_end: periodEnd,
                        tenant_id: tenant.id,
                        created_by: userId,
                        updated_by: userId,
                        created_on: now,
                        updated_on: now
                    },
                    {
                        type: 'quote_success_rate',
                        data: JSON.stringify(quoteSuccessRate),
                        period: 'all_time',
                        period_start: periodStart,
                        period_end: periodEnd,
                        tenant_id: tenant.id,
                        created_by: userId,
                        updated_by: userId,
                        created_on: now,
                        updated_on: now
                    },
                    {
                        type: 'job_profitability',
                        data: JSON.stringify(jobProfitability),
                        period: 'all_time',
                        period_start: periodStart,
                        period_end: periodEnd,
                        tenant_id: tenant.id,
                        created_by: userId,
                        updated_by: userId,
                        created_on: now,
                        updated_on: now
                    },
                    {
                        type: 'quote_date_analytics',
                        data: JSON.stringify(quoteDateAnalytics),
                        period: 'all_time',
                        period_start: periodStart,
                        period_end: periodEnd,
                        tenant_id: tenant.id,
                        created_by: userId,
                        updated_by: userId,
                        created_on: now,
                        updated_on: now
                    }
                ];

                await queryInterface.bulkInsert('analytics', analyticsRecords);
                console.log(`✓ Analytics populated for tenant: ${tenant.name}`);
            } catch (error) {
                console.error(`✗ Failed to populate analytics for tenant ${tenant.name}:`, error.message);
                console.error(error.stack);
            }
        }

        console.log('✓ Analytics data population completed!');
    },

    async down(queryInterface, Sequelize) {
        // Remove all analytics data
        await queryInterface.bulkDelete('analytics', null, {});
        console.log('Analytics data removed');
    }
};

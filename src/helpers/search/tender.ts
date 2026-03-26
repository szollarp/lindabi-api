import { Op, QueryTypes, Sequelize } from 'sequelize';
import { TENDER_STATUS } from '../../constants';
import type { Context } from '../../types';
import type { Tender } from '../../models/interfaces/tender';

export type TenderSearchFilters = {
    status?: TENDER_STATUS | { [Op.ne]: TENDER_STATUS };
    customerId?: number;
    contractorId?: number;
    locationId?: number;
    contactId?: number;
    startDate?: Date;
    endDate?: Date;
    keyword?: string;
};

export type TenderSearchSortOptions = {
    orderBy?: string;
    order?: 'asc' | 'desc';
}

export type TenderIdRow = { id: number };
export type CountRow = { count: string | number };

const normalizeKeyword = (value: string): string =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

const escapeLikePattern = (value: string): string =>
    value.replace(/[\\%_]/g, '\\$&');

export const buildBaseTenderWhereClause = (tenantId: number, filters: TenderSearchFilters) => {
    const whereClause: any = { tenantId };

    if (filters.status) whereClause.status = filters.status;
    if (filters.customerId) whereClause.customerId = filters.customerId;
    if (filters.contractorId) whereClause.contractorId = filters.contractorId;
    if (filters.locationId) whereClause.locationId = filters.locationId;
    if (filters.contactId) whereClause.contactId = filters.contactId;

    if (filters.startDate || filters.endDate) {
        whereClause.createdOn = {};
        if (filters.startDate) whereClause.createdOn[Op.gte] = filters.startDate;
        if (filters.endDate) whereClause.createdOn[Op.lte] = filters.endDate;
    }

    return whereClause;
};

export const getOrderClause = (
    context: Context,
    sortOptions: TenderSearchSortOptions = {}
): { sequelizeOrder: any; sqlOrderBy: string } => {
    const orderBy = sortOptions.orderBy || 'updatedOn';
    const order = (sortOptions.order || 'desc').toUpperCase() as 'ASC' | 'DESC';

    const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';
    const nulls = safeOrder === 'DESC' ? 'NULLS LAST' : 'NULLS FIRST';

    const sqlSortableFields: Record<string, string> = {
        startDate: `"TenderModel"."start_date"`,
        type: `"TenderModel"."type"`,
        createdOn: `"TenderModel"."created_on"`,
        dueDate: `"TenderModel"."due_date"`,
        status: `"TenderModel"."status"`,
        updatedOn: `"TenderModel"."updated_on"`,
        shortName: `"TenderModel"."short_name"`
    };

    const sequelizeFieldMapping: Record<string, any> = {
        'customer.name': Sequelize.literal(`"customer"."name"`),
        startDate: 'startDate',
        type: 'type',
        createdOn: 'createdOn',
        dueDate: 'dueDate',
        status: 'status',
        updatedOn: 'updatedOn',
        shortName: 'short_name'
    };

    if (orderBy === 'startDate') {
        return {
            sequelizeOrder: [
                [
                    context.models.sequelize.literal(
                        `(CASE WHEN "TenderModel"."status" NOT IN ('final', 'ordered', 'sent')
              THEN NULL
              ELSE "TenderModel"."start_date"
            END) ${safeOrder} ${nulls}`
                    )
                ],
                ['id', 'DESC']
            ],
            sqlOrderBy: `
        CASE
          WHEN "TenderModel"."status" NOT IN ('final', 'ordered', 'sent') THEN NULL
          ELSE "TenderModel"."start_date"
        END ${safeOrder} ${nulls},
        "TenderModel"."id" DESC
      `
        };
    }

    if (orderBy === 'customer.name') {
        return {
            sequelizeOrder: [[Sequelize.literal(`"customer"."name"`), safeOrder], ['id', 'DESC']],
            sqlOrderBy: `"customer"."name" ${safeOrder} ${nulls}, "TenderModel"."id" DESC`
        };
    }

    if (orderBy === 'netAmount' || orderBy === 'totalAmount') {
        return {
            sequelizeOrder: [['updatedOn', safeOrder], ['id', 'DESC']],
            sqlOrderBy: `"TenderModel"."updated_on" ${safeOrder}, "TenderModel"."id" DESC`
        };
    }

    const sqlField = sqlSortableFields[orderBy] || `"TenderModel"."updated_on"`;
    const sequelizeField = sequelizeFieldMapping[orderBy] || 'updatedOn';

    return {
        sequelizeOrder: [[sequelizeField, safeOrder], ['id', 'DESC']],
        sqlOrderBy: `${sqlField} ${safeOrder} ${nulls}, "TenderModel"."id" DESC`
    };
};

export const buildKeywordSearchSql = (
    filters: TenderSearchFilters,
    replacements: Record<string, any>
): string => {
    const conditions: string[] = [];
    const pattern = replacements.pattern;

    if (filters.status) {
        if (typeof filters.status === 'object' && filters.status !== null && Op.ne in filters.status) {
            conditions.push(`"TenderModel"."status" != :status`);
            replacements.status = (filters.status as any)[Op.ne];
        } else {
            conditions.push(`"TenderModel"."status" = :status`);
            replacements.status = filters.status;
        }
    } else {
        conditions.push(`"TenderModel"."status" != 'archived'`);
    }

    if (filters.customerId) {
        conditions.push(`"TenderModel"."customer_id" = :customerId`);
        replacements.customerId = filters.customerId;
    }

    if (filters.contractorId) {
        conditions.push(`"TenderModel"."contractor_id" = :contractorId`);
        replacements.contractorId = filters.contractorId;
    }

    if (filters.locationId) {
        conditions.push(`"TenderModel"."location_id" = :locationId`);
        replacements.locationId = filters.locationId;
    }

    if (filters.contactId) {
        conditions.push(`"TenderModel"."contact_id" = :contactId`);
        replacements.contactId = filters.contactId;
    }

    if (filters.startDate) {
        conditions.push(`"TenderModel"."created_on" >= :startDate`);
        replacements.startDate = filters.startDate;
    }

    if (filters.endDate) {
        conditions.push(`"TenderModel"."created_on" <= :endDate`);
        replacements.endDate = filters.endDate;
    }

    conditions.push(`
    (
      (
        immutable_unaccent(lower("TenderModel"."short_name")) || ' ' ||
        immutable_unaccent(lower("TenderModel"."number")) || ' ' ||
        immutable_unaccent(lower("TenderModel"."type")) || ' ' ||
        immutable_unaccent(lower("TenderModel"."notes")) || ' ' ||
        immutable_unaccent(lower("TenderModel"."inquiry")) || ' ' ||
        immutable_unaccent(lower("TenderModel"."survey")) || ' ' ||
        immutable_unaccent(lower("TenderModel"."location_description")) || ' ' ||
        immutable_unaccent(lower("TenderModel"."tool_requirements")) || ' ' ||
        immutable_unaccent(lower("TenderModel"."other_comment"))
      ) LIKE :pattern ESCAPE '\\'

      OR EXISTS (
        SELECT 1
        FROM "companies" AS "customer"
        WHERE "customer"."id" = "TenderModel"."customer_id"
          AND (
            immutable_unaccent(lower("customer"."name")) LIKE :pattern ESCAPE '\\'
            OR immutable_unaccent(lower("customer"."address")) LIKE :pattern ESCAPE '\\'
            OR immutable_unaccent(lower("customer"."city")) LIKE :pattern ESCAPE '\\'
            OR immutable_unaccent(lower("customer"."zip_code")) LIKE :pattern ESCAPE '\\'
            OR immutable_unaccent(lower("customer"."tax_number")) LIKE :pattern ESCAPE '\\'
          )
      )

      OR EXISTS (
        SELECT 1
        FROM "contacts" AS "contact"
        WHERE "contact"."id" = "TenderModel"."contact_id"
          AND (
            immutable_unaccent(lower("contact"."name")) LIKE :pattern ESCAPE '\\'
            OR immutable_unaccent(lower("contact"."email")) LIKE :pattern ESCAPE '\\'
            OR immutable_unaccent(lower("contact"."phone_number")) LIKE :pattern ESCAPE '\\'
          )
      )

      OR EXISTS (
        SELECT 1
        FROM "tender_items" AS "items"
        WHERE "items"."tender_id" = "TenderModel"."id"
          AND immutable_unaccent(lower("items"."name")) LIKE :pattern ESCAPE '\\'
      )
    )
  `);

    return conditions.join('\nAND ');
};

export const searchTenderIdsByKeyword = async (
    context: Context,
    tenantId: number,
    offset: number,
    limit: number,
    filters: TenderSearchFilters,
    sqlOrderBy: string
): Promise<{ ids: number[]; total: number }> => {
    const sequelize = context.models.sequelize;

    const normalized = normalizeKeyword(filters.keyword || '');
    const pattern = `%${escapeLikePattern(normalized)}%`;

    const replacements: Record<string, any> = {
        tenantId,
        pattern,
        offset,
        limit
    };

    const whereSql = buildKeywordSearchSql(filters, replacements);

    const joinSql = sqlOrderBy.includes('"customer"."name"')
        ? 'LEFT JOIN "companies" AS "customer" ON "customer"."id" = "TenderModel"."customer_id"'
        : '';
    
    const countSql = `
    SELECT COUNT(*)::int AS "count"
    FROM "tenders" AS "TenderModel"
    WHERE "TenderModel"."tenant_id" = :tenantId
      AND ${whereSql}
  `;

    const idsSql = `
    SELECT "TenderModel"."id"
    FROM "tenders" AS "TenderModel"
    ${joinSql}
    WHERE "TenderModel"."tenant_id" = :tenantId
      AND ${whereSql}
    ORDER BY ${sqlOrderBy}
    LIMIT :limit OFFSET :offset
  `;

    const [countRows, idRows] = await Promise.all([
        sequelize.query<CountRow>(countSql, {
            type: QueryTypes.SELECT,
            replacements
        }),
        sequelize.query<TenderIdRow>(idsSql, {
            type: QueryTypes.SELECT,
            replacements
        })
    ]);

    return {
        total: Number(countRows[0]?.count || 0),
        ids: idRows.map(row => Number(row.id))
    };
};

export const sortRowsByIdSequence = <T extends { id: number }>(rows: T[], orderedIds: number[]): T[] => {
    const position = new Map<number, number>();
    orderedIds.forEach((id, index) => position.set(id, index));

    return [...rows].sort((a, b) => {
        const posA = position.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const posB = position.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return posA - posB;
    });
};
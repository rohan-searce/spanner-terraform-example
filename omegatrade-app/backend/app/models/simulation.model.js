'user strict';
const database = require('./../config/database.js');
const { v4: uuidv4 } = require('uuid');
const Simulation = function () { };

Simulation.getAll = async function (cb) {
    try {
        const [result] = await database.run({ sql: 'select sml.sId as sId,sml.companyId as companyId, sml.status as status, cy.companyName as companyName, cy.companyShortCode as companyShortCode from simulations sml LEFT JOIN companies cy ON sml.companyId = cy.companyId LIMIT 3', json: true });
        cb(null, result)
    } catch (error) {
        cb(error, null)
    }
}

Simulation.findById = async function (param, cb) {
    try {
        let sId = param.sId
        const query = {
            sql: 'select * from simulations where sId = @sId',
            params: {
                sId: sId
            }
        };
        let result = await database.run(query);
        if (result[0]) {
            var rows = result[0].map((row) => row.toJSON());
            cb(null, rows)
        }
    } catch (error) {
        cb(error, null)
    }
}

Simulation.findByCompanyId = async function (companyId, sid) {
    try {
        const query = {
            sql: 'select * from simulations where companyId = @companyId and sid = @sid',
            params: {
                companyId: companyId,
                sid: sid
            },
            json:true
        };
        const [result] = await database.run(query);
       return result;
    } catch (error) {
       return false;
    }
}

Simulation.create = async function (companyId) {
    try {
        const sId = uuidv4();
        await database.table('simulations').insert({
            sId: sId,
            status: true,
            createdAt: 'spanner.commit_timestamp()',
            companyId: companyId,
        });
        return sId;
    } catch (error) {
        throw ("ERROR:", error);
    }
};

Simulation.deleteById = async function (sId, cb) {
    database.runTransaction(async (err, transaction) => {
        if (err) {
            cb(err, null)
            return;
        }
        try {
            const [rowCount] = await transaction.runUpdate({
                sql: "DELETE FROM simulations WHERE sId = @sId",
                params: {
                    sId: sId
                },
            });
            console.log(`Successfully deleted ${rowCount} record.`);
            await transaction.commit();
            cb(null, true)
        } catch (err) {
            cb(err, null)
        }
    });
}

Simulation.updateById = async function (params, cb) {
    const table = database.table('simulations');
    try {
        await table.update([params]);
        cb(null, true)
    } catch (err) {
        cb(err, null)
    }
}

module.exports = Simulation
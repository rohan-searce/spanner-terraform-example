'user strict';
const database = require('./../config/database.js');
const { v4: uuidv4 } = require('uuid');
const Simulation = function () { };

Simulation.getAll = async function () {
    const [result] = await database.run({
        sql: `SELECT sml.sId as sId,sml.companyId as companyId, sml.status as status, cy.companyName as companyName, cy.companyShortCode as companyShortCode FROM simulations sml 
              LEFT JOIN companies cy ON sml.companyId = cy.companyId 
              ORDER BY sml.createdAt DESC
              LIMIT 3`,
        json: true
    });
    return result;
}

Simulation.findById = async function (param) {
    const sId = param.sId
    const [result] = await database.run({
        sql: 'SELECT sId,companyId,status from SIMULATIONS WHERE sId = @sId',
        params: {
            sId: sId
        },
        json: true
    });
    return result;
}

Simulation.findOne = async function (companyId, sId) {
    const [result] = await database.run({
        sql: `SELECT sId,companyId,status 
              FROM simulations 
              WHERE companyId = @companyId AND sId = @sId`,
        params: {
            companyId: companyId,
            sId: sId
        },
        json: true
    });
    return result;
}

Simulation.create = async function (companyId) {
    const sId = uuidv4();
    await database.table('simulations').insert({
        sId: sId,
        status: 'PROCESSING',
        createdAt: 'spanner.commit_timestamp()',
        companyId: companyId,
    });
    return sId;
};

Simulation.deleteById = async function (sId) {
    return await database.table('simulations').deleteRows([sId]);
}

Simulation.updateById = async function (simulation) {
    return await database.table('simulations').update([simulation]);
}

module.exports = Simulation
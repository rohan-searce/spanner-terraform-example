'user strict';
const database = require('./../config/database.js');
const { v4: uuidv4 } = require('uuid');
const Simulation = function () { };

Simulation.getAll = async function () {
    const [result] = await database.run({
        sql: `SELECT sml.sId as sId,sml.companyId as companyId, sml.status as status, cy.companyName as companyName, cy.companyShortCode as companyShortCode FROM simulations sml 
              LEFT JOIN companies cy ON sml.companyId = cy.companyId 
              LIMIT 3`,
        json: true
    });
    return result;
}

Simulation.findById = async function (param) {
    const sId = param.sId
    const [result] = await database.run({
        sql: 'select sId,companyId,companyName,companyShortCode,status from simulations where sId = @sId',
        params: {
            sId: sId
        },
        json: true
    });
    return result;
}

Simulation.findByCompanyId = async function (companyId, sid) {
    const [result] = await database.run({
        sql: `SELECT sId,companyId,companyName,companyShortCode,status 
              FROM simulations 
              WHERE companyId = @companyId AND sid = @sid`,
        params: {
            companyId: companyId,
            sid: sid
        },
        json: true
    });
    return result;
}

Simulation.create = async function (companyId) {
    const sId = uuidv4();
    await database.table('simulations').insert({
        sId: sId,
        status: true,
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
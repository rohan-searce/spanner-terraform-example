'user strict';
const database = require('./../config/database.js');
var Company = function () { };

Company.getAll = async function (cb) {
    try {
        const query = { sql: 'select companyId , companyName , companyShortCode , created_at from companies', json: true, };
        const [companies] = await database.run(query);
        cb(null, companies)
    } catch (error) {
        cb(error, null)
    }
}

Company.create = async function (data, result) {
    try {
        await database.table('companies').insert(data);
        result(null, data.companyId);
    } catch (error) {
        result(error, null);
    }
};

Company.checkCompany = async function (companyName, companyShortCode) {
    try {
        const query = {
            sql: 'select companyName , companyShortCode from companies where companyName = @companyName or companyShortCode = @companyShortCode',
            params: {
                companyName: companyName,
                companyShortCode: companyShortCode
            },
            json: true
        };
        const [result] = await database.run(query);
        return result;
    } catch (error) {
        throw ("Error Occured!", error);
    }
};

Company.delete = async function (companyId, cb) {
    try {
        const company = database.table('companies');
        const result =  await company.deleteRows([companyId]);
        cb(null, result)
    } catch (error) {
        cb(error, null);
    }
}

Company.update = async function (params, cb) {
    const table = database.table('companies');
    try {
        await table.update([params]);
        cb(null, true)
    } catch (err) {
        cb(err, null)
    }
}

module.exports = Company
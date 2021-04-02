'user strict';
const database = require('./../config/database.js');
const Company = function () { };

Company.getAll = async function (cb) {
    try {
        const [ companies ] = await database.run({ sql: 'select companyId , companyName , companyShortCode , created_at from companies', json: true, });
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
            sql: 'select companyName , companyShortCode from companies where companyName = @companyName or companyShortCode = @companyShortCode LIMIT 1',
            params: {
                companyName: companyName,
                companyShortCode: companyShortCode
            },
            json: true
        }
        return await database.run(query);
    } catch (error) {
        throw ("Error:", error);
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

Company.findById = async function (companyId) {
    try {
        const query = {
            sql: 'select * from companies where companyId = @companyId',
            params: {
                companyId: companyId,
            },
            json: true
        }
        return await database.run(query);
    } catch (error) {
        throw ("Error:", error);
    }
}

Company.createStockData = async function (stockData) {
    try {
        await database.table('companyStocks').insert(stockData)
        return true;
    } catch (error) {
        throw ("Error:", error);
    }
};

module.exports = Company
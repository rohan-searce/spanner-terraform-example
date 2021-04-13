'user strict';
const database = require('./../config/database.js');
const Company = function () { };

Company.getAll = async function () {
    const [companies] = await database.run({
        sql: `SELECT companyId , companyName , companyShortCode , created_at 
              FROM companies`,
        json: true,
    });
    return companies;
}

Company.create = async function (companyObj) {
    await database.table('companies').insert(companyObj);
    return companyObj.companyId
};

Company.checkCompany = async function (companyName, companyShortCode) {
    const company = await database.run({
        sql: `SELECT companyName , companyShortCode 
              FROM companies 
              WHERE companyName = @companyName OR companyShortCode = @companyShortCode 
              LIMIT 1`,
        params: {
            companyName: companyName,
            companyShortCode: companyShortCode
        },
        json: true
    });
    return company;
};

Company.delete = async function (companyId) {
    return await database.table('companies').deleteRows([companyId]);
}

Company.update = async function (companyObj) {
    return await database.table('companies').update([companyObj]);
}

Company.findById = async function (companyId) {
    return await database.run({
        sql: `SELECT companyId , companyName , companyShortCode , created_at  
              FROM companies 
              WHERE companyId = @companyId`,
        params: {
            companyId: companyId,
        },
        json: true
    });
}

Company.createStockData = async function (stockData) {
    return database.table('companyStocks').insert(stockData)
};

module.exports = Company
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

Company.getCompanyStock = async function (companyId,sId = null) {
    try {
        let params = { companyId: companyId }
        let query;
        let fields = `companies.companyId,companies.companyName,companies.companyShortCode,`
        if(sId){
            query = `select ${fields} simulations.status,simulations.sId from companies LEFT JOIN simulations  ON companies.companyId = simulations.companyId where companies.companyId = @companyId and simulations.sId=@sId`
            params.sId = sId;
        }else{
            query = `select  ${fields} from companies where companyId = @companyId`;
        }
        console.log(query)
        const [result] = await database.run({ sql: query, params: params,  json:true });
       return result;
    } catch (error) {
        console.log('----- Dashboard Error ------',error)
        cb(error, null)
    }
};

Company.getStocks = async function(companyId,date = null){
    try {
        let conditions = ['companyId = @companyId'];
        let values = { companyId : companyId };
        if (date) {
            conditions.push('date > @date');
            values.date = date;
        } 
        const [ stockResult ] = await database.run({
            sql: 'select date,currentValue from companyStocks where ' + conditions.join(' AND ')  +' ORDER BY date',
            params: values,
            json:true
        });
        return stockResult;
    } catch (error) {
        console.log(error)
    }
}


/*

if (date) {
            var whereClause = 'where companyId = @companyId and date > @date ORDER BY date';
            var params = {
                companyId: companyId,
                date: param.date
            };
        } else {
            var whereClause = 'where companyId = @companyId ORDER BY date';
            var params = {
                companyId: companyId
            }
        }
        
        var query2 = {
            sql: 'select date,currentValue from companyStocks ' + whereClause,
            params: params
        };
        const stockResult = await database.run(query2);
        console.log('----*******---->query2',query2);
        console.log('----*******---->param',param)
        if (stockResult[0]) {
            var stockRows = stockResult[0].map((row) => row.toJSON());
            response.stocks = stockRows;
        }

*/


module.exports = Company
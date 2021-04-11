



'use strict';
const Company = require('../models/company.model')

exports.getStockData = async function (req, res) {
    try {
    const companyId = req.params.companyId || null
    if(companyId){
    const sId = req.query.sId || null
    const date = req.query.date ? parseFloat(req.query.date):null;
    const [ company ] = await Company.getCompanyStock(companyId,sId);
    const   stocks  = await Company.getStocks(companyId,date);
    console.log(company);
    res.status(200).json({
        success: true,
        data: { company:company, stocks : stocks  }
    });
    }else{
        res.status(500).json({
            success: false,
            data: 'Invalid data'
        });
    }
   } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            data: 'something went wrong'
        });
    }
};
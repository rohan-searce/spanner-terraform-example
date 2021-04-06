'use strict';
const Simulation = require('../models/simulation.model')
const Company = require('../models/company.model')
const { v4: uuidv4 } = require('uuid');
const { spannerNumericRandVal, spannerNumericRandValBetween, generateRandomValue } = require('../helpers/stockdata.helper');
const fakeStockmarketgenerator = require('fake-stock-market-generator');
const { Spanner } = require('@google-cloud/spanner');


/**
 * Function to list all simulations.
 * 
 * @method GET
 */
exports.getList = async function (req, res) {
    try {
        await Simulation.getAll(function (err, data) {
            if (err) {
               return res.json({ success: false, message: "something went wrong" });
            }
            if (data) {
               return res.status(200).json({ success: true, data: data });
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "something went wrong" });
    }
};

/**
 * Function to update simulation
 * 
 * @method PUT
 */
exports.updateSimulation = async function (req, res) {
    const body = req.body;
    if (body) {
        await Simulation.updateById(body, function (err, data) {
            if (err) {
               return res.json({ success: false, message: "something went wrong" });
            }
            if (data) {
               return res.status(200).json({ success: true, message: `Simulation ${(body.status == true) ? 'Started' : 'Stopped'}  sucessfully` });
            }
        });
    } else {
        return res.status(501).json({ success: false, message: "invalid data" });
    }
}

/**
 * Function to Delete simulation
 * 
 * @method DELETE
 */
exports.deleteSimulation = async function (req, res) {
    let sId = req.params.sId;
    if (sId) {
        await Simulation.deleteById(sId, function (err, data) {
            if (err) { return res.json({ success: false, message: "something went wrong" }); }
            if (data) { return res.status(200).json({ success: true, message: `deleted sucessfully` }); }
        });
    } else {
       return res.status(501).json({ success: false, message: "Invalid data" });
    }
};

exports.startSimulation = async function (req, res) {
    try {
        const body = req.body;
        const [result] = await Company.findById(body.companyId);
        if (result && result.length > 0) {
            const company = result[0];
            const interval = body.timeInterval * 1000;
            const stock = fakeStockmarketgenerator.generateStockData(body.data).priceData;
            const sId = await Simulation.create(company.companyId);
            if (sId) {
                var i = 0;
                var intervalId = setInterval(async () => {

                    // Generating RandomData to match with stock logic
                    const randomValue = generateRandomValue(100, 110);
                    const dayHigh = randomValue + generateRandomValue();
                    const dayLow = randomValue - generateRandomValue();
                    const stockData = {};
                    stockData.companyStockId = uuidv4();
                    stockData.companyId = body.companyId;
                    stockData.companyShortCode = company.companyShortCode;
                    stockData.date = Spanner.float(new Date().getTime());
                    stockData.currentValue = spannerNumericRandVal(stock[i].price)
                    stockData.open = spannerNumericRandVal(randomValue);
                    stockData.dayHigh = spannerNumericRandVal(dayHigh);
                    stockData.dayLow = spannerNumericRandVal(dayLow);
                    stockData.close = spannerNumericRandValBetween(dayHigh, dayLow, 2);
                    stockData.volume = spannerNumericRandValBetween(2000, 4000, 3);
                    stockData.timestamp = 'spanner.commit_timestamp()';
                    const simulation = await Simulation.findByCompanyId(body.companyId, sId);
                    if (simulation && simulation[0]) {
                        if (simulation[0].status) {
                            await Company.createStockData(stockData);
                        }
                    } else {
                        clearInterval(intervalId)
                    }
                    if (i === (body.data - 1)) {
                        clearInterval(intervalId)
                    }
                    i++;
                }, interval);
                return res.status(200).json({ success: true, message: "simulation started" });
            }
        }
    } catch (error) {
        return res.status(500).json({ success: false, "message": "something went wrong" });
    }
}








'use strict';
const Simulation = require('../models/simulation.model')
const Company = require('../models/company.model')
const { v4: uuidv4 } = require('uuid');
const fakeStockmarketgenerator = require('fake-stock-market-generator');

/**
 * Function to list all simulations
 * 
 * @method GET
 */
exports.getList = async function (req, res) {
    try {
        await Simulation.getAll(function (err, data) {
            if (err) {
                res.json({ success: false, message: "something went wrong" });
            }
            if (data) {
                res.status(200).json({ success: true, data: data });
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
                res.json({ success: false, message: "something went wrong" });
            }
            if (data) { res.status(200).json({ success: true, message: `Simulation ${(body.status == true) ? 'Started' : 'Stopped'}  sucessfully` });
            }
        });
    } else {
        res.status(501).json({ success: false, message: "invalid data" });
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
            if (err) { res.json({ success: false, message: "something went wrong" });}
            if (data) { res.status(200).json({ success: true, message: `deleted sucessfully`});}
        });
    } else {
        res.status(501).json({ success: false, message: "Invalid data" });
    }
};


exports.startSimulation = async function (req, res) {
    try {
        const body = req.body;
        const { Spanner } = require('@google-cloud/spanner')
        const [ result ] = await Company.findById(body.companyId);
        if (result && result.length > 0) {
            const company = result[0];
            const interval = body.timeInterval * 1000;
            const stock = fakeStockmarketgenerator.generateStockData(body.data).priceData;
            const sId = await Simulation.create(company.companyId);
            if (sId) {
                var i = 0;
                var intervalId = setInterval(async () => {
                    const stockData = {};
                    stockData.currentValue = Spanner.float(stock[i].price)
                    stockData.companyStockId = uuidv4();
                    stockData.companyId = body.companyId;
                    stockData.companyShortCode = company.companyShortCode;
                    stockData.shares = Spanner.float(randomInt(5, 30))
                    stockData.date = Spanner.float(new Date().getTime());
                    stockData.open = Spanner.float(randDec(5, 4000, 2))
                    stockData.volume = Spanner.float(randDec(30, 60, 2))
                    stockData.close = Spanner.float(randDec(5, 4000, 2))
                    stockData.dayHigh = Spanner.float(randDec(5, 4000, 2))
                    stockData.dayLow = Spanner.float(randDec(5, 4000, 2))
                    stockData.adjHigh = Spanner.float(randDec(5, 4000, 2))
                    stockData.adjLow = Spanner.float(randDec(5, 4000, 2))
                    stockData.adjClose = Spanner.float(randDec(5, 4000, 2))
                    stockData.adjOpen = Spanner.float(randDec(5, 4000, 2))
                    stockData.adjVolume = Spanner.float(randDec(5, 4000, 2))
                    stockData.timestamp = 'spanner.commit_timestamp()';
                    const simulation = await Simulation.findByCompanyId(body.companyId, sId);
                    if (simulation[0] && simulation[0].status) {
                        console.log('simulation created', 'loop count ' + i + ' companyId ' + body.companyId);
                        Company.createStockData(stockData);
                    } else {
                        console.log('simulation stopped', body.companyId);
                        clearInterval(intervalId)
                    }
                    if (i === (body.data - 1)) {
                        clearInterval(intervalId)
                    }
                    i++;
                }, interval);
                return res.status(200).json({ success: true, row: company });
            }
        }

    } catch (error) {
        return res.status(200).json({ success: true });
    }
}
const randDec = (min, max, decimalPlaces) => {
    const rand = Math.random() * (max - min) + min;
    const power = Math.pow(10, decimalPlaces);
    return Math.floor(rand * power) / power;
}

const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}




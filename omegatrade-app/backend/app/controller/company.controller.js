'use strict';
const Company = require('../models/company.model')
const { v4: uuidv4 } = require('uuid');

/**
 * Function to list all companies
 * @method GET
 */
exports.getList = async function (req, res) {
    try {
        await Company.getAll(function (err, data) {
            if (err)
                return res.json({ success: false, message: "Error occured while fetching all Company" });
            if (data) {
                return res.status(200).json({ success: true, data: data });
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error });
    }
};

/**
 * Function to create company
 * @method POST
 * @param {JSON} req contains request headers and payload companyName,companyShortCode,companyId,created_at
 */
exports.create = async function (req, res) {
    try {
        const body = req.body;
        const company = await Company.checkCompany(body.companyName, body.companyShortCode);
        if (company && company.length > 0) {
            return res.status(409).json({ success: false, message: "company already exists!" });
        } else {
            body.companyId = uuidv4();
            body.created_at = 'spanner.commit_timestamp()';
            await Company.create(body, function (err, data) {
                if (err) {
                    return res.json({ success: false, message: "Error occured while creating company" });
                }
                if (data) {
                    return res.status(200).json({ success: true, message: "company created successfully" });
                }
            });
        }
    } catch (error) {
        console.group(error);
        return res.status(500).json({ success: false, message: "Company Insertion Failed!" });
    }
};

/**
 * Function to update company
 * @method POST
 * @param {JSON} req contains request headers and payload companyName,companyShortCode,companyId,created_at and companyId
 */
exports.update = async function (req, res) {
    try {
        const body = req.body;
        const companyId = req.params.companyId
        if (body && companyId) {
            await Company.update(body, function (err, data) {
                if (err) {
                    return res.json({ success: false, message: "Error occured!" });
                }
                else {
                    return res.status(200).json({ success: true, message: "Company details updated sucessfully!" });
                }
            });
        } else {
            res.status(501).json({ success: false, message: "Invalid data" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Company updation Failed!" });
    }
}

/**
 * Function to Delete company
 * @method DELETE
 * @param {JSON} req contains request headers and request params companyId
 */
exports.delete = async function (req, res) {
    try {
        const companyId = req.params.companyId;
        await Company.delete(companyId, function (err, data) {
            if (err) {
                res.json({ success: false, message: "something went wrong!" });
            }
            if (data) {
                res.status(200).json({success: true,message: "company deleted!"});
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Company deletion failed!" });
    }
};


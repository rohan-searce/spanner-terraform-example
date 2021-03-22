const router = require('express').Router();
const SimulationController = require('../../controller/simulation.controller');
const validateToken = require('../../middlewares/jwt-auth.middleware').validateToken;

router.get('/list', validateToken, SimulationController.getList);
router.post('/create', validateToken, CompanyController.create);
router.delete('/delete/:companyId', validateToken, CompanyController.delete);
router.post('/update', validateToken, CompanyController.update);
module.exports = router;


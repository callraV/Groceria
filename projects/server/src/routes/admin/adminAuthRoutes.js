const express = require('express')
const { adminAuthController } = require('../../controllers')
const { check } = require('express-validator')
const router = express.Router()

router.post('/create', [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Email is not valid'),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  check('role').equals('Branch Admin').withMessage('Role is not valid'),
  check('store_name').notEmpty().withMessage('Store name is required'),
  check('store_location').notEmpty().withMessage('Store location is required'),
  check('longitude').isNumeric().withMessage('Longitude must be numeric'),
  check('latitude').isNumeric().withMessage('Latitude must be numeric')
], adminAuthController.createBranchAdmin)

module.exports = router
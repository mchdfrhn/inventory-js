const express = require('express');
const LocationController = require('../controllers/LocationController');
const validate = require('../middlewares/validate');
const {
  createLocationSchema,
  updateLocationSchema,
  paginationSchema,
} = require('../validations/schemas');

const router = express.Router();
const locationController = new LocationController();

// Create location
router.post(
  '/',
  validate(createLocationSchema),
  locationController.createLocation.bind(locationController)
);

// Update location
router.put(
  '/:id',
  validate(updateLocationSchema),
  locationController.updateLocation.bind(locationController)
);

// Delete location
router.delete(
  '/:id',
  locationController.deleteLocation.bind(locationController)
);

// Get location by ID
router.get(
  '/:id',
  locationController.getLocation.bind(locationController)
);

// Get location by code
router.get(
  '/code/:code',
  locationController.getLocationByCode.bind(locationController)
);

// Search locations
router.get(
  '/search',
  validate(paginationSchema, 'query'),
  locationController.searchLocations.bind(locationController)
);

// List locations (with pagination)
router.get(
  '/',
  validate(paginationSchema, 'query'),
  locationController.listLocations.bind(locationController)
);

module.exports = router;

const express = require('express');
const multer = require('multer');
const path = require('path');
const LocationController = require('../controllers/LocationController');
const validate = require('../middlewares/validate');
const {
  createLocationSchema,
  updateLocationSchema,
  paginationSchema,
  searchLocationSchema,
} = require('../validations/schemas');

const router = express.Router();
const locationController = new LocationController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Create location
router.post(
  '/',
  validate(createLocationSchema),
  locationController.createLocation.bind(locationController),
);

// Search locations (must come before /:id route)
router.get(
  '/search',
  validate(searchLocationSchema, 'query'),
  locationController.searchLocations.bind(locationController),
);

// Get location by code (must come before /:id route)
router.get(
  '/code/:code',
  locationController.getLocationByCode.bind(locationController),
);

// Update location
router.put(
  '/:id',
  validate(updateLocationSchema),
  locationController.updateLocation.bind(locationController),
);

// Delete location
router.delete(
  '/:id',
  locationController.deleteLocation.bind(locationController),
);

// Get location by ID
router.get(
  '/:id',
  locationController.getLocation.bind(locationController),
);

// List locations (with pagination)
router.get(
  '/',
  validate(paginationSchema, 'query'),
  locationController.listLocations.bind(locationController),
);

// Import locations from CSV
router.post(
  '/import',
  upload.single('file'),
  locationController.importLocations.bind(locationController),
);

module.exports = router;

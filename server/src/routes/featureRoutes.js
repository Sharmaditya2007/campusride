const express = require('express');
const router = express.Router();
const { getTimetable, updateTimetable, getCommuteGroups, createCommuteGroup, joinCommuteGroup, leaveCommuteGroup, getEnvironmentalImpact, submitReport } = require('../controllers/featureController');
const { protect } = require('../middleware/authMiddleware');

router.get('/timetable', protect, getTimetable);
router.put('/timetable', protect, updateTimetable);
router.get('/commute-groups', getCommuteGroups);
router.post('/commute-groups', protect, createCommuteGroup);
router.post('/commute-groups/:id/join', protect, joinCommuteGroup);
router.post('/commute-groups/:id/leave', protect, leaveCommuteGroup);
router.get('/environmental-impact', getEnvironmentalImpact);
router.post('/report', protect, submitReport);

module.exports = router;

const router = require('express').Router();
const {user} = require('../Controllers/createuser');
const {auth} = require('../Controllers/userAuth');

router.post('/users', user);
router.post('/auth', auth);

// Export the router to be used in the main app
module.exports = router;
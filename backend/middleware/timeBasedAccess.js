const accessControl = require('../config/accessControls');

module.exports = (req, res, next) => {
  const userAgent = req.headers['user-agent'];
  const isMobile = /mobile/i.test(userAgent);

  if (isMobile) {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)

    const { startHour, endHour, daysAllowed } = accessControl.mobile;

    if (
      currentHour < startHour || 
      currentHour >= endHour || 
      !daysAllowed.includes(currentDay)
    ) {
      return res.status(403).json({ message: 'Access restricted during this time for mobile devices' });
    }
  }

  next();
};

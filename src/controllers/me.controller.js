const meService = require("../services/me.service");

const getMe = async (req, res, next) => {
  try {
    res.json(await meService.getMe(req.user.id));
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    res.json(await meService.updateMe(req.user.id, req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await meService.changePassword(req.user.id, req.body ?? {});
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, changePassword };

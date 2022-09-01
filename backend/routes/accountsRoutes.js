const express = require("express");
const router = express.Router();
const cron = require("node-cron");
const {
  addAccount,
  updateAccount,
  getAccounts,
  loginAccount,
  loginOrderAccount,
  getPositions,
  getAllLoginAccounts,
  makeDefaultAccount,
  deleteAccount,
} = require("../controllers/accountsController");
const {
  requireSignin,
  authMiddleware,
} = require("../controllers/authControllers");

router.post("/addAccount", requireSignin, authMiddleware, addAccount);
router.post("/updateAccount/:id", requireSignin, authMiddleware, updateAccount);
router.post("/deleteAccount/:id", requireSignin, authMiddleware, deleteAccount);
router.post(
  "/makeDefault/:id",
  requireSignin,
  authMiddleware,
  makeDefaultAccount
);
router.get("/getAllAccounts/:id", requireSignin, authMiddleware, getAccounts);
router.get("/getAllLoginAccounts", getAllLoginAccounts);
router.get(
  "/loginAccount/:id",
  requireSignin,
  authMiddleware,
  loginAccount,
  loginOrderAccount
);
router.get("/getPositions/:id", requireSignin, authMiddleware, getPositions);

module.exports = router;

// loginOrderAccount()

// The time is in utc, 3:00AM in UTC is 8:30AM in IST
cron.schedule(`0 0 3 * * 1-5`, async () => {
  loginOrderAccount();
});

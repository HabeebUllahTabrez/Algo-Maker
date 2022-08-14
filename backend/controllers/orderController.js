const Order = require("../models/orders");

exports.getAllOrders = async (req, res) => {
  try {
    const id = req.params.id;
    const orders = await Order.find({ user: id });
    return res.json(orders);
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

exports.getTodaysOrders = async (req, res) => {
  try {
    const id = req.params.id;
    
    // access todays date
    const todaysDate = new Date();
    // set todays date to 12:00 midnight
    todaysDate.setHours(0, 0, 0, 0);
    
    const orders = await Order.find({
      user: id,
      createdAt: { $gt: todaysDate },
    });
    
    return res.json(orders);
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

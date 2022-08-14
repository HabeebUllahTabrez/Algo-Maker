const Trade = require("../models/trades");

exports.getAllTrades = async(req, res) => {
    try {
        const id = req.params.id;
        const trades = await Trade.find({account: id});
        return res.json({
            trades,
        });
    } catch (err) {
        return res.status(400).json({
            error: err,
        });
    }
}

exports.createTrade = async (req, res) => {
    const newTrade = Trade({
        instrument: req.body.instrument,
        product: req.body.product,
        t_type: req.body.t_type,
        order_type: req.body.order_type,
        price: req.body.price,
        overallQty: req.body.overallQty,
        account: req.body.account,
        status: req.body.status,
        time: req.body.time,
    })
    try {
        const savedTrade = await newTrade.save();
        res.json(savedTrade);
        
    } catch (err) {
        return res.status(400).json({
            error: err,
        });
    }
}

const firebase = require('firebase/app');


module.exports = (req, res, next) => {

    // if req contains proper authorization , forward request

  console.log( " isAuthenticated  Middleware => " , req.headers.authorization )
  if(req.headers.authorization == ""){
    next();
  }else{
    res.json({"message" : "Not Authenticated"});
  }

};

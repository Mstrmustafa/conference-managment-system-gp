const jwt = require('jsonwebtoken')

let verifyToken = (req,res,next)=>{
    const authHeader = req.headers.authorization

    if (authHeader){
        let token = authHeader.split(" ")[1]
      

        jwt.verify(token,process.env.JWT_SECRET, async (err,user)=>{
            if(err){
                res.status(403).json("Invalid Token")
            }

            req.user = user


            next()
        })
    }else {
        return res.status(401).json("You are not authenticated")
    }
}
module.exports = verifyToken
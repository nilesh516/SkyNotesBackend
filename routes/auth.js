const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "learningi$fun";

//ROUTE-1 :Create a user using : POST "/api/auth/createUser" .No authentication required
router.post('/createUser',[
    body('name').isLength({ min: 3 }),
    body('email','Enter a valid email ').isEmail(),
    body('password','Password must be atleast 5 characters').isLength({ min: 5 }),
] , 
async (req,res)=>{
    // if there are errors, return bad request and the errors.
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
    //check whether the user with the same email already exists 
   let user = await User.findOne({email:req.body.email});
   if(user){
    return res.status(400).json({success,error :"Sorry a user with the same email already exists "})
   }
   // Encrypting password using bcryptjs
   const salt = await bcrypt.genSalt(10);
   const secPass = await bcrypt.hash(req.body.password,salt);
   //create a new user
   user= await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      //creating webtoken for user
      const data = {
        user:{
            data : user.id
        }
      }
      const authtoken = jwt.sign(data,JWT_SECRET);
       success = true;
      res.json({success,authtoken});

    // res.json(user);
} catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server Error");
}

    
})


// ROUTE-2 :Authenticate a user using : POST "/api/auth/login" .No authentication required
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists(),

] , 
async (req,res)=>{
  // if there are errors, return bad request and the errors.
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    const {email , password} = req.body;
    try {
      let user =await User.findOne({email});
      if(!user){
        return res.status(400).json({success,error:"please try to login with correct credentials"});
      }
      //comparing the entered password with the  db hashed password
      const passwordCompare = await bcrypt.compare(password , user.password);
      if(!passwordCompare){
        return res.status(400).json({success,error:"please try to login with correct credentials"});

      }

      //creating webtoken for user
      const data = {
        user:{
            data : user.id
        }
      }
      const authtoken = jwt.sign(data,JWT_SECRET);
      success = true
      res.json({success,authtoken});
      
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server Error");
    }

})

//ROUTE-3 :Get logged in user Details using : POST "/api/auth/getuser" .Authentication required

router.post('/getuser', fetchuser, async (req,res)=>{
// if there are errors, return bad request and the errors.
  const errors = validationResult(req);
  // let success = false;
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

try {
  // sending the user data by filtering by id
 const userId = req.user.data;
  const user = await User.findById(userId).select("-password");
  res.send(user);
  
} catch (error) {
  console.log(error.message);
    res.status(500).send("Internal server Error");
}
})

module.exports = router
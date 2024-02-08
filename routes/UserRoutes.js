const express = require('express')
const userModel = require('../models/User')
const path = require('path');

//const app = express()
const router = express.Router();

//Search By username - PATH Parameter
//http://localhost:8081/users/username
router.get('/user/:username', async (req, res) => {
    const username = req.params.username
    const user = await userModel.find({username : username});
      
    try {
      if(user.length != 0){
        res.send(user);
      }else{
        res.send(JSON.stringify({status:false, message: "No user found"}))
      }
    } catch (err) {
      res.status(500).send(err);
    }
  });

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/signup.html'));
});

// Create new user
//http://localhost:8081/user
router.post('/signup', async (req, res) => {
    try {
        console.log(req.body);
        const user = new userModel(req.body);

        await user.save();

        res.send(user);
    } catch (error) {
        console.error('Error saving user:', error);

        if (error.name === 'ValidationError') {
            res.status(400).send({ error: 'Validation failed', details: error.errors });
        } else {
            res.status(500).send('Error saving user');
        }
    }
});

module.exports = router
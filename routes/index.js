var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Rest = require('./app/mong');

var url = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME || 'mongodb://127.0.0.1/test'

mongoose.connect(url, function(err) {
    if (err) {
      console.log("Mongo Error")
    };
});

/* GET home page. */
router.get('/mongodb', function(req, res, next) {
    res.render('main_mongo_demo', { title: 'MongoDb-jQuery-Node.js Calendar' });
});

router.get('/', function(req, res, next) {
    res.render('home');
});


//Updates the calendar with Update 
router.post('/calupdate', function(req, res){
   Rest.findOne ({_id: req.body.restaurant_id}, function(err, restor){      
      if(err){
           res.send('There was an error: ' + err)
        }else{      
           console.log(req.body.restaurant_id + " " + restor.name)       
          res.json(restor.reservation); 
       }      
    });  
});


// Save calendar events
router.post('/calupdate/save', function(req, res){
    Rest.findOne({_id: req.body.restID}, 
    function(err, restor){
        if (err) {res.send(err)
          }else{
            var dat = req.body; 
            delete dat.restID;  
            restor.reservation.push(dat);
            restor.save(function (err) {
                if (err)
                    res.send(err);
                res.send("Your Date was successfully saved");
                console.log("successfully saved");  
            })
          }
 
 
   
    });
    
});

//Delete Calendar Events
router.post('/calupdate/delete', function(req, res){
    Rest.findOne({_id: req.body.restID}, 
    function(err, restor){
        if (err) {res.send(err)
          }else{
             
            for(i=0; i< req.body.eventID.length; i++){ 
                restor.reservation.pull(req.body.eventID[i])
            }
            restor.save(function (err) {
                if (err)
                    res.send(err);
                res.send("Your Date/s were succesfully removed");
                console.log("successfully erased");  
            })
          }
 
 
   
    });
});



//Get restaurant by ID 
router.get('/api/:res_id', function(req, res, next) {  
    console.log(req.params.res_id)
    Rest.findById(req.params.res_id, function(err, bear) {
        if (err){
            res.send('Error ist: ' + err)}else{  
        res.json(bear)};
    })
});


//delete Restaurant
router.delete('/api/:res_id', function(req, res, next) {  
  Rest.remove({_id: req.params.res_id}, function (err, bear) {
      if (err){res.send('Error ist' + err)
    }else{
        res.send("Restaurant was succesfully removed")
    };
    })
});
    
    
//Direct search from Input        
router.post('/search', function(req, res){
  var sear = new RegExp(req.body.name, "i", "m");
      var query = Rest.find({name : sear}).limit(20);
        query.exec(function (err, person) {
            if (err) {
                res.send(err);
            } else {
              res.send(person)  
            }
        })  
});




// Restaurant Save
router.post('/api/saverest', function(req, res) {
    if (req.body.restName == undefined || req.body.restAddress == undefined || req.body.restCuisine == undefined) {
        res.send('<b>Restaurant NOT saved</b>')
    } else {
        var resta = new Rest({
            name : req.body.restName,
            borough: "Hell",
            address: {building: "123", coord: [], street : req.body.restAddress, zipcode : "123"},
            cuisine :  req.body.restCuisine,
            grades: [],
            restaurant_id : ""  
            });
        
        resta.save(function(err){
            if (err){
                res.send(err)}
            else{
            res.send("Your restaurant was added");
            }
        });
   
    }

})



module.exports = router;

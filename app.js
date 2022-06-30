//Bring in required files

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv/config');
const multer = require('multer');
//connect to the database

mongoose.connect(process.env.MONGO_URL,
	{ useNewUrlParser: true, useUnifiedTopology: true }, err => {
		console.log('connected')
	});

// Step 3 - code was added to ./models.js

// Step 4 - set up EJS

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'))
// Set EJS as templating engine
app.set("view engine", "ejs");


// Step 5 - set up multer for storing uploaded files

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

var upload = multer({ storage: storage });
// Step 6 - load the mongoose model for Image

var imgModel = require('./model');


app.get('/', (req, res)=>{
    imgModel.find({}, (err, items) =>{
        if(err){
            console.log(err);
            res.status(500).send('Error occured', err);
        }
        else{
            res.render('imagesPage', {items: items});
        }
    })
})

// Step 8 - the POST handler for processing the uploaded file

app.post('/', upload.single('image'), (req, res, next) => {

	var obj = {
		name: req.body.name,
		desc: req.body.desc,
		img: {
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
			contentType: 'image/png'
		}
	}
	imgModel.create(obj, (err, item) => {
		if (err) {
			console.log(err);
		}
		else {
			// item.save();
			res.redirect('/');
		}
	});
});


app.post('/delete', (req, res)=>{
    imgModel.findByIdAndDelete(req.body.btn, (err, docs)=> {
        if (err){
            console.log(err);
        }
        else{
            console.log(`Deleted the item with id${req.body.btn}`);
            
            res.redirect('/');
        }
    });
})

app.post('/edit', (req, res)=>{
    imgModel.findByIdAndUpdate(req.body.itemId, { name: req.body.newName, desc: req.body.newDes },
    (err)=> {
        if (err){
            console.log(err)
        }
        else {
            console.log("Item edited");
            res.redirect('/');
        }
});
})

// Step 9 - configure the server's port

var port = process.env.PORT || '3000'
app.listen(port, err => {
	if (err)
		throw err
	console.log('Server listening on port', port)
})


const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const crypto = require('crypto');
const gridfsstorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const bodyparser = require('body-parser');
const mongodb = require('mongoose');
// init app varisabrl
const app = express();
const port = 3333;

app.use(bodyparser.json());
app.use(methodOverride('_method'))
// mongo connection

mongodb.Promise = global.Promise;
// connect to mongoose
mongodb
    .connect('mongodb://localhost/vidjot-dev', {
        useNewUrlParser: true
    })
    .then(() => {
        console.log('mogodb_connect');
    })
    .catch(err => {
        console.log(err);
    });

// init gfs
let gfs;
//setup ejs
app.set('view engine', 'ejs');
//setup public folder
app.use(express.static('./public'));
// set storage function / container
const stoarage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// init upload
const upload = multer({
    storage: stoarage, // this is storage engin variable
    limits: {
        fileSize: 8000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myImg') //myImg is name attribte in input

app.get('/', (req, res) => {
    res.render('index');
});
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('index', {
                msg: err
            });
        } else {
            if (req.file === undefined) {
                res.render('index', {
                    msg: "Error No File Seledcted"
                });
            } else {
                res.render('index', {
                    msg: "File Uplaoad Successfully",
                    file: `uploads/${req.file.filename}`
                });
            }


        }
    });
});

// function check file type
function checkFileType(file, cb) {
    // allowed extension
    const filetypes = /jpeg|jpg|png|gif/;
    //check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    //check mime type
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);

    } else {
        cb('MulterError:Images Only');
    }
}


app.listen(port, () => {
    console.log('app running on Port' + port);
});
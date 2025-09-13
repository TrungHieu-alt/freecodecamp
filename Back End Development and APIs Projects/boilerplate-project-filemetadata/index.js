var express = require('express');
var cors = require('cors');
const multer = require('multer');
require('dotenv').config()
var app = express();
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "upload/");
  },
  filename: function(req, file, cb){
    const convertedName = Buffer.from(file.originalname, "latin1").toString("utf-8");
    cb(null,convertedName);
  }
})
const upload = multer({storage: storage});
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', upload.single("upfile"), function(req,res){
  console.log(req.file);
  return res.json({
    name: req.file.filename,
    type: req.file.mimetype,
    size: req.file.size
  });
})


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});

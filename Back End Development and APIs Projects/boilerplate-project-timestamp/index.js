// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

function isUnixTimestamp(str) {
  return /^\d{10}$/.test(str) || /^\d{13}$/.test(str);
}

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api", (req, res) => {
  const now = new Date();
  res.json({ unix: now.getTime(), utc: now.toUTCString() });
});


app.get("/api/:date", function(req,res) {
  let dateString = req.params.date;
  let date;
  let unix;
  if (isUnixTimestamp(dateString)) {
    unix = Number(dateString);
    if (dateString.length === 10) unix *= 1000;
    date = new Date(unix).toUTCString();
  }
  else {
    let dateObject = new Date(dateString);
    if (isNaN(dateObject.getTime())) {
    return res.json({ error: "Invalid Date" });
}
    date = dateObject.toUTCString();
    unix = dateObject.getTime();
  }
  res.json({"unix": unix, "utc": date});
})


// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

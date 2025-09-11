require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { urlencoded } = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const mapper = [];
let counter = 0;
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(urlencoded({extended: false}));

app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  if(!isValidUrl(url)) {
    return res.json({error: "invalid url" });
  }
  const id = counter;
  mapper[id] = url;    
  counter ++;
  return res.json({
    original_url: url,
    short_url: id
  });
})

app.get('/api/shorturl/:id', function(req,res){
  const id = req.params.id;
  let url = mapper[id];
  if (!url) {
    return res.status(404).json({ error: "No short URL found" });
  }
  return res.redirect(url);
});

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

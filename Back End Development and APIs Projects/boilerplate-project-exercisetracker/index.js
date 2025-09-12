const express = require('express')
const app = express()
const cors = require('cors')
const {urlencoded} = require('body-parser')
const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect('mongodb://127.0.0.1:27017/local', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

const users = [];
let counter = 0;
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true}
})
const User = mongoose.model("User", UserSchema);

const ExerciseSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: {type: Date, required: true},
})

const Exercise = mongoose.model("Exercise", ExerciseSchema);

async function addUser(username) {
  const user = new User({ username });
  const savedUser = await user.save();
  return savedUser;
}


async function addExercise(userId, description, duration, date) {
  const exercise = new Exercise({ userId, description, duration, date });
  const savedExercise = await exercise.save();
  return savedExercise;
}
app.use(express.json());

app.use(urlencoded({extended: false}));

app.get('/api/users', async function(req,res) {
  const users = await User.find().select("_id username");
  return res.json(users);
})

app.post('/api/users', async function(req, res) {
  const username = req.body.username;
  const savedUser = await addUser(username);
  return res.json({
  username: username,
  _id: savedUser._id
  });
});

app.post('/api/users/:_id/exercises', async function(req,res){
  const id = req.params._id;
  const user = await User.findById(id);
  if(!user) {
    return res.status(404).json({err: "User not found "});
  }
  const{description, duration, date} = req.body;
  const exerciseDate = date ? new Date(date) : new Date();
    const savedExercise = await addExercise(
    user.id,
    description,
    Number(duration), // convert duration từ string sang số
    exerciseDate
  );
  return res.json({
    _id: id,
    username: user.username,
    date: exerciseDate.toDateString(),
    duration: Number(duration),
    description,
  })
}); 

app.get('/api/users/:_id/logs', async function(req,res){
  const _id = req.params._id;
  const { from, to, limit } = req.query;

  const user = await User.findById(_id);
  if (!user) return res.status(404).json({ error: "User not found" });
  let userId = user._id;

    let filter = { userId: userId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    
    let query = Exercise.find(filter).select("description duration date -_id");
    if (limit) query = query.limit(Number(limit));

    const exercises = await query.exec();
    return  res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id,
      log: exercises.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
      }))
    });
} )


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

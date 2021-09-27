const express = require('express')
const app = express()
const cors = require('cors')
const db = require('mongodb')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Schemas and models
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true }
})
const User = mongoose.model('user', UserSchema)

const exerciseLogSchema = new mongoose.Schema({
  userId: String,
  description: String,
  duration: Number,
  date: String
})
const Exercise = mongoose.model('exercise', exerciseLogSchema)

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const requestedUsername = req.body.username
  const newUser = new User({
    username: requestedUsername
  })

  newUser.save((err, data) => {
    if (err) return console.error(err)
    const userJson = {
      username: data.username,
      _id: data._id
    }
    res.json(userJson)
  })
})

app.get('/api/users', (req, res) => {
  User.find({}, '-log', (err, data) => {
    if (err) return console.error(err)
    res.json(data)
  })
})

app.post('/api/users/:_id/exercises', (req, res) => {
  /* POST form data description, duration and optionally date.
   If no date supplied current date will be used */
  const { userId, description, duration, date } = req.body
  const dateObj = date === undefined ? new Date() : new Date(date)
  const dateStr = dateObj.toDateString()

  const newExercise = new Exercise({
    userId: req.params._id,
    description: description,
    duration: duration,
    date: dateStr
  })
  console.log(newExercise)
  console.log(dateStr)

  let id = req.params._id
  User.findById(id, (err, userData) => {
    if (err) return console.error(err)
    newExercise.save((err, exerciseData) => {
      if (err) return console.error(err)
      console.log('Document Saved Succesfuly')
      let newExerciseJson = {
        _id: id,
        username: userData.username,
        date: exerciseData.date,
        duration: exerciseData.duration,
        description: exerciseData.description
      }
      // console.log(newExerciseJson)
      res.json(newExerciseJson)
    })
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  let id = { _id: req.params._id }
  User.findOne(id, '-__v', (err, userData) => {
    if (err) return console.error(err)
    Exercise.find({ userId: id }, '-_id -userId -__v', (err, exerciseData) => {
      console.log(exerciseData.date)
      let exerciseJson = {
        _id: userData._id,
        username: userData.username,
        count: exerciseData.length,
        log: exerciseData
      }
      res.json(exerciseJson)
    })
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

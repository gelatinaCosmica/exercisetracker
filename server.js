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
  username: String,
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: Date
  }]
})
const User = mongoose.model('user', UserSchema)

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
  // let id = { _id: req.params._id }
  // // let newActivity = [
  // //   log:
  // // ]
  // User.findById(id, (err, data) => {
  //   if (err) return console.error(err)
  //   console.log(data)
  // })

  // response will be the user object with the exercise fields added
})

app.get('/api/users/:_id/logs', (req, res) => {
  let id = { _id: req.params._id }
  User.findById(id, '-__v', (err, data) => {
    if (err) return console.error(err)
    res.json(data)
  })

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

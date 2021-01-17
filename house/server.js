const express = require('express')
const app = express(); ///server;
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.static('public'));
app.use(bodyParser.json());


const mongoose = require('mongoose'); //npm i mongoose
const url = 'mongodb+srv://KatyaRu:qHO9SxoCGZc6lv7C@cluster0.mfqlq.mongodb.net/test'

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}); //connectin to the db

const user = mongoose.model('user', { //collection
  name: String, //with big letter !!!
  password: Number,
  role: String,
  assignRoom: String
});


const Shneor = new user({
  name: "Shneor",
  password: "123",
  role: "admin",
  assignRoom: "assignRoom1"
})
// Shneor.save().then(doc => console.log(doc)).catch(e => {
//     console.log(e)
// })

const Dudi = new user({
  name: "Dudi",
  password: "456",
  role: "child",
  assignRoom: "assignRoom1"
})
const Lior = new user({
  name: "Lior",
  password: "789",
  role: "child",
  assignRoom: "assignRoom1"
})
const Katya = new user({
  name: "Katya",
  password: "159",
  role: "guest",
  assignRoom: "assignRoom1"
})


// weather

app.post('/weather', (req, res) => {
  const {
    city
  } = req.body;

  console.log(city)

  fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=84dda819f36a2f81e3babdb748579c85`)
    .then(r => r.json())
    .then(weather => {
      res.send({
        ok: true,
        weather
      })
    })
})

// user validation
let users = [{
  userName: "ori",
  password: "1111"
}]
let saveduserName;

app.post("/login", (req, res) => {
  let {
    userName
  } = req.body;
  let {
    password
  } = req.body;
  let validation = false;

  users.forEach((e) => {
    if (user.find({
        name: userName,
        password: password

      }, function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log("First function call : ", docs);
          console.log(docs[0].name);
          if (docs[0].name == userName && docs[0].password == password) {
            validation = true
          } else {
            validation = false
            console.log(`Sorry ${e.userName} doesn't exist`);
          }
          console.log(validation)
        }
      })) {}
  });

  if (validation) {
    res.cookie("User validated", userName, {
      maxAge: 30000,
      httpOnly: true
    });

  }

  res.send({
    validation
  });
});

// app.get("/get-userName", (req, res) => {
//   res.send({ saveduserName });
// });

// app.get("/check-valid", (req, res) => {
//   let validation = true;
//   const checkCookie = req.cookies.validated;
//   if (checkCookie == false) {
//     validation = false;
//   }
//   res.send({ validation });
// });



const PORT = 3030;
app.listen(PORT, () => {
  console.log(`RUNNING: ${PORT}`)
})
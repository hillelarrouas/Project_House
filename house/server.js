const express = require('express')
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const { check } = require('express-validator')
const { validationResult } = require('express-validator')
const secret = 'SECRET_KEY_RANDOM'
const generateAccessToken = (user) => {
    const payload = {
        user,
        role: user.role
    }
    return jwt.sign(payload, secret, { expiresIn: '24h' })
}
const app = express(); ///server;

app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json());

// saltRounds means - 
const saltRounds = 7;

//-----------mongoose----------//
const mongoose = require('mongoose'); //npm i mongoose
const url = 'mongodb+srv://KatyaRu:qHO9SxoCGZc6lv7C@cluster0.mfqlq.mongodb.net/test'

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: false,
    useCreateIndex: true
}).then(() => console.log("DB CONNECTION SUCCESSFUL")); //connectin to the db

//-----MODELS------//
const User = mongoose.model('User', {
    username: {
        type: String,
        unique: true,
        required: [true, "To register you must enter username"],
        trim: true
    }, //with big letter !!!
    email: {
        type: String,
        unique: true,
        required: [true, "To register you must enter Email"],
        trim: true,
    },
    password: {
        type: String,
        required: [true, "To register you must enter password"],
        trim: true
    },
    role: {
        type: String,
        default: "admin",
    },
    assignRooms: {
        type: [String],
    }
});

const Room = mongoose.model("Room", {
    roomName: {
        type: String,
        unique: true,
        required: true,
    },
    notes: {
        type: [String],
    },
});

// ---------ADMIN-----------//
isAdmin = (req, res, next) => {
    res.authorized = false;
    const {
        role
    } = req.cookies;


    if (role === 'admin') {
        res.authorized = true;
        console.log(res.authorized)
    }

    next()
}

const getUserAuthMiddle = (req, res, next) => {
    jwt.verify(req.cookies['token'], secret, (err, decodedToken) => {
        req.user = decodedToken;

        next()
    })
}

// Client Routes
// app.get("/", (req, res) => {
//     res.sendile(path.join(__dirname + "/public/index.html"));
// });

// app.get("/rooms", (req, res) => {
//     res.sendFile(path.join(__dirname + "/public/rooms.html"));
// });


// Get all users
app.get("/api/users", async(req, res) => {
    try {
        const users = await User.find();
        res.status(200).send({
            users
        });
    } catch (err) {
        res.status(404).send({
            err
        });
    }
});

// Get user by id
app.get("/api/users/:id", async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).send({
            user
        });
    } catch (err) {
        res.status(404).send({
            err
        });
    }
});

// delete user by id
app.delete("/api/users/:id", async(req, res) => {
    try {
        const user = await User.findOneAndDelete(req.params.id);
        res.status(200).send({
            user
        });
    } catch (err) {
        res.status(404).send({
            err
        });
    }
});

// update user by id
app.patch("/api/users/:id", async(req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(201).send({
            user
        });
    } catch (err) {
        res.status(400).send({
            err
        });
    }
});

//----------LOGIN-------------//
app.post("/api/login", async(req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        const user = await User.findOne({
            username
        });
        if (!user) {
            return res.status(400).json({
                message: 'User is not found'
            })
        }

        const validPassword = bcrypt.compareSync(password, user.password)
        console.log(validPassword)
        if (!validPassword) {
            return res.status(400).json({
                message: 'invalid password'
            })
        }

        const token = generateAccessToken(user)
        console.log(token)
        res.cookie("token", token, {
            maxAge: 1500000,
            httpOnly: false,
        });
        console.log(user.role)
        if (user.role == 'admin') {
            return res.json({
                status: 'allowed2'
            })
        }
        if (user.role == 'child') {
            return res.json({
                status: 'allowed1'
            })
        }



    } catch (e) {
        console.log(e)
        res.status(400).json({
            message: 'Login error'
        })
    }

});

//-------------CREATE ACCOUNT-----------//
app.post("/api/register", [
    check('username', 'Username cannot be empty').notEmpty(), check('email', 'Invalid email').isEmail(),
    check('password', 'Password must be at least 3 - 10 characters').isLength({
        min: 3,
        max: 10
    })
], async(req, res) => {
    const errors = validationResult(req)
    console.log(errors)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: `${errors.errors[0].msg}`,
            errors
        })

    }
    console.log("errors:", errors)
    const newUser = new User(req.body);
    console.log(newUser)
    const checkPassword = req.body.checkPassword
    console.log('check:', checkPassword)
    if (newUser.password !== checkPassword) {
        return res.status(400).json({
            message: 'Password does not match'
        })
    }
    bcrypt.hash(newUser.password, saltRounds, async(err, hash) => {
        try {
            console.log('hash:', hash)
            newUser.password = hash;
            await newUser.save();
            console.log(newUser._id)
            const token = generateAccessToken(newUser._id, newUser.role)
            console.log("token:", token)
            res.cookie("token", token, {
                maxAge: 1500000,
                httpOnly: true,
            });
            res.send({
                message: 'user registered successfully'
            });
        } catch (e) {
            console.log(e);
            res.send({
                message: 'Registration error'
            });
            res.end();
        }
    });

})


//-----------------------------ROOM FUNCTIONS------------------------------------//


//-------------GET ALL ROOMS--------------//

app.get('/allrooms', async(req, res) => {
  /*   try { */
        const rooms = await Room.find({});
        console.log(rooms)
        res.status(200).send({
            rooms
        });
   /*  } catch (error) {
        res.status(404).send({ error });
    } */
});



//-------------CREATE ROOM--------------//
app.post("/api/room", async(req, res) => {
    // const { roomName } = req.body
    try {
        const newRoom = new Room(req.body);
        console.log('newRoom:', newRoom)
        await newRoom.save();
        res.status(201).send({ newRoom });
        console.log('newRoom:', newRoom)
        console.log(newRoom.id)
    } catch (error) {
        res.status(404).send({ error });
    }
});

//-----DELETE ROOM-------//

app.delete("/api/deleteroom", async(req, res) => {
    try {
        const {roomId} = req.body
        console.log(roomId)
        await Room.findByIdAndDelete(roomId)
        res.status(200).send({ status: "deleted" }); 
    } catch (error) {
        res.status(404).send({ error });
    }
});

//-----CREATE TASK-------//

app.post("/api/notes", async(req, res) => {
    
    try {
        const {createTask,roomId} = req.body
        console.log(roomId, createTask)
        await Room.findByIdAndUpdate(roomId, {$push: {notes: createTask}})
        res.status(200).send({ status: "update" });
    } catch (error) {
        res.status(404).send({ error });
    }
}); 
 
//-----DELETE TASK-------//

app.delete("/api/deletenotes", async(req, res) => {
    try {
        const {deleteTask,roomId} = req.body
        console.log(roomId, deleteTask)
        await Room.findByIdAndUpdate(roomId, {$pull: {notes: deleteTask}})
        res.status(200).send({ status: "deleted" }); 
    } catch (error) {
        res.status(404).send({ error });
    }
});


//----------FIND ROOM----------//
app.get("/room", async(req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).send({ rooms });
    } catch (err) {
        res.status(404).send({ err });
    }
});

//-------------DELETE ROOM--------------//
app.delete("/api/room", async(req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.status(200).send({ status: "deleted" });
    } catch (error) {
        res.status(404).send({ error });
    }
});

//-------------UPDATE ROOM--------------//
app.patch("/room", async(req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(201).send({ rooms });
    } catch (err) {
        res.status(400).send({ err });
    }
});

//-------------ROOM INFO--------------//
app.get("/api/room/:id", async(req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        res.status(200).send({
            room,
        });
    } catch (error) {
        res.status(404).send({ error });
    }
});



//---------ONLOAD-------------//
app.post("/api/onload", getUserAuthMiddle, async(req, res) => {
    try {
        const assignedRooms = req.user.user.assignRooms;
        let rooms = [];
        for (const roomId of assignedRooms) {
            let roomFromDb = await Room.findById(roomId);
            rooms.push(roomFromDb);
        }
        res.send({ rooms })

    } catch (err) {
        res.status(404).send({ err });
    }

});

isUser = (req, res, next) => {
    // res.authorized = false;
    // const {
    //     role
    // } = req.cookies;


    res.user = req.cookies;

    next()
}

//-------------WEATHER-----------//
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

const PORT = 3030;
app.listen(PORT, () => {
    console.log(`RUNNING: ${PORT}`)
})
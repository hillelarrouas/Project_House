//---------CORRECT TIME-------//
function getTime() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    let time = `${hours}:${minutes}:${seconds}`;
    document.getElementById('correctTime').innerHTML = time;
}
setInterval(getTime, 0);

//---------CORRECT DATE---------//
function getDate() {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear()

    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }

    let dateToday = `${day}/${month}/${year}`
    document.getElementById('correctDate').innerHTML = dateToday

}
setInterval(getDate, 0)

//-----CREATE ROOM-------//

function getAllRooms(rooms) {
let display = ''
    fetch('/allrooms')
        .then(r => r.json())
        .then(data => {
          
            data.rooms.forEach(room => {
                const listTasks = room.notes.map((task) => `<div>${task}<input type="radio"><button id="${room._id}" name="${task}" onclick="handleDeleteTask(event)">delete</button></div>`).join(' ')
               
                display += `<div class="huina"><h3>${room.roomName}</h3><form id="${room._id}" onsubmit='handleAddTask(event)'>
                <input class="newTask" type='text' placeholder="add task" name='newTask' required>
                <input type="submit" value="add task">
            </form> 
                         <div>${listTasks}</div></div>`
                
            
           
            })
            document.getElementById('putRoom').innerHTML = display
        })
        
}



/* function writeToDome(){

} */

function hendleCreateRoom(e) {
    e.preventDefault() 
    const roomName = e.target.children.roomName.value
    const room = document.getElementById('putRoom')

    console.log(roomName) //for check

    fetch('/api/room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomName
            })
        }).then(r => r.json())
        .then(data => {
            console.log(data.newRoom._id)
            console.log(data.newRoom.roomName)
            room.innerHTML += `<div class="huina" name='${data.newRoom._id}'><h3>${data.newRoom.roomName}</h3><form id="${data.newRoom._id}" onsubmit='handleAddTask(event)'>
            <input id="newTask" type='text' placeholder="add task" name='newTask' required>
            <input type="submit" value="add task">
        </form> 
                     <div>${data.notes}</div></div>`
        })
}


//-----CREATE TASK-------//
function handleAddTask(e) {
    e.preventDefault()
    const createTask = e.target.children.newTask.value
    const roomId = e.target.id
    console.log('roomId:', roomId)
    const newTask = document.getElementById('newTask')
    const rooms = document.getElementById('putRoom')

    console.log(createTask) 

    fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                createTask,
                roomId
            })
        }).then(r => r.json())
        .then(data => {
            console.log(data)
            getAllRooms()
          
        }) 
     } 


//-----DELETE TASK-------//

function handleDeleteTask(e) {
    e.preventDefault()
    const roomId = e.target.id
    const deleteTask = e.target.name
    const rooms = document.getElementById('putRoom')

    fetch('/api/deletenotes', {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                deleteTask,
                roomId
            })
        }).then(r => r.json())
        .then(data => {
            console.log(data)
            getAllRooms()
          
        })  
     } 


document.addEventListener('DOMContentLoaded', getAllRooms())

// //--------DELETE ROOMS----------//
// // const roomName = event.target.dataset.id

// fetch('/api/room', {
//         method: 'delete',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             roomName
//         })
//     }).then(r => r.json())
//     .then(data => {
//         console.log(data)
//     })

// //--------UPDATE ROOM----------//
// fetch('/api/room', {
//         method: 'patch',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             roomName
//         })
//     }).then(r => r.json())
//     .then(data => {
//         console.log(data)
//     })

//---------ONLOAD----------//
/* function allrooms() {
    fetch('/api/onload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomName
            })
        }).then(r => r.json())
        .then(data => {
            console.log(data)
            setRoomsOnPage(data.rooms)
                // console.log(data.newRoom.roomName)
        })
}

const setRoomsOnPage = (rooms) => {
    const roomsToShow = rooms.map((room) => `<p>${room.roomName}</p>`)
    console.log(rooms)
    document.getElementById('putRoom').innerHTML = roomsToShow.join(' ');

} */
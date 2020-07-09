const socket = io.connect(
    ['http://localhost:8080', 'https://book-chat.herokuapp.com/'][1]
)

// Message html
const textarea = document.getElementById('textarea')
const output = document.getElementById('chatMessages')
const button = document.getElementById('send')
const feedback = document.getElementById('feedback')
const typingUsername = document.getElementById('chatHeader')

// Users
const usersList = document.getElementById('users-list')

let username // = undefined

// Kopplat till användaren --------------------------
document.addEventListener('DOMContentLoaded', (e) => {
    username = document.getElementById('chatHeader').textContent
    socket.emit('new user', username, function (data) {
        console.log(data)
    })
})

socket.on('usernames', function (data) {
    const newline = '\r\n'
    console.log('nick Array', data)
    let userString = ''
    for (let i = 0; i < data.length; i++) {
        userString += data[i] + newline
    }
    usersList.textContent = userString
})

// Kopplat till meddelanden ------------------------
function isValidMessage(messageText) {
    return messageText !== ''
}

textarea.addEventListener('keydown', (e) => {
    const ENTER = 13
    if (e.keyCode === ENTER) {
        // Vanligtvis infogas en ny rad när man trycker Enter i ett textfält,
        // men det vill jag och förhindra i detta fall.
        e.preventDefault()
        sendMessage()
    }
})

button.addEventListener('click', sendMessage)

function smileyFace(string) {
    return string
        .replace(':)', '😊')
        .replace(":'(", '😢')
        .replace(':(', '😞')
        .replace(":')", '😂')
}

socket.on('new message', (data) => {
    const span = document.createElement('span')
    const time = new Date()

    span.textContent =
        ' ' +
        time.getHours() +
        ':' +
        (time.getMinutes() < 10 ? '0' : '') +
        time.getMinutes() +
        ':'
    span.className = 'time'

    const li = document.createElement('li')

    const messageStyle = document.createElement('div')
    messageStyle.textContent = smileyFace(data.message)
    messageStyle.className = 'messageStyle'

    li.textContent = data.nickname
    li.appendChild(span)
    span.appendChild(messageStyle)
    output.appendChild(li)

    // Scroll all the way to the bottom where the latest messages are
    let list = document.getElementById('message-list')
    list.scrollTop = list.scrollHeight
})

function sendMessage() {
    const messageText = textarea.value

    // Om meddelande-texten inte är giltig så stannar vi här.
    // Det finns ingen mening med att skicka en tom sträng.
    if (!isValidMessage(messageText)) {
        return
    }

    socket.emit('send message', {
        nickname: username,
        message: messageText,
    })
    textarea.value = ''
}

// textarea.addEventListener('keypress', function () {
//   socket.emit('typing', typingUsername.textContent)
// })
// socket.on('typing', (data) => {
//   console.log(data)

//   feedback.textContent = '...' + data + ' is typing'
// })

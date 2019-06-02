const socket = io();

// DOM ELEMENTS
const $messagesDiv = document.querySelector('div[id="messages"]');
const $sendMessageForm = document.querySelector('form[id="form-message"]');
const $sendMessageFormMessageInput = $sendMessageForm.querySelector('input[name="message"]');
const $sendMessageFormButton = $sendMessageForm.querySelector('button');
const $sendLocationButton = document.querySelector('button[id="send-location"]');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // New message element
    const $newMessage = $messagesDiv.lastElementChild;

    // height of the last message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messagesDiv.offsetHeight;

    // Height of messages contianer
    const containerHeight = $messagesDiv.scrollHeight;

    // How far have i scroll
    const scrollOffset = $messagesDiv.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        console.log("here")
        $messagesDiv.scrollTop = containerHeight;
    }
};

// Template builders
const addMessage = (author, message, createdAt) => {
    const html = Mustache.render(messageTemplate, {
        author, 
        message,
        createdAt: moment(createdAt).format('DD/MM/YYYY hh:mm a')
    });

    $messagesDiv.insertAdjacentHTML('beforeend', html);
    autoScroll();
};

const addLocationMessage = (author, locationLink, createdAt) => {
    const html = Mustache.render(locationMessageTemplate, {
        author, 
        locationLink,
        createdAt: moment(createdAt).format('DD/MM/YYYY hh:mm a')
    });

    $messagesDiv.insertAdjacentHTML('beforeend', html);
    autoScroll();
};

const addSidebar = (room, users) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });

    document.querySelector('#sidebar').innerHTML = html;
};

// DOM Events
$sendMessageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!socket) {
        return alert('You should connect first');
    }

    $sendMessageFormButton.setAttribute('disabled', 'disabled');

    let message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        if (error)
            alert(error);

        $sendMessageFormButton.removeAttribute('disabled');
        $sendMessageFormMessageInput.value = '';
        $sendMessageFormMessageInput.focus();
    });
});

$sendLocationButton.addEventListener('click', () => {
    if (!socket) {
        return alert('You should connect first');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');

    if (!navigator.geolocation) {
        return alert("Your browser do not support geolocation");
    }

    navigator.geolocation.getCurrentPosition((position) => {
        let { latitude, longitude } = position.coords;
        socket.emit('sendPosition', { latitude, longitude }, () => {
            alert('Location shared!!');
            $sendLocationButton.removeAttribute('disabled');
        });
    });
});

// Login
socket.emit('join', { username, room }, (error) => {
    // Error handler
    if(error) {
        alert(error)
        location.href = '/';
    }
});

// Sockets HANDLERS
socket.on('message', ({ author, message, createdAt }) => {
    addMessage(author, message, createdAt)
});

socket.on('locationMessage', ({ author, locationLink, createdAt }) => {
    addLocationMessage(author, locationLink, createdAt)
});

socket.on('updateUsersInRoom', ({ users, room }) => {
    console.log(room, users)
    addSidebar(room, users);
});
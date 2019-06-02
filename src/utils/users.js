const users = [];

const addUser = ({id, username, room}) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the signin inputs
    if ((!username) || (!room)) {
        return {
            error: 'Username and Room are required'
        };
    }

    // Check if this username is alread taken
    const isNotUnique = users.find((user) =>  ((user.username === username) && (user.room === room)))
    
    if (isNotUnique) {
        return {
            error: 'Username is in use'
        };
    }

    // Populate users array
    const user = { id, username, room };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
        return {
            error: 'User not found'
        };
    }
    return users.splice(userIndex, 1)[0];
};

const getUser = (id) => {
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
        return {
            error: 'User not found'
        };
    }
    return users[userIndex];
};

const getUsersInRoom = (room) => {
    return {
        users: usersInRoom = users.filter((user) => user.room === room),
        room
    };
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
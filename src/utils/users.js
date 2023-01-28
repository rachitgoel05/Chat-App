const users=[]

const addUser = ({ id, username, room }) => {
    username = username.toLowerCase().trim()
    room = room.toLowerCase().trim()

    if( !username || !room ){
        return {
            error:'Username or room is required'
        }
    }

    const existingUser = users.find((user)=>{
        return user.username === username && user.room === room
    })
    
    if(existingUser){
        return {
            error:'Username already in use'
        }
    }
    const user = {id, username, room}
    users.push(user)
    return { user }
}
const removeUser = (id) => {

    const existingUserId = users.findIndex((user)=> user.id == id )
    if( existingUserId !== -1 ){
        return users.splice(existingUserId, 1)[0]
    }
}
const getUser = (id) =>{
    const existingUserId = users.findIndex((user)=> user.id === id )
    if( existingUserId !== -1 ){
        return users[existingUserId]
    }
}
const getUserInRoom = (room) => {
    room = room.toLowerCase().trim()
    const existingUser = users.filter((user)=>{
        return user.room === room
    })
    return existingUser
}

module.exports= {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}



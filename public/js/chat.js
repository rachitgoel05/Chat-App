socket = io()

const $messageForm  = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

const $messageTemplate = document.querySelector('#message-template').innerHTML
const $messageTemplateLocation = document.querySelector('#message-template-location').innerHTML
const $sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search ,{ ignoreQueryPrefix: true })

const autoscroll = () =>{
    
    // New Message Element
    const $newMessage =  $messages.lastElementChild
    console.log('$newMessage',$newMessage)
    
    //Height of a New Message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight
    //Height of messages container
    const containerHeight = $messages.scrollHeight
    //How far have I scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight

    // console.log('visibleHeight',visibleHeight)
    // console.log('containerHeight',containerHeight)
    // console.log('newMessageStyles',newMessageStyles)
    // console.log('newMessageMargin',newMessageMargin)
    // console.log('newMessageHeight',newMessageHeight)
    // console.log('scrollOffset',scrollOffset)
    // console.log(' $messages.scrollTop', $messages.scrollTop)
    // console.log(' $messages.scrollHeight', $messages.scrollHeight)
    
    if(containerHeight - newMessageHeight <= scrollOffset ){
        $messages.scrollTop = $messages.scrollHeight
    }

}
socket.on('message',(message)=>{
    const html = Mustache.render($messageTemplate,{
        username: message.username,
        message: message.message,
        createAt: moment(message.createAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

socket.on('locationMessage',(message)=>{
    console.log("message",message)
    const html = Mustache.render($messageTemplateLocation,{
        username: message.username,
        message: message.message,
        createAt: moment(message.createAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('roomData',({ room, users })=>{
    const html = Mustache.render($sideBarTemplate,{
        room,
        users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message Delivered')
    });
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },() => {
            $sendLocationButton.removeAttribute('disabled')
            console.log("Location Shared")
        })
    })
})
socket.emit('join',{ username, room },(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})
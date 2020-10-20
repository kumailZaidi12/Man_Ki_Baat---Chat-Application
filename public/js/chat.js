const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Select the template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
        // Insert the template into the DOM
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage',(locationMessage) => {
    const html = Mustache.render(locationTemplate,{
        url:locationMessage.url,
        createdAt:moment(locationMessage.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit',(event) => {
    event.preventDefault()
    //disabled
    $messageFormButton.setAttribute('disabled', 'disabled')

  //  const message = document.querySelector('input').value
    const message =  event.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        //enable
         $messageFormButton.removeAttribute('disabled','disabled')
         $messageFormInput.value = ''
         $messageFormInput.focus()

        if (error) {
        return console.log(error)
        }
        console.log('Message delivered!')
    })
})

$sendLocation.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }


    $sendLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
       socket.emit('sendLocation',{
           latitude:position.coords.latitude,
           longitude:position.coords.longitude
       },() =>{
            $sendLocation.removeAttribute('disabled')
             console.log('Location shared!')
         })
    })
})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})



const generateMessage = (username,text) => {
    return (
        {
            username,
            message: text,
            createAt: new Date().getTime()
        }
    )
}

module.exports = {
    generateMessage
}
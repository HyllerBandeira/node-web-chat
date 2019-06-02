module.exports = {
    generateMessage(author, message) {
        return {
            author,
            message: `${author}: ${message}`,
            createdAt: new Date().getTime()
        };
    },
    generateLocationMessage(author, url) {
        return {
            author, 
            locationLink: url,
            createdAt: new Date().getTime()
        };
    }
}
const { text } = require('express')
let mongoose = require('mongoose')
let messageSchema = mongoose.Schema({
    to:{
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    from:{
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    messageContent:{
        type: {type:String},
        text: {type:String}
    }
}, { timestamps: true });
module.exports = new mongoose.model('message', messageSchema)

// schema : message:
// -from: user
// -to: user
// -messageContent: {
// type: String[file,text]
// text: String
// }
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Message = require('../schemas/messages');
let { CheckLogin } = require('../utils/authHandler');
let { uploadImage } = require('../utils/uploadHandler');
let userSchema = require('../schemas/users');
let messages = require('../schemas/messages');
router.post('/', CheckLogin, uploadImage.single('file'), async (req, res) => {
    try {
        let user = req.user;
        let fromUser = user._id;
        let toUser = req.body.to;
        if(!userSchema.findById(fromUser)){
            res.status(404).message("User khong ton tai");
            return;
        }
        let type = "";
        let text = "";
        if (req.file) {
            type = 'file';
            text = req.file.path;
        } else {
            type = 'text';
            text = req.body.text;
        }
        let newMessage = new Message({
            from: fromUser,
            to: toUser,
            messageContent: {
                type: type,
                text: text
            }
        });

        let savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

router.get('/:userID', CheckLogin, async (req, res) => {
    try {
        let currentUserId = req.user._id; 
        let otherUserId = req.params.userID; 
        if(!userSchema.findById(otherUserId)){
            res.status(404).message("User khong ton tai");
            return;
        }
        let messages = await Message.find({
            $or: [
                { from: currentUserId, to: otherUserId },
                { from: otherUserId, to: currentUserId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

router.get('/', CheckLogin, async (req, res) => {
    try {
        let currentUserId = req.user._id;
        let allMessages = await Message.find({
            $or: [{ from: currentUserId }, { to: currentUserId }]
        }).sort({ createdAt: -1 });


        let messageMap = new Map();
        for(const msg of allMessages){
            let keyUser = currentUserId.toString() == msg.from.toString() ? msg.to.toString() : msg.from.toString();
            keyUser = keyUser.toString();
            if(!messageMap.has(keyUser)){
                messageMap.set(keyUser, msg)
            }
        }
        let result = [];
        messageMap.forEach(function (value, key) {
            result.push({
                user: key,
                message: value
            })
        })

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

module.exports = router;


        // let result = [];
        // let listUserChatted = [];

        // for (let i = 0; i < allMessages.length; i++) {
        //     let msg = allMessages[i];

        //     let fromStr = msg.from.toString();
        //     let toStr = msg.to.toString();
        //     let myIdStr = currentUserId.toString();

        //     let otherUser = (fromStr === myIdStr) ? toStr : fromStr;

        //     if (listUserChatted.includes(otherUser) === false) {
        //         listUserChatted.push(otherUser);
        //         result.push(msg);
        //     }
        // }

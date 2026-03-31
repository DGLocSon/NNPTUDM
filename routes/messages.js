let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Message = require('../schemas/messages');
let { CheckLogin } = require('../utils/authHandler')
let { uploadImage } = require('../utils/uploadHandler')

router.post('/', CheckLogin, uploadImage.single('file'), async (req, res) => {
    try {
        let user = req.user;
        let fromUser = user._id;
        let toUser = req.body.to;
        let type = req.body.type;
        let text = "";
        if (req.file) {
            text = req.file.path;
        } else {
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
        let result = [];
        let listUserChatted = [];

        for (let i = 0; i < allMessages.length; i++) {
            let msg = allMessages[i];

            let fromStr = msg.from.toString();
            let toStr = msg.to.toString();
            let myIdStr = currentUserId.toString();

            let otherUser = (fromStr === myIdStr) ? toStr : fromStr;

            if (listUserChatted.includes(otherUser) === false) {
                listUserChatted.push(otherUser);
                result.push(msg);
            }
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

module.exports = router;
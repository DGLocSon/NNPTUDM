let userController = require('../controllers/users')
let jwt = require('jsonwebtoken')
let fs = require('fs')
module.exports = {
    CheckLogin: async function (req, res, next) {
        let key = req.headers.authorization;
        if (!key) {
            if (req.cookies.LOGIN_NNPTUD_S3) {
                key = req.cookies.LOGIN_NNPTUD_S3;
            } else {
                res.status(404).send("ban chua dang nhap")
                return;
            }

        }

        try {
            
            const publicKey = fs.readFileSync(path.join(__dirname, '../public.pem'), 'utf8');
            let decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

            let user = await userController.GetUserById(decoded.id);
            if (!user) {
                return res.status(404).send("ban chua dang nhap")
            }
            req.user = user;
            next();
        } catch (error) {
            res.status(404).send("ban chua dang nhap")
            return;
        }

    }
}
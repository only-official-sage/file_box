import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
const router = express.Router();

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
} 

function handleAuthErrors (error) {
    if (error == "Invalid User") {
        return { msg: "Email does not exist" }
    }
    
    if (error == "Invalid Password") {
        return { msg: "Password does not match" }
    }
}

function createJwtToken (data) {
    return jwt.sign(
        { data },
        process.env.JWT_SECERETE,
        { expiresIn: 3 * 24 * 60 * 60 }
    )
}

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const currentDate = getFormattedDate();

    try {
        const user = await User.create({
            username: username,
            email: email,
            password: password,
            storage: 0,
            maxstorage: 2,
            date_joined: currentDate
        });
        res.status(200).json({msg: `User created: ${user}`, url: '/login'})
    } catch (error) {
        res.status(400).json({msg: "REGISTRATION ENDPOINT"})
        
    }
})

router.post('/login', async (req, res) => {
    const { email, password} = req.body;

    try {
        const user = await User.login(email, password);
        const token = createJwtToken(user.id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ msg: "Authentication successfull", url: '/' });
    } catch (error) {
        const err = error?.message;
        res.status(400).json(handleAuthErrors(err));    
    }
})




export default router;
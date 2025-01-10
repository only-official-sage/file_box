import jwt from 'jsonwebtoken';
const routeProtect = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECERETE, (err, verifiedData) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                req.token = verifiedData;
                next();
            }
        });
    } else {
        res.redirect('/login')
    }
}; 
 
export {
    routeProtect
}  
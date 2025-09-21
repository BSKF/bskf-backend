import jwt from 'jsonwebtoken';
export const isAuthenticated = (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    // Verify token (implementation depends on your auth strategy)
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized', error: err });
        }
        req.user = decoded;
        next();
    });
}

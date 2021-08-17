const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user')


module.exports = function (passport) {
    passport.use(
        new JwtStrategy(
            {
                secretOrKey: process.env.JWT_SECRET_KEY,
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
            },
            async function (userInfoFromJwt, next) {
                const user = await User.findByPk(userInfoFromJwt.id);
                if (user)
                    next(null, userInfoFromJwt);
                else
                    next(null, false)
            }
        )
    )
}
// middleware : end point(url)에서 요청을 받고 call back function을 하기 전에 중간에서 인증을 위해 필요

const { User } = require('../models/User');

let auth = (req, res, next) => {
    //인증 처리를 하는곳 
    //클라이언트 쿠키에서 토큰을 가져온다.

    let token = req.cookies.x_auth; // req.cookies.x_auth으로 토큰을 가져오고 복호화 하는 함수를 User.js에서 생성 
    // 토큰을 복호화 한후  유저를 찾는다.
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) return res.json({ isAuth: false, error: true })


        // console.log('userh', user)
        //auth 라우터에서 user와 token정보를 사용할 수 있도록 request에 담아준다.
        req.token = token;
        req.user = user;

        // middleware에서 다음으로 넘어갈 수 있게 next();
        next();
    })
}

module.exports = { auth };
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require("./models/User");

//application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 
app.use(bodyParser.json());
app.use(cookieParser());

// config를 접근할 수 있도록 config변수 생성
const mongoose = require('mongoose')
// 몽고디비 연결 부분
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))


// http://localhost 초기화면
app.get('/', (req, res) => res.send('Hello World!~~ '))

// localhost/api/hello 화면
app.get('/api/hello', (req, res) => res.send('Hello World!~~ '))

// localhost/api/users/register 화면
app.post('/api/users/register', (req, res) => {

  //회원 가입 할떄 필요한 정보들을  client에서 가져오면 
  //그것들을  데이터 베이스에 넣어준다. 
  const user = new User(req.body)
  //save를 하기 전에 비밀번호를 암호화를 시켜준다. (bcrypt)
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/users/login', (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  //userInfo -> user
  User.findOne({ email: req.body.email }, (err, user) => {

    // console.log('user', user)
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }

    //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
    //isMatch -> 비밀번호가 맞다.
    //comparePassword 는 User.js에서 생성
    user.comparePassword(req.body.password, (err, isMatch) => {

      //User.js에서 isMatch가 안왔다면 에러이므로
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." }) // res를 클라이언트에게 보낸다.

      //비밀번호 까지 맞다면 토큰을 생성하기.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //토큰을 저장한다.  어디에 ?  쿠키 , 로컬스토리지 
        res.cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})

// next() 과정 후 index.js의 auth router에 도달했다면 그건 미들웨어를 통과했다는 것
// 따라서 client에다가 true라고 정보를 준다.
// 정보는 user의 정보 중 원하는 것만 주면 된다.

// role 1 어드민    role 2 특정 부서 어드민 
// role 0 -> 일반유저   role 0이 아니면  관리자 
app.get('/api/users/auth', auth, (req, res) => {
  //여기 까지 미들웨어를 통과해 왔다는 얘기는  Authentication 이 True 라는 말.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => {
  // console.log('req.user', req.user)
  User.findOneAndUpdate({ _id: req.user._id },
    { token: "" }
    , (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true
      })
    })
})
const port = 5000

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
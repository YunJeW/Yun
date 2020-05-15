const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10 // bcrypt는 salt를 생성해서 암호화, saltRound : slat가 몇 글자 인지를 명시
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// index.js/register에서 저장하기 전에 비밀번호 암호화
// next()하면 register Router의 save 부분으로 넘어간다.
userSchema.pre('save', function (next) {
    //userSchema
    var user = this;
     //비밀번호를 수정할 때 ( 비밀번호를 바꿀때만 수행하게 끔 )
    if (user.isModified('password')) {
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)

            // planpassword -> user.password
            // hash -> 암호화된 비밀번호
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)

                // 비밀번호 암호화 성공 & index.js/register로 돌아간다(next())
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

//cb : 콜백 funtion
userSchema.methods.comparePassword = function (plainPassword, cb) {

    //plainPassword 1234567    암호회된 비밀번호 $2b$10$l492vQ0M4s9YUBfwYkkaZOgWHExahjWC
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch); // null : 에러는 없고, isMatch : 비밀번호는 맞다 (=true)
    })
}

userSchema.methods.generateToken = function (cb) {
    var user = this;
    // console.log('user._id', user._id)

    // jsonwebtoken을 이용해서 token을 생성하기 
    // secretToken 명칭은 임의로 지정
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    /*
     user._id + 'secretToken' = token 
     -> 
     'secretToken' -> user._id

    - user._id와 secretToken이 합쳐져서 새로운 token이 생성
    - Token을 만들었다면 데이터베이스 User model에 저장
    */
    user.token = token
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user) // user가 index.js의 generateToken의 user로 정보가 넘어간다.
    })
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;
    // user._id + ''  = token
    //토큰을 decode 한다. 
    jwt.verify(token, 'secretToken', function (err, decoded) {
        //유저 아이디를 이용해서 유저를 찾은 다음에 
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({ "_id": decoded, "token": token }, function (err, user) {
            if (err) return cb(err);
            cb(null, user)
        })
    })
}



const User = mongoose.model('User', userSchema)

module.exports = { User }
// 환경변수가 배포일 경우 - production
// 환경변수가 개발환경일 경우 - development

if(process.env.NODE_ENV === 'production') {
    module.exports = require('./prod'); // 배포상태
} else {
    module.exports = require('./dev');
}
// hoc : funtion, 다른 컴포넌트를 받은 다음에 새로운 컴포넌트를 반환한다.

// auth 라는 컴퍼넌트를 모든 컴포넌트를 넣은 후
// hoc가 백엔드에 request를 넘긴 후 컴포넌트의 상태정보를 가져온다.

// 해당 유저가 해당 페이지에 들어갈 자격이 되는지를 알아 낸 후에
// 자격이 된다면 Admin component에 가게해주고 아니라면 다른 페이지로 보내버린다.

import React, { useEffect } from 'react';
import Axios from 'axios';
import { useDispatch } from 'react-redux';
import { auth } from '../_actions/user_action';

export default function (SpecificComponent, option, adminRoute = null) {

    //null    =>  아무나 출입이 가능한 페이지
    //true    =>  로그인한 유저만 출입이 가능한 페이지
    //false   =>  로그인한 유저는 출입 불가능한 페이지
    // ===> app.js의 컴포넌트에 적용

    function AuthenticationCheck(props) {
        const dispatch = useDispatch();

        // 상태를 가져옴
        useEffect(() => {

            // dispatch로 액션을 보냄
            dispatch(auth()).then(response => {
                console.log(response)
                //로그인 하지 않은 상태 
                if (!response.payload.isAuth) {
                    if (option) {
                        props.history.push('/login')
                    }
                } else {
                    //로그인 한 상태 
                    if (adminRoute && !response.payload.isAdmin) {
                        props.history.push('/')
                    } else {
                        if (option === false)
                            props.history.push('/')
                    }
                }
            })
        }, [])

        return (
            <SpecificComponent />
        )
    }
    return AuthenticationCheck
}
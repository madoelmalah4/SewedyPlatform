import React from 'react'
import { selectIsAuth } from '../Slices/AuthSlice/Authslice'
import { Outlet } from 'react-router-dom';
import NotAuthunticated from '../Pages/NotAuthunticated';
import { useSelector } from 'react-redux';

const IsAuthLayOut = () => {

    const isAuth = useSelector(selectIsAuth);
    console.log(isAuth);
    
  return (
    <>
        {!isAuth ? <NotAuthunticated/>  : <Outlet/>}
    </>
  )
}

export default IsAuthLayOut

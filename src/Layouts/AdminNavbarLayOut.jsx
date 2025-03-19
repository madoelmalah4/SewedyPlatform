import { Box, Stack } from '@mui/material'
import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminNavbar from '../Navbars/AdminNavbar'
import { useSelector } from 'react-redux'
import { selectIsAuth } from '../Slices/AuthSlice/Authslice'

const AdminNavbarLayOut = () => {
  return (
    <Stack>
      <AdminNavbar />
       <Outlet /> 
    </Stack>
  );
}

export default AdminNavbarLayOut

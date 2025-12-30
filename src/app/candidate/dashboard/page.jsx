"use client"
import { useHeader } from '@/store/user.store';
import React from 'react'
import { useEffect } from 'react';

const page = () => {
  const setTitle = useHeader((state) => state.setTitle);

  useEffect(() => {
    setTitle("Candidate Dashboard");
  }, []);

  return (
    <div>page</div>
  )
}

export default page

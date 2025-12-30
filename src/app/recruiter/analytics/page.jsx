"use client"
import { useHeader } from "@/store/user.store"
import { useEffect } from "react"

const page = () => {
  const setTitle = useHeader(state => state.setTitle)
  useEffect(() => {
    setTitle('Analytics & Reach')
  },[])
  return (
    <div>page</div>
  )
}

export default page

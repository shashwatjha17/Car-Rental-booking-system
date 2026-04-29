import React, { useCallback, useEffect, useState } from 'react'
import { assets} from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion as Motion } from 'motion/react'

const MyBookings = () => {

  const { axios, user, currency } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [activeBooking, setActiveBooking] = useState(null)
  const [chatText, setChatText] = useState('')
  const [isSending, setIsSending] = useState(false)

  const fetchMyBookings = useCallback(async ()=>{
    try {
      const { data } = await axios.get('/api/bookings/user')
      if (data.success){
        setBookings(data.bookings)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [axios])

  useEffect(()=>{
    user && fetchMyBookings()
  },[fetchMyBookings, user])

  useEffect(()=>{
    if(!user) return
    const intervalId = setInterval(fetchMyBookings, 7000)
    return ()=> clearInterval(intervalId)
  },[fetchMyBookings, user])

  const openChat = (booking)=>{
    setActiveBooking(booking)
    setChatText('')
  }

  const sendMessage = async (e)=>{
    e.preventDefault()
    if(!activeBooking || !chatText.trim() || isSending) return null

    setIsSending(true)
    try {
      const {data} = await axios.post('/api/bookings/message', {
        bookingId: activeBooking._id,
        text: chatText
      })

      if(data.success){
        setChatText('')
        await fetchMyBookings()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally{
      setIsSending(false)
    }
  }

  useEffect(()=>{
    if(!activeBooking) return
    const freshBooking = bookings.find((booking)=> booking._id === activeBooking._id)
    if(freshBooking){
      setActiveBooking(freshBooking)
    }
  },[activeBooking, bookings])

  return (
    <Motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    
    className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'>

      <Title title='My Bookings'
       subTitle='View and manage your all car bookings'
       align="left"/>

       <div>
        {bookings.map((booking, index)=>(
          <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          
          key={booking._id} className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12'>
            {/* Car Image + Info */}

            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-3'>
                <img src={booking.car.image} alt="" className='w-full h-auto aspect-video object-cover'/>
              </div>
              <p className='text-lg font-medium mt-2'>{booking.car.brand} {booking.car.model}</p>

              <p className='text-gray-500'>{booking.car.year} • {booking.car.category} • {booking.car.location}</p>
            </div>

            {/* Booking Info */}
            <div className='md:col-span-2'>
              <div className='flex items-center gap-2'>
                <p className='px-3 py-1.5 bg-light rounded'>Booking #{index+1}</p>
                <p className={`px-3 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-400/15 text-green-600' : 'bg-red-400/15 text-red-600'}`}>{booking.status}</p>
                <button type='button' onClick={()=> openChat(booking)} className='px-3 py-1 text-xs bg-primary/10 text-primary rounded-md cursor-pointer'>
                  Chat with Owner
                </button>
              </div>

              {booking.messages?.length > 0 && (
                <p className='text-xs text-gray-500 mt-2'>
                  Last message: {booking.messages[booking.messages.length - 1].text}
                </p>
              )}

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                <div>
                  <p className='text-gray-500'>Rental Period</p>
                  <p>{booking.pickupDate.split('T')[0]} To {booking.returnDate.split('T')[0]}</p>
                </div>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.location_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                <div>
                  <p className='text-gray-500'>Pick-up Location</p>
                  <p>{booking.car.location}</p>
                </div>
              </div>
            </div>

           {/* Price */}
           <div className='md:col-span-1 flex flex-col justify-between gap-6'>
              <div className='text-sm text-gray-500 text-right'>
                <p>Total Price</p>
                <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
                <p>Booked on {booking.createdAt.split('T')[0]}</p>
              </div>
           </div>


          </Motion.div>
        ))}
       </div>

       {activeBooking && (
        <div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg w-full max-w-2xl p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-800'>Booking Chat</h2>
              <button type='button' onClick={()=> setActiveBooking(null)} className='text-gray-500 cursor-pointer'>Close</button>
            </div>

            <div className='h-72 overflow-y-auto border border-borderColor rounded-md p-3 bg-light/40 space-y-2'>
              {(activeBooking.messages || []).length === 0 ? (
                <p className='text-sm text-gray-500'>No messages yet.</p>
              ) : (
                activeBooking.messages.map((message, index)=> (
                  <div key={index} className={`max-w-[85%] px-3 py-2 rounded-md text-sm ${message.senderRole === 'user' ? 'ml-auto bg-primary text-white' : 'bg-white border border-borderColor text-gray-700'}`}>
                    <p className='font-medium text-xs mb-1'>{message.senderRole === 'user' ? 'You' : 'Owner'}</p>
                    <p>{message.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className='mt-4 flex gap-2'>
              <input
                type="text"
                value={chatText}
                onChange={(e)=> setChatText(e.target.value)}
                placeholder='Write a message...'
                className='flex-1 px-3 py-2 border border-borderColor rounded-md outline-none'
              />
              <button type='submit' className='px-4 py-2 bg-primary text-white rounded-md cursor-pointer'>
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
      
    </Motion.div>
  )
}

export default MyBookings

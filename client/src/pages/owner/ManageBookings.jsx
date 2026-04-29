import React, { useCallback, useEffect, useState } from 'react'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageBookings = () => {

  const { currency, axios } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [activeBooking, setActiveBooking] = useState(null)
  const [chatText, setChatText] = useState('')
  const [isSending, setIsSending] = useState(false)

  const fetchOwnerBookings = useCallback(async ()=>{
    try {
      const { data } = await axios.get('/api/bookings/owner')
      data.success ? setBookings(data.bookings) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }, [axios])

  const changeBookingStatus = async (bookingId, status)=>{
    try {
      let cancelMessage = ''
      if (status === 'cancelled'){
        const promptMessage = window.prompt('Enter cancellation message for the user:')
        if(promptMessage === null) return null
        if(!promptMessage.trim()){
          toast.error('Cancellation message is required')
          return null
        }
        cancelMessage = promptMessage.trim()
      }

      const { data } = await axios.post('/api/bookings/change-status', {bookingId, status, cancelMessage})
      if(data.success){
        toast.success(data.message)
        fetchOwnerBookings()
      }else{
        toast.error(data.message)
      }
      
    } catch (error) {
      toast.error(error.message)
    }
  }

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
        await fetchOwnerBookings()
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

  useEffect(()=>{
    fetchOwnerBookings()
  },[fetchOwnerBookings])

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      
      <Title title="Manage Bookings" subTitle="Track all customer bookings, approve or cancel requests, and manage booking statuses."/>

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>

        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Date Range</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium max-md:hidden">Payment</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index)=>(
              <tr key={index} className='border-t border-borderColor text-gray-500'>

                <td className='p-3 flex items-center gap-3'>
                  <img src={booking.car.image} alt="" className='h-12 w-12 aspect-square rounded-md object-cover'/>
                  <p className='font-medium max-md:hidden'>{booking.car.brand} {booking.car.model}</p>
                </td>

                <td className='p-3 max-md:hidden'>
                  {booking.pickupDate.split('T')[0]} to {booking.returnDate.split('T')[0]}
                </td>

                <td className='p-3'>{currency}{booking.price}</td>

                <td className='p-3 max-md:hidden'>
                  <span className='bg-gray-100 px-3 py-1 rounded-full text-xs'>offline</span>
                </td>

                <td className='p-3'>
                  <div className='flex flex-col items-start gap-2'>
                    {booking.status === 'pending' ? (
                      <select onChange={e=> changeBookingStatus(booking._id, e.target.value)} value={booking.status} className='px-2 py-1.5 mt-1 text-gray-500 border border-borderColor rounded-md outline-none'>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="confirmed">Confirmed</option>
                      </select>
                    ): (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>{booking.status}</span>
                    )}
                    <button type='button' onClick={()=> openChat(booking)} className='px-3 py-1 text-xs bg-primary/10 text-primary rounded-md cursor-pointer'>
                      Chat
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

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
                  <div key={index} className={`max-w-[85%] px-3 py-2 rounded-md text-sm ${message.senderRole === 'owner' ? 'ml-auto bg-primary text-white' : 'bg-white border border-borderColor text-gray-700'}`}>
                    <p className='font-medium text-xs mb-1'>{message.senderRole === 'owner' ? 'You' : 'User'}</p>
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

    </div>
  )
}

export default ManageBookings

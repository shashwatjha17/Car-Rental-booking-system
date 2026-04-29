import React, { useCallback, useEffect, useState } from 'react'
import { assets} from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageCars = () => {

  const {isOwner, axios, currency} = useAppContext()
  const locationOptions = ['Shimla', 'Ranchi', 'Lucknow', 'Pondicherry', 'Chennai', 'Delhi', 'Bhopal']

  const [cars, setCars] = useState([])
  const [editingCar, setEditingCar] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchOwnerCars = useCallback(async ()=>{
    try {
      const {data} = await axios.get('/api/owner/cars')
      if(data.success){
        setCars(data.cars)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [axios])

  const toggleAvailability = async (carId)=>{
    try {
      const {data} = await axios.post('/api/owner/toggle-car', {carId})
      if(data.success){
        toast.success(data.message)
        fetchOwnerCars()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteCar = async (carId)=>{
    try {

      const confirm = window.confirm('Are you sure you want to delete this car?')

      if(!confirm) return null

      const {data} = await axios.post('/api/owner/delete-car', {carId})
      if(data.success){
        toast.success(data.message)
        fetchOwnerCars()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const openEditModal = (car)=>{
    setEditingCar({
      _id: car._id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      category: car.category,
      transmission: car.transmission,
      fuel_type: car.fuel_type,
      seating_capacity: car.seating_capacity,
      pricePerDay: car.pricePerDay,
      location: car.location,
      description: car.description,
    })
  }

  const updateCar = async (e)=>{
    e.preventDefault()
    if (isUpdating || !editingCar) return null

    setIsUpdating(true)
    try {
      const payload = {
        ...editingCar,
        carId: editingCar._id,
      }
      const {data} = await axios.post('/api/owner/update-car', payload)
      if(data.success){
        toast.success(data.message)
        setEditingCar(null)
        fetchOwnerCars()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally{
      setIsUpdating(false)
    }
  }

  useEffect(()=>{
    isOwner && fetchOwnerCars()
  },[fetchOwnerCars, isOwner])

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      
      <Title title="Manage Cars" subTitle="View all listed cars, update their details, or remove them from the booking platform."/>

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>

        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className="p-3 font-medium">S.No</th>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium max-md:hidden">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index)=>(
              <tr key={index} className='border-t border-borderColor'>

                <td className='p-3 font-medium'>{car.serialNumber ?? index + 1}</td>

                <td className='p-3 flex items-center gap-3'>
                  <img src={car.image} alt="" className="h-12 w-12 aspect-square rounded-md object-cover"/>
                  <div className='max-md:hidden'>
                    <p className='font-medium'>{car.brand} {car.model}</p>
                    <p className='text-xs text-gray-500'>{car.seating_capacity} • {car.transmission}</p>
                  </div>
                </td>

                <td className='p-3 max-md:hidden'>{car.category}</td>
                <td className='p-3'>{currency}{car.pricePerDay}/day</td>

                <td className='p-3 max-md:hidden'>
                  <span className={`px-3 py-1 rounded-full text-xs ${car.isAvaliable ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                    {car.isAvaliable ? "Available" : "Unavailable" }
                  </span>
                </td>

                <td className='p-3'>
                  <div className='flex items-center gap-2'>
                    <img onClick={()=> toggleAvailability(car._id)} src={car.isAvaliable ? assets.eye_close_icon : assets.eye_icon} alt="" className='cursor-pointer'/>

                    <button
                      type='button'
                      onClick={()=> openEditModal(car)}
                      className='px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-md cursor-pointer'
                    >
                      Edit
                    </button>

                    <img onClick={()=> deleteCar(car._id)} src={assets.delete_icon} alt="" className='cursor-pointer'/>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {editingCar && (
        <div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4'>
          <form onSubmit={updateCar} className='bg-white rounded-lg w-full max-w-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-800'>Edit Car Details</h2>
              <button type='button' onClick={()=> setEditingCar(null)} className='text-gray-500 cursor-pointer'>Close</button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-500'>Brand</label>
                <input type="text" required value={editingCar.brand} onChange={(e)=> setEditingCar({...editingCar, brand: e.target.value})} className='px-3 py-2 border border-borderColor rounded-md outline-none' placeholder='Brand'/>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-500'>Model</label>
                <input type="text" required value={editingCar.model} onChange={(e)=> setEditingCar({...editingCar, model: e.target.value})} className='px-3 py-2 border border-borderColor rounded-md outline-none' placeholder='Model'/>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-500'>Year</label>
                <input type="number" required value={editingCar.year} onChange={(e)=> setEditingCar({...editingCar, year: e.target.value})} className='px-3 py-2 border border-borderColor rounded-md outline-none' placeholder='Year'/>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-500'>Daily Price ({currency})</label>
                <input type="number" required value={editingCar.pricePerDay} onChange={(e)=> setEditingCar({...editingCar, pricePerDay: e.target.value})} className='px-3 py-2 border border-borderColor rounded-md outline-none' placeholder={`Price (${currency})`}/>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-500'>Seating Capacity</label>
                <input type="number" required value={editingCar.seating_capacity} onChange={(e)=> setEditingCar({...editingCar, seating_capacity: e.target.value})} className='px-3 py-2 border border-borderColor rounded-md outline-none' placeholder='Seating Capacity'/>
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-500'>Category</label>
                <select required value={editingCar.category} onChange={(e)=> setEditingCar({...editingCar, category: e.target.value})} className='px-3 py-2 border border-borderColor rounded-md outline-none'>
                  <option value="">Select Category</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                </select>
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-500'>Transmission</label>
                <select required value={editingCar.transmission} onChange={(e)=> setEditingCar({...editingCar, transmission: e.target.value})} className='px-3 py-2 border border-borderColor rounded-md outline-none'>
                  <option value="">Select Transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="Semi-Automatic">Semi-Automatic</option>
                </select>
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-500'>Fuel Type</label>
                <select required value={editingCar.fuel_type} onChange={(e)=> setEditingCar({...editingCar, fuel_type: e.target.value})} className='px-3 py-2 border border-borderColor rounded-md outline-none'>
                  <option value="">Select Fuel Type</option>
                  <option value="Gas">Gas</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-500'>Location</label>
                <select required value={editingCar.location} onChange={(e)=> setEditingCar({...editingCar, location: e.target.value})} className='px-3 py-2 border border-borderColor rounded-md outline-none'>
                  <option value="">Select Location</option>
                  {locationOptions.map((location)=> (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='text-xs text-gray-500'>Description</label>
              <textarea rows={4} required value={editingCar.description} onChange={(e)=> setEditingCar({...editingCar, description: e.target.value})} className='w-full px-3 py-2 border border-borderColor rounded-md outline-none' placeholder='Description'/>
            </div>

            <button type='submit' className='px-4 py-2 bg-primary text-white rounded-md cursor-pointer'>
              {isUpdating ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

    </div>
  )
}

export default ManageCars

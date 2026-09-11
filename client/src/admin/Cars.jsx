import React, { useEffect, useState } from 'react'
import AdminMenu from './AdminMenu'
import axios from 'axios'
import { Link } from 'react-router-dom';
import { BsFuelPumpFill } from 'react-icons/bs'
import { PiCurrencyInrFill } from 'react-icons/pi'
import toast from 'react-hot-toast';
import { ColorRing } from 'react-loader-spinner'
import { getBrandImage, getCarImage } from '../utils/getImageUrl'

const Cars = () => {

    const [cars, setcars] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAllcars = async () => {
        try {
            // --- CHANGE THIS LINE ---
            const data = await fetch(`${process.env.REACT_APP_API_URL}/api/car/get-car`, { // Changed 'getAll-car' to 'get-car'
                method: "GET",
                headers: { "Content-type": "application/json" }
            })
            const data_ = await data.json()
            
            // Check if data_.cars exists before reversing
            if (data_.success && data_.cars) {
                setcars(data_.cars.reverse());
                setLoading(false);
            } else {
                // Handle case where success is false or cars array is missing
                toast.error(data_.message || "Failed to fetch cars.");
                setLoading(false); // Stop loading even on error
            }
        } catch (error) {
            console.error('Error fetching cars:', error); // Use console.error for errors
            toast.error('Something went wrong while fetching cars.');
            setLoading(false); // Ensure loading state is turned off on error
        }
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await axios.delete(`${process.env.REACT_APP_API_URL}/api/car/delete-car/${id}`)
            if (data?.success) {
                toast.success('Car Deleted Successfully')
                getAllcars() // Refresh the list after deletion
            } else {
                toast.error('Error in Deleting car')
            }
        } catch (err) {
            console.error('Error deleting car:', err); // Use console.error
            toast.error('Something went wrong while deleting car.')
        }
    }

    useEffect(() => {
        getAllcars();
        window.scrollTo(0, 0)
    }, []);

    return (
        <div className='container marginStyle'>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-3'>
                        <AdminMenu />
                    </div>
                    <div className="col-md-9">
                        <h1 className="text-center my-3">All Cars List</h1>
                        {loading ?
                            <div className="h-100 d-flex align-items-center justify-content-center">
                                <ColorRing
                                    visible={true}
                                    colors={['#000435', 'rgb(14 165 233)', 'rgb(243 244 246)', '#000435', 'rgb(14 165 233)']}
                                />
                            </div>
                            :
                            <div className="row" style={{ marginTop: '0px' }}>
                                {/* Check if cars array is empty */}
                                {cars.length === 0 ? (
                                    <p className="text-center">No cars found. Please create one!</p>
                                ) : (
                                    cars.map((p) => (
                                        <div className="col-md-12 col-lg-4 mb-lg-0 my-3" key={p._id}> {/* Added key prop */}
                                            <div className="card">
                                                <div className="d-flex justify-content-between p-3">
                                                    <p className="lead mb-0">{p.brand?.name}</p> {/* Added optional chaining */}
                                                    <div
                                                        className=" rounded-circle d-flex align-items-center justify-content-center shadow-1-strong"
                                                        style={{ width: '40px', height: '40px' }}>
                                                        <Link to={`/brand/${p.brand?.slug}`} className="text-white mb-0 small"> {/* Added optional chaining and changed to slug */}
                                                            {/* Display brand image */}
                                                            {p.brand?.brandPictures ? (
                                                                <img src={getBrandImage(p.brand.brandPictures)} alt={p.brand.name} style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }} />
                                                            ) : (
                                                                // Placeholder or empty div if no image
                                                                <div>No Brand Image</div> 
                                                            )}
                                                        </Link>
                                                    </div>
                                                </div>
                                                <Link to={`/dashboard/admin/car/${p.slug}`} className='text-center '>
                                                    {/* Display first car image, or a placeholder if no images */}
                                                        <img className='border rounded' src={getCarImage(p.productPictures)} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }} />
                                                </Link>
                                                <div className="card-body">
                                                    <h4 className="text-center mb-4">{p.name}</h4>
                                                    <div className="d-flex justify-content-between">
                                                        <h6><PiCurrencyInrFill /> : {p.price} Lakhs</h6>
                                                        <h6 ><BsFuelPumpFill /> : {p.fuelType}</h6>
                                                    </div>
                                                    <div className='text-center my-2'>
                                                        <Link className='btn mt-2 text-white' to={`/car/${p.slug}`} style={{ backgroundColor: 'blueviolet' }}>View</Link>
                                                        <Link to={`/dashboard/admin/car/${p.slug}`} className='btn btn-primary mt-2 mx-2'>Update</Link>
                                                        <button onClick={() => handleDelete(p._id)} className='btn btn-danger mt-2'>Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Cars;
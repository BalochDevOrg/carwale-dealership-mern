import React, { useEffect, useState } from 'react';
import AdminMenu from './AdminMenu';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const UpdateCar = () => {
    const params = useParams();

    const [name, setname] = useState('');
    const [description, setdescription] = useState('');
    const [price, setprice] = useState('');
    const [fuelType, setfuelType] = useState('');
    const [transmission, settransmission] = useState('');
    const [engineSize, setengineSize] = useState('');
    const [mileage, setmileage] = useState('');
    const [safetyrating, setsafetyrating] = useState('');
    const [warranty, setwarranty] = useState('');
    const [seater, setseater] = useState('');
    const [size, setsize] = useState('');
    const [fuelTank, setfuelTank] = useState('');
    const [id, setId] = useState('');
    const [productPictures, setProductPictures] = useState([]); // Add state for new images
    const [existingPictures, setExistingPictures] = useState([]); // Add state for existing images

    const navigate = useNavigate();

    const getSingleProduct = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/car/get-car/${params.slug}`); // Corrected route to /get-car/:slug
            setname(data.car.name);
            setdescription(data.car.description);
            setprice(data.car.price);
            setfuelType(data.car.fuelType);
            settransmission(data.car.transmission);
            setengineSize(data.car.engineSize);
            setmileage(data.car.mileage);
            setsafetyrating(data.car.safetyrating);
            setwarranty(data.car.warranty);
            setseater(data.car.seater);
            setsize(data.car.size);
            setfuelTank(data.car.fuelTank);
            setId(data.car._id);
            setExistingPictures(data.car.productPictures || []); // Populate existing pictures
        } catch (err) {
            console.log(err);
            toast.error('Failed to fetch car details');
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setProductPictures(files); // Store the new files selected
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const carData = new FormData();
            carData.append('name', name);
            carData.append('price', price);
            carData.append('fuelType', fuelType);
            carData.append('transmission', transmission);
            carData.append('engineSize', engineSize);
            carData.append('mileage', mileage);
            carData.append('safetyrating', safetyrating);
            carData.append('warranty', warranty);
            carData.append('seater', seater);
            carData.append('size', size);
            carData.append('fuelTank', fuelTank);
            carData.append('description', description);

            // Append newly selected images
            productPictures.forEach((image) => {
                carData.append('productPictures', image); // <--- IMPORTANT: Append new files with the correct name
            });

            // If you want to handle existing images (e.g., delete some, keep others),
            // you'll need additional logic and potentially another backend field to send
            // an array of existing image URLs to keep. For simplicity, this example
            // only handles uploading *new* images. If you update a car without
            // selecting new images, the `productPictures` array will be empty on the frontend,
            // and Multer will still expect it.
            // A more robust solution might involve:
            // 1. Sending existing image URLs to retain (e.g., `carData.append('existingPictures', JSON.stringify(existingPicturesToKeep))`)
            // 2. Modifying your `updatecar` controller to handle both new files and existing URLs.

            const { data } = await axios.put(`${process.env.REACT_APP_API_URL}/api/car/update-car/${id}`, carData);

            if (data.success) {
                toast.success('Car Updated Successfully');
                navigate('/dashboard/admin/cars');
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.log(err);
            toast.error('Something went wrong while updating the car');
        }
    };

    const handleDelete = async () => {
        try {
            const { data } = await axios.delete(`${process.env.REACT_APP_API_URL}/api/car/delete-car/${id}`);
            if (data.success) {
                toast.success('Car Deleted Successfully');
                navigate('/dashboard/admin/cars');
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.log(err);
            toast.error('Something went wrong while deleting the car');
        }
    };

    useEffect(() => {
        getSingleProduct();
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className='container marginStyle'>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-3'>
                        <AdminMenu />
                    </div>
                    <div className='col-md-9 my-3'>
                        <h1 className='text-center'>Update Car</h1>
                        <div className='m-1'>
                            {/* Existing Images Display */}
                            <div className='mb-3'>
                                {existingPictures.length > 0 ? (
                                    <h5>Existing Images:</h5>
                                ) : (
                                    <h5>No Existing Images</h5>
                                )}
                                <div className='d-flex flex-wrap'>
                                    {existingPictures.map((imageUrl, index) => (
                                        <img
                                            key={index}
                                            src={imageUrl}
                                            alt={`existing_car_image_${index}`}
                                            className='img img-fluid me-2 mb-2'
                                            style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* New Image Upload Input */}
                            <div className='mb-3'>
                                <label className='btn btn-outline-primary col-md-12'>
                                    {productPictures.length > 0 ? `${productPictures.length} image(s) selected` : 'Upload New Images'}
                                    <input
                                        type='file'
                                        name='productPictures' // Ensure this matches your Multer field name
                                        accept='image/*'
                                        multiple
                                        onChange={handleImageChange}
                                        hidden
                                    />
                                </label>
                            </div>

                            {/* Preview of Newly Selected Images */}
                            <div className='mb-3'>
                                {productPictures.map((image, index) => (
                                    <div key={index} className='text-center'>
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`new_car_image_${index}`}
                                            className='img img-fluid'
                                            style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className='mb-3'>
                                <input type='text' value={name} placeholder='write a car Name' className='form-control' onChange={(e) => setname(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <input type='text' value={price} placeholder='write a car Price' className='form-control' onChange={(e) => setprice(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <input type='text' value={fuelType} placeholder='write a car Fuel Type' className='form-control' onChange={(e) => setfuelType(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <input type='text' value={transmission} placeholder='write a car Transmission' className='form-control' onChange={(e) => settransmission(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <input type='text' value={engineSize} placeholder='write a car EngineSize' className='form-control' onChange={(e) => setengineSize(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <input type='text' value={mileage} placeholder='write a car Mileage' className='form-control' onChange={(e) => setmileage(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <input type='text' value={safetyrating} placeholder='write a car Safetyrating' className='form-control' onChange={(e) => setsafetyrating(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <input type='text' value={warranty} placeholder='write a car Warranty' className='form-control' onChange={(e) => setwarranty(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <input type='text' value={seater} placeholder='write a car Seater' className='form-control' onChange={(e) => setseater(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <input type='text' value={size} placeholder='write a car Size' className='form-control' onChange={(e) => setsize(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <input type='text' value={fuelTank} placeholder='write a car FuelTank' className='form-control' onChange={(e) => setfuelTank(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <textarea rows={3} type='text' value={description} placeholder='write a car Description' className='form-control' onChange={(e) => setdescription(e.target.value)} />
                            </div>
                            <div className='mb-3'>
                                <button className='btn btn-success mx-2' onClick={handleSubmit}>Update Car</button>
                                <button className='btn btn-danger' onClick={handleDelete}>Delete Car</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default UpdateCar;
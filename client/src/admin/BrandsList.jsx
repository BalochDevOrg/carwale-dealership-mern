// client/src/admin/CreateCategory.jsx (Consider renaming to AllBrands.jsx)

import React, { useEffect, useState } from 'react'
import AdminMenu from './AdminMenu'
import axios from 'axios'
import CategoryForm from './BrandForm' // Consider renaming BrandForm to avoid confusion
import { Modal } from 'antd'
import toast from 'react-hot-toast'
import { ColorRing } from 'react-loader-spinner'

const CreateCategory = () => { // Consider renaming to AllBrands
    const [brands, setBrand] = useState([])
    const [visible, setVisible] = useState(false)
    const [selected, setSelected] = useState(null)
    const [updatedName, setUpdatedName] = useState("")
    const [loading, setLoading] = useState(true);

    const getAllBrand = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/brand/getAll-brand`)
            if (data.success) {
                setBrand(data.brands.reverse())
            }
            setLoading(false); // <--- Fixed: Set to false even on success
        } catch (err) {
            console.error('Error fetching brands:', err); // Use console.error
            toast.error('Failed to fetch brands.');
            setLoading(false); // <--- Fixed: Set to false on error
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            // No image update here, so plain JSON is fine
            const { data } = await axios.put(`${process.env.REACT_APP_API_URL}/api/brand/update-brand/${selected._id}`, { name: updatedName })
            if (data?.success) {
                toast.success('Brand Updated Successfully')
                setSelected(null)
                setUpdatedName("")
                setVisible(false)
                getAllBrand()
            } else {
                toast.error(data.message || 'Error Occured in Updating Brand') // Better error message
            }
        } catch (err) {
            console.error('Error updating brand:', err); // Use console.error
            toast.error('Something went wrong while updating brand.')
        }
    }

    const handleDelete = async (id) => {
        try {
            // DELETE requests typically don't send a body, `name: updatedName` is unnecessary here.
            const { data } = await axios.delete(`${process.env.REACT_APP_API_URL}/api/brand/delete-brand/${id}`)
            if (data?.success) {
                toast.success('Brand Deleted Successfully')
                getAllBrand()
            } else {
                // Use template literals correctly and provide data.message
                toast.error(data.message || `Failed to Delete Brand`)
            }
        } catch (err) {
            console.error('Error deleting brand:', err); // Use console.error
            toast.error('Something went wrong while deleting brand.')
        }
    }

    useEffect(() => {
        getAllBrand();
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className='container marginStyle'>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-3'>
                        <AdminMenu />
                    </div>
                    <div className='col-md-9 my-3'>
                        <h1 className='text-center'>All Brands List</h1>
                        {loading ?
                            <div className="h-100 d-flex align-items-center justify-content-center">
                                <ColorRing
                                    visible={true}
                                    colors={['#000435', 'rgb(14 165 233)', 'rgb(243 244 246)', '#000435', 'rgb(14 165 233)']}
                                />
                            </div>
                            :
                            <>
                                {brands.length === 0 ? (
                                    <p className="text-center">No brands found. Please create one!</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <thead className="table-dark text-center">
                                                <tr>
                                                    <th>Brand Image</th> {/* Clarified header */}
                                                    <th>Name</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className='text-center'>
                                                {brands?.map(c => (
                                                    <tr key={c._id}> {/* Added key prop */}
                                                        <td>
                                                        {c.brandPictures ? ( // Check if the string exists and is not empty
    <img src={c.brandPictures} alt={c.name}
        style={{ maxWidth: '100%', maxHeight: '50px', objectFit: 'contain' }}
    />
) : (
    <img src="https://via.placeholder.com/50" alt="No Image"
        style={{ maxWidth: '100%', maxHeight: '50px', objectFit: 'contain' }}
    />
)}
                                                            
                                                        </td>
                                                        <td>
                                                            <p className="fw-normal mb-1">{c.name}</p>
                                                        </td>
                                                        <td>
                                                            <button className='btn btn-primary m-2' onClick={() => { setVisible(true); setUpdatedName(c.name); setSelected(c) }}>Edit</button>
                                                            <button className='btn btn-danger' onClick={() => handleDelete(c._id)}>Delete</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <Modal onCancel={() => setVisible(false)} footer={null} visible={visible}>
                                    <CategoryForm value={updatedName} setValue={setUpdatedName} handleSubmit={handleUpdate} />
                                </Modal>
                            </>
                        }
                    </div>
                </div>
            </div>
        </div >
    )
}

export default CreateCategory // Remember to change this if you rename the file
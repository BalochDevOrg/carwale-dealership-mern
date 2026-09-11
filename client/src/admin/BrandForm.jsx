// client/src/admin/CategoryForm.jsx (Consider renaming to BrandForm.jsx)

import React from 'react'

const CategoryForm = ({ handleSubmit, value, setValue }) => { // Consider renaming to BrandForm
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="px-5">
                    <label htmlFor="exampleInputEmail1" className="form-label">Brand Name</label> {/* Fixed 'for' to 'htmlFor' */}
                    <input type="text" value={value} onChange={e => setValue(e.target.value)} className="form-control" />
                    <button type='submit' className='btn btn-success my-3' >Submit</button>
                </div>
            </form>
        </div>
    )
}

export default CategoryForm // Remember to change this if you rename the file
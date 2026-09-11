import React, { useEffect, useState } from 'react';
import '../styles/brands.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaCarSide } from 'react-icons/fa';
import { ColorRing } from 'react-loader-spinner';
import { getBrandImage } from '../utils/getImageUrl';

const Brandshome = () => {
    const [brands, setBrand] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAllBrand = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/brand/getAll-brand`);
            if (data.success) {
                setBrand(data.brands.reverse());
            }
            setLoading(false);
        } catch (err) {
            console.log(err);
            // Set loading to false even on error to prevent infinite spinner
            setLoading(false); 
        }
    };

    useEffect(() => {
        getAllBrand();
    }, []); // Added empty dependency array to run once on mount

    return (
        <div>
            <section id="brands" className="brand_wrapper">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center mb-5">
                            <p className="brand_subtitle">Explore an array of exciting new Brands !</p>
                            <h2 className="brand_title">Latest Brands showcase</h2>
                        </div>
                    </div>
                    {loading ?
                        <div className="h-100 d-flex align-items-center justify-content-center">
                            <ColorRing
                                visible={true}
                                colors={['#000435', 'rgb(14 165 233)', 'rgb(243 244 246)', '#000435', 'rgb(14 165 233)']}
                            />
                        </div>
                        :
                        <>
                            <div className="row justify-content-center align-middle">
                                {brands?.slice(0, 8).map(c => (
                                    <div key={c._id} className="col-lg-3 col-md-4 col-sm-6 mb-4 showcase_card align-middle"> {/* Added key prop */}
                                        <Link to={`/brand/${c.slug}`}>
                                            <img
                                                decoding="async"
                                                src={getBrandImage(c.brandPictures)}
                                                className="mb-4 img-fluid"
                                                style={{ maxWidth: '100%', maxHeight: '200px', minHeight: '200px', objectFit: 'contain' }}
                                                alt={c.name} // Added alt attribute
                                            />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                            <div className="col-12 text-center">
                                <Link to='/brands' className='btn btn-lg text-white' style={{ backgroundColor: 'blueviolet' }}>
                                    View More <FaCarSide size={25} />
                                </Link>
                            </div>
                        </>
                    }
                </div>
            </section>
        </div>
    );
};

export default Brandshome;
// import React, { useEffect, useState } from 'react'
// import '../styles/brands.css'
// import axios from 'axios'
// import { Link } from 'react-router-dom'
// import { FaCarSide } from 'react-icons/fa'
// import { ColorRing } from 'react-loader-spinner'

// const Brandshome = () => {
//     const [brands, setBrand] = useState([])
//     const [loading, setLoading] = useState(true);

//     const getAllBrand = async () => {
//         try {
//             const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/brand/getAll-brand`)
//             if (data.success) {
//                 setBrand(data.brands.reverse())
//             }
//             setLoading(false);
//         } catch (err) {
//             console.log(err);
//             setLoading(true);
//         }
//     }

//     useEffect(() => {
//         getAllBrand();
//     })
//     return (
//         <div>
//             <section id="brands" className="brand_wrapper">
//                 <div className="container">
//                     <div className="row">
//                         <div className="col-12 text-center mb-5">
//                             <p className="brand_subtitle">Explore an array of exciting new Brands !</p>
//                             <h2 className="brand_title">Latest Brands showcase</h2>
//                         </div>
//                     </div>
//                     {loading ?
//                         <div className="h-100 d-flex align-items-center justify-content-center">
//                             <ColorRing
//                                 visible={true}
//                                 colors={['#000435', 'rgb(14 165 233)', 'rgb(243 244 246)', '#000435', 'rgb(14 165 233)']}
//                             />
//                         </div>
//                         :
//                         <>
//                             <div className="row justify-content-center">
//                                 {brands?.slice(0, 8).map(c => (
//                                     <div className="col-lg-3 col-md-4 col-sm-6 mb-4 showcase_card">
//                                         <Link to={`/brand/${c.slug}`}>
//                                             <img
//                                                 decoding="async"
//                                                 src={getBrandImage(c.brandPictures)}
//                                                 className="mb-4 img-fluid"
//                                                 style={{ maxWidth: '100%', maxHeight: '190px', objectFit: 'contain' }}
//                                             />
//                                         </Link>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="col-12 text-center">
//                                 <Link to='/brands' className='btn btn-lg text-white' style={{ backgroundColor: 'blueviolet' }}>
//                                     View More <FaCarSide size={25} />
//                                 </Link>
//                             </div>
//                         </>
//                     }
//                 </div>
//             </section>
//         </div>
//     )
// }

// export default Brandshome

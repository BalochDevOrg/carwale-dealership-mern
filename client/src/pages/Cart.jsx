import React, { useEffect, useState } from 'react';
import { useCart } from '../context/cart';
import { useAuth } from '../context/auth';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getCarImage } from '../utils/getImageUrl';

const Cart = () => {
  const [cart, setcart] = useCart();
  const [auth] = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🧮 Calculate total price
  const totalPrice = () => {
    try {
      let total = 0;
      cart?.forEach((item) => {
        const priceValue = item.price.toString().replace(/[^\d]/g, '');
        total += parseInt(priceValue);
      });
      return total.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
      });
    } catch (error) {
      console.error(error);
      return '₹0';
    }
  };

  // 🗑 Remove item from cart
  const removeCartItem = (pid) => {
    try {
      const updatedCart = cart.filter(item => item._id !== pid);
      setcart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      toast.success('Item Removed Successfully');
    } catch (err) {
      console.log(err);
    }
  };

  // 🧾 Place order without payment
  const handlePlaceOrder = async () => {
    try {
      if (!auth?.token || !auth?.user?.address) {
        toast.error("Please login and provide address first.");
        return;
      }

      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/create-order`,
        { cart },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        toast.success("Order placed successfully!");
        localStorage.removeItem("cart");
        setcart([]);
        navigate("/dashboard/user/order");
      } else {
        toast.error("Failed to place order.");
      }

      setLoading(false);
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Error placing order.");
      setLoading(false);
    }
  };

  return (
    <div className="my-5">
      <section className="h-100 h-custom">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col">
              <div className="card">
                <div className="card-body p-4">
                  <div className="row">
                    {/* Left: Cart Items */}
                    <div className="col-lg-7">
                      <h5 className="mb-3">
                        {!auth?.user ? "Hello Guest" : `Hello ${auth.user.name}`}
                      </h5>
                      <hr />
                      <p className="mb-0">
                        {cart?.length
                          ? `You have ${cart.length} item(s) in your cart`
                          : "Your cart is empty."}
                      </p>

                      {cart?.map((p) => (
                        <div className="card my-3" key={p._id}>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex flex-row align-items-center">
                                <Link to={`/car/${p.slug}`}>
                                  <img
                                    src={getCarImage(p.productPictures)}
                                    alt={p.name}
                                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                                    className="img-fluid rounded"
                                  />
                                </Link>
                                <div className="mx-3">
                                  <p className="mb-1"><strong>{p.name}</strong></p>
                                  <p className="mb-1 badge bg-primary">{p.brand?.name}</p>
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="mb-1">₹ {p.price} Lakhs</p>
                                <button
                                  className="btn btn-danger"
                                  onClick={() => removeCartItem(p._id)}
                                >
                                  <HiOutlineTrash size={20} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right: Summary and Place Order */}
                    <div className="col-lg-5">
                      <div className="card text-white bg-dark rounded-3">
                        <div className="card-body">
                          <h3 className="text-center mb-4">Cart Summary</h3>
                          <hr />
                          <h5>Total: {totalPrice()} Lakhs</h5>
                          <div className="mb-3">
                            <h5>Delivery Address:</h5>
                            {auth?.user?.address ? (
                              <>
                                <p>{auth.user.address}</p>
                                <button
                                  className="btn btn-warning"
                                  onClick={() => navigate("/dashboard/user/profile")}
                                >
                                  Update Address
                                </button>
                              </>
                            ) : (
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => navigate("/dashboard/user/profile")}
                              >
                                Add Delivery Address
                              </button>
                            )}
                          </div>

                          {/* Place Order Button */}
                          {auth?.token && cart?.length > 0 && (
                            <button
                              className="btn btn-light w-100 mt-3"
                              onClick={handlePlaceOrder}
                              disabled={loading || !auth?.user?.address}
                            >
                              {loading ? "Placing Order..." : "Place Order"}
                            </button>
                          )}

                          {!auth?.token && (
                            <button
                              className="btn btn-primary mt-3 w-100"
                              onClick={() => navigate("/login")}
                            >
                              Login to Checkout
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cart;


// import React, { useEffect, useState } from 'react'
// import { useCart } from '../context/cart'
// import { useAuth } from '../context/auth'
// import { Link, useNavigate } from 'react-router-dom'
// import DropIn from "braintree-web-drop-in-react";
// import axios from 'axios'
// import { HiOutlineTrash } from 'react-icons/hi'
// import toast from 'react-hot-toast';

// const Cart = () => {
//     const [cart, setcart] = useCart();
//     const [auth, setAuth] = useAuth();
//     const [clientToken, setClientToken] = useState("");
//     const [instance, setInstance] = useState("");
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate()

//     const totalPrice = () => {
//         try {
//             let total = 0;
//             cart?.map((item) => {
//                 const po = item.price.replace(' lakh', '')
//                 total = total + parseInt(po);
//             });
//             return total.toLocaleString("en-US", {
//                 style: "currency",
//                 currency: "INR",
//             });
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     const removeCartItem = (pid) => {
//         try {
//             let myCart = [...cart]
//             let index = myCart.findIndex(item => item._id === pid)
//             myCart.splice(index, 1)
//             setcart(myCart)
//             localStorage.setItem('cart', JSON.stringify(myCart))
//         } catch (err) {
//             console.log(err)
//         }
//     }

//     const getToken = async () => {
//         try {
//             const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/car/braintree/token`);
//             setClientToken(data?.clientToken);
//         } catch (error) {
//             console.log(error);
//         }
//     };
//     useEffect(() => {
//         getToken();
//         window.scrollTo(0, 0)
//     }, [auth?.token]);

//     const handleBypassPayment = async () => {
//         try {
//           setLoading(true);
//           const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/order/create`, {
//             cart,
//             address: auth?.user?.address,
//           }, {
//             headers: {
//               Authorization: auth?.token
//             }
//           });
      
//           if (data?.success) {
//             localStorage.removeItem("cart");
//             setcart([]);
//             toast.success("Order placed successfully!");
//             navigate("/dashboard/user/order");
//           } else {
//             toast.error("Failed to place order.");
//           }
      
//           setLoading(false);
//         } catch (error) {
//           console.log(error);
//           toast.error("Something went wrong.");
//           setLoading(false);
//         }
//       };
//     const notify = () => toast.success('Item Removed Successfully')

//     return (
//         <div className='my-5'>
//             <section className="h-100 h-custom">
//                 <div className="container py-5 h-100">
//                     <div className="row d-flex justify-content-center align-items-center h-100">
//                         <div className="col">
//                             <div className="card">
//                                 <div className="card-body p-4">
//                                     <div className="row">
//                                         <div className="col-lg-7">
//                                             <h5 className="mb-3">{!auth?.user
//                                                 ? "Hello Guest"
//                                                 : `Hello  ${auth?.token && auth?.user?.name}`}
//                                             </h5>
//                                             <hr />

//                                             <div className="d-flex justify-content-between align-items-center mb-4">
//                                                 <div>
//                                                     <p className="mb-1">Shopping cart</p>
//                                                     <p className="mb-0">{cart?.length
//                                                         ? `You Have ${cart.length} items in your cart ${auth?.token ? "" : "please login to checkout !"
//                                                         }`
//                                                         : " Your Cart Is Empty"}
//                                                     </p>
//                                                 </div>
//                                             </div>

//                                             {cart?.map((p) => (
//                                                 <div className="card my-3 mb-lg-0">
//                                                     <div className="card-body">
//                                                         <div className="d-flex justify-content-between">
//                                                             <div className="d-flex flex-row align-items-center">
//                                                                 <div>
//                                                                     <Link to={`/car/${p.slug}`} className='text-center'>
//                                                                     <img
//   src={p.productPictures[0]} // <-- use directly
//   alt={p.name}
//   style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }}
// />
//                                                                     </Link>

//                                                                 </div>
//                                                                 <div className="mx-2">
//                                                                     <p className='sizePrice'><span className='badge rounded-pill text-bg-primary'>{p.brand.name}</span></p>
//                                                                     <p className="sizePrice">{p.name}</p>
//                                                                 </div>
//                                                             </div>
//                                                             <div className="text-center">
//                                                                 <p className="sizePrice"> ₹ {p.price} Lakhs</p>
//                                                                 <button
//                                                                     className="btn btn-danger"
//                                                                     onClick={() => { removeCartItem(p._id); notify() }}
//                                                                 >
//                                                                     <HiOutlineTrash size={20} />
//                                                                 </button>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>

//                                         <div className="col-lg-5">
//                                             <div className="card text-white rounded-3 cartStyle">
//                                                 <div className='card-body'>
//                                                     <div className="text-center">
//                                                         <h2>Cart Summary</h2>
//                                                         <p>Total | Checkout | Payment</p>
//                                                         <hr />
//                                                         <h4>Total : {totalPrice()} Lakhs</h4>
//                                                         {auth?.user?.address ? (
//                                                             <>
//                                                                 <div className="mb-3">
//                                                                     <h4>Current Address</h4>
//                                                                     <h5>{auth?.user?.address}</h5>
//                                                                     <button
//                                                                         className="btn btn-warning my-2"
//                                                                         onClick={() => navigate("/dashboard/user/profile")}
//                                                                     >
//                                                                         Update Address
//                                                                     </button>
//                                                                 </div>
//                                                             </>
//                                                         ) : (
//                                                             <div className="mb-3">
//                                                                 {auth?.token ? (
//                                                                     <button
//                                                                         className="btn btn-outline-warning"
//                                                                         onClick={() => navigate("/dashboard/user/profile")}
//                                                                     >
//                                                                         Update Address
//                                                                     </button>
//                                                                 ) : (
//                                                                     <button
//                                                                         className="btn btn-primary"
//                                                                         onClick={() =>
//                                                                             navigate("/login", {
//                                                                                 state: "/cart",
//                                                                             })
//                                                                         }
//                                                                     >
//                                                                         Plase Login to checkout
//                                                                     </button>
//                                                                 )}
//                                                             </div>
//                                                         )}
//                                                         <div className="mt-2">
//                                                         {auth?.token && cart?.length ? (
//   <button
//     className="btn btn-dark mt-3"
//     onClick={handleBypassPayment}
//     disabled={loading || !auth?.user?.address}
//   >
//     {loading ? "Placing Order..." : "Place Order"}
//   </button>
// ) : null}
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                         </div>

//                                     </div>

//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section >
//         </div >
//     )
// }

// export default Cart

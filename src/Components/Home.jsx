import { useEffect, useState } from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Home = () => { 
    const [addresses, setAddresses] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null);
 
    useEffect(() => {
        fetch('https://cyborgcertifier-production.up.railway.app/get_stamp/')
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then((data) => {
                setAddresses(data['data']);  
                setIsLoading(false);  
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error.message);  
                setIsLoading(false);  
            });
    }, []);
 
    if (isLoading) {
        return (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <div className="spinner-grow" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        );
      }
    if (error) {
        return <div>Error: {error}</div>;
    }
 
    if (addresses.length === 0) {
        return <div>No addresses found.</div>;
    }

    return (
    <div className="container main">
        <div className="row align-items-center"> 
          <div className="col-md-6 animation-container">
            <DotLottieReact
              src="https://lottie.host/c144bf66-89a5-44b2-8bae-c500dcd5936d/4AwpCagyCP.lottie"
              loop
              autoplay
            />
            <br />
            <br />
            <br /> 
          </div>
       
          <div className="col-md-6 address-container"> 
          <div class="form-floating mb-6">
  <input type="email" class="form-control" id="floatingInput" placeholder="example@gmail.com"/>
  <label for="floatingInput">Email address</label>
</div>
<br /><div className="col-md">
  <div className="form-floating">
    <select className="form-select" id="floatingSelectGrid">
      <option selected>Select your nearby location</option>
      {addresses.map((address, index) => (
        <option key={index} value={address.address}>{address.address}</option>
      ))}
    </select>
    <label htmlFor="floatingSelectGrid">Available Facilities</label>
  </div>
</div>

                 <br />
                 <div className="form-floating">
                 <select    className="form-select" id="floatingSelectGrid">
                     <option selected>Select ID Type</option>
                     <option value="ID_CARD">ID Card</option><option value="ID_BOOK">ID Book</option> 
                   </select>
                   <label for="floatingSelectGrid">Select ID</label>
                   </div>
                   
             <br />
             <div class="d-grid gap-2 col-7 mx-auto">
             <a href="/" className="btn btn-outline-primary ">Continue</a>
             </div>
                   </div>
          </div>
        </div> 
    );
};

export default Home;
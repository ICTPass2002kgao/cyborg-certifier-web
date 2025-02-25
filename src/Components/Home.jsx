import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Home = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedStamp, setSelectedStamp] = useState("");
  const [selectedID, setSelectedID] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/get_stamp/")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setAddresses(data["data"]);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  const handleAddressChange = (e) => {
    const address = e.target.value;
    setSelectedAddress(address);

    const found = addresses.find((item) => item.address === address);
    if (found) {
      setSelectedStamp(found.stamp);
    } else {
      setSelectedStamp("");
    }
  };

  const handleSubmit = () => {
    navigate("/verify-face", {

      state: {
        email,
        selectedAddress,
        selectedStamp,
        selectedID,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center"  >
        <div className="spinner-grow" style={{color:'white'}} role="status">
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
          <div className="form-floating mb-6">
            <input
              type="email"
              className="form-control"
              id="floatingInput"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="floatingInput">Email address</label>
          </div>

          <br />

          <div className="col-md">
            <div className="form-floating">
              <select
                className="form-select"
                id="floatingSelectGrid"
                value={selectedAddress}
                onChange={handleAddressChange}
              >
                <option value="" disabled>Select your nearby location</option>
                {addresses.map((address, index) => (
                  <option key={index} value={address.address}>
                  {address.address}
                </option>
                
                ))}
                  <option value="Other">
                  Other
                </option>
              </select>
              <label htmlFor="floatingSelectGrid">Available Facilities</label>
            </div>
          </div>
          <br />
 
          <div className="form-floating">
            <select
              className="form-select"
              id="floatingSelectID"
              value={selectedID}
              onChange={(e) => setSelectedID(e.target.value)}
            >
              <option value="" disabled>Select Document Type</option>
              <option value="ID_CARD">ID Card</option>
              <option value="ID_BOOK">ID Book</option>
              <option value="Other">Other</option>
            </select>
            <label htmlFor="floatingSelectID">Select Document Type</label>
          </div>

          <br /> 
          <div className="d-grid gap-2 col-8 mx-auto">
            <button className="btn btn-outline-primary" onClick={handleSubmit}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

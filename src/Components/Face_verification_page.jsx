import { useRef, useEffect, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import { useLocation } from "react-router-dom";
import id_card from '../assets/front_id.jpg';
import id_book from '../assets/id_book.jpg';
import axios from "axios";
import { Modal, Toast, Button, Row, Col } from 'react-bootstrap';

function FaceVerificationPage() {
  const location = useLocation();
  const { email, selectedStamp, selectedID } = location.state || {};
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState({ front: null, back: null });
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [showInstruction, setShowInstruction] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(true);
  const [showToast, setShowToast] = useState(false);
  let camera = useRef(null);

  function onResults(results) {
    if (!webcamRef.current || !canvasRef.current) return;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    const canvasCtx = canvasRef.current.getContext("2d");

    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw face mesh points
    if (results.multiFaceLandmarks) {
      results.multiFaceLandmarks.forEach(landmarks => {
        canvasCtx.fillStyle = "red";
        landmarks.forEach(point => {
          canvasCtx.beginPath();
          canvasCtx.arc(point.x * videoWidth, point.y * videoHeight, 2, 0, 2 * Math.PI);
          canvasCtx.fill();
        });
      });
    }
  }

  useEffect(() => {
    console.log(`http://127.0.0.1:8000${selectedStamp}`);
    if (!webcamRef.current || !webcamRef.current.video) return;

    const initializeCamera = async () => {
      setLoading(true);

      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({ maxNumFaces: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      faceMesh.onResults(onResults);

      camera.current = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video });
        },
        width: 320,
        height: 180,
      });

      camera.current.start();
      setCameraStarted(true);
      setLoading(false);
    };

    initializeCamera();
  }, [cameraStarted]);

  const handleFileChange = (event, type) => {
    setShowInstruction(false);
    const file = event.target.files[0];
    if (file) {
      setUploadedImages((prev) => ({ ...prev, [type]: file }));
         
    }
  };

  const captureFaceAndSubmit = async () => {
    if (!webcamRef.current) return;

    if (!uploadedImages.front || (selectedID === "ID_CARD" && !uploadedImages.back)) {
      alert("Please upload both front and back images of your ID.");
      return;
    }

    setLoading(true);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const blob = await fetch(imageSrc).then((res) => res.blob());
      
      const formData = new FormData();
      formData.append("email", email); 
      const _res = await fetch(`http://127.0.0.1:8000${selectedStamp}`);  
      const _blob = await _res.blob(); 
      const file = new File([_blob], "stamp.jpg", { type: _blob.type });  
      formData.append("stamp", file);  
      formData.append("recognised_face", blob, "captured_face.jpg");
      formData.append("id_front_face", uploadedImages.front);

      if (selectedID === "ID_CARD" && uploadedImages.back) {
        formData.append("id_back_face", uploadedImages.back);
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/verify-faces/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setApiResponse(response.data);
      if (response.data.match === "Matched") {
        setPdfUrl(response.data.pdf_url);
        setShowToast(true); 
        setCameraVisible(false);   
      } else {
        setShowFailureModal(true);  
      }
    } catch (error) {
      setApiResponse(error.response?.data?.error || "An error occurred while verifying images.");
      console.error("Error verifying images", error);
      setShowFailureModal(true);  
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-container">
        
      {/* Failure Modal */}
      <Modal show={showFailureModal} onHide={() => setShowFailureModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verification Unsuccessful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Face verification failed. Please try again.</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={() => { setShowFailureModal(false); setCameraVisible(true); }}>Retry</button>
        </Modal.Footer>
      </Modal>

      {selectedID ==="ID_CARD" && selectedID ==="ID_CARD" ?
      <Modal show={showInstruction} onHide={() => setShowInstruction(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Instructions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={selectedID === "ID_CARD" ? id_card : id_book} alt="Instruction" className="img-fluid" />
          <p>Please crop your ID like this before uploading.</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={() => setShowInstruction(false)}>Got it</button>
        </Modal.Footer>
      </Modal>:<Modal show={showInstruction} onHide={() => setShowInstruction(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Instructions</Modal.Title>
        </Modal.Header>
        <Modal.Body> 
          <p>Please make sure the document you're certifying is an original document, it document should not be in Black and white.</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={() => setShowInstruction(false)}>Got it</button>
        </Modal.Footer>
      </Modal>}

      <div className="upload-section">
        {loading &&  <div className="d-flex justify-content-center align-items-center"  >
        <div className="spinner-grow" role="status" style={{color:'white'}}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>}
        <label className="form-label">Upload your ID (Front) *</label>
        <input
          type="file"
          className="form-control"
          onChange={(e) => handleFileChange(e, "front")}
          required
        />
       
        {selectedID === "ID_CARD" && (
          <>
            <label className="form-label">Upload your ID (Back) *</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => handleFileChange(e, "back")}
              required
            />
          </>
        )}
         {showToast && (
          <Toast className="mt-2" bg="success" style={{width:'100%', position: "relative", zIndex: 10 }}>
            <Toast.Body>
              <Row className="d-flex justify-content-between align-items-center">
                <Col xs="auto">
                  <span>Your document certified successfully!</span>
                </Col>
                <Col xs="auto">
                  <a href={pdfUrl} style={{width:'100%'}} className="btn btn-outline-dark"
                   target="_blank" rel="noopener noreferrer"> 
                    View </a>
                </Col>
              </Row>
            </Toast.Body>
          </Toast>
        )}
        
      </div>

      {uploadedImages.front && (selectedID !== "ID_CARD" || uploadedImages.back) && !loading && cameraVisible && (
        <div className="camera-section">
          <Webcam ref={webcamRef}  style={{width:'100%'}} screenshotFormat="image/jpeg" className="webcam" />
          <canvas ref={canvasRef} style={{width:'100%'}}  className="canvas-overlay" /> 
          <br />
          <button className="btn btn-outline-success" onClick={captureFaceAndSubmit} id="btn-verify">Verify</button>
        </div>
      )}
    </div>
  );
}

export default FaceVerificationPage;

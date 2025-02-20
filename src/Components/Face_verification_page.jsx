import { useRef, useEffect, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import { useLocation } from "react-router-dom";
import id_card from '../assets/front_id.jpg';
import id_book from '../assets/id_book.jpg';
import axios from "axios";
import { Modal } from 'react-bootstrap';

function FaceVerificationPage() {
  const location = useLocation();
  const { email, selectedStamp, selectedID } = location.state || {};
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState({ front: null, back: null });
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
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
  }

  useEffect(() => {
    const initializeCamera = async () => {
      setLoading(true);
      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({ maxNumFaces: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      faceMesh.onResults(onResults);
      if (webcamRef.current && webcamRef.current.video) {
        camera.current = new cam.Camera(webcamRef.current.video, {
          onFrame: async () => {
            await faceMesh.send({ image: webcamRef.current.video });
          },
          width: 320,
          height: 180,
        });
        camera.current.start();
        setCameraStarted(true);
      }
      setLoading(false);
    };
    initializeCamera();
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  const handleFileChange = (event, type) => {
    setShowInstruction(false);
    const file = event.target.files[0];
    if (file) {
      setUploadedImages((prev) => ({ ...prev, [type]: file }));
    }
  };

  const captureFaceAndSubmit = async () => {
    if (!webcamRef.current) return;
    setLoading(true);
    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const formData = new FormData();
    formData.append("email", email);
    formData.append("stamp", `https://cyborgcertifier-production.up.railway.app${selectedStamp}`);
    formData.append("recognised_face", blob, "captured_face.jpg");
    if (uploadedImages.front) formData.append("id_front_face", uploadedImages.front);
    if (selectedID === 'ID_CARD' && uploadedImages.back) {
      formData.append("id_back_face", uploadedImages.back);
    }
    try {
      const response = await axios.post(
        "https://cyborgcertifier-production.up.railway.app/verify-faces/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setApiResponse(response.data);
      if (response.data.match === "Matched") {
        setPdfUrl(response.data.pdf_url);
      }
    } catch (error) {
      setApiResponse(error.response?.data?.error || "An error occurred while verifying images.");
      console.error("Error verifying images", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-container">
      {apiResponse && <div className="alert alert-success">{apiResponse}</div>}

      <Modal show={showInstruction} onHide={() => setShowInstruction(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Instructions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={selectedID === 'ID_CARD' ? id_card : id_book} alt="Instruction" className="img-fluid" />
          <p>Please crop your id like this before uploading.</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={() => setShowInstruction(false)}>Got it</button>
        </Modal.Footer>
      </Modal>

      <div className="upload-section">
      {loading && <div className="alert alert-info">Processing, please wait...</div>}
        <label className="form-label">Upload your ID</label>
        <input type="file" className="form-control" onChange={(e) => handleFileChange(e, "front")} />
        {selectedID === 'ID_CARD' && <input type="file" className="form-control" onChange={(e) => handleFileChange(e, "back")} />}
      </div>

      {uploadedImages.front && !loading && (
        <div className="camera-section">
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="webcam" />
          {countdown > 0 && <h3 className="text-center mt-3">Capturing in {countdown} seconds...</h3>}
          <canvas ref={canvasRef} className="canvas-overlay" />
          <button className="btn btn-outline-success" onClick={captureFaceAndSubmit} id="btn-verify">Verify</button>
        </div>
      )}

      {pdfUrl && (
        <div className="alert alert-success">
          Face Matched! <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">View Certified Document</a>
        </div>
      )}
    </div>
  );
}

export default FaceVerificationPage;

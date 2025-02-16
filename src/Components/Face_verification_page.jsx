import { useRef, useEffect } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import * as Facemesh from "@mediapipe/face_mesh";
import Webcam from "react-webcam";
import { useLocation } from "react-router-dom";
import id_card from '../assets/front_id.jpg';
import id_book from '../assets/id_book.jpg';


function FaceVerificationPage() {
  const location = useLocation();
  const { email, selectedAddress, selectedStamp, selectedID } = location.state || {};
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const connect = window.drawConnectors;
  var camera = null;
 
  function onResults(results) {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
 
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
          color: "#C0C0C070",
          lineWidth: 0.5,
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
            lineWidth:0, 
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
            lineWidth:0, 

        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
        lineWidth:0, 
          color: "#FF3030", 
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
        lineWidth:0.5, 
          color: "#30FF30",
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
        lineWidth:0.5, 
          color: "#E0E0E0",
        });
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
        lineWidth:0,  
        });
      }
    }

    canvasCtx.restore();
  }

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);
 
    if (webcamRef.current && webcamRef.current.video) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []); 

  return (
    <div className="main">
        <div className="document-uploads">
        <div className="container">
          
      <div class="mb-3"  data-bs-toggle="modal" data-bs-target="#staticBackdrop">
  <label for="formFile" class="form-label">Please crop your document like this.</label>
  <input class="form-control" type="file" id="formFile" disabled/>
</div>  
      {selectedID == 'ID_CARD' ?  
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="staticBackdropLabel">Please crop your document like this.</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            <img src={id_card} width="100%" alt="" />
            </div>
            <div class="modal-footer"> 
              
              <input class="form-control" type="file" id="formFile"  /> 
            </div>
          </div>
        </div>
        </div>:
         <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
         <div class="modal-dialog">
           <div class="modal-content">
             <div class="modal-header">
               <h1 class="modal-title fs-5" id="staticBackdropLabel">Please crop your document like this.</h1>
               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
             </div>
             <div class="modal-body">
              
            <img src={id_book} width="100%" alt="" />
             </div>
             <div class="modal-footer">
             <input class="form-control" data-bs-dismiss="modal" type="file" id="formFile"  />  
             </div>
           </div>
         </div>
         </div>
        
        }
      {selectedStamp && (
        <div> 
          <img src={`https://cyborgcertifier-production.up.railway.app${selectedStamp}`} alt="Stamp" width="200px" />
        </div>
      )}
    </div>
        </div>
    <div className="camera-section">
         
      <div className="FaceVerificationPage">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 350,
            height: 300,
          }}
        />
        <canvas
          ref={canvasRef}
          className="output_canvas"
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 350,
            height: 300,
          }}
        />
      </div> 
    </div>

    </div>
  );
}

export default FaceVerificationPage;

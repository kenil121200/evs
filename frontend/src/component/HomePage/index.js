import React, { useState, useRef } from 'react';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import AdjustIcon from '@mui/icons-material/Adjust';
import Webcam from 'react-webcam';
import './index.css';
import '../AwsConfigFile/aws-exports';
import S3Singleton from '../AwsConfigFile/s3';
const uuid = require('uuid');

function Home() {
  const [cameraActive, setCameraActive] = useState(false);
  const [imageCaptured, setImageCaptured] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadResultMessage, setUploadResultMessage] = useState('Please capture an image to verify identity');
  const [isAuth, setAuth] = useState(false);
  const [visitorImageUrl, setVisitorImageUrl] = useState(null);
  const webcamRef = useRef(null);

  function startCamera() {
    setCameraActive(true);
  }

  function captureImage() {
    const imageSrc = webcamRef.current.getScreenshot();
    setImagePreview(imageSrc);
    setCameraActive(false);
    setImageCaptured(true);
  }

  function recaptureImage() {
    setImagePreview(null);
    setImageCaptured(false);
    setCameraActive(true);
  }

  function sendImage(e) {
    e.preventDefault();
  
    if (!imagePreview) {
      alert("Please capture an image from the webcam.");
      return;
    }
  
    const visitorImageName = uuid.v4();
    const visitorImageNameFetch = visitorImageName + ".jpeg";
  
    // Convert base64 image to a blob
    const blob = dataURItoBlob(imagePreview);
    const imageFile = new File([blob], `${visitorImageName}.jpeg`, { type: 'image/jpeg' });
  
    fetch(`${process.env.REACT_APP_AWS_API_URL}/${process.env.REACT_APP_AWS_S3_VISITOR_BUCKET_NAME}/${visitorImageName}.jpeg`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg'
      },
      body: imageFile
    }).then(async () => {
      await fetchImage(visitorImageNameFetch);
      const response = await authenticate(visitorImageName);
      if (response.Message === 'Success') {
        setAuth(true);
        setUploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, Welcome to the office. Your attendance has been successfully marked.`)
        const postData = {
          firstName: response.firstName,
          lastName: response.lastName
        };
  
        fetch(`${process.env.REACT_APP_AWS_API_URL}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData),
          redirect: "follow"
        }).then(response => {
          response.text();
        }).catch(error => {
          console.error('Error while making POST request:', error);
          // Handle error
        });
  
        // Reset capture process
        setImagePreview(null);
        setImageCaptured(false);
        setCameraActive(false);
  
      } else {
        setAuth(false);
        setImagePreview(null);
        setImageCaptured(false);
        setCameraActive(false);
        setUploadResultMessage('Person is not an employee. Please contact Administration.')
      }
    }).catch(error => {
      setAuth(false);
      setImagePreview(null);
      setImageCaptured(false);
      setCameraActive(false);
      setUploadResultMessage('There is a system error. Please contact the IT desk.');
      console.error(error)
    })
  }
  

  async function authenticate(visitorImageName) {
    const requestUrl = `${process.env.REACT_APP_AWS_API_URL}/${process.env.REACT_APP_AWS_REKOGNITION_COLLECTION}?` + new URLSearchParams({
      objectKey: `${visitorImageName}.jpeg`
    });
    return await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(response => response.json())
      .then((data) => {
        return data;
      }).catch(error => console.error(error));
  }

  async function fetchImage(imageKey) {
    var image;
    try {
      const s3 = await S3Singleton.getInstance();
      s3.getObject({
        Bucket: process.env.REACT_APP_AWS_S3_VISITOR_BUCKET_NAME,
        Key: imageKey,
      }, (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        if (data) {
          image = `data:image/jpeg;base64,${data.Body.toString('base64')}`;
          setVisitorImageUrl(image);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  return (
    <div className="Home">
      {!cameraActive && !imageCaptured && (
        <Button variant="contained" onClick={startCamera} endIcon={<AddAPhotoIcon />}>Start Camera</Button>
      )}
      {cameraActive && !imageCaptured && (
        <div className="upload-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam-preview"
          />
          <Button variant="contained" onClick={captureImage} endIcon={<AdjustIcon />}>Capture Image</Button>
        </div>
      )}
      {imagePreview && (
        <div className="upload-container">
          <img src={imagePreview} alt="Captured" style={{ marginBottom: '20px' }} />
          <Button variant="contained" onClick={recaptureImage} style={{ marginBottom: '20px' }} endIcon={<AddAPhotoIcon />}>Recapture</Button>
        </div>
      )}
      {imageCaptured && (
        <div className="upload-container">
          <form onSubmit={sendImage}>
            <Button type="submit" variant="contained" endIcon={<SendIcon />}>
              Verify Identity
            </Button>
          </form>
        </div>
      )}
      <div className={`upload-result-message ${isAuth ? 'success' : 'failure'}`}>{uploadResultMessage}</div>
      <div className="image-container">
        <img src={visitorImageUrl === null ? require("./visitors/placeholder.jpg") : visitorImageUrl} alt="Visitor" height={250} width={250} />
      </div>
    </div>
  );
}

export default Home;
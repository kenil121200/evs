import './index.css';
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import S3Singleton from '../AwsConfigFile/s3'
import {
  S3Client, ListObjectsV2Command, DeleteObjectCommand, PutObjectCommand,
} from "@aws-sdk/client-s3";
import { config } from 'aws-sdk'
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 15,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const AWSConfig = {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.REACT_APP_AWS_SESSION_TOKEN,
    region: process.env.REACT_APP_AWS_REGION,
}
config.update(AWSConfig)

const client = new S3Client(config);

function Administrator() {
  const [image, setImage] = useState('');
  const [contents, setContents] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);

  async function loadImages() {
    const command = new ListObjectsV2Command({
      Bucket: process.env.REACT_APP_AWS_S3_EMPLOYEE_BUCKET_NAME
    });

    try {
      let isTruncated = true;
      let contentsData = [];

      while (isTruncated) {
        const { Contents, IsTruncated, NextContinuationToken } =
          await client.send(command);
        console.log(Contents)
        if (Contents) { 
          contentsData.push(...Contents.map((c) => c.Key));
        }
        isTruncated = IsTruncated;
        command.input.ContinuationToken = NextContinuationToken;
      }
      setContents(contentsData); 
    } catch (err) {
      console.error(err);
    }    
  }

  useEffect(() => {
    loadImages();
   }, []);

  async function handleShow(file){
    var image
    try {
        const s3 = await S3Singleton.getInstance()
        s3.getObject({
              Bucket: process.env.REACT_APP_AWS_S3_EMPLOYEE_BUCKET_NAME,
              Key: file,
            }, (err, data) => {
              if (err) {
                console.error(err);
                return;
              }
              if (data) {
                image = `data:image/jpeg;base64,${data.Body.toString('base64')}`;
                setImageUrl(image);
              }
            },
        )
    } catch (e) {
        console.log(e)
    }
  }

  async function handleDelete(file) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.REACT_APP_AWS_S3_EMPLOYEE_BUCKET_NAME,
      Key: file,
    });
  
    try {
      const response = await client.send(command);
      console.log(response);
      setContents(prevContents => prevContents.filter(item => item !== file));
    } catch (err) {
      console.error(err);
    }

    const postData = {
      fileName: file
    };

    fetch(`${process.env.REACT_APP_AWS_API_URL}/delete-employee`, {
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

  }

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const filename = image.name;
    const command = new PutObjectCommand({
      Bucket: process.env.REACT_APP_AWS_S3_EMPLOYEE_BUCKET_NAME,
      Key: filename,
      Body: image,
    });
  
    try {
      const response = await client.send(command);
      console.log(response);
      setContents(prevContents => [...prevContents, filename]);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="App">
      <div className="upload-container">
        <label htmlFor="upload-photo" className="button-like-label">SELECT IMAGE</label>
        <form onSubmit={handleFileUpload}>
          <input type='file' accept='image/*' name='image' id="upload-photo" style={{display:'none'}} onChange={e => setImage(e.target.files[0])}/>
          {image ? <p>File Name To be Uploaded: {image.name}</p> : null}
          <Button type="submit" variant="contained" endIcon={<SendIcon />} style={{ marginBottom: '20px' }}>
            UPLOAD IMAGE
          </Button>
        </form>
      </div>
      <div className="table-container">
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 300 }} aria-label="Employee Table">
            <TableHead>
              <TableRow>
                <StyledTableCell  style={{fontSize: 18, fontWeight: 'bold'}}>Employee Name</StyledTableCell>
                <StyledTableCell  style={{fontSize: 18, fontWeight: 'bold'}}>Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contents.map((content,i) => (
                <StyledTableRow key={content}>
                  {/* <StyledTableCell component="th" scope="row">{i}</StyledTableCell> */}
                  <StyledTableCell>{content.replace(/_/g, ' ').replace(/\..+$/, '')}</StyledTableCell>
                  <StyledTableCell>
                    <Button variant="outlined" onClick={() => handleShow(content)}>Show</Button>&nbsp;&nbsp;
                    <Button variant="outlined" startIcon={<DeleteIcon />} onClick={() => handleDelete(content)}>Delete</Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className="image-container-admin">
        <img src={imageUrl} width={600}/>
      </div>
    </div>
  );
}

export default Administrator;
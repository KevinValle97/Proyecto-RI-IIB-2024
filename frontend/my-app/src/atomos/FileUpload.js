import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function InputFileUpload() {
  const [uploadedImage, setUploadedImage] = React.useState(null);
  const [similarImages, setSimilarImages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      const formData = new FormData();
      formData.append('image', file);

      setLoading(true);

      try {
        const response = await fetch('http://127.0.0.1:5000/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setUploadedImage(URL.createObjectURL(file));
          setSimilarImages(data.matches);
        } else {
          console.error('Error al subir la imagen:', response.statusText);
          alert('Error al subir la imagen');
        }
      } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        alert('Error al enviar la solicitud');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Solo se permiten archivos PNG o JPG');
    }
  };

  return (
    <Box sx={styles.container}>
      <Button
        component="label"
        variant="contained"
        color="primary"
        startIcon={<CloudUploadIcon />}
        sx={styles.button}
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Upload Photo'}
        <VisuallyHiddenInput
          type="file"
          accept=".png, .jpg, .jpeg"
          onChange={handleFileUpload}
        />
      </Button>
      {loading && <CircularProgress sx={styles.loader} />}
      {uploadedImage && !loading && (
        <Box sx={styles.uploadedImageContainer}>
          <Typography variant="h6" sx={styles.title}>Uploaded Image</Typography>
          <img src={uploadedImage} alt="Uploaded" style={styles.uploadedImage} />
        </Box>
      )}
      {similarImages.length > 0 && !loading && (
        <Box sx={styles.similarImagesContainer}>
          <Typography variant="h6" sx={styles.title}>Similar Images</Typography>
          {similarImages.map((match, index) => (
            <Box sx={styles.imageWrapper} key={index}>
              <img src={match.image} alt={`Match ${index + 1}`} style={styles.similarImage} />
              <Typography variant="body1" sx={styles.infoText}>
                Índice: {match.index}
              </Typography>
              <Typography variant="body1" sx={styles.infoText}>
                Distancia: {match.distance.toFixed(2)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  button: {
    padding: '12px 40px',
    fontSize: '16px',
    backgroundColor: '#d36de7',
    '&:hover': {
      backgroundColor: '#420b4d',
    },
    '&:disabled': {
      backgroundColor: '#ccc',
    },
  },
  loader: {
    marginTop: '20px',
  },
  uploadedImageContainer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  uploadedImage: {
    width: '400px',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '2px solid #ddd',
  },
  title: {
    marginBottom: '10px',
    color: '#333',
    fontWeight: 'bold',
  },
  similarImagesContainer: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  imageWrapper: {
    textAlign: 'center',
  },
  similarImage: {
    width: '300px',
    height: '300px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '2px solid #ddd',
  },
  infoText: {
    marginTop: '8px',
    color: '#555',
  },
};

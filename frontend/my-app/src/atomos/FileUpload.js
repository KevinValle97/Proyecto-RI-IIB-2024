import * as React from 'react';
import { styled } from '@mui/material/styles';  // Importa la función 'styled' para crear componentes personalizados con estilos
import Button from '@mui/material/Button';  // Importa el componente 'Button' de Material-UI
import CloudUploadIcon from '@mui/icons-material/CloudUpload';  // Importa el ícono de subida de nubes
import CircularProgress from '@mui/material/CircularProgress';  // Importa el componente 'CircularProgress' para mostrar una barra de carga
import Box from '@mui/material/Box';  // Importa el componente 'Box' para la estructura de la interfaz
import Typography from '@mui/material/Typography';  // Importa el componente 'Typography' para texto

// Define un componente 'input' personalizado que está visualmente oculto pero accesible para lectores de pantalla
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

// Componente principal que maneja la subida de archivos
export default function InputFileUpload() {
  const [uploadedImage, setUploadedImage] = React.useState(null);  // Estado para almacenar la imagen cargada
  const [similarImages, setSimilarImages] = React.useState([]);  // Estado para almacenar imágenes similares
  const [loading, setLoading] = React.useState(false);  // Estado para controlar la visualización del cargador

  // Función que maneja la subida del archivo cuando el usuario selecciona una imagen
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];  // Obtiene el primer archivo seleccionado

    // Verifica que el archivo sea una imagen PNG o JPG
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      const formData = new FormData();  // Crea un objeto FormData para enviar la imagen
      formData.append('image', file);  // Añade la imagen al FormData

      setLoading(true);  // Establece el estado de carga a verdadero

      try {
        // Realiza una solicitud POST al servidor para subir la imagen
        const response = await fetch('http://127.0.0.1:5000/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          // Si la respuesta es exitosa, convierte la imagen en una URL accesible y actualiza los estados
          const data = await response.json();
          setUploadedImage(URL.createObjectURL(file));
          setSimilarImages(data.matches);  // Almacena las imágenes similares recibidas del servidor
        } else {
          console.error('Error al subir la imagen:', response.statusText);  // Muestra un error en la consola
          alert('Error al subir la imagen');  // Muestra un mensaje de alerta al usuario
        }
      } catch (error) {
        console.error('Error al enviar la solicitud:', error);  // Muestra un error en la consola si la solicitud falla
        alert('Error al enviar la solicitud');  // Muestra un mensaje de alerta al usuario
      } finally {
        setLoading(false);  // Restablece el estado de carga a falso
      }
    } else {
      alert('Solo se permiten archivos PNG o JPG');  // Muestra un mensaje de alerta si el archivo no es PNG o JPG
    }
  };

  return (
    <Box sx={styles.container}>  // Contenedor principal que agrupa los elementos visuales
      <Button
        component="label"
        variant="contained"
        color="primary"
        startIcon={<CloudUploadIcon />}
        sx={styles.button}
        disabled={loading}  // Deshabilita el botón si está en proceso de carga
      >
        {loading ? 'Uploading...' : 'Upload Photo'}  // Cambia el texto del botón dependiendo del estado de carga
        <VisuallyHiddenInput
          type="file"
          accept=".png, .jpg, .jpeg"
          onChange={handleFileUpload}  // Llama a la función 'handleFileUpload' cuando se selecciona un archivo
        />
      </Button>
      {loading && <CircularProgress sx={styles.loader} />}  // Muestra un círculo de carga si el estado de carga es verdadero
      {uploadedImage && !loading && (  // Muestra la imagen cargada si hay una y no está en proceso de carga
        <Box sx={styles.uploadedImageContainer}>
          <Typography variant="h6" sx={styles.title}>Uploaded Image</Typography>
          <img src={uploadedImage} alt="Uploaded" style={styles.uploadedImage} />
        </Box>
      )}
      {similarImages.length > 0 && !loading && (  // Muestra las imágenes similares si existen y no está en proceso de carga
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

// Definición de los estilos utilizados en el componente
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

import React, { useState } from 'react';
import { Button, Box, Typography, CircularProgress, IconButton, createTheme, ThemeProvider } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Download as DownloadIcon, DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { jsPDF } from 'jspdf';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Dark mode state

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
  const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

  // Use environment variable for backend URL, fallback to default if not set
  const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://fastapi-resume-evaluator-backend.onrender.com/upload_resume/';

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#121212' : '#f4f6f8',
        paper: darkMode ? '#1f1f1f' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
      },
    },
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const uploadResume = async () => {
    setError(""); // Clear any previous errors
    if (!selectedFile) {
      setError("Please select a file before uploading.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds the 2MB limit.");
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError("Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true); // Set loading state
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
      } else if (response.status === 400) {
        setError("Bad request. Please check the file format or try another resume.");
      } else if (response.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(`Unexpected error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      setError("There was an error uploading the resume. Please try again.");
    } finally {
      setLoading(false); // Clear loading state
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Resume Evaluation Feedback", 10, 10);
    doc.text(feedback, 10, 20);
    doc.save("resume_feedback.pdf");
  };

  const resetRequest = () => {
    setSelectedFile(null);
    setFeedback("");
    setError("");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        textAlign: 'center',
      }}>
        <Typography variant="h3" gutterBottom color={theme.palette.text.primary}>
          AI-powered Resume Evaluator
        </Typography>

        {/* Toggle Dark/Light Mode */}
        <IconButton onClick={toggleTheme} sx={{ mb: 2 }}>
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mr: 2 }}
          >
            Browse...
            <input
              type="file"
              hidden
              onChange={(e) => {
                setSelectedFile(e.target.files[0]);
                setError(""); // Clear error when file is selected
              }}
            />
          </Button>
          {selectedFile && (
            <Typography variant="body1" display="inline" sx={{ fontWeight: 'bold' }} color={theme.palette.text.primary}>
              {selectedFile.name}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={uploadResume}
          disabled={loading}
          endIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {loading ? "Uploading..." : "Upload Resume"}
        </Button>

        {error && (
          <Box sx={{ mt: 2 }}>
            <Typography color="error" variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
              {error}
            </Typography>
          </Box>
        )}

        {feedback && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom color={theme.palette.text.primary}>
              Feedback:
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic' }} color={theme.palette.text.primary}>
              {feedback}
            </Typography>

            {/* Download as PDF Button */}
            <Button
              variant="contained"
              color="secondary"
              onClick={downloadPDF}
              sx={{ mt: 2 }}
              startIcon={<DownloadIcon />}
            >
              Download Feedback as PDF
            </Button>
          </Box>
        )}

        {/* New Request Button */}
        <Button
          variant="contained"
          color="secondary"
          onClick={resetRequest}
          sx={{ mt: 2 }}
        >
          New Request
        </Button>
      </Box>
    </ThemeProvider>
  );
}

export default App;

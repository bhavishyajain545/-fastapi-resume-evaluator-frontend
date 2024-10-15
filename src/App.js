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

  // Create theme with proper background and text color changes for dark and light modes
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

      // Updated URL to point to the deployed backend on Render
      const response = await fetch("https://fastapi-resume-evaluator-backend.onrender.com/upload_resume/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setError(""); // Clear error if successful
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 4, maxWidth: '600px', margin: '0 auto', textAlign: 'center', backgroundColor: theme.palette.background.default }}>
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

        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom color={theme.palette.text.primary}>
            Feedback:
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }} color={theme.palette.text.primary}>
            {feedback || "No feedback yet."}
          </Typography>

          {/* Download as PDF Button */}
          {feedback && (
            <Button
              variant="contained"
              color="secondary"
              onClick={downloadPDF}
              sx={{ mt: 2 }}
              startIcon={<DownloadIcon />}
            >
              Download Feedback as PDF
            </Button>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

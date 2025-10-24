export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File size exceeds the maximum limit of 10MB'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};
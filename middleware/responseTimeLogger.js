export const responseTimeLogger = (req, res, next) => {
    const start = process.hrtime(); // Get the start time in high-resolution time
  
    // Listen for the response to finish
    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start); // Calculate elapsed time
      const elapsedTime = seconds + nanoseconds / 1e9; // Convert to seconds
      console.log(`Response Time: ${elapsedTime.toFixed(3)} seconds for ${req.method} ${req.originalUrl}`);
    });
  
    next(); // Proceed to the next middleware or route handler
  };
  
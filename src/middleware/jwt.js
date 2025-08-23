const jwt = require("jsonwebtoken");

// Using a fixed authentication secret for demonstration purposes.
// Ideally this would be stored in a secrets manager and retrieved here.
// To create a new randomly chosen secret instead, you can use:
//
// tokenSecret = require("crypto").randomBytes(64).toString("hex");
//
const tokenSecret =
   "e9aae26be08551392be664d620fb422350a30349899fc254a0f37bfa1b945e36ff20d25b12025e1067f9b69e8b8f2ef0f767f6fff6279e5755668bf4bae88588";

// Create a token with username embedded, setting the validity period.
const generateAccessToken = (username) => {
   return jwt.sign(username, tokenSecret, { expiresIn: "30m" });
};

// Chatgpt
// Middleware to verify a token and respond with user information
function authenticateToken(req, res, next) {
   const token = req.cookies?.authToken;

   // differentiate between api calls or page 
   const expectsJson =
      req.xhr ||
      req.headers.accept?.includes('application/json') ||
      req.path.startsWith('/api') ||
      req.headers['content-type'] === 'application/json';

   if (!token) {
      console.log('JSON web token missing.');
      if (expectsJson) {
         return res.status(401).json({ error: 'Please log in!' });
      } else {
         return res.redirect('/user/login?error=no_token');
      }
   }

   try {
      const user = jwt.verify(token, tokenSecret);

      console.log(`authToken verified for user: ${user.username} at ${req.url}`);
      req.user = user;
      next();
   } catch (err) {
      console.warn(`JWT verification failed at ${req.url}:`, err.name, err.message);

      const errorType =
         err.name === 'TokenExpiredError' ? 'token_expired' : 'invalid_token';

      if (expectsJson) {
         return res.status(401).json({ error: errorType });
      } else {
         return res.redirect(`/user/login?error=${errorType}`);
      }
   }
}


module.exports = { generateAccessToken, authenticateToken };

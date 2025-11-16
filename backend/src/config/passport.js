const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

// Verify that Google OAuth credentials are configured
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  logger.warn('Google OAuth credentials not configured. Google Sign-In will not be available.');
  logger.warn('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
} else {
  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        passReqToCallback: true
      },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        logger.info(`Google OAuth callback for user: ${profile.emails[0].value}`);

        // Extract user information from Google profile
        const email = profile.emails[0].value;
        const googleId = profile.id;
        
        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // User exists - update Google ID if not set
          if (!user.googleId) {
            user.googleId = googleId;
            user.is_verified = true; // Google accounts are pre-verified
            await user.save();
            logger.info(`Updated existing user with Google ID: ${email}`);
          } else {
            logger.info(`Existing Google user logged in: ${email}`);
          }
          return done(null, user);
        }

        // Create new user with Google account
        user = await User.create({
          googleId: googleId,
          email: email,
          full_name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
          avatar_url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
          is_verified: true, // Google accounts are pre-verified
          role: 'user'
        });

        logger.info(`Created new user via Google OAuth: ${email}`);
        done(null, user);
      } catch (error) {
        logger.error('Google OAuth error:', error);
        done(error, null);
      }
    }
    )
  );
}

// Serialize user for the session (not used with JWT, but required by passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session (not used with JWT, but required by passport)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

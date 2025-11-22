const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
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

// ============================================================================
// GitHub OAuth Strategy Configuration
// ============================================================================

// Verify that GitHub OAuth credentials are configured
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  logger.warn('GitHub OAuth credentials not configured. GitHub Sign-In will not be available.');
  logger.warn('Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your .env file.');
} else {
  // Configure GitHub OAuth Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
        scope: ['user:email'], // Request email access
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          logger.info(`GitHub OAuth callback for user: ${profile.username}`);

          // Extract user information from GitHub profile
          // GitHub profile.emails may be empty if user's email is private
          const email = profile.emails && profile.emails.length > 0 
            ? profile.emails[0].value 
            : null;
          
          if (!email) {
            logger.warn(`GitHub user ${profile.username} has no public email`);
            return done(new Error('GitHub account must have a public email address'), null);
          }

          const githubId = profile.id;
          const username = profile.username;
          
          // Check if user already exists by email
          let user = await User.findOne({ email });

          if (user) {
            // User exists - update GitHub ID if not set
            if (!user.githubId) {
              user.githubId = githubId;
              user.is_verified = true; // GitHub accounts are pre-verified
              await user.save();
              logger.info(`Updated existing user with GitHub ID: ${email}`);
            } else {
              logger.info(`Existing GitHub user logged in: ${email}`);
            }
            return done(null, user);
          }

          // Create new user with GitHub account
          user = await User.create({
            githubId: githubId,
            email: email,
            full_name: profile.displayName || username,
            avatar_url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
            is_verified: true, // GitHub accounts are pre-verified
            role: 'user'
          });

          logger.info(`Created new user via GitHub OAuth: ${email}`);
          done(null, user);
        } catch (error) {
          logger.error('GitHub OAuth error:', error);
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

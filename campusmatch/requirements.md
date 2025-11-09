# Requirements Document

## Introduction

CampusMatch is a college-exclusive dating web application designed to facilitate authentic connections between verified college students. The platform enables students to discover compatible matches within their campus through AI-powered matchmaking, engage in real-time conversations, participate in community interactions, and safely connect with peers. The system prioritizes student verification, user safety, and intelligent compatibility matching to create meaningful relationships within the college environment.

## Glossary

- **CampusMatch System**: The complete web application including frontend, backend, database, and third-party integrations
- **User**: A verified college student with an active account on the platform
- **Match**: A mutual connection created when two Users express interest in each other
- **Profile**: A User's personal information including demographics, interests, and preferences
- **Swipe Action**: A User's decision to express interest (Like) or disinterest (Pass) in another Profile
- **Chat Session**: A real-time messaging conversation between two matched Users
- **Community Feed**: A shared space where Users can post content visible to other verified students
- **Admin**: A privileged User with access to moderation and management functions
- **College Email**: An institutional email address used for student verification (e.g., @mmumullana.org)
- **Compatibility Score**: An AI-generated metric indicating how well two Users match based on their profiles
- **Report**: A User-submitted flag indicating inappropriate behavior or content
- **Premium User**: A User with access to enhanced features through a paid subscription

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a college student, I want to create an account using my college email, so that I can access the platform as a verified student.

#### Acceptance Criteria

1. WHEN a User submits registration with a College Email, THE CampusMatch System SHALL send a verification link to that email address
2. WHEN a User clicks the verification link within 24 hours, THE CampusMatch System SHALL activate the account
3. WHEN a User attempts to register with a non-college email domain, THE CampusMatch System SHALL reject the registration and display an error message
4. WHEN a User completes email verification, THE CampusMatch System SHALL generate a JWT token for authentication
5. WHEN a User submits valid login credentials, THE CampusMatch System SHALL authenticate the User and provide access to the platform

### Requirement 2: Profile Management

**User Story:** As a User, I want to create and customize my profile with personal information and photos, so that other students can learn about me.

#### Acceptance Criteria

1. THE CampusMatch System SHALL allow Users to input name, age, gender, course, branch, interests, and bio text
2. WHEN a User uploads a profile photo, THE CampusMatch System SHALL store the image and associate it with the User's Profile
3. THE CampusMatch System SHALL provide Users the ability to edit their Profile information at any time
4. WHEN a User modifies privacy settings, THE CampusMatch System SHALL apply those preferences to Profile visibility
5. THE CampusMatch System SHALL validate that required Profile fields contain appropriate data before saving

### Requirement 3: AI-Powered Matchmaking

**User Story:** As a User, I want to discover compatible matches based on my interests and preferences, so that I can connect with students who share common ground.

#### Acceptance Criteria

1. WHEN a User accesses the matching interface, THE CampusMatch System SHALL generate a Compatibility Score for each potential match using AI analysis
2. THE CampusMatch System SHALL compare interests, hobbies, college affiliation, and preferences when calculating compatibility
3. WHEN generating match suggestions, THE CampusMatch System SHALL present the top 10 most compatible Profiles to the User
4. WHEN a User performs a Swipe Action on a Profile, THE CampusMatch System SHALL record the decision
5. WHEN two Users both perform a Like Swipe Action on each other's Profiles, THE CampusMatch System SHALL create a Match between them

### Requirement 4: Real-Time Chat System

**User Story:** As a matched User, I want to chat in real-time with my matches, so that I can get to know them better and build connections.

#### Acceptance Criteria

1. WHEN two Users have a Match, THE CampusMatch System SHALL enable a Chat Session between them
2. WHEN a User sends a message in a Chat Session, THE CampusMatch System SHALL deliver the message to the recipient in real-time using WebSocket protocol
3. THE CampusMatch System SHALL display message delivery status including sent, delivered, and seen indicators
4. WHEN a User is typing in a Chat Session, THE CampusMatch System SHALL show a typing indicator to the other User
5. THE CampusMatch System SHALL timestamp each message and display it in the chat interface

### Requirement 5: Community Feed and Social Interaction

**User Story:** As a User, I want to share posts and interact with content from other students, so that I can engage with the campus community.

#### Acceptance Criteria

1. THE CampusMatch System SHALL allow Users to create posts containing text, images, or both
2. WHEN a User publishes a post, THE CampusMatch System SHALL display it in the Community Feed visible to verified students
3. THE CampusMatch System SHALL enable Users to like and comment on posts in the Community Feed
4. WHEN posts receive high engagement, THE CampusMatch System SHALL feature them in a trending section
5. THE CampusMatch System SHALL allow Users to delete their own posts at any time

### Requirement 6: Safety and Moderation

**User Story:** As a User, I want to report inappropriate behavior and block unwanted contacts, so that I can maintain a safe experience on the platform.

#### Acceptance Criteria

1. THE CampusMatch System SHALL provide Users the ability to submit a Report against another User or content
2. WHEN a User blocks another User, THE CampusMatch System SHALL prevent all communication and visibility between them
3. WHEN a message is sent in a Chat Session, THE CampusMatch System SHALL analyze it using AI moderation to detect inappropriate content
4. IF AI moderation detects policy violations, THEN THE CampusMatch System SHALL flag the content for Admin review
5. THE CampusMatch System SHALL maintain a record of all Reports for Admin investigation

### Requirement 7: Administrative Management

**User Story:** As an Admin, I want to manage user accounts and moderate content, so that I can maintain platform safety and quality.

#### Acceptance Criteria

1. THE CampusMatch System SHALL provide Admins access to a dashboard displaying user accounts and reported content
2. THE CampusMatch System SHALL allow Admins to view details of reported Profiles and content
3. WHEN an Admin reviews a Report, THE CampusMatch System SHALL enable the Admin to approve, remove, or warn the User
4. THE CampusMatch System SHALL allow Admins to suspend or permanently ban User accounts
5. THE CampusMatch System SHALL log all Admin actions for audit purposes

### Requirement 8: Premium Features

**User Story:** As a User, I want to access premium features through a subscription, so that I can enhance my experience with unlimited swipes and advanced filters.

#### Acceptance Criteria

1. WHERE a User has a premium subscription, THE CampusMatch System SHALL remove daily swipe limits
2. WHERE a User has a premium subscription, THE CampusMatch System SHALL provide advanced filtering options for match discovery
3. THE CampusMatch System SHALL process payment transactions securely for premium subscriptions
4. WHEN a premium subscription expires, THE CampusMatch System SHALL revert the User to standard feature access
5. THE CampusMatch System SHALL display premium-exclusive features with clear indicators in the interface

### Requirement 9: Additional Discovery Features

**User Story:** As a User, I want to find study partners and discover campus events, so that I can make both romantic and platonic connections.

#### Acceptance Criteria

1. WHERE a User enables study partner mode, THE CampusMatch System SHALL match Users based on academic courses and study preferences
2. THE CampusMatch System SHALL allow Users to browse and RSVP to campus events posted on the platform
3. THE CampusMatch System SHALL provide recommendations for date spots using location data
4. WHERE a User opts into anonymous mode, THE CampusMatch System SHALL allow sending crush confessions without revealing identity until reciprocated
5. THE CampusMatch System SHALL offer a compatibility quiz that Users can complete to improve match accuracy

# SYNCIO - SOCIAL MEDIA PLATFORM

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Tech Stack Versions](#tech-stack-versions)
5. [Configuration](#configuration)
6. [Who we are?](#who-we-are)
7. [Contributors](#contributors)
8. [Contact](#contact)



## Introduction
SYNCIO is a cutting-edge social media platform designed to connect people from all over the world.
With SYNCIO, you can share your thoughts, photos, videos, and audio clips with your friends and followers.
You can also buy labels to decorate their usernames, adding a personalized touch that will be displayed near their usernames throughout the entire app.
Additionally, users have the option to send private messages, like and comment on posts, and stay updated with real-time notifications.



## Features

### User Management
- **User Registration**: Sign up for a new account.
- **User Login**: Log in to your account with JWT authentication.
- **Profile**: View and edit profiles, manage profile images and labels, upload avatars, manage followers and close friends.
- **Avatar Upload**: Upload and display avatars.
- **User Issue Reporting**: Add a feature for users to report issues.

### Social Interactions
- **Follow/Unfollow**: Follow or unfollow other users.
- **Likes**: Like or unlike posts and comments.
- **Comments**: Add comments to posts, implement realtime comments, and preview comments in notifications.
- **Messaging**: Reply to private messages, send private messages, manage messages and group chat invitations, display unread messages, and send media in messages.
- **Group Chat**: Create and manage group chats.
- **Tagging**: Tag other users in posts.
- **Notifications**: Implement notifications for various activities.
- **Label Shopping**: View and purchase labels. Gift labels to other users. View payment history.

### Content Management
- **Posts**: Create and view posts, view post details, ensure posts contain at least one image or caption, create collections, and display posts based on visibility settings.
- **Stories**: Post and view stories, upload and edit images in stories.
- **Media**: Upload images, post videos under 100MB, post audio content, create image alternatives, and cache images for better performance.
- **Moderation**: Hide reported posts, hide posts for banned users, and use AI to check for inappropriate images.
- **Keywords**: Extract keywords when creating posts.

### Search and Discovery
- **Search**: Search for users and posts, implement pagination for search results, use a recommendation system to suggest mutual friends, and search using images.

### Admin Features
- **Admin Interface**: Admin dashboard for managing the platform.
- **User Management**: Manage users in the admin interface.
- **Admin Report Management**: View and manage reported posts in the admin interface.
- **Label Management**: Add, delete, edit, and view labels in the admin interface.
- **Sticker Management**: Add, edit, and view stickers and sticker groups.
- **Issue Management**: Manage user-reported issues in the admin interface.

### Enhancements and Integrations
- **VNPay Integration**: Integrate VNPay for payments.
- **Redis Integration**: Use Redis for caching frequently used data.
- **Telegram Chatbot**: Create a Telegram chatbot to monitor the app.
- **Multilingual Support**: Support multiple languages.
- **Responsive Design**: Ensure responsive design for user interface.
- **Dark Mode**: Implement a dark mode.

### Miscellaneous
- **Password Recovery**: Recover forgotten passwords.
- **Password Change**: Change your password.
- **Logout**: Log out of your account.
- **Help Center**: Create a help center page.
- **About Page**: Create an about page introducing the project and team members.
- **Targeted Posting**: Post content to specific audiences.
- **Login Error Handling**: Display 'Password Not Match' on incorrect password entry.
- **Registration Validation**: Validate user registration inputs.
- **Cache Images**: Cache images for better performance.
- **Android App**: Develop an Android app.
- **Windows App**: Develop a Windows app.



## Screenshots

### Login
![image](https://github.com/user-attachments/assets/58db7624-05d3-4df6-ad78-91bf91d06334)

### Home
![image](https://github.com/user-attachments/assets/a0a85af8-8163-43c9-828d-4884d368b3be)

### Messages
![image](https://github.com/user-attachments/assets/2ce8ab1d-f325-4e8c-b279-4caf568a28d6)

### Profile
![image](https://github.com/user-attachments/assets/f4b2b6e6-7402-4c1d-82f2-d3dc1a3d6b58)

### Dashboard
![image](https://github.com/user-attachments/assets/642fd41c-3485-47dc-a552-ee9d57462948)

### Label Management
![image](https://github.com/user-attachments/assets/fad0be5d-33ff-499b-8f62-a1d003e8c63a)

### Reported Post Management
![image](https://github.com/user-attachments/assets/7cb5fc3a-61eb-4f3d-89a2-4d077f61fff7)



## Tech Stack Versions

Please note that the versions listed below are the ones used during the development of this application. The application may work with other versions as well, but these are the ones that have been tested and confirmed to work.

- **Java**: 17
  
- **Spring Boot**: 3.2.5
  
- **JWT**: 0.11.5
  
- **MySQL**: 8.0
  
- **Angular CLI**: 16.2.12
  
- **Node.js**: 18.20.2
  
- **npm**: 10.5.0

- **VNPay**: 2.1.0

- **RabbitMQ**: 3.1.4

- **Redis**: 3.1.5

- **Docker**: 25.0.3

- **Python**: 3.9.13
  
- **PrimeNG**: 17.15.0
  
- **Electron**: 30.0.2
  
- **Capacitor**: 6.0.0



## Configuration
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

1. Clone the repository: `git clone https://github.com/56duong/syncio-webapp.git`
2. Navigate to the project directory: `cd syncio-webapp`

### Frontend
- **Angular**: Navigate to the `frontend` directory and run `npm install` to install the required dependencies.

### Backend
- **Spring Boot**: Navigate to the `backend` directory and run `mvn install` to install the required dependencies.

#### Database Configuration
Replace the following properties in your `application-prod.properties` file with your own database account details:
```properties
# Aiven MySQL Database Configuration
spring.datasource.url=jdbc:mysql://<your-database-url>:<port>/<database-name>?createDatabaseIfNotExist=true&sslmode=require&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=<your-username>
spring.datasource.password=<your-password>
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

Replace the following properties in your application-local.properties file with your own local database account details:
```properties
# Localhost MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/syncio-webapp?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=<your-local-password>
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

#### Initial Database Settings
After running the project, it will automatically add a `settings` table. You need to add the following settings to the table:

| Key                  | Category     | Value                                |
|----------------------|--------------|--------------------------------------|
| HUGGING_FACE_TOKEN   | HUGGING_FACE | your-hugging-face-token              |
| MAIL_FROM            | MAIL_SERVER  | your-email-address                   |
| MAIL_HOST            | MAIL_SERVER  | smtp.gmail.com                       |
| MAIL_PASSWORD        | MAIL_SERVER  | your-email-password                  |
| MAIL_PORT            | MAIL_SERVER  | 587                                  |
| MAIL_SENDER_NAME     | MAIL_SERVER  | your-sender-name                     |
| MAIL_USERNAME        | MAIL_SERVER  | your-email-address                   |
| SMTP_AUTH            | MAIL_SERVER  | true                                 |
| SMTP_SECURED         | MAIL_SERVER  | true                                 |

Replace these values with your own details where necessary.

#### RabbitMQ Configuration
Replace the following properties in your application-common.properties file with your own RabbitMQ account details:
```properties
# RabbitMQ Configuration
spring.rabbitmq.host=<your-rabbitmq-host>
spring.rabbitmq.port=<your-rabbitmq-port>
spring.rabbitmq.username=<your-rabbitmq-username>
spring.rabbitmq.password=<your-rabbitmq-password>
spring.rabbitmq.virtual-host=<your-rabbitmq-virtual-host>
```

#### Redis Configuration
Replace the following properties in your application-common.properties file with your own Redis account details:
```properties
# Redis Configuration
spring.data.redis.host=<your-redis-host>
spring.data.redis.port=<your-redis-port>
spring.data.redis.password=<your-redis-password>
spring.data.redis.ssl.enabled=true
```

#### Firebase Configuration
Replace the following properties in your application-common.properties file with your own Firebase account details:
```properties
# Firebase Configuration
firebase.storage.bucket.url=<your-firebase-bucket-url>
firebase.service.account.key.path=<your-firebase-service-account-key-path>
```
Place your Firebase service account key file inside the static folder and update the path accordingly. For example, if your service account key file is named syncio-bf6ca-firebase-adminsdk-68fpl-88eea603ef.json, the path should be:
```properties
firebase.service.account.key.path=static/<your-file-name>
```


### Python Configuration

#### Keyword Extractor
- Navigate to the `keyword-extractor` directory and run the following commands to set up and start the Flask application:

```bash
cd keyword-extractor
pip install -r requirements.txt
python app.py
```

#### Friend Recommendation System
- Navigate to the `recommend-system` directory and run the following commands to set up and start the Flask application:

```bash
cd recommend-system
python friend_recommender.py
```

#### Face Recognition System
- Navigate to the `face-recognition` directory and run the following commands to set up and start the Flask application:

```bash
cd face-recognition
pip install -r requirements.txt
python face-recognition.py
```



## Who we are?
We are a group of students from the a College in Vietnam.creating Syncio – a social media platform with three main goals:

1. **Personalization**: Unique features tailored to individual users.
2. **Social Network**: Aiming to be the social network for specific groups, organizations, or even the nation, starting with our college.
3. **Applying Learned Knowledge**: Integrating features inspired by top social networks and applying our knowledge to create a unique platform.



## Contributors
- [Nguyen Ngoc Thuy Duong](https://github.com/56duong)
- [Than Van Huy](https://github.com/Vanhuyne)
- [Nguyen Xuan Sanh](https://github.com/CoanhHeo)
- [Chu Minh Thanh](https://github.com/Gein11)
- [Nguyen Duong Quoc Thuan](https://github.com/ndqThuan)



## Contact
For more information, feel free to contact any of our team members via their GitHub profiles.
```

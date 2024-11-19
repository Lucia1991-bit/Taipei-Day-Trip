# [Taipei Day Trip](http://52.21.45.164/)

**Taipei Day Trip is a full-stack E-commerce Tourism Web Platform.**

Designed to enhance the Taipei exploration experience. The platform seamlessly integrates attraction discovery, tour booking, and secure payment processing, allowing travelers to effortlessly plan their journey through the city.

![homepage](https://res.cloudinary.com/datj4og4i/image/upload/v1730901196/%E6%88%AA%E5%9C%96_2024-09-16_%E6%99%9A%E4%B8%8A7.55.45_qu8cs0.png)

![RWD](https://res.cloudinary.com/datj4og4i/image/upload/v1731873912/RWD_Mesa_de_trabajo_1_%E8%A4%87%E6%9C%AC_lh5itc.png)

**Test Account**

| Account       | Password |
| ------------- | -------- |
| ddd@gmail.com | ddd      |

**Test Credit Card**

| Card Number         | Expires | CVV |
| ------------------- | ------- | --- |
| 4242 4242 4242 4242 | 03/28   | 322 |

## Table of Contents

- [Taipei Day Trip](#taipei-day-trip)
  - [Table of Contents](#table-of-contents)
  - [Key Features](#key-features)
  - [Tech Stack](#tech-stack)
  - [Implementation Details](#implementation-details)
    - [Home Page](#home-page)
    - [Attraction Page](#attraction-page)
    - [Order Page](#order-page)
  - [API Documentary](#api-documentary)

## Key Features

| **Category**        | **Features**                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Index Page**      | ❖ Attraction search with keyword & MRT filter<br>❖ Infinite scroll with lazy loading<br>❖ Skeleton & progressive image loading<br>❖ JWT authentication system |
| **Attraction Page** | ❖ Image carousel & detailed information<br>❖ Smart booking system with time conflict detection<br>❖ Dynamic pricing display                                   |
| **Booking System**  | ❖ Date-grouped booking management<br>❖ TapPay payment integration<br>❖ Real-time form validation & feedback                                                   |

## Tech Stack

| **Category**            | **Technique**                                                                                                                                                                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**            | ![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javaScript&logoColor=black)      |
| **Backend**             | ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastAPI&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonWebTokens&logoColor=white) |
| **Database**            | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mySQL&logoColor=white)                                                                                                                                                                                                                    |
| **Third-party Service** | ![TapPay](https://img.shields.io/badge/TapPay-555?style=for-the-badge)                                                                                                                                                                                                                                                |
| **Version Control**     | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=gitHub&logoColor=white)                                                                                                                    |
| **Deployment**          | ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white) ![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)                                                                                                         |

## Implementation Details

### Home Page

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1731619217/%E5%8F%B0%E5%8C%97%E4%B8%80%E6%97%A5%E9%81%8A3_wjmukb.gif" alt="home" width="700"/>

- Attraction keyword search bar
- MRT station horizontal scrollable list
- Infinite scroll attraction thumbnails with lazy loading
- Skeleton loading and progressive image loading for better UX
- Sign-up/sign-in modal using JWT token authentication

### Attraction Page

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1731621039/%E5%8F%B0%E5%8C%97%E4%B8%80%E6%97%A5%E9%81%8A1_ij6v1t.gif" alt="attraction" width="700"/>

<img src="https://res.cloudinary.com/datj4og4i/image/upload/w_885/v1731619217/%E5%8F%B0%E5%8C%97%E4%B8%80%E6%97%A5%E9%81%8A4-1_di6z7g.gif" alt="image carousel" width="700"/>

- Attraction information and description
- Image carousel
- Booking date selection with dynamic pricing
- Time conflict alert

### Order Page

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1731621039/%E5%8F%B0%E5%8C%97%E4%B8%80%E6%97%A5%E9%81%8A2_j8t9fi.gif" alt="order" width="700"/>

- Booking orders grouped by date
- TapPay payment integration
- Form validation with dynamic feedback

## API Documentary

API endpoints designed with RESTful standards.

<img src="https://res.cloudinary.com/datj4og4i/image/upload/v1731954522/%E6%88%AA%E5%9C%96_2024-11-18_%E6%99%9A%E4%B8%8A9.23.07_sy3ajx.png" alt="order" width="700"/>

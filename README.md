## [Taipei Day Trip](http://52.21.45.164/)

**Taipei Day Trip is an E-commerce Tourism Web Platform.**

![homepage](https://res.cloudinary.com/datj4og4i/image/upload/v1730901196/%E6%88%AA%E5%9C%96_2024-09-16_%E6%99%9A%E4%B8%8A7.55.45_qu8cs0.png)

![RWD](https://res.cloudinary.com/datj4og4i/image/upload/v1731675916/RWD_Mesa_de_trabajo_1_%E8%A4%87%E6%9C%AC_lh5itc.png)

### Test Account

| Account       | Password |
| ------------- | -------- |
| ddd@gmail.com | ddd      |

## Table of Contents

- [Taipei Day Trip](#taipei-day-trip)
  - [Test Account](#test-account)
- [Table of Contents](#table-of-contents)
- [Tech Stack](#tech-stack)
- [Website Features](#website-features)
  - [Home Page](#home-page)
  - [Attraction Page](#attraction-page)
  - [Order Page](#order-page)

## Tech Stack

| **_Category_**          | **_Technique_**       |
| ----------------------- | --------------------- |
| **Frontend**            | HTML, CSS, JavaScript |
| **Backend**             | Python / FastAPI      |
| **Database**            | MySQL                 |
| **Third-party Service** | TapPay                |
| **Version Control**     | Git / GitHub          |
| **Deployment**          | AWS EC2, Nginx        |

## Website Features

### Home Page

![home](https://res.cloudinary.com/datj4og4i/image/upload/w_800/v1731619217/%E5%8F%B0%E5%8C%97%E4%B8%80%E6%97%A5%E9%81%8A3_wjmukb.gif)

- Attraction keyword search bar
- MRT station horizontal scrollable list
- Infinite scroll attraction thumbnails with lazy loading
- Skeleton loading and progressive image loading for better UX
- Sign-up/sign-in modal using JWT token authentication

### Attraction Page

![attraction](https://res.cloudinary.com/datj4og4i/image/upload/v1731621039/%E5%8F%B0%E5%8C%97%E4%B8%80%E6%97%A5%E9%81%8A1_ij6v1t.gif)

![image carousel](https://res.cloudinary.com/datj4og4i/image/upload/w_885/v1731619217/%E5%8F%B0%E5%8C%97%E4%B8%80%E6%97%A5%E9%81%8A4-1_di6z7g.gif)

- Attraction information and description
- Image carousel
- Booking date selection with dynamic pricing
- Time conflict alert

### Order Page

![order](https://res.cloudinary.com/datj4og4i/image/upload/v1731621039/%E5%8F%B0%E5%8C%97%E4%B8%80%E6%97%A5%E9%81%8A2_j8t9fi.gif)

- Booking orders grouped by date
- TapPay payment integration
- Form validation with dynamic feedback

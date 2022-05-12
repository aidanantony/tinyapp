# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). This means no more walls of text as you try to paste a URL to send to a friend or colleauge. With TinyApp, your shared URLs look clean and compact!

## Final Product

!["The login page"]()
!["An example of what a logged in users homepage looks like."]()
!["The page where you can pass in your long URLs to create the short URL."]()

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Finally head on over to localhost:8080 on your browser to get to the webpage. 


## Instructions for TinyApp
### The first thing you will want to do is to make an account. Features like making a new Short URL, saving your own short URLs, and editting can only be done with an account. 
- While on the home page, navigate over to the register button on the top of the screen. Upon clicking this button you will be taken to the registration page where you will need to enter your email and create a password. 

### Making a new short URL
- After registration you will automatically be logged in on the account you just created. To make a new short URL, navigate to the top of the screen and click the "Create New Url" button. This will take you to the short URL creation page. On this page you will just need to enter the URL that you want shortened, and TinyApp will create a short URL for that page.

### How to use your newly generated Short URL
- Now that you have your short URL it's time to see it in action. Remember to stay in localhost:8080 and then the path will be /u/:shortURL. So just replace shortURL with the randomly generated shortURL and you will be redirected to the long URL that this short URL is short for. 

### Managing your saved short URLs.
- Each time you generate a short URL, it will automatically be saved on your account. To view the list, you can navigate back to the homepage by clicking "MyUrls" on the top header of the page, or by clicking the "TinyApp" button on the top of the page as well. On this page, you can then manage your saved URLs with the options of deleting or editting them. To delete you can just press the delete button and the URL will be removed from your saved list. To edit, just click on the edit button of the URL that you wish to edit, and it will take you to the edit page. Here you can take your short URL and assign it to a new long URL value. Once this edit is complete your shortURL will now redirect to the new longURL that you have assigned to it. 
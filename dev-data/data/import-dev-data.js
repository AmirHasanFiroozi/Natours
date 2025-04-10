const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../Model/tourModel');
const User = require('../../Model/userModel');
const Review = require('../../Model/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log('connected to the server successfully'))
  .catch((err) => console.log('ERROR for connecting to the server', err));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

const UploadDocs = async () => {
  try {
    await Tour.create(tours);
    await User.create(users,{ validateBeforeSave : false });
    await Review.create(reviews);
    console.log('data is loaded to the server successfully');
  } catch (err) {
    console.log('There is an error to load data in the server', err);
  } finally {
    process.exit();
  }
};

const DeleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data is deleted from database successfully');
  } catch (err) {
    console.log('There is an error for deleting data from server');
  } finally {
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  UploadDocs();
} else if (process.argv[2] === '--delete') {
  DeleteData();
} else {
  console.log('unknown error');
}

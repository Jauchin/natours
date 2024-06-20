const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/../../config.env` });
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful'))
  .catch((err) => console.error('DB connection error:', err));

// Read Json file
// const filePath = `${__dirname}/tours.json`;

// console.log(`Reading file from: ${filePath}`);
// const tours = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
// console.log('File content:', tours);
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

// Import data
const importData = async () => {
  try {
    // 确保插入新数据
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    // console.log('Data successfully loaded!');

    // 检查数据库中的数据
    const loadedTours = await Tour.find();
    // console.log('Tours after import:', loadedTours);
  } catch (err) {
    console.error('Error loading data:', err);
  }
  process.exit();
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    // console.log('Data successfully deleted!');
    const remainingTours = await Tour.find();
    // console.log('Remaining Tours after delete:', remainingTours);
  } catch (err) {
    console.error('Error deleting data:', err);
  }
  process.exit();
};

// console.log('Command argument:', process.argv[2]);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

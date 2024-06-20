const multer = require('multer');
const sharp = require('sharp');
// const fs = require('fs');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   // 如果未找到 tour，返回 404 错误
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

const multerStorage = multer.memoryStorage();

const multerFiter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only image.', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFiter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);

  if (!req.files.imageCover || !req.files.images) return next();

  //Cover image

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    }),
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,duration';
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

// exports.createTour = async (req, res) => {
//   // console.log(req.body);
//   // const newId = tours[tours.length - 1].id + 1;
//   // const newTour = Object.assign({ id: newId }, req.body);

//   // tours.push(newTour);
//   // fs.writeFile(
//   //   `${__dirname}/dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours),
//   //   (err) => {
//   //     res.status(201).json({
//   //       status: 'success',
//   //       data: {
//   //         tour: newTour,
//   //       },
//   //     });
//   //   },
//   // );
//   try {
//     // const newTour = new Tour({})
//     // newTour.save()

//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   } catch (err) {
//     // 使用 next 傳遞錯誤，並創建一個 AppError
//     next(new AppError(`Can't create tour on this server!`, 400));
//   }
// };
exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError(`No tour found with that ID!`, 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findOneAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError(`No tour found with that ID!`, 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// class APIFeatures {
//   constructor(query, queryString) {
//     this.query = query;
//     this.queryString = queryString;
//   }

//   filter() {
//     const queryObj = { ...this.queryString };
//     console.log('Original Query Object:', queryObj); // 添加日志
//     const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     excludedFields.forEach((el) => delete queryObj[el]);
//     console.log('Filtered Query Object:', queryObj); // 添加日志
//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     this.query = this.query.find(JSON.parse(queryStr));
//     //In general API class, could not use Tour
//     // let query = Tour.find(JSON.parse(queryStr));
//     return this;
//   }

//   sort() {
//     if (this.queryString.sort) {
//       const sortBy = this.queryString.sort.split(',').join(' ');
//       // console.log(sortBy);
//       this.query = this.query.sort(sortBy);
//       // query = query.sort(req.query.sort);
//       //sort('price ratingAvg') can have 2 sorting params
//     } else {
//       this.query = this.query.sort('-createAt');
//     }
//     return this;
//   }

//   limitFields() {
//     if (this.queryString.fields) {
//       const fields = this.queryString.fields.split(',').join(' ');
//       this.query = this.query.select(fields);
//       // query = query.select('name duration price')
//     } else {
//       this.query = this.query.select('-__v');
//     }
//     return this;
//   }

//   paginate() {
//     //pagination
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 100;
//     const skip = (page - 1) * limit;
//     //page=3&limit=10
//     this.query = this.query.skip(skip).limit(limit);

//     // if (this.queryString.page) {
//     //   const numTours = await Tour.countDocuments();
//     //   if (skip >= numTours) throw new Error('This page is not exist');
//     // }
//     return this;
//   }
// }
exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
// console.log(req.query, queryObj);
//copy a new obj
//for some pagenation, some query must exist but not in DB, exclude from search
//Build Query
// const queryObj = { ...req.query };
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach((el) => delete queryObj[el]);

// Can't have sorting method to do the query with promise return
// console.log('Request Query:', req.query);
// console.log(queryObj);
// { duration: { gte: '5' }, difficulty: 'easy' }
// let queryStr = JSON.stringify(queryObj);

// console.log(queryStr);

// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
// console.log(JSON.parse(queryStr));
// let query = Tour.find(JSON.parse(queryStr));

// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   // console.log(sortBy);
//   query = query.sort(sortBy);
//   // query = query.sort(req.query.sort);
//   //sort('price ratingAvg') can have 2 sorting params
// } else {
//   query = query.sort('-createAt');
// }

//Field limiting
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
//   // query = query.select('name duration price')
// } else {
//   query = query.select('-__v');
// }

// //pagination
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;
// //page=3&limit=10
// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours) throw new Error('This page is not exist');
// }
// query = query.skip(20).limit(10);

//Excute Query
// const features = new APIFeatures(Tour.find(), req.query)
//   .filter()
//   .sort()
//   .limitFields()
//   .paginate();
// const tours = await features.query;
// console.log(tours);
// const tours = await query;

// query.sort().select().skip().limit()

// const query = await Tour.find({
//   duration: 5,
//   difficulty: 'easy',
// });

// const query = await Tour.find()
//   .where('duration')
//   .equals(5)
//   .where('difficulty')
//   .equals('easy');
//   res.status(200).json({
//     status: 'success',
//     // requestedAt: req.requestTime,
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // console.log(req.params);
//   // const id = req.params.id * 1;

//   // const tour = tours.find((el) => el.id === id);
//   // // if (id > tours.length) {
//   // if (!tour) {
//   //   return res.status(404).json({
//   //     status: 'fail',
//   //     message: 'Invalid ID',
//   //   });
//   // }
//   // const tour = await Tour.find({ _id: req.params.id });
//   // 排除主文档中的字段, populate會在query資料庫會影響效能
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.getTourStatus = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, // 只篩選出平均評分大於或等於 4.5 的旅遊活動
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // 按難度分組，並將難度轉換為大寫
        numTours: { $sum: 1 }, // 計算每個難度等級的旅遊活動數量
        numRatings: { $sum: '$ratingsQuantity' }, // 計算每個難度等級的總評分數量
        avgRating: { $avg: '$ratingsAverage' }, // 計算每個難度等級的平均評分
        avgPrice: { $avg: '$price' }, // 計算每個難度等級的平均價格
        minPrice: { $min: '$price' }, // 計算每個難度等級的最低價格
        maxPrice: { $max: '$price' }, // 計算每個難度等級的最高價格
      },
    },
    {
      $sort: { avgPrice: -1 }, // 按平均價格降序排序
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, // 排除難度等級為 'EASY' 的結果
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // 将 startDates 数组展开，每个元素生成一个文档
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), // 开始日期大于等于指定年的 1 月 1 日
          $lte: new Date(`${year}-12-31`), // 结束日期小于等于指定年的 12 月 31 日
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // 按月份分组
        numTourStarts: { $sum: 1 }, // 统计每个月的旅游活动数量
        tours: { $push: '$name' }, // 将每个旅游活动的名称添加到 tours 数组中
      },
    },
    {
      $addFields: { month: '$_id' }, // 添加一个新的字段 month，其值为 _id 的值（即月份）
    },
    {
      $project: {
        _id: 0, // 排除 _id 字段
      },
    },
    {
      $sort: { numTourStarts: -1 }, // 按 numTourStarts 字段降序排序
    },
    {
      $limit: 12, // 限制结果数量为 12
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/40.636281651381005, -74.01393893249836/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

const multer = require('multer');
const sharp = require('sharp');
const User = require('../Model/userModel');
const catchAsync = require('../utilities/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handleFactory');
const AppError = require('../utilities/appError');

/// === number 11 ===
// Why Use Multer Storage?
// By default, Multer stores files in memory (MemoryStorage), which is temporary. But for persistent storage, you need to configure:
// DiskStorage → Saves files to the server's disk (permanent storage).
// MemoryStorage → Keeps files in RAM (temporary, useful for processing before saving elsewhere, like cloud storage).
// const multerStorage = multer.diskStorage({
//   /// cb is stand for callback
//   /// this callback is the same as next in Express middlewares but here we call it callback
//   destination: (req, file, cb) => {
//     /// the first argument of the callback is error. If there's not any error so you pass null to it
//     /// the second argument is the actual destination
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     /// this is the file object
//     /* {
//        fieldname: 'photo',
//        originalname: '18.jpg',
//        encoding: '7bit',
//        mimetype: 'image/jpeg',
//        destination: 'public/img/users',
//        filename: '9152c992ec414f52b2c7d0f1a57652da',
//        path: 'public\\img\\users\\9152c992ec414f52b2c7d0f1a57652da',
//        size: 176320
//      }*/
//     /// so you can find file extension in the mimetype at the second part
//     const fileExtension = file.mimetype.split('/')[1];

//     /// here the first argument of callback is the error and second argument is the filename
//     /// the strategy for creating filename that we're use here is => user-${userID}-${Date.now()} with this strategy we won't have tow same name anymore
//     cb(null, `user-${req.user.id}-${Date.now()}.${fileExtension}`);
//   },
// });
/// in this way before storing we can access to the exact image in the req.file.buffer() and change some stuff and then storing the image or any file in the disk or server
const multerStorage = multer.memoryStorage();

/// this filter actually filter the type of filter that you want for example if you want to upload a image you should filter it because you don't want to upload another kind of files you know!
/// this multerFilter do this for you
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not an image please upload an image', 404), false);
};

/// dest is short for destination of files that you upload
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

/// use as a middleware like upload.single(you property name that hold the file (here is photo)) the single is because we want to upload a single file
exports.uploadUserPhoto = upload.single('photo');

/// the size of image that usr send for us is not the size that we want so we should change that
/// we use sharp package here for resizing the image
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObject = (object, ...keys) => {
  const newObject = {};
  Object.keys(object).forEach((el) => {
    if (keys.includes(el)) {
      newObject[el] = object[el];
    }
  });
  return newObject;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  /// create Error if user POSTs user data
  if (req.body.password || req.body.passwordControler) {
    return next(
      new Error(
        'this roat is not for updating a user please use /updatepassword roat',
      ),
      400,
    );
  }

  /// update user data
  const filteredBody = filterObject(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUser = getAll(User);

exports.getUser = getOne(User);

exports.createUser = createOne(User);

/// Do not change passwored with this
exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);

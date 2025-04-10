const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

///------------------------MIDDLEWARES------------------------
app.use(morgan('dev'));
/// middleware : something between req and res that modify the data

/// we use app.use to add middleware to middleware stack

/// ### **Why Is It Important?**
/// - Without `express.json()`, the `req.body` would be `undefined` or contain the raw, unparsed data.
/// - It simplifies working with JSON data in your application, as you don’t need to manually parse the request body.
/// ### **Key Points**
/// - `express.json()` is a built-in middleware in Express.
/// - It parses incoming JSON payloads and makes them available in `req.body`.
/// - It only processes requests with the `Content-Type: application/json` header.
/// - Always place `app.use(express.json());` before your routes to ensure the middleware is applied to incoming requests.
/// This middleware is essential for modern web applications that rely on JSON for communication between the client and server.
app.use(express.json());

/// it's important to know the middlewares are executed in a row that your codes written
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

///------------------------OTHER FUNCTIONS------------------------

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
);

function getTourWithId(id) {
  return tours.find((tour) => tour.id === id);
}

function getUserWithId(id) {
  return users.find((user) => user._id === id);
}

///------------------------ROUTE HANDLERS------------------------

const getAllTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  const id = +req.params.id;
  const tour = getTourWithId(id);
  if (tour) {
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'The id is no longer exist',
    });
  }
};

const createTour = (req, res) => {
  const itemId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: itemId, ...req.body });
  tours.push(newTour);
  /// we can't use fs.writeFileSync here because we should not use sync function inside a call back function .This is block the EVENT LOOP
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  const id = +req.params.id;
  const tour = getTourWithId(id);
  if (tour) {
    const body = req.body;
    for (const [key, value] of Object.entries(body)) {
      tour[`${key}`] = value;
    }
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
        if (err) {
          res.status(404).json({
            status: 'error',
            message: 'something went wrong',
          });
        } else {
          res.status(200).json({
            status: 'success',
            data: {
              tour,
            },
          });
        }
      }
    );
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'The id is no longer exist',
    });
  }
};

const deleteTour = (req, res) => {
  const id = +req.params.id;
  const tour = getTourWithId(id);
  if (tour) {
    const newTours = tours.filter((tour) => tour.id !== id);
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(newTours),
      (err) => {
        if (err) {
          res.status(404).json({
            status: 'error',
            message: 'something went wrong',
          });
        } else {
          res.status(204).json({
            status: 'success',
            data: {
              tour: null,
            },
          });
        }
      }
    );
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'The id is no longer exist',
    });
  }
};

const getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users,
    },
  });
};

const createUser = (req, res) => {
  const itemId = users[users.length - 1]._id + 1;
  const newUser = Object.assign({ _id: itemId, ...req.body });
  users.push(newUser);
  /// we can't use fs.writeFileSync here because we should not use sync function inside a call back function .This is block the EVENT LOOP
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          user: newUser,
        },
      });
    }
  );
};

const getUser = (req, res) => {
  const id = req.params.id;
  const user = getUserWithId(id);
  if (user) {
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'The id is no longer exist',
    });
  }
};

const updateUser = (req, res) => {
  const id = req.params.id;
  const user = getUserWithId(id);
  if (user) {
    const body = req.body;
    for (const [key, value] of Object.entries(body)) {
      user[`${key}`] = value;
    }
    fs.writeFile(
      `${__dirname}/dev-data/data/users.json`,
      JSON.stringify(users),
      (err) => {
        if (err) {
          res.status(404).json({
            status: 'error',
            message: 'something went wrong',
          });
        } else {
          res.status(200).json({
            status: 'success',
            data: {
              user,
            },
          });
        }
      }
    );
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'The id is no longer exist',
    });
  }
};

const deleteUser = (req, res) => {
  const id = req.params.id;
  const user = getUserWithId(id);
  if (user) {
    const newUsers = users.filter((user) => user._id !== id);
    fs.writeFile(
      `${__dirname}/dev-data/data/users.json`,
      JSON.stringify(newUsers),
      (err) => {
        if (err) {
          res.status(404).json({
            status: 'error',
            message: 'something went wrong',
          });
        } else {
          res.status(204).json({
            status: 'success',
            data: {
              user: null,
            },
          });
        }
      }
    );
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'The id is no longer exist',
    });
  }
};

///------------------------ROUTES------------------------

/// HTTP GET method (GET is used to request data from a specified resource)
/// get all tours
// app.get('/api/v1/tours', getAllTour);

/// HTTP POST method (POST is used to send data to a server to create/update a resource)
// app.post('/api/v1/tours', createTour);

/// get a tour depend on id in the URL
// app.get('/api/v1/tours/:id', getTour);

/// HTTP PUT method (updates an instance of a resource by replacing the existing resource with the resource provided in the request body.)
/// when you want to update data with "PUT" you should send all the data for example :
/// actual data is { name : "something" , family : "something" , age : 15 }
/// when you send a request and you want to just update the age ,you should send all data with updated age
/// like this { name : "something" , family : "something" , age : 16 }
/// --------------------------------------------------------------------------
/// HTTP PATCH method (a request method in HTTP for making partial changes to an existing resource)
/// when you want to update data with "PATCH" you should send just updated data for example :
/// actual data is { name : "something" , family : "something" , age : 15 }
/// when you send a request and you want to just update the age ,you should send just new age
/// like this { age : 16 }
// app.patch('/api/v1/tours/:id', updateTour);

/// HTTP DELETE method (used to delete a resource on the server)
// app.delete('/api/v1/tours/:id', deleteTour);

const tourRouter = express.Router();
const userRouter = express.Router();

app.route('/').get(getAllTour).post(createTour);
app.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

app.route('/').get(getAllUsers).post(createUser);
app.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);


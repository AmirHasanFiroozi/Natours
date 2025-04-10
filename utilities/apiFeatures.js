class APIFeatures {
  constructor(queryString, queryData) {
    this.queryString = queryString;
    this.queryData = queryData;
  }

  Filter() {
    /// 1A) Filtering
    let queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    /// 1B) Advanced Filtering
    const queryStr = JSON.stringify(queryObj);
    queryObj = JSON.parse(
      queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`),
    );

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('maxGroupSize')
    //   .equals(25);

    this.queryData = this.queryData.find(queryObj);

    return this;
  }

  Sort() {
    if (this.queryString.sort) {
      const sortItem = this.queryString.sort.replaceAll(',', ' ');
      this.queryData = this.queryData.sort(sortItem);
    } else {
      this.queryData = this.queryData.sort('-createdAt');
    }

    return this;
  }

  FieldLimit() {
    if (this.queryString.fields) {
      const fieldItem = this.queryString.fields.replaceAll(',', ' ');
      this.queryData = this.queryData.select(fieldItem);
    } else {
      /// mongoose use __v internally so we don't send to the client because it doesn't matter in client
      this.queryData = this.queryData.select('-__v');
    }

    return this ;
  }

  Pagination(){
    /// page=2&limit=10 => page1) 1-10 | page2) 11-20 and...
    const { page = 1, limit } = this.queryString;
    const skip = (page - 1) * limit ;
    this.queryData = this.queryData.skip(skip).limit(limit);
  }
}

module.exports = APIFeatures;

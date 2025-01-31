const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book");

  res.render("bookInstanceList", {
    title: "Book Instance List",
    bookInstanceList: allBookInstances,
  });
});

// Display detail page for a specific BookInstance
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate(
    "book"
  );

  if (bookInstance === null) {
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookInstanceDetail", {
    title: "Book",
    bookInstance: bookInstance,
  });
});

// Display BookInstance create form on GET
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").sort({ title: 1 });
  const statuses = ["Available", "Maintenance", "Loaned", "Reserved"];

  res.render("bookInstanceForm", {
    title: "Create Book Instance",
    bookList: allBooks,
    statuses: statuses,
  });
});

// Handle BookInstance create on POST
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body("status").escape(),
  body("dueBack", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from request
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status || "Maintenance",
      dueBack: req.body.dueBack,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages
      const allBooks = await Book.find({}, "title").sort({ title: 1 });
      const statuses = ["Available", "Maintenance", "Loaned", "Reserved"];

      res.render("bookInstanceForm", {
        title: "Create Book Instance",
        bookList: allBooks,
        errors: errors.array(),
        bookInstance: bookInstance,
        selectedBook: bookInstance.book,
        statuses: statuses,
      });
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate(
    "book"
  );

  if (!bookInstance) {
    res.redirect("/catalog/bookinstances");
    return;
  }

  res.render("bookInstanceDelete", {
    title: "Delete this book copy?",
    bookInstance: bookInstance,
  });
});

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id);

  if (!bookInstance) {
    res.redirect("/catalog/bookinstances");
    return;
  }

  await BookInstance.findByIdAndDelete(req.body.id);
  res.redirect("/catalog/bookinstances");
});

// Display BookInstance update form on GET
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).populate(
    "book"
  );
  const statuses = ["Available", "Maintenance", "Loaned", "Reserved"];

  if (!bookInstance) {
    err = new Error("Book copy not found!");
    err.status = 404;
    return next(err);
  }

  res.render("bookInstanceForm", {
    title: "Update Book copy",
    bookList: [bookInstance.book],
    bookInstance,
    selectedBook: bookInstance.book,
    statuses,
  });
});

// Handle bookinstance update on POST
exports.bookinstance_update_post = [
  // Validate and sanitize data
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body("status").escape(),
  body("dueBack", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Create new object with validated data
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      dueBack: req.body.dueBack,
      _id: req.params.id,
    });

    const statuses = ["Available", "Maintenance", "Loaned", "Reserved"];

    if (!errors.isEmpty()) {
      // There are errors, render the form again
      res.render("bookInstanceForm", {
        title: "Update book copy",
        bookList: [bookInstance.book],
        bookInstance,
        selectedBook: bookInstance.book,
        statuses,
        errors: errors.array(),
      });
      return;
    } else {
      // Everything passed, update data and redirect
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookInstance,
        {}
      );

      res.redirect(updatedBookInstance.url);
    }
  }),
];

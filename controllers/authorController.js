const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Authors
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ familyName: 1 });

  res.render("authorList", { title: "Author list", authorList: allAuthors });
});

//Display detail page for a specific Author
exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, booksByAuthor] = await Promise.all([
    Author.findById(req.params.id),
    Book.find({ author: req.params.id }, "title summary"),
  ]);

  if (author === null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("authorDetail", {
    title: "Author detail",
    author: author,
    authorBooks: booksByAuthor,
  });
});

//Display author create form on GET
exports.author_create_get = (req, res, next) => {
  res.render("authorForm", {
    title: "Create author",
  });
};

// Handle Author create on POST
exports.author_create_post = [
  // Validate and sanitize fields
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters"),

  //NOTE: Never validate names using isAlphanumeric() as there are many names that use other character sets. Here it is just for practice.

  body("familyName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name contains non-alphanumeric characters"),

  body("dateOfBirth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  body("dateOfDeath", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const author = new Author({
      firstName: req.body.firstName,
      familyName: req.body.familyName,
      dateOfBirth: req.body.dateOfBirth,
      dateOfDeath: req.body.dateOfDeath,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages
      res.render("authorForm", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid, save author
      await author.save();
      // Redirect to new author record
      res.redirect(author.url);
    }
  }),
];

// Display Author delete form on GET
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id),
    Book.find({ author: req.params.id }, "title summary"),
  ]);

  if (author === null) {
    // No result.
    res.redirect("/catalog/authors");
  }

  res.render("authorDelete", {
    title: "Delete Author",
    author: author,
    authorBooks: allBooksByAuthor,
  });
});

// Handle Author delete on POST
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id),
    Book.find({ author: req.params.id }, "title summary"),
  ]);

  if (allBooksByAuthor.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render("authorDelete", {
      title: "Delete Author",
      author: author,
      authorBooks: allBooksByAuthor,
    });
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});

// Display Author update form on GET
exports.author_update_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id);

  if (!author) {
    err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("authorForm", {
    title: "Update Author",
    author: author,
  });
});

// Handle Author update on POST
exports.author_update_post = [
  // Validate and sanitize data
  body("firstName")
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage("First name must be specified"),
  body("familyName")
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage("Family name must be specified"),
  body("dateOfBirth", "Invalid Date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("dateOfDeath", "Invalid Date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    errors = validationResult(req);
    // Create author object with validated and trimmed data
    const author = new Author({
      firstName: req.body.firstName,
      familyName: req.body.familyName,
      dateOfBirth: req.body.dateOfBirth,
      dateOfDeath: req.body.dateOfDeath,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("authorForm", {
        title: "Update author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedAuthor = await Author.findByIdAndUpdate(
        req.params.id,
        author,
        {}
      );
      res.redirect(updatedAuthor.url);
    }
  }),
];
